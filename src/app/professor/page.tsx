"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// --- TIPOS ---

type Plano = {
    id: number;
    nome: string;
    valor: number;
    limite_aulas_semana: number | null;
};

type Turma = {
    id: number;
    nome: string;
    dias_semana: string;
    hora_inicio: string;
    hora_fim: string;
};

type Aluno = {
    id: number;
    nome: string;
    email: string;
    telefone: string | null;
    ativo: boolean;
    plano_id: number | null;
    turma_id: number | null;
    dia_vencimento?: number | null;

    plano_nome?: string | null;
    plano_valor?: number | null;
    turma_nome?: string | null;
    turma_dias_semana?: string | null;
    turma_hora_inicio?: string | null;
    turma_hora_fim?: string | null;
};

type Inadimplente = {
    id: number;
    nome: string;
    status: string;
    data_vencimento: string;
};

export default function ProfessorPage() {
    const [planos, setPlanos] = useState<Plano[]>([]);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [inadimplentes, setInadimplentes] = useState<Inadimplente[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    // --- MODAL NOVO ALUNO ---
    const [abrirNovoAluno, setAbrirNovoAluno] = useState(false);
    const [novoNome, setNovoNome] = useState("");
    const [novoEmail, setNovoEmail] = useState("");
    const [novoTelefone, setNovoTelefone] = useState("");
    const [novoPlanoId, setNovoPlanoId] = useState<string>("");
    const [novaTurmaId, setNovaTurmaId] = useState<string>("");
    const [novoDiaVencimento, setNovoDiaVencimento] = useState<string>("10");
    const [salvandoAluno, setSalvandoAluno] = useState(false);
    const [erroNovoAluno, setErroNovoAluno] = useState<string | null>(null);

    useEffect(() => {
        checkRoleAndLoad();
    }, []);

    async function checkRoleAndLoad() {
        const { data: { user } } = await supabase.auth.getUser();

        // Verifica metadata.role (fallback para 'teacher' ou 'professor')
        const role = user?.user_metadata?.role;
        if (role !== "professor" && role !== "teacher") {
            await supabase.auth.signOut();
            window.location.href = "/login?error=Acesso restrito a professores.";
            return;
        }

        carregarDashboard();
    }

    async function carregarDashboard() {
        try {
            setLoading(true);
            setErro(null);

            // PLANOS
            const { data: planosData, error: planosError } = await supabase
                .from("planos")
                .select("id, nome, valor, limite_aulas_semana")
                .order("valor", { ascending: true });
            if (planosError) throw planosError;
            setPlanos((planosData ?? []) as Plano[]);

            // TURMAS
            const { data: turmasData, error: turmasError } = await supabase
                .from("turmas")
                .select("id, nome, dias_semana, hora_inicio, hora_fim")
                .order("id", { ascending: true });
            if (turmasError) throw turmasError;
            setTurmas((turmasData ?? []) as Turma[]);

            // ALUNOS (+ relacionamento plano / turma)
            const { data: alunosRaw, error: alunosError } = await supabase
                .from("alunos")
                .select(
                    `
          id,
          nome,
          email,
          telefone,
          ativo,
          plano_id,
          turma_id,
          dia_vencimento,
          planos:plano_id ( id, nome, valor ),
          turmas:turma_id ( id, nome, dias_semana, hora_inicio, hora_fim )
        `
                )
                .order("nome", { ascending: true });
            if (alunosError) throw alunosError;

            const alunosMapeados: Aluno[] = (alunosRaw ?? []).map((item: unknown) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const row = item as any;
                return {
                    id: row.id,
                    nome: row.nome,
                    email: row.email,
                    telefone: row.telefone,
                    ativo: row.ativo,
                    plano_id: row.plano_id,
                    turma_id: row.turma_id,
                    dia_vencimento: row.dia_vencimento,
                    plano_nome: row.planos?.nome ?? null,
                    plano_valor: row.planos?.valor ?? null,
                    turma_nome: row.turmas?.nome ?? null,
                    turma_dias_semana: row.turmas?.dias_semana ?? null,
                    turma_hora_inicio: row.turmas?.hora_inicio ?? null,
                    turma_hora_fim: row.turmas?.hora_fim ?? null,
                };
            });

            setAlunos(alunosMapeados);

            // INADIMPLENTES
            const { data: pagosRaw, error: pagosError } = await supabase
                .from("pagamentos")
                .select(
                    `
          id,
          status,
          data_vencimento,
          aluno:alunos ( id, nome )
        `
                )
                .eq("status", "em_atraso");
            if (pagosError) throw pagosError;

            const inadMapeados: Inadimplente[] = (pagosRaw ?? []).map((item: unknown) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const row = item as any;
                return {
                    id: row.aluno?.id ?? row.id,
                    nome: row.aluno?.nome ?? "Aluno",
                    status: row.status,
                    data_vencimento: row.data_vencimento,
                };
            });

            setInadimplentes(inadMapeados);
        } catch (err) {
            console.error(err);
            setErro((err as Error).message ?? "Erro ao carregar dados do professor.");
        } finally {
            setLoading(false);
        }
    }

    // --- HANDLER: CRIAR ALUNO ---

    async function handleCriarAluno(e: React.FormEvent) {
        e.preventDefault();
        setErroNovoAluno(null);

        if (!novoNome.trim() || !novoEmail.trim() || !novoPlanoId) {
            setErroNovoAluno("Nome, e-mail e plano são obrigatórios.");
            return;
        }

        try {
            setSalvandoAluno(true);

            const planoIdNum = Number(novoPlanoId);
            const turmaIdNum = novaTurmaId ? Number(novaTurmaId) : null;
            const diaVencNum = novoDiaVencimento ? Number(novoDiaVencimento) : null;

            const { error } = await supabase.from("alunos").insert({
                nome: novoNome.trim(),
                email: novoEmail.trim(),
                telefone: novoTelefone.trim() || null,
                plano_id: planoIdNum,
                turma_id: turmaIdNum,
                dia_vencimento: diaVencNum,
                ativo: true,
            });

            if (error) throw error;

            // Limpa form e fecha modal
            setNovoNome("");
            setNovoEmail("");
            setNovoTelefone("");
            setNovoPlanoId("");
            setNovaTurmaId("");
            setNovoDiaVencimento("10");
            setAbrirNovoAluno(false);

            // Recarrega dados
            await carregarDashboard();
        } catch (err) {
            console.error(err);
            setErroNovoAluno((err as Error).message ?? "Erro ao cadastrar aluno.");
        } finally {
            setSalvandoAluno(false);
        }
    }

    // lista 1..31 para select do vencimento
    const diasVencimento = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-50">
            <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
                {/* HEADER */}
                <header className="flex flex-col gap-3 border-b border-zinc-800 pb-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                            Painel do Professor – Caio Matuto Jiu-Jitsu
                        </h1>
                        <p className="text-sm text-zinc-400">
                            Cadastre alunos, vincule plano e turma e acompanhe inadimplência.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setAbrirNovoAluno(true)}
                        className="inline-flex items-center justify-center rounded-md bg-red-600 px-5 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-lg hover:bg-red-500"
                    >
                        + Cadastrar aluno
                    </button>
                </header>

                {erro && (
                    <div className="rounded-md border border-red-500 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {erro}
                    </div>
                )}

                {loading ? (
                    <p className="text-sm text-zinc-400">Carregando informações...</p>
                ) : (
                    <>
                        {/* CARDS RESUMO */}
                        <section className="grid gap-4 md:grid-cols-4">
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                                    Alunos ativos
                                </p>
                                <p className="mt-2 text-2xl font-bold">
                                    {alunos.filter((a) => a.ativo).length}
                                </p>
                            </div>
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                                    Planos
                                </p>
                                <p className="mt-2 text-2xl font-bold">{planos.length}</p>
                            </div>
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                                    Turmas
                                </p>
                                <p className="mt-2 text-2xl font-bold">{turmas.length}</p>
                            </div>
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                                    Inadimplentes
                                </p>
                                <p className="mt-2 text-2xl font-bold text-red-400">
                                    {inadimplentes.length}
                                </p>
                            </div>
                        </section>

                        {/* LISTA DE ALUNOS */}
                        <section className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">Alunos</h2>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase text-zinc-400">
                                        <tr>
                                            <th className="px-4 py-3">Aluno</th>
                                            <th className="px-4 py-3">Plano</th>
                                            <th className="px-4 py-3">Turma</th>
                                            <th className="px-4 py-3">Contato</th>
                                            <th className="px-4 py-3">Vencimento</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alunos.map((aluno) => (
                                            <tr
                                                key={aluno.id}
                                                className="border-b border-zinc-800/70 last:border-0"
                                            >
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-zinc-50">
                                                        {aluno.nome}
                                                    </p>
                                                    <p className="text-xs text-zinc-400">
                                                        {aluno.email}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm">
                                                        {aluno.plano_nome ?? "Sem plano"}
                                                    </p>
                                                    {aluno.plano_valor && (
                                                        <p className="text-xs text-zinc-400">
                                                            R$ {aluno.plano_valor.toFixed(2)}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {aluno.turma_nome ? (
                                                        <>
                                                            <p>{aluno.turma_nome}</p>
                                                            <p className="text-xs text-zinc-400">
                                                                {aluno.turma_dias_semana} •{" "}
                                                                {aluno.turma_hora_inicio} –{" "}
                                                                {aluno.turma_hora_fim}
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-zinc-500">
                                                            Sem turma
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {aluno.telefone ?? "-"}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {aluno.dia_vencimento
                                                        ? `Todo dia ${aluno.dia_vencimento}`
                                                        : "-"}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {aluno.ativo ? (
                                                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
                                                            Ativo
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-zinc-700/40 px-3 py-1 text-xs font-semibold text-zinc-300">
                                                            Inativo
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}

                                        {alunos.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-4 py-6 text-center text-sm text-zinc-400"
                                                >
                                                    Nenhum aluno cadastrado ainda.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* LISTA DE INADIMPLENTES */}
                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold">Inadimplentes</h2>
                            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase text-zinc-400">
                                        <tr>
                                            <th className="px-4 py-3">Aluno</th>
                                            <th className="px-4 py-3">Vencimento</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inadimplentes.map((item) => (
                                            <tr
                                                key={`${item.id}-${item.data_vencimento}`}
                                                className="border-b border-zinc-800/70 last:border-0"
                                            >
                                                <td className="px-4 py-3">{item.nome}</td>
                                                <td className="px-4 py-3">
                                                    {new Date(item.data_vencimento).toLocaleDateString(
                                                        "pt-BR"
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400">
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}

                                        {inadimplentes.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={3}
                                                    className="px-4 py-6 text-center text-sm text-zinc-400"
                                                >
                                                    Nenhum aluno em atraso neste momento.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}
            </div>

            {/* MODAL CADASTRAR ALUNO */}
            {abrirNovoAluno && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 px-6 py-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Cadastrar novo aluno
                                </h2>
                                <p className="text-xs text-zinc-400">
                                    Preencha os dados do aluno e vincule um plano e turma.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAbrirNovoAluno(false)}
                                className="text-sm text-zinc-400 hover:text-zinc-200"
                            >
                                Fechar
                            </button>
                        </div>

                        {erroNovoAluno && (
                            <div className="mb-3 rounded-md border border-red-500 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                                {erroNovoAluno}
                            </div>
                        )}

                        <form className="space-y-4" onSubmit={handleCriarAluno}>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                                    Nome completo
                                </label>
                                <input
                                    type="text"
                                    value={novoNome}
                                    onChange={(e) => setNovoNome(e.target.value)}
                                    required
                                    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                                    E-mail
                                </label>
                                <input
                                    type="email"
                                    value={novoEmail}
                                    onChange={(e) => setNovoEmail(e.target.value)}
                                    required
                                    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                                    Telefone / WhatsApp
                                </label>
                                <input
                                    type="text"
                                    value={novoTelefone}
                                    onChange={(e) => setNovoTelefone(e.target.value)}
                                    placeholder="(41) 99999-9999"
                                    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                                        Plano
                                    </label>
                                    <select
                                        value={novoPlanoId}
                                        onChange={(e) => setNovoPlanoId(e.target.value)}
                                        required
                                        className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    >
                                        <option value="">Selecione um plano</option>
                                        {planos.map((plano) => (
                                            <option key={plano.id} value={plano.id}>
                                                {plano.nome} — R$ {plano.valor.toFixed(2)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                                        Turma
                                    </label>
                                    <select
                                        value={novaTurmaId}
                                        onChange={(e) => setNovaTurmaId(e.target.value)}
                                        className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    >
                                        <option value="">Sem turma por enquanto</option>
                                        {turmas.map((turma) => (
                                            <option key={turma.id} value={turma.id}>
                                                {turma.nome} — {turma.dias_semana} •{" "}
                                                {turma.hora_inicio}–{turma.hora_fim}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                                    Dia de vencimento
                                </label>
                                <select
                                    value={novoDiaVencimento}
                                    onChange={(e) => setNovoDiaVencimento(e.target.value)}
                                    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                >
                                    {diasVencimento.map((dia) => (
                                        <option key={dia} value={dia}>
                                            Dia {dia}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAbrirNovoAluno(false)}
                                    className="rounded-md border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 hover:border-zinc-500"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={salvandoAluno}
                                    className="rounded-md bg-red-600 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-lg hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {salvandoAluno ? "Salvando..." : "Cadastrar aluno"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
