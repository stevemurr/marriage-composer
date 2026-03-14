import { useState, useEffect, useRef } from "react";

const MODULES = [
  {
    id: "finances",
    icon: "◈",
    title: "Financial Architecture",
    subtitle: "How money flows between you",
    description: "Define income ownership, account structure, and spending authority.",
    defaults: "State default: Community property (CA) or equitable distribution. All marital income is jointly owned.",
    decisions: [
      {
        id: "income_model",
        label: "Income Model",
        type: "select",
        options: [
          { value: "community", label: "Full Community", desc: "All income is jointly owned 50/50" },
          { value: "proportional", label: "Proportional Pool", desc: "Each contributes a % of income to joint, keeps remainder" },
          { value: "fixed_contribution", label: "Fixed Contribution", desc: "Each contributes a fixed amount monthly to joint" },
          { value: "separate", label: "Fully Separate", desc: "All income remains individually owned" },
        ],
        default: "community",
      },
      {
        id: "joint_contribution_pct",
        label: "Joint Pool Contribution",
        type: "slider",
        min: 0, max: 100, step: 5, unit: "%",
        showWhen: { field: "income_model", value: "proportional" },
        default: 70,
      },
      {
        id: "spending_threshold",
        label: "Unilateral Spending Limit",
        type: "slider",
        min: 0, max: 10000, step: 250, unit: "$",
        description: "Purchases above this require mutual agreement",
        default: 500,
      },
      {
        id: "debt_liability",
        label: "Debt Responsibility",
        type: "select",
        options: [
          { value: "joint", label: "Joint Liability", desc: "Both responsible for all marital debt" },
          { value: "originator", label: "Originator Bears", desc: "Whoever incurs the debt is primarily responsible" },
          { value: "hybrid", label: "Hybrid", desc: "Joint for agreed-upon debt, originator for unilateral" },
        ],
        default: "joint",
      },
    ],
  },
  {
    id: "property",
    icon: "⬡",
    title: "Property & Assets",
    subtitle: "What belongs to whom, and when",
    description: "Configure ownership rules for existing and future assets.",
    defaults: "State default: Pre-marital assets remain separate. Assets acquired during marriage are community property.",
    decisions: [
      {
        id: "premarital_assets",
        label: "Pre-Marital Assets",
        type: "select",
        options: [
          { value: "separate", label: "Remain Separate", desc: "Pre-marital assets stay with original owner" },
          { value: "vest_gradual", label: "Gradual Vesting", desc: "Pre-marital assets vest into community over time" },
          { value: "immediate_community", label: "Immediate Community", desc: "All assets become community upon marriage" },
        ],
        default: "separate",
      },
      {
        id: "vesting_years",
        label: "Vesting Period",
        type: "slider",
        min: 1, max: 20, step: 1, unit: " years",
        showWhen: { field: "premarital_assets", value: "vest_gradual" },
        default: 10,
      },
      {
        id: "home_ownership",
        label: "Primary Residence",
        type: "select",
        options: [
          { value: "joint_equal", label: "Joint Equal", desc: "50/50 regardless of contribution" },
          { value: "proportional_equity", label: "Proportional Equity", desc: "Ownership reflects financial contribution" },
          { value: "designated_owner", label: "Designated Owner", desc: "One partner holds title" },
        ],
        default: "joint_equal",
      },
      {
        id: "ip_ownership",
        label: "Intellectual Property",
        type: "select",
        options: [
          { value: "creator", label: "Creator Owns", desc: "IP belongs to the creating spouse" },
          { value: "community", label: "Community Asset", desc: "IP created during marriage is jointly owned" },
          { value: "hybrid", label: "Creator + Revenue Share", desc: "Creator owns IP, revenue is community" },
        ],
        default: "community",
      },
    ],
  },
  {
    id: "decisions",
    icon: "◎",
    title: "Decision Framework",
    subtitle: "How you make choices together",
    description: "Establish protocols for major life decisions.",
    defaults: "State default: No formal framework. Disputes resolved through divorce court.",
    decisions: [
      {
        id: "relocation",
        label: "Relocation Decisions",
        type: "select",
        options: [
          { value: "mutual_required", label: "Mutual Consent Required", desc: "Both must agree to relocate" },
          { value: "career_priority", label: "Career-Priority", desc: "Higher-earning career opportunity takes precedence" },
          { value: "alternating", label: "Alternating Priority", desc: "Partners alternate who has priority" },
          { value: "independent", label: "Independent", desc: "Either can relocate; other decides whether to follow" },
        ],
        default: "mutual_required",
      },
      {
        id: "career_changes",
        label: "Major Career Changes",
        type: "select",
        options: [
          { value: "inform", label: "Inform Only", desc: "Notify partner but decide independently" },
          { value: "consult", label: "Consult", desc: "Discuss and consider input, but final call is individual" },
          { value: "mutual", label: "Mutual Agreement", desc: "Both must agree on major career pivots" },
        ],
        default: "consult",
      },
      {
        id: "dispute_resolution",
        label: "Dispute Resolution",
        type: "select",
        options: [
          { value: "mediation_first", label: "Mediation First", desc: "Mandatory mediation before any legal action" },
          { value: "arbitration", label: "Binding Arbitration", desc: "Disputes resolved by agreed-upon arbitrator" },
          { value: "collaborative", label: "Collaborative Law", desc: "Both retain collaborative attorneys" },
          { value: "litigation", label: "Standard Litigation", desc: "Traditional court process" },
        ],
        default: "mediation_first",
      },
    ],
  },
  {
    id: "children",
    icon: "◌",
    title: "Children & Family",
    subtitle: "Parenting philosophy and logistics",
    description: "Align on education, values, and custody frameworks.",
    defaults: "State default: Joint legal custody presumption. Best interest of child standard. No pre-agreed frameworks.",
    decisions: [
      {
        id: "education_approach",
        label: "Education Philosophy",
        type: "select",
        options: [
          { value: "public", label: "Public School Default", desc: "Default to public schooling" },
          { value: "private", label: "Private School Default", desc: "Default to private schooling" },
          { value: "case_by_case", label: "Annual Review", desc: "Evaluate schooling options annually together" },
          { value: "deferred", label: "Deferred", desc: "Decide when applicable" },
        ],
        default: "case_by_case",
      },
      {
        id: "custody_default",
        label: "Default Custody Framework",
        type: "select",
        options: [
          { value: "equal_5050", label: "Equal 50/50", desc: "Default to equal time split" },
          { value: "primary_secondary", label: "Primary/Secondary", desc: "One primary custodian, generous visitation" },
          { value: "bird_nesting", label: "Bird Nesting", desc: "Children stay in home; parents rotate" },
          { value: "best_interest", label: "Court Discretion", desc: "Leave to best-interest analysis" },
        ],
        default: "equal_5050",
      },
      {
        id: "religious_upbringing",
        label: "Religious/Philosophical Framework",
        type: "select",
        options: [
          { value: "secular", label: "Secular", desc: "No religious framework" },
          { value: "exposure", label: "Exposure-Based", desc: "Expose to multiple traditions, child chooses" },
          { value: "designated", label: "Designated Tradition", desc: "Raise in a specific tradition" },
          { value: "deferred", label: "Deferred", desc: "Decide when applicable" },
        ],
        default: "exposure",
      },
    ],
  },
  {
    id: "health",
    icon: "✦",
    title: "Healthcare & End of Life",
    subtitle: "Medical authority and directives",
    description: "Define healthcare decision-making power and end-of-life preferences.",
    defaults: "State default: Spouse is default medical decision-maker. No advance directive unless created separately.",
    decisions: [
      {
        id: "medical_poa",
        label: "Medical Decision Authority",
        type: "select",
        options: [
          { value: "spouse_primary", label: "Spouse Primary", desc: "Spouse is primary medical POA" },
          { value: "spouse_with_backup", label: "Spouse + Backup", desc: "Spouse primary, designated backup" },
          { value: "shared_panel", label: "Shared Panel", desc: "Spouse + family member jointly decide" },
        ],
        default: "spouse_primary",
      },
      {
        id: "life_support",
        label: "Life Support Preference",
        type: "select",
        options: [
          { value: "full_measures", label: "Full Measures", desc: "Continue all life-sustaining treatment" },
          { value: "time_limited", label: "Time-Limited Trial", desc: "Continue for defined period, then reassess" },
          { value: "comfort_only", label: "Comfort Care Only", desc: "No extraordinary measures" },
          { value: "discuss_later", label: "Document Later", desc: "Complete full advance directive separately" },
        ],
        default: "discuss_later",
      },
      {
        id: "mental_health_clause",
        label: "Mental Health Support",
        type: "select",
        options: [
          { value: "encouraged", label: "Mutually Encouraged", desc: "Both commit to seeking help when needed" },
          { value: "required_threshold", label: "Intervention Protocol", desc: "Agreed triggers for seeking professional help" },
          { value: "individual", label: "Individual Discretion", desc: "Each manages their own mental health" },
        ],
        default: "encouraged",
      },
    ],
  },
  {
    id: "dissolution",
    icon: "◇",
    title: "Dissolution Terms",
    subtitle: "If this ends, how does it end",
    description: "Pre-negotiate separation terms while you still like each other.",
    defaults: "State default: Equitable distribution by court. Alimony at judge's discretion. Adversarial process.",
    decisions: [
      {
        id: "asset_division",
        label: "Asset Division Method",
        type: "select",
        options: [
          { value: "equal_split", label: "Equal Split", desc: "50/50 division of marital assets" },
          { value: "contribution_based", label: "Contribution-Based", desc: "Division reflects relative contribution" },
          { value: "needs_based", label: "Needs-Based", desc: "Division considers earning capacity and needs" },
          { value: "formula", label: "Formula", desc: "Pre-agreed mathematical formula" },
        ],
        default: "equal_split",
      },
      {
        id: "support_framework",
        label: "Spousal Support",
        type: "select",
        options: [
          { value: "none", label: "No Support", desc: "Clean break, no ongoing support" },
          { value: "rehabilitative", label: "Rehabilitative", desc: "Time-limited support for career re-entry" },
          { value: "duration_scaled", label: "Duration-Scaled", desc: "Support proportional to marriage length" },
          { value: "lifestyle", label: "Lifestyle Maintenance", desc: "Maintain marital standard of living" },
        ],
        default: "rehabilitative",
      },
      {
        id: "cooling_period",
        label: "Cooling-Off Period",
        type: "slider",
        min: 0, max: 12, step: 1, unit: " months",
        description: "Required waiting period before filing",
        default: 3,
      },
      {
        id: "sunset_clause",
        label: "Prenup Sunset",
        type: "select",
        options: [
          { value: "none", label: "No Sunset", desc: "Terms apply indefinitely" },
          { value: "10_years", label: "10-Year Sunset", desc: "Terms expire after 10 years, renegotiate" },
          { value: "15_years", label: "15-Year Sunset", desc: "Terms expire after 15 years" },
          { value: "review_periodic", label: "Periodic Review", desc: "Mandatory review every 5 years" },
        ],
        default: "review_periodic",
      },
    ],
  },
];

const PRESETS = [
  {
    id: "traditional",
    name: "Traditional",
    desc: "Conventional marriage defaults. Full community property, joint everything.",
    icon: "🏛",
    values: {
      income_model: "community", spending_threshold: 500, debt_liability: "joint",
      premarital_assets: "separate", home_ownership: "joint_equal", ip_ownership: "community",
      relocation: "mutual_required", career_changes: "consult", dispute_resolution: "mediation_first",
      custody_default: "equal_5050", asset_division: "equal_split", support_framework: "lifestyle",
      sunset_clause: "none",
    },
  },
  {
    id: "independent",
    name: "Independent Partnership",
    desc: "High autonomy, separate finances, clear boundaries.",
    icon: "⚡",
    values: {
      income_model: "separate", spending_threshold: 2000, debt_liability: "originator",
      premarital_assets: "separate", home_ownership: "proportional_equity", ip_ownership: "creator",
      relocation: "independent", career_changes: "inform", dispute_resolution: "arbitration",
      custody_default: "equal_5050", asset_division: "contribution_based", support_framework: "rehabilitative",
      sunset_clause: "review_periodic",
    },
  },
  {
    id: "balanced",
    name: "Modern Balanced",
    desc: "Shared foundation with individual flexibility.",
    icon: "⚖",
    values: {
      income_model: "proportional", joint_contribution_pct: 70, spending_threshold: 1000,
      debt_liability: "hybrid", premarital_assets: "vest_gradual", vesting_years: 10,
      home_ownership: "joint_equal", ip_ownership: "hybrid",
      relocation: "mutual_required", career_changes: "consult", dispute_resolution: "collaborative",
      custody_default: "equal_5050", asset_division: "equal_split", support_framework: "duration_scaled",
      sunset_clause: "review_periodic",
    },
  },
];

function SelectField({ decision, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {decision.options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            display: "flex", flexDirection: "column", alignItems: "flex-start",
            padding: "10px 14px", border: value === opt.value ? "1.5px solid #1a1a2e" : "1.5px solid #e0ddd8",
            borderRadius: 8, background: value === opt.value ? "#1a1a2e" : "transparent",
            color: value === opt.value ? "#f5f0eb" : "#1a1a2e", cursor: "pointer",
            transition: "all 0.15s ease", textAlign: "left",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{opt.label}</span>
          <span style={{ fontSize: 11, opacity: 0.7, marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>{opt.desc}</span>
        </button>
      ))}
    </div>
  );
}

function SliderField({ decision, value, onChange }) {
  const pct = ((value - decision.min) / (decision.max - decision.min)) * 100;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Instrument Serif', Georgia, serif", color: "#1a1a2e" }}>
          {decision.unit === "$" ? `$${value.toLocaleString()}` : `${value}${decision.unit}`}
        </span>
      </div>
      {decision.description && (
        <span style={{ fontSize: 11, opacity: 0.5, fontFamily: "'DM Sans', sans-serif" }}>{decision.description}</span>
      )}
      <div style={{ position: "relative", height: 32, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: 0, right: 0, height: 4, background: "#e0ddd8", borderRadius: 2 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "#1a1a2e", borderRadius: 2, transition: "width 0.1s" }} />
        </div>
        <input
          type="range" min={decision.min} max={decision.max} step={decision.step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ position: "absolute", left: 0, right: 0, width: "100%", opacity: 0, cursor: "pointer", height: 32 }}
        />
        <div style={{
          position: "absolute", left: `${pct}%`, transform: "translateX(-50%)",
          width: 18, height: 18, borderRadius: "50%", background: "#1a1a2e", border: "3px solid #f5f0eb",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)", pointerEvents: "none", transition: "left 0.1s",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, opacity: 0.4, fontFamily: "'DM Sans', sans-serif" }}>
        <span>{decision.unit === "$" ? `$${decision.min}` : `${decision.min}${decision.unit}`}</span>
        <span>{decision.unit === "$" ? `$${decision.max.toLocaleString()}` : `${decision.max}${decision.unit}`}</span>
      </div>
    </div>
  );
}

export default function MarriageComposer() {
  const [values, setValues] = useState(() => {
    const initial = {};
    MODULES.forEach((m) => m.decisions.forEach((d) => { initial[d.id] = d.default; }));
    return initial;
  });
  const [activeModule, setActiveModule] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [appliedPreset, setAppliedPreset] = useState(null);
  const [animatingModules, setAnimatingModules] = useState(new Set());
  const detailRef = useRef(null);

  const setValue = (id, val) => {
    setValues((prev) => ({ ...prev, [id]: val }));
    setAppliedPreset(null);
  };

  const applyPreset = (preset) => {
    setValues((prev) => ({ ...prev, ...preset.values }));
    setAppliedPreset(preset.id);
    setActiveModule(null);
  };

  const getModifiedCount = (mod) => {
    return mod.decisions.filter((d) => {
      if (d.showWhen && values[d.showWhen.field] !== d.showWhen.value) return false;
      return values[d.id] !== d.default;
    }).length;
  };

  const totalDecisions = MODULES.reduce((sum, m) => sum + m.decisions.filter(d => !d.showWhen || values[d.showWhen?.field] === d.showWhen?.value).length, 0);
  const totalModified = MODULES.reduce((sum, m) => sum + getModifiedCount(m), 0);

  useEffect(() => {
    if (activeModule && detailRef.current) {
      detailRef.current.scrollTop = 0;
    }
  }, [activeModule]);

  const activeModuleData = MODULES.find((m) => m.id === activeModule);

  return (
    <div style={{
      minHeight: "100vh", background: "#f5f0eb", color: "#1a1a2e",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        padding: "40px 32px 24px", borderBottom: "1px solid #e0ddd8",
        background: "linear-gradient(180deg, #f5f0eb 0%, #f5f0eb 100%)",
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", opacity: 0.4, fontWeight: 600 }}>
              Compose
            </span>
          </div>
          <h1 style={{
            fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 42, fontWeight: 400,
            margin: 0, lineHeight: 1.1, letterSpacing: -0.5,
          }}>
            Marriage Architecture
          </h1>
          <p style={{ fontSize: 14, opacity: 0.5, margin: "10px 0 0", maxWidth: 480, lineHeight: 1.5 }}>
            Marriage is a composition of decisions — most with bad defaults. Configure yours intentionally.
          </p>

          {/* Stats bar */}
          <div style={{ display: "flex", gap: 24, marginTop: 20, fontSize: 12 }}>
            <div>
              <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400 }}>
                {totalModified}
              </span>
              <span style={{ opacity: 0.4, marginLeft: 6 }}>of {totalDecisions} customized</span>
            </div>
            <div style={{ width: 1, background: "#e0ddd8" }} />
            <div>
              <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400 }}>
                {MODULES.length}
              </span>
              <span style={{ opacity: 0.4, marginLeft: 6 }}>modules</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 32px 80px" }}>
        {/* Presets */}
        <div style={{ marginBottom: 32 }}>
          <span style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", opacity: 0.35, fontWeight: 600, display: "block", marginBottom: 12 }}>
            Start from a preset
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p)}
                style={{
                  padding: "16px 14px", border: appliedPreset === p.id ? "1.5px solid #1a1a2e" : "1.5px solid #e0ddd8",
                  borderRadius: 10, background: appliedPreset === p.id ? "#1a1a2e" : "white",
                  color: appliedPreset === p.id ? "#f5f0eb" : "#1a1a2e",
                  cursor: "pointer", textAlign: "left", transition: "all 0.2s ease",
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>{p.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 11, opacity: 0.6, lineHeight: 1.4 }}>{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Module Grid */}
        <span style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", opacity: 0.35, fontWeight: 600, display: "block", marginBottom: 12 }}>
          Modules
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MODULES.map((mod) => {
            const modified = getModifiedCount(mod);
            const isActive = activeModule === mod.id;
            return (
              <div key={mod.id}>
                <button
                  onClick={() => setActiveModule(isActive ? null : mod.id)}
                  style={{
                    width: "100%", padding: "20px 20px", display: "flex", alignItems: "center",
                    gap: 16, border: isActive ? "1.5px solid #1a1a2e" : "1.5px solid #e0ddd8",
                    borderRadius: isActive ? "10px 10px 0 0" : 10,
                    background: "white", cursor: "pointer", transition: "all 0.2s ease",
                    textAlign: "left",
                  }}
                >
                  <span style={{
                    fontSize: 24, width: 44, height: 44, display: "flex", alignItems: "center",
                    justifyContent: "center", background: isActive ? "#1a1a2e" : "#f5f0eb",
                    color: isActive ? "#f5f0eb" : "#1a1a2e",
                    borderRadius: 8, flexShrink: 0, transition: "all 0.2s",
                  }}>
                    {mod.icon}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{mod.title}</div>
                    <div style={{ fontSize: 12, opacity: 0.45, marginTop: 2 }}>{mod.subtitle}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {modified > 0 && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, background: "#1a1a2e", color: "#f5f0eb",
                        padding: "3px 8px", borderRadius: 10,
                      }}>
                        {modified} changed
                      </span>
                    )}
                    <span style={{
                      fontSize: 18, opacity: 0.3, transition: "transform 0.2s",
                      transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
                    }}>
                      ▾
                    </span>
                  </div>
                </button>

                {/* Expanded Panel */}
                {isActive && (
                  <div
                    ref={detailRef}
                    style={{
                      background: "white", borderRadius: "0 0 10px 10px",
                      border: "1.5px solid #1a1a2e", borderTop: "none",
                      padding: "20px 20px 24px",
                    }}
                  >
                    {/* Default callout */}
                    <div style={{
                      background: "#faf6f1", borderRadius: 8, padding: "12px 14px",
                      marginBottom: 20, border: "1px solid #e8e3dc",
                    }}>
                      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.4, fontWeight: 600, marginBottom: 4 }}>
                        Current legal default
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.6, lineHeight: 1.5 }}>
                        {mod.defaults}
                      </div>
                    </div>

                    {/* Decisions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                      {mod.decisions.map((decision) => {
                        if (decision.showWhen && values[decision.showWhen.field] !== decision.showWhen.value) {
                          return null;
                        }
                        const isModified = values[decision.id] !== decision.default;
                        return (
                          <div key={decision.id}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                              <span style={{ fontSize: 13, fontWeight: 600 }}>{decision.label}</span>
                              {isModified && (
                                <span style={{ fontSize: 9, background: "#e8e3dc", padding: "2px 6px", borderRadius: 4, fontWeight: 600, opacity: 0.6 }}>
                                  MODIFIED
                                </span>
                              )}
                              {isModified && (
                                <button
                                  onClick={() => setValue(decision.id, decision.default)}
                                  style={{
                                    fontSize: 10, background: "none", border: "none", color: "#1a1a2e",
                                    opacity: 0.4, cursor: "pointer", textDecoration: "underline",
                                  }}
                                >
                                  reset
                                </button>
                              )}
                            </div>
                            {decision.type === "select" && (
                              <SelectField decision={decision} value={values[decision.id]} onChange={(v) => setValue(decision.id, v)} />
                            )}
                            {decision.type === "slider" && (
                              <SliderField decision={decision} value={values[decision.id]} onChange={(v) => setValue(decision.id, v)} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Export Section */}
        <div style={{ marginTop: 40 }}>
          <button
            onClick={() => setShowExport(!showExport)}
            style={{
              width: "100%", padding: "18px 20px", background: "#1a1a2e", color: "#f5f0eb",
              border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif", transition: "opacity 0.2s",
            }}
          >
            {showExport ? "Hide Configuration Summary" : "Generate Configuration Summary →"}
          </button>

          {showExport && (
            <div style={{
              marginTop: 12, background: "white", border: "1.5px solid #e0ddd8",
              borderRadius: 10, padding: "24px 20px", fontSize: 12, lineHeight: 1.8,
            }}>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, marginBottom: 16 }}>
                Marriage Configuration Summary
              </div>
              {MODULES.map((mod) => (
                <div key={mod.id} style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, paddingBottom: 4, borderBottom: "1px solid #e8e3dc" }}>
                    {mod.icon} {mod.title}
                  </div>
                  {mod.decisions.map((d) => {
                    if (d.showWhen && values[d.showWhen.field] !== d.showWhen.value) return null;
                    const val = values[d.id];
                    let display;
                    if (d.type === "select") {
                      const opt = d.options.find((o) => o.value === val);
                      display = opt ? `${opt.label} — ${opt.desc}` : val;
                    } else {
                      display = d.unit === "$" ? `$${val.toLocaleString()}` : `${val}${d.unit}`;
                    }
                    const isModified = val !== d.default;
                    return (
                      <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                        <span style={{ opacity: 0.6 }}>{d.label}</span>
                        <span style={{ fontWeight: isModified ? 600 : 400, textAlign: "right", maxWidth: "55%" }}>
                          {isModified && <span style={{ color: "#b8860b", marginRight: 4 }}>●</span>}
                          {display}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div style={{
                marginTop: 16, padding: "12px 14px", background: "#faf6f1", borderRadius: 8,
                border: "1px solid #e8e3dc", fontSize: 11, opacity: 0.6, lineHeight: 1.6,
              }}>
                <strong>Legal Notice:</strong> This configuration summary is for planning purposes only and does not
                constitute a legally binding document. Implementation requires jurisdiction-specific legal review,
                proper execution formalities, and in most states, independent legal counsel for each party.
                <span style={{ color: "#b8860b", fontWeight: 600 }}> ● Modified from default</span>
              </div>

              {/* Legal Stack */}
              <div style={{ marginTop: 16, padding: "14px", background: "#1a1a2e", borderRadius: 8, color: "#f5f0eb" }}>
                <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", opacity: 0.4, marginBottom: 8 }}>
                  Next Steps — Legal Pipeline
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { step: "1", label: "Jurisdiction Analysis", desc: "Validate configurability per your state", status: "pending" },
                    { step: "2", label: "Document Assembly", desc: "Generate prenuptial + ancillary agreements", status: "pending" },
                    { step: "3", label: "Independent Review", desc: "Each party reviews with separate counsel", status: "required" },
                    { step: "4", label: "Execution", desc: "Sign, notarize, and record", status: "pending" },
                  ].map((s) => (
                    <div key={s.step} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 11, fontWeight: 700,
                        background: s.status === "required" ? "#b8860b" : "rgba(255,255,255,0.1)",
                      }}>
                        {s.step}
                      </span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{s.label}</div>
                        <div style={{ fontSize: 10, opacity: 0.5 }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
