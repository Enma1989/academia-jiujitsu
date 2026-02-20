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
        <main className="min-h-screen bg-zinc-950 text-zinc-50 p-6">
            <div className="max-w-2xl mx-auto space-y-8">
                <header>
                    <button
                        onClick={() => router.back()}
                        className="text-sm text-zinc-400 hover:text-white mb-4 block"
                    >
                        ← Voltar
                    </button>
                    <h1 className="text-3xl font-bold">Agendar Aula Experimental</h1>
                    <p className="text-zinc-400">Preencha os dados do interessado para criar o agendamento.</p>
                </header>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-200 p-4 rounded-md">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-200 p-4 rounded-md">
                        Agendamento realizado com sucesso! Redirecionando...
                    </div>
                )}

                {loading ? (
                    <p>Carregando...</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                        {/* Pessoal */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold border-b border-zinc-800 pb-2">Dados Pessoais</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Nome <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 focus:border-red-500 outline-none"
                                        value={nome}
                                        onChange={e => setNome(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Email <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 focus:border-red-500 outline-none"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Telefone</label>
                                    <input
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 focus:border-red-500 outline-none"
                                        value={telefone}
                                        onChange={e => setTelefone(e.target.value)}
                                        placeholder="(XX) XXXXX-XXXX"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Data Nascimento</label>
                                    <input
                                        type="date"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 focus:border-red-500 outline-none"
                                        value={dataNascimento}
                                        onChange={e => setDataNascimento(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Interesse */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold border-b border-zinc-800 pb-2">Interesse</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Plano de Interesse</label>
                                    <select
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 focus:border-red-500 outline-none"
                                        value={planoId}
                                        onChange={e => setPlanoId(e.target.value)}
                                    >
                                        <option value="">Selecione...</option>
                                        {planos.map(p => (
                                            <option key={p.id} value={p.id}>{p.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Turma de Interesse</label>
                                    <select
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 focus:border-red-500 outline-none"
                                        value={turmaId}
                                        onChange={e => setTurmaId(e.target.value)}
                                    >
                                        <option value="">Selecione...</option>
                                        {turmas.map(t => (
                                            <option key={t.id} value={t.id}>{t.nome} ({t.dias_semana} {t.hora_inicio})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Dia Venc. Preferido</label>
                                    <select
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 focus:border-red-500 outline-none"
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
                        </div>

                        {/* Agendamento */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold border-b border-zinc-800 pb-2">Agendamento</h2>
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Data e Hora <span className="text-red-500">*</span></label>
                                <input
                                    type="datetime-local"
                                    required
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 focus:border-red-500 outline-none max-w-xs"
                                    value={agendadoPara}
                                    onChange={e => setAgendadoPara(e.target.value)}
                                />
                                <p className="text-xs text-zinc-500">Horário de Brasília/São Paulo</p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={submitting || success}
                                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded uppercase tracking-wider disabled:opacity-50"
                            >
                                {submitting ? "Agendando..." : "Confirmar Agendamento"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}
