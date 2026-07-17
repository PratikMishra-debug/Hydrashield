// HydraShield Flood Risk Engine — v0.1 (interpretable baseline)
//
// This is a transparent, weighted rule-based scoring model, NOT a trained
// neural network — it's an honest placeholder for Phase 5 of the roadmap.
// It combines live signals into a 0-100 risk score with visible feature
// contributions, so predictions can be explained and later validated
// against a real trained model (XGBoost/Random Forest on historical
// flood records, as planned).

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function computeFloodRisk({
  precipitationSumMm = 0, // rain forecast, next 24-72h (sum)
  recentPrecipitationMm = 0, // last 7 days total
  humidity = 50,
  windGustKmh = 0,
  riverDischarge = null, // m3/s from flood-api, if available
  elevation = null, // meters
  cloudCover = 0,
}) {
  const factors = [];

  // 1. Forecast rainfall load (heaviest weight — primary flood driver)
  const rainScore = clamp((precipitationSumMm / 120) * 100, 0, 100);
  factors.push({ label: "Forecast rainfall", weight: 0.35, score: rainScore, detail: `${precipitationSumMm.toFixed(1)} mm expected` });

  // 2. Saturated-ground effect from recent rainfall
  const recentScore = clamp((recentPrecipitationMm / 150) * 100, 0, 100);
  factors.push({ label: "Ground saturation (7d rainfall)", weight: 0.2, score: recentScore, detail: `${recentPrecipitationMm.toFixed(1)} mm past week` });

  // 3. River discharge anomaly (strongest direct indicator when available)
  let dischargeScore = 30; // neutral default when data unavailable
  let dischargeDetail = "No gauge data for this location";
  if (riverDischarge !== null && !Number.isNaN(riverDischarge)) {
    dischargeScore = clamp((riverDischarge / 500) * 100, 0, 100);
    dischargeDetail = `${riverDischarge.toFixed(1)} m³/s discharge`;
  }
  factors.push({ label: "River discharge", weight: 0.25, score: dischargeScore, detail: dischargeDetail });

  // 4. Humidity / cloud cover (secondary atmospheric signal)
  const atmosphereScore = clamp((humidity * 0.6 + cloudCover * 0.4), 0, 100);
  factors.push({ label: "Atmospheric moisture", weight: 0.1, score: atmosphereScore, detail: `${humidity}% humidity, ${cloudCover}% cloud cover` });

  // 5. Wind (storm-surge / debris proxy, minor weight)
  const windScore = clamp((windGustKmh / 90) * 100, 0, 100);
  factors.push({ label: "Wind gust intensity", weight: 0.05, score: windScore, detail: `${windGustKmh.toFixed(0)} km/h gusts` });

  // 6. Elevation modifier (lower elevation = higher exposure), applied as multiplier not a weighted factor
  let elevationMultiplier = 1;
  let elevationNote = "Elevation data unavailable";
  if (elevation !== null && !Number.isNaN(elevation)) {
    if (elevation < 10) { elevationMultiplier = 1.25; elevationNote = `${elevation.toFixed(0)}m — low-lying / coastal exposure`; }
    else if (elevation < 50) { elevationMultiplier = 1.12; elevationNote = `${elevation.toFixed(0)}m — floodplain range`; }
    else if (elevation < 200) { elevationMultiplier = 1.0; elevationNote = `${elevation.toFixed(0)}m — moderate elevation`; }
    else { elevationMultiplier = 0.8; elevationNote = `${elevation.toFixed(0)}m — elevated terrain, lower exposure`; }
  }

  const weightedSum = factors.reduce((acc, f) => acc + f.score * f.weight, 0);
  const probability = clamp(Math.round(weightedSum * elevationMultiplier), 1, 99);

  let level = "Low";
  if (probability >= 70) level = "High";
  else if (probability >= 40) level = "Medium";

  return {
    probability,
    level,
    factors,
    elevationMultiplier,
    elevationNote,
    modelVersion: "HydraShield Risk Engine v0.1 (rule-based baseline)",
  };
}

export const RISK_COLORS = {
  Low: "#5FA777",
  Medium: "#E9B44C",
  High: "#D64550",
};
