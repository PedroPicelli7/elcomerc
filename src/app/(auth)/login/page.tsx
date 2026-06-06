// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { supabaseClient } from "@/services/supabase/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const redirectToUrl = typeof window !== "undefined"
        ? `${window.location.origin}/`
        : "https://elcomerc.vercel.app/";

      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectToUrl,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Erro no login com Google:", error);
      setErrorMessage(
        error.message || "Ocorreu um erro ao tentar conectar com o Google.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8 shadow-2xl backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header do Box - Nova Identidade */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 shadow-lg shadow-brand-cyan/5">
            <img 
              src="/icon.png" 
              alt="ELCOMERC Symbol" 
              className="h-8 w-auto object-contain animate-pulse" 
            />
          </div>
          <h2 className="mt-6 text-xl font-black tracking-wider text-white font-mono uppercase">
            Acessar a <span className="text-brand-cyan">ELCOMERC</span>
          </h2>
          <p className="mt-2 text-xs font-mono text-neutral-400 max-w-xs leading-relaxed">
            Entre para visualizar seu carrinho, fechar pedidos e acompanhar suas compras de performance.
          </p>
        </div>

        {/* Feedback de Erro */}
        {errorMessage && (
          <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-center text-xs font-mono text-red-400">
            {errorMessage}
          </div>
        )}

        {/* Botão de Autenticação */}
        <div className="mt-8 space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/80 px-4 py-3 text-sm font-bold text-neutral-200 transition-all duration-300 hover:bg-neutral-900 hover:border-brand-cyan/50 hover:text-white disabled:opacity-50 font-mono uppercase cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-600 border-t-brand-cyan" />
            ) : (
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.33 0 3.33 2.69 1.34 6.622l3.927 3.143z" />
                <path fill="#4285F4" d="M23.49 12.275c0-.818-.073-1.604-.21-2.364H12v4.473h6.445a5.517 5.517 0 0 1-2.395 3.62l3.75 2.907c2.195-2.022 3.46-5 3.46-8.636z" />
                <path fill="#FBBC05" d="M5.266 14.235L1.34 17.378A11.948 11.948 0 0 0 12 24c3.055 0 5.782-1.014 7.8-2.738l-3.75-2.907a7.114 7.114 0 0 1-4.05 1.154 7.077 7.077 0 0 1-6.734-4.856z" />
                <path fill="#34A853" d="M5.266 9.765a7.03 7.03 0 0 1 0 4.47L1.34 17.378a11.92 11.92 0 0 1 0-10.756l3.926 3.143z" />
              </svg>
            )}
            {isLoading ? "Validando..." : "Entrar com o Google"}
          </button>
        </div>

        {/* Link para mudar de tela */}
        <div className="mt-6 border-t border-neutral-800/60 pt-6 text-center text-xs font-mono">
          <p className="text-neutral-500">
            Novo por aqui?{" "}
            <Link href="/cadastro" className="text-brand-cyan hover:underline inline-flex items-center gap-0.5 transition-colors">
              Criar uma account <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </div>
      </div>

      <Link href="/" className="mt-6 text-xs font-mono text-neutral-500 hover:text-neutral-300 transition-colors">
        [ Voltar para a vitrine principal ]
      </Link>
    </div>
  );
}