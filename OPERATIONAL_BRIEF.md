# ORLAN FINANCE — WEB OPERATIONAL BRIEF

Supersedes the original Flutter/Android brief for platform decisions only. The product vision, philosophy, and V1 feature scope from that document are unchanged and carried forward here. This is the reference document for whichever AI implements the product. Do not begin substantial coding until Phase 0 is confirmed.

---

## 1. Platform decision

Orlan Finance is now a web application, not an Android app.

- Frontend + backend: **Next.js** (TypeScript), one codebase
- Database: **PostgreSQL**, hosted on **Supabase**
- Authentication: **Supabase Auth**
- ORM / migrations: **Prisma**
- Hosting: **Vercel** (app) + **Supabase** (database + auth)

**Why**: one language, one repository, no separate frontend/backend to keep in sync. Postgres suits the relational nature of financial data (transactions belong to accounts, debts have repayments). Supabase Auth avoids hand-building password storage, and gives multi-user support for free — relevant because of the login model below.

**Access model**: solo user for now, but every table is scoped by `user_id` from day one so additional users can be invited later without a schema redesign. No offline mode is required — the app can assume an internet connection.

---

## 2. Product vision (carried over, unchanged)

Orlan Finance is a personal financial operating system, not an expense tracker. It should eventually answer: *where am I financially, what's going wrong, what should I change, am I on track.*

Product journey: **Track → Understand → Control → Debt-free → Save → Invest → Build net worth → Financial freedom.**

Debt is a first-class, core-V1 concept — not a later add-on.

---

## 3. V1 feature boundary

**In scope for V1:**
- [ ] Accounts (multiple: bank, cash, wallet, savings)
- [ ] Categories (customizable, not hardcoded)
- [ ] Transactions: expense, income, transfer, adjustment
- [ ] Fast transaction entry (amount, category, account in a few seconds)
- [ ] Budgets, with plain-language interpretation (not just raw percentages)
- [ ] Savings goals
- [ ] Recurring transactions
- [ ] Debt management + repayment tracking, integrated with transactions
- [ ] Rule-based Insights Engine (no LLM required for V1)
- [ ] Spending analytics
- [ ] Weekly/monthly financial reviews

**Explicitly out of scope for V1 (V2 — do not build early):**
- [ ] Investments, portfolio tracking
- [ ] Assets/liabilities modeling, net worth
- [ ] Net-worth goals and wealth trajectory
- [ ] Bank/fintech integrations (credential-based)

---

## 4. Domain model

Core entities: `User`, `Account`, `Category`, `Transaction`, `Budget`, `SavingsGoal`, `Debt`, `DebtRepayment`, `RecurringTransaction`, `Insight`.

Key relationships:
- A `User` owns Accounts, Categories, Budgets, Savings Goals, Debts, Recurring Transactions, and receives Insights.
- A `Transaction` belongs to an `Account` and a `Category`.
- A `DebtRepayment` links to both a `Debt` and the `Transaction` that recorded it.

**Rules that must hold:**
- [ ] Account balances are derived from transaction history, not stored as an independently-edited number.
- [ ] A transfer between accounts never counts as income or expense.
- [ ] Recording a debt repayment must, in one action: decrease the paying account's balance, decrease the debt's current balance, and create a row in that debt's repayment history.
- [ ] Every table/query is scoped to the logged-in user's `user_id`.

---

## 5. Insights Engine

- [ ] Rule-based only for V1 — no LLM/AI dependency.
- [ ] Categories to implement: spending (unusual/rising/falling), budgets (approaching/exceeded/pace), cash flow (shortage/excess), debt (progress/projection/slow repayment), savings (progress/trajectory).
- [ ] Every insight follows: **observation → interpretation → recommendation** (e.g. not "75% of budget used" alone, but "you're spending faster than planned, and at this rate you'll exceed by ₦X").
- [ ] Insights are generated and stored (not computed fresh on every page load) so history of past insights is preserved.

---

## 6. Screens (confirmed via mockups this session)

- [x] Dashboard — metric cards (available cash, debt remaining, savings progress) + "what matters now" insight list. Reviewed and approved.
- [x] Add Transaction — type toggle, big amount field, category chips, account select, optional note. Reviewed and approved.
- [x] Debt — overview list with progress bars + detail view with repayment history and "record a repayment." Reviewed and approved.
- [x] Transactions History — search, type filter chips, grouped by date, color-coded amounts, debt repayments shown inline. Reviewed and approved.
- [ ] Budgets — creation + monitoring, same plain-language pattern as dashboard insights
- [ ] Goals — savings goal progress, same visual language as debt progress bars
- [ ] Insights — dedicated feed of generated insights
- [ ] Analytics — spending by category/time, income vs expense, budget performance
- [ ] Accounts — manage bank/cash/wallet accounts
- [ ] Recurring — manage recurring income/expenses, 30-day forecast
- [ ] Financial Review — weekly/monthly generated summary
- [ ] Settings — categories, preferences, data export/deletion

**UX principles to hold across all remaining screens:**
- [ ] Empty states are an invitation with a clear action, never a blank card.
- [ ] Error states preserve whatever the user typed — never silently clear a failed form.
- [ ] First-time experience walks through adding the first account, then the first transaction, before showing the full dashboard.

---

## 7. Technical architecture

**Request flow (fixed, do not bypass a layer):**
Page/form → Server action (auth check) → Domain service (business rules) → Prisma → Postgres

**Folder structure:**
- `app/` — pages, one folder per screen
- `lib/services/` — domain logic (`transactions.ts`, `budgets.ts`, `debts.ts`, `insights.ts`)
- `lib/db/` — Prisma client, the only place that touches the database directly
- `prisma/schema.prisma` — the schema definition
- `components/` — shared UI pieces

**Decisions to hold:**
- [ ] No global state library — server-fetched data + local React state only.
- [ ] One shared validation ruleset, used client-side and server-side.
- [ ] Domain services throw specific errors; pages render plain-language messages, never raw exceptions.
- [ ] Tests prioritize domain services (budget math, debt projections) over UI.
- [ ] Prisma migrations are the single source of schema history.

---

## 8. Nigerian market considerations (research checkpoints)

- [ ] Research common Nigerian banking/cash/mobile-wallet/USSD habits before finalizing the Accounts model.
- [ ] Research Nigerian personal-debt terminology and common structures before finalizing Debt fields.
- [ ] Research Nigerian investment instruments (T-bills, mutual funds, local stocks) — for V2 readiness only, not implementation now.
- [ ] Currency formatting defaults to ₦, but the schema should not hardcode Naira as the only possible currency.

---

## 9. Privacy & security (new, due to online hosting)

- [ ] All traffic over HTTPS.
- [ ] Passwords never stored directly — handled entirely by Supabase Auth.
- [ ] Sensitive fields encrypted at rest where Supabase supports it.
- [ ] Data export and account/data deletion available from Settings.
- [ ] No bank credentials requested or stored for V1.

---

## 10. Build roadmap & checkpoints

Each phase ends with a checkpoint: a working, demonstrable piece of the app that gets reviewed before the next phase starts — do not proceed past an unchecked phase.

**Phase 0 — Foundations**
- [ ] Next.js (TypeScript) project initialized
- [ ] Supabase project connected (Auth + Postgres)
- [ ] Prisma connected to Supabase
- [ ] A single page deployed successfully to Vercel

**Phase 1 — Data layer**
- [ ] Prisma schema defines all V1 entities (Section 4)
- [ ] First migration applied, tables visible in Supabase
- [ ] Default categories seeded (editable afterward)

**Phase 2 — Auth**
- [ ] Login/signup working via Supabase Auth
- [ ] Every route behind login
- [ ] Every query scoped by `user_id`, confirmed with a manual check

**Phase 3 — Transactions**
- [ ] Add Transaction screen matches the reviewed mockup
- [ ] Transactions History screen matches the reviewed mockup
- [ ] Account balances correctly derived from transactions
- [ ] Transfers confirmed not to affect income/expense totals

**Phase 4 — Budgets**
- [ ] Budget CRUD
- [ ] Plain-language budget interpretation logic
- [ ] Budgets screen

**Phase 5 — Debt**
- [ ] Debt CRUD
- [ ] Repayment recording with the three-part effect (account, debt, history)
- [ ] Debt screen matches the reviewed mockup
- [ ] Debt-free date projection

**Phase 6 — Savings goals**
- [ ] Goal CRUD
- [ ] Progress + required contribution calculation
- [ ] Goals screen

**Phase 7 — Recurring transactions**
- [ ] Recurring CRUD
- [ ] 30-day forecast of upcoming recurring expenses

**Phase 8 — Insights**
- [ ] Rule set implemented per Section 5
- [ ] Insights generated and stored, not computed on the fly
- [ ] Insights screen

**Phase 9 — Analytics & reviews**
- [ ] Analytics screen
- [ ] Weekly/monthly review generation

**Phase 10 — Polish**
- [ ] Empty states across all screens
- [ ] Error states preserve input
- [ ] First-time onboarding flow
- [ ] Mobile-browser responsive check

---

## 11. How each checkpoint should be reviewed

For every phase, the implementation AI should provide, before moving on:
1. What was built, in plain terms.
2. Which files were added or changed.
3. How it fits the architecture in Section 7.
4. Confirmation that nothing from an earlier phase broke.

Do not dump multiple phases into a single response. One phase, reviewed, then the next.
