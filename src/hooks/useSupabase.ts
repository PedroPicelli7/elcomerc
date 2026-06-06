// src/hooks/useSupabase.ts
"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/services/supabase/client";
import { User } from "@supabase/supabase-js";

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"client" | "admin" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Busca a sessão ativa ao carregar o app
    const getSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        // Busca o papel (role) do usuário na nossa tabela de perfis
        const { data } = await supabaseClient
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        
        setRole(data?.role || "client");
      }
      setLoading(false);
    };

    getSession();

    // 2. Escuta mudanças no estado de autenticação (Login/Logout) em tempo real
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const { data } = await supabaseClient
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();
          setRole(data?.role || "client");
        } else {
          setUser(null);
          setRole(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabaseClient.auth.signOut();
  };

  return { user, role, loading, logout };
}