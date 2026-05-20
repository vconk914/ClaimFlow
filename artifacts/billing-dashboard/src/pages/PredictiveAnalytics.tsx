import { useMemo, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, Brain, AlertTriangle, Shield,
  DollarSign, Clock, Activity, ChevronRight, Zap, Eye,
  BarChart3, Target,
} from "lucide-react";
import { useClaimStore } from "@/context/ClaimStore";
import { computeClaimRisk, computePortfolioForecast, generateTrendSeries } from "@/lib/riskEngine";
import { PAYER_PROFILES } from "@/data/payerProfiles";
import { RiskArc, RiskBadge, getRiskColor, PayerScoreCard } from "@/components/RiskMeter";
import ClaimDetailModal from "@/components/ClaimDetailModal";
import type { Claim } from "@/data/mockData";

// ── Custom tooltip ─────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-bold text-slate-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-bold text-slate-800">{typeof p.value === "number" && p.value > 999 ? `$${(p.value / 1000).toFixed(0)}k` : p.value}{p.unit ?? ""}</span>
        </div>
      ))}
    </div>
  );
}

// ── Forecast KPI card ──────────────────────────────────────────────────────────

function ForecastCard({ icon: Icon, label, value, subvalue, trend, trendLabel, color, bg }: {
  icon: any; label: string; value: string; subvalue?: string;
  trend: "up" | "down" | "neutral"; trendLabel: string;
  color: string; bg: string;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Activity;
  const trendColor = trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-amber-500";
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center shadow-sm`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span>{trendLabel}</span>
        </div>
      </div>
      <p className="text-slate-500 text-xs font-medium mb-1">{label}</p>
      <p className="text-slate-900 text-2xl font-black">{value}</p>
      {subvalue && <p className="text-slate-400 text-xs mt-1">{subvalue}</p>}
    </div>
  );
}

// ── Risk table row ─────────────────────────────────────────────────────────────

function RiskTableRow({ claim, risk, onOpen }: { claim: Claim; risk: ReturnType<typeof computeClaimRisk>; onOpen: () => void }) {
  const dc = getRiskColor(risk.denialProbability);
  return (
    <tr
      className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors group"
      onClick={onOpen}
    >
      <td className="py-3 px-4">
        <p className="text-xs font-mono text-slate-500">{claim.id}</p>
        <p className="text-sm font-semibold text-slate-800">{claim.patient}</p>
      </td>
      <td className="py-3 px-4">
        <p className="text-xs font-mono text-slate-600 font-semibold">{claim.cpt}</p>
        <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{claim.cptDescription}</p>
      </td>
      <td className="py-3 px-4">
        <p className="text-sm text-slate-600">{claim.payer}</p>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${dc.fill} rounded-full transition-all`} style={{ width: `${risk.denialProbability}%` }} />
          </div>
          <RiskBadge probability={risk.denialProbability} size="xs" />
        </div>
      </td>
      <td className="py-3 px-4 text-sm font-semibold text-emerald-600">${risk.estimatedReimbursement}</td>
      <td className="py-3 px-4">
        <span className="text-xs text-slate-500">{risk.estimatedDaysToPayment}d</span>
      </td>
      <td className="py-3 px-4">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          risk.cashFlowImpact === "positive" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
          risk.cashFlowImpact === "at-risk"  ? "bg-amber-50 text-amber-700 border-amber-200" :
          "bg-red-50 text-red-700 border-red-200"
        }`}>
          {risk.cashFlowImpact === "positive" ? "Healthy" : risk.cashFlowImpact === "at-risk" ? "At Risk" : "Negative"}
        </span>
      </td>
      <td className="py-3 px-4">
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
      </td>
    </tr>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, label, subtitle, color = "text-blue-600" }: { icon: any; label: string; subtitle?: string; color?: string }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
        <Icon className={`w-4.5 h-4.5 w-[18px] h-[18px] ${color}`} />
      </div>
      <div>
        <h2 className="font-bold text-slate-900 text-base">{label}</h2>
        {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Executive summary badge ────────────────────────────────────────────────────

function InsightBadge({ level, text }: { level: "info" | "warning" | "critical"; text: string }) {
  const styles = {
    info:     "bg-blue-50 border-blue-100 text-blue-700",
    warning:  "bg-amber-50 border-amber-100 text-amber-700",
    critical: "bg-red-50 border-red-100 text-red-700",
  };
  const icons = {
    info: <Brain className="w-3.5 h-3.5 shrink-0" />,
    warning: <AlertTriangle className="w-3.5 h-3.5 shrink-0" />,
    critical: <Zap className="w-3.5 h-3.5 shrink-0" />,
  };
  return (
    <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border text-xs leading-relaxed ${styles[level]}`}>
      {icons[level]}
      <p>{text}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PredictiveAnalytics() {
  const { claims } = useClaimStore();
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [riskFilter, setRiskFilter] = useState<"all" | "high" | "critical">("all");

  // Compute risk scores for all claims
  const claimRisks = useMemo(() =>
    claims.map(c => ({ claim: c, risk: computeClaimRisk(c) })),
    [claims]
  );

  // Portfolio forecast
  const forecast = useMemo(() => computePortfolioForecast(claims), [claims]);

  // Trend series (historical + forecast)
  const trendData = useMemo(() =>
    generateTrendSeries(forecast.projectedCCR, forecast.projectedDenialVolume, forecast.projectedDSO, forecast.projectedMonthlyRevenue),
    [forecast]
  );

  // Sort by denial probability descending
  const sortedRisks = useMemo(() =>
    [...claimRisks]
      .filter(r => {
        if (riskFilter === "high") return r.risk.denialProbability > 40;
        if (riskFilter === "critical") return r.risk.denialProbability > 65;
        return true;
      })
      .sort((a, b) => b.risk.denialProbability - a.risk.denialProbability),
    [claimRisks, riskFilter]
  );

  // Payer distribution for bar chart
  const payerData = useMemo(() => {
    const map: Record<string, { payer: string; avgRisk: number; count: number; totalAmount: number }> = {};
    claimRisks.forEach(({ claim, risk }) => {
      if (!map[claim.payer]) map[claim.payer] = { payer: claim.payer, avgRisk: 0, count: 0, totalAmount: 0 };
      map[claim.payer].avgRisk += risk.denialProbability;
      map[claim.payer].count++;
      map[claim.payer].totalAmount += claim.amount;
    });
    return Object.values(map).map(d => ({
      payer: d.payer.length > 10 ? d.payer.slice(0, 10) + "…" : d.payer,
      avgRisk: Math.round(d.avgRisk / d.count),
      count: d.count,
      revenue: Math.round(d.totalAmount),
    })).sort((a, b) => b.avgRisk - a.avgRisk);
  }, [claimRisks]);

  // AI insights
  const aiInsights = useMemo(() => {
    const insights: { level: "info" | "warning" | "critical"; text: string }[] = [];
    if (forecast.criticalRiskClaims > 0) {
      insights.push({ level: "critical", text: `${forecast.criticalRiskClaims} claim${forecast.criticalRiskClaims > 1 ? "s have" : " has"} a denial probability above 65%. Immediate review recommended before the next submission cycle.` });
    }
    if (forecast.authBottleneckRisk === "high") {
      insights.push({ level: "warning", text: "Your payer mix includes a high proportion of strict-auth payers (Aetna, UHC, Cigna). Prior authorization gaps are the #1 predicted denial driver this cycle." });
    }
    if (forecast.projectedDSO > 22) {
      insights.push({ level: "warning", text: `Projected DSO of ${forecast.projectedDSO} days is above the 21-day benchmark. Medicaid and slow-paying commercial claims are dragging the average.` });
    }
    if (forecast.projectedCCR >= 92) {
      insights.push({ level: "info", text: `Projected clean claim rate of ${forecast.projectedCCR}% is strong. Continuing to resolve scrub warnings before submission should sustain this trajectory.` });
    }
    const deniedClaims = claimRisks.filter(r => r.claim.status === "Denied");
    if (deniedClaims.length > 0) {
      const topDenial = deniedClaims.sort((a, b) => b.claim.amount - a.claim.amount)[0];
      insights.push({ level: "warning", text: `Highest-value active denial: ${topDenial.claim.patient} (${topDenial.claim.payer}, $${topDenial.claim.amount.toFixed(0)}). ${topDenial.risk.predictiveInsight}` });
    }
    insights.push({ level: "info", text: `Expected portfolio reimbursement this cycle: $${(forecast.projectedMonthlyRevenue / 1000).toFixed(1)}k across ${claims.length} claims. Revenue at risk: $${(forecast.projectedRevenueAtRisk / 1000).toFixed(1)}k.` });
    return insights.slice(0, 5);
  }, [forecast, claimRisks, claims.length]);

  // Split trend for historical vs forecast styling
  const historicalData = trendData.filter(d => !d.forecast);
  const forecastData   = trendData.filter(d => d.forecast);
  const splitIndex     = historicalData.length;

  return (
    <div className="space-y-8 animate-tab-enter">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-5 h-5 text-violet-600" />
            <h1 className="text-2xl font-black text-foreground">Predictive Intelligence</h1>
          </div>
          <p className="text-muted-foreground text-sm">AI-powered denial risk, reimbursement forecasting, and operational trend analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-xs text-muted-foreground font-medium">Live · {claims.length} claims analyzed</span>
        </div>
      </div>

      {/* ── Forecast KPI cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ForecastCard
          icon={Target}
          label="Projected Clean Claim Rate"
          value={`${forecast.projectedCCR}%`}
          subvalue="Next 30-day forecast"
          trend="up"
          trendLabel={`+${Math.max(0, forecast.projectedCCR - 91)}% vs avg`}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <ForecastCard
          icon={AlertTriangle}
          label="Projected Denial Volume"
          value={String(forecast.projectedDenialVolume)}
          subvalue={`of ${claims.length} active claims`}
          trend="down"
          trendLabel={`${forecast.highRiskClaims} elevated risk`}
          color="text-red-500"
          bg="bg-red-50"
        />
        <ForecastCard
          icon={DollarSign}
          label="Revenue at Risk"
          value={`$${(forecast.projectedRevenueAtRisk / 1000).toFixed(1)}k`}
          subvalue="Claims with denial prob >40%"
          trend={forecast.projectedRevenueAtRisk > 5000 ? "down" : "neutral"}
          trendLabel={`${forecast.criticalRiskClaims} critical claims`}
          color="text-amber-500"
          bg="bg-amber-50"
        />
        <ForecastCard
          icon={Clock}
          label="Projected DSO"
          value={`${forecast.projectedDSO}d`}
          subvalue="Avg days to reimbursement"
          trend={forecast.projectedDSO <= 18 ? "up" : "neutral"}
          trendLabel={forecast.projectedDSO <= 18 ? "Below 21d target" : "Monitor closely"}
          color="text-blue-600"
          bg="bg-blue-50"
        />
      </div>

      {/* ── Trend + forecast chart ───────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* CCR trend chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
          <SectionHeader
            icon={BarChart3}
            label="Clean Claim Rate — Historical + Forecast"
            subtitle="8-month historical + 3-month projection"
            color="text-blue-600"
          />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="ccrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ccrForeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine x={trendData[splitIndex - 1]?.month} stroke="#e2e8f0" strokeDasharray="4 2" label={{ value: "Forecast →", position: "insideTopRight", fontSize: 10, fill: "#8b5cf6" }} />
              <Area dataKey="ccr" name="CCR" fill="url(#ccrGrad)" stroke="#3b82f6" strokeWidth={2.5} dot={false} unit="%" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-blue-500 rounded" />Historical</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-violet-400 rounded border-dashed border-b" />3-mo Forecast</div>
            <div className="flex items-center gap-1.5 ml-auto"><div className="w-2 h-2 bg-slate-200 rounded-full" />Benchmark: 91%</div>
          </div>
        </div>

        {/* DSO trend */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
          <SectionHeader icon={Clock} label="Projected DSO Trend" subtitle="Days sales outstanding" color="text-indigo-600" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="dsoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[10, 32]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit="d" />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={21} stroke="#fbbf24" strokeDasharray="4 2" label={{ value: "21d target", fontSize: 10, fill: "#f59e0b" }} />
              <Area dataKey="dso" name="DSO" fill="url(#dsoGrad)" stroke="#6366f1" strokeWidth={2.5} dot={false} unit="d" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Revenue forecast ─────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
          <SectionHeader icon={DollarSign} label="Revenue Forecast" subtitle="Projected reimbursement + denial volume" color="text-emerald-600" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine x={trendData[splitIndex - 1]?.month} stroke="#e2e8f0" strokeDasharray="4 2" />
              <Area dataKey="revenue" name="Projected Revenue" fill="url(#revGrad)" stroke="#10b981" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payer risk bar chart */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
          <SectionHeader icon={Shield} label="Denial Risk by Payer" subtitle="Avg probability across claims" color="text-red-500" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={payerData} layout="vertical" margin={{ top: 0, right: 8, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0, 50]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="payer" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="avgRisk" name="Avg Denial Risk" radius={[0, 4, 4, 0]} fill="#ef4444" fillOpacity={0.8} unit="%" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── AI insights ──────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
        <SectionHeader
          icon={Brain}
          label="AI Predictive Insights"
          subtitle="ClaimFlow AI analysis of your current claim portfolio"
          color="text-violet-600"
        />
        <div className="grid sm:grid-cols-2 gap-3">
          {aiInsights.map((ins, i) => (
            <InsightBadge key={i} level={ins.level} text={ins.text} />
          ))}
        </div>
      </div>

      {/* ── Claims risk table ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Eye className="w-4 h-4 text-slate-500" />
              <h2 className="font-bold text-slate-900 text-base">Claim Risk Monitor</h2>
            </div>
            <p className="text-slate-500 text-xs">Click any row to view full claim details and advance workflow</p>
          </div>
          <div className="flex items-center gap-2">
            {(["all", "high", "critical"] as const).map(f => (
              <button
                key={f}
                onClick={() => setRiskFilter(f)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors capitalize ${
                  riskFilter === f
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {f === "all" ? `All (${claimRisks.length})` : f === "high" ? `Elevated (${claimRisks.filter(r => r.risk.denialProbability > 40).length})` : `Critical (${forecast.criticalRiskClaims})`}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {["Claim / Patient", "CPT Code", "Payer", "Denial Risk", "Est. Reimb.", "Days to Pay", "Cash Flow", ""].map(h => (
                  <th key={h} className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedRisks.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-slate-400 text-sm">No claims match this filter</td></tr>
              ) : (
                sortedRisks.slice(0, 20).map(({ claim, risk }) => (
                  <RiskTableRow
                    key={claim.id}
                    claim={claim}
                    risk={risk}
                    onOpen={() => setSelectedClaim(claim)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        {sortedRisks.length > 20 && (
          <div className="px-6 py-3 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">{sortedRisks.length - 20} more claims — use filters to narrow down</p>
          </div>
        )}
      </div>

      {/* ── Payer behavior profiles ───────────────────────────────────────────── */}
      <div>
        <SectionHeader
          icon={Activity}
          label="Payer Behavior Intelligence"
          subtitle="Simulated behavioral profiles used to model denial risk and payment timing"
          color="text-indigo-600"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.values(PAYER_PROFILES)
            .filter(p => p.id !== "other")
            .map(p => (
              <PayerScoreCard
                key={p.id}
                name={p.name}
                riskLevel={p.riskLevel}
                modifierEnforcement={p.modifierEnforcement}
                authSensitivity={p.authSensitivity}
                docSensitivity={p.documentationSensitivity}
                denialRate={p.baseDenialRate}
                avgDays={p.avgDaysToPayment}
                reimbRate={p.avgReimbursementRate}
              />
            ))}
        </div>
      </div>

      {/* Claim detail modal */}
      {selectedClaim && (
        <ClaimDetailModal
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
        />
      )}
    </div>
  );
}
