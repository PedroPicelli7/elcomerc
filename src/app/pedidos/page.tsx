// src/app/pedidos/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { Header } from "@/components/common/Header";
import { supabaseClient } from "@/services/supabase/client";
import { ShoppingBag, Box, Truck, Calendar, ArrowLeft, Package } from "lucide-react";
import Link from "next/link";

interface UserOrder {
  id: string;
  created_at: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  subtotal: number;
  shipping_cost: number;
  total: number;
  delivery_city: string;
  delivery_address: string;
  order_items: {
    id: string;
    quantity: number;
    price_at_purchase: number;
    products: {
      name: string;
    } | null;
  }[];
}

export default function UserOrdersPage() {
  const { user, loading: authLoading } = useSupabase();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (user) {
      async function fetchMyOrders() {
        // CORREÇÃO: Garante para o compilador que 'user' não é nulo antes de rodar a query
        if (!user?.id) return;

        try {
          setLoadingOrders(true);
          
          const { data, error } = await supabaseClient
            .from("orders")
            .select(`
              id, created_at, status, subtotal, shipping_cost, total, delivery_city, delivery_address,
              order_items ( id, quantity, price_at_purchase, products ( name ) )
            `)
            .eq("user_id", user.id) // Agora o TS sabe que user.id existe com 100% de certeza
            .order("created_at", { ascending: false });

          if (error) throw error;

          // Sanitiza estruturas relacionais do PostgREST
          const formatted = (data || []).map((order: any) => ({
            ...order,
            order_items: (order.order_items || []).map((item: any) => ({
              ...item,
              products: Array.isArray(item.products) ? item.products[0] : item.products || null
            }))
          }));

          setOrders(formatted as any);
        } catch (err) {
          console.error("Erro ao buscar histórico de compras:", err);
        } finally {
          setLoadingOrders(false);
        }
      }
      fetchMyOrders();
    }
  }, [user]);

  // Helper para traduzir os status internos para o português comercial
  const translateStatus = (status: string) => {
    switch (status) {
      case "pending": return "AGUARDANDO DESPACHO";
      case "processing": return "SEPARANDO NO ALMOXARIFADO";
      case "shipped": return "SAIU PARA ENTREGA";
      case "delivered": return "PRODUTO ENTREGUE";
      case "cancelled": return "PEDIDO CANCELADO";
      default: return status.toUpperCase();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-orange-400 border-orange-500/20 bg-orange-500/5";
      case "processing": return "text-blue-400 border-blue-500/20 bg-blue-500/5";
      case "shipped": return "text-purple-400 border-purple-500/20 bg-purple-500/5";
      case "delivered": return "text-green-400 border-green-500/20 bg-green-500/5";
      default: return "text-neutral-400 border-neutral-800 bg-neutral-900";
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400 font-mono text-xs">
        [ RECUPERANDO HISTÓRICO DE COMPRAS... ]
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-950 px-4 py-8 sm:px-6 lg:px-8 mx-auto w-full max-w-4xl space-y-8">
        
        {/* Voltar rápido para a loja */}
        <div>
          <Link href="/" className="flex items-center gap-1 font-mono text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> [ Voltar para a vitrine principal ]
          </Link>
        </div>

        <div className="border-b border-neutral-800 pb-5">
          <h1 className="text-2xl font-black text-white font-mono uppercase flex items-center gap-2">
            <ShoppingBag className="text-orange-500 h-6 w-6" /> Minhas <span className="text-orange-500">Compras</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Acompanhe o andamento e o status de entrega das suas ferramentas e autopeças na Elcomerc.
          </p>
        </div>

        {/* FEEDBACK CASO NÃO TENHA NENHUM COMPROVANTE */}
        {loadingOrders ? (
          <div className="text-center py-12 font-mono text-xs text-neutral-500 animate-pulse">
            [ CONSULTANDO ARQUIVO DE COMPRAS... ]
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-neutral-800 rounded-2xl p-6">
            <Box className="h-8 w-8 text-neutral-600 mx-auto mb-4" />
            <h3 className="font-mono text-sm font-bold text-neutral-300 uppercase">Nenhum pedido efetuado</h3>
            <p className="text-xs text-neutral-500 font-mono max-w-sm mx-auto mt-2 leading-relaxed">
              Você ainda não fechou nenhuma compra usando esta conta do Google. Adicione itens ao carrinho para começar!
            </p>
            <Link 
              href="/" 
              className="mt-6 inline-block rounded border border-orange-500/20 bg-orange-500/10 px-4 py-2 font-mono text-xs font-bold text-orange-400 hover:bg-orange-500/20 transition-all"
            >
              EXPLORAR CATÁLOGO
            </Link>
          </div>
        ) : (
          /* LOOP DE PEDIDOS DO CLIENTE */
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 space-y-4 transition-all hover:border-neutral-700/80"
              >
                {/* Topo do Card de Compras */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3 font-mono text-xs">
                  <div className="space-y-0.5">
                    <p className="text-neutral-400">Código do Pedido: <span className="text-white font-bold text-[11px]">{order.id}</span></p>
                    <p className="text-[10px] text-neutral-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {new Date(order.created_at).toLocaleDateString("pt-BR")} às {new Date(order.created_at).toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  {/* Badge de Status Traduzido */}
                  <span className={`rounded border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-center ${getStatusColor(order.status)}`}>
                    {translateStatus(order.status)}
                  </span>
                </div>

                {/* Conteúdo: Itens da Nota e Endereço */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 font-mono text-xs">
                  
                  {/* Lista de Peças */}
                  <div className="md:col-span-7 space-y-2">
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Produtos Adquiridos</p>
                    <div className="space-y-2 pl-2 border-l border-neutral-800">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex justify-between items-baseline gap-4">
                          <span className="text-neutral-200 font-medium text-[11px] line-clamp-1">
                            {item.products?.name || "Produto indisponível"} 
                            <span className="text-neutral-500 font-normal text-[10px] ml-1.5">Qtd: {item.quantity}</span>
                          </span>
                          <span className="text-neutral-400 flex-shrink-0">
                            {(item.price_at_purchase * item.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detalhes de Destino */}
                  <div className="md:col-span-5 bg-neutral-950/30 rounded-lg p-3 border border-neutral-800/60 flex flex-col justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5 text-neutral-500" /> Endereço de Entrega
                      </p>
                      <p className="text-neutral-400 text-[11px] leading-relaxed mt-1.5 pl-1">
                        {order.delivery_city} - {order.delivery_address}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Resumo Financeiro da Compra */}
                <div className="border-t border-neutral-800/40 pt-3 flex justify-between items-center font-mono text-xs">
                  <div className="flex gap-4 text-[10px] text-neutral-500">
                    <span>Itens: <strong className="text-neutral-400">{order.subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></span>
                    <span>Entrega: <strong className="text-green-500">{order.shipping_cost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></span>
                  </div>
                  <div className="text-neutral-400 text-[11px]">
                    Valor Pago: <strong className="text-sm font-black text-orange-500 ml-1">{order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>
    </>
  );
}