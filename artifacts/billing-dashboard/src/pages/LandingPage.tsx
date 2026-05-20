import { useState, useEffect } from "react";
import {
  CheckCircle2, ChevronRight, Zap, Shield, BarChart3, GitBranch,
  Brain, MapPin, Users, Star, ArrowRight, Play, TrendingUp,
  AlertTriangle, DollarSign, Clock, FileCheck, Sparkles, Globe,
  Building2, Award, Activity
} from "lucide-react";
import logoUrl from "/logo.png";

interface Props {
  onEnterApp: () => void;
}

// ── Stat card (hero floating widget) ─────────────────────────────────────────

function StatCard({ label, value, delta, color, delay = 0 }: {
  label: string; value: string; delta?: string; color: string; delay?: number;
}) {
  return (
    <div
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 shadow-xl animate-float"
      style={{ animationDelay: `${delay}s` }}
    >
      <p className="text-white/60 text-xs font-medium mb-1">{label}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
      {delta && (
        <p className={`text-xs font-medium mt-1 ${color}`}>{delta}</p>
      )}
    </div>
  );
}

// ── Feature card ──────────────────────────────────────────────────────────────

function FeatureCard({ icon: Icon, title, desc, color, delay = 0 }: {
  icon: any; title: string; desc: string; color: string; delay?: number;
}) {
  return (
    <div
      className="group bg-white border border-slate-100 rounded-2xl p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${delay}s`, animationFillMode: "both" }}
    >
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-5`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-slate-900 font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

// ── Testimonial card ──────────────────────────────────────────────────────────

function TestimonialCard({ quote, name, title, org, avatar, delay = 0 }: {
  quote: string; name: string; title: string; org: string; avatar: string; delay?: number;
}) {
  return (
    <div
      className="bg-white border border-slate-100 rounded-2xl p-7 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${delay}s`, animationFillMode: "both" }}
    >
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${avatar} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
          {name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>
        <div>
          <p className="text-slate-900 font-semibold text-sm">{name}</p>
          <p className="text-slate-500 text-xs">{title} · {org}</p>
        </div>
      </div>
    </div>
  );
}

// ── Pricing card ──────────────────────────────────────────────────────────────

function PricingCard({ tier, price, period, desc, features, highlighted, cta, onCta }: {
  tier: string; price: string; period: string; desc: string;
  features: string[]; highlighted?: boolean; cta: string;
  onCta: () => void;
}) {
  return (
    <div className={`rounded-2xl p-8 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
      highlighted
        ? "bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-200 scale-105"
        : "bg-white border border-slate-100 shadow-sm text-slate-900"
    }`}>
      {highlighted && (
        <div className="flex justify-center mb-4">
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            Most Popular
          </span>
        </div>
      )}
      <p className={`text-sm font-bold uppercase tracking-widest mb-2 ${highlighted ? "text-blue-200" : "text-slate-500"}`}>{tier}</p>
      <div className="flex items-end gap-1 mb-1">
        <span className="text-4xl font-black">{price}</span>
        <span className={`text-sm mb-2 ${highlighted ? "text-blue-200" : "text-slate-500"}`}>/{period}</span>
      </div>
      <p className={`text-sm mb-6 ${highlighted ? "text-blue-100" : "text-slate-500"}`}>{desc}</p>
      <ul className="space-y-3 flex-1 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${highlighted ? "text-blue-200" : "text-emerald-500"}`} />
            <span className={`text-sm ${highlighted ? "text-blue-100" : "text-slate-600"}`}>{f}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onCta}
        className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
          highlighted
            ? "bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
            : "bg-slate-900 text-white hover:bg-slate-700"
        }`}
      >
        {cta}
      </button>
    </div>
  );
}

// ── Workflow step ─────────────────────────────────────────────────────────────

function WorkflowStep({ step, label, desc, color, active }: {
  step: number; label: string; desc: string; color: string; active?: boolean;
}) {
  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 ${active ? "bg-blue-50 border border-blue-100" : ""}`}>
      <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm`}>
        {step}
      </div>
      <div>
        <p className="font-semibold text-slate-800 text-sm">{label}</p>
        <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ── Animated KPI bar ──────────────────────────────────────────────────────────

function KpiBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth((value / max) * 100), 300);
    return () => clearTimeout(t);
  }, [value, max]);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="text-slate-900 font-bold">{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────

export default function LandingPage({ onEnterApp }: Props) {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── Top Nav ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 flex items-center">
              <img src={logoUrl} alt="ClaimFlow" className="h-8 w-auto object-contain" />
            </div>
            <span className="hidden sm:inline-block text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
              Healthcare RCM Platform
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden sm:block text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors px-3 py-2">
              Features
            </button>
            <button className="hidden sm:block text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors px-3 py-2">
              Pricing
            </button>
            <button className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors px-3 py-2 border border-slate-200 rounded-lg hover:border-slate-300">
              Sign In
            </button>
            <button
              onClick={onEnterApp}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              Launch Demo
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-24 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "48px 48px"
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: headline */}
            <div className={`transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                <span className="text-white/80 text-xs font-medium">AI-powered Revenue Cycle Management</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-6">
                Clean Claims.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                  Faster Payments.
                </span>
              </h1>
              <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-lg">
                ClaimFlow's AI catches denials before they happen — specialty-aware scrubbing, payer-specific rules, and real-time lifecycle tracking for modern billing teams.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={onEnterApp}
                  className="group inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-7 py-4 rounded-2xl text-base transition-all duration-200 shadow-xl shadow-blue-500/25 hover:shadow-blue-400/30 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Launch Demo Workspace
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="inline-flex items-center gap-2 text-white/70 hover:text-white font-medium text-base transition-colors">
                  <span>Request a Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-8 flex items-center gap-6">
                {[
                  { label: "Clean claim rate", value: "94.2%" },
                  { label: "Faster first-pass", value: "3.1×" },
                  { label: "Denial reduction", value: "61%" },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-white font-black text-2xl">{s.value}</p>
                    <p className="text-white/40 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: dashboard mockup with floating cards */}
            <div className={`relative transition-all duration-700 delay-200 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              {/* Main card mockup */}
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-1 shadow-2xl">
                <div className="bg-slate-900/80 rounded-2xl overflow-hidden">
                  {/* Mock browser bar */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                    </div>
                    <div className="flex-1 mx-3 bg-white/10 rounded-md px-3 py-1 text-white/30 text-xs">
                      claimflow.app / dashboard
                    </div>
                  </div>
                  {/* Mock dashboard content */}
                  <div className="p-4 space-y-3">
                    {/* KPI row */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Clean Claim Rate", value: "94.2%", color: "text-emerald-400", change: "+2.1%" },
                        { label: "Revenue at Risk", value: "$12,840", color: "text-amber-400", change: "4 claims" },
                        { label: "Avg Days to Pay", value: "18.4", color: "text-blue-400", change: "-2.3 days" },
                      ].map(k => (
                        <div key={k.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <p className="text-white/40 text-[10px] mb-1">{k.label}</p>
                          <p className={`font-bold text-base ${k.color}`}>{k.value}</p>
                          <p className="text-white/30 text-[9px] mt-0.5">{k.change}</p>
                        </div>
                      ))}
                    </div>
                    {/* Claim rows */}
                    <div className="space-y-1.5">
                      {[
                        { id: "CLM-2024-001", patient: "R. Hadley", status: "Paid", color: "text-emerald-400 bg-emerald-400/10", amount: "$171" },
                        { id: "CLM-2024-003", patient: "V. Esposito", status: "Denied", color: "text-red-400 bg-red-400/10", amount: "$52" },
                        { id: "CLM-2024-008", patient: "T. Nakamura", status: "Pending", color: "text-amber-400 bg-amber-400/10", amount: "$890" },
                        { id: "CLM-2024-012", patient: "A. Santiago", status: "Approved", color: "text-blue-400 bg-blue-400/10", amount: "$340" },
                      ].map(c => (
                        <div key={c.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                          <span className="text-white/30 text-[10px] font-mono">{c.id}</span>
                          <span className="text-white/60 text-[10px]">{c.patient}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${c.color}`}>{c.status}</span>
                          <span className="text-white/50 text-[10px] font-medium">{c.amount}</span>
                        </div>
                      ))}
                    </div>
                    {/* Scrub bar */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-emerald-400 text-[10px] font-medium">AI Scrubber active — 0 errors, 1 warning on CLM-2024-014</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating stat cards */}
              <div className="absolute -left-8 top-1/3 hidden lg:block">
                <StatCard label="First-Pass Rate" value="94.2%" delta="↑ 2.1% this month" color="text-emerald-300" delay={0} />
              </div>
              <div className="absolute -right-6 top-8 hidden lg:block">
                <StatCard label="Denial Rate" value="5.8%" delta="↓ 1.4% vs last quarter" color="text-blue-300" delay={0.3} />
              </div>
              <div className="absolute -right-4 bottom-8 hidden lg:block">
                <StatCard label="Days to Pay" value="18.4" delta="↓ 2.3 days vs avg" color="text-cyan-300" delay={0.6} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof strip ───────────────────────────────────────────────── */}
      <section className="py-8 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-slate-400 text-xs font-semibold uppercase tracking-widest mb-6">
            Trusted by billing teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            {["Northeast Urology Group", "Sunrise Family Medicine", "Pacific Coast Orthopaedics", "MidWest Cardiology", "Valley Dermatology"].map(name => (
              <div key={name} className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600 text-sm font-semibold">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">Platform Capabilities</p>
            <h2 className="text-4xl font-black text-slate-900 mb-4">Everything you need to<br />maximize reimbursement</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              One unified platform for pre-submission scrubbing, denial management, payer intelligence, and performance analytics.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Brain}
              title="AI-Powered Scrubbing"
              desc="GPT-4-powered pre-submission checks catch CPT/ICD-10 conflicts, missing modifiers, and prior auth requirements before they trigger denials."
              color="bg-blue-600"
              delay={0}
            />
            <FeatureCard
              icon={Shield}
              title="Denial Prevention"
              desc="Real-time alerts for known payer-specific denial patterns. Specialty-aware rules for Urology, Cardiology, Orthopedics, and more."
              color="bg-indigo-600"
              delay={0.1}
            />
            <FeatureCard
              icon={MapPin}
              title="Payer Intelligence"
              desc="State-specific payer profiles load local market share data, contracted rates, prior auth thresholds, and denial appeal timelines."
              color="bg-violet-600"
              delay={0.2}
            />
            <FeatureCard
              icon={GitBranch}
              title="Claim Lifecycle Tracking"
              desc="Follow every claim from Draft through Paid with a full audit trail. One-click corrections and resubmissions directly from the timeline."
              color="bg-emerald-600"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ── Specialty-aware billing ──────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-indigo-600 text-sm font-bold uppercase tracking-widest mb-3">Specialty Intelligence</p>
              <h2 className="text-4xl font-black text-slate-900 mb-5">
                Built for your specialty — not just billing in general
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                ClaimFlow's specialty modes load discipline-specific CPT code libraries, modifier rules, and denial patterns so your team doesn't need to be coding experts.
              </p>
              <div className="space-y-3">
                {[
                  { icon: "🩺", name: "Urology", tags: ["52000", "55700", "84153", "Modifier -59"] },
                  { icon: "🫀", name: "Cardiology", tags: ["93000", "99213", "I25.10", "Prior auth"] },
                  { icon: "🦴", name: "Orthopedics", tags: ["27447", "G-codes", "Workers' comp"] },
                  { icon: "👨‍⚕️", name: "Family Medicine", tags: ["99213", "99214", "-25 modifier", "Preventive"] },
                ].map(s => (
                  <div key={s.name} className="flex items-center gap-4 bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-2xl">{s.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-sm">{s.name}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {s.tags.map(t => (
                          <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{t}</span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {/* Scrub result mockup */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-800">AI Scrub Results</span>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">Score: 88/100</span>
                </div>
                <div className="space-y-2">
                  {[
                    { type: "error", msg: "ICD-10 Z00.00 not covered for CPT 84153 under Medicare" },
                    { type: "warning", msg: "Modifier -59 recommended to distinguish overlapping services" },
                    { type: "pass", msg: "CPT 52000 with diagnosis R31.0 — valid pairing" },
                    { type: "pass", msg: "Prior authorization not required for this payer/procedure" },
                  ].map((r, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                      r.type === "error" ? "bg-red-50 border border-red-100" :
                      r.type === "warning" ? "bg-amber-50 border border-amber-100" :
                      "bg-emerald-50 border border-emerald-100"
                    }`}>
                      {r.type === "error" && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                      {r.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                      {r.type === "pass" && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                      <span className={
                        r.type === "error" ? "text-red-700" :
                        r.type === "warning" ? "text-amber-700" :
                        "text-emerald-700"
                      }>{r.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                <Sparkles className="w-5 h-5 text-blue-200 mb-3" />
                <p className="font-bold text-lg mb-1">AI Recommendation</p>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Change ICD-10 from Z00.00 to Z12.5 (Encounter for screening for malignant neoplasm of prostate) to establish medical necessity for PSA screening under Medicare.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Payer intelligence ───────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-violet-600 text-sm font-bold uppercase tracking-widest mb-3">Regional Intelligence</p>
            <h2 className="text-4xl font-black text-slate-900 mb-4">State-specific payer rules, loaded automatically</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Different states, different rules. ClaimFlow loads state-specific payer profiles, contracted networks, and compliance requirements for NY, FL, CA, TX, and nationwide.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { id: "US", name: "National", color: "bg-blue-600", items: ["Medicare", "Medicaid", "BCBS", "Aetna", "Cigna"] },
              { id: "NY", name: "New York", color: "bg-indigo-600", items: ["No-Fault/PIP", "Workers' Comp", "Empire BCBS", "Fidelis Care"] },
              { id: "FL", name: "Florida", color: "bg-orange-500", items: ["Florida Blue", "Sunshine Health", "Molina", "WellCare"] },
              { id: "CA", name: "California", color: "bg-amber-500", items: ["Medi-Cal", "Blue Shield CA", "Covered CA", "Kaiser"] },
              { id: "TX", name: "Texas", color: "bg-red-500", items: ["Texas Medicaid", "BCBS Texas", "Scott & White", "Ambetter"] },
            ].map(s => (
              <div key={s.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-200">
                <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center text-white font-black text-lg mb-4 shadow-sm`}>
                  {s.id}
                </div>
                <p className="font-bold text-slate-800 text-sm mb-3">{s.name}</p>
                <ul className="space-y-1.5">
                  {s.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-1 h-1 rounded-full bg-slate-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Assistant highlight ───────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-slate-900 to-blue-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle at 25% 25%, rgba(59,130,246,0.5) 0%, transparent 60%), radial-gradient(circle at 75% 75%, rgba(99,102,241,0.5) 0%, transparent 60%)"
        }} />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Chat mockup */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">ClaimFlow AI</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-white/40 text-[10px]">Online · GPT-4 powered</p>
                  </div>
                </div>
              </div>
              {[
                { role: "user", msg: "What's causing the denials on CPT 84153?" },
                { role: "ai", msg: "Medicare requires ICD-10 Z12.5 for PSA screening, not Z00.00. The diagnosis 'general exam' doesn't establish medical necessity. I've flagged 3 claims with this issue — want me to suggest corrections?" },
                { role: "user", msg: "Yes, correct all three and flag for review" },
                { role: "ai", msg: "Done. Updated ICD-10 on CLM-2024-003, -007, -011 to Z12.5. All three are now ready for resubmission. Expected recovery: $156.00." },
              ].map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs rounded-2xl px-4 py-3 text-sm ${
                    m.role === "user"
                      ? "bg-blue-500 text-white rounded-br-sm"
                      : "bg-white/10 text-white/85 rounded-bl-sm border border-white/10"
                  }`}>
                    {m.msg}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <p className="text-blue-300 text-sm font-bold uppercase tracking-widest mb-3">AI Billing Assistant</p>
              <h2 className="text-4xl font-black text-white mb-5">
                Your expert billing consultant, available 24/7
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                Ask about specific CPT codes, denial patterns, modifier requirements, or prior authorization thresholds. The AI assistant knows your specialty and your payer mix.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Zap, title: "Instant code lookups", desc: "CPT, ICD-10, modifier rules, and bundling policies" },
                  { icon: TrendingUp, title: "Denial trend analysis", desc: "Identifies patterns across your claims history" },
                  { icon: Award, title: "Appeal letter drafts", desc: "Generates payer-specific appeal documentation" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4.5 h-4.5 text-blue-300 w-[18px] h-[18px]" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{title}</p>
                      <p className="text-white/50 text-xs mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KPI Analytics ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-emerald-600 text-sm font-bold uppercase tracking-widest mb-3">Performance Analytics</p>
              <h2 className="text-4xl font-black text-slate-900 mb-5">
                Executive-level insights, out of the box
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                Track clean claim rate, DSO, denial rates by payer and specialty, and revenue recovery — all updated in real time as claims move through the lifecycle.
              </p>
              <div className="space-y-5">
                <KpiBar label="Clean Claim Rate" value={94} max={100} color="bg-emerald-500" />
                <KpiBar label="First-Pass Acceptance" value={89} max={100} color="bg-blue-500" />
                <KpiBar label="Claims Recovered from Denial" value={72} max={100} color="bg-violet-500" />
                <KpiBar label="Electronic Submission Rate" value={98} max={100} color="bg-indigo-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: DollarSign, label: "Monthly Revenue", value: "$248,400", delta: "+8.2% MoM", bg: "bg-emerald-50", border: "border-emerald-100", icon_color: "text-emerald-600", delta_color: "text-emerald-600" },
                { icon: Activity, label: "Claims Submitted", value: "312", delta: "+24 this week", bg: "bg-blue-50", border: "border-blue-100", icon_color: "text-blue-600", delta_color: "text-blue-600" },
                { icon: AlertTriangle, label: "Denials (MTD)", value: "18", delta: "↓ 6 vs last month", bg: "bg-red-50", border: "border-red-100", icon_color: "text-red-500", delta_color: "text-red-600" },
                { icon: Clock, label: "Avg Days to Pay", value: "18.4", delta: "↓ 2.3 days vs avg", bg: "bg-indigo-50", border: "border-indigo-100", icon_color: "text-indigo-600", delta_color: "text-indigo-600" },
              ].map(k => (
                <div key={k.label} className={`${k.bg} border ${k.border} rounded-2xl p-6`}>
                  <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
                    <k.icon className={`w-5 h-5 ${k.icon_color}`} />
                  </div>
                  <p className="text-slate-500 text-xs font-medium mb-1">{k.label}</p>
                  <p className="text-slate-900 font-black text-2xl">{k.value}</p>
                  <p className={`text-xs font-medium mt-1.5 ${k.delta_color}`}>{k.delta}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow Timeline ────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">Claim Lifecycle</p>
            <h2 className="text-4xl font-black text-slate-900 mb-4">Track every claim, every step of the way</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Full audit trail from first keystroke to EFT deposit — with one-click corrections and resubmissions built in.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Steps */}
            <div className="lg:col-span-1 space-y-2">
              {[
                { step: 1, label: "Draft", desc: "Claim created with patient and coding details", color: "bg-slate-500" },
                { step: 2, label: "AI Scrubbed", desc: "Automated pre-submission validation complete", color: "bg-blue-600", active: true },
                { step: 3, label: "Submitted", desc: "837P transmitted via clearinghouse", color: "bg-violet-600" },
                { step: 4, label: "Pending", desc: "Payer adjudication in progress", color: "bg-amber-500" },
                { step: 5, label: "Approved / Paid", desc: "ERA received, EFT deposited", color: "bg-emerald-600" },
              ].map(s => (
                <WorkflowStep key={s.step} {...s} />
              ))}
            </div>
            {/* Denial correction example */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <p className="font-bold text-slate-700 text-sm">Denial → Correction workflow</p>
                <span className="ml-auto text-xs text-slate-500">CLM-2024-003</span>
              </div>
              <div className="p-6 space-y-3">
                {[
                  { status: "Denied", date: "Jun 3", note: "CO-50: Diagnosis not covered for service", color: "bg-red-100 text-red-700 border-red-200" },
                  { status: "AI Alert", date: "Jun 3", note: "ClaimFlow AI identified fix: change ICD-10 to Z12.5", color: "bg-blue-100 text-blue-700 border-blue-200" },
                  { status: "Corrected", date: "Jun 4", note: "ICD-10 updated, appeal letter generated", color: "bg-sky-100 text-sky-700 border-sky-200" },
                  { status: "Resubmitted", date: "Jun 5", note: "Corrected claim submitted with supporting documentation", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
                  { status: "Approved", date: "Jun 14", note: "Appeal accepted. ERA/835 received.", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
                ].map((e, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${e.color}`}>{e.status}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 text-sm">{e.note}</p>
                    </div>
                    <span className="text-slate-400 text-xs shrink-0">{e.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-amber-600 text-sm font-bold uppercase tracking-widest mb-3">Customer Stories</p>
            <h2 className="text-4xl font-black text-slate-900 mb-4">Loved by billing teams across the country</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <TestimonialCard
              quote="We reduced denials by 58% in our first quarter with ClaimFlow. The urology specialty mode alone paid for the subscription in the first week."
              name="Dr. Patricia Vance"
              title="Medical Director"
              org="Southwest Urology Group"
              avatar="bg-violet-600"
              delay={0}
            />
            <TestimonialCard
              quote="The AI scrubber catches things our billers miss after 10 years. It's like having a coding expert looking over every single claim before submission."
              name="Marcus Torres"
              title="Lead Billing Specialist"
              org="Northgate Urology Associates"
              avatar="bg-blue-600"
              delay={0.1}
            />
            <TestimonialCard
              quote="We went from 21 days to pay to 16.4 in two months. The payer intelligence rules for New York No-Fault claims were a game changer."
              name="Anita Patel"
              title="Revenue Cycle Manager"
              org="Empire State Family Medicine"
              avatar="bg-emerald-600"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl font-black text-slate-900 mb-4">Transparent, outcome-based pricing</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Start free. Scale as you grow. No long-term contracts required.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 items-stretch">
            <PricingCard
              tier="Starter"
              price="$299"
              period="mo"
              desc="For solo practitioners and small practices"
              features={["Up to 150 claims/month", "AI scrubbing (5 specialties)", "2 payer regions", "Email support", "7-day audit log"]}
              cta="Start Free Trial"
              onCta={onEnterApp}
            />
            <PricingCard
              tier="Growth"
              price="$699"
              period="mo"
              desc="For multi-provider practices"
              features={["Up to 500 claims/month", "All specialties + custom rules", "All 50 states coverage", "AI denial assistant", "Team roles (up to 5)", "Priority support + SLA"]}
              highlighted
              cta="Launch Demo Workspace"
              onCta={onEnterApp}
            />
            <PricingCard
              tier="Enterprise"
              price="Custom"
              period="quote"
              desc="For billing companies and health systems"
              features={["Unlimited claims volume", "Custom specialty profiles", "API & EHR integration", "Dedicated CSM", "HIPAA BAA included", "White-label option"]}
              cta="Contact Sales"
              onCta={onEnterApp}
            />
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 50%, white 0%, transparent 50%)"
        }} />
        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <Globe className="w-12 h-12 text-white/30 mx-auto mb-6" />
          <h2 className="text-4xl font-black text-white mb-4">
            Ready to stop leaving money on the table?
          </h2>
          <p className="text-blue-100 text-lg mb-10">
            Join 200+ billing teams who've already improved their clean claim rate with ClaimFlow. No setup required — explore the full platform in your browser right now.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onEnterApp}
              className="group inline-flex items-center gap-2.5 bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl text-base hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              Launch Demo Workspace
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="inline-flex items-center gap-2 text-white/80 hover:text-white font-semibold text-base transition-colors">
              Request a Personalized Demo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-blue-200/60 text-sm mt-6">No sign-up required · HIPAA compliant · Simulated data</p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 flex items-center">
                <img src={logoUrl} alt="ClaimFlow" className="h-7 w-auto object-contain" />
              </div>
              <p className="text-slate-400 text-sm">Modern Revenue Cycle Intelligence</p>
            </div>
            <div className="flex items-center gap-6">
              {["Privacy", "Terms", "HIPAA", "Security", "Contact"].map(l => (
                <button key={l} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">{l}</button>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-600 text-xs">
            <p>© 2026 ClaimFlow Inc. All rights reserved.</p>
            <p>Simulated data · For demonstration purposes only · Not a licensed billing service</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
