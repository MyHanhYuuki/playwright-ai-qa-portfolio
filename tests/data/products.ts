/**
 * Product catalogue of SauceDemo = expected data (taken from standard_user, O-01 in
 * qa-runs/saucedemo-products-cart-screen/spec-review.md). Tests compare the page with THIS data,
 * never the page with itself.
 *
 * - id:     value of ?id= on the detail page
 * - slug:   suffix of the data-test ids, e.g. add-to-cart-<slug>, remove-<slug>
 * - imgKey: stable part of the image file name (the file name also contains a build hash)
 * Same price → sort by name A→Z: confirmed at HITL #1 (Q6).
 */
export type Product = { id: number; name: string; price: number; description: string; slug: string; imgKey: string };

export const products = {
  backpack: { id: 4, name: 'Sauce Labs Backpack', price: 29.99,
    description:
      "carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection.",
    slug: 'sauce-labs-backpack', imgKey: 'sauce-backpack' },
  bikeLight: { id: 0, name: 'Sauce Labs Bike Light', price: 9.99,
    description:
      "A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included.",
    slug: 'sauce-labs-bike-light', imgKey: 'bike-light' },
  boltTShirt: { id: 1, name: 'Sauce Labs Bolt T-Shirt', price: 15.99,
    description:
      "Get your testing superhero on with the Sauce Labs bolt T-shirt. From American Apparel, 100% ringspun combed cotton, heather gray with red bolt.",
    slug: 'sauce-labs-bolt-t-shirt', imgKey: 'bolt-shirt' },
  fleeceJacket: { id: 5, name: 'Sauce Labs Fleece Jacket', price: 49.99,
    description:
      "It's not every day that you come across a midweight quarter-zip fleece jacket capable of handling everything from a relaxing day outdoors to a busy day at the office.",
    slug: 'sauce-labs-fleece-jacket', imgKey: 'sauce-pullover' },
  onesie: { id: 2, name: 'Sauce Labs Onesie', price: 7.99,
    description:
      "Rib snap infant onesie for the junior automation engineer in development. Reinforced 3-snap bottom closure, two-needle hemmed sleeved and bottom won't unravel.",
    slug: 'sauce-labs-onesie', imgKey: 'red-onesie' },
  redTShirt: { id: 3, name: 'Test.allTheThings() T-Shirt (Red)', price: 15.99,
    description:
      "This classic Sauce Labs t-shirt is perfect to wear when cozying up to your keyboard to automate a few tests. Super-soft and comfy ringspun combed cotton.",
    slug: 'test.allthethings()-t-shirt-(red)', imgKey: 'red-tatt' },
} as const satisfies Record<string, Product>;

export const allProducts: readonly Product[] = Object.values(products);

/** Price as shown on the page, e.g. 29.99 → "$29.99". */
export const priceText = (p: Product) => `$${p.price.toFixed(2)}`;

/** Expected order for each sort option. Same price → by name A→Z (Q6, answered). */
const byName = (a: Product, b: Product) => a.name.localeCompare(b.name);
export const sortOrders = {
  az: [...allProducts].sort(byName),
  za: [...allProducts].sort(byName).reverse(),
  lohi: [...allProducts].sort((a, b) => a.price - b.price || byName(a, b)),
  hilo: [...allProducts].sort((a, b) => b.price - a.price || byName(a, b)),
} as const;

/** Labels of the sort dropdown (value → visible text). */
export const sortLabels = {
  az: 'Name (A to Z)',
  za: 'Name (Z to A)',
  lohi: 'Price (low to high)',
  hilo: 'Price (high to low)',
} as const;
