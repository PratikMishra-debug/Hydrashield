import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RISK_COLORS } from "../lib/floodModel";

// Fix default marker icons (Vite asset pipeline issue with Leaflet)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function Recenter({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lon) map.flyTo([lat, lon], 11, { duration: 1.1 });
  }, [lat, lon, map]);
  return null;
}

// Generates deterministic mock flood-prone zones around a center point —
// stand-in for Phase 2's real flood-plain / hydrology dataset.
function mockZones(lat, lon) {
  const seeds = [
    { dx: 0.04, dy: 0.02, risk: "High", name: "Riverside Low-lying Zone" },
    { dx: -0.03, dy: 0.05, risk: "Medium", name: "Northern Drainage Basin" },
    { dx: 0.02, dy: -0.04, risk: "Low", name: "Elevated Residential Belt" },
    { dx: -0.05, dy: -0.02, risk: "Medium", name: "Industrial Canal Corridor" },
  ];
  return seeds.map((s, i) => ({
    id: i,
    lat: lat + s.dy,
    lon: lon + s.dx,
    risk: s.risk,
    name: s.name,
  }));
}

export default function MapSection({ location }) {
  const lat = location?.latitude ?? 28.6139;
  const lon = location?.longitude ?? 77.209;
  const zones = useMemo(() => mockZones(lat, lon), [lat, lon]);

  return (
    <section id="map" className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-3">Geospatial layer</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight">Flood-prone zone map</h2>
        </div>
        <p className="max-w-md text-sm text-steel">
          Illustrative zone data shown below — Phase 2 will connect this to real hydrology and
          elevation datasets for accurate flood-plain mapping.
        </p>
      </div>

      <div className="panel overflow-hidden p-2">
        <MapContainer center={[lat, lon]} zoom={11} style={{ height: "480px", width: "100%" }} className="rounded-xl">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          />
          <Recenter lat={lat} lon={lon} />
          <Marker position={[lat, lon]}>
            <Popup>{location?.name || "Searched location"}</Popup>
          </Marker>
          {zones.map((z) => (
            <Circle
              key={z.id}
              center={[z.lat, z.lon]}
              radius={1800}
              pathOptions={{
                color: RISK_COLORS[z.risk],
                fillColor: RISK_COLORS[z.risk],
                fillOpacity: 0.25,
              }}
            >
              <Popup>
                <strong>{z.name}</strong>
                <br />
                Risk level: {z.risk}
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        {Object.entries(RISK_COLORS).map(([level, color]) => (
          <span key={level} className="flex items-center gap-2 font-mono text-xs text-steel">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
            {level} risk zone
          </span>
        ))}
      </div>
    </section>
  );
}
