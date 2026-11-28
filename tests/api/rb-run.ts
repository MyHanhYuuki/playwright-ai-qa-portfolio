import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { TestInfo } from '@playwright/test';
import { RB_BAD_LOGIN_BUDGET, RB_RESET_PROBE, RB_REJECT } from '../data/restful-booker';
import type { RbApi } from './rb-client';

/** Heroku 503, sleeping dyno, network error: an ENVIRONMENT error, not a bug (TD-26 point 5). */
export class EnvError extends Error {
  name = 'EnvError';
}

export type LedgerEntry = { tc: string; firstname: string; lastname: string; names: string[]; at: string; id: number | null };
type Ledger = { feature: string; run: string; entries: LedgerEntry[] };
type Stats = { run: string; requests: number; failedLogins: number; failedLoginsByTc: Record<string, number> };

// ---------------- daily bad-login budget (TD-27, review B1) ----------------
// The per-run counter lives in test-results/ (wiped every run), so the "30 per day" rule needs a counter OUTSIDE it:
// a small file in the OS temp dir keyed by the UTC date. RB_BAD_LOGIN_RESET=1 = the user explicitly allows more
// (the check is skipped and the counter keeps counting).
const utcDay = () => new Date().toISOString().slice(0, 10).replace(/-/g, '');
const dailyFile = () => path.join(os.tmpdir(), `rb-bad-login-${utcDay()}.json`);
const dailyOverride = () => process.env.RB_BAD_LOGIN_RESET === '1';
function dailyFailedLogins(): number {
  try {
    return (JSON.parse(fs.readFileSync(dailyFile(), 'utf8')) as { failedLogins?: number }).failedLogins ?? 0;
  } catch {
    return 0;
  }
}
function addDailyFailedLogin() {
  fs.writeFileSync(dailyFile(), JSON.stringify({ day: utcDay(), failedLogins: dailyFailedLogins() + 1 }));
}

/**
 * Files of ONE run in test-results/ (ignored by git, emptied by Playwright at the start of the next run):
 *   <code>-ledger-<run>.json  every booking the run tried to create (owner written BEFORE the request, id after)
 *   <code>-stats-<run>.json   requests sent + failed logins of the run (TD-27 budget)
 * Tests of a project run in ONE worker (workers: 1), so a plain read-modify-write is safe.
 */
export class RunState {
  constructor(
    readonly dir: string,
    readonly code: string,
    readonly run: string,
  ) {
    fs.mkdirSync(dir, { recursive: true });
  }

  /** Every run ledger in `dir` (test-results/ only holds the current run's files). */
  static ledgerFiles(dir: string) {
    return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^[a-z0-9]+-ledger-.+\.json$/.test(f)).map((f) => path.join(dir, f)) : [];
  }

  private file(kind: 'ledger' | 'stats') {
    return path.join(this.dir, `${this.code}-${kind}-${this.run}.json`);
  }
  private read<T>(kind: 'ledger' | 'stats', init: T): T {
    const f = this.file(kind);
    return fs.existsSync(f) ? (JSON.parse(fs.readFileSync(f, 'utf8')) as T) : init;
  }
  private write(kind: 'ledger' | 'stats', v: unknown) {
    fs.writeFileSync(this.file(kind), JSON.stringify(v, null, 2));
  }

  /** Write the owner of a booking BEFORE the create request is sent. Returns the entry index. */
  ledgerIntent(e: Omit<LedgerEntry, 'at' | 'id'>): number {
    const l = this.read<Ledger>('ledger', { feature: this.code, run: this.run, entries: [] });
    l.entries.push({ ...e, at: new Date().toISOString(), id: null });
    this.write('ledger', l);
    return l.entries.length - 1;
  }
  ledgerId(index: number, id: number) {
    const l = this.read<Ledger>('ledger', { feature: this.code, run: this.run, entries: [] });
    if (l.entries[index]) l.entries[index].id = id;
    this.write('ledger', l);
  }

  stats(): Stats {
    return this.read<Stats>('stats', { run: this.run, requests: 0, failedLogins: 0, failedLoginsByTc: {} });
  }
  addRequest() {
    const s = this.stats();
    s.requests++;
    this.write('stats', s);
  }
  addFailedLogin(tc: string) {
    addDailyFailedLogin();
    const s = this.stats();
    s.failedLogins++;
    s.failedLoginsByTc[tc] = (s.failedLoginsByTc[tc] ?? 0) + 1;
    this.write('stats', s);
  }
  /** Refuse a deliberate bad login once the run has used its budget (≤ 30, TD-27). */
  assertBadLoginBudget() {
    const day = dailyFailedLogins();
    if (!dailyOverride() && day >= RB_BAD_LOGIN_BUDGET)
      throw new Error(
        `Hết ngân sách đăng nhập thất bại của NGÀY (${day}/${RB_BAD_LOGIN_BUDGET} lần, ngày UTC ${utcDay()}, TD-27): không gửi thêm. Chỉ khi người dùng đồng ý mở lại: đặt biến môi trường RB_BAD_LOGIN_RESET=1 (bộ đếm: file rb-bad-login-${utcDay()}.json trong thư mục tạm của hệ điều hành; không in đường dẫn đầy đủ để khỏi lộ đường dẫn máy vào kết quả chạy)`,
      );
    const used = this.stats().failedLogins;
    if (used >= RB_BAD_LOGIN_BUDGET)
      throw new Error(`Hết ngân sách đăng nhập thất bại của lần chạy (${used}/${RB_BAD_LOGIN_BUDGET}, TD-27): không gửi thêm`);
  }
}

// ---------------- reset detection (TD-26 points 2-3) ----------------

/**
 * A 403 / 404 the test did NOT expect: a token-using step got 403, or the test's own booking (not deleted yet) got 404.
 * Thrown by guardToken / guardOwnBooking, handled by withResetGuard. A 404 AFTER a successful DELETE is an oracle:
 * never guard it.
 */
export class ResetSuspect extends Error {
  name = 'ResetSuspect';
  readonly at = new Date();
  constructor(
    readonly what: string,
    readonly bookingId: number,
  ) {
    super(`${what} (booking ${bookingId})`);
  }
}

/** A step that used a just-issued token was rejected with the "bad token" status. */
export function guardToken(status: number, what: string, bookingId: number) {
  if (status === RB_REJECT.status) throw new ResetSuspect(`${what} bị ${status} với token vừa cấp`, bookingId);
}
/** GET of the test's own booking (not deleted by the test) returned 404. */
export function guardOwnBooking(status: number, what: string, bookingId: number) {
  if (status === 404) throw new ResetSuspect(`${what}: booking của test trả 404 khi test chưa xóa`, bookingId);
}

/** Signal (c): x0:50 → x1:30 UTC (the API resets at minute x1, O-21). */
export function inResetWindow(d: Date) {
  const m = d.getUTCMinutes() % 10;
  const s = d.getUTCSeconds();
  return (m === 0 && s >= 50) || (m === 1 && s <= 30);
}

/** Check the 3 signals of an API reset. All requests go through `api` (counted, masked). */
export async function resetSignals(api: RbApi, s: ResetSuspect) {
  const own = await api.getBooking(s.bookingId);
  const a = own.status === 404;
  const token = await api.freshToken();
  const probe = await api.send('PATCH', RB_RESET_PROBE.path, {
    json: RB_RESET_PROBE.body,
    headers: { Accept: 'application/json', Cookie: `token=${token}` },
  });
  // (b) a NEW token is not refused: only "not 403" (405 today is RB-102 BUG-52; 404 after the fix)
  const b = probe.status !== RB_REJECT.status && probe.status !== 0;
  const c = inResetWindow(s.at);
  return { a, b, c, all: a && b && c, detail: `(a) GET booking ${own.status} · (b) token mới PATCH ${RB_RESET_PROBE.path} ${probe.status} · (c) ${s.at.toISOString().slice(11, 19)} UTC ${c ? 'trong' : 'ngoài'} cửa sổ x0:50 → x1:30` };
}

/**
 * Run the body; on a ResetSuspect check the 3 signals. All 3 → annotate `env-reset` and redo the WHOLE body once
 * (new booking + new token). Missing signal, or a 2nd reset in the same test → the test fails like a real error.
 */
export async function withResetGuard(api: RbApi, info: TestInfo, body: (attempt: number) => Promise<void>) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await body(attempt);
    } catch (e) {
      if (!(e instanceof ResetSuspect)) throw e;
      api.step('Kiểm 3 dấu hiệu reset (TD-26)', `Sau: ${e.what}`);
      const sig = await resetSignals(api, e);
      if (!sig.all) throw new Error(`${e.message}. Không đủ 3 dấu hiệu reset (TD-26), xử lý như lỗi thật: ${sig.detail}`);
      if (attempt >= 2) throw new Error(`${e.message}. Reset lần 2 trong cùng test (TD-26): fail. ${sig.detail}`);
      info.annotations.push({ type: 'env-reset', description: `${e.at.toISOString()}: ${e.what}. ${sig.detail}. Làm lại phần chuẩn bị 1 lần` });
      api.step(`Làm lại sau env-reset (lần ${attempt + 1})`);
    }
  }
}

// ---------------- cleanup (TD-26 point 4) ----------------

/**
 * Delete the bookings this test created. GET first and DELETE only when the owner matches EXACTLY (L17: after a reset
 * the id may belong to someone else). Accepts 403 / 404 (reset). Never throws: the result goes to an annotation.
 * `maxDeletes` > 1 repeats while GET still finds an owned booking (RB-102 BUG-51: duplicate records under one id).
 */
export async function cleanupTracked(api: RbApi, maxDeletes = 1): Promise<string[]> {
  const notes: string[] = [];
  // One token for the whole pass (review D1); refreshed only when a DELETE answers 403 (token expired / reset)
  let token: string | undefined;
  for (const t of api.tracked) {
    try {
      let done = false;
      let retried = false;
      for (let i = 0; i < maxDeletes && !done; i++) {
        const g = await api.getBooking(t.id);
        if (g.status === 404) {
          notes.push(`#${t.id}: không còn (GET 404)`);
          done = true;
        } else if (g.status !== 200) {
          notes.push(`#${t.id}: GET ${g.status}, không xóa`);
          done = true;
        } else if (typeof g.json !== 'object' || g.json === null || Array.isArray(g.json) || !t.isOwner(g.json as Record<string, unknown>)) {
          notes.push(`#${t.id}: không phải booking của test (${t.label}), không xóa`);
          done = true;
        } else {
          const reused = token !== undefined;
          token ??= await api.freshToken();
          const d = await api.send('DELETE', `/booking/${t.id}`, { headers: { Cookie: `token=${token}` } });
          if (d.status === 403 && reused && !retried) {
            // the pass token may be stale (expired / reset): new token, and GET + owner check AGAIN before deleting (L17, review N3)
            token = undefined;
            retried = true;
            i--;
            notes.push(`#${t.id}: DELETE 403 với token dùng chung của lượt dọn, lấy token mới và kiểm lại chủ sở hữu`);
            continue;
          }
          notes.push(`#${t.id}: DELETE ${d.status}${[201, 403, 404].includes(d.status) ? '' : ' (bất thường)'}`);
          if (d.status !== 201) done = true;
        }
      }
    } catch (e) {
      notes.push(`#${t.id}: lỗi khi dọn (${(e as Error).message.split('\n')[0]})`);
    }
  }
  return notes;
}
