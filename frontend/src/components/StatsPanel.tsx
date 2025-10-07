import { useEffect, useMemo, useState } from "react";

/* =========================
 *  Tipos y utilidades
 * ========================= */
type WeeklyItem = { weekStart: string; totalMinutes: number; sessions: number; };
type WeeklyRes = { from: string; to: string; weeks: WeeklyItem[]; };

type BestRunRes = {
    hasData: boolean;
    from: string;
    to: string;
    workoutId?: string;
    date?: string;
    durationMin?: number;
    distanceKm?: number;
    estimated5kMin?: number;
};

type StationBest = { station: string; bestSec: number | null; };
type BestStationsRes = { from: string; to: string; items: StationBest[]; };

type Workout = {
    id: string;
    date: string;       // "YYYY-MM-DD"
    type: "RUN" | "BIKE" | "SWIM" | "HYROX" | "GYM";
    durationMin: number;
    distanceKm?: number | null;
    rpe: number;
    fcMedia?: number | null;
    wattsMedios?: number | null;
    notas?: string | null;
};

function mmssFromMinutes(mins: number) {
    const totalSec = Math.round(mins * 60);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}
function mmssFromSeconds(sec: number | null) {
    if (sec == null) return "—";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}
function paceMinPerKm(totalMin: number, totalKm: number) {
    if (!totalKm || totalKm <= 0) return null;
    return totalMin / totalKm; // min/km
}
function todayISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
}
function isoNDaysAgo(n: number) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
}

/* =========================
 *  Componente
 * ========================= */
export default function StatsPanel() {
    const [from, setFrom] = useState(isoNDaysAgo(28));
    const [to, setTo] = useState(todayISO());

    const [weekly, setWeekly] = useState<WeeklyRes | null>(null);
    const [bestRun, setBestRun] = useState<BestRunRes | null>(null);
    const [bestStations, setBestStations] = useState<BestStationsRes | null>(null);
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadAll() {
        setLoading(true);
        const q = `?from=${from}&to=${to}`;
        const [w, r, s, allW] = await Promise.all([
            fetch("http://localhost:8080/api/stats/weekly" + q).then(r => r.json()),
            fetch("http://localhost:8080/api/stats/best-run" + q).then(r => r.json()),
            fetch("http://localhost:8080/api/stats/best-hyrox-stations" + q).then(r => r.json()),
            fetch("http://localhost:8080/api/workouts").then(r => r.json()),
        ]);
        setWeekly(w); setBestRun(r); setBestStations(s); setWorkouts(allW);
        setLoading(false);
    }

    useEffect(() => { loadAll(); }, []); // primera carga
    const applyRange = async () => { await loadAll(); };

    // Filtramos workouts en cliente para ritmo RUN en el rango
    const runsInRange = useMemo(() => {
        const fromD = new Date(from); const toD = new Date(to + "T23:59:59");
        return workouts.filter(w => {
            const d = new Date(w.date);
            return w.type === "RUN" && d >= fromD && d <= toD && (w.distanceKm ?? 0) > 0;
        });
    }, [workouts, from, to]);

    const avgRunPace = useMemo(() => {
        const totalMin = runsInRange.reduce((acc, w) => acc + w.durationMin, 0);
        const totalKm = runsInRange.reduce((acc, w) => acc + (w.distanceKm ?? 0), 0);
        const pace = paceMinPerKm(totalMin, totalKm);
        return pace; // min/km
    }, [runsInRange]);

    function downloadCSV() {
        // CSV de workouts en el rango (todas las disciplinas)
        const fromD = new Date(from); const toD = new Date(to + "T23:59:59");
        const rows = workouts
            .filter(w => {
                const d = new Date(w.date);
                return d >= fromD && d <= toD;
            })
            .map(w => ({
                id: w.id,
                date: w.date,
                type: w.type,
                durationMin: w.durationMin,
                distanceKm: w.distanceKm ?? "",
                rpe: w.rpe,
                fcMedia: w.fcMedia ?? "",
                wattsMedios: w.wattsMedios ?? "",
                notas: (w.notas ?? "").replace(/\n/g, " ").replace(/"/g, '""'),
            }));

        const header = ["id", "date", "type", "durationMin", "distanceKm", "rpe", "fcMedia", "wattsMedios", "notas"];
        const csv = [
            header.join(","),
            ...rows.map(r => header.map(h => `"${String((r as any)[h])}"`).join(","))
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `hyron_workouts_${from}_to_${to}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /* =========================
     *  UI
     * ========================= */
    return (
        <section className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">📊 Resumen</h2>

            {/* Filtros */}
            <div className="rounded-2xl border border-zinc-200/70 bg-white/80 dark:bg-zinc-900/70 dark:border-zinc-800 p-4 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-3">
                    <label className="flex flex-col gap-1 text-sm w-full md:w-56">
                        <span className="text-zinc-700 dark:text-zinc-300">Desde</span>
                        <input
                            type="date"
                            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100"
                            value={from}
                            onChange={e => setFrom(e.target.value)}
                        />
                    </label>

                    <label className="flex flex-col gap-1 text-sm w-full md:w-56">
                        <span className="text-zinc-700 dark:text-zinc-300">Hasta</span>
                        <input
                            type="date"
                            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100"
                            value={to}
                            onChange={e => setTo(e.target.value)}
                        />
                    </label>

                    <div className="flex gap-2">
                        <button
                            onClick={applyRange}
                            className="inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500/60"
                        >
                            Aplicar
                        </button>
                        <button
                            onClick={downloadCSV}
                            className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 px-4 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                        >
                            Exportar CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Estado de carga */}
            {loading && (
                <div className="rounded-2xl border border-zinc-200/70 bg-white/80 dark:bg-zinc-900/70 dark:border-zinc-800 p-4 shadow-sm text-sm text-zinc-600 dark:text-zinc-400">
                    Cargando estadísticas…
                </div>
            )}

            {/* KPI cards */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-zinc-200/70 bg-white/80 dark:bg-zinc-900/70 dark:border-zinc-800 p-4 shadow-sm">
                        <div className="text-xs uppercase tracking-wide text-zinc-500">Volumen semana reciente</div>
                        <div className="mt-1 text-3xl font-semibold">
                            {weekly?.weeks?.[0]?.totalMinutes ?? 0}
                        </div>
                        <div className="text-xs text-zinc-500">Sesiones: {weekly?.weeks?.[0]?.sessions ?? 0}</div>
                    </div>

                    <div className="rounded-2xl border border-zinc-200/70 bg-white/80 dark:bg-zinc-900/70 dark:border-zinc-800 p-4 shadow-sm">
                        <div className="text-xs uppercase tracking-wide text-zinc-500">Mejor 5K estimado</div>
                        <div className="mt-1 text-3xl font-semibold">
                            {bestRun?.hasData && bestRun?.estimated5kMin
                                ? mmssFromMinutes(bestRun.estimated5kMin)
                                : "—"}
                        </div>
                        <div className="text-xs text-zinc-500">
                            {bestRun?.hasData ? `${bestRun?.date} · ${(bestRun?.distanceKm ?? 0).toFixed(2)} km` : "Sin datos"}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-200/70 bg-white/80 dark:bg-zinc-900/70 dark:border-zinc-800 p-4 shadow-sm">
                        <div className="text-xs uppercase tracking-wide text-zinc-500">Ritmo medio carrera</div>
                        <div className="mt-1 text-3xl font-semibold">
                            {avgRunPace != null ? mmssFromMinutes(avgRunPace) : "—"}
                        </div>
                        <div className="text-xs text-zinc-500">{runsInRange.length} carreras en rango</div>
                    </div>

                    <div className="rounded-2xl border border-zinc-200/70 bg-white/80 dark:bg-zinc-900/70 dark:border-zinc-800 p-4 shadow-sm">
                        <div className="text-xs uppercase tracking-wide text-zinc-500">Mejor estación (tiempo)</div>
                        <div className="mt-1 text-3xl font-semibold">
                            {(() => {
                                const withTime = bestStations?.items?.filter(i => i.bestSec != null) ?? [];
                                if (!withTime.length) return "—";
                                const best = withTime.reduce((a, b) => (a.bestSec! < b.bestSec! ? a : b));
                                return mmssFromSeconds(best.bestSec!);
                            })()}
                        </div>
                        <div className="text-xs text-zinc-500">
                            {(() => {
                                const withTime = bestStations?.items?.filter(i => i.bestSec != null) ?? [];
                                if (!withTime.length) return "";
                                const best = withTime.reduce((a, b) => (a.bestSec! < b.bestSec! ? a : b));
                                return best.station;
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Tabla semanas */}
            {!loading && (
                <div className="rounded-2xl border border-zinc-200/70 bg-white/80 dark:bg-zinc-900/70 dark:border-zinc-800 p-4 shadow-sm">
                    <h3 className="text-base font-semibold mb-3">Semanas en rango</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-50 dark:bg-zinc-900">
                                <tr className="text-left">
                                    <th className="p-2 border-b border-zinc-200 dark:border-zinc-800">Semana (inicio)</th>
                                    <th className="p-2 border-b border-zinc-200 dark:border-zinc-800 text-right">Minutos</th>
                                    <th className="p-2 border-b border-zinc-200 dark:border-zinc-800 text-right">Sesiones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(weekly?.weeks ?? []).map(w => (
                                    <tr key={w.weekStart} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/60">
                                        <td className="p-2 border-b border-zinc-100 dark:border-zinc-800">{w.weekStart}</td>
                                        <td className="p-2 border-b border-zinc-100 dark:border-zinc-800 text-right">{w.totalMinutes}</td>
                                        <td className="p-2 border-b border-zinc-100 dark:border-zinc-800 text-right">{w.sessions}</td>
                                    </tr>
                                ))}
                                {(!weekly?.weeks || weekly.weeks.length === 0) && (
                                    <tr>
                                        <td className="p-2 text-zinc-500" colSpan={3}>Sin datos en este rango</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tabla mejores estaciones */}
            {!loading && (
                <div className="rounded-2xl border border-zinc-200/70 bg-white/80 dark:bg-zinc-900/70 dark:border-zinc-800 p-4 shadow-sm">
                    <h3 className="text-base font-semibold mb-3">Mejores estaciones Hyrox</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-50 dark:bg-zinc-900">
                                <tr className="text-left">
                                    <th className="p-2 border-b border-zinc-200 dark:border-zinc-800">Estación</th>
                                    <th className="p-2 border-b border-zinc-200 dark:border-zinc-800 text-right">Mejor tiempo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(bestStations?.items ?? []).map(i => (
                                    <tr key={i.station} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/60">
                                        <td className="p-2 border-b border-zinc-100 dark:border-zinc-800">{i.station}</td>
                                        <td className="p-2 border-b border-zinc-100 dark:border-zinc-800 text-right">{mmssFromSeconds(i.bestSec)}</td>
                                    </tr>
                                ))}
                                {(!bestStations?.items || bestStations.items.length === 0) && (
                                    <tr>
                                        <td className="p-2 text-zinc-500" colSpan={2}>Sin datos</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </section>
    );
}
