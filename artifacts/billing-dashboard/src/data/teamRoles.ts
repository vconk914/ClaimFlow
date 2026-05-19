// ─── Team Role System ─────────────────────────────────────────────────────────

export type RoleId = "admin" | "billing-manager" | "medical-biller" | "front-desk" | "coder" | "provider";

export interface TeamMember {
  id:       string;
  name:     string;
  role:     RoleId;
  initials: string;
  avatar:   string;   // tailwind bg color class
  email:    string;
  since:    string;
  status:   "online" | "away" | "offline";
}

export interface RoleConfig {
  id:            RoleId;
  label:         string;
  description:   string;
  color:         string;  // tailwind text color
  bg:            string;  // tailwind bg color
  badge:         string;  // tailwind bg + text classes
  permissions: {
    canViewAnalytics:       boolean;
    canViewTeam:            boolean;
    canSubmitClaims:        boolean;
    canEditSettings:        boolean;
    canViewFinancials:      boolean;
    canManageUsers:         boolean;
    canViewDenialDetails:   boolean;
    canViewCodingDetails:   boolean;
  };
  dashboardWidgets:  string[];    // which KPI widgets to show
  workflowSuggestions: string[];  // role-specific prompts
}

// ─── Role Configurations ──────────────────────────────────────────────────────

export const ROLE_CONFIGS: Record<RoleId, RoleConfig> = {
  "admin": {
    id:          "admin",
    label:       "Admin",
    description: "Full system access, user management, all analytics",
    color:       "text-violet-700",
    bg:          "bg-violet-50",
    badge:       "bg-violet-100 text-violet-700",
    permissions: {
      canViewAnalytics: true, canViewTeam: true, canSubmitClaims: true,
      canEditSettings: true, canViewFinancials: true, canManageUsers: true,
      canViewDenialDetails: true, canViewCodingDetails: true,
    },
    dashboardWidgets: ["revenue", "claims", "denial-rate", "ar-aging", "team-productivity", "regional"],
    workflowSuggestions: [
      "Review team productivity metrics for the past 30 days",
      "Check AR aging report — accounts > 90 days require immediate attention",
      "Audit denial patterns across all billers this week",
      "Update payer contract rates in Settings before EOY",
    ],
  },

  "billing-manager": {
    id:          "billing-manager",
    label:       "Billing Manager",
    description: "Denial analytics, reimbursement trends, team oversight",
    color:       "text-blue-700",
    bg:          "bg-blue-50",
    badge:       "bg-blue-100 text-blue-700",
    permissions: {
      canViewAnalytics: true, canViewTeam: true, canSubmitClaims: true,
      canEditSettings: false, canViewFinancials: true, canManageUsers: false,
      canViewDenialDetails: true, canViewCodingDetails: true,
    },
    dashboardWidgets: ["revenue", "denial-rate", "ar-aging", "team-productivity", "regional"],
    workflowSuggestions: [
      "UnitedHealthcare denial rate is up 4% this month — review CPT 97110 auth requirements",
      "3 claims have exceeded 90-day AR — initiate secondary billing or write-off review",
      "Team biller productivity is below target — schedule coding accuracy review",
      "Resubmission success rate improved to 68% — best month this quarter",
    ],
  },

  "medical-biller": {
    id:          "medical-biller",
    label:       "Medical Biller",
    description: "Claims submission, denial tracking, personal metrics",
    color:       "text-sky-700",
    bg:          "bg-sky-50",
    badge:       "bg-sky-100 text-sky-700",
    permissions: {
      canViewAnalytics: true, canViewTeam: false, canSubmitClaims: true,
      canEditSettings: false, canViewFinancials: false, canManageUsers: false,
      canViewDenialDetails: true, canViewCodingDetails: true,
    },
    dashboardWidgets: ["claims", "denial-rate", "pending-work"],
    workflowSuggestions: [
      "4 claims in queue require modifier review before submission",
      "Check authorization status for PT claims before billing visit 12",
      "Medicare claims: verify Modifier -25 on all same-day E&M + procedure encounters",
      "2 corrected claims need resubmission — deadline is 5 days out",
    ],
  },

  "front-desk": {
    id:          "front-desk",
    label:       "Front Desk",
    description: "Registration, eligibility verification, scheduling flags",
    color:       "text-teal-700",
    bg:          "bg-teal-50",
    badge:       "bg-teal-100 text-teal-700",
    permissions: {
      canViewAnalytics: false, canViewTeam: false, canSubmitClaims: false,
      canEditSettings: false, canViewFinancials: false, canManageUsers: false,
      canViewDenialDetails: false, canViewCodingDetails: false,
    },
    dashboardWidgets: ["registration", "eligibility", "appointments"],
    workflowSuggestions: [
      "Verify insurance eligibility for today's 11 patients before appointments",
      "3 patients have outdated insurance — confirm coverage before services are rendered",
      "Collect copays at check-in — 2 patients have outstanding balances",
      "MVA patient: collect accident details at registration for no-fault billing",
    ],
  },

  "coder": {
    id:          "coder",
    label:       "Coder",
    description: "CPT/ICD accuracy, compatibility checks, specialty coding",
    color:       "text-indigo-700",
    bg:          "bg-indigo-50",
    badge:       "bg-indigo-100 text-indigo-700",
    permissions: {
      canViewAnalytics: true, canViewTeam: false, canSubmitClaims: false,
      canEditSettings: false, canViewFinancials: false, canManageUsers: false,
      canViewDenialDetails: true, canViewCodingDetails: true,
    },
    dashboardWidgets: ["coding-accuracy", "mismatch-alerts", "denial-rate", "cpt-distribution"],
    workflowSuggestions: [
      "7 orthopedic claims need site-specificity review — bilateral vs. unilateral laterality",
      "Behavioral health queue: verify DSM-5 F-code alignment for all 90837 claims",
      "CPT 99396 × 4: ensure Z00.xx primary diagnosis, not chronic disease code",
      "Modifier -25 missing on 2 same-day E&M + procedure encounters from Dr. Kim",
    ],
  },

  "provider": {
    id:          "provider",
    label:       "Provider",
    description: "Patient claims, documentation alerts, approval queue",
    color:       "text-rose-700",
    bg:          "bg-rose-50",
    badge:       "bg-rose-100 text-rose-700",
    permissions: {
      canViewAnalytics: false, canViewTeam: false, canSubmitClaims: false,
      canEditSettings: false, canViewFinancials: false, canManageUsers: false,
      canViewDenialDetails: false, canViewCodingDetails: false,
    },
    dashboardWidgets: ["my-patients", "documentation-alerts", "pending-approvals"],
    workflowSuggestions: [
      "3 encounter notes flagged for insufficient clinical decision-making documentation",
      "Orthopedic claim for B. Kowalski requires pre-op diagnosis clarification",
      "2 behavioral health notes need a formal DSM-5 diagnosis statement",
      "Medicare Annual Wellness Visit documentation must include preventive screening results",
    ],
  },
};

// ─── Simulated team members ───────────────────────────────────────────────────

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "sj",  name: "Sarah Johnson",   role: "billing-manager", initials: "SJ", avatar: "bg-blue-500",   email: "sjohnson@greenfield.com",  since: "Jan 2022", status: "online"  },
  { id: "mt",  name: "Marcus Torres",   role: "medical-biller",  initials: "MT", avatar: "bg-sky-500",    email: "mtorres@greenfield.com",   since: "Mar 2023", status: "online"  },
  { id: "apm", name: "Anita Patel",     role: "coder",           initials: "AP", avatar: "bg-indigo-500", email: "apatel@greenfield.com",    since: "Jun 2021", status: "away"    },
  { id: "rk",  name: "Dr. Rachel Kim",  role: "provider",        initials: "RK", avatar: "bg-rose-500",   email: "rkim@greenfield.com",      since: "Sep 2019", status: "online"  },
  { id: "jl",  name: "James Larson",    role: "front-desk",      initials: "JL", avatar: "bg-teal-500",   email: "jlarson@greenfield.com",   since: "Nov 2023", status: "offline" },
  { id: "em",  name: "Elena Marchetti", role: "admin",           initials: "EM", avatar: "bg-violet-500", email: "emarchetti@greenfield.com", since: "Jul 2020", status: "online"  },
];

// ─── Activity log ─────────────────────────────────────────────────────────────

export interface ActivityEntry {
  id:       string;
  memberId: string;
  action:   string;
  detail:   string;
  time:     string;
  type:     "submit" | "denial" | "correction" | "approval" | "login" | "setting";
}

export const ACTIVITY_LOG: ActivityEntry[] = [
  { id: "a1",  memberId: "mt",  action: "Submitted claim",     detail: "CPT 99213 · B. Kowalski · Aetna",          time: "2 min ago",  type: "submit"     },
  { id: "a2",  memberId: "apm", action: "Coded encounter",     detail: "CPT 29827 → M75.120 corrected",            time: "8 min ago",  type: "correction" },
  { id: "a3",  memberId: "sj",  action: "Denial reviewed",     detail: "CO-29 · No-Fault · $487 write-off",        time: "14 min ago", type: "denial"     },
  { id: "a4",  memberId: "rk",  action: "Note signed",         detail: "Dorothy Sinclair · E&M 99213",             time: "22 min ago", type: "approval"   },
  { id: "a5",  memberId: "mt",  action: "Resubmitted claim",   detail: "CPT 90837 · F32.1 corrected · Cigna",      time: "31 min ago", type: "correction" },
  { id: "a6",  memberId: "jl",  action: "Verified eligibility","detail": "Susan Whitmore · BlueCross active",       time: "45 min ago", type: "login"      },
  { id: "a7",  memberId: "em",  action: "Settings updated",    detail: "NY region rules updated",                  time: "1 hr ago",   type: "setting"    },
  { id: "a8",  memberId: "apm", action: "Coding flag",         detail: "J06.9 + 90837 mismatch — 3 claims",        time: "1.5 hr ago", type: "denial"     },
  { id: "a9",  memberId: "sj",  action: "Report generated",    detail: "Monthly denial analytics — May 2024",      time: "2 hr ago",   type: "submit"     },
  { id: "a10", memberId: "mt",  action: "Submitted batch",     detail: "14 Medicare claims · Modifier -25 added",  time: "3 hr ago",   type: "submit"     },
];
