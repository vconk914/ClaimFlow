import { useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  LayoutDashboard, Stethoscope, BarChart3, Bell, Settings,
  ChevronRight, Globe, MapPin, CheckCircle2, FlaskConical,
  Users, GitBranch, Activity, Clock, AlertTriangle, DollarSign,
  Sparkles, Play, PanelLeftClose, PanelLeftOpen, Brain,
} from "lucide-react";
import logoUrl from "/logo.png";
import Dashboard from "@/pages/Dashboard";
import ClaimsScrubber from "@/pages/ClaimsScrubber";
import Analytics from "@/pages/Analytics";
import PredictiveAnalytics from "@/pages/PredictiveAnalytics";
import ClaimsTimeline from "@/pages/ClaimsTimeline";
import SettingsPage from "@/pages/Settings";
import DemoScenarios from "@/pages/DemoScenarios";
import LandingPage from "@/pages/LandingPage";
import AIAssistant from "@/components/AIAssistant";
import NotificationsPanel from "@/components/NotificationsPanel";
import GuidedTour from "@/components/GuidedTour";
import { RegionalProvider, useRegion } from "@/context/RegionalContext";
import { STATE_OPTIONS, type StateId } from "@/data/regionalData";
import type { ScenarioPrefill } from "@/data/demoScenarios";
import { TeamProvider, useTeam } from "@/context/TeamContext";
import { TEAM_MEMBERS, ROLE_CONFIGS } from "@/data/teamRoles";
import { ClaimStoreProvider, useClaimStore } from "@/context/ClaimStore";
import { TourProvider, useTour } from "@/context/TourContext";
import type { ClaimStatus } from "@/data/mockData";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false } },
});

type Tab = "dashboard" | "scrubber" | "analytics" | "predictive" | "timeline" | "demo" | "settings";

const NAV_ITEMS: { id: Tab; label: string; icon: any; badge?: string; tourKey: string }[] = [
  { id: "dashboard",  label: "Dashboard",       icon: LayoutDashboard, tourKey: "nav-dashboard" },
  { id: "scrubber",   label: "Claims Scrubber", icon: Stethoscope,     tourKey: "nav-scrubber"  },
  { id: "analytics",   label: "Analytics",         icon: BarChart3,       tourKey: "nav-analytics"   },
  { id: "predictive", label: "Predictive",        icon: Brain,           tourKey: "nav-predictive"  },
  { id: "timeline",   label: "Claims Timeline",   icon: GitBranch,       tourKey: "nav-timeline"    },
  { id: "demo",       label: "Demo Scenarios",  icon: FlaskConical,    tourKey: "nav-demo"      },
];

// ── Activity Feed ──────────────────────────────────────────────────────────────

const ACTIVITY_STATUS_COLORS: Partial<Record<ClaimStatus, string>> = {
  Paid:        "bg-emerald-600",
  Approved:    "bg-emerald-500",
  Denied:      "bg-red-500",
  Corrected:   "bg-sky-500",
  Resubmitted: "bg-indigo-500",
  Submitted:   "bg-violet-500",
  Scrubbed:    "bg-blue-500",
  Pending:     "bg-amber-500",
  Draft:       "bg-slate-400",
};

function ActivityFeed() {
  const { activityFeed, stats } = useClaimStore();
  const recent = activityFeed.slice(0, 4);
  return (
    <div className="px-3 py-3 border-t border-sidebar-border">
      <div className="flex items-center gap-2 px-2 mb-2">
        <Activity className="w-3 h-3 text-sidebar-foreground/40" />
        <p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-wide">Live Activity</p>
      </div>
      {recent.length === 0 ? (
        <p className="text-[10px] text-sidebar-foreground/30 px-2 italic">No recent activity</p>
      ) : (
        <div className="space-y-1.5">
          {recent.map(event => {
            const dot = ACTIVITY_STATUS_COLORS[event.toStatus] ?? "bg-slate-400";
            return (
              <div key={event.id} className="flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent transition-colors">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${dot}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-sidebar-foreground/70 truncate">{event.patient}</p>
                  <p className="text-[10px] text-sidebar-foreground/40 truncate">→ {event.toStatus}</p>
                </div>
                <span className="text-[9px] text-sidebar-foreground/30 shrink-0 mt-0.5">
                  {new Date(event.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </span>
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-2 pt-2 border-t border-sidebar-border/50 px-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
          <span className="text-[10px] text-sidebar-foreground/50">{stats.denied} denied</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-2.5 h-2.5 text-amber-400" />
          <span className="text-[10px] text-sidebar-foreground/50">{stats.pending} pending</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="w-2.5 h-2.5 text-emerald-400" />
          <span className="text-[10px] text-sidebar-foreground/50">{stats.paid} paid</span>
        </div>
      </div>
    </div>
  );
}

// ── Regional colors ────────────────────────────────────────────────────────────

const STATE_DOT_COLORS: Record<StateId, string> = {
  national: "bg-blue-500",
  ny:       "bg-indigo-500",
  fl:       "bg-orange-500",
  ca:       "bg-amber-500",
  tx:       "bg-red-500",
};

// ── Onboarding modal ───────────────────────────────────────────────────────────

const STATE_CARD_STYLES: Record<StateId, { border: string; bg: string; text: string; activeBg: string }> = {
  national: { border: "border-blue-200",   bg: "bg-blue-50",   text: "text-blue-700",   activeBg: "bg-blue-600" },
  ny:       { border: "border-indigo-200", bg: "bg-indigo-50", text: "text-indigo-700", activeBg: "bg-indigo-600" },
  fl:       { border: "border-orange-200", bg: "bg-orange-50", text: "text-orange-700", activeBg: "bg-orange-600" },
  ca:       { border: "border-amber-200",  bg: "bg-amber-50",  text: "text-amber-700",  activeBg: "bg-amber-600" },
  tx:       { border: "border-red-200",    bg: "bg-red-50",    text: "text-red-700",    activeBg: "bg-red-600" },
};

function OnboardingModal({ onDone }: { onDone?: () => void }) {
  const { completeOnboarding, onboardingComplete } = useRegion();
  const [selected, setSelected] = useState<StateId>("national");
  if (onboardingComplete) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
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
          </p>
        </div>
        <div className="px-8 py-6">
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
        <div className="px-8 pb-8">
          <button
            onClick={() => { completeOnboarding(selected); onDone?.(); }}
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

// ── User switcher ──────────────────────────────────────────────────────────────

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
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in-up">
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

// ── Collapsed user avatar (icon-only mode) ────────────────────────────────────

function UserSwitcherCollapsed() {
  const { activeUser } = useTeam();
  return (
    <div className={`w-7 h-7 rounded-full ${activeUser.avatar} flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1`}
      title={activeUser.name}>
      {activeUser.initials}
    </div>
  );
}

// ── Tour trigger ───────────────────────────────────────────────────────────────

function TourButton() {
  const { startTour, active } = useTour();
  if (active) return null;
  return (
    <button
      onClick={startTour}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors group"
    >
      <Play className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
      <span className="flex-1 text-left">Guided Tour</span>
      <Sparkles className="w-3 h-3 text-blue-400/60" />
    </button>
  );
}

// ── Main app shell — receives activeTab + setter so TourProvider can drive it ──

interface AppShellProps {
  onShowLanding: () => void;
  activeTab: Tab;
  onTabChange: (tab: string) => void;
}

function AppShellInner({ onShowLanding, activeTab, onTabChange }: AppShellProps) {
  const [prefillData, setPrefillData] = useState<ScenarioPrefill | null>(null);
  const [prefillKey, setPrefillKey] = useState(0);
  const [pageKey, setPageKey] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const { stateId, config } = useRegion();
  const { startTour } = useTour();

  function handleTabChange(tab: string) {
    onTabChange(tab);
    setPageKey(k => k + 1);
  }

  function loadScenarioInScrubber(prefill: ScenarioPrefill) {
    setPrefillData(prefill);
    setPrefillKey(k => k + 1);
    handleTabChange("scrubber");
  }

  const dotColor = STATE_DOT_COLORS[stateId];

  return (
    <>
      <OnboardingModal onDone={() => setTimeout(startTour, 800)} />
      <div className="flex h-screen bg-background overflow-hidden">

        {/* Sidebar */}
        <aside className={`flex flex-col bg-sidebar text-sidebar-foreground shrink-0 border-r border-sidebar-border transition-all duration-300 ease-in-out ${collapsed ? "w-16" : "w-64"}`}>
          {/* Logo + collapse toggle */}
          <div className="px-3 py-4 border-b border-sidebar-border flex items-center justify-between gap-2 min-h-[72px]">
            {!collapsed && (
              <div className="bg-white rounded-xl px-3 py-2 inline-flex items-center shrink-0">
                <img src={logoUrl} alt="ClaimFlow" className="h-10 w-auto object-contain" />
              </div>
            )}
            <button
              onClick={() => setCollapsed(c => !c)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors shrink-0 ${collapsed ? "mx-auto" : "ml-auto"}`}
            >
              {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          {/* Practice info — hidden when collapsed */}
          {!collapsed && (
            <div className="px-5 py-3 border-b border-sidebar-border">
              <p className="text-xs text-sidebar-foreground/50 uppercase tracking-wide mb-1">Practice</p>
              <p className="text-xs font-medium text-sidebar-foreground">Northgate Urology Associates</p>
              <p className="text-xs text-sidebar-foreground/60">NPI: 1234567890</p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
                <span className="text-xs text-sidebar-foreground/60">{config.label} region active</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className={`flex-1 px-2 py-4 space-y-1 ${collapsed ? "flex flex-col items-center" : ""}`}>
            {!collapsed && <p className="text-xs text-sidebar-foreground/40 uppercase tracking-wide px-2 mb-2">Main Menu</p>}
            {NAV_ITEMS.map(({ id, label, icon: Icon, badge, tourKey }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  data-tour={tourKey}
                  title={collapsed ? label : undefined}
                  onClick={() => handleTabChange(id)}
                  className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all group ${
                    collapsed ? "w-10 h-10 justify-center p-0" : "w-full px-3 py-2.5"
                  } ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="flex-1 text-left">{label}</span>}
                  {!collapsed && badge && !isActive && (
                    <span className="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 font-semibold leading-none">{badge}</span>
                  )}
                  {!collapsed && isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                </button>
              );
            })}
          </nav>

          {/* Activity feed — hidden when collapsed */}
          {!collapsed && <ActivityFeed />}

          {/* Bottom section */}
          <div className={`px-2 py-4 border-t border-sidebar-border space-y-1 ${collapsed ? "flex flex-col items-center" : ""}`}>
            {/* Notifications */}
            <NotificationsPanel collapsed={collapsed} />

            {/* Settings */}
            <button
              title={collapsed ? "Settings" : undefined}
              onClick={() => handleTabChange("settings")}
              className={`flex items-center gap-3 rounded-lg text-sm transition-colors ${
                collapsed ? "w-10 h-10 justify-center p-0" : "w-full px-3 py-2"
              } ${
                activeTab === "settings"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              {!collapsed && <><span className="flex-1 text-left">Settings</span>{activeTab === "settings" && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}</>}
            </button>

            {/* Tour button — icon-only when collapsed */}
            {!collapsed ? (
              <TourButton />
            ) : (
              <button
                title="Guided Tour"
                onClick={startTour}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
              >
                <Play className="w-4 h-4" />
              </button>
            )}

            {/* About */}
            <button
              title={collapsed ? "About ClaimFlow" : undefined}
              onClick={onShowLanding}
              className={`flex items-center gap-3 rounded-lg text-sm text-sidebar-foreground/40 hover:bg-sidebar-accent hover:text-sidebar-foreground/70 transition-colors ${
                collapsed ? "w-10 h-10 justify-center p-0" : "w-full px-3 py-2"
              }`}
            >
              <Globe className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="flex-1 text-left">About ClaimFlow</span>}
            </button>

            {/* User switcher — avatar-only when collapsed */}
            {!collapsed ? <UserSwitcher /> : <UserSwitcherCollapsed />}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card shrink-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">ClaimFlow</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {activeTab === "settings" ? "Settings" : NAV_ITEMS.find(n => n.id === activeTab)?.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleTabChange("settings")}
                className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 hover:bg-muted px-2.5 py-1 rounded-full transition-colors border border-border"
              >
                <MapPin className="w-3 h-3" />
                <span className={`font-semibold ${dotColor.replace("bg-", "text-")}`}>{config.abbreviation}</span>
                <span>{config.label}</span>
              </button>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full hidden sm:inline">
                Simulated · HIPAA Demo
              </span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            <div key={pageKey} className="page-content h-full">
              {activeTab === "dashboard"  && <Dashboard />}
              {activeTab === "scrubber"   && (
                <ClaimsScrubber
                  onAfterSubmit={() => handleTabChange("timeline")}
                  prefill={prefillData}
                  prefillKey={prefillKey}
                />
              )}
              {activeTab === "analytics"  && <Analytics />}
              {activeTab === "predictive" && <PredictiveAnalytics />}
              {activeTab === "timeline"   && <ClaimsTimeline />}
              {activeTab === "demo"       && <DemoScenarios onLoadInScrubber={loadScenarioInScrubber} />}
              {activeTab === "settings"   && <SettingsPage />}
            </div>
          </main>
        </div>
      </div>

      <div data-tour="ai-assistant-btn">
        <AIAssistant />
      </div>

      <GuidedTour />
    </>
  );
}

// ── AppShell lifts tab state so TourProvider can navigate tabs ─────────────────

function AppShell({ onShowLanding }: { onShowLanding: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as Tab);
  }, []);

  return (
    <TourProvider onTabChange={handleTabChange}>
      <AppShellInner
        onShowLanding={onShowLanding}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </TourProvider>
  );
}

// ── Root App ───────────────────────────────────────────────────────────────────

function App() {
  const [showLanding, setShowLanding] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RegionalProvider>
          <TeamProvider>
            <ClaimStoreProvider>
              {showLanding ? (
                <LandingPage onEnterApp={() => setShowLanding(false)} />
              ) : (
                <AppShell onShowLanding={() => setShowLanding(true)} />
              )}
            </ClaimStoreProvider>
          </TeamProvider>
        </RegionalProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
