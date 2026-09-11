import { products } from "../data/products";
import ProductCard from "./ProductCard";

export default function BestSellers() {
  const items = products.filter((product) => product.isBestSeller).slice(0, 10);
  return <section className="mx-auto max-w-7xl px-4 py-8"><h2 className="mb-4 text-2xl font-bold">Best Sellers</h2><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{items.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>;
}
