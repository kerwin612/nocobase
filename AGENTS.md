# AGENTS.md

## Cursor Cloud specific instructions

### Product Overview

NocoBase is an open-source, extensible no-code/low-code platform (monorepo with ~138 packages). It uses a plugin-based microkernel architecture. See `README.md` for the full project overview.

### Services

| Service | Purpose | How to start |
|---|---|---|
| **PostgreSQL** | Primary database (required) | `sudo pg_ctlcluster 16 main start` |
| **NocoBase App** | Backend (port 13001) + Frontend (port 13000) | `yarn dev` |

### Key Commands

- **Lint**: `yarn lint` (pre-existing warnings/errors in codebase are expected)
- **Client tests**: `yarn tc --run <path-to-test-file>` (uses Vitest + jsdom)
- **Server tests**: `yarn ts --run <path-to-test-file>` (uses Vitest + real DB)
- **All tests for a package**: `yarn test --run <package-dir>`
- **Dev server**: `yarn dev` (starts both backend on 13001 and frontend proxy on 13000)
- **Initialize DB**: `yarn nocobase install` (run once after fresh DB setup)

### Non-obvious Caveats

1. **PostgreSQL must be running** before `yarn dev` or `yarn nocobase install`. Start it with `sudo pg_ctlcluster 16 main start`.
2. **`.env` file required**: Copy from `.env.example` if missing. Default config uses PostgreSQL on localhost:5432 with user/password/database all set to `nocobase`.
3. **`.env.test` file required for tests**: Copy from `.env.test.example`. Tests default to SQLite dialect, which requires the `sqlite3` npm package (not included in the repo by default). Install it via `yarn add sqlite3 --dev -W` if running server tests locally.
4. **Default admin credentials**: `admin@nocobase.com` / `admin123` (configured in `.env` via `INIT_ROOT_EMAIL`/`INIT_ROOT_PASSWORD`).
5. **First client bundle takes 2-3 minutes**: The Umi-based frontend shows a "Bundling..." progress screen on first load. Subsequent loads use cache.
6. **PubSubManager warnings are expected**: Logs like `[PubSubManager] adapter is not exist or not connected` are normal in development without Redis.
7. **Package manager**: Yarn 1 (Classic). The lockfile is `yarn.lock`. Do not use npm/pnpm.
8. **Node.js**: v22 works fine despite `engines` specifying `>=18` and Volta pinning `20.14.0`.
