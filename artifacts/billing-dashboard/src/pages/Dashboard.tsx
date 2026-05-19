import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, FileCheck, Clock, DollarSign, AlertTriangle, ArrowUpRight, MapPin, Building2, ShieldAlert, ChevronRight, X, ExternalLink, Info, CheckCircle2, Circle, Zap, Target, Users } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
} from "recharts";
import { DENIAL_REASONS, PAYER_DATA, MONTHLY_TREND } from "@/data/mockData";
import { useRegion } from "@/context/RegionalContext";
import { useTeam } from "@/context/TeamContext";
import { ROLE_CONFIGS } from "@/data/teamRoles";
import type { StateId } from "@/data/regionalData";

// ─── Sparkline & trend data ───────────────────────────────────────────────────

const MONTHS_SHORT = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];

const SPARKLINES = {
  ccr:    { data: [81, 82, 84, 83, 86, 88], color: "#3B82F6" },
  dso:    { data: [42, 41, 39, 38, 36, 34], color: "#8B5CF6" },
  claims: { data: [798, 815, 821, 809, 830, 847], color: "#06B6D4" },
  risk:   { data: [31400, 29800, 27200, 26100, 27420, 24180], color: "#F59E0B" },
} as const;

type KPIId = keyof typeof SPARKLINES;

// ─── KPI drill-down data ──────────────────────────────────────────────────────

interface PayerRow    { name: string; value: number; unit: string; color: string }
interface SpecRow     { name: string; value: number; unit: string }
interface ClaimRow    { id: string; patient: string; amount: string; status: "Denied" | "Pending" | "Approved"; issue: string }
interface ActionItem  { priority: "critical" | "high" | "medium" | "low"; text: string; impact: string }

interface KPIDetail {
  title:        string;
  value:        string;
  accentColor:  string;
  iconBg:       string;
  trendData:    { month: string; value: number }[];
  trendUnit:    string;
  trendColor:   string;
  definition:   string;
  calculation:  string;
  benchmark:    string;
  payerBreakdown:    PayerRow[];
  specialtyBreakdown: SpecRow[];
  relatedClaims:     ClaimRow[];
  actions:           ActionItem[];
}

const KPI_DETAILS: Record<KPIId, KPIDetail> = {
  ccr: {
    title: "Clean Claim Rate", value: "88%", accentColor: "text-blue-600", iconBg: "bg-blue-500",
    trendColor: "#3B82F6",
    trendData: MONTHS_SHORT.map((month, i) => ({ month, value: [81, 82, 84, 83, 86, 88][i] })),
    trendUnit: "%",
    definition: "The percentage of claims accepted by payers on first submission without requiring correction, resubmission, or appeal. Also called 'first-pass acceptance rate.' The single most important indicator of front-end revenue cycle health.",
    calculation: "(Total claims accepted on first pass ÷ Total claims submitted) × 100. Measured monthly. Excludes adjustments initiated by the practice.",
    benchmark: "Industry average: 85%. Top-performing practices: 95%+. Your current rate of 88% is above benchmark and trending positively.",
    payerBreakdown: [
      { name: "Medicare",           value: 94, unit: "%", color: "#3B82F6" },
      { name: "BlueCross BlueShield",value: 91, unit: "%", color: "#6366F1" },
      { name: "Cigna",              value: 89, unit: "%", color: "#8B5CF6" },
      { name: "UnitedHealthcare",   value: 86, unit: "%", color: "#A78BFA" },
      { name: "Medicaid",           value: 78, unit: "%", color: "#C4B5FD" },
    ],
    specialtyBreakdown: [
      { name: "Preventive Care",    value: 95, unit: "%" },
      { name: "Family Medicine",    value: 91, unit: "%" },
      { name: "Urgent & Emergency", value: 84, unit: "%" },
      { name: "Behavioral Health",  value: 79, unit: "%" },
    ],
    relatedClaims: [
      { id: "CLM-2024-0891", patient: "James Kowalski",  amount: "$420", status: "Denied",  issue: "CO-11: ICD-10 inconsistent with procedure" },
      { id: "CLM-2024-0887", patient: "Maria Delgado",   amount: "$285", status: "Denied",  issue: "CO-4: Modifier inconsistent with procedure" },
      { id: "CLM-2024-0879", patient: "Robert Chen",     amount: "$195", status: "Denied",  issue: "CO-29: Timely filing deadline exceeded" },
      { id: "CLM-2024-0872", patient: "Sandra Okafor",   amount: "$540", status: "Pending", issue: "PR-96: Documentation required" },
      { id: "CLM-2024-0866", patient: "Derek Nunez",     amount: "$350", status: "Denied",  issue: "CO-50: Not medically necessary as billed" },
    ],
    actions: [
      { priority: "critical", text: "Behavioral Health CPT codes submitted without F-code primary ICD-10 — causing 21% of BH denials.", impact: "Fixing adds ~+6% to BH CCR, ~$3,200/mo recovered" },
      { priority: "high",     text: "Medicaid modifier requirements changed Feb 2024 — review modifier -25 policy for all E&M + procedure same-day pairs.", impact: "Closes 4 of 9 open Medicaid rejections" },
      { priority: "medium",   text: "Run ClaimFlow AI scrub on all pending claims before submission to catch CPT/ICD-10 compatibility issues.", impact: "Estimated 2–3% lift in first-pass rate" },
    ],
  },

  dso: {
    title: "Days Sales Outstanding", value: "34 days", accentColor: "text-violet-600", iconBg: "bg-violet-500",
    trendColor: "#8B5CF6",
    trendData: MONTHS_SHORT.map((month, i) => ({ month, value: [42, 41, 39, 38, 36, 34][i] })),
    trendUnit: " days",
    definition: "The average number of calendar days from the date of service to receipt of payment. Measures the speed and efficiency of your entire revenue cycle — from charge capture through final collection.",
    calculation: "(Total A/R balance ÷ Average daily gross charges). Average daily charges = Total charges for period ÷ Number of days in period. Includes all payers, all specialties.",
    benchmark: "MGMA benchmark: 30–45 days. Your 34-day DSO is 11 days below industry average. Target is ≤35 days for practices your size. Top quartile: <28 days.",
    payerBreakdown: [
      { name: "Medicare",            value: 28, unit: "d", color: "#059669" },
      { name: "BlueCross BlueShield",value: 29, unit: "d", color: "#10B981" },
      { name: "UnitedHealthcare",    value: 31, unit: "d", color: "#F59E0B" },
      { name: "Cigna",               value: 38, unit: "d", color: "#EF4444" },
      { name: "Medicaid",            value: 52, unit: "d", color: "#DC2626" },
    ],
    specialtyBreakdown: [
      { name: "Preventive Care",    value: 22, unit: "days" },
      { name: "Family Medicine",    value: 31, unit: "days" },
      { name: "Urgent & Emergency", value: 35, unit: "days" },
      { name: "Behavioral Health",  value: 48, unit: "days" },
    ],
    relatedClaims: [
      { id: "CLM-2024-0441", patient: "Thomas Reeves",  amount: "$1,240", status: "Pending", issue: "Day 61 — Medicaid pending review, no response" },
      { id: "CLM-2024-0423", patient: "Pamela Voss",    amount: "$890",   status: "Pending", issue: "Day 58 — Cigna documentation request open" },
      { id: "CLM-2024-0398", patient: "Carlos Mendez",  amount: "$2,140", status: "Pending", issue: "Day 55 — BH payer review, auth expiring" },
      { id: "CLM-2024-0377", patient: "Janet Kimura",   amount: "$460",   status: "Pending", issue: "Day 52 — Medicaid — secondary billing eligible" },
      { id: "CLM-2024-0355", patient: "Frank O'Brien",  amount: "$780",   status: "Pending", issue: "Day 48 — UHC — missing modifier -59 on file" },
    ],
    actions: [
      { priority: "critical", text: "Medicaid DSO is 52 days — 3 accounts eligible for secondary billing escalation immediately.", impact: "$14,800 in recoverable A/R if escalated this week" },
      { priority: "high",     text: "Behavioral Health DSO at 48 days driven by incomplete auth documentation — MBHO carve-outs need separate billing workflows.", impact: "Resolving BH auth issues reduces BH DSO by est. 12–18 days" },
      { priority: "medium",   text: "Configure automated 30-day follow-up alerts for all Cigna and Medicaid claims in your billing system.", impact: "Prevents DSO from exceeding 45-day benchmark" },
    ],
  },

  claims: {
    title: "Claims This Month", value: "847", accentColor: "text-cyan-600", iconBg: "bg-cyan-500",
    trendColor: "#06B6D4",
    trendData: MONTHS_SHORT.map((month, i) => ({ month, value: [798, 815, 821, 809, 830, 847][i] })),
    trendUnit: "",
    definition: "Total number of claims submitted to all payers in the current billing period (May 2024). Includes initial submissions only — resubmissions and corrected claims are tracked separately under the denial management workflow.",
    calculation: "Count of unique claim IDs with a submission date in the current calendar month. Tracks volume trend, capacity utilization, and billing team productivity across all specialties and payers.",
    benchmark: "Month-over-month growth rate: +2.0% (May vs. April). YTD average: 820 claims/month. Volume consistent with practice expansion projections. Staffing adequacy threshold: 900 claims/month.",
    payerBreakdown: [
      { name: "Medicare",            value: 312, unit: "", color: "#3B82F6" },
      { name: "UnitedHealthcare",    value: 198, unit: "", color: "#06B6D4" },
      { name: "Medicaid",            value: 145, unit: "", color: "#8B5CF6" },
      { name: "BlueCross BlueShield",value: 124, unit: "", color: "#10B981" },
      { name: "Cigna",               value:  68, unit: "", color: "#F59E0B" },
    ],
    specialtyBreakdown: [
      { name: "Family Medicine",    value: 421, unit: "claims" },
      { name: "Preventive Care",    value: 201, unit: "claims" },
      { name: "Urgent & Emergency", value: 136, unit: "claims" },
      { name: "Behavioral Health",  value:  89, unit: "claims" },
    ],
    relatedClaims: [
      { id: "CLM-2024-0911", patient: "Angela Foster",   amount: "$320", status: "Approved", issue: "Clean — paid 12 days from submission" },
      { id: "CLM-2024-0909", patient: "Raymond Torres",  amount: "$485", status: "Pending",  issue: "Under review — Medicare, Day 8" },
      { id: "CLM-2024-0905", patient: "Lisa Hoffman",    amount: "$275", status: "Approved", issue: "Clean — paid 10 days from submission" },
      { id: "CLM-2024-0901", patient: "Marcus Webb",     amount: "$640", status: "Pending",  issue: "Under review — UHC, Day 4" },
      { id: "CLM-2024-0898", patient: "Nina Patel",      amount: "$195", status: "Denied",   issue: "CO-11: ICD-10 mismatch — resubmit required" },
    ],
    actions: [
      { priority: "medium", text: "Volume approaching staffing adequacy threshold (900/mo). Pre-plan for +6% volume increase in Q3.", impact: "Prevents denial rate increase from bandwidth constraints" },
      { priority: "medium", text: "Medicare volume (37% of claims) trending up — confirm NPI enrollment is current for all rendering providers.", impact: "Avoids CO-31 denials (provider not enrolled)" },
      { priority: "low",    text: "BH volume (89 claims) growing — confirm all BH providers have credentialing on file with carve-out payers.", impact: "Maintains BH billing eligibility as volume grows" },
    ],
  },

  risk: {
    title: "Revenue at Risk", value: "$24,180", accentColor: "text-amber-600", iconBg: "bg-amber-500",
    trendColor: "#F59E0B",
    trendData: MONTHS_SHORT.map((month, i) => ({ month, value: [31400, 29800, 27200, 26100, 27420, 24180][i] })),
    trendUnit: "$",
    definition: "Total billed amount for claims currently in denied or disputed status that have not yet been resolved through appeal, correction, or write-off. Represents the maximum recoverable revenue at risk of permanent loss.",
    calculation: "Sum of billed amounts for all claims with status = Denied and appeal window still open (typically 90 days from denial date). Excludes claims pending first adjudication or awaiting documentation.",
    benchmark: "Target: <3% of monthly billings ($24,180 / ~$420,000 billed = 5.8%). Industry standard: <4%. Trending down from $31,400 in December — strong improvement but Medicaid and BH remain elevated.",
    payerBreakdown: [
      { name: "Medicaid",            value: 9240, unit: "$", color: "#EF4444" },
      { name: "UnitedHealthcare",    value: 7820, unit: "$", color: "#F97316" },
      { name: "Cigna",               value: 4100, unit: "$", color: "#F59E0B" },
      { name: "Medicare",            value: 1820, unit: "$", color: "#FCD34D" },
      { name: "BlueCross BlueShield",value: 1200, unit: "$", color: "#FEF08A" },
    ],
    specialtyBreakdown: [
      { name: "Behavioral Health",  value: 10450, unit: "$" },
      { name: "Urgent & Emergency", value:  7230, unit: "$" },
      { name: "Family Medicine",    value:  4100, unit: "$" },
      { name: "Preventive Care",    value:  2400, unit: "$" },
    ],
    relatedClaims: [
      { id: "CLM-2024-0782", patient: "Patricia Huang",  amount: "$1,840", status: "Denied", issue: "CO-11 — BH ICD-10 mismatch, appeal Day 22" },
      { id: "CLM-2024-0771", patient: "Samuel Green",    amount: "$2,240", status: "Denied", issue: "CO-57 — Medicaid prior auth missing, Day 31" },
      { id: "CLM-2024-0764", patient: "Teresa Morgan",   amount: "$980",   status: "Denied", issue: "CO-4 — Modifier error, corrected claim ready" },
      { id: "CLM-2024-0751", patient: "Andre Jackson",   amount: "$1,620", status: "Denied", issue: "CO-50 — ED 99284 medical necessity, Day 18" },
      { id: "CLM-2024-0740", patient: "Kwan Li",         amount: "$1,100", status: "Denied", issue: "CO-29 — UHC timely filing, appeal Day 44" },
    ],
    actions: [
      { priority: "critical", text: "$9,240 in Medicaid denials — 3 due to missing prior auth documentation that exists in the chart. Submit appeals with auth records by Friday.", impact: "Recovers 38% of at-risk revenue this week" },
      { priority: "high",     text: "CO-11 (ICD-10 mismatch) pattern across BH claims — review Anita Patel's coding on all Behavioral Health claims from April.", impact: "Prevents $3,200/mo in recurring BH denials" },
      { priority: "medium",   text: "CO-29 timely filing denial for Kwan Li (UHC, Day 44) — appeal window closes in 46 days. File Level 1 appeal immediately.", impact: "$1,100 at immediate risk of write-off" },
    ],
  },
};

// ─── Today's Priorities data ──────────────────────────────────────────────────

interface Priority {
  id: string;
  urgency: "critical" | "high" | "medium" | "info";
  title: string;
  detail: string;
  dueLabel: string;
  amount?: string;
  roles: string[];   // which roles see this priority
}

const TODAY_PRIORITIES: Priority[] = [
  {
    id: "p1",
    urgency: "critical",
    title: "9 CO-11 appeals — deadline in 14 days",
    detail: "ICD-10 mismatch denials across BH and urgent care. Appeal window closes May 31.",
    dueLabel: "Due May 31",
    amount: "$8,420",
    roles: ["admin", "billing-manager", "medical-biller"],
  },
  {
    id: "p2",
    urgency: "high",
    title: "Medicaid DSO at 52 days — 3 accounts ready for escalation",
    detail: "Three accounts > 50 days with no response. Eligible for secondary billing or state ombudsman.",
    dueLabel: "Escalate today",
    amount: "$14,800",
    roles: ["admin", "billing-manager"],
  },
  {
    id: "p3",
    urgency: "high",
    title: "14 claims missing modifier documentation",
    detail: "Modifier -25 required for same-day E&M + procedure pairs. Resubmit before timely filing deadline.",
    dueLabel: "Resubmit by EOD",
    amount: "$6,230",
    roles: ["admin", "billing-manager", "medical-biller", "coder"],
  },
  {
    id: "p4",
    urgency: "medium",
    title: "UHC new prior auth requirements — effective June 1",
    detail: "CPT 97110, 97530, 90837 require pre-authorization starting next month. Update intake workflows.",
    dueLabel: "Update by June 1",
    roles: ["admin", "billing-manager", "front-desk"],
  },
  {
    id: "p5",
    urgency: "info",
    title: "May CCR improved +6% vs April — Family Medicine leading",
    detail: "Clean claim rate reached 88%, best month since launch. Family Medicine at 91% first-pass rate.",
    dueLabel: "Performance insight",
    roles: ["admin", "billing-manager", "provider"],
  },
];

// ─── Helper components ────────────────────────────────────────────────────────

function SparkLine({ data, color, gradId }: { data: number[]; color: string; gradId: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 80; const H = 28; const PAD = 2;
  const pts = data.map((v, i) => ({
    x: PAD + (i / (data.length - 1)) * (W - PAD * 2),
    y: H - PAD - ((v - min) / range) * (H - PAD * 2),
  }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const fillPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${H} L ${pts[0].x.toFixed(1)} ${H} Z`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible shrink-0">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gradId})`} />
      <path d={linePath} stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={2.5} fill={color} />
    </svg>
  );
}

function PriorityDot({ urgency }: { urgency: Priority["urgency"] }) {
  const styles = {
    critical: "bg-red-500",
    high:     "bg-orange-500",
    medium:   "bg-amber-400",
    info:     "bg-blue-400",
  };
  return <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${styles[urgency]}`} />;
}

function PriorityBadge({ urgency }: { urgency: Priority["urgency"] }) {
  const styles = {
    critical: "bg-red-100 text-red-700",
    high:     "bg-orange-100 text-orange-700",
    medium:   "bg-amber-100 text-amber-700",
    info:     "bg-blue-100 text-blue-700",
  };
  const labels = { critical: "Critical", high: "High", medium: "Medium", info: "Info" };
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${styles[urgency]}`}>{labels[urgency]}</span>;
}

function ActionPriorityBadge({ priority }: { priority: ActionItem["priority"] }) {
  const styles = {
    critical: "bg-red-100 text-red-700",
    high:     "bg-orange-100 text-orange-700",
    medium:   "bg-amber-100 text-amber-700",
    low:      "bg-muted text-muted-foreground",
  };
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${styles[priority]}`}>{priority}</span>;
}

function StatusChip({ status }: { status: ClaimRow["status"] }) {
  const s = {
    Denied:  "bg-red-100 text-red-700",
    Pending: "bg-amber-100 text-amber-700",
    Approved:"bg-emerald-100 text-emerald-700",
  }[status];
  return <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${s}`}>{status}</span>;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({ id, title, value, subtitle, icon: Icon, trend, trendLabel, color, accentGlow, onClick }: {
  id: KPIId; title: string; value: string; subtitle: string; icon: any;
  trend?: "up" | "down" | "neutral"; trendLabel?: string; color: string; accentGlow: string;
  onClick: () => void;
}) {
  const { data, color: sparkColor } = SPARKLINES[id];
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`w-full text-left bg-card border border-border rounded-xl p-5 flex flex-col gap-3 transition-all duration-200 cursor-pointer group
        ${hovered ? `shadow-lg ${accentGlow} border-border/80` : "shadow-sm hover:shadow-md"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1 leading-none">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${color} shrink-0`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Sparkline + trend */}
      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {trend === "up"   && <TrendingUp   className="w-3 h-3 text-emerald-500 shrink-0" />}
            {trend === "down" && <TrendingDown  className="w-3 h-3 text-red-500 shrink-0" />}
            {trendLabel && (
              <span className={`text-xs font-semibold ${trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"}`}>
                {trendLabel}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>
        <SparkLine data={data} color={sparkColor} gradId={`spark-${id}`} />
      </div>

      {/* "View details" hint */}
      <div className={`flex items-center gap-1 transition-opacity duration-200 ${hovered ? "opacity-100" : "opacity-0"}`}>
        <span className="text-[10px] font-semibold text-primary">View details</span>
        <ExternalLink className="w-2.5 h-2.5 text-primary" />
      </div>
    </button>
  );
}

// ─── KPI Drill-Down Panel ─────────────────────────────────────────────────────

function KPIDrilldownPanel({ kpiId, onClose }: { kpiId: KPIId | null; onClose: () => void }) {
  const detail = kpiId ? KPI_DETAILS[kpiId] : null;

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-[1px] z-30 transition-opacity duration-300 ${kpiId ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Slide-out panel */}
      <div className={`fixed top-0 right-0 h-screen w-[520px] max-w-[95vw] bg-card border-l border-border shadow-2xl z-40 flex flex-col transition-transform duration-300 ease-out ${kpiId ? "translate-x-0" : "translate-x-full"}`}>
        {detail && (
          <>
            {/* Panel header */}
            <div className="shrink-0 px-6 py-5 border-b border-border flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Metric Detail</p>
                <h2 className="text-lg font-bold text-foreground">{detail.title}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-2xl font-bold ${detail.accentColor}`}>{detail.value}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">May 2024</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">

              {/* Definition + Calculation */}
              <div className="px-6 py-5 space-y-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Definition</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{detail.definition}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/40 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">Calculation</p>
                    <p className="text-xs text-foreground leading-relaxed">{detail.calculation}</p>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">Benchmarks</p>
                    <p className="text-xs text-foreground leading-relaxed">{detail.benchmark}</p>
                  </div>
                </div>
              </div>

              {/* Trend chart */}
              <div className="px-6 py-5 border-b border-border">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-4">6-Month Trend</p>
                <ResponsiveContainer width="100%" height={130}>
                  <AreaChart data={detail.trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`panel-grad-${kpiId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={detail.trendColor} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={detail.trendColor} stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => [`${detail.trendUnit === "$" ? "$" : ""}${v.toLocaleString()}${detail.trendUnit !== "$" ? detail.trendUnit : ""}`, detail.title]} />
                    <Area type="monotone" dataKey="value" stroke={detail.trendColor} strokeWidth={2} fill={`url(#panel-grad-${kpiId})`} dot={false} activeDot={{ r: 4, fill: detail.trendColor }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Payer breakdown */}
              <div className="px-6 py-5 border-b border-border">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-4">Payer Breakdown</p>
                <div className="space-y-3">
                  {(() => {
                    const maxVal = Math.max(...detail.payerBreakdown.map(p => p.value));
                    return detail.payerBreakdown.map(row => (
                      <div key={row.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-foreground font-medium truncate pr-2">{row.name}</span>
                          <span className="text-xs font-bold text-foreground shrink-0">
                            {row.unit === "$" ? `$${row.value.toLocaleString()}` : `${row.value}${row.unit}`}
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${(row.value / maxVal) * 100}%`, backgroundColor: row.color }}
                          />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Specialty breakdown */}
              <div className="px-6 py-5 border-b border-border">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-4">Specialty Breakdown</p>
                <div className="space-y-3">
                  {(() => {
                    const maxVal = Math.max(...detail.specialtyBreakdown.map(s => s.value));
                    return detail.specialtyBreakdown.map((row, i) => {
                      const barColors = ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981"];
                      return (
                        <div key={row.name}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-foreground font-medium">{row.name}</span>
                            <span className="text-xs font-bold text-foreground">
                              {row.unit === "$" ? `$${row.value.toLocaleString()}` : `${row.value.toLocaleString()}${row.unit ? " " + row.unit : ""}`}
                            </span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${(row.value / maxVal) * 100}%`, backgroundColor: barColors[i % barColors.length] }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Related claims */}
              <div className="px-6 py-5 border-b border-border">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-4">Related Claims</p>
                <div className="space-y-2">
                  {detail.relatedClaims.map(c => (
                    <div key={c.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-xs font-mono font-medium text-primary">{c.id}</span>
                          <span className="text-xs text-foreground font-medium">{c.patient}</span>
                          <StatusChip status={c.status} />
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-snug">{c.issue}</p>
                      </div>
                      <span className="text-xs font-bold text-foreground shrink-0">{c.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended actions */}
              <div className="px-6 py-5">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-4">Recommended Actions</p>
                <div className="space-y-3">
                  {detail.actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
                      <div className="mt-0.5">
                        <ActionPriorityBadge priority={action.priority} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground leading-relaxed">{action.text}</p>
                        <p className="text-[10px] text-emerald-600 font-medium mt-1">{action.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ─── Today's Priorities Panel ─────────────────────────────────────────────────

function TodaysPrioritiesPanel({ roleId }: { roleId: string }) {
  const visible = TODAY_PRIORITIES.filter(p => p.roles.includes(roleId));

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Today's Priorities</p>
            <p className="text-xs text-muted-foreground">Role-filtered · {visible.length} items for your queue</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {(["critical", "high", "medium", "info"] as const).map(u => {
            const cnt = visible.filter(p => p.urgency === u).length;
            if (!cnt) return null;
            const cls = { critical: "bg-red-100 text-red-700", high: "bg-orange-100 text-orange-700", medium: "bg-amber-100 text-amber-700", info: "bg-blue-100 text-blue-700" }[u];
            return <span key={u} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cls}`}>{cnt}</span>;
          })}
        </div>
      </div>
      <div className="divide-y divide-border">
        {visible.map(p => (
          <div key={p.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-muted/30 transition-colors group">
            <PriorityDot urgency={p.urgency} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <p className="text-sm font-semibold text-foreground leading-snug">{p.title}</p>
                {p.amount && (
                  <span className={`text-xs font-bold shrink-0 ${p.urgency === "critical" ? "text-red-600" : p.urgency === "high" ? "text-orange-600" : "text-amber-600"}`}>
                    {p.amount}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.detail}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <PriorityBadge urgency={p.urgency} />
                <span className="text-[10px] text-muted-foreground">{p.dueLabel}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Chart helpers ────────────────────────────────────────────────────────────

const RADIAN = Math.PI / 180;

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  if (percent < 0.1) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-semibold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-foreground mb-1">{label || payload[0]?.name}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-medium">{p.value}</span></p>
      ))}
    </div>
  );
};

const STATE_ACCENT: Record<StateId, { dot: string; text: string; bg: string; border: string }> = {
  national: { dot: "bg-blue-500",   text: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200"   },
  ny:       { dot: "bg-indigo-500", text: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
  fl:       { dot: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
  ca:       { dot: "bg-amber-500",  text: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200"  },
  tx:       { dot: "bg-red-500",    text: "text-red-700",    bg: "bg-red-50",    border: "border-red-200"    },
};

// ─── KPI card configurations ──────────────────────────────────────────────────

const KPI_CARDS = [
  {
    id: "ccr" as KPIId,
    title: "Clean Claim Rate",
    value: "88%",
    subtitle: "vs. 82% last month",
    icon: FileCheck,
    trend: "up" as const,
    trendLabel: "+6%",
    color: "bg-blue-500",
    accentGlow: "ring-1 ring-blue-200/60 shadow-blue-100",
  },
  {
    id: "dso" as KPIId,
    title: "Days Sales Outstanding",
    value: "34 days",
    subtitle: "Industry avg: 45 days",
    icon: Clock,
    trend: "up" as const,
    trendLabel: "11 days below avg",
    color: "bg-violet-500",
    accentGlow: "ring-1 ring-violet-200/60 shadow-violet-100",
  },
  {
    id: "claims" as KPIId,
    title: "Claims This Month",
    value: "847",
    subtitle: "vs. 830 last month",
    icon: ArrowUpRight,
    trend: "up" as const,
    trendLabel: "+17 claims",
    color: "bg-cyan-500",
    accentGlow: "ring-1 ring-cyan-200/60 shadow-cyan-100",
  },
  {
    id: "risk" as KPIId,
    title: "Revenue at Risk",
    value: "$24,180",
    subtitle: "102 denied claims",
    icon: DollarSign,
    trend: "down" as const,
    trendLabel: "-$3,240 vs last month",
    color: "bg-amber-500",
    accentGlow: "ring-1 ring-amber-200/60 shadow-amber-100",
  },
];

// ─── Main Dashboard export ────────────────────────────────────────────────────

export default function Dashboard() {
  const { stateId, config } = useRegion();
  const { activeUser } = useTeam();
  const roleConfig = ROLE_CONFIGS[activeUser.role];
  const accent = STATE_ACCENT[stateId];
  const topPayers = config.payers.slice(0, 4);
  const statePattern = config.denialPatterns.find(d => d.stateSpecific);
  const hasNoFault = config.noFault.applicable;

  const [activeKPI, setActiveKPI] = useState<KPIId | null>(null);

  return (
    <div className="space-y-6">
      <KPIDrilldownPanel kpiId={activeKPI} onClose={() => setActiveKPI(null)} />

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Greenfield Family Medicine · May 2024</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Data Feed
          </div>
        </div>
      </div>

      {/* KPI Cards — all clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_CARDS.map(card => (
          <KPICard
            key={card.id}
            {...card}
            onClick={() => setActiveKPI(prev => prev === card.id ? null : card.id)}
          />
        ))}
      </div>

      {/* Today's Priorities */}
      <TodaysPrioritiesPanel roleId={activeUser.role} />

      {/* Role Workflow Strip */}
      <div className={`rounded-xl border ${roleConfig.bg} border-current/10 px-5 py-4`}>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-6 h-6 rounded-md bg-white/60 flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleConfig.badge}`}>{roleConfig.label}</span>
          <p className={`text-xs font-semibold ${roleConfig.color}`}>Workflow priorities for your role</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {roleConfig.workflowSuggestions.slice(0, 3).map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-card/70 border border-current/10 rounded-lg px-3 py-2">
              <ChevronRight className={`w-3 h-3 shrink-0 ${roleConfig.color}`} />
              <span className={`text-xs ${roleConfig.color}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Regional Intelligence Panel */}
      <div className={`rounded-xl border ${accent.border} ${accent.bg} p-4`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-7 h-7 rounded-lg ${accent.dot} flex items-center justify-center shrink-0`}>
              <MapPin className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${accent.text}`}>Regional Intelligence</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${accent.bg} ${accent.text} border ${accent.border}`}>{config.abbreviation}</span>
                <span className="text-xs text-muted-foreground">{config.label} billing rules active</span>
              </div>
              {statePattern && (
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="font-medium text-amber-700">Top state-specific denial:</span>
                  <span>{statePattern.category} ({statePattern.percentage}%) — {statePattern.description}</span>
                </p>
              )}
            </div>
          </div>
          {hasNoFault && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-lg shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
              No-Fault / PIP Rules Active · {config.noFault.billingDeadlineDays}-day billing window
            </div>
          )}
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {topPayers.map(p => (
            <div key={p.name} className="bg-card border border-border rounded-lg px-3 py-2.5 space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className={`text-xs font-medium ${p.denialRate >= 18 ? "text-red-600" : p.denialRate >= 12 ? "text-amber-600" : "text-emerald-600"}`}>
                  {p.denialRate}% denial
                </span>
              </div>
              <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.avgDaysToPayment}d avg payment</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-foreground">Top Denial Reasons</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">May 2024</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">102 denied claims this month</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={DENIAL_REASONS} cx="50%" cy="50%" labelLine={false} label={CustomLabel} outerRadius={110} innerRadius={55} dataKey="value">
                {DENIAL_REASONS.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}%`, "Share"]} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-foreground">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-foreground">Claims Trend (6 Months)</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">Dec 2023 – May 2024</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Submitted vs. approved vs. rejected</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={MONTHLY_TREND} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gradRejected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#EC4899" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="approved" name="Approved" stroke="#3B82F6" strokeWidth={2} fill="url(#gradApproved)" />
              <Area type="monotone" dataKey="rejected" name="Rejected" stroke="#EC4899" strokeWidth={2} fill="url(#gradRejected)" />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-foreground">{v}</span>} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payer performance bar chart */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-foreground">Claims by Payer</h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-500" />Approved</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-pink-400" />Rejected</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Year-to-date performance across all contracted payers</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={PAYER_DATA} margin={{ top: 0, right: 10, left: -10, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="payer" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="approved" name="Approved" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="rejected" name="Rejected" fill="#F472B6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Alert banner */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Action Required: 23 Claims Awaiting Correction</p>
          <p className="text-xs text-amber-700 mt-0.5">
            14 claims have missing modifiers and 9 have ICD-10 mismatches. Use the <strong>Claims Scrubber</strong> tab to identify and fix errors before resubmission.
          </p>
        </div>
      </div>
    </div>
  );
}
