// src/app/admin/almoxarifado/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { Header } from "@/components/common/Header";
import { supabaseClient } from "@/services/supabase/client";
import { PackagePlus, ArrowLeft, ShieldAlert, FileJson, CheckCircle2, AlertCircle, Save, RefreshCw } from "lucide-react";
import Link from "next/link";

interface ProductRow {
  id: string;
  name: string;
  price: number;
  stock: number;
  categories?: { name: string };
}

export default function AlmoxarifadoPage() {
  const { role, loading } = useSupabase();
  const [jsonInput, setJsonInput] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSavingMass, setIsSavingMass] = useState(false);

  // Estados para a tabela individual
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Função para carregar a lista de produtos na tabela
  async function loadInventory() {
    try {
      setLoadingProducts(true);
      const { data, error } = await supabaseClient
        .from("products")
        .select(`id, name, price, stock, categories ( name )`)
        .order("name", { ascending: true });

      if (error) throw error;
      
      setProducts(
        (data || []).map((p: any) => ({
          ...p,
          price: Number(p.price),
          stock: Number(p.stock),
        }))
      );
    } catch (err) {
      console.error("Erro ao carregar inventário:", err);
    } finally {
      setLoadingProducts(false);
    }
  }

  useEffect(() => {
    if (role === "admin") {
      loadInventory();
    }
  }, [role]);

  // Salva a alteração individual de preço e estoque de um produto
  const handleUpdateIndividual = async (id: string, currentPrice: number, currentStock: number) => {
    try {
      setUpdatingId(id);
      const { error } = await supabaseClient
        .from("products")
        .update({
          price: currentPrice,
          stock: currentStock
        })
        .eq("id", id);

      if (error) throw error;

      // Feedback rápido de sucesso temporário na linha
      alert("Produto atualizado com sucesso no banco!");
    } catch (err: any) {
      console.error(err);
      alert("Falha ao atualizar produto: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Manipulador local para atualizar o estado da linha antes de salvar
  const handleLocalRowChange = (id: string, field: "price" | "stock", value: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const placeholderExample = JSON.stringify([
    {
      "name": "Chave de Impacto Pneumática 1/2",
      "slug": "chave-de-impacto-pneumatica-12",
      "description": "Alta força de torque para aperto e desaperto de parafusos de rodas.",
      "price": 389.90,
      "image_url": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500",
      "weight": 2100,
      "stock": 10,
      "category_id": "SUBSTITUA_PELO_UUID_DA_CATEGORIA"
    }
  ], null, 2);

  const handleMassImport = async () => {
    try {
      setIsSavingMass(true);
      setStatusMessage(null);

      if (!jsonInput.trim()) {
        throw new Error("O campo de texto está vazio. Insira os dados.");
      }

      const parsedProducts = JSON.parse(jsonInput);
      if (!Array.isArray(parsedProducts)) {
        throw new Error("O formato precisa ser um array de produtos.");
      }

      const sanitizedProducts = parsedProducts.map((prod: any) => ({
        name: prod.name,
        slug: prod.slug || prod.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: prod.description || "",
        price: Number(prod.price),
        image_url: prod.image_url || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500",
        weight: Number(prod.weight) || 0,
        stock: Number(prod.stock) || 0,
        category_id: prod.category_id
      }));

      const { error } = await supabaseClient.from("products").insert(sanitizedProducts);
      if (error) throw error;

      setStatusMessage({ type: "success", text: `${sanitizedProducts.length} produtos importados com sucesso!` });
      setJsonInput("");
      loadInventory(); // Atualiza a tabela lá embaixo automaticamente
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message || "Falha ao processar o JSON." });
    } finally {
      setIsSavingMass(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400 font-mono text-xs">[ CARREGANDO PERMISSÕES... ]</div>;
  }

  if (role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 text-center">
        <ShieldAlert className="h-10 w-10 text-red-500 mb-4" />
        <h1 className="text-white font-mono font-black">ACESSO NEGADO</h1>
        <Link href="/" className="text-xs text-orange-500 mt-4 hover:underline">[ Voltar para a Home ]</Link>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-950 px-4 py-8 sm:px-6 lg:px-8 mx-auto w-full max-w-5xl space-y-12">
        
        {/* Voltar */}
        <div>
          <Link href="/admin" className="flex items-center gap-1 font-mono text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> [ Voltar para o Painel Principal ]
          </Link>
        </div>

        {/* SEÇÃO 1: EDIÇÃO INDIVIDUAL (FÁCIL PARA O SEU PAI) */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white font-mono uppercase">
                Atualização de Estoque Rápida
              </h2>
              <p className="text-xs text-neutral-400 mt-1 font-mono">
                Altere preços e quantidades diretamente na linha do produto e salve as alterações na hora.
              </p>
            </div>
            <button 
              onClick={loadInventory}
              className="p-2 rounded border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white transition-colors"
              title="Recarregar tabela"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {loadingProducts ? (
            <div className="text-center py-8 font-mono text-xs text-neutral-500 animate-pulse">
              [ CARREGANDO LISTAGEM DO ALMOXARIFADO... ]
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs text-neutral-300">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-2">Produto</th>
                    <th className="py-3 px-2">Categoria</th>
                    <th className="py-3 px-2 w-28">Preço (R$)</th>
                    <th className="py-3 px-2 w-24">Estoque</th>
                    <th className="py-3 px-2 w-20 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-neutral-950/40 transition-colors">
                      <td className="py-3 px-2 text-white font-bold max-w-[220px] truncate">
                        {product.name}
                      </td>
                      <td className="py-3 px-2 text-neutral-400 uppercase text-[10px]">
                        {product.categories?.name || "Geral"}
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          step="0.01"
                          value={product.price}
                          onChange={(e) => handleLocalRowChange(product.id, "price", Number(e.target.value))}
                          className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-white text-xs focus:border-orange-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          value={product.stock}
                          onChange={(e) => handleLocalRowChange(product.id, "stock", Number(e.target.value))}
                          className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-white text-xs focus:border-orange-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => handleUpdateIndividual(product.id, product.price, product.stock)}
                          disabled={updatingId === product.id}
                          className="inline-flex h-7 w-7 items-center justify-center rounded bg-orange-500 text-black hover:bg-orange-400 transition-colors disabled:opacity-30"
                          title="Salvar alterações"
                        >
                          <Save className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SEÇÃO 2: IMPORTAÇÃO EM MASSA (JSON PARA SEU APOIO CASO PRECISE) */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <h2 className="text-sm font-bold text-neutral-400 font-mono uppercase tracking-tight flex items-center gap-2">
              <FileJson className="h-4 w-4 text-neutral-500" /> Importador Avançado em Lote (Backup/JSON)
            </h2>
          </div>

          {statusMessage && (
            <div className={`flex items-center gap-3 rounded-md border p-3 font-mono text-xs ${
              statusMessage.type === "success" ? "border-green-500/20 bg-green-500/5 text-green-400" : "border-red-500/20 bg-red-500/5 text-red-400"
            }`}>
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-3">
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Insira o bloco JSON de produtos aqui..."
                className="h-36 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-3 font-mono text-xs text-neutral-300 focus:border-orange-500 focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleMassImport}
                  disabled={isSavingMass}
                  className="flex-1 rounded bg-neutral-800 border border-neutral-700 hover:border-neutral-600 py-2 text-xs font-bold text-white uppercase font-mono"
                >
                  {isSavingMass ? "Processando..." : "Importar em Bloco"}
                </button>
                <button 
                  onClick={() => setJsonInput(placeholderExample)}
                  className="px-3 rounded border border-neutral-800 text-[10px] text-neutral-500 font-mono hover:text-neutral-300"
                >
                  [ Exemplo ]
                </button>
              </div>
            </div>
            <div className="lg:col-span-4 text-[11px] text-neutral-500 font-mono leading-relaxed space-y-1">
              <p className="font-bold text-neutral-400">Dica:</p>
              <p>Essa área secundária serve para caso você queira extrair uma lista inteira de uma vez e injetar para ele de forma automatizada de trás dos panos!</p>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}