import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <SearchX size={64} className="text-amazon-orange" aria-hidden="true" />
      <h1 className="mt-5 text-3xl font-bold">We couldn&apos;t find that page</h1>
      <p className="mt-3 text-slate-600">The page may have moved, or the address may be incorrect.</p>
      <Link href="/" className="mt-7 rounded-full bg-amazon-yellow px-6 py-3 font-semibold hover:bg-amber-400 focus-visible:ring-2 focus-visible:ring-amazon-orange">Back to home</Link>
    </div>
  );
}
