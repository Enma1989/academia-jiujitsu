"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setErro(null);
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Erro ao fazer login.");
            }

            // Sucesso: redireciona
            // Força reload para garantir que o cookie da sessão seja enviado ao middleware
            window.location.href = "/professor";
        } catch (err) {
            setErro((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#FBFBFB]">
            {/* Subtle Gradient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.03),transparent_40%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(220,38,38,0.03),transparent_40%)]" />
            </div>

            {/* Login Container */}
            <div className="relative z-10 w-full max-w-[440px] px-6">
                <div className="overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-white p-10 md:p-14 shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />

                    <div className="flex flex-col items-center text-center">
                        {/* Logo */}
                        <div className="relative mb-8 h-24 w-24 overflow-hidden rounded-3xl border border-zinc-100 bg-zinc-50 shadow-sm flex items-center justify-center p-3">
                            <Image
                                src="/caio-matuto-logo.png"
                                alt="Logo Caio Matuto Jiu-Jitsu"
                                fill
                                className="object-contain p-4"
                            />
                        </div>

                        <h1 className="text-3xl font-black tracking-tight text-zinc-900 md:text-4xl">
                            Painel do Professor
                        </h1>
                        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.3em] text-red-600 bg-red-50 px-3 py-1 rounded-full">
                            Acesso Restrito
                        </p>
                    </div>

                    {erro && (
                        <div className="mt-8 rounded-2xl bg-red-50 border border-red-100 p-4 text-red-600 text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {erro}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="mt-10 space-y-6">
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="ml-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500"
                            >
                                E-mail Institucional
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 px-5 py-4 text-zinc-900 placeholder-zinc-300 outline-none transition-all focus:border-red-500 focus:ring-4 focus:ring-red-500/10 hover:bg-zinc-50 font-medium"
                                placeholder="professor@caiomatuto.com"
                                autoComplete="email"
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="ml-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500"
                            >
                                Senha de Acesso
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 px-5 py-4 text-zinc-900 placeholder-zinc-300 outline-none transition-all focus:border-red-500 focus:ring-4 focus:ring-red-500/10 hover:bg-zinc-50 font-medium"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 w-full rounded-2xl bg-red-600 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-xl shadow-red-900/10 transition-all hover:bg-red-500 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <div className="h-4 w-4 animate-spin border-2 border-white/20 border-t-white rounded-full" />
                                    Autenticando...
                                </span>
                            ) : (
                                "Acessar Sistema"
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <a
                            href="#"
                            className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-red-600 transition-colors"
                            onClick={(e) => e.preventDefault()}
                        >
                            Esqueci minha senha
                        </a>
                    </div>
                </div>

                <div className="mt-10 text-center space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
                        Caio Matuto Jiu-Jitsu
                    </p>
                    <p className="text-[9px] font-medium text-zinc-300 uppercase tracking-widest">
                        © {new Date().getFullYear()} Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </main>
    );
}
