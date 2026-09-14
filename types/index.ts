export type ProductCategory =
  | "Electronics"
  | "Computers & Accessories"
  | "Home & Kitchen"
  | "Fashion"
  | "Beauty & Personal Care";

export type PriceTier = "budget" | "mid-range" | "premium";

export interface Product {
  id: string;
  title: string;
  brand?: string;
  category: ProductCategory;
  description: string;
  images: [string, string, string, string];
  price: number;
  rating: number;
  reviewCount: number;
  isPrime: boolean;
  isBestSeller: boolean;
  isDeal: boolean;
  isNew: boolean;
  priceTier: PriceTier;
  discount?: { percent: number; originalPrice: number; requirement?: string };
  features: string[];
  specifications: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  id: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface TrackingStep {
  label: string;
  description: string;
  timestamp?: string;
  completed: boolean;
}

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  helpful: number;
  createdAt: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  paymentMethod?: string;
  paymentStatus?: "paid" | "pending" | "refunded" | "failed";
  shippingAddress: Address;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  placedAt: string;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  tracking: TrackingStep[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  isPrime?: boolean;
  addresses: Address[];
  orders: Order[];
}
