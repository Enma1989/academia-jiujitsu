"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import Link from "next/link";

export default function ProfessorDashboard() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            window.location.href = "/login";
            return;
        }

        // Double check authorized role client-side just in case
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const role = profile?.role;
        if (!role || !["admin", "teacher", "professor"].includes(role)) {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login?error=forbidden";
            return;
        }

        setLoading(false);
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">
                <p>Verificando acesso...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <h1 className="text-3xl font-bold text-white mb-2">Painel do Professor</h1>
            <p className="text-zinc-400 mb-8">Bem-vindo à área administrativa.</p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Link
                    href="/professor/agendar"
                    className="group block rounded-xl border border-zinc-800 bg-zinc-900 p-6 hover:border-red-600/50 hover:bg-zinc-900/80 transition-all"
                >
                    <h2 className="text-xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors">Agendar Aula Experimental</h2>
                    <p className="text-sm text-zinc-400">
                        Marque uma nova aula experimental para um aluno interessado.
                    </p>
                </Link>

                <Link
                    href="/professor/aulas-experimentais"
                    className="group block rounded-xl border border-zinc-800 bg-zinc-900 p-6 hover:border-red-600/50 hover:bg-zinc-900/80 transition-all"
                >
                    <h2 className="text-xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors">Aulas Experimentais</h2>
                    <p className="text-sm text-zinc-400">
                        Veja a lista de aulas agendadas, confirme presenças e filtre por data.
                    </p>
                </Link>
            </div>

            <div className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-500">
                <p>
                    <strong>Nota:</strong> O cadastro completo de alunos matriculados e gestão financeira são realizados no sistema principal. Esta área é focada em experimentais.
                </p>
            </div>
        </div>
    );
}
