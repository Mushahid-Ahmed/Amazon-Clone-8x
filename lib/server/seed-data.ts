export interface ReviewSeed {
  productId: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  daysAgo: number;
  helpful: number;
}

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

export { daysAgo };

export const REVIEW_SEEDS: ReviewSeed[] = [
  { productId: "prod-01", author: "Maya Chen", rating: 5, title: "Way better than I expected", body: "Set it up in five minutes and the sound fills the whole kitchen. Voice recognition works even while the TV is on.", daysAgo: 2, helpful: 14 },
  { productId: "prod-01", author: "Jordan Lee", rating: 4, title: "Great value, minor quirks", body: "Does everything I need. Occasionally mishears my partner's voice, but for the price it is hard to complain.", daysAgo: 9, helpful: 6 },
  { productId: "prod-01", author: "Sam Patel", rating: 5, title: "Bought a second one", body: "Loved the first one so much I put one in the bedroom. The compact size hides anywhere.", daysAgo: 21, helpful: 9 },
  { productId: "prod-02", author: "Taylor Kim", rating: 4, title: "Comfortable for long sessions", body: "Wore them through a six-hour flight without ear fatigue. Bass is punchy, mids are decent.", daysAgo: 3, helpful: 11 },
  { productId: "prod-02", author: "Riley Gomez", rating: 3, title: "Good, not great", body: "Sound is solid for the price but the hinge feels a little loose after a month of daily use.", daysAgo: 14, helpful: 4 },
  { productId: "prod-03", author: "Avery Shah", rating: 5, title: "Colors pop", body: "Calibrated out of the box. Text is razor sharp and HDR content looks stunning next to my old panel.", daysAgo: 5, helpful: 18 },
  { productId: "prod-03", author: "Maya Chen", rating: 4, title: "Excellent panel, bulky stand", body: "The screen itself is flawless. The stand takes up more desk depth than I planned for.", daysAgo: 12, helpful: 7 },
  { productId: "prod-04", author: "Jordan Lee", rating: 5, title: "Thocky perfection", body: "The switches feel amazing and the keycaps have a lovely texture. My coworkers are jealous of the sound.", daysAgo: 1, helpful: 22 },
  { productId: "prod-04", author: "Sam Patel", rating: 5, title: "Best keyboard I have owned", body: "Hot-swappable, sturdy, and the RGB is subtle rather than gaudy. Highly recommended.", daysAgo: 8, helpful: 13 },
  { productId: "prod-05", author: "Taylor Kim", rating: 4, title: "Does what it promises", body: "All ports work at full speed with my laptop. Gets slightly warm under heavy load but nothing concerning.", daysAgo: 6, helpful: 5 },
  { productId: "prod-06", author: "Riley Gomez", rating: 4, title: "Accurate sleep tracking", body: "Battery lasts about five days and the sleep insights actually changed my habits. App is a bit cluttered.", daysAgo: 4, helpful: 8 },
  { productId: "prod-07", author: "Avery Shah", rating: 5, title: "Whole-house lighting on a budget", body: "Paired twelve bulbs without a single dropout. Schedules work reliably even when the internet hiccups.", daysAgo: 10, helpful: 16 },
  { productId: "prod-07", author: "Maya Chen", rating: 4, title: "Easy setup, vivid colors", body: "The app found every bulb instantly. Colors are rich, though the coolest white is slightly warm for me.", daysAgo: 17, helpful: 6 },
  { productId: "prod-08", author: "Jordan Lee", rating: 5, title: "Crisp video for calls", body: "Auto-framing is smooth and low light performance shocked me. Worth it for daily standups.", daysAgo: 2, helpful: 10 },
  { productId: "prod-11", author: "Sam Patel", rating: 5, title: "Better than my old $200 machine", body: "Brews at the right temperature and the thermal carafe keeps coffee hot for hours without a burnt taste.", daysAgo: 7, helpful: 12 },
  { productId: "prod-14", author: "Taylor Kim", rating: 4, title: "Taste difference is real", body: "Chlorine smell is completely gone and the water tastes crisp. Filter swaps take under a minute.", daysAgo: 11, helpful: 7 },
  { productId: "prod-21", author: "Riley Gomez", rating: 5, title: "Broken in after one wear", body: "No blisters, no stiff heel. The canvas breathes well and they look better slightly scuffed.", daysAgo: 3, helpful: 19 },
  { productId: "prod-26", author: "Avery Shah", rating: 4, title: "Perfect weekend shirt", body: "Lightweight without being see-through. Survived the wash with zero wrinkles on a hanger dry.", daysAgo: 13, helpful: 9 },
  { productId: "prod-31", author: "Maya Chen", rating: 5, title: "Precision without the wires", body: "Tracks flawlessly on glass and the battery genuinely lasts weeks. Silent clicks are great for open offices.", daysAgo: 5, helpful: 15 },
  { productId: "prod-36", author: "Jordan Lee", rating: 4, title: "Swallowed my whole setup", body: "Fits a 16-inch laptop, charger, and a paperback with room to spare. Straps are comfy on a long walk.", daysAgo: 8, helpful: 6 },
  { productId: "prod-41", author: "Sam Patel", rating: 5, title: "Gentle and effective", body: "Removed every trace of sunscreen without stripping my skin. A tiny amount lathers into a rich foam.", daysAgo: 6, helpful: 11 },
  { productId: "prod-44", author: "Taylor Kim", rating: 4, title: "Absorbs instantly", body: "Non-greasy and the scent is subtle. My skin stayed soft through a dry winter week.", daysAgo: 15, helpful: 8 },
  { productId: "prod-47", author: "Riley Gomez", rating: 5, title: "Spa night essential", body: "Ten minutes with this mask and my skin looks rested. The texture is silky, not chalky.", daysAgo: 4, helpful: 17 },
  { productId: "prod-48", author: "Avery Shah", rating: 4, title: "Lasts all day", body: "Reliable through workouts and long commutes. Clean scent that never overwhelms.", daysAgo: 19, helpful: 5 },
];
