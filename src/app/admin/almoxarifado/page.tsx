// src/app/admin/almoxarifado/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { Header } from "@/components/common/Header";
import { supabaseClient } from "@/services/supabase/client";
import { ArrowLeft, ShieldAlert, FileJson, Save, RefreshCw, PlusCircle } from "lucide-react";
import Link from "next/link";

interface ProductRow {
  id: string;
  name: string;
  price: number;
  stock: number;
  categories?: { name: string } | null;
}

interface CategoryOption {
  id: string;
  name: string;
}

export default function AlmoxarifadoPage() {
  const { role, loading } = useSupabase();
  const [jsonInput, setJsonInput] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSavingMass, setIsSavingMass] = useState(false);

  // Estados da tabela e categorias
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Estados do Formulário de Novo Produto
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdWeight, setNewProdWeight] = useState("");
  const [newProdCategoryId, setNewProdCategoryId] = useState("");
  const [newProdDescription, setNewProdDescription] = useState("");
  const [newProdImageUrl, setNewProdImageUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Carrega categorias e estoque do banco
  async function loadData() {
    try {
      setLoadingProducts(true);
      setStatusMessage(null);
      
      // 1. Busca Produtos
      const { data: prodData, error: prodError } = await supabaseClient
        .from("products")
        .select(`id, name, price, stock, categories ( name )`)
        .order("name", { ascending: true });

      if (prodError) throw prodError;

      // 2. Busca Categorias cadastradas
      const { data: catData, error: catError } = await supabaseClient
        .from("categories")
        .select("id, name")
        .order("name");

      if (catError) throw catError;
      
      setProducts(
        (prodData || []).map((p: any) => ({
          ...p,
          price: Number(p.price),
          stock: Number(p.stock),
        }))
      );
      setCategories(catData || []);
    } catch (err: any) {
      console.error("Erro ao carregar dados do almoxarifado:", err);
      setStatusMessage({ type: "error", text: "Erro ao carregar dados: " + err.message });
    } finally {
      setLoadingProducts(false);
    }
  }

  useEffect(() => {
    if (role === "admin") {
      loadData();
    }
  }, [role]);

  // Criação Individual de um novo produto
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProdName || !newProdPrice || !newProdStock || !newProdCategoryId) {
      alert("Preencha todos os campos obrigatórios (Nome, Preço, Estoque e Categoria)!");
      return;
    }

    try {
      setIsCreating(true);
      setStatusMessage(null);

      const generatedSlug = newProdName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const { error } = await supabaseClient
        .from("products")
        .insert({
          name: newProdName,
          slug: generatedSlug,
          description: newProdDescription || "Sem descrição disponível.",
          price: Number(newProdPrice),
          stock: Number(newProdStock),
          weight: Number(newProdWeight) || 500,
          image_url: newProdImageUrl || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500",
          category_id: newProdCategoryId
        });

      if (error) throw error;

      setStatusMessage({ type: "success", text: "Novo produto cadastrado com sucesso!" });
      
      setNewProdName("");
      setNewProdPrice("");
      setNewProdStock("");
      setNewProdWeight("");
      setNewProdCategoryId("");
      setNewProdDescription("");
      setNewProdImageUrl("");

      loadData();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Erro ao cadastrar produto: " + err.message });
    } finally {
      setIsCreating(false);
    }
  };

  // Alteração rápida de preço e estoque em linha
  const handleUpdateIndividual = async (id: string, currentPrice: number, currentStock: number) => {
    try {
      setUpdatingId(id);
      setStatusMessage(null);
      const { error } = await supabaseClient
        .from("products")
        .update({ price: currentPrice, stock: currentStock })
        .eq("id", id);

      if (error) throw error;
      setStatusMessage({ type: "success", text: "Alterações salvas com sucesso!" });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Falha ao salvar: " + err.message });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLocalRowChange = (id: string, field: "price" | "stock", value: number) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleMassImport = async () => {
    try {
      setIsSavingMass(true);
      setStatusMessage(null);

      if (!jsonInput.trim()) throw new Error("Campo vazio.");
      const parsedProducts = JSON.parse(jsonInput);
      if (!Array.isArray(parsedProducts)) throw new Error("Precisa ser um array.");

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

      setStatusMessage({ type: "success", text: `${sanitizedProducts.length} produtos importados!` });
      setJsonInput("");
      loadData();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setIsSavingMass(false);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400 font-mono text-xs">[ CARREGANDO... ]</div>;
  if (role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 text-center">
        <ShieldAlert className="h-10 w-10 text-red-500 mb-4" />
        <h1 className="text-white font-mono font-black">ACESSO NEGADO</h1>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-950 px-4 py-8 sm:px-6 lg:px-8 mx-auto w-full max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-1 font-mono text-xs text-neutral-500 hover:text-brand-cyan transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> [ Voltar para o Painel Principal ]
          </Link>

          {statusMessage && (
            <div className={`font-mono text-[11px] px-3 py-1 rounded border ${
              statusMessage.type === "success" 
                ? "bg-emerald-950/30 border-emerald-800 text-emerald-400" 
                : "bg-red-950/30 border-red-800 text-red-400"
            }`}>
              [ {statusMessage.text.toUpperCase()} ]
            </div>
          )}
        </div>

        {/* FORMULÁRIO DE NOVO PRODUTO SINTONIZADO NO CIANO */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
          <div className="border-b border-neutral-800 pb-3 flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-brand-cyan" />
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-tight">
              Cadastrar Novo Produto no Catálogo
            </h2>
          </div>

          <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs text-neutral-300">
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-[10px] text-neutral-500 uppercase font-bold">Nome da Autopeça/Ferramenta *</label>
              <input
                type="text"
                required
                placeholder="Ex: Jogo de Chaves Fixas Combinadas"
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-brand-cyan focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-neutral-500 uppercase font-bold">Categoria *</label>
              <select
                required
                value={newProdCategoryId}
                onChange={(e) => setNewProdCategoryId(e.target.value)}
                className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-brand-cyan focus:outline-none cursor-pointer"
              >
                <option value="">Selecione...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-neutral-500 uppercase font-bold">Preço de Venda (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={newProdPrice}
                onChange={(e) => setNewProdPrice(e.target.value)}
                className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-brand-cyan focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-neutral-500 uppercase font-bold">Estoque Inicial *</label>
              <input
                type="number"
                required
                placeholder="0"
                value={newProdStock}
                onChange={(e) => setNewProdStock(e.target.value)}
                className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-brand-cyan focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-neutral-500 uppercase font-bold">Peso em gramas (Opcional)</label>
              <input
                type="number"
                placeholder="500"
                value={newProdWeight}
                onChange={(e) => setNewProdWeight(e.target.value)}
                className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-brand-cyan focus:outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-3 flex flex-col gap-1.5">
              <label className="text-[10px] text-neutral-500 uppercase font-bold">URL da Imagem do Produto (Opcional)</label>
              <input
                type="url"
                placeholder="https://linkdafoto.com/imagem.jpg"
                value={newProdImageUrl}
                onChange={(e) => setNewProdImageUrl(e.target.value)}
                className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-brand-cyan focus:outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-3 flex flex-col gap-1.5">
              <label className="text-[10px] text-neutral-500 uppercase font-bold">Descrição Técnica</label>
              <textarea
                placeholder="Detalhes sobre a durabilidade, compatibilidade ou marca..."
                value={newProdDescription}
                onChange={(e) => setNewProdDescription(e.target.value)}
                className="w-full h-16 rounded border border-neutral-800 bg-neutral-950 p-3 text-white focus:border-brand-cyan focus:outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-3 pt-2">
              <button
                type="submit"
                disabled={isCreating}
                className="w-full rounded bg-brand-cyan py-2.5 font-mono text-xs font-black text-black hover:bg-brand-cyan/80 transition-all duration-200 uppercase tracking-tight shadow-lg shadow-brand-cyan/10 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30 cursor-pointer"
              >
                {isCreating ? "Salvando item no catálogo..." : "Adicionar Produto ao Catálogo"}
              </button>
            </div>
          </form>
        </div>

        {/* TABELA DE ATUALIZAÇÃO RÁPIDA */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white font-mono uppercase">
                Atualização de Estoque Rápida
              </h2>
            </div>
            <button 
              onClick={loadData}
              className="p-2 rounded border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`h-4 w-4 text-brand-cyan ${loadingProducts ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingProducts ? (
            <div className="text-center py-8 font-mono text-xs text-neutral-500 animate-pulse">[ CARREGANDO... ]</div>
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
                      <td className="py-3 px-2 text-white font-bold max-w-[220px] truncate">{product.name}</td>
                      <td className="py-3 px-2 text-neutral-400 uppercase text-[10px]">{product.categories?.name || "Geral"}</td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          step="0.01"
                          value={product.price}
                          onChange={(e) => handleLocalRowChange(product.id, "price", Number(e.target.value))}
                          className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-white focus:border-brand-cyan focus:outline-none transition-colors"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          value={product.stock}
                          onChange={(e) => handleLocalRowChange(product.id, "stock", Number(e.target.value))}
                          className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-white focus:border-brand-cyan focus:outline-none transition-colors"
                        />
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => handleUpdateIndividual(product.id, product.price, product.stock)}
                          disabled={updatingId === product.id}
                          className="inline-flex h-7 w-7 items-center justify-center rounded bg-brand-cyan text-black hover:bg-brand-cyan/80 transition-all cursor-pointer disabled:opacity-30 active:scale-90"
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

        {/* SEÇÃO 2: IMPORTAÇÃO EM MASSA */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <h2 className="text-sm font-bold text-neutral-400 font-mono uppercase tracking-tight flex items-center gap-2">
              <FileJson className="h-4 w-4 text-neutral-500" /> Importador Avançado em Lote (Backup/JSON)
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Insira o bloco JSON de produtos aqui..."
                className="h-28 w-full rounded-lg border border-neutral-800 bg-neutral-950 p-3 font-mono text-xs text-neutral-300 focus:border-brand-cyan focus:outline-none transition-colors"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleMassImport}
                  disabled={isSavingMass}
                  className="flex-1 rounded bg-neutral-800 border border-neutral-700 hover:border-brand-cyan/40 py-2.5 text-xs font-bold text-white uppercase font-mono disabled:opacity-50 cursor-pointer transition-all hover:bg-neutral-900"
                >
                  {isSavingMass ? "Importando dados..." : "Importar em Bloco"}
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}