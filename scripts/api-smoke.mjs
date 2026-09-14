/**
 * End-to-end API smoke suite. Run against a live server:
 *   npm run test:api                 (defaults to http://127.0.0.1:3000)
 *   BASE_URL=https://example.com npm run test:api
 *
 * Exercises every API surface: health, catalog, auth (registration, invalid
 * credentials, logout), addresses, cart (guest + merge on login), reviews,
 * orders (auth-required checkout, payment adapter, cancel), and per-user
 * order isolation. Exits non-zero on failures; prints a full summary.
 *
 * A warm-up pass hits every route first so dev-mode on-demand recompilation
 * can't race request bodies mid-run (Next dev loses the body when a route
 * recompiles between request arrival and handler execution).
 */

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");

let passed = 0;
const failures = [];

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  ok  ${name}`);
  } else {
    failures.push(name);
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

class Session {
  constructor() {
    this.cookie = "";
  }
  async req(method, path, body) {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
        ...(this.cookie ? { cookie: this.cookie } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) this.cookie = setCookie.split(";")[0];
    let json = null;
    try {
      json = await res.json();
    } catch {
      // leave null for non-JSON responses
    }
    return { status: res.status, json };
  }
  get(path) { return this.req("GET", path); }
  post(path, body) { return this.req("POST", path, body ?? {}); }
  patch(path, body) { return this.req("PATCH", path, body ?? {}); }
  del(path) { return this.req("DELETE", path); }
}

async function warmUp() {
  console.log("Warming routes (dev pre-compile)…");
  const anon = new Session();
  const hits = [
    ["GET", "/api/health"],
    ["GET", "/api/products?limit=1"],
    ["GET", "/api/products/prod-01"],
    ["GET", "/api/products/prod-01/reviews"],
    ["POST", "/api/auth/register", {}],
    ["GET", "/api/auth/me"],
    ["POST", "/api/auth/logout", {}],
    ["PATCH", "/api/users/me", {}],
    ["GET", "/api/addresses"],
    ["POST", "/api/addresses", {}],
    ["GET", "/api/cart"],
    ["POST", "/api/cart", {}],
    ["PATCH", "/api/cart/prod-01", {}],
    ["POST", "/api/cart/prod-01/save", {}],
    ["GET", "/api/orders"],
    ["POST", "/api/orders", {}],
    ["GET", "/api/orders/warm-id"],
    ["POST", "/api/orders/warm-id/cancel", {}],
    ["DELETE", "/api/cart/prod-01"],
    ["DELETE", "/api/addresses/warm-id"],
    ["POST", "/api/products/prod-01/reviews", {}],
    ["POST", "/api/reviews/warm-id/helpful", {}],
  ];
  for (const [method, path, payload] of hits) {
    await anon.req(method, path, payload);
  }
}

const guest = new Session();
const userA = new Session();
const userB = new Session();
const mergeGuest = new Session();
const reviewer = new Session();
const stamp = Date.now();
// One review per user per product: rotate the review target so repeat runs stay green.
const reviewProduct = `prod-${String(10 + (stamp % 39)).padStart(2, "0")}`;
const inlineAddress = {
  fullName: "Smoke Tester",
  line1: "1 Test Way",
  city: "Seattle",
  state: "WA",
  postalCode: "98101",
  country: "United States",
};
const codBody = { address: inlineAddress, paymentMethod: "Cash on delivery" };
const body = (r) => JSON.stringify(r.json?.error ?? r.json ?? null);

async function main() {
  console.log(`\nAPI smoke suite against ${BASE}\n`);
  await warmUp();

  // --- health ---------------------------------------------------------------
  const health = await guest.get("/api/health");
  check("health: 200", health.status === 200, `got ${health.status}`);
  check("health: database up", health.json?.database === "up");
  check("health: products seeded", (health.json?.products ?? 0) >= 40, `products=${health.json?.products}`);

  // --- catalog ----------------------------------------------------------------
  const list = await guest.get("/api/products?limit=5");
  check("products: list 200", list.status === 200);
  check("products: non-empty page", Array.isArray(list.json?.products) && list.json.products.length === 5);
  check("products: total/pages present", typeof list.json?.total === "number" && typeof list.json?.pages === "number");

  const search = await guest.get("/api/products?q=keyboard");
  check("products: search 200", search.status === 200);
  check(
    "products: search matches query",
    Array.isArray(search.json?.products) && search.json.products.every((p) =>
      [p.title, p.brand, p.description, p.category].filter(Boolean).some((value) => value.toLowerCase().includes("keyboard"))),
  );

  const detail = await guest.get("/api/products/prod-01");
  check("products: detail 200", detail.status === 200 && detail.json?.product?.id === "prod-01");

  const missing = await guest.get("/api/products/does-not-exist");
  check("products: unknown id 404", missing.status === 404);

  const reviewsList = await guest.get("/api/products/prod-01/reviews");
  check("reviews: list 200", reviewsList.status === 200 && Array.isArray(reviewsList.json?.reviews));
  check("reviews: seeded data present", (reviewsList.json?.total ?? 0) > 0, `total=${reviewsList.json?.total}`);

  // --- auth: registration + credential validation ------------------------------
  const emailA = `smoke.a.${stamp}@example.com`;
  const emailB = `smoke.b.${stamp}@example.com`;
  const emailMerged = `smoke.merge.${stamp}@example.com`;
  const registeredA = await userA.post("/api/auth/register", { name: "Smoke Tester A", email: emailA, password: "password123" });
  check("auth: register user A 201", registeredA.status === 201, `got ${registeredA.status}`);
  check("auth: register returns user", registeredA.json?.user?.email === emailA);

  const registeredB = await userB.post("/api/auth/register", { name: "Smoke Tester B", email: emailB, password: "password123" });
  check("auth: register user B 201", registeredB.status === 201, `got ${registeredB.status}`);

  const meA = await userA.get("/api/auth/me");
  check("auth: me returns session user", meA.status === 200 && meA.json?.user?.email === emailA);

  const meGuest = await guest.get("/api/auth/me");
  check("auth: guest me returns null user", meGuest.status === 200 && meGuest.json?.user === null, `got ${meGuest.status} ${body(meGuest)}`);

  const dup = await new Session().post("/api/auth/register", { name: "Smoke Tester", email: emailA, password: "password123" });
  check("auth: duplicate register 409", dup.status === 409, `got ${dup.status}`);

  const badLogin = await new Session().post("/api/auth/login", { email: emailA, password: "wrong-password" });
  check("auth: wrong password 401", badLogin.status === 401 && badLogin.json?.error?.code === "INVALID_CREDENTIALS", `got ${badLogin.status} ${body(badLogin)}`);

  const unknownLogin = await new Session().post("/api/auth/login", { email: `nobody.${stamp}@example.com`, password: "password123" });
  check("auth: unknown email 401", unknownLogin.status === 401 && unknownLogin.json?.error?.code === "INVALID_CREDENTIALS", `got ${unknownLogin.status} ${body(unknownLogin)}`);

  // --- profile ----------------------------------------------------------------
  const primeOff = await userA.patch("/api/users/me", { isPrime: false });
  check("users: PATCH isPrime=false", primeOff.status === 200 && primeOff.json?.user?.isPrime === false);
  const primeOn = await userA.patch("/api/users/me", { isPrime: true });
  check("users: PATCH isPrime=true restores", primeOn.status === 200 && primeOn.json?.user?.isPrime === true);
  const guestProfile = await guest.patch("/api/users/me", { isPrime: true });
  check("users: guest PATCH 401", guestProfile.status === 401, `got ${guestProfile.status} ${body(guestProfile)}`);

  // --- addresses (user A) --------------------------------------------------------
  const created = await userA.post("/api/addresses", { ...inlineAddress });
  check("addresses: create 201", created.status === 201, `got ${created.status}`);
  const addressIdA = created.json?.address?.id;
  check("addresses: id returned", typeof addressIdA === "string");

  const listAddr = await userA.get("/api/addresses");
  check("addresses: list contains new address", Array.isArray(listAddr.json?.addresses) && listAddr.json.addresses.some((a) => a.id === addressIdA));

  const setDefault = await userA.patch(`/api/addresses/${addressIdA}`, { isDefault: true });
  check("addresses: set default", setDefault.status === 200 && setDefault.json?.address?.isDefault === true);

  const guestAddresses = await guest.get("/api/addresses");
  check("addresses: guest list 401", guestAddresses.status === 401, `got ${guestAddresses.status}`);

  const foreignAddrList = await userB.get("/api/addresses");
  check("addresses: user B list empty (isolation)", Array.isArray(foreignAddrList.json?.addresses) && foreignAddrList.json.addresses.length === 0, `count=${foreignAddrList.json?.addresses?.length}`);

  // --- cart (guest) -----------------------------------------------------------
  const added = await guest.post("/api/cart", { productId: "prod-01", quantity: 2 });
  check("cart: guest add 201", added.status === 201, `got ${added.status}`);
  const cart = await guest.get("/api/cart");
  const cartRow = (cart.json?.items ?? []).find((i) => i.product.id === "prod-01");
  check("cart: guest item present qty 2", cartRow?.quantity === 2, `qty=${cartRow?.quantity}`);

  await guest.patch("/api/cart/prod-01", { quantity: 3 });
  const cartAfterPatch = await guest.get("/api/cart");
  check("cart: patch qty to 3", (cartAfterPatch.json?.items ?? []).find((i) => i.product.id === "prod-01")?.quantity === 3);

  await guest.post("/api/cart/prod-01/save");
  const cartSaved = await guest.get("/api/cart");
  check("cart: save for later moves item", !(cartSaved.json?.items ?? []).some((i) => i.product.id === "prod-01") && (cartSaved.json?.savedItems ?? []).some((p) => p.id === "prod-01"));

  await guest.post("/api/cart/prod-01/move-to-cart");
  const cartMoved = await guest.get("/api/cart");
  check("cart: move back to active", (cartMoved.json?.items ?? []).some((i) => i.product.id === "prod-01") && !(cartMoved.json?.savedItems ?? []).some((p) => p.id === "prod-01"));

  const badAdd = await guest.post("/api/cart", { productId: "prod-01", quantity: 99 });
  check("cart: quantity above schema max 400", badAdd.status === 400 && badAdd.json?.error?.code === "VALIDATION_ERROR", `got ${badAdd.status}`);

  // --- guest cart merges into the account on registration -----------------------
  const mergeAdd = await mergeGuest.post("/api/cart", { productId: "prod-04", quantity: 1 });
  check("cart: guest cart staged for merge", mergeAdd.status === 201, `got ${mergeAdd.status}`);
  const mergeRegister = await mergeGuest.post("/api/auth/register", { name: "Merge Tester", email: emailMerged, password: "password123" });
  check("auth: register with guest cart 201", mergeRegister.status === 201, `got ${mergeRegister.status}`);
  const mergedCart = await mergeGuest.get("/api/cart");
  check("cart: guest cart merged into account", (mergedCart.json?.items ?? []).some((i) => i.product.id === "prod-04"), `items=${JSON.stringify((mergedCart.json?.items ?? []).map((i) => i.product.id))}`);

  // --- orders: guests are locked out --------------------------------------------
  const guestPlace = await guest.post("/api/orders", codBody);
  check("orders: guest checkout 401", guestPlace.status === 401 && guestPlace.json?.error?.code === "UNAUTHENTICATED", `got ${guestPlace.status} ${body(guestPlace)}`);

  const guestList = await guest.get("/api/orders");
  check("orders: guest list 401", guestList.status === 401 && guestList.json?.error?.code === "UNAUTHENTICATED", `got ${guestList.status} ${body(guestList)}`);

  const guestDetail = await guest.get("/api/orders/ord-whatever");
  check("orders: guest detail 401", guestDetail.status === 401 && guestDetail.json?.error?.code === "UNAUTHENTICATED", `got ${guestDetail.status} ${body(guestDetail)}`);

  const guestCancel = await guest.post("/api/orders/ord-whatever/cancel");
  check("orders: guest cancel 401", guestCancel.status === 401 && guestCancel.json?.error?.code === "UNAUTHENTICATED", `got ${guestCancel.status} ${body(guestCancel)}`);

  // --- orders: authenticated checkout (user A) -----------------------------------
  const addA = await userA.post("/api/cart", { productId: "prod-01", quantity: 2 });
  check("orders: setup cart user A", addA.status === 201, `got ${addA.status} ${body(addA)}`);
  const placed = await userA.post("/api/orders", codBody);
  check("orders: COD checkout 201", placed.status === 201, `got ${placed.status} ${body(placed)}`);
  const order = placed.json?.order;
  const orderId = order?.id;
  check("orders: order id returned", typeof orderId === "string" && orderId.length > 0);
  check("orders: status processing", order?.status === "processing");
  check("orders: COD payment pending", order?.paymentStatus === "pending");
  check("orders: server totals", order?.subtotal > 0 && order?.tax > 0 && Math.abs(order.total - (order.subtotal + order.shipping + order.tax)) < 0.01, `total=${order?.total}`);
  check("orders: free shipping over $25", order?.shipping === 0, `shipping=${order?.shipping}`);
  check("orders: tracking starts completed", order?.tracking?.[0]?.completed === true && order?.tracking?.length === 4);
  check("orders: snapshot items present", (order?.items ?? []).length > 0);
  const snapImage = order?.items?.[0]?.product?.images?.[0];
  check("orders: item snapshot image is a URL", typeof snapImage === "string" && snapImage.startsWith("http"), `image=${snapImage}`);

  const cartAfterOrder = await userA.get("/api/cart");
  check("orders: cart cleared after checkout", (cartAfterOrder.json?.items ?? []).length === 0);

  // Drain prod-01 through repeated real checkouts until the add-time stock guard
  // fires. Self-calibrating: works from any starting stock level. The drained
  // orders are cancelled afterwards (cancel restocks) so repeat runs stay green.
  let guardResponse = null;
  let guardOrders = 0;
  const drainedIds = [];
  for (let attempt = 0; attempt < 5 && !guardResponse; attempt++) {
    const add = await userA.post("/api/cart", { productId: "prod-01", quantity: 10 });
    if (add.status === 400 && add.json?.error?.code === "INSUFFICIENT_STOCK") {
      guardResponse = add;
      break;
    }
    if (add.status !== 201) { guardResponse = add; break; }
    const drained = await userA.post("/api/orders", codBody);
    if (drained.status !== 201) { guardResponse = drained; break; }
    drainedIds.push(drained.json?.order?.id);
    guardOrders += 1;
  }
  check("orders: repeated checkouts decrement stock", guardOrders >= 1, `orders=${guardOrders}`);
  check("orders: stock guard fires when drained", guardResponse?.json?.error?.code === "INSUFFICIENT_STOCK", `got ${guardResponse?.status} ${guardResponse?.json?.error?.code ?? ""}`);
  for (const id of drainedIds) await userA.post(`/api/orders/${id}/cancel`);

  // --- orders: per-user isolation --------------------------------------------------
  const gotOne = await userA.get(`/api/orders/${orderId}`);
  check("orders: owner get own order 200", gotOne.status === 200 && gotOne.json?.order?.id === orderId);

  const strangerGet = await userB.get(`/api/orders/${orderId}`);
  check("orders: user B get user A order 404", strangerGet.status === 404, `got ${strangerGet.status} ${body(strangerGet)}`);

  const strangerCancel = await userB.post(`/api/orders/${orderId}/cancel`);
  check("orders: user B cancel user A order 404", strangerCancel.status === 404, `got ${strangerCancel.status} ${body(strangerCancel)}`);

  const listA = await userA.get("/api/orders");
  check("orders: user A list contains order", (listA.json?.orders ?? []).some((o) => o.id === orderId));
  const listB = await userB.get("/api/orders");
  check("orders: user B list does not contain user A order", !(listB.json?.orders ?? []).some((o) => o.id === orderId), `ids=${JSON.stringify((listB.json?.orders ?? []).map((o) => o.id))}`);

  // --- orders: cancel --------------------------------------------------------------
  const cancelled = await userA.post(`/api/orders/${orderId}/cancel`);
  check("orders: cancel 200", cancelled.status === 200 && cancelled.json?.order?.status === "cancelled", `got ${cancelled.status}`);
  const doubleCancel = await userA.post(`/api/orders/${orderId}/cancel`);
  check("orders: double cancel 409", doubleCancel.status === 409 && doubleCancel.json?.error?.code === "ORDER_NOT_CANCELLABLE", `got ${doubleCancel.status}`);

  // --- orders: payment adapter -------------------------------------------------------
  await userA.post("/api/cart", { productId: "prod-02", quantity: 1 });
  const declined = await userA.post("/api/orders", { address: inlineAddress, paymentMethod: "0000" });
  check("orders: declined card 402", declined.status === 402 && declined.json?.error?.code === "PAYMENT_DECLINED", `got ${declined.status}`);
  const cartIntact = await userA.get("/api/cart");
  check("orders: cart intact after decline", (cartIntact.json?.items ?? []).some((i) => i.product.id === "prod-02"));

  const visa = await userA.post("/api/orders", { address: inlineAddress, paymentMethod: "4242" });
  check("orders: Visa 4242 paid", visa.status === 201 && visa.json?.order?.paymentStatus === "paid", `got ${visa.status}`);
  await userA.post(`/api/orders/${visa.json.order.id}/cancel`);

  const badAddSetup = await userA.post("/api/cart", { productId: "prod-03", quantity: 1 });
  check("orders: setup add prod-03 201", badAddSetup.status === 201, `got ${badAddSetup.status} ${body(badAddSetup)}`);
  const badMethod = await userA.post("/api/orders", { address: inlineAddress, paymentMethod: "Bogus Method" });
  check("orders: unknown method 400", badMethod.status === 400 && badMethod.json?.error?.code === "INVALID_PAYMENT_METHOD", `got ${badMethod.status} ${body(badMethod)}`);
  await userA.del("/api/cart/prod-03");

  const emptyOrder = await userA.post("/api/orders", { address: inlineAddress, paymentMethod: "4242" });
  check("orders: empty cart 400 CART_EMPTY", emptyOrder.status === 400 && emptyOrder.json?.error?.code === "CART_EMPTY", `got ${emptyOrder.status}`);

  // --- orders: saved-address checkout + foreign addressId ---------------------------
  await userA.post("/api/cart", { productId: "prod-05", quantity: 1 });
  const savedCheckout = await userA.post("/api/orders", { addressId: addressIdA, paymentMethod: "4242" });
  check("orders: addressId checkout 201", savedCheckout.status === 201 && savedCheckout.json?.order?.paymentStatus === "paid", `got ${savedCheckout.status} ${body(savedCheckout)}`);
  await userA.post(`/api/orders/${savedCheckout.json.order.id}/cancel`);

  const foreignSetup = await userB.post("/api/cart", { productId: "prod-05", quantity: 1 });
  check("orders: setup user B cart 201", foreignSetup.status === 201, `got ${foreignSetup.status} ${body(foreignSetup)}`);
  const foreignCheckout = await userB.post("/api/orders", { addressId: addressIdA, paymentMethod: "4242" });
  check("orders: user B cannot checkout with user A addressId 404", foreignCheckout.status === 404 && foreignCheckout.json?.error?.code === "NOT_FOUND", `got ${foreignCheckout.status} ${body(foreignCheckout)}`);
  await userB.del("/api/cart/prod-05");

  // --- reviews: write + helpful ---------------------------------------------------------
  const rev = await userA.post(`/api/products/${reviewProduct}/reviews`, { rating: 5, title: "Smoke review", body: "Excellent product, worked perfectly in my tests." });
  check("reviews: create 201", rev.status === 201, `got ${rev.status} ${body(rev)}`);
  const dupRev = await userA.post(`/api/products/${reviewProduct}/reviews`, { rating: 4, title: "Again", body: "Trying to review twice should fail here." });
  check("reviews: duplicate 409", dupRev.status === 409, `got ${dupRev.status}`);
  const reviewId = rev.json?.review?.id;
  const beforeHelpful = rev.json?.review?.helpful ?? 0;
  const helpful = await reviewer.post(`/api/reviews/${reviewId}/helpful`);
  check("reviews: helpful increments", helpful.status === 200 && helpful.json?.review?.helpful === beforeHelpful + 1, `got ${helpful.json?.review?.helpful}`);

  const guestReview = await guest.post(`/api/products/${reviewProduct}/reviews`, { rating: 5, title: "Nope", body: "Guests should not be able to post reviews." });
  check("reviews: guest create 401", guestReview.status === 401, `got ${guestReview.status}`);

  // --- logout kills the authenticated session -----------------------------------------
  const logout = await userB.post("/api/auth/logout");
  check("auth: logout 200", logout.status === 200);
  const meAfterLogout = await userB.get("/api/auth/me");
  check("auth: me null after logout", meAfterLogout.status === 200 && meAfterLogout.json?.user === null);
  const ordersAfterLogout = await userB.get("/api/orders");
  check("orders: list 401 after logout", ordersAfterLogout.status === 401 && ordersAfterLogout.json?.error?.code === "UNAUTHENTICATED", `got ${ordersAfterLogout.status} ${body(ordersAfterLogout)}`);

  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length > 0) {
    console.log("Failures:");
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
  console.log("All API smoke checks passed.\n");
}

main().catch((error) => {
  console.error("Smoke suite crashed:", error);
  process.exit(1);
});
