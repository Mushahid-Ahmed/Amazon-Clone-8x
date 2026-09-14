import type { Address, CartItem, Order, PriceTier, Product, ProductCategory, TrackingStep, User } from "../../types";
import type { Prisma } from "@prisma/client";

type ProductRow = Prisma.ProductGetPayload<Record<string, never>>;

export type UserWithAddresses = Prisma.UserGetPayload<{ include: { addresses: true } }>;

type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true; events: true } }>;

type CartItemWithProduct = Prisma.CartItemGetPayload<{ include: { product: true } }>;

export type AddressRow = {
  id: string;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    brand: row.brand ?? undefined,
    category: row.category as ProductCategory,
    description: row.description,
    images: JSON.parse(row.images) as Product["images"],
    price: row.price,
    rating: row.rating,
    reviewCount: row.reviewCount,
    isPrime: row.isPrime,
    isBestSeller: row.isBestSeller,
    isDeal: row.isDeal,
    isNew: row.isNew,
    priceTier: row.priceTier as PriceTier,
    discount:
      row.discountPercent != null && row.originalPrice != null
        ? {
            percent: row.discountPercent,
            originalPrice: row.originalPrice,
            requirement: row.discountRequirement ?? undefined,
          }
        : undefined,
    features: JSON.parse(row.features) as string[],
    specifications: JSON.parse(row.specifications) as Record<string, string>,
  };
}

export function toAddress(row: AddressRow): Address {
  return {
    id: row.id,
    fullName: row.fullName,
    line1: row.line1,
    line2: row.line2 ?? undefined,
    city: row.city,
    state: row.state,
    postalCode: row.postalCode,
    country: row.country,
    isDefault: row.isDefault,
  };
}

export function toUser(row: UserWithAddresses): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    isPrime: row.isPrime,
    addresses: row.addresses.map(toAddress),
    orders: [],
  };
}

export function toOrder(row: OrderWithItems): Order {
  const tracking: TrackingStep[] = row.events
    .slice()
    .sort((a, b) => a.sortIndex - b.sortIndex)
    .map((event) => ({
      label: event.label,
      description: event.description,
      timestamp: event.timestamp?.toISOString(),
      completed: event.completed,
    }));
  return {
    id: row.id,
    items: row.items.map((item) => ({
      product: {
        id: item.productId,
        title: item.title,
        category: "Electronics" as ProductCategory,
        description: "",
        images: [item.image, item.image, item.image, item.image] as Product["images"],
        price: item.price,
        rating: 0,
        reviewCount: 0,
        isPrime: true,
        isBestSeller: false,
        isDeal: false,
        isNew: false,
        priceTier: "mid-range" as PriceTier,
        features: [],
        specifications: {},
      } satisfies Product,
      quantity: item.quantity,
    })),
    paymentMethod: row.paymentMethod,
    shippingAddress: JSON.parse(row.shippingAddress) as Address,
    subtotal: row.subtotal,
    shipping: row.shipping,
    tax: row.tax,
    total: row.total,
    placedAt: row.placedAt.toISOString(),
    status: row.status as Order["status"],
    tracking,
  };
}

export function toCartItem(row: CartItemWithProduct): CartItem {
  return { product: toProduct(row.product), quantity: row.quantity };
}
