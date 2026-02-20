"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
        await fetch("/api/auth/logout", { method: "POST" });
        router.replace("/login");
        router.refresh();
    };

    if (!mounted) return null; // Prevent hydration mismatch on auth/theme if needed

    const navLinks = [
        { href: "/professor", label: "Dashboard" },
        { href: "/professor/alunos", label: "Alunos" },
        { href: "/professor/pagamentos", label: "Pagamentos" },
        { href: "/professor/agendar", label: "Agendar" },
        { href: "/professor/aulas-experimentais", label: "Experimentais" },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
            <header className="border-b border-zinc-800 bg-zinc-900/50 sticky top-0 z-40 backdrop-blur-md">
                <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
                    <div className="font-bold text-lg tracking-wider uppercase text-white">
                        <span className="text-red-600">Professor</span> Panel
                    </div>

                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-sm font-semibold uppercase tracking-wider transition-colors ${isActive
                                        ? "text-white"
                                        : "text-zinc-400 hover:text-white"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <button
                        onClick={handleLogout}
                        className="text-sm font-semibold text-zinc-400 hover:text-red-500 uppercase tracking-wider"
                    >
                        Sair
                    </button>
                </div>
                {/* Mobile Nav (Simple horizontal scroll for now) */}
                <div className="md:hidden overflow-x-auto whitespace-nowrap px-4 pb-3 flex gap-4 no-scrollbar">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-xs font-semibold uppercase tracking-wider ${isActive
                                    ? "text-white"
                                    : "text-zinc-400 hover:text-white"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </header>

            <main className="flex-1 w-full">
                {children}
            </main>
        </div>
    );
}
