"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  { title: "Summer savings are here", copy: "Fresh finds and everyday essentials, all in one place.", action: "Shop now", gradient: "from-[#16324f] via-[#0d6e8a] to-[#32b7a9]" },
  { title: "Upgrade your workspace", copy: "Smart tech and accessories that help you do more.", action: "Explore electronics", gradient: "from-[#2c1e4a] via-[#764ba2] to-[#d15c82]" },
  { title: "Make home feel like yours", copy: "Comfort, color, and clever details for every room.", action: "Shop home", gradient: "from-[#5f241b] via-[#c05b38] to-[#f4b860]" },
  { title: "Prime picks, delivered fast", copy: "Top-rated products with free delivery for Prime members.", action: "See Prime picks", gradient: "from-[#063b36] via-[#087f5b] to-[#86c232]" },
];

export default function HeroBanner() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  const slide = slides[active];
  return (
    <section className="relative z-0 mx-auto max-w-7xl overflow-hidden rounded-b-xl shadow-lg" aria-label="Featured offers">
      <div className={`bg-gradient-to-r ${slide.gradient} min-h-[280px] px-8 py-12 text-white sm:min-h-[350px] sm:px-16 sm:py-20`}>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Clone Store deals</p>
        <h1 className="max-w-xl text-4xl font-bold tracking-tight sm:text-6xl">{slide.title}</h1>
        <p className="mt-4 max-w-lg text-base text-white/90 sm:text-lg">{slide.copy}</p>
        <button type="button" className="mt-7 rounded-md bg-white px-5 py-3 text-sm font-bold text-amazon-navy shadow hover:bg-slate-100">{slide.action}</button>
      </div>
      <button type="button" onClick={() => setActive((active - 1 + slides.length) % slides.length)} aria-label="Previous slide" className="absolute left-3 top-1/2 rounded-full bg-white/80 p-2 text-amazon-navy shadow hover:bg-white"><ChevronLeft size={24} /></button>
      <button type="button" onClick={() => setActive((active + 1) % slides.length)} aria-label="Next slide" className="absolute right-3 top-1/2 rounded-full bg-white/80 p-2 text-amazon-navy shadow hover:bg-white"><ChevronRight size={24} /></button>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2" aria-label="Choose hero slide">
        {slides.map((item, index) => <button key={item.title} type="button" onClick={() => setActive(index)} aria-label={`Show slide ${index + 1}${active === index ? " (current)" : ""}`} className={`h-2.5 w-2.5 rounded-full ${active === index ? "bg-white" : "bg-white/40"}`} />)}
      </div>
    </section>
  );
}
