import { TrendingUp, TrendingDown, FileCheck, Clock, DollarSign, AlertTriangle, ArrowUpRight } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Area, AreaChart,
} from "recharts";
import { DENIAL_REASONS, PAYER_DATA, MONTHLY_TREND } from "@/data/mockData";

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

export default function Dashboard() {
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
