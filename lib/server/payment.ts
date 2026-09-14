import { ApiError, rateLimit } from "./http";

export type ChargeResult =
  | { status: "paid"; transactionId: string }
  | { status: "pending"; transactionId: string };

const MOCK_METHODS: Record<string, string> = {
  "Visa ending in 4242": "4242",
  "Mastercard ending in 5555": "5555",
  "Cash on delivery": "cod",
};

const DECLINED_DIGITS = /^0{4}$/;

function methodRecognized(method: string): boolean {
  return Object.values(MOCK_METHODS).includes(method);
}

export async function chargePayment(opts: {
  method: string;
  amount: number;
  email?: string | null;
}): Promise<ChargeResult> {
  rateLimit(`pay:${opts.method}`, 30, 60_000);

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey && !methodRecognized(opts.method) && opts.method !== "cod") {
    // Placeholder for a real Stripe integration: the mock gateway is used for
    // the demo's known methods; unknown methods with a key configured would
    // route here in a production build.
    throw new ApiError(402, "PAYMENT_DECLINED", "Unsupported payment method for live gateway.");
  }

  if (opts.method === "cod") {
    return { status: "pending", transactionId: `cod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` };
  }
  if (DECLINED_DIGITS.test(opts.method)) {
    throw new ApiError(402, "PAYMENT_DECLINED", `Card ending in ${opts.method} was declined.`);
  }
  if (!methodRecognized(opts.method)) {
    throw new ApiError(400, "INVALID_PAYMENT_METHOD", `Unsupported payment method "${opts.method}".`);
  }
  return {
    status: "paid",
    transactionId: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
}
