const PHASES = [
  { n: 1, name: "Weather Monitoring", status: "Live" },
  { n: 2, name: "Interactive Maps", status: "Live (demo zones)" },
  { n: 3, name: "Authentication (JWT + roles)", status: "Backend scaffolded" },
  { n: 4, name: "Personal Dashboard", status: "Backend scaffolded" },
  { n: 5, name: "AI Flood Prediction", status: "Baseline model live" },
  { n: 6, name: "Data Visualization", status: "Live" },
  { n: 7, name: "Emergency Alerts", status: "UI live, integrations pending" },
  { n: 8, name: "Incident Reporting", status: "Live (local storage)" },
  { n: 9, name: "Admin Panel", status: "Planned" },
  { n: 10, name: "Cloud Deployment", status: "Planned" },
];

const STATUS_COLOR = {
  Live: "text-alert-green",
};

export default function Footer() {
  return (
    <footer className="border-t border-depth-700/60 bg-depth-950/60">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="font-display text-lg font-semibold">
              Hydra<span className="text-river-400">Shield</span>
            </p>
            <p className="mt-3 max-w-xs text-sm text-steel">
              An AI-assisted disaster management platform — weather, prediction, mapping, and
              response, in one system.
            </p>
            <p className="mt-6 stat-mono">Stack</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {["React", "Vite", "Tailwind", "Three.js", "Spring Boot", "PostgreSQL", "Open-Meteo", "Leaflet"].map((t) => (
                <span key={t} className="rounded-full border border-depth-600 px-2.5 py-1 font-mono text-[10px] text-steel">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="stat-mono mb-4">Build roadmap</p>
            <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
              {PHASES.map((p) => (
                <div key={p.n} className="flex items-center justify-between border-b border-depth-800 py-2 text-xs">
                  <span className="text-mist">
                    <span className="text-steel">Phase {p.n} · </span>
                    {p.name}
                  </span>
                  <span className={`font-mono ${STATUS_COLOR[p.status] || "text-alert-amber"}`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-steel">
          Built as a working prototype. Weather data via Open-Meteo — free, no API key required.
        </p>
      </div>
    </footer>
  );
}
