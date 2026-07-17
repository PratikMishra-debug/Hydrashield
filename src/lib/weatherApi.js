// HydraShield data layer — powered by Open-Meteo (free, no API key required).
// Swap GEOCODE_URL/FORECAST_URL for WeatherAPI.com if you obtain a key later.

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
const FLOOD_URL = "https://flood-api.open-meteo.com/v1/flood";
const ELEVATION_URL = "https://api.open-meteo.com/v1/elevation";

export async function geocodeCity(name) {
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(name)}&count=5&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding lookup failed");
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`No location found for "${name}"`);
  }
  return data.results;
}

export async function fetchWeatherBundle(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "rain",
      "weather_code",
      "wind_speed_10m",
      "wind_gusts_10m",
      "pressure_msl",
      "cloud_cover",
    ].join(","),
    hourly: ["precipitation", "relative_humidity_2m", "temperature_2m"].join(","),
    daily: [
      "precipitation_sum",
      "precipitation_probability_max",
      "temperature_2m_max",
      "temperature_2m_min",
      "wind_speed_10m_max",
    ].join(","),
    past_days: "7",
    forecast_days: "7",
    timezone: "auto",
  });

  const [weatherRes, aqRes, elevRes] = await Promise.all([
    fetch(`${FORECAST_URL}?${params.toString()}`),
    fetch(
      `${AIR_QUALITY_URL}?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10&timezone=auto`
    ),
    fetch(`${ELEVATION_URL}?latitude=${lat}&longitude=${lon}`),
  ]);

  if (!weatherRes.ok) throw new Error("Weather service unavailable");

  const weather = await weatherRes.json();
  const air = aqRes.ok ? await aqRes.json() : null;
  const elevation = elevRes.ok ? await elevRes.json() : null;

  // River discharge / flood API has limited global coverage; fail soft.
  let flood = null;
  try {
    const floodRes = await fetch(
      `${FLOOD_URL}?latitude=${lat}&longitude=${lon}&daily=river_discharge&forecast_days=7&past_days=3`
    );
    if (floodRes.ok) flood = await floodRes.json();
  } catch {
    flood = null;
  }

  return {
    weather,
    air,
    elevation: elevation?.elevation?.[0] ?? null,
    flood,
  };
}

export const WEATHER_CODES = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Moderate showers",
  82: "Violent showers",
  95: "Thunderstorm",
  96: "Thunderstorm w/ hail",
  99: "Severe thunderstorm w/ hail",
};
