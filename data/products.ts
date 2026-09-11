import type { Product } from "../types";

/** A deliberately varied, typed seed catalog used by the storefront. */
const catalog: Product[] = [
  {
    id: "prod-01", title: "Echo Dot Smart Speaker", category: "Electronics",
    description: "A dependable everyday favorite designed for simple, enjoyable use.", images: ["https://picsum.photos/seed/amazon-1-1/640/640", "https://picsum.photos/seed/amazon-1-2/640/640"], price: 19.99, rating: 4.1, reviewCount: 265,
    isPrime: true, isBestSeller: true, isDeal: true, isNew: true,
    priceTier: "budget", discount: { percent: 10, originalPrice: 22.21, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-02", title: "Aurora Wireless Headphones", category: "Electronics",
    description: "Thoughtfully made with durable materials and an easy, comfortable design.", images: ["https://picsum.photos/seed/amazon-2-1/640/640", "https://picsum.photos/seed/amazon-2-2/640/640", "https://picsum.photos/seed/amazon-2-3/640/640"], price: 34.50, rating: 4.3, reviewCount: 402,
    isPrime: false, isBestSeller: false, isDeal: false, isNew: false,
    priceTier: "mid-range", discount: { percent: 15, originalPrice: 40.59, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-03", title: "PixelView 4K Monitor", category: "Electronics",
    description: "A practical upgrade that brings useful performance and lasting value.", images: ["https://picsum.photos/seed/amazon-3-1/640/640", "https://picsum.photos/seed/amazon-3-2/640/640"], price: 129.00, rating: 4.5, reviewCount: 539,
    isPrime: true, isBestSeller: false, isDeal: false, isNew: false,
    priceTier: "premium", discount: { percent: 20, originalPrice: 161.25, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-04", title: "Orbit Mechanical Keyboard", category: "Electronics",
    description: "A dependable everyday favorite designed for simple, enjoyable use.", images: ["https://picsum.photos/seed/amazon-4-1/640/640", "https://picsum.photos/seed/amazon-4-2/640/640", "https://picsum.photos/seed/amazon-4-3/640/640"], price: 74.99, rating: 4.7, reviewCount: 676,
    isPrime: false, isBestSeller: false, isDeal: true, isNew: false,
    priceTier: "mid-range", discount: { percent: 25, originalPrice: 99.99, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-05", title: "Volt USB-C Hub", category: "Electronics",
    description: "Thoughtfully made with durable materials and an easy, comfortable design.", images: ["https://picsum.photos/seed/amazon-5-1/640/640", "https://picsum.photos/seed/amazon-5-2/640/640"], price: 22.00, rating: 4.9, reviewCount: 813,
    isPrime: true, isBestSeller: false, isDeal: false, isNew: true,
    priceTier: "budget", discount: { percent: 10, originalPrice: 24.44, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-06", title: "Nimbus Fitness Tracker", category: "Electronics",
    description: "A practical upgrade that brings useful performance and lasting value.", images: ["https://picsum.photos/seed/amazon-6-1/640/640", "https://picsum.photos/seed/amazon-6-2/640/640", "https://picsum.photos/seed/amazon-6-3/640/640"], price: 59.95, rating: 4.1, reviewCount: 950,
    isPrime: false, isBestSeller: true, isDeal: false, isNew: false,
    priceTier: "mid-range", discount: { percent: 15, originalPrice: 70.53, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-07", title: "Luma Smart LED Bulbs", category: "Electronics",
    description: "A dependable everyday favorite designed for simple, enjoyable use.", images: ["https://picsum.photos/seed/amazon-7-1/640/640", "https://picsum.photos/seed/amazon-7-2/640/640"], price: 28.49, rating: 4.3, reviewCount: 1087,
    isPrime: true, isBestSeller: false, isDeal: true, isNew: false,
    priceTier: "mid-range", discount: { percent: 20, originalPrice: 35.61, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-08", title: "Streamline Webcam", category: "Electronics",
    description: "Thoughtfully made with durable materials and an easy, comfortable design.", images: ["https://picsum.photos/seed/amazon-8-1/640/640", "https://picsum.photos/seed/amazon-8-2/640/640", "https://picsum.photos/seed/amazon-8-3/640/640"], price: 89.00, rating: 4.5, reviewCount: 1224,
    isPrime: false, isBestSeller: false, isDeal: false, isNew: false,
    priceTier: "premium", discount: { percent: 25, originalPrice: 118.67, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-09", title: "Pocket Power Bank", category: "Electronics",
    description: "A practical upgrade that brings useful performance and lasting value.", images: ["https://picsum.photos/seed/amazon-9-1/640/640", "https://picsum.photos/seed/amazon-9-2/640/640"], price: 16.99, rating: 4.7, reviewCount: 1361,
    isPrime: true, isBestSeller: false, isDeal: false, isNew: true,
    priceTier: "budget", discount: { percent: 10, originalPrice: 18.88, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-10", title: "Aero Bluetooth Speaker", category: "Electronics",
    description: "A dependable everyday favorite designed for simple, enjoyable use.", images: ["https://picsum.photos/seed/amazon-10-1/640/640", "https://picsum.photos/seed/amazon-10-2/640/640", "https://picsum.photos/seed/amazon-10-3/640/640"], price: 44.95, rating: 4.9, reviewCount: 1498,
    isPrime: false, isBestSeller: false, isDeal: true, isNew: false,
    priceTier: "mid-range", discount: { percent: 15, originalPrice: 52.88, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-11", title: "BrewMaster Coffee Maker", category: "Home & Kitchen",
    description: "A dependable everyday favorite designed for simple, enjoyable use.", images: ["https://picsum.photos/seed/amazon-11-1/640/640", "https://picsum.photos/seed/amazon-11-2/640/640"], price: 19.99, rating: 4.1, reviewCount: 1635,
    isPrime: true, isBestSeller: true, isDeal: true, isNew: true,
    priceTier: "budget", discount: { percent: 10, originalPrice: 22.21, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-12", title: "CrispAir Digital Fryer", category: "Home & Kitchen",
    description: "Thoughtfully made with durable materials and an easy, comfortable design.", images: ["https://picsum.photos/seed/amazon-12-1/640/640", "https://picsum.photos/seed/amazon-12-2/640/640", "https://picsum.photos/seed/amazon-12-3/640/640"], price: 34.50, rating: 4.3, reviewCount: 1772,
    isPrime: false, isBestSeller: false, isDeal: false, isNew: false,
    priceTier: "mid-range", discount: { percent: 15, originalPrice: 40.59, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-13", title: "Stoneware Dinner Set", category: "Home & Kitchen",
    description: "A practical upgrade that brings useful performance and lasting value.", images: ["https://picsum.photos/seed/amazon-13-1/640/640", "https://picsum.photos/seed/amazon-13-2/640/640"], price: 129.00, rating: 4.5, reviewCount: 1909,
    isPrime: true, isBestSeller: false, isDeal: false, isNew: false,
    priceTier: "premium", discount: { percent: 20, originalPrice: 161.25, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-14", title: "PureFlow Water Filter", category: "Home & Kitchen",
    description: "A dependable everyday favorite designed for simple, enjoyable use.", images: ["https://picsum.photos/seed/amazon-14-1/640/640", "https://picsum.photos/seed/amazon-14-2/640/640", "https://picsum.photos/seed/amazon-14-3/640/640"], price: 74.99, rating: 4.7, reviewCount: 2046,
    isPrime: false, isBestSeller: false, isDeal: true, isNew: false,
    priceTier: "mid-range", discount: { percent: 25, originalPrice: 99.99, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-15", title: "Cozy Knit Throw", category: "Home & Kitchen",
    description: "Thoughtfully made with durable materials and an easy, comfortable design.", images: ["https://picsum.photos/seed/amazon-15-1/640/640", "https://picsum.photos/seed/amazon-15-2/640/640"], price: 22.00, rating: 4.9, reviewCount: 2183,
    isPrime: true, isBestSeller: false, isDeal: false, isNew: true,
    priceTier: "budget", discount: { percent: 10, originalPrice: 24.44, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-16", title: "ChefPro Knife Set", category: "Home & Kitchen",
    description: "A practical upgrade that brings useful performance and lasting value.", images: ["https://picsum.photos/seed/amazon-16-1/640/640", "https://picsum.photos/seed/amazon-16-2/640/640", "https://picsum.photos/seed/amazon-16-3/640/640"], price: 59.95, rating: 4.1, reviewCount: 2320,
    isPrime: false, isBestSeller: true, isDeal: false, isNew: false,
    priceTier: "mid-range", discount: { percent: 15, originalPrice: 70.53, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-17", title: "Stackable Glass Containers", category: "Home & Kitchen",
    description: "A dependable everyday favorite designed for simple, enjoyable use.", images: ["https://picsum.photos/seed/amazon-17-1/640/640", "https://picsum.photos/seed/amazon-17-2/640/640"], price: 28.49, rating: 4.3, reviewCount: 2457,
    isPrime: true, isBestSeller: false, isDeal: true, isNew: false,
    priceTier: "mid-range", discount: { percent: 20, originalPrice: 35.61, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-18", title: "GlowDesk Lamp", category: "Home & Kitchen",
    description: "Thoughtfully made with durable materials and an easy, comfortable design.", images: ["https://picsum.photos/seed/amazon-18-1/640/640", "https://picsum.photos/seed/amazon-18-2/640/640", "https://picsum.photos/seed/amazon-18-3/640/640"], price: 89.00, rating: 4.5, reviewCount: 2594,
    isPrime: false, isBestSeller: false, isDeal: false, isNew: false,
    priceTier: "premium", discount: { percent: 25, originalPrice: 118.67, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-19", title: "FreshLock Food Scale", category: "Home & Kitchen",
    description: "A practical upgrade that brings useful performance and lasting value.", images: ["https://picsum.photos/seed/amazon-19-1/640/640", "https://picsum.photos/seed/amazon-19-2/640/640"], price: 16.99, rating: 4.7, reviewCount: 2731,
    isPrime: true, isBestSeller: false, isDeal: false, isNew: true,
    priceTier: "budget", discount: { percent: 10, originalPrice: 18.88, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-20", title: "CloudSoft Bath Towels", category: "Home & Kitchen",
    description: "A dependable everyday favorite designed for simple, enjoyable use.", images: ["https://picsum.photos/seed/amazon-20-1/640/640", "https://picsum.photos/seed/amazon-20-2/640/640", "https://picsum.photos/seed/amazon-20-3/640/640"], price: 44.95, rating: 4.9, reviewCount: 2868,
    isPrime: false, isBestSeller: false, isDeal: true, isNew: false,
    priceTier: "mid-range", discount: { percent: 15, originalPrice: 52.88, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-21", title: "Classic Canvas Sneakers", category: "Fashion",
    description: "A dependable everyday favorite designed for simple, enjoyable use.", images: ["https://picsum.photos/seed/amazon-21-1/640/640", "https://picsum.photos/seed/amazon-21-2/640/640"], price: 19.99, rating: 4.1, reviewCount: 3005,
    isPrime: true, isBestSeller: true, isDeal: true, isNew: true,
    priceTier: "budget", discount: { percent: 10, originalPrice: 22.21, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-22", title: "Harbor Denim Jacket", category: "Fashion",
    description: "Thoughtfully made with durable materials and an easy, comfortable design.", images: ["https://picsum.photos/seed/amazon-22-1/640/640", "https://picsum.photos/seed/amazon-22-2/640/640", "https://picsum.photos/seed/amazon-22-3/640/640"], price: 34.50, rating: 4.3, reviewCount: 3142,
    isPrime: false, isBestSeller: false, isDeal: false, isNew: false,
    priceTier: "mid-range", discount: { percent: 15, originalPrice: 40.59, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-23", title: "Everyday Leather Belt", category: "Fashion",
    description: "A practical upgrade that brings useful performance and lasting value.", images: ["https://picsum.photos/seed/amazon-23-1/640/640", "https://picsum.photos/seed/amazon-23-2/640/640"], price: 129.00, rating: 4.5, reviewCount: 3279,
    isPrime: true, isBestSeller: false, isDeal: false, isNew: false,
    priceTier: "premium", discount: { percent: 20, originalPrice: 161.25, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-24", title: "Breeze Cotton Hoodie", category: "Fashion",
    description: "A dependable everyday favorite designed for simple, enjoyable use.", images: ["https://picsum.photos/seed/amazon-24-1/640/640", "https://picsum.photos/seed/amazon-24-2/640/640", "https://picsum.photos/seed/amazon-24-3/640/640"], price: 74.99, rating: 4.7, reviewCount: 3416,
    isPrime: false, isBestSeller: false, isDeal: true, isNew: false,
    priceTier: "mid-range", discount: { percent: 25, originalPrice: 99.99, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-25", title: "Metro Crossbody Bag", category: "Fashion",
    description: "Thoughtfully made with durable materials and an easy, comfortable design.", images: ["https://picsum.photos/seed/amazon-25-1/640/640", "https://picsum.photos/seed/amazon-25-2/640/640"], price: 22.00, rating: 4.9, reviewCount: 3553,
    isPrime: true, isBestSeller: false, isDeal: false, isNew: true,
    priceTier: "budget", discount: { percent: 10, originalPrice: 24.44, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-26", title: "Linen Weekend Shirt", category: "Fashion",
    description: "A practical upgrade that brings useful performance and lasting value.", images: ["https://picsum.photos/seed/amazon-26-1/640/640", "https://picsum.photos/seed/amazon-26-2/640/640", "https://picsum.photos/seed/amazon-26-3/640/640"], price: 59.95, rating: 4.1, reviewCount: 3690,
    isPrime: false, isBestSeller: true, isDeal: false, isNew: false,
    priceTier: "mid-range", discount: { percent: 15, originalPrice: 70.53, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-27", title: "Trail Runner Backpack", category: "Fashion",
    description: "A dependable everyday favorite designed for simple, enjoyable use.", images: ["https://picsum.photos/seed/amazon-27-1/640/640", "https://picsum.photos/seed/amazon-27-2/640/640"], price: 28.49, rating: 4.3, reviewCount: 3827,
    isPrime: true, isBestSeller: false, isDeal: true, isNew: false,
    priceTier: "mid-range", discount: { percent: 20, originalPrice: 35.61, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-28", title: "Silk Blend Scarf", category: "Fashion",
    description: "Thoughtfully made with durable materials and an easy, comfortable design.", images: ["https://picsum.photos/seed/amazon-28-1/640/640", "https://picsum.photos/seed/amazon-28-2/640/640", "https://picsum.photos/seed/amazon-28-3/640/640"], price: 89.00, rating: 4.5, reviewCount: 3964,
    isPrime: false, isBestSeller: false, isDeal: false, isNew: false,
    priceTier: "premium", discount: { percent: 25, originalPrice: 118.67, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-29", title: "Summit Wool Beanie", category: "Fashion",
    description: "A practical upgrade that brings useful performance and lasting value.", images: ["https://picsum.photos/seed/amazon-29-1/640/640", "https://picsum.photos/seed/amazon-29-2/640/640"], price: 16.99, rating: 4.7, reviewCount: 4101,
    isPrime: true, isBestSeller: false, isDeal: false, isNew: true,
    priceTier: "budget", discount: { percent: 10, originalPrice: 18.88, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-30", title: "Ridge USB-C Docking Station", category: "Computers & Accessories",
    description: "A dependable everyday favorite designed for simple, enjoyable use.", images: ["https://picsum.photos/seed/amazon-30-1/640/640", "https://picsum.photos/seed/amazon-30-2/640/640", "https://picsum.photos/seed/amazon-30-3/640/640"], price: 44.95, rating: 4.9, reviewCount: 4238,
    isPrime: false, isBestSeller: false, isDeal: true, isNew: false,
    priceTier: "mid-range", discount: { percent: 15, originalPrice: 52.88, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-31", title: "Nova Wireless Mouse", category: "Computers & Accessories",
    description: "A dependable everyday favorite designed for simple, enjoyable use.", images: ["https://picsum.photos/seed/amazon-31-1/640/640", "https://picsum.photos/seed/amazon-31-2/640/640"], price: 19.99, rating: 4.1, reviewCount: 4375,
    isPrime: true, isBestSeller: true, isDeal: true, isNew: true,
    priceTier: "budget", discount: { percent: 10, originalPrice: 22.21, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-32", title: "Orbit Laptop Stand", category: "Computers & Accessories",
    description: "Thoughtfully made with durable materials and an easy, comfortable design.", images: ["https://picsum.photos/seed/amazon-32-1/640/640", "https://picsum.photos/seed/amazon-32-2/640/640", "https://picsum.photos/seed/amazon-32-3/640/640"], price: 34.50, rating: 4.3, reviewCount: 4512,
    isPrime: false, isBestSeller: false, isDeal: false, isNew: false,
    priceTier: "mid-range", discount: { percent: 15, originalPrice: 40.59, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-33", title: "ClearView 1080p Monitor", category: "Computers & Accessories",
    description: "A practical upgrade that brings useful performance and lasting value.", images: ["https://picsum.photos/seed/amazon-33-1/640/640", "https://picsum.photos/seed/amazon-33-2/640/640"], price: 129.00, rating: 4.5, reviewCount: 4649,
    isPrime: true, isBestSeller: false, isDeal: false, isNew: false,
    priceTier: "premium", discount: { percent: 20, originalPrice: 161.25, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-34", title: "Keycraft Mechanical Keyboard", category: "Computers & Accessories",
    description: "A dependable everyday favorite designed for simple, enjoyable use.", images: ["https://picsum.photos/seed/amazon-34-1/640/640", "https://picsum.photos/seed/amazon-34-2/640/640", "https://picsum.photos/seed/amazon-34-3/640/640"], price: 74.99, rating: 4.7, reviewCount: 4786,
    isPrime: false, isBestSeller: false, isDeal: true, isNew: false,
    priceTier: "mid-range", discount: { percent: 25, originalPrice: 99.99, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-35", title: "Pulse USB Microphone", category: "Computers & Accessories",
    description: "Thoughtfully made with durable materials and an easy, comfortable design.", images: ["https://picsum.photos/seed/amazon-35-1/640/640", "https://picsum.photos/seed/amazon-35-2/640/640"], price: 22.00, rating: 4.9, reviewCount: 4923,
    isPrime: true, isBestSeller: false, isDeal: false, isNew: true,
    priceTier: "budget", discount: { percent: 10, originalPrice: 24.44, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-36", title: "Arc Laptop Backpack", category: "Computers & Accessories",
    description: "A practical upgrade that brings useful performance and lasting value.", images: ["https://picsum.photos/seed/amazon-36-1/640/640", "https://picsum.photos/seed/amazon-36-2/640/640", "https://picsum.photos/seed/amazon-36-3/640/640"], price: 59.95, rating: 4.1, reviewCount: 5060,
    isPrime: false, isBestSeller: true, isDeal: false, isNew: false,
    priceTier: "mid-range", discount: { percent: 15, originalPrice: 70.53, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-37", title: "LinkPro Ethernet Adapter", category: "Computers & Accessories",
    description: "A dependable everyday favorite designed for simple, enjoyable use.", images: ["https://picsum.photos/seed/amazon-37-1/640/640", "https://picsum.photos/seed/amazon-37-2/640/640"], price: 28.49, rating: 4.3, reviewCount: 5197,
    isPrime: true, isBestSeller: false, isDeal: true, isNew: false,
    priceTier: "mid-range", discount: { percent: 20, originalPrice: 35.61, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-38", title: "PixelGuard Webcam", category: "Computers & Accessories",
    description: "Thoughtfully made with durable materials and an easy, comfortable design.", images: ["https://picsum.photos/seed/amazon-38-1/640/640", "https://picsum.photos/seed/amazon-38-2/640/640", "https://picsum.photos/seed/amazon-38-3/640/640"], price: 89.00, rating: 4.5, reviewCount: 5334,
    isPrime: false, isBestSeller: false, isDeal: false, isNew: false,
    priceTier: "premium", discount: { percent: 25, originalPrice: 118.67, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-39", title: "Swift External SSD", category: "Computers & Accessories",
    description: "A practical upgrade that brings useful performance and lasting value.", images: ["https://picsum.photos/seed/amazon-39-1/640/640", "https://picsum.photos/seed/amazon-39-2/640/640"], price: 16.99, rating: 4.7, reviewCount: 5471,
    isPrime: true, isBestSeller: false, isDeal: false, isNew: true,
    priceTier: "budget", discount: { percent: 10, originalPrice: 18.88, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-40", title: "GlowLab Vitamin C Serum", category: "Beauty & Personal Care",
    description: "A dependable everyday favorite designed for simple, enjoyable use.", images: ["https://picsum.photos/seed/amazon-40-1/640/640", "https://picsum.photos/seed/amazon-40-2/640/640"], price: 19.99, rating: 4.1, reviewCount: 5608,
    isPrime: true, isBestSeller: true, isDeal: true, isNew: true,
    priceTier: "budget", discount: { percent: 10, originalPrice: 22.21, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-41", title: "SilkTouch Facial Cleanser", category: "Beauty & Personal Care",
    description: "Thoughtfully made with durable materials and an easy, comfortable design.", images: ["https://picsum.photos/seed/amazon-41-1/640/640", "https://picsum.photos/seed/amazon-41-2/640/640", "https://picsum.photos/seed/amazon-41-3/640/640"], price: 34.50, rating: 4.3, reviewCount: 5745,
    isPrime: false, isBestSeller: false, isDeal: false, isNew: false,
    priceTier: "mid-range", discount: { percent: 15, originalPrice: 40.59, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-42", title: "Botanical Hand Cream", category: "Beauty & Personal Care",
    description: "A practical upgrade that brings useful performance and lasting value.", images: ["https://picsum.photos/seed/amazon-42-1/640/640", "https://picsum.photos/seed/amazon-42-2/640/640"], price: 129.00, rating: 4.5, reviewCount: 5882,
    isPrime: true, isBestSeller: false, isDeal: false, isNew: false,
    priceTier: "premium", discount: { percent: 20, originalPrice: 161.25, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-43", title: "Satin Hair Brush", category: "Beauty & Personal Care",
    description: "A dependable everyday favorite designed for simple, enjoyable use.", images: ["https://picsum.photos/seed/amazon-43-1/640/640", "https://picsum.photos/seed/amazon-43-2/640/640", "https://picsum.photos/seed/amazon-43-3/640/640"], price: 74.99, rating: 4.7, reviewCount: 6019,
    isPrime: false, isBestSeller: false, isDeal: true, isNew: false,
    priceTier: "mid-range", discount: { percent: 25, originalPrice: 99.99, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-44", title: "CloudMist Body Lotion", category: "Beauty & Personal Care",
    description: "Thoughtfully made with durable materials and an easy, comfortable design.", images: ["https://picsum.photos/seed/amazon-44-1/640/640", "https://picsum.photos/seed/amazon-44-2/640/640"], price: 22.00, rating: 4.9, reviewCount: 6156,
    isPrime: true, isBestSeller: false, isDeal: false, isNew: true,
    priceTier: "budget", discount: { percent: 10, originalPrice: 24.44, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-45", title: "PureBalance Shampoo", category: "Beauty & Personal Care",
    description: "A practical upgrade that brings useful performance and lasting value.", images: ["https://picsum.photos/seed/amazon-45-1/640/640", "https://picsum.photos/seed/amazon-45-2/640/640", "https://picsum.photos/seed/amazon-45-3/640/640"], price: 59.95, rating: 4.1, reviewCount: 6293,
    isPrime: false, isBestSeller: true, isDeal: false, isNew: false,
    priceTier: "mid-range", discount: { percent: 15, originalPrice: 70.53, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-46", title: "Luminous Lip Balm", category: "Beauty & Personal Care",
    description: "A dependable everyday favorite designed for simple, enjoyable use.", images: ["https://picsum.photos/seed/amazon-46-1/640/640", "https://picsum.photos/seed/amazon-46-2/640/640"], price: 28.49, rating: 4.3, reviewCount: 6430,
    isPrime: true, isBestSeller: false, isDeal: true, isNew: false,
    priceTier: "mid-range", discount: { percent: 20, originalPrice: 35.61, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-47", title: "CalmSkin Face Mask", category: "Beauty & Personal Care",
    description: "Thoughtfully made with durable materials and an easy, comfortable design.", images: ["https://picsum.photos/seed/amazon-47-1/640/640", "https://picsum.photos/seed/amazon-47-2/640/640", "https://picsum.photos/seed/amazon-47-3/640/640"], price: 89.00, rating: 4.5, reviewCount: 6567,
    isPrime: false, isBestSeller: false, isDeal: false, isNew: false,
    priceTier: "premium", discount: { percent: 25, originalPrice: 118.67, requirement: "Buy 2 or more to save" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  },
  {
    id: "prod-48", title: "FreshStart Deodorant", category: "Beauty & Personal Care",
    description: "A practical upgrade that brings useful performance and lasting value.", images: ["https://picsum.photos/seed/amazon-48-1/640/640", "https://picsum.photos/seed/amazon-48-2/640/640"], price: 16.99, rating: 4.7, reviewCount: 6704,
    isPrime: true, isBestSeller: false, isDeal: false, isNew: true,
    priceTier: "budget", discount: { percent: 10, originalPrice: 18.88, requirement: "Clip coupon at checkout" },
    features: ["Designed for everyday use", "Quality-tested construction", "Compact, gift-ready packaging"], specifications: { "Material": "Premium composite", "Color": "Classic", "Warranty": "1 year limited" }
  }
];

const brands = ["Amazon Basics", "Echo", "Aurora", "PixelView", "Orbit", "Luma", "Nimbus", "FreshStart"];
export const products: Product[] = catalog.map((product, index) => ({
  ...product,
  brand: brands[index % brands.length],
}));

export default products;
