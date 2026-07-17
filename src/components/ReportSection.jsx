import { useEffect, useState } from "react";
import { MapPin, Image as ImageIcon, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const TYPES = ["Waterlogging", "Blocked road", "Damaged infrastructure", "Rising water level"];
const STORAGE_KEY = "hydrashield_incidents";

function loadIncidents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || seedIncidents();
  } catch {
    return seedIncidents();
  }
}

function seedIncidents() {
  return [
    { id: 1, type: "Waterlogging", location: "MG Road underpass", description: "Ankle-deep water blocking two lanes since morning.", status: "Verified", time: "2h ago" },
    { id: 2, type: "Blocked road", location: "Riverside Colony, Sector 9", description: "Fallen tree and debris after overnight storm.", status: "Pending", time: "5h ago" },
    { id: 3, type: "Rising water level", location: "Old Bridge, East Canal", description: "Water level up ~40cm since yesterday.", status: "Verified", time: "1d ago" },
  ];
}

export default function ReportSection() {
  const [incidents, setIncidents] = useState([]);
  const [form, setForm] = useState({ type: TYPES[0], location: "", description: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setIncidents(loadIncidents());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.location.trim() || !form.description.trim()) return;
    const newIncident = {
      id: Date.now(),
      type: form.type,
      location: form.location,
      description: form.description,
      status: "Pending",
      time: "Just now",
    };
    const updated = [newIncident, ...incidents];
    setIncidents(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setForm({ type: TYPES[0], location: "", description: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  return (
    <section id="report" className="mx-auto max-w-7xl px-6 py-16">
      <p className="eyebrow mb-3">Community reporting</p>
      <h2 className="mb-8 font-display text-3xl font-semibold tracking-tight">
        Report a flood incident
      </h2>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.1fr]">
        <form onSubmit={handleSubmit} className="panel flex flex-col gap-4 p-6">
          <div>
            <label className="stat-mono mb-2 block">Incident type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-lg border border-depth-600 bg-depth-900 px-3 py-2.5 text-sm text-mist focus:border-river-400 focus:outline-none"
            >
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="stat-mono mb-2 block">Location</label>
            <div className="flex items-center gap-2 rounded-lg border border-depth-600 bg-depth-900 px-3 py-2.5 focus-within:border-river-400">
              <MapPin size={15} className="text-steel" />
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Street, landmark, or coordinates"
                className="w-full bg-transparent text-sm text-mist placeholder:text-steel focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="stat-mono mb-2 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="What are you seeing right now?"
              className="w-full rounded-lg border border-depth-600 bg-depth-900 px-3 py-2.5 text-sm text-mist placeholder:text-steel focus:border-river-400 focus:outline-none"
            />
          </div>

          <button type="button" className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-depth-600 py-3 text-xs text-steel hover:border-river-400 hover:text-river-400">
            <ImageIcon size={15} /> Attach photo (coming with cloud storage integration)
          </button>

          <button type="submit" className="btn-primary mt-1">
            Submit report
          </button>
          {submitted && (
            <p className="flex items-center gap-1.5 text-xs text-alert-green">
              <CheckCircle2 size={14} /> Report submitted — pending authority verification.
            </p>
          )}
        </form>

        <div className="flex flex-col gap-3">
          {incidents.map((inc) => (
            <div key={inc.id} className="panel flex items-start gap-3 p-4">
              <div className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${inc.status === "Verified" ? "bg-alert-green/15 text-alert-green" : "bg-alert-amber/15 text-alert-amber"}`}>
                {inc.status === "Verified" ? <CheckCircle2 size={16} /> : <Clock size={16} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-semibold">{inc.type}</span>
                  <span className="stat-mono">{inc.time}</span>
                </div>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-steel">
                  <MapPin size={11} /> {inc.location}
                </p>
                <p className="mt-1.5 text-sm text-mist/90">{inc.description}</p>
                <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide ${inc.status === "Verified" ? "bg-alert-green/15 text-alert-green" : "bg-alert-amber/15 text-alert-amber"}`}>
                  {inc.status}
                </span>
              </div>
            </div>
          ))}
          {incidents.length === 0 && (
            <div className="panel flex flex-col items-center gap-2 p-10 text-center text-steel">
              <AlertTriangle size={20} />
              <p className="text-sm">No reports yet. Be the first to report conditions in your area.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
