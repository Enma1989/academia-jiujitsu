"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type AlunoDetalhe = {
    id: number;
    nome: string;
    email: string;
    telefone: string | null;
    dia_vencimento: number | null;
    plano_nome: string | null;
    plano_valor: number | null;
    turma_nome: string | null;
    turma_dias_semana: string | null;
    turma_hora_inicio: string | null;
    turma_hora_fim: string | null;
};

type Pagamento = {
    id: number;
    mes_referencia: string | null;
    data_vencimento: string;
    data_pagamento: string | null;
    status: string;
    valor: number | null;
};

export default function DashboardAlunoPage() {
    const router = useRouter();

    const [aluno, setAluno] = useState<AlunoDetalhe | null>(null);
    const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        async function carregarDadosAluno() {
            try {
                setLoading(true);
                setErro(null);

                // 1) pegar usuário logado
                const { data: userData, error: userError } = await supabase.auth.getUser();
                if (userError) throw userError;

                const user = userData.user;
                if (!user || !user.email) {
                    router.replace("/area-do-aluno");
                    return;
                }

                // 2) buscar aluno pelo e-mail
                const { data: alunoRow, error: alunoError } = await supabase
                    .from("alunos")
                    .select(
                        `
              id,
              nome,
              email,
              telefone,
              dia_vencimento,
              planos:plano_id ( nome, valor ),
              turmas:turma_id ( nome, dias_semana, hora_inicio, hora_fim )
            `
                    )
                    .eq("email", user.email)
                    .single();

                if (alunoError) throw alunoError;
                if (!alunoRow) {
                    setErro("Seu e-mail não está vinculado a nenhum aluno cadastrado.");
                    return;
                }

                const alunoDetalhe: AlunoDetalhe = {
                    id: alunoRow.id,
                    nome: alunoRow.nome,
                    email: alunoRow.email,
                    telefone: alunoRow.telefone,
                    dia_vencimento: alunoRow.dia_vencimento,
                    plano_nome: alunoRow.planos?.[0]?.nome ?? null,
                    plano_valor: alunoRow.planos?.[0]?.valor ?? null,
                    turma_nome: alunoRow.turmas?.[0]?.nome ?? null,
                    turma_dias_semana: alunoRow.turmas?.[0]?.dias_semana ?? null,
                    turma_hora_inicio: alunoRow.turmas?.[0]?.hora_inicio ?? null,
                    turma_hora_fim: alunoRow.turmas?.[0]?.hora_fim ?? null,
                };

                setAluno(alunoDetalhe);

                // 3) buscar histórico de pagamentos do aluno
                const { data: pagRows, error: pagError } = await supabase
                    .from("pagamentos")
                    .select("id, mes_referencia, data_vencimento, data_pagamento, status, valor")
                    .eq("aluno_id", alunoDetalhe.id)
                    .order("data_vencimento", { ascending: false });

                if (pagError) throw pagError;

                setPagamentos((pagRows ?? []) as Pagamento[]);
            } catch (err) {
                console.error(err);
                setErro((err as Error).message ?? "Erro ao carregar dados do aluno.");
            } finally {
                setLoading(false);
            }
        }

        carregarDadosAluno();
    }, [router]);

    async function handleLogout() {
        await supabase.auth.signOut();
        router.replace("/area-do-aluno");
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-50">
            <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
                {/* HEADER */}
                <header className="flex flex-col gap-3 border-b border-zinc-800 pb-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Área do Aluno</h1>
                        <p className="text-sm text-zinc-400">
                            Veja seus horários, plano e histórico de pagamentos.
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="rounded-md border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 hover:border-red-500 hover:text-red-400"
                    >
                        Sair
                    </button>
                </header>

                {loading && (
                    <p className="text-sm text-zinc-400">Carregando suas informações...</p>
                )}

                {!loading && erro && (
                    <div className="rounded-md border border-red-500 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {erro}
                    </div>
                )}

                {!loading && !erro && aluno && (
                    <>
                        {/* CARD PRINCIPAL DO ALUNO */}
                        <section className="grid gap-4 md:grid-cols-[2fr_1fr]">
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4">
                                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                                    Bem-vindo
                                </p>
                                <h2 className="mt-1 text-xl font-semibold">{aluno.nome}</h2>
                                <p className="text-sm text-zinc-400">{aluno.email}</p>

                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                                            Plano
                                        </p>
                                        <p className="text-sm">
                                            {aluno.plano_nome ?? "Nenhum plano vinculado"}
                                        </p>
                                        {aluno.plano_valor && (
                                            <p className="text-xs text-zinc-400">
                                                Mensalidade: R$ {aluno.plano_valor.toFixed(2)}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                                            Vencimento
                                        </p>
                                        <p className="text-sm">
                                            {aluno.dia_vencimento
                                                ? `Todo dia ${aluno.dia_vencimento}`
                                                : "Não definido"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4">
                                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                                    Contato
                                </p>
                                <p className="mt-1 text-sm">
                                    {aluno.telefone ?? "Nenhum telefone cadastrado"}
                                </p>
                                <p className="mt-3 text-xs text-zinc-400">
                                    Em caso de dúvida, fale com a recepção da academia.
                                </p>
                            </div>
                        </section>

                        {/* HORÁRIOS / TURMA */}
                        <section className="space-y-2">
                            <h2 className="text-lg font-semibold">Sua turma</h2>
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4">
                                {aluno.turma_nome ? (
                                    <>
                                        <p className="text-sm font-medium">{aluno.turma_nome}</p>
                                        <p className="text-sm text-zinc-400">
                                            {aluno.turma_dias_semana} • {aluno.turma_hora_inicio} –{" "}
                                            {aluno.turma_hora_fim}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm text-zinc-400">
                                        Nenhuma turma vinculada no momento. Procure o professor para
                                        ajustar seu horário.
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* PAGAMENTOS */}
                        <section className="space-y-2">
                            <h2 className="text-lg font-semibold">Histórico de pagamentos</h2>

                            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase text-zinc-400">
                                        <tr>
                                            <th className="px-4 py-3">Mês</th>
                                            <th className="px-4 py-3">Vencimento</th>
                                            <th className="px-4 py-3">Pagamento</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagamentos.map((pag) => (
                                            <tr
                                                key={pag.id}
                                                className="border-b border-zinc-800/70 last:border-0"
                                            >
                                                <td className="px-4 py-3">
                                                    {pag.mes_referencia ?? "-"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {new Date(pag.data_vencimento).toLocaleDateString(
                                                        "pt-BR"
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {pag.data_pagamento
                                                        ? new Date(
                                                            pag.data_pagamento
                                                        ).toLocaleDateString("pt-BR")
                                                        : "-"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={
                                                            pag.status === "pago"
                                                                ? "rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400"
                                                                : pag.status === "em_atraso"
                                                                    ? "rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400"
                                                                    : "rounded-full bg-zinc-700/40 px-3 py-1 text-xs font-semibold text-zinc-300"
                                                        }
                                                    >
                                                        {pag.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {pag.valor ? `R$ ${pag.valor.toFixed(2)}` : "-"}
                                                </td>
                                            </tr>
                                        ))}

                                        {pagamentos.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-4 py-6 text-center text-sm text-zinc-400"
                                                >
                                                    Nenhum pagamento cadastrado ainda.
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
        </main>
    );
}
