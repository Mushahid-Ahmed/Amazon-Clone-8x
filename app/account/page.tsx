"use client";

import Link from "next/link";
import { useStore } from "../../context/StoreContext";

export default function AccountPage() {
  const { user, orders, cartItemCount, setPrime } = useStore();
  const address = user.addresses.find((item) => item.isDefault) ?? user.addresses[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold">Your account</h1>
      <p className="mt-1 text-slate-600">Welcome back, {user.name}.</p>
      <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Your profile</h2>
          <p className="mt-3 font-semibold">{user.name}</p>
          <p className="text-sm text-slate-600">{user.email}</p>
          <button type="button" onClick={() => setPrime(!user.isPrime)} className="mt-5 flex items-center gap-2 text-sm font-semibold text-amazon-link">
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${user.isPrime ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-600"}`}>prime</span>
            {user.isPrime ? "Prime is active · Turn off" : "Try Prime · Turn on"}
          </button>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Default address</h2>
          {address && <address className="mt-3 text-sm not-italic leading-6">{address.fullName}<br />{address.line1}<br />{address.city}, {address.state} {address.postalCode}<br />{address.country}</address>}
          <Link href="/delivery" className="mt-4 inline-block text-sm font-semibold text-amazon-link hover:underline">Manage delivery preferences</Link>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Payment</h2>
          <p className="mt-3 text-sm">Visa ending in <strong>4242</strong></p>
          <p className="mt-1 text-xs text-slate-500">Used for your demo checkout.</p>
        </section>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link href="/orders" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-amazon-orange">
          <strong className="block text-lg">Your orders</strong><span className="mt-1 block text-sm text-slate-600">{orders.length} orders · Track and manage purchases</span>
        </Link>
        <Link href="/cart" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-amazon-orange">
          <strong className="block text-lg">Your cart</strong><span className="mt-1 block text-sm text-slate-600">{cartItemCount} items ready for checkout</span>
        </Link>
      </div>
    </div>
  );
}
