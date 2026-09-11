"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  Menu,
  MapPin,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { openCartDrawer } from "./cart/CartDrawer";

const categories = [
  "Electronics",
  "Computers & Accessories",
  "Home & Kitchen",
  "Fashion",
  "Beauty & Personal Care",
] as const;

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartItemCount } = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("Electronics");
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/checkout") {
    return <header className="border-b border-slate-300 bg-white px-4 py-5"><div className="mx-auto flex max-w-7xl items-center justify-between"><Link href="/" className="text-xl font-bold tracking-tight text-amazon-navy">amazon<span className="text-amazon-orange">.clone</span></Link><span className="text-sm text-slate-600">Secure checkout</span></div></header>;
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({ q: query.trim(), category });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <header className="text-white">
      <div className="bg-amazon-navy px-4 py-2 text-center text-xs font-medium sm:text-sm">
        Free delivery on orders over $35 · Shop confidently with secure checkout
      </div>

      <div className="bg-amazon-navy px-3 py-3 sm:px-5 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <button
            type="button"
            className="rounded border border-transparent p-2 hover:border-white lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link href="/" className="rounded border border-transparent px-1 py-2 text-xl font-bold tracking-tight hover:border-white sm:text-2xl">
            amazon<span className="text-amazon-orange">.clone</span>
          </Link>

          <Link href="/delivery" className="hidden items-center gap-1 rounded border border-transparent px-2 py-1 hover:border-white lg:flex">
            <MapPin size={18} />
            <span><small className="block text-xs text-slate-300">Deliver to</small><strong className="text-sm">Seattle 98101</strong></span>
          </Link>

          <form onSubmit={submitSearch} className="order-3 flex min-w-0 flex-1 overflow-hidden rounded-md bg-white focus-within:ring-2 focus-within:ring-amazon-orange sm:order-none">
            <label htmlFor="header-search" className="sr-only">Search products</label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as (typeof categories)[number])}
              className="hidden max-w-44 cursor-pointer border-r border-slate-200 bg-slate-100 px-2 text-xs text-slate-700 outline-none md:block"
              aria-label="Search category"
            >
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
            <input
              id="header-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Amazon Clone"
              className="min-w-0 flex-1 px-3 py-2 text-sm text-slate-900 outline-none"
            />
            <button type="submit" className="bg-amazon-yellow px-4 text-amazon-navy hover:bg-amazon-orange" aria-label="Search">
              <Search size={21} />
            </button>
          </form>

          <div className="hidden items-center gap-1 lg:flex">
            <Link href="/account" className="rounded border border-transparent px-2 py-1 hover:border-white"><small className="block text-xs text-slate-300">Hello, sign in</small><strong className="text-sm">Account & Lists</strong></Link>
            <Link href="/orders" className="rounded border border-transparent px-2 py-1 hover:border-white"><small className="block text-xs text-slate-300">Returns</small><strong className="text-sm">& Orders</strong></Link>
          </div>
          <Link href="/cart" onClick={() => openCartDrawer()} className="relative rounded border border-transparent px-2 py-2 hover:border-white" aria-label={`Cart with ${cartItemCount} items`}>
            <ShoppingCart size={28} />
            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-amazon-orange px-1 text-center text-xs font-bold text-amazon-navy">{cartItemCount}</span>
            <span className="hidden text-sm font-bold sm:inline">Cart</span>
          </Link>
        </div>

        <div className="mx-auto mt-3 flex max-w-7xl items-center gap-2 lg:hidden">
          <Link href="/delivery" className="flex flex-1 items-center gap-2 rounded border border-transparent px-2 py-1 hover:border-white">
            <MapPin size={17} /><span className="text-xs"><span className="text-slate-300">Deliver to</span> <strong>Seattle 98101</strong></span>
          </Link>
          <Link href="/account" className="rounded border border-transparent px-2 py-1 text-xs hover:border-white"><UserRound size={16} className="mr-1 inline" />Account</Link>
        </div>
      </div>

      <nav className="hidden bg-amazon-navy-light px-4 py-2 lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-6 text-sm font-semibold">
          <Link href="/categories" className="rounded border border-transparent px-2 py-1 hover:border-white">☰ All</Link>
          {categories.map((item) => <Link key={item} href={`/search?category=${encodeURIComponent(item)}`} className="rounded border border-transparent px-2 py-1 hover:border-white">{item}</Link>)}
          <Link href="/deals" className="ml-auto rounded border border-transparent px-2 py-1 hover:border-white">Today&apos;s Deals</Link>
        </div>
      </nav>

      {mobileOpen && (
        <nav className="border-t border-slate-600 bg-amazon-navy-light px-5 py-3 lg:hidden">
          <div className="grid gap-1 text-sm">
            {categories.map((item) => <Link key={item} href={`/search?category=${encodeURIComponent(item)}`} onClick={() => setMobileOpen(false)} className="rounded px-3 py-2 hover:bg-slate-600">{item}</Link>)}
            <Link href="/orders" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2 hover:bg-slate-600">Returns & Orders</Link>
          </div>
        </nav>
      )}

      <div className="flex items-center justify-around border-t border-slate-700 bg-amazon-navy-light py-2 text-xs lg:hidden">
        <Link href="/" className="rounded px-3 py-1 hover:bg-slate-600">Home</Link>
        <Link href="/categories" className="rounded px-3 py-1 hover:bg-slate-600">Categories</Link>
        <Link href="/deals" className="rounded px-3 py-1 hover:bg-slate-600">Deals</Link>
        <Link href="/cart" className="rounded px-3 py-1 hover:bg-slate-600">Cart ({cartItemCount})</Link>
      </div>
    </header>
  );
}
