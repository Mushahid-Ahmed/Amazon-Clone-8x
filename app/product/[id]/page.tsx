import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ImageGallery from "../../../components/ImageGallery";
import ProductCard from "../../../components/ProductCard";
import ProductInfo from "../../../components/ProductInfo";
import RecentlyViewedTracker from "../../../components/RecentlyViewedTracker";
import { products } from "../../../data/products";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((item) => item.id === id);
  return product ? { title: product.title, description: product.description } : { title: "Product not found" };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = products.find((item) => item.id === id);
  if (!product) notFound();
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
      <RecentlyViewedTracker product={product} />
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-amazon-link">
        <Link href="/">Home</Link><span className="mx-2">›</span><Link href={`/search?category=${encodeURIComponent(product.category)}`}>{product.category}</Link><span className="mx-2">›</span><span className="text-slate-600">{product.title}</span>
      </nav>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)_300px]">
        <ImageGallery product={product} />
        <ProductInfo product={product} />
      </div>
      <section className="mt-12 border-t border-slate-300 pt-8" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="text-2xl font-bold">Customer Reviews</h2>
        <div className="mt-5 grid gap-8 md:grid-cols-[220px_280px_1fr]">
          <div><p className="text-4xl font-bold">{product.rating.toFixed(1)} out of 5</p><p className="mt-1 text-amazon-orange" aria-label={`${product.rating} out of 5 stars`}>{"★".repeat(Math.round(product.rating))}</p><p className="text-sm text-slate-600">{product.reviewCount.toLocaleString()} global ratings</p></div>
          <div className="space-y-2">{[5, 4, 3, 2, 1].map((stars) => <div key={stars} className="flex items-center gap-2 text-sm"><span className="w-12">{stars} star</span><div className="h-3 flex-1 rounded bg-slate-200"><div className="h-3 rounded bg-amazon-orange" style={{ width: `${stars === 5 ? 68 : stars === 4 ? 22 : 10}%` }} /></div></div>)}</div>
          <div className="space-y-4">{["Exactly what I needed", "Great quality and value", "Fast delivery and easy to use"].map((title) => <article key={title}><h3 className="font-semibold">{title}</h3><p className="text-amazon-orange">★★★★★</p><p className="text-xs text-slate-500">Verified Purchase</p><p className="mt-1 text-sm text-slate-700">This product works as described and feels well made. I would happily recommend it.</p><button type="button" className="mt-2 rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50">Helpful</button></article>)}</div>
        </div>
      </section>
      {related.length > 0 && <section className="mt-12 border-t border-slate-300 pt-8"><h2 className="mb-4 text-2xl font-bold">Customers who viewed this item also viewed</h2><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
    </div>
  );
}
