import type { Metadata } from "next";
import ProductCard from "../../components/ProductCard";
import SearchSort from "../../components/SearchSort";
import { products } from "../../data/products";
import { filterAndSortProducts, type SearchSort as SearchSortType } from "../../lib/search";

export const metadata: Metadata = {
  title: "Today's Deals",
  description: "Save on popular products with today's deals at Amazon Clone.",
};

type SearchParams = Record<string, string | string[] | undefined>;
const sorts: SearchSortType[] = ["relevance", "price-low", "price-high", "rating", "newest"];

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DealsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const requestedSort = first(params.sort) as SearchSortType | undefined;
  const sort = requestedSort && sorts.includes(requestedSort) ? requestedSort : "relevance";
  const deals = filterAndSortProducts(products, { deals: true, sort });

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Today&apos;s Deals</h1>
          <p className="mt-1 text-sm text-slate-600">Limited-time savings across the store.</p>
        </div>
        <SearchSort />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {deals.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  );
}
