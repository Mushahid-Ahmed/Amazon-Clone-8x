import Link from "next/link";
import { notFound } from "next/navigation";
import ImageGallery from "../../../components/ImageGallery";
import ProductCard from "../../../components/ProductCard";
import ProductInfo from "../../../components/ProductInfo";
import RecentlyViewedTracker from "../../../components/RecentlyViewedTracker";
import { products } from "../../../data/products";

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
      {related.length > 0 && <section className="mt-12 border-t border-slate-300 pt-8"><h2 className="mb-4 text-2xl font-bold">Customers who viewed this item also viewed</h2><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
    </div>
  );
}
