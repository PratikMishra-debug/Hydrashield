import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { Sigma } from "lucide-react";

const tooltipStyle = {
  background: "#122B3E",
  border: "1px solid #254D68",
  borderRadius: 8,
  fontSize: 12,
  color: "#EAF4F4",
};

export default function ModelExplainer({ risk }) {
  if (!risk) return null;

  const radarData = risk.factors.map((f) => ({
    factor: f.label.split(" ")[0],
    score: Math.round(f.score),
    fullLabel: f.label,
  }));

  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-river-500/15 text-river-400">
          <Sigma size={18} />
        </div>
        <div>
          <p className="eyebrow">Model internals</p>
          <h2 className="font-display text-2xl font-semibold tracking-tight">How the score is computed</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1fr]">
        <div className="panel p-6">
          <p className="stat-mono mb-4">Live factor vector</p>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} outerRadius="75%">
              <PolarGrid stroke="#1B3C52" />
              <PolarAngleAxis dataKey="factor" tick={{ fill: "#7C93A3", fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#254D68", fontSize: 9 }} />
              <Radar dataKey="score" stroke="#5FC9C9" fill="#2A9D8F" fillOpacity={0.45} strokeWidth={2} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, _n, p) => [`${v}`, p.payload.fullLabel]} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel flex flex-col gap-5 p-6">
          <div>
            <p className="stat-mono mb-3">Weighted-sum formula</p>
            <div className="overflow-x-auto rounded-lg border border-depth-600 bg-depth-900 p-4 font-mono text-sm leading-relaxed text-mist">
              <p>
                <span className="text-river-400">R</span> = clamp
                <span className="text-steel"> ( </span>
                <span>
                  Σᵢ w<sub>i</sub> · s<sub>i</sub>
                </span>
                <span className="text-steel"> × </span>
                <span className="text-alert-amber">e</span>
                <span className="text-steel">, 1, 99 )</span>
              </p>
              <p className="mt-3 text-xs text-steel">
                where <span className="text-mist">s</span> = normalized factor scores (0–100),{" "}
                <span className="text-mist">w</span> = feature weights, and{" "}
                <span className="text-alert-amber">e</span> = elevation exposure multiplier
              </p>
            </div>
          </div>

          <div>
            <p className="stat-mono mb-3">Feature weights (Σw = 1.0)</p>
            <div className="flex flex-col gap-2">
              {risk.factors.map((f) => (
                <div key={f.label} className="flex items-center justify-between text-xs">
                  <span className="text-mist">{f.label}</span>
                  <span className="font-mono text-river-400">w = {f.weight.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-depth-600 bg-depth-900/60 p-4 text-xs text-steel">
            <p className="mb-1 font-mono uppercase tracking-wide text-steel/80">Roadmap note</p>
            This is an interpretable baseline (v0.1) so every prediction stays explainable today.
            Phase 5 swaps the weighted sum for a trained gradient-boosted model (XGBoost / Random
            Forest) fitted on historical flood records, with these same features as inputs —
            explainability is preserved via SHAP-style attributions.
          </div>
        </div>
      </div>
    </section>
  );
}
