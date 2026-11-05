# Wealthloom — Product Requirements

**Status:** Working prototype; further requirements in progress  
**Scope:** United States, household budgeting and Financial Health  
**Public documentation snapshot:** November 5, 2026

This is a sanitized product document derived from the project requirements and implemented prototype. It excludes the private personal persona and financial records. The five personas below are entirely fictional. Implemented, planned, and unresolved behavior are distinguished explicitly.

## 1. Problem and intended outcome

Household financial information is scattered across accounts, bills, income streams, and goals. Users need an understandable picture of where they stand, what is missing or inconsistent, and which changes could improve their financial position.

Wealthloom should make that picture accessible to people with different financial knowledge and life circumstances. The main dashboard centers on Financial Health; depletion runway is a supporting analysis rather than the headline for every user.

## 2. Principles and boundaries

- No real financial-account connections or transaction execution.
- Spreadsheet-based inputs for the project, with simple dashboard editing. A future product may collect data through intake forms.
- Synthetic personas for demonstrations and evaluations; private data stored separately in any later personal-use environment.
- Explain inputs, calculations, assumptions, source dates, and uncertainty.
- Keep financial calculations deterministic. Future GPT explanations must not invent balances or scores.
- Prefer free storage options and accessible data sources, while checking cost, licensing, and permitted reuse.
- First-release geography is the United States. State-specific rules and tax years need further definition for later tax and healthcare features.

## 3. Fictional target personas

| ID / persona | Context | Financial needs | Demo primary goal |
| --- | --- | --- | --- |
| P02 — Maya Brooks, 23 | Early-career laboratory technician; single; shared rental; student debt and limited savings | Basic budgeting, debt commitments, and a cash cushion | $10,000 emergency fund; $2,500 allocated; $200/month planned; November 2027 target |
| P03 — Daniel Ortiz, 35 | Freelance photographer; spouse works part time; one preschool child; seasonal revenue | Manage variable receipts, business/household costs, and shared bills | $22,000 seasonal buffer; $6,000 allocated; $200/month planned; November 2027 target |
| P04 — Aisha Robinson, 42 | Salaried school administrator; single parent; two children; also supports an elderly parent | Resolve a household cash-flow gap and balance family obligations | $10,000 family emergency fund; $2,000 allocated; $0/month until the shortfall is addressed; November 2028 target |
| P05 — Priya Nair, 50 | Senior software engineer; spouse and teenager; mortgage; employer-stock exposure | Coordinate household finances, education funding, and liquidity | $40,000 education fund; $10,000 allocated; $1,500/month planned; November 2028 target |
| P06 — Robert Chen, 67 | Retired; widowed; pension and portfolio withdrawals; home maintenance | Distinguish withdrawals from earnings and plan irregular expenses | $10,000 repair fund; $7,500 allocated; $250/month planned; February 2027 target |

The data uses a fictional North Carolina setting and an opening analysis date of November 1, 2026. Targets and contribution plans are authored examples, not financial recommendations. Some goals intentionally reveal funding or timing gaps. Persona IDs are stable; the numbering does not imply additional public personas.

## 4. Primary dashboard questions

1. **First-release focus:** How are household cash flow, savings goals, and financial buffers doing, and what should be reviewed next?
2. **Supporting analysis:** How long could available savings cover a cash shortfall, and which spending changes affect that coverage?
3. **Later phases:** Which tax, healthcare, investment, or business opportunities might fit the household, and what evidence supports investigating them?

## 5. First-release requirements and progress

| ID | Requirement | Current state / acceptance evidence |
| --- | --- | --- |
| FR-01 | Switch among fictional households without mixing records | Implemented for five personas. Household IDs scope records and edits. |
| FR-02 | Show a 0–100 Financial Health score with component definitions and weights | Implemented. Components and formula are available in the dashboard explanation. |
| FR-03 | Show accounts by institution, type, owner, balance date, and cash availability | Implemented with real institution names and official site icons; fallback labels when icons fail. |
| FR-04 | Edit income, planned expenses, balances, goals, and buffer targets | Implemented for seeded records. Recalculates affected metrics and saves browser-local edits. |
| FR-05 | Support combined households and individual expense responsibilities | Implemented household totals and responsibility summaries based on stored allocations. |
| FR-06 | Separate historical payments from forecast expenses | Implemented for a small October payment sample. This is not a complete bill-status ledger. |
| FR-07 | Explain a relevant next step | Implemented with deterministic rules for shortfalls, unaffordable contributions, and goal progress. |
| FR-08 | Restore the selected household without resetting others | Implemented browser-local reset. |
| FR-09 | Import and validate project spreadsheets | Planned; not implemented. |
| FR-10 | Persist households and user edits in a database | Planned. MongoDB or another free storage option remains to be selected. |
| FR-11 | Roll cash balances forward and calculate dated runway | Planned. Current runway is a fixed-month sensitivity only. |

No full onboarding UI is required for the initial prototype. Detailed accessibility, browser-support, performance, and usability targets remain to be specified and tested.

## 6. Financial Health scoring v0.1

The overall result is a custom indicator, not a validated financial assessment, credit score, or CFPB questionnaire score. It should not rank users against one another or imply a complete assessment of wealth, debt, insurance, or well-being.

Let `clamp(x)` bound a value to 0–100:

| Component | Weight | Definition |
| --- | --- | --- |
| Goal progress | 30% | `clamp(allocated_goal_savings / positive_goal_target * 100)` |
| Buffer coverage | 30% | `clamp(available_cash / (recurring_monthly_essential_expenses * chosen_buffer_months) * 100)` |
| Cash-flow headroom | 30% | `clamp((monthly_cash_inflows - monthly_cash_expenses) / monthly_cash_inflows / 0.20 * 100)`; known zero inflows with spending scores zero on this component |
| Income diversification | 10% | `min(1, 2 * (1 - sum(source_group_share^2))) * 100`; no external income groups scores zero on this component |

Round the weighted sum once. The 20% reference and weights are demo heuristics. Future evaluation may change them, with versioned definitions.

Rules:

- Group deposits from the same source; multiple payment rows do not create diversification.
- Portfolio withdrawals are cash inflows for spending analysis, but are excluded from external income diversity.
- Employer or client independence can be unknown; multiple groups do not guarantee independent risk.
- One-time costs affect cash flow, but do not inflate recurring buffer expenses across every target month.
- Goal allocations earmark existing cash; they must not create additional assets or allocate the same money twice.
- A protected cash reserve may refer to the same money as an emergency goal; do not add them to cash totals.
- Preserve unknown versus zero. The prototype checks selected missing-input cases; comprehensive ingestion validation is still planned.

Initial display labels are authored heuristics: 80+ strong foundation; 60–79 foundation to build on; 40–59 room to strengthen; below 40 areas to explore. Users can inspect each component rather than relying on the label alone.

## 7. Data model and pipeline

The logical model should remain independent of the eventual database selection.

| Entity | Purpose |
| --- | --- |
| Household and people | Connect primary users, spouses/partners, and dependents without requiring a separate login for each profile |
| Account and balance snapshot | Preserve institution, ownership, dated balance, and cash availability; joint accounts appear once |
| Institution | Canonical name, aliases, website, branding asset, and asset provenance |
| Income stream and source group | Preserve amount, frequency, active dates, certainty, type, and shared source identity |
| Budget expense and allocation | Preserve recurring/one-time spending and responsibility shares |
| Bill occurrence and actual payment | Planned due amounts versus actual payer, amount, and date; fuller occurrence modeling is planned |
| Savings goal and health preferences | Target, allocation, contribution plan, deadline, selected primary goal, and buffer target |
| Dataset/import | Real or synthetic provenance, stable IDs, validation state, source references, and import dates |
| Scenario and derived observation | Inputs, overrides, selected month, calculation version, and component outputs |

Current pipeline: synthetic JSON → calculation module → dashboard → localStorage overrides. Planned pipeline: spreadsheet → validation/staging → database → calculated observations → dashboard.

The starter spreadsheet contract contains Household, People, Balances, Income, Budget, and optional Payments tabs. It is not currently an application upload format. Monthly goal settings were added to the JSON seed separately.

## 8. Privacy and public demonstration

- This repository contains only fictional profiles and authored financial examples.
- Keep personal spreadsheets, private profile exports, credentials, reports, database dumps, and private hosting configuration outside the repository and its history.
- A hidden UI menu item is not data isolation. Private personal records require server-side access controls before hosting them.
- A future public demo must expose synthetic datasets only.
- No banking API credentials, routing numbers, or real account numbers are needed for this project.
- Browser-local persistence is not a multi-user database or private-data security boundary.

## 9. Deferred product areas

| Area | Desired behavior | Dependency / open decision |
| --- | --- | --- |
| Investing corner | Research assets and show potential daily/weekly/monthly contributions tied to household capacity | Risk inputs, allocation rules, market-data access, evaluation, and public display permissions |
| Tax savings | Explain candidate credits/deductions and missing eligibility information | Tax year, state, household facts, and authoritative source validation |
| Healthcare savings | Explore coverage/cost information with applicability assumptions | Geography, eligibility inputs, API access, and coverage limitations |
| Business / side-hustle discovery | Explore opportunities such as laundromats or gas stations | Location, budget, owner involvement, permitted listing source, and underwriting inputs |
| GPT explanations and agents | Explain validated results and research with evidence | Role definition, tool permissions, structured output, cost controls, and evaluation |

Publicly viewable data is not automatically open data or licensed for redistribution. Census data can support local market context but cannot prove a business is for sale. Listing availability requires a permitted source or authorized import.

Candidate resources researched on November 4, 2026; none are integrated: [SEC EDGAR](https://www.sec.gov/search-filings/edgar-application-programming-interfaces), [Alpha Vantage](https://www.alphavantage.co/documentation/), [IRS](https://www.irs.gov/credits-and-deductions-for-individuals), [HealthCare.gov](https://www.healthcare.gov/developers/), [CMS Marketplace API](https://developer.cms.gov/marketplace-api), and [Census APIs](https://www.census.gov/data/developers/data-sets.html). Provider costs, access limits, and reuse permissions require a current check before implementation.

## 10. Verification and known limitations

Automated checks cover five persona scores, household isolation, expense edits, income grouping, withdrawal treatment, dated one-time costs, missing inputs, and component caps. Initial browser checks covered persona selection, persisted edits, reset behavior, goal allocation validation, score explanations, and shared responsibility totals.

Limitations: future months reuse opening cash; recurrence is not prorated; historical payments are only a small sample; arbitrary imports and multi-user data are not supported. The current test suite does not establish production financial-model validity, full accessibility, or coverage of every malformed input.

## 11. Next decisions

1. Choose the first dashboard changes after reviewing the prototype.
2. Define spreadsheet validation and import reconciliation rules.
3. Choose database/storage and private-data access design.
4. Implement rolling forecasts, irregular inflows, and dated goal projections.
5. Evaluate score sensitivity and usefulness across personas before expanding the score.
6. Define the first GPT task and compare it against the deterministic baseline.

## 12. Learning and progress tracking

The project is intended to teach requirements, data contracts, pipelines, storage, analytics, testing, and agent design through an incremental implementation. Record decisions with their reasons, link implementation evidence, and distinguish plans from completed work.

The first hosted prototype was completed November 4, 2026. See [PROGRESS.md](PROGRESS.md) for current implementation status. This public document is a curated snapshot; automatic synchronization from private project notes is not implemented.
