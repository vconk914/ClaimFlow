import { useState, useRef, useEffect } from "react";
import {
  Bell, X, AlertTriangle, CheckCircle2, Clock, DollarSign,
  FileWarning, ShieldAlert, Info, Sparkles,
} from "lucide-react";

export interface Notification {
  id: string;
  type: "denial" | "payment" | "warning" | "auth" | "info" | "ai";
  title: string;
  detail: string;
  time: string;
  read: boolean;
  claimId?: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "denial",
    title: "Denial Received — CLM-2024-006",
    detail: "Aetna issued CO-4 (modifier required). CPT 99214 billed same-day as cystoscopy — add Modifier -25 and resubmit.",
    time: "2 min ago",
    read: false,
    claimId: "CLM-2024-006",
  },
  {
    id: "n2",
    type: "auth",
    title: "Prior Auth Expiring — CLM-2024-014",
    detail: "UnitedHealth authorization for CPT 52601 expires in 3 days. Schedule or cancel before expiry to avoid CO-197.",
    time: "18 min ago",
    read: false,
    claimId: "CLM-2024-014",
  },
  {
    id: "n3",
    type: "payment",
    title: "Payment Posted — CLM-2024-001",
    detail: "Medicare EFT of $171.00 posted. Claim fully adjudicated — no balance due.",
    time: "1 hr ago",
    read: false,
    claimId: "CLM-2024-001",
  },
  {
    id: "n4",
    type: "warning",
    title: "Scrubber Warning — CLM-2024-019",
    detail: "ICD-10 Z00.00 (Annual Exam) is paired with PSA 84153. Medicare requires Z12.5 for screening — correct before submission.",
    time: "3 hr ago",
    read: true,
    claimId: "CLM-2024-019",
  },
  {
    id: "n5",
    type: "ai",
    title: "AI Insight — High Denial Risk Cluster",
    detail: "3 pending Cigna claims share CPT 55700 without documented R97.20 (Elevated PSA). Bundle-correct before next submission cycle.",
    time: "5 hr ago",
    read: true,
  },
  {
    id: "n6",
    type: "info",
    title: "Clean Claim Rate Improved",
    detail: "First-pass acceptance rate reached 94.2% this week — up 2.1% from last week. Scrubber corrections are working.",
    time: "Yesterday",
    read: true,
  },
];

const TYPE_CONFIG = {
  denial:  { icon: AlertTriangle,  color: "text-red-500",    bg: "bg-red-50",     border: "border-red-100"    },
  payment: { icon: DollarSign,     color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  warning: { icon: FileWarning,    color: "text-amber-500",  bg: "bg-amber-50",   border: "border-amber-100"  },
  auth:    { icon: ShieldAlert,    color: "text-orange-500", bg: "bg-orange-50",  border: "border-orange-100" },
  info:    { icon: Info,           color: "text-blue-500",   bg: "bg-blue-50",    border: "border-blue-100"   },
  ai:      { icon: Sparkles,       color: "text-violet-600", bg: "bg-violet-50",  border: "border-violet-100" },
};

interface Props {
  collapsed: boolean;
}

export default function NotificationsPanel({ collapsed }: Props) {
  const [open, setOpen]                   = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.read).length;

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function markRead(id: string) {
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  }

  function markAllRead() {
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  }

  function dismiss(id: string) {
    setNotifications(ns => ns.filter(n => n.id !== id));
  }

  return (
    <div ref={panelRef} className="relative">
      {/* Bell trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        title={collapsed ? "Notifications" : undefined}
        className={`relative flex items-center gap-3 rounded-lg text-sm transition-colors ${
          collapsed ? "w-10 h-10 justify-center p-0" : "w-full px-3 py-2"
        } ${
          open
            ? "bg-sidebar-accent text-sidebar-foreground"
            : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        }`}
      >
        <Bell className="w-4 h-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">Notifications</span>
            {unread > 0 && (
              <span className="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold leading-none">
                {unread}
              </span>
            )}
          </>
        )}
        {/* Badge on icon when collapsed */}
        {collapsed && unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
            {unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute bottom-full left-full ml-2 mb-0 w-[360px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-left-2 fade-in duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="font-bold text-slate-800 text-sm">Notifications</span>
              {unread > 0 && (
                <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[420px]">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">All caught up!</p>
                <p className="text-xs text-slate-300 mt-0.5">No new notifications</p>
              </div>
            ) : (
              notifications.map(n => {
                const cfg = TYPE_CONFIG[n.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`relative flex gap-3 px-4 py-3.5 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 group ${
                      !n.read ? "bg-blue-50/30" : ""
                    }`}
                  >
                    {/* Unread dot */}
                    {!n.read && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    )}

                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold leading-snug ${n.read ? "text-slate-600" : "text-slate-900"}`}>
                          {n.title}
                        </p>
                        <button
                          onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-200 text-slate-400 transition-all shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{n.detail}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Clock className="w-2.5 h-2.5 text-slate-300" />
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                        {n.claimId && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {n.claimId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[10px] text-slate-400 text-center">
                Showing {notifications.length} notification{notifications.length !== 1 ? "s" : ""} · Click to mark read · Hover to dismiss
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
