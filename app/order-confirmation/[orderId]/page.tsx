"use client";

import Link from "next/link";
import { CheckCircle2, Package, Truck } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "../../../context/StoreContext";
import { api } from "../../../lib/api";
import { formatPrice } from "../../../lib/utils";
import type { Order } from "../../../types";

export default function OrderConfirmationPage() {
  const params = useParams<{ orderId: string }>();
  const { orders, hydrated, recordOrder } = useStore();
  const localOrder = orders.find((item) => item.id === params.orderId);
  const [remoteOrder, setRemoteOrder] = useState<Order | null>(null);
  const [checkedRemote, setCheckedRemote] = useState(false);

  useEffect(() => {
    if (localOrder || !hydrated || checkedRemote) return;
    let cancelled = false;
    api
      .get<{ order: Order }>(`/api/orders/${params.orderId}`)
      .then(({ order }) => {
        if (cancelled) return;
        setRemoteOrder(order);
        recordOrder(order);
      })
      .catch(() => {
        if (!cancelled) setCheckedRemote(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, localOrder, params.orderId, checkedRemote]);

  const order = localOrder ?? remoteOrder;

  if (!hydrated || (!order && !checkedRemote)) return <div className="mx-auto max-w-3xl px-4 py-16 text-center">Loading order…</div>;
  if (!order) return <div className="mx-auto max-w-3xl px-4 py-16 text-center"><h1 className="text-2xl font-bold">Order not found</h1><p className="mt-2 text-slate-600">This order may have been placed on another device or the link may be invalid.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/orders" className="rounded-full border border-slate-400 px-6 py-3 font-semibold">View orders</Link><Link href="/" className="rounded-full bg-amazon-yellow px-6 py-3 font-semibold">Continue shopping</Link></div></div>;

  return <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6"><section className="rounded-lg border border-emerald-200 bg-white p-6 text-center shadow-sm sm:p-10"><CheckCircle2 className="mx-auto text-emerald-600" size={54} /><h1 className="mt-4 text-3xl font-bold">Thank you for your order!</h1><p className="mt-2 text-slate-600">We&apos;ve sent your order confirmation to your account.</p><p className="mt-4 text-sm text-slate-600">Order <strong className="text-amazon-navy">{order.id}</strong> · Placed {new Date(order.placedAt).toLocaleDateString("en-US", { dateStyle: "long" })}</p></section>
    <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_280px]"><section className="rounded-lg border border-slate-300 bg-white p-5"><h2 className="text-xl font-bold">Order details</h2><div className="mt-4 divide-y divide-slate-200">{order.items.map(({ product, quantity }) => <div key={product.id} className="flex justify-between gap-4 py-3 text-sm"><span>{product.title} <span className="text-slate-500">× {quantity}</span></span><strong>{formatPrice(product.price * quantity)}</strong></div>)}</div><div className="mt-4 border-t border-slate-200 pt-4 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div><div className="mt-2 flex justify-between"><span>Shipping</span><span>{order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}</span></div><div className="mt-2 flex justify-between"><span>Tax</span><span>{formatPrice(order.tax)}</span></div><div className="mt-3 flex justify-between text-lg font-bold text-amazon-red"><span>Total</span><span>{formatPrice(order.total)}</span></div></div></section><aside className="rounded-lg border border-slate-300 bg-white p-5"><h2 className="font-bold">Delivery details</h2><p className="mt-2 text-sm text-slate-600">{order.shippingAddress.fullName}<br />{order.shippingAddress.line1}{order.shippingAddress.line2 && <><br />{order.shippingAddress.line2}</>}<br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p><div className="mt-5 border-t border-slate-200 pt-4 text-sm"><p className="flex items-center gap-2 font-semibold"><Truck size={18} className="text-emerald-700" /> Arriving soon</p><p className="mt-2 text-slate-600">{order.tracking[0]?.description}</p></div></aside></div>
    <div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/orders" className="flex items-center gap-2 rounded-full border border-slate-400 px-5 py-2.5 font-medium"><Package size={17} /> View your orders</Link><Link href="/" className="rounded-full bg-amazon-yellow px-6 py-2.5 font-semibold">Continue shopping</Link></div>
  </div>;
}
