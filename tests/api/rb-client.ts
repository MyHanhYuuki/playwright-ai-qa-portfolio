import http from 'node:http';
import https from 'node:https';
import type { APIRequestContext } from '@playwright/test';
import { rbAdmin } from '../data/users';
import { RB_BASE_URL, type Booking } from '../data/restful-booker';
import { RunState, EnvError } from './rb-run';

/** One response, body already read. Assert on `safeJson` / `text`: a token value never reaches an error message. */
export type ApiResult = {
  /** HTTP status; 0 = network error (only with `allowNetworkError`) */
  status: number;
  /** response headers, lower-case names */
  headers: Record<string, string>;
  /** raw body text ('' for HEAD) */
  text: string;
  /** parsed JSON body, undefined when not JSON. Contains real tokens: do NOT pass it to expect() */
  json: unknown;
  /** same, with every token / password masked: safe in expect() messages, run-results, evidence */
  safeJson: unknown;
  /** Content-Type without parameters, lower-case ('' when absent) */
  mediaType: string;
  /** network error message (never contains the URL) */
  error?: string;
  ms: number;
};

export type SendOptions = {
  headers?: Record<string, string>;
  /** serialised with JSON.stringify; Content-Type: application/json is added unless `headers` sets one */
  json?: unknown;
  /** raw body, sent as is (string or bytes) */
  data?: string | Buffer;
  /** application/x-www-form-urlencoded */
  form?: Record<string, string>;
  /** multipart/form-data */
  multipart?: Record<string, string>;
  maxRedirects?: number;
  /** return status 0 + `error` instead of throwing on a network error (TC-030: "refused" is a valid outcome) */
  allowNetworkError?: boolean;
  /** absolute URL instead of RB_BASE_URL + path (TC-030 plain HTTP) */
  url?: string;
  /** a POST /auth that is EXPECTED to fail: refused when the run's bad-login budget is used up (TD-27) */
  badLogin?: boolean;
};

/** Request / response summary kept for the API evidence (all values already masked). */
export type CallRecord = {
  step: number;
  via: 'APIRequestContext' | 'node:https' | 'fetch';
  method: string;
  target: string;
  reqHeaders: Record<string, string>;
  reqBody: string;
  status: number;
  resHeaders: Record<string, string>;
  resBody: string;
  ms: number;
  error?: string;
};

export type Step = { no: number; name: string; note?: string };

const SHOWN_RES_HEADERS = ['content-type', 'content-length', 'location', 'strict-transport-security', 'cache-control', 'allow', 'www-authenticate'];
const REQUEST_TIMEOUT = 45_000; // first call may wake the Heroku dyno (TD-26 point 5)
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const parse = (text: string): unknown => {
  try {
    return text ? JSON.parse(text) : undefined;
  } catch {
    return undefined;
  }
};

/** Body issues a token: a JSON object with a non-empty string `token`. */
export const tokenOf = (r: ApiResult): string | undefined => {
  const t = isObj(r.json) ? r.json.token : undefined;
  return typeof t === 'string' && t.length > 0 ? t : undefined;
};
/** Body has a `token` field (any type) */
export const hasTokenField = (r: ApiResult) => isObj(r.json) && 'token' in r.json;
/** Body has a `token` field or the word token anywhere (TC-012 → TC-014, TC-018, TC-030: "không có trường / chuỗi token") */
export const mentionsToken = (r: ApiResult) => hasTokenField(r) || /token/i.test(r.text);
/** Body parses to a JSON object (not array, not null) */
export const isJsonObject = (r: ApiResult) => isObj(r.json);
/** `bookingid` of a create response: JSON `{"bookingid": n}` or XML `<bookingid>n</bookingid>` (Accept: application/xml). */
export const bookingIdOf = (r: ApiResult): number | undefined => {
  if (isObj(r.json) && typeof r.json.bookingid === 'number') return r.json.bookingid;
  const m = /<bookingid>\s*(\d+)\s*<\/bookingid>/.exec(r.text);
  return m ? Number(m[1]) : undefined;
};

/**
 * Signs of an internal error leaking in an error body (RB-101 TD-28 note, IMP-10; RB-102 MSG-14).
 * Returns the signs found ([] = clean): a stack line "at …", a source path (/app/…, node_modules, .js:<n>),
 * "is not a function", "Error:".
 */
export function internalErrorSigns(body: string): string[] {
  const signs: [string, RegExp][] = [
    ['dòng stack trace "at …"', /^\s*at\s+\S/m],
    ['đường dẫn /app/…', /\/app\//],
    ['node_modules', /node_modules/],
    ['vị trí .js:<số>', /\.js:\d+/],
    ['"is not a function"', /is not a function/],
    ['"Error:"', /\bError:/],
  ];
  return signs.filter(([, re]) => re.test(body)).map(([name]) => name);
}

/**
 * Restful Booker client of ONE test: every request goes through here so that it is counted (requests, failed
 * logins), masked and summarised for the evidence. Shared by RB-101 and RB-102.
 *
 * Note for RB-102 (review B2): `mask()` only hides a token that appears in FULL (any case, URL-encoded). A derived token
 * (minus / plus one character, TD-07 v10, v11, v24) is NOT a substring of the real one, so create it with
 * `api.derived(token, fn)` (registers it as a secret) before sending it anywhere. Hard gate: use `hardGate()` of the
 * RB-101 spec (first line of each error only, no stack, review P1).
 */
export class RbApi {
  readonly calls: CallRecord[] = [];
  readonly steps: Step[] = [];
  requestCount = 0;
  failedLogins = 0;
  private secrets = new Set<string>();
  /** bookings this test created: cleaned in the fixture teardown (TD-26 point 4) */
  readonly tracked: { id: number; isOwner: (b: Record<string, unknown>) => boolean; label: string }[] = [];

  constructor(
    readonly ctx: APIRequestContext,
    readonly run: RunState,
    readonly tc: string,
  ) {
    this.addSecret(rbAdmin.password);
  }

  /** Register a value that must never be written anywhere (token, derived token, password). */
  addSecret(v: string) {
    if (!v || v.length < 4) return;
    this.secrets.add(v);
    this.secrets.add(encodeURIComponent(v));
  }

  /**
   * Make a token variant (minus / plus one character, case change, ...) AND register it as a secret in one step (review B2).
   * Returns the variant to send. Also registers the usual one-character-off forms of the token, so a variant built
   * by hand and sent through `send()` is masked too: a token minus one character would otherwise leak 14 of 15 chars.
   * RB-102 (TD-07 v10, v11, v24): build EVERY derived token with `api.derived(token, (t) => ...)`, never by hand.
   */
  derived(token: string, fn: (t: string) => string): string {
    const v = fn(token);
    for (const x of [v, token.slice(1), token.slice(0, -1), token.toUpperCase(), token.toLowerCase(), token + '0', token + 'a']) this.addSecret(x);
    return v;
  }

  /** Mask tokens, passwords and Basic credentials (case-insensitive: also hides `PASSWORD123`-style variants). */
  mask(s: string): string {
    let out = s.replace(/("token"\s*:\s*")([^"]*)(")/gi, (_m, a: string, v: string, c: string) => `${a}***(${v.length} ký tự)${c}`);
    out = out.replace(/\b(Basic|Bearer)\s+[^\s",;]+/g, '$1 ***');
    for (const sec of [...this.secrets].sort((a, b) => b.length - a.length)) out = out.replace(new RegExp(escapeRe(sec), 'gi'), '***');
    return out;
  }

  /** Start a named evidence step: the following requests are listed under it. */
  step(name: string, note?: string) {
    this.steps.push({ no: this.steps.length + 1, name, note });
  }

  private currentStep() {
    if (!this.steps.length) this.step('Chuẩn bị');
    return this.steps.length;
  }

  private finishResult(status: number, headers: Record<string, string>, text: string, ms: number, error?: string): ApiResult {
    const json = parse(text);
    const safeJson = parse(this.mask(text));
    const mediaType = (headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
    return { status, headers, text, json, safeJson, mediaType, ms, error };
  }

  private excerpt(s: string, max = 300) {
    const m = this.mask(s);
    return m.length > max ? `${m.slice(0, max)}… (tổng ${Buffer.byteLength(s)} byte)` : m;
  }

  private record(via: CallRecord['via'], method: string, target: string, reqHeaders: Record<string, string>, reqBody: string, r: ApiResult) {
    const shown = Object.fromEntries(SHOWN_RES_HEADERS.filter((h) => r.headers[h] !== undefined).map((h) => [h, this.mask(r.headers[h])]));
    this.calls.push({
      step: this.currentStep(),
      via,
      method,
      target: this.mask(target),
      reqHeaders: Object.fromEntries(Object.entries(reqHeaders).map(([k, v]) => [k, this.mask(v)])),
      reqBody: this.excerpt(reqBody),
      status: r.status,
      resHeaders: shown,
      resBody: this.excerpt(r.text),
      ms: r.ms,
      error: r.error,
    });
  }

  /** Count the request; a POST /auth without a token is a failed login (TD-27), counted for the whole run. */
  private account(method: string, pathname: string, r: ApiResult) {
    this.requestCount++;
    this.run.addRequest();
    if (method === 'POST' && /^\/auth\/?$/.test(pathname) && !tokenOf(r)) {
      this.failedLogins++;
      this.run.addFailedLogin(this.tc);
    }
    const t = tokenOf(r);
    if (t) this.addSecret(t);
    // Heroku 503 / sleeping dyno = environment error, not a bug (TD-26 point 5)
    if (r.status === 503) throw new EnvError(`${method} ${pathname} trả 503 (Heroku / máy chủ ngủ): lỗi môi trường, không phải bug`);
  }

  private guardBudget(method: string, pathname: string, opts: { badLogin?: boolean }) {
    if (opts.badLogin && method === 'POST' && /^\/auth\/?$/.test(pathname)) this.run.assertBadLoginBudget();
  }

  /** Send one request through Playwright's APIRequestContext. */
  async send(method: string, path: string, opts: SendOptions = {}): Promise<ApiResult> {
    const url = opts.url ?? `${RB_BASE_URL}${path}`;
    const pathname = new URL(url).pathname;
    this.guardBudget(method, pathname, opts);
    const headers: Record<string, string> = { ...(opts.headers ?? {}) };
    let data: string | Buffer | undefined = opts.data;
    if (opts.json !== undefined) {
      data = JSON.stringify(opts.json);
      if (!Object.keys(headers).some((h) => h.toLowerCase() === 'content-type')) headers['Content-Type'] = 'application/json';
    }
    // Playwright turns `data: ''` into the 2-byte JSON string `""` (Content-Length 2); a real empty body must be a 0-byte Buffer (review A1)
    if (data === '') data = Buffer.alloc(0);
    const reqBody =
      data !== undefined ? (Buffer.isBuffer(data) ? (data.length ? data.toString('utf8') : '(0 byte)') : data)
      : opts.form ? `form: ${new URLSearchParams(opts.form).toString()}`
      : opts.multipart ? `multipart: ${Object.entries(opts.multipart).map(([k, v]) => `${k}=${v}`).join(', ')}`
      : '';
    const started = Date.now();
    let r: ApiResult;
    try {
      const res = await this.ctx.fetch(url, {
        method,
        headers,
        data,
        form: opts.form,
        multipart: opts.multipart,
        maxRedirects: opts.maxRedirects,
        failOnStatusCode: false,
        timeout: REQUEST_TIMEOUT,
      });
      const text = method === 'HEAD' ? '' : await res.text();
      r = this.finishResult(res.status(), res.headers(), text, Date.now() - started);
    } catch (e) {
      const msg = `lỗi mạng: ${String((e as Error).message ?? e).split('\n')[0].split(url).join('<url>')}`;
      r = this.finishResult(0, {}, '', Date.now() - started, msg);
      this.record('APIRequestContext', method, url.startsWith(RB_BASE_URL) ? path : url, headers, reqBody, r);
      this.account(method, pathname, r);
      if (!opts.allowNetworkError) throw new EnvError(`${method} ${pathname}: ${msg}`);
      return r;
    }
    this.record('APIRequestContext', method, url.startsWith(RB_BASE_URL) ? path : url, headers, reqBody, r);
    this.account(method, pathname, r);
    return r;
  }

  /**
   * Send with node:https directly: ONLY the given headers (+ Host, Content-Length) go out.
   * APIRequestContext / fetch add a Content-Type for a string body, so "no Content-Type" needs this (TD-12 variant 3).
   * Returns the headers really sent, to prove it.
   */
  async sendRaw(method: string, path: string, headers: Record<string, string>, body: string, opts: { badLogin?: boolean } = {}) {
    const url = new URL(`${RB_BASE_URL}${path}`);
    this.guardBudget(method, url.pathname, opts);
    const lib = url.protocol === 'http:' ? http : https;
    const payload = Buffer.from(body, 'utf8');
    const started = Date.now();
    const out = await new Promise<{ status: number; headers: Record<string, string>; text: string; sent: Record<string, string> }>((resolve, reject) => {
      const req = lib.request(url, { method, headers: { ...headers, 'Content-Length': String(payload.length) }, timeout: REQUEST_TIMEOUT }, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => {
          const h: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.headers)) if (v !== undefined) h[k.toLowerCase()] = Array.isArray(v) ? v.join(', ') : v;
          resolve({ status: res.statusCode ?? 0, headers: h, text: Buffer.concat(chunks).toString('utf8'), sent });
        });
      });
      const sent: Record<string, string> = {};
      for (const [k, v] of Object.entries(req.getHeaders())) sent[k.toLowerCase()] = String(v);
      req.on('timeout', () => req.destroy(new Error('timeout')));
      req.on('error', (e) => reject(new EnvError(`${method} ${url.pathname}: lỗi mạng (${e.message.split(url.href).join('<url>')})`)));
      req.end(payload);
    });
    const r = this.finishResult(out.status, out.headers, out.text, Date.now() - started);
    this.record('node:https', method, path, out.sent, body, r);
    this.account(method, url.pathname, r);
    return { ...r, sentHeaders: out.sent };
  }

  /**
   * Send with Node `fetch`, OUTSIDE APIRequestContext: no report step, no trace, URL never recorded
   * (TC-016: the URL carries the real password, TD-14). `shownTarget` is what the evidence shows instead.
   */
  async sendHidden(method: string, url: string, shownTarget: string, opts: { badLogin?: boolean } = {}): Promise<ApiResult> {
    const pathname = new URL(url).pathname;
    this.guardBudget(method, pathname, opts);
    const started = Date.now();
    let r: ApiResult;
    try {
      const res = await fetch(url, { method, redirect: 'manual', signal: AbortSignal.timeout(REQUEST_TIMEOUT) });
      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => (headers[k.toLowerCase()] = v));
      r = this.finishResult(res.status, headers, await res.text(), Date.now() - started);
    } catch (e) {
      // undici messages do not carry the URL, but never print the cause (it may)
      r = this.finishResult(0, {}, '', Date.now() - started, `lỗi mạng (${(e as Error).name ?? 'Error'}, đã ẩn URL)`);
    }
    this.record('fetch', method, shownTarget, {}, '', r);
    this.account(method, pathname, r);
    if (r.status === 0) throw new EnvError(`${method} ${shownTarget}: ${r.error}`);
    return r;
  }

  // ---------- auth ----------

  /** POST /auth with a JSON body (TD-01 by default). */
  login(body: unknown = { username: rbAdmin.username, password: rbAdmin.password }, headers: Record<string, string> = {}, opts: SendOptions = {}) {
    return this.send('POST', '/auth', { ...opts, headers: { 'Content-Type': 'application/json', ...headers }, data: JSON.stringify(body) });
  }

  /** A NEW admin token, taken right before it is used (never in beforeAll, TD-26). Throws if none is issued. */
  async freshToken(): Promise<string> {
    const r = await this.login();
    const t = tokenOf(r);
    if (r.status !== 200 || !t) throw new Error(`Không lấy được token quản trị (POST /auth trả ${r.status}, body ${this.excerpt(r.text, 80)})`);
    return t;
  }

  // ---------- booking (RB-102 endpoints) ----------

  /**
   * POST /booking. The owner is written to the run ledger BEFORE the request (review RB-102 R1: a request cut off
   * after the server stored it must still be found by the teardown sweep); the id is added after the response.
   */
  async createBooking(body: Booking, opts: { names?: string[]; headers?: Record<string, string> } = {}) {
    return this.createBookingVia(
      {
        firstname: body.firstname,
        lastname: body.lastname,
        names: opts.names ?? [body.firstname],
        isOwner: (b) => b.firstname === body.firstname && b.lastname === body.lastname,
        label: `${body.firstname} / ${body.lastname}`,
      },
      () => this.send('POST', '/booking', { json: body, headers: { Accept: 'application/json', ...(opts.headers ?? {}) } }),
    );
  }

  /**
   * Any create request of RB-102 (raw / invalid JSON, XML, urlencoded, no Content-Type, unsupported Accept...): same
   * path as `createBooking`, the owner goes to the run ledger BEFORE `send()` runs, then a `bookingid` found in the
   * response (JSON or XML) is added to the ledger and tracked for the cleanup. `names` = run-unique names the server
   * may store (teardown sweep); `isOwner` must be an EXACT match (L17).
   */
  async createBookingVia(
    owner: { firstname: string; lastname: string; names: string[]; isOwner: (b: Record<string, unknown>) => boolean; label: string },
    send: () => Promise<ApiResult>,
  ) {
    const entry = this.run.ledgerIntent({ tc: this.tc, firstname: owner.firstname, lastname: owner.lastname, names: owner.names });
    const res = await send();
    const id = bookingIdOf(res);
    if (id !== undefined) {
      this.run.ledgerId(entry, id);
      this.track(id, owner.isOwner, owner.label);
    }
    return { res, id };
  }

  /** Register a booking for the cleanup of this test. `isOwner` must be an EXACT match (L17), never a prefix. */
  track(id: number, isOwner: (b: Record<string, unknown>) => boolean, label: string) {
    if (!this.tracked.some((t) => t.id === id)) this.tracked.push({ id, isOwner, label });
  }

  getBooking(id: number) {
    return this.send('GET', `/booking/${id}`, { headers: { Accept: 'application/json' } });
  }

  /** Cookie header for a token (TD-21 / TD-22 build their own). */
  static cookie(token: string) {
    return { Cookie: `token=${token}` };
  }
}
