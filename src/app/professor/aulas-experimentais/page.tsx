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
        <main className="min-h-screen bg-zinc-950 text-zinc-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                    <div>
                        <button
                            onClick={() => router.push("/professor")}
                            className="text-sm text-zinc-400 hover:text-white mb-2 block"
                        >
                            ← Voltar ao Painel
                        </button>
                        <h1 className="text-3xl font-bold">Aulas Experimentais</h1>
                    </div>
                    <div>
                        <button
                            onClick={() => router.push("/professor/agendar")}
                            className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded uppercase text-sm tracking-wider"
                        >
                            + Novo Agendamento
                        </button>
                    </div>
                </header>

                {/* Filters */}
                <div className="flex gap-4 flex-wrap bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400 uppercase font-semibold">Período</label>
                        <select
                            value={filterTime}
                            onChange={(e) => setFilterTime(e.target.value)}
                            className="block bg-zinc-950 border border-zinc-700 rounded px-3 py-1 text-sm focus:border-red-500 outline-none"
                        >
                            <option value="proximas">Próximas</option>
                            <option value="passadas">Passadas</option>
                            <option value="todas">Todas</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400 uppercase font-semibold">Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="block bg-zinc-950 border border-zinc-700 rounded px-3 py-1 text-sm focus:border-red-500 outline-none"
                        >
                            <option value="todos">Todos</option>
                            <option value="agendada">Agendada</option>
                            <option value="concluida">Concluída</option>
                            <option value="cancelada">Cancelada</option>
                            <option value="no-show">No-Show</option>
                        </select>
                    </div>
                    <div className="ml-auto self-end">
                        <p className="text-sm text-zinc-500">Mostrando {filteredAulas.length} aulas</p>
                    </div>
                </div>

                {loading ? (
                    <p className="text-zinc-400">Carregando...</p>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60">
                        <table className="min-w-full text-left text-sm">
                            <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase text-zinc-400">
                                <tr>
                                    <th className="px-4 py-3">Data/Hora</th>
                                    <th className="px-4 py-3">Aluno</th>
                                    <th className="px-4 py-3">Contato</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAulas.map(aula => (
                                    <tr key={aula.id} className="border-b border-zinc-800/70 last:border-0 hover:bg-zinc-800/30">
                                        <td className="px-4 py-3 font-medium text-zinc-200">
                                            {formatData(aula.agendado_para)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-white">{aula.alunos?.nome ?? "Desconhecido"}</p>
                                            <p className="text-xs text-zinc-500">ID: {aula.aluno_id}</p>
                                        </td>
                                        <td className="px-4 py-3 text-zinc-300">
                                            <p>{aula.alunos?.email}</p>
                                            <p className="text-xs text-zinc-500">{aula.alunos?.telefone}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold uppercase
                                                ${aula.status === 'agendada' ? 'bg-blue-500/20 text-blue-400' :
                                                    aula.status === 'concluida' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        aula.status === 'cancelada' ? 'bg-red-500/20 text-red-400' : 'bg-zinc-700 text-zinc-300'
                                                }`}>
                                                {aula.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredAulas.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                                            Nenhuma aula encontrada para os filtros selecionados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
