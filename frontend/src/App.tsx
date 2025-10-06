import { useEffect, useState } from "react";

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

const API = "http://localhost:8080/api/workouts";
const API_ST = "http://localhost:8080/api"; // base para estaciones

export default function App() {
  const [items, setItems] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedHyroxId, setSelectedHyroxId] = useState<string>("");
  const hyroxWorkouts = items.filter(w => w.type === "HYROX");

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

  useEffect(() => { load(); }, []);

  async function loadStations() {
    if (!selectedHyroxId) { setStations([]); return; }
    const res = await fetch(`${API_ST}/workouts/${selectedHyroxId}/stations`);
    const data = await res.json();
    setStations(data);
  }

  useEffect(() => { loadStations(); }, [selectedHyroxId]);

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
    if (!selectedHyroxId) { alert("Selecciona un workout HYROX"); return; }
    const payload = {
      station: stForm.station,
      pesoKg: stForm.pesoKg === "" ? null : Number(stForm.pesoKg),
      series: stForm.series === "" ? null : Number(stForm.series),
      reps: stForm.reps === "" ? null : Number(stForm.reps),
      tiempoParcialSeg: stForm.tiempoParcialSeg === "" ? null : Number(stForm.tiempoParcialSeg),
      distanceM: stForm.distanceM === "" ? null : Number(stForm.distanceM),
      notas: stForm.notas?.trim() || null
    };
    const res = await fetch(`${API_ST}/workouts/${selectedHyroxId}/stations`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) { alert("Error al crear estación"); return; }
    setStForm({ ...stForm, pesoKg: "", series: "", reps: "", tiempoParcialSeg: "", distanceM: "", notas: "" });
    await loadStations();
  }

  async function deleteStation(id: string) {
    if (!confirm("¿Eliminar esta estación?")) return;
    const res = await fetch(`${API_ST}/stations/${id}`, { method: "DELETE" });
    if (!res.ok) { alert("Error al eliminar"); return; }
    await loadStations();
  }

  async function editStation(id: string) {
    const e = stations.find(s => s.id === id);
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
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) { alert("Error al editar"); return; }
    await loadStations();
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Hyron — Registrar entreno</h1>

      <form onSubmit={submit} className="space-y-6">
        {/* Bloque 1: Datos básicos */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Datos básicos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm">Fecha</span>
              <input
                type="date"
                className="border rounded p-2"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm">Tipo</span>
              <select
                className="border rounded p-2"
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as WorkoutType })
                }
              >
                <option>RUN</option>
                <option>BIKE</option>
                <option>SWIM</option>
                <option>HYROX</option>
                <option>GYM</option>
              </select>
            </label>
          </div>
        </div>

        {/* Bloque 2: Métricas principales */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Métricas principales</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm">Duración (min)</span>
              <input
                type="number"
                min={1}
                className="border rounded p-2"
                value={form.durationMin}
                onChange={(e) =>
                  setForm({ ...form, durationMin: Number(e.target.value) })
                }
                required
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm">RPE (1–10)</span>
              <input
                type="number"
                min={1}
                max={10}
                className="border rounded p-2"
                value={form.rpe}
                onChange={(e) => setForm({ ...form, rpe: Number(e.target.value) })}
                required
              />
            </label>

            <label className="sm:col-span-2 flex flex-col gap-1">
              <span className="text-sm">Distancia (km, opc.)</span>
              <input
                type="number"
                step="0.01"
                className="border rounded p-2"
                value={form.distanceKm}
                onChange={(e) =>
                  setForm({ ...form, distanceKm: e.target.value })
                }
              />
            </label>
          </div>
        </div>

        {/* Bloque 3: Biométricas (opcionales) */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Biométricas (opc.)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm">FC media</span>
              <input
                type="number"
                min={0}
                className="border rounded p-2"
                value={form.fcMedia}
                onChange={(e) => setForm({ ...form, fcMedia: e.target.value })}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm">Watts medios</span>
              <input
                type="number"
                min={0}
                className="border rounded p-2"
                value={form.wattsMedios}
                onChange={(e) =>
                  setForm({ ...form, wattsMedios: e.target.value })
                }
              />
            </label>
          </div>
        </div>

        {/* Bloque 4: Notas y acción */}
        <div className="grid grid-cols-1 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm">Notas (opc., máx 500)</span>
            <input
              className="border rounded p-2"
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              maxLength={500}
            />
          </label>

          <div className="flex justify-end">
            <button className="bg-black text-white rounded px-4 py-2">
              Guardar
            </button>
          </div>
        </div>
      </form>


      <section>
        <h2 className="text-xl font-semibold mb-2">Entrenos</h2>
        {loading ? (
          <p>Cargando…</p>
        ) : items.length === 0 ? (
          <p className="text-sm opacity-80">Aún no hay entrenos. Crea el primero arriba.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((w) => (
              <li key={w.id} className="border rounded p-3">
                <div className="font-medium">
                  {w.date} · {w.type} · {w.durationMin} min
                </div>
                <div className="text-sm opacity-80">
                  RPE {w.rpe}
                  {w.distanceKm ? ` · ${w.distanceKm} km` : ""}
                  {w.fcMedia != null ? ` · FC ${w.fcMedia}` : ""}
                  {w.wattsMedios != null ? ` · ${w.wattsMedios} W` : ""}
                </div>
                {w.notas && <div className="text-sm mt-1">{w.notas}</div>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* === Estaciones Hyrox === */}
      <section className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-2">Estaciones Hyrox</h2>

        {/* Selector de workout HYROX */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end mb-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm">Workout HYROX</span>
            <select
              className="border rounded p-2 min-w-[260px]"
              value={selectedHyroxId}
              onChange={(e) => setSelectedHyroxId(e.target.value)}
            >
              <option value="">— elige workout HYROX —</option>
              {hyroxWorkouts.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.date} · {w.durationMin} min · RPE {w.rpe}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Form de creación de estación */}
        <form
          onSubmit={createStation}
          className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end mb-6"
        >
          <label className="flex flex-col gap-1">
            <span className="text-sm">Estación</span>
            <select
              className="border rounded p-2"
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
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Peso (kg)</span>
            <input
              className="border rounded p-2"
              type="number"
              step="0.5"
              value={stForm.pesoKg}
              onChange={(e) => setStForm({ ...stForm, pesoKg: e.target.value })}
              disabled={!selectedHyroxId}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Series</span>
            <input
              className="border rounded p-2"
              type="number"
              min={0}
              value={stForm.series}
              onChange={(e) => setStForm({ ...stForm, series: e.target.value })}
              disabled={!selectedHyroxId}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Reps</span>
            <input
              className="border rounded p-2"
              type="number"
              min={0}
              value={stForm.reps}
              onChange={(e) => setStForm({ ...stForm, reps: e.target.value })}
              disabled={!selectedHyroxId}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Tiempo (seg)</span>
            <input
              className="border rounded p-2"
              type="number"
              min={0}
              value={stForm.tiempoParcialSeg}
              onChange={(e) =>
                setStForm({ ...stForm, tiempoParcialSeg: e.target.value })
              }
              disabled={!selectedHyroxId}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Distancia (m)</span>
            <input
              className="border rounded p-2"
              type="number"
              min={0}
              value={stForm.distanceM}
              onChange={(e) => setStForm({ ...stForm, distanceM: e.target.value })}
              disabled={!selectedHyroxId}
            />
          </label>

          <label className="md:col-span-2 flex flex-col gap-1">
            <span className="text-sm">Notas</span>
            <input
              className="border rounded p-2"
              value={stForm.notas}
              onChange={(e) => setStForm({ ...stForm, notas: e.target.value })}
              disabled={!selectedHyroxId}
            />
          </label>

          <button
            className="bg-black text-white rounded px-4 py-2 md:col-span-1 disabled:opacity-50"
            disabled={!selectedHyroxId}
          >
            Añadir
          </button>
        </form>

        {/* Lista de estaciones */}
        {selectedHyroxId && stations.length === 0 && (
          <p className="text-sm opacity-80">
            No hay estaciones registradas aún para este workout.
          </p>
        )}

        <ul className="space-y-2">
          {stations.map((s) => (
            <li
              key={s.id}
              className="border rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
            >
              <div className="font-medium">
                {s.station}
                {s.pesoKg != null ? ` · ${s.pesoKg} kg` : ""}
                {s.series != null ? ` · ${s.series}x` : ""}
                {s.reps != null ? ` · ${s.reps} reps` : ""}
                {s.tiempoParcialSeg != null ? ` · ${s.tiempoParcialSeg}s` : ""}
                {s.distanceM != null ? ` · ${s.distanceM} m` : ""}
              </div>
              <div className="text-sm opacity-80">{s.notas}</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => editStation(s.id)}
                  className="px-3 py-1 border rounded"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => deleteStation(s.id)}
                  className="px-3 py-1 border rounded"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
