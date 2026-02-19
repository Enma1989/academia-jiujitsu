import { supabase } from "./supabaseClient";

export async function getAluno(userId: string) {
    const { data, error } = await supabase
        .from("alunos")
        .select("*, planos(*), turmas(*)")
        .eq("id", userId)
        .single();

    if (error) {
        console.error("Erro buscando aluno:", error);
        return null;
    }

    return data;
}
