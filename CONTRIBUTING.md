# Contributing to Altrivo Admin

## Getting Started

1. Clone the repo and install dependencies (see README).
2. Copy `.env.example` to `.env.local` and fill in the values (ask A4 for secrets).
3. Run `npm run dev` and verify the app loads.

## Branch Strategy

We use a **trunk-based** workflow. `main` is always deployable.

```
main                    ← production (protected)
  └── feature/a1-...    ← your work branch
  └── bugfix/...
  └── hotfix/...
```

### Naming convention

| Type    | Pattern                          | Example                              |
| ------- | -------------------------------- | ------------------------------------ |
| Feature | `feature/<member>-<short-desc>`  | `feature/a2-escrow-auto-release`     |
| Bugfix  | `bugfix/<short-desc>`            | `bugfix/rls-cross-tenant-leak`       |
| Hotfix  | `hotfix/<short-desc>`            | `hotfix/payment-webhook-crash`       |

### Rules

- Always branch from latest `main`.
- Rebase on `main` before opening PR (no merge commits).
- Delete branch after merge.

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short description>

[optional body]
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

## Pull Requests

1. Fill in the PR template — no empty sections.
2. Link the Task ID from the tracker (`T-A1-001`).
3. Add screenshots for any UI change.
4. Request review from the relevant CODEOWNER.
5. Resolve all review comments before merge.
6. Squash-merge to keep `main` history clean.

## Code Standards

- **TypeScript strict mode** — no `any` without a `// justification` comment.
- **Design tokens only** — import from `globals.css`. Zero hardcoded colors, fonts, or spacing values.
- **Zod validation** — every API input validated on client AND server.
- **RLS everywhere** — every Supabase table must have Row Level Security policies.
- **No secrets in code** — use `.env.local` and the key vault for sensitive values.

## Testing

- Unit tests: Jest for business logic.
- E2E tests: Playwright for critical flows.
- Run locally before pushing: `npm run lint && npm run typecheck && npm test`.

## Security

- Sensitive keys (courier API, payment, VCC, OAuth) → encrypted via A4's key vault.
- No PII or card data in logs or console.
- Report security issues directly to A4, not in public issues.

## Definition of Done

Every task must pass the full checklist in the "Definition of Done" sheet before the PR is approved. No exceptions.
