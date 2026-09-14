"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRequireAuth, useStore } from "../../context/StoreContext";
import { ApiClientError } from "../../lib/api";

const EMPTY_FORM = { fullName: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "United States" };

export default function AccountPage() {
  const { authUser, hydrated, orders, cartItemCount, ordersLoaded, setPrime, addAddress, removeAddress, setDefaultAddress } = useStore();
  useRequireAuth("/account");
  const address = authUser?.addresses.find((item) => item.isDefault) ?? authUser?.addresses[0];
  const [form, setForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState("");

  async function submitAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    try {
      await addAddress({ ...form, line2: form.line2 || undefined, isDefault: (authUser?.addresses.length ?? 0) === 0 });
      setForm(EMPTY_FORM);
      setAdding(false);
    } catch (error) {
      setFormError(error instanceof ApiClientError && !error.isNetworkError ? error.message : "Could not save the address. Please try again.");
    }
  }

  if (!hydrated || !authUser) return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-slate-600">Loading your account…</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold">Your account</h1>
      <p className="mt-1 text-slate-600">Welcome back, {authUser.name}.</p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Your profile</h2>
          <p className="mt-3 font-semibold">{authUser.name}</p>
          <p className="text-sm text-slate-600">{authUser.email}</p>
          <button type="button" onClick={() => setPrime(!authUser.isPrime)} className="mt-5 flex items-center gap-2 text-sm font-semibold text-amazon-link">
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${authUser.isPrime ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-600"}`}>prime</span>
            {authUser.isPrime ? "Prime is active · Turn off" : "Try Prime · Turn on"}
          </button>
          <p className="mt-4 border-t border-slate-100 pt-3"><Link href="/auth" className="text-sm font-semibold text-amazon-link hover:underline">Manage sign-in</Link></p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Default address</h2>
          {address && <address className="mt-3 text-sm not-italic leading-6">{address.fullName}<br />{address.line1}{address.line2 && <><br />{address.line2}</>}<br />{address.city}, {address.state} {address.postalCode}<br />{address.country}</address>}
          <Link href="/delivery" className="mt-4 inline-block text-sm font-semibold text-amazon-link hover:underline">Manage delivery preferences</Link>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Payment</h2>
          <p className="mt-3 text-sm">Visa ending in <strong>4242</strong></p>
          <p className="mt-1 text-xs text-slate-500">Default payment method for checkout.</p>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Your addresses</h2>
          {!adding && (
            <button type="button" onClick={() => setAdding(true)} className="rounded-full border border-slate-400 px-4 py-1.5 text-sm font-semibold hover:bg-slate-50">Add address</button>
          )}
        </div>

        {authUser.addresses.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No saved addresses yet.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {authUser.addresses.map((item) => (
              <li key={item.id} className={`rounded-lg border p-4 ${item.isDefault ? "border-amazon-orange bg-amber-50" : "border-slate-200"}`}>
                {item.isDefault && <span className="mb-2 inline-block rounded-full bg-amazon-orange px-2 py-0.5 text-xs font-bold text-amazon-navy">Default</span>}
                <address className="text-sm not-italic leading-6">{item.fullName}<br />{item.line1}{item.line2 && <>, {item.line2}</>}<br />{item.city}, {item.state} {item.postalCode}<br />{item.country}</address>
                <div className="mt-3 flex gap-3 text-sm font-semibold">
                  {!item.isDefault && <button type="button" onClick={() => setDefaultAddress(item.id)} className="text-amazon-link hover:underline">Set as default</button>}
                  <button type="button" onClick={() => removeAddress(item.id)} className="text-red-700 hover:underline">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {adding && (
          <form onSubmit={submitAddress} className="mt-5 grid gap-3 rounded-lg border border-slate-300 bg-slate-50 p-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">Full name<input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="mt-1 w-full rounded border border-slate-400 bg-white px-3 py-2 font-normal outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange" /></label>
            <label className="block text-sm font-semibold">Address line 1<input required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="mt-1 w-full rounded border border-slate-400 bg-white px-3 py-2 font-normal outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange" /></label>
            <label className="block text-sm font-semibold">Address line 2 (optional)<input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} className="mt-1 w-full rounded border border-slate-400 bg-white px-3 py-2 font-normal outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange" /></label>
            <label className="block text-sm font-semibold">City<input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1 w-full rounded border border-slate-400 bg-white px-3 py-2 font-normal outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange" /></label>
            <label className="block text-sm font-semibold">State<input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="mt-1 w-full rounded border border-slate-400 bg-white px-3 py-2 font-normal outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange" /></label>
            <label className="block text-sm font-semibold">ZIP code<input required value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="mt-1 w-full rounded border border-slate-400 bg-white px-3 py-2 font-normal outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange" /></label>
            {formError && <p role="alert" className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{formError}</p>}
            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" className="rounded-full bg-amazon-yellow px-5 py-2 text-sm font-semibold hover:bg-amber-400">Save address</button>
              <button type="button" onClick={() => { setAdding(false); setFormError(""); }} className="rounded-full border border-slate-400 px-5 py-2 text-sm font-semibold hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        )}
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link href="/orders" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-amazon-orange">
          <strong className="block text-lg">Your orders</strong><span className="mt-1 block text-sm text-slate-600">{ordersLoaded ? `${orders.length} orders · Track and manage purchases` : "Track and manage purchases"}</span>
        </Link>
        <Link href="/cart" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-amazon-orange">
          <strong className="block text-lg">Your cart</strong><span className="mt-1 block text-sm text-slate-600">{cartItemCount} items ready for checkout</span>
        </Link>
      </div>
    </div>
  );
}
