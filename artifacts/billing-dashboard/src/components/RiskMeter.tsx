import type { ClaimRiskScore } from "@/lib/riskEngine";
import { AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, Clock, DollarSign, Shield } from "lucide-react";

// ── Risk color helpers ─────────────────────────────────────────────────────────

export function getRiskColor(prob: number): { bg: string; text: string; border: string; fill: string } {
  if (prob <= 20) return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", fill: "bg-emerald-500" };
  if (prob <= 40) return { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    fill: "bg-blue-500"    };
  if (prob <= 60) return { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   fill: "bg-amber-500"   };
  if (prob <= 80) return { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200",  fill: "bg-orange-500"  };
  return           { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    fill: "bg-red-500"     };
}

export function getRiskLabel(prob: number): string {
  if (prob <= 20) return "Low Risk";
  if (prob <= 40) return "Moderate";
  if (prob <= 60) return "Elevated";
  if (prob <= 80) return "High Risk";
  return "Critical";
}

// ── Arc gauge (SVG donut segment) ─────────────────────────────────────────────

export function RiskArc({ probability, size = 96 }: { probability: number; size?: number }) {
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size / 2;
  const stroke = size * 0.085;

  // Arc from -210° to +30° (240° sweep = full range)
  const startAngle = -210;
  const sweepAngle = 240;
  const endAngle = startAngle + sweepAngle * (probability / 100);

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arc = (angle: number) => ({
    x: cx + r * Math.cos(toRad(angle)),
    y: cy + r * Math.sin(toRad(angle)),
  });

  const trackStart = arc(startAngle);
  const trackEnd   = arc(startAngle + sweepAngle);
  const fillEnd    = arc(endAngle);
  const largeArcFill  = sweepAngle * (probability / 100) > 180 ? 1 : 0;

  const color =
    probability <= 20 ? "#10b981" :
    probability <= 40 ? "#3b82f6" :
    probability <= 60 ? "#f59e0b" :
    probability <= 80 ? "#f97316" : "#ef4444";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <path
        d={`M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 1 1 ${trackEnd.x} ${trackEnd.y}`}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      {/* Fill */}
      {probability > 0 && (
        <path
          d={`M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${largeArcFill} 1 ${fillEnd.x} ${fillEnd.y}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      )}
      {/* Center text */}
      <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.175} fontWeight="800" fill={color}>
        {probability}%
      </text>
      <text x={cx} y={cy + size * 0.14} textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.1} fill="#94a3b8" fontWeight="600">
        {getRiskLabel(probability)}
      </text>
    </svg>
  );
}

// ── Horizontal risk bar ────────────────────────────────────────────────────────

export function RiskBar({ label, value, max = 100, color, showValue = true }: {
  label: string; value: number; max?: number; color: string; showValue?: boolean;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-600 font-medium">{label}</span>
        {showValue && <span className="text-slate-800 font-bold">{value}{max === 100 ? "%" : ` / ${max}`}</span>}
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Risk badge (inline chip) ───────────────────────────────────────────────────

export function RiskBadge({ probability, size = "sm" }: { probability: number; size?: "xs" | "sm" | "md" }) {
  const c = getRiskColor(probability);
  const label = getRiskLabel(probability);
  const sizeClass = size === "xs" ? "text-[9px] px-1.5 py-0.5" : size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";
  return (
    <span className={`inline-flex items-center gap-1 font-bold rounded-full border ${c.bg} ${c.text} ${c.border} ${sizeClass}`}>
      {probability > 60 && <AlertTriangle className="w-2.5 h-2.5" />}
      {probability <= 20 && <CheckCircle2 className="w-2.5 h-2.5" />}
      {probability}% {label}
    </span>
  );
}

// ── Full risk score card ───────────────────────────────────────────────────────

export function ClaimRiskCard({ risk, amount }: { risk: ClaimRiskScore; amount: number }) {
  const dc = getRiskColor(risk.denialProbability);
  const cc = risk.reimbursementConfidence >= 70 ? "text-emerald-600" : risk.reimbursementConfidence >= 50 ? "text-amber-600" : "text-red-600";

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header row */}
      <div className={`px-5 py-4 border-b border-slate-100 ${dc.bg} flex items-center justify-between`}>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Denial Risk</p>
          <p className={`text-2xl font-black ${dc.text}`}>{risk.denialProbability}%</p>
        </div>
        <RiskArc probability={risk.denialProbability} size={80} />
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-px bg-slate-100">
        {[
          { icon: Shield, label: "Reimb. Confidence", value: `${risk.reimbursementConfidence}%`, color: cc },
          { icon: DollarSign, label: "Est. Reimbursement", value: `$${risk.estimatedReimbursement}`, color: "text-emerald-600" },
          { icon: Clock, label: "Est. Days to Pay", value: `${risk.estimatedDaysToPayment}d`, color: risk.estimatedDaysToPayment > 20 ? "text-amber-600" : "text-blue-600" },
          { icon: TrendingDown, label: "Reimb. Range", value: `$${risk.reimbursementMin}–$${risk.reimbursementMax}`, color: "text-slate-600" },
        ].map(m => (
          <div key={m.label} className="bg-white px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <m.icon className="w-3 h-3 text-slate-400" />
              <p className="text-[10px] text-slate-400 font-medium">{m.label}</p>
            </div>
            <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Predictive insight */}
      <div className="px-5 py-3 bg-blue-50 border-t border-blue-100">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">{risk.predictiveInsight}</p>
        </div>
      </div>

      {/* Risk factors */}
      <div className="px-5 py-4 space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Risk Factors</p>
        {risk.riskFactors.slice(0, 4).map((f, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${f.impact === "positive" ? "bg-emerald-500" : f.impact === "negative" ? "bg-red-500" : "bg-slate-300"}`} />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700">{f.label}</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">{f.detail}</p>
            </div>
            {f.weight !== 0 && (
              <span className={`text-[10px] font-bold shrink-0 ${f.impact === "positive" ? "text-emerald-600" : "text-red-600"}`}>
                {f.weight > 0 ? `+${f.weight}%` : `${f.weight}%`}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Payer risk scorecard ───────────────────────────────────────────────────────

interface PayerScoreCardProps {
  name: string;
  riskLevel: string;
  modifierEnforcement: number;
  authSensitivity: number;
  docSensitivity: number;
  denialRate: number;
  avgDays: number;
  reimbRate: number;
}

export function PayerScoreCard({ name, riskLevel, modifierEnforcement, authSensitivity, docSensitivity, denialRate, avgDays, reimbRate }: PayerScoreCardProps) {
  const levelColors: Record<string, { pill: string; dot: string }> = {
    low:      { pill: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    medium:   { pill: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-500"   },
    high:     { pill: "bg-orange-50 text-orange-700 border-orange-200",     dot: "bg-orange-500"  },
    critical: { pill: "bg-red-50 text-red-700 border-red-200",             dot: "bg-red-500"     },
  };
  const lc = levelColors[riskLevel] ?? levelColors.medium;

  const bars = [
    { label: "Modifier Enforcement", value: Math.round(modifierEnforcement * 100), color: "bg-violet-500" },
    { label: "Auth Sensitivity",     value: Math.round(authSensitivity * 100),     color: "bg-amber-500"  },
    { label: "Documentation Req.",   value: Math.round(docSensitivity * 100),       color: "bg-blue-500"   },
    { label: "Base Denial Rate",     value: Math.round(denialRate * 100),           color: "bg-red-400"    },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold text-slate-800 text-sm">{name}</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${lc.pill}`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${lc.dot} mr-1`} />
          {riskLevel}
        </span>
      </div>
      <div className="space-y-3 mb-4">
        {bars.map(b => <RiskBar key={b.label} label={b.label} value={b.value} color={b.color} />)}
      </div>
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50">
        <div>
          <p className="text-[10px] text-slate-400 mb-0.5">Avg Days to Pay</p>
          <p className="text-sm font-bold text-slate-800">{avgDays}d</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 mb-0.5">Avg Reimb. Rate</p>
          <p className="text-sm font-bold text-emerald-600">{Math.round(reimbRate * 100)}%</p>
        </div>
      </div>
    </div>
  );
}
