"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AreaRedirect() {
    const router = useRouter();

    useEffect(() => {
        async function verificar() {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                router.replace("/professor");
                return;
            }

            // Não logado => vai pro login
            if (!user) {
                router.replace("/login");
                return;
            }

            // Professor => /professor
            if (user.user_metadata?.role === "professor") {
                router.replace("/professor");
                return;
            }

            // Qualquer outro => aluno
            router.replace("/professor");
        }

        verificar();
    }, [router]);

    return (
        <main className="min-h-screen bg-[#FBFBFB] flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="inline-block w-8 h-8 border-4 border-zinc-200 border-t-red-600 rounded-full animate-spin"></div>
                <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">Redirecionando...</p>
            </div>
        </main>
    );
}
