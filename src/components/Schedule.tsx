export function Schedule() {
    const schedule = [
        {
            days: "Segunda, Quarta e Sexta",
            classes: [
                { name: "Adultos", time: "07h às 08h" },
                { name: "Kids 1", time: "18h às 19h" },
                { name: "Kids 2", time: "19h30 às 20h30" },
                { name: "Adultos", time: "20h30 às 22h" },
            ],
        },
        {
            days: "Terça e Quinta",
            classes: [
                { name: "Treinos de Competição e Funcional", time: "20h às 21h30" },
            ],
        },
    ];

    return (
        <section id="horarios" className="bg-zinc-950 py-20 text-white">
            <div className="mx-auto max-w-6xl px-4">
                <div className="mb-12 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-red-500">
                        AGENDA
                    </p>
                    <h2 className="mt-3 text-3xl font-extrabold uppercase tracking-tight md:text-4xl">
                        Horários de Treino
                    </h2>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {schedule.map((dayGroup, index) => (
                        <div
                            key={index}
                            className="flex flex-col rounded-xl bg-zinc-900/50 p-8 border-l-4 border-red-600 shadow-lg"
                        >
                            <h3 className="mb-6 text-xl font-bold text-white uppercase tracking-wider">
                                {dayGroup.days}
                            </h3>
                            <div className="space-y-4">
                                {dayGroup.classes.map((cls, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between border-b border-zinc-800 pb-4 last:border-0 last:pb-0"
                                    >
                                        <span className="font-medium text-zinc-200">
                                            {cls.name}
                                        </span>
                                        <span className="text-sm font-semibold text-red-500 whitespace-nowrap ml-4">
                                            {cls.time}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
