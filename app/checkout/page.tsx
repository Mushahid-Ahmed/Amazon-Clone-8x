"use client";

import { useRouter } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { useStore } from "../../context/StoreContext";
import type { Address } from "../../types";
import { formatPrice } from "../../lib/utils";
import { products } from "../../data/products";

const steps = ["Shipping", "Payment", "Review"];
const emptyAddress: Address = {
  id: "checkout-address",
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "United States",
  isDefault: false,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotal, user, addToCart, placeOrder } = useStore();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<Address>(user.addresses.find((item) => item.isDefault) ?? emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState("Visa ending in 4242");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const shipping = cartSubtotal >= 35 ? 0 : 4.99;
  const tax = cartSubtotal * 0.085;
  const total = cartSubtotal + shipping + tax;

  function updateAddress(field: keyof Address, value: string) {
    setAddress((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function validateAddress() {
    const required: Array<keyof Address> = ["fullName", "line1", "city", "state", "postalCode"];
    const nextErrors = Object.fromEntries(required.filter((field) => !String(address[field]).trim()).map((field) => [field, "Required"])) as Record<string, string>;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function continueFromShipping(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (validateAddress()) setStep(1);
  }

  function submitOrder() {
    if (submitting || cart.length === 0) return;
    setSubmitting(true);
    const order = placeOrder(address, paymentMethod);
    router.push(`/order-confirmation/${order.id}`);
  }

  if (cart.length === 0) return <div className="mx-auto max-w-2xl px-4 py-20 text-center"><h1 className="text-3xl font-bold">Your checkout is waiting</h1><p className="mt-3 text-slate-600">Your cart is empty, but we picked a Prime favorite to get you started.</p><button type="button" onClick={() => addToCart(products[0])} className="mt-7 rounded-full bg-amazon-yellow px-6 py-3 font-semibold hover:bg-amber-400">Add Demo Prime Item to Cart &amp; Checkout</button></div>;

  return (
    <div className="bg-amazon-bg pb-10">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <nav aria-label="Checkout progress" className="mx-auto mb-7 flex max-w-2xl items-center justify-center">
          {steps.map((label, index) => <div key={label} className="flex items-center"><div className={`flex items-center gap-2 ${index <= step ? "font-bold text-amazon-navy" : "text-slate-500"}`}><span className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm ${index < step ? "border-emerald-600 bg-emerald-600 text-white" : index === step ? "border-amazon-orange bg-amazon-yellow" : "border-slate-400"}`}>{index < step ? <Check size={15} /> : index + 1}</span><span className="hidden sm:inline">{label}</span></div>{index < steps.length - 1 && <span className={`mx-2 h-px w-8 sm:mx-5 sm:w-16 ${index < step ? "bg-emerald-600" : "bg-slate-300"}`} />}</div>)}
        </nav>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <main className="rounded-lg border border-slate-300 bg-white p-5 sm:p-7">
            {step === 0 && <form onSubmit={continueFromShipping}>
              <h1 className="text-2xl font-bold">Shipping address</h1>
              <p className="mt-1 text-sm text-slate-600">Where should we deliver your order?</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {([["fullName", "Full name"], ["line1", "Address"], ["line2", "Apartment, suite, etc. (optional)"], ["city", "City"], ["state", "State"], ["postalCode", "ZIP code"]] as const).map(([field, label]) => <label key={field} className={field === "line1" || field === "line2" ? "sm:col-span-2" : ""}><span className="text-sm font-semibold">{label}</span><input value={String(address[field] ?? "")} onChange={(event) => updateAddress(field, event.target.value)} className={`mt-1 w-full rounded border px-3 py-2 outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange ${errors[field] ? "border-red-600" : "border-slate-300"}`} />{errors[field] && <span className="text-xs text-red-700">{errors[field]}</span>}</label>)}
              </div>
              <button type="submit" className="mt-6 rounded-full bg-amazon-yellow px-6 py-3 font-semibold hover:bg-amber-400">Use this address</button>
            </form>}
            {step === 1 && <section><h1 className="text-2xl font-bold">Payment method</h1><p className="mt-1 text-sm text-slate-600">Choose how you&apos;d like to pay.</p><fieldset className="mt-5 space-y-3"><legend className="sr-only">Payment options</legend>{["Visa ending in 4242", "Mastercard ending in 5555", "Cash on delivery"].map((method) => <label key={method} className={`flex cursor-pointer items-center gap-3 rounded border p-4 ${paymentMethod === method ? "border-amazon-orange bg-amber-50" : "border-slate-300"}`}><input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={(event) => setPaymentMethod(event.target.value)} /> <span>{method}</span></label>)}</fieldset><div className="mt-6 flex gap-3"><button type="button" onClick={() => setStep(0)} className="rounded-full border border-slate-400 px-5 py-2.5">Back</button><button type="button" onClick={() => setStep(2)} className="rounded-full bg-amazon-yellow px-6 py-2.5 font-semibold">Continue</button></div></section>}
            {step === 2 && <section><h1 className="text-2xl font-bold">Review your order</h1><div className="mt-5 rounded border border-slate-300 p-4"><div className="flex justify-between gap-4"><div><h2 className="font-bold">Shipping to</h2><p className="mt-1 text-sm text-slate-600">{address.fullName}<br />{address.line1}{address.line2 && <><br />{address.line2}</>}<br />{address.city}, {address.state} {address.postalCode}</p></div><button type="button" onClick={() => setStep(0)} className="text-sm text-amazon-link hover:underline">Change</button></div><div className="mt-4 border-t border-slate-200 pt-4"><h2 className="font-bold">Payment</h2><p className="mt-1 text-sm text-slate-600">{paymentMethod}</p></div></div><div className="mt-6 flex gap-3"><button type="button" onClick={() => setStep(1)} disabled={submitting} className="rounded-full border border-slate-400 px-5 py-2.5 disabled:opacity-50">Back</button><button type="button" onClick={submitOrder} disabled={submitting} className="rounded-full bg-amazon-orange px-7 py-2.5 font-semibold hover:bg-orange-500 disabled:cursor-wait disabled:opacity-60">{submitting ? "Placing order…" : "Place your order"}</button></div></section>}
          </main>
          <aside className="h-fit rounded-lg border border-slate-300 bg-white p-5 lg:sticky lg:top-4"><h2 className="text-lg font-bold">Order summary</h2><div className="mt-4 space-y-2 border-b border-slate-200 pb-4 text-sm"><div className="flex justify-between"><span>Items ({cart.reduce((count, item) => count + item.quantity, 0)})</span><span>{formatPrice(cartSubtotal)}</span></div><div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span></div><div className="flex justify-between"><span>Estimated tax</span><span>{formatPrice(tax)}</span></div></div><div className="mt-4 flex justify-between text-lg font-bold text-amazon-red"><span>Order total</span><span>{formatPrice(total)}</span></div><p className="mt-4 flex gap-2 border-t border-slate-200 pt-4 text-xs text-slate-600"><ShieldCheck size={16} className="shrink-0 text-emerald-700" />Your payment information is secure.</p></aside>
        </div>
      </div>
    </div>
  );
}
