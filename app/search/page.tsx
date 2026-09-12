import Link from "next/link";
import type { Metadata } from "next";
import SearchFilters from "../../components/SearchFilters";
import SearchResultItem from "../../components/SearchResultItem";
import SearchSort from "../../components/SearchSort";
import { products } from "../../data/products";
import { filterAndSortProducts, type SearchSort as SearchSortType } from "../../lib/search";

type SearchParams = Record<string, string | string[] | undefined>;
const sorts: SearchSortType[] = ["relevance", "price-low", "price-high", "rating", "newest", "best-sellers"];

function first(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }
function number(value: string | undefined) { const parsed = value ? Number(value) : undefined; return parsed !== undefined && Number.isFinite(parsed) ? parsed : undefined; }
function enabled(value: string | undefined) { return value === "1" || value === "true" || value === ""; }

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const params = await searchParams;
  const query = first(params.q)?.trim();
  const category = first(params.category);
  const label = query ? `Search results for "${query}"` : category ? `${category} products` : "Search products";
  return { title: label, description: `Browse ${label.toLowerCase()} at Amazon Clone.` };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = first(params.q)?.trim() ?? "";
  const category = first(params.category);
  const brandParam = first(params.brand);
  const sortParam = first(params.sort);
  const sort = sorts.includes(sortParam as SearchSortType) ? sortParam as SearchSortType : "relevance";
  const results = filterAndSortProducts(products, {
    query, category, brands: brandParam?.split(",").filter(Boolean), minPrice: number(first(params.minPrice)), maxPrice: number(first(params.maxPrice)),
    minRating: number(first(params.minRating)), prime: enabled(first(params.prime)), deals: enabled(first(params.deals)), sort,
  });
  const title = query ? `Results for "${query}"` : category ? `${category}` : "Search results";

  return <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">{title}</h1><p className="text-sm text-slate-600">{results.length.toLocaleString()} results</p></div><SearchSort /></div>
    <SearchFilters products={products} />
    <div className="mt-4 flex gap-6"><div className="hidden lg:block lg:w-[250px] lg:shrink-0" /><section className="min-w-0 flex-1">{results.length ? <div className="overflow-hidden rounded border border-slate-200">{results.map((product) => <SearchResultItem key={product.id} product={product} />)}</div> : <div className="rounded border border-slate-200 bg-white px-6 py-16 text-center"><h2 className="text-xl font-bold">No results found</h2><p className="mt-2 text-slate-600">Try adjusting your filters or search for something else.</p><Link href="/search" className="mt-5 inline-block rounded bg-amazon-yellow px-4 py-2 font-medium">Clear filters</Link></div>}</section></div>
  </div>;
}
