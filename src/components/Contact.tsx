"use client";

import { useState } from "react";
import { SITE_CONFIG } from "@/lib/constants";

export function Contact() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setStatus("idle");
        setErrorMessage("");

        const formData = new FormData(event.currentTarget);
        const data = {
            nome: formData.get("nome"),
            email: formData.get("email"),
            mensagem: formData.get("mensagem"),
        };

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Erro ao enviar mensagem.");
            }

            setStatus("success");
            (event.target as HTMLFormElement).reset();
        } catch (error: any) {
            console.error(error);
            setStatus("error");
            setErrorMessage(error.message || "Ocorreu um erro inesperado.");
        } finally {
            setLoading(false);
        }
    }

    const whatsappMessage = encodeURIComponent(
        "Olá! Vim pelo site e quero agendar uma aula experimental."
    );
    const whatsappLink = `${SITE_CONFIG.contact.whatsappLink}?text=${whatsappMessage}`;

    return (
        <section id="contato" className="bg-zinc-950 px-4 py-16 md:py-24">
            <div className="mx-auto max-w-4xl">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-extrabold uppercase tracking-tight text-white md:text-4xl">
                        Entre em <span className="text-red-500">Contato</span>
                    </h2>
                    <p className="mt-4 text-zinc-400">
                        Dúvidas? Quer agendar uma aula experimental? Fale com a gente.
                    </p>
                </div>

                <div className="grid gap-12 md:grid-cols-2">
                    {/* Formulário */}
                    <div className="rounded-lg bg-zinc-900/50 p-6 md:p-8">
                        <h3 className="mb-6 text-xl font-semibold text-white">
                            Envie uma mensagem
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="nome"
                                    className="mb-1 block text-sm font-medium text-zinc-300"
                                >
                                    Nome
                                </label>
                                <input
                                    type="text"
                                    id="nome"
                                    name="nome"
                                    required
                                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                                    placeholder="Seu nome"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-1 block text-sm font-medium text-zinc-300"
                                >
                                    E-mail
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                                    placeholder="seu@email.com"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="mensagem"
                                    className="mb-1 block text-sm font-medium text-zinc-300"
                                >
                                    Mensagem
                                </label>
                                <textarea
                                    id="mensagem"
                                    name="mensagem"
                                    required
                                    rows={4}
                                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                                    placeholder="Como podemos te ajudar?"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-md bg-red-600 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white hover:bg-red-500 disabled:opacity-50 transition"
                            >
                                {loading ? "Enviando..." : "Enviar Mensagem"}
                            </button>

                            {status === "success" && (
                                <p className="mt-2 text-center text-sm text-green-400">
                                    Mensagem enviada com sucesso! Em breve entraremos em contato.
                                </p>
                            )}
                            {status === "error" && (
                                <p className="mt-2 text-center text-sm text-red-400">
                                    {errorMessage}
                                </p>
                            )}
                        </form>
                    </div>

                    {/* Fallback WhatsApp + Info */}
                    <div className="flex flex-col justify-center space-y-8 text-center md:text-left">
                        <div>
                            <h3 className="mb-4 text-xl font-semibold text-white">
                                Prefere falar agora?
                            </h3>
                            <p className="mb-6 text-zinc-400">
                                Chame no WhatsApp para um atendimento mais rápido e direto.
                            </p>
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center rounded-md border-2 border-green-500 px-8 py-3 text-sm font-bold uppercase tracking-wider text-green-500 hover:bg-green-500 hover:text-white transition"
                            >
                                Falar no WhatsApp
                            </a>
                        </div>

                        <div className="border-t border-zinc-800 pt-8">
                            <h4 className="mb-2 font-semibold text-white">Localização</h4>
                            <p className="text-zinc-400">
                                Cidade Industrial de Curitiba, PR
                                <br />
                                Bairro Caiuá
                            </p>
                        </div>

                        <div>
                            <h4 className="mb-2 font-semibold text-white">Contato Direto</h4>
                            <p className="text-zinc-400">
                                {SITE_CONFIG.contact.phoneDisplay}
                                <br />
                                {SITE_CONFIG.contact.email}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
