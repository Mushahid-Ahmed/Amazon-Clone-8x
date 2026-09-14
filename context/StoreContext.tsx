"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Order, Product, User } from "../types";
import type { Address, AddressInput } from "../types";
import { products } from "../data/products";
import { api, ApiClientError } from "../lib/api";

const STORAGE_KEY = "amazon-clone-store";

export interface StoreState {
  cart: CartItem[];
  savedItems: Product[];
  orders: Order[];
  recentlyViewed: Product[];
}

const initialState: StoreState = {
  cart: [],
  savedItems: [],
  orders: [],
  recentlyViewed: [],
};

type StoreAction =
  | { type: "ADD_TO_CART"; product: Product; quantity?: number }
  | { type: "REMOVE_FROM_CART"; productId: string }
  | { type: "UPDATE_CART_QUANTITY"; productId: string; quantity: number }
  | { type: "SAVE_FOR_LATER"; product: Product }
  | { type: "REMOVE_SAVED_ITEM"; productId: string }
  | { type: "MOVE_SAVED_TO_CART"; productId: string }
  | { type: "SET_CART"; items: CartItem[]; savedItems: Product[] }
  | { type: "ADD_ORDER"; order: Order }
  | { type: "RECORD_ORDER"; order: Order }
  | { type: "SET_ORDERS"; orders: Order[] }
  | { type: "SET_ORDER_STATUS"; orderId: string; status: Order["status"] }
  | { type: "ADD_RECENTLY_VIEWED"; product: Product }
  | { type: "HYDRATE"; state: StoreState };

function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case "ADD_TO_CART": {
      const quantity = Math.max(1, action.quantity ?? 1);
      const existing = state.cart.find((item) => item.product.id === action.product.id);
      return {
        ...state,
        cart: existing
          ? state.cart.map((item) =>
              item.product.id === action.product.id
                ? { ...item, quantity: Math.min(10, Math.max(1, item.quantity + quantity)) }
                : item,
            )
          : [...state.cart, { product: action.product, quantity: Math.min(10, quantity) }],
      };
    }
    case "REMOVE_FROM_CART":
      return { ...state, cart: state.cart.filter((item) => item.product.id !== action.productId) };
    case "UPDATE_CART_QUANTITY":
      return {
        ...state,
        cart:
          action.quantity > 0
            ? state.cart.map((item) =>
                item.product.id === action.productId
                  ? { ...item, quantity: Math.min(10, Math.max(1, action.quantity)) }
                  : item,
              )
            : state.cart.filter((item) => item.product.id !== action.productId),
      };
    case "SAVE_FOR_LATER":
      return state.savedItems.some((product) => product.id === action.product.id)
        ? state
        : { ...state, savedItems: [...state.savedItems, action.product] };
    case "REMOVE_SAVED_ITEM":
      return { ...state, savedItems: state.savedItems.filter((product) => product.id !== action.productId) };
    case "MOVE_SAVED_TO_CART": {
      const product = state.savedItems.find((item) => item.id === action.productId);
      if (!product) return state;
      const next = storeReducer(state, { type: "ADD_TO_CART", product });
      return {
        ...next,
        savedItems: next.savedItems.filter((item) => item.id !== action.productId),
      };
    }
    case "SET_CART":
      return { ...state, cart: action.items, savedItems: action.savedItems };
    case "ADD_ORDER":
      return { ...state, orders: [action.order, ...state.orders], cart: [] };
    case "RECORD_ORDER":
      return state.orders.some((order) => order.id === action.order.id)
        ? state
        : { ...state, orders: [action.order, ...state.orders] };
    case "SET_ORDERS":
      return { ...state, orders: action.orders };
    case "SET_ORDER_STATUS":
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.orderId ? { ...order, status: action.status } : order,
        ),
      };
    case "ADD_RECENTLY_VIEWED":
      return {
        ...state,
        recentlyViewed: [
          action.product,
          ...state.recentlyViewed.filter((product) => product.id !== action.product.id),
        ].slice(0, 10),
      };
    case "HYDRATE":
      return action.state;
    default:
      return state;
  }
}

export interface StoreContextValue extends StoreState {
  mounted: boolean;
  hydrated: boolean;
  authReady: boolean;
  offline: boolean;
  authUser: User | null;
  ordersLoaded: boolean;
  cartItemCount: number;
  cartSubtotal: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  saveForLater: (product: Product) => void;
  removeSavedItem: (productId: string) => void;
  moveSavedToCart: (productId: string) => void;
  recordOrder: (order: Order) => void;
  placeOrderRemote: (address: Address, paymentMethod: string) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  addRecentlyViewed: (product: Product) => void;
  setPrime: (isPrime: boolean) => void;
  setDefaultAddress: (addressId: string) => void;
  addAddress: (address: AddressInput) => Promise<Address>;
  removeAddress: (addressId: string) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

function sanitizeStoredState(value: unknown): StoreState {
  if (!value || typeof value !== "object") return initialState;
  const saved = value as Partial<StoreState>;
  const knownProducts = new Map(products.map((product) => [product.id, product]));
  const cart = Array.isArray(saved.cart)
    ? saved.cart.flatMap((item) => {
        const product = item && typeof item === "object" ? knownProducts.get((item as { product?: { id?: string } }).product?.id ?? "") : undefined;
        const rawQuantity = item && typeof item === "object" ? Number((item as { quantity?: unknown }).quantity) : 0;
        return product && Number.isFinite(rawQuantity) && rawQuantity > 0
          ? [{ product, quantity: Math.min(10, Math.max(1, Math.floor(rawQuantity))) }]
          : [];
      })
    : [];
  const savedItems = Array.isArray(saved.savedItems)
    ? saved.savedItems.flatMap((item) => (item && typeof item === "object" && knownProducts.has((item as { id?: string }).id ?? "")
      ? [knownProducts.get((item as { id: string }).id)!]
      : []))
    : [];
  return { ...initialState, cart, savedItems };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [offline, setOffline] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  // Orders and the signed-in user's cart are server-owned: they are only ever
  // populated from API responses, never from localStorage or client fabrication.
  const syncUserScopedData = useCallback(async () => {
    try {
      const [ordersResponse, cartResponse] = await Promise.all([
        api.get<{ orders: Order[] }>("/api/orders"),
        api.get<{ items: CartItem[]; savedItems: Product[] }>("/api/cart"),
      ]);
      dispatch({ type: "SET_ORDERS", orders: ordersResponse.orders });
      dispatch({ type: "SET_CART", items: cartResponse.items, savedItems: cartResponse.savedItems });
      setOffline(false);
    } catch (error) {
      if (error instanceof ApiClientError && error.isNetworkError) setOffline(true);
    } finally {
      setOrdersLoaded(true);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    let cancelled = false;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        dispatch({ type: "HYDRATE", state: sanitizeStoredState(JSON.parse(stored)) });
      }
    } catch {
      // Invalid or unavailable storage should not prevent the storefront from rendering.
    } finally {
      setHydrated(true);
    }
    api
      .get<{ user: User | null }>("/api/auth/me")
      .then(async ({ user }) => {
        if (cancelled || !user) return;
        setAuthUser(user);
        await syncUserScopedData();
      })
      .catch((error) => {
        if (!cancelled && error instanceof ApiClientError && error.isNetworkError) setOffline(true);
      })
      // Route guards must not act until the session check resolves, otherwise
      // a logged-in visitor gets bounced to /auth on every page load.
      .finally(() => {
        if (!cancelled) setAuthReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [syncUserScopedData]);

  useEffect(() => {
    // Only device-local, guest-scoped data is persisted; orders and the
    // signed-in account live exclusively on the server.
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart: state.cart, savedItems: state.savedItems }));
    }
  }, [hydrated, state.cart, state.savedItems]);

  // Fire-and-forget mirror to the API: local state stays authoritative so the
  // UI never blocks on the network, but every mutation is persisted server-side.
  // Controllers are tracked so the auth transition can abort stragglers whose
  // late Set-Cookie would otherwise overwrite the freshly issued session cookie.
  const pendingMirrors = useRef(new Set<AbortController>());

  function mirror(makeRequest: (signal: AbortSignal) => Promise<unknown>) {
    const controller = new AbortController();
    pendingMirrors.current.add(controller);
    makeRequest(controller.signal)
      .then(() => setOffline(false))
      .catch((error) => {
        if (error instanceof ApiClientError && error.code === "ABORTED") return;
        if (error instanceof ApiClientError && error.isNetworkError) setOffline(true);
      })
      .finally(() => pendingMirrors.current.delete(controller));
  }

  function abortPendingMirrors() {
    for (const controller of pendingMirrors.current) controller.abort();
    pendingMirrors.current.clear();
  }

  // Guest-cart carry-over at the auth transition. The server merge only covers
  // carts it already knows about; items still queued in local state (mirror not
  // yet flushed, or its request lost to a navigation) are pushed here so the
  // account cart ends up matching what the guest actually had.
  const reconcileCartWithServer = useCallback(async () => {
    if (state.cart.length === 0) return;
    const { items } = await api.get<{ items: CartItem[] }>("/api/cart");
    for (const item of state.cart) {
      const existing = items.find((entry) => entry.product.id === item.product.id);
      if (!existing) {
        await api.post("/api/cart", { productId: item.product.id, quantity: item.quantity });
      } else if (existing.quantity !== item.quantity) {
        await api.patch(`/api/cart/${item.product.id}`, { quantity: item.quantity });
      }
    }
  }, [state.cart]);

  const refreshAddresses = useCallback(async () => {
    if (!authUser) return;
    try {
      const { addresses } = await api.get<{ addresses: Address[] }>("/api/addresses");
      setAuthUser((prev) => (prev ? { ...prev, addresses } : prev));
    } catch {
      // Offline: local state already reflects the optimistic change.
    }
  }, [authUser]);

  const value = useMemo<StoreContextValue>(
    () => ({
      ...state,
      mounted,
      hydrated,
      authReady,
      offline,
      authUser,
      ordersLoaded,
      cartItemCount: state.cart.reduce((count, item) => count + item.quantity, 0),
      cartSubtotal: state.cart.reduce((total, item) => total + item.product.price * item.quantity, 0),
      addToCart: (product, quantity) => {
        dispatch({ type: "ADD_TO_CART", product, quantity });
        mirror((signal) => api.post("/api/cart", { productId: product.id, quantity: quantity ?? 1 }, { signal }));
      },
      removeFromCart: (productId) => {
        dispatch({ type: "REMOVE_FROM_CART", productId });
        mirror((signal) => api.del(`/api/cart/${productId}`, { signal }));
      },
      updateCartQuantity: (productId, quantity) => {
        dispatch({ type: "UPDATE_CART_QUANTITY", productId, quantity });
        if (quantity > 0) mirror((signal) => api.patch(`/api/cart/${productId}`, { quantity }, { signal }));
        else mirror((signal) => api.del(`/api/cart/${productId}`, { signal }));
      },
      saveForLater: (product) => {
        dispatch({ type: "SAVE_FOR_LATER", product });
        mirror((signal) => api.post(`/api/cart/${product.id}/save`, undefined, { signal }));
      },
      removeSavedItem: (productId) => {
        dispatch({ type: "REMOVE_SAVED_ITEM", productId });
        mirror((signal) => api.del(`/api/cart/${productId}`, { signal }));
      },
      moveSavedToCart: (productId) => {
        dispatch({ type: "MOVE_SAVED_TO_CART", productId });
        mirror((signal) => api.post(`/api/cart/${productId}/move-to-cart`, undefined, { signal }));
      },
      recordOrder: (order) => dispatch({ type: "RECORD_ORDER", order }),
      placeOrderRemote: async (address, paymentMethod) => {
        const server = await api.get<{ items: CartItem[] }>("/api/cart");
        for (const item of state.cart) {
          const existing = server.items.find((entry) => entry.product.id === item.product.id);
          if (!existing) {
            await api.post("/api/cart", { productId: item.product.id, quantity: item.quantity });
          } else if (existing.quantity !== item.quantity) {
            await api.patch(`/api/cart/${item.product.id}`, { quantity: item.quantity });
          }
        }
        const { order } = await api.post<{ order: Order }>("/api/orders", {
          address: {
            fullName: address.fullName,
            line1: address.line1,
            line2: address.line2 || undefined,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
          },
          paymentMethod,
        });
        setOffline(false);
        dispatch({ type: "ADD_ORDER", order });
        return order;
      },
      cancelOrder: async (orderId) => {
        try {
          await api.post(`/api/orders/${orderId}/cancel`);
          dispatch({ type: "SET_ORDER_STATUS", orderId, status: "cancelled" });
          return true;
        } catch {
          return false;
        }
      },
      addRecentlyViewed: (product) => dispatch({ type: "ADD_RECENTLY_VIEWED", product }),
      setPrime: (isPrime) => {
        if (!authUser) return;
        setAuthUser((prev) => (prev ? { ...prev, isPrime } : prev));
        mirror((signal) => api.patch("/api/users/me", { isPrime }, { signal }));
      },
      setDefaultAddress: (addressId) => {
        if (!authUser) return;
        setAuthUser((prev) =>
          prev
            ? { ...prev, addresses: prev.addresses.map((address) => ({ ...address, isDefault: address.id === addressId })) }
            : prev,
        );
        mirror((signal) => api.patch(`/api/addresses/${addressId}`, { isDefault: true }, { signal }).then(refreshAddresses));
      },
      addAddress: async (address) => {
        const { address: created } = await api.post<{ address: Address }>("/api/addresses", {
          ...address,
          line2: address.line2 || undefined,
        });
        setOffline(false);
        setAuthUser((prev) => (prev ? { ...prev, addresses: [...prev.addresses, created] } : prev));
        void refreshAddresses();
        return created;
      },
      removeAddress: (addressId) => {
        if (!authUser) return;
        setAuthUser((prev) => (prev ? { ...prev, addresses: prev.addresses.filter((address) => address.id !== addressId) } : prev));
        mirror((signal) => api.del(`/api/addresses/${addressId}`, { signal }).then(refreshAddresses));
      },
      signIn: async (email, password) => {
        abortPendingMirrors();
        const { user } = await api.post<{ user: User }>("/api/auth/login", { email, password });
        setAuthUser(user);
        setOffline(false);
        await reconcileCartWithServer();
        await syncUserScopedData();
      },
      signUp: async (name, email, password) => {
        abortPendingMirrors();
        const { user } = await api.post<{ user: User }>("/api/auth/register", { name, email, password });
        setAuthUser(user);
        setOffline(false);
        await reconcileCartWithServer();
        await syncUserScopedData();
      },
      signOut: async () => {
        await api.post("/api/auth/logout").catch(() => undefined);
        setAuthUser(null);
        setOrdersLoaded(false);
        dispatch({ type: "SET_ORDERS", orders: [] });
      },
    }),
    [authReady, authUser, hydrated, mounted, offline, ordersLoaded, reconcileCartWithServer, refreshAddresses, state, syncUserScopedData],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
}

// Route protection for account-scoped pages: sends unauthenticated visitors to
// sign-in and brings them back to the requested page afterwards. Pages must
// still guard their render on authUser — this hook only performs the redirect.
export function useRequireAuth(redirectPath: string) {
  const { authUser, authReady } = useStore();
  const router = useRouter();
  useEffect(() => {
    if (authReady && !authUser) {
      router.replace(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
    }
  }, [authUser, authReady, redirectPath, router]);
}
