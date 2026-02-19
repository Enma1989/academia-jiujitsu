import Image from "next/image";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";

export function Footer() {
    return (
        <footer className="border-t border-zinc-900 bg-black text-zinc-400">
            <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
                <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
                    {/* BRAND */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900/70">
                                <Image
                                    src="/caio-matuto-logo.png"
                                    alt="Logo Caio Matuto Jiu-Jitsu"
                                    fill
                                    className="object-contain p-1"
                                />
                            </div>
                            <span className="text-lg font-bold text-white">
                                Caio Matuto Jiu-Jitsu
                            </span>
                        </div>
                        <p className="max-w-xs text-sm leading-relaxed">
                            Academia de Jiu-Jitsu focada em disciplina, técnica e evolução
                            pessoal. Venha fazer parte do nosso time.
                        </p>
                    </div>

                    {/* LINKS */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                            Navegação
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/#inicio" className="hover:text-red-500 transition-colors">
                                    Início
                                </Link>
                            </li>
                            <li>
                                <Link href="/#sobre" className="hover:text-red-500 transition-colors">
                                    Sobre
                                </Link>
                            </li>
                            <li>
                                <Link href="/#horarios" className="hover:text-red-500 transition-colors">
                                    Horários
                                </Link>
                            </li>
                            <li>
                                <Link href="/#contato" className="hover:text-red-500 transition-colors">
                                    Contato
                                </Link>
                            </li>
                            <li>
                                <Link href="/area" className="hover:text-red-500 transition-colors">
                                    Área do Aluno
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* CONTATO */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                            Contato
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a
                                    href={SITE_CONFIG.contact.whatsappLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:text-red-500 transition-colors"
                                >
                                    {SITE_CONFIG.contact.phoneDisplay}
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`mailto:${SITE_CONFIG.contact.email}`}
                                    className="hover:text-red-500 transition-colors"
                                >
                                    {SITE_CONFIG.contact.email}
                                </a>
                            </li>
                            <li className="text-zinc-500">
                                {SITE_CONFIG.address.city}, {SITE_CONFIG.address.state}
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-zinc-900 pt-8 text-center text-xs text-zinc-600">
                    <p>
                        &copy; {new Date().getFullYear()} Caio Matuto Jiu-Jitsu. Todos os
                        direitos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}
