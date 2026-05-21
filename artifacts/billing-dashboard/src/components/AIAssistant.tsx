import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, ChevronRight, Bot, Lightbulb, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

// ─── Response library ─────────────────────────────────────────────────────────

interface AIResponse {
  keywords: string[];
  message:  string;
  type:     "info" | "warning" | "success" | "tip";
}

const RESPONSE_LIBRARY: AIResponse[] = [
  {
    keywords: ["cystoscopy", "52000", "52204", "52332", "bladder scope", "cysto"],
    type: "warning",
    message: "Cystoscopy (CPT 52000, 52204, 52332) requires a genitourinary indication as the primary ICD-10 code. The most common indications are R31.0 (Gross Hematuria), N40.1 (BPH with LUTS), N30.10 (Interstitial Cystitis), or N20.1 (Ureteral Calculus). Billing cystoscopy with an unrelated diagnosis (e.g., J06.9 URI, M54.5 back pain) triggers a CO-11 auto-denial. Most commercial payers also require prior authorization for outpatient cystoscopy — verify auth status before the procedure is scheduled.",
  },
  {
    keywords: ["psa", "84153", "84154", "prostate antigen", "prostate cancer screen"],
    type: "warning",
    message: "Medicare covers two distinct PSA benefits — and using the wrong one results in denial. (1) Annual PSA Screening for beneficiaries age 50+: bill HCPCS G0103 with ICD-10 Z12.5 — covered at 100% with $0 patient cost-sharing. (2) Diagnostic PSA ordered due to urological symptoms or abnormal DRE: bill CPT 84153 with a qualifying diagnosis such as N40.1 (BPH with LUTS), R35.0 (Urinary Frequency), or R31.0 (Hematuria) per LCD L36012. Billing CPT 84153 with Z00.00 (Annual Exam) results in a CO-50 denial.",
  },
  {
    keywords: ["hematuria", "blood in urine", "r31", "gross hematuria", "microscopic hematuria"],
    type: "info",
    message: "Hematuria workup billing has two key requirements: (1) Cystoscopy (52000) for lower tract evaluation — use R31.0 (Gross Hematuria) or R31.1 (Microscopic Hematuria) as primary ICD-10. (2) CT Urogram (74177) for upper tract evaluation — most commercial payers including Aetna and UHC require prior authorization for CT urogram in hematuria workup. Always obtain auth before imaging. AUA guidelines recommend concurrent upper and lower tract evaluation for gross hematuria — both procedures may be billed on the same date with separate CPT codes.",
  },
  {
    keywords: ["bph", "prostate", "n40", "lower urinary tract", "luts", "voiding"],
    type: "info",
    message: "BPH (N40.0/N40.1) billing guidance: N40.0 = BPH without LUTS (frequency, nocturia, urgency absent), N40.1 = BPH with LUTS (use when the patient has documented urinary symptoms — more specific and supports higher E&M levels). For TURP (52601): prior authorization is required from most commercial payers, and N40.1 must appear as the primary diagnosis. For same-day office visit + cystoscopy: append Modifier -25 to the E&M code to prevent NCCI bundling.",
  },
  {
    keywords: ["eswl", "lithotripsy", "kidney stone", "50590", "calculus", "renal stone"],
    type: "warning",
    message: "ESWL (CPT 50590) requires: (1) A kidney stone diagnosis — N20.0 (Calculus of Kidney), N20.1 (Calculus of Ureter), or N21.0 (Bladder Stone) as the primary ICD-10. ESWL billed without a stone diagnosis will be auto-denied CO-11. (2) Prior authorization from all major commercial payers and many Medicare Advantage plans — obtain auth 3–5 business days before the procedure. (3) Clinical documentation of stone size (>4mm), laterality, and location (renal pelvis vs. proximal/distal ureter) to support medical necessity. Missing auth results in CO-197 denial with no payment fallback.",
  },
  {
    keywords: ["catheter", "foley", "51701", "51702", "51703", "bladder catheter", "retention"],
    type: "tip",
    message: "Catheter insertion CPT codes (51701–51703) require a diagnosis that directly establishes medical necessity for catheterization. Use R33.9 (Retention of Urine, Unspecified) or R33.8 (Other Retention of Urine) for urinary retention cases. N40.1 (BPH with LUTS causing retention) is also appropriate. Avoid using Z48.89 (Post-Procedure Aftercare) as the sole diagnosis — it does not convey the active pathological indication for catheter placement and will trigger a CO-50 medical necessity denial from Medicare.",
  },
  {
    keywords: ["urodynamics", "51726", "51727", "cystometrogram", "urodynamic", "incontinence", "n39"],
    type: "warning",
    message: "Complex urodynamic testing (CPT 51726, 51727) requires: (1) An incontinence or voiding dysfunction diagnosis — N39.3 (Stress), N39.41 (Urge), N39.46 (Mixed Incontinence), R33.9 (Retention), or N30.10 (Interstitial Cystitis). (2) Prior authorization from BlueCross BlueShield, Aetna, and most commercial payers — typically requires documentation of failed conservative treatment (6+ weeks of pelvic floor PT). (3) Documentation of the specific clinical question the urodynamics will answer per AUA/SUFU guidelines. Auth denial is the #1 reason urodynamic claims are denied in urology practices.",
  },
  {
    keywords: ["prostate biopsy", "55700", "55706", "biopsy", "needle biopsy", "r97"],
    type: "warning",
    message: "Prostate biopsy (CPT 55700, 55706) medical necessity hinges on the ICD-10 code. Use R97.20 (Elevated PSA) when PSA > 4.0 ng/mL drove the biopsy decision — this is the code payers recognize as the primary biopsy indication. D29.1 (Benign Neoplasm of Prostate) alone is insufficient — Cigna and other commercial payers require an elevated-risk indicator like R97.20 or a documented abnormal DRE finding. Attach the PSA lab result to the claim as supporting documentation for any PSA > 4.0 ng/mL case. Cigna Clinical Policy Bulletin and most commercial LCDs require elevated PSA, abnormal DRE, or PI-RADS ≥3 MRI finding for biopsy coverage.",
  },
  {
    keywords: ["modifier", "-25", "25", "same day", "e&m", "office visit and procedure"],
    type: "warning",
    message: "Modifier -25 is required whenever an E&M service (99213, 99214, etc.) is billed on the same day as a urology procedure (cystoscopy, urodynamics, TURP). Without it, NCCI editing rules bundle the E&M into the procedure payment — resulting in CO-97 denial. The encounter note must document a clearly separate E&M component (chief complaint, history, assessment, plan for non-procedural issues) distinct from the procedure pre/post-operative evaluation. UHC, Aetna, and BlueCross all enforce this bundling edit in urology claims.",
  },
  {
    keywords: ["authorization", "auth", "prior auth", "co-197", "co197", "precertification"],
    type: "warning",
    message: "CO-197 (Precertification/Authorization Absent) is the leading denial code in urology practices. Procedures requiring authorization from most commercial payers include: ESWL (50590), cystoscopy with biopsy (52204), urodynamic testing (51726/51727), CT urogram (74177), TURP (52601), and prostate biopsy (55700). Obtain authorization 3–7 business days before any scheduled procedure. If denied CO-197: submit a retroactive authorization request immediately and file a Level 1 appeal within the payer's appeal window (typically 90–180 days).",
  },
  {
    keywords: ["denial", "co-11", "co11", "diagnosis inconsistent", "mismatch"],
    type: "warning",
    message: "CO-11 (Diagnosis Inconsistent with Procedure) is commonly triggered in urology by: (1) Cystoscopy (52000) billed with UTI (N39.0) instead of Hematuria (R31.0) or BPH (N40.1). (2) TURP (52601) billed without a prostate pathology diagnosis. (3) ESWL (50590) billed without a calculus diagnosis (N20.x, N21.0). (4) PSA (84153) billed with a non-urological primary diagnosis. Resolution: identify the anatomically correct ICD-10 for the procedure performed, resubmit as a corrected claim within the payer's timely correction window.",
  },
  {
    keywords: ["medicare", "lcd", "local coverage", "cms", "ncci", "bundling"],
    type: "info",
    message: "Key Medicare coverage policies for urology: (1) LCD L36012 covers diagnostic PSA (84153) for documented prostate symptoms — wellness visit (Z00.00) does not qualify. (2) Annual PSA screening: HCPCS G0103 + Z12.5, covered 100% with $0 patient cost-sharing. (3) NCCI edits bundle E&M into same-day urology procedures without Modifier -25. (4) Medicare Advantage plans often have additional authorization requirements beyond traditional Medicare — verify auth requirements by specific plan ID, not just 'Medicare.'",
  },
  {
    keywords: ["appeal", "dispute", "reconsideration", "level 1", "level 2"],
    type: "tip",
    message: "For urology claim appeals: Medicare Level 1 (Redetermination) must be filed within 120 days of the MAC denial. Commercial payers: typically 90–180 days from denial date. Strongest appeal packages for urology include: (1) AUA clinical guideline citation supporting the procedure, (2) operative report with documented indication, (3) PSA lab result or imaging report confirming the medical necessity threshold, and (4) treating physician medical necessity letter. CO-197 auth appeals should also include a retroactive authorization request filed simultaneously with a different department.",
  },
  {
    keywords: ["icd-10", "icd10", "diagnosis", "dx code", "specificity", "code"],
    type: "tip",
    message: "Urology ICD-10 specificity tips: N40.0 = BPH without LUTS, N40.1 = BPH with LUTS (code N40.1 when symptoms are present — more specific and supports higher E&M levels). For hematuria: R31.0 = Gross Hematuria, R31.1 = Microscopic Hematuria — avoid R31.9 (Unspecified) when clinical documentation supports the specific type. For kidney stones: N20.0 = Renal Calculus, N20.1 = Ureteral Calculus — use the specific code matching the stone location documented in imaging.",
  },
  {
    keywords: ["score", "health score", "risk", "denial risk"],
    type: "info",
    message: "The Claim Health Score (0–100) reflects overall claim payability. Scores above 85 indicate low denial risk. In urology, common score-lowering factors are: (1) Non-urological diagnosis with a urology procedure (CPT/ICD-10 mismatch), (2) Missing Modifier -25 on E&M + same-day procedure, (3) No authorization number on file for auth-required procedures, (4) PSA (84153) billed with wellness or non-prostate diagnosis. Address red flags before submission to maximize first-pass acceptance rate.",
  },
];

const PROACTIVE_TIPS = [
  "Cystoscopy (52000) requires R31.0 (Hematuria) or N40.1 (BPH) as primary ICD-10 — not UTI (N39.0).",
  "Modifier -25 is required when E&M and a urology procedure are billed on the same date of service.",
  "ESWL (50590) requires prior authorization from UHC, Aetna, and most commercial payers.",
  "For Medicare PSA: annual screening = G0103 + Z12.5. Diagnostic PSA = 84153 + symptomatic diagnosis.",
  "Prostate biopsy (55700) requires R97.20 (Elevated PSA) — not D29.1 (Benign Neoplasm) alone.",
  "Urodynamic testing (51726/51727) requires prior auth and documentation of failed pelvic floor PT.",
  "CO-11 cystoscopy denials are preventable: always verify the diagnosis reflects the actual indication.",
  "CO-197 is the #1 urology denial — obtain authorization 3–7 days before any scheduled procedure.",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id:     string;
  role:   "user" | "ai";
  text:   string;
  type?:  "info" | "warning" | "success" | "tip";
  ts:     string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findResponse(input: string): AIResponse {
  const lower = input.toLowerCase();
  const match = RESPONSE_LIBRARY.find(r => r.keywords.some(k => lower.includes(k)));
  return match ?? {
    type: "info",
    keywords: [],
    message: "That's a great billing question. In general, always ensure your CPT and ICD-10 codes are clinically consistent, your modifiers are applied correctly, and your prior authorizations are in place before submission. If you have a specific denial code or payer rule you'd like me to explain, ask about the denial code (e.g., 'CO-11') or the clinical scenario (e.g., 'behavioral health modifier').",
  };
}

function getTypeIcon(type: AIResponse["type"]) {
  switch (type) {
    case "warning": return AlertTriangle;
    case "success": return CheckCircle2;
    case "tip":     return Lightbulb;
    default:        return Info;
  }
}

function getTypeStyle(type: AIResponse["type"]) {
  switch (type) {
    case "warning": return "text-amber-600";
    case "success": return "text-emerald-600";
    case "tip":     return "text-violet-600";
    default:        return "text-blue-600";
  }
}

function nowTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AIAssistant() {
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const inputRef  = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  // Rotate proactive tip every 8s when closed
  useEffect(() => {
    if (open) return;
    const t = setInterval(() => setTipIndex(i => (i + 1) % PROACTIVE_TIPS.length), 8000);
    return () => clearInterval(t);
  }, [open]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || thinking) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: trimmed, ts: nowTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const res = findResponse(trimmed);
      const aiMsg: Message = {
        id:   (Date.now() + 1).toString(),
        role: "ai",
        text: res.message,
        type: res.type,
        ts:   nowTime(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setThinking(false);
    }, 1100);
  }

  function handleQuickAsk(q: string) {
    setInput(q);
    setTimeout(() => handleSend(), 50);
  }

  const QUICK_QUESTIONS = [
    "When is Modifier -25 required for urology?",
    "How do I fix a cystoscopy CO-11 denial?",
    "PSA billing rules for Medicare?",
    "What ICD-10 code does ESWL require?",
  ];

  return (
    <>
      {/* Floating button */}
      <div data-tour="ai-assistant-btn" className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {/* Tip bubble — only when closed */}
        {!open && (
          <div className="max-w-[220px] bg-card border border-border shadow-lg rounded-xl px-3 py-2 text-[11px] text-muted-foreground leading-snug animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="text-violet-600 font-semibold">AI Tip: </span>
            {PROACTIVE_TIPS[tipIndex]}
          </div>
        )}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? "Close AI Assistant" : "Open AI Assistant"}
          title={open ? "Close AI Assistant" : "Open AI Assistant"}
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:scale-105 hover:shadow-violet-300 active:scale-95"
        >
          {open
            ? <X className="w-5 h-5" />
            : <Sparkles className="w-5 h-5" />
          }
        </button>
      </div>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-h-[520px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-3 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">ClaimFlow AI</p>
              <p className="text-[10px] text-white/70">Revenue cycle assistant · All responses simulated</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.length === 0 && (
              <div className="space-y-3">
                {/* Welcome */}
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-violet-600" />
                  </div>
                  <div className="flex-1 bg-muted/40 rounded-xl rounded-tl-sm px-3 py-2.5">
                    <p className="text-xs text-foreground leading-relaxed">
                      Hi! I'm the ClaimFlow AI Assistant. Ask me about denial codes, modifier rules, payer-specific policies, CPT/ICD-10 compatibility, or anything about your revenue cycle.
                    </p>
                  </div>
                </div>

                {/* Quick questions */}
                <div className="space-y-1.5 pl-8">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Try asking:</p>
                  {QUICK_QUESTIONS.map(q => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); setTimeout(handleSend, 50); }}
                      className="w-full text-left text-xs text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 transition-colors flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3 shrink-0" />
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(msg => {
              if (msg.role === "user") {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[80%] bg-primary text-primary-foreground rounded-xl rounded-tr-sm px-3 py-2">
                      <p className="text-xs leading-relaxed">{msg.text}</p>
                      <p className="text-[9px] text-primary-foreground/60 text-right mt-1">{msg.ts}</p>
                    </div>
                  </div>
                );
              }

              const TypeIcon = msg.type ? getTypeIcon(msg.type) : Info;
              const typeColor = msg.type ? getTypeStyle(msg.type) : "text-blue-600";

              return (
                <div key={msg.id} className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                    <TypeIcon className={`w-3 h-3 ${typeColor}`} />
                  </div>
                  <div className="flex-1 bg-muted/40 rounded-xl rounded-tl-sm px-3 py-2.5">
                    <p className="text-xs text-foreground leading-relaxed">{msg.text}</p>
                    <p className="text-[9px] text-muted-foreground mt-1.5">{msg.ts}</p>
                  </div>
                </div>
              );
            })}

            {thinking && (
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3 h-3 text-violet-600" />
                </div>
                <div className="bg-muted/40 rounded-xl rounded-tl-sm px-3 py-2.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips */}
          {messages.length > 0 && (
            <div className="px-3 pb-2 flex gap-1.5 flex-wrap shrink-0">
              {["CO-11 denial", "timely filing", "prior auth"].map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); setTimeout(handleSend, 50); }}
                  className="text-[10px] bg-muted hover:bg-muted/70 text-muted-foreground px-2.5 py-1 rounded-full border border-border transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 shrink-0 border-t border-border pt-2.5">
            <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-xl px-3 py-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Ask about modifiers, denials, payer rules..."
                className="flex-1 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || thinking}
                className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition-all shrink-0"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
