import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, Bell, Plus, Menu, Sun, Moon, Monitor } from "lucide-react";

interface TopBarProps {
  onToggleSidebar: () => void;
  onAddApplication: () => void;
}

export default function TopBar({ onToggleSidebar, onAddApplication }: TopBarProps) {
  const user = useQuery(api.users.viewer);
  const profile = useQuery(api.profile.getProfile);
  const settings = useQuery(api.settings.get);
  const updateSettings = useMutation(api.settings.update);

  const displayName = profile?.name || user?.name || user?.email?.split('@')[0] || "User";
  const userTitle = profile?.title || "Actively Looking";
  const initials = displayName
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8 transition-colors duration-300">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-text-secondary hover:bg-page-bg rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="relative group max-w-md w-full ml-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search applications, companies, or tasks..." 
            className="w-full pl-10 pr-4 py-2 bg-page-bg border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onAddApplication}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Application</span>
        </button>

        <div className="h-6 w-[1px] bg-border mx-2" />

        <button 
          onClick={() => {
            const currentTheme = settings?.appearance?.theme || "system";
            const newTheme = currentTheme === "dark" 
              ? "light" 
              : currentTheme === "light" 
                ? "system" 
                : "dark";
            
            updateSettings({
              appearance: {
                theme: newTheme,
                accentColor: settings?.appearance?.accentColor || "#3b82f6"
              }
            });
          }}
          className="p-2 text-text-secondary hover:bg-page-bg rounded-lg transition-colors"
          title="Toggle Theme (Light / Dark / System)"
        >
          {settings?.appearance?.theme === "dark" ? <Moon className="w-5 h-5" /> : 
           settings?.appearance?.theme === "light" ? <Sun className="w-5 h-5 text-yellow-500" /> : 
           <Monitor className="w-5 h-5 text-primary" />}
        </button>

        <button className="relative p-2 text-text-secondary hover:bg-page-bg rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-surface rounded-full"></span>
        </button>

        <div className="h-6 w-[1px] bg-border mx-2" />

        <div className="flex items-center gap-3 pl-2">
          <div className="flex flex-col items-end whitespace-nowrap">
            <span className="text-xs font-bold text-text-primary capitalize">{displayName}</span>
            <span className="text-[10px] text-text-secondary">{userTitle}</span>
          </div>
          <div className="w-9 h-9 rounded-full border border-border overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-border shadow-sm">
            {profile?.pictureUrl ? (
              <img src={profile.pictureUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

