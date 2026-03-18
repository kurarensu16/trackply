import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, Bell, Plus, Menu, Calendar, Clock, AlertCircle, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TopBarProps {
  onToggleSidebar: () => void;
  onAddApplication: () => void;
}

export default function TopBar({ onToggleSidebar, onAddApplication }: TopBarProps) {
  const user = useQuery(api.users.viewer);
  const profile = useQuery(api.profile.getProfile);

  const displayName = profile?.name || user?.name || user?.email?.split('@')[0] || "User";
  const userTitle = profile?.title || "Actively Looking";
  const initials = displayName
    .split(/\s+/)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [showNotifications, setShowNotifications] = useState(false);
  const unreadNotifications = useQuery(api.notifications.getUnread);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const notifRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif: any) => {
    try {
      await markAsRead({ id: notif._id });
      if (notif.link) {
        window.location.href = notif.link;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const hasUnread = unreadNotifications && unreadNotifications.length > 0;

  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8 transition-colors duration-300">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-text-secondary hover:bg-page-bg rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="relative group max-w-md w-full ml-1 sm:ml-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors hidden sm:block" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full sm:pl-10 px-3 py-2 bg-page-bg border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onAddApplication}
          className="btn-primary flex items-center gap-2 p-2 sm:px-4 sm:py-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Application</span>
        </button>

        <div className="h-6 w-[1px] bg-border mx-2" />

        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-lg transition-colors relative ${showNotifications ? 'bg-page-bg text-text-primary' : 'text-text-secondary hover:bg-page-bg'}`}
          >
            <Bell className="w-5 h-5" />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-surface rounded-full animate-pulse-slow"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface border border-border shadow-[var(--shadow-premium)] rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3 border-b border-border flex items-center justify-between bg-page-bg/50">
                <h3 className="text-xs font-bold text-text-primary px-1">Notifications</h3>
                {hasUnread && (
                  <button 
                    onClick={async () => await markAllAsRead()}
                    className="flex items-center gap-1.5 text-[10px] font-semibold text-primary hover:text-primary-hover px-2 py-1 rounded-md hover:bg-primary/5 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>
              
              <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                {!unreadNotifications || unreadNotifications.length === 0 ? (
                  <div className="py-8 text-center text-text-muted flex flex-col items-center">
                    <Bell className="w-8 h-8 opacity-20 mb-2" />
                    <p className="text-xs font-medium">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border-subtle">
                    {unreadNotifications.map((notif: any) => {
                      const Icon = notif.type === "interview_reminder" ? Calendar :
                                   notif.type === "application_stalled" ? Clock : AlertCircle;
                      
                      const iconColor = notif.type === "interview_reminder" ? "text-purple-500 bg-purple-500/10" :
                                        notif.type === "application_stalled" ? "text-amber-500 bg-amber-500/10" : 
                                        "text-blue-500 bg-blue-500/10";

                      return (
                        <button
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif)}
                          className="w-full text-left p-3 hover:bg-page-bg transition-colors flex items-start gap-3 group"
                        >
                          <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-text-primary truncate">{notif.title}</h4>
                            <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[9px] text-text-muted mt-1.5 block font-medium">
                              {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="shrink-0 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-2 h-2 rounded-full bg-primary/20 group-hover:bg-primary ring-4 ring-page-bg transition-colors" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-[1px] bg-border mx-2" />

        <div className="flex items-center gap-3 pl-2">
          <div className="flex-col items-end whitespace-nowrap hidden sm:flex">
            <span className="text-xs font-bold text-text-primary capitalize">{displayName}</span>
            <span className="text-[10px] text-text-secondary">{userTitle}</span>
          </div>
          <div className="w-9 h-9 rounded-full border border-border overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-border shadow-sm shrink-0">
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

