import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const tooltipStyle = {
  background: "#122B3E",
  border: "1px solid #254D68",
  borderRadius: 8,
  fontSize: 12,
  color: "#EAF4F4",
};

export default function AnalyticsSection({ bundle }) {
  if (!bundle) return null;
  const daily = bundle.weather.daily;
  const hourly = bundle.weather.hourly;

  const days = daily.time.map((t, i) => ({
    day: t.slice(5),
    rain: daily.precipitation_sum[i],
    probability: daily.precipitation_probability_max?.[i] ?? 0,
    max: daily.temperature_2m_max[i],
    min: daily.temperature_2m_min[i],
    wind: daily.wind_speed_10m_max[i],
  }));

  const hourlyRecent = hourly.time.slice(0, 48).map((t, i) => ({
    hour: t.slice(11, 16),
    humidity: hourly.relative_humidity_2m[i],
    temp: hourly.temperature_2m[i],
  }));

  const discharge = bundle.flood?.daily
    ? bundle.flood.daily.time.map((t, i) => ({
        day: t.slice(5),
        discharge: bundle.flood.daily.river_discharge[i],
      }))
    : [];

  return (
    <section id="analytics" className="mx-auto max-w-7xl px-6 py-16">
      <p className="eyebrow mb-3">Data visualization</p>
      <h2 className="mb-8 font-display text-3xl font-semibold tracking-tight">
        14-day analytics
      </h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Rainfall trend (mm/day)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={days}>
              <defs>
                <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2A9D8F" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#2A9D8F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1B3C52" vertical={false} />
              <XAxis dataKey="day" stroke="#7C93A3" fontSize={11} />
              <YAxis stroke="#7C93A3" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="rain" stroke="#5FC9C9" fill="url(#rainGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Temperature range (°C)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={days}>
              <CartesianGrid stroke="#1B3C52" vertical={false} />
              <XAxis dataKey="day" stroke="#7C93A3" fontSize={11} />
              <YAxis stroke="#7C93A3" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="max" stroke="#E9B44C" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="min" stroke="#5FC9C9" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Hourly humidity (48h)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={hourlyRecent}>
              <defs>
                <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1C6E8C" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#1C6E8C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1B3C52" vertical={false} />
              <XAxis dataKey="hour" stroke="#7C93A3" fontSize={10} interval={7} />
              <YAxis stroke="#7C93A3" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="humidity" stroke="#5FC9C9" fill="url(#humGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={discharge.length ? "River discharge (m³/s)" : "Max wind speed (km/h)"}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={discharge.length ? discharge : days}>
              <CartesianGrid stroke="#1B3C52" vertical={false} />
              <XAxis dataKey="day" stroke="#7C93A3" fontSize={11} />
              <YAxis stroke="#7C93A3" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey={discharge.length ? "discharge" : "wind"} fill="#D64550" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="panel p-6">
      <p className="stat-mono mb-4">{title}</p>
      {children}
    </div>
  );
}
