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
                router.replace("/area-do-aluno");
                return;
            }

            // Não logado => vai pro login
            if (!user) {
                router.replace("/area-do-aluno");
                return;
            }

            // Professor => /professor
            if (user.user_metadata?.role === "professor") {
                router.replace("/professor");
                return;
            }

            // Qualquer outro => aluno
            router.replace("/area-do-aluno/dashboard");
        }

        verificar();
    }, [router]);

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">
            <p className="text-sm text-zinc-400">Redirecionando...</p>
        </main>
    );
}
