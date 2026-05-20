import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react";
import type { Claim, ClaimStatus, TimelineEvent } from "@/data/mockData";
import { INITIAL_CLAIMS } from "@/data/mockData";

// ─── Activity Feed ────────────────────────────────────────────────────────────

export interface ActivityEvent {
  id: string;
  claimId: string;
  patient: string;
  fromStatus?: ClaimStatus;
  toStatus: ClaimStatus;
  timestamp: string;
  note: string;
  amount: number;
}

// ─── Aggregated Stats ─────────────────────────────────────────────────────────

export interface ClaimStats {
  total: number;
  draft: number;
  scrubbed: number;
  submitted: number;
  pending: number;
  denied: number;
  corrected: number;
  resubmitted: number;
  approved: number;
  paid: number;
  cleanClaimRate: number;
  revenueAtRisk: number;
  collectedRevenue: number;
  pendingRevenue: number;
  avgDSO: number;
  monthClaims: number;
}

// ─── Context type ─────────────────────────────────────────────────────────────

interface ClaimStoreContextType {
  claims: Claim[];
  activityFeed: ActivityEvent[];
  stats: ClaimStats;
  addClaim: (claim: Claim) => void;
  updateStatus: (id: string, status: ClaimStatus, note?: string, actor?: string) => void;
  getClaimById: (id: string) => Claim | undefined;
}

const ClaimStoreCtx = createContext<ClaimStoreContextType | null>(null);

// ─── Stats computation ────────────────────────────────────────────────────────

function computeStats(claims: Claim[]): ClaimStats {
  const by = (s: ClaimStatus) => claims.filter(c => c.status === s);
  const approvedCount = by("Approved").length + by("Paid").length;
  const deniedCount   = by("Denied").length;
  const month = new Date().toISOString().slice(0, 7);

  return {
    total:         claims.length,
    draft:         by("Draft").length,
    scrubbed:      by("Scrubbed").length,
    submitted:     by("Submitted").length,
    pending:       by("Pending").length,
    denied:        by("Denied").length,
    corrected:     by("Corrected").length,
    resubmitted:   by("Resubmitted").length,
    approved:      by("Approved").length,
    paid:          by("Paid").length,
    cleanClaimRate: (approvedCount + deniedCount) > 0
      ? Math.round((approvedCount / (approvedCount + deniedCount)) * 100)
      : 0,
    revenueAtRisk: claims
      .filter(c => ["Denied", "Corrected"].includes(c.status))
      .reduce((s, c) => s + c.amount, 0),
    collectedRevenue: claims
      .filter(c => ["Approved", "Paid"].includes(c.status))
      .reduce((s, c) => s + c.amount, 0),
    pendingRevenue: claims
      .filter(c => ["Pending", "Submitted", "Resubmitted"].includes(c.status))
      .reduce((s, c) => s + c.amount, 0),
    avgDSO:      34,
    monthClaims: claims.filter(c => (c.submittedAt ?? c.createdAt ?? "").slice(0, 7) === month).length,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ClaimStoreProvider({ children }: { children: ReactNode }) {
  const [claims, setClaims]           = useState<Claim[]>(INITIAL_CLAIMS);
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);

  const stats = useMemo(() => computeStats(claims), [claims]);

  const pushActivity = useCallback((event: ActivityEvent) => {
    setActivityFeed(prev => [event, ...prev].slice(0, 100));
  }, []);

  const addClaim = useCallback((claim: Claim) => {
    setClaims(prev => [claim, ...prev]);
    pushActivity({
      id:        `act-${Date.now()}`,
      claimId:   claim.id,
      patient:   claim.patient,
      toStatus:  claim.status,
      timestamp: new Date().toISOString(),
      note:      `${claim.id} created — ${claim.cpt} / ${claim.icd10} · ${claim.payer}`,
      amount:    claim.amount,
    });
  }, [pushActivity]);

  const updateStatus = useCallback((
    id: string,
    status: ClaimStatus,
    note?: string,
    actor?: string,
  ) => {
    setClaims(prev => prev.map(c => {
      if (c.id !== id) return c;
      const fromStatus = c.status;
      const event: TimelineEvent = {
        id:        `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        status,
        timestamp: new Date().toISOString(),
        note:      note ?? `Status changed to ${status}`,
        actor:     actor ?? "ClaimFlow",
      };
      pushActivity({
        id:         `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        claimId:    id,
        patient:    c.patient,
        fromStatus,
        toStatus:   status,
        timestamp:  new Date().toISOString(),
        note:       note ?? `${c.id} → ${status}`,
        amount:     c.amount,
      });
      return {
        ...c,
        status,
        timeline: [...(c.timeline ?? []), event],
        ...(status === "Submitted" ? { submittedAt: new Date().toISOString() } : {}),
      };
    }));
  }, [pushActivity]);

  const getClaimById = useCallback(
    (id: string) => claims.find(c => c.id === id),
    [claims],
  );

  return (
    <ClaimStoreCtx.Provider value={{ claims, activityFeed, stats, addClaim, updateStatus, getClaimById }}>
      {children}
    </ClaimStoreCtx.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useClaimStore() {
  const ctx = useContext(ClaimStoreCtx);
  if (!ctx) throw new Error("useClaimStore must be used within ClaimStoreProvider");
  return ctx;
}
