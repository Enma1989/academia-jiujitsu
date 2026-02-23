"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PagamentosPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/professor/mensalidades");
    }, [router]);

    return (
        <div className="flex h-[60vh] items-center justify-center text-zinc-400 bg-[#FBFBFB]">
            <div className="text-center space-y-4">
                <div className="inline-block w-8 h-8 border-4 border-zinc-200 border-t-red-600 rounded-full animate-spin"></div>
                <p className="font-medium">Redirecionando para Mensalidades...</p>
            </div>
        </div>
    );
}
