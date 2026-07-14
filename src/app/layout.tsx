import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { WalletFooter } from "@/components/wallet/wallet-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TANK Wallet — Secure Multi-Chain Wallet",
  description: "A hot wallet mais segura do mercado. Multi-chain nativa, segurança por padrão, zero confiança em contratos.",
  keywords: ["TANK Wallet", "Web3", "wallet", "multi-chain", "security", "blocklist", "sovereignty"],
  authors: [{ name: "END ART" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <div className="flex min-h-screen flex-col">
          <div className="flex flex-1 flex-col">
            {children}
          </div>
          <WalletFooter />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
