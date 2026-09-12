import type { Metadata } from "next";
import Link from "next/link";
import type { ProductCategory } from "../../types";

export const metadata: Metadata = {
  title: "Shop by Category",
  description: "Browse all five Amazon Clone departments.",
};

const categories: Array<{ name: ProductCategory; description: string }> = [
  { name: "Electronics", description: "Devices, audio, and smart essentials" },
  { name: "Computers & Accessories", description: "Workstations, peripherals, and upgrades" },
  { name: "Home & Kitchen", description: "Useful finds for every room" },
  { name: "Fashion", description: "Everyday style for every season" },
  { name: "Beauty & Personal Care", description: "Self-care and daily essentials" },
];

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Shop by department</h1>
        <p className="mt-2 text-slate-600">Explore our five departments and find something you love.</p>
      </header>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.name} href={`/search?category=${encodeURIComponent(category.name)}`} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <h2 className="text-xl font-bold text-amazon-navy">{category.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{category.description}</p>
            <span className="mt-5 inline-block text-sm font-semibold text-amazon-link">Shop now →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
