"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "../types";

export default function ImageGallery({ product }: { product: Product }) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <div className="flex gap-2 overflow-x-auto sm:w-20 sm:flex-col">
        {product.images.map((image, index) => (
          <button
            key={image}
            type="button"
            onMouseEnter={() => setSelected(index)}
            onFocus={() => setSelected(index)}
            onClick={() => setSelected(index)}
            className={`relative h-16 w-16 shrink-0 overflow-hidden rounded border bg-white ${selected === index ? "border-amazon-orange ring-2 ring-amazon-orange/30" : "border-slate-300"}`}
            aria-label={`View image ${index + 1} of ${product.title}`}
            aria-pressed={selected === index}
          >
            <Image src={image} alt="" fill sizes="64px" className="object-cover" />
          </button>
        ))}
      </div>
      <div className="relative min-h-[320px] flex-1 overflow-hidden rounded-lg bg-white sm:min-h-[460px]">
        <Image
          src={product.images[selected]}
          alt={product.title}
          fill
          priority
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 520px"
          className="object-contain"
        />
      </div>
    </div>
  );
}
