"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, ApiClientError } from "../lib/api";
import { useStore } from "../context/StoreContext";
import type { Product, Review } from "../types";

const SORTS = [
  { id: "recent", label: "Most recent" },
  { id: "helpful", label: "Most helpful" },
  { id: "rating-high", label: "Highest rated" },
  { id: "rating-low", label: "Lowest rated" },
] as const;

type Sort = (typeof SORTS)[number]["id"];

const FALLBACK_REVIEWS: Review[] = [
  {
    id: "fallback-1",
    productId: "",
    authorName: "Demo Shopper",
    rating: 5,
    title: "Exactly what I needed",
    body: "This product works as described and feels well made. I would happily recommend it.",
    helpful: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "fallback-2",
    productId: "",
    authorName: "Verified Buyer",
    rating: 4,
    title: "Great quality and value",
    body: "Solid build and fast delivery. Setup took a few minutes but the results are worth it.",
    helpful: 0,
    createdAt: new Date(Date.now() - 86_400_000 * 9).toISOString(),
  },
];

function Stars({ rating, label }: { rating: number; label?: string }) {
  return (
    <p className="text-amazon-orange" aria-label={label ?? `${rating} out of 5 stars`}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
    </p>
  );
}

export default function ReviewsSection({ product }: { product: Product }) {
  const { authUser } = useStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(product.reviewCount);
  const [sort, setSort] = useState<Sort>("recent");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [offlineFallback, setOfflineFallback] = useState(false);
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [formError, setFormError] = useState("");
  const [formPending, setFormPending] = useState(false);

  const load = useCallback(async (nextSort: Sort, nextPage: number) => {
    setLoading(true);
    try {
      const data = await api.get<{ reviews: Review[]; total: number; page: number; pages: number }>(
        `/api/products/${product.id}/reviews?sort=${nextSort}&page=${nextPage}&limit=5`,
      );
      setReviews(data.reviews);
      setTotal(data.total);
      setPage(data.page);
      setPages(data.pages);
      setOfflineFallback(false);
    } catch (error) {
      if (error instanceof ApiClientError && error.isNetworkError) {
        setReviews(FALLBACK_REVIEWS);
        setTotal(product.reviewCount);
        setPages(1);
        setOfflineFallback(true);
      }
    } finally {
      setLoading(false);
    }
  }, [product.id, product.reviewCount]);

  useEffect(() => {
    void load(sort, 1);
  }, [load, sort]);

  async function voteHelpful(reviewId: string) {
    if (voted.has(reviewId)) return;
    setVoted((prev) => new Set(prev).add(reviewId));
    setReviews((prev) => prev.map((review) => (review.id === reviewId ? { ...review, helpful: review.helpful + 1 } : review)));
    try {
      await api.post(`/api/reviews/${reviewId}/helpful`);
    } catch {
      // Local count already updated; the vote simply won't persist.
    }
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (formPending) return;
    setFormError("");
    setFormPending(true);
    try {
      const { review } = await api.post<{ review: Review }>(`/api/products/${product.id}/reviews`, { rating, title: title.trim(), body: body.trim() });
      setReviews((prev) => [review, ...prev]);
      setTotal((prev) => prev + 1);
      setFormOpen(false);
      setTitle("");
      setBody("");
      setRating(5);
    } catch (error) {
      if (error instanceof ApiClientError && !error.isNetworkError) {
        setFormError(error.code === "REVIEW_EXISTS" ? "You have already reviewed this product." : error.message);
      } else {
        setFormError("Network unavailable. Please try again.");
      }
    } finally {
      setFormPending(false);
    }
  }

  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    width: stars === 5 ? 68 : stars === 4 ? 22 : stars === 3 ? 6 : stars === 2 ? 3 : 1,
  }));

  return (
    <section className="mt-12 border-t border-slate-300 pt-8" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="reviews-heading" className="text-2xl font-bold">Customer Reviews</h2>
        {authUser && !formOpen && (
          <button type="button" onClick={() => setFormOpen(true)} className="rounded-full border border-slate-400 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
            Write a review
          </button>
        )}
      </div>

      {offlineFallback && (
        <p role="status" className="mt-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Showing sample reviews while offline.
        </p>
      )}

      <div className="mt-5 grid gap-8 md:grid-cols-[220px_280px_1fr]">
        <div>
          <p className="text-4xl font-bold">{product.rating.toFixed(1)} out of 5</p>
          <Stars rating={product.rating} />
          <p className="text-sm text-slate-600">{total.toLocaleString()} global ratings</p>
        </div>
        <div className="space-y-2">
          {distribution.map(({ stars, width }) => (
            <div key={stars} className="flex items-center gap-2 text-sm">
              <span className="w-12">{stars} star</span>
              <div className="h-3 flex-1 rounded bg-slate-200"><div className="h-3 rounded bg-amazon-orange" style={{ width: `${width}%` }} /></div>
            </div>
          ))}
        </div>
        <div>
          {!authUser && !offlineFallback && (
            <p className="mb-4 text-sm text-slate-600">
              <Link href={`/auth?redirect=/product/${product.id}`} className="font-semibold text-amazon-link hover:underline">Sign in</Link> to write a review.
            </p>
          )}
          {formOpen && (
            <form onSubmit={submitReview} className="mb-6 space-y-3 rounded-lg border border-slate-300 bg-white p-4">
              <label className="block text-sm font-semibold">
                Your rating
                <select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="mt-1 w-full rounded border border-slate-400 px-3 py-2 font-normal">
                  {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} star{value === 1 ? "" : "s"}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Review title
                <input value={title} onChange={(event) => setTitle(event.target.value)} required minLength={3} maxLength={120} className="mt-1 w-full rounded border border-slate-400 px-3 py-2 font-normal outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange" />
              </label>
              <label className="block text-sm font-semibold">
                Your review
                <textarea value={body} onChange={(event) => setBody(event.target.value)} required minLength={10} maxLength={2000} rows={4} className="mt-1 w-full rounded border border-slate-400 px-3 py-2 font-normal outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange" />
              </label>
              {formError && <p role="alert" className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={formPending} className="rounded-full bg-amazon-yellow px-4 py-2 text-sm font-semibold hover:bg-amber-400 disabled:opacity-60">{formPending ? "Submitting…" : "Submit review"}</button>
                <button type="button" onClick={() => { setFormOpen(false); setFormError(""); }} className="rounded-full border border-slate-400 px-4 py-2 text-sm font-semibold hover:bg-slate-50">Cancel</button>
              </div>
            </form>
          )}

          {loading ? (
            <p className="text-sm text-slate-500">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-slate-600">No reviews yet. Be the first to share your experience.</p>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2 text-sm">
                <label htmlFor="review-sort" className="font-semibold">Sort by:</label>
                <select id="review-sort" value={sort} onChange={(event) => setSort(event.target.value as Sort)} className="rounded border border-slate-400 bg-white px-2 py-1.5">
                  {SORTS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </div>
              <div className="space-y-5">
                {reviews.map((review) => (
                  <article key={review.id}>
                    <h3 className="font-semibold">{review.title}</h3>
                    <Stars rating={review.rating} />
                    <p className="text-xs text-slate-700">Verified Purchase · {review.authorName} · {new Date(review.createdAt).toLocaleDateString("en-US", { dateStyle: "long" })}</p>
                    <p className="mt-1 text-sm text-slate-700">{review.body}</p>
                    <button type="button" disabled={voted.has(review.id)} onClick={() => void voteHelpful(review.id)} className="mt-2 rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-50">
                      Helpful ({review.helpful})
                    </button>
                  </article>
                ))}
              </div>
              {pages > 1 && (
                <div className="mt-5 flex items-center gap-3 text-sm">
                  <button type="button" disabled={page <= 1} onClick={() => void load(sort, page - 1)} className="rounded-full border border-slate-400 px-3 py-1.5 font-semibold hover:bg-slate-50 disabled:opacity-50">Previous</button>
                  <span className="text-slate-600">Page {page} of {pages}</span>
                  <button type="button" disabled={page >= pages} onClick={() => void load(sort, page + 1)} className="rounded-full border border-slate-400 px-3 py-1.5 font-semibold hover:bg-slate-50 disabled:opacity-50">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
