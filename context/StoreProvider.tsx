"use client";

import type { ReactNode } from "react";
import { StoreProvider } from "./StoreContext";

export default function StoreProviderBridge({ children }: { children: ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}
