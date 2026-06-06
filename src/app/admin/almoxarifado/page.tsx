// src/app/admin/almoxarifado/page.tsx
"use client";

import { useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { Header } from "@/components/common/Header";
import { supabaseClient } from "@/services/supabase/client";
import { PackagePlus, ArrowLeft, ShieldAlert, FileJson, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AlmoxarifadoPage() {
  const { role, loading } = useSupabase();
  const [jsonInput, setJsonInput] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Exemplo de modelo para o seu pai copiar e colar sem errar
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
      setIsSaving(true);
      setStatusMessage(null);

      if (!jsonInput.trim()) {
        throw new Error("O campo de texto está vazio. Insira os dados dos produtos.");
      }

      // Valida se o formato do texto colado é um JSON válido
      const parsedProducts = JSON.parse(jsonInput);

      if (!Array.isArray(parsedProducts)) {
        throw new Error("O formato precisa ser um array de produtos. Ex: [ { ... }, { ... } ]");
      }

      // Higieniza os dados garantindo que preço e estoque sejam números puros
      const sanitizedProducts = parsedProducts.map((prod: any) => ({
        name: prod.name,
        // CORREÇÃO: Ajustado de prod.slue para prod.slug com 'g'
        slug: prod.slug || prod.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: prod.description || "",
        price: Number(prod.price),
        image_url: prod.image_url || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500",
        weight: Number(prod.weight) || 0,
        // CORREÇÃO: Removido o caractere estranho '机制' que causou o erro do print
        stock: Number(prod.stock) || 0,
        category_id: prod.category_id
      }));

      // Insere todo o bloco de uma vez só (Bulk Insert) no Supabase
      const { error } = await supabaseClient
        .from("products")
        .insert(sanitizedProducts);

      if (error) throw error;

      setStatusMessage({ type: "success", text: `${sanitizedProducts.length} produtos importados e integrados com sucesso!` });
      setJsonInput("");
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message || "Falha ao processar o JSON. Verifique a sintaxe." });
    } finally {
      setIsSaving(false);
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
      <main className="min-h-screen bg-neutral-950 px-4 py-8 sm:px-6 lg:px-8 mx-auto w-full max-w-5xl">
        
        {/* Voltar */}
        <Link href="/admin" className="flex items-center gap-1 font-mono text-xs text-neutral-500 hover:text-neutral-300 transition-colors mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> [ Voltar para o Painel Principal ]
        </Link>

        <div className="border-b border-neutral-800 pb-6 mb-8">
          <h1 className="text-2xl font-black text-white font-mono uppercase flex items-center gap-2">
            <PackagePlus className="text-orange-500 h-6 w-6" /> Almoxarifado <span className="text-orange-500">Massa</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-2 font-mono">
            Cole blocos de dados estruturados para dar entrada em lotes inteiros de mercadorias instantaneamente.
          </p>
        </div>

        {/* FEEDBACKS DE STATUS */}
        {statusMessage && (
          <div className={`mb-6 flex items-center gap-3 rounded-xl border p-4 font-mono text-xs ${
            statusMessage.type === "success" 
              ? "border-green-500/20 bg-green-500/5 text-green-400" 
              : "border-red-500/20 bg-red-500/5 text-red-400"
          }`}>
            {statusMessage.type === "success" ? <CheckCircle2 className="h-5 w-5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 flex-shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* ÁREA DE IMPORTAÇÃO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Editor de Texto */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <FileJson className="h-4 w-4 text-orange-500" /> Bloco de Entrada de Dados (JSON Array)
              </label>
              <button 
                onClick={() => setJsonInput(placeholderExample)}
                className="text-[10px] font-mono text-neutral-500 hover:text-orange-500 transition-colors"
              >
                [ Carregar Exemplo ]
              </button>
            </div>
            
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`[\n  {\n    "name": "Nome da Peça",\n    "price": 89.90,\n    "stock": 20,\n    "category_id": "Corte o UUID no banco e cole aqui"\n  }\n]`}
              className="h-96 w-full rounded-xl border border-neutral-800 bg-neutral-900 p-4 font-mono text-xs text-neutral-200 placeholder-neutral-600 transition-all focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />

            <button
              onClick={handleMassImport}
              disabled={isSaving}
              className="w-full rounded-md bg-orange-500 py-3 text-sm font-black text-black hover:bg-orange-400 transition-colors uppercase font-mono disabled:opacity-40"
            >
              {isSaving ? "Processando Lote..." : "Dar Entrada no Estoque"}
            </button>
          </div>

          {/* Manual Técnico Rápido de Apoio */}
          <div className="lg:col-span-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 h-fit space-y-4 font-mono">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-2">
              Guia Operacional
            </h3>
            <ul className="text-[11px] text-neutral-400 space-y-3 list-disc pl-4 leading-relaxed">
              <li>Cada produto inserido precisa ter um <strong className="text-neutral-200">category_id</strong> válido copiado diretamente da tabela de categorias do Supabase.</li>
              <li>O campo <strong className="text-neutral-200">slug</strong> é gerado automaticamente a partir do nome se você deixar em branco.</li>
              <li>Não utilize símbolos de moeda como <code className="text-orange-400">R$</code> no preço, use apenas o numeral separado por ponto decimal (Ex: <code className="text-green-400">54.00</code>).</li>
            </ul>
          </div>

        </div>

      </main>
    </>
  );
}