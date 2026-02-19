"use client";

import React from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const email = String(formData.get("email") || "").trim();
        const password = String(formData.get("password") || "").trim();

        if (!email || !password) {
            alert("Preencha e-mail e senha.");
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error(error);
            alert("Falha no login: " + error.message);
            return;
        }

        // Redireciona para o dashboard do aluno
        router.push("/area-do-aluno/dashboard");
    }

    return (
        <div className="rounded-3xl border border-white/15 bg-white/10 px-7 py-8 shadow-[0_0_60px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <form className="space-y-5" onSubmit={handleSubmit}>
                {/* CAMPO E-MAIL */}
                <div className="space-y-1">
                    <label
                        htmlFor="email"
                        className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-200"
                    >
                        E-mail
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm text-zinc-50 placeholder:text-zinc-300 outline-none transition focus:border-red-500/80 focus:ring-2 focus:ring-red-500/60"
                        placeholder="seuemail@exemplo.com"
                    />
                </div>

                {/* CAMPO SENHA */}
                <div className="space-y-1">
                    <label
                        htmlFor="password"
                        className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-200"
                    >
                        Senha
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm text-zinc-50 placeholder:text-zinc-300 outline-none transition focus:border-red-500/80 focus:ring-2 focus:ring-red-500/60"
                        placeholder="Digite sua senha"
                    />
                </div>

                {/* LEMBRAR + ESQUECEU SENHA */}
                <div className="flex items-center justify-between text-xs text-zinc-300">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="h-3 w-3 rounded border-white/40 bg-transparent text-red-500 focus:ring-red-500/60"
                        />
                        <span>Lembrar de mim</span>
                    </label>

                    <button
                        type="button"
                        className="text-[11px] font-medium text-red-400 hover:text-red-300"
                    >
                        Esqueceu a senha?
                    </button>
                </div>

                {/* BOTÃO ENTRAR */}
                <button
                    type="submit"
                    className="mt-2 w-full rounded-full bg-red-600 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-lg shadow-red-900/50 transition hover:bg-red-500"
                >
                    Entrar
                </button>
            </form>

            {/* RODAPÉ DO CARD */}
            <div className="mt-5 border-t border-white/10 pt-4 text-center">
                <p className="text-[11px] text-zinc-300">
                    Não tem acesso ainda? Fale com a recepção da academia para liberar seu
                    usuário.
                </p>
            </div>
        </div>
    );
}
