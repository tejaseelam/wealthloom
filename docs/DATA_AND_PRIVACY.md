# Data and privacy

`dist/demo-data.json` contains five authored fictional households, not anonymized real customers. Names, ages, relationships, balances, income, expenses, goals, and contribution plans are synthetic. Real institution names and websites provide visual context only.

The fixture uses opening November 1, 2026 balances and selected forecast months through April 2027. Seasonal income has a finite authored horizon; missing future rows must not be interpreted as proof that income stops forever.

The repository excludes real personal profiles, completed private input workbooks, private project-note exports, account-specific hosting metadata, database dumps, credentials, and local build/research artifacts. No private project history is imported into the public-facing repository.

## Records

- `household`, `people`: household relationships and display context.
- `balances`: account snapshot, institution, owners, and cash-availability flag.
- `income`: dated income streams, recurrence, source group, and income kind.
- `budget`: expected spending with essential/flexible classification and payer shares.
- `payments`: small historical sample, distinct from the forecast budget.
- `savings_goals`, `health_preferences`: goals, allocations, contributions, and scoring targets.
- `institutions`: canonical provider identity and website metadata. Local icon files are used by the prototype; fixture logo references may remain unset.

Stable identifiers connect records. Joint balances and shared obligations appear once. Savings allocations are earmarks, not extra assets. A payment is not another occurrence of the corresponding forecast expense.

Browser edits use localStorage and remain on that origin in the current browser. They do not modify the JSON fixture or synchronize across users/devices. The current static app should not be used to host private financial data without a separate authentication, authorization, and server-side storage design.
