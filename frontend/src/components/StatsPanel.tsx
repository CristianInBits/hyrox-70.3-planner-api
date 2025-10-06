import { useEffect, useState } from "react";

type WeeklyItem = { weekStart: string; totalMinutes: number; sessions: number; };
type WeeklyRes = { from: string; weeks: WeeklyItem[]; };

type BestRunRes = {
    hasData: boolean;
    workoutId?: string;
    date?: string;
    durationMin?: number;
    distanceKm?: number;
    estimated5kMin?: number;
};

type StationBest = { station: string; bestSec: number | null; };
type BestStationsRes = { items: StationBest[]; };

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

export default function StatsPanel() {
    const [weekly, setWeekly] = useState<WeeklyRes | null>(null);
    const [bestRun, setBestRun] = useState<BestRunRes | null>(null);
    const [bestStations, setBestStations] = useState<BestStationsRes | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const [w, r, s] = await Promise.all([
                fetch("http://localhost:8080/api/stats/weekly").then(r => r.json()),
                fetch("http://localhost:8080/api/stats/best-run").then(r => r.json()),
                fetch("http://localhost:8080/api/stats/best-hyrox-stations").then(r => r.json()),
            ]);
            setWeekly(w);
            setBestRun(r);
            setBestStations(s);
            setLoading(false);
        })();
    }, []);

    if (loading) return <div className="mt-6">Cargando estadísticas…</div>;

    return (
        <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">📊 Resumen</h2>

            {/* Tarjetas superiores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Volumen semana actual */}
                <div className="border rounded p-4">
                    <div className="text-sm opacity-60">Volumen semanal (min)</div>
                    <div className="text-3xl font-semibold">
                        {weekly?.weeks?.[0]?.totalMinutes ?? 0}
                    </div>
                    <div className="text-sm opacity-60">Sesiones: {weekly?.weeks?.[0]?.sessions ?? 0}</div>
                </div>

                {/* Mejor 5K estimado */}
                <div className="border rounded p-4">
                    <div className="text-sm opacity-60">Mejor 5K estimado</div>
                    <div className="text-3xl font-semibold">
                        {bestRun?.hasData && bestRun?.estimated5kMin
                            ? mmssFromMinutes(bestRun.estimated5kMin)
                            : "—"}
                    </div>
                    <div className="text-sm opacity-60">
                        {bestRun?.hasData
                            ? `${bestRun?.date} · ${(bestRun?.distanceKm ?? 0).toFixed(2)} km`
                            : "Sin datos de carrera con distancia"}
                    </div>
                </div>

                {/* Mejor estación (mejor tiempo absoluto) */}
                <div className="border rounded p-4">
                    <div className="text-sm opacity-60">Mejor estación (tiempo)</div>
                    <div className="text-3xl font-semibold">
                        {(() => {
                            if (!bestStations?.items?.length) return "—";
                            const withTime = bestStations.items.filter(i => i.bestSec != null);
                            if (!withTime.length) return "—";
                            const best = withTime.reduce((a, b) => (a.bestSec! < b.bestSec! ? a : b));
                            return mmssFromSeconds(best.bestSec!);
                        })()}
                    </div>
                    <div className="text-sm opacity-60">
                        {(() => {
                            if (!bestStations?.items?.length) return "";
                            const withTime = bestStations.items.filter(i => i.bestSec != null);
                            if (!withTime.length) return "";
                            const best = withTime.reduce((a, b) => (a.bestSec! < b.bestSec! ? a : b));
                            return best.station;
                        })()}
                    </div>
                </div>
            </div>

            {/* Tabla últimas 4 semanas */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Últimas 4 semanas</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border rounded">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left p-2 border">Semana (inicio)</th>
                                <th className="text-right p-2 border">Minutos</th>
                                <th className="text-right p-2 border">Sesiones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(weekly?.weeks ?? []).map(w => (
                                <tr key={w.weekStart}>
                                    <td className="p-2 border">{w.weekStart}</td>
                                    <td className="p-2 border text-right">{w.totalMinutes}</td>
                                    <td className="p-2 border text-right">{w.sessions}</td>
                                </tr>
                            ))}
                            {(!weekly?.weeks || weekly.weeks.length === 0) && (
                                <tr><td className="p-2 border" colSpan={3}>Sin datos aún</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tabla mejores estaciones */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Mejores estaciones Hyrox</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border rounded">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left p-2 border">Estación</th>
                                <th className="text-right p-2 border">Mejor tiempo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(bestStations?.items ?? []).map(i => (
                                <tr key={i.station}>
                                    <td className="p-2 border">{i.station}</td>
                                    <td className="p-2 border text-right">{mmssFromSeconds(i.bestSec)}</td>
                                </tr>
                            ))}
                            {(!bestStations?.items || bestStations.items.length === 0) && (
                                <tr><td className="p-2 border" colSpan={2}>Sin datos</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
