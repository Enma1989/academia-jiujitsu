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
        <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/Jiu-Jitsu_Wallpaper002.jpg"
                    alt="Academia Background"
                    fill
                    priority
                    className="object-cover object-center opacity-60" // Opacidade ajustada para criar contraste
                />
                {/* Dark Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
            </div>

            {/* Login Container */}
            <div className="relative z-10 w-full max-w-[420px] px-4">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/75 p-8 shadow-2xl backdrop-blur-md ring-1 ring-white/5 md:p-10">

                    <div className="flex flex-col items-center text-center">
                        {/* Logo */}
                        <div className="relative mb-6 h-20 w-20 overflow-hidden rounded-full border border-zinc-700 bg-zinc-900/80 shadow-lg">
                            <Image
                                src="/caio-matuto-logo.png"
                                alt="Logo Caio Matuto Jiu-Jitsu"
                                fill
                                className="object-contain p-2"
                            />
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                            Área do Professor
                        </h1>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
                            Acesso Restrito
                        </p>
                    </div>

                    {erro && (
                        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                            <p className="flex items-center gap-2">
                                <span className="text-red-500">⚠️</span> {erro}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="mt-8 space-y-5">
                        <div className="space-y-1.5">
                            <label
                                htmlFor="email"
                                className="ml-1 text-xs font-semibold uppercase tracking-wider text-zinc-400"
                            >
                                E-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl border border-zinc-700/50 bg-zinc-900/50 px-4 py-3.5 text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-red-500 focus:bg-zinc-900 focus:ring-1 focus:ring-red-500 hover:bg-zinc-900/80"
                                placeholder="exemplo@email.com"
                                autoComplete="email"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="password"
                                className="ml-1 text-xs font-semibold uppercase tracking-wider text-zinc-400"
                            >
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-700/50 bg-zinc-900/50 px-4 py-3.5 text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-red-500 focus:bg-zinc-900 focus:ring-1 focus:ring-red-500 hover:bg-zinc-900/80"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 w-full rounded-xl bg-red-600 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-red-900/20 transition-all hover:bg-red-500 hover:shadow-red-900/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Entrando...
                                </span>
                            ) : (
                                "Entrar"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <a
                            href="#"
                            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                            onClick={(e) => e.preventDefault()} // Stub link
                        >
                            Esqueci minha senha
                        </a>
                    </div>
                </div>

                {/* Footer info/copyright optional */}
                <p className="mt-6 text-center text-[10px] text-white/30">
                    © {new Date().getFullYear()} Caio Matuto Jiu-Jitsu. Todos os direitos reservados.
                </p>
            </div>
        </main>
    );
}
