"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";

type Plano = {
    id: number;
    nome: string;
};

type Turma = {
    id: number;
    nome: string;
    dias_semana: string;
    hora_inicio: string;
    hora_fim: string;
};

export default function AgendarAulaPage() {
    const supabase = createClient();
    const router = useRouter();

    const [planos, setPlanos] = useState<Plano[]>([]);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form states
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [diaVencimento, setDiaVencimento] = useState("10");
    const [planoId, setPlanoId] = useState("");
    const [turmaId, setTurmaId] = useState("");
    const [agendadoPara, setAgendadoPara] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                // Fetch Planos
                const { data: planosData, error: planosError } = await supabase
                    .from("planos")
                    .select("id, nome")
                    .order("valor", { ascending: true });
                if (planosError) throw planosError;
                setPlanos(planosData || []);

                // Fetch Turmas
                const { data: turmasData, error: turmasError } = await supabase
                    .from("turmas")
                    .select("id, nome, dias_semana, hora_inicio, hora_fim")
                    .order("id", { ascending: true });
                if (turmasError) throw turmasError;
                setTurmas(turmasData || []);

            } catch (err) {
                console.error(err);
                setError("Erro ao carregar dados.");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            if (!agendadoPara) throw new Error("Selecione a data e hora do agendamento.");

            // Format date for Sao Paulo (just string manipulation as requested)
            // Input datetime-local: "YYYY-MM-DDTHH:mm"
            // Output RPC expectation: "YYYY-MM-DD HH:mm:ss"
            const formattedDate = agendadoPara.replace("T", " ") + ":00";

            const { error: rpcError } = await supabase.rpc("criar_aula_experimental", {
                p_nome: nome,
                p_email: email,
                p_telefone: telefone || null,
                p_data_nascimento: dataNascimento || null,
                p_plano_id: planoId ? Number(planoId) : null,
                p_turma_id: turmaId ? Number(turmaId) : null,
                p_dia_vencimento: diaVencimento ? Number(diaVencimento) : null,
                p_agendado_para: formattedDate
            });

            if (rpcError) throw rpcError;

            setSuccess(true);
            setTimeout(() => {
                router.push("/professor/aulas-experimentais");
            }, 2000);

        } catch (err) {
            console.error(err);
            setError((err as Error).message || "Erro ao agendar aula.");
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-6 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Agendar Experimental</h1>
                    <p className="text-zinc-500 font-medium">Cadastre um novo interessado para aula experimental.</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest"
                >
                    <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Voltar
                </button>
            </header>

            <div className="rounded-3xl border border-zinc-200 bg-white p-8 md:p-12 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-red-600" />

                {error && (
                    <div className="mb-8 rounded-2xl bg-red-50 border border-red-100 p-4 text-red-600 text-sm font-medium flex items-center gap-3">
                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-8 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-600 text-sm font-medium flex items-center gap-3">
                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Agendamento realizado com sucesso! Redirecionando...
                    </div>
                )}

                {loading ? (
                    <div className="py-20 text-center space-y-4">
                        <div className="inline-block w-8 h-8 border-4 border-zinc-200 border-t-red-600 rounded-full animate-spin"></div>
                        <p className="text-zinc-500 font-medium">Carregando dados...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Pessoal */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Dados Pessoais</h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Nome <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder-zinc-300 font-medium"
                                        value={nome}
                                        onChange={e => setNome(e.target.value)}
                                        placeholder="Nome do interessado"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Email <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder-zinc-300 font-medium"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="email@exemplo.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Telefone</label>
                                    <input
                                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder-zinc-300 font-medium"
                                        value={telefone}
                                        onChange={e => setTelefone(e.target.value)}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Data de Nascimento</label>
                                    <input
                                        type="date"
                                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium"
                                        value={dataNascimento}
                                        onChange={e => setDataNascimento(e.target.value)}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Interesse */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Interesse</h3>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Plano Pretendido</label>
                                    <select
                                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium"
                                        value={planoId}
                                        onChange={e => setPlanoId(e.target.value)}
                                    >
                                        <option value="">Selecione...</option>
                                        {planos.map(p => (
                                            <option key={p.id} value={p.id}>{p.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Turma de Interesse</label>
                                    <select
                                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium"
                                        value={turmaId}
                                        onChange={e => setTurmaId(e.target.value)}
                                    >
                                        <option value="">Selecione...</option>
                                        {turmas.map(t => (
                                            <option key={t.id} value={t.id}>{t.nome} ({t.dias_semana} {t.hora_inicio.slice(0, 5)})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Vencimento Pref.</label>
                                    <select
                                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium"
                                        value={diaVencimento}
                                        onChange={e => setDiaVencimento(e.target.value)}
                                    >
                                        <option value="5">Dia 5</option>
                                        <option value="10">Dia 10</option>
                                        <option value="15">Dia 15</option>
                                        <option value="20">Dia 20</option>
                                        <option value="25">Dia 25</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Agendamento */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Agendamento de Aula</h3>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Data e Hora <span className="text-red-500">*</span></label>
                                <input
                                    type="datetime-local"
                                    required
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-zinc-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium max-w-xs"
                                    value={agendadoPara}
                                    onChange={e => setAgendadoPara(e.target.value)}
                                />
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Horário de Brasília/São Paulo</p>
                            </div>
                        </section>

                        <div className="pt-6 border-t border-zinc-100">
                            <button
                                type="submit"
                                disabled={submitting || success}
                                className="w-full rounded-xl bg-red-600 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-red-900/20 transition-all hover:bg-red-500 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100"
                            >
                                {submitting ? "Agendando..." : "Confirmar Agendamento"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
