import { TrendingUp, TrendingDown, FileCheck, Clock, DollarSign, AlertTriangle, ArrowUpRight, MapPin, Building2, ShieldAlert, ChevronRight } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Area, AreaChart,
} from "recharts";
import { DENIAL_REASONS, PAYER_DATA, MONTHLY_TREND } from "@/data/mockData";
import { useRegion } from "@/context/RegionalContext";
import { useTeam } from "@/context/TeamContext";
import { ROLE_CONFIGS } from "@/data/teamRoles";
import type { StateId } from "@/data/regionalData";

const RADIAN = Math.PI / 180;

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.1) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-semibold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function KPICard({ title, value, subtitle, icon: Icon, trend, trendLabel, color }: {
  title: string; value: string; subtitle: string; icon: any;
  trend?: "up" | "down" | "neutral"; trendLabel?: string; color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        {trend === "up" && <TrendingUp className="w-4 h-4 text-emerald-500" />}
        {trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
        {trendLabel && (
          <span className={`text-xs font-medium ${trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"}`}>
            {trendLabel}
          </span>
        )}
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </div>
    </div>
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

export default function Dashboard() {
  const { stateId, config } = useRegion();
  const { activeUser } = useTeam();
  const roleConfig = ROLE_CONFIGS[activeUser.role];
  const accent = STATE_ACCENT[stateId];
  const topPayers = config.payers.slice(0, 4);
  const statePattern = config.denialPatterns.find(d => d.stateSpecific);
  const hasNoFault = config.noFault.applicable;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Greenfield Family Medicine · May 2024</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Data Feed
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Clean Claim Rate"
          value="88%"
          subtitle="vs. 82% last month"
          icon={FileCheck}
          trend="up"
          trendLabel="+6%"
          color="bg-blue-500"
        />
        <KPICard
          title="Days Sales Outstanding"
          value="34 days"
          subtitle="Industry avg: 45 days"
          icon={Clock}
          trend="up"
          trendLabel="11 days below avg"
          color="bg-violet-500"
        />
        <KPICard
          title="Claims This Month"
          value="847"
          subtitle="vs. 830 last month"
          icon={ArrowUpRight}
          trend="up"
          trendLabel="+17 claims"
          color="bg-cyan-500"
        />
        <KPICard
          title="Revenue at Risk"
          value="$24,180"
          subtitle="102 denied claims"
          icon={DollarSign}
          trend="down"
          trendLabel="-$3,240 vs last month"
          color="bg-amber-500"
        />
      </div>

      {/* ── Role Workflow Strip ── */}
      <div className={`rounded-xl border ${roleConfig.bg} border-current/10 px-4 py-3`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleConfig.badge}`}>{roleConfig.label}</span>
          <p className={`text-xs font-semibold ${roleConfig.color}`}>Your workflow priorities</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {roleConfig.workflowSuggestions.slice(0, 3).map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-card/70 border border-current/10 rounded-lg px-3 py-1.5">
              <ChevronRight className={`w-3 h-3 shrink-0 ${roleConfig.color}`} />
              <span className={`text-xs ${roleConfig.color}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Regional Intelligence Panel ── */}
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

        {/* Top 4 payers */}
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
        {/* Denial reasons pie chart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-foreground">Top Denial Reasons</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">May 2024</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">102 denied claims this month</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={DENIAL_REASONS}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={110}
                innerRadius={55}
                dataKey="value"
              >
                {DENIAL_REASONS.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}%`, "Share"]} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly trend */}
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
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradRejected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
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
