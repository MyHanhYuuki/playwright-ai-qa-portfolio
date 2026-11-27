/**
 * RB-101: Restful Booker auth (POST /auth) + health check (GET /ping). API feature, project `api`.
 * Test cases: qa-runs/restful-booker-auth-api/test-cases.csv (30 TC, approved at HITL #2)
 * Known issues: qa-runs/restful-booker-auth-api/known-issues.md (BUG-37 → BUG-40 expected to FAIL)
 * Data: qa-runs/restful-booker-auth-api/test-data.md (TD-xx, MSG-xx)
 *
 * Convention: 1 test = 1 TC, title starts with the TC id, tags = @AC-x + endpoint (@auth / @ping) + @smoke / @security /
 * @booking / @bad-login / @BUG-xx (CSV `tags`, without "regression" which every TC has).
 * Known-bug TCs follow TD-28 exactly: send ALL variants → expect.soft the parts that are correct today → hard gate
 * expect(test.info().errors).toHaveLength(0) → test.fail() → expect.soft the bug parts (never test.fail() in a loop, L18).
 * Secrets: assertions use booleans / `safeJson` (masked), never a raw body that may hold a token. Evidence is masked.
 * Budget: @bad-login TCs send exactly 30 failed POST /auth per run (TD-27); RbApi refuses the 31st (`badLogin: true`).
 */
import { test, expect } from '../fixtures/api';
import { rbAdmin } from '../data/users';
import { MSG_RB_AUTH } from '../data/messages';
import { RB_BASE_URL, RB_REJECT, RB101_PATCH, rb101Booking, rb101Patched, rb101Put } from '../data/restful-booker';
import { RbApi, hasTokenField, internalErrorSigns, isJsonObject, mentionsToken, tokenOf, type ApiResult } from '../api/rb-client';
import { ResetSuspect, guardOwnBooking, guardToken, withResetGuard } from '../api/rb-run';

const USER = rbAdmin.username;
const PASS = rbAdmin.password;
const JSON_HDR = { 'Content-Type': 'application/json' };
const BOOKING_HDR = { 'Content-Type': 'application/json', Accept: 'application/json' };
const GATE = '(a)–(d) phải đạt trước test.fail';
const xmlEscape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const authXml = `<auth><username>${xmlEscape(USER)}</username><password>${xmlEscape(PASS)}</password></auth>`;

type Variant = { label: string; res: ApiResult };

/** Short masked summary of a response for annotations (status, Content-Type, body excerpt). */
function noteResponse(api: RbApi, label: string, r: ApiResult) {
  const body = api.mask(r.text).slice(0, 120);
  test.info().annotations.push({
    type: 'phản hồi',
    description: `${label}: ${r.error ? r.error : `${r.status} ${r.headers['content-type'] ?? '(không có Content-Type)'} ${body ? `"${body}"` : '(body rỗng)'}`}`,
  });
}

/** Step 0 (control, L15): the right account with the same header gets a token. Hard: before test.fail(). */
async function control(api: RbApi) {
  api.step('Bước 0: đối chứng đăng nhập đúng (L15)', 'Tài khoản + header đúng → 200 và có token (chứng minh lỗi sau đó do dữ liệu sai)');
  const r = await api.login();
  expect(r.status, 'Bước 0: đăng nhập đúng phải 200').toBe(200);
  expect(typeof tokenOf(r), 'Bước 0: phải có token là chuỗi không rỗng').toBe('string');
}

/** Send every bad-login variant first (TD-28 point 1). */
async function sendBadLogins(api: RbApi, variants: { label: string; body: unknown }[]): Promise<Variant[]> {
  const out: Variant[] = [];
  for (const v of variants) {
    api.step(v.label, 'Không có token, body {"reason":"Bad credentials"}, JSON, không 5xx; mã phải 401 / 400 (BUG-37: đang 200)');
    const res = await api.login(v.body, {}, { badLogin: true });
    noteResponse(api, v.label, res);
    out.push({ label: v.label, res });
  }
  return out;
}

/** (a)–(d) of a failed login: correct today, checked BEFORE the hard gate. */
function softBadCredentials({ label, res }: Variant) {
  expect.soft(hasTokenField(res), `${label}: (a) body không có trường token`).toBe(false);
  expect.soft(res.safeJson, `${label}: (b) body JSON bằng đúng MSG-01`).toStrictEqual(MSG_RB_AUTH.badCredentials);
  expect.soft(res.mediaType, `${label}: (c) Content-Type application/json`).toBe('application/json');
  expect.soft(res.status, `${label}: (d) mã < 500`).toBeLessThan(500);
}

/** Hard gate of TD-28 point 3: a failure of the correct parts must turn the test RED, not "failed as expected". */
function hardGate(msg = GATE) {
  // Only the FIRST line of each error: no stack (a stack carries the machine path into run-results/*.json, L9, review P1)
  expect(test.info().errors.map((e) => (e.message ?? '').split('\n')[0]), msg).toEqual([]);
}

/** 200 + JSON + token string, no `reason` (positive login). */
function softToken(label: string, r: ApiResult) {
  expect.soft(r.status, `${label}: HTTP 200`).toBe(200);
  expect.soft(r.mediaType, `${label}: Content-Type application/json`).toBe('application/json');
  expect.soft(typeof tokenOf(r), `${label}: token là chuỗi không rỗng`).toBe('string');
  expect.soft(isJsonObject(r) && 'reason' in (r.json as object), `${label}: không có trường reason`).toBe(false);
}

/** Step 1 of every booking TC: POST /booking TD-18 → 200, positive integer id, exactly the 7 values. */
async function createOwnBooking(api: RbApi, tc: string): Promise<number> {
  api.step('1. Tạo booking của test (TD-18)', `firstname QA-RB101-<run>, lastname ${tc}; 200, bookingid nguyên dương, đúng 7 giá trị`);
  const { res, id } = await api.createBooking(rb101Booking(tc));
  expect(res.status, 'Bước 1: POST /booking 200').toBe(200);
  expect(res.mediaType, 'Bước 1: Content-Type application/json').toBe('application/json');
  expect(Number.isInteger(id) && (id as number) > 0, 'Bước 1: bookingid là số nguyên dương').toBe(true);
  expect((res.json as { booking?: unknown }).booking, 'Bước 1: booking bằng đúng 7 giá trị TD-18').toStrictEqual(rb101Booking(tc));
  return id as number;
}

/** Step 2: a NEW token right before use (TD-26), 200 + JSON + token. */
async function takeToken(api: RbApi, label = '2. Lấy token mới ngay trước khi dùng'): Promise<string> {
  api.step(label, '200, JSON, token là chuỗi không rỗng');
  const r = await api.login();
  expect(r.status, `${label}: HTTP 200`).toBe(200);
  expect(r.mediaType, `${label}: Content-Type application/json`).toBe('application/json');
  const t = tokenOf(r);
  expect(typeof t, `${label}: token là chuỗi không rỗng`).toBe('string');
  return t as string;
}

/** GET of the test's own booking (not deleted): 404 → reset check; then 200 + expected 7 values. */
async function expectOwnBooking(api: RbApi, id: number, expected: unknown, label: string) {
  api.step(label, '200, booking giống bước trước');
  const g = await api.getBooking(id);
  guardOwnBooking(g.status, label, id);
  expect(g.status, `${label}: HTTP 200`).toBe(200);
  expect(g.json, `${label}: booking bằng đúng 7 giá trị mong đợi`).toStrictEqual(expected);
}

/** PATCH TD-20 with a cookie built from the token; 403 → reset check; then 200 + patched values. */
async function patchWith(api: RbApi, id: number, tc: string, cookie: string, label: string) {
  api.step(label, '200, JSON; totalprice 303, additionalneeds Dinner, 5 giá trị còn lại không đổi');
  const p = await api.send('PATCH', `/booking/${id}`, { json: RB101_PATCH, headers: { ...BOOKING_HDR, Cookie: cookie } });
  guardToken(p.status, label, id);
  expect(p.status, `${label}: HTTP 200`).toBe(200);
  expect(p.mediaType, `${label}: Content-Type application/json`).toBe('application/json');
  expect(p.json, `${label}: 7 giá trị = TD-18 với totalprice 303, additionalneeds Dinner`).toStrictEqual(rb101Patched(tc));
}

// =====================================================================================================================
test.describe('POST /auth: cấp token, từ chối đăng nhập sai, token dùng được', () => {
  test('TC-001 Happy path: tài khoản quản trị đúng (JSON) được cấp token', { tag: ['@AC-1', '@AC-5', '@smoke', '@auth'] }, async ({ api }) => {
    api.step('1. POST /auth tài khoản đúng (TD-01)', '200, JSON, có token chuỗi không rỗng, không có reason');
    const r = await api.login();
    expect(r.status, 'HTTP 200').toBe(200);
    expect(r.mediaType, 'Content-Type application/json').toBe('application/json');
    expect(isJsonObject(r), 'body là object JSON').toBe(true);
    const t = tokenOf(r);
    expect(typeof t, 'token là chuỗi không rỗng').toBe('string');
    expect('reason' in (r.json as object), 'không có trường reason').toBe(false);
    // Bước 3 + oracle token: annotation only (IMP-02, review B5). Never the token value.
    test.info().annotations.push(
      { type: 'Cache-Control', description: r.headers['cache-control'] ?? '(không có), cải tiến IMP-02' },
      { type: 'token', description: `${t!.length} ký tự, ${/^[0-9a-f]+$/.test(t!) ? 'hex' : 'không phải hex'}; các trường: ${Object.keys(r.json as object).join(', ')}` },
    );
  });

  test('TC-002 Mỗi lần gọi cấp một token mới (5 lần liên tiếp)', { tag: ['@AC-1', '@auth'] }, async ({ api }) => {
    const tokens: string[] = [];
    for (let i = 1; i <= 5; i++) {
      api.step(`${i}. POST /auth lần ${i}`, '200, JSON, token chuỗi không rỗng');
      const r = await api.login();
      softToken(`Lần ${i}`, r);
      const t = tokenOf(r);
      if (t) tokens.push(t);
    }
    api.step('6. So 5 token', '5 token đôi một khác nhau');
    expect(tokens.length, 'nhận đủ 5 token').toBe(5);
    expect(new Set(tokens).size, '5 token đôi một khác nhau').toBe(5);
  });

  test('TC-003 Biến thể hợp lệ của body / header JSON vẫn cấp token', { tag: ['@AC-1', '@auth'] }, async ({ api }) => {
    const variants: { label: string; data: string; ct: string }[] = [
      { label: '1. Trường thừa role, token', data: JSON.stringify({ username: USER, password: PASS, role: 'admin', token: 'abc123' }), ct: 'application/json' },
      { label: '2. Đảo thứ tự trường', data: JSON.stringify({ password: PASS, username: USER }), ct: 'application/json' },
      { label: '3. JSON nhiều dòng, thụt lề 2', data: JSON.stringify({ username: USER, password: PASS }, null, 2), ct: 'application/json' },
      { label: '4. Content-Type có charset', data: JSON.stringify({ username: USER, password: PASS }), ct: 'application/json; charset=utf-8' },
      { label: '5. Content-Type viết hoa', data: JSON.stringify({ username: USER, password: PASS }), ct: 'APPLICATION/JSON' },
    ];
    for (const v of variants) {
      api.step(v.label, '200, JSON, token chuỗi không rỗng, không có reason');
      const r = await api.send('POST', '/auth', { headers: { 'Content-Type': v.ct }, data: v.data });
      softToken(v.label, r);
      if (v.label.startsWith('1.')) {
        expect.soft(tokenOf(r) === 'abc123', `${v.label}: token trả về khác abc123 (trường token gửi lên bị bỏ qua)`).toBe(false);
        expect.soft(isJsonObject(r) && 'role' in (r.json as object), `${v.label}: body không có trường role`).toBe(false);
      }
    }
  });

  test('TC-004 Sai mật khẩu: 401, không cấp token, thông báo Bad credentials', { tag: ['@AC-2', '@security', '@auth', '@bad-login', '@BUG-37'] }, async ({ api }) => {
    await control(api);
    const results = await sendBadLogins(api, [{ label: '1. Sai mật khẩu (TD-02)', body: { username: USER, password: 'qa-rb101-wrong-pass' } }]);
    results.forEach(softBadCredentials);
    hardGate();
    test.fail(true, 'BUG-37: đăng nhập thất bại trả 200 thay vì 401');
    for (const v of results) expect.soft(v.res.status, `${v.label}: (e) HTTP 401`).toBe(401);
  });

  test('TC-005 Sai tên / tài khoản không tồn tại: giống hệt sai mật khẩu (không lộ tài khoản)', { tag: ['@AC-2', '@security', '@auth', '@bad-login', '@BUG-37'] }, async ({ api }) => {
    await control(api);
    const results = await sendBadLogins(api, [
      { label: '1. Tên đúng thêm x + mật khẩu đúng', body: { username: `${USER}x`, password: PASS } },
      { label: '2. Tài khoản không tồn tại', body: { username: 'qa-rb101-no-such-user', password: 'qa-rb101-wrong-pass' } },
    ]);
    results.forEach(softBadCredentials);
    const [v1, v2] = results;
    expect.soft(v2.res.status, 'Biến thể 1, 2 cùng mã').toBe(v1.res.status);
    expect.soft(v2.res.headers['content-type'], 'Biến thể 1, 2 cùng Content-Type').toBe(v1.res.headers['content-type']);
    expect.soft(v2.res.safeJson, 'Biến thể 1, 2 cùng body').toStrictEqual(v1.res.safeJson);
    hardGate();
    test.fail(true, 'BUG-37: đăng nhập thất bại trả 200 thay vì 401');
    for (const v of results) expect.soft(v.res.status, `${v.label}: (e) HTTP 401`).toBe(401);
  });

  test('TC-006 Phân biệt hoa thường ở tên đăng nhập và mật khẩu', { tag: ['@AC-2', '@security', '@auth', '@bad-login', '@BUG-37'] }, async ({ api }) => {
    // TD-04 data check BEFORE sending: an upper-case variant equal to the original would test nothing
    const upperUser = USER.charAt(0).toUpperCase() + USER.slice(1);
    const upperPass = PASS.toUpperCase();
    if (upperUser === USER || upperPass === PASS) throw new Error('Lỗi dữ liệu TD-04: biến thể viết hoa trùng giá trị gốc (không có chữ thường), không gửi request');
    await control(api);
    const results = await sendBadLogins(api, [
      { label: '1. Tên viết hoa chữ đầu + mật khẩu đúng', body: { username: upperUser, password: PASS } },
      { label: '2. Tên đúng + mật khẩu viết hoa toàn bộ', body: { username: USER, password: upperPass } },
    ]);
    results.forEach(softBadCredentials);
    hardGate();
    test.fail(true, 'BUG-37: đăng nhập thất bại trả 200 thay vì 401');
    for (const v of results) expect.soft(v.res.status, `${v.label}: (e) HTTP 401`).toBe(401);
  });

  test('TC-007 Khoảng trắng ở 4 vị trí (đầu / cuối tên, đầu / cuối mật khẩu) không được cắt', { tag: ['@AC-2', '@auth', '@bad-login', '@BUG-37'] }, async ({ api }) => {
    await control(api);
    const results = await sendBadLogins(api, [
      { label: '1. " " + tên', body: { username: ` ${USER}`, password: PASS } },
      { label: '2. tên + " "', body: { username: `${USER} `, password: PASS } },
      { label: '3. " " + mật khẩu', body: { username: USER, password: ` ${PASS}` } },
      { label: '4. mật khẩu + " "', body: { username: USER, password: `${PASS} ` } },
    ]);
    results.forEach(softBadCredentials);
    hardGate();
    test.fail(true, 'BUG-37: đăng nhập thất bại trả 200 thay vì 401');
    for (const v of results) expect.soft(v.res.status, `${v.label}: (e) HTTP 401`).toBe(401);
  });

  test('TC-008 Thiếu trường bắt buộc: 400, không cấp token', { tag: ['@AC-2', '@auth', '@bad-login', '@BUG-37'] }, async ({ api }) => {
    await control(api);
    const results = await sendBadLogins(api, [
      { label: '1. Thiếu password', body: { username: USER } },
      { label: '2. Thiếu username', body: { password: PASS } },
      { label: '3. Body {}', body: {} },
    ]);
    // 4. empty body (0 byte) with Content-Type: application/json (a JSON string '' would be 2 bytes)
    api.step('4. Body rỗng 0 byte', 'Không có token, MSG-01, JSON, không 5xx; mã phải 400');
    const empty = await api.send('POST', '/auth', { headers: JSON_HDR, data: Buffer.alloc(0), badLogin: true });
    noteResponse(api, '4. Body rỗng 0 byte', empty);
    results.push({ label: '4. Body rỗng 0 byte', res: empty });
    results.forEach(softBadCredentials);
    hardGate();
    test.fail(true, 'BUG-37: thiếu trường trả 200 thay vì 400');
    for (const v of results) expect.soft(v.res.status, `${v.label}: (e) HTTP 400`).toBe(400);
  });

  test('TC-009 Giá trị rỗng và null coi như thiếu trường: 400, không cấp token', { tag: ['@AC-2', '@auth', '@bad-login', '@BUG-37'] }, async ({ api }) => {
    await control(api);
    const results = await sendBadLogins(api, [
      { label: '1. username ""', body: { username: '', password: PASS } },
      { label: '2. password ""', body: { username: USER, password: '' } },
      { label: '3. password null', body: { username: USER, password: null } },
    ]);
    results.forEach(softBadCredentials);
    hardGate();
    test.fail(true, 'BUG-37: rỗng / null trả 200 thay vì 400');
    for (const v of results) expect.soft(v.res.status, `${v.label}: (e) HTTP 400`).toBe(400);
  });

  test('TC-010 Sai kiểu dữ liệu và thử vượt xác thực không cấp token, không 5xx', { tag: ['@AC-2', '@security', '@auth', '@bad-login', '@BUG-37'] }, async ({ api }) => {
    await control(api);
    const results = await sendBadLogins(api, [
      { label: '1. username là mảng', body: { username: [USER], password: PASS } },
      { label: '2. password là mảng', body: { username: USER, password: [PASS] } },
      { label: '3. password là object {"$ne":""}', body: { username: USER, password: { $ne: '' } } },
      { label: '4. body là mảng JSON', body: [{ username: USER, password: PASS }] },
      { label: "5. Chuỗi kiểu SQL ' OR '1'='1", body: { username: `${USER}' OR '1'='1`, password: "x' OR '1'='1" } },
    ]);
    results.forEach(softBadCredentials);
    hardGate();
    test.fail(true, 'BUG-37: sai kiểu / chuỗi sai trả 200 thay vì 400 / 401');
    results.forEach((v, i) => expect.soft(v.res.status, `${v.label}: (e) HTTP ${i < 4 ? 400 : 401}`).toBe(i < 4 ? 400 : 401));
  });

  test('TC-011 Tên đăng nhập 10 000 ký tự: 401, không 5xx', { tag: ['@AC-2', '@auth', '@bad-login', '@BUG-37'] }, async ({ api }) => {
    await control(api);
    const results = await sendBadLogins(api, [{ label: '1. username 10 000 ký tự (TD-09)', body: { username: 'a'.repeat(10_000), password: PASS } }]);
    results.forEach(softBadCredentials);
    hardGate();
    test.fail(true, 'BUG-37: đăng nhập thất bại trả 200 thay vì 401');
    for (const v of results) expect.soft(v.res.status, `${v.label}: (e) HTTP 401`).toBe(401);
  });

  test('TC-012 Body quá lớn (~200 KB): 413, phản hồi lỗi là JSON', { tag: ['@AC-5', '@auth', '@bad-login', '@BUG-38'] }, async ({ api }) => {
    await control(api);
    api.step('1. Body ~200 KB (TD-10)', '413, không 5xx, không token, không stack trace; Content-Type phải JSON (BUG-38: đang text/plain)');
    const r = await api.login({ username: USER, password: PASS, pad: 'a'.repeat(204_800) }, {}, { badLogin: true });
    noteResponse(api, '1. Body ~200 KB', r);
    expect.soft(r.status, '(a) HTTP 413').toBe(413);
    expect.soft(r.status, '(b) mã < 500').toBeLessThan(500);
    expect.soft(mentionsToken(r), '(c) body không có trường / chuỗi token').toBe(false);
    expect.soft(internalErrorSigns(r.text), '(c) body không lộ stack trace / đường dẫn file').toEqual([]);
    hardGate('(a)–(c) phải đạt trước test.fail');
    test.fail(true, 'BUG-38: phản hồi 413 là text/plain, không phải JSON');
    expect.soft(r.mediaType, '(d) Content-Type application/json').toBe('application/json');
    expect.soft(isJsonObject(r), '(d) body đọc được thành object JSON').toBe(true);
  });

  test('TC-013 Body không phân tích được: 400, phản hồi lỗi là JSON', { tag: ['@AC-5', '@auth', '@bad-login', '@BUG-38'] }, async ({ api }) => {
    await control(api);
    const variants = [
      { label: '1. JSON hỏng (cắt cụt)', data: `{"username": ${JSON.stringify(USER)}, ` },
      { label: '2. Body XML với Content-Type JSON', data: authXml },
    ];
    const results: Variant[] = [];
    for (const v of variants) {
      api.step(v.label, '400, không 5xx, không token, không stack trace; Content-Type phải JSON (BUG-38: đang text/plain)');
      const res = await api.send('POST', '/auth', { headers: JSON_HDR, data: v.data, badLogin: true });
      noteResponse(api, v.label, res);
      results.push({ label: v.label, res });
    }
    for (const { label, res } of results) {
      expect.soft(res.status, `${label}: (a) HTTP 400`).toBe(400);
      expect.soft(res.status, `${label}: (b) mã < 500`).toBeLessThan(500);
      expect.soft(mentionsToken(res), `${label}: (c) body không có trường / chuỗi token`).toBe(false);
      expect.soft(internalErrorSigns(res.text), `${label}: (c) body không lộ stack trace / đường dẫn file`).toEqual([]);
    }
    hardGate('(a)–(c) phải đạt trước test.fail');
    test.fail(true, 'BUG-38: phản hồi 400 là text/plain, không phải JSON');
    for (const { label, res } of results) {
      expect.soft(res.mediaType, `${label}: (d) Content-Type application/json`).toBe('application/json');
      expect.soft(isJsonObject(res), `${label}: (d) body đọc được thành object JSON`).toBe(true);
    }
  });

  test('TC-014 Định dạng body không hỗ trợ (tài khoản đúng): 415 JSON, không báo Bad credentials', { tag: ['@AC-2', '@AC-5', '@auth', '@bad-login', '@BUG-39'] }, async ({ api }) => {
    await control(api);
    const note = '(a) không token, (b) không 5xx, không stack trace; phải 415 JSON, không "Bad credentials" (BUG-39: đang 200 Bad credentials)';
    const results: Variant[] = [];
    api.step('1. Content-Type: text/xml, body XML', note);
    results.push({ label: '1. text/xml', res: await api.send('POST', '/auth', { headers: { 'Content-Type': 'text/xml' }, data: authXml, badLogin: true }) });
    api.step('2. multipart/form-data', note);
    results.push({ label: '2. multipart/form-data', res: await api.send('POST', '/auth', { multipart: { username: USER, password: PASS }, badLogin: true }) });
    // 3. NO Content-Type: APIRequestContext / fetch add one for a string body, so send with node:https (TD-12)
    api.step('3. Không có header Content-Type (gửi bằng node:https)', `${note}. Header thật sự gửi đi không có Content-Type`);
    const raw = await api.sendRaw('POST', '/auth', {}, JSON.stringify({ username: USER, password: PASS }), { badLogin: true });
    expect(raw.sentHeaders['content-type'], 'Biến thể 3 thật sự không gửi Content-Type').toBeUndefined();
    test.info().annotations.push({ type: 'TD-12 biến thể 3', description: `header đã gửi: ${Object.keys(raw.sentHeaders).join(', ')} (+ host)` });
    results.push({ label: '3. không Content-Type', res: raw });
    results.forEach((v) => noteResponse(api, v.label, v.res));
    for (const { label, res } of results) {
      expect.soft(hasTokenField(res), `${label}: (a) body không có trường token`).toBe(false);
      expect.soft(res.status, `${label}: (b) mã < 500`).toBeLessThan(500);
      expect.soft(internalErrorSigns(res.text), `${label}: (b) body không lộ stack trace / đường dẫn file`).toEqual([]);
    }
    hardGate('(a), (b) phải đạt trước test.fail');
    test.fail(true, 'BUG-39: định dạng không hỗ trợ bị báo 200 Bad credentials thay vì 415');
    for (const { label, res } of results) {
      expect.soft(res.status, `${label}: (c) HTTP 415`).toBe(415);
      expect.soft(res.mediaType, `${label}: (d) Content-Type application/json`).toBe('application/json');
      expect.soft(isJsonObject(res), `${label}: (d) body đọc được thành object JSON`).toBe(true);
      expect.soft(res.text.includes('Bad credentials'), `${label}: (e) body không chứa "Bad credentials"`).toBe(false);
    }
  });

  test('TC-015 Body URL-encoded được cấp token và token đó dùng được', { tag: ['@AC-1', '@AC-3', '@auth', '@booking'] }, async ({ api }) => {
    const tc = 'TC-015';
    await withResetGuard(api, test.info(), async () => {
      const id = await createOwnBooking(api, tc);
      api.step('2. POST /auth URL-encoded (TD-13)', '200, JSON, token chuỗi không rỗng, không có reason');
      const a = await api.send('POST', '/auth', { form: { username: USER, password: PASS } });
      expect(a.status, 'Bước 2: HTTP 200').toBe(200);
      expect(a.mediaType, 'Bước 2: Content-Type application/json').toBe('application/json');
      const token = tokenOf(a);
      expect(typeof token, 'Bước 2: token là chuỗi không rỗng').toBe('string');
      expect('reason' in (a.json as object), 'Bước 2: không có trường reason').toBe(false);
      await patchWith(api, id, tc, `token=${token}`, '3. PATCH bằng token URL-encoded (TD-20)');
      await expectOwnBooking(api, id, rb101Patched(tc), '4. GET /booking/<id>');
    });
  });

  test('TC-016 Tài khoản trên query string bị từ chối (400), không cấp token', { tag: ['@AC-2', '@security', '@auth', '@bad-login', '@BUG-37'] }, async ({ api }) => {
    await control(api);
    // TD-14: the URL carries the real password → Node fetch OUTSIDE APIRequestContext (no report step, no trace);
    // annotation / evidence never show the URL, only a masked target
    api.step('1. POST /auth?username=…&password=… (fetch ngoài APIRequestContext, không body)', 'Không token, MSG-01, JSON, không 5xx; mã phải 400 (BUG-37: đang 200)');
    const url = `${RB_BASE_URL}/auth?username=${encodeURIComponent(USER)}&password=${encodeURIComponent(PASS)}`;
    const res = await api.sendHidden('POST', url, '/auth?username=<TD-01 tên>&password=***', { badLogin: true });
    noteResponse(api, '1. Tài khoản trên query string', res);
    const results: Variant[] = [{ label: '1. Tài khoản trên query string', res }];
    results.forEach(softBadCredentials);
    hardGate();
    test.fail(true, 'BUG-37: tài khoản trên query string trả 200 thay vì 400');
    for (const v of results) expect.soft(v.res.status, `${v.label}: (e) HTTP 400`).toBe(400);
  });

  test('TC-017 Header Accept: application/xml không đổi định dạng phản hồi của /auth', { tag: ['@AC-5', '@auth'] }, async ({ api }) => {
    api.step('1. POST /auth, Accept: application/xml', '200, Content-Type JSON (không phải XML), token chuỗi không rỗng, không có reason');
    const r = await api.login(undefined, { Accept: 'application/xml' });
    softToken('Accept: application/xml', r);
  });

  test('TC-018 Sai phương thức trên /auth: 4xx, không token, không 5xx', { tag: ['@AC-1', '@auth'] }, async ({ api }) => {
    const body = JSON.stringify({ username: USER, password: PASS });
    const variants: { label: string; method: string; path: string; withBody?: boolean }[] = [
      { label: '1. GET /auth', method: 'GET', path: '/auth' },
      { label: '2. PUT /auth (body TD-01)', method: 'PUT', path: '/auth', withBody: true },
      { label: '3. PATCH /auth (body TD-01)', method: 'PATCH', path: '/auth', withBody: true },
      { label: '4. DELETE /auth', method: 'DELETE', path: '/auth' },
      { label: '5. HEAD /auth', method: 'HEAD', path: '/auth' },
      { label: '6. GET /auth/', method: 'GET', path: '/auth/' },
    ];
    for (const v of variants) {
      api.step(v.label, '400 ≤ mã ≤ 499, body không chứa token (HEAD: body rỗng)');
      const r = await api.send(v.method, v.path, v.withBody ? { headers: JSON_HDR, data: body } : {});
      noteResponse(api, v.label, r);
      expect.soft(r.status, `${v.label}: mã ≥ 400`).toBeGreaterThanOrEqual(400);
      expect.soft(r.status, `${v.label}: mã ≤ 499`).toBeLessThanOrEqual(499);
      expect.soft(mentionsToken(r), `${v.label}: body không chứa token`).toBe(false);
    }
  });

  test('TC-019 AC-3: token vừa cấp dùng được cho PUT booking tự tạo', { tag: ['@AC-3', '@auth', '@booking'] }, async ({ api }) => {
    const tc = 'TC-019';
    await withResetGuard(api, test.info(), async () => {
      const id = await createOwnBooking(api, tc);
      const token = await takeToken(api);
      api.step('3. PUT /booking/<id> bằng token (TD-19)', '200, JSON, body bằng đúng 7 giá trị TD-19');
      const p = await api.send('PUT', `/booking/${id}`, { json: rb101Put(tc), headers: { ...BOOKING_HDR, Cookie: `token=${token}` } });
      guardToken(p.status, '3. PUT', id);
      expect(p.status, 'Bước 3: HTTP 200').toBe(200);
      expect(p.mediaType, 'Bước 3: Content-Type application/json').toBe('application/json');
      expect(p.json, 'Bước 3: body bằng đúng 7 giá trị TD-19').toStrictEqual(rb101Put(tc));
      await expectOwnBooking(api, id, rb101Put(tc), '4. GET /booking/<id>');
    });
  });

  test('TC-020 AC-3: token vừa cấp dùng được cho PATCH booking tự tạo', { tag: ['@AC-3', '@auth', '@booking'] }, async ({ api }) => {
    const tc = 'TC-020';
    await withResetGuard(api, test.info(), async () => {
      const id = await createOwnBooking(api, tc);
      const token = await takeToken(api);
      await patchWith(api, id, tc, `token=${token}`, '3. PATCH /booking/<id> bằng token (TD-20)');
      await expectOwnBooking(api, id, rb101Patched(tc), '4. GET /booking/<id>');
    });
  });

  test('TC-021 AC-3: token vừa cấp dùng được cho DELETE booking tự tạo', { tag: ['@AC-3', '@auth', '@booking'] }, async ({ api }) => {
    const tc = 'TC-021';
    await withResetGuard(api, test.info(), async () => {
      const id = await createOwnBooking(api, tc);
      const token = await takeToken(api);
      api.step('3. DELETE /booking/<id> bằng token', '201, text/plain, body Created (MSG-02)');
      const d = await api.send('DELETE', `/booking/${id}`, { headers: { Cookie: `token=${token}` } });
      guardToken(d.status, '3. DELETE', id);
      expect(d.status, 'Bước 3: HTTP 201').toBe(201);
      expect(d.mediaType, 'Bước 3: Content-Type text/plain').toBe('text/plain');
      expect(d.text, 'Bước 3: body Created (MSG-02)').toBe(MSG_RB_AUTH.created);
      // 404 after a successful DELETE is the ORACLE: no reset check here (review D3)
      api.step('4. GET /booking/<id> sau khi xóa', '404, body Not Found (MSG-04)');
      const g = await api.getBooking(id);
      expect(g.status, 'Bước 4: HTTP 404').toBe(404);
      expect(g.text, 'Bước 4: body Not Found (MSG-04)').toBe(MSG_RB_AUTH.notFound);
    });
  });

  test('TC-022 Đối chứng âm AC-3: token abc123 và token bị sửa bị từ chối 403, booking không đổi', { tag: ['@AC-3', '@security', '@auth', '@booking'] }, async ({ api }) => {
    // 1 create + 1 token + 6 × (request + GET) + PATCH + GET + cleanup 3 ≈ 20 request × ~1,5 s ≈ 30 s, + soft checks, + 30 % → 90 s
    test.setTimeout(90_000);
    const tc = 'TC-022';
    await withResetGuard(api, test.info(), async () => {
      const id = await createOwnBooking(api, tc);
      const token = await takeToken(api);
      // TD-21 (2): last character changed (a → b, otherwise → a): always different from T
      const modified = token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a');
      api.addSecret(modified);
      expect(modified === token, "Bước 2: T' khác T").toBe(false);
      const fakes = [
        { name: 'abc123', value: 'abc123' },
        { name: "T' (token vừa cấp đổi ký tự cuối)", value: modified },
      ];
      const methods = [
        { method: 'PUT', json: rb101Put(tc) as unknown },
        { method: 'PATCH', json: RB101_PATCH as unknown },
        { method: 'DELETE', json: undefined },
      ];
      for (const m of methods)
        for (const f of fakes) {
          const label = `3. ${m.method} với token ${f.name}`;
          api.step(label, `Mã ${RB_REJECT.status}, text/plain, body ${RB_REJECT.body}; GET sau đó: booking không đổi (TD-18)`);
          const r = await api.send(m.method, `/booking/${id}`, { json: m.json, headers: { ...BOOKING_HDR, Cookie: `token=${f.value}` } });
          expect.soft(r.status, `${label}: mã = ${RB_REJECT.status} (TD-25)`).toBe(RB_REJECT.status);
          expect.soft(r.mediaType, `${label}: Content-Type ${RB_REJECT.mediaType}`).toBe(RB_REJECT.mediaType);
          expect.soft(r.text, `${label}: body ${RB_REJECT.body} (MSG-03)`).toBe(RB_REJECT.body);
          const g = await api.getBooking(id);
          if (g.status === 404) {
            // a fake token that was REFUSED cannot have deleted it: only then may it be a reset (TD-26)
            if (r.status === RB_REJECT.status) throw new ResetSuspect(`${label}: GET sau request bị từ chối trả 404`, id);
            expect(g.status, `${label}: request giả trả ${r.status} và booking bị xóa (lỗ hổng bảo mật)`).toBe(200);
          }
          expect.soft(g.status, `${label}: GET sau đó 200`).toBe(200);
          expect.soft(g.json, `${label}: booking không đổi (đúng 7 giá trị TD-18)`).toStrictEqual(rb101Booking(tc));
        }
      await patchWith(api, id, tc, `token=${token}`, '4. Đối chứng dương: PATCH với token T (L15)');
      await expectOwnBooking(api, id, rb101Patched(tc), '5. GET /booking/<id>');
    });
  });

  test('TC-023 Token cũ vẫn dùng được sau khi đã cấp token mới (cùng chu kỳ reset)', { tag: ['@AC-3', '@auth', '@booking'] }, async ({ api }) => {
    const tc = 'TC-023';
    await withResetGuard(api, test.info(), async () => {
      const id = await createOwnBooking(api, tc);
      const t1 = await takeToken(api, '2. POST /auth → T1');
      const t2 = await takeToken(api, '3. POST /auth → T2');
      expect(t2 === t1, 'Bước 3: T2 khác T1').toBe(false);
      await patchWith(api, id, tc, `token=${t1}`, '4. PATCH bằng token cũ T1');
      await expectOwnBooking(api, id, rb101Patched(tc), '5. GET /booking/<id>');
    });
  });

  test('TC-024 Cookie có nhiều giá trị: token vẫn được nhận', { tag: ['@AC-3', '@auth', '@booking'] }, async ({ api }) => {
    const tc = 'TC-024';
    await withResetGuard(api, test.info(), async () => {
      const id = await createOwnBooking(api, tc);
      const token = await takeToken(api);
      await patchWith(api, id, tc, `a=b; token=${token}; c=d`, '3. PATCH với Cookie: a=b; token=<T>; c=d (TD-22)');
      await expectOwnBooking(api, id, rb101Patched(tc), '4. GET /booking/<id>');
    });
  });
});

// =====================================================================================================================
test.describe('GET /ping: kiểm tra hệ thống', () => {
  test('TC-025 GET /ping trả 201 Created', { tag: ['@AC-4', '@smoke', '@ping'] }, async ({ api }) => {
    api.step('1. GET /ping', '201, text/plain, body Created (MSG-02)');
    const r = await api.send('GET', '/ping');
    expect(r.status, 'HTTP 201').toBe(201);
    expect(r.mediaType, 'Content-Type text/plain').toBe('text/plain');
    expect(r.text, 'body Created (MSG-02)').toBe(MSG_RB_AUTH.created);
  });

  test('TC-026 HEAD /ping cùng mã với GET, body rỗng', { tag: ['@AC-4', '@ping'] }, async ({ api }) => {
    api.step('1. GET /ping', '201, text/plain, Content-Length 7');
    const g = await api.send('GET', '/ping');
    expect.soft(g.status, 'Bước 1: HTTP 201').toBe(201);
    expect.soft(g.mediaType, 'Bước 1: Content-Type text/plain').toBe('text/plain');
    expect.soft(g.headers['content-length'], 'Bước 1: Content-Length 7').toBe(String(Buffer.byteLength(MSG_RB_AUTH.created)));
    api.step('2. HEAD /ping', 'Cùng mã, cùng Content-Length, cùng Content-Type với GET');
    const h = await api.send('HEAD', '/ping');
    expect.soft(h.status, 'Bước 2: cùng mã với GET').toBe(g.status);
    expect.soft(h.headers['content-length'], 'Bước 2: Content-Length bằng của GET').toBe(g.headers['content-length']);
    expect.soft(h.mediaType, 'Bước 2: Content-Type giống GET').toBe(g.mediaType);
    test.info().annotations.push({ type: 'HEAD body', description: `${Buffer.byteLength(h.text)} byte (không assert, L15)` });
  });

  test('TC-027 Biến thể URL / header của /ping cho cùng kết quả', { tag: ['@AC-4', '@ping'] }, async ({ api }) => {
    const variants: { label: string; path: string; headers: Record<string, string> }[] = [
      { label: '1. GET /ping/', path: '/ping/', headers: {} },
      { label: '2. GET /PING', path: '/PING', headers: {} },
      { label: '3. GET /ping?x=1', path: '/ping?x=1', headers: {} },
      { label: '4. GET /ping, Accept: application/json', path: '/ping', headers: { Accept: 'application/json' } },
    ];
    for (const v of variants) {
      api.step(v.label, '201, text/plain, body Created');
      const r = await api.send('GET', v.path, { headers: v.headers });
      expect.soft(r.status, `${v.label}: HTTP 201`).toBe(201);
      expect.soft(r.mediaType, `${v.label}: Content-Type text/plain`).toBe('text/plain');
      expect.soft(r.text, `${v.label}: body Created (MSG-02)`).toBe(MSG_RB_AUTH.created);
    }
  });

  test('TC-028 Sai phương thức trên /ping: 4xx, không trả Created', { tag: ['@AC-4', '@ping'] }, async ({ api }) => {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      const label = `${method} /ping`;
      api.step(label, '400 ≤ mã ≤ 499, body khác Created');
      const r = await api.send(method, '/ping');
      noteResponse(api, label, r);
      expect.soft(r.status, `${label}: mã ≥ 400`).toBeGreaterThanOrEqual(400);
      expect.soft(r.status, `${label}: mã ≤ 499`).toBeLessThanOrEqual(499);
      expect.soft(r.text, `${label}: body khác Created`).not.toBe(MSG_RB_AUTH.created);
    }
  });
});

// =====================================================================================================================
test.describe('Chung: cả 2 endpoint', () => {
  test('TC-029 Luồng smoke: ping → tạo booking → auth → PATCH bằng token → xóa', { tag: ['@AC-1', '@AC-3', '@AC-4', '@smoke', '@auth', '@ping', '@booking'] }, async ({ api }) => {
    const tc = 'TC-029';
    await withResetGuard(api, test.info(), async () => {
      api.step('1. GET /ping', '201, text/plain, Created');
      const ping = await api.send('GET', '/ping');
      expect(ping.status, 'Bước 1: HTTP 201').toBe(201);
      expect(ping.mediaType, 'Bước 1: text/plain').toBe('text/plain');
      expect(ping.text, 'Bước 1: body Created').toBe(MSG_RB_AUTH.created);
      const id = await createOwnBooking(api, tc);
      const token = await takeToken(api, '3. POST /auth → token T');
      await patchWith(api, id, tc, `token=${token}`, '4. PATCH /booking/<id> bằng T (TD-20)');
      await expectOwnBooking(api, id, rb101Patched(tc), '5. GET /booking/<id>');
      api.step('6. DELETE /booking/<id> bằng T', '201, text/plain, Created');
      const d = await api.send('DELETE', `/booking/${id}`, { headers: { Cookie: `token=${token}` } });
      guardToken(d.status, '6. DELETE', id);
      expect(d.status, 'Bước 6: HTTP 201').toBe(201);
      expect(d.mediaType, 'Bước 6: text/plain').toBe('text/plain');
      expect(d.text, 'Bước 6: body Created (MSG-02)').toBe(MSG_RB_AUTH.created);
      // 404 after a successful DELETE is the ORACLE: no reset check (review D3)
      api.step('7. GET /booking/<id> sau khi xóa', '404, Not Found');
      const g = await api.getBooking(id);
      expect(g.status, 'Bước 7: HTTP 404').toBe(404);
      expect(g.text, 'Bước 7: body Not Found (MSG-04)').toBe(MSG_RB_AUTH.notFound);
    });
  });

  test('TC-030 HTTP thường bị chuyển hướng sang HTTPS hoặc bị từ chối; HTTPS có HSTS', { tag: ['@AC-1', '@AC-4', '@security', '@auth', '@ping', '@bad-login', '@BUG-40'] }, async ({ api }) => {
    const https = new URL(RB_BASE_URL);
    const httpBase = `http://${https.host}`;
    /** Location = https, same host, same path (HITL #2 item 6) */
    const toHttps = (r: ApiResult, path: string) => {
      try {
        const u = new URL(r.headers.location ?? '', httpBase);
        return !!r.headers.location && u.protocol === 'https:' && u.host === https.host && u.pathname === path;
      } catch {
        return false;
      }
    };
    const is4xx = (s: number) => s >= 400 && s <= 499;

    api.step('1. GET http://…/ping (không theo chuyển hướng)', 'Phải 301 / 308 sang https://…/ping, hoặc bị từ chối; không 2xx (BUG-40: đang 201)');
    const r1 = await api.send('GET', '/ping', { url: `${httpBase}/ping`, maxRedirects: 0, allowNetworkError: true });
    api.step('2. POST http://…/auth, tài khoản SAI (TD-24)', 'Không token, < 500; phải 307 / 308 sang https://…/auth hoặc bị từ chối (BUG-40: đang 200 Bad credentials)');
    const r2 = await api.send('POST', '/auth', {
      url: `${httpBase}/auth`,
      maxRedirects: 0,
      allowNetworkError: true,
      headers: JSON_HDR,
      data: JSON.stringify({ username: 'qa-rb101-no-such-user', password: 'qa-rb101-wrong-pass' }),
      badLogin: true,
    });
    api.step('3. GET https://…/ping, đọc Strict-Transport-Security', 'Phải có HSTS max-age > 0 (BUG-40: đang không có)');
    const r3 = await api.send('GET', '/ping');
    const hsts = r3.headers['strict-transport-security'];
    const maxAge = Number(hsts?.match(/max-age=(\d+)/i)?.[1] ?? 0);
    // Step 4: annotate each step so a partial fix is visible
    test.info().annotations.push(
      { type: 'Bước 1 HTTP GET /ping', description: r1.error ?? `${r1.status}, Location ${r1.headers.location ?? '(không có)'}, body "${r1.text.slice(0, 40)}"` },
      { type: 'Bước 2 HTTP POST /auth', description: r2.error ?? `${r2.status}, Location ${r2.headers.location ?? '(không có)'}, body "${api.mask(r2.text).slice(0, 60)}"` },
      { type: 'Bước 3 HSTS', description: hsts ?? '(không có)' },
    );

    // Step 5: hard gate BEFORE test.fail() (review D4)
    expect(mentionsToken(r2), 'Bước 2: body không có trường / chuỗi token').toBe(false);
    expect(r1.status, 'Bước 1: mã < 500 (0 = bị từ chối kết nối)').toBeLessThan(500);
    expect(r2.status, 'Bước 2: mã < 500 (0 = bị từ chối kết nối)').toBeLessThan(500);
    hardGate('Chặn cứng bước 2 không token, mã < 500 phải đạt trước test.fail');

    test.fail(true, 'BUG-40: API phục vụ trên HTTP thường, HTTPS không có HSTS');
    const step1Ok =
      r1.status === 0 || ([301, 308].includes(r1.status) && toHttps(r1, '/ping')) || r1.status === 426 || (is4xx(r1.status) && r1.text !== MSG_RB_AUTH.created);
    const step2Ok =
      r2.status === 0 ||
      ([307, 308].includes(r2.status) && toHttps(r2, '/auth')) ||
      r2.status === 426 ||
      (is4xx(r2.status) && !(isJsonObject(r2) && ('reason' in (r2.json as object) || 'token' in (r2.json as object))));
    expect.soft(step1Ok, `Bước 1: http://…/ping phải chuyển hướng 301 / 308 sang https cùng host, cùng đường dẫn, hoặc bị từ chối; thực tế ${r1.error ?? r1.status}`).toBe(true);
    expect.soft(step2Ok, `Bước 2: http://…/auth phải chuyển hướng 307 / 308 sang https cùng host, cùng đường dẫn, hoặc bị từ chối (không qua kiểm tài khoản); thực tế ${r2.error ?? r2.status}`).toBe(true);
    expect.soft(maxAge, `Bước 3: HTTPS có Strict-Transport-Security max-age > 0; thực tế ${hsts ?? '(không có)'}`).toBeGreaterThan(0);
  });
});
