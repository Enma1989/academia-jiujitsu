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

            let query = supabase
                .from("alunos")
                .select(`
                    id,
                    nome,
                    email,
                    telefone,
                    ativo,
                    dia_vencimento,
                    plano:plano_id (nome),
                    turma:turma_id (nome)
                `);

            if (busca) {
                query = query.or(`nome.ilike.%${busca}%,email.ilike.%${busca}%,telefone.ilike.%${busca}%`);
            }

            const { data, error } = await query.order("nome", { ascending: true });

            if (error) throw error;

            const formatado = (data || []).map((a: any) => ({
                ...a,
                plano_nome: a.plano?.nome || null,
                turma_nome: a.turma?.nome || null,
            }));

            setAlunos(formatado as Aluno[]);
        } catch (err: any) {
            console.error(err);
            setErro(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string, nome: string) {
        if (!confirm(`Tem certeza que deseja excluir o aluno "${nome}"?`)) return;

        try {
            const { error } = await supabase.from("alunos").delete().eq("id", id);
            if (error) throw error;
            carregarAlunos(search);
        } catch (err: any) {
            alert("Erro ao excluir aluno: " + err.message);
        }
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        carregarAlunos(search);
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Alunos</h1>
                    <p className="text-zinc-500 font-medium">Gerencie e acompanhe todos os alunos matriculados.</p>
                </div>
                <Link
                    href="/professor/alunos/novo"
                    className="inline-flex items-center justify-center rounded-xl bg-red-600 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-red-900/20 hover:bg-red-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    + Novo Aluno
                </Link>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-3 bg-white p-2 rounded-2xl border border-zinc-200 shadow-sm">
                <div className="relative flex-1">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nome, e-mail ou telefone..."
                        className="w-full rounded-xl border-none bg-zinc-50 pl-11 pr-4 py-3 text-zinc-900 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                    />
                </div>
                <button
                    type="submit"
                    className="rounded-xl border border-zinc-200 bg-white px-8 py-3 text-sm font-bold uppercase tracking-widest text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all"
                >
                    Buscar
                </button>
            </form>

            {erro && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                    {erro}
                </div>
            )}

            {loading ? (
                <div className="py-20 text-center space-y-4">
                    <div className="inline-block w-8 h-8 border-4 border-zinc-200 border-t-red-600 rounded-full animate-spin"></div>
                    <p className="text-zinc-500 font-medium">Carregando alunos...</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Nome / Contato</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Plano</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Turma</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {alunos.map((aluno) => (
                                    <tr key={aluno.id} className="hover:bg-zinc-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-zinc-900 group-hover:text-red-600 transition-colors uppercase tracking-tight">{aluno.nome}</div>
                                            <div className="text-xs text-zinc-400 flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    {aluno.email}
                                                </span>
                                                {aluno.telefone && (
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                        </svg>
                                                        {aluno.telefone}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-semibold text-zinc-700">{aluno.plano_nome || "-"}</div>
                                            {aluno.dia_vencimento && (
                                                <div className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">Vence dia {aluno.dia_vencimento}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-zinc-500 font-medium">
                                            {aluno.turma_nome || "-"}
                                        </td>
                                        <td className="px-6 py-5">
                                            {aluno.ativo ? (
                                                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 border border-emerald-100">
                                                    Ativo
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border border-zinc-200">
                                                    Inativo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right space-x-4">
                                            <Link
                                                href={`/professor/alunos/editar/${aluno.id}`}
                                                className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400 hover:text-red-600 transition-colors"
                                            >
                                                Editar
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(aluno.id, aluno.nome)}
                                                className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-300 hover:text-red-500 transition-colors"
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {alunos.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-50 text-zinc-400 mb-3">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                </svg>
                                            </div>
                                            <p className="text-zinc-500 font-medium">Nenhum aluno encontrado.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
