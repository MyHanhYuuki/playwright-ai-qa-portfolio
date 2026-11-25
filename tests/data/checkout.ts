/**
 * SD-103 checkout test data: qa-runs/saucedemo-checkout-screen/test-data.md.
 * Expected money values are computed from tests/data/products.ts in INTEGER CENTS (Q2):
 *   Item total = sum of prices, Tax = round(Item total × 8 %), Total = Item total + Tax.
 * Never read a number from the page to compare it with the page itself.
 */
import { allProducts, type Product } from './products';

/** Values typed on the Information page. '' = leave the field untouched. */
export type CheckoutInfo = { first: string; last: string; zip: string };

/** TD-17: valid information. A = default, B = second person / second order. */
export const info = {
  a: { first: 'An', last: 'Le', zip: '70000' },
  b: { first: 'Vy', last: 'Tran', zip: '10000' },
} as const satisfies Record<string, CheckoutInfo>;

/** Which required-field message is expected (MSG-01 → MSG-03). */
export type MissingField = 'first' | 'last' | 'zip';

/** TD-18: the 7 combinations of empty fields (values of set A), expected message = first missing field. */
export const missingCombos: readonly { name: string; values: CheckoutInfo; missing: MissingField }[] = [
  { name: 'trống cả 3', values: { first: '', last: '', zip: '' }, missing: 'first' },
  { name: 'chỉ có First', values: { first: 'An', last: '', zip: '' }, missing: 'last' },
  { name: 'chỉ có Last', values: { first: '', last: 'Le', zip: '' }, missing: 'first' },
  { name: 'chỉ có Zip', values: { first: '', last: '', zip: '70000' }, missing: 'first' },
  { name: 'First + Last', values: { first: 'An', last: 'Le', zip: '' }, missing: 'zip' },
  { name: 'First + Zip', values: { first: 'An', last: '', zip: '70000' }, missing: 'last' },
  { name: 'Last + Zip', values: { first: '', last: 'Le', zip: '70000' }, missing: 'first' },
];

/** TD-19: only whitespace / a tab (TC-005 variants 1 → 5). */
export const whitespaceInfo: readonly { name: string; values: CheckoutInfo; missing: MissingField }[] = [
  { name: 'cả 3 ô 1 khoảng trắng', values: { first: ' ', last: ' ', zip: ' ' }, missing: 'first' },
  { name: 'First 3 khoảng trắng', values: { first: '   ', last: 'Le', zip: '70000' }, missing: 'first' },
  { name: 'Last 3 khoảng trắng', values: { first: 'An', last: '   ', zip: '70000' }, missing: 'last' },
  { name: 'Zip 3 khoảng trắng', values: { first: 'An', last: 'Le', zip: '   ' }, missing: 'zip' },
  { name: 'Zip 1 ký tự tab', values: { first: 'An', last: 'Le', zip: '\t' }, missing: 'zip' },
];

/** TD-20: varied valid values (Q8: no format check). */
export const variedInfo: readonly { name: string; values: CheckoutInfo }[] = [
  { name: 'tiếng Việt có dấu', values: { first: 'Nguyễn', last: 'Thị Ánh', zip: 'ABC-xyz' } },
  { name: 'thẻ script / ký tự đặc biệt', values: { first: '<script>alert(1)</script>', last: "O'Brien; DROP TABLE", zip: '!@#$%^&*()' } },
  { name: 'số trong tên, chữ trong zip', values: { first: '123', last: '456', zip: 'abcdef' } },
  { name: 'khoảng trắng đầu cuối', values: { first: '  An  ', last: '  Bình ', zip: '  70000  ' } },
  { name: 'emoji / chữ Hán / số toàn chiều rộng', values: { first: '😀', last: '李', zip: '０１２' } },
];

/** TD-21: very long value (5000 characters). */
export const longValue = 'a'.repeat(5000);

// ---------- money ----------
export const productById = (id: number): Product => {
  const p = allProducts.find((x) => x.id === id);
  if (!p) throw new Error(`unknown product id ${id}`);
  return p;
};
export const cents = (p: Product) => Math.round(p.price * 100);

export type Totals = { item: number; tax: number; total: number };

/** Expected Item total / Tax / Total in cents for a cart (array of product ids), integer arithmetic only. */
export function expectedTotals(ids: readonly number[]): Totals {
  const item = ids.reduce((sum, id) => sum + cents(productById(id)), 0);
  const tax = Math.round((item * 8) / 100);
  return { item, tax, total: item + tax };
}

/** Cents → text as the page must show it: 3798 → "$37.98". */
export const money = (c: number) => `$${(c / 100).toFixed(2)}`;
/** Same without "$" (PDF prints "$" and the number as 2 separate texts): 3798 → "37.98". */
export const amount = (c: number) => (c / 100).toFixed(2);

/** Read a money text of the page ("Item total: $59.980000000000004") → cents rounded to the cent (5998). NaN if no number. */
export const textToCents = (text: string) => Math.round(parseFloat(text.replace(/^[^0-9]*/, '')) * 100);

/** The 3 lines of the Overview exactly as expected: "Item total: $x.xx", "Tax: $x.xx", "Total: $x.xx". */
export const totalsText = (t: Totals) => ({
  item: `Item total: ${money(t.item)}`,
  tax: `Tax: ${money(t.tax)}`,
  total: `Total: ${money(t.total)}`,
});

/** Carts of test-data.md (cart-contents = ids in the order they were added). */
export const carts = {
  /** TD-07 */
  backpack: [4],
  /** TD-08 */
  backpackOnesie: [4, 2],
  /** TD-09 */
  mixed: [4, 0, 2],
  /** TD-10 */
  all6: [4, 0, 1, 5, 2, 3],
  /** TD-11 */
  cheapest: [2],
  /** TD-12: added Onesie, Fleece Jacket, Bike Light, then removed and re-added Onesie */
  addOrder: [5, 0, 2],
  /** TD-14 */
  empty: [],
} as const satisfies Record<string, readonly number[]>;

/**
 * TC-018: 13 representative carts with the expected cents copied from test-data.md (TD-07 → TD-15),
 * so the formula above is itself checked against the approved table.
 */
export const representativeCarts: readonly { ids: readonly number[]; expected: Totals }[] = [
  { ids: [4], expected: { item: 2999, tax: 240, total: 3239 } },
  { ids: [0], expected: { item: 999, tax: 80, total: 1079 } },
  { ids: [2], expected: { item: 799, tax: 64, total: 863 } },
  { ids: [3], expected: { item: 1599, tax: 128, total: 1727 } },
  { ids: [4, 0, 1, 5, 2, 3], expected: { item: 12994, tax: 1040, total: 14034 } },
  { ids: [4, 2], expected: { item: 3798, tax: 304, total: 4102 } },
  { ids: [4, 0, 2], expected: { item: 4797, tax: 384, total: 5181 } },
  { ids: [4, 5], expected: { item: 7998, tax: 640, total: 8638 } },
  { ids: [0, 1, 5], expected: { item: 7597, tax: 608, total: 8205 } },
  { ids: [0, 5], expected: { item: 5998, tax: 480, total: 6478 } },
  { ids: [2, 5], expected: { item: 5798, tax: 464, total: 6262 } },
  { ids: [0, 1, 2, 4], expected: { item: 6396, tax: 512, total: 6908 } },
  { ids: [4, 3, 2, 1, 0], expected: { item: 7995, tax: 640, total: 8635 } },
];

/**
 * TC-020 variants 1 → 6 (TD-13, TD-14): carts whose Item total hits the floating-point bug (BUG-25),
 * with the expected strings of test-data.md.
 */
export const floatCarts: readonly { ids: readonly number[]; item: string; tax: string; total: string }[] = [
  { ids: [0, 5], item: 'Item total: $59.98', tax: 'Tax: $4.80', total: 'Total: $64.78' },
  { ids: [2, 5], item: 'Item total: $57.98', tax: 'Tax: $4.64', total: 'Total: $62.62' },
  { ids: [0, 1, 2, 4], item: 'Item total: $63.96', tax: 'Tax: $5.12', total: 'Total: $69.08' },
  { ids: [0, 1, 2, 5], item: 'Item total: $83.96', tax: 'Tax: $6.72', total: 'Total: $90.68' },
  { ids: [4, 3, 2, 1, 0], item: 'Item total: $79.95', tax: 'Tax: $6.40', total: 'Total: $86.35' },
];
export const emptyCartTotals = { item: 'Item total: $0.00', tax: 'Tax: $0.00', total: 'Total: $0.00' } as const;

/**
 * TD-16: the 120 different carts of the sweep (TC-019, TC-020 variant 10):
 * 63 non-empty combinations of the 6 ids; 1-product carts once (6), carts of ≥ 2 products
 * in 2 adding orders, id ascending and id descending (57 × 2 = 114).
 */
export const sweepCarts: readonly (readonly number[])[] = (() => {
  const ids = allProducts.map((p) => p.id).sort((a, b) => a - b);
  const result: number[][] = [];
  for (let mask = 1; mask < 1 << ids.length; mask++) {
    const combo = ids.filter((_, i) => mask & (1 << i));
    result.push(combo);
    if (combo.length >= 2) result.push([...combo].reverse());
  }
  return result;
})();

/** Expected texts of the PDF receipt for an order (MSG-08), in the order they must appear. */
export function receiptTexts(ids: readonly number[], who?: CheckoutInfo) {
  const t = expectedTotals(ids);
  return [
    'Swag Labs',
    'Order Receipt',
    'ORDER DETAILS',
    'Order Date',
    ...(who ? ['SHIP TO', `${who.first} ${who.last}`, who.zip] : []),
    'ITEMS',
    'DESCRIPTION',
    'PRICE',
    ...ids.flatMap((id) => [productById(id).name, amount(cents(productById(id)))]),
    'Item total',
    amount(t.item),
    'Tax',
    amount(t.tax),
    'Total',
    amount(t.total),
  ];
}
