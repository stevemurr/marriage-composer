import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
// FULL STACK MARRIAGE — SYSTEM ARCHITECTURE
// ═══════════════════════════════════════════════════════════════

const DOCUMENT_BUNDLES = [
  {
    id: "prenuptial",
    phase: "pre-ceremony",
    name: "Prenuptial Agreement",
    timing: "Before marriage",
    filed: false,
    filedWith: null,
    description: "The core configuration document. Covers property, finances, support, dissolution terms.",
    stateVariance: "high",
    attorneyRequired: "conditional",
    attorneyNote: "Required in CA for spousal support waivers. Recommended everywhere.",
    documents: [
      "Prenuptial Agreement (master document)",
      "Financial Disclosure Schedule A (Partner 1)",
      "Financial Disclosure Schedule B (Partner 2)",
      "Waiver of Independent Counsel (where applicable)",
      "Acknowledgment of Voluntary Execution",
    ],
    jurisdictionRules: [
      { rule: "signing_window", desc: "Min days between presentation and signing", examples: "CA: 7 days, most states: 'reasonable time'" },
      { rule: "disclosure_requirements", desc: "What financial info must be exchanged", examples: "UPMAA states: 'adequate' disclosure. Some states: full itemized." },
      { rule: "consideration", desc: "Whether consideration beyond marriage is needed", examples: "Most states: marriage itself is sufficient consideration" },
      { rule: "notarization", desc: "Whether notarization is required for validity", examples: "Varies — some states require, some recommend, some don't care" },
      { rule: "witness_requirements", desc: "Number and type of witnesses needed", examples: "0-2 witnesses depending on state" },
    ],
  },
  {
    id: "estate",
    phase: "post-ceremony",
    name: "Estate Architecture",
    timing: "Immediately after marriage",
    filed: true,
    filedWith: "County Recorder / Probate Court",
    description: "Wills, trusts, and beneficiary structures that align with the prenup configuration.",
    stateVariance: "high",
    attorneyRequired: "recommended",
    attorneyNote: "Trusts especially benefit from attorney drafting. Wills may be self-proved in some states.",
    documents: [
      "Last Will and Testament (Partner 1)",
      "Last Will and Testament (Partner 2)",
      "Revocable Living Trust (if applicable)",
      "Pour-Over Will (if trust-based)",
      "Beneficiary Designation Alignment Checklist",
      "Transfer-on-Death Deed (where available)",
    ],
    jurisdictionRules: [
      { rule: "elective_share", desc: "Surviving spouse's right to override will", examples: "Most states: 1/3 elective share. Community property states: different model." },
      { rule: "community_property_at_death", desc: "How community property passes", examples: "CP states: 1/2 belongs to survivor automatically" },
      { rule: "trust_formalities", desc: "Requirements for valid trust creation", examples: "Varies: some states require notarization, some just signatures" },
      { rule: "tod_deed_availability", desc: "Whether transfer-on-death deeds exist", examples: "~29 states allow TOD deeds. Others require probate transfer." },
    ],
  },
  {
    id: "healthcare",
    phase: "post-ceremony",
    name: "Healthcare Directives",
    timing: "Immediately after marriage",
    filed: false,
    filedWith: "Registered with healthcare providers / state registry where available",
    description: "Medical decision-making authority, advance directives, HIPAA authorizations.",
    stateVariance: "medium",
    attorneyRequired: "no",
    attorneyNote: "Most states have standard forms. Can typically be self-executed with witnesses/notary.",
    documents: [
      "Advance Healthcare Directive (Partner 1)",
      "Advance Healthcare Directive (Partner 2)",
      "HIPAA Authorization (Partner 1 → Partner 2)",
      "HIPAA Authorization (Partner 2 → Partner 1)",
      "Mental Health Treatment Declaration (if configured)",
      "Organ Donation Directive",
    ],
    jurisdictionRules: [
      { rule: "directive_format", desc: "Whether state has statutory form", examples: "Most states provide an official form. A few accept any written format." },
      { rule: "witness_requirements", desc: "Who can/cannot witness", examples: "Typically 2 witnesses, not related, not treating physician" },
      { rule: "registry", desc: "Whether state has advance directive registry", examples: "~15 states have registries. Registration is optional but helpful." },
      { rule: "mental_health_carveout", desc: "Whether mental health has separate directive", examples: "Some states have separate psychiatric advance directives" },
    ],
  },
  {
    id: "poa",
    phase: "post-ceremony",
    name: "Powers of Attorney",
    timing: "Immediately after marriage",
    filed: false,
    filedWith: "Financial POA sometimes recorded with county. Springing POAs activated by physician.",
    description: "Financial and legal decision-making authority during incapacity.",
    stateVariance: "medium",
    attorneyRequired: "recommended",
    attorneyNote: "Financial POA carries significant risk. Attorney review strongly recommended.",
    documents: [
      "Durable Financial Power of Attorney (Partner 1)",
      "Durable Financial Power of Attorney (Partner 2)",
      "Limited Power of Attorney — Real Estate (if applicable)",
      "Springing POA Activation Protocol",
    ],
    jurisdictionRules: [
      { rule: "durability_default", desc: "Whether POA survives incapacity by default", examples: "Most states: must explicitly state 'durable'. A few: durable by default." },
      { rule: "springing_poa", desc: "Whether POA can be triggered by future event", examples: "Most states allow springing POA. A few have eliminated them." },
      { rule: "recording_requirements", desc: "Whether financial POA must be recorded", examples: "Real estate POA often must be recorded with county recorder" },
      { rule: "third_party_acceptance", desc: "Whether banks/institutions must honor POA", examples: "UPOAA states: third parties must accept or face liability" },
    ],
  },
  {
    id: "property_titles",
    phase: "post-ceremony",
    name: "Property Titling",
    timing: "After marriage, as assets acquired",
    filed: true,
    filedWith: "County Recorder / DMV / Financial institutions",
    description: "Ensures actual title/ownership aligns with prenup configuration.",
    stateVariance: "medium",
    attorneyRequired: "conditional",
    attorneyNote: "Real estate title changes should involve attorney or title company.",
    documents: [
      "Interspousal Transfer Deed (if retitling real property)",
      "Title Holding Agreement",
      "Community Property Agreement (CP states)",
      "Vehicle Title Transfer",
      "Joint Account Operating Agreement",
      "Business Interest Assignment (if applicable)",
    ],
    jurisdictionRules: [
      { rule: "title_presumptions", desc: "What joint title means for ownership", examples: "CP states: community property presumption. CL states: tenancy by entirety or joint tenants." },
      { rule: "transmutation_rules", desc: "How to change property character", examples: "CA: requires express written declaration. Other states vary." },
      { rule: "homestead_protection", desc: "Whether primary residence has special protection", examples: "Most states: homestead exemption. Amount varies $0 to unlimited." },
      { rule: "transfer_tax", desc: "Whether interspousal transfers incur tax/fees", examples: "Most: exempt from transfer tax. Some counties: still charge recording fees." },
    ],
  },
  {
    id: "postnuptial",
    phase: "ongoing",
    name: "Postnuptial Amendments",
    timing: "During marriage, as circumstances change",
    filed: false,
    filedWith: null,
    description: "Modifications to the original configuration. Triggered by life events or periodic review.",
    stateVariance: "high",
    attorneyRequired: "recommended",
    attorneyNote: "Postnups have higher scrutiny than prenups in many states due to existing fiduciary duties.",
    documents: [
      "Postnuptial Agreement / Amendment",
      "Updated Financial Disclosure",
      "Superseded Provisions Schedule",
      "Ratification of Unchanged Terms",
    ],
    jurisdictionRules: [
      { rule: "enforceability", desc: "Whether state recognizes postnuptial agreements", examples: "Most states: yes, with higher scrutiny. A few: limited recognition." },
      { rule: "consideration_requirement", desc: "Whether additional consideration needed", examples: "Some states require consideration beyond continued marriage" },
      { rule: "fiduciary_standard", desc: "Standard of review between spouses", examples: "Most states: spouses owe fiduciary duties to each other during marriage" },
      { rule: "reconciliation_effect", desc: "Whether reconciliation affects postnup", examples: "Some states: reconciliation can void separation-triggered postnup" },
    ],
  },
  {
    id: "dissolution",
    phase: "termination",
    name: "Dissolution Package",
    timing: "When marriage ends",
    filed: true,
    filedWith: "Superior/Family Court + County Recorder",
    description: "Pre-negotiated dissolution that references the prenup configuration. Aims for uncontested.",
    stateVariance: "very high",
    attorneyRequired: "recommended",
    attorneyNote: "Even with pre-negotiated terms, court filing procedures vary enormously.",
    documents: [
      "Petition for Dissolution",
      "Marital Settlement Agreement (from prenup config)",
      "Property Division Worksheet",
      "Child Custody & Support Order (if applicable, court-determined)",
      "Qualified Domestic Relations Order (QDRO — retirement accounts)",
      "Judgment of Dissolution",
    ],
    jurisdictionRules: [
      { rule: "waiting_period", desc: "Mandatory waiting period after filing", examples: "CA: 6 months. Some states: 30 days. A few: none." },
      { rule: "separation_requirement", desc: "Whether physical separation required", examples: "Some states require 6-12 months separation before filing" },
      { rule: "fault_nofault", desc: "Whether fault grounds available/required", examples: "All states offer no-fault. Some still allow fault-based." },
      { rule: "residency_requirement", desc: "How long you must live in state to file", examples: "Ranges from 6 weeks (NV) to 12 months" },
      { rule: "children_override", desc: "Court's power to override prenup on child matters", examples: "Universal: courts always retain jurisdiction over child welfare" },
    ],
  },
];

const PHASES = [
  { id: "pre-ceremony", label: "Pre-Ceremony", color: "#2d5a27" },
  { id: "post-ceremony", label: "Post-Ceremony", color: "#5a4327" },
  { id: "ongoing", label: "Ongoing", color: "#27445a" },
  { id: "termination", label: "Termination", color: "#5a2727" },
];

// ═══════════════════════════════════════════════════════════════
// JURISDICTION ENGINE SCHEMA
// ═══════════════════════════════════════════════════════════════

const JURISDICTION_SCHEMA = {
  state: {
    fields: [
      { name: "state_code", type: "string", desc: "Two-letter state code", example: "CA" },
      { name: "property_regime", type: "enum", desc: "Community property | Equitable distribution", example: "community_property" },
      { name: "upaa_adopted", type: "boolean", desc: "Adopted Uniform Premarital Agreement Act", example: "true" },
      { name: "upmaa_adopted", type: "boolean", desc: "Adopted revised UPMAA (2012)", example: "false" },
      { name: "upoaa_adopted", type: "boolean", desc: "Adopted Uniform Power of Attorney Act", example: "true" },
      { name: "tod_deed_available", type: "boolean", desc: "Transfer-on-death deeds recognized", example: "true" },
      { name: "postnup_recognized", type: "boolean", desc: "Postnuptial agreements enforceable", example: "true" },
      { name: "fault_divorce_available", type: "boolean", desc: "Fault-based divorce grounds exist", example: "false" },
      { name: "elective_share_pct", type: "number | null", desc: "Surviving spouse elective share percentage", example: "null (CP state)" },
      { name: "homestead_exemption", type: "number | string", desc: "Homestead protection amount", example: "300000 or 'unlimited'" },
    ],
  },
  prenup_rules: {
    fields: [
      { name: "state_code", type: "FK → state", desc: "Foreign key to state", example: "CA" },
      { name: "min_signing_window_days", type: "number | null", desc: "Minimum days between presentation and signing", example: "7" },
      { name: "independent_counsel_required", type: "enum", desc: "always | spousal_support_waiver | recommended | never", example: "spousal_support_waiver" },
      { name: "financial_disclosure_standard", type: "enum", desc: "full_itemized | adequate | fair_and_reasonable", example: "adequate" },
      { name: "notarization_required", type: "boolean", desc: "Must be notarized for validity", example: "false" },
      { name: "witness_count", type: "number", desc: "Required witnesses", example: "0" },
      { name: "unconscionability_timing", type: "enum", desc: "at_execution | at_enforcement | both", example: "both" },
      { name: "spousal_support_waivable", type: "boolean", desc: "Can spousal support be fully waived", example: "true" },
      { name: "sunset_clause_enforceable", type: "boolean", desc: "Whether sunset/expiry clauses are recognized", example: "true" },
      { name: "lifestyle_clauses_enforceable", type: "enum", desc: "yes | limited | no | untested", example: "limited" },
    ],
  },
  filing_procedures: {
    fields: [
      { name: "state_code", type: "FK → state", desc: "Foreign key to state", example: "CA" },
      { name: "county_fips", type: "string", desc: "County FIPS code for filing", example: "06085" },
      { name: "document_type", type: "enum", desc: "Which document bundle this applies to", example: "dissolution" },
      { name: "filing_fee", type: "number", desc: "Current filing fee in dollars", example: "435" },
      { name: "efiling_available", type: "boolean", desc: "Electronic filing supported", example: "true" },
      { name: "efiling_system", type: "string | null", desc: "E-filing platform name", example: "Odyssey File & Serve" },
      { name: "required_forms", type: "string[]", desc: "List of form codes/names", example: '["FL-100", "FL-110", "FL-115"]' },
      { name: "waiting_period_days", type: "number | null", desc: "Mandatory waiting period after filing", example: "180" },
      { name: "residency_requirement_days", type: "number", desc: "Days of residency required before filing", example: "180" },
    ],
  },
  toggle_constraints: {
    fields: [
      { name: "state_code", type: "FK → state", desc: "Foreign key to state", example: "CA" },
      { name: "toggle_id", type: "string", desc: "References a decision toggle from the config UI", example: "support_framework" },
      { name: "constraint_type", type: "enum", desc: "disabled | warning | requires_counsel | max_value | min_value", example: "requires_counsel" },
      { name: "constraint_value", type: "any", desc: "The constraint parameter", example: "true" },
      { name: "constraint_reason", type: "string", desc: "Human-readable explanation", example: "CA requires independent counsel when waiving spousal support" },
      { name: "legal_citation", type: "string", desc: "Statute or case reference", example: "Cal. Fam. Code § 1612(c)" },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// EXAMPLE STATE DATA (CA)
// ═══════════════════════════════════════════════════════════════

const CA_EXAMPLE = {
  state: {
    state_code: "CA", property_regime: "community_property", upaa_adopted: true,
    upmaa_adopted: false, tod_deed_available: true, postnup_recognized: true,
    fault_divorce_available: false, elective_share_pct: null,
    homestead_exemption: "$300K-$600K (varies by county median)",
  },
  prenup_rules: {
    min_signing_window_days: 7,
    independent_counsel_required: "spousal_support_waiver",
    financial_disclosure_standard: "adequate",
    notarization_required: false,
    witness_count: 0,
    unconscionability_timing: "both",
    spousal_support_waivable: true,
    sunset_clause_enforceable: true,
    lifestyle_clauses_enforceable: "untested",
  },
  toggle_constraints: [
    {
      toggle_id: "support_framework",
      option_value: "none",
      constraint_type: "requires_counsel",
      reason: "Waiving spousal support in CA requires each party to have independent legal counsel",
      citation: "Cal. Fam. Code § 1612(c)",
    },
    {
      toggle_id: "custody_default",
      option_value: "*",
      constraint_type: "warning",
      reason: "CA courts retain full authority over custody. Pre-negotiated terms are non-binding but may influence proceedings.",
      citation: "Cal. Fam. Code § 3040",
    },
    {
      toggle_id: "spending_threshold",
      option_value: null,
      constraint_type: "warning",
      reason: "Spending restrictions may be difficult to enforce absent separate property regime",
      citation: "Community property presumption — Cal. Fam. Code § 760",
    },
  ],
  filing_santa_clara: {
    county: "Santa Clara",
    dissolution_filing_fee: 435,
    efiling: true,
    efiling_system: "Odyssey File & Serve",
    required_forms: ["FL-100", "FL-110", "FL-115", "FL-141", "FL-150"],
    waiting_period_days: 180,
    residency_requirement_days: 180,
  },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

const Tab = ({ label, active, onClick, color }) => (
  <button onClick={onClick} style={{
    padding: "8px 16px", fontSize: 12, fontWeight: active ? 700 : 500,
    fontFamily: "'IBM Plex Mono', monospace",
    background: active ? (color || "#1c1c1c") : "transparent",
    color: active ? "#e8e4df" : "#6b6560",
    border: `1px solid ${active ? (color || "#1c1c1c") : "#d4cfc9"}`,
    borderRadius: 4, cursor: "pointer", transition: "all 0.15s",
    letterSpacing: 0.3,
  }}>{label}</button>
);

const Field = ({ f }) => (
  <div style={{
    display: "grid", gridTemplateColumns: "180px 100px 1fr 160px",
    gap: 12, padding: "8px 0", borderBottom: "1px solid #eae6e1",
    fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", alignItems: "start",
  }}>
    <span style={{ fontWeight: 600, color: "#1c1c1c" }}>{f.name}</span>
    <span style={{ color: "#8a7e74", fontSize: 11, background: "#f5f2ee", padding: "2px 6px", borderRadius: 3, textAlign: "center" }}>{f.type}</span>
    <span style={{ color: "#5a534d", fontFamily: "'IBM Plex Sans', sans-serif" }}>{f.desc}</span>
    <span style={{ color: "#8a7e74", fontSize: 11 }}>{f.example}</span>
  </div>
);

export default function SystemArchitecture() {
  const [mainTab, setMainTab] = useState("scope");
  const [expandedBundle, setExpandedBundle] = useState(null);
  const [schemaTab, setSchemaTab] = useState("state");
  const [exampleTab, setExampleTab] = useState("state");

  return (
    <div style={{
      minHeight: "100vh", background: "#f5f2ee", color: "#1c1c1c",
      fontFamily: "'IBM Plex Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: "32px 28px 20px", borderBottom: "2px solid #1c1c1c" }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 3, opacity: 0.4, marginBottom: 6 }}>
            SYSTEM ARCHITECTURE v0.1
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 36, fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
            Full Stack Marriage
          </h1>
          <p style={{ fontSize: 13, opacity: 0.5, margin: "8px 0 0", maxWidth: 520, lineHeight: 1.5 }}>
            Jurisdiction engine, document bundles, data model, and legal pipeline architecture.
          </p>

          {/* Main tabs */}
          <div style={{ display: "flex", gap: 6, marginTop: 20, flexWrap: "wrap" }}>
            {[
              { id: "scope", label: "Product Scope" },
              { id: "schema", label: "Jurisdiction Engine" },
              { id: "example", label: "CA Example Data" },
              { id: "pipeline", label: "Legal Pipeline" },
              { id: "api", label: "API Surface" },
            ].map(t => (
              <Tab key={t.id} label={t.label} active={mainTab === t.id} onClick={() => setMainTab(t.id)} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 28px 80px" }}>

        {/* ─── PRODUCT SCOPE ─── */}
        {mainTab === "scope" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 400, margin: "0 0 8px" }}>
                Document Bundles by Lifecycle Phase
              </h2>
              <p style={{ fontSize: 13, opacity: 0.5, lineHeight: 1.6, margin: 0 }}>
                "Full stack marriage" = 7 document bundles across 4 lifecycle phases. 
                Most services only cover the prenup. The real product moat is being the system of record 
                for all of these, with each bundle's configuration flowing from the same source of truth.
              </p>
            </div>

            {/* Phase legend */}
            <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
              {PHASES.map(p => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: p.color }} />
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", opacity: 0.6 }}>{p.label}</span>
                </div>
              ))}
            </div>

            {/* Bundle cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {DOCUMENT_BUNDLES.map((bundle) => {
                const phase = PHASES.find(p => p.id === bundle.phase);
                const expanded = expandedBundle === bundle.id;
                return (
                  <div key={bundle.id}>
                    <button
                      onClick={() => setExpandedBundle(expanded ? null : bundle.id)}
                      style={{
                        width: "100%", padding: "16px 18px", display: "flex", alignItems: "center",
                        gap: 14, background: "white", cursor: "pointer", textAlign: "left",
                        border: expanded ? `2px solid ${phase.color}` : "1px solid #d4cfc9",
                        borderRadius: expanded ? "6px 6px 0 0" : 6,
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{
                        width: 4, height: 36, borderRadius: 2, background: phase.color, flexShrink: 0,
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{bundle.name}</span>
                          <span style={{
                            fontSize: 9, fontFamily: "'IBM Plex Mono', monospace",
                            background: phase.color + "18", color: phase.color,
                            padding: "2px 6px", borderRadius: 3, fontWeight: 600,
                          }}>{bundle.phase.toUpperCase()}</span>
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.5, marginTop: 3 }}>{bundle.description}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", opacity: 0.4 }}>
                            {bundle.documents.length} docs
                          </div>
                          <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", opacity: 0.4 }}>
                            {bundle.filed ? "📁 Filed" : "📋 Private"}
                          </div>
                        </div>
                        <span style={{ opacity: 0.3, transition: "transform 0.15s", transform: expanded ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
                      </div>
                    </button>

                    {expanded && (
                      <div style={{
                        background: "white", border: `2px solid ${phase.color}`, borderTop: "none",
                        borderRadius: "0 0 6px 6px", padding: "16px 18px",
                      }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                          {/* Left: metadata */}
                          <div>
                            <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1.5, opacity: 0.35, marginBottom: 8, fontWeight: 600 }}>
                              METADATA
                            </div>
                            {[
                              ["Timing", bundle.timing],
                              ["Filed", bundle.filed ? `Yes — ${bundle.filedWith}` : "No (private contract)"],
                              ["State Variance", bundle.stateVariance],
                              ["Attorney Required", bundle.attorneyRequired],
                            ].map(([k, v]) => (
                              <div key={k} style={{ display: "flex", fontSize: 12, padding: "4px 0", borderBottom: "1px solid #f0ece7" }}>
                                <span style={{ width: 120, opacity: 0.4, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>{k}</span>
                                <span>{v}</span>
                              </div>
                            ))}
                            <div style={{ marginTop: 8, fontSize: 11, opacity: 0.6, fontStyle: "italic", lineHeight: 1.5 }}>
                              {bundle.attorneyNote}
                            </div>
                          </div>

                          {/* Right: documents */}
                          <div>
                            <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1.5, opacity: 0.35, marginBottom: 8, fontWeight: 600 }}>
                              GENERATED DOCUMENTS
                            </div>
                            {bundle.documents.map((doc, i) => (
                              <div key={i} style={{ fontSize: 12, padding: "4px 0", borderBottom: "1px solid #f0ece7", display: "flex", gap: 8 }}>
                                <span style={{ opacity: 0.3, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }}>{String(i + 1).padStart(2, "0")}</span>
                                <span>{doc}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Jurisdiction rules */}
                        <div style={{ marginTop: 16 }}>
                          <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1.5, opacity: 0.35, marginBottom: 8, fontWeight: 600 }}>
                            JURISDICTION VARIANCE POINTS
                          </div>
                          {bundle.jurisdictionRules.map((jr, i) => (
                            <div key={i} style={{
                              display: "grid", gridTemplateColumns: "160px 1fr 1fr",
                              gap: 8, padding: "6px 0", borderBottom: "1px solid #f0ece7",
                              fontSize: 12, alignItems: "start",
                            }}>
                              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: phase.color }}>{jr.rule}</span>
                              <span style={{ opacity: 0.7 }}>{jr.desc}</span>
                              <span style={{ opacity: 0.45, fontSize: 11 }}>{jr.examples}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Dependency graph */}
            <div style={{ marginTop: 32, background: "#1c1c1c", borderRadius: 6, padding: "20px 22px", color: "#e8e4df" }}>
              <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 2, opacity: 0.4, marginBottom: 12 }}>
                CONFIGURATION CASCADE — DATA FLOWS BETWEEN BUNDLES
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, lineHeight: 2.2, opacity: 0.85 }}>
                <div><span style={{ color: "#7abd6e" }}>prenup.income_model</span> <span style={{ opacity: 0.3 }}>→</span> <span style={{ color: "#d4a56e" }}>property_titles.title_holding</span></div>
                <div><span style={{ color: "#7abd6e" }}>prenup.ip_ownership</span> <span style={{ opacity: 0.3 }}>→</span> <span style={{ color: "#d4a56e" }}>property_titles.business_assignment</span></div>
                <div><span style={{ color: "#7abd6e" }}>prenup.asset_division</span> <span style={{ opacity: 0.3 }}>→</span> <span style={{ color: "#6ea5d4" }}>estate.will_provisions</span> <span style={{ opacity: 0.3 }}>→</span> <span style={{ color: "#d46e6e" }}>dissolution.settlement_terms</span></div>
                <div><span style={{ color: "#7abd6e" }}>prenup.support_framework</span> <span style={{ opacity: 0.3 }}>→</span> <span style={{ color: "#d46e6e" }}>dissolution.support_order</span></div>
                <div><span style={{ color: "#6ea5d4" }}>healthcare.medical_poa</span> <span style={{ opacity: 0.3 }}>→</span> <span style={{ color: "#c4a5d4" }}>poa.healthcare_agent</span></div>
                <div><span style={{ color: "#6ea5d4" }}>healthcare.life_support</span> <span style={{ opacity: 0.3 }}>→</span> <span style={{ color: "#6ea5d4" }}>estate.will_provisions</span></div>
                <div><span style={{ color: "#d4a56e" }}>property_titles.home_ownership</span> <span style={{ opacity: 0.3 }}>→</span> <span style={{ color: "#d46e6e" }}>dissolution.property_division</span></div>
                <div style={{ marginTop: 8, opacity: 0.4, fontSize: 11 }}>
                  Every toggle in the prenup module has downstream effects on 1-3 other bundles.
                  The system of record ensures consistency across all documents.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── JURISDICTION ENGINE ─── */}
        {mainTab === "schema" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 400, margin: "0 0 8px" }}>
              Jurisdiction Rules Engine — Data Model
            </h2>
            <p style={{ fontSize: 13, opacity: 0.5, lineHeight: 1.6, margin: "0 0 20px" }}>
              Four tables. The state table holds structural properties. The prenup_rules table holds 
              prenup-specific requirements. The filing_procedures table is county-level. The toggle_constraints 
              table maps your UI toggles to jurisdiction-specific limitations.
            </p>

            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {Object.keys(JURISDICTION_SCHEMA).map(k => (
                <Tab key={k} label={k} active={schemaTab === k} onClick={() => setSchemaTab(k)} color="#2d5a27" />
              ))}
            </div>

            <div style={{ background: "white", border: "1px solid #d4cfc9", borderRadius: 6, padding: "16px 18px" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                {schemaTab}
              </div>
              <div style={{ fontSize: 11, opacity: 0.4, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 16 }}>
                {schemaTab === "state" && "One row per state. 50 rows + DC + territories."}
                {schemaTab === "prenup_rules" && "One row per state. Prenup-specific requirements and constraints."}
                {schemaTab === "filing_procedures" && "One row per county × document_type. ~3,100 counties × 7 doc types = ~21,700 rows at full coverage."}
                {schemaTab === "toggle_constraints" && "One row per state × toggle × constraint. This is the bridge between your UI and the law."}
              </div>

              {/* Column headers */}
              <div style={{
                display: "grid", gridTemplateColumns: "180px 100px 1fr 160px",
                gap: 12, padding: "8px 0", borderBottom: "2px solid #1c1c1c",
                fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700,
                letterSpacing: 0.5, opacity: 0.5,
              }}>
                <span>FIELD</span><span>TYPE</span><span>DESCRIPTION</span><span>EXAMPLE</span>
              </div>

              {JURISDICTION_SCHEMA[schemaTab].fields.map((f, i) => <Field key={i} f={f} />)}
            </div>

            {/* The interface concept */}
            <div style={{ marginTop: 20, background: "#1c1c1c", borderRadius: 6, padding: "18px 20px", color: "#e8e4df" }}>
              <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 2, opacity: 0.4, marginBottom: 10 }}>
                THE INTERFACE PATTERN — HOW TOGGLES MAP TO LAW
              </div>
              <pre style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, lineHeight: 1.8, margin: 0, overflow: "auto" }}>
{`// Abstract interface — what the UI talks to
interface JurisdictionAdapter {
  getAvailableToggles(bundleId: string): Toggle[]
  getConstraints(toggleId: string): Constraint[]
  validateConfiguration(config: UserConfig): ValidationResult
  getRequiredDocuments(config: UserConfig): Document[]
  getFilingProcedure(county: string, docType: string): FilingProcedure
}

// State implementation declares deviations from UPMAA baseline
class CaliforniaAdapter implements JurisdictionAdapter {
  // CA-specific: 7-day signing window
  // CA-specific: counsel required for support waivers
  // CA-specific: community property presumption
  // CA-specific: no-fault only
  // Everything else: UPMAA defaults
}

// The validator catches unconscionability before attorneys see it
interface ValidationResult {
  valid: boolean
  warnings: Warning[]        // "This may be unenforceable"
  errors: Error[]            // "This IS unenforceable in your state"  
  counsel_required: boolean  // "Attorney review mandatory for this config"
  estimated_review_hours: number
}`}
              </pre>
            </div>
          </div>
        )}

        {/* ─── CA EXAMPLE ─── */}
        {mainTab === "example" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 400, margin: "0 0 8px" }}>
              California — Example Jurisdiction Data
            </h2>
            <p style={{ fontSize: 13, opacity: 0.5, lineHeight: 1.6, margin: "0 0 20px" }}>
              Here's what the actual data looks like for California, including Santa Clara County filing specifics.
              This is what the jurisdiction engine would query at runtime when a user selects CA.
            </p>

            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {[
                { id: "state", label: "State Properties" },
                { id: "prenup", label: "Prenup Rules" },
                { id: "constraints", label: "Toggle Constraints" },
                { id: "filing", label: "Santa Clara Filing" },
              ].map(t => (
                <Tab key={t.id} label={t.label} active={exampleTab === t.id} onClick={() => setExampleTab(t.id)} color="#5a4327" />
              ))}
            </div>

            <div style={{ background: "white", border: "1px solid #d4cfc9", borderRadius: 6, padding: "16px 18px" }}>
              {exampleTab === "state" && (
                <div>
                  {Object.entries(CA_EXAMPLE.state).map(([k, v]) => (
                    <div key={k} style={{
                      display: "flex", padding: "8px 0", borderBottom: "1px solid #eae6e1",
                      fontSize: 12, fontFamily: "'IBM Plex Mono', monospace",
                    }}>
                      <span style={{ width: 240, fontWeight: 600 }}>{k}</span>
                      <span style={{ color: typeof v === "boolean" ? (v ? "#2d5a27" : "#5a2727") : "#5a534d" }}>
                        {String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {exampleTab === "prenup" && (
                <div>
                  {Object.entries(CA_EXAMPLE.prenup_rules).map(([k, v]) => (
                    <div key={k} style={{
                      display: "flex", padding: "8px 0", borderBottom: "1px solid #eae6e1",
                      fontSize: 12, fontFamily: "'IBM Plex Mono', monospace",
                    }}>
                      <span style={{ width: 280, fontWeight: 600 }}>{k}</span>
                      <span style={{ color: typeof v === "boolean" ? (v ? "#2d5a27" : "#5a2727") : "#5a534d" }}>
                        {String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {exampleTab === "constraints" && (
                <div>
                  <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 12, lineHeight: 1.5 }}>
                    These rows are what the UI reads to decide whether to show warnings, disable options, 
                    or require attorney review when a user selects specific toggle values.
                  </div>
                  {CA_EXAMPLE.toggle_constraints.map((c, i) => (
                    <div key={i} style={{
                      padding: "12px 14px", marginBottom: 8,
                      background: c.constraint_type === "requires_counsel" ? "#5a27270a" : "#5a43270a",
                      border: `1px solid ${c.constraint_type === "requires_counsel" ? "#5a272720" : "#5a432720"}`,
                      borderRadius: 4,
                    }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 700 }}>
                          {c.toggle_id}
                        </span>
                        {c.option_value && (
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, opacity: 0.5 }}>
                            = {c.option_value}
                          </span>
                        )}
                        <span style={{
                          fontSize: 9, padding: "2px 6px", borderRadius: 3, fontWeight: 700,
                          fontFamily: "'IBM Plex Mono', monospace",
                          background: c.constraint_type === "requires_counsel" ? "#5a2727" : "#5a4327",
                          color: "#e8e4df",
                        }}>
                          {c.constraint_type.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.5 }}>{c.reason}</div>
                      <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", opacity: 0.4, marginTop: 4 }}>
                        {c.citation}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {exampleTab === "filing" && (
                <div>
                  <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 12, lineHeight: 1.5 }}>
                    County-level filing data. This is the procedural layer — forms, fees, e-filing systems.
                  </div>
                  {Object.entries(CA_EXAMPLE.filing_santa_clara).map(([k, v]) => (
                    <div key={k} style={{
                      display: "flex", padding: "8px 0", borderBottom: "1px solid #eae6e1",
                      fontSize: 12, fontFamily: "'IBM Plex Mono', monospace",
                    }}>
                      <span style={{ width: 240, fontWeight: 600 }}>{k}</span>
                      <span style={{ color: "#5a534d" }}>
                        {Array.isArray(v) ? v.join(", ") : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── LEGAL PIPELINE ─── */}
        {mainTab === "pipeline" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 400, margin: "0 0 8px" }}>
              Legal Pipeline — From Intent to Filed
            </h2>
            <p style={{ fontSize: 13, opacity: 0.5, lineHeight: 1.6, margin: "0 0 20px" }}>
              The "Stripe for Legal" abstraction. User configures intent → system compiles documents → 
              validates against jurisdiction → routes to attorney → executes → files where required.
            </p>

            {[
              {
                step: "01", name: "CONFIGURE", color: "#2d5a27",
                desc: "User selects toggles across all modules. System applies presets, shows defaults, explains tradeoffs.",
                inputs: "User selections, partner selections, financial disclosures",
                outputs: "MarriageConfig JSON — the canonical representation of intent",
                services: "React UI, config validation, real-time jurisdiction constraint checking",
              },
              {
                step: "02", name: "COMPILE", color: "#27445a",
                desc: "Intent-to-document compiler transforms MarriageConfig into jurisdiction-specific legal documents.",
                inputs: "MarriageConfig + jurisdiction rules + document templates",
                outputs: "Document bundle (prenup + estate + healthcare + POA + titling instructions)",
                services: "Docassemble or custom template engine, jurisdiction adapter layer",
              },
              {
                step: "03", name: "VALIDATE", color: "#5a4327",
                desc: "Compliance engine checks for unconscionability, missing disclosures, state-specific requirements.",
                inputs: "Generated documents + jurisdiction constraints + financial disclosure data",
                outputs: "ValidationResult: errors, warnings, counsel_required flag",
                services: "Rules engine, unconscionability heuristics, disclosure completeness checker",
              },
              {
                step: "04", name: "REVIEW", color: "#5a2753",
                desc: "Routed to attorney pool. Attorney follows checklist protocol. Reviews, suggests edits, signs if required.",
                inputs: "Document bundle + validation report + review checklist",
                outputs: "Reviewed documents + attorney sign-off + any modifications",
                services: "Attorney marketplace, checklist system, document diff/approval workflow",
              },
              {
                step: "05", name: "EXECUTE", color: "#533a27",
                desc: "Both parties sign. Notarized where required. Witnesses added where required.",
                inputs: "Reviewed documents + signing ceremony requirements",
                outputs: "Executed documents with all required formalities",
                services: "DocuSign/HelloSign API, Notarize/Proof API, witness coordination",
              },
              {
                step: "06", name: "FILE / STORE", color: "#5a2727",
                desc: "Documents that require filing are submitted. All documents stored as system of record.",
                inputs: "Executed documents + county filing procedures",
                outputs: "Filing confirmations + permanent encrypted storage + amendment trail",
                services: "County e-filing adapters, secure document vault, change tracking",
              },
            ].map((s) => (
              <div key={s.step} style={{
                display: "grid", gridTemplateColumns: "50px 1fr",
                gap: 14, marginBottom: 12,
              }}>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 700,
                  color: s.color, paddingTop: 14,
                }}>
                  {s.step}
                </div>
                <div style={{
                  background: "white", border: "1px solid #d4cfc9", borderRadius: 6,
                  padding: "14px 16px", borderLeft: `3px solid ${s.color}`,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.6, lineHeight: 1.6, marginBottom: 10 }}>
                    {s.desc}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, fontSize: 11 }}>
                    {[["IN", s.inputs], ["OUT", s.outputs], ["SERVICES", s.services]].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: 1, opacity: 0.35, marginBottom: 3, fontWeight: 700 }}>
                          {label}
                        </div>
                        <div style={{ opacity: 0.6, lineHeight: 1.5 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Lifecycle triggers */}
            <div style={{ marginTop: 24, background: "#1c1c1c", borderRadius: 6, padding: "18px 20px", color: "#e8e4df" }}>
              <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 2, opacity: 0.4, marginBottom: 12 }}>
                LIFECYCLE TRIGGERS — EVENTS THAT RE-ENTER THE PIPELINE
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
                {[
                  { trigger: "Periodic review (5-yr default)", action: "Re-run CONFIGURE → VALIDATE → REVIEW for postnuptial amendment" },
                  { trigger: "Child born / adopted", action: "Regenerate estate + healthcare bundles. Update beneficiaries." },
                  { trigger: "Major asset acquisition", action: "Update property titling bundle. Check prenup alignment." },
                  { trigger: "Relocation to new state", action: "Re-validate ALL bundles against new jurisdiction. May need new execution." },
                  { trigger: "Career change / income shift", action: "Re-run unconscionability check on support + dissolution terms" },
                  { trigger: "Dissolution initiated", action: "Export pre-negotiated settlement. Generate filing package for county." },
                ].map((t, i) => (
                  <div key={i} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.05)", borderRadius: 4 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4, color: "#d4a56e" }}>{t.trigger}</div>
                    <div style={{ opacity: 0.6, fontSize: 11, lineHeight: 1.5 }}>{t.action}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── API SURFACE ─── */}
        {mainTab === "api" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 400, margin: "0 0 8px" }}>
              API Surface — The "Stripe for Legal" Interface
            </h2>
            <p style={{ fontSize: 13, opacity: 0.5, lineHeight: 1.6, margin: "0 0 20px" }}>
              What the developer-facing API looks like. This is how you'd expose the legal pipeline 
              as a composable service — for your own product and eventually for third-party integrators.
            </p>

            <div style={{ background: "#1c1c1c", borderRadius: 6, padding: "20px 22px", color: "#e8e4df" }}>
              <pre style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, lineHeight: 1.9, margin: 0, overflow: "auto" }}>
{`// ═══════════════════════════════════════════
// CORE API — Marriage Configuration
// ═══════════════════════════════════════════

POST   /v1/marriages
       → Create a new marriage configuration
       Body: { state, county?, partners: [Partner, Partner] }
       Returns: { marriage_id, status: "draft" }

GET    /v1/marriages/:id
       → Get current configuration + status

PATCH  /v1/marriages/:id/config
       → Update toggle values
       Body: { module: "finances", decisions: { income_model: "proportional" } }
       Returns: { config, validation: ValidationResult }

GET    /v1/marriages/:id/config/validate
       → Run full validation without saving
       Returns: { valid, errors[], warnings[], counsel_required }

// ═══════════════════════════════════════════
// JURISDICTION ENGINE
// ═══════════════════════════════════════════

GET    /v1/jurisdictions/:state
       → Get state rules + available toggles
       Returns: { state_properties, prenup_rules, supported_toggles }

GET    /v1/jurisdictions/:state/constraints
       → Get all toggle constraints for a state
       Query: ?toggle_id=support_framework
       Returns: { constraints[] }

GET    /v1/jurisdictions/:state/:county/filing
       → Get county filing procedures
       Query: ?document_type=dissolution
       Returns: { forms[], fees, efiling, waiting_period }

// ═══════════════════════════════════════════
// DOCUMENT PIPELINE  
// ═══════════════════════════════════════════

POST   /v1/marriages/:id/compile
       → Generate all document bundles from config
       Returns: { bundles[], status: "compiled" }

GET    /v1/marriages/:id/documents
       → List all generated documents
       Returns: { documents[], bundle_status[] }

GET    /v1/marriages/:id/documents/:doc_id
       → Download specific document (PDF)

POST   /v1/marriages/:id/documents/:doc_id/review
       → Submit document for attorney review
       Returns: { review_id, assigned_attorney?, estimated_completion }

// ═══════════════════════════════════════════
// EXECUTION & FILING
// ═══════════════════════════════════════════

POST   /v1/marriages/:id/execute
       → Initiate signing ceremony
       Body: { method: "docusign" | "hellosign", notarize: true }
       Returns: { signing_url_partner1, signing_url_partner2 }

POST   /v1/marriages/:id/file
       → File documents with relevant authorities
       Body: { bundle_ids: ["dissolution"] }
       Returns: { filing_id, status: "submitted", tracking_url? }

GET    /v1/marriages/:id/file/:filing_id/status
       → Check filing status

// ═══════════════════════════════════════════
// LIFECYCLE EVENTS
// ═══════════════════════════════════════════

POST   /v1/marriages/:id/events
       → Report a lifecycle event that may trigger re-validation
       Body: { event_type: "relocation", data: { new_state: "NY" } }
       Returns: { affected_bundles[], revalidation_required, action_items[] }

GET    /v1/marriages/:id/timeline
       → Get full history of config changes, reviews, filings
       Returns: { events[], current_status }

// ═══════════════════════════════════════════
// WEBHOOKS
// ═══════════════════════════════════════════

// Events emitted:
// marriage.config.updated
// marriage.validation.failed
// marriage.document.compiled
// marriage.review.completed
// marriage.signing.completed
// marriage.filing.submitted
// marriage.filing.accepted
// marriage.lifecycle.event_triggered`}
              </pre>
            </div>

            <div style={{ marginTop: 16, background: "white", border: "1px solid #d4cfc9", borderRadius: 6, padding: "16px 18px" }}>
              <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 2, opacity: 0.35, marginBottom: 10, fontWeight: 600 }}>
                BUILD vs BUY vs PARTNER
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 6, color: "#2d5a27" }}>BUILD (your moat)</div>
                  <div style={{ opacity: 0.6, lineHeight: 1.6 }}>
                    Configuration UI<br />
                    Jurisdiction rules engine<br />
                    Intent-to-document compiler<br />
                    Unconscionability validator<br />
                    Configuration cascade logic<br />
                    Lifecycle event system
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 6, color: "#5a4327" }}>INTEGRATE (APIs exist)</div>
                  <div style={{ opacity: 0.6, lineHeight: 1.6 }}>
                    E-signature (DocuSign)<br />
                    Notarization (Notarize/Proof)<br />
                    Document templates (Docassemble)<br />
                    Identity verification (Persona)<br />
                    Payment (Stripe)<br />
                    Storage/encryption (AWS/Vault)
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 6, color: "#5a2727" }}>PARTNER (human layer)</div>
                  <div style={{ opacity: 0.6, lineHeight: 1.6 }}>
                    Attorney review network<br />
                    County filing (manual initially)<br />
                    Financial advisor referrals<br />
                    Mediator network<br />
                    Tax professional referrals
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
