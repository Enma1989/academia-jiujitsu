"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";

// Define strict type based on DB table
type AulaExperimental = {
    id: number;
    created_at: string;
    agendado_para: string;
    status: string; // 'agendada', 'concluida', 'cancelada', etc.
    aluno_id: number;
    alunos?: {
        nome: string;
        email: string;
        telefone: string;
    };
};

export default function AulasExperimentaisPage() {
    const supabase = createClient();
    const router = useRouter();

    const [aulas, setAulas] = useState<AulaExperimental[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("todos");
    const [filterTime, setFilterTime] = useState("proximas"); // proximas, passadas, todas

    useEffect(() => {
        fetchAulas();
    }, []);

    async function fetchAulas() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("aulas_experimentais")
                .select(`
                    *,
                    alunos (nome, email, telefone)
                `)
                .order("agendado_para", { ascending: false });

            if (error) throw error;
            setAulas(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const filteredAulas = aulas.filter(aula => {
        const matchesStatus = filterStatus === "todos" || aula.status === filterStatus;

        const now = new Date();
        const aulaDate = new Date(aula.agendado_para);

        let matchesTime = true;
        if (filterTime === "proximas") {
            matchesTime = aulaDate >= now;
        } else if (filterTime === "passadas") {
            matchesTime = aulaDate < now;
        }

        return matchesStatus && matchesTime;
    });

    const formatData = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-6 space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <button
                        onClick={() => router.push("/professor")}
                        className="group flex items-center gap-2 text-[10px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-[0.2em] mb-4"
                    >
                        <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Painel Professor
                    </button>
                    <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Aulas Experimentais</h1>
                    <p className="text-zinc-500 font-medium">Gerencie os agendamentos de futuros alunos.</p>
                </div>
                <button
                    onClick={() => router.push("/professor/agendar")}
                    className="group bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-2xl uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-red-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    + Agendar Aula
                </button>
            </header>

            {/* Filters and Counters */}
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-zinc-100" />

                <div className="flex flex-wrap gap-4 items-center">
                    <div className="space-y-1.5 min-w-[140px]">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Período</label>
                        <select
                            value={filterTime}
                            onChange={(e) => setFilterTime(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-700 focus:border-red-500/50 outline-none transition-all cursor-pointer"
                        >
                            <option value="proximas">Próximas</option>
                            <option value="passadas">Passadas</option>
                            <option value="todas">Todas</option>
                        </select>
                    </div>
                    <div className="space-y-1.5 min-w-[140px]">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-700 focus:border-red-500/50 outline-none transition-all cursor-pointer"
                        >
                            <option value="todos">Todos</option>
                            <option value="agendada">Agendada</option>
                            <option value="concluida">Concluída</option>
                            <option value="cancelada">Cancelada</option>
                            <option value="no-show">No-Show</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-3 pr-2">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total filtrado</p>
                        <p className="text-2xl font-black text-zinc-900 tracking-tighter">{filteredAulas.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center space-y-4">
                    <div className="inline-block w-8 h-8 border-4 border-zinc-200 border-t-red-600 rounded-full animate-spin"></div>
                    <p className="text-zinc-500 font-medium tracking-tight">Carregando agendamentos...</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white shadow-sm">
                    <table className="min-w-full text-left text-sm border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-zinc-50/50">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 border-b border-zinc-100">Data e Hora</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 border-b border-zinc-100">Interessado</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 border-b border-zinc-100">Contato</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 border-b border-zinc-100 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {filteredAulas.map(aula => (
                                <tr key={aula.id} className="hover:bg-zinc-50/50 transition-colors group">
                                    <td className="px-6 py-6 font-black text-zinc-900 tabular-nums">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:scale-110 group-hover:bg-red-50 group-hover:text-red-600 transition-all">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            {formatData(aula.agendado_para)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <p className="font-bold text-zinc-900 uppercase tracking-tight">{aula.alunos?.nome ?? "Desconhecido"}</p>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">ID: {aula.aluno_id}</p>
                                    </td>
                                    <td className="px-6 py-6">
                                        <p className="text-zinc-600 font-medium">{aula.alunos?.email}</p>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">{aula.alunos?.telefone}</p>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                            ${aula.status === 'agendada' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                aula.status === 'concluida' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    aula.status === 'cancelada' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                        'bg-zinc-50 text-zinc-500 border border-zinc-100'
                                            }`}>
                                            {aula.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredAulas.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-50 text-zinc-300 mb-4">
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Nenhum agendamento encontrado.</p>
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
