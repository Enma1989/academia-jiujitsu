import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { SITE_CONFIG } from "@/lib/constants";

export async function POST(request: Request) {
    try {
        const { nome, email, mensagem } = await request.json();

        if (!nome || !email || !mensagem) {
            return NextResponse.json(
                { error: "Todos os campos são obrigatórios." },
                { status: 400 }
            );
        }

        // Configuração do Nodemailer
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false, // true para 465, false para outras portas
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: SITE_CONFIG.contact.email,
            subject: `Novo contato pelo site de ${nome}`,
            text: `
        Nome: ${nome}
        Email: ${email}
        Mensagem:
        ${mensagem}
      `,
            html: `
        <h3>Novo contato pelo site</h3>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${mensagem}</p>
      `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao enviar e-mail:", error);
        return NextResponse.json(
            { error: "Erro ao enviar e-mail. Tente novamente mais tarde." },
            { status: 500 }
        );
    }
}
