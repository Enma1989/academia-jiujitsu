import { SITE_CONFIG } from "@/lib/constants";

export function Location() {
    const directionsUrl = SITE_CONFIG.address.googleMapsLink;
    const mapSrc = SITE_CONFIG.address.embedMapSrc;

    return (
        <section id="localizacao" className="bg-white py-14 md:py-20 text-zinc-900">
            <div className="mx-auto max-w-[1400px] px-4">
                <div className="mb-6 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-red-500">
                        LOCALIZAÇÃO
                    </p>
                    <h2 className="mt-2 text-3xl font-extrabold uppercase tracking-tight md:text-4xl">
                        Onde Estamos
                    </h2>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-zinc-100 shadow-xl ring-1 ring-zinc-900/5">
                    <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
                        {/* MAPA */}
                        <div className="relative h-[320px] w-full min-h-[320px] lg:h-[500px]">
                            <iframe
                                width="100%"
                                height="100%"
                                id="gmap_canvas"
                                src={mapSrc}
                                frameBorder="0"
                                scrolling="no"
                                marginHeight={0}
                                marginWidth={0}
                                title="Mapa de Localização"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="absolute inset-0 h-full w-full"
                            ></iframe>
                        </div>

                        {/* INFO */}
                        <div className="flex flex-col justify-center bg-white p-6 lg:p-8">
                            <h3 className="text-xl font-bold text-zinc-900">
                                Caio Matuto Jiu-Jitsu
                            </h3>
                            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                                Estamos localizados na Cidade Industrial de Curitiba (CIC), com
                                fácil acesso e estrutura completa para seus treinos.
                            </p>

                            <div className="mt-8 space-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-zinc-400">
                                        ENDEREÇO
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-zinc-900">
                                        {SITE_CONFIG.address.street}, {SITE_CONFIG.address.number}
                                        <br />
                                        {SITE_CONFIG.address.neighborhood}
                                        <br />
                                        {SITE_CONFIG.address.city} - {SITE_CONFIG.address.state}, {SITE_CONFIG.address.postalCode}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8">
                                <a
                                    href={directionsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex w-full items-center justify-center rounded-md bg-red-600 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-red-500"
                                >
                                    Como chegar
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
