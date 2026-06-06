// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { Header } from "@/components/common/Header";
import { supabaseClient } from "@/services/supabase/client";
import { ShieldAlert, Package, ShoppingCart, TrendingUp, Users, ArrowUpRight, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { user, role, loading } = useSupabase();
  const [stats, setStats] = useState({ totalProducts: 0, lowStock: 0, pendingOrders: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Busca dados rápidos do banco para preencher o painel do seu pai
  useEffect(() => {
    if (role === "admin") {
      async function fetchAdminStats() {
        try {
          setLoadingStats(true);
          
          // 1. Total de Produtos Cadastrados
          const { count: prodCount } = await supabaseClient
            .from("products")
            .select("*", { count: "exact", head: true });

          // 2. Alerta de Estoque Baixo (Menos de 5 unidades na prateleira)
          const { count: stockCount } = await supabaseClient
            .from("products")
            .select("*", { count: "exact", head: true })
            .lt("stock", 5);

          // 3. Pedidos Pendentes aguardando despacho
          const { count: orderCount } = await supabaseClient
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending");

          setStats({
            totalProducts: prodCount || 0,
            lowStock: stockCount || 0,
            pendingOrders: orderCount || 0
          });
        } catch (err) {
          console.error("Erro ao carregar métricas administrativas:", err);
        } finally {
          setLoadingStats(false);
        }
      }
      fetchAdminStats();
    }
  }, [role]);

  // 1. Bloqueio de Segurança - Carregando Sessão
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400 font-mono text-xs">
        [ AUTENTICANDO CANAL ADM... ]
      </div>
    );
  }

  // 2. Bloqueio de Segurança - Usuário não é Admin
  if (role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-4 text-center">
        <div className="rounded-full bg-red-500/10 p-4 border border-red-500/20 text-red-500 mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-lg font-black font-mono uppercase text-white tracking-tight">
          Acesso Restrito à Gerência
        </h1>
        <p className="mt-2 max-w-sm text-xs text-neutral-400 font-mono">
          Este perfil não possui credenciais administrativas para gerenciar a Elcomerc.
        </p>
        <Link href="/" className="mt-6 text-xs font-mono text-orange-500 hover:underline">
          [ Voltar para a Loja ]
        </Link>
      </div>
    );
  }

  // 3. Tela do Painel Administrativo Oficial
  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-950 px-4 py-8 sm:px-6 lg:px-8 mx-auto w-full max-w-7xl">
        
        {/* Top Header ADM */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-neutral-800 pb-6">
          <div>
            <span className="text-[10px] font-black tracking-widest text-orange-500 font-mono uppercase bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded">
              Painel de Controle
            </span>
            <h1 className="text-2xl font-black text-white font-mono uppercase mt-2">
              Bastonário da Operação
            </h1>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-4 py-2 font-mono text-xs font-bold text-neutral-300 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar dados
          </button>
        </div>

        {/* GRID DE CARDS MÉTRICOS */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          
          {/* Card 1: Pedidos Pendentes */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium font-mono text-neutral-400 uppercase tracking-wider">Pedidos Novos</p>
              <p className="text-2xl font-black text-white font-mono">
                {loadingStats ? "..." : stats.pendingOrders}
              </p>
            </div>
            <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-3 text-orange-500">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>

          {/* Card 2: Total do Catálogo */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium font-mono text-neutral-400 uppercase tracking-wider">Itens no Catálogo</p>
              <p className="text-2xl font-black text-white font-mono">
                {loadingStats ? "..." : stats.totalProducts}
              </p>
            </div>
            <div className="rounded-lg bg-neutral-800 border border-neutral-700 p-3 text-neutral-300">
              <Package className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3: Alertas de Reposição de Peças */}
          <div className={`rounded-xl border p-5 flex items-center justify-between transition-colors ${
            stats.lowStock > 0 
              ? "border-red-500/20 bg-red-500/5 text-red-400" 
              : "border-neutral-800 bg-neutral-900 text-neutral-400"
          }`}>
            <div className="space-y-1">
              <p className="text-xs font-medium font-mono uppercase tracking-wider">Estoque Crítico</p>
              <p className={`text-2xl font-black font-mono ${stats.lowStock > 0 ? "text-red-500" : "text-white"}`}>
                {loadingStats ? "..." : stats.lowStock} <span className="text-xs font-normal text-neutral-500">peças</span>
              </p>
            </div>
            <div className={`rounded-lg p-3 border ${
              stats.lowStock > 0 ? "bg-red-500/10 border-red-500/20" : "bg-neutral-800 border-neutral-700"
            }`}>
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>

        </div>

        {/* SEÇÕES DE GERENCIAMENTO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Caixa de Ferramenta 1: Controle de Pedidos */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 flex flex-col justify-between group hover:border-neutral-700 transition-colors">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-tight">Gerenciador de Pedidos</h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Acompanhe as vendas em tempo real, veja o endereço do cliente para entrega na região e mude o status para enviado ou finalizado.
            </p>
          </div>
          {/* CORREÇÃO: Botão estático transformado em rota ativa */}
          <Link 
            href="/admin/pedidos" 
            className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-bold font-mono text-neutral-300 py-3 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            Abrir Controle de Pedidos <ArrowUpRight className="h-3.5 w-3.5 text-orange-500" />
          </Link>
        </div>

          {/* Caixa de Ferramenta 2: Controle de Estoque */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 flex flex-col justify-between group hover:border-neutral-700 transition-colors">
        <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-tight">Ajustar Estoque e Preços</h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
            Adicione novas autopeças, dê entrada em mercadorias novas que chegaram na oficina ou edite o valor de venda instantaneamente.
            </p>
        </div>
        {/* CORREÇÃO: Transformado em Link real apontando para o Almoxarifado em lote */}
        <Link 
            href="/admin/almoxarifado" 
            className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-bold font-mono text-neutral-300 py-3 transition-colors hover:bg-neutral-800 hover:text-white"
        >
            Abrir Almoxarifado Digital <ArrowUpRight className="h-3.5 w-3.5 text-orange-500" />
        </Link>
        </div>

        </div>

      </main>
    </>
  );
}