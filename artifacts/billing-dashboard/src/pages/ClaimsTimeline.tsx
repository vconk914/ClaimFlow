import { useState, useMemo } from "react";
import {
  Activity, Search, ChevronRight, CheckCircle2, Clock, AlertTriangle,
  DollarSign, Send, RotateCcw, RefreshCw, ShieldCheck, FilePlus,
} from "lucide-react";
import type { Claim, ClaimStatus } from "@/data/mockData";
import { useClaimStore } from "@/context/ClaimStore";
import ClaimDetailModal from "@/components/ClaimDetailModal";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ClaimStatus, {
  label: string; bg: string; text: string; border: string; icon: any; dot: string;
}> = {
  Draft:       { label: "Draft",       bg: "bg-slate-100",   text: "text-slate-700",   border: "border-slate-200",   icon: FilePlus,      dot: "bg-slate-400"   },
  Scrubbed:    { label: "Scrubbed",    bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200",    icon: ShieldCheck,   dot: "bg-blue-500"    },
  Submitted:   { label: "Submitted",   bg: "bg-violet-100",  text: "text-violet-700",  border: "border-violet-200",  icon: Send,          dot: "bg-violet-500"  },
  Pending:     { label: "Pending",     bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200",   icon: Clock,         dot: "bg-amber-500"   },
  Denied:      { label: "Denied",      bg: "bg-red-100",     text: "text-red-700",     border: "border-red-200",     icon: AlertTriangle, dot: "bg-red-500"     },
  Corrected:   { label: "Corrected",   bg: "bg-sky-100",     text: "text-sky-700",     border: "border-sky-200",     icon: RotateCcw,     dot: "bg-sky-500"     },
  Resubmitted: { label: "Resubmitted", bg: "bg-indigo-100",  text: "text-indigo-700",  border: "border-indigo-200",  icon: RefreshCw,     dot: "bg-indigo-500"  },
  Approved:    { label: "Approved",    bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2,  dot: "bg-emerald-500" },
  Paid:        { label: "Paid",        bg: "bg-emerald-600", text: "text-white",        border: "border-emerald-700", icon: DollarSign,    dot: "bg-emerald-700" },
};

const STATUS_ORDER: ClaimStatus[] = [
  "Draft", "Scrubbed", "Submitted", "Pending", "Denied",
  "Corrected", "Resubmitted", "Approved", "Paid",
];

const SCORE_COLOR = (s: number) =>
  s >= 85 ? "text-emerald-600" : s >= 60 ? "text-amber-600" : "text-red-600";
const SCORE_BG = (s: number) =>
  s >= 85 ? "bg-emerald-500" : s >= 60 ? "bg-amber-500" : "bg-red-500";

// ─── Lifecycle progress bar ───────────────────────────────────────────────────

function LifecycleBar({ status }: { status: ClaimStatus }) {
  const currentIdx = STATUS_ORDER.indexOf(status);
  const terminalStatuses: ClaimStatus[] = ["Paid", "Denied"];
  const positiveFlow: ClaimStatus[] = ["Draft", "Scrubbed", "Submitted", "Pending", "Approved", "Paid"];
  const inPositiveFlow = positiveFlow.includes(status);
  const pct = inPositiveFlow
    ? Math.round(((positiveFlow.indexOf(status) + 1) / positiveFlow.length) * 100)
    : 40;

  const barColor = status === "Denied" || status === "Corrected"
    ? "bg-red-400"
    : status === "Resubmitted"
    ? "bg-indigo-400"
    : status === "Approved" || status === "Paid"
    ? "bg-emerald-500"
    : "bg-primary";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground shrink-0">{pct}%</span>
    </div>
  );
}

// ─── Claim card ───────────────────────────────────────────────────────────────

function ClaimCard({ claim, onClick }: { claim: Claim; onClick: () => void }) {
  const cfg = STATUS_CONFIG[claim.status];
  const Icon = cfg.icon;
  const lastEvent = claim.timeline?.at(-1);

  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
            <Icon className={`w-4 h-4 ${cfg.text}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-mono text-xs font-bold text-primary">{claim.id}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                <Icon className="w-2.5 h-2.5" />
                {cfg.label}
              </span>
              {claim.denialCode && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                  {claim.denialCode}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-foreground truncate">{claim.patient}</p>
            <p className="text-xs text-muted-foreground">
              {claim.payer}
              {claim.specialty && ` · ${claim.specialty}`}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-foreground">${claim.amount.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">billed</p>
        </div>
      </div>

      {/* Codes row */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium">{claim.cpt}</span>
        {claim.cptDescription && (
          <span className="text-[10px] text-muted-foreground truncate">{claim.cptDescription}</span>
        )}
        <span className="text-muted-foreground/40 mx-1">/</span>
        <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium">{claim.icd10}</span>
      </div>

      {/* Lifecycle bar */}
      <LifecycleBar status={claim.status} />

      {/* Score + last event */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
        {claim.scrubScore !== undefined ? (
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-muted-foreground" />
            <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${SCORE_BG(claim.scrubScore)}`} style={{ width: `${claim.scrubScore}%` }} />
            </div>
            <span className={`text-[10px] font-bold ${SCORE_COLOR(claim.scrubScore)}`}>{claim.scrubScore}</span>
          </div>
        ) : (
          <span className="text-[10px] text-muted-foreground italic">Not yet scrubbed</span>
        )}
        {lastEvent && (
          <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
            {new Date(lastEvent.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {lastEvent.note.slice(0, 50)}{lastEvent.note.length > 50 ? "…" : ""}
          </p>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
      </div>
    </div>
  );
}

// ─── Summary KPI card ─────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, colorClass }: {
  label: string; value: string | number; sub: string; colorClass?: string;
}) {
  return (
    <div className={`rounded-xl p-4 border ${colorClass ?? "bg-card border-border"}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide mb-1 opacity-70">{label}</p>
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className="text-xs mt-1 opacity-60">{sub}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const ALL_STATUSES: ClaimStatus[] = [
  "Draft", "Scrubbed", "Submitted", "Pending", "Denied",
  "Corrected", "Resubmitted", "Approved", "Paid",
];

type SortMode = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

export default function ClaimsTimeline() {
  const { claims, stats } = useClaimStore();
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | "All">("All");
  const [payerFilter, setPayerFilter]   = useState<string>("All");
  const [sortMode, setSortMode]         = useState<SortMode>("date-desc");
  const [viewingClaim, setViewingClaim] = useState<Claim | null>(null);

  const payers = useMemo(() => {
    const set = new Set(claims.map(c => c.payer));
    return ["All", ...Array.from(set).sort()];
  }, [claims]);

  const filtered = useMemo(() => {
    let result = [...claims];
    if (statusFilter !== "All") result = result.filter(c => c.status === statusFilter);
    if (payerFilter !== "All")  result = result.filter(c => c.payer === payerFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.patient.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.cpt.includes(q) ||
        c.icd10.toLowerCase().includes(q) ||
        c.payer.toLowerCase().includes(q) ||
        (c.specialty ?? "").toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      if (sortMode === "date-desc")   return b.submittedAt.localeCompare(a.submittedAt);
      if (sortMode === "date-asc")    return a.submittedAt.localeCompare(b.submittedAt);
      if (sortMode === "amount-desc") return b.amount - a.amount;
      return a.amount - b.amount;
    });
    return result;
  }, [claims, statusFilter, payerFilter, search, sortMode]);

  // When viewing a claim via modal, keep it updated from the store
  const viewingClaimLive = useMemo(
    () => viewingClaim ? claims.find(c => c.id === viewingClaim.id) ?? viewingClaim : null,
    [viewingClaim, claims],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Claims Timeline</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Full lifecycle view of all claims — track every status change in real time
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard
          label="Total Claims"
          value={stats.total}
          sub={`${stats.cleanClaimRate}% clean claim rate`}
        />
        <KpiCard
          label="Approved / Paid"
          value={stats.approved + stats.paid}
          sub={`${stats.paid} fully collected`}
          colorClass="bg-emerald-50 border-emerald-200 text-emerald-800"
        />
        <KpiCard
          label="Denied"
          value={stats.denied}
          sub={`$${stats.revenueAtRisk.toLocaleString()} at risk`}
          colorClass="bg-red-50 border-red-200 text-red-800"
        />
        <KpiCard
          label="In Progress"
          value={stats.pending + stats.submitted + stats.resubmitted}
          sub={`${stats.resubmitted} resubmitted`}
          colorClass="bg-amber-50 border-amber-200 text-amber-800"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Search patient, ID, CPT, payer, specialty…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Payer filter */}
        <select
          value={payerFilter}
          onChange={e => setPayerFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {payers.map(p => <option key={p} value={p}>{p === "All" ? "All Payers" : p}</option>)}
        </select>

        {/* Sort */}
        <select
          value={sortMode}
          onChange={e => setSortMode(e.target.value as SortMode)}
          className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
        </select>

        <span className="text-xs text-muted-foreground self-center shrink-0">{filtered.length} claims</span>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2 -mt-2">
        <button
          onClick={() => setStatusFilter("All")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
            statusFilter === "All"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        {ALL_STATUSES.map(s => {
          const cfg = STATUS_CONFIG[s];
          const count = claims.filter(c => c.status === s).length;
          if (!count) return null;
          const isActive = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(isActive ? "All" : s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                isActive
                  ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
              <span className={`text-[10px] px-1 rounded ${isActive ? "bg-black/10" : "bg-muted"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Claims grid */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Activity className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">No claims match your filters.</p>
          <button
            onClick={() => { setSearch(""); setStatusFilter("All"); setPayerFilter("All"); }}
            className="mt-3 text-xs text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(claim => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              onClick={() => setViewingClaim(claim)}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {viewingClaimLive && (
        <ClaimDetailModal
          claim={viewingClaimLive}
          onClose={() => setViewingClaim(null)}
        />
      )}
    </div>
  );
}
