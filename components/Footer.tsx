"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";

const columns = [
  { title: "Get to Know Us", links: ["About Us", "Careers", "Press Releases", "Our Partners"] },
  { title: "Make Money with Us", links: ["Sell on Clone Store", "Affiliate Program", "Advertise Your Products", "Become a Supplier"] },
  { title: "Payment Products", links: ["Clone Store Card", "Shop with Points", "Reload Your Balance", "Currency Converter"] },
  { title: "Let Us Help You", links: ["Your Account", "Your Orders", "Shipping Rates", "Returns & Replacements"] },
];

export default function Footer() {
  function backToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="mt-auto bg-amazon-navy text-slate-200">
      <button type="button" onClick={backToTop} className="flex w-full items-center justify-center gap-2 bg-amazon-navy-light py-4 text-sm font-semibold hover:bg-slate-600">
        <ArrowUp size={16} /> Back to top
      </button>
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((column) => (
          <section key={column.title}>
            <h2 className="mb-3 text-base font-bold text-white">{column.title}</h2>
            <ul className="grid gap-2 text-sm">
              {column.links.map((link) => <li key={link}><Link href="#" className="hover:text-amazon-orange hover:underline">{link}</Link></li>)}
            </ul>
          </section>
        ))}
      </div>
      <div className="border-t border-slate-700 px-6 py-6 text-center text-xs text-slate-400">
        <Link href="/" className="text-lg font-bold text-white">amazon<span className="text-amazon-orange">.clone</span></Link>
        <p className="mt-3">© 2025 Clone Store. Built for better shopping.</p>
      </div>
    </footer>
  );
}
