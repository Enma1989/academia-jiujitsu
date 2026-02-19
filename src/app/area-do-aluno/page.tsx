import type { Metadata } from "next";
import Image from "next/image";
import LoginForm from "@/app/area-do-aluno/LoginForm";

export const metadata: Metadata = {
    title: "Área do Aluno | Caio Matuto Jiu-Jitsu",
    description:
        "Acesse sua área do aluno da Caio Matuto Jiu-Jitsu para acompanhar pagamentos, treinos e avisos.",
};

export default function AreaDoAlunoPage() {
    return (
        <main className="relative min-h-screen bg-zinc-950 text-zinc-50">
            {/* BACKGROUND COM IMAGEM EM FULLSCREEN */}
            <div className="absolute inset-0">
                <Image
                    src="/Jiu-Jitsu_Wallpaper002.jpg"
                    alt="Jiu-Jitsu – Caio Matuto"
                    fill
                    priority
                    className="object-cover"
                />
                {/* overlay escuro por cima da imagem */}
                <div className="absolute inset-0 bg-black/70" />
            </div>

            {/* CONTEÚDO CENTRALIZADO */}
            <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
                <div className="w-full max-w-md">
                    {/* LOGO / TÍTULO NO TOPO */}
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-5 flex items-center justify-center">
                            <Image
                                src="/caio-matuto-logo.png"
                                alt="Caio Matuto Jiu-Jitsu"
                                width={110}
                                height={110}
                                className="object-contain"
                            />
                        </div>


                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
                            Área do Aluno
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-zinc-50">
                            Acesse o sistema
                        </h1>
                        <p className="mt-1 text-xs text-zinc-300">
                            Use seu e-mail e senha cadastrados com a academia.
                        </p>
                    </div>

                    {/* FORMULÁRIO (CLIENT COMPONENT) */}
                    <LoginForm />
                </div>
            </div>
        </main>
    );
}