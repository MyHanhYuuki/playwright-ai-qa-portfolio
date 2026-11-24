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
