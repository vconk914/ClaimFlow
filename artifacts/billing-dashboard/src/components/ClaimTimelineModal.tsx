import { X, CheckCircle2, Clock, AlertTriangle, FileText, Send, DollarSign, RotateCcw, RefreshCw, ShieldCheck, FilePlus } from "lucide-react";
import type { Claim } from "@/data/mockData";

// ─── Timeline stage definitions ───────────────────────────────────────────────

type StageStatus = "completed" | "active" | "pending" | "denied" | "skipped";

interface TimelineStage {
  id:         string;
  label:      string;
  icon:       any;
  iconBg:     string;
  iconText:   string;
  description: string;
}

const ALL_STAGES: TimelineStage[] = [
  { id: "created",       label: "Claim Created",         icon: FilePlus,     iconBg: "bg-slate-100",    iconText: "text-slate-600",    description: "Claim entered into billing system from encounter documentation." },
  { id: "scrubbed",      label: "AI Scrubbed",           icon: ShieldCheck,  iconBg: "bg-blue-100",     iconText: "text-blue-600",     description: "ClaimFlow AI analyzed CPT/ICD-10 compatibility, modifier accuracy, and payer rules." },
  { id: "submitted",     label: "Submitted to Payer",    icon: Send,         iconBg: "bg-violet-100",   iconText: "text-violet-600",   description: "Claim transmitted via clearinghouse. 837P file acknowledged." },
  { id: "payer-review",  label: "Payer Review",          icon: Clock,        iconBg: "bg-amber-100",    iconText: "text-amber-600",    description: "Payer adjudicating claim. Standard processing window: 14–30 days." },
  { id: "documentation", label: "Documentation Request", icon: FileText,     iconBg: "bg-orange-100",   iconText: "text-orange-600",   description: "Payer requested additional clinical documentation before making a coverage decision." },
  { id: "denied",        label: "Claim Denied",          icon: AlertTriangle,iconBg: "bg-red-100",      iconText: "text-red-600",      description: "Payer issued denial. Appeal rights available within 90 days of denial date." },
  { id: "corrected",     label: "Claim Corrected",       icon: RotateCcw,    iconBg: "bg-sky-100",      iconText: "text-sky-600",      description: "Billing team corrected the claim coding or documentation per denial reason code." },
  { id: "resubmitted",   label: "Resubmitted",           icon: RefreshCw,    iconBg: "bg-indigo-100",   iconText: "text-indigo-600",   description: "Corrected claim resubmitted to payer. Corrected claim indicator (CCI 7) applied." },
  { id: "approved",      label: "Approved",              icon: CheckCircle2, iconBg: "bg-emerald-100",  iconText: "text-emerald-600",  description: "Payer approved the claim. ERA/835 received. Payment processing initiated." },
  { id: "paid",          label: "Payment Received",      icon: DollarSign,   iconBg: "bg-emerald-600",  iconText: "text-white",        description: "EFT deposited to practice bank account. Claim fully resolved." },
];

// ─── Generate timeline from claim data ───────────────────────────────────────

interface StageEntry {
  stage:     TimelineStage;
  status:    StageStatus;
  timestamp: string;
  note:      string;
  badge?:    string;
}

function generateTimeline(claim: Claim): StageEntry[] {
  const baseDate = new Date(claim.submittedAt);

  function fmtDate(d: Date) {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function addDays(d: Date, n: number): Date {
    const result = new Date(d);
    result.setDate(result.getDate() + n);
    return result;
  }

  const createdAt    = addDays(baseDate, -2);
  const scrubbedAt   = addDays(baseDate, -1);
  const submittedAt  = baseDate;
  const reviewAt     = addDays(baseDate, 3);
  const resolvedAt   = addDays(baseDate, claim.status === "Approved" ? 16 : 22);
  const paidAt       = addDays(resolvedAt, 7);

  if (claim.status === "Approved" || claim.status === "Paid") {
    return [
      { stage: ALL_STAGES[0], status: "completed", timestamp: fmtDate(createdAt),   note: `Claim #${claim.id} created. Biller: Marcus Torres.`,                                   badge: undefined },
      { stage: ALL_STAGES[1], status: "completed", timestamp: fmtDate(scrubbedAt),  note: "AI scrub passed. No critical errors detected. Claim health score: 91/100.",            badge: "Score: 91" },
      { stage: ALL_STAGES[2], status: "completed", timestamp: fmtDate(submittedAt), note: "837P submitted via Availity clearinghouse. Acknowledgement: ACK-2024-00441.",            badge: undefined },
      { stage: ALL_STAGES[3], status: "completed", timestamp: fmtDate(reviewAt),    note: `${claim.payer} standard adjudication. No additional documentation requested.`,           badge: undefined },
      { stage: ALL_STAGES[4], status: "skipped",   timestamp: "",                   note: "",                                                                                       badge: undefined },
      { stage: ALL_STAGES[5], status: "skipped",   timestamp: "",                   note: "",                                                                                       badge: undefined },
      { stage: ALL_STAGES[6], status: "skipped",   timestamp: "",                   note: "",                                                                                       badge: undefined },
      { stage: ALL_STAGES[7], status: "skipped",   timestamp: "",                   note: "",                                                                                       badge: undefined },
      { stage: ALL_STAGES[8], status: "completed", timestamp: fmtDate(resolvedAt),  note: `Approved. ${claim.payer} contracted rate applied. ERA received.`,                       badge: "Approved" },
      { stage: ALL_STAGES[9], status: "completed", timestamp: fmtDate(paidAt),      note: `EFT deposited: $${(claim.amount * 0.78).toFixed(2)}. Patient balance: $${(claim.amount * 0.22).toFixed(2)}.`, badge: `+$${(claim.amount * 0.78).toFixed(2)}` },
    ];
  }

  if (claim.status === "Denied" || claim.status === "Corrected" || claim.status === "Resubmitted") {
    const denialAt   = addDays(baseDate, 18);
    const correctedAt = addDays(denialAt, 5);
    const resubAt     = addDays(correctedAt, 1);
    return [
      { stage: ALL_STAGES[0], status: "completed", timestamp: fmtDate(createdAt),    note: `Claim #${claim.id} created. Biller: Marcus Torres.`,                                                     badge: undefined },
      { stage: ALL_STAGES[1], status: "completed", timestamp: fmtDate(scrubbedAt),   note: "AI scrub flagged 2 warnings. Claim submitted with warnings acknowledged.",                              badge: "Score: 58" },
      { stage: ALL_STAGES[2], status: "completed", timestamp: fmtDate(submittedAt),  note: "837P submitted via Availity. Acknowledgement: ACK-2024-00528.",                                         badge: undefined },
      { stage: ALL_STAGES[3], status: "completed", timestamp: fmtDate(reviewAt),     note: `${claim.payer} began adjudication. Claim entered medical review queue.`,                                 badge: undefined },
      { stage: ALL_STAGES[4], status: "skipped",   timestamp: "",                    note: "",                                                                                                       badge: undefined },
      { stage: ALL_STAGES[5], status: "denied",    timestamp: fmtDate(denialAt),     note: "CO-11: Diagnosis inconsistent with procedure billed. Appeal rights expire in 90 days.",                  badge: "CO-11" },
      { stage: ALL_STAGES[6], status: "completed", timestamp: fmtDate(correctedAt),  note: "ICD-10 corrected by Anita Patel (Coder). Documentation reviewed and amended.",                          badge: undefined },
      { stage: ALL_STAGES[7], status: "active",    timestamp: fmtDate(resubAt),      note: "Corrected claim submitted (CCI 7). Processing window: 14–21 days from resubmission.",                   badge: "Pending" },
      { stage: ALL_STAGES[8], status: "pending",   timestamp: "",                    note: "Awaiting payer adjudication.",                                                                           badge: undefined },
      { stage: ALL_STAGES[9], status: "pending",   timestamp: "",                    note: "",                                                                                                       badge: undefined },
    ];
  }

  // Pending
  return [
    { stage: ALL_STAGES[0], status: "completed", timestamp: fmtDate(createdAt),   note: `Claim #${claim.id} created. Biller: Marcus Torres.`,                         badge: undefined },
    { stage: ALL_STAGES[1], status: "completed", timestamp: fmtDate(scrubbedAt),  note: "AI scrub passed. Claim health score: 74/100. 1 warning present.",            badge: "Score: 74" },
    { stage: ALL_STAGES[2], status: "completed", timestamp: fmtDate(submittedAt), note: "837P submitted. Acknowledgement: ACK-2024-00611.",                           badge: undefined },
    { stage: ALL_STAGES[3], status: "active",    timestamp: fmtDate(reviewAt),    note: `${claim.payer} processing. Estimated adjudication: ${fmtDate(addDays(reviewAt, 14))}.`, badge: "In Progress" },
    { stage: ALL_STAGES[4], status: "pending",   timestamp: "",                   note: "",                                                                           badge: undefined },
    { stage: ALL_STAGES[5], status: "pending",   timestamp: "",                   note: "",                                                                           badge: undefined },
    { stage: ALL_STAGES[6], status: "pending",   timestamp: "",                   note: "",                                                                           badge: undefined },
    { stage: ALL_STAGES[7], status: "pending",   timestamp: "",                   note: "",                                                                           badge: undefined },
    { stage: ALL_STAGES[8], status: "pending",   timestamp: "",                   note: "",                                                                           badge: undefined },
    { stage: ALL_STAGES[9], status: "pending",   timestamp: "",                   note: "",                                                                           badge: undefined },
  ];
}

// ─── Stage node component ─────────────────────────────────────────────────────

function StageNode({ entry, isLast }: { entry: StageEntry; isLast: boolean }) {
  const { stage, status, timestamp, note, badge } = entry;
  const Icon = stage.icon;

  if (status === "skipped") return null;

  const nodeStyles = {
    completed:  `${stage.iconBg} ${stage.iconText} border-2 border-transparent`,
    active:     "bg-primary text-primary-foreground border-2 border-primary ring-4 ring-primary/20 shadow-lg",
    pending:    "bg-muted text-muted-foreground border-2 border-border",
    denied:     "bg-red-100 text-red-600 border-2 border-red-300",
  }[status] ?? "bg-muted text-muted-foreground border-2 border-border";

  const lineStyles = {
    completed: "bg-emerald-300",
    active:    "bg-primary/30",
    pending:   "bg-border",
    denied:    "bg-red-200",
  }[status] ?? "bg-border";

  const textColor = status === "pending" ? "text-muted-foreground/60" : "text-foreground";
  const subColor  = status === "pending" ? "text-muted-foreground/40" : "text-muted-foreground";

  return (
    <div className="flex gap-4">
      {/* Node + line */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${nodeStyles}`}>
          <Icon className="w-4 h-4" />
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 my-1 min-h-[24px] transition-colors ${lineStyles}`} />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-5 min-w-0 ${status === "pending" ? "opacity-50" : ""}`}>
        <div className="flex items-center gap-2 mb-0.5">
          <p className={`text-sm font-semibold ${textColor}`}>{stage.label}</p>
          {badge && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              status === "completed" && badge.startsWith("+") ? "bg-emerald-100 text-emerald-700" :
              status === "denied"   ? "bg-red-100 text-red-700" :
              status === "active"   ? "bg-primary/10 text-primary" :
              "bg-muted text-muted-foreground"
            }`}>
              {badge}
            </span>
          )}
          {timestamp && (
            <span className={`text-[10px] ml-auto shrink-0 ${subColor}`}>{timestamp}</span>
          )}
        </div>
        {note && (
          <p className={`text-xs leading-relaxed ${subColor}`}>{note}</p>
        )}
        {status === "pending" && !note && (
          <p className={`text-xs ${subColor}`}>Not yet reached</p>
        )}
        {status === "active" && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary font-medium">Processing</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface Props {
  claim: Claim;
  onClose: () => void;
}

export default function ClaimTimelineModal({ claim, onClose }: Props) {
  const timeline = generateTimeline(claim);
  const visible  = timeline.filter(e => e.status !== "skipped");

  const completedCount = visible.filter(e => e.status === "completed").length;
  const totalCount     = visible.length;
  const pct            = Math.round((completedCount / totalCount) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border shrink-0">
          <div>
            <h2 className="text-base font-bold text-foreground">Claim Journey</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              #{claim.id} · {claim.patient} · {claim.payer}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-3 bg-muted/30 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-foreground">{completedCount} of {totalCount} stages complete</span>
            <span className={`text-xs font-bold ${
              (claim.status === "Approved" || claim.status === "Paid") ? "text-emerald-600" :
              (claim.status === "Denied" || claim.status === "Corrected" || claim.status === "Resubmitted") ? "text-amber-600" : "text-primary"
            }`}>
              {(claim.status === "Approved" || claim.status === "Paid") ? "Fully Resolved" : (claim.status === "Denied" || claim.status === "Corrected" || claim.status === "Resubmitted") ? "In Appeal" : "In Progress"}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                (claim.status === "Approved" || claim.status === "Paid") ? "bg-emerald-500" :
                (claim.status === "Denied" || claim.status === "Corrected" || claim.status === "Resubmitted") ? "bg-amber-500" : "bg-primary"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {timeline.map((entry, i) => {
            const visibleEntries = timeline.filter(e => e.status !== "skipped");
            const isLast = entry === visibleEntries[visibleEntries.length - 1];
            return <StageNode key={entry.stage.id} entry={entry} isLast={isLast} />;
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 shrink-0 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Billed: <span className="font-semibold text-foreground">${claim.amount.toFixed(2)}</span></p>
            {claim.status === "Approved" && (
              <p className="text-xs text-emerald-600 font-medium">Collected: ${(claim.amount * 0.78).toFixed(2)}</p>
            )}
          </div>
          <button onClick={onClose} className="text-xs font-medium text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
