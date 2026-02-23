"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseBrowser";

type AlunoMensalidade = {
    aluno_id: string;
    nome: string;
    telefone: string | null;
    email: string | null;
    status: string;
    dia_vencimento: number | null;
    plano_nome: string | null;
    turma_nome: string | null;
    jan: boolean;
    fev: boolean;
    mar: boolean;
    abr: boolean;
    mai: boolean;
    jun: boolean;
    jul: boolean;
    ago: boolean;
    set: boolean;
    outubro: boolean;
    nov: boolean;
    dez: boolean;
};

const MESES = [
    { key: "jan", label: "Jan" },
    { key: "fev", label: "Fev" },
    { key: "mar", label: "Mar" },
    { key: "abr", label: "Abr" },
    { key: "mai", label: "Mai" },
    { key: "jun", label: "Jun" },
    { key: "jul", label: "Jul" },
    { key: "ago", label: "Ago" },
    { key: "set", label: "Set" },
    { key: "outubro", label: "Out" },
    { key: "nov", label: "Nov" },
    { key: "dez", label: "Dez" },
];

export default function MensalidadesPage() {
    const supabase = createClient();
    const [alunos, setAlunos] = useState<AlunoMensalidade[]>([]);
    const [loading, setLoading] = useState(true);
    const [ano, setAno] = useState(new Date().getFullYear());
    const [search, setSearch] = useState("");
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        carregarMensalidades();
    }, [ano]);

    async function carregarMensalidades(busca: string = search) {
        try {
            setLoading(true);
            setErro(null);
            const { data, error } = await supabase.rpc("listar_alunos_com_mensalidades", {
                p_ano: ano,
                p_search: busca || null,
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

    async function toggleMes(alunoId: string, mes: string, valorAtual: boolean) {
        try {
            const novoValor = !valorAtual;

            // UI Optmistic update
            setAlunos(prev => prev.map(a =>
                a.aluno_id === alunoId ? { ...a, [mes]: novoValor } : a
            ));

            const { error } = await supabase.rpc("toggle_mensalidade_mes", {
                p_aluno_id: alunoId,
                p_ano: ano,
                p_mes: mes,
                p_valor: novoValor
            });

            if (error) throw error;
        } catch (err) {
            alert("Erro ao atualizar: " + (err as Error).message);
            // Revert on error
            carregarMensalidades();
        }
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        carregarMensalidades(search);
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Mensalidades</h1>
                    <p className="text-zinc-500 font-medium">Controle de pagamentos por aluno e mês.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-1.5 rounded-2xl border border-zinc-200 shadow-sm">
                    <button
                        onClick={() => setAno(ano - 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-50 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <span className="text-xl font-black text-zinc-900 min-w-[80px] text-center tracking-tighter">{ano}</span>
                    <button
                        onClick={() => setAno(ano + 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-50 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <form onSubmit={handleSearch} className="flex gap-3 bg-white p-2 rounded-2xl border border-zinc-200 shadow-sm">
                <div className="relative flex-1">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar aluno por nome..."
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
                    <p className="text-zinc-500 font-medium">Carregando pagamentos...</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-zinc-50/50">
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 sticky left-0 z-20 bg-[#FBFBFB] border-b border-zinc-200 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Aluno / Info</th>
                                    {MESES.map(m => (
                                        <th key={m.key} className="px-4 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 text-center border-b border-zinc-100">{m.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {alunos.map((aluno) => (
                                    <tr key={aluno.aluno_id} className="hover:bg-zinc-50/50 transition-colors group">
                                        <td className="px-6 py-5 sticky left-0 z-10 bg-white group-hover:bg-zinc-50/50 transition-colors border-r border-zinc-100/50 min-w-[220px]">
                                            <div className="font-bold text-zinc-900 truncate max-w-[200px] uppercase tracking-tight">{aluno.nome}</div>
                                            <div className="text-[10px] text-zinc-400 mt-1 font-bold space-y-0.5 uppercase tracking-wider">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                                                    {aluno.plano_nome ?? "S/ Plano"} {aluno.dia_vencimento ? `(DIA ${aluno.dia_vencimento})` : ""}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${aluno.status === "Ativo" ? "bg-emerald-500" : "bg-red-500"}`} />
                                                    <span className={aluno.status === "Ativo" ? "text-emerald-600" : "text-red-500"}>{aluno.status}</span>
                                                </div>
                                            </div>
                                        </td>
                                        {MESES.map(m => (
                                            <td key={m.key} className="px-2 py-5 text-center">
                                                <button
                                                    onClick={() => toggleMes(aluno.aluno_id, m.key, (aluno as any)[m.key])}
                                                    className={`group relative w-10 h-10 rounded-xl border transition-all duration-300 flex items-center justify-center mx-auto overflow-hidden
                                                        ${(aluno as any)[m.key]
                                                            ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20 active:scale-95"
                                                            : "bg-zinc-50 border-zinc-200 text-zinc-300 hover:border-red-500 hover:bg-white active:scale-95"
                                                        }`}
                                                >
                                                    {(aluno as any)[m.key] ? (
                                                        <svg className="w-5 h-5 animate-in zoom-in duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 font-bold text-xs uppercase tracking-widest">+</span>
                                                    )}
                                                </button>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                {alunos.length === 0 && (
                                    <tr>
                                        <td colSpan={13} className="px-6 py-20 text-center">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-50 text-zinc-300 mb-4">
                                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                            </div>
                                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Nenhum aluno encontrado para este ano.</p>
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
