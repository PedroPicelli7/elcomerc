// src/components/common/Header.tsx
"use client";

import Link from "next/link";
import { Search, ShoppingBag, Wrench } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function Header() {
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Logo - Estilo Tech/Streetwear */}
        <Link href="/" className="flex items-center gap-2 font-mono text-xl font-black tracking-tighter text-white">
          <Wrench className="h-5 w-5 text-orange-500" />
          EL<span className="text-orange-500">COMERC</span>
        </Link>

        {/* Barra de Busca Dinâmica (Otimizada para Mobile) */}
        <div className="hidden max-w-md flex-1 px-6 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Buscar ferramentas, LEDs, óleos..."
              className="w-full rounded-md border border-neutral-800 bg-neutral-900 py-1.5 pl-10 pr-4 text-sm text-neutral-200 placeholder-neutral-500 transition-colors focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Ações / Carrinho */}
        <div className="flex items-center gap-4">
          <button className="rounded-md p-2 text-neutral-400 hover:text-white md:hidden">
            <Search className="h-5 w-5" />
          </button>
          
          <Link href="/carrinho" className="relative rounded-md p-2 text-neutral-400 hover:text-white transition-colors">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 font-mono text-[10px] font-bold text-black animate-in fade-in zoom-in duration-200">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

      </div>
    </header>
  );
}