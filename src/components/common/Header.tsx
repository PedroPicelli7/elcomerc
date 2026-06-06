// src/components/common/Header.tsx
"use client";

import Link from "next/link";
import { ShoppingBag, Wrench, User, LogOut, LayoutDashboard, ClipboardList } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSupabase } from "@/hooks/useSupabase";

export function Header() {
  const { cartCount } = useCart();
  const { user, role, logout, loading } = useSupabase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-mono text-xl font-black tracking-tighter text-white">
          <Wrench className="h-5 w-5 text-orange-500" />
          EL<span className="text-orange-500">COMERC</span>
        </Link>

        {/* NOTA: A barra de pesquisa redundante que ocupava o centro foi removida deste bloco */}

        {/* Ações / Área do Usuário / Carrinho */}
        <div className="flex items-center gap-4">
          
          {/* Lógica de Autenticação Dinâmica */}
          {!loading && (
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center gap-2.5 border-r border-neutral-800 pr-4 sm:gap-3">
                  
                  {/* BOTÃO DO CLIENTE: Histórico de Compras Pessoal */}
                  <Link
                    href="/pedidos"
                    className="flex items-center gap-1 rounded border border-neutral-800 bg-neutral-900/50 px-2.5 py-1 font-mono text-[10px] font-bold text-neutral-300 transition-all hover:border-neutral-700 hover:text-white"
                    title="Ver minhas compras"
                  >
                    <ClipboardList className="h-3 w-3 text-orange-500/80" />
                    <span className="hidden sm:inline">MEUS PEDIDOS</span>
                    <span className="sm:hidden">PEDIDOS</span>
                  </Link>

                  {/* BOTÃO SECRETO DO ADMIN: Exibido apenas para a gerência */}
                  {role === "admin" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-1 rounded border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 font-mono text-[10px] font-black text-orange-400 transition-all hover:bg-orange-500/25 hover:text-orange-300"
                    >
                      <LayoutDashboard className="h-3 w-3" />
                      <span>ADM</span>
                    </Link>
                  )}

                  {/* Nome do usuário (Ocultado em telas muito pequenas para não quebrar layout) */}
                  <span className="hidden font-mono text-xs font-bold tracking-tight text-neutral-300 md:block">
                    {user.user_metadata?.name?.split(" ")[0]?.toUpperCase() || "CLIENTE"}
                  </span>
                  
                  {/* Botão de Sair */}
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 rounded border border-red-500/20 bg-red-500/10 px-2 py-1 font-mono text-[10px] font-black text-red-400 transition-all hover:bg-red-500/20 hover:text-red-300"
                    title="Sair da conta"
                  >
                    <LogOut className="h-3 w-3" />
                    <span>SAIR</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-1.5 font-mono text-xs font-bold text-neutral-300 transition-all hover:border-neutral-700 hover:text-white"
                >
                  <User className="h-3.5 w-3.5 text-orange-500" />
                  <span>ENTRAR</span>
                </Link>
              )}
            </div>
          )}
          
          {/* Sacola de Compras */}
          <Link href="/carrinho" className="relative rounded-md p-2 text-neutral-400 hover:text-white transition-colors">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 font-mono text-[10px] font-bold text-black">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

      </div>
    </header>
  );
}