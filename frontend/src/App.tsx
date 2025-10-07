import { useEffect, useMemo, useState } from "react";
import StatsPanel from "./components/StatsPanel";

/* =====================================================
 *  Pequeño kit de UI inline (sin dependencias externas)
 *  - Mantiene todo en este archivo para que sea fácil
 *  - Puedes extraerlos a ./components/ui más adelante
 * ===================================================== */

type DivProps = React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean };
const Card = ({ className = "", ...props }: DivProps) => (
  <div
    className={
      "rounded-2xl border border-zinc-200/70 bg-white/80 backdrop-blur p-4 shadow-sm " +
      "dark:bg-zinc-900/70 dark:border-zinc-800 " +
      className
    }
    {...props}
  />
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
    {children}
  </h2>
);

const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={"text-sm font-medium text-zinc-700 dark:text-zinc-300 " + className}>{children}</span>
);

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
const Input = ({ className = "", ...props }: InputProps) => (
  <input
    className={
      "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm " +
      "placeholder:text-zinc-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 " +
      "dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 " +
      className
    }
    {...props}
  />
);

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;
const Select = ({ className = "", children, ...props }: SelectProps) => (
  <select
    className={
      "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm shadow-sm " +
      "focus:outline-none focus:ring-2 focus:ring-indigo-500/60 " +
      "dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 " +
      className
    }
    {...props}
  >
    {children}
  </select>
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" };
const Button = ({ className = "", variant = "primary", ...props }: ButtonProps) => {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg px-4 h-10 text-sm font-medium transition";
  const variants: Record<string, string> = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500/60 disabled:opacity-50",
    outline:
      "border border-zinc-300 hover:bg-zinc-50 text-zinc-900 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900",
    ghost: "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-zinc-100",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
};

/* =========================
 *  Tipos del dominio
 * ========================= */

type WorkoutType = "RUN" | "BIKE" | "SWIM" | "HYROX" | "GYM";

type HyroxStation =
  | "SKI_ERG" | "SLED_PUSH" | "SLED_PULL" | "BURPEE_BROAD_JUMPS"
  | "ROW" | "FARMERS_CARRY" | "SANDBAG_LUNGES" | "WALL_BALLS";

type Workout = {
  id: string;
  date: string;
  type: WorkoutType;
  durationMin: number;
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

/* =========================
 *  Constantes API
 * ========================= */
const API = "http://localhost:8080/api/workouts";
const API_ST = "http://localhost:8080/api"; // base para estaciones

/* =========================
 *  Utils simples
 * ========================= */
function fmtDate(iso: string) {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
}

function calcPaceMinPerKm(durationMin: number, distanceKm?: number | null) {
  if (!distanceKm || distanceKm <= 0) return null;
  const pace = durationMin / distanceKm; // min/km
  const whole = Math.floor(pace);
  const sec = Math.round((pace - whole) * 60);
  return `${whole}:${sec.toString().padStart(2, "0")} min/km`;
}

export default function App() {
  const [items, setItems] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedHyroxId, setSelectedHyroxId] = useState<string>("");
  const hyroxWorkouts = useMemo(() => items.filter((w) => w.type === "HYROX"), [items]);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: "RUN" as WorkoutType,
    durationMin: 30,
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

  const load = async () => {
    setLoading(true);
    const res = await fetch(API);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  async function loadStations() {
    if (!selectedHyroxId) {
      setStations([]);
      return;
    }
    const res = await fetch(`${API_ST}/workouts/${selectedHyroxId}/stations`);
    const data = await res.json();
    setStations(data);
  }

  useEffect(() => {
    loadStations();
  }, [selectedHyroxId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      date: form.date,
      type: form.type,
      durationMin: Number(form.durationMin),
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

  /* =========================
   *  UI
   * ========================= */
  return (
    <div className="min-h-dvh bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200/80 backdrop-blur bg-white/70 dark:bg-zinc-950/70 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Hyron <span className="opacity-70">—</span> <span className="text-indigo-600">Registrar entreno</span></h1>
          <div className="text-xs text-zinc-500">MVP</div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-8">
        {/* ====== Formulario ====== */}
        <Card>
          <form onSubmit={submit} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Nuevo entreno</h3>
              <Button type="submit">Guardar</Button>
            </div>

            {/* Bloque 1: Datos básicos */}
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

            {/* Bloque 2: Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <Label>Duración (min)</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.durationMin}
                  onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })}
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

              <label className="md:col-span-2 flex flex-col gap-1">
                <Label>Distancia (km, opc.)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.distanceKm}
                  onChange={(e) => setForm({ ...form, distanceKm: e.target.value })}
                />
              </label>
            </div>

            {/* Bloque 3: Biométricas */}
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

            {/* Bloque 4: Notas */}
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

        {/* ====== Listado entrenos ====== */}
        <section className="space-y-3">
          <SectionTitle>Entrenos</SectionTitle>
          {loading ? (
            <Card className="text-sm text-zinc-600 dark:text-zinc-400">Cargando…</Card>
          ) : items.length === 0 ? (
            <Card className="text-sm text-zinc-600 dark:text-zinc-400">
              Aún no hay entrenos. Crea el primero arriba.
            </Card>
          ) : (
            <div className="grid gap-3">
              {items.map((w) => {
                const pace = w.type === "RUN" ? calcPaceMinPerKm(w.durationMin, w.distanceKm) : null;
                return (
                  <Card key={w.id} className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <div className="text-sm text-zinc-500">{fmtDate(w.date)}</div>
                        <div className="text-base font-medium">
                          {w.type} · {w.durationMin} min
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
                        <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs">{w.type}</span>
                        <span className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-1 text-xs dark:bg-indigo-900/30 dark:text-indigo-300">RPE {w.rpe}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* ====== Stats ====== */}
        <StatsPanel />

        {/* ====== Estaciones Hyrox ====== */}
        <section className="space-y-4">
          <SectionTitle>Estaciones Hyrox</SectionTitle>

          <Card>
            {/* Selector de workout HYROX */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-end mb-4">
              <label className="flex flex-col gap-1 w-full md:w-96">
                <Label>Workout HYROX</Label>
                <Select value={selectedHyroxId} onChange={(e) => setSelectedHyroxId(e.target.value)}>
                  <option value="">— elige workout HYROX —</option>
                  {hyroxWorkouts.map((w) => (
                    <option key={w.id} value={w.id}>
                      {fmtDate(w.date)} · {w.durationMin} min · RPE {w.rpe}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            {/* Form de creación de estación */}
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
