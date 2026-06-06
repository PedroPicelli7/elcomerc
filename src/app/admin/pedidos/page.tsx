// src/app/admin/pedidos/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { Header } from "@/components/common/Header";
import { supabaseClient } from "@/services/supabase/client";
import { ClipboardList, ArrowLeft, ShieldAlert, RefreshCw, Truck, MapPin, Calendar } from "lucide-react";
import Link from "next/link";

interface OrderRow {
  id: string;
  created_at: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  subtotal: number;
  shipping_cost: number;
  total: number;
  delivery_city: string;
  delivery_address: string;
  profiles?: {
    name: string;
    email: string;
  };
  order_items: {
    id: string;
    quantity: number;
    price_at_purchase: number;
    products: {
      name: string;
    } | null;
  }[];
}

export default function AdminOrdersPage() {
  const { role, loading } = useSupabase();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadOrders() {
    try {
      setLoadingOrders(true);
      const { data, error } = await supabaseClient
        .from("orders")
        .select(`
          id, created_at, status, subtotal, shipping_cost, total, delivery_city, delivery_address,
          profiles ( name, email ),
          order_items ( id, quantity, price_at_purchase, products ( name ) )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedOrders = (data as any[])?.map((order) => ({
        ...order,
        profiles: Array.isArray(order.profiles) ? order.profiles[0] : order.profiles || null,
        order_items: (order.order_items || []).map((item: any) => ({
          ...item,
          products: Array.isArray(item.products) ? item.products[0] : item.products || null
        }))
      })) || [];

      setOrders(formattedOrders as any);
    } catch (err) {
      console.error("Erro ao carregar pedidos do sistema:", err);
    } finally {
      setLoadingOrders(false);
    }
  }

  useEffect(() => {
    if (role === "admin") {
      loadOrders();
    }
  }, [role]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const { error } = await supabaseClient
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: newStatus as any } : o))
      );
      
      alert("Status do pedido atualizado!");
    } catch (err: any) {
      console.error(err);
      alert("Erro ao alterar status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending": return "border-brand-cyan/20 bg-brand-cyan/10 text-brand-cyan";
      case "processing": return "border-blue-500/20 bg-blue-500/10 text-blue-400";
      case "shipped": return "border-purple-500/20 bg-purple-500/10 text-purple-400";
      case "delivered": return "border-green-500/20 bg-green-500/10 text-green-400";
      default: return "border-neutral-700 bg-neutral-800 text-neutral-400";
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400 font-mono text-xs">[ CARREGANDO DIÁRIO DE VENDAS... ]</div>;
  if (role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 text-center">
        <ShieldAlert className="h-10 w-10 text-red-500 mb-4" />
        <h1 className="text-white font-mono font-black">ACESSO ADM RESTRITO</h1>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-950 px-4 py-8 sm:px-6 lg:px-8 mx-auto w-full max-w-5xl space-y-6 animate-in fade-in duration-500">
        
        <div>
          <Link href="/admin" className="flex items-center gap-1 font-mono text-xs text-neutral-500 hover:text-brand-cyan transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> [ Voltar para o Painel Principal ]
          </Link>
        </div>

        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white font-mono uppercase flex items-center gap-2">
              <ClipboardList className="text-brand-cyan h-6 w-6" /> Livro de <span className="text-brand-cyan">Pedidos</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1 font-mono">
              Visualize faturas, rotas de entrega regionais e mude o status de despacho das autopeças.
            </p>
          </div>
          <button 
            onClick={loadOrders}
            className="p-2 rounded border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw className="h-4 w-4 text-brand-cyan" />
          </button>
        </div>

        {loadingOrders ? (
          <div className="text-center py-12 font-mono text-xs text-neutral-500 animate-pulse">[ MAPEANDO ENTREGA DOS PEDIDOS... ]</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl font-mono text-xs text-neutral-500">
            Nenhum pedido foi fechado no site até o momento.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-4 transition-all hover:border-neutral-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/60 pb-3 font-mono text-xs">
                  <div className="space-y-1">
                    <p className="text-neutral-400 font-bold">Pedido: <span className="text-white text-[11px]">{order.id}</span></p>
                    <p className="text-[10px] text-neutral-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {new Date(order.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`rounded border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      className="rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-[11px] text-neutral-200 focus:border-brand-cyan focus:outline-none disabled:opacity-40 cursor-pointer"
                    >
                      <option value="pending">PENDENTE</option>
                      <option value="processing">PROCESSANDO</option>
                      <option value="shipped">ENVIADO</option>
                      <option value="delivered">ENTREGUE</option>
                      <option value="cancelled">CANCELADO</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 font-mono text-xs text-neutral-300">
                  <div className="md:col-span-7 space-y-2">
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Itens Solicitados</p>
                    <div className="space-y-1.5 pl-2 border-l border-neutral-800">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex justify-between items-baseline gap-2">
                          <span className="text-white font-medium line-clamp-1">
                            {item.products?.name || "Produto Removido"} 
                            <span className="text-neutral-500 text-[10px] font-normal ml-1">x{item.quantity}</span>
                          </span>
                          <span className="text-neutral-400 flex-shrink-0">
                            {(item.price_at_purchase * item.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-5 space-y-2 bg-neutral-950/40 rounded-lg p-3 border border-neutral-800/40">
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5 text-brand-cyan" /> Logística de Envio
                    </p>
                    <div className="space-y-1 text-[11px] leading-relaxed">
                      <p className="text-white font-bold truncate">Cliente: {order.profiles?.name || "Não informado"}</p>
                      <p className="text-neutral-400 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-neutral-500 flex-shrink-0" /> 
                        <span className="text-neutral-300">{order.delivery_city} - {order.delivery_address}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-800/40 pt-3 flex justify-between items-baseline font-mono text-xs text-neutral-400">
                  <div className="flex gap-4 text-[11px]">
                    <span>Subtotal: <strong className="text-neutral-200">{order.subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></span>
                    <span>Frete: <strong className="text-green-400">{order.shipping_cost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase">Faturamento:</span>{" "}
                    <strong className="text-sm font-black text-brand-cyan">{order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
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