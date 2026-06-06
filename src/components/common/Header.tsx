// src/components/common/Header.tsx
"use client";

import Link from "next/link";
import { ShoppingBag, User, LogOut, LayoutDashboard, ClipboardList } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSupabase } from "@/hooks/useSupabase";

export function Header() {
  const { cartCount } = useCart();
  const { user, role, logout, loading } = useSupabase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* LOGO REFEITA: Ícone Puro + Texto Altamente Customizável */}
        <Link href="/" className="flex items-center gap-2.5 transition-all hover:opacity-80 active:scale-[0.98] group">
          <img 
            src="/logo-symbol.svg" // Exporte APENAS o "E" azul do Figma para cá
            alt="Símbolo ELCOMERC" 
            className="h-6 w-auto object-contain transition-transform duration-300 group-hover:rotate-3" 
          />
          <span className="font-mono text-lg font-black tracking-wider text-neutral-100 transition-colors group-hover:text-brand-cyan">
            EL<span className="text-brand-cyan">COMERC</span>
          </span>
        </Link>

        {/* Área de Ações */}
        <div className="flex items-center gap-4">
          {!loading && (
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center gap-2.5 border-r border-neutral-800 pr-4 sm:gap-3">
                  <Link
                    href="/pedidos"
                    className="flex items-center gap-1 rounded border border-neutral-800 bg-neutral-900/50 px-2.5 py-1 font-mono text-[10px] font-bold text-neutral-300 transition-all duration-200 hover:border-brand-cyan/40 hover:text-brand-cyan"
                  >
                    <ClipboardList className="h-3 w-3 text-brand-cyan/80" />
                    <span className="hidden sm:inline">MEUS PEDIDOS</span>
                    <span className="sm:hidden">PEDIDOS</span>
                  </Link>

                  {role === "admin" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-1 rounded border border-brand-cyan/20 bg-brand-cyan/10 px-2.5 py-1 font-mono text-[10px] font-black text-brand-cyan transition-all duration-200 hover:bg-brand-cyan/25"
                    >
                      <LayoutDashboard className="h-3 w-3" />
                      <span>ADM</span>
                    </Link>
                  )}

                  <span className="hidden font-mono text-xs font-bold tracking-tight text-neutral-300 md:block">
                    {user.user_metadata?.name?.split(" ")[0]?.toUpperCase() || "CLIENTE"}
                  </span>
                  
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 rounded border border-red-500/20 bg-red-500/10 px-2 py-1 font-mono text-[10px] font-black text-red-400 transition-all duration-200 hover:bg-red-500/20 hover:text-red-300 cursor-pointer"
                  >
                    <LogOut className="h-3 w-3" />
                    <span>SAIR</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-1.5 font-mono text-xs font-bold text-neutral-300 transition-all duration-200 hover:border-brand-cyan hover:text-white"
                >
                  <User className="h-3.5 w-3.5 text-brand-cyan" />
                  <span>ENTRAR</span>
                </Link>
              )}
            </div>
          )}
          
          {/* Sacola de Compras */}
          <Link href="/carrinho" className="relative rounded-md p-2 text-neutral-400 hover:text-brand-cyan transition-colors duration-200">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-cyan font-mono text-[10px] font-bold text-black scale-100 animate-in zoom-in duration-300">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}