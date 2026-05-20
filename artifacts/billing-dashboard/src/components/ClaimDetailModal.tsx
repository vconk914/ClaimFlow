import { useState } from "react";
import {
  X, CheckCircle2, Clock, AlertTriangle, DollarSign, Send, RotateCcw, RefreshCw,
  ShieldCheck, FilePlus, Activity, ChevronRight, Zap, FileText,
} from "lucide-react";
import type { Claim, ClaimStatus } from "@/data/mockData";
import { useClaimStore } from "@/context/ClaimStore";

// ─── Status configuration ─────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ClaimStatus, {
  label: string; bg: string; text: string; border: string; icon: any;
}> = {
  Draft:       { label: "Draft",       bg: "bg-slate-100",   text: "text-slate-700",   border: "border-slate-200",   icon: FilePlus     },
  Scrubbed:    { label: "Scrubbed",    bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200",    icon: ShieldCheck  },
  Submitted:   { label: "Submitted",   bg: "bg-violet-100",  text: "text-violet-700",  border: "border-violet-200",  icon: Send         },
  Pending:     { label: "Pending",     bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200",   icon: Clock        },
  Denied:      { label: "Denied",      bg: "bg-red-100",     text: "text-red-700",     border: "border-red-200",     icon: AlertTriangle},
  Corrected:   { label: "Corrected",   bg: "bg-sky-100",     text: "text-sky-700",     border: "border-sky-200",     icon: RotateCcw    },
  Resubmitted: { label: "Resubmitted", bg: "bg-indigo-100",  text: "text-indigo-700",  border: "border-indigo-200",  icon: RefreshCw    },
  Approved:    { label: "Approved",    bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2 },
  Paid:        { label: "Paid",        bg: "bg-emerald-600", text: "text-white",        border: "border-emerald-700", icon: DollarSign   },
};

// Valid next statuses from each status
const NEXT_STATUSES: Partial<Record<ClaimStatus, { status: ClaimStatus; label: string; note: string }[]>> = {
  Draft:       [{ status: "Scrubbed",  label: "Run AI Scrub",   note: "Claim submitted for AI coding analysis." }],
  Scrubbed:    [{ status: "Submitted", label: "Submit to Payer", note: "837P transmitted via clearinghouse." }],
  Submitted:   [{ status: "Pending",   label: "Mark Pending",   note: "Payer received claim, adjudication started." },
                { status: "Denied",    label: "Mark Denied",    note: "Payer issued denial." }],
  Pending:     [{ status: "Approved",  label: "Mark Approved",  note: "Payer approved the claim. ERA received." },
                { status: "Denied",    label: "Mark Denied",    note: "Payer issued denial." }],
  Denied:      [{ status: "Corrected", label: "Mark Corrected", note: "Coding/documentation corrected per denial reason." }],
  Corrected:   [{ status: "Resubmitted", label: "Resubmit",    note: "Corrected claim resubmitted (CCI 7)." }],
  Resubmitted: [{ status: "Approved",  label: "Mark Approved",  note: "Payer approved resubmission. ERA received." },
                { status: "Denied",    label: "Mark Denied Again", note: "Payer denied resubmission." }],
  Approved:    [{ status: "Paid",      label: "Mark Paid",      note: "EFT deposited to practice bank account." }],
  Paid:        [],
};

const SCORE_COLOR = (s: number) =>
  s >= 85 ? "text-emerald-600" : s >= 60 ? "text-amber-600" : "text-red-600";
const SCORE_BG = (s: number) =>
  s >= 85 ? "bg-emerald-500" : s >= 60 ? "bg-amber-500" : "bg-red-500";

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ClaimStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ─── Timeline event row ───────────────────────────────────────────────────────

function TimelineRow({ event, isLast }: { event: NonNullable<Claim["timeline"]>[number]; isLast: boolean }) {
  const cfg = STATUS_CONFIG[event.status];
  const Icon = cfg.icon;
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
          <Icon className={`w-3.5 h-3.5 ${cfg.text}`} />
        </div>
        {!isLast && <div className="w-px flex-1 my-1 bg-border min-h-[16px]" />}
      </div>
      <div className="flex-1 pb-3 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
          {event.actor && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {event.actor}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
            {new Date(event.timestamp).toLocaleDateString("en-US", {
              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{event.note}</p>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface Props {
  claim: Claim;
  onClose: () => void;
}

export default function ClaimDetailModal({ claim, onClose }: Props) {
  const { updateStatus } = useClaimStore();
  const [confirmNext, setConfirmNext] = useState<{ status: ClaimStatus; label: string; note: string } | null>(null);
  const [tab, setTab] = useState<"timeline" | "details">("timeline");

  const cfg        = STATUS_CONFIG[claim.status];
  const nextSteps  = NEXT_STATUSES[claim.status] ?? [];
  const timeline   = claim.timeline ?? [];

  function handleAdvance(next: { status: ClaimStatus; label: string; note: string }) {
    updateStatus(claim.id, next.status, next.note, "Billing Team");
    setConfirmNext(null);
  }

  const scoreVal = claim.scrubScore;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-start gap-4 shrink-0 bg-card">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-bold text-primary">{claim.id}</span>
              <StatusBadge status={claim.status} />
              {claim.denialCode && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                  {claim.denialCode}
                </span>
              )}
            </div>
            <p className="text-lg font-bold text-foreground leading-tight">{claim.patient}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {claim.payer} · {claim.insuranceId}
              {claim.specialty && ` · ${claim.specialty}`}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-foreground">${claim.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-muted-foreground">Billed amount</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Claim codes */}
        <div className="px-6 py-3 bg-muted/30 border-b border-border flex flex-wrap gap-4 shrink-0">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">CPT</p>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-foreground bg-card border border-border px-2 py-0.5 rounded">{claim.cpt}</span>
              {claim.cptDescription && <span className="text-xs text-muted-foreground">{claim.cptDescription}</span>}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">ICD-10</p>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-foreground bg-card border border-border px-2 py-0.5 rounded">{claim.icd10}</span>
              {claim.icd10Description && <span className="text-xs text-muted-foreground">{claim.icd10Description}</span>}
            </div>
          </div>
          {scoreVal !== undefined && (
            <div className="ml-auto">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Health Score</p>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${SCORE_BG(scoreVal)}`}
                    style={{ width: `${scoreVal}%` }}
                  />
                </div>
                <span className={`text-xs font-bold ${SCORE_COLOR(scoreVal)}`}>{scoreVal}/100</span>
                {(claim.scrubErrorCount ?? 0) > 0 && (
                  <span className="text-[10px] text-red-600 font-medium">{claim.scrubErrorCount} error{claim.scrubErrorCount !== 1 ? "s" : ""}</span>
                )}
                {(claim.scrubWarningCount ?? 0) > 0 && (
                  <span className="text-[10px] text-amber-600 font-medium">{claim.scrubWarningCount} warning{claim.scrubWarningCount !== 1 ? "s" : ""}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Next actions banner */}
        {nextSteps.length > 0 && !confirmNext && (
          <div className="px-6 py-3 bg-primary/5 border-b border-primary/10 flex items-center gap-3 shrink-0">
            <Zap className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-semibold text-primary flex-1">Next actions available</span>
            <div className="flex gap-2">
              {nextSteps.map(next => (
                <button
                  key={next.status}
                  onClick={() => setConfirmNext(next)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    next.status === "Denied"
                      ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {next.label}
                  <ChevronRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Confirm advance */}
        {confirmNext && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex items-center gap-3 shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-amber-800">
                Advance to <strong>{confirmNext.label}</strong>?
              </p>
              <p className="text-[10px] text-amber-700">{confirmNext.note}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleAdvance(confirmNext)}
                className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmNext(null)}
                className="px-3 py-1.5 bg-card border border-border text-muted-foreground rounded-lg text-xs font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="px-6 py-2 border-b border-border flex gap-4 shrink-0 bg-card">
          {(["timeline", "details"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs font-semibold pb-1 border-b-2 transition-colors capitalize ${
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "timeline" ? "Claim Journey" : "Claim Details"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {tab === "timeline" && (
            <div className="px-6 py-5">
              {timeline.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No timeline events yet.
                </div>
              ) : (
                <div>
                  {timeline.map((event, i) => (
                    <TimelineRow key={event.id} event={event} isLast={i === timeline.length - 1} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "details" && (
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Patient Name",   value: claim.patient },
                  { label: "Date of Birth",  value: new Date(claim.dob + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
                  { label: "Insurance ID",   value: claim.insuranceId },
                  { label: "Payer",          value: claim.payer },
                  { label: "Specialty",      value: claim.specialty ?? "—" },
                  { label: "Billed Amount",  value: `$${claim.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
                  { label: "Submitted",      value: new Date(claim.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
                  { label: "Created",        value: claim.createdAt ? new Date(claim.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—" },
                ].map(row => (
                  <div key={row.label} className="bg-muted/30 rounded-lg px-3 py-2.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{row.label}</p>
                    <p className="text-sm font-medium text-foreground">{row.value}</p>
                  </div>
                ))}
              </div>

              {claim.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-red-700 mb-1">
                        Denial / Rejection Reason
                        {claim.denialCode && <span className="ml-2 font-mono bg-red-100 px-1.5 py-0.5 rounded text-[10px]">{claim.denialCode}</span>}
                      </p>
                      <p className="text-xs text-red-700">{claim.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {claim.status === "Paid" && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-emerald-700">Payment Received</p>
                      <p className="text-sm font-bold text-emerald-800">
                        ${(claim.amount * 0.78).toLocaleString("en-US", { minimumFractionDigits: 2 })} collected
                      </p>
                      <p className="text-xs text-emerald-600">
                        Patient balance: ${(claim.amount * 0.22).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground mb-2">Coding Details</p>
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground w-14 shrink-0 pt-0.5">CPT</span>
                        <div>
                          <span className="font-mono text-xs font-bold text-primary">{claim.cpt}</span>
                          {claim.cptDescription && <span className="text-xs text-muted-foreground ml-2">— {claim.cptDescription}</span>}
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground w-14 shrink-0 pt-0.5">ICD-10</span>
                        <div>
                          <span className="font-mono text-xs font-bold text-primary">{claim.icd10}</span>
                          {claim.icd10Description && <span className="text-xs text-muted-foreground ml-2">— {claim.icd10Description}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center justify-between shrink-0">
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(
              claim.timeline?.at(-1)?.timestamp ?? claim.submittedAt
            ).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
          <button
            onClick={onClose}
            className="text-xs font-medium text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
