"use client";

import Link from "next/link";
import { useStore } from "../../context/StoreContext";

export default function DeliveryPage() {
  const { user, setDefaultAddress } = useStore();
  const selected = user.addresses.find((address) => address.isDefault) ?? user.addresses[0];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold">Delivery preferences</h1>
      <p className="mt-2 text-slate-600">Choose where you would like your orders delivered.</p>
      <section className="mt-7 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">Your delivery address</h2>
        <div className="mt-4 grid gap-3">
          {user.addresses.map((address) => (
            <label key={address.id} className={`flex cursor-pointer gap-3 rounded border p-4 ${selected?.id === address.id ? "border-amazon-orange bg-amber-50" : "border-slate-200"}`}>
              <input type="radio" name="delivery-address" checked={selected?.id === address.id} onChange={() => setDefaultAddress(address.id)} className="mt-1 accent-orange-500" />
              <span className="text-sm leading-6">{address.fullName}<br />{address.line1}<br />{address.city}, {address.state} {address.postalCode}</span>
            </label>
          ))}
        </div>
        <p className="mt-5 text-xs text-slate-500">Demo delivery locations: Seattle 98101 and Seattle 98121.</p>
      </section>
      <Link href="/" className="mt-6 inline-block rounded-full bg-amazon-yellow px-5 py-2.5 font-semibold hover:bg-amber-400">Return to shopping</Link>
    </div>
  );
}
