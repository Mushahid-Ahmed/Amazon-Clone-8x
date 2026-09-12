import Link from "next/link";
import Image from "next/image";
import { products } from "../data/products";
import type { ProductCategory } from "../types";

const categories: ProductCategory[] = ["Electronics", "Computers & Accessories", "Home & Kitchen", "Fashion", "Beauty & Personal Care"];

export default function CategoryGrid() {
  const cards: { title: string; items: typeof products; href: string }[] = categories.map((category) => ({ title: category, items: products.filter((product) => product.category === category).slice(0, 4), href: `/search?category=${encodeURIComponent(category)}` }));
  cards.push({ title: "Trending in Electronics", items: products.filter((product) => product.category === "Electronics").slice(0, 4), href: "/search?category=Electronics" });
  cards.push({ title: "Top Rated", items: [...products].sort((a, b) => b.rating - a.rating).slice(0, 4), href: "/search?sort=rating" });

  return (
    <section className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 sm:-mt-16">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <article key={card.title} className="rounded-lg bg-white p-4 shadow-md">
            <h2 className="mb-3 text-xl font-bold">{card.title}</h2>
            <div className="grid grid-cols-2 gap-3">
              {card.items.map((product) => <Link key={product.id} href={`/product/${product.id}`} className="group"><div className="relative aspect-square overflow-hidden rounded bg-slate-100"><Image src={product.images[0]} alt={product.title} fill sizes="140px" className="object-cover transition group-hover:scale-105" /></div><p className="mt-1 line-clamp-1 text-xs text-amazon-link group-hover:underline">{product.title}</p></Link>)}
            </div>
            <Link href={card.href} className="mt-4 inline-block text-sm text-amazon-link hover:text-amazon-red hover:underline">See more</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
