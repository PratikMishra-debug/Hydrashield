import { useEffect, useState } from "react";
import { Search, Loader2, Droplet, Wind, Gauge, Eye, ThermometerSun, Waves } from "lucide-react";
import { geocodeCity, fetchWeatherBundle, WEATHER_CODES } from "../lib/weatherApi";
import { computeFloodRisk } from "../lib/floodModel";
import RiskGauge from "./RiskGauge";
import FloodRisk3D from "./FloodRisk3D";

export default function MonitorSection({ onLocationChange, onBundleChange, onRiskChange }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [place, setPlace] = useState(null);
  const [bundle, setBundle] = useState(null);
  const [risk, setRisk] = useState(null);

  const loadCity = async (name) => {
    setLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const results = await geocodeCity(name);
      const top = results[0];
      setPlace(top);
      const data = await fetchWeatherBundle(top.latitude, top.longitude);
      setBundle(data);
      onLocationChange?.(top);
      onBundleChange?.(data);

      const daily = data.weather.daily;
      const current = data.weather.current;
      const recent7d = (daily.precipitation_sum || []).slice(0, 7).reduce((a, b) => a + (b || 0), 0);
      const next3d = (daily.precipitation_sum || []).slice(7, 10).reduce((a, b) => a + (b || 0), 0);
      const dischargeArr = data.flood?.daily?.river_discharge || [];
      const riverDischarge = dischargeArr.length ? dischargeArr[Math.floor(dischargeArr.length / 2)] : null;

      const result = computeFloodRisk({
        precipitationSumMm: next3d,
        recentPrecipitationMm: recent7d,
        humidity: current.relative_humidity_2m,
        windGustKmh: current.wind_gusts_10m,
        riverDischarge,
        elevation: data.elevation,
        cloudCover: current.cloud_cover,
      });
      setRisk(result);
      onRiskChange?.(result);
    } catch (e) {
      setError(e.message || "Something went wrong");
      setBundle(null);
      setRisk(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCity("Delhi");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchInput = async (val) => {
    setQuery(val);
    if (val.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const results = await geocodeCity(val);
      setSuggestions(results.slice(0, 5));
    } catch {
      setSuggestions([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) loadCity(query.trim());
  };

  const current = bundle?.weather?.current;

  return (
    <section id="monitor" className="relative mx-auto max-w-7xl px-6 pb-20 pt-14 md:pt-20">
      <div className="mb-10 max-w-2xl">
        <p className="eyebrow mb-3">Gauge station 01 — live monitor</p>
        <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
          Watch the water before it watches you.
        </h1>
        <p className="mt-4 text-steel">
          Search any city for live weather, atmospheric readings, and an interpretable flood-risk
          score built from rainfall, river discharge, and terrain — updated in real time.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative mb-10 max-w-xl">
        <div className="flex items-center gap-2 rounded-xl border border-depth-600 bg-depth-800/70 px-4 py-3 focus-within:border-river-400">
          <Search size={18} className="text-steel" />
          <input
            value={query}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Search a city — e.g. Mumbai, Jakarta, Houston"
            className="w-full bg-transparent font-body text-sm text-mist placeholder:text-steel focus:outline-none"
          />
          <button type="submit" className="btn-primary py-1.5 text-xs">
            {loading ? <Loader2 size={14} className="animate-spin" /> : "Scan"}
          </button>
        </div>
        {suggestions.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-depth-600 bg-depth-800 shadow-xl">
            {suggestions.map((s) => (
              <li key={`${s.latitude}-${s.longitude}`}>
                <button
                  type="button"
                  onClick={() => {
                    setQuery(`${s.name}, ${s.country}`);
                    loadCity(s.name);
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm text-mist hover:bg-depth-700"
                >
                  {s.name}{s.admin1 ? `, ${s.admin1}` : ""}, {s.country}
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>

      {error && (
        <div className="mb-8 rounded-xl border border-alert-red/40 bg-alert-red/10 px-4 py-3 text-sm text-alert-red">
          {error}
        </div>
      )}

      {loading && !bundle && (
        <div className="flex items-center gap-2 text-steel">
          <Loader2 size={16} className="animate-spin" /> Reading gauge station…
        </div>
      )}

      {bundle && risk && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Gauge card */}
          <div className="panel flex flex-col items-center justify-center gap-4 p-8">
            <p className="eyebrow">
              {place?.name}{place?.admin1 ? `, ${place.admin1}` : ""}, {place?.country}
            </p>
            <RiskGauge probability={risk.probability} level={risk.level} />
            <p className="text-center text-xs text-steel">{risk.modelVersion}</p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Weather stat grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Stat icon={ThermometerSun} label="Temperature" value={`${Math.round(current.temperature_2m)}°C`} sub={`Feels ${Math.round(current.apparent_temperature)}°C`} />
              <Stat icon={Droplet} label="Humidity" value={`${current.relative_humidity_2m}%`} />
              <Stat icon={Wind} label="Wind" value={`${Math.round(current.wind_speed_10m)} km/h`} sub={`Gusts ${Math.round(current.wind_gusts_10m)}`} />
              <Stat icon={Gauge} label="Pressure" value={`${Math.round(current.pressure_msl)} hPa`} />
              <Stat icon={Eye} label="Condition" value={WEATHER_CODES[current.weather_code] || "—"} />
              <Stat icon={Waves} label="AQI (US)" value={bundle.air?.current?.us_aqi ?? "—"} />
            </div>

            {/* Factor breakdown */}
            <div className="panel p-6">
              <p className="eyebrow mb-4">Risk factor breakdown</p>
              <div className="flex flex-col gap-3">
                {risk.factors.map((f) => (
                  <div key={f.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-mist">{f.label} <span className="text-steel">· {Math.round(f.weight * 100)}% weight</span></span>
                      <span className="font-mono text-steel">{f.detail}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-depth-700">
                      <div
                        className="h-full rounded-full bg-river-500"
                        style={{ width: `${f.score}%` }}
                      />
                    </div>
                  </div>
                ))}
                <p className="mt-2 text-xs text-steel">{risk.elevationNote} · elevation modifier ×{risk.elevationMultiplier.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {bundle && risk && (
        <div className="mt-6">
          <FloodRisk3D probability={risk.probability} level={risk.level} />
        </div>
      )}
    </section>
  );
}

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <div className="panel flex flex-col gap-2 p-4">
      <Icon size={16} className="text-river-400" />
      <span className="stat-mono">{label}</span>
      <span className="font-display text-xl font-semibold">{value}</span>
      {sub && <span className="text-xs text-steel">{sub}</span>}
    </div>
  );
}
