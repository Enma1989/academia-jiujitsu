import { createClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

// --- Rate Limit (In-Memory for Dev) ---
// Map<IP, { count: number, resetTime: number }>
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_ATTEMPTS = 10;

function getRateLimit(ip: string) {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(ip, { count: 0, resetTime: now + WINDOW_MS });
        return { count: 0, allowed: true };
    }

    return {
        count: record.count,
        allowed: record.count < MAX_ATTEMPTS,
    };
}

function incrementRateLimit(ip: string) {
    const record = rateLimitMap.get(ip);
    if (record) {
        record.count += 1;
        rateLimitMap.set(ip, record);
    }
}

export async function POST(request: Request) {
    try {
        // 1. Rate Limit Check
        // Em produção (Vercel/Edge), use headers().get("x-forwarded-for") ou similar.
        // Para simplificar, usamos um placeholder ou tentamos pegar o IP.
        const ip = request.headers.get("x-forwarded-for") || "unknown-ip";

        const limit = getRateLimit(ip);
        if (!limit.allowed) {
            return NextResponse.json(
                { error: "Muitas tentativas. Tente novamente em 10 minutos." },
                { status: 429 }
            );
        }

        // 2. Parse Body
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "E-mail e senha são obrigatórios." },
                { status: 400 }
            );
        }

        // 3. Supabase Auth
        const supabase = await createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            incrementRateLimit(ip);
            return NextResponse.json(
                { error: "Credenciais inválidas ou erro no login." },
                { status: 401 }
            );
        }

        // Sucesso
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Erro no login router:", err);
        return NextResponse.json(
            { error: "Erro interno do servidor." },
            { status: 500 }
        );
    }
}
