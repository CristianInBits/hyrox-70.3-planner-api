import { useEffect, useState } from "react";

type WorkoutType = "RUN" | "BIKE" | "SWIM" | "HYROX" | "GYM";

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

const API = "http://localhost:8080/api/workouts";

export default function App() {
  const [items, setItems] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);

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

  const load = async () => {
    setLoading(true);
    const res = await fetch(API);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

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
        {loading ? <p>Cargando…</p> : (
          <ul className="space-y-2">
            {items.map(w => (
              <li key={w.id} className="border rounded p-3">
                <div className="font-medium">{w.date} · {w.type} · {w.durationMin} min</div>
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
    </div>
  );
}
