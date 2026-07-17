import { useState } from "react";
import { Bell, Mail, MessageSquare, Radio, ShieldAlert } from "lucide-react";

const ALERTS = [
  { id: 1, severity: "High", title: "Flash flood warning — Riverside district", body: "Water level rising 8cm/hr. Evacuation advised for low-lying blocks.", time: "12 min ago" },
  { id: 2, severity: "Medium", title: "Heavy rainfall advisory", body: "60mm+ expected in next 6 hours across the eastern basin.", time: "1h ago" },
  { id: 3, severity: "Low", title: "Drainage maintenance scheduled", body: "Sector 4 canal maintenance may cause minor waterlogging.", time: "6h ago" },
];

const SEVERITY_STYLE = {
  High: "border-alert-red/40 bg-alert-red/10 text-alert-red",
  Medium: "border-alert-amber/40 bg-alert-amber/10 text-alert-amber",
  Low: "border-alert-green/40 bg-alert-green/10 text-alert-green",
};

export default function AlertsSection() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <section id="alerts" className="mx-auto max-w-7xl px-6 py-16">
      <p className="eyebrow mb-3">Emergency broadcast</p>
      <h2 className="mb-8 font-display text-3xl font-semibold tracking-tight">Live alerts</h2>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-3">
          {ALERTS.map((a) => (
            <div key={a.id} className={`rounded-xl border p-4 ${SEVERITY_STYLE[a.severity]}`}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest">
                  <ShieldAlert size={13} /> {a.severity} severity
                </span>
                <span className="font-mono text-[11px] text-steel">{a.time}</span>
              </div>
              <p className="mt-2 font-display text-sm font-semibold text-mist">{a.title}</p>
              <p className="mt-1 text-sm text-mist/80">{a.body}</p>
            </div>
          ))}
          <p className="text-xs text-steel">
            Demo feed shown above. Phase 7 connects this to real SMS/push infrastructure (e.g.
            Twilio, Firebase Cloud Messaging) — you'll need accounts/API keys for those providers
            when you're ready to go live.
          </p>
        </div>

        <div className="panel flex flex-col gap-5 p-6">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-river-400" />
            <p className="font-display font-semibold">Get notified</p>
          </div>
          <p className="text-sm text-steel">
            Subscribe to receive alerts for your saved locations across email, SMS, and push.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-depth-600 bg-depth-900 px-3 py-2.5 text-sm text-mist placeholder:text-steel focus:border-river-400 focus:outline-none"
            />
            <button type="submit" className="btn-primary">
              Subscribe
            </button>
            {subscribed && (
              <p className="text-xs text-alert-green">You're on the list — alerts will arrive once channels are connected.</p>
            )}
          </form>
          <div className="mt-2 flex flex-col gap-2 border-t border-depth-700 pt-4 text-xs text-steel">
            <span className="flex items-center gap-2"><Mail size={13} /> Email digests</span>
            <span className="flex items-center gap-2"><MessageSquare size={13} /> SMS for High severity</span>
            <span className="flex items-center gap-2"><Radio size={13} /> Emergency broadcast override</span>
          </div>
        </div>
      </div>
    </section>
  );
}
