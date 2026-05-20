import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LayoutDashboard, Stethoscope, BarChart3, Bell, Settings, ChevronRight, Globe, MapPin, CheckCircle2, FlaskConical, ChevronDown, Users } from "lucide-react";
import logoUrl from "/logo.png";
import Dashboard from "@/pages/Dashboard";
import ClaimsScrubber from "@/pages/ClaimsScrubber";
import Analytics from "@/pages/Analytics";
import SettingsPage from "@/pages/Settings";
import DemoScenarios from "@/pages/DemoScenarios";
import AIAssistant from "@/components/AIAssistant";
import { INITIAL_CLAIMS, type Claim } from "@/data/mockData";
import { RegionalProvider, useRegion } from "@/context/RegionalContext";
import { STATE_OPTIONS, type StateId } from "@/data/regionalData";
import type { ScenarioPrefill } from "@/data/demoScenarios";
import { TeamProvider, useTeam } from "@/context/TeamContext";
import { TEAM_MEMBERS, ROLE_CONFIGS } from "@/data/teamRoles";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false } },
});

type Tab = "dashboard" | "scrubber" | "analytics" | "demo" | "settings";

const NAV_ITEMS: { id: Tab; label: string; icon: any; badge?: string }[] = [
  { id: "dashboard",  label: "Dashboard",       icon: LayoutDashboard },
  { id: "scrubber",   label: "Claims Scrubber", icon: Stethoscope, badge: "23" },
  { id: "analytics",  label: "Analytics",       icon: BarChart3 },
  { id: "demo",       label: "Demo Scenarios",  icon: FlaskConical },
];

const STATE_DOT_COLORS: Record<StateId, string> = {
  national: "bg-blue-500",
  ny:       "bg-indigo-500",
  fl:       "bg-orange-500",
  ca:       "bg-amber-500",
  tx:       "bg-red-500",
};

// ── Onboarding modal ──────────────────────────────────────────────────────────

const STATE_CARD_STYLES: Record<StateId, { border: string; bg: string; text: string; activeBg: string }> = {
  national: { border: "border-blue-200",   bg: "bg-blue-50",   text: "text-blue-700",   activeBg: "bg-blue-600" },
  ny:       { border: "border-indigo-200", bg: "bg-indigo-50", text: "text-indigo-700", activeBg: "bg-indigo-600" },
  fl:       { border: "border-orange-200", bg: "bg-orange-50", text: "text-orange-700", activeBg: "bg-orange-600" },
  ca:       { border: "border-amber-200",  bg: "bg-amber-50",  text: "text-amber-700",  activeBg: "bg-amber-600" },
  tx:       { border: "border-red-200",    bg: "bg-red-50",    text: "text-red-700",    activeBg: "bg-red-600" },
};

function OnboardingModal() {
  const { completeOnboarding, onboardingComplete } = useRegion();
  const [selected, setSelected] = useState<StateId>("national");

  if (onboardingComplete) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="w-full max-w-xl mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Setup</p>
              <h2 className="text-lg font-bold text-foreground">Welcome to ClaimFlow</h2>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Select your primary billing region to load state-specific payer profiles, denial patterns, and compliance workflow rules.
            You can change this anytime in Settings.
          </p>
        </div>

        {/* State cards */}
        <div className="px-8 py-6 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Select your region</p>
          <div className="grid grid-cols-5 gap-2">
            {STATE_OPTIONS.map(opt => {
              const active = selected === opt.id;
              const s = STATE_CARD_STYLES[opt.id];
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelected(opt.id)}
                  className={`relative flex flex-col items-center gap-1.5 px-2 py-3.5 rounded-xl border-2 transition-all text-center ${
                    active
                      ? `${s.activeBg} text-white border-transparent shadow-md`
                      : `border-border bg-card hover:${s.bg} hover:${s.border} text-foreground`
                  }`}
                >
                  <span className={`text-base font-bold ${active ? "text-white" : ""}`}>{opt.abbreviation}</span>
                  <span className={`text-xs leading-tight ${active ? "text-white/85" : "text-muted-foreground"}`}>{opt.label}</span>
                  {active && <CheckCircle2 className="absolute top-1.5 right-1.5 w-3 h-3 text-white/70" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action */}
        <div className="px-8 pb-8">
          <button
            onClick={() => completeOnboarding(selected)}
            className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm"
          >
            Load {STATE_OPTIONS.find(s => s.id === selected)?.label} Profile &amp; Get Started
          </button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Regional data is simulated · HIPAA Compliant Demo
          </p>
        </div>
      </div>
    </div>
  );
}

// ── User switcher ─────────────────────────────────────────────────────────────

function UserSwitcher() {
  const { activeUser, setActiveUserId } = useTeam();
  const [open, setOpen] = useState(false);
  const roleConfig = ROLE_CONFIGS[activeUser.role];
  return (
    <div className="relative mt-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
      >
        <div className={`w-7 h-7 rounded-full ${activeUser.avatar} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
          {activeUser.initials}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-medium text-sidebar-foreground truncate">{activeUser.name}</p>
          <p className="text-xs text-sidebar-foreground/50 truncate">{roleConfig.label}</p>
        </div>
        <Users className="w-3.5 h-3.5 text-sidebar-foreground/40 shrink-0" />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Switch User</p>
          </div>
          <div className="py-1 max-h-64 overflow-y-auto">
            {TEAM_MEMBERS.map(member => {
              const rc = ROLE_CONFIGS[member.role];
              const isActive = member.id === activeUser.id;
              return (
                <button
                  key={member.id}
                  onClick={() => { setActiveUserId(member.id); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-muted text-left transition-colors ${isActive ? "bg-primary/5" : ""}`}
                >
                  <div className={`w-6 h-6 rounded-full ${member.avatar} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                    {member.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${isActive ? "text-primary" : "text-foreground"}`}>{member.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{rc.label}</p>
                  </div>
                  {isActive && <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main app shell ────────────────────────────────────────────────────────────

function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [claims, setClaims] = useState<Claim[]>(INITIAL_CLAIMS);
  const [prefillData, setPrefillData] = useState<ScenarioPrefill | null>(null);
  const [prefillKey, setPrefillKey] = useState(0);
  const { stateId, config } = useRegion();

  function handleClaimSubmit(claim: Claim) {
    setClaims(prev => [claim, ...prev]);
    setActiveTab("analytics");
  }

  function loadScenarioInScrubber(prefill: ScenarioPrefill) {
    setPrefillData(prefill);
    setPrefillKey(k => k + 1);
    setActiveTab("scrubber");
  }

  const dotColor = STATE_DOT_COLORS[stateId];

  return (
    <>
      <OnboardingModal />
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 flex flex-col bg-sidebar text-sidebar-foreground shrink-0 border-r border-sidebar-border">
          {/* Logo */}
          <div className="px-4 py-4 border-b border-sidebar-border flex items-center">
            <div className="bg-white rounded-xl px-3 py-2 inline-flex items-center shrink-0">
              <img src={logoUrl} alt="ClaimFlow" className="h-10 w-auto object-contain" />
            </div>
          </div>

          {/* Practice + Region info */}
          <div className="px-5 py-3 border-b border-sidebar-border">
            <p className="text-xs text-sidebar-foreground/50 uppercase tracking-wide mb-1">Practice</p>
            <p className="text-xs font-medium text-sidebar-foreground">Northgate Urology Associates</p>
            <p className="text-xs text-sidebar-foreground/60">NPI: 1234567890</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
              <span className="text-xs text-sidebar-foreground/60">
                {config.label} region active
              </span>
            </div>
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
            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="flex-1 text-left">Notifications</span>
              <span className="text-xs bg-sidebar-foreground/20 text-sidebar-foreground rounded-full px-1.5 py-0.5 font-medium">3</span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === "settings"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="flex-1 text-left">Settings</span>
              {activeTab === "settings" && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </button>

            {/* User switcher */}
            <UserSwitcher />
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
                {activeTab === "settings" ? "Settings" : NAV_ITEMS.find(n => n.id === activeTab)?.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Regional indicator */}
              <button
                onClick={() => setActiveTab("settings")}
                className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 hover:bg-muted px-2.5 py-1 rounded-full transition-colors border border-border"
              >
                <MapPin className={`w-3 h-3`} />
                <span className={`font-semibold ${dotColor.replace("bg-", "text-")}`}>{config.abbreviation}</span>
                <span>{config.label}</span>
              </button>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                Simulated Data · HIPAA Compliant Demo
              </span>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">
            {activeTab === "dashboard"  && <Dashboard />}
            {activeTab === "scrubber"   && <ClaimsScrubber onSubmit={handleClaimSubmit} prefill={prefillData} prefillKey={prefillKey} />}
            {activeTab === "analytics"  && <Analytics claims={claims} />}
            {activeTab === "demo"       && <DemoScenarios onLoadInScrubber={loadScenarioInScrubber} />}
            {activeTab === "settings"   && <SettingsPage />}
          </main>
        </div>
      </div>
      <AIAssistant />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RegionalProvider>
          <TeamProvider>
            <AppShell />
          </TeamProvider>
        </RegionalProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
