import { Container } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import CrudTablePage from "./pages/CrudTablePage";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";
import SwimLanesPage from "./pages/SwimLanesPage";
import UserInputPage from "./pages/UserInputPage";

const featureData = [
  {
    title: "Swim Lanes",
    description:
      "Interactive GoJS swim lanes diagram with collapsible, resizable, and re-orderable lanes.",
    ctaLabel: "Open Swim Lanes",
    ctaTo: "/swimlanes",
  },
  {
    title: "Registration Form",
    description:
      "Fill out a validated user input form with real-time error feedback.",
    ctaLabel: "Open Form",
    ctaTo: "/form",
  },
  {
    title: "Open Settings",
    description:
      "Go to your dedicated settings page and customize your experience.",
    ctaLabel: "Open Settings",
    ctaTo: "/settings",
  },
  {
    title: "CRUD Table",
    description: "Manage users with a full create, update, and delete table.",
    ctaLabel: "Open CRUD Table",
    ctaTo: "/crud",
  },
  {
    title: "Reusable Components",
    description:
      "Compose UI from small, maintainable pieces that grow with your app.",
  },
  {
    title: "Production Ready",
    description:
      "Run a single build command to create optimized assets for deployment.",
  },
];

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [density, setDensity] = useState(70);
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("UTC-05:00");

  const handleLanguageChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value);
  };

  const handleTimezoneChange = (event: SelectChangeEvent) => {
    setTimezone(event.target.value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
      <Routes>
        <Route path="/" element={<HomePage featureData={featureData} />} />
        <Route path="/crud" element={<CrudTablePage />} />
        <Route path="/form" element={<UserInputPage />} />
        <Route path="/swimlanes" element={<SwimLanesPage />} />
        <Route
          path="/settings"
          element={
            <SettingsPage
              darkMode={darkMode}
              emailAlerts={emailAlerts}
              fontSize={fontSize}
              density={density}
              language={language}
              timezone={timezone}
              onDarkModeChange={setDarkMode}
              onEmailAlertsChange={setEmailAlerts}
              onFontSizeChange={setFontSize}
              onDensityChange={setDensity}
              onLanguageChange={handleLanguageChange}
              onTimezoneChange={handleTimezoneChange}
            />
          }
        />
      </Routes>
    </Container>
  );
}

export default App;
