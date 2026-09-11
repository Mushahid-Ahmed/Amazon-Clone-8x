import type { Metadata } from "next";
import "./globals.css";
import StoreProviderBridge from "../context/StoreProvider";

export const metadata: Metadata = {
  title: "Spend less. Smile more. — Clone Store",
  description: "A minimal Amazon-inspired storefront scaffold.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-[#EAEDED]">
        <StoreProviderBridge>{children}</StoreProviderBridge>
      </body>
    </html>
  );
}
