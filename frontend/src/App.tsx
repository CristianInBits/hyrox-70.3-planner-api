import { useEffect, useMemo, useState } from "react";
import StatsPanel from "./components/StatsPanel";

// UI
import Card from "./components/ui/Card";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import Select from "./components/ui/Select";
import Label from "./components/ui/Label";

// Tipos
type WorkoutType = "RUN" | "BIKE" | "SWIM" | "HYROX" | "GYM";

type HyroxStation =
  | "SKI_ERG" | "SLED_PUSH" | "SLED_PULL" | "BURPEE_BROAD_JUMPS"
  | "ROW" | "FARMERS_CARRY" | "SANDBAG_LUNGES" | "WALL_BALLS";

type Workout = {
  id: string;
  date: string;
  type: WorkoutType;
  durationSec: number;              // <-- CAMBIO: ahora en segundos
  distanceKm?: number | null;
  rpe: number;
  fcMedia?: number | null;
  wattsMedios?: number | null;
  notas?: string | null;
};

type StationEntry = {
  id: string;
  workoutId: string;
  station: HyroxStation;
  pesoKg?: number | null;
  series?: number | null;
  reps?: number | null;
  tiempoParcialSeg?: number | null;
  distanceM?: number | null;
  notas?: string | null;
};

// API
const API = "http://localhost:8080/api/workouts";
const API_ST = "http://localhost:8080/api";

// Utils
function fmtDate(iso: string) {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
}

function fmtMmSs(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function calcPaceMinPerKm(durationSec: number, distanceKm?: number | null) {
  if (!distanceKm || distanceKm <= 0) return null;
  const paceMin = (durationSec / 60) / distanceKm; // min/km
  const whole = Math.floor(paceMin);
  const sec = Math.round((paceMin - whole) * 60);
  return `${whole}:${sec.toString().padStart(2, "0")} min/km`;
}

// App
export default function App() {
  const [items, setItems] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHyroxId, setSelectedHyroxId] = useState<string>("");

  const hyroxWorkouts = useMemo(() => items.filter((w) => w.type === "HYROX"), [items]);

  // Form principal: guardo minutos y segundos por separado y convierto a durationSec al enviar
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: "RUN" as WorkoutType,
    durationMin: 30,     // solo en UI
    durationSeg: 0,      // solo en UI
    rpe: 6,
    distanceKm: "",
    fcMedia: "",
    wattsMedios: "",
    notas: "",
  });

  const [stForm, setStForm] = useState({
    station: "SKI_ERG" as HyroxStation,
    pesoKg: "",
    series: "",
    reps: "",
    tiempoParcialSeg: "",
    distanceM: "",
    notas: "",
  });

  const [stations, setStations] = useState<StationEntry[]>([]);

  // Carga workouts
  const load = async () => {
    setLoading(true);
    const res = await fetch(API);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  async function loadStations() {
    if (!selectedHyroxId) {
      setStations([]);
      return;
    }
    const res = await fetch(`${API_ST}/workouts/${selectedHyroxId}/stations`);
    const data = await res.json();
    setStations(data);
  }
  useEffect(() => { loadStations(); }, [selectedHyroxId]);

  // Crear workout -> envia durationSec
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const min = Number.isFinite(form.durationMin) ? form.durationMin : 0;
    const seg = Number.isFinite(form.durationSeg) ? form.durationSeg : 0;
    const safeSeg = Math.max(0, Math.min(59, seg)); // clamp 0..59
    const durationSec = min * 60 + safeSeg;

    const payload = {
      date: form.date,
      type: form.type,
      durationSec, // <-- CAMBIO: ahora enviamos segundos
      rpe: Number(form.rpe),
      distanceKm: form.distanceKm === "" ? null : Number(form.distanceKm),
      fcMedia: form.fcMedia === "" ? null : Number(form.fcMedia),
      wattsMedios: form.wattsMedios === "" ? null : Number(form.wattsMedios),
      notas: form.notas?.trim() || null,
    };

    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert("Error al crear el entreno");
      return;
    }
    setForm({ ...form, notas: "" });
    await load();
  };

  // Estaciones
  async function createStation(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedHyroxId) {
      alert("Selecciona un workout HYROX");
      return;
    }
    const payload = {
      station: stForm.station,
      pesoKg: stForm.pesoKg === "" ? null : Number(stForm.pesoKg),
      series: stForm.series === "" ? null : Number(stForm.series),
      reps: stForm.reps === "" ? null : Number(stForm.reps),
      tiempoParcialSeg: stForm.tiempoParcialSeg === "" ? null : Number(stForm.tiempoParcialSeg),
      distanceM: stForm.distanceM === "" ? null : Number(stForm.distanceM),
      notas: stForm.notas?.trim() || null,
    };
    const res = await fetch(`${API_ST}/workouts/${selectedHyroxId}/stations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert("Error al crear estación");
      return;
    }
    setStForm({ ...stForm, pesoKg: "", series: "", reps: "", tiempoParcialSeg: "", distanceM: "", notas: "" });
    await loadStations();
  }

  async function deleteStation(id: string) {
    if (!confirm("¿Eliminar esta estación?")) return;
    const res = await fetch(`${API_ST}/stations/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Error al eliminar");
      return;
    }
    await loadStations();
  }

  async function editStation(id: string) {
    const e = stations.find((s) => s.id === id);
    if (!e) return;

    const nuevoTiempo = prompt("Nuevo tiempo parcial (segundos, vacío=sin cambio):", e.tiempoParcialSeg?.toString() ?? "");
    const nuevoPeso = prompt("Nuevo peso (kg, vacío=sin cambio):", e.pesoKg?.toString() ?? "");
    const nuevaDist = prompt("Nueva distancia (m, vacío=sin cambio):", e.distanceM?.toString() ?? "");

    const payload: any = {};
    if (nuevoTiempo !== null && nuevoTiempo !== "") payload.tiempoParcialSeg = Number(nuevoTiempo);
    if (nuevoPeso !== null && nuevoPeso !== "") payload.pesoKg = Number(nuevoPeso);
    if (nuevaDist !== null && nuevaDist !== "") payload.distanceM = Number(nuevaDist);
    if (Object.keys(payload).length === 0) return;

    const res = await fetch(`${API_ST}/stations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Error al editar");
      return;
    }
    await loadStations();
  }

  // UI
  return (
    <div className="min-h-dvh bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200/80 backdrop-blur bg-white/70 dark:bg-zinc-950/70 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            Hyron <span className="opacity-70">—</span>{" "}
            <span className="text-indigo-600">Registrar entreno</span>
          </h1>
          <div className="text-xs text-zinc-500">MVP</div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-8">
        {/* Formulario */}
        <Card>
          <form onSubmit={submit} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Nuevo entreno</h3>
              <Button type="submit">Guardar</Button>
            </div>

            {/* Datos básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </label>

              <label className="flex flex-col gap-1">
                <Label>Tipo</Label>
                <Select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as WorkoutType })}
                >
                  <option>RUN</option>
                  <option>BIKE</option>
                  <option>SWIM</option>
                  <option>HYROX</option>
                  <option>GYM</option>
                </Select>
              </label>
            </div>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex flex-col gap-1">
                <Label>Duración — Minutos</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.durationMin}
                  onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })}
                  required
                />
              </label>

              <label className="flex flex-col gap-1">
                <Label>Duración — Segundos</Label>
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={form.durationSeg}
                  onChange={(e) => setForm({ ...form, durationSeg: Number(e.target.value) })}
                  required
                />
              </label>

              <label className="flex flex-col gap-1">
                <Label>RPE (1–10)</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={form.rpe}
                  onChange={(e) => setForm({ ...form, rpe: Number(e.target.value) })}
                  required
                />
              </label>

              <label className="md:col-span-3 flex flex-col gap-1">
                <Label>Distancia (km, opc.)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.distanceKm}
                  onChange={(e) => setForm({ ...form, distanceKm: e.target.value })}
                />
              </label>
            </div>

            {/* Biométricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <Label>FC media</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.fcMedia}
                  onChange={(e) => setForm({ ...form, fcMedia: e.target.value })}
                />
              </label>

              <label className="flex flex-col gap-1">
                <Label>Watts medios</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.wattsMedios}
                  onChange={(e) => setForm({ ...form, wattsMedios: e.target.value })}
                />
              </label>
            </div>

            {/* Notas */}
            <div className="grid grid-cols-1 gap-4">
              <label className="flex flex-col gap-1">
                <Label>Notas (opc., máx 500)</Label>
                <Input
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  maxLength={500}
                  placeholder="Sensaciones, zonas, incidencias…"
                />
              </label>
            </div>
          </form>
        </Card>

        {/* Listado */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Entrenos</h2>
          {loading ? (
            <Card className="text-sm text-zinc-600 dark:text-zinc-400">Cargando…</Card>
          ) : items.length === 0 ? (
            <Card className="text-sm text-zinc-600 dark:text-zinc-400">
              Aún no hay entrenos. Crea el primero arriba.
            </Card>
          ) : (
            <div className="grid gap-3">
              {items.map((w) => {
                const pace = w.type === "RUN" ? calcPaceMinPerKm(w.durationSec, w.distanceKm) : null;
                return (
                  <Card key={w.id} className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <div className="text-sm text-zinc-500">{fmtDate(w.date)}</div>
                        <div className="text-base font-medium">
                          {w.type} · {fmtMmSs(w.durationSec)}
                          {w.distanceKm ? ` · ${w.distanceKm} km` : ""}
                          {pace ? ` · ${pace}` : ""}
                        </div>
                        <div className="text-sm text-zinc-500">
                          RPE {w.rpe}
                          {w.fcMedia != null ? ` · FC ${w.fcMedia}` : ""}
                          {w.wattsMedios != null ? ` · ${w.wattsMedios} W` : ""}
                        </div>
                        {w.notas && <div className="text-sm mt-1">{w.notas}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs">
                          {w.type}
                        </span>
                        <span className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-1 text-xs dark:bg-indigo-900/30 dark:text-indigo-300">
                          RPE {w.rpe}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <StatsPanel />

        {/* Estaciones Hyrox */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Estaciones Hyrox</h2>
          <Card>
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-end mb-4">
              <label className="flex flex-col gap-1 w-full md:w-96">
                <Label>Workout HYROX</Label>
                <Select
                  value={selectedHyroxId}
                  onChange={(e) => setSelectedHyroxId(e.target.value)}
                >
                  <option value="">— elige workout HYROX —</option>
                  {hyroxWorkouts.map((w) => (
                    <option key={w.id} value={w.id}>
                      {fmtDate(w.date)} · {fmtMmSs(w.durationSec)} · RPE {w.rpe}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <form onSubmit={createStation} className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
              <label className="flex flex-col gap-1">
                <Label>Estación</Label>
                <Select
                  value={stForm.station}
                  onChange={(e) => setStForm({ ...stForm, station: e.target.value as any })}
                  disabled={!selectedHyroxId}
                >
                  <option>SKI_ERG</option>
                  <option>SLED_PUSH</option>
                  <option>SLED_PULL</option>
                  <option>BURPEE_BROAD_JUMPS</option>
                  <option>ROW</option>
                  <option>FARMERS_CARRY</option>
                  <option>SANDBAG_LUNGES</option>
                  <option>WALL_BALLS</option>
                </Select>
              </label>

              <label className="flex flex-col gap-1">
                <Label>Peso (kg)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={stForm.pesoKg}
                  onChange={(e) => setStForm({ ...stForm, pesoKg: e.target.value })}
                  disabled={!selectedHyroxId}
                />
              </label>

              <label className="flex flex-col gap-1">
                <Label>Series</Label>
                <Input
                  type="number"
                  min={0}
                  value={stForm.series}
                  onChange={(e) => setStForm({ ...stForm, series: e.target.value })}
                  disabled={!selectedHyroxId}
                />
              </label>

              <label className="flex flex-col gap-1">
                <Label>Reps</Label>
                <Input
                  type="number"
                  min={0}
                  value={stForm.reps}
                  onChange={(e) => setStForm({ ...stForm, reps: e.target.value })}
                  disabled={!selectedHyroxId}
                />
              </label>

              <label className="flex flex-col gap-1">
                <Label>Tiempo (seg)</Label>
                <Input
                  type="number"
                  min={0}
                  value={stForm.tiempoParcialSeg}
                  onChange={(e) => setStForm({ ...stForm, tiempoParcialSeg: e.target.value })}
                  disabled={!selectedHyroxId}
                />
              </label>

              <label className="flex flex-col gap-1">
                <Label>Distancia (m)</Label>
                <Input
                  type="number"
                  min={0}
                  value={stForm.distanceM}
                  onChange={(e) => setStForm({ ...stForm, distanceM: e.target.value })}
                  disabled={!selectedHyroxId}
                />
              </label>

              <label className="md:col-span-2 flex flex-col gap-1">
                <Label>Notas</Label>
                <Input
                  value={stForm.notas}
                  onChange={(e) => setStForm({ ...stForm, notas: e.target.value })}
                  disabled={!selectedHyroxId}
                />
              </label>

              <Button className="md:col-span-1" disabled={!selectedHyroxId}>
                Añadir
              </Button>
            </form>
          </Card>

          {/* Lista de estaciones */}
          {selectedHyroxId && stations.length === 0 && (
            <Card className="text-sm text-zinc-600 dark:text-zinc-400">
              No hay estaciones registradas aún para este workout.
            </Card>
          )}

          <div className="grid gap-3">
            {stations.map((s) => (
              <Card key={s.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="font-medium">
                    {s.station}
                    {s.pesoKg != null ? ` · ${s.pesoKg} kg` : ""}
                    {s.series != null ? ` · ${s.series}x` : ""}
                    {s.reps != null ? ` · ${s.reps} reps` : ""}
                    {s.tiempoParcialSeg != null ? ` · ${s.tiempoParcialSeg}s` : ""}
                    {s.distanceM != null ? ` · ${s.distanceM} m` : ""}
                  </div>
                  <div className="text-sm text-zinc-500">{s.notas}</div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => editStation(s.id)}>Editar</Button>
                    <Button type="button" variant="outline" onClick={() => deleteStation(s.id)}>Eliminar</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-4 py-8 text-xs text-zinc-500">
        Hyron · MVP · Hecho con React + Tailwind
      </footer>
    </div>
  );
}
