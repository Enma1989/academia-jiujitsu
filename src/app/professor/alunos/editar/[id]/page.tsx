"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Plano = {
    id: string;
    nome: string;
    valor: number;
};

type Turma = {
    id: string;
    nome: string;
    dias_semana: string;
    hora_inicio: string;
    hora_fim: string;
};

export default function EditarAlunoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const supabase = createClient();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    // Dropdown data
    const [planos, setPlanos] = useState<Plano[]>([]);
    const [turmas, setTurmas] = useState<Turma[]>([]);

    // Form data
    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        telefone: "",
        data_nascimento: "",
        plano_id: "",
        turma_id: "",
        dia_vencimento: "",
        ativo: true,
    });

    useEffect(() => {
        carregarDados();
    }, [id]);

    async function carregarDados() {
        try {
            setLoading(true);

            // Load Options & Student Data
            const [planosRes, turmasRes, alunoRes] = await Promise.all([
                supabase.from("planos").select("id, nome, valor").order("nome"),
                supabase.from("turmas").select("id, nome, dias_semana, hora_inicio, hora_fim").order("nome"),
                supabase.from("alunos").select("*").eq("id", id).single()
            ]);

            if (planosRes.error) throw planosRes.error;
            if (turmasRes.error) throw turmasRes.error;
            if (alunoRes.error) throw alunoRes.error;

            setPlanos(planosRes.data || []);
            setTurmas(turmasRes.data || []);

            const a = alunoRes.data;
            setFormData({
                nome: a.nome || "",
                email: a.email || "",
                telefone: a.telefone || "",
                data_nascimento: a.data_nascimento || "",
                plano_id: a.plano_id || "",
                turma_id: a.turma_id || "",
                dia_vencimento: a.dia_vencimento?.toString() || "",
                ativo: a.ativo ?? true,
            });
        } catch (err: any) {
            console.error("Erro ao carregar dados:", err);
            setErro(err.message || "Falha ao carregar dados do aluno.");
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErro(null);

        try {
            const { error } = await supabase
                .from("alunos")
                .update({
                    nome: formData.nome,
                    email: formData.email,
                    telefone: formData.telefone || null,
                    data_nascimento: formData.data_nascimento || null,
                    plano_id: formData.plano_id || null,
                    turma_id: formData.turma_id || null,
                    dia_vencimento: formData.dia_vencimento ? parseInt(formData.dia_vencimento) : null,
                    ativo: formData.ativo,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", id);

            if (error) throw error;

            router.push("/professor/alunos");
            router.refresh();
        } catch (err: any) {
            console.error("Erro ao atualizar aluno:", err);
            setErro(err.message || "Erro ao salvar alterações.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#FBFBFB] text-zinc-400">
                <div className="text-center space-y-4">
                    <div className="inline-block w-8 h-8 border-4 border-zinc-200 border-t-red-600 rounded-full animate-spin"></div>
                    <p className="font-medium">Carregando dados do aluno...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Editar Aluno</h1>
                    <p className="text-zinc-500 font-medium">Atualize as informações cadastrais do aluno.</p>
                </div>
                <Link
                    href="/professor/alunos"
                    className="group flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest"
                >
                    <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Voltar
                </Link>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-8 md:p-12 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-red-600" />

                {erro && (
                    <div className="mb-8 rounded-2xl bg-red-50 border border-red-100 p-4 text-red-600 text-sm font-medium flex items-center gap-3">
                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {erro}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Dados Pessoais</h3>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Nome Completo *</label>
                                <input
                                    name="nome"
                                    required
                                    value={formData.nome}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder-zinc-300 font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">E-mail *</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder-zinc-300 font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Telefone</label>
                                <input
                                    name="telefone"
                                    value={formData.telefone}
                                    onChange={handleChange}
                                    placeholder="(00) 00000-0000"
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder-zinc-300 font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Data de Nascimento</label>
                                <input
                                    name="data_nascimento"
                                    type="date"
                                    value={formData.data_nascimento}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Plano e Matrícula</h3>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Plano</label>
                                <select
                                    name="plano_id"
                                    value={formData.plano_id}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium"
                                >
                                    <option value="">Selecione um plano...</option>
                                    {planos.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nome} - R$ {p.valor}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Turma</label>
                                <select
                                    name="turma_id"
                                    value={formData.turma_id}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium"
                                >
                                    <option value="">Selecione uma turma...</option>
                                    {turmas.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.nome} ({t.dias_semana} - {t.hora_inicio.slice(0, 5)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Dia de Vencimento</label>
                                <input
                                    name="dia_vencimento"
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={formData.dia_vencimento}
                                    onChange={handleChange}
                                    placeholder="Ex: 5, 10, 15..."
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-6">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="ativo"
                                        id="ativo"
                                        checked={formData.ativo}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                    <span className="ml-3 text-sm font-bold uppercase tracking-widest text-zinc-700">Aluno Ativo</span>
                                </label>
                            </div>
                        </div>
                    </section>

                    <div className="pt-6 border-t border-zinc-100 flex gap-4">
                        <Link
                            href="/professor/alunos"
                            className="flex-1 rounded-xl border border-zinc-200 py-4 text-xs font-bold uppercase tracking-widest text-zinc-400 transition-all hover:bg-zinc-50 hover:text-zinc-900 text-center"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-[2] rounded-xl bg-red-600 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-red-900/20 transition-all hover:bg-red-500 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100"
                        >
                            {saving ? "Salvando..." : "Salvar Alterações"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
