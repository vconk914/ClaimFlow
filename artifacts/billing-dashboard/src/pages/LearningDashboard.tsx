import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ComposedChart, Line,
} from "recharts";
import {
  BrainCircuit, TrendingUp, TrendingDown, Minus, Sparkles,
  ShieldAlert, FileWarning, Zap, AlertCircle, CheckCircle2,
  Activity, RotateCcw, ChevronRight, Info, Clock, Layers,
} from "lucide-react";
import {
  getLearningStore, getPayerLearning, getCptLearning, getDenialPatterns,
  generateLearningInsights, getLearningTrends, getLearningStats,
  type PayerLearning, type CptLearning, type DenialPattern,
  type LearningInsight, type LearningRecord,
} from "@/lib/learningEngine";
import type { DenialCategory } from "@/lib/learningEngine";

// ── Palette ────────────────────────────────────────────────────────────────────

const CAT_COLORS: Record<DenialCategory, string> = {
  modifier:          "#ef4444",
  auth:              "#f97316",
  documentation:     "#eab308",
  coding:            "#8b5cf6",
  eligibility:       "#06b6d4",
  bundling:          "#64748b",
  medical_necessity: "#ec4899",
  other:             "#94a3b8",
};

const CAT_LABELS: Record<DenialCategory, string> = {
  modifier:          "Modifier",
  auth:              "Prior Auth",
  documentation:     "Documentation",
  coding:            "Coding",
  eligibility:       "Eligibility",
  bundling:          "Bundling",
  medical_necessity: "Medical Necessity",
  other:             "Other",
};

// ── Tooltip ───────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-bold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-bold text-slate-800">
            {p.dataKey === "accuracy" ? `${p.value}%` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, color, bg }: {
  icon: any; label: string; value: string; sub?: string; color: string; bg: string;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── Payer Learning Card ───────────────────────────────────────────────────────

function PayerCard({ pl }: { pl: PayerLearning }) {
  const baselinePercent = Math.round(pl.baselineDenialRate * 100);
  const learnedPercent  = Math.round(pl.learnedDenialRate * 100);
  const delta           = Math.round(pl.denialRateDelta * 100);
  const hasAdj = pl.modifierAdjustment + pl.authAdjustment + pl.documentationAdjustment > 0;

  const trendIcon = pl.riskTrend === "improving" ? TrendingDown : pl.riskTrend === "worsening" ? TrendingUp : Minus;
  const trendColor = pl.riskTrend === "improving" ? "text-emerald-600" : pl.riskTrend === "worsening" ? "text-red-500" : "text-slate-400";

  const catColor = CAT_COLORS[pl.topDenialCategory] ?? "#94a3b8";

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-slate-800 text-sm">{pl.payer}</p>
          <p className="text-xs text-slate-400 mt-0.5">{pl.totalClaims} outcomes learned</p>
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
          {(() => { const TI = trendIcon; return <TI className="w-3.5 h-3.5" />; })()}
          {pl.riskTrend}
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
          <span>Baseline: {baselinePercent}%</span>
          <span className={`font-bold ${delta > 3 ? "text-red-500" : delta < -3 ? "text-emerald-600" : "text-slate-500"}`}>
            Learned: {learnedPercent}% {delta > 0 ? `(+${delta}%)` : delta < 0 ? `(${delta}%)` : ""}
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${delta > 5 ? "bg-red-500" : delta > 0 ? "bg-amber-400" : "bg-emerald-500"}`}
            style={{ width: `${Math.min(100, learnedPercent * 2.5)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-3">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: catColor }} />
        <span className="text-[11px] text-slate-600 font-medium">
          Top pattern: {CAT_LABELS[pl.topDenialCategory]}
        </span>
      </div>

      {hasAdj && (
        <div className="flex flex-wrap gap-1">
          {pl.modifierAdjustment > 0 && (
            <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full font-medium">
              Modifier +{pl.modifierAdjustment}%
            </span>
          )}
          {pl.authAdjustment > 0 && (
            <span className="text-[10px] bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full font-medium">
              Auth +{pl.authAdjustment}%
            </span>
          )}
          {pl.documentationAdjustment > 0 && (
            <span className="text-[10px] bg-yellow-50 text-yellow-700 border border-yellow-100 px-2 py-0.5 rounded-full font-medium">
              Docs +{pl.documentationAdjustment}%
            </span>
          )}
        </div>
      )}
      {!hasAdj && pl.totalClaims > 0 && (
        <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-medium">
          No adjustments needed
        </span>
      )}
      {pl.totalClaims === 0 && (
        <span className="text-[10px] bg-slate-50 text-slate-400 border border-slate-100 px-2 py-0.5 rounded-full font-medium">
          Awaiting data
        </span>
      )}
    </div>
  );
}

// ── Insight Card ──────────────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: LearningInsight }) {
  const icon = insight.severity === "critical" ? AlertCircle
    : insight.severity === "warning" ? ShieldAlert
    : Info;
  const borderColor = insight.severity === "critical" ? "border-l-red-500"
    : insight.severity === "warning" ? "border-l-orange-400"
    : "border-l-blue-400";
  const iconColor = insight.severity === "critical" ? "text-red-500"
    : insight.severity === "warning" ? "text-orange-500"
    : "text-blue-500";
  const Icon = icon;

  return (
    <div className={`bg-white border border-slate-100 border-l-4 ${borderColor} rounded-xl p-4 shadow-sm`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-4 h-4 ${iconColor} shrink-0 mt-0.5`} />
        <div>
          <p className="text-xs font-bold text-slate-800 mb-1">{insight.title}</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">{insight.detail}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-slate-400">Confidence: {insight.confidence}%</span>
            {insight.affectedPayer && (
              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">{insight.affectedPayer}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CPT Table Row ─────────────────────────────────────────────────────────────

function CptRow({ cpt }: { cpt: CptLearning }) {
  const drPct = Math.round(cpt.denialRate * 100);
  const drColor = drPct >= 40 ? "text-red-600" : drPct >= 25 ? "text-orange-500" : drPct >= 15 ? "text-amber-600" : "text-emerald-600";
  const barColor = drPct >= 40 ? "bg-red-500" : drPct >= 25 ? "bg-orange-400" : drPct >= 15 ? "bg-amber-400" : "bg-emerald-500";
  const TrendIcon = cpt.trend === "improving" ? TrendingDown : cpt.trend === "worsening" ? TrendingUp : Minus;
  const trendColor = cpt.trend === "improving" ? "text-emerald-500" : cpt.trend === "worsening" ? "text-red-500" : "text-slate-400";

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
      <td className="py-3 pr-4">
        <p className="text-xs font-bold text-slate-800">{cpt.cpt}</p>
        <p className="text-[11px] text-slate-400">{cpt.procedureName}</p>
      </td>
      <td className="py-3 pr-4 text-center">
        <span className="text-xs font-semibold text-slate-700">{cpt.totalClaims}</span>
      </td>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${drPct}%` }} />
          </div>
          <span className={`text-xs font-bold ${drColor}`}>{drPct}%</span>
        </div>
      </td>
      <td className="py-3 pr-4">
        {cpt.topCategory && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border"
            style={{ color: CAT_COLORS[cpt.topCategory], borderColor: CAT_COLORS[cpt.topCategory] + "40", background: CAT_COLORS[cpt.topCategory] + "10" }}>
            {CAT_LABELS[cpt.topCategory]}
          </span>
        )}
      </td>
      <td className="py-3 pr-4 text-center">
        {cpt.correctionSuccessRate > 0 ? (
          <span className={`text-xs font-semibold ${cpt.correctionSuccessRate >= 70 ? "text-emerald-600" : "text-amber-600"}`}>
            {cpt.correctionSuccessRate}%
          </span>
        ) : <span className="text-xs text-slate-300">—</span>}
      </td>
      <td className="py-3 pr-4 text-center">
        {cpt.riskAdjustment > 0
          ? <span className="text-xs font-bold text-red-500">+{cpt.riskAdjustment}%</span>
          : <span className="text-xs text-emerald-500 font-semibold">0%</span>}
      </td>
      <td className="py-3">
        <TrendIcon className={`w-4 h-4 ${trendColor}`} />
      </td>
    </tr>
  );
}

// ── Recent Events ─────────────────────────────────────────────────────────────

function EventRow({ record }: { record: LearningRecord }) {
  const isGood = record.toStatus === "Approved" || record.toStatus === "Paid" || record.correctionSucceeded;
  const isBad  = record.toStatus === "Denied";
  const dotColor = isGood ? "bg-emerald-500" : isBad ? "bg-red-500" : "bg-amber-400";
  const date = new Date(record.timestamp);
  const dateStr = `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${dotColor}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-800">{record.claimId}</span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{
              background: isBad ? "#fef2f2" : isGood ? "#f0fdf4" : "#fffbeb",
              color: isBad ? "#ef4444" : isGood ? "#16a34a" : "#d97706",
            }}>
            {record.toStatus}
          </span>
          {record.denialCode && (
            <span className="text-[10px] text-slate-400 font-mono">{record.denialCode}</span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
          {record.payer} · CPT {record.cpt} · {record.icd10}
          {record.denialCategory ? ` · ${CAT_LABELS[record.denialCategory]}` : ""}
        </p>
      </div>
      <span className="text-[10px] text-slate-300 shrink-0">{dateStr}</span>
    </div>
  );
}

// ── Denial category chart data ────────────────────────────────────────────────

function buildCategoryChartData(records: LearningRecord[]) {
  const denied = records.filter(r => r.toStatus === "Denied" && r.denialCategory);
  const counts: Partial<Record<DenialCategory, number>> = {};
  for (const r of denied) {
    counts[r.denialCategory!] = (counts[r.denialCategory!] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, count]) => ({
      name: CAT_LABELS[cat as DenialCategory],
      count,
      fill: CAT_COLORS[cat as DenialCategory],
    }));
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LearningDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const { records }    = useMemo(() => getLearningStore(), [refreshKey]);
  const stats          = useMemo(() => getLearningStats(), [refreshKey]);
  const payerLearnings = useMemo(() => getPayerLearning(), [refreshKey]);
  const cptLearnings   = useMemo(() => getCptLearning(), [refreshKey]);
  const patterns       = useMemo(() => getDenialPatterns(), [refreshKey]);
  const insights       = useMemo(() => generateLearningInsights(), [refreshKey]);
  const trends         = useMemo(() => getLearningTrends(), [refreshKey]);
  const catChartData   = useMemo(() => buildCategoryChartData(records), [refreshKey]);
  const recentRecords  = useMemo(() => [...records].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 20), [refreshKey]);

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BrainCircuit className="w-6 h-6 text-violet-600" />
            <h1 className="text-2xl font-black text-slate-900">ClaimFlow Learning Engine</h1>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Learning Active
            </span>
          </div>
          <p className="text-sm text-slate-500 ml-9">
            Adaptive intelligence built from {stats.totalOutcomes} claim outcomes · {stats.patternsIdentified} denial patterns identified
          </p>
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-600 hover:text-violet-700 font-semibold text-xs px-4 py-2 rounded-xl transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Refresh Insights
        </button>
      </div>

      {/* ── KPI Row ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard icon={Activity}      label="Outcomes Learned"    value={stats.totalOutcomes.toString()}
          sub={`${stats.totalDenials} denials · ${stats.totalApproved} approved`}
          color="text-violet-600" bg="bg-violet-50" />
        <KpiCard icon={Layers}        label="Denial Patterns"     value={stats.patternsIdentified.toString()}
          sub="recurring patterns identified"
          color="text-red-500"    bg="bg-red-50" />
        <KpiCard icon={BrainCircuit}  label="Prediction Accuracy" value={`${stats.latestAccuracy}%`}
          sub="up from 66% at launch"
          color="text-blue-600"   bg="bg-blue-50" />
        <KpiCard icon={CheckCircle2}  label="Correction Success"  value={`${stats.correctionSuccessRate}%`}
          sub="corrections → approved"
          color="text-emerald-600" bg="bg-emerald-50" />
        <KpiCard icon={Zap}           label="Active Adjustments"  value={stats.activeAdjustments.toString()}
          sub="payers with risk adjustments"
          color="text-orange-500" bg="bg-orange-50" />
      </div>

      {/* ── Learning Trends Panel ────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">ClaimFlow Learning Trends</h2>
            <p className="text-xs text-slate-400 mt-0.5">How prediction accuracy and pattern recognition have improved over time</p>
          </div>
          <span className="text-[10px] bg-violet-50 text-violet-600 border border-violet-100 px-2.5 py-1 rounded-full font-semibold">
            Oct 2025 – Present
          </span>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trends} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="acc" tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[55, 95]} unit="%" />
                <YAxis yAxisId="cnt" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Area
                  yAxisId="acc"
                  type="monotone" dataKey="accuracy" name="Prediction Accuracy"
                  stroke="#7c3aed" strokeWidth={2} fill="#7c3aed15"
                />
                <Line
                  yAxisId="cnt"
                  type="monotone" dataKey="patternsFound" name="Patterns Found"
                  stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: "#f97316" }}
                />
                <Line
                  yAxisId="cnt"
                  type="monotone" dataKey="outcomesRecorded" name="Outcomes Recorded"
                  stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="4 2"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-700">What ClaimFlow is learning</p>
            {[
              { icon: ShieldAlert, color: "text-red-500 bg-red-50", label: "Payer strictness changes", desc: "Modifier enforcement and auth thresholds tracked per payer" },
              { icon: FileWarning, color: "text-orange-500 bg-orange-50", label: "CPT denial patterns", desc: "Procedure-level denial rates update risk scores automatically" },
              { icon: Sparkles,    color: "text-violet-500 bg-violet-50", label: "Correction effectiveness", desc: "Successful corrections build confidence on future similar claims" },
              { icon: TrendingUp,  color: "text-emerald-500 bg-emerald-50", label: "Operational forecasting", desc: "Denial volume and DSO projections improve with each outcome" },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-2.5">
                <div className={`w-7 h-7 rounded-lg ${item.color.split(" ")[1]} flex items-center justify-center shrink-0`}>
                  {(() => { const I = item.icon; return <I className={`w-3.5 h-3.5 ${item.color.split(" ")[0]}`} />; })()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Denial Patterns + Insights ──────────────────────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">Denial Pattern Analytics</h2>
          <p className="text-xs text-slate-400 mb-5">Denial distribution by category across all learned outcomes</p>
          {catChartData.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catChartData} layout="vertical" margin={{ top: 0, right: 12, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} width={100} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Denials" radius={[0, 4, 4, 0]}>
                    {catChartData.map((entry, i) => (
                      <rect key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-slate-300 text-sm">No denial data yet</div>
          )}

          {patterns.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-50">
              <p className="text-xs font-bold text-slate-700 mb-3">Recurring Patterns</p>
              <div className="space-y-2">
                {patterns.slice(0, 4).map(p => (
                  <div key={p.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50">
                    <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: CAT_COLORS[p.category] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-slate-600 leading-relaxed">{p.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-slate-800">{p.occurrences}×</span>
                      <p className="text-[9px] text-slate-400">{p.trend}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">AI Learning Insights</h2>
            <span className="text-[10px] text-slate-400 font-medium">{insights.length} generated</span>
          </div>
          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {insights.length > 0
              ? insights.map(ins => <InsightCard key={ins.id} insight={ins} />)
              : (
                <div className="bg-slate-50 rounded-xl p-6 text-center text-slate-400 text-xs">
                  Insights will appear as claims are processed
                </div>
              )}
          </div>
        </div>
      </div>

      {/* ── Payer Learning Cards ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Payer Learning Summaries</h2>
          <span className="text-xs text-slate-400">{payerLearnings.filter(p => p.totalClaims > 0).length} payers with data</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {payerLearnings.map(pl => <PayerCard key={pl.payer} pl={pl} />)}
        </div>
      </div>

      {/* ── CPT Specialty Learning Table ─────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50">
          <h2 className="text-base font-bold text-slate-900">Specialty (CPT) Learning</h2>
          <p className="text-xs text-slate-400 mt-0.5">Procedure-level denial patterns used to calibrate pre-submission risk scores</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50">
                {["Procedure", "Claims", "Denial Rate", "Top Reason", "Correction Rate", "Risk Adj.", "Trend"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {cptLearnings.length > 0
                ? cptLearnings.map(c => <CptRow key={c.cpt} cpt={c} />)
                : (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-300 text-xs">No CPT data yet</td></tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Recent Learning Events ───────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Recent Learning Events</h2>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-300" />
              <span className="text-[10px] text-slate-400">Live as claims update</span>
            </div>
          </div>
          <div className="px-5 py-2 max-h-64 overflow-y-auto">
            {recentRecords.map(r => <EventRow key={r.id} record={r} />)}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="px-5 py-4 border-b border-slate-50">
            <h2 className="text-sm font-bold text-slate-900">Denial Code Intelligence</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Denial codes ranked by occurrence across all learned outcomes</p>
          </div>
          <div className="px-5 py-4">
            {(() => {
              const codes: Record<string, number> = {};
              for (const r of records) if (r.denialCode) codes[r.denialCode] = (codes[r.denialCode] ?? 0) + 1;
              const total = Object.values(codes).reduce((s, n) => s + n, 0);
              return Object.entries(codes)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([code, count]) => {
                  const cat = code ? (() => {
                    switch (code.toUpperCase()) {
                      case "CO-4": return "modifier"; case "CO-11": case "CO-8": return "coding";
                      case "CO-16": return "documentation"; case "CO-50": return "medical_necessity";
                      case "CO-15": return "auth"; case "CO-96": case "CO-97": return "bundling";
                      case "PR-1": return "eligibility"; default: return "other";
                    }
                  })() as DenialCategory : "other";
                  const pct = Math.round(count / total * 100);
                  return (
                    <div key={code} className="flex items-center gap-3 py-2">
                      <span className="text-[10px] font-mono font-bold text-slate-600 w-12 shrink-0">{code}</span>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CAT_COLORS[cat] }} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 w-6 text-right shrink-0">{count}</span>
                      <span className="text-[10px] text-slate-300 w-8 text-right shrink-0">{pct}%</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0"
                        style={{ background: CAT_COLORS[cat] + "15", color: CAT_COLORS[cat] }}>
                        {CAT_LABELS[cat]}
                      </span>
                    </div>
                  );
                });
            })()}
          </div>
        </div>
      </div>

      {/* ── How learning adjusts risk scores ────────────────────────────────── */}
      <div className="bg-gradient-to-br from-violet-950 to-slate-900 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <BrainCircuit className="w-5 h-5 text-violet-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white mb-1">How learning adjusts risk scores</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Every time a claim outcome is recorded, the learning engine updates its models in three layers:
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { n: "01", title: "Payer Behavior Updates", desc: "Repeated modifier denials from Aetna increase Aetna's modifier risk factor. Auth denials from UHC raise the auth threshold for all future UHC claims." },
                { n: "02", title: "Procedure Risk Calibration", desc: "If CPT 55700 is denied 40% of the time, a +8% risk adjustment is applied on every new 55700 claim before it leaves the scrubber." },
                { n: "03", title: "Correction Confidence", desc: "When corrected claims get approved at high rates, the engine applies a confidence bonus that offsets some of the payer's baseline risk for future corrections." },
              ].map(item => (
                <div key={item.n} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-violet-300 text-xs font-bold mb-1">{item.n}</p>
                  <p className="text-white text-xs font-semibold mb-1.5">{item.title}</p>
                  <p className="text-white/50 text-[11px] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
