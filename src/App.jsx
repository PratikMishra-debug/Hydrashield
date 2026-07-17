import { useState } from "react";
import Header from "./components/Header";
import MonitorSection from "./components/MonitorSection";
import ModelExplainer from "./components/ModelExplainer";
import MapSection from "./components/MapSection";
import AnalyticsSection from "./components/AnalyticsSection";
import ReportSection from "./components/ReportSection";
import AlertsSection from "./components/AlertsSection";
import Footer from "./components/Footer";

export default function App() {
  const [location, setLocation] = useState(null);
  const [bundle, setBundle] = useState(null);
  const [risk, setRisk] = useState(null);

  return (
    <div className="min-h-screen bg-contour">
      <Header />
      <MonitorSection
        onLocationChange={setLocation}
        onBundleChange={setBundle}
        onRiskChange={setRisk}
      />
      <ModelExplainer risk={risk} />
      <MapSection location={location} />
      <AnalyticsSection bundle={bundle} />
      <ReportSection />
      <AlertsSection />
      <Footer />
    </div>
  );
}
