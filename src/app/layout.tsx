// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { BackgroundGrid } from "@/components/common/BackgroundGrid"; // Importando o fundo

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Elcomerc | Ferramentas e Acessórios Automotivos",
  description: "Peças, ferramentas e acessórios profissionais com a melhor performance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-950 text-neutral-50 selection:bg-brand-cyan selection:text-black min-h-screen relative`}
      >
        <BackgroundGrid />
        <CartProvider>
          <div className="flex min-h-screen flex-col relative z-10">
            {children}
          </div>
        </CartProvider>
      </body>
    </html>
  );
}