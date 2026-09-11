import type { Metadata } from "next";
export const metadata: Metadata = { title: "Shopping Cart", description: "Review items, saved products, and checkout securely." };
export default function CartLayout({ children }: { children: React.ReactNode }) { return children; }
