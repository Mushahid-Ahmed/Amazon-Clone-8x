"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingCart, PackageOpen } from "lucide-react";
import { useMemo, useState } from "react";
import TrackingProgress from "../../components/orders/TrackingProgress";
import { useStore } from "../../context/StoreContext";
import { formatPrice } from "../../lib/utils";
import type { Product } from "../../types";

type Tab = "orders" | "buy-again" | "not-shipped";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "orders", label: "Orders" },
  { id: "buy-again", label: "Buy Again" },
  { id: "not-shipped", label: "Not Yet Shipped" },
];

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("en-US", { dateStyle: "long" });
}

function BuyAgainCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  return (
    <article className="flex min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <Link href={`/product/${product.id}`} className="group">
        <div className="relative aspect-square overflow-hidden rounded-md bg-slate-100">
          <Image src={product.images[0]} alt={product.title} fill sizes="(max-width: 640px) 45vw, 220px" className="object-cover transition group-hover:scale-105" />
        </div>
        <h3 className="mt-3 line-clamp-2 min-h-10 text-sm font-medium text-amazon-link group-hover:underline">{product.title}</h3>
      </Link>
      <p className="mt-2 text-lg font-semibold">{formatPrice(product.price)}</p>
      <button type="button" onClick={onAdd} className="mt-3 flex items-center justify-center gap-2 rounded-full bg-amazon-yellow px-3 py-2 text-sm font-semibold hover:bg-amber-400">
        <ShoppingCart size={16} /> Add to Cart
      </button>
    </article>
  );
}

export default function OrdersPage() {
  const { orders, addToCart, hydrated } = useStore();
  const [tab, setTab] = useState<Tab>("orders");
  const [query, setQuery] = useState("");
  const pastProducts = useMemo(() => {
    const seen = new Set<string>();
    return orders.flatMap((order) => order.items.map(({ product }) => product)).filter((product) => {
      if (seen.has(product.id)) return false;
      seen.add(product.id);
      return true;
    });
  }, [orders]);
  const filteredOrders = orders.filter((order) => {
    const matchesQuery = !query.trim() || order.items.some(({ product }) => product.title.toLowerCase().includes(query.trim().toLowerCase()));
    const matchesTab = tab !== "not-shipped" || !["shipped", "delivered", "cancelled"].includes(order.status);
    return matchesQuery && matchesTab;
  });

  if (!hydrated) return <div className="mx-auto max-w-7xl px-4 py-16 text-center">Loading your orders…</div>;

  return (
    <div className="bg-amazon-bg pb-12">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-3xl font-bold">Your Orders</h1><p className="mt-1 text-sm text-slate-600">Track, manage, and shop your order history.</p></div>
          <label className="flex w-full max-w-sm items-center rounded border border-slate-400 bg-white px-3 focus-within:border-amazon-orange focus-within:ring-1 focus-within:ring-amazon-orange">
            <Search size={18} className="text-slate-500" /><span className="sr-only">Search orders by title</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search all orders" className="min-w-0 flex-1 px-2 py-2 text-sm outline-none" />
          </label>
        </div>
        <div role="tablist" aria-label="Order views" className="mt-7 flex gap-6 overflow-x-auto border-b border-slate-300">
          {tabs.map((item) => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)} className={`whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-semibold ${tab === item.id ? "border-amazon-orange text-amazon-navy" : "border-transparent text-slate-600 hover:text-amazon-link"}`}>{item.label}{item.id === "orders" ? ` (${orders.length})` : ""}</button>)}
        </div>

        {tab === "buy-again" ? (
          pastProducts.length === 0 ? <EmptyState title="You haven’t bought anything yet" message="Products from completed orders will appear here for easy reordering." /> :
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{pastProducts.map((product) => <BuyAgainCard key={product.id} product={product} onAdd={() => addToCart(product)} />)}</div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState title={tab === "not-shipped" ? "No orders are waiting to ship" : query ? "No matching orders" : "You haven’t placed any orders yet"} message={query ? "Try a different product title." : "When you place an order, it will show up here."} />
        ) : (
          <div className="mt-6 space-y-5">{filteredOrders.map((order) => <article key={order.id} className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
            <header className="grid gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 text-sm sm:grid-cols-[1fr_1fr_auto] sm:items-start">
              <div><span className="block text-xs uppercase text-slate-500">Order placed</span><strong>{dateLabel(order.placedAt)}</strong></div>
              <div><span className="block text-xs uppercase text-slate-500">Total</span><strong>{formatPrice(order.total)}</strong></div>
              <div className="sm:text-right"><span className="block text-xs uppercase text-slate-500">Order #</span><Link href={`/order-confirmation/${order.id}`} className="text-amazon-link hover:underline">{order.id}</Link></div>
            </header>
            <div className="p-4 sm:p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-bold capitalize">{order.status === "processing" ? "Arriving soon" : order.status}</h2><p className="text-sm text-slate-600">{order.tracking.find((step) => step.completed)?.description ?? "We’re processing your order."}</p></div><Link href={`/order-confirmation/${order.id}`} className="text-sm font-semibold text-amazon-link hover:underline">View order details</Link></div>
              <TrackingProgress steps={order.tracking} status={order.status} />
              <div className="mt-6 divide-y divide-slate-200 border-t border-slate-200">{order.items.map(({ product, quantity }) => <div key={product.id} className="flex gap-4 py-4"><Link href={`/product/${product.id}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-slate-100"><Image src={product.images[0]} alt={product.title} fill sizes="80px" className="object-cover" /></Link><div className="min-w-0 flex-1"><Link href={`/product/${product.id}`} className="line-clamp-2 text-sm font-medium text-amazon-link hover:underline">{product.title}</Link><p className="mt-1 text-sm text-slate-600">Qty: {quantity}</p><p className="mt-1 font-semibold">{formatPrice(product.price * quantity)}</p></div><button type="button" onClick={() => addToCart(product)} className="hidden h-fit rounded-full border border-slate-400 px-3 py-2 text-xs font-semibold hover:bg-slate-50 sm:block">Buy it again</button></div>)}</div>
              <div className="mt-4 flex flex-wrap gap-3"><Link href={`/order-confirmation/${order.id}`} className="rounded-full border border-slate-400 px-4 py-2 text-sm font-semibold hover:bg-slate-50">Track package</Link><button type="button" onClick={() => order.items.forEach(({ product }) => addToCart(product))} className="rounded-full bg-amazon-yellow px-4 py-2 text-sm font-semibold hover:bg-amber-400">Add all to cart</button></div>
            </div>
          </article>)}</div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return <div className="mx-auto max-w-lg py-20 text-center"><PackageOpen size={48} className="mx-auto text-slate-400" /><h2 className="mt-4 text-xl font-bold">{title}</h2><p className="mt-2 text-sm text-slate-600">{message}</p><Link href="/" className="mt-6 inline-block rounded-full bg-amazon-yellow px-6 py-2.5 font-semibold hover:bg-amber-400">Continue shopping</Link></div>;
}
