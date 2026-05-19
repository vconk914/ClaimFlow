import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LayoutDashboard, Stethoscope, BarChart3, Bell, Settings, ChevronRight } from "lucide-react";
import logoUrl from "/logo.png";
import Dashboard from "@/pages/Dashboard";
import ClaimsScrubber from "@/pages/ClaimsScrubber";
import Analytics from "@/pages/Analytics";
import { INITIAL_CLAIMS, type Claim } from "@/data/mockData";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false } },
});

type Tab = "dashboard" | "scrubber" | "analytics";

const NAV_ITEMS: { id: Tab; label: string; icon: any; badge?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "scrubber", label: "Claims Scrubber", icon: Stethoscope, badge: "23" },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [claims, setClaims] = useState<Claim[]>(INITIAL_CLAIMS);

  function handleClaimSubmit(claim: Claim) {
    setClaims(prev => [claim, ...prev]);
    setActiveTab("analytics");
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen bg-background overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 flex flex-col bg-sidebar text-sidebar-foreground shrink-0 border-r border-sidebar-border">
            {/* Logo */}
            <div className="px-4 py-4 border-b border-sidebar-border">
              <div className="bg-white rounded-xl px-3 py-2">
                <img src={logoUrl} alt="ClaimFlow" className="h-8 w-auto" />
              </div>
            </div>

            {/* Practice info */}
            <div className="px-5 py-3 border-b border-sidebar-border">
              <p className="text-xs text-sidebar-foreground/50 uppercase tracking-wide mb-1">Practice</p>
              <p className="text-xs font-medium text-sidebar-foreground">Greenfield Family Medicine</p>
              <p className="text-xs text-sidebar-foreground/60">NPI: 1234567890</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              <p className="text-xs text-sidebar-foreground/40 uppercase tracking-wide px-2 mb-2">Main Menu</p>
              {NAV_ITEMS.map(({ id, label, icon: Icon, badge }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-left">{label}</span>
                    {badge && !isActive && (
                      <span className="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 font-semibold leading-none">
                        {badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                  </button>
                );
              })}
            </nav>

            {/* Bottom section */}
            <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
              {[
                { icon: Bell, label: "Notifications", count: 3 },
                { icon: Settings, label: "Settings" },
              ].map(({ icon: Icon, label, count }) => (
                <button
                  key={label}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{label}</span>
                  {count && (
                    <span className="text-xs bg-sidebar-foreground/20 text-sidebar-foreground rounded-full px-1.5 py-0.5 font-medium">
                      {count}
                    </span>
                  )}
                </button>
              ))}

              {/* User avatar */}
              <div className="flex items-center gap-3 px-3 py-2 mt-2">
                <div className="w-7 h-7 rounded-full bg-blue-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  SJ
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-sidebar-foreground truncate">Sarah Johnson</p>
                  <p className="text-xs text-sidebar-foreground/50 truncate">Billing Manager</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top bar */}
            <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card shrink-0">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">ClaimFlow</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-medium text-foreground">
                  {NAV_ITEMS.find(n => n.id === activeTab)?.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  Simulated Data · HIPAA Compliant Demo
                </span>
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 overflow-y-auto p-6">
              {activeTab === "dashboard" && <Dashboard />}
              {activeTab === "scrubber" && <ClaimsScrubber onSubmit={handleClaimSubmit} />}
              {activeTab === "analytics" && <Analytics claims={claims} />}
            </main>
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
