import type { Metadata } from "next";
import "./globals.css";
import StoreProviderBridge from "../context/StoreProvider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/cart/CartDrawer";

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
        <StoreProviderBridge>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </StoreProviderBridge>
      </body>
    </html>
  );
}
