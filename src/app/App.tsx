import { useLocation } from "react-router-dom";
import { Navigate, Route, Routes } from "react-router-dom";
import { ChecklistProvider } from "../features/checklist/ChecklistContext";
import { ChecklistPage } from "../pages/ChecklistPage";
import { CompletionPage } from "../pages/CompletionPage";
import { ConsentMaterialPage } from "../pages/ConsentMaterialPage";
import { EntryRedirect } from "../pages/EntryRedirect";
import { MaterialPlaceholderPage } from "../pages/MaterialPlaceholderPage";
import { MaterialsCatalog } from "../pages/MaterialsCatalog";
import { SexMythsMaterialPage } from "../pages/SexMythsMaterialPage";
import { StartPage } from "../pages/StartPage";

function ChecklistRoute() {
  const location = useLocation();
  return <ChecklistPage key={location.pathname} />;
}

export function App() {
  return (
    <ChecklistProvider>
      <Routes>
        <Route path="/" element={<EntryRedirect />} />
        <Route path="/start" element={<StartPage />} />
        <Route path="/checklist/:step" element={<ChecklistRoute />} />
        <Route path="/complete" element={<CompletionPage />} />
        <Route path="/materials" element={<MaterialsCatalog />} />
        <Route path="/materials/consent" element={<ConsentMaterialPage />} />
        <Route path="/materials/sex-myths" element={<SexMythsMaterialPage />} />
        <Route
          path="/materials/:materialSlug"
          element={<MaterialPlaceholderPage />}
        />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </ChecklistProvider>
  );
}
