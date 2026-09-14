"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Order, Product, User } from "../types";
import type { Address, AddressInput } from "../types";
import { calculateShipping, generateOrderId } from "../lib/utils";
import { products } from "../data/products";
import { api, ApiClientError } from "../lib/api";

const STORAGE_KEY = "amazon-clone-store";

const demoUser: User = {
  id: "user-demo",
  name: "Alex Rivera",
  email: "alex@demo.com",
  isPrime: true,
  addresses: [
    {
      id: "address-demo",
      fullName: "Alex Rivera",
      line1: "2101 4th Avenue",
      city: "Seattle",
      state: "WA",
      postalCode: "98121",
      country: "United States",
      isDefault: true,
    },
  ],
  orders: [],
};

export interface StoreState {
  user: User;
  cart: CartItem[];
  savedItems: Product[];
  orders: Order[];
  recentlyViewed: Product[];
}

const initialState: StoreState = {
  user: demoUser,
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
  | { type: "ADD_ORDER"; order: Order }
  | { type: "RECORD_ORDER"; order: Order }
  | { type: "MERGE_ORDERS"; orders: Order[] }
  | { type: "SET_ORDER_STATUS"; orderId: string; status: Order["status"] }
  | { type: "ADD_RECENTLY_VIEWED"; product: Product }
  | { type: "SET_PRIME"; isPrime: boolean }
  | { type: "SET_DEFAULT_ADDRESS"; addressId: string }
  | { type: "ADD_ADDRESS"; address: Address }
  | { type: "REMOVE_ADDRESS"; addressId: string }
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
    case "ADD_ORDER":
      return {
        ...state,
        orders: [action.order, ...state.orders],
        user: { ...state.user, orders: [action.order, ...state.user.orders] },
        cart: [],
      };
    case "RECORD_ORDER":
      return state.orders.some((order) => order.id === action.order.id)
        ? state
        : { ...state, orders: [action.order, ...state.orders] };
    case "MERGE_ORDERS":
      return { ...state, orders: mergeOrders(state.orders, action.orders) };
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
    case "SET_PRIME":
      return { ...state, user: { ...state.user, isPrime: action.isPrime } };
    case "SET_DEFAULT_ADDRESS":
      return {
        ...state,
        user: {
          ...state.user,
          addresses: state.user.addresses.map((address) => ({
            ...address,
            isDefault: address.id === action.addressId,
          })),
        },
      };
    case "ADD_ADDRESS":
      return { ...state, user: { ...state.user, addresses: [...state.user.addresses, action.address] } };
    case "REMOVE_ADDRESS":
      return {
        ...state,
        user: {
          ...state.user,
          addresses: state.user.addresses.filter((address) => address.id !== action.addressId),
        },
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
  offline: boolean;
  authUser: User | null;
  cartItemCount: number;
  cartSubtotal: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  saveForLater: (product: Product) => void;
  removeSavedItem: (productId: string) => void;
  moveSavedToCart: (productId: string) => void;
  addOrder: (order: Order) => void;
  recordOrder: (order: Order) => void;
  placeOrder: (address: Address, paymentMethod: string) => Order;
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
  return { ...initialState, cart, savedItems, orders: Array.isArray(saved.orders) ? saved.orders : [], recentlyViewed: [] };
}

function mergeOrders(local: Order[], remote: Order[]): Order[] {
  const seen = new Set(remote.map((order) => order.id));
  return [...remote, ...local.filter((order) => !seen.has(order.id))];
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [offline, setOffline] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);

  useEffect(() => {
    setMounted(true);
    let cancelled = false;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const saved = sanitizeStoredState(JSON.parse(stored));
        dispatch({ type: "HYDRATE", state: { ...saved, user: demoUser } });
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
        setOffline(false);
        const { orders } = await api.get<{ orders: Order[] }>("/api/orders");
        if (cancelled) return;
        dispatch({ type: "MERGE_ORDERS", orders });
      })
      .catch((error) => {
        if (!cancelled && error instanceof ApiClientError && error.isNetworkError) setOffline(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  // Fire-and-forget mirror to the API: local state stays authoritative so the
  // UI never blocks on the network, but every mutation is persisted server-side.
  function mirror(promise: Promise<unknown>) {
    promise.then(() => setOffline(false)).catch((error) => {
      if (error instanceof ApiClientError && error.isNetworkError) setOffline(true);
    });
  }

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
      offline,
      authUser,
      cartItemCount: state.cart.reduce((count, item) => count + item.quantity, 0),
      cartSubtotal: state.cart.reduce((total, item) => total + item.product.price * item.quantity, 0),
      addToCart: (product, quantity) => {
        const nextState = storeReducer(state, { type: "ADD_TO_CART", product, quantity });
        dispatch({ type: "ADD_TO_CART", product, quantity });
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        mirror(api.post("/api/cart", { productId: product.id, quantity: quantity ?? 1 }));
      },
      removeFromCart: (productId) => {
        dispatch({ type: "REMOVE_FROM_CART", productId });
        mirror(api.del(`/api/cart/${productId}`));
      },
      updateCartQuantity: (productId, quantity) => {
        dispatch({ type: "UPDATE_CART_QUANTITY", productId, quantity });
        if (quantity > 0) mirror(api.patch(`/api/cart/${productId}`, { quantity }));
        else mirror(api.del(`/api/cart/${productId}`));
      },
      saveForLater: (product) => {
        dispatch({ type: "SAVE_FOR_LATER", product });
        mirror(api.post(`/api/cart/${product.id}/save`));
      },
      removeSavedItem: (productId) => {
        dispatch({ type: "REMOVE_SAVED_ITEM", productId });
        mirror(api.del(`/api/cart/${productId}`));
      },
      moveSavedToCart: (productId) => {
        dispatch({ type: "MOVE_SAVED_TO_CART", productId });
        mirror(api.post(`/api/cart/${productId}/move-to-cart`));
      },
      addOrder: (order) => dispatch({ type: "ADD_ORDER", order }),
      recordOrder: (order) => dispatch({ type: "RECORD_ORDER", order }),
      placeOrder: (address, paymentMethod) => {
        const subtotal = state.cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
        const shipping = calculateShipping(subtotal, Boolean(state.user.isPrime));
        const tax = subtotal * 0.085;
        const order: Order = {
          id: generateOrderId(),
          items: state.cart,
          paymentMethod,
          shippingAddress: { ...address },
          subtotal,
          shipping,
          tax,
          total: subtotal + shipping + tax,
          placedAt: new Date().toISOString(),
          status: "processing",
          tracking: [
            { label: "Order placed", description: "We received your order.", timestamp: new Date().toISOString(), completed: true },
            { label: "Preparing for shipment", description: "Your items will be packed soon.", completed: false },
            { label: "Delivered", description: "Your order will arrive soon.", completed: false },
          ],
        };
        dispatch({ type: "ADD_ORDER", order });
        return order;
      },
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
        dispatch({ type: "SET_PRIME", isPrime });
        if (authUser) {
          setAuthUser((prev) => (prev ? { ...prev, isPrime } : prev));
          mirror(api.patch("/api/users/me", { isPrime }));
        }
      },
      setDefaultAddress: (addressId) => {
        dispatch({ type: "SET_DEFAULT_ADDRESS", addressId });
        if (authUser) mirror(api.patch(`/api/addresses/${addressId}`, { isDefault: true }).then(refreshAddresses));
      },
      addAddress: async (address) => {
        if (authUser) {
          const { address: created } = await api.post<{ address: Address }>("/api/addresses", {
            ...address,
            line2: address.line2 || undefined,
          });
          setOffline(false);
          dispatch({ type: "ADD_ADDRESS", address: created });
          void refreshAddresses();
          return created;
        }
        const local: Address = { ...address, id: `local-${crypto.randomUUID()}` };
        dispatch({ type: "ADD_ADDRESS", address: local });
        return local;
      },
      removeAddress: (addressId) => {
        dispatch({ type: "REMOVE_ADDRESS", addressId });
        if (authUser) mirror(api.del(`/api/addresses/${addressId}`).then(refreshAddresses));
      },
      signIn: async (email, password) => {
        const { user } = await api.post<{ user: User }>("/api/auth/login", { email, password });
        setAuthUser(user);
        setOffline(false);
        const { orders } = await api.get<{ orders: Order[] }>("/api/orders");
        dispatch({ type: "MERGE_ORDERS", orders });
      },
      signUp: async (name, email, password) => {
        const { user } = await api.post<{ user: User }>("/api/auth/register", { name, email, password });
        setAuthUser(user);
        setOffline(false);
      },
      signOut: async () => {
        await api.post("/api/auth/logout").catch(() => undefined);
        setAuthUser(null);
      },
    }),
    [authUser, hydrated, mounted, offline, refreshAddresses, state],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
}
