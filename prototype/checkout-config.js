// The Node checkout host serves the storefront and order API on one origin.
// GitHub Pages remains a static preview because it cannot verify payments.
export const checkoutApiBase = location.hostname.endsWith('.github.io') ? '' : location.origin;
