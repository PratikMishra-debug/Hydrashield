import { Droplets, Menu, X } from "lucide-react";
import { useState } from "react";

const LINKS = [
  { id: "monitor", label: "Monitor" },
  { id: "map", label: "Map" },
  { id: "analytics", label: "Analytics" },
  { id: "report", label: "Report" },
  { id: "alerts", label: "Alerts" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  const scrollTo = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-depth-700/60 bg-depth-900/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-river-500/15 text-river-400">
            <Droplets size={20} strokeWidth={2.2} />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            Hydra<span className="text-river-400">Shield</span>
          </span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              className="font-mono text-xs uppercase tracking-widest text-steel transition-colors hover:text-river-400"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <span className="flex items-center gap-1.5 rounded-full border border-depth-600 px-3 py-1 font-mono text-[11px] text-alert-green">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-alert-green" />
            Live data
          </span>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-depth-700/60 px-6 py-3 md:hidden">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              className="py-2 text-left font-mono text-xs uppercase tracking-widest text-steel hover:text-river-400"
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
