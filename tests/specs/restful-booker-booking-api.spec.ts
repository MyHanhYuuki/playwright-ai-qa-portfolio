/**
 * RB-102: Restful Booker booking (6 endpoints: POST /booking, GET /booking/:id, GET /booking, PUT, PATCH, DELETE).
 * API feature, project `api`.
 * Test cases: qa-runs/restful-booker-booking-api/test-cases.csv (69 TC, approved at HITL #2)
 * Known issues: qa-runs/restful-booker-booking-api/known-issues.md (BUG-41 → BUG-60 expected to FAIL; BUG-60 found at script-gen)
 * Data: qa-runs/restful-booker-booking-api/test-data.md (TD-xx, MSG-xx)
 *
 * Convention: 1 test = 1 TC, title starts with the TC id, tags = @AC-x + endpoint (@post / @get-id / @get-list / @put /
 * @patch / @delete) + @smoke / @security / @full / @BUG-xx (CSV `tags`, without "regression" which every TC has).
 * Describe = endpoint of the CSV `screen` column (one endpoint or `A → B` → endpoint A; `A + B` → "Chung").
 *
 * Shared public server (TD-26, L17):
 * - every create request goes through `RbApi.createBookingVia` (here: `post()`): the owner names are written to the run
 *   ledger BEFORE the request; a PUT / PATCH that sets a new run name writes it first too (`ledger()`).
 * - write / delete only on a booking this test created, after a GET that proves the owner (exact name match, `isMine`).
 * - cleanup: fixture `api` → `cleanupTracked` (GET + exact owner match before DELETE); final sweep: project `api-teardown`.
 * - reset: `guarded` = `withResetGuard` (3 signals) + soft assertions of the guarded body run AFTER it (D3: no soft error of a reset attempt). No retries. 503 / network error = EnvError (environment, not a bug).
 * - POST /auth only with the right account (`api.freshToken()`): RB-102 sends NO deliberate bad login.
 * Known-bug TCs follow TD-29 exactly: send ALL variants → expect.soft the parts that are correct today → hard gate
 * (`hardGate()`) → test.fail() → expect.soft the bug parts. Never test.fail() in a loop (L18).
 * Expected values follow the HITL #1 decisions written in test-cases.csv, not the current behaviour.
 */
import { test, expect } from '../fixtures/api';
import { rbAdmin } from '../data/users';
import { MSG_RB_BOOKING as MSG } from '../data/messages';
import { RB102_FIRSTNAME, RB_REJECT, rb102Booking, rb102Put, type Booking } from '../data/restful-booker';
import { RbApi, internalErrorSigns, type ApiResult } from '../api/rb-client';
import { ResetSuspect, guardOwnBooking, guardToken, withResetGuard } from '../api/rb-run';

const RUN = RB102_FIRSTNAME;
const RUN_MOI = `${RUN}-moi`;
const ACCEPT_JSON = { Accept: 'application/json' };
const JSON_HDR = { 'Content-Type': 'application/json', Accept: 'application/json' };
const FORM_HDR = { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' };
const XML_HDR = { 'Content-Type': 'text/xml', Accept: 'application/json' };
const GATE = 'phần đang đúng phải đạt trước test.fail (TD-29)';
const enc = encodeURIComponent;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const omit = (o: unknown, ...keys: string[]) => (isObj(o) ? Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k))) : o);
/** `booking` of a POST response body */
const bookingOf = (r: ApiResult) => (isObj(r.json) ? r.json.booking : undefined);
const cookie = (t: string) => ({ Cookie: `token=${t}` });
const short = (api: RbApi, r: ApiResult) => `${r.status} "${api.mask(r.text).slice(0, 80)}"`;
const BASIC = (user: string, pass: string) => `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;

/** Test timeout from the number of requests (~1,5 s each on the public server, + 30 %; cleanup included). */
function budget(requests: number) {
  test.setTimeout(Math.max(60_000, Math.ceil(requests * 1_500 * 1.3)));
}

/** Hard gate of TD-29 step 3. Only the FIRST line of each error: no stack (machine path) in run-results (RB-101 review P1). */
function hardGate() {
  expect(test.info().errors.map((e) => (e.message ?? '').split('\n')[0]), GATE).toEqual([]);
}

/** Short masked summary of a response for the annotations (triage). */
function note(api: RbApi, label: string, r: ApiResult, extra = '') {
  test.info().annotations.push({
    type: 'phản hồi',
    description: `${label}: ${r.error ?? `${r.status} ${r.headers['content-type'] ?? '(không có Content-Type)'} "${api.mask(r.text).slice(0, 100)}"`}${extra}`,
  });
}

// ---------------- owner names (TD-02, TD-26 point 1, L17) ----------------

const testNames = new WeakMap<RbApi, Set<string>>();
function nameSet(api: RbApi) {
  let s = testNames.get(api);
  if (!s) testNames.set(api, (s = new Set([RUN])));
  return s;
}
/** Booking belongs to this test: firstname / lastname / additionalneeds EXACTLY equals a run name the test sent. */
function isMine(api: RbApi, b: unknown): boolean {
  if (!isObj(b)) return false;
  const names = nameSet(api);
  return ['firstname', 'lastname', 'additionalneeds'].some((k) => typeof b[k] === 'string' && names.has(b[k] as string));
}
/** Run-unique names of a body (+ extra values): only strings carrying the run name QA-RB102-<RUN>. */
function ownerOf(api: RbApi, body: unknown, extra: unknown[] = []) {
  const fields = isObj(body) ? [body.firstname, body.lastname, body.additionalneeds] : [];
  const names = [...new Set([...fields, ...extra].filter((v): v is string => typeof v === 'string' && v.includes(RUN)))];
  const set = nameSet(api);
  const fresh = names.filter((n) => !set.has(n));
  names.forEach((n) => set.add(n));
  const firstname = isObj(body) && typeof body.firstname === 'string' && body.firstname.includes(RUN) ? body.firstname : RUN;
  const lastname = isObj(body) && typeof body.lastname === 'string' ? body.lastname : '';
  return { firstname, lastname, names: [...new Set([firstname, ...names])], fresh };
}
/** Before a PUT / PATCH that may store a NEW run name (TD-04 `QA-RB102-<RUN>-moi`…): write it to the run ledger first. */
function ledger(api: RbApi, body: unknown, extra: unknown[] = []) {
  const o = ownerOf(api, body, extra);
  if (o.fresh.length) api.run.ledgerIntent({ tc: api.tc, firstname: o.firstname, lastname: o.lastname, names: o.names });
}

// ---------------- requests ----------------

type PostReq = {
  json?: unknown;
  data?: string | Buffer;
  headers?: Record<string, string>;
  /** send with node:https: ONLY `headers` go out (no Content-Type added by the library, TC-023 variant 1) */
  noContentType?: boolean;
  path?: string;
  /** run names the body carries when it is not a JSON object (XML, urlencoded) */
  names?: unknown[];
  isOwner?: (b: Obj) => boolean;
};
type Sent = ApiResult & { sentHeaders?: Record<string, string> };

/** Every create request of RB-102: ledger owner BEFORE the request, id (JSON / XML) tracked for the cleanup. */
async function post(api: RbApi, label: string, r: PostReq): Promise<{ res: Sent; id?: number }> {
  const o = ownerOf(api, r.json, r.names ?? []);
  const path = r.path ?? '/booking';
  return api.createBookingVia(
    { firstname: o.firstname, lastname: o.lastname, names: o.names, isOwner: r.isOwner ?? ((b) => isMine(api, b)), label },
    () =>
      r.noContentType
        ? api.sendRaw('POST', path, r.headers ?? {}, r.data?.toString() ?? '')
        : api.send('POST', path, { headers: { ...JSON_HDR, ...(r.headers ?? {}) }, json: r.json, data: r.data }),
  );
}

/** Precondition: a TD-03-like booking of the test (hard checks). */
async function createOwn(api: RbApi, body: Booking, label = `Chuẩn bị: tạo booking ${body.lastname}`): Promise<number> {
  api.step(label, `POST /booking (TD-03), lastname ${body.lastname}; 200, bookingid nguyên dương, 7 giá trị đúng`);
  const { res, id } = await post(api, label, { json: body });
  expect(res.status, `${label}: POST /booking 200`).toBe(200);
  expect(Number.isInteger(id) && (id as number) > 0, `${label}: bookingid nguyên dương`).toBe(true);
  expect(bookingOf(res), `${label}: booking đúng 7 giá trị đã gửi`).toStrictEqual(body);
  return id as number;
}

/** GET /booking/<id> of the test's own booking: 404 → reset check (TD-26). */
async function readOwn(api: RbApi, id: number, label: string) {
  api.step(label, '200, 7 giá trị mong đợi');
  const g = await api.getBooking(id);
  guardOwnBooking(g.status, label, id);
  return g;
}

type Snap = { id: number; text: string; json: Obj };
/** Baseline (TD-27) + owner check right before a write (L17): 200 and the booking is the test's, else nothing is sent. */
async function snapshot(api: RbApi, id: number, label: string): Promise<Snap> {
  const g = await readOwn(api, id, label);
  expect(g.status, `${label}: GET /booking/<id> 200`).toBe(200);
  expect(isMine(api, g.json), `${label}: booking #${id} là của test (tên khớp chính xác, L17); không phải thì không gửi request ghi`).toBe(true);
  return { id, text: g.text, json: g.json as Obj };
}

/** GET /booking?<query> → ids (hard: the query is the control of "không tạo booking", TD-28). */
async function idsOf(api: RbApi, query: string, label: string): Promise<number[]> {
  const r = await api.send('GET', `/booking?${query}`, { headers: ACCEPT_JSON });
  expect(r.status, `${label}: GET /booking?… 200 (đối chứng của bước kiểm "không tạo booking")`).toBe(200);
  expect(Array.isArray(r.json), `${label}: body là mảng`).toBe(true);
  return (r.json as unknown[]).map((e) => (isObj(e) ? e.bookingid : undefined)).filter((x): x is number => typeof x === 'number');
}
const listIds = (r: ApiResult) => (Array.isArray(r.json) ? (r.json as unknown[]).map((e) => (isObj(e) ? e.bookingid : undefined)) : []);
/** Body is an array of objects with exactly one key `bookingid` (positive integer). */
const isIdList = (r: ApiResult) =>
  Array.isArray(r.json) &&
  (r.json as unknown[]).every((e) => isObj(e) && Object.keys(e).length === 1 && Number.isInteger(e.bookingid) && (e.bookingid as number) > 0);

// ---------------- "không tạo booking" around each POST variant (TD-28) ----------------

type PostVariant = {
  label: string;
  req: PostReq;
  /** variant does not keep the run firstname: GET /booking?lastname=<this> must be [] */
  lastnameCheck?: string;
  /** the variant SHOULD create (TC-009 variant 1, 2): its own id is not "created by mistake" */
  expectCreated?: boolean;
  /** body carries no name (TD-16): no filter check */
  noFilter?: boolean;
};
type PostOutcome = { label: string; res: Sent; id?: number; leaked: number[] };

/**
 * TD-28: S0 = GET /booking?firstname=<run> right before the variant, S1 = right after (S1 of one variant = S0 of the
 * next). Ids in S1 \ S0 (minus the variant's own id when it should create) + ids found by lastname = created by mistake:
 * reported and tracked for the cleanup (exact owner check).
 */
async function postVariants(api: RbApi, variants: PostVariant[]): Promise<PostOutcome[]> {
  const runQuery = `firstname=${enc(RUN)}`;
  api.step('S0: GET /booking?firstname=QA-RB102-<RUN> (TD-28)', 'Danh sách id của lần chạy trước biến thể đầu');
  let before = await idsOf(api, runQuery, 'S0');
  const out: PostOutcome[] = [];
  for (const v of variants) {
    api.step(v.label, 'Gửi biến thể, rồi GET /booking?firstname=<run> (S1) để kiểm không tạo booking');
    const { res, id } = await post(api, v.label, v.req);
    note(api, v.label, res);
    const leaked: number[] = [];
    if (!v.noFilter) {
      const after = await idsOf(api, runQuery, `${v.label}: S1`);
      leaked.push(...after.filter((x) => !before.includes(x) && !(v.expectCreated && x === id)));
      before = after;
      if (v.lastnameCheck)
        for (const x of await idsOf(api, `lastname=${enc(v.lastnameCheck)}`, `${v.label}: lọc theo lastname của biến thể`)) if (!leaked.includes(x)) leaked.push(x);
    }
    for (const x of leaked) api.track(x, (b) => isMine(api, b), `${v.label} (tạo ngoài ý muốn)`);
    out.push({ label: v.label, res, id, leaked });
  }
  return out;
}

// ---------------- write variants on a baseline (TD-27) ----------------

type WriteVariant = { label: string; note?: string; body?: unknown; send: (id: number, token: string) => Promise<ApiResult> };
type WriteOutcome = { label: string; res: ApiResult; after: ApiResult; same: boolean; id: number };

/**
 * Restore the baseline after a variant changed the booking (TD-27): PUT the 7 baseline values (new token), GET = new
 * baseline; booking gone → create it again (same lastname) and use the new id.
 */
async function restore(api: RbApi, state: Snap, after: ApiResult, recreate: Booking, label: string): Promise<Snap> {
  api.step(label, 'Booking đã đổi / mất vì bug: đưa về mốc để biến thể sau bắt đầu từ trạng thái riêng (TD-27)');
  if (after.status === 404) return snapshot(api, await createOwn(api, recreate, `${label}: tạo lại booking`), `${label}: mốc mới`);
  expect(after.status, `${label}: GET sau biến thể 200 hoặc 404`).toBe(200);
  expect(isMine(api, after.json), `${label}: booking vẫn là của test (L17)`).toBe(true);
  const token = await api.freshToken();
  const p = await api.send('PUT', `/booking/${state.id}`, { json: state.json, headers: { ...JSON_HDR, ...cookie(token) } });
  guardToken(p.status, label, state.id);
  expect(p.status, `${label}: PUT khôi phục mốc 200`).toBe(200);
  return snapshot(api, state.id, `${label}: mốc mới`);
}

/**
 * Send each write variant on the test's booking, then GET it and compare with the baseline (byte-identical, TD-27).
 * A variant refused correctly (booking identical) → no restore, the GET is also the owner check before the next variant.
 * Booking 404 after a REFUSED request (4xx) → reset check (TD-26); after an accepted one → it is the bug: recreate.
 */
async function writeVariants(api: RbApi, snap: Snap, recreate: Booking, variants: WriteVariant[], opts: { restoreLast?: boolean; tokenless?: boolean } = {}) {
  let state = snap;
  const token = opts.tokenless ? '' : await api.freshToken();
  const outcomes: WriteOutcome[] = [];
  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    if (v.body !== undefined) ledger(api, v.body);
    api.step(v.label, v.note ?? 'Mong đợi bị từ chối; GET sau đó giống hệt mốc');
    const res = await v.send(state.id, token);
    if (!opts.tokenless) guardToken(res.status, v.label, state.id);
    const after = await api.getBooking(state.id);
    if (after.status === 404 && res.status >= 400 && res.status < 500)
      throw new ResetSuspect(`${v.label}: request bị từ chối (${res.status}) mà booking của test trả 404`, state.id);
    const same = after.status === 200 && after.text === state.text;
    note(api, v.label, res, same ? ' · booking giữ nguyên' : ` · booking ĐỔI: GET ${short(api, after)}`);
    outcomes.push({ label: v.label, res, after, same, id: state.id });
    if (!same && (i < variants.length - 1 || opts.restoreLast)) state = await restore(api, state, after, recreate, `${v.label}: khôi phục mốc`);
  }
  return { outcomes, snap: state };
}

// ---------------- soft assertions deferred while a reset guard runs (review D3) ----------------

/**
 * Inside `guarded()` a soft assertion is queued (its value is captured NOW) and runs only when the guarded body has
 * finished: a body redone after an env-reset leaves no soft error of the discarded attempt (testInfo cannot remove
 * errors). Outside `guarded()` it is a plain expect.soft. Playwright runs one test at a time per worker (workers: 1).
 */
let softSink: (() => void)[] | null = null;
const softExpect = ((actual: unknown, message?: unknown) => {
  const chain = (path: string[]): unknown =>
    new Proxy(function () {}, {
      get: (_t, key) => (typeof key === 'string' ? chain([...path, key]) : undefined),
      apply: (_t, _self, args) => {
        const run = () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let parent: any = expect.soft(actual, message as string);
          for (const k of path.slice(0, -1)) parent = parent[k];
          return parent[path[path.length - 1]](...args);
        };
        if (!softSink) return run();
        softSink.push(run);
        return undefined;
      },
    });
  return chain([]);
}) as unknown as typeof expect.soft;

/** withResetGuard + deferred soft assertions: queued per attempt, run once after the (last) attempt. */
async function guarded(api: RbApi, body: (attempt: number) => Promise<void>) {
  let queue: (() => void)[] = [];
  try {
    await withResetGuard(api, test.info(), async (attempt) => {
      queue = [];
      softSink = queue;
      await body(attempt);
    });
  } finally {
    softSink = null;
    queue.forEach((run) => run());
  }
}

// ---------------- soft checks ----------------

function softNo5xx(label: string, r: ApiResult) {
  softExpect(r.status, `${label}: không 5xx`).toBeLessThan(500);
}
function softNoLeak(label: string, r: ApiResult) {
  softExpect(internalErrorSigns(r.text), `${label}: body không lộ lỗi nội bộ (MSG-14)`).toEqual([]);
}
/** TD-28 "kiểm chung phản hồi lỗi": no 5xx + no internal error in the body (code checked separately) */
function softCommon(label: string, r: ApiResult) {
  softNo5xx(label, r);
  softNoLeak(label, r);
}
function softNotCreated(o: PostOutcome) {
  softExpect(o.leaked, `${o.label}: không tạo booking (TD-28: S1 \\ S0 và lọc theo lastname phải rỗng; id thấy được ghi ở đây)`).toEqual([]);
}
function softSame(o: WriteOutcome) {
  softExpect(o.same, `${o.label}: GET /booking/X 200 và body giống hệt mốc (TD-27); thực tế GET ${o.after.status} ${o.after.text.slice(0, 120)}`).toBe(true);
}
/** No value = no key, null or '' (TD-14) */
const noAdditionalNeeds = (b: unknown) => isObj(b) && (!('additionalneeds' in b) || b.additionalneeds === null || b.additionalneeds === '');

// ---------------- body formats ----------------

const xmlEsc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** TD-19 body XML */
const toXml = (b: Booking) =>
  `<booking><firstname>${xmlEsc(b.firstname)}</firstname><lastname>${xmlEsc(b.lastname)}</lastname><totalprice>${b.totalprice}</totalprice>` +
  `<depositpaid>${b.depositpaid}</depositpaid><bookingdates><checkin>${b.bookingdates.checkin}</checkin><checkout>${b.bookingdates.checkout}</checkout></bookingdates>` +
  `<additionalneeds>${xmlEsc(b.additionalneeds ?? '')}</additionalneeds></booking>`;
/** TD-20 body urlencoded (bookingdates%5Bcheckin%5D, every value URL-encoded) */
const toForm = (b: Booking) =>
  (
    [
      ['firstname', b.firstname],
      ['lastname', b.lastname],
      ['totalprice', String(b.totalprice)],
      ['depositpaid', String(b.depositpaid)],
      ['bookingdates[checkin]', b.bookingdates.checkin],
      ['bookingdates[checkout]', b.bookingdates.checkout],
      ['additionalneeds', b.additionalneeds ?? ''],
    ] as const
  )
    .map(([k, v]) => `${enc(k)}=${enc(v)}`)
    .join('&');

type XVal = string | { [k: string]: XVal };
const XML_ENTITIES: Record<string, string> = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" };
const xmlUnescape = (s: string) =>
  s.replace(/&(lt|gt|amp|quot|apos|#\d+|#x[0-9a-fA-F]+);/g, (_m, e: string) =>
    XML_ENTITIES[e] ?? (e[1] === 'x' || e[1] === 'X' ? String.fromCodePoint(parseInt(e.slice(2), 16)) : String.fromCodePoint(parseInt(e.slice(1), 10))),
  );
/**
 * Minimal XML reader (no library in the repo): optional prolog, elements without attributes, text with the 5 entities.
 * Returns undefined when the body is not well-formed (unclosed / wrong closing tag, mixed text + children, trailing data).
 */
function parseXml(text: string): { root: string; value: XVal } | undefined {
  const s = text.replace(/^﻿?\s*<\?xml[^>]*\?>/, '');
  let pos = 0;
  const skipWs = () => {
    while (pos < s.length && /\s/.test(s[pos])) pos++;
  };
  const element = (): [string, XVal] => {
    const open = /^<([A-Za-z_][\w.-]*)\s*(\/?)>/.exec(s.slice(pos));
    if (!open) throw new Error('không mở được thẻ');
    pos += open[0].length;
    const name = open[1];
    if (open[2]) return [name, ''];
    const kids: { [k: string]: XVal } = {};
    let txt = '';
    let hasKids = false;
    for (;;) {
      if (pos >= s.length) throw new Error(`thiếu </${name}>`);
      if (s.startsWith(`</${name}>`, pos)) {
        pos += name.length + 3;
        break;
      }
      if (s.startsWith('</', pos)) throw new Error('thẻ đóng sai');
      if (s[pos] === '<') {
        const [k, v] = element();
        if (k in kids) throw new Error(`trùng <${k}>`);
        kids[k] = v;
        hasKids = true;
        continue;
      }
      const end = s.indexOf('<', pos);
      if (end < 0) throw new Error('chữ không có thẻ đóng');
      txt += s.slice(pos, end);
      pos = end;
    }
    if (hasKids && txt.trim()) throw new Error('lẫn chữ và thẻ con');
    return [name, hasKids ? kids : xmlUnescape(txt)];
  };
  try {
    skipWs();
    const [root, value] = element();
    skipWs();
    return pos === s.length ? { root, value } : undefined;
  } catch {
    return undefined;
  }
}
/** The 7 values of a booking as XML text values (MSG-13) */
const xmlValues = (b: Booking): XVal => ({
  firstname: b.firstname,
  lastname: b.lastname,
  totalprice: String(b.totalprice),
  depositpaid: String(b.depositpaid),
  bookingdates: { checkin: b.bookingdates.checkin, checkout: b.bookingdates.checkout },
  additionalneeds: b.additionalneeds ?? '',
});

// =====================================================================================================================
test.describe('Endpoint 1: POST /booking', () => {
  test('TC-001 Happy path: POST booking hợp lệ (JSON) trả 200 và đọc lại giống từng trường', { tag: ['@AC-1', '@AC-2', '@smoke', '@post', '@get-id'] }, async ({ api }) => {
    const body = rb102Booking('TC-001');
    await guarded(api, async () => {
      api.step('1. POST /booking (TD-01, TD-03)', '200, Content-Type MSG-10, body đúng 2 khóa bookingid + booking, 7 giá trị đúng kiểu');
      const { res, id } = await post(api, '1. POST /booking', { json: body });
      expect(res.status, 'Bước 2: HTTP 200').toBe(200);
      expect(Number.isInteger(id) && (id as number) > 0, 'Bước 2: bookingid là số nguyên > 0').toBe(true);
      softExpect(res.headers['content-type'], 'Bước 2: Content-Type MSG-10').toBe(MSG.jsonType);
      softExpect(isObj(res.json) ? Object.keys(res.json).sort() : res.json, 'Bước 2: body đúng 2 khóa bookingid, booking').toEqual(['booking', 'bookingid']);
      softExpect(bookingOf(res), 'Bước 2: booking đúng 7 giá trị TD-03, đúng kiểu, không khóa thừa').toStrictEqual(body);
      const g = await readOwn(api, id as number, '3. GET /booking/<id>');
      softExpect(g.status, 'Bước 3: HTTP 200').toBe(200);
      softExpect(g.headers['content-type'], 'Bước 3: Content-Type MSG-10').toBe(MSG.jsonType);
      softExpect(g.json, 'Bước 3: đúng 6 khóa cấp 1, bookingdates 2 khóa, 7 giá trị TD-03 đúng kiểu').toStrictEqual(body);
    });
  });

  test('TC-002 additionalneeds là tùy chọn: không gửi hoặc gửi null vẫn tạo được, 6 giá trị còn lại đúng', { tag: ['@AC-1', '@post', '@get-id'] }, async ({ api }) => {
    const variants = [
      { label: 'Biến thể 1: không gửi additionalneeds', body: omit(rb102Booking('TC-002-khong-gui'), 'additionalneeds') as Obj },
      { label: 'Biến thể 2: additionalneeds null', body: { ...rb102Booking('TC-002-null'), additionalneeds: null } as Obj },
    ];
    await guarded(api, async () => {
      for (const v of variants) {
        api.step(`${v.label}: POST /booking`, '200, MSG-10; additionalneeds không có giá trị; 6 giá trị còn lại đúng TD-03');
        const { res, id } = await post(api, v.label, { json: v.body });
        expect(res.status, `${v.label}: POST 200`).toBe(200);
        softExpect(res.headers['content-type'], `${v.label}: Content-Type MSG-10`).toBe(MSG.jsonType);
        const six = omit(v.body, 'additionalneeds');
        softExpect(noAdditionalNeeds(bookingOf(res)), `${v.label}: body trả về: additionalneeds không có giá trị (không khóa / null / '')`).toBe(true);
        softExpect(omit(bookingOf(res), 'additionalneeds'), `${v.label}: body trả về: 6 giá trị còn lại đúng TD-03`).toStrictEqual(six);
        const g = await readOwn(api, id as number, `${v.label}: GET /booking/<id>`);
        softExpect(g.status, `${v.label}: GET 200`).toBe(200);
        softExpect(noAdditionalNeeds(g.json), `${v.label}: GET: additionalneeds không có giá trị`).toBe(true);
        softExpect(omit(g.json, 'additionalneeds'), `${v.label}: GET: 6 giá trị còn lại đúng TD-03`).toStrictEqual(six);
      }
    });
  });

  test('TC-003 additionalneeds khác chuỗi (số, object, mảng, boolean) bị từ chối 400, không tạo booking', { tag: ['@AC-1', '@post', '@BUG-55'] }, async ({ api }) => {
    budget(20);
    const vals: [string, unknown][] = [['so', 42], ['object', { a: 1 }], ['mang', ['x', 'y']], ['boolean', false]];
    const out = await postVariants(
      api,
      vals.map(([k, v]) => ({ label: `additionalneeds ${JSON.stringify(v)} (TC-003-${k})`, req: { json: { ...rb102Booking(`TC-003-${k}`), additionalneeds: v } } })),
    );
    out.forEach((o) => softCommon(o.label, o.res));
    hardGate();
    test.fail(true, 'BUG-55: additionalneeds khác chuỗi vẫn 200 và lưu nguyên kiểu');
    for (const o of out) {
      softExpect(o.res.status, `${o.label}: HTTP 400`).toBe(400);
      softNotCreated(o);
    }
  });

  test('TC-004 Thiếu từng trường bắt buộc (7 biến thể): POST trả 400, không tạo booking', { tag: ['@AC-1', '@post', '@BUG-41'] }, async ({ api }) => {
    budget(30);
    const drop = (lastname: string, path: string[]) => {
      const b = JSON.parse(JSON.stringify(rb102Booking(lastname))) as Obj;
      if (path.length === 1) delete b[path[0]];
      else delete (b[path[0]] as Obj)[path[1]];
      return b;
    };
    const fields: [string, string[]][] = [
      ['firstname', ['firstname']],
      ['lastname', ['lastname']],
      ['totalprice', ['totalprice']],
      ['depositpaid', ['depositpaid']],
      ['bookingdates', ['bookingdates']],
      ['checkin', ['bookingdates', 'checkin']],
      ['checkout', ['bookingdates', 'checkout']],
    ];
    const out = await postVariants(
      api,
      fields.map(([name, path]) => {
        // variant without firstname keeps the owner in lastname (TD-02)
        const lastname = name === 'firstname' ? `${RUN}-TC-004-firstname` : `TC-004-${name}`;
        return { label: `Bỏ ${path.join('.')}`, req: { json: drop(lastname, path) }, lastnameCheck: name === 'firstname' ? lastname : undefined };
      }),
    );
    for (const o of out) {
      softNotCreated(o);
      softNoLeak(o.label, o.res);
    }
    hardGate();
    test.fail(true, 'BUG-41: thiếu trường bắt buộc trả 500 thay vì 400');
    for (const o of out) {
      softExpect(o.res.status, `${o.label}: HTTP 400`).toBe(400);
      softNo5xx(o.label, o.res);
    }
  });

  test('TC-005 Body {} và [] (JSON hợp lệ nhưng sai cấu trúc): POST trả 400', { tag: ['@AC-1', '@post', '@BUG-41'] }, async ({ api }) => {
    // body without names: a booking created by mistake is owned when it carries NO value at all ("khớp body rỗng đã gửi")
    const empty = (b: Obj) => ['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates', 'additionalneeds'].every((k) => b[k] === undefined || b[k] === null);
    const out = await postVariants(api, [
      { label: "Body '{}'", req: { data: '{}', isOwner: empty }, noFilter: true },
      { label: "Body '[]'", req: { data: '[]', isOwner: empty }, noFilter: true },
    ]);
    out.forEach((o) => softNoLeak(o.label, o.res));
    hardGate();
    test.fail(true, 'BUG-41: body {} / [] trả 500 thay vì 400');
    for (const o of out) {
      softExpect(o.res.status, `${o.label}: HTTP 400 (không 2xx)`).toBe(400);
      softNo5xx(o.label, o.res);
    }
  });

  test("TC-006 Body JSON hỏng và body null: POST trả 400 'Bad Request'", { tag: ['@AC-1', '@post'] }, async ({ api }) => {
    for (const [label, data] of [
      ['1. JSON hỏng \'{"firstname":\'', '{"firstname":'],
      ["2. Body 'null'", 'null'],
    ]) {
      api.step(label, `400, ${MSG.textType}, body Bad Request (MSG-04)`);
      const { res } = await post(api, label, { data });
      note(api, label, res);
      softExpect(res.status, `${label}: HTTP 400`).toBe(400);
      softExpect(res.headers['content-type'], `${label}: Content-Type MSG-11`).toBe(MSG.textType);
      softExpect(res.text, `${label}: body Bad Request (MSG-04)`).toBe(MSG.badRequest);
      softNo5xx(label, res);
    }
  });

  test('TC-007 null / sai kiểu cấu trúc ở trường bắt buộc: POST trả 400, không tạo booking', { tag: ['@AC-1', '@post', '@BUG-41'] }, async ({ api }) => {
    budget(20);
    const out = await postVariants(api, [
      { label: '1. totalprice null', req: { json: { ...rb102Booking('TC-007-gia-null'), totalprice: null } } },
      { label: '2. depositpaid null', req: { json: { ...rb102Booking('TC-007-coc-null'), depositpaid: null } } },
      { label: '3. firstname là số 12345', req: { json: { ...rb102Booking(`${RUN}-TC-007-ten-so`), firstname: 12345 } }, lastnameCheck: `${RUN}-TC-007-ten-so` },
      { label: '4. bookingdates là chuỗi', req: { json: { ...rb102Booking('TC-007-ngay-chuoi'), bookingdates: '2031-01-10' } } },
    ]);
    for (const o of out) {
      softNotCreated(o);
      softNoLeak(o.label, o.res);
    }
    hardGate();
    test.fail(true, 'BUG-41: null / sai cấu trúc trả 500 thay vì 400');
    for (const o of out) {
      softExpect(o.res.status, `${o.label}: HTTP 400`).toBe(400);
      softNo5xx(o.label, o.res);
    }
  });

  test('TC-008 totalprice sai kiểu (chuỗi chữ, chuỗi số, boolean) ở POST: 400, không tạo booking', { tag: ['@AC-1', '@post', '@BUG-43'] }, async ({ api }) => {
    budget(20);
    const vals: [string, unknown][] = [['chu', 'abc'], ['chuoi-so', '150'], ['boolean', true]];
    const out = await postVariants(
      api,
      vals.map(([k, v]) => ({ label: `totalprice ${JSON.stringify(v)} (TC-008-${k})`, req: { json: { ...rb102Booking(`TC-008-${k}`), totalprice: v } } })),
    );
    out.forEach((o) => softCommon(o.label, o.res));
    hardGate();
    test.fail(true, 'BUG-43: totalprice sai kiểu vẫn 200, lưu null / 150');
    for (const o of out) {
      softExpect(o.res.status, `${o.label}: HTTP 400`).toBe(400);
      softNotCreated(o);
    }
  });

  test('TC-009 totalprice số lẻ: tối đa 2 chữ số lẻ lưu đúng, 3 chữ số lẻ bị từ chối', { tag: ['@AC-1', '@post', '@get-id', '@BUG-43'] }, async ({ api }) => {
    budget(20);
    let out: PostOutcome[] = [];
    let reads: { label: string; price: number; g: ApiResult; body: Booking }[] = [];
    await guarded(api, async () => {
      const ok = [
        { price: 99.99, last: 'TC-009-99-99' },
        { price: 0.01, last: 'TC-009-0-01' },
      ];
      out = await postVariants(api, [
        ...ok.map((v) => ({ label: `Biến thể ${v.price}`, req: { json: { ...rb102Booking(v.last), totalprice: v.price } }, expectCreated: true })),
        { label: 'Biến thể 0.005', req: { json: { ...rb102Booking('TC-009-0-005'), totalprice: 0.005 } } },
      ]);
      reads = [];
      for (let i = 0; i < ok.length; i++) {
        const o = out[i];
        const body = { ...rb102Booking(ok[i].last), totalprice: ok[i].price };
        expect(o.res.status, `${o.label}: POST 200 (cần id để đọc lại)`).toBe(200);
        reads.push({ label: o.label, price: ok[i].price, g: await readOwn(api, o.id as number, `${o.label}: GET /booking/<id>`), body });
      }
    });
    for (const r of reads) {
      const o = out.find((x) => x.label === r.label)!;
      softExpect(omit(bookingOf(o.res), 'totalprice'), `${r.label}: body trả về: 6 giá trị còn lại đúng TD-03`).toStrictEqual(omit(r.body, 'totalprice'));
      softExpect(r.g.status, `${r.label}: GET 200`).toBe(200);
      softExpect(omit(r.g.json, 'totalprice'), `${r.label}: GET: 6 giá trị còn lại đúng TD-03`).toStrictEqual(omit(r.body, 'totalprice'));
    }
    out.forEach((o) => softCommon(o.label, o.res));
    hardGate();
    test.fail(true, 'BUG-43: totalprice bị cắt phần lẻ, 3 chữ số lẻ vẫn 200');
    for (const r of reads) {
      const o = out.find((x) => x.label === r.label)!;
      softExpect((bookingOf(o.res) as Obj | undefined)?.totalprice, `${r.label}: body trả về: totalprice đúng ${r.price}`).toBe(r.price);
      softExpect((r.g.json as Obj | undefined)?.totalprice, `${r.label}: GET: totalprice đúng ${r.price}`).toBe(r.price);
    }
    const v3 = out[2];
    softExpect(v3.res.status, `${v3.label}: HTTP 400`).toBe(400);
    softNotCreated(v3);
  });

  test('TC-010 Biên totalprice hợp lệ (0, 1, -0, 1e20) được nhận và đọc lại đúng; 2^53 + 1 chỉ ghi nhận', { tag: ['@AC-1', '@post', '@get-id'] }, async ({ api }) => {
    budget(30);
    // Raw JSON text: JSON.stringify cannot keep -0 or 2^53 + 1 (TD-08)
    const raw = (lastname: string, price: string) => JSON.stringify(rb102Booking(lastname)).replace('"totalprice":150', `"totalprice":${price}`);
    const variants = [
      { label: '1. totalprice 0', price: '0', last: 'TC-010-0', expect: 0 },
      { label: '2. totalprice 1', price: '1', last: 'TC-010-1', expect: 1 },
      { label: '3. totalprice -0', price: '-0', last: 'TC-010-am-0', expect: 0 },
      { label: '4. totalprice 1e20', price: '1e20', last: 'TC-010-1e20', expect: 1e20 },
      { label: '5. totalprice 9007199254740993 (2^53 + 1)', price: '9007199254740993', last: 'TC-010-2mu53', expect: undefined },
    ];
    await guarded(api, async () => {
      for (const v of variants) {
        api.step(v.label, v.expect === undefined ? 'POST 200; chỉ ghi annotation giá trị đọc lại (Q2 e)' : `POST 200, GET 200, totalprice đọc lại ${v.expect}`);
        const { res, id } = await post(api, v.label, { data: raw(v.last, v.price), names: [RUN] });
        softExpect(res.status, `${v.label}: POST 200`).toBe(200);
        if (res.status !== 200 || id === undefined) continue;
        const g = await readOwn(api, id, `${v.label}: GET /booking/<id>`);
        softExpect(g.status, `${v.label}: GET 200`).toBe(200);
        if (v.expect === undefined) {
          test.info().annotations.push({ type: 'totalprice đọc lại (2^53 + 1)', description: g.text.match(/"totalprice":([^,}]+)/)?.[1] ?? '(không đọc được)' });
          continue;
        }
        for (const [where, b] of [['body trả về', bookingOf(res)], ['GET', g.json]] as const) {
          const p = (b as Obj | undefined)?.totalprice;
          // === treats -0 as 0 (the value sent is -0, the expected read-back is 0)
          softExpect(typeof p === 'number' && p === v.expect, `${v.label}: ${where}: totalprice = ${v.expect} (number); thực tế ${String(p)}`).toBe(true);
          softExpect(omit(b, 'totalprice'), `${v.label}: ${where}: 6 giá trị còn lại đúng TD-03`).toStrictEqual(omit(rb102Booking(v.last), 'totalprice'));
        }
      }
    });
  });

  test('TC-011 totalprice âm bị từ chối 400, không tạo booking', { tag: ['@AC-1', '@post', '@BUG-57'] }, async ({ api }) => {
    const out = await postVariants(api, [
      { label: 'totalprice -1', req: { json: { ...rb102Booking('TC-011-am-1'), totalprice: -1 } } },
      { label: 'totalprice -100', req: { json: { ...rb102Booking('TC-011-am-100'), totalprice: -100 } } },
    ]);
    out.forEach((o) => softCommon(o.label, o.res));
    hardGate();
    test.fail(true, 'BUG-57: giá âm vẫn 200 và được lưu');
    for (const o of out) {
      softExpect(o.res.status, `${o.label}: HTTP 400`).toBe(400);
      softNotCreated(o);
    }
  });

  test('TC-012 depositpaid JSON không phải boolean ("false", "true", "abc", 0, 1) ở POST: 400, không tạo booking', { tag: ['@AC-1', '@post', '@BUG-42'] }, async ({ api }) => {
    budget(30);
    const vals: [string, unknown][] = [['chuoi-false', 'false'], ['chuoi-true', 'true'], ['abc', 'abc'], ['0', 0], ['1', 1]];
    const out = await postVariants(
      api,
      vals.map(([k, v]) => ({ label: `depositpaid ${JSON.stringify(v)} (TC-012-${k})`, req: { json: { ...rb102Booking(`TC-012-${k}`), depositpaid: v } } })),
    );
    out.forEach((o) => softCommon(o.label, o.res));
    hardGate();
    test.fail(true, 'BUG-42: depositpaid không phải boolean vẫn 200, "false" lưu thành true');
    for (const o of out) {
      softExpect(o.res.status, `${o.label}: HTTP 400`).toBe(400);
      softNotCreated(o);
    }
  });

  test('TC-013 Ngày sai định dạng / không tồn tại / năm 10000 ở POST: 400, không lưu 0NaN-aN-aN hay ngày bị cuộn', { tag: ['@AC-1', '@post', '@full', '@BUG-44'] }, async ({ api }) => {
    budget(45);
    const dates: [string, string][] = [
      ['15/01/2031', '2031-01-12'],
      ['10/01/2031', '2031-01-12'],
      ['abc', '2031-01-12'],
      ['', '2031-01-12'],
      ['2031-02-30', '2031-03-05'],
      ['2046-04-31', '2046-05-05'],
      ['2031-13-45', '2031-01-12'],
      ['2031-01-10', '10000-01-01'],
    ];
    const out = await postVariants(
      api,
      dates.map(([checkin, checkout], i) => ({
        label: `${i + 1}. checkin '${checkin}', checkout '${checkout}'`,
        req: { json: { ...rb102Booking(`TC-013-${i + 1}`), bookingdates: { checkin, checkout } } },
      })),
    );
    out.forEach((o) => softCommon(o.label, o.res));
    hardGate();
    test.fail(true, 'BUG-44: ngày không hợp lệ vẫn 200, lưu 0NaN-aN-aN / ngày bị cuộn');
    const bad = [MSG.nanDate, '2031-03-02', '2046-05-01', '0000-01-01', '2031-10-01'];
    for (const o of out) {
      softExpect(o.res.status, `${o.label}: HTTP 400`).toBe(400);
      softNotCreated(o);
      const d = (bookingOf(o.res) as Obj | undefined)?.bookingdates as Obj | undefined;
      const stored = [d?.checkin, d?.checkout].filter((x) => typeof x === 'string');
      softExpect(stored.filter((x) => bad.includes(x as string)), `${o.label}: không lưu ngày hỏng / bị cuộn (${bad.join(', ')})`).toEqual([]);
    }
  });

  test('TC-014 Ngày có giờ / múi giờ / số mili giây ở POST: 400, không lưu ngày bị lệch', { tag: ['@AC-1', '@post', '@BUG-44'] }, async ({ api }) => {
    budget(20);
    const ms = 1925078400000;
    const out = await postVariants(api, [
      { label: "1. checkin '2031-01-10T23:30:00Z'", req: { json: { ...rb102Booking('TC-014-1'), bookingdates: { checkin: '2031-01-10T23:30:00Z', checkout: '2031-01-12' } } } },
      { label: "2. checkin '2031-01-10T01:00:00+07:00'", req: { json: { ...rb102Booking('TC-014-2'), bookingdates: { checkin: '2031-01-10T01:00:00+07:00', checkout: '2031-01-12' } } } },
      { label: `3. checkin số ${ms}`, req: { json: { ...rb102Booking('TC-014-3'), bookingdates: { checkin: ms, checkout: '2031-01-12' } } } },
    ]);
    out.forEach((o) => softCommon(o.label, o.res));
    hardGate();
    test.fail(true, 'BUG-44: ngày có giờ / múi giờ / số vẫn 200, lưu ngày lệch');
    const bad = ['2031-01-09', new Date(ms).toISOString().slice(0, 10)];
    for (const o of out) {
      softExpect(o.res.status, `${o.label}: HTTP 400`).toBe(400);
      softNotCreated(o);
      const checkin = ((bookingOf(o.res) as Obj | undefined)?.bookingdates as Obj | undefined)?.checkin;
      softExpect(bad.includes(checkin as string), `${o.label}: không lưu checkin lệch (${bad.join(', ')}); thực tế ${String(checkin)}`).toBe(false);
    }
  });

  test('TC-015 Ngày hợp lệ đặc biệt (29/02 năm nhuận, năm 0001, năm 9999, quá khứ) được nhận và đọc lại đúng', { tag: ['@AC-1', '@post', '@get-id'] }, async ({ api }) => {
    budget(25);
    const dates: [string, string][] = [
      ['2032-02-29', '2032-03-01'],
      ['0001-01-01', '0001-01-02'],
      ['9999-12-30', '9999-12-31'],
      ['1999-01-01', '1999-01-05'],
    ];
    await guarded(api, async () => {
      for (const [i, [checkin, checkout]] of dates.entries()) {
        const label = `${i + 1}. ${checkin} → ${checkout}`;
        const body = { ...rb102Booking(`TC-015-${i + 1}`), bookingdates: { checkin, checkout } };
        api.step(label, 'POST 200, GET 200, ngày đúng nguyên văn, 5 giá trị còn lại đúng TD-03');
        const { res, id } = await post(api, label, { json: body });
        softExpect(res.status, `${label}: POST 200`).toBe(200);
        softExpect(bookingOf(res), `${label}: body trả về: 7 giá trị đúng (ngày nguyên văn)`).toStrictEqual(body);
        if (id === undefined) continue;
        const g = await readOwn(api, id, `${label}: GET /booking/<id>`);
        softExpect(g.status, `${label}: GET 200`).toBe(200);
        softExpect(g.json, `${label}: GET: 7 giá trị đúng (ngày nguyên văn)`).toStrictEqual(body);
      }
    });
  });

  test('TC-016 checkout trước hoặc bằng checkin ở POST: 400, không tạo booking', { tag: ['@AC-1', '@post', '@BUG-56'] }, async ({ api }) => {
    const out = await postVariants(api, [
      { label: 'checkout trước checkin (2031-01-12 → 2031-01-10)', req: { json: { ...rb102Booking('TC-016-truoc'), bookingdates: { checkin: '2031-01-12', checkout: '2031-01-10' } } } },
      { label: 'checkout bằng checkin (2031-01-10 → 2031-01-10)', req: { json: { ...rb102Booking('TC-016-bang'), bookingdates: { checkin: '2031-01-10', checkout: '2031-01-10' } } } },
    ]);
    out.forEach((o) => softCommon(o.label, o.res));
    hardGate();
    test.fail(true, 'BUG-56: checkout trước / bằng checkin vẫn 200');
    for (const o of out) {
      softExpect(o.res.status, `${o.label}: HTTP 400`).toBe(400);
      softNotCreated(o);
    }
  });

  test('TC-017 firstname / lastname rỗng hoặc chỉ khoảng trắng ở POST: 400, không tạo booking', { tag: ['@AC-1', '@post', '@BUG-55'] }, async ({ api }) => {
    budget(25);
    const out = await postVariants(api, [
      { label: "1. firstname ''", req: { json: { ...rb102Booking(`${RUN}-TC-017-1`), firstname: '' } }, lastnameCheck: `${RUN}-TC-017-1` },
      { label: "2. lastname ''", req: { json: { ...rb102Booking(''), additionalneeds: `${RUN}-TC-017-2` } } },
      { label: "3. lastname '   ' (3 khoảng trắng)", req: { json: { ...rb102Booking('   '), additionalneeds: `${RUN}-TC-017-3` } } },
      { label: "4. firstname '\\t' (1 tab)", req: { json: { ...rb102Booking(`${RUN}-TC-017-4`), firstname: '\t' } }, lastnameCheck: `${RUN}-TC-017-4` },
    ]);
    out.forEach((o) => softCommon(o.label, o.res));
    hardGate();
    test.fail(true, 'BUG-55: tên rỗng / chỉ khoảng trắng vẫn 200 và được lưu');
    for (const o of out) {
      softExpect(o.res.status, `${o.label}: HTTP 400`).toBe(400);
      softNotCreated(o);
    }
  });

  test('TC-018 Chuỗi hợp lệ đa dạng (tiếng Việt, emoji, HTML, nháy, dấu \\) lưu và đọc lại nguyên văn', { tag: ['@AC-1', '@post', '@get-id'] }, async ({ api }) => {
    const variants = [
      { label: '1. Tiếng Việt + emoji', lastname: 'TC-018 Nguyễn Thị Hồng', needs: 'Ăn sáng chay 🍜' },
      { label: '2. HTML + nháy + dấu \\', lastname: 'TC-018 <script>alert(1)</script>', needs: 'O\'Brien "Jr" a\\b' },
    ];
    await guarded(api, async () => {
      for (const v of variants) {
        const body = { ...rb102Booking(v.lastname), additionalneeds: v.needs };
        api.step(v.label, 'POST 200, GET 200; lastname, additionalneeds giống từng ký tự; 5 giá trị còn lại đúng TD-03');
        const { res, id } = await post(api, v.label, { json: body });
        expect(res.status, `${v.label}: POST 200`).toBe(200);
        softExpect(bookingOf(res), `${v.label}: body trả về: 7 giá trị nguyên văn`).toStrictEqual(body);
        const g = await readOwn(api, id as number, `${v.label}: GET /booking/<id>`);
        softExpect(g.status, `${v.label}: GET 200`).toBe(200);
        softExpect(g.json, `${v.label}: GET: 7 giá trị nguyên văn`).toStrictEqual(body);
      }
    });
  });

  test('TC-019 Khoảng trắng đầu cuối được lưu nguyên văn (server không cắt)', { tag: ['@AC-1', '@post', '@get-id', '@BUG-59'] }, async ({ api }) => {
    const body = { ...rb102Booking('  TC-019-Pad  '), additionalneeds: '  Pad  ' };
    let res: ApiResult | undefined;
    let g: ApiResult | undefined;
    await guarded(api, async () => {
      api.step('1. POST /booking, lastname "␣␣TC-019-Pad␣␣", additionalneeds "␣␣Pad␣␣"', '200; 2 chuỗi giữ nguyên khoảng trắng');
      const p = await post(api, '1. POST /booking', { json: body });
      res = p.res;
      expect(res.status, 'Bước 2: POST 200').toBe(200);
      g = await readOwn(api, p.id as number, '3. GET /booking/<id>');
    });
    const r = res as ApiResult;
    const read = g as ApiResult;
    softExpect(read.status, 'Bước 3: GET 200').toBe(200);
    for (const [where, b] of [['Bước 2 body trả về', bookingOf(r)], ['Bước 3 GET', read.json]] as const)
      softExpect(omit(b, 'lastname', 'additionalneeds'), `${where}: 5 giá trị còn lại đúng TD-03`).toStrictEqual(omit(body, 'lastname', 'additionalneeds'));
    // correct today (BUG-59 scope = firstname + lastname): additionalneeds is kept verbatim; checked BEFORE the gate (L18)
    for (const [where, b] of [['Bước 2 body trả về', bookingOf(r)], ['Bước 3 GET', read.json]] as const)
      softExpect((b as Obj | undefined)?.additionalneeds, `${where}: additionalneeds đúng '  Pad  ' (7 ký tự, đang đúng)`).toBe(body.additionalneeds);
    hardGate();
    test.fail(true, 'BUG-59: server cắt khoảng trắng đầu cuối firstname / lastname khi lưu');
    for (const [where, b] of [['Bước 2 body trả về', bookingOf(r)], ['Bước 3 GET', read.json]] as const)
      softExpect((b as Obj | undefined)?.lastname, `${where}: lastname đúng '  TC-019-Pad  ' (14 ký tự)`).toBe(body.lastname);
  });

  test('TC-020 Chuỗi 5000 ký tự ở firstname, lastname, additionalneeds lưu và đọc lại đủ', { tag: ['@AC-1', '@post', '@get-id'] }, async ({ api }) => {
    const firstname = RUN.padEnd(5000, 'a');
    const body = { ...rb102Booking('TC-020-'.padEnd(5000, 'b')), firstname, additionalneeds: 'c'.repeat(5000) };
    await guarded(api, async () => {
      api.step('1. POST /booking với 3 chuỗi 5000 ký tự (TD-13)', '200; 3 chuỗi đủ 5000 ký tự, giống chuỗi gửi; 4 giá trị còn lại đúng');
      const { res, id } = await post(api, '1. POST /booking', { json: body });
      expect(res.status, 'Bước 2: POST 200').toBe(200);
      const g = await readOwn(api, id as number, '3. GET /booking/<id>');
      softExpect(g.status, 'Bước 3: GET 200').toBe(200);
      for (const [where, b] of [['Bước 2 body trả về', bookingOf(res)], ['Bước 3 GET', g.json]] as const) {
        const o = (b ?? {}) as Obj;
        // booleans + length: a 5000-char diff in the error message would bury the result
        for (const k of ['firstname', 'lastname', 'additionalneeds'] as const)
          softExpect(o[k] === body[k], `${where}: ${k} giống chuỗi đã gửi (5000 ký tự); thực tế dài ${typeof o[k] === 'string' ? (o[k] as string).length : String(o[k])}`).toBe(true);
        softExpect(omit(o, 'firstname', 'lastname', 'additionalneeds'), `${where}: 4 giá trị còn lại đúng TD-03`).toStrictEqual(omit(body, 'firstname', 'lastname', 'additionalneeds'));
      }
    });
  });

  test('TC-021 Trường thừa (extra, roomnumber, bookingid) ở POST bị bỏ qua, id do server cấp', { tag: ['@AC-1', '@security', '@post', '@get-id'] }, async ({ api }) => {
    const body = rb102Booking('TC-021');
    await guarded(api, async () => {
      const y = await createOwn(api, rb102Booking('TC-021-y'), 'Chuẩn bị: booking Y (lastname TC-021-y)');
      // L17: bookingid in the body = ONLY the test's own booking, owner checked right before the request
      api.step('1. GET /booking/Y kiểm chủ sở hữu, lưu mốc Y', 'firstname QA-RB102-<RUN>, lastname TC-021-y');
      const gy = await api.getBooking(y);
      guardOwnBooking(gy.status, '1. GET Y', y);
      expect(gy.status, 'Bước 1: GET Y 200').toBe(200);
      expect(isObj(gy.json) && gy.json.firstname === RUN && gy.json.lastname === 'TC-021-y', 'Bước 1: Y đúng chủ sở hữu (L17); không phải thì không gửi bookingid').toBe(true);
      api.step('2. POST /booking TD-03 + "extra", "roomnumber", "bookingid": Y', '200; id N mới ≠ Y; booking đúng 6 khóa, 7 giá trị TD-03');
      const { res, id } = await post(api, '2. POST có trường thừa', { json: { ...body, extra: 'x', roomnumber: 101, bookingid: y } });
      expect(res.status, 'Bước 3: POST 200').toBe(200);
      expect(Number.isInteger(id) && (id as number) > 0, 'Bước 3: N là số nguyên > 0').toBe(true);
      softExpect(id, 'Bước 3: N khác Y').not.toBe(y);
      softExpect(bookingOf(res), 'Bước 3: booking đúng 6 khóa (không extra, roomnumber, bookingid), 7 giá trị TD-03').toStrictEqual(body);
      const gn = await readOwn(api, id as number, '4. GET /booking/N');
      softExpect(gn.status, 'Bước 4: GET N 200').toBe(200);
      softExpect(gn.json, 'Bước 4: đúng 6 khóa, 7 giá trị TD-03').toStrictEqual(body);
      const gy2 = await readOwn(api, y, '5. GET /booking/Y');
      softExpect(gy2.status === 200 && gy2.text === gy.text, 'Bước 5: body Y giống hệt mốc').toBe(true);
      api.step('6. GET /booking?firstname=<run>&lastname=TC-021', 'Đúng [{"bookingid": N}]');
      const f = await api.send('GET', `/booking?firstname=${enc(RUN)}&lastname=TC-021`, { headers: ACCEPT_JSON });
      softExpect(f.status, 'Bước 6: 200').toBe(200);
      softExpect(f.json, 'Bước 6: đúng [{"bookingid": N}]').toEqual([{ bookingid: id }]);
    });
  });

  test('TC-022 POST 2 lần cùng body tạo 2 booking khác id, cả 2 đọc lại đúng', { tag: ['@AC-1', '@post', '@get-list'] }, async ({ api }) => {
    const body = rb102Booking('TC-022');
    await guarded(api, async () => {
      api.step('1. POST /booking → A; 2. gửi lại đúng body → B', '200 cả 2, A ≠ B');
      const a = await post(api, '1. POST → A', { json: body });
      const b = await post(api, '2. POST lại → B', { json: body });
      expect(a.res.status, 'Bước 1: 200').toBe(200);
      expect(b.res.status, 'Bước 2: 200').toBe(200);
      softExpect(a.id, 'A ≠ B').not.toBe(b.id);
      for (const [n, id] of [['A', a.id], ['B', b.id]] as const) {
        const g = await readOwn(api, id as number, `3. GET /booking/${n}`);
        softExpect(g.status, `Bước 3: GET ${n} 200`).toBe(200);
        softExpect(g.json, `Bước 3: ${n} đúng 7 giá trị TD-03`).toStrictEqual(body);
      }
      api.step('4. GET /booking?firstname=<run>&lastname=TC-022', 'Mảng đúng 2 phần tử A, B');
      const f = await api.send('GET', `/booking?firstname=${enc(RUN)}&lastname=TC-022`, { headers: ACCEPT_JSON });
      softExpect(f.status, 'Bước 4: 200').toBe(200);
      softExpect([...listIds(f)].sort(), 'Bước 4: đúng 2 phần tử A, B').toEqual([a.id, b.id].sort());
    });
  });

  test('TC-023 Thiếu / sai Content-Type (415) và body rỗng (400): không 5xx, không tạo booking', { tag: ['@AC-8', '@AC-1', '@post', '@BUG-58'] }, async ({ api }) => {
    budget(20);
    const out = await postVariants(api, [
      {
        label: '1. Không có header Content-Type, body JSON',
        req: { noContentType: true, headers: ACCEPT_JSON, data: JSON.stringify(rb102Booking('TC-023-khong-ct')), names: [RUN] },
      },
      { label: '2. Content-Type: text/plain, body JSON', req: { headers: { 'Content-Type': 'text/plain' }, data: JSON.stringify(rb102Booking('TC-023-text-plain')), names: [RUN] } },
      {
        label: '3. Content-Type: application/xml, body XML',
        req: { headers: { 'Content-Type': 'application/xml' }, data: toXml({ ...rb102Booking('TC-023-app-xml'), depositpaid: true }), names: [RUN] },
      },
      // body really EMPTY: Buffer.alloc(0) = 0 byte (Playwright turns `data: ''` into the 2-byte JSON string `""`, review A1)
      { label: '4. Content-Type: application/json, body rỗng thật (0 byte)', req: { data: Buffer.alloc(0) }, noFilter: true },
    ]);
    // variant 1 must really go out WITHOUT Content-Type (a library may add one): proof from the headers sent
    expect(out[0].res.sentHeaders && 'content-type' in out[0].res.sentHeaders, 'Biến thể 1: request thật sự không có header Content-Type').toBe(false);
    for (const o of out.slice(0, 3)) softNotCreated(o);
    out.forEach((o) => softNoLeak(o.label, o.res));
    hardGate();
    test.fail(true, 'BUG-58: thiếu / sai Content-Type, body rỗng trả 500 thay vì 415 / 400');
    out.forEach((o, i) => {
      softExpect(o.res.status, `${o.label}: HTTP ${i < 3 ? 415 : 400}`).toBe(i < 3 ? 415 : 400);
      softNo5xx(o.label, o.res);
    });
  });

  test("TC-024 Content-Type không khớp body: 400 'Bad Request', không tạo booking", { tag: ['@AC-8', '@post'] }, async ({ api }) => {
    const out = await postVariants(api, [
      { label: '1. Content-Type: application/json, body XML', req: { data: toXml({ ...rb102Booking('TC-024-json-xml'), depositpaid: true }), names: [RUN] } },
      { label: '2. Content-Type: text/xml, body JSON', req: { headers: { 'Content-Type': 'text/xml' }, data: JSON.stringify(rb102Booking('TC-024-xml-json')), names: [RUN] } },
    ]);
    for (const o of out) {
      softExpect(o.res.status, `${o.label}: HTTP 400`).toBe(400);
      softExpect(o.res.headers['content-type'], `${o.label}: Content-Type MSG-11`).toBe(MSG.textType);
      softExpect(o.res.text, `${o.label}: body Bad Request (MSG-04)`).toBe(MSG.badRequest);
      softNo5xx(o.label, o.res);
      softNotCreated(o);
    }
  });

  test('TC-025 GET /booking không lọc: 200, mảng [{bookingid}] có id vừa tạo', { tag: ['@AC-3', '@smoke', '@post', '@get-list'] }, async ({ api }) => {
    await guarded(api, async () => {
      const x = await createOwn(api, rb102Booking('TC-025'));
      api.step('1. GET /booking (không tham số)', '200, MSG-10, mảng khác rỗng, mọi phần tử đúng 1 khóa bookingid nguyên dương, có X');
      const r = await api.send('GET', '/booking', { headers: ACCEPT_JSON });
      softExpect(r.status, '200').toBe(200);
      softExpect(r.headers['content-type'], 'Content-Type MSG-10').toBe(MSG.jsonType);
      const arr = Array.isArray(r.json) ? (r.json as unknown[]) : [];
      softExpect(arr.length, 'mảng JSON khác rỗng').toBeGreaterThan(0);
      const bad = arr.filter((e) => !(isObj(e) && Object.keys(e).length === 1 && Number.isInteger(e.bookingid) && (e.bookingid as number) > 0));
      softExpect(bad.slice(0, 3), `mọi phần tử là {"bookingid": số nguyên > 0} (${bad.length} phần tử sai, in 3 phần tử đầu)`).toEqual([]);
      softExpect(listIds(r).includes(x), 'có phần tử {"bookingid": X}').toBe(true);
    });
  });
});

// =====================================================================================================================
test.describe('Endpoint 2: GET /booking/:id', () => {
  test("TC-027 GET /booking/:id với id không tồn tại (rất lớn, 0, âm, chữ, khoảng trắng) trả 404 'Not Found'", { tag: ['@AC-2', '@get-id'] }, async ({ api }) => {
    for (const id of ['999999999', '0', '-1', 'abc', '%20']) {
      const label = `GET /booking/${id}`;
      api.step(label, '404, MSG-11, body Not Found');
      const r = await api.send('GET', `/booking/${id}`, { headers: ACCEPT_JSON });
      softExpect(r.status, `${label}: 404`).toBe(404);
      softExpect(r.headers['content-type'], `${label}: Content-Type MSG-11`).toBe(MSG.textType);
      softExpect(r.text, `${label}: body Not Found (MSG-01), không có JSON booking`).toBe(MSG.notFound);
    }
  });

  test('TC-028 Accept application/xml với ký tự đặc biệt của XML: escape đúng, đọc ra đúng chuỗi đã gửi', { tag: ['@AC-8', '@security', '@get-id'] }, async ({ api }) => {
    const needs = 'a<b & c]]>"d\'';
    await guarded(api, async () => {
      const x = await createOwn(api, { ...rb102Booking('TC-028'), additionalneeds: needs });
      api.step('1. GET /booking/X, Accept: application/xml', '200; XML gốc <booking>; escape đúng; đọc ra đúng chuỗi');
      const r = await api.send('GET', `/booking/${x}`, { headers: { Accept: 'application/xml' } });
      guardOwnBooking(r.status, '1. GET XML', x);
      softExpect(r.status, '200').toBe(200);
      const doc = parseXml(r.text);
      softExpect(doc?.root, 'body phân tích được thành XML, phần tử gốc <booking>').toBe('booking');
      softExpect(r.text.includes(`<additionalneeds>a&lt;b &amp; c]]&gt;"d'</additionalneeds>`), 'chuỗi thô chứa <additionalneeds>a&lt;b &amp; c]]&gt;"d\'</additionalneeds>').toBe(true);
      const v = doc && typeof doc.value === 'object' ? doc.value : {};
      softExpect(v.additionalneeds, 'additionalneeds sau khi phân tích đúng chuỗi đã gửi').toBe(needs);
      softExpect(v.lastname, "lastname 'TC-028'").toBe('TC-028');
    });
  });
});

// =====================================================================================================================
test.describe('Endpoint 3: GET /booking', () => {
  test("TC-029 Lọc firstname, lastname khớp chính xác, kết hợp là 'và', tham số lạ bị bỏ qua", { tag: ['@AC-3', '@smoke', '@get-list'] }, async ({ api }) => {
    budget(25);
    await guarded(api, async () => {
      const a = await createOwn(api, rb102Booking('TC-029-a'), 'Chuẩn bị: A (lastname TC-029-a)');
      const b = await createOwn(api, rb102Booking('TC-029-b'), 'Chuẩn bị: B (lastname TC-029-b)');
      const c = await createOwn(api, { ...rb102Booking('TC-029-a'), firstname: `${RUN}-khac` }, 'Chuẩn bị: C (firstname <run>-khac, lastname TC-029-a)');
      const q = async (label: string, query: string) => {
        api.step(label, query);
        const r = await api.send('GET', `/booking?${query}`, { headers: ACCEPT_JSON });
        softExpect(r.status, `${label}: 200`).toBe(200);
        softExpect(r.headers['content-type'], `${label}: Content-Type MSG-10`).toBe(MSG.jsonType);
        return r;
      };
      const r1 = await q('1. firstname=<run>&lastname=TC-029-a', `firstname=${enc(RUN)}&lastname=TC-029-a`);
      softExpect(r1.json, 'Bước 1: đúng [{"bookingid": A}]').toEqual([{ bookingid: a }]);
      const r2 = await q('2. lastname=TC-029-b', 'lastname=TC-029-b');
      softExpect([listIds(r2).includes(b), listIds(r2).includes(a), listIds(r2).includes(c)], 'Bước 2: có B, không có A, C').toEqual([true, false, false]);
      const r3 = await q('3. firstname=<run>', `firstname=${enc(RUN)}`);
      softExpect([listIds(r3).includes(a), listIds(r3).includes(b), listIds(r3).includes(c)], 'Bước 3: có A, B, không có C (khớp chính xác, không theo tiền tố)').toEqual([true, true, false]);
      const r4 = await q('4. firstname=<run>-khac&lastname=TC-029-b', `firstname=${enc(`${RUN}-khac`)}&lastname=TC-029-b`);
      softExpect(r4.json, "Bước 4: [] (C khớp firstname nhưng không khớp lastname: 'và')").toEqual([]);
      const r5 = await q('5. firstname=<run>&lastname=TC-029-a&foo=bar', `firstname=${enc(RUN)}&lastname=TC-029-a&foo=bar`);
      softExpect(r5.json, 'Bước 5: đúng [{"bookingid": A}] (foo bị bỏ qua)').toEqual([{ bookingid: a }]);
    });
  });

  test('TC-030 Lọc tên khác hoa thường, khớp một phần, có khoảng trắng đầu, giá trị rỗng: trả []', { tag: ['@AC-3', '@get-list'] }, async ({ api }) => {
    await guarded(api, async () => {
      const x = await createOwn(api, rb102Booking('TC-030'));
      api.step('0. Đối chứng: firstname=<run>&lastname=TC-030', 'Đúng [{"bookingid": X}] (booking có thật, bước sau mới có nghĩa)');
      const r0 = await api.send('GET', `/booking?firstname=${enc(RUN)}&lastname=TC-030`, { headers: ACCEPT_JSON });
      expect(r0.status, 'Bước 0: 200').toBe(200);
      expect(r0.json, 'Bước 0: đúng [{"bookingid": X}]').toEqual([{ bookingid: x }]);
      const variants: [string, string][] = [
        ['1. firstname viết thường', `firstname=${enc(RUN.toLowerCase())}&lastname=TC-030`],
        ['2. firstname bỏ ký tự cuối', `firstname=${enc(RUN.slice(0, -1))}&lastname=TC-030`],
        ['3. firstname có %20 ở đầu', `firstname=%20${enc(RUN)}&lastname=TC-030`],
        ['4. firstname= (rỗng)', 'firstname='],
        ['5. lastname tc-030 (viết thường)', `firstname=${enc(RUN)}&lastname=tc-030`],
      ];
      for (const [label, query] of variants) {
        const isEmptyFirstname = label.startsWith('4.');
        api.step(label, isEmptyFirstname ? '200, MSG-10, mảng JSON; không có X; id trả về (nếu có) đều có firstname rỗng; không trả toàn bộ danh sách' : "200, MSG-10, body '[]'");
        const r = await api.send('GET', `/booking?${query}`, { headers: ACCEPT_JSON });
        softExpect(r.status, `${label}: 200`).toBe(200);
        softExpect(r.headers['content-type'], `${label}: Content-Type MSG-10`).toBe(MSG.jsonType);
        if (!isEmptyFirstname) {
          softExpect(r.text, `${label}: body '[]'`).toBe('[]');
          continue;
        }
        // Step 4 (Q7 d, clarified 2026-11-27): the server matches EXACTLY, so booking of OTHER people with firstname '' may appear
        // (BUG-55 lets them exist). Oracle independent of other people's data: array, no X, every returned id read (GET only,
        // at most 3) has firstname '', and the filter is not dropped (more than 3 → fewer items than the unfiltered list).
        // Only counts go into the annotation: never the values of other people's bookings (privacy).
        const ids = listIds(r);
        softExpect(Array.isArray(r.json), `${label}: body là mảng JSON`).toBe(true);
        softExpect(ids.includes(x), `${label}: không có X (firstname của X khác rỗng)`).toBe(false);
        let empty = 0;
        let notEmpty = 0;
        let unread = 0;
        for (const id of ids.slice(0, 3)) {
          const g = await api.getBooking(id as number);
          if (g.status !== 200 || !isObj(g.json)) unread++;
          else if (g.json.firstname === '') empty++;
          else notEmpty++;
        }
        softExpect(notEmpty, `${label}: mọi id đọc được (≤ 3) có firstname === '' (bộ lọc khớp chính xác chuỗi rỗng)`).toBe(0);
        let dropped = 'không kiểm (≤ 3 phần tử)';
        if (ids.length > 3) {
          const all = await api.send('GET', '/booking', { headers: ACCEPT_JSON });
          const total = listIds(all).length;
          softExpect(ids.length, `${label}: bộ lọc không bị bỏ: số phần tử (${ids.length}) nhỏ hơn GET /booking không lọc (${total})`).toBeLessThan(total);
          dropped = `${ids.length} so với ${total} không lọc`;
        }
        test.info().annotations.push({
          type: 'firstname= rỗng',
          description: `${ids.length} phần tử; đọc ${Math.min(ids.length, 3)}: firstname === '' đúng ${empty}, sai ${notEmpty}, không đọc được ${unread}; ${dropped}`,
        });
      }
    });
  });

  test('TC-031 Lọc tên tiếng Việt có dấu và dấu cách (mã hóa %20 và +): tìm được booking', { tag: ['@AC-3', '@get-list'] }, async ({ api }) => {
    const firstname = `${RUN} Nguyễn Văn`;
    await guarded(api, async () => {
      const x = await createOwn(api, { ...rb102Booking('TC-031'), firstname });
      for (const [label, value] of [
        ['1. dấu cách mã hóa %20', enc(firstname)],
        ["2. dấu cách mã hóa '+'", enc(firstname).replace(/%20/g, '+')],
      ]) {
        api.step(label, `firstname=${value}&lastname=TC-031 → [{"bookingid": X}]`);
        const r = await api.send('GET', `/booking?firstname=${value}&lastname=TC-031`, { headers: ACCEPT_JSON });
        softExpect(r.status, `${label}: 200`).toBe(200);
        softExpect(r.json, `${label}: đúng [{"bookingid": X}]`).toEqual([{ bookingid: x }]);
      }
    });
  });

  test('TC-032 Lọc checkin=D: có booking checkin D+1, không có booking checkin D-1', { tag: ['@AC-3', '@get-list'] }, async ({ api }) => {
    await guarded(api, async () => {
      const p1 = await createOwn(api, { ...rb102Booking('TC-032-d-1'), bookingdates: { checkin: '2047-05-19', checkout: '2047-05-24' } });
      const p2 = await createOwn(api, { ...rb102Booking('TC-032-d+1'), bookingdates: { checkin: '2047-05-21', checkout: '2047-05-26' } });
      api.step('1. GET /booking?checkin=2047-05-20', '200, MSG-10; có P2, không có P1');
      const r = await api.send('GET', '/booking?checkin=2047-05-20', { headers: ACCEPT_JSON });
      softExpect(r.status, '200').toBe(200);
      softExpect(r.headers['content-type'], 'Content-Type MSG-10').toBe(MSG.jsonType);
      softExpect(listIds(r).includes(p2), 'có P2 (checkin D+1)').toBe(true);
      softExpect(listIds(r).includes(p1), 'không có P1 (checkin D-1)').toBe(false);
    });
  });

  test('TC-033 Lọc checkin=D trả cả booking có checkin bằng đúng D (≥)', { tag: ['@AC-3', '@get-list', '@BUG-47'] }, async ({ api }) => {
    let p = 0;
    let r: ApiResult | undefined;
    await guarded(api, async () => {
      p = await createOwn(api, { ...rb102Booking('TC-033-d'), bookingdates: { checkin: '2047-05-20', checkout: '2047-05-25' } });
      api.step('1. GET /booking?checkin=2047-05-20', '200, MSG-10, mảng [{bookingid}]; có P (checkin = D)');
      r = await api.send('GET', '/booking?checkin=2047-05-20', { headers: ACCEPT_JSON });
    });
    const res = r as ApiResult;
    softExpect(res.status, '200').toBe(200);
    softExpect(res.headers['content-type'], 'Content-Type MSG-10').toBe(MSG.jsonType);
    softExpect(isIdList(res), 'body là mảng [{bookingid}]').toBe(true);
    hardGate();
    test.fail(true, "BUG-47: lọc checkin so sánh '>' nên loại booking có checkin bằng đúng ngày lọc");
    softExpect(listIds(res).includes(p), 'có P (checkin = D thỏa ≥)').toBe(true);
  });

  test('TC-034 Lọc checkout=D trả booking có checkout bằng đúng D', { tag: ['@AC-3', '@get-list'] }, async ({ api }) => {
    await guarded(api, async () => {
      const p = await createOwn(api, { ...rb102Booking('TC-034-d'), bookingdates: { checkin: '2047-08-15', checkout: '2047-08-20' } });
      api.step('1. GET /booking?checkout=2047-08-20', '200, MSG-10; có P');
      const r = await api.send('GET', '/booking?checkout=2047-08-20', { headers: ACCEPT_JSON });
      softExpect(r.status, '200').toBe(200);
      softExpect(r.headers['content-type'], 'Content-Type MSG-10').toBe(MSG.jsonType);
      softExpect(listIds(r).includes(p), 'có P (checkout = D)').toBe(true);
    });
  });

  test('TC-035 Lọc checkout=D: có booking checkout D+1, không có booking checkout D-1 (≥)', { tag: ['@AC-3', '@get-list', '@BUG-46'] }, async ({ api }) => {
    let q1 = 0;
    let q2 = 0;
    let r: ApiResult | undefined;
    await guarded(api, async () => {
      q1 = await createOwn(api, { ...rb102Booking('TC-035-d-1'), bookingdates: { checkin: '2047-08-14', checkout: '2047-08-19' } });
      q2 = await createOwn(api, { ...rb102Booking('TC-035-d+1'), bookingdates: { checkin: '2047-08-16', checkout: '2047-08-21' } });
      api.step('1. GET /booking?checkout=2047-08-20', '200, MSG-10, mảng [{bookingid}]; có Q2, không có Q1');
      r = await api.send('GET', '/booking?checkout=2047-08-20', { headers: ACCEPT_JSON });
    });
    const res = r as ApiResult;
    softExpect(res.status, '200').toBe(200);
    softExpect(res.headers['content-type'], 'Content-Type MSG-10').toBe(MSG.jsonType);
    softExpect(isIdList(res), 'body là mảng [{bookingid}]').toBe(true);
    hardGate();
    test.fail(true, 'BUG-46: lọc checkout đảo chiều (≤ thay vì ≥)');
    softExpect(listIds(res).includes(q2), 'có Q2 (checkout D+1)').toBe(true);
    softExpect(listIds(res).includes(q1), 'không có Q1 (checkout D-1)').toBe(false);
  });

  test("TC-036 Lọc kết hợp tên + ngày và checkin + checkout là điều kiện 'và'", { tag: ['@AC-3', '@get-list'] }, async ({ api }) => {
    await guarded(api, async () => {
      const p = await createOwn(api, { ...rb102Booking('TC-036'), bookingdates: { checkin: '2048-03-10', checkout: '2048-03-20' } });
      const steps: [string, string, (ids: unknown[], json: unknown) => void][] = [
        ['1. firstname=<run>&lastname=TC-036&checkin=2048-03-09', `firstname=${enc(RUN)}&lastname=TC-036&checkin=2048-03-09`, (_i, j) => softExpect(j, 'Bước 1: đúng [{"bookingid": P}]').toEqual([{ bookingid: p }])],
        ['2. lastname=TC-036&checkin=2048-03-11', 'lastname=TC-036&checkin=2048-03-11', (i) => softExpect(i.includes(p), 'Bước 2: không có P (tên khớp, ngày không khớp)').toBe(false)],
        ['3. checkin=2048-03-09&checkout=2048-03-20', 'checkin=2048-03-09&checkout=2048-03-20', (i) => softExpect(i.includes(p), 'Bước 3: có P').toBe(true)],
        ['4. checkin=2048-03-11&checkout=2048-03-20', 'checkin=2048-03-11&checkout=2048-03-20', (i) => softExpect(i.includes(p), 'Bước 4: không có P (checkout khớp, checkin không khớp)').toBe(false)],
      ];
      for (const [label, query, check] of steps) {
        api.step(label, query);
        const r = await api.send('GET', `/booking?${query}`, { headers: ACCEPT_JSON });
        softExpect(r.status, `${label}: 200`).toBe(200);
        check(listIds(r), r.json);
      }
    });
  });

  test('TC-037 Giá trị lọc sai (ngày sai định dạng, DD/MM/YYYY, lặp tham số): 400, không 5xx', { tag: ['@AC-3', '@get-list', '@BUG-48'] }, async ({ api }) => {
    const out: { label: string; r: ApiResult }[] = [];
    for (const query of ['checkin=abc', 'checkin=2040-13-45', 'checkout=abc', 'checkin=08/03/2040', 'firstname=a&firstname=b']) {
      const label = `GET /booking?${query}`;
      api.step(label, '400, không 5xx, không 200');
      const r = await api.send('GET', `/booking?${query}`, { headers: ACCEPT_JSON });
      note(api, label, r);
      out.push({ label, r });
    }
    out.forEach((o) => softNoLeak(o.label, o.r));
    hardGate();
    test.fail(true, 'BUG-48: tham số lọc sai trả 500 hoặc 200 thay vì 400');
    for (const o of out) {
      softExpect(o.r.status, `${o.label}: HTTP 400 (không 200)`).toBe(400);
      softNo5xx(o.label, o.r);
    }
  });

  test('TC-038 Tham số lọc dạng object / mảng / toán tử: 400, không trả toàn bộ danh sách', { tag: ['@AC-3', '@security', '@get-list', '@BUG-48'] }, async ({ api }) => {
    const out: { label: string; r: ApiResult }[] = [];
    // brackets sent verbatim on the URL (TD-24)
    const queries = [
      'firstname[$ne]=x',
      `firstname[$eq]=${enc(`${RUN}-khong-ton-tai`)}`,
      'lastname[$gt]=zzzz',
      'checkin[$gt]=2046-01-01',
      'checkout[$lt]=2046-01-01',
      'firstname[]=a',
      'firstname[$regex]=.*',
    ];
    for (const query of queries) {
      const label = `GET /booking?${query}`;
      api.step(label, '400, không 5xx; không 200 kèm mảng khác rỗng');
      const r = await api.send('GET', `/booking?${query}`, { headers: ACCEPT_JSON });
      test.info().annotations.push({ type: 'phản hồi', description: `${label}: ${r.status}, ${Array.isArray(r.json) ? `mảng ${(r.json as unknown[]).length} phần tử` : `"${r.text.slice(0, 60)}"`}` });
      out.push({ label, r });
    }
    out.forEach((o) => softCommon(o.label, o.r));
    hardGate();
    test.fail(true, 'BUG-48: tham số dạng object / toán tử bị bỏ âm thầm, trả toàn bộ danh sách');
    for (const o of out) {
      softExpect(o.r.status, `${o.label}: HTTP 400`).toBe(400);
      const n = Array.isArray(o.r.json) ? (o.r.json as unknown[]).length : 0;
      softExpect(o.r.status === 200 && n > 0, `${o.label}: không 200 kèm mảng khác rỗng (bộ lọc không được bỏ âm thầm); thực tế ${o.r.status}, ${n} phần tử`).toBe(false);
    }
  });

  test('TC-039 GET /booking với Accept application/xml vẫn trả JSON', { tag: ['@AC-8', '@get-list'] }, async ({ api }) => {
    await guarded(api, async () => {
      const x = await createOwn(api, rb102Booking('TC-039'));
      api.step('1. GET /booking?firstname=<run>&lastname=TC-039, Accept: application/xml', '200, MSG-10, JSON [{"bookingid": X}]');
      const r = await api.send('GET', `/booking?firstname=${enc(RUN)}&lastname=TC-039`, { headers: { Accept: 'application/xml' } });
      softExpect(r.status, '200').toBe(200);
      softExpect(r.headers['content-type'], 'Content-Type MSG-10').toBe(MSG.jsonType);
      softExpect(r.json, 'body JSON đúng [{"bookingid": X}]').toEqual([{ bookingid: x }]);
    });
  });
});

// =====================================================================================================================
test.describe('Endpoint 4: PUT /booking/:id', () => {
  test('TC-040 PUT hợp lệ (Cookie token) thay toàn bộ booking, GET thấy đúng 7 giá trị mới', { tag: ['@AC-4', '@AC-7', '@smoke', '@put', '@get-id'] }, async ({ api }) => {
    const put = rb102Put('TC-040 Trần');
    await guarded(api, async () => {
      const x = await createOwn(api, rb102Booking('TC-040'));
      await snapshot(api, x, '1. GET /booking/X kiểm chủ sở hữu (L17)');
      const token = await api.freshToken();
      ledger(api, put);
      api.step('2. PUT /booking/X (Cookie token, TD-04)', '200, MSG-10, đúng 6 khóa, 7 giá trị TD-04');
      const p = await api.send('PUT', `/booking/${x}`, { json: put, headers: { ...JSON_HDR, ...cookie(token) } });
      guardToken(p.status, '2. PUT', x);
      softExpect(p.status, 'Bước 3: 200').toBe(200);
      softExpect(p.headers['content-type'], 'Bước 3: Content-Type MSG-10').toBe(MSG.jsonType);
      softExpect(p.json, 'Bước 3: body đúng 6 khóa, 7 giá trị TD-04').toStrictEqual(put);
      const g = await readOwn(api, x, '4. GET /booking/X');
      softExpect(g.status, 'Bước 4: 200').toBe(200);
      softExpect(g.json, 'Bước 4: 7 giá trị đúng TD-04').toStrictEqual(put);
    });
  });

  test('TC-041 PUT thiếu trường bắt buộc, body {} hoặc totalprice null: 400, booking giữ nguyên', { tag: ['@AC-4', '@put', '@get-id'] }, async ({ api }) => {
    budget(30);
    const base = rb102Put('TC-041-moi');
    const drop = (path: string[]) => {
      const b = JSON.parse(JSON.stringify(base)) as Obj;
      if (path.length === 1) delete b[path[0]];
      else delete (b[path[0]] as Obj)[path[1]];
      return b;
    };
    const bodies: [string, unknown][] = [
      ...(['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates'] as const).map((f): [string, unknown] => [`bỏ ${f}`, drop([f])]),
      ['bỏ bookingdates.checkin', drop(['bookingdates', 'checkin'])],
      ['bỏ bookingdates.checkout', drop(['bookingdates', 'checkout'])],
      ['body {}', {}],
      ['totalprice null', { ...base, totalprice: null }],
    ];
    let out: WriteOutcome[] = [];
    await guarded(api, async () => {
      const x = await createOwn(api, rb102Booking('TC-041'));
      const snap = await snapshot(api, x, '1. GET /booking/X lưu mốc (TD-27)');
      out = (
        await writeVariants(
          api,
          snap,
          rb102Booking('TC-041'),
          bodies.map(([label, body]) => ({
            label: `PUT ${label}`,
            body,
            note: '400, MSG-11, Bad Request; GET giống hệt mốc',
            send: (id: number, token: string) => api.send('PUT', `/booking/${id}`, { json: body, headers: { ...JSON_HDR, ...cookie(token) } }),
          })),
        )
      ).outcomes;
    });
    for (const o of out) {
      softExpect(o.res.status, `${o.label}: 400`).toBe(400);
      softExpect(o.res.headers['content-type'], `${o.label}: Content-Type MSG-11`).toBe(MSG.textType);
      softExpect(o.res.text, `${o.label}: body Bad Request (MSG-04)`).toBe(MSG.badRequest);
      softSame(o);
    }
  });

  test('TC-042 PUT không gửi additionalneeds thì xóa giá trị cũ', { tag: ['@AC-4', '@put', '@get-id', '@BUG-53'] }, async ({ api }) => {
    const put = omit(rb102Put('TC-042-moi'), 'additionalneeds') as Obj;
    let p: ApiResult | undefined;
    let g: ApiResult | undefined;
    await guarded(api, async () => {
      const x = await createOwn(api, rb102Booking('TC-042'));
      const snap = await snapshot(api, x, '1. GET /booking/X kiểm chủ sở hữu');
      expect(snap.json.additionalneeds, "Bước 1: additionalneeds = 'Breakfast'").toBe('Breakfast');
      const token = await api.freshToken();
      ledger(api, put);
      api.step('2. PUT /booking/X, body TD-04 bỏ additionalneeds', '200; additionalneeds không còn giá trị; 6 giá trị còn lại đúng TD-04');
      p = await api.send('PUT', `/booking/${x}`, { json: put, headers: { ...JSON_HDR, ...cookie(token) } });
      guardToken(p.status, '2. PUT', x);
      g = await readOwn(api, x, '4. GET /booking/X');
    });
    const res = p as ApiResult;
    const read = g as ApiResult;
    softExpect(res.status, 'Bước 3: 200').toBe(200);
    softExpect(read.status, 'Bước 4: 200').toBe(200);
    softExpect(omit(res.json, 'additionalneeds'), 'Bước 3: 6 giá trị còn lại đúng TD-04').toStrictEqual(put);
    softExpect(omit(read.json, 'additionalneeds'), 'Bước 4: 6 giá trị còn lại đúng TD-04').toStrictEqual(put);
    hardGate();
    test.fail(true, 'BUG-53: PUT bỏ additionalneeds vẫn giữ giá trị cũ');
    softExpect(noAdditionalNeeds(res.json), "Bước 3: additionalneeds không có giá trị (không còn 'Breakfast')").toBe(true);
    softExpect(noAdditionalNeeds(read.json), "Bước 4: additionalneeds không có giá trị (không còn 'Breakfast')").toBe(true);
  });

  test('TC-043 PUT 2 lần cùng body cho kết quả như 1 lần', { tag: ['@AC-4', '@put', '@get-id'] }, async ({ api }) => {
    const put = rb102Put('TC-043-moi');
    await guarded(api, async () => {
      const x = await createOwn(api, rb102Booking('TC-043'));
      await snapshot(api, x, 'GET /booking/X kiểm chủ sở hữu (L17)');
      const token = await api.freshToken();
      ledger(api, put);
      const res: ApiResult[] = [];
      for (const n of [1, 2]) {
        api.step(`${n}. PUT /booking/X (TD-04)`, '200, 7 giá trị TD-04');
        const p = await api.send('PUT', `/booking/${x}`, { json: put, headers: { ...JSON_HDR, ...cookie(token) } });
        guardToken(p.status, `${n}. PUT`, x);
        softExpect(p.status, `Bước ${n}: 200`).toBe(200);
        softExpect(p.json, `Bước ${n}: 7 giá trị đúng TD-04`).toStrictEqual(put);
        res.push(p);
      }
      softExpect(res[1].text, 'Bước 1, 2: 2 body giống hệt nhau').toBe(res[0].text);
      const g = await readOwn(api, x, '3. GET /booking/X');
      softExpect(g.status, 'Bước 3: 200').toBe(200);
      softExpect(g.json, 'Bước 3: 7 giá trị đúng TD-04').toStrictEqual(put);
    });
  });

  /** TC-044 → TC-046: PUT variants that must be refused (400), booking identical to the baseline. */
  const putRefused = async (api: RbApi, tc: string, variants: [string, unknown][]) => {
    let out: WriteOutcome[] = [];
    await guarded(api, async () => {
      const x = await createOwn(api, rb102Booking(tc));
      const snap = await snapshot(api, x, '1. GET /booking/X lưu mốc (TD-27)');
      out = (
        await writeVariants(
          api,
          snap,
          rb102Booking(tc),
          variants.map(([label, body]) => ({
            label: `PUT ${label}`,
            body,
            send: (id: number, token: string) => api.send('PUT', `/booking/${id}`, { json: body, headers: { ...JSON_HDR, ...cookie(token) } }),
          })),
        )
      ).outcomes;
    });
    return out;
  };

  test('TC-044 PUT totalprice sai kiểu (chuỗi chữ, chuỗi số, boolean): 400, booking giữ nguyên', { tag: ['@AC-4', '@put', '@get-id', '@BUG-43'] }, async ({ api }) => {
    budget(25);
    const out = await putRefused(api, 'TC-044', (['abc', '150', true] as unknown[]).map((v): [string, unknown] => [`totalprice ${JSON.stringify(v)}`, { ...rb102Put('TC-044-moi'), totalprice: v }]));
    out.forEach((o) => softCommon(o.label, o.res));
    hardGate();
    test.fail(true, 'BUG-43: PUT totalprice sai kiểu vẫn 200, lưu null / 150');
    for (const o of out) {
      softExpect(o.res.status, `${o.label}: 400`).toBe(400);
      softSame(o);
    }
  });

  test('TC-045 PUT depositpaid không phải boolean ("false", 0): 400, booking giữ nguyên', { tag: ['@AC-4', '@put', '@get-id', '@BUG-42'] }, async ({ api }) => {
    budget(20);
    const out = await putRefused(api, 'TC-045', (['false', 0] as unknown[]).map((v): [string, unknown] => [`depositpaid ${JSON.stringify(v)}`, { ...rb102Put('TC-045-moi'), depositpaid: v }]));
    out.forEach((o) => softCommon(o.label, o.res));
    hardGate();
    test.fail(true, 'BUG-42: PUT depositpaid không phải boolean vẫn 200, "false" lưu true');
    for (const o of out) {
      softExpect(o.res.status, `${o.label}: 400`).toBe(400);
      softSame(o);
    }
  });

  test('TC-046 PUT checkout trước hoặc bằng checkin: 400, booking giữ nguyên', { tag: ['@AC-4', '@put', '@get-id', '@BUG-56'] }, async ({ api }) => {
    budget(20);
    const out = await putRefused(api, 'TC-046', [
      ['checkout trước checkin (2032-02-05 → 2032-02-01)', { ...rb102Put('TC-046-moi'), bookingdates: { checkin: '2032-02-05', checkout: '2032-02-01' } }],
      ['checkout bằng checkin (2032-02-01 → 2032-02-01)', { ...rb102Put('TC-046-moi'), bookingdates: { checkin: '2032-02-01', checkout: '2032-02-01' } }],
    ]);
    out.forEach((o) => softCommon(o.label, o.res));
    hardGate();
    test.fail(true, 'BUG-56: PUT checkout trước / bằng checkin vẫn 200');
    for (const o of out) {
      softExpect(o.res.status, `${o.label}: 400`).toBe(400);
      softSame(o);
    }
  });
});

// =====================================================================================================================
test.describe('Endpoint 5: PATCH /booking/:id', () => {
  test('TC-047 PATCH một trường cấp 1 chỉ đổi trường đó, 6 giá trị còn lại giữ nguyên', { tag: ['@AC-5', '@smoke', '@patch', '@get-id'] }, async ({ api }) => {
    budget(20);
    const steps: Obj[] = [{ firstname: `${RUN}-patch` }, { totalprice: 200 }, { depositpaid: true }, { additionalneeds: 'Lunch' }];
    await guarded(api, async () => {
      const x = await createOwn(api, rb102Booking('TC-047'));
      await snapshot(api, x, 'GET /booking/X kiểm chủ sở hữu (L17)');
      const token = await api.freshToken();
      let state: Obj = { ...rb102Booking('TC-047') };
      for (const [i, patch] of steps.entries()) {
        const label = `${i + 1}. PATCH ${JSON.stringify(patch)}`;
        ledger(api, patch);
        api.step(label, '200, MSG-10; trường gửi có giá trị mới, 6 giá trị còn lại giữ như trước bước');
        const p = await api.send('PATCH', `/booking/${x}`, { json: patch, headers: { ...JSON_HDR, ...cookie(token) } });
        guardToken(p.status, label, x);
        const expected = { ...state, ...patch };
        softExpect(p.status, `${label}: 200`).toBe(200);
        softExpect(p.headers['content-type'], `${label}: Content-Type MSG-10`).toBe(MSG.jsonType);
        softExpect(p.json, `${label}: body trả về: trường gửi mới, 6 giá trị còn lại như trước bước`).toStrictEqual(expected);
        const g = await readOwn(api, x, `${label}: GET /booking/X`);
        softExpect(g.json, `${label}: GET: trường gửi mới, 6 giá trị còn lại như trước bước`).toStrictEqual(expected);
        state = expected;
      }
    });
  });

  test('TC-048 PATCH một trường con của bookingdates giữ nguyên trường con còn lại', { tag: ['@AC-5', '@patch', '@get-id', '@BUG-45'] }, async ({ api }) => {
    budget(20);
    type Row = { label: string; sent: 'checkin' | 'checkout'; other: 'checkin' | 'checkout'; value: string; p: ApiResult; g: ApiResult };
    let rows: Row[] = [];
    await guarded(api, async () => {
      rows = [];
      const x1 = await createOwn(api, rb102Booking('TC-048-checkin'), 'Chuẩn bị: X1 (lastname TC-048-checkin)');
      const x2 = await createOwn(api, rb102Booking('TC-048-checkout'), 'Chuẩn bị: X2 (lastname TC-048-checkout)');
      await snapshot(api, x1, 'GET X1 kiểm chủ sở hữu');
      await snapshot(api, x2, 'GET X2 kiểm chủ sở hữu');
      const token = await api.freshToken();
      for (const [id, sent, other, value] of [
        [x1, 'checkin', 'checkout', '2031-01-11'],
        [x2, 'checkout', 'checkin', '2031-01-20'],
      ] as const) {
        const label = `PATCH {"bookingdates": {"${sent}": "${value}"}}`;
        api.step(label, `200; ${sent} mới, ${other} giữ nguyên`);
        const p = await api.send('PATCH', `/booking/${id}`, { json: { bookingdates: { [sent]: value } }, headers: { ...JSON_HDR, ...cookie(token) } });
        guardToken(p.status, label, id);
        const g = await readOwn(api, id, `${label}: GET`);
        rows.push({ label, sent, other, value, p, g });
      }
    });
    const td03 = rb102Booking('x').bookingdates;
    for (const r of rows) {
      softExpect(r.p.status, `${r.label}: 200`).toBe(200);
      for (const [where, b] of [['body trả về', r.p.json], ['GET', r.g.json]] as const) {
        const d = (isObj(b) ? b.bookingdates : undefined) as Obj | undefined;
        softExpect(d?.[r.sent], `${r.label}: ${where}: ${r.sent} mới '${r.value}'`).toBe(r.value);
        const lastname = r.sent === 'checkin' ? 'TC-048-checkin' : 'TC-048-checkout';
        softExpect(omit(b, 'bookingdates'), `${r.label}: ${where}: 5 giá trị còn lại đúng TD-03`).toStrictEqual(omit(rb102Booking(lastname), 'bookingdates'));
      }
    }
    hardGate();
    test.fail(true, 'BUG-45: PATCH một trường con của bookingdates làm trường con kia thành 0NaN-aN-aN');
    for (const r of rows)
      for (const [where, b] of [['body trả về', r.p.json], ['GET', r.g.json]] as const) {
        const d = (isObj(b) ? b.bookingdates : undefined) as Obj | undefined;
        softExpect(d?.[r.other], `${r.label}: ${where}: ${r.other} giữ nguyên '${td03[r.other]}' (không phải ${MSG.nanDate})`).toBe(td03[r.other]);
      }
  });

  test('TC-049 PATCH {} và PATCH chỉ có trường lạ: 200, booking không đổi', { tag: ['@AC-5', '@patch', '@get-id'] }, async ({ api }) => {
    const body = rb102Booking('TC-049');
    await guarded(api, async () => {
      const x = await createOwn(api, body);
      const snap = await snapshot(api, x, '1. GET /booking/X lưu mốc (TD-27)');
      const token = await api.freshToken();
      for (const [label, patch] of [
        ['2. PATCH {}', {}],
        ['3. PATCH {"roomnumber": 101}', { roomnumber: 101 }],
      ] as const) {
        api.step(label, '200; body 7 giá trị TD-03, không có roomnumber; GET giống hệt mốc');
        const p = await api.send('PATCH', `/booking/${x}`, { json: patch, headers: { ...JSON_HDR, ...cookie(token) } });
        guardToken(p.status, label, x);
        softExpect(p.status, `${label}: 200`).toBe(200);
        softExpect(p.json, `${label}: body 7 giá trị TD-03, không có khóa roomnumber`).toStrictEqual(body);
        const g = await readOwn(api, x, `${label}: GET`);
        softExpect(g.status === 200 && g.text === snap.text, `${label}: GET 200 và body giống hệt mốc (TD-27)`).toBe(true);
      }
    });
  });

  /** TC-050 → TC-053: PATCH variants that must be refused (400), booking identical to the baseline. */
  const patchRefused = async (api: RbApi, recreate: Booking, variants: [string, Obj][], then?: (snap: Snap) => Promise<void>) => {
    let out: WriteOutcome[] = [];
    await guarded(api, async () => {
      const x = await createOwn(api, recreate);
      const s0 = await snapshot(api, x, '1. GET /booking/X lưu mốc (TD-27)');
      const r = await writeVariants(
        api,
        s0,
        recreate,
        variants.map(([label, body]) => ({
          label: `PATCH ${label}`,
          body,
          send: (id: number, token: string) => api.send('PATCH', `/booking/${id}`, { json: body, headers: { ...JSON_HDR, ...cookie(token) } }),
        })),
        { restoreLast: !!then },
      );
      out = r.outcomes;
      // a later step on the restored booking (TC-050 step 3) runs inside the same reset guard
      if (then) await then(r.snap);
    });
    return { out };
  };

  test('TC-050 PATCH totalprice: sai kiểu / null / 3 chữ số lẻ → 400; 2 chữ số lẻ (10.75) lưu đúng', { tag: ['@AC-5', '@patch', '@get-id', '@BUG-43'] }, async ({ api }) => {
    budget(40);
    // baseline totalprice 275 (not 150): the coerced "150" must differ from the baseline, else "booking unchanged" cannot tell accepted from refused (L15, review D4)
    const td03 = { ...rb102Booking('TC-050'), totalprice: 275 };
    let p: ApiResult | undefined;
    let g: ApiResult | undefined;
    const { out } = await patchRefused(
      api,
      td03,
      (['abc', '150', true, null, 0.005] as unknown[]).map((v): [string, Obj] => [`{"totalprice": ${JSON.stringify(v)}}`, { totalprice: v }]),
      async (snap) => {
        const token = await api.freshToken();
        api.step('3. PATCH {"totalprice": 10.75} (hợp lệ)', '200; totalprice 10.75 ở body và GET; 6 giá trị còn lại đúng TD-03');
        p = await api.send('PATCH', `/booking/${snap.id}`, { json: { totalprice: 10.75 }, headers: { ...JSON_HDR, ...cookie(token) } });
        guardToken(p.status, '3. PATCH 10.75', snap.id);
        g = await readOwn(api, snap.id, '3. GET /booking/X');
      },
    );
    const res = p as ApiResult;
    const read = g as ApiResult;
    softExpect(res.status, 'Bước 3: 200').toBe(200);
    softExpect(omit(res.json, 'totalprice'), 'Bước 3: body: 6 giá trị còn lại đúng TD-03').toStrictEqual(omit(td03, 'totalprice'));
    softExpect(omit(read.json, 'totalprice'), 'Bước 3: GET: 6 giá trị còn lại đúng TD-03').toStrictEqual(omit(td03, 'totalprice'));
    out.forEach((o) => softCommon(o.label, o.res));
    hardGate();
    test.fail(true, 'BUG-43: PATCH totalprice sai kiểu / null / 0.005 vẫn 200; 10.75 bị cắt thành 10');
    for (const o of out) {
      softExpect(o.res.status, `${o.label}: 400`).toBe(400);
      softSame(o);
    }
    softExpect((res.json as Obj | undefined)?.totalprice, 'Bước 3: body: totalprice đúng 10.75 (không phải 10)').toBe(10.75);
    softExpect((read.json as Obj | undefined)?.totalprice, 'Bước 3: GET: totalprice đúng 10.75 (không phải 10)').toBe(10.75);
  });

  test('TC-051 PATCH depositpaid không phải boolean ("false", 0): 400, booking giữ nguyên', { tag: ['@AC-5', '@patch', '@get-id', '@BUG-42'] }, async ({ api }) => {
    budget(30);
    // each variant gets a baseline its coerced value differs from (L15, review D4): "false" → true on a false booking,
    // 0 → false on a true booking
    const one = (v: unknown): [string, Obj][] => [[`{"depositpaid": ${JSON.stringify(v)}}`, { depositpaid: v }]];
    const a = await patchRefused(api, rb102Booking('TC-051'), one('false'));
    const b = await patchRefused(api, { ...rb102Booking('TC-051-true'), depositpaid: true }, one(0));
    const out = [...a.out, ...b.out];
    out.forEach((o) => softCommon(o.label, o.res));
    hardGate();
    test.fail(true, 'BUG-42: PATCH depositpaid "false" vẫn 200 và lưu true');
    for (const o of out) {
      softExpect(o.res.status, `${o.label}: 400`).toBe(400);
      softSame(o);
    }
  });

  test('TC-052 PATCH ngày không hợp lệ: 400, booking giữ nguyên, không lưu 0NaN-aN-aN', { tag: ['@AC-5', '@patch', '@get-id', '@BUG-44'] }, async ({ api }) => {
    budget(25);
    // both sub-fields sent to keep BUG-45 out (TD-10)
    const { out } = await patchRefused(
      api,
      rb102Booking('TC-052'),
      [
        { checkin: 'abc', checkout: '2031-01-12' },
        { checkin: '2031-02-30', checkout: '2031-03-05' },
        { checkin: '2031-01-10', checkout: '10000-01-01' },
      ].map((d): [string, Obj] => [`{"bookingdates": ${JSON.stringify(d)}}`, { bookingdates: d }]),
    );
    out.forEach((o) => softCommon(o.label, o.res));
    hardGate();
    test.fail(true, 'BUG-44: PATCH ngày không hợp lệ vẫn 200, lưu 0NaN-aN-aN / ngày cuộn');
    const bad = [MSG.nanDate, '2031-03-02', '0000-01-01'];
    for (const o of out) {
      softExpect(o.res.status, `${o.label}: 400`).toBe(400);
      softSame(o);
      softExpect(bad.filter((b) => o.after.text.includes(b)), `${o.label}: GET không có ngày hỏng / cuộn (${bad.join(', ')})`).toEqual([]);
    }
  });

  test('TC-053 PATCH firstname / lastname thành null, rỗng, chỉ khoảng trắng: 400, booking giữ nguyên', { tag: ['@AC-5', '@patch', '@get-id', '@BUG-55'] }, async ({ api }) => {
    budget(25);
    // additionalneeds carries the run name: the owner is still known when the names are broken (TD-02)
    const { out } = await patchRefused(api, { ...rb102Booking('TC-053'), additionalneeds: `${RUN}-TC-053` }, [
      ['{"firstname": null}', { firstname: null }],
      ['{"lastname": ""}', { lastname: '' }],
      ['{"firstname": "   "}', { firstname: '   ' }],
    ]);
    out.forEach((o) => softCommon(o.label, o.res));
    hardGate();
    test.fail(true, 'BUG-55: PATCH tên thành null / rỗng / khoảng trắng vẫn 200 và được lưu');
    for (const o of out) {
      softExpect(o.res.status, `${o.label}: 400`).toBe(400);
      softSame(o);
    }
  });
});

// =====================================================================================================================
test.describe('Endpoint 6: DELETE /booking/:id', () => {
  test("TC-054 DELETE hợp lệ (Cookie) trả 201 'Created', sau đó booking không còn và không sống lại", { tag: ['@AC-6', '@smoke', '@delete', '@get-id'] }, async ({ api }) => {
    budget(25);
    await guarded(api, async () => {
      const x = await createOwn(api, rb102Booking('TC-054'));
      await snapshot(api, x, '1. GET /booking/X kiểm chủ sở hữu (L17)');
      const token = await api.freshToken();
      api.step('2. DELETE /booking/X (Cookie token)', `201, ${MSG.textType}, body Created (MSG-03)`);
      const d = await api.send('DELETE', `/booking/${x}`, { headers: cookie(token) });
      guardToken(d.status, '2. DELETE', x);
      softExpect(d.status, 'Bước 2: 201').toBe(201);
      softExpect(d.headers['content-type'], 'Bước 2: Content-Type MSG-11').toBe(MSG.textType);
      softExpect(d.text, 'Bước 2: body Created (MSG-03)').toBe(MSG.created);
      // 404 after a successful DELETE is the ORACLE: no reset check from here on (RB-101 review D3)
      api.step('3. GET /booking/X', '404, Not Found');
      const g = await api.getBooking(x);
      softExpect(g.status, 'Bước 3: 404').toBe(404);
      softExpect(g.text, 'Bước 3: body Not Found (MSG-01)').toBe(MSG.notFound);
      api.step('4. GET /booking?firstname=<run>&lastname=TC-054', '[]');
      const f = await api.send('GET', `/booking?firstname=${enc(RUN)}&lastname=TC-054`, { headers: ACCEPT_JSON });
      softExpect(f.json, 'Bước 4: []').toEqual([]);
      api.step('5. GET /booking (không lọc)', '200, không có {"bookingid": X}');
      const all = await api.send('GET', '/booking', { headers: ACCEPT_JSON });
      softExpect(all.status, 'Bước 5: 200').toBe(200);
      softExpect(listIds(all).includes(x), 'Bước 5: không có phần tử {"bookingid": X}').toBe(false);
      const put = rb102Put('TC-054-moi');
      ledger(api, put);
      const writes: [string, string, unknown][] = [
        ['DELETE lần 2', 'DELETE', undefined],
        ['PUT TD-04 (lastname TC-054-moi)', 'PUT', put],
        ['PATCH {"totalprice": 1}', 'PATCH', { totalprice: 1 }],
      ];
      for (const [label, method, body] of writes) {
        const l = `6. ${label}`;
        api.step(l, 'Trước: GET X phải 404 (id chưa bị người khác dùng); không 2xx; GET sau vẫn 404');
        const pre = await api.getBooking(x);
        // L17: after a reset the id may belong to someone else → do NOT send the write
        expect(pre.status, `${l}: GET /booking/X ngay trước request phải 404, khác thì dừng (TD-26, L17)`).toBe(404);
        const t = await api.freshToken();
        const r = await api.send(method, `/booking/${x}`, { json: body, headers: body ? { ...JSON_HDR, ...cookie(t) } : cookie(t) });
        note(api, l, r);
        softExpect(r.status >= 200 && r.status < 300, `${l}: không trả 2xx (mã cụ thể kiểm ở TC-055); thực tế ${r.status}`).toBe(false);
        const after = await api.getBooking(x);
        softExpect(after.status, `${l}: GET /booking/X sau request vẫn 404`).toBe(404);
      }
      api.step('7. GET /booking?firstname=<run>-moi&lastname=TC-054-moi', '[] (booking không sống lại)');
      const f2 = await api.send('GET', `/booking?firstname=${enc(RUN_MOI)}&lastname=TC-054-moi`, { headers: ACCEPT_JSON });
      for (const id of listIds(f2)) if (typeof id === 'number') api.track(id, (b) => isMine(api, b), 'TC-054 PUT tạo lại');
      softExpect(f2.json, 'Bước 7: [] (booking không sống lại)').toEqual([]);
    });
  });

  test('TC-055 Sau khi xóa: DELETE lần 2, PUT, PATCH trả 404', { tag: ['@AC-6', '@delete', '@put', '@patch', '@BUG-52'] }, async ({ api }) => {
    budget(20);
    const out: { label: string; r: ApiResult }[] = [];
    await guarded(api, async () => {
      out.length = 0;
      const x = await createOwn(api, rb102Booking('TC-055'));
      await snapshot(api, x, 'Chuẩn bị: GET /booking/X kiểm chủ sở hữu (L17)');
      const t0 = await api.freshToken();
      api.step('Chuẩn bị: DELETE /booking/X', '201');
      const d = await api.send('DELETE', `/booking/${x}`, { headers: cookie(t0) });
      guardToken(d.status, 'Chuẩn bị: DELETE', x);
      expect(d.status, 'Chuẩn bị: DELETE 201').toBe(201);
      const token = await api.freshToken();
      const put = rb102Put('TC-055-moi');
      ledger(api, put);
      for (const [label, method, body] of [
        ['1. DELETE /booking/X lần 2', 'DELETE', undefined],
        ['2. PUT /booking/X (TD-04)', 'PUT', put],
        ['3. PATCH /booking/X {"totalprice": 1}', 'PATCH', { totalprice: 1 }],
      ] as const) {
        api.step(label, 'Trước: GET X phải 404; mong đợi 404 (BUG-52: đang 405)');
        const pre = await api.getBooking(x);
        expect(pre.status, `${label}: GET /booking/X ngay trước request phải 404, khác thì dừng (TD-26, L17)`).toBe(404);
        const r = await api.send(method, `/booking/${x}`, { json: body, headers: body ? { ...JSON_HDR, ...cookie(token) } : cookie(token) });
        note(api, label, r);
        out.push({ label, r });
      }
    });
    for (const o of out) {
      softExpect(o.r.status >= 200 && o.r.status < 300, `${o.label}: không trả 2xx; thực tế ${o.r.status}`).toBe(false);
      softNoLeak(o.label, o.r);
      softNo5xx(o.label, o.r); // correct today (405): before the gate, L18 (review D2)
    }
    hardGate();
    test.fail(true, 'BUG-52: id đã xóa ở DELETE / PUT / PATCH trả 405 thay vì 404');
    for (const o of out) softExpect(o.r.status, `${o.label}: 404 (không phải 405)`).toBe(404);
  });
});

// =====================================================================================================================
test.describe('Chung: nhiều endpoint', () => {
  test('TC-056 Phân vùng hợp lệ đọc lại đúng qua POST, PUT, PATCH (depositpaid true / false, giá nguyên, ngày hợp lệ)', { tag: ['@AC-1', '@AC-4', '@AC-5', '@smoke', '@post', '@put', '@patch'] }, async ({ api }) => {
    budget(25);
    await guarded(api, async () => {
      const aBody = rb102Booking('TC-056-a');
      const bBody = { ...rb102Booking('TC-056-b'), depositpaid: true, totalprice: 1 };
      const a = await createOwn(api, aBody, '1. POST A (depositpaid false, totalprice 150)');
      const b = await createOwn(api, bBody, '1. POST B (depositpaid true, totalprice 1)');
      const ga = await readOwn(api, a, '1. GET A');
      softExpect(ga.json, 'Bước 1: GET A đúng 7 giá trị').toStrictEqual(aBody);
      const gb = await readOwn(api, b, '1. GET B');
      softExpect(gb.json, 'Bước 1: GET B đúng 7 giá trị').toStrictEqual(bBody);
      expect(isMine(api, ga.json) && isMine(api, gb.json), 'Bước 1: A, B là booking của test (L17)').toBe(true);
      const token = await api.freshToken();
      const write = async (label: string, method: string, id: number, body: unknown, expected: unknown) => {
        if (method === 'PUT') ledger(api, body);
        api.step(label, '200; body và GET đúng 7 giá trị');
        const r = await api.send(method, `/booking/${id}`, { json: body, headers: { ...JSON_HDR, ...cookie(token) } });
        guardToken(r.status, label, id);
        softExpect(r.status, `${label}: 200`).toBe(200);
        softExpect(r.json, `${label}: body trả về đúng 7 giá trị`).toStrictEqual(expected);
        const g = await readOwn(api, id, `${label}: GET`);
        softExpect(g.json, `${label}: GET đúng 7 giá trị`).toStrictEqual(expected);
      };
      const aPut = rb102Put('TC-056-a');
      await write('2. PUT A (TD-04, depositpaid true)', 'PUT', a, aPut, aPut);
      await write('3. PATCH A {"depositpaid": false}', 'PATCH', a, { depositpaid: false }, { ...aPut, depositpaid: false });
      const bPut = { ...rb102Put('TC-056-b'), depositpaid: false, totalprice: 99 };
      await write('2. PUT B (TD-04, depositpaid false, totalprice 99)', 'PUT', b, bPut, bPut);
      const bPatch = { totalprice: 300, bookingdates: { checkin: '2033-05-01', checkout: '2033-05-03' } };
      await write('3. PATCH B {"totalprice": 300, "bookingdates": …}', 'PATCH', b, bPatch, { ...bPut, ...bPatch });
    });
  });

  test('TC-057 Body urlencoded (depositpaid=true) cho POST, PUT, PATCH: đọc lại đúng từng trường', { tag: ['@AC-1', '@AC-4', '@AC-5', '@AC-8', '@post', '@put', '@patch'] }, async ({ api }) => {
    budget(20);
    const postBody = { ...rb102Booking('TC-057'), depositpaid: true };
    const putBody = rb102Put('TC-057-moi');
    await guarded(api, async () => {
      api.step('1. POST /booking urlencoded (TD-20, depositpaid=true)', '200; 7 giá trị đúng TD-03 trừ depositpaid true');
      const { res, id } = await post(api, '1. POST urlencoded', { headers: FORM_HDR, data: toForm(postBody), names: [RUN] });
      expect(res.status, 'Bước 1: POST 200').toBe(200);
      softExpect(bookingOf(res), 'Bước 1: body trả về 7 giá trị đúng (totalprice number 150)').toStrictEqual(postBody);
      const x = id as number;
      const g1 = await readOwn(api, x, '1. GET /booking/X');
      softExpect(g1.json, 'Bước 1: GET 7 giá trị đúng').toStrictEqual(postBody);
      expect(isMine(api, g1.json), 'Bước 1: X là booking của test (L17)').toBe(true);
      const token = await api.freshToken();
      ledger(api, putBody);
      api.step('2. PUT /booking/X urlencoded (TD-04, depositpaid=true)', '200; 7 giá trị đúng TD-04');
      const p = await api.send('PUT', `/booking/${x}`, { data: toForm(putBody), headers: { ...FORM_HDR, ...cookie(token) } });
      guardToken(p.status, '2. PUT', x);
      softExpect(p.status, 'Bước 2: 200').toBe(200);
      softExpect(p.json, 'Bước 2: body 7 giá trị đúng TD-04').toStrictEqual(putBody);
      const g2 = await readOwn(api, x, '2. GET /booking/X');
      softExpect(g2.json, 'Bước 2: GET 7 giá trị đúng TD-04').toStrictEqual(putBody);
      api.step("3. PATCH /booking/X urlencoded 'totalprice=310'", '200; totalprice 310 (number), 6 giá trị còn lại như bước 2');
      const pa = await api.send('PATCH', `/booking/${x}`, { data: 'totalprice=310', headers: { ...FORM_HDR, ...cookie(token) } });
      guardToken(pa.status, '3. PATCH', x);
      softExpect(pa.status, 'Bước 3: 200').toBe(200);
      softExpect(pa.json, 'Bước 3: body totalprice 310, 6 giá trị như bước 2').toStrictEqual({ ...putBody, totalprice: 310 });
      const g3 = await readOwn(api, x, '3. GET /booking/X');
      softExpect(g3.json, 'Bước 3: GET totalprice 310, 6 giá trị như bước 2').toStrictEqual({ ...putBody, totalprice: 310 });
    });
  });

  test('TC-058 depositpaid false gửi bằng body urlencoded / XML phải lưu false (POST, PUT, PATCH)', { tag: ['@AC-1', '@AC-4', '@AC-5', '@AC-8', '@post', '@put', '@patch', '@BUG-42'] }, async ({ api }) => {
    budget(40);
    type Row = { label: string; res: ApiResult; resBody: unknown; g: ApiResult; expected: Obj };
    let rows: Row[] = [];
    await guarded(api, async () => {
      rows = [];
      const add = async (label: string, res: ApiResult, resBody: unknown, id: number, expected: Obj) => {
        note(api, label, res);
        rows.push({ label, res, resBody, g: await readOwn(api, id, `${label}: GET`), expected });
      };
      // setup step of variants 3, 6: put depositpaid back to true with JSON (hard: otherwise the variant shows nothing)
      const setTrue = async (id: number, token: string, label: string) => {
        api.step(label, 'PATCH JSON {"depositpaid": true}: 200, depositpaid true');
        const r = await api.send('PATCH', `/booking/${id}`, { json: { depositpaid: true }, headers: { ...JSON_HDR, ...cookie(token) } });
        guardToken(r.status, label, id);
        expect(r.status, `${label}: 200`).toBe(200);
        expect((r.json as Obj | undefined)?.depositpaid, `${label}: depositpaid true`).toBe(true);
      };

      // (1) POST urlencoded
      const v1 = { ...rb102Booking('TC-058-ue-post'), depositpaid: false };
      api.step('1. POST urlencoded depositpaid=false', '200; depositpaid false (boolean)');
      const p1 = await post(api, '1. POST urlencoded', { headers: FORM_HDR, data: toForm(v1), names: [RUN] });
      expect(p1.res.status, '1. POST 200 (cần id để đọc lại)').toBe(200);
      await add('1. POST urlencoded', p1.res, bookingOf(p1.res), p1.id as number, v1);

      // (2) PUT urlencoded, (3) PATCH urlencoded on booking U
      const u = await createOwn(api, { ...rb102Booking('TC-058-ue'), depositpaid: true }, 'Chuẩn bị: booking U (JSON, depositpaid true)');
      await snapshot(api, u, 'GET U kiểm chủ sở hữu (L17)');
      const tu = await api.freshToken();
      const v2 = { ...rb102Put('TC-058-ue-moi'), depositpaid: false };
      ledger(api, v2);
      api.step('2. PUT U urlencoded (TD-04, depositpaid=false)', '200; depositpaid false');
      const p2 = await api.send('PUT', `/booking/${u}`, { data: toForm(v2), headers: { ...FORM_HDR, ...cookie(tu) } });
      guardToken(p2.status, '2. PUT', u);
      await add('2. PUT urlencoded', p2, p2.json, u, v2);
      await setTrue(u, tu, '3. Chuẩn bị: đặt lại depositpaid true');
      api.step("3. PATCH U urlencoded 'depositpaid=false&totalprice=99'", '200; depositpaid false, totalprice 99');
      const p3 = await api.send('PATCH', `/booking/${u}`, { data: 'depositpaid=false&totalprice=99', headers: { ...FORM_HDR, ...cookie(tu) } });
      guardToken(p3.status, '3. PATCH', u);
      await add('3. PATCH urlencoded', p3, p3.json, u, { ...v2, totalprice: 99 });

      // (4) POST XML
      const v4 = { ...rb102Booking('TC-058-xml-post'), depositpaid: false };
      api.step('4. POST text/xml <depositpaid>false</depositpaid>', '200; depositpaid false');
      const p4 = await post(api, '4. POST XML', { headers: XML_HDR, data: toXml(v4), names: [RUN] });
      expect(p4.res.status, '4. POST 200 (cần id để đọc lại)').toBe(200);
      await add('4. POST XML', p4.res, bookingOf(p4.res), p4.id as number, v4);

      // (5) PATCH XML, (6) PUT XML on booking M
      const m = await createOwn(api, { ...rb102Booking('TC-058-xml'), depositpaid: true }, 'Chuẩn bị: booking M (JSON, depositpaid true)');
      await snapshot(api, m, 'GET M kiểm chủ sở hữu (L17)');
      const tm = await api.freshToken();
      api.step("5. PATCH M text/xml '<booking><depositpaid>false</depositpaid></booking>'", '200; depositpaid false');
      const p5 = await api.send('PATCH', `/booking/${m}`, { data: '<booking><depositpaid>false</depositpaid></booking>', headers: { ...XML_HDR, ...cookie(tm) } });
      guardToken(p5.status, '5. PATCH', m);
      await add('5. PATCH XML', p5, p5.json, m, { ...rb102Booking('TC-058-xml'), depositpaid: false });
      await setTrue(m, tm, '6. Chuẩn bị: đặt lại depositpaid true');
      const v6 = { ...rb102Put('TC-058-xml-moi'), depositpaid: false };
      ledger(api, v6);
      api.step('6. PUT M text/xml (TD-04, <depositpaid>false</depositpaid>)', '200; depositpaid false, 6 giá trị còn lại đúng TD-04');
      const p6 = await api.send('PUT', `/booking/${m}`, { data: toXml(v6), headers: { ...XML_HDR, ...cookie(tm) } });
      guardToken(p6.status, '6. PUT', m);
      await add('6. PUT XML', p6, p6.json, m, v6);
    });
    for (const r of rows) {
      softExpect(r.res.status, `${r.label}: 200`).toBe(200);
      softExpect(r.g.status, `${r.label}: GET 200`).toBe(200);
      softExpect(omit(r.resBody, 'depositpaid'), `${r.label}: body trả về: các trường khác đúng giá trị gửi`).toStrictEqual(omit(r.expected, 'depositpaid'));
      softExpect(omit(r.g.json, 'depositpaid'), `${r.label}: GET: các trường khác đúng giá trị gửi`).toStrictEqual(omit(r.expected, 'depositpaid'));
    }
    hardGate();
    test.fail(true, 'BUG-42: depositpaid=false (urlencoded / XML) luôn lưu true');
    for (const r of rows) {
      softExpect((r.resBody as Obj | undefined)?.depositpaid, `${r.label}: body trả về: depositpaid false (boolean)`).toBe(false);
      softExpect((r.g.json as Obj | undefined)?.depositpaid, `${r.label}: GET: depositpaid false (boolean)`).toBe(false);
    }
  });

  test('TC-059 Content-Type text/xml (body XML, depositpaid true): POST tạo, PUT / PATCH sửa, đọc lại đúng từng trường', { tag: ['@AC-8', '@AC-1', '@AC-4', '@AC-5', '@post', '@put', '@patch'] }, async ({ api }) => {
    budget(20);
    const postBody = { ...rb102Booking('TC-059'), depositpaid: true };
    const putBody = rb102Put('TC-059-moi');
    await guarded(api, async () => {
      const check = (label: string, r: ApiResult, body: unknown, expected: unknown) => {
        softExpect(r.status, `${label}: 200`).toBe(200);
        softExpect(r.headers['content-type'], `${label}: phản hồi JSON (MSG-10)`).toBe(MSG.jsonType);
        softExpect(body, `${label}: 7 giá trị đúng`).toStrictEqual(expected);
      };
      api.step('1. POST /booking text/xml (TD-19, depositpaid true)', '200 JSON; 7 giá trị đúng (totalprice number 150, depositpaid boolean true)');
      const { res, id } = await post(api, '1. POST XML', { headers: XML_HDR, data: toXml(postBody), names: [RUN] });
      expect(res.status, 'Bước 1: POST 200').toBe(200);
      check('Bước 1: POST', res, bookingOf(res), postBody);
      const x = id as number;
      const g1 = await readOwn(api, x, '1. GET /booking/X');
      check('Bước 1: GET', g1, g1.json, postBody);
      expect(isMine(api, g1.json), 'Bước 1: X là booking của test (L17)').toBe(true);
      const token = await api.freshToken();
      ledger(api, putBody);
      api.step('2. PUT /booking/X text/xml (TD-04)', '200 JSON; 7 giá trị đúng TD-04');
      const p = await api.send('PUT', `/booking/${x}`, { data: toXml(putBody), headers: { ...XML_HDR, ...cookie(token) } });
      guardToken(p.status, '2. PUT', x);
      check('Bước 2: PUT', p, p.json, putBody);
      const g2 = await readOwn(api, x, '2. GET /booking/X');
      check('Bước 2: GET', g2, g2.json, putBody);
      api.step("3. PATCH /booking/X text/xml '<booking><totalprice>310</totalprice></booking>'", '200 JSON; totalprice 310, 6 giá trị như bước 2');
      const pa = await api.send('PATCH', `/booking/${x}`, { data: '<booking><totalprice>310</totalprice></booking>', headers: { ...XML_HDR, ...cookie(token) } });
      guardToken(pa.status, '3. PATCH', x);
      check('Bước 3: PATCH', pa, pa.json, { ...putBody, totalprice: 310 });
      const g3 = await readOwn(api, x, '3. GET /booking/X');
      check('Bước 3: GET', g3, g3.json, { ...putBody, totalprice: 310 });
    });
  });

  /** TC-060, TC-061: POST (Accept xml) → GET (Accept xml) → PUT (Accept xml). Returns the 3 responses. */
  const xmlFlow = async (api: RbApi, tc: string) => {
    const xmlAccept = { 'Content-Type': 'application/json', Accept: 'application/xml' };
    let rows: { label: string; r: ApiResult }[] = [];
    await guarded(api, async () => {
      rows = [];
      api.step('1. POST /booking, Accept: application/xml (TD-03)', '200; XML <created-booking>');
      const { res, id } = await post(api, '1. POST Accept XML', { json: rb102Booking(tc), headers: xmlAccept });
      expect(res.status, 'Bước 1: POST 200').toBe(200);
      expect(Number.isInteger(id) && (id as number) > 0, 'Bước 1: đọc được <bookingid> nguyên dương').toBe(true);
      rows.push({ label: 'Bước 1: POST', r: res });
      const x = id as number;
      api.step('2. GET /booking/X, Accept: application/xml', '200; XML <booking>');
      const g = await api.send('GET', `/booking/${x}`, { headers: { Accept: 'application/xml' } });
      guardOwnBooking(g.status, '2. GET XML', x);
      rows.push({ label: 'Bước 2: GET', r: g });
      await snapshot(api, x, 'GET /booking/X kiểm chủ sở hữu (L17)');
      const token = await api.freshToken();
      const put = rb102Put(`${tc}-moi`);
      ledger(api, put);
      api.step('3. PUT /booking/X (JSON), Accept: application/xml (TD-04)', '200; XML <booking>');
      const p = await api.send('PUT', `/booking/${x}`, { json: put, headers: { ...xmlAccept, ...cookie(token) } });
      guardToken(p.status, '3. PUT', x);
      rows.push({ label: 'Bước 3: PUT', r: p });
    });
    return rows;
  };

  test('TC-060 Accept application/xml: POST, GET /booking/:id, PUT trả XML đúng dữ liệu', { tag: ['@AC-8', '@get-id', '@post', '@put'] }, async ({ api }) => {
    const rows = await xmlFlow(api, 'TC-060');
    const [p, g, u] = rows.map((x) => ({ ...x, doc: parseXml(x.r.text) }));
    for (const x of [p, g, u]) {
      softExpect(x.r.status, `${x.label}: 200`).toBe(200);
      softExpect(x.doc !== undefined, `${x.label}: body phân tích được thành XML (MSG-13)`).toBe(true);
    }
    softExpect(p.doc?.root, 'Bước 1: gốc <created-booking>').toBe('created-booking');
    const created = (p.doc && typeof p.doc.value === 'object' ? p.doc.value : {}) as { [k: string]: XVal };
    softExpect(/^[1-9]\d*$/.test(String(created.bookingid)), 'Bước 1: <bookingid> số nguyên > 0').toBe(true);
    softExpect(created.booking, "Bước 1: <booking> 7 giá trị đúng TD-03 (depositpaid 'false', totalprice '150')").toStrictEqual(xmlValues(rb102Booking('TC-060')));
    softExpect(g.doc?.root, 'Bước 2: gốc <booking>').toBe('booking');
    softExpect(g.doc?.value, 'Bước 2: 7 giá trị đúng TD-03').toStrictEqual(xmlValues(rb102Booking('TC-060')));
    softExpect(u.doc?.root, 'Bước 3: gốc <booking>').toBe('booking');
    softExpect(u.doc?.value, 'Bước 3: 7 giá trị đúng TD-04').toStrictEqual(xmlValues(rb102Put('TC-060-moi')));
  });

  test('TC-061 Phản hồi XML có Content-Type là XML (application/xml hoặc text/xml)', { tag: ['@AC-8', '@get-id', '@post', '@put', '@BUG-50'] }, async ({ api }) => {
    const rows = await xmlFlow(api, 'TC-061');
    for (const x of rows) {
      softExpect(x.r.status, `${x.label}: 200`).toBe(200);
      softExpect(parseXml(x.r.text) !== undefined, `${x.label}: body phân tích được thành XML`).toBe(true);
    }
    hardGate();
    test.fail(true, 'BUG-50: phản hồi XML có Content-Type text/html');
    for (const x of rows)
      softExpect(x.r.headers['content-type'] ?? '', `${x.label}: Content-Type bắt đầu bằng application/xml hoặc text/xml (không phải ${MSG.htmlType})`).toMatch(/^(application|text)\/xml/);
  });

  test('TC-062 Accept không hỗ trợ: POST trả 406 và không tạo booking; GET /booking/:id trả 406', { tag: ['@AC-8', '@AC-1', '@post', '@get-id', '@BUG-49'] }, async ({ api }) => {
    budget(20);
    type Row = { label: string; r: ApiResult; hidden?: number[] };
    let rows: Row[] = [];
    await guarded(api, async () => {
      rows = [];
      const x = await createOwn(api, rb102Booking('TC-062'));
      for (const [label, accept, lastname] of [
        ['1. POST Accept: text/plain', 'text/plain', 'TC-062-text-plain'],
        ['2. POST Accept: application/x-www-form-urlencoded', 'application/x-www-form-urlencoded', 'TC-062-urlencoded'],
      ]) {
        api.step(label, '406; tìm theo tên trả [] (không tạo booking ẩn)');
        const { res } = await post(api, label, { json: rb102Booking(lastname), headers: { Accept: accept } });
        note(api, label, res);
        // BUG-49 "hidden" booking: found by name, tracked → deleted in the cleanup even when the test fails (known-issues note 3)
        const hidden = await idsOf(api, `firstname=${enc(RUN)}&lastname=${enc(lastname)}`, `${label}: tìm theo tên`);
        for (const h of hidden) api.track(h, (b) => isMine(api, b), `${label} (booking ẩn)`);
        rows.push({ label, r: res, hidden });
      }
      for (const [label, accept] of [
        ['3. GET /booking/X Accept: text/plain', 'text/plain'],
        ['4. GET /booking/X Accept: application/x-www-form-urlencoded', 'application/x-www-form-urlencoded'],
      ]) {
        api.step(label, '406; body không chứa lỗi nội bộ');
        const r = await api.send('GET', `/booking/${x}`, { headers: { Accept: accept } });
        guardOwnBooking(r.status, label, x);
        note(api, label, r);
        rows.push({ label, r });
      }
    });
    rows.forEach((x) => softNo5xx(x.label, x.r));
    // step 1 + 3 (text/plain) must not leak today; step 2 + 4 (urlencoded) leak it: checked after test.fail
    for (const x of [rows[0], rows[2]]) softNoLeak(x.label, x.r);
    softExpect(rows[2].r.text.includes(MSG.formurlencodedLeak), `${rows[2].label}: body không chứa '${MSG.formurlencodedLeak}' (MSG-08)`).toBe(false);
    hardGate();
    test.fail(true, "BUG-49: Accept không hỗ trợ trả 418 / 200 lỗi nội bộ mà vẫn tạo booking");
    for (const x of rows) softExpect(x.r.status, `${x.label}: 406`).toBe(406);
    for (const x of rows.slice(0, 2)) softExpect(x.hidden, `${x.label}: tìm theo tên trả [] (không tạo booking)`).toEqual([]);
    for (const x of [rows[1], rows[3]]) softNoLeak(x.label, x.r);
    softExpect(rows[3].r.text.includes(MSG.formurlencodedLeak), `${rows[3].label}: body không chứa '${MSG.formurlencodedLeak}' (MSG-08)`).toBe(false);
  });

  test('TC-026 Không gửi Accept hoặc Accept */*: GET /booking/:id và POST /booking trả như bình thường (JSON đủ 6 trường)', { tag: ['@AC-2', '@AC-8', '@AC-1', '@post', '@get-id', '@BUG-60'] }, async ({ api }) => {
    budget(20);
    const body = rb102Booking('TC-026');
    const postBody = rb102Booking('TC-026-post');
    let r1: Sent | undefined;
    let r2: ApiResult | undefined;
    let pr: Sent | undefined;
    let hidden: number[] = [];
    await guarded(api, async () => {
      hidden = [];
      const x = await createOwn(api, body);
      api.step('1. GET /booking/X KHÔNG có header Accept (node:https, chỉ gửi đúng header khai báo)', '200, MSG-10, 7 giá trị TD-03');
      r1 = await api.sendRaw('GET', `/booking/${x}`, {}, '');
      guardOwnBooking(r1.status, '1. GET không Accept', x);
      expect(r1.sentHeaders?.accept, 'Bước 1: request thật sự không có header Accept').toBeUndefined();
      api.step('2. GET /booking/X với Accept: */*', '200, MSG-10, 7 giá trị TD-03');
      r2 = await api.send('GET', `/booking/${x}`, { headers: { Accept: '*/*' } });
      guardOwnBooking(r2.status, '2. GET Accept */*', x);
      // Step 3: the owner name goes to the ledger BEFORE the request (post → createBookingVia); the booking is created even
      // when the answer is 418 (BUG-60), so it is found by name and tracked for the cleanup (like TC-062, L17).
      api.step('3. POST /booking KHÔNG có header Accept (node:https)', '200, bookingid nguyên dương, 7 giá trị đúng');
      pr = (await post(api, '3. POST không Accept', { noContentType: true, headers: { 'Content-Type': 'application/json' }, data: JSON.stringify(postBody) })).res;
      note(api, '3. POST không Accept', pr);
      expect(pr.sentHeaders?.accept, 'Bước 3: request thật sự không có header Accept').toBeUndefined();
      hidden = await idsOf(api, `firstname=${enc(RUN)}&lastname=TC-026-post`, '3. tìm theo tên');
      for (const h of hidden) api.track(h, (b) => isMine(api, b), '3. POST không Accept (booking có thể bị tạo dù trả lỗi)');
    });
    const a = r1 as Sent;
    const b = r2 as ApiResult;
    const c = pr as Sent;
    // 1) correct today: Accept */* (step 2) works; no internal error leaks
    softExpect(b.status, 'Bước 2 (Accept */*): 200').toBe(200);
    softExpect(b.headers['content-type'], 'Bước 2 (Accept */*): Content-Type MSG-10').toBe(MSG.jsonType);
    softExpect(b.json, 'Bước 2 (Accept */*): đúng 6 khóa, bookingdates 2 khóa, 7 giá trị TD-03').toStrictEqual(body);
    softNoLeak('Bước 1 (không Accept)', a);
    softNoLeak('Bước 3 (POST không Accept)', c);
    // 2) hard gate, 3) test.fail, 4) bug part (TD-29)
    hardGate();
    test.fail(true, 'BUG-60: không gửi Accept thì GET /booking/:id trả 418 và POST /booking trả 418 mà vẫn tạo booking');
    softExpect(a.status, 'Bước 1 (không Accept): 200').toBe(200);
    softExpect(a.headers['content-type'], 'Bước 1 (không Accept): Content-Type MSG-10').toBe(MSG.jsonType);
    softExpect(a.json, 'Bước 1 (không Accept): đúng 6 khóa, bookingdates 2 khóa, 7 giá trị TD-03').toStrictEqual(body);
    softExpect(c.status, 'Bước 3 (POST không Accept): 200').toBe(200);
    softExpect(c.headers['content-type'], 'Bước 3 (POST không Accept): Content-Type MSG-10').toBe(MSG.jsonType);
    softExpect(bookingOf(c), 'Bước 3 (POST không Accept): booking đúng 7 giá trị đã gửi').toStrictEqual(postBody);
    softExpect(isObj(c.json) && Number.isInteger(c.json.bookingid), 'Bước 3 (POST không Accept): trả bookingid (client biết id của booking đã tạo)').toBe(true);
  });

  test('TC-063 Id sai định dạng có tiền tố số: GET 404; PUT, PATCH, DELETE không đụng tới booking', { tag: ['@AC-2', '@AC-4', '@AC-5', '@AC-6', '@security', '@get-id', '@put', '@patch', '@delete', '@BUG-54'] }, async ({ api }) => {
    budget(30);
    let gets: { label: string; r: ApiResult }[] = [];
    let writes: WriteOutcome[] = [];
    await guarded(api, async () => {
      gets = [];
      const x = await createOwn(api, rb102Booking('TC-063'));
      const snap = await snapshot(api, x, '1. GET /booking/X lưu mốc (TD-27)');
      for (const p of [`${x}.9`, `${x}abc`, `00${x}`, `${x}.5`]) {
        const label = `2. GET /booking/${p.replace(String(x), 'X')}`;
        api.step(label, '404, Not Found, không trả booking X');
        const r = await api.send('GET', `/booking/${p}`, { headers: ACCEPT_JSON });
        note(api, label, r);
        gets.push({ label, r });
      }
      const put = rb102Put('TC-063-moi');
      // DELETE last: it may delete X (BUG-54)
      writes = (
        await writeVariants(api, snap, rb102Booking('TC-063'), [
          { label: '3. PUT /booking/00X (TD-04)', body: put, send: (id, t) => api.send('PUT', `/booking/00${id}`, { json: put, headers: { ...JSON_HDR, ...cookie(t) } }) },
          { label: '3. PATCH /booking/Xabc {"totalprice": 999}', send: (id, t) => api.send('PATCH', `/booking/${id}abc`, { json: { totalprice: 999 }, headers: { ...JSON_HDR, ...cookie(t) } }) },
          { label: '3. DELETE /booking/X.9', send: (id, t) => api.send('DELETE', `/booking/${id}.9`, { headers: cookie(t) }) },
        ])
      ).outcomes;
    });
    for (const o of [...gets.map((g) => ({ label: g.label, res: g.r })), ...writes]) softCommon(o.label, o.res);
    hardGate();
    test.fail(true, 'BUG-54: id sai định dạng được hiểu theo phần số đầu (GET trả, PUT / PATCH sửa, DELETE xóa booking X)');
    for (const g of gets) {
      softExpect(g.r.status, `${g.label}: 404`).toBe(404);
      softExpect(g.r.text, `${g.label}: body Not Found (MSG-01), không trả booking X`).toBe(MSG.notFound);
    }
    for (const o of writes) {
      softExpect(o.res.status, `${o.label}: 404`).toBe(404);
      softSame(o);
    }
  });

  test('TC-064 PUT / PATCH có bookingid trong body bị bỏ qua: booking giữ id, booking kia không đổi', { tag: ['@AC-4', '@AC-5', '@security', '@put', '@patch', '@BUG-51'] }, async ({ api }) => {
    budget(60);
    type Row = { label: string; res: ApiResult; x: number; y: number; expectX: Obj; gx: ApiResult; gy: ApiResult; yBase: string; fx: ApiResult; fy: ApiResult };
    let rows: Row[] = [];
    const created: number[] = [];
    const lastnames: string[] = [];
    try {
      await guarded(api, async () => {
        rows = [];
        for (const kind of ['put', 'patch'] as const) {
          const lx = `TC-064-${kind}-x`;
          const ly = `TC-064-${kind}-y`;
          const lnew = `${lx}-moi`;
          lastnames.push(lx, ly, lnew);
          const x = await createOwn(api, rb102Booking(lx), `Chuẩn bị ${kind.toUpperCase()}: X (lastname ${lx})`);
          const y = await createOwn(api, rb102Booking(ly), `Chuẩn bị ${kind.toUpperCase()}: Y (lastname ${ly})`);
          created.push(x, y);
          // L17 + known-issues note 2: right before the request BOTH ids must be the test's, otherwise nothing is sent
          api.step(`${kind.toUpperCase()} 1. GET X, GET Y ngay trước request (L17)`, 'Cả hai đúng firstname <run> + lastname của biến thể; lưu mốc Y');
          const sx = await api.getBooking(x);
          guardOwnBooking(sx.status, 'GET X', x);
          const sy = await api.getBooking(y);
          guardOwnBooking(sy.status, 'GET Y', y);
          const owns = (g: ApiResult, l: string) => isObj(g.json) && g.json.firstname === RUN && g.json.lastname === l;
          expect(owns(sx, lx) && owns(sy, ly), `${kind.toUpperCase()}: X và Y đều là booking của test; không phải thì KHÔNG gửi bookingid (L17)`).toBe(true);
          const token = await api.freshToken();
          const body: Obj = kind === 'put' ? { ...rb102Booking(lnew), totalprice: 333, bookingid: y } : { lastname: lnew, bookingid: y };
          const expectX = kind === 'put' ? { ...rb102Booking(lnew), totalprice: 333 } : { ...rb102Booking(lx), lastname: lnew };
          const label = `${kind.toUpperCase()} 2. ${kind.toUpperCase()} /booking/X với "bookingid": Y`;
          api.step(label, '200, body không có bookingid; X nhận dữ liệu mới; Y giống hệt mốc');
          const res = await api.send(kind.toUpperCase(), `/booking/${x}`, { json: body, headers: { ...JSON_HDR, ...cookie(token) } });
          guardToken(res.status, label, x);
          note(api, label, res);
          // no reset guard on X: X 404 here is the BUG-51 symptom
          api.step(`${kind.toUpperCase()} 3. GET X, GET Y`, 'X: dữ liệu mới; Y: giống hệt mốc');
          const gx = await api.getBooking(x);
          const gy = await api.getBooking(y);
          // NOTE (script-gen): CSV bước 4 lọc CHỈ theo lastname (`?lastname=TC-064-put-x-moi`); thêm firstname=<run> vì
          // lastname trần trùng được booking của lần chạy khác trên máy chủ dùng chung (TD-02). Ghi trong báo cáo script-gen.
          api.step(`${kind.toUpperCase()} 4. Lọc theo tên mới của X và tên của Y`, 'firstname=<run> + lastname (tên lần chạy để không lẫn booking của lần chạy khác)');
          const fx = await api.send('GET', `/booking?firstname=${enc(RUN)}&lastname=${enc(lnew)}`, { headers: ACCEPT_JSON });
          const fy = await api.send('GET', `/booking?firstname=${enc(RUN)}&lastname=${enc(ly)}`, { headers: ACCEPT_JSON });
          for (const id of [...listIds(fx), ...listIds(fy)]) if (typeof id === 'number') api.track(id, (b) => isMine(api, b), 'TC-064 tìm theo tên');
          rows.push({ label: kind.toUpperCase(), res, x, y, expectX, gx, gy, yBase: sy.text, fx, fy });
        }
      });
    } finally {
      await cleanupDuplicates(api, created, lastnames);
    }
    rows.forEach((r) => softCommon(r.label, r.res));
    hardGate();
    test.fail(true, 'BUG-51: bookingid trong body chuyển booking sang id khác (405, X mất, Y bị ghi đè / trùng)');
    for (const r of rows) {
      softExpect(r.res.status, `${r.label}: 200`).toBe(200);
      softExpect(isObj(r.res.json) && !('bookingid' in r.res.json), `${r.label}: body trả về là booking, không có khóa bookingid`).toBe(true);
      softExpect(r.gx.status, `${r.label}: GET X 200 (X giữ id)`).toBe(200);
      softExpect(r.gx.json, `${r.label}: GET X có dữ liệu mới`).toStrictEqual(r.expectX);
      softExpect(r.gy.status === 200 && r.gy.text === r.yBase, `${r.label}: GET Y 200 và giống hệt mốc Y`).toBe(true);
      softExpect(r.fx.json, `${r.label}: lọc tên mới của X → đúng [{"bookingid": X}]`).toEqual([{ bookingid: r.x }]);
      softExpect(r.fy.json, `${r.label}: lọc tên của Y → đúng [{"bookingid": Y}]`).toEqual([{ bookingid: r.y }]);
    }
  });

  test('TC-065 PUT / PATCH / DELETE id không tồn tại (lớn, 0, âm, chữ) với quyền hợp lệ: 404', { tag: ['@AC-4', '@AC-5', '@AC-6', '@put', '@patch', '@delete', '@BUG-52'] }, async ({ api }) => {
    budget(25);
    const out: { label: string; r: ApiResult }[] = [];
    const put = rb102Put('TC-065-moi');
    ledger(api, put);
    let token = '';
    for (const id of ['999999999', '0', '-1', 'abc']) {
      api.step(`GET /booking/${id}`, 'Phải 404 trước khi gửi request ghi (L17); khác 404 thì bỏ id này');
      const g = await api.send('GET', `/booking/${id}`, { headers: ACCEPT_JSON });
      if (g.status !== 404) {
        test.info().annotations.push({ type: 'bỏ biến thể', description: `/booking/${id}: GET ${g.status} (id có thể đã có thật), không gửi PUT / PATCH / DELETE (L17)` });
        continue;
      }
      token ||= await api.freshToken();
      for (const [method, body] of [
        ['PUT', put],
        ['PATCH', { totalprice: 1 }],
        ['DELETE', undefined],
      ] as const) {
        const label = `${method} /booking/${id}`;
        api.step(label, '404 (BUG-52: đang 405)');
        const r = await api.send(method, `/booking/${id}`, { json: body, headers: body ? { ...JSON_HDR, ...cookie(token) } : cookie(token) });
        note(api, label, r);
        out.push({ label, r });
      }
    }
    api.step('5. GET /booking?firstname=<run>-moi&lastname=TC-065-moi', '[] (PUT không tạo booking mới)');
    const f = await api.send('GET', `/booking?firstname=${enc(RUN_MOI)}&lastname=TC-065-moi`, { headers: ACCEPT_JSON });
    for (const id of listIds(f)) if (typeof id === 'number') api.track(id, (b) => isMine(api, b), 'TC-065 PUT tạo mới');
    for (const o of out) {
      softExpect(o.r.status >= 200 && o.r.status < 300, `${o.label}: không trả 2xx; thực tế ${o.r.status}`).toBe(false);
      softNoLeak(o.label, o.r);
      softNo5xx(o.label, o.r); // correct today (405): before the gate, L18 (review D2)
    }
    softExpect(f.json, 'Bước 5: [] (không tạo booking)').toEqual([]);
    hardGate();
    test.fail(true, 'BUG-52: id không tồn tại ở PUT / PATCH / DELETE trả 405 thay vì 404');
    for (const o of out) softExpect(o.r.status, `${o.label}: 404`).toBe(404);
  });

  test('TC-066 Không có / sai thông tin xác thực cơ bản (4 kiểu × PUT, PATCH, DELETE): 403 và booking giữ nguyên', { tag: ['@AC-7', '@security', '@put', '@patch', '@delete'] }, async ({ api }) => {
    budget(30);
    const wrongBasic = BASIC(rbAdmin.username, `${rbAdmin.password}x`);
    api.addSecret(wrongBasic.slice(6));
    const rows = await rejectMatrix(api, 'TC-066', async (): Promise<AuthKind[]> => [
      { label: 'v01 không có thông tin xác thực', headers: {} },
      { label: 'v02 Cookie: token=wrongtoken123', headers: { Cookie: 'token=wrongtoken123' } },
      { label: 'v03 Cookie: token= (rỗng)', headers: { Cookie: 'token=' } },
      { label: 'v14 Authorization: Basic sai mật khẩu', headers: { Authorization: wrongBasic } },
    ]);
    checkRejectMatrix(rows, true);
  });

  test('TC-067 Ma trận 12 kiểu xác thực bị từ chối (abc123, token thừa / thiếu 1 ký tự, Bearer…) × PUT, PATCH, DELETE: 403, booking giữ nguyên', { tag: ['@AC-7', '@security', '@full', '@put', '@patch', '@delete'] }, async ({ api }) => {
    budget(65);
    const capUser = rbAdmin.username.charAt(0).toUpperCase() + rbAdmin.username.slice(1);
    const capBasic = BASIC(capUser, rbAdmin.password);
    api.addSecret(capBasic.slice(6));
    const rows = await rejectMatrix(api, 'TC-067', async () => {
      // token used to build the variants (TD-05); v10 only means something when the token has letters (max 3 tokens)
      let token = await api.freshToken();
      for (let i = 1; i < 3 && !/[a-z]/i.test(token); i++) token = await api.freshToken();
      const kinds: AuthKind[] = [
        { label: 'v05 Cookie: TOKEN=<token> (tên cookie viết hoa)', headers: { Cookie: `TOKEN=${token}` } },
        { label: 'v08 Cookie: <token> (không có tên)', headers: { Cookie: token } },
      ];
      if (/[a-z]/i.test(token)) kinds.push({ label: 'v10 token viết hoa', headers: cookie(api.derived(token, (t) => t.toUpperCase())) });
      else test.info().annotations.push({ type: 'bỏ biến thể', description: 'v10: 3 token liên tiếp không có chữ cái, viết hoa không đổi gì (TC-067 notes)' });
      kinds.push(
        { label: 'v11 token thiếu ký tự cuối', headers: cookie(api.derived(token, (t) => t.slice(0, -1))) },
        { label: 'v12 Authorization: Bearer <token>', headers: { Authorization: `Bearer ${token}` } },
        { label: 'v15 Authorization: Basic !!!notbase64', headers: { Authorization: 'Basic !!!notbase64' } },
      );
      if (capUser !== rbAdmin.username) kinds.push({ label: 'v17 Basic, tên đăng nhập viết hoa chữ đầu', headers: { Authorization: capBasic } });
      else test.info().annotations.push({ type: 'bỏ biến thể', description: 'v17: tên đăng nhập đã viết hoa chữ đầu, biến thể trùng Basic đúng' });
      kinds.push(
        { label: 'v18 ?token=<token> trên URL', headers: {}, query: `?token=${token}` },
        { label: 'v19 header token: <token>', headers: { token } },
        { label: "v21 'Authorization: Basic ' (rỗng)", headers: { Authorization: 'Basic ' } },
        { label: 'v23 Cookie: token=abc123', headers: { Cookie: 'token=abc123' } },
        { label: "v24 token thừa 1 ký tự 'x'", headers: cookie(api.derived(token, (t) => `${t}x`)) },
      );
      return kinds;
    });
    checkRejectMatrix(rows, false);
  });

  test('TC-068 Kiểu xác thực hợp lệ khác cookie token thường (cookie kèm cookie khác, nháy kép, Basic) × PUT, PATCH, DELETE: được chấp nhận', { tag: ['@AC-7', '@AC-4', '@AC-5', '@AC-6', '@security', '@put', '@patch', '@delete'] }, async ({ api }) => {
    budget(50);
    const basic = BASIC(rbAdmin.username, rbAdmin.password);
    api.addSecret(basic.slice(6));
    const kinds: { code: string; label: string; headers: (t: string) => Record<string, string>; needsToken: boolean }[] = [
      { code: 'v06', label: 'v06 Cookie: token=<token>; foo=bar', headers: (t) => ({ Cookie: `token=${t}; foo=bar` }), needsToken: true },
      { code: 'v07', label: 'v07 Cookie: foo=bar; token=<token>', headers: (t) => ({ Cookie: `foo=bar; token=${t}` }), needsToken: true },
      { code: 'v09', label: 'v09 Cookie: token="<token>" (nháy kép)', headers: (t) => ({ Cookie: `token="${t}"` }), needsToken: true },
      { code: 'v13', label: 'v13 Authorization: Basic đúng (ghép từ biến môi trường)', headers: () => ({ Authorization: basic }), needsToken: false },
    ];
    type Row = { label: string; put: Obj; p: ApiResult; gp: ApiResult; patched: Obj; pa: ApiResult; gpa: ApiResult; d: ApiResult; gd: ApiResult };
    let rows: Row[] = [];
    await guarded(api, async () => {
      rows = [];
      const a = await createOwn(api, rb102Booking('TC-068'), 'Chuẩn bị: booking A (lastname TC-068) cho PUT / PATCH');
      const ds: number[] = [];
      for (const k of kinds) ds.push(await createOwn(api, rb102Booking(`TC-068-del-${k.code}`), `Chuẩn bị: booking D (lastname TC-068-del-${k.code}) cho DELETE`));
      await snapshot(api, a, 'GET A kiểm chủ sở hữu (L17)');
      for (const [i, k] of kinds.entries()) {
        const auth = k.headers(k.needsToken ? await api.freshToken() : '');
        const put = rb102Put(`TC-068-${k.code}`);
        ledger(api, put);
        api.step(`${k.label}: PUT A`, '200, body và GET có 7 giá trị đúng body gửi');
        const p = await api.send('PUT', `/booking/${a}`, { json: put, headers: { ...JSON_HDR, ...auth } });
        guardToken(p.status, `${k.label}: PUT`, a);
        const gp = await readOwn(api, a, `${k.label}: GET A sau PUT`);
        const patched = { ...put, totalprice: 400 + i + 1 };
        api.step(`${k.label}: PATCH A {"totalprice": ${400 + i + 1}}`, '200, totalprice mới, 6 giá trị còn lại giữ');
        const pa = await api.send('PATCH', `/booking/${a}`, { json: { totalprice: 400 + i + 1 }, headers: { ...JSON_HDR, ...auth } });
        guardToken(pa.status, `${k.label}: PATCH`, a);
        const gpa = await readOwn(api, a, `${k.label}: GET A sau PATCH`);
        await snapshot(api, ds[i], `${k.label}: GET D kiểm chủ sở hữu (L17)`);
        api.step(`${k.label}: DELETE D`, '201 Created; GET D sau đó 404');
        const d = await api.send('DELETE', `/booking/${ds[i]}`, { headers: auth });
        guardToken(d.status, `${k.label}: DELETE`, ds[i]);
        // 404 after a successful DELETE is the oracle: no reset guard
        const gd = await api.getBooking(ds[i]);
        rows.push({ label: k.label, put, p, gp, patched, pa, gpa, d, gd });
      }
    });
    for (const r of rows) {
      softExpect(r.p.status, `${r.label}: PUT 200`).toBe(200);
      softExpect(r.p.json, `${r.label}: PUT body 7 giá trị đúng body gửi`).toStrictEqual(r.put);
      softExpect(r.gp.json, `${r.label}: GET sau PUT 7 giá trị đúng body gửi`).toStrictEqual(r.put);
      softExpect(r.pa.status, `${r.label}: PATCH 200`).toBe(200);
      softExpect(r.pa.json, `${r.label}: PATCH body totalprice mới, 6 giá trị còn lại giữ`).toStrictEqual(r.patched);
      softExpect(r.gpa.json, `${r.label}: GET sau PATCH totalprice mới, 6 giá trị còn lại giữ`).toStrictEqual(r.patched);
      softExpect(r.d.status, `${r.label}: DELETE 201`).toBe(201);
      softExpect(r.d.text, `${r.label}: DELETE body Created (MSG-03)`).toBe(MSG.created);
      softExpect(r.gd.status, `${r.label}: GET D sau DELETE 404`).toBe(404);
    }
  });

  test('TC-069 Phương thức không hỗ trợ trên /booking và /booking/:id: 4xx, không tạo / sửa / xóa booking', { tag: ['@AC-1', '@AC-6', '@get-list', '@get-id'] }, async ({ api }) => {
    budget(25);
    // NOTE (script-gen): lastname of the PUT / POST variants carries the run name (`QA-RB102-<RUN>-TC-069-put`), not the
    // bare `TC-069-put` of the CSV: step 4 filters by lastname ONLY, and a bare lastname also matches bookings of other
    // runs on the shared server (TD-02 rule for names that must identify the run; recorded in the script-gen report).
    const putLast = `${RUN}-TC-069-put`;
    const postLast = `${RUN}-TC-069-post`;
    let out: WriteOutcome[] = [];
    let filters: { label: string; ids: number[] }[] = [];
    await guarded(api, async () => {
      filters = [];
      const x = await createOwn(api, rb102Booking('TC-069'));
      const snap = await snapshot(api, x, '1. GET /booking/X lưu mốc (TD-27)');
      const put = rb102Put(putLast);
      // no credentials at all (TD-25): a regression like "delete everything" cannot touch other people's data
      out = (
        await writeVariants(
          api,
          snap,
          rb102Booking('TC-069'),
          [
            { label: '2. DELETE /booking', send: () => api.send('DELETE', '/booking') },
            { label: '2. PUT /booking (TD-04)', body: put, send: () => api.send('PUT', '/booking', { json: put, headers: JSON_HDR }) },
            { label: '2. PATCH /booking {"totalprice": 1}', send: () => api.send('PATCH', '/booking', { json: { totalprice: 1 }, headers: JSON_HDR }) },
            {
              label: '2. POST /booking/X (TD-03)',
              send: async (id) => (await post(api, '2. POST /booking/X', { path: `/booking/${id}`, json: rb102Booking(postLast) })).res,
            },
          ],
          { tokenless: true },
        )
      ).outcomes;
      for (const [label, last] of [
        ['4. GET /booking?lastname=<run>-TC-069-put', putLast],
        ['4. GET /booking?lastname=<run>-TC-069-post', postLast],
      ]) {
        api.step(label, '[]');
        const ids = await idsOf(api, `lastname=${enc(last)}`, label);
        for (const id of ids) api.track(id, (b) => isMine(api, b), `${label} (tạo ngoài ý muốn)`);
        filters.push({ label, ids });
      }
    });
    for (const o of out) {
      softExpect(o.res.status, `${o.label}: không phải 403 (route có thể tồn tại, chỉ bị chặn bởi quyền: kiểm tay bằng booking của mình)`).not.toBe(RB_REJECT.status);
      softExpect([404, 405].includes(o.res.status), `${o.label}: 404 hoặc 405 (không 2xx); thực tế ${o.res.status}`).toBe(true);
      softCommon(o.label, o.res);
      softSame(o);
    }
    for (const f of filters) softExpect(f.ids, `${f.label}: []`).toEqual([]);
  });
});

// ---------------- helpers used by TC-064, TC-066, TC-067 ----------------

/**
 * TC-064 cleanup (BUG-51: one id may hold several records): for each id GET → exact owner → DELETE, repeated until
 * GET 404 (max 5 per id); then search by every lastname used (with the run firstname) and delete what is left.
 * Never throws: the result goes to an annotation (the fixture cleanup still runs after).
 */
async function cleanupDuplicates(api: RbApi, ids: number[], lastnames: string[]) {
  const notes: string[] = [];
  let token = '';
  const drain = async (id: number) => {
    for (let i = 0; i < 5; i++) {
      const g = await api.getBooking(id);
      if (g.status === 404) return notes.push(`#${id}: hết (sau ${i} lần xóa)`);
      if (g.status !== 200 || !isMine(api, g.json)) return notes.push(`#${id}: GET ${g.status}, không phải booking của test, không xóa`);
      token ||= await api.freshToken();
      const d = await api.send('DELETE', `/booking/${id}`, { headers: cookie(token) });
      if (d.status !== 201) return notes.push(`#${id}: DELETE ${d.status}`);
    }
    return notes.push(`#${id}: còn sau 5 lần xóa`);
  };
  try {
    api.step('Dọn dẹp BUG-51 (lưu ý 2)', 'Mỗi id: GET → đúng chủ sở hữu → DELETE, lặp tới 404 (tối đa 5); rồi tìm theo lastname, xóa bản sót');
    for (const id of ids) await drain(id);
    for (const l of lastnames) {
      const f = await api.send('GET', `/booking?firstname=${enc(RUN)}&lastname=${enc(l)}`, { headers: ACCEPT_JSON });
      for (const id of listIds(f)) if (typeof id === 'number') await drain(id);
    }
  } catch (e) {
    notes.push(`lỗi khi dọn: ${(e as Error).message.split('\n')[0]}`);
  }
  test.info().annotations.push({ type: 'cleanup BUG-51', description: notes.join(' · ') });
}

type AuthKind = { label: string; headers: Record<string, string>; query?: string };
type RejectRow = { label: string; method: string; r: ApiResult };
type RejectKindRow = { label: string; calls: RejectRow[]; after: ApiResult; same: boolean };

/**
 * TC-066, TC-067 (TD-07): for each kind send PUT (TD-04), PATCH {"totalprice": 999}, DELETE on the test's booking X,
 * then GET X and compare with the baseline (byte-identical). Refused correctly → no restore, the GET is also the owner
 * check before the next kind. X 404 while all 3 were 403 → reset check (TD-26); changed / deleted by an accepted
 * request → restore / recreate (TD-27). Results are asserted AFTER, outside the reset guard.
 */
async function rejectMatrix(api: RbApi, tc: string, buildKinds: () => Promise<AuthKind[]>): Promise<RejectKindRow[]> {
  let rows: RejectKindRow[] = [];
  await guarded(api, async () => {
    rows = [];
    const recreate = rb102Booking(tc);
    const x = await createOwn(api, recreate);
    let state = await snapshot(api, x, '1. GET /booking/X lưu mốc (TD-27)');
    const kinds = await buildKinds();
    const put = rb102Put(`${tc}-moi`);
    ledger(api, put);
    for (const [i, k] of kinds.entries()) {
      const calls: RejectRow[] = [];
      for (const [method, body] of [
        ['PUT', put],
        ['PATCH', { totalprice: 999 }],
        ['DELETE', undefined],
      ] as const) {
        const label = `${k.label}: ${method}`;
        api.step(label, `${RB_REJECT.status} ${RB_REJECT.body}`);
        const r = await api.send(method, `/booking/${state.id}${k.query ?? ''}`, { json: body, headers: body ? { ...JSON_HDR, ...k.headers } : k.headers });
        note(api, label, r);
        calls.push({ label, method, r });
      }
      const after = await api.getBooking(state.id);
      if (after.status === 404 && calls.every((c) => c.r.status === RB_REJECT.status))
        throw new ResetSuspect(`${k.label}: cả 3 request bị từ chối mà booking của test trả 404`, state.id);
      const same = after.status === 200 && after.text === state.text;
      rows.push({ label: k.label, calls, after, same });
      if (!same && i < kinds.length - 1) state = await restore(api, state, after, recreate, `${k.label}: khôi phục mốc`);
    }
  });
  return rows;
}

function checkRejectMatrix(rows: RejectKindRow[], checkType: boolean) {
  for (const k of rows) {
    for (const c of k.calls) {
      softExpect(c.r.status, `${c.label}: ${RB_REJECT.status}`).toBe(RB_REJECT.status);
      if (checkType) softExpect(c.r.headers['content-type'], `${c.label}: Content-Type MSG-11`).toBe(MSG.textType);
      softExpect(c.r.text, `${c.label}: body ${RB_REJECT.body} (MSG-02)`).toBe(RB_REJECT.body);
    }
    softExpect(k.same, `${k.label}: GET /booking/X 200 và body giống hệt mốc (TD-27); thực tế GET ${k.after.status}`).toBe(true);
  }
}
