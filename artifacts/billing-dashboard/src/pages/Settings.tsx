import { useState } from "react";
import {
  Globe, Shield, Briefcase, Heart, AlertTriangle,
  CheckCircle2, Info, ChevronDown, ChevronUp, Building2,
  FileText, Clock, TrendingUp, MapPin,
} from "lucide-react";
import { useRegion } from "@/context/RegionalContext";
import { STATE_OPTIONS, type StateId } from "@/data/regionalData";

const IMPACT_BADGE: Record<string, string> = {
  high:   "bg-red-100 text-red-700 border border-red-200",
  medium: "bg-amber-100 text-amber-700 border border-amber-200",
  low:    "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

const CATEGORY_ICON: Record<string, any> = {
  "prior-auth":    Shield,
  "timely-filing": Clock,
  "no-fault":      AlertTriangle,
  "workers-comp":  Briefcase,
  "medicaid":      Heart,
  "billing":       FileText,
  "audit":         AlertTriangle,
};

const PAYER_TYPE_BADGE: Record<string, string> = {
  "commercial":   "bg-blue-100 text-blue-700",
  "medicaid":     "bg-violet-100 text-violet-700",
  "medicare":     "bg-sky-100 text-sky-700",
  "workers-comp": "bg-orange-100 text-orange-700",
  "no-fault":     "bg-amber-100 text-amber-700",
  "managed-care": "bg-teal-100 text-teal-700",
};

const STATE_COLORS: Record<StateId, { ring: string; bg: string; text: string; dot: string; active: string }> = {
  national: { ring: "ring-blue-500",   bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500",   active: "bg-blue-600 text-white border-blue-600" },
  ny:       { ring: "ring-indigo-500", bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500", active: "bg-indigo-600 text-white border-indigo-600" },
  fl:       { ring: "ring-orange-500", bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500", active: "bg-orange-600 text-white border-orange-600" },
  ca:       { ring: "ring-amber-500",  bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-500",  active: "bg-amber-600 text-white border-amber-600" },
  tx:       { ring: "ring-red-500",    bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500",    active: "bg-red-600 text-white border-red-600" },
};

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4.5 h-4.5 text-muted-foreground" style={{ width: 18, height: 18 }} />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function CollapsiblePanel({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
      >
        <span className="text-sm font-medium text-foreground">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

export default function Settings() {
  const { stateId, config, setStateId } = useRegion();
  const colors = STATE_COLORS[stateId];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure ClaimFlow for your practice region and billing environment.</p>
      </div>

      {/* ── Regional Intelligence ─────────────────────────────────── */}
      <section className="space-y-5">
        <SectionHeader
          icon={Globe}
          title="Regional Intelligence"
          subtitle="Select your state to load region-specific payer profiles, denial patterns, and billing workflow rules."
        />

        {/* State selector */}
        <div className="grid grid-cols-5 gap-3">
          {STATE_OPTIONS.map(opt => {
            const active = opt.id === stateId;
            const c = STATE_COLORS[opt.id];
            return (
              <button
                key={opt.id}
                onClick={() => setStateId(opt.id)}
                className={`relative flex flex-col items-center gap-2 px-3 py-4 rounded-xl border-2 transition-all text-center ${
                  active
                    ? `${c.active} shadow-sm`
                    : "border-border bg-card text-foreground hover:border-muted-foreground/40 hover:bg-muted/30"
                }`}
              >
                <span className={`text-lg font-bold tracking-tight ${active ? "text-white" : ""}`}>
                  {opt.abbreviation}
                </span>
                <span className={`text-xs font-medium leading-tight ${active ? "text-white/90" : "text-muted-foreground"}`}>
                  {opt.label}
                </span>
                {active && (
                  <span className="absolute top-2 right-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white/80" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active region card */}
        <div className={`rounded-xl border-2 ${colors.ring.replace("ring-", "border-")} ${colors.bg} p-5`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${colors.dot} flex items-center justify-center shrink-0`}>
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`text-base font-semibold ${colors.text}`}>{config.label}</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.ring.replace("ring-", "border-")}`}>
                  {config.abbreviation}
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  Active
                </span>
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed">{config.description}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {config.payers.length} payer profiles loaded
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  {config.workflowRules.length} workflow rules active
                </span>
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {config.denialPatterns.length} denial patterns loaded
                </span>
                {config.noFault.applicable && (
                  <span className="flex items-center gap-1.5 text-amber-600">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    No-Fault / PIP rules active
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Active Payer Network ──────────────────────────────────── */}
      <section className="space-y-5">
        <SectionHeader
          icon={Building2}
          title="Active Payer Network"
          subtitle="Regional payer profiles loaded for your selected state — sorted by market share."
        />

        <div className="border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1.5fr_1fr_auto_auto_auto] gap-0 text-xs font-medium text-muted-foreground bg-muted/40 px-4 py-2.5 border-b border-border">
            <span>Payer</span>
            <span>Type</span>
            <span className="text-right">Market Share</span>
            <span className="text-right">Denial Rate</span>
            <span className="text-right">Avg Days</span>
          </div>
          {config.payers.map((payer, i) => (
            <div
              key={payer.name}
              className={`grid grid-cols-[1.5fr_1fr_auto_auto_auto] gap-0 px-4 py-3 items-center text-sm ${i % 2 === 0 ? "" : "bg-muted/20"} ${i < config.payers.length - 1 ? "border-b border-border/50" : ""} group`}
            >
              <div>
                <p className="font-medium text-foreground text-xs">{payer.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug group-hover:line-clamp-none line-clamp-1">{payer.notes}</p>
              </div>
              <div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PAYER_TYPE_BADGE[payer.type] ?? "bg-slate-100 text-slate-600"}`}>
                  {payer.type.replace("-", " ")}
                </span>
              </div>
              <div className="text-right">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-semibold text-foreground">{payer.marketShare}%</span>
                  <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${colors.dot}`} style={{ width: `${payer.marketShare * 3.5}%` }} />
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs font-semibold ${payer.denialRate >= 18 ? "text-red-600" : payer.denialRate >= 12 ? "text-amber-600" : "text-emerald-600"}`}>
                  {payer.denialRate}%
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-foreground">{payer.avgDaysToPayment}d</span>
              </div>
            </div>
          ))}
        </div>

        {/* Denial pattern summary */}
        <div className="grid grid-cols-5 gap-3">
          {config.denialPatterns.map(dp => (
            <div key={dp.category} className="bg-card border border-border rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">{dp.percentage}%</span>
                {dp.stateSpecific && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">State</span>
                )}
              </div>
              <p className="text-xs font-medium text-foreground leading-tight">{dp.category}</p>
              <p className="text-xs text-muted-foreground leading-snug">{dp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Workflow Rules ────────────────────────────────────────── */}
      <section className="space-y-5">
        <SectionHeader
          icon={Shield}
          title="State-Specific Workflow Rules"
          subtitle="Billing workflow rules and compliance requirements active for your selected region."
        />

        <div className="space-y-3">
          {config.workflowRules.map(rule => {
            const Icon = CATEGORY_ICON[rule.category] ?? Info;
            return (
              <div key={rule.id} className="bg-card border border-border rounded-xl p-4 flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">{rule.title}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${IMPACT_BADGE[rule.impact]}`}>
                      {rule.impact} impact
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {rule.category.replace("-", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rule.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Specialized Programs ──────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader
          icon={FileText}
          title="Specialized Program Rules"
          subtitle="Workers' compensation, Medicaid, and no-fault insurance rules for your region."
        />

        <div className="space-y-4">
          {/* Workers' Comp */}
          <CollapsiblePanel title={`Workers' Compensation — ${config.workersComp.program}`}>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Administrator</p>
                  <p className="text-xs text-foreground">{config.workersComp.administrator}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Fee Schedule</p>
                  <p className="text-xs text-foreground">{config.workersComp.feeSchedule}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-xs text-foreground">{config.workersComp.notes}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Common Denials</p>
                  <ul className="space-y-1.5">
                    {config.workersComp.commonDenials.map((d, i) => (
                      <li key={i} className="flex gap-2 text-xs text-foreground/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Billing Rules</p>
                  <ul className="space-y-1.5">
                    {config.workersComp.billingRules.map((r, i) => (
                      <li key={i} className="flex gap-2 text-xs text-foreground/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CollapsiblePanel>

          {/* Medicaid */}
          <CollapsiblePanel title={`Medicaid — ${config.medicaid.program}`}>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Administrator</p>
                  <p className="text-xs text-foreground">{config.medicaid.administrator}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Model</p>
                  <p className="text-xs text-foreground">{config.medicaid.managedCare ? "Managed Care (MCO)" : "Fee-for-Service (FFS)"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Prior Auth Threshold</p>
                  <p className="text-xs text-foreground">{config.medicaid.priorAuthThreshold}</p>
                </div>
              </div>
              <p className="text-xs text-foreground/70 leading-relaxed border-l-2 border-violet-300 pl-3">{config.medicaid.notes}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Common Denials</p>
                  <ul className="space-y-1.5">
                    {config.medicaid.commonDenials.map((d, i) => (
                      <li key={i} className="flex gap-2 text-xs text-foreground/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Billing Rules</p>
                  <ul className="space-y-1.5">
                    {config.medicaid.billingRules.map((r, i) => (
                      <li key={i} className="flex gap-2 text-xs text-foreground/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CollapsiblePanel>

          {/* No-Fault */}
          <CollapsiblePanel title={`No-Fault / PIP — ${config.noFault.program ?? "Not Applicable"}`}>
            {config.noFault.applicable ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Statute</p>
                    <p className="text-xs text-foreground">{config.noFault.statute}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Billing Deadline</p>
                    <p className="text-xs font-semibold text-red-600">{config.noFault.billingDeadlineDays} days from date of service</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
                    <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">Active in {config.abbreviation}</span>
                  </div>
                </div>
                <p className="text-xs text-foreground/70 leading-relaxed border-l-2 border-amber-300 pl-3">{config.noFault.notes}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Common Denials</p>
                    <ul className="space-y-1.5">
                      {(config.noFault.commonDenials ?? []).map((d, i) => (
                        <li key={i} className="flex gap-2 text-xs text-foreground/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Key Rules</p>
                    <ul className="space-y-1.5">
                      {(config.noFault.keyRules ?? []).map((r, i) => (
                        <li key={i} className="flex gap-2 text-xs text-foreground/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-muted/40 rounded-lg">
                  <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground mb-1">{config.noFault.program}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{config.noFault.notes}</p>
                  </div>
                </div>
                {config.noFault.keyRules && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Key Points</p>
                    <ul className="space-y-1.5">
                      {config.noFault.keyRules.map((r, i) => (
                        <li key={i} className="flex gap-2 text-xs text-foreground/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CollapsiblePanel>
        </div>
      </section>
    </div>
  );
}
