"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Order, Product, User } from "../types";
import type { Address } from "../types";
import { calculateShipping, generateOrderId } from "../lib/utils";

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
  | { type: "ADD_RECENTLY_VIEWED"; product: Product }
  | { type: "SET_PRIME"; isPrime: boolean }
  | { type: "SET_DEFAULT_ADDRESS"; addressId: string }
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
              ? { ...item, quantity: Math.min(10, item.quantity + quantity) }
                : item,
            )
          : [...state.cart, { product: action.product, quantity }],
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
                  ? { ...item, quantity: action.quantity }
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
    case "HYDRATE":
      return action.state;
    default:
      return state;
  }
}

export interface StoreContextValue extends StoreState {
  mounted: boolean;
  hydrated: boolean;
  cartItemCount: number;
  cartSubtotal: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  saveForLater: (product: Product) => void;
  removeSavedItem: (productId: string) => void;
  moveSavedToCart: (productId: string) => void;
  addOrder: (order: Order) => void;
  placeOrder: (address: Address, paymentMethod: string) => Order;
  addRecentlyViewed: (product: Product) => void;
  setPrime: (isPrime: boolean) => void;
  setDefaultAddress: (addressId: string) => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const saved = JSON.parse(stored) as StoreState;
        dispatch({
          type: "HYDRATE",
          state: {
            ...saved,
            user: {
              ...saved.user,
              name: demoUser.name,
              email: demoUser.email,
              addresses: [{ ...demoUser.addresses[0] }],
            },
          },
        });
      }
    } catch {
      // Invalid or unavailable storage should not prevent the storefront from rendering.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const value = useMemo<StoreContextValue>(
    () => ({
      ...state,
      mounted,
      hydrated,
      cartItemCount: state.cart.reduce((count, item) => count + item.quantity, 0),
      cartSubtotal: state.cart.reduce((total, item) => total + item.product.price * item.quantity, 0),
      addToCart: (product, quantity) => dispatch({ type: "ADD_TO_CART", product, quantity }),
      removeFromCart: (productId) => dispatch({ type: "REMOVE_FROM_CART", productId }),
      updateCartQuantity: (productId, quantity) =>
        dispatch({ type: "UPDATE_CART_QUANTITY", productId, quantity }),
      saveForLater: (product) => dispatch({ type: "SAVE_FOR_LATER", product }),
      removeSavedItem: (productId) => dispatch({ type: "REMOVE_SAVED_ITEM", productId }),
      moveSavedToCart: (productId) => dispatch({ type: "MOVE_SAVED_TO_CART", productId }),
      addOrder: (order) => dispatch({ type: "ADD_ORDER", order }),
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
      addRecentlyViewed: (product) => dispatch({ type: "ADD_RECENTLY_VIEWED", product }),
      setPrime: (isPrime) => dispatch({ type: "SET_PRIME", isPrime }),
      setDefaultAddress: (addressId) => dispatch({ type: "SET_DEFAULT_ADDRESS", addressId }),
    }),
    [hydrated, mounted, state],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
}
