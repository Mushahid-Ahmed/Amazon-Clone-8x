import type { Product } from "../types";

export type SearchSort = "relevance" | "price-low" | "price-high" | "rating" | "newest" | "best-sellers";

export interface SearchFilters {
  query?: string;
  category?: string;
  categories?: string[];
  brand?: string;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  prime?: boolean;
  deals?: boolean;
  sort?: SearchSort;
}

export function filterAndSortProducts(allProducts: Product[], filters: SearchFilters): Product[] {
  const query = filters.query?.trim().toLocaleLowerCase();
  const categories = filters.categories?.length ? filters.categories : filters.category ? [filters.category] : [];
  const brands = filters.brands?.length ? filters.brands : filters.brand ? [filters.brand] : [];
  const filtered = allProducts.filter((product) => {
    const searchable = `${product.title} ${product.description} ${product.category} ${product.brand ?? ""}`.toLocaleLowerCase();
    return (!query || searchable.includes(query))
      && (!categories.length || categories.includes(product.category))
      && (!brands.length || (product.brand && brands.includes(product.brand)))
      && (filters.minPrice === undefined || product.price >= filters.minPrice)
      && (filters.maxPrice === undefined || product.price <= filters.maxPrice)
      && (filters.minRating === undefined || product.rating >= filters.minRating)
      && (!filters.prime || product.isPrime)
      && (!filters.deals || product.isDeal);
  });

  const sort = filters.sort ?? "relevance";
  return filtered
    .map((product, index) => ({ product, index }))
    .sort((a, b) => {
      if (sort === "price-low") return a.product.price - b.product.price;
      if (sort === "price-high") return b.product.price - a.product.price;
      if (sort === "rating") return b.product.rating - a.product.rating || b.product.reviewCount - a.product.reviewCount;
      if (sort === "newest") return Number(b.product.isNew) - Number(a.product.isNew) || b.index - a.index;
      if (sort === "best-sellers") return Number(b.product.isBestSeller) - Number(a.product.isBestSeller) || b.product.reviewCount - a.product.reviewCount;
      return (b.product.rating * Math.log10(b.product.reviewCount + 10)) - (a.product.rating * Math.log10(a.product.reviewCount + 10)) || a.index - b.index;
    })
    .map(({ product }) => product);
}
