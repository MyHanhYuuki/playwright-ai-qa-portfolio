/**
 * Expected error messages of the login screen, matched VERBATIM (Q&A Q1).
 * Source: qa-runs/saucedemo-login-screen/test-data.md (MSG-01 → MSG-05)
 */
export const MSG = {
  usernameRequired: 'Epic sadface: Username is required',
  passwordRequired: 'Epic sadface: Password is required',
  mismatch: 'Epic sadface: Username and password do not match any user in this service',
  lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
  notLoggedIn: (path: string) => `Epic sadface: You can only access '${path}' when you are logged in.`,
} as const;

/**
 * SD-102 (products list, detail, cart): qa-runs/saucedemo-products-cart-screen/test-data.md.
 * MSG-02 of SD-102 is MSG.notLoggedIn above (same text).
 */
export const MSG_SHOP = {
  /** MSG-01: dialog of error_user when sorting (evidence for BUG-12) */
  sortingBroken: 'Sorting is broken! This error has been reported to Backtrace.',
  /** MSG-03: name shown for a product that does not exist */
  itemNotFound: 'ITEM NOT FOUND',
  /** MSG-05: uncaught JS error (pageerror, not console) when an Add of error_user has no effect (evidence for BUG-13) */
  addFailed: 'Failed to add item to the cart.',
  /** MSG-06: same, when a Remove has no effect */
  removeFailed: 'Failed to remove item from cart.',
  /** MSG-07: console error of error_user on every product detail page load (evidence for BUG-21) */
  detailRenderFailed: 'Error: This component failed to render!',
  /** Title of the first checkout step (destination of the Checkout button) */
  checkoutTitle: 'Checkout: Your Information',
} as const;

/**
 * SD-103 (checkout: Information, Overview, Complete): qa-runs/saucedemo-checkout-screen/test-data.md, VERBATIM.
 * MSG-04 of SD-103 is MSG.notLoggedIn(path) above (same text).
 */
export const MSG_CHECKOUT = {
  /** MSG-01 → MSG-03: [data-test=error] on the Information page */
  firstNameRequired: 'Error: First Name is required',
  lastNameRequired: 'Error: Last Name is required',
  postalCodeRequired: 'Error: Postal Code is required',
  /** MSG-05: page titles ([data-test=title]) */
  titleInfo: 'Checkout: Your Information',
  titleOverview: 'Checkout: Overview',
  titleComplete: 'Checkout: Complete!',
  /** MSG-06: Overview page */
  qtyLabel: 'QTY',
  descLabel: 'Description',
  paymentLabel: 'Payment Information:',
  paymentValue: 'SauceCard #31337',
  shippingLabel: 'Shipping Information:',
  shippingValue: 'Free Pony Express Delivery!',
  priceTotalLabel: 'Price Total',
  /** MSG-07: Complete page */
  completeHeader: 'Thank you for your order!',
  completeText: 'Your order has been dispatched, and will arrive just as fast as the pony can get there!',
  backHome: 'Back Home',
  generatePdf: 'Generate PDF order',
  /** MSG-08: PDF receipt (file name + fixed texts, in this order in the file) */
  pdfFileName: /^swag-labs-order-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.pdf$/,
  pdfThanks: 'Thank you for your order! It has been dispatched, and will arrive just as fast as the pony can get there.',
  /** MSG-09: pageerror of error_user on every key typed in Last Name (evidence for BUG-31) */
  lastNameJsError: "Cannot read properties of undefined (reading 'value')",
  /** MSG-10: pageerror of error_user when clicking Finish (evidence for BUG-33) */
  finishJsError: 'wa.cesetRart is not a function',
  /** MSG-11: Information page placeholders / labels and buttons */
  placeholderFirst: 'First Name',
  placeholderLast: 'Last Name',
  placeholderZip: 'Zip/Postal Code',
} as const;

/** Invalid data (TD-04, TD-05, TD-06) */
export const invalid = {
  username: 'unknown_user',
  password: 'wrong_password',
  veryLongUsername: 'a'.repeat(1000),
} as const;

/** Pages that require login (TD-07) */
export const protectedPages = {
  inventory: '/inventory.html',
  cart: '/cart.html',
  checkout: '/checkout-step-one.html',
  /** SD-103 TD-23: the 3 checkout pages (checkout = step one above) */
  checkoutOverview: '/checkout-step-two.html',
  checkoutComplete: '/checkout-complete.html',
  itemDetail: '/inventory-item.html',
} as const;
