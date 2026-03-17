import { LayoutDashboard, Rocket, FileText, Settings, LogOut, FolderOpen, PenLine } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { cn } from "../lib/utils";

type Page = "dashboard" | "pipeline" | "applications" | "resumes" | "builder" | "settings";

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  isCollapsed: boolean;
}

export default function Sidebar({ currentPage, onPageChange, isCollapsed }: SidebarProps) {
  const { signOut } = useAuthActions();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "pipeline", label: "Pipeline", icon: Rocket },
    { id: "applications", label: "Applications", icon: FileText },
    { id: "resumes", label: "Resumes", icon: FolderOpen },
    { id: "builder", label: "Resume Builder", icon: PenLine },
  ] as const;

  return (
    <aside className={cn(
      "border-r border-border bg-surface flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className={cn("p-6 flex items-center gap-3 overflow-hidden", isCollapsed && "justify-center px-0")}>
        <div className="w-8 h-8 min-w-8 bg-primary rounded-lg flex items-center justify-center">
          <Rocket className="text-white w-5 h-5" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-lg font-bold text-text-primary leading-tight">Trackply</span>
            <span className="text-[10px] font-medium text-primary uppercase tracking-wider">Career Tracker</span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            title={isCollapsed ? item.label : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group overflow-hidden active:scale-[0.98]",
              currentPage === item.id
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-text-secondary hover:bg-page-bg/80 hover:text-text-primary",
              isCollapsed && "justify-center px-0"
            )}
          >
            <item.icon className={cn(
              "w-4 h-4 min-w-4 transition-colors",
              currentPage === item.id ? "text-primary" : "text-text-muted group-hover:text-text-secondary"
            )} />
            {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="mt-auto border-t border-border-subtle p-4 space-y-1">
        <button
          onClick={() => onPageChange("settings")}
          title={isCollapsed ? "Settings" : undefined}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors overflow-hidden",
            currentPage === "settings"
              ? "bg-primary/10 text-primary"
              : "text-text-secondary hover:bg-page-bg hover:text-text-primary",
            isCollapsed && "justify-center px-0"
          )}
        >
          <Settings className={cn(
            "w-4 h-4 min-w-4 transition-colors",
            currentPage === "settings" ? "text-primary" : "text-text-muted"
          )} />
          {!isCollapsed && <span className="whitespace-nowrap">Settings</span>}
        </button>

        <button
          onClick={() => signOut()}
          title={isCollapsed ? "Sign Out" : undefined}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors overflow-hidden",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="w-4 h-4 min-w-4" />
          {!isCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}


