# Full Stack Marriage — V1 Design Document

**Version:** 0.1.0
**Target:** Claude Code implementation
**Date:** February 2026

---

## 1. Product Vision

Full Stack Marriage treats marriage as a composition of decisions — which it already is, just with bad defaults. Instead of accepting your state's one-size-fits-all legal framework, users consciously configure every dimension of their partnership.

### 1.1 Key Insight: Profile-First Architecture

This is NOT a couples tool. It is a **personal clarity tool** that becomes a couples tool.

**User journey:**
1. An individual downloads the app and configures their **ideal marriage architecture** — how they want finances to work, what they believe about property, how they'd want dissolution to go, their healthcare preferences.
2. This exists as a **PersonalConfig** — a portable declaration of intent. Think of it as "what I want from a partnership."
3. When a relationship gets serious, the user sends a **share link** to their partner.
4. The partner creates their own PersonalConfig (or already has one).
5. The system generates a **Comparison View** — a diff showing agreements, soft conflicts (different preferences, negotiable), and hard conflicts (fundamentally incompatible choices).
6. Both parties negotiate through the interface until they reach a **MerriageConfig** (merged configuration).
7. The merged config enters the **Legal Pipeline** — document generation, validation, attorney review, execution, filing.

This reframes the awkward "we need to talk about prenups" conversation into: "here's my profile, here's yours, look at the diff."

### 1.2 V1 Scope

- **Jurisdiction:** California only
- **Document Bundles:** All 7 (prenup, estate, healthcare, POA, property titling, postnuptial framework, dissolution terms)
- **Users:** Individual config + two-person merge
- **Legal Pipeline:** Document generation + PDF export. Attorney review and e-signature are manual/external for v1.
- **Deployment:** Cloud-ready (Docker containers)

### 1.3 What V1 Does NOT Include

- Multi-state support (architecture should support it, but only CA data is seeded)
- Attorney marketplace / integrated review workflow
- E-signature integration (DocuSign/HelloSign)
- Notarization integration
- County e-filing integration
- Payment / monetization
- Mobile native apps (web-responsive only)

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React SPA (Vite + TypeScript)                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐   │
│  │ Config   │ │ Compare  │ │ Negotiate│ │ Document      │   │
│  │ Editor   │ │ View     │ │ /Merge   │ │ Viewer/Export │   │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API (JSON)
┌─────────────────────┴───────────────────────────────────────┐
│                     BACKEND (Go)                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐   │
│  │ Auth     │ │ Config   │ │ Jurisdic │ │ Document      │   │
│  │ Service  │ │ Service  │ │ Engine   │ │ Compiler      │   │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │ Compare  │ │ Validate │ │ Share    │                     │
│  │ Service  │ │ Service  │ │ Service  │                     │
│  └──────────┘ └──────────┘ └──────────┘                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                   PostgreSQL 16                               │
│  users, personal_configs, marriages, documents,              │
│  jurisdiction_states, jurisdiction_prenup_rules,             │
│  jurisdiction_toggle_constraints, jurisdiction_filing        │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Backend | Go 1.22+ | Performance, strong typing, good for rule engines |
| Database | PostgreSQL 16 | JSONB for flexible config, strong relational for jurisdiction data |
| Frontend | React 18 + TypeScript + Vite | Standard SPA, component model fits module-based UI |
| CSS | Tailwind CSS | Rapid iteration on UI |
| API | REST (JSON) | Simple, well-understood. GraphQL is overkill for v1. |
| Auth | JWT + bcrypt | Simple auth. OAuth/SSO is v2. |
| Document Gen | Go templates → PDF (via wkhtmltopdf or chromedp) | Full control over output. No Docassemble dependency. |
| Containerization | Docker + docker-compose | Local dev and deployment |

### 2.2 Project Structure

```
fullstack-marriage/
├── cmd/
│   └── server/
│       └── main.go                 # Entry point
├── internal/
│   ├── api/
│   │   ├── router.go               # Route registration
│   │   ├── middleware/
│   │   │   ├── auth.go
│   │   │   └── cors.go
│   │   └── handlers/
│   │       ├── auth.go
│   │       ├── config.go           # Personal config CRUD
│   │       ├── marriage.go         # Marriage/merge operations
│   │       ├── compare.go          # Comparison view
│   │       ├── documents.go        # Document generation/export
│   │       ├── jurisdiction.go     # Jurisdiction queries
│   │       └── share.go            # Share link management
│   ├── domain/
│   │   ├── user.go
│   │   ├── config.go               # PersonalConfig + decisions
│   │   ├── marriage.go             # Marriage + merged config
│   │   ├── comparison.go           # Diff/conflict types
│   │   ├── document.go             # Document bundle types
│   │   ├── jurisdiction.go         # Jurisdiction rule types
│   │   └── validation.go           # Validation result types
│   ├── service/
│   │   ├── config_service.go
│   │   ├── compare_service.go      # Diff engine
│   │   ├── marriage_service.go
│   │   ├── jurisdiction_service.go # Rules engine
│   │   ├── validation_service.go   # Unconscionability + compliance
│   │   ├── document_service.go     # Template compilation
│   │   └── share_service.go
│   ├── repository/
│   │   ├── user_repo.go
│   │   ├── config_repo.go
│   │   ├── marriage_repo.go
│   │   ├── document_repo.go
│   │   └── jurisdiction_repo.go
│   ├── jurisdiction/
│   │   ├── engine.go               # Core jurisdiction adapter interface
│   │   ├── california.go           # CA-specific rules
│   │   └── baseline_upmaa.go       # UPMAA baseline defaults
│   ├── compiler/
│   │   ├── compiler.go             # Config → document compiler
│   │   ├── prenup.go               # Prenup document generation
│   │   ├── estate.go               # Estate documents
│   │   ├── healthcare.go           # Healthcare directives
│   │   ├── poa.go                  # Powers of attorney
│   │   ├── property.go             # Property titling
│   │   ├── postnuptial.go          # Postnuptial framework
│   │   └── dissolution.go          # Dissolution package
│   └── templates/
│       ├── prenup/
│       │   ├── master.go.tmpl      # Go html/template files
│       │   ├── financial_schedule.go.tmpl
│       │   └── ...
│       ├── estate/
│       ├── healthcare/
│       └── ...
├── migrations/
│   ├── 001_create_users.sql
│   ├── 002_create_configs.sql
│   ├── 003_create_marriages.sql
│   ├── 004_create_documents.sql
│   ├── 005_create_jurisdiction.sql
│   └── 006_seed_california.sql
├── web/                             # React frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── ConfigEditor.tsx     # Module-based config UI
│   │   │   ├── CompareView.tsx      # Side-by-side diff
│   │   │   ├── NegotiateView.tsx    # Conflict resolution
│   │   │   ├── DocumentsView.tsx    # Generated docs
│   │   │   └── Dashboard.tsx        # Marriage overview
│   │   ├── components/
│   │   │   ├── modules/             # One component per config module
│   │   │   │   ├── FinancesModule.tsx
│   │   │   │   ├── PropertyModule.tsx
│   │   │   │   ├── DecisionsModule.tsx
│   │   │   │   ├── ChildrenModule.tsx
│   │   │   │   ├── HealthcareModule.tsx
│   │   │   │   └── DissolutionModule.tsx
│   │   │   ├── ConfigToggle.tsx     # Generic toggle/select/slider
│   │   │   ├── ConflictCard.tsx     # Shows a diff between two configs
│   │   │   ├── JurisdictionBanner.tsx
│   │   │   └── DocumentCard.tsx
│   │   ├── hooks/
│   │   │   ├── useConfig.ts
│   │   │   ├── useJurisdiction.ts
│   │   │   └── useComparison.ts
│   │   └── api/
│   │       └── client.ts            # API client
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## 3. Data Model

### 3.1 Core Entities

#### users
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### personal_configs
The core entity. One per user. Contains all their marriage preferences as structured JSONB.

```sql
CREATE TABLE personal_configs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    state_code      CHAR(2) NOT NULL DEFAULT 'CA',
    version         INTEGER NOT NULL DEFAULT 1,
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',
        -- draft | complete | shared | merged

    -- The actual configuration — JSONB for flexibility
    -- Structure defined in Section 3.2
    decisions       JSONB NOT NULL DEFAULT '{}',

    -- Metadata
    preset_applied  VARCHAR(50),  -- which preset was used as starting point
    completeness    REAL NOT NULL DEFAULT 0.0,  -- 0.0 to 1.0
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT one_active_config_per_user UNIQUE (user_id)
);

-- We version configs so we can track changes over time
CREATE TABLE personal_config_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id       UUID NOT NULL REFERENCES personal_configs(id),
    version         INTEGER NOT NULL,
    decisions       JSONB NOT NULL,
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    change_summary  TEXT  -- human-readable description of what changed
);
```

#### share_links
How one person shares their config with another.

```sql
CREATE TABLE share_links (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id       UUID NOT NULL REFERENCES personal_configs(id),
    token           VARCHAR(64) UNIQUE NOT NULL,  -- URL-safe random token
    expires_at      TIMESTAMPTZ,
    accepted_by     UUID REFERENCES users(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
        -- active | accepted | expired | revoked
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### marriages
Created when two people decide to merge their configs.

```sql
CREATE TABLE marriages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner1_id     UUID NOT NULL REFERENCES users(id),
    partner2_id     UUID NOT NULL REFERENCES users(id),
    partner1_config UUID NOT NULL REFERENCES personal_configs(id),
    partner2_config UUID NOT NULL REFERENCES personal_configs(id),
    state_code      CHAR(2) NOT NULL,

    -- The merged/negotiated configuration
    merged_config   JSONB,  -- NULL until fully negotiated

    -- Conflict tracking
    conflicts       JSONB NOT NULL DEFAULT '[]',
        -- Array of { decision_id, partner1_value, partner2_value, status, resolved_value }

    status          VARCHAR(20) NOT NULL DEFAULT 'comparing',
        -- comparing | negotiating | agreed | compiling | review | executed
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT different_partners CHECK (partner1_id != partner2_id)
);
```

#### documents
Generated documents for a marriage.

```sql
CREATE TABLE documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marriage_id     UUID NOT NULL REFERENCES marriages(id),
    bundle_type     VARCHAR(30) NOT NULL,
        -- prenuptial | estate | healthcare | poa | property_titles | postnuptial | dissolution
    document_type   VARCHAR(50) NOT NULL,
        -- e.g., 'prenuptial_agreement', 'will_partner1', 'hipaa_auth_partner1'
    title           VARCHAR(200) NOT NULL,
    version         INTEGER NOT NULL DEFAULT 1,
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',
        -- draft | compiled | reviewed | executed | filed
    content_html    TEXT,         -- HTML version for preview
    content_pdf     BYTEA,       -- Generated PDF
    compiled_from   JSONB,       -- Snapshot of the config values used to generate this
    reviewed_by     VARCHAR(200), -- Attorney name (manual for v1)
    reviewed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.2 PersonalConfig Decisions Schema

The `decisions` JSONB column in `personal_configs` has this structure:

```json
{
  "finances": {
    "income_model": "proportional",
    "joint_contribution_pct": 70,
    "spending_threshold": 1000,
    "debt_liability": "hybrid"
  },
  "property": {
    "premarital_assets": "vest_gradual",
    "vesting_years": 10,
    "home_ownership": "joint_equal",
    "ip_ownership": "hybrid"
  },
  "decisions": {
    "relocation": "mutual_required",
    "career_changes": "consult",
    "dispute_resolution": "collaborative"
  },
  "children": {
    "education_approach": "case_by_case",
    "custody_default": "equal_5050",
    "religious_upbringing": "exposure"
  },
  "healthcare": {
    "medical_poa": "spouse_primary",
    "life_support": "discuss_later",
    "mental_health_clause": "encouraged"
  },
  "dissolution": {
    "asset_division": "equal_split",
    "support_framework": "rehabilitative",
    "cooling_period": 3,
    "sunset_clause": "review_periodic"
  }
}
```

### 3.3 Module & Decision Definitions

These are stored as application constants (not in DB — they define the schema of the config UI). They can live in a Go file or a YAML/JSON config file that both backend and frontend read.

```go
// internal/domain/config.go

type DecisionType string
const (
    DecisionTypeSelect DecisionType = "select"
    DecisionTypeSlider DecisionType = "slider"
)

type SelectOption struct {
    Value       string `json:"value"`
    Label       string `json:"label"`
    Description string `json:"description"`
}

type Decision struct {
    ID           string         `json:"id"`
    Label        string         `json:"label"`
    Type         DecisionType   `json:"type"`
    Description  string         `json:"description,omitempty"`
    Default      interface{}    `json:"default"`

    // For select type
    Options      []SelectOption `json:"options,omitempty"`

    // For slider type
    Min          *float64       `json:"min,omitempty"`
    Max          *float64       `json:"max,omitempty"`
    Step         *float64       `json:"step,omitempty"`
    Unit         string         `json:"unit,omitempty"`

    // Conditional visibility
    ShowWhen     *ShowCondition `json:"show_when,omitempty"`
}

type ShowCondition struct {
    Field string `json:"field"`
    Value string `json:"value"`
}

type Module struct {
    ID          string     `json:"id"`
    Title       string     `json:"title"`
    Subtitle    string     `json:"subtitle"`
    Description string     `json:"description"`
    Icon        string     `json:"icon"`
    Defaults    string     `json:"defaults"`  // Legal default explanation
    Decisions   []Decision `json:"decisions"`
}
```

The full module definitions should be extracted from the prototype we built (the MODULES constant in marriage-composer.jsx) and ported to Go structs or a shared JSON file.

### 3.4 Comparison & Conflict Schema

```go
// internal/domain/comparison.go

type ConflictSeverity string
const (
    SeverityAgreement  ConflictSeverity = "agreement"   // Same value chosen
    SeveritySoft       ConflictSeverity = "soft"         // Different but negotiable
    SeverityHard       ConflictSeverity = "hard"         // Fundamentally incompatible
)

type Conflict struct {
    DecisionID    string           `json:"decision_id"`
    ModuleID      string           `json:"module_id"`
    Label         string           `json:"label"`
    Partner1Value interface{}      `json:"partner1_value"`
    Partner2Value interface{}      `json:"partner2_value"`
    Severity      ConflictSeverity `json:"severity"`
    Status        string           `json:"status"`
        // unresolved | partner1_accepted | partner2_accepted | compromised
    ResolvedValue interface{}      `json:"resolved_value,omitempty"`
    ResolvedBy    string           `json:"resolved_by,omitempty"`
    ResolvedAt    *time.Time       `json:"resolved_at,omitempty"`
}

type ComparisonResult struct {
    MarriageID   string     `json:"marriage_id"`
    Agreements   []Conflict `json:"agreements"`    // where they match
    SoftConflicts []Conflict `json:"soft_conflicts"` // different, negotiable
    HardConflicts []Conflict `json:"hard_conflicts"` // fundamentally opposed
    MatchRate    float64    `json:"match_rate"`     // 0.0 to 1.0
}
```

**Conflict severity classification rules:**

- **Agreement:** Both selected the same value.
- **Soft conflict:** Different values selected, but they're on the same "axis" (e.g., one picked `proportional` income at 70%, the other at 50%). These can be resolved by meeting in the middle.
- **Hard conflict:** Values represent fundamentally different philosophies (e.g., one picked `fully_separate` finances, the other picked `full_community`). These require deeper conversation.

The severity classifier should be configurable per decision. Some decisions have natural "distance" between options (slider values), while others have categorical differences (select options). Define a severity matrix for each decision:

```go
// Example: income_model severity matrix
// If partner1=community and partner2=separate → hard
// If partner1=community and partner2=proportional → soft
// If partner1=proportional and partner2=fixed_contribution → soft

type SeverityMatrix map[string]map[string]ConflictSeverity
```

---

## 4. Jurisdiction Engine

### 4.1 Database Schema

```sql
-- State-level legal properties
CREATE TABLE jurisdiction_states (
    state_code              CHAR(2) PRIMARY KEY,
    state_name              VARCHAR(50) NOT NULL,
    property_regime         VARCHAR(30) NOT NULL,
        -- community_property | equitable_distribution
    upaa_adopted            BOOLEAN NOT NULL DEFAULT false,
    upmaa_adopted           BOOLEAN NOT NULL DEFAULT false,
    upoaa_adopted           BOOLEAN NOT NULL DEFAULT false,
    tod_deed_available      BOOLEAN NOT NULL DEFAULT false,
    postnup_recognized      BOOLEAN NOT NULL DEFAULT true,
    fault_divorce_available BOOLEAN NOT NULL DEFAULT false,
    elective_share_pct      REAL,  -- NULL for community property states
    homestead_exemption     VARCHAR(100),
    notes                   TEXT
);

-- Prenup-specific rules per state
CREATE TABLE jurisdiction_prenup_rules (
    state_code                  CHAR(2) PRIMARY KEY REFERENCES jurisdiction_states(state_code),
    min_signing_window_days     INTEGER,  -- NULL = "reasonable time"
    independent_counsel_required VARCHAR(30) NOT NULL DEFAULT 'recommended',
        -- always | spousal_support_waiver | recommended | never
    financial_disclosure_standard VARCHAR(30) NOT NULL DEFAULT 'adequate',
        -- full_itemized | adequate | fair_and_reasonable
    notarization_required       BOOLEAN NOT NULL DEFAULT false,
    witness_count               INTEGER NOT NULL DEFAULT 0,
    unconscionability_timing    VARCHAR(20) NOT NULL DEFAULT 'at_execution',
        -- at_execution | at_enforcement | both
    spousal_support_waivable    BOOLEAN NOT NULL DEFAULT true,
    sunset_clause_enforceable   BOOLEAN NOT NULL DEFAULT true,
    lifestyle_clauses_enforceable VARCHAR(20) NOT NULL DEFAULT 'untested'
        -- yes | limited | no | untested
);

-- Toggle-specific constraints per state
-- This is the bridge between the UI and the law
CREATE TABLE jurisdiction_toggle_constraints (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_code      CHAR(2) NOT NULL REFERENCES jurisdiction_states(state_code),
    toggle_id       VARCHAR(50) NOT NULL,  -- references a decision ID
    option_value    VARCHAR(50),           -- specific option, or NULL for all
    constraint_type VARCHAR(30) NOT NULL,
        -- disabled | warning | requires_counsel | max_value | min_value
    constraint_value VARCHAR(200),
    reason          TEXT NOT NULL,
    legal_citation  VARCHAR(200),

    CONSTRAINT unique_constraint UNIQUE (state_code, toggle_id, option_value, constraint_type)
);

-- County-level filing procedures
-- Only needed for document types that require filing
CREATE TABLE jurisdiction_filing_procedures (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_code      CHAR(2) NOT NULL REFERENCES jurisdiction_states(state_code),
    county_fips     VARCHAR(5) NOT NULL,
    county_name     VARCHAR(100) NOT NULL,
    document_type   VARCHAR(30) NOT NULL,
    filing_fee      DECIMAL(10,2),
    efiling_available BOOLEAN NOT NULL DEFAULT false,
    efiling_system  VARCHAR(100),
    required_forms  JSONB NOT NULL DEFAULT '[]',  -- array of form codes
    waiting_period_days INTEGER,
    residency_requirement_days INTEGER,
    notes           TEXT,

    CONSTRAINT unique_filing UNIQUE (state_code, county_fips, document_type)
);
```

### 4.2 Jurisdiction Engine Interface

```go
// internal/jurisdiction/engine.go

type JurisdictionEngine interface {
    // Get state-level properties
    GetState(stateCode string) (*domain.JurisdictionState, error)

    // Get prenup-specific rules for a state
    GetPrenupRules(stateCode string) (*domain.PrenupRules, error)

    // Get all constraints that apply to a given configuration
    GetConstraints(stateCode string, config domain.Decisions) ([]domain.Constraint, error)

    // Get constraints for a specific toggle
    GetToggleConstraints(stateCode string, toggleID string) ([]domain.ToggleConstraint, error)

    // Get filing procedures for a county + document type
    GetFilingProcedure(stateCode string, countyFIPS string, docType string) (*domain.FilingProcedure, error)

    // Validate an entire configuration against jurisdiction rules
    // Returns errors (unenforceable), warnings (risky), and counsel requirements
    ValidateConfig(stateCode string, config domain.Decisions) (*domain.ValidationResult, error)
}
```

### 4.3 Validation Service

The validation service checks a configuration for legal issues:

```go
// internal/service/validation_service.go

type ValidationResult struct {
    Valid            bool              `json:"valid"`
    Errors           []ValidationIssue `json:"errors"`
    Warnings         []ValidationIssue `json:"warnings"`
    CounselRequired  bool             `json:"counsel_required"`
    CounselReason    string           `json:"counsel_reason,omitempty"`
    EstimatedReviewHours float64      `json:"estimated_review_hours"`
}

type ValidationIssue struct {
    DecisionID    string `json:"decision_id"`
    ModuleID      string `json:"module_id"`
    Severity      string `json:"severity"`  // error | warning | info
    Message       string `json:"message"`
    LegalCitation string `json:"legal_citation,omitempty"`
    Suggestion    string `json:"suggestion,omitempty"`
}
```

**V1 validation rules to implement (CA-specific):**

1. If `support_framework` = "none" → `counsel_required = true` (Cal. Fam. Code § 1612(c))
2. If `custody_default` is set to anything → warning: "CA courts retain full authority over custody decisions. Pre-negotiated terms are advisory only." (Cal. Fam. Code § 3040)
3. If `income_model` = "separate" AND `asset_division` = "equal_split" → warning: inconsistency flag
4. If `support_framework` = "none" AND large income disparity indicated → unconscionability warning
5. If `premarital_assets` = "immediate_community" → info: "This is unusually generous and may be questioned by a reviewing attorney."
6. General: if configuration has 0 modifications from defaults → info: "Your configuration matches CA defaults. A prenup may not add legal value."

### 4.4 California Seed Data

The `006_seed_california.sql` migration should populate:

```sql
INSERT INTO jurisdiction_states VALUES (
    'CA', 'California', 'community_property',
    true,   -- UPAA adopted
    false,  -- UPMAA not adopted
    true,   -- UPOAA adopted
    true,   -- TOD deeds available
    true,   -- postnups recognized
    false,  -- no fault-based divorce
    NULL,   -- no elective share (CP state)
    '$300,000-$600,000 (varies by county median home price)',
    'California adopted the UPAA in 1986. Amended spousal support provisions in 2002.'
);

INSERT INTO jurisdiction_prenup_rules VALUES (
    'CA',
    7,                          -- 7-day signing window
    'spousal_support_waiver',   -- counsel required for support waivers
    'adequate',                 -- disclosure standard
    false,                      -- notarization not required
    0,                          -- no witness requirement
    'both',                     -- unconscionability checked at execution AND enforcement
    true,                       -- spousal support can be waived
    true,                       -- sunset clauses enforceable
    'untested'                  -- lifestyle clauses not well-tested in CA courts
);

-- Toggle constraints for CA
INSERT INTO jurisdiction_toggle_constraints
    (state_code, toggle_id, option_value, constraint_type, reason, legal_citation)
VALUES
    ('CA', 'support_framework', 'none', 'requires_counsel',
     'Waiving spousal support in California requires each party to have independent legal counsel at the time of signing.',
     'Cal. Fam. Code § 1612(c)'),

    ('CA', 'custody_default', NULL, 'warning',
     'California courts retain full jurisdiction over child custody and support. Pre-negotiated custody terms are non-binding but may be considered by the court.',
     'Cal. Fam. Code § 3040'),

    ('CA', 'spending_threshold', NULL, 'warning',
     'Under California community property law, both spouses have equal management and control of community property. Spending restrictions may be difficult to enforce absent a separate property regime.',
     'Cal. Fam. Code § 1100'),

    ('CA', 'lifestyle_clauses', NULL, 'warning',
     'California courts have not extensively tested lifestyle clause enforceability. Weight restrictions and similar personal behavior clauses are likely unenforceable.',
     'No direct statutory authority — based on public policy analysis'),

    ('CA', 'premarital_assets', 'immediate_community', 'warning',
     'Transmuting separate property to community property requires an express written declaration in California. This choice is unusual and may receive additional scrutiny.',
     'Cal. Fam. Code § 852');

-- Santa Clara County filing procedures
INSERT INTO jurisdiction_filing_procedures
    (state_code, county_fips, county_name, document_type, filing_fee,
     efiling_available, efiling_system, required_forms, waiting_period_days,
     residency_requirement_days)
VALUES
    ('CA', '06085', 'Santa Clara', 'dissolution', 435.00,
     true, 'Odyssey File & Serve',
     '["FL-100", "FL-110", "FL-115", "FL-141", "FL-150"]',
     180, 180),

    ('CA', '06085', 'Santa Clara', 'estate', NULL,
     false, NULL, '[]', NULL, NULL);
```

---

## 5. API Design

### 5.1 Authentication

```
POST   /api/v1/auth/register        { email, password, display_name }
POST   /api/v1/auth/login            { email, password } → { token, user }
POST   /api/v1/auth/refresh          { refresh_token } → { token }
GET    /api/v1/auth/me               → { user }
```

### 5.2 Personal Config

```
GET    /api/v1/config                → PersonalConfig (current user's)
PUT    /api/v1/config                → Update decisions
PATCH  /api/v1/config/module/:module → Update single module's decisions
GET    /api/v1/config/history        → Config version history
POST   /api/v1/config/preset/:id     → Apply a preset (traditional | independent | balanced)
```

**Example: Update finances module**
```
PATCH /api/v1/config/module/finances
{
  "income_model": "proportional",
  "joint_contribution_pct": 70
}
→ {
    "config": { ... updated full config ... },
    "validation": {
        "valid": true,
        "warnings": [],
        "errors": [],
        "counsel_required": false
    }
}
```

Every config mutation returns a fresh validation result so the frontend can show constraint violations in real-time.

### 5.3 Sharing

```
POST   /api/v1/share                 → Create share link { token, url, expires_at }
GET    /api/v1/share/:token/preview  → View shared config (no auth required — read-only view)
POST   /api/v1/share/:token/accept   → Accept share and create marriage (requires auth)
DELETE /api/v1/share/:token          → Revoke share link
```

**Share flow:**
1. Partner A calls `POST /api/v1/share` → gets a URL like `https://app.fullstackmarriage.com/s/abc123`
2. Partner B opens the link → sees a read-only preview of Partner A's config
3. If Partner B has an account and their own config, they can call `POST /api/v1/share/:token/accept`
4. This creates a `marriage` record and immediately generates a comparison

### 5.4 Marriage & Comparison

```
GET    /api/v1/marriages             → List user's marriages
GET    /api/v1/marriages/:id         → Get marriage details + comparison
GET    /api/v1/marriages/:id/compare → Get detailed comparison result
POST   /api/v1/marriages/:id/resolve → Resolve a conflict
         { decision_id, resolved_value, resolved_by }
POST   /api/v1/marriages/:id/agree   → Both parties agree — lock merged config
```

### 5.5 Jurisdiction

```
GET    /api/v1/jurisdiction/:state                    → State properties + prenup rules
GET    /api/v1/jurisdiction/:state/constraints         → All toggle constraints
GET    /api/v1/jurisdiction/:state/constraints/:toggle → Constraints for specific toggle
GET    /api/v1/jurisdiction/:state/:county/filing/:doctype → Filing procedures
POST   /api/v1/jurisdiction/:state/validate            → Validate a config against state rules
         Body: { decisions: {...} }
```

### 5.6 Documents

```
POST   /api/v1/marriages/:id/compile              → Generate all document bundles
GET    /api/v1/marriages/:id/documents             → List generated documents
GET    /api/v1/marriages/:id/documents/:doc_id     → Get document metadata
GET    /api/v1/marriages/:id/documents/:doc_id/pdf → Download PDF
GET    /api/v1/marriages/:id/documents/:doc_id/html → Preview HTML
POST   /api/v1/marriages/:id/export                → Export all as ZIP
```

### 5.7 Module Definitions (Frontend Bootstrap)

```
GET    /api/v1/modules               → All module definitions with decisions, options, defaults
GET    /api/v1/modules/:id           → Single module definition
GET    /api/v1/presets               → Available presets with their values
```

This endpoint returns the module/decision schema so the frontend can dynamically render the config UI. The frontend should NOT hardcode module definitions — it reads them from the API so we can add modules or decisions without frontend deploys.

---

## 6. Document Generation (Compiler)

### 6.1 Approach

For v1, document generation uses **Go `html/template` → HTML → PDF conversion**.

The flow:
1. Marriage's merged_config is passed to bundle-specific compiler functions
2. Each compiler produces HTML using Go templates
3. HTML is converted to PDF using `chromedp` (headless Chrome) or `wkhtmltopdf`
4. Both HTML (for preview) and PDF (for download) are stored

### 6.2 Template Structure

Each document bundle has one or more Go template files. Templates receive a `CompilationContext`:

```go
type CompilationContext struct {
    Marriage      domain.Marriage
    Partner1      domain.User
    Partner2      domain.User
    Config        domain.Decisions         // The merged config
    State         domain.JurisdictionState
    PrenupRules   domain.PrenupRules
    Constraints   []domain.ToggleConstraint
    GeneratedAt   time.Time
    DocumentVersion int
}
```

### 6.3 V1 Document Bundles

**Bundle 1: Prenuptial Agreement**
- `prenuptial_agreement.go.tmpl` — Master agreement document
- `financial_disclosure_partner1.go.tmpl` — Schedule A
- `financial_disclosure_partner2.go.tmpl` — Schedule B
- `acknowledgment.go.tmpl` — Voluntary execution acknowledgment

**Bundle 2: Estate Architecture**
- `will_partner1.go.tmpl` — Last Will & Testament
- `will_partner2.go.tmpl`
- `beneficiary_checklist.go.tmpl` — Alignment checklist

**Bundle 3: Healthcare Directives**
- `advance_directive_partner1.go.tmpl`
- `advance_directive_partner2.go.tmpl`
- `hipaa_authorization.go.tmpl` (×2)

**Bundle 4: Powers of Attorney**
- `financial_poa_partner1.go.tmpl`
- `financial_poa_partner2.go.tmpl`

**Bundle 5: Property Titling**
- `title_holding_agreement.go.tmpl`
- `joint_account_agreement.go.tmpl`

**Bundle 6: Postnuptial Framework**
- `postnuptial_review_schedule.go.tmpl` — When and how to revisit terms
- `amendment_template.go.tmpl` — Template for future amendments

**Bundle 7: Dissolution Package**
- `marital_settlement_agreement.go.tmpl` — Pre-negotiated terms
- `property_division_worksheet.go.tmpl`

### 6.4 Legal Disclaimer

Every generated document MUST include:

> **IMPORTANT LEGAL NOTICE:** This document was generated by Full Stack Marriage and is provided for informational and planning purposes. It does not constitute legal advice. This document has not been reviewed by an attorney and may not be enforceable in its current form. Before executing any legal agreement, both parties should retain independent legal counsel licensed in their state of residence. Full Stack Marriage is not a law firm and does not provide legal services.

---

## 7. Frontend Architecture

### 7.1 Page Flow

```
Landing Page
    ↓ Sign up / Log in
Dashboard
    ↓ "Configure Your Preferences"
Config Editor (module-based, tabbed interface)
    ↓ Complete config
Share View (generate link, send to partner)
    ↓ Partner accepts
Compare View (side-by-side diff)
    ↓ Negotiate conflicts
Negotiate View (resolve each conflict)
    ↓ Both agree
Documents View (generated bundle, preview, export)
```

### 7.2 Config Editor

The config editor should reuse the design patterns from the prototype (marriage-composer.jsx):
- Module accordion/tab layout
- Preset buttons (Traditional, Independent, Balanced)
- Per-decision controls (select cards, sliders)
- Real-time "modified from default" tracking
- Jurisdiction warnings inline (from validation API)
- Completeness progress indicator

**Key difference from prototype:** The editor now loads module definitions from the API (`GET /api/v1/modules`), not from hardcoded constants. This makes the frontend module-agnostic.

### 7.3 Compare View

The compare view is the "magic moment" of the product. Design requirements:

- Side-by-side layout: Partner A's config on the left, Partner B's on the right
- Color coding: green (agreement), amber (soft conflict), red (hard conflict)
- Match rate prominently displayed (e.g., "78% aligned")
- Grouped by module
- Each conflict is expandable with "what this means" explanations
- For each conflict, both partners' choices are shown with their descriptions

### 7.4 Negotiate View

For each unresolved conflict:
- Show both options with descriptions
- Allow either partner to:
  - Accept the other's preference
  - Propose a compromise (if slider/continuous value)
  - Flag for discussion (marks as "needs conversation")
- Track who proposed what
- Show a "remaining conflicts" counter
- When all conflicts resolved → enable "Both Agree" button

---

## 8. Configuration Cascade

When documents are generated, the compiler needs to propagate decisions across bundles. The cascade rules are:

```go
// internal/compiler/cascade.go

type CascadeRules struct {
    // Prenup → Estate
    // If asset_division is set, wills should reflect the same split logic
    // If ip_ownership = "creator", will should not bequeath creator's IP to spouse by default

    // Prenup → Property Titling
    // If income_model = "separate", default title holding = separate
    // If income_model = "community", default title holding = joint equal
    // If home_ownership = "proportional_equity", title agreement must specify tracking method

    // Prenup → Dissolution
    // asset_division → maps directly to settlement terms
    // support_framework → maps directly to support order
    // cooling_period → maps to pre-filing waiting period

    // Healthcare → POA
    // medical_poa setting → healthcare agent in POA documents
    // If medical_poa = "shared_panel" → POA needs multiple agents listed

    // Healthcare → Estate
    // life_support preference → referenced in will's end-of-life section
    // organ_donation preference → referenced in will
}
```

Implementation: the compiler service has a `cascade()` function that takes the merged config and produces an "expanded config" where implicit downstream values are made explicit. Document templates receive the expanded config.

---

## 9. Security & Data Handling

### 9.1 V1 Security Requirements

- All passwords hashed with bcrypt (cost factor 12)
- JWT tokens with 24-hour expiry, refresh tokens with 30-day expiry
- HTTPS enforced in production
- Database connection over TLS
- Financial disclosure data (when added in future) must be encrypted at rest
- Share links use cryptographically random tokens (32 bytes, base64url encoded)
- Share link previews show ONLY decision summaries, never personal/financial details

### 9.2 What V1 Does NOT Need

- SOC2 compliance (not handling financial data yet in v1)
- HIPAA compliance (healthcare directives are user-generated, not medical records)
- PCI compliance (no payment processing)
- Encryption at rest for config data (decisions are preferences, not sensitive data)

### 9.3 Authorization Rules

- Users can only read/write their own PersonalConfig
- Share link previews are read-only, available to anyone with the token
- Marriage records are readable/writable only by the two partners
- Document downloads require being a partner in the marriage
- Conflict resolution requires being a partner in the marriage

---

## 10. Development Plan

### Phase 1: Foundation (Week 1-2)
- [ ] Go project scaffold with directory structure
- [ ] Database migrations 001-006
- [ ] User auth (register, login, JWT)
- [ ] PersonalConfig CRUD
- [ ] Module definitions data structure (port from prototype)
- [ ] Basic React app with routing

### Phase 2: Config Editor (Week 2-3)
- [ ] `GET /api/v1/modules` endpoint
- [ ] `GET/PUT/PATCH` config endpoints
- [ ] Presets endpoint
- [ ] Config Editor frontend (module-based UI)
- [ ] Real-time validation on config changes
- [ ] Jurisdiction engine with CA data

### Phase 3: Sharing & Comparison (Week 3-4)
- [ ] Share link creation/acceptance
- [ ] Marriage creation on share acceptance
- [ ] Compare service (diff engine, conflict classification)
- [ ] Compare View frontend
- [ ] Negotiate View frontend
- [ ] Conflict resolution API

### Phase 4: Document Generation (Week 4-6)
- [ ] Document compiler framework
- [ ] HTML templates for all 7 bundles
- [ ] HTML → PDF conversion pipeline
- [ ] Documents API endpoints
- [ ] Documents View frontend (preview + download)
- [ ] Configuration cascade logic
- [ ] Export as ZIP

### Phase 5: Polish & Deploy (Week 6-7)
- [ ] Landing page
- [ ] Error handling + edge cases
- [ ] Responsive design
- [ ] Docker setup
- [ ] Deploy to cloud provider
- [ ] Basic monitoring/logging

---

## 11. Open Questions for Future Versions

1. **Financial disclosure module** — V1 doesn't collect actual financial data (net worth, income, debts). The prenup references that parties "have made full disclosure" but the actual data exchange is out-of-band. V2 should include a structured financial disclosure flow.

2. **Attorney marketplace** — How to match attorneys to reviews. Pricing model (per review? subscription?). Checklist system for standardized review.

3. **Multi-state support** — Architecture supports it (jurisdiction adapter pattern), but each state needs data research + validation rules + template adjustments.

4. **Postnuptial lifecycle** — Triggered re-validation when life events occur. Push notifications. Scheduled review reminders.

5. **Mobile apps** — React Native or native? The config editor is complex enough that mobile-first design might need a different interaction model.

6. **AI assistance** — LLM-powered explanation of what each toggle means in practice. Scenario modeling ("if you divorce after 15 years with these settings, here's approximately what happens"). Personalized recommendations based on financial profiles.

7. **Pricing model** — Freemium (configure free, pay to generate)? Subscription? Per-bundle? Tiered by bundle count?

---

## Appendix A: Presets

### Traditional
Full community property, joint everything, standard defaults.
```json
{
  "finances": { "income_model": "community", "spending_threshold": 500, "debt_liability": "joint" },
  "property": { "premarital_assets": "separate", "home_ownership": "joint_equal", "ip_ownership": "community" },
  "decisions": { "relocation": "mutual_required", "career_changes": "consult", "dispute_resolution": "mediation_first" },
  "children": { "custody_default": "equal_5050" },
  "dissolution": { "asset_division": "equal_split", "support_framework": "lifestyle", "sunset_clause": "none" }
}
```

### Independent Partnership
High autonomy, separate finances, clear boundaries.
```json
{
  "finances": { "income_model": "separate", "spending_threshold": 2000, "debt_liability": "originator" },
  "property": { "premarital_assets": "separate", "home_ownership": "proportional_equity", "ip_ownership": "creator" },
  "decisions": { "relocation": "independent", "career_changes": "inform", "dispute_resolution": "arbitration" },
  "children": { "custody_default": "equal_5050" },
  "dissolution": { "asset_division": "contribution_based", "support_framework": "rehabilitative", "sunset_clause": "review_periodic" }
}
```

### Modern Balanced
Shared foundation with individual flexibility.
```json
{
  "finances": { "income_model": "proportional", "joint_contribution_pct": 70, "spending_threshold": 1000, "debt_liability": "hybrid" },
  "property": { "premarital_assets": "vest_gradual", "vesting_years": 10, "home_ownership": "joint_equal", "ip_ownership": "hybrid" },
  "decisions": { "relocation": "mutual_required", "career_changes": "consult", "dispute_resolution": "collaborative" },
  "children": { "custody_default": "equal_5050" },
  "dissolution": { "asset_division": "equal_split", "support_framework": "duration_scaled", "sunset_clause": "review_periodic" }
}
```

---

## Appendix B: Severity Matrix (Conflict Classification)

For the Compare service to classify conflicts, each select-type decision needs a severity matrix. Example for `income_model`:

```
                community   proportional   fixed_contribution   separate
community           —          soft            soft              hard
proportional       soft         —              soft              soft
fixed_contribution soft        soft              —               soft
separate           hard        soft             soft               —
```

For slider-type decisions, severity is calculated by distance:
- |delta| <= 20% of range → agreement (close enough)
- |delta| <= 50% of range → soft conflict
- |delta| > 50% of range → hard conflict

---

## Appendix C: Environment Variables

```env
# Server
PORT=8080
ENV=development

# Database
DATABASE_URL=postgres://fsm:password@localhost:5432/fullstack_marriage?sslmode=disable

# Auth
JWT_SECRET=<random-64-bytes>
JWT_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=720h

# Document generation
CHROME_PATH=/usr/bin/chromium-browser  # for chromedp PDF generation
PDF_OUTPUT_DIR=/tmp/fsm-docs

# Share links
SHARE_BASE_URL=http://localhost:3000/s
SHARE_TOKEN_BYTES=32
SHARE_DEFAULT_EXPIRY=168h  # 7 days
```
