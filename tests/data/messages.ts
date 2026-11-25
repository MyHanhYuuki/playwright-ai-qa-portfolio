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
 * SD-102 (products list, detail, cart): qa-runs/saucedemo-products-cart/test-data.md.
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
  /** Title of the first checkout step (destination of the Checkout button) */
  checkoutTitle: 'Checkout: Your Information',
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
  itemDetail: '/inventory-item.html',
} as const;
