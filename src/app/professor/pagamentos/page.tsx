"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseBrowser";
const formatSP = (value: string | Date) => {
    const d = typeof value === "string" ? new Date(value) : value;
    return new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        dateStyle: "short",
        timeStyle: "short",
    }).format(d);
};

const formatMoneyBRL = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);

type Pagamento = {
    id: string; // UUID
    aluno_id: string; // UUID
    valor: number;
    mes_ref: string; // Date
    status: string;
    observacao: string | null;
    criado_em: string;
    aluno_nome: string;
};

type AlunoSimple = {
    id: string; // UUID
    nome: string;
};

export default function PagamentosPage() {
    const supabase = createClient();

    // List Data
    const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    // Filters
    const [filtroStatus, setFiltroStatus] = useState("");
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");

    // Modal & Form
    const [modalOpen, setModalOpen] = useState(false);
    const [alunosOpcoes, setAlunosOpcoes] = useState<AlunoSimple[]>([]);
    const [formData, setFormData] = useState({
        aluno_id: "",
        valor: "",
        data_vencimento: "",
        status: "Pendente",
        observacao: "",
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        carregarPagamentos();
    }, [filtroStatus, dataInicio, dataFim]); // Re-fetch on filter change

    useEffect(() => {
        if (modalOpen && alunosOpcoes.length === 0) {
            carregarAlunosOpcoes();
        }
    }, [modalOpen]);

    async function carregarPagamentos() {
        try {
            setLoading(true);
            setErro(null);

            const { data, error } = await supabase.rpc("listar_pagamentos", {
                p_aluno_id: null,
                p_status: filtroStatus || null,
                p_inicio: dataInicio || null,
                p_fim: dataFim || null,
                p_limit: 50,
                p_offset: 0,
            });

            if (error) throw error;
            setPagamentos((data as any) ?? []);
        } catch (err) {
            console.error(err);
            setErro((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    async function carregarAlunosOpcoes() {
        // Fetch students for dropdown (simplified version via same list RPC)
        const { data } = await supabase.rpc("listar_alunos", {
            p_search: null,
            p_limit: 100, // Reasonable limit for dropdown
            p_offset: 0
        });
        if (data) {
            setAlunosOpcoes((data as any).map((a: any) => ({ id: a.id, nome: a.nome })));
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Format date to YYYY-MM-01 for mes_ref
            const mesRef = formData.data_vencimento
                ? `${formData.data_vencimento.substring(0, 7)}-01`
                : null;

            const { error } = await supabase.rpc("upsert_pagamento", {
                p_aluno_id: formData.aluno_id, // UUID string
                p_valor: parseFloat(formData.valor),
                p_mes_ref: mesRef,
                p_status: formData.status,
                p_observacao: formData.observacao || null
            });

            if (error) throw error;

            setModalOpen(false);
            setFormData({
                aluno_id: "",
                valor: "",
                data_vencimento: "",
                status: "Pendente",
                observacao: "",
            });
            carregarPagamentos(); // Refresh list
        } catch (err) {
            alert("Erro ao registrar: " + (err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Pagamentos</h1>
                    <p className="text-zinc-400 text-sm">Controle financeiro e mensalidades.</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-2 text-sm font-semibold uppercase tracking-wider text-white shadow-lg hover:bg-emerald-500"
                >
                    + Registrar Pagamento
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none"
                >
                    <option value="">Todos os Status</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Pago">Pago</option>
                    <option value="Atrasado">Atrasado</option>
                </select>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 uppercase">De:</span>
                    <input
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 uppercase">Até:</span>
                    <input
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none"
                    />
                </div>
            </div>

            {erro && <div className="text-red-400 text-sm">{erro}</div>}

            {loading ? (
                <p className="text-zinc-500">Carregando...</p>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase text-zinc-400">
                            <tr>
                                <th className="px-4 py-3">Aluno</th>
                                <th className="px-4 py-3">Vencimento</th>
                                <th className="px-4 py-3">Valor</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Obs</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {pagamentos.map((pg) => (
                                <tr key={pg.id} className="hover:bg-zinc-900/80 transition-colors">
                                    <td className="px-4 py-3 font-medium text-white">
                                        {pg.aluno_nome}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-300">
                                        {/* Display MM/YYYY for reference month */}
                                        {pg.mes_ref ? formatSP(pg.mes_ref).substring(3, 10) : "-"}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-300">
                                        {formatMoneyBRL(pg.valor)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={pg.status} />
                                    </td>
                                    <td className="px-4 py-3 text-zinc-500 text-xs truncate max-w-[150px]">
                                        {pg.observacao || "-"}
                                    </td>
                                </tr>
                            ))}
                            {pagamentos.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                                        Nenhum pagamento encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Novo Pagamento</h2>
                            <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-zinc-400">Aluno *</label>
                                <select
                                    name="aluno_id"
                                    required
                                    value={formData.aluno_id}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500"
                                >
                                    <option value="">Selecione...</option>
                                    {alunosOpcoes.map((a) => (
                                        <option key={a.id} value={a.id}>{a.nome}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-zinc-400">Valor (R$) *</label>
                                    <input
                                        name="valor"
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.valor}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-zinc-400">Vencimento *</label>
                                    <input
                                        name="data_vencimento"
                                        type="date"
                                        required
                                        value={formData.data_vencimento}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-zinc-400">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500"
                                >
                                    <option value="Pendente">Pendente</option>
                                    <option value="Pago">Pago</option>
                                    <option value="Atrasado">Atrasado</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-zinc-400">Observação</label>
                                <textarea
                                    name="observacao"
                                    rows={2}
                                    value={formData.observacao}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full rounded-md bg-emerald-600 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-lg hover:bg-emerald-500 disabled:opacity-50"
                                >
                                    {saving ? "Salvando..." : "Confirmar Pagamento"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === "Pago") {
        return <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">Pago</span>;
    }
    if (status === "Atrasado") {
        return <span className="inline-flex rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">Atrasado</span>;
    }
    return <span className="inline-flex rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-400">Pendente</span>;
}
