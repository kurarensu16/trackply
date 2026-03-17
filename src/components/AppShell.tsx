import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Applications from "../pages/Applications";
import Pipeline from "../pages/Pipeline";
import Dashboard from "../pages/Dashboard";
import Resumes from "../pages/Resumes";
import ResumeBuilder from "../pages/ResumeBuilder";
import Settings from "../pages/Settings";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import AppForm from "./applications/AppForm";

type Page = "dashboard" | "pipeline" | "applications" | "resumes" | "builder" | "settings";

export default function AppShell() {
  const [page, setPage] = useState<Page>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch settings from Convex
  const settings = useQuery(api.settings.get);

  // Apply Theme
  useEffect(() => {
    if (!settings) return;
    
    const theme = settings.appearance.theme;
    const isDark = 
      theme === "dark" || 
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings?.appearance.theme]);

  // Apply Accent Color
  useEffect(() => {
    if (!settings?.appearance.accentColor) return;
    
    // We override the --primary color in CSS. We also need to set the hover and muted variants safely.
    // For simplicity, we directly set the custom property on the document element.
    const root = document.documentElement;
    root.style.setProperty("--primary", settings.appearance.accentColor);
    root.style.setProperty("--primary-hover", settings.appearance.accentColor); // Optional: Could darken
    // Not setting muted because it's hard to reliably hex-to-rgba without a helper, but setting primary is huge.
  }, [settings?.appearance.accentColor]);

  return (
    <div className="flex min-h-screen bg-page-bg text-text-primary transition-colors duration-300">
      <Sidebar 
        currentPage={page} 
        onPageChange={setPage} 
        isCollapsed={isSidebarCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar 
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          onAddApplication={() => setShowAddForm(true)}
        />
        
        <main className="flex-1 px-8 py-10 max-w-7xl w-full mx-auto">
          {page === "dashboard" && <Dashboard />}
          {page === "pipeline" && <Pipeline />}
          {page === "applications" && <Applications />}
          {page === "resumes" && <Resumes />}
          {page === "builder" && <ResumeBuilder />}
          {page === "settings" && <Settings />}
        </main>
      </div>

      {showAddForm && <AppForm onClose={() => setShowAddForm(false)} />}
    </div>
  );
}


