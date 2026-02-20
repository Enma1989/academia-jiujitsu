"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- TIPOS ---
type Aluno = {
    id: string; // UUID
    nome: string;
    email: string;
    telefone: string | null;
    ativo: boolean;
    dia_vencimento: number | null;
    plano_nome: string | null;
    turma_nome: string | null;
};

export default function AlunosPage() {
    const supabase = createClient();
    const router = useRouter();

    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [erro, setErro] = useState<string | null>(null);

    // Filter debounce could be added, but simple submit is fine for now
    useEffect(() => {
        carregarAlunos();
    }, []);

    async function carregarAlunos(busca: string = "") {
        try {
            setLoading(true);
            setErro(null);

            const { data, error } = await supabase.rpc("listar_alunos", {
                p_search: busca || null,
                p_limit: 50,
                p_offset: 0,
            });

            if (error) throw error;
            setAlunos((data as any) ?? []);
        } catch (err) {
            console.error(err);
            setErro((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        carregarAlunos(search);
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Alunos</h1>
                    <p className="text-zinc-400 text-sm">Gerencie os alunos matriculados.</p>
                </div>
                <Link
                    href="/professor/alunos/novo"
                    className="inline-flex items-center justify-center rounded-md bg-red-600 px-5 py-2 text-sm font-semibold uppercase tracking-wider text-white shadow-lg hover:bg-red-500"
                >
                    + Novo Aluno
                </Link>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nome, e-mail ou telefone..."
                    className="flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-zinc-100 placeholder-zinc-500 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
                <button
                    type="submit"
                    className="rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-zinc-200 hover:bg-zinc-700"
                >
                    Buscar
                </button>
            </form>

            {erro && (
                <div className="p-4 rounded-md bg-red-900/20 border border-red-500/50 text-red-200 text-sm">
                    {erro}
                </div>
            )}

            {loading ? (
                <p className="text-zinc-500">Carregando...</p>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase text-zinc-400">
                            <tr>
                                <th className="px-4 py-3">Nome / Contato</th>
                                <th className="px-4 py-3">Plano</th>
                                <th className="px-4 py-3">Turma</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {alunos.map((aluno) => (
                                <tr key={aluno.id} className="hover:bg-zinc-900/80 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-white">{aluno.nome}</div>
                                        <div className="text-xs text-zinc-500">{aluno.email}</div>
                                        <div className="text-xs text-zinc-500">{aluno.telefone}</div>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-300">
                                        {aluno.plano_nome || "-"}
                                        {aluno.dia_vencimento && (
                                            <div className="text-xs text-zinc-500">Vence dia {aluno.dia_vencimento}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-300">
                                        {aluno.turma_nome || "-"}
                                    </td>
                                    <td className="px-4 py-3">
                                        {aluno.ativo ? (
                                            <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                                                Ativo
                                            </span>
                                        ) : (
                                            <span className="inline-flex rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                                                Inativo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            // TODO: Add edit/view functionality
                                            onClick={() => alert("Edição em breve")}
                                            className="text-zinc-400 hover:text-white text-xs uppercase font-bold tracking-wider"
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {alunos.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                                        Nenhum aluno encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
