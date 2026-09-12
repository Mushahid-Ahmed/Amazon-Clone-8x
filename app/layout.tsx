import type { Metadata } from "next";
import "./globals.css";
import StoreProviderBridge from "../context/StoreProvider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/cart/CartDrawer";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: { default: "Amazon Clone", template: "%s | Amazon Clone" },
  description: "Shop electronics, home, fashion, and more in the Amazon Clone educational storefront.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-[#EAEDED]">
        <StoreProviderBridge>
          <Suspense fallback={<header className="h-28 bg-amazon-navy" aria-hidden="true" />}>
            <Header />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </StoreProviderBridge>
      </body>
    </html>
  );
}
