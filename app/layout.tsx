import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spend less. Smile more. — Clone Store",
  description: "A minimal Amazon-inspired storefront scaffold.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-[#EAEDED]">{children}</body>
    </html>
  );
}
