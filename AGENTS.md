# Project Rules — website-health-report

> MANDATORY. Read this file BEFORE making any change in this project.

## 1. Local git version security (per change)
- This project MUST stay under local git version control at all times.
- After EVERY change (or one logical, focused group of changes), create a git commit with a Conventional Commit message: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`, `style:`.
- Keep commits small and single-purpose. One logical change per commit.
- Never push to a remote, force-push, or amend unless the user explicitly asks.
- Verify before committing (typecheck / route 200 / dev log clean). Do not commit broken code.

## 2. History log
- Every committed change MUST be recorded in `HISTORY.md` at the repo root.
- Entry format (newest first):
  `## YYYY-MM-DD — <short title>  (commit <hash>)`
  - What changed and why.
  - Affected files (paths).
- `HISTORY.md` is committed alongside the change it describes.

## 3. Clean code
- TypeScript strict mode; avoid `any` (only at true dynamic boundaries).
- Prefer `const`; early returns over nested if/else; KISS > DRY > YAGNI.
- Max ~50 lines per function, max 3 nesting levels.
- Named constants for magic values (e.g. `const MAX_RETRIES = 3`).
- Comments only when the WHY is non-obvious.
- No new chart libraries — inline SVG only.
- Indonesian UI text; English code and comments.

## 4. Secrets
- `.env` is gitignored. Never commit real secrets.
- Document required variables in `.env.example` using placeholder values only.

## 5. Workflow notes
- UI/visual work: prefer the `visual-engineering` lane when a subagent is available.
- When the subagent/delegation path is unavailable, implement directly and verify.
- node:sqlite uses WAL: never open a second process against the DB while the dev server runs.
