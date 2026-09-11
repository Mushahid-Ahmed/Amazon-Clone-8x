"use client";

import { Check } from "lucide-react";
import type { TrackingStep } from "../../types";

const TRACKING_LABELS = ["Order placed", "Preparing for shipment", "Shipped", "Delivered"];

export default function TrackingProgress({ steps, status }: { steps: TrackingStep[]; status: string }) {
  const currentIndex = status === "cancelled"
    ? 0
    : status === "delivered"
      ? 3
      : status === "shipped"
        ? 2
        : 1;

  return (
    <ol aria-label="Order tracking progress" className="flex w-full items-start">
      {TRACKING_LABELS.map((label, index) => {
        const sourceStep = steps[index];
        const complete = index < currentIndex || (index === 0 && currentIndex >= 0);
        const current = index === currentIndex;
        return (
          <li key={label} className="relative flex flex-1 flex-col items-center text-center">
            {index > 0 && <span className={`absolute left-0 right-1/2 top-3 h-0.5 ${index <= currentIndex ? "bg-emerald-500" : "bg-slate-200"}`} />}
            {index < TRACKING_LABELS.length - 1 && <span className={`absolute left-1/2 right-0 top-3 h-0.5 ${index < currentIndex ? "bg-emerald-500" : "bg-slate-200"}`} />}
            <span className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs ${complete ? "border-emerald-600 bg-emerald-600 text-white" : current ? "border-amazon-orange bg-amazon-yellow text-amazon-navy" : "border-slate-300 bg-white text-slate-400"}`}>
              {complete ? <Check size={13} strokeWidth={3} /> : index + 1}
            </span>
            <span className={`mt-2 text-[11px] leading-tight sm:text-xs ${current || complete ? "font-semibold text-slate-800" : "text-slate-500"}`}>{label}</span>
            {sourceStep?.timestamp && <time className="mt-1 hidden text-[10px] text-slate-500 sm:block">{new Date(sourceStep.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</time>}
          </li>
        );
      })}
    </ol>
  );
}
