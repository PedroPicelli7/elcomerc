// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { supabaseClient } from "@/services/supabase/client";
import { Wrench, ArrowRight } from "lucide-react";
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
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl">
        {/* Header do Box */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-black">
            <Wrench className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-2xl font-black tracking-tight text-white font-mono uppercase">
            Acessar a <span className="text-orange-500">Elcomerc</span>
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Entre para visualizar seu carrinho e acompanhar seus pedidos.
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
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-neutral-700 hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 font-mono uppercase"
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-white" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.33 0 3.33 2.69 1.34 6.622l3.927 3.143z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.275c0-.818-.073-1.604-.21-2.364H12v4.473h6.445a5.517 5.517 0 0 1-2.395 3.62l3.75 2.907c2.195-2.022 3.46-5 3.46-8.636z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.266 14.235L1.34 17.378A11.948 11.948 0 0 0 12 24c3.055 0 5.782-1.014 7.8-2.738l-3.75-2.907a7.114 7.114 0 0 1-4.05 1.154 7.077 7.077 0 0 1-6.734-4.856z"
                />
                <path
                  fill="#34A853"
                  d="M5.266 9.765a7.03 7.03 0 0 1 0 4.47L1.34 17.378a11.92 11.92 0 0 1 0-10.756l3.926 3.143z"
                />
              </svg>
            )}
            {isLoading ? "Validando..." : "Entrar com o Google"}
          </button>
        </div>

        {/* Link para mudar de tela */}
        <div className="mt-6 border-t border-neutral-800 pt-6 text-center text-xs font-mono">
          <p className="text-neutral-500">
            Novo por aqui?{" "}
            <Link
              href="/cadastro"
              className="text-orange-500 hover:underline inline-flex items-center gap-0.5"
            >
              Criar uma conta <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </div>
      </div>

      <Link
        href="/"
        className="mt-6 text-xs font-mono text-neutral-500 hover:text-neutral-300 transition-colors"
      >
        [ Voltar para a vitrine principal ]
      </Link>
    </div>
  );
}
