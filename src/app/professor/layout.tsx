"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

export default function ProfessorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.replace("/login");
        router.refresh();
    };

    if (!mounted) return null;

    const navLinks = [
        { href: "/professor", label: "Dashboard" },
        { href: "/professor/alunos", label: "Alunos" },
        { href: "/professor/mensalidades", label: "Mensalidades" },
        { href: "/professor/agendar", label: "Agendar" },
        { href: "/professor/aulas-experimentais", label: "Experimentais" },
    ];

    return (
        <div className="min-h-screen bg-[#FBFBFB] text-zinc-900 flex flex-col font-sans">
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-zinc-200/50 shadow-sm transition-all duration-300">
                <div className="mx-auto max-w-7xl px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 md:h-14 md:w-14 overflow-hidden rounded-full border-2 border-zinc-100 shadow-sm">
                            <Image
                                src="/caio-matuto-logo.png"
                                alt="Academia Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-[0.2em] leading-none mb-1">
                                Academia
                            </span>
                            <div className="font-extrabold text-lg md:text-xl tracking-tighter uppercase text-zinc-900 flex items-center gap-1">
                                Professor <span className="text-zinc-400 font-light">Panel</span>
                            </div>
                        </div>
                    </div>

                    <nav className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href || (link.href !== "/professor" && pathname.startsWith(link.href));
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`relative text-xs font-bold uppercase tracking-widest transition-all py-1
                                        ${isActive ? "text-red-600" : "text-zinc-500 hover:text-red-500"}
                                    `}
                                >
                                    {link.label}
                                    {isActive && (
                                        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-red-600 rounded-full" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <button
                        onClick={handleLogout}
                        className="group flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 transition-all text-xs font-bold uppercase tracking-widest"
                    >
                        <span>Sair</span>
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>

                {/* Mobile Nav */}
                <div className="lg:hidden overflow-x-auto whitespace-nowrap px-4 pb-3 flex gap-6 no-scrollbar border-t border-zinc-100/50">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href || (link.href !== "/professor" && pathname.startsWith(link.href));
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-[10px] font-bold uppercase tracking-widest py-2 transition-colors ${isActive
                                    ? "text-red-600 border-b-2 border-red-600"
                                    : "text-zinc-400 hover:text-zinc-600"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </header>

            <main className="flex-1 w-full pt-28 pb-10">
                {children}
            </main>
        </div>
    );
}
