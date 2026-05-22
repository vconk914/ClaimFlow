import { useState, useMemo } from "react";
import { Search, Filter, Download, CheckCircle, Clock, ChevronUp, ChevronDown, GitBranch, AlertTriangle, Send, RotateCcw, RefreshCw, ShieldCheck, FilePlus, DollarSign } from "lucide-react";
import type { ClaimStatus } from "@/data/mockData";
import { useClaimStore } from "@/context/ClaimStore";
import ClaimDetailModal from "@/components/ClaimDetailModal";
import type { Claim } from "@/data/mockData";

const STATUS_CONFIG: Record<ClaimStatus, { label: string; bg: string; text: string; icon: any }> = {
  Draft:       { label: "Draft",       bg: "bg-slate-100",   text: "text-slate-700",   icon: FilePlus      },
  Scrubbed:    { label: "Scrubbed",    bg: "bg-blue-100",    text: "text-blue-700",    icon: ShieldCheck   },
  Submitted:   { label: "Submitted",   bg: "bg-violet-100",  text: "text-violet-700",  icon: Send          },
  Pending:     { label: "Pending",     bg: "bg-amber-100",   text: "text-amber-700",   icon: Clock         },
  Denied:      { label: "Denied",      bg: "bg-red-100",     text: "text-red-700",     icon: AlertTriangle },
  Corrected:   { label: "Corrected",   bg: "bg-sky-100",     text: "text-sky-700",     icon: RotateCcw     },
  Resubmitted: { label: "Resubmitted", bg: "bg-indigo-100",  text: "text-indigo-700",  icon: RefreshCw     },
  Approved:    { label: "Approved",    bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle   },
  Paid:        { label: "Paid",        bg: "bg-emerald-600", text: "text-white",        icon: DollarSign    },
};

function StatusBadge({ status }: { status: ClaimStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

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

type SortField = "submittedAt" | "patient" | "amount" | "status";
type SortDir = "asc" | "desc";

const ALL_STATUSES: ClaimStatus[] = [
  "Draft", "Scrubbed", "Submitted", "Pending", "Denied",
  "Corrected", "Resubmitted", "Approved", "Paid",
];

export default function Analytics() {
  const { claims, stats: storeStats } = useClaimStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | "All">("All");
  const [sortField, setSortField] = useState<SortField>("submittedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [viewingClaim, setViewingClaim] = useState<Claim | null>(null);

  const stats = useMemo(() => ({
    total: claims.length,
    approved: storeStats.approved + storeStats.paid,
    denied: storeStats.denied,
    pending: storeStats.pending + storeStats.submitted + storeStats.resubmitted,
    scrubbed: storeStats.scrubbed + storeStats.draft,
    totalRevenue: storeStats.collectedRevenue,
    atRisk: storeStats.revenueAtRisk,
    pendingRevenue: storeStats.pendingRevenue,
    cleanClaimRate: storeStats.cleanClaimRate,
  }), [claims, storeStats]);

  const filtered = useMemo(() => {
    let result = [...claims];
    if (statusFilter !== "All") result = result.filter(c => c.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.patient.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.cpt.includes(q) ||
        c.icd10.toLowerCase().includes(q) ||
        c.payer.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "submittedAt") cmp = a.submittedAt.localeCompare(b.submittedAt);
      else if (sortField === "patient") cmp = a.patient.localeCompare(b.patient);
      else if (sortField === "amount") cmp = a.amount - b.amount;
      else if (sortField === "status") cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [claims, statusFilter, search, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronUp className="w-3.5 h-3.5 text-muted-foreground/40" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3.5 h-3.5 text-primary" />
      : <ChevronDown className="w-3.5 h-3.5 text-primary" />;
  }

  function downloadCsv() {
    const header = "Claim ID,Patient,DOB,CPT,ICD-10,Payer,Amount,Status,Submitted,Rejection Reason";
    const rows = filtered.map(c =>
      `${c.id},"${c.patient}",${c.dob},${c.cpt},${c.icd10},${c.payer},$${c.amount},${c.status},${new Date(c.submittedAt).toLocaleDateString()},"${c.rejectionReason ?? ""}"`
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "claims-log.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Claims Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Full history of submitted claims and their processing status</p>
        </div>
        <button
          onClick={downloadCsv}
          className="flex items-center gap-2 border border-border bg-card hover:bg-muted text-foreground rounded-xl px-4 py-2 text-sm font-medium transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
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
          value={stats.approved}
          sub={`$${stats.totalRevenue.toLocaleString("en-US")} collected`}
          colorClass="bg-emerald-50 border-emerald-200 text-emerald-800"
        />
        <KpiCard
          label="Denied"
          value={stats.denied}
          sub={`$${stats.atRisk.toLocaleString("en-US")} at risk`}
          colorClass="bg-red-50 border-red-200 text-red-800"
        />
        <KpiCard
          label="In Progress"
          value={stats.pending}
          sub={`$${stats.pendingRevenue.toLocaleString("en-US")} pending`}
          colorClass="bg-amber-50 border-amber-200 text-amber-800"
        />
      </div>

      {/* Table card */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Filters toolbar */}
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Search patient, ID, CPT, payer…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex flex-wrap gap-1">
              {(["All", ...ALL_STATUSES] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s as ClaimStatus | "All")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs text-muted-foreground self-center ml-auto shrink-0">{filtered.length} claims</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Claim ID</th>
                <th
                  className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none"
                  onClick={() => toggleSort("patient")}
                >
                  <span className="flex items-center gap-1">Patient <SortIcon field="patient" /></span>
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">CPT / ICD-10</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payer</th>
                <th
                  className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none"
                  onClick={() => toggleSort("amount")}
                >
                  <span className="flex items-center justify-end gap-1">Amount <SortIcon field="amount" /></span>
                </th>
                <th
                  className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none"
                  onClick={() => toggleSort("status")}
                >
                  <span className="flex items-center gap-1">Status <SortIcon field="status" /></span>
                </th>
                <th
                  className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none"
                  onClick={() => toggleSort("submittedAt")}
                >
                  <span className="flex items-center gap-1">Submitted <SortIcon field="submittedAt" /></span>
                </th>
                <th className="px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Journey</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm text-muted-foreground">
                    No claims match your search.
                  </td>
                </tr>
              )}
              {filtered.map(claim => (
                <tr key={claim.id} className="hover:bg-muted/40 transition-colors group">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs font-medium text-primary">{claim.id}</span>
                  </td>
                  <td className="px-3 py-3.5">
                    <p className="font-medium text-foreground text-sm">{claim.patient}</p>
                    <p className="text-xs text-muted-foreground">{claim.insuranceId}</p>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{claim.cpt}</span>
                    <span className="mx-1 text-muted-foreground">/</span>
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{claim.icd10}</span>
                  </td>
                  <td className="px-3 py-3.5 text-sm text-foreground">{claim.payer}</td>
                  <td className="px-3 py-3.5 text-right">
                    <span className="text-sm font-semibold text-foreground">${claim.amount.toFixed(2)}</span>
                  </td>
                  <td className="px-3 py-3.5">
                    <div>
                      <StatusBadge status={claim.status} />
                      {claim.denialCode && (
                        <span className="ml-1.5 text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">{claim.denialCode}</span>
                      )}
                      {claim.rejectionReason && (
                        <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">{claim.rejectionReason}</p>
                      )}
                      {claim.scrubScore !== undefined && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-10 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${claim.scrubScore >= 85 ? "bg-emerald-500" : claim.scrubScore >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${claim.scrubScore}%` }}
                            />
                          </div>
                          <span className={`text-[10px] font-bold ${claim.scrubScore >= 85 ? "text-emerald-600" : claim.scrubScore >= 60 ? "text-amber-600" : "text-red-600"}`}>{claim.scrubScore}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(claim.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    <br />
                    {new Date(claim.submittedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </td>
                  <td className="px-3 py-3.5">
                    <button
                      onClick={() => setViewingClaim(claim)}
                      className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors whitespace-nowrap"
                    >
                      <GitBranch className="w-3 h-3" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {viewingClaim && (() => {
        const live = claims.find(c => c.id === viewingClaim.id) ?? viewingClaim;
        return <ClaimDetailModal claim={live} onClose={() => setViewingClaim(null)} />;
      })()}
    </div>
  );
}
