"use client";

import { useEffect, useRef } from "react";
import type { Product } from "../types";
import { useStore } from "../context/StoreContext";

export default function RecentlyViewedTracker({ product }: { product: Product }) {
  const { addRecentlyViewed } = useStore();
  const trackedId = useRef<string | null>(null);
  useEffect(() => {
    if (trackedId.current === product.id) return;
    trackedId.current = product.id;
    addRecentlyViewed(product);
  }, [product, addRecentlyViewed]);
  return null;
}
