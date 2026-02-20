"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Plano = {
    id: string; // UUID
    nome: string;
    valor: number;
};

type Turma = {
    id: string; // UUID
    nome: string;
    dias_semana: string;
    hora_inicio: string;
    hora_fim: string;
};

export default function NovoAlunoPage() {
    const supabase = createClient();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
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
        carregarOpcoes();
    }, []);

    async function carregarOpcoes() {
        try {
            const [usersRes, turmasRes] = await Promise.all([
                supabase.rpc("listar_planos"),
                supabase.rpc("listar_turmas"),
            ]);

            if (usersRes.error) throw usersRes.error;
            if (turmasRes.error) throw turmasRes.error;

            setPlanos((usersRes.data as any) ?? []);
            setTurmas((turmasRes.data as any) ?? []);
        } catch (err) {
            console.error("Erro ao carregar opções:", err);
            setErro("Falha ao carregar planos e turmas.");
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
        setLoading(true);
        setErro(null);

        try {
            const { error } = await supabase.rpc("upsert_aluno", {
                p_ativo: formData.ativo,
                p_data_nascimento: formData.data_nascimento || null,
                p_dia_vencimento: formData.dia_vencimento ? parseInt(formData.dia_vencimento) : null,
                p_email: formData.email,
                p_nome: formData.nome,
                p_plano_id: formData.plano_id || null, // UUID string
                p_telefone: formData.telefone,
                p_turma_id: formData.turma_id || null, // UUID string
            });

            if (error) throw error;

            router.push("/professor/alunos");
            router.refresh();
        } catch (err) {
            console.error(err);
            setErro((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Novo Aluno</h1>
                    <p className="text-zinc-400 text-sm">Cadastre um novo aluno no sistema.</p>
                </div>
                <Link
                    href="/professor/alunos"
                    className="text-sm text-zinc-400 hover:text-white"
                >
                    &larr; Voltar
                </Link>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 md:p-8">
                {erro && (
                    <div className="mb-6 rounded-md bg-red-900/20 border border-red-500/50 p-4 text-red-200 text-sm">
                        {erro}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Dados Pessoais */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-400">Nome Completo *</label>
                            <input
                                name="nome"
                                required
                                value={formData.nome}
                                onChange={handleChange}
                                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-400">E-mail *</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-400">Telefone</label>
                            <input
                                name="telefone"
                                value={formData.telefone}
                                onChange={handleChange}
                                placeholder="(00) 00000-0000"
                                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-400">Data de Nascimento</label>
                            <input
                                name="data_nascimento"
                                type="date"
                                value={formData.data_nascimento}
                                onChange={handleChange}
                                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="h-px w-full bg-zinc-800 my-6" />

                    {/* Dados Acadêmicos */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-400">Plano</label>
                            <select
                                name="plano_id"
                                value={formData.plano_id}
                                onChange={handleChange}
                                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                            >
                                <option value="">Selecione...</option>
                                {planos.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nome} - R$ {p.valor}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-400">Turma</label>
                            <select
                                name="turma_id"
                                value={formData.turma_id}
                                onChange={handleChange}
                                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                            >
                                <option value="">Selecione...</option>
                                {turmas.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.nome} ({t.dias_semana} - {t.hora_inicio.slice(0, 5)})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-400">Dia de Vencimento</label>
                            <input
                                name="dia_vencimento"
                                type="number"
                                min="1"
                                max="31"
                                value={formData.dia_vencimento}
                                onChange={handleChange}
                                placeholder="Ex: 5, 10, 15..."
                                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 text-zinc-100 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                            />
                        </div>

                        <div className="flex items-center space-x-3 pt-6">
                            <input
                                type="checkbox"
                                name="ativo"
                                id="ativo"
                                checked={formData.ativo}
                                onChange={handleChange}
                                className="h-5 w-5 rounded border-zinc-700 bg-zinc-950 text-red-600 focus:ring-red-600 focus:ring-offset-0"
                            />
                            <label htmlFor="ativo" className="text-sm font-medium text-zinc-300">
                                Aluno Ativo
                            </label>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md bg-red-600 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-red-900/20 transition-all hover:bg-red-500 hover:shadow-red-900/40 disabled:opacity-50"
                        >
                            {loading ? "Salvando..." : "Cadastrar Aluno"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
