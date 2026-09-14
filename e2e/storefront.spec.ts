import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
});

const stamp = Date.now();

function creds(label: string) {
  const id = `${stamp}-${label}-${test.info().project.name}`;
  return { name: `E2E ${label}`, email: `e2e.${id}@example.com`, password: "password123" };
}

// Registering through the context's request API shares the session cookie with
// every page in that browser context, so the pages are authenticated.
async function registerViaApi(context: BrowserContext, user: { name: string; email: string; password: string }) {
  const res = await context.request.post("/api/auth/register", { data: user });
  expect(res.status(), `register ${user.email}`).toBe(201);
}

async function addAndOrder(context: BrowserContext, productId: string) {
  const add = await context.request.post("/api/cart", { data: { productId, quantity: 1 } });
  expect(add.status(), `add ${productId}`).toBe(201);
  const res = await context.request.post("/api/orders", {
    data: {
      address: { fullName: "E2E Tester", line1: "1 Test Way", city: "Seattle", state: "WA", postalCode: "98101", country: "United States" },
      paymentMethod: "Cash on delivery",
    },
  });
  expect(res.status(), "place order").toBe(201);
  return (await res.json()).order.id as string;
}

async function addGuestItem(page: Page) {
  await page.goto("/product/prod-01");
  const buyBox = page.locator("aside").filter({ hasText: "Secure transaction" });
  await buyBox.getByRole("button", { name: "Increase quantity" }).click();
  await buyBox.getByRole("button", { name: "Add to Cart" }).click();
  await expect(page.getByRole("dialog", { name: "Shopping cart" }).getByText("Added to cart")).toBeVisible();
  // The cart only survives a full page load once the persistence effect has
  // flushed to localStorage, so wait for it before navigating.
  await page.waitForFunction(() => {
    const raw = localStorage.getItem("amazon-clone-store");
    return Boolean(raw?.includes('"quantity":2'));
  });
}

test("homepage is usable with keyboard and image names", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /savings are here|workspace|home feel|prime picks/i })).toBeVisible();
  await expect(page.locator("img")).not.toHaveCount(0);
  await expect(page.locator("img").first()).toHaveAttribute("alt");
  await page.getByLabel("Search products").focus();
  await expect(page.getByLabel("Search products")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Search" })).toBeFocused();
});

test("search handles query, invalid filters, and no-result recovery", async ({ page }) => {
  await page.goto("/search?q=keyboard&minPrice=not-a-number&sort=unknown");
  await expect(page.getByRole("heading", { name: /Results for "keyboard"/ })).toBeVisible();
  await expect(page.getByText(/results$/)).toBeVisible();
  await page.goto("/search?q=definitely-no-such-product");
  await expect(page.getByRole("heading", { name: "No results found" })).toBeVisible();
  await page.getByRole("link", { name: "Clear filters" }).click();
  await expect(page).toHaveURL(/\/search(?:\?.*)?$/);
});

test("PDP enforces quantity bounds and adds to cart", async ({ page }) => {
  await page.goto("/product/prod-01");
  await expect(page.locator("img[alt='Echo Dot Smart Speaker']").first()).toBeVisible();
  const buyBox = page.locator("aside").filter({ hasText: "Secure transaction" });
  const increase = buyBox.getByRole("button", { name: "Increase quantity" });
  for (let i = 0; i < 12 && await increase.isEnabled(); i++) await increase.click();
  await expect(buyBox.getByLabel("Quantity: 10")).toBeVisible();
  await expect(increase).toBeDisabled();
  await buyBox.getByRole("button", { name: "Add to Cart" }).click();
  await page.waitForFunction(() => Boolean(localStorage.getItem("amazon-clone-store")?.includes('"quantity":10')));
  await page.goto("/cart");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Cart (10 items)" })).toBeVisible({ timeout: 15_000 });
});

test("new-user journey: guest cart, sign-in gate, checkout, orders, tracking", async ({ page }) => {
  const user = creds("journey");
  await addGuestItem(page);
  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "Cart (2 items)" })).toBeVisible({ timeout: 15_000 });

  // A guest cannot check out — the attempt lands on sign-in with a return path.
  await page.getByRole("button", { name: "Proceed to checkout" }).click();
  await expect(page).toHaveURL(/\/auth\?redirect=%2Fcheckout/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

  // Register a real account from the sign-in page.
  await page.getByRole("tab", { name: "Create account" }).click();
  await page.getByLabel("Your name").fill(user.name);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Create your account" }).click();

  // Back at checkout with the guest cart carried over to the account.
  // Dev compiles the route on demand, so the navigation can take several seconds.
  await expect(page).toHaveURL(/\/checkout/, { timeout: 20_000 });
  await expect(page.getByRole("heading", { name: "Shipping address" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Items (2)")).toBeVisible();

  await page.getByLabel("Full name").fill("E2E Journey");
  await page.getByLabel("Address").fill("1 Test Way");
  await page.getByLabel("City").fill("Seattle");
  await page.getByLabel("State").fill("WA");
  await page.getByLabel("ZIP code").fill("98101");
  await page.getByRole("button", { name: "Use this address" }).click();
  await expect(page.getByRole("heading", { name: "Payment method" })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Review your order" })).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Review your order" })).toBeVisible();
  await page.getByRole("button", { name: "Place your order" }).click();
  await expect(page.getByRole("heading", { name: "Thank you for your order!" })).toBeVisible({ timeout: 20_000 });

  // The confirmation survives a reload: the order lives on the server, not in localStorage.
  const orderId = page.url().split("/").pop() ?? "";
  expect(orderId).toMatch(/^ORDER-|^ORD/);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Thank you for your order!" })).toBeVisible({ timeout: 15_000 });

  // The order shows up in My Orders for this account.
  await page.getByRole("link", { name: "View your orders" }).click();
  await expect(page.getByRole("heading", { name: "Your Orders" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("link", { name: orderId })).toBeVisible({ timeout: 15_000 });

  // Tracking the package opens the order with its progress.
  await page.getByRole("link", { name: "Track package" }).first().click();
  await expect(page).toHaveURL(new RegExp(`/order-confirmation/${orderId}`));
  await expect(page.getByRole("heading", { name: "Thank you for your order!" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Order details" })).toBeVisible();
});

test("orders are private: another account cannot see or fetch them", async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const orderId = await (async () => {
    await registerViaApi(contextA, creds("iso-a"));
    return addAndOrder(contextA, "prod-02");
  })();

  const pageA = await contextA.newPage();
  await pageA.goto("/orders");
  await expect(pageA.getByRole("link", { name: orderId })).toBeVisible({ timeout: 15_000 });

  const pageB = await contextB.newPage();
  await registerViaApi(contextB, creds("iso-b"));
  await pageB.goto("/orders");
  await expect(pageB.getByRole("heading", { name: "Your Orders" })).toBeVisible({ timeout: 15_000 });
  await expect(pageB.getByText(/haven.t placed any orders yet/)).toBeVisible({ timeout: 15_000 });

  // Direct URL access to user A's order is rejected — the backend, not the UI, says no.
  await pageB.goto(`/order-confirmation/${orderId}`);
  await expect(pageB.getByRole("heading", { name: "Order not found" })).toBeVisible({ timeout: 15_000 });
  const apiGet = await contextB.request.get(`/api/orders/${orderId}`);
  expect(apiGet.status()).toBe(404);
  const apiCancel = await contextB.request.post(`/api/orders/${orderId}/cancel`);
  expect(apiCancel.status()).toBe(404);

  await contextA.close();
  await contextB.close();
});

test("logout locks account pages, orders, tracking, and checkout", async ({ browser }) => {
  const context = await browser.newContext();
  const user = creds("logout");
  await registerViaApi(context, user);
  const orderId = await addAndOrder(context, "prod-03");
  const page = await context.newPage();

  await page.goto("/account");
  await expect(page.getByRole("heading", { name: "Your account" })).toBeVisible({ timeout: 15_000 });

  // Sign out from the header (desktop and mobile variants both exist in the DOM).
  await page.locator("button:visible", { hasText: "Sign out" }).click();
  await expect(page).toHaveURL(/\/auth\?redirect=%2Faccount/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

  // Every account-scoped route now requires signing in again.
  for (const route of ["/account", "/orders", "/delivery"]) {
    await page.goto(route);
    await expect(page).toHaveURL(new RegExp(`auth\\?redirect=${encodeURIComponent(route)}`));
  }
  await page.goto(`/order-confirmation/${orderId}`);
  await expect(page).toHaveURL(/auth\?redirect=/);

  // The server session itself is gone: direct API access is rejected.
  const ordersApi = await context.request.get("/api/orders");
  expect(ordersApi.status()).toBe(401);

  // Checkout requires an account again.
  await page.goto("/checkout");
  await expect(page).toHaveURL(/\/auth\?redirect=%2Fcheckout/);
  await context.close();
});

test("invalid credentials are rejected with clear errors", async ({ page, browser }) => {
  const user = creds("badcred");
  const seedContext = await browser.newContext();
  await registerViaApi(seedContext, user);
  await seedContext.close();

  await page.goto("/auth");
  const formAlert = page.locator("form p[role='alert']");
  // Real account, wrong password.
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill("totally-wrong-pass");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(formAlert).toHaveText("Incorrect email or password.");
  // Account that does not exist.
  await page.getByLabel("Email").fill(`nobody.${stamp}@example.com`);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(formAlert).toHaveText("Incorrect email or password.");
  // Still signed out and on the sign-in page.
  await expect(page).toHaveURL(/\/auth/);
  await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();
});

test("guest visits to protected routes bounce to sign-in; unknown pages stay friendly", async ({ page }) => {
  // Dev servers compile each route on first hit; under parallel workers that
  // can exceed the default 5s expect window before the guard redirect lands.
  const redirectTimeout = { timeout: 15_000 };
  for (const route of ["/account", "/orders", "/delivery", "/checkout"]) {
    await page.goto(route);
    await expect(page).toHaveURL(new RegExp(`auth\\?redirect=${encodeURIComponent(route)}`), redirectTimeout);
  }
  await page.goto("/order-confirmation/not-a-real-order");
  await expect(page).toHaveURL(/auth\?redirect=%2Forder-confirmation%2Fnot-a-real-order/, redirectTimeout);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await page.goto("/product/not-a-real-product-id");
  await expect(page.getByRole("heading", { name: /couldn.t find|not found/i })).toBeVisible();
});

test("stale storage does not break startup", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("amazon-clone-store", "{malformed"));
  await page.goto("/");
  await expect(page.getByRole("link", { name: /amazon\.clone/i }).first()).toBeVisible();
});

test("key routes have no serious accessibility violations", async ({ page }) => {
  for (const route of ["/", "/search", "/product/prod-01", "/cart", "/auth", "/404"]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).exclude("nav").analyze();
    expect(results.violations, `${route}: ${results.violations.map((v) => v.id).join(", ")}`).toEqual([]);
  }
});

test("critical images are loaded without layout-breaking URLs", async ({ page }) => {
  await page.goto("/");
  const images = page.locator("img");
  for (let i = 0; i < Math.min(await images.count(), 12); i++) {
    await expect(images.nth(i)).toHaveAttribute("src", /^(https?:|\/_next\/image)/);
  }
});
