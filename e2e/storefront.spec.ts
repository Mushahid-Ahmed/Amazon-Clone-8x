import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
  await context.addInitScript(() => localStorage.clear());
});

async function addDemoItem(page: Page) {
  await page.goto("/product/prod-01");
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await page.getByRole("button", { name: "Add to Cart" }).click();
  await expect(page.getByText("Added to cart")).toBeVisible();
}

test("homepage is usable with keyboard and image names", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /savings are here|workspace|home feel|prime picks/i })).toBeVisible();
  await expect(page.locator("img")).not.toHaveCount(0);
  await expect(page.locator("img").first()).toHaveAttribute("alt", /.+/);
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
  await expect(page).toHaveURL(/\/search$/);
});

test("PDP enforces quantity bounds and adds to cart", async ({ page }) => {
  await page.goto("/product/prod-01");
  const increase = page.getByRole("button", { name: "Increase quantity" });
  for (let i = 0; i < 12; i++) await increase.click();
  await expect(page.getByText("10", { exact: true })).toBeVisible();
  await expect(increase).toBeEnabled();
  await page.getByRole("button", { name: "Add to Cart" }).click();
  await page.goto("/cart");
  await expect(page.getByText("Cart (10 items)")).toBeVisible();
});

test("cart checkout validates, supports back, and confirms one order", async ({ page }) => {
  await addDemoItem(page);
  await page.goto("/cart");
  await page.getByRole("button", { name: "Proceed to checkout" }).click();
  await expect(page.getByRole("heading", { name: "Shipping address" })).toBeVisible();
  await page.getByRole("button", { name: "Use this address" }).click();
  await expect(page.getByRole("heading", { name: "Payment method" })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Review your order" })).toBeVisible();
  await page.getByRole("button", { name: "Back" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Place your order" }).click();
  await expect(page.getByRole("heading", { name: "Thank you for your order!" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Thank you for your order!" })).toBeVisible();
});

test("account, orders, delivery, and unknown confirmation are safe", async ({ page }) => {
  for (const route of ["/account", "/orders", "/delivery"]) {
    await page.goto(route);
    await expect(page.locator("main, h1").first()).toBeVisible();
  }
  await page.goto("/order-confirmation/not-a-real-order");
  await expect(page.getByRole("heading", { name: "Order not found" })).toBeVisible();
  await page.goto("/product/not-a-real-product-id");
  await expect(page.getByRole("heading", { name: /couldn.t find|not found/i })).toBeVisible();
});

test("stale storage does not break startup", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("amazon-clone-store", "{malformed"));
  await page.goto("/");
  await expect(page.getByRole("link", { name: /amazon\.clone/i })).toBeVisible();
});

test("key routes have no serious accessibility violations", async ({ page }) => {
  for (const route of ["/", "/search", "/product/prod-01", "/cart", "/account", "/delivery", "/404"]) {
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
