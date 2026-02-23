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
            <div className="flex h-screen items-center justify-center bg-[#FBFBFB] text-zinc-400">
                <p>Verificando acesso...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 space-y-10">
            <div>
                <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight mb-2">Painel do Professor</h1>
                <p className="text-zinc-500 font-medium">Bem-vindo à área administrativa da academia.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Link
                    href="/professor/alunos"
                    className="group relative block rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="absolute top-6 right-6 w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-600 transition-colors duration-300">
                        <svg className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 mb-3 mt-4 group-hover:text-red-600 transition-colors">Gestão de Alunos</h2>
                    <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                        Visualize, cadastre, edite ou remova alunos matriculados na academia.
                    </p>
                </Link>

                <Link
                    href="/professor/mensalidades"
                    className="group relative block rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="absolute top-6 right-6 w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center group-hover:bg-red-600 transition-colors duration-300">
                        <svg className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 mb-3 mt-4 group-hover:text-red-600 transition-colors">Mensalidades</h2>
                    <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                        Acompanhe o status de pagamento anual de cada aluno de forma rápida.
                    </p>
                </Link>

                <Link
                    href="/professor/agendar"
                    className="group relative block rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="absolute top-6 right-6 w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center group-hover:bg-red-600 transition-colors duration-300">
                        <svg className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 mb-3 mt-4 group-hover:text-red-600 transition-colors">Agendar Experimental</h2>
                    <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                        Marque novas aulas experimentais para alunos iniciantes e acompanhe os agendamentos.
                    </p>
                </Link>
            </div>

            <div className="rounded-2xl bg-zinc-900 p-8 text-white flex flex-col md:flex-row items-center gap-6 shadow-2xl overflow-hidden relative">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-red-600/20 blur-3xl rounded-full" />
                <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-1">Dica de Gestão</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
                        Mantenha o status das mensalidades atualizado para garantir o controle financeiro da academia. Alunos ativos com mensalidades em dia aparecem destacados no sistema.
                    </p>
                </div>
            </div>
        </div>
    );
}
