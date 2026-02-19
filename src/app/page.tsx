"use client";


import Image from "next/image";
import Link from "next/link";
import { Contact } from "@/components/Contact";
import { Location } from "@/components/Location";
import { Schedule } from "@/components/Schedule";
import { SITE_CONFIG } from "@/lib/constants";

const NAV_ITEMS = [
  { label: "Início", href: "#inicio" },
  { label: "Sobre", href: "#sobre" },
  { label: "Horários", href: "#horarios" },
  { label: "Contato", href: "#contato" },
];

export default function Home() {
  // Video effect logic removed for YouTube embed

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 scroll-smooth pt-20">
      {/* HEADER FIXO */}
      <header className="fixed inset-x-0 top-0 z-30 border-b border-zinc-900/60 bg-black/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          {/* Logo + Nome */}
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900/70">
              <Image
                src="/caio-matuto-logo.png"
                alt="Logo Caio Matuto Jiu-Jitsu"
                fill
                className="object-contain p-1"
                priority
              />
            </div>

            <div className="leading-tight">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-200">
                Academia de Jiu-Jitsu
              </p>
              <p className="text-base font-bold text-white">
                Caio Matuto Jiu-Jitsu
              </p>
            </div>
          </div>

          {/* NAV + CTAs */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-100 md:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-red-500 transition"
              >
                {item.label}
              </a>
            ))}

            {/* 1 BOTÃO SÓ: decide aluno/professor */}
            <Link
              href="/area"
              className="inline-flex items-center justify-center rounded-md border border-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-500 hover:bg-red-600 hover:text-white transition"
            >
              Log-In
            </Link>

            {/* CTA WhatsApp */}
            <a
              href={`${SITE_CONFIG.contact.whatsappLink}?text=Quero%20agendar%20uma%20aula%20experimental%20na%20Caio%20Matuto%20Jiu-Jitsu`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-red-600 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-md hover:bg-red-500 transition"
            >
              Agende uma aula experimental
            </a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section
        id="inicio"
        className="relative h-screen min-h-[600px] border-b border-zinc-900 flex items-center"
        style={{
          backgroundImage: "url(/Foto-kimono.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/75" />

        <div className="relative flex w-full justify-start px-6 md:pl-16 lg:pl-28 py-24 md:min-h-[80vh]">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
              Caio Matuto Jiu-Jitsu
            </p>

            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight text-white">
              Treine pesado. Evolua
              <span className="block text-red-500">dentro e fora do tatame.</span>
            </h1>

            <p className="mt-4 text-sm text-zinc-200 md:text-base">
              Jiu-Jitsu para iniciantes, avançados, kids e competidores. Treinos
              focados em resultado, disciplina e defesa pessoal em um ambiente
              estruturado, seguro e família.
            </p>

            <div className="mt-8 inline-flex flex-wrap items-center gap-4">
              <a
                href="#contato"
                className="inline-block bg-red-600 hover:bg-red-500 text-white font-semibold px-8 py-3 rounded-md shadow-lg transition"
              >
                Agende sua aula experimental agora mesmo!
              </a>
            </div>

            <p className="mt-4 text-xs text-zinc-300 md:text-sm">
              Jiu-Jitsu &amp; Defesa Pessoal • Treinos de segunda a sábado.
            </p>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="bg-white text-zinc-900">
        <div className="mx-auto max-w-6xl grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)]">
          <div className="relative h-[420px] md:h-[520px] lg:h-[600px] overflow-hidden bg-white">
            <Image
              src="/Turma.png"
              alt="Turma Caio Matuto Jiu-Jitsu"
              fill
              priority
              className="essencia-mask h-full w-full object-cover filter grayscale"
            />
          </div>

          <div className="px-6 py-12 md:px-10 md:py-16 lg:px-16 lg:py-20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-red-500">
              A NOSSA
            </p>
            <h2 className="mt-1 text-3xl md:text-4xl font-extrabold tracking-[0.12em] text-zinc-900">
              ESSÊNCIA
            </h2>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
              ATITUDE DE CAMPEÃO
            </p>

            <h3 className="mt-2 text-2xl md:text-3xl font-extrabold leading-snug text-zinc-900">
              Aqui a gente treina para vencer{" "}
              <span className="block">dentro e fora do tatame.</span>
            </h3>

            <p className="mt-4 text-sm md:text-base leading-relaxed text-zinc-700">
              A Caio Matuto Jiu-Jitsu é uma academia na Cidade Industrial de
              Curitiba com foco em evolução constante. Não é só sobre aprender
              técnicas: é sobre disciplina, respeito, superação pessoal e
              espírito de equipe.
            </p>

            <p className="mt-3 text-sm md:text-base leading-relaxed text-zinc-700">
              Toda aula é pensada para que o aluno saia melhor do que entrou —
              fisicamente, mentalmente e emocionalmente. Crianças, adultos,
              iniciantes ou competidores: cada um treina no seu ritmo, mas com
              o mesmo padrão de excelência.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 text-sm">
              {[
                {
                  title: "Professores qualificados",
                  desc: "Equipe experiente, didática e presente em cada detalhe do treino.",
                },
                {
                  title: "Grade horária ampla",
                  desc: "Opções de treinos pela manhã, tarde e noite para encaixar na rotina.",
                },
                {
                  title: "Estrutura preparada",
                  desc: "Tatame amplo, ambiente seguro e organizado, pensado para performance.",
                },
                {
                  title: "Clima de equipe",
                  desc: "Time que acolhe quem está começando e puxa quem quer competir.",
                },
              ].map((item) => (
                <div key={item.title}>
                  <p className="flex items-start gap-2 font-semibold text-zinc-900">
                    <span className="mt-1 text-red-600">✔</span>
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs md:text-sm text-zinc-700">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <a
                href={`${SITE_CONFIG.contact.whatsappLink}?text=Quero%20fazer%20parte%20do%20time%20Caio%20Matuto%20Jiu-Jitsu`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-none bg-red-600 px-10 py-3 text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-md transition hover:bg-red-500"
              >
                Venha fazer parte do nosso time
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ESPAÇO */}
      <section id="espaco" className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.3fr)] items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
                O ESPAÇO
              </p>

              <h2 className="mt-3 text-4xl lg:text-5xl font-extrabold leading-tight">
                O Espaço
              </h2>

              <p className="mt-6 text-sm leading-relaxed text-zinc-300 lg:text-base">
                Na Caio Matuto Jiu-Jitsu, buscamos os mais altos padrões para
                garantir um ambiente seguro, limpo e motivador. Nosso tatame foi
                pensado para receber pessoas de todas as idades e níveis de
                habilidade.
              </p>

              <p className="mt-4 text-sm leading-relaxed text-zinc-300 lg:text-base">
                Seja para treinar forte, evoluir tecnicamente ou apenas viver a
                energia da equipe, você vai se sentir em casa aqui dentro.
              </p>
            </div>

            <div className="group relative rounded-xl overflow-hidden shadow-2xl">
              <Image
                src="/espaco-principal.jpg"
                alt="Turma Caio Matuto Jiu-Jitsu no tatame"
                width={900}
                height={600}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                priority
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="pointer-events-none absolute inset-0 ring-0 group-hover:ring-4 group-hover:ring-red-600/70 transition-all duration-500" />
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { src: "/espaco-1.jpg", alt: "Treino no tatame Caio Matuto Jiu-Jitsu" },
              { src: "/espaco-2.jpg", alt: "Estrutura do vestiário e área interna" },
              { src: "/espaco-3.jpg", alt: "Treino técnico e posições no tatame" },
              { src: "/espaco-4.jpg", alt: "Detalhes do ambiente da academia" },
            ].map((img) => (
              <div key={img.src} className="group relative rounded-lg overflow-hidden border border-zinc-800">
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={400}
                  height={250}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                <div className="pointer-events-none absolute inset-0 ring-0 group-hover:ring-2 group-hover:ring-red-600/80 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VÍDEO */}
      <section id="team-matuto" className="relative overflow-hidden bg-black">
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative h-full w-full overflow-hidden">
            <iframe
              className="absolute top-1/2 left-1/2 min-w-full min-h-full w-[177.77vh] h-[56.25vw] -translate-x-1/2 -translate-y-1/2 object-cover"
              src="https://www.youtube.com/embed/ktFNK-6ZwIs?autoplay=1&mute=1&controls=0&loop=1&playlist=ktFNK-6ZwIs&playsinline=1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ pointerEvents: "none" }}
            />
          </div>
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative mx-auto flex min-h-[420px] md:min-h-[520px] max-w-6xl flex-col items-start justify-center px-4 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400 mb-3">
            Team Caio Matuto Jiu-Jitsu
          </p>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight max-w-2xl">
            Sinta a energia do tatame.
            <span className="block text-red-500">Venha fazer parte do Team Matuto.</span>
          </h2>
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-end justify-center md:justify-end pb-8 md:pb-10 pr-0 md:pr-10">
          <a
            href={`${SITE_CONFIG.contact.whatsappLink}?text=Quero%20fazer%20parte%20do%20Team%20Matuto`}
            target="_blank"
            rel="noreferrer"
            className="pointer-events-auto inline-flex items-center justify-center rounded-md bg-red-600 px-8 py-3 text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_0_30px_-10px_rgba(248,113,113,0.9)] transition hover:bg-red-500"
          >
            Venha agora fazer parte do Team Matuto
          </a>
        </div>
      </section>

      {/* HORÁRIOS */}
      <Schedule />

      {/* LOCALIZAÇÃO (antes do contato) */}
      <Location />

      {/* CONTATO */}
      <Contact />
    </main>
  );
}
