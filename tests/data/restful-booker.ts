/**
 * Restful Booker API: data shared by RB-101 (restful-booker-auth-api) and RB-102 (restful-booker-booking-api).
 * Credentials: tests/data/users.ts (rbAdmin). Messages of RB-101: tests/data/messages.ts (MSG_RB_AUTH).
 */

/** Base URL (HITL #2 item 4). Point it to a local Restful Booker (Bài 11) to run without the public server. */
export const RB_BASE_URL = (process.env.RB_BASE_URL || 'https://restful-booker.herokuapp.com').replace(/\/+$/, '');

/**
 * Rejection of a wrong / missing token on PUT / PATCH / DELETE /booking/:id.
 * ONE shared contract for RB-101 (TD-25, MSG-03) and RB-102 (TD-07, MSG-02): HITL #1, RB-102 Q4.
 * 401 + WWW-Authenticate is an improvement, not the expected result. Never hard-code 403 in a test: read it here.
 */
export const RB_REJECT = { status: 403, body: 'Forbidden', mediaType: 'text/plain' } as const;

/**
 * Start of THIS run (UTC), the same value in every worker.
 * playwright.config.ts sets RB_RUN_AT / RB_RUN_NONCE once in the main process; workers inherit the env
 * (a worker restarted after a failure keeps the same run id, so the ledger and the cleanup stay consistent).
 */
const runAt = new Date(process.env.RB_RUN_AT || Date.now());
const runNonce = process.env.RB_RUN_NONCE || 'xxxx';
const p2 = (n: number) => String(n).padStart(2, '0');
const ymd = `${runAt.getUTCFullYear()}${p2(runAt.getUTCMonth() + 1)}${p2(runAt.getUTCDate())}`;
const hms = `${p2(runAt.getUTCHours())}${p2(runAt.getUTCMinutes())}${p2(runAt.getUTCSeconds())}`;

export const RB_RUN = {
  at: runAt,
  /** RB-101 TD-17: `yyyyMMdd-HHmmss` (UTC) */
  rb101: `${ymd}-${hms}`,
  /** RB-102 TD-02: `YYMMDDHHmmss-xxxx` (UTC + 4 random chars) */
  rb102: `${ymd.slice(2)}${hms}-${runNonce}`,
} as const;

/** Failed POST /auth allowed per run (RB-101 TD-27, HITL #1 Q12). */
export const RB_BAD_LOGIN_BUDGET = 30;

/** Booking id that never exists: signal (b) of the reset check (TD-26). Only "not 403" is asserted (405 today = BUG-52). */
export const RB_RESET_PROBE = { path: '/booking/999999999', body: { totalprice: 1 } } as const;

/** RB-101 TD-17: run-scoped firstname. lastname = TC id. */
export const RB101_FIRSTNAME = `QA-RB101-${RB_RUN.rb101}`;

export type Booking = {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string };
  additionalneeds?: string;
};

/** RB-101 TD-18: booking created for AC-3 (chosen to avoid the known RB-102 bugs, L16). */
export const rb101Booking = (tc: string): Booking => ({
  firstname: RB101_FIRSTNAME,
  lastname: tc,
  totalprice: 101,
  depositpaid: true,
  bookingdates: { checkin: '2031-05-01', checkout: '2031-05-03' },
  additionalneeds: 'Breakfast',
});

/** RB-101 TD-19: PUT body (full replacement, firstname / lastname unchanged so the owner check still works). */
export const rb101Put = (tc: string): Booking => ({
  firstname: RB101_FIRSTNAME,
  lastname: tc,
  totalprice: 202,
  depositpaid: false,
  bookingdates: { checkin: '2031-06-10', checkout: '2031-06-12' },
  additionalneeds: 'Late checkout',
});

/** RB-101 TD-20: PATCH body (2 top-level fields, no bookingdates: BUG-45). */
export const RB101_PATCH = { totalprice: 303, additionalneeds: 'Dinner' } as const;

/** Booking after TD-20 applied to TD-18. */
export const rb101Patched = (tc: string): Booking => ({ ...rb101Booking(tc), ...RB101_PATCH });

// ---------------- RB-102 (restful-booker-booking-api) ----------------

/**
 * RB-102 TD-02: run-scoped firstname `QA-RB102-<RUN>`. Owner checks compare it EXACTLY (L17), never as a prefix.
 * Every name a test sends that carries it (variants `-moi`, `-patch`, `-khac`, lastname / additionalneeds of variants
 * that lose the firstname) is written to the run ledger before the request (TD-26 point 1).
 */
export const RB102_FIRSTNAME = `QA-RB102-${RB_RUN.rb102}`;

/** RB-102 TD-03: standard POST booking. depositpaid false so a coercion to true shows up. */
export const rb102Booking = (lastname: string): Booking => ({
  firstname: RB102_FIRSTNAME,
  lastname,
  totalprice: 150,
  depositpaid: false,
  bookingdates: { checkin: '2031-01-10', checkout: '2031-01-12' },
  additionalneeds: 'Breakfast',
});

/** RB-102 TD-04: PUT body, differs from TD-03 in ALL 7 values (lastname usually `<TC>-moi`). */
export const rb102Put = (lastname: string): Booking => ({
  firstname: `${RB102_FIRSTNAME}-moi`,
  lastname,
  totalprice: 275,
  depositpaid: true,
  bookingdates: { checkin: '2032-02-01', checkout: '2032-02-05' },
  additionalneeds: 'Ăn sáng chay',
});
