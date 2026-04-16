---
name: rsv360-monorepo-integration
description: '**WORKFLOW SKILL** — Guide for RSV360 monorepo upgrade, focusing on Block 6: Domain Integration (read-only). Covers workspace confirmation, git state check, API backend creation, frontend adapter and hooks, commits, PR creation, and startup diagnostics. USE FOR: RSV360 upgrade, monorepo integration, domain integration workflow, backend API setup, frontend adapter hooks, git commits for domains. DO NOT USE FOR: general monorepo setup, non-RSV360 projects, runtime debugging.'
---

# RSV360 Monorepo Integration Skill

## Overview
This skill automates the continuation of Block 6 in the RSV360 monorepo upgrade plan. It handles integrating remaining domains (promotions, travel, recommendations, search, leads) with read-only APIs, adapters, hooks, and commits. After integration, it performs diagnostics and startup testing.

## Prerequisites
- Workspace set to: D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\temp-repo-fresh
- Git repository initialized
- Node.js and npm installed
- PostgreSQL running on port 5433
- Previous blocks (0-5) completed

## Step-by-Step Process

### Step 0: Confirm Workspace
Execute these commands to verify the workspace:
```
Set-Location "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\temp-repo-fresh"
Get-Location
Get-ChildItem -Name
```
Expected output: package.json, apps/, backend/, packages/
If not, stop and report "WORKSPACE INCORRETO".

### Step 1: Check Git State
Run:
```
git branch --show-current
git log --oneline -5
git status
```
Report: current branch, last 5 commits, any pending changes.
If there are uncommitted changes: `git stash push -m "wip: antes de continuar bloco 6"`
After switching branch, if needed: `git stash pop`

### Step 2: Switch to Integration Branch
Ensure on branch `upgrade/phase-6-integration-readonly`:
```
git checkout upgrade/phase-6-integration-readonly 2>$null
if ($LASTEXITCODE -ne 0) { git checkout -b upgrade/phase-6-integration-readonly }
```

### Step 3: Integrate Remaining Domains
For each domain in: promotions, travel, recommendations, search, leads (domains 8-12; 1-7 already done)

#### Substep A: Backend API
Check if `backend/src/api/v1/{domain}/routes.js` exists.
If not, create it with this template:

```
const express = require('express');
const router = express.Router();
const knex = require('../../database/knex'); // Knex for existing tables

// GET /api/v1/{domain}
router.get('/', async (req, res) => {
  try {
    const items = await knex('{table}').select('*').limit(100);
    res.json({ success: true, data: items, total: items.length });
  } catch (error) {
    console.error('[{DOMAIN}] Error:', error.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/v1/{domain}/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await knex('{table}').where({ id: req.params.id }).first();
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
```

If the table does NOT exist in the database, return mock/hardcoded temporary data.
For new domains without table (branding, parks, leads), use hardcoded data.

Register the route in `backend/src/server.js`.

#### Substep B: Frontend Adapter
Create `apps/site-publico/services/{domain}.adapter.ts` with this template:

```
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface {Domain}Item {
  id: string | number;
  name: string;
  [key: string]: unknown; // domain-specific fields
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  error?: string;
}

export async function fetch{Domain}s(): Promise<{Domain}Item[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/{domain}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: ApiResponse<{Domain}Item[]> = await res.json();
    return json.data ?? [];
  } catch (error) {
    console.error('[{domain}Adapter] Error:', error);
    return []; // fallback: empty array
  }
}

export async function fetch{Domain}ById(id: string): Promise<{Domain}Item | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/{domain}/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: ApiResponse<{Domain}Item> = await res.json();
    return json.data ?? null;
  } catch (error) {
    console.error('[{domain}Adapter] Error:', error);
    return null; // fallback: null
  }
}
```

#### Substep C: TanStack Query Hook
Create `apps/site-publico/hooks/use{Domain}.ts` with this template:

```
import { useQuery } from '@tanstack/react-query';
import { fetch{Domain}s, fetch{Domain}ById } from '@/services/{domain}.adapter';

export function use{Domain}s() {
  return useQuery({
    queryKey: ['{domain}', 'list'],
    queryFn: fetch{Domain}s,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function use{Domain}(id: string) {
  return useQuery({
    queryKey: ['{domain}', 'detail', id],
    queryFn: () => fetch{Domain}ById(id),
    enabled: !!id,
  });
}
```

#### Substep D: Atomic Commit
```
git add .
git commit -m "feat(integration): integrar domínio {domain} (somente leitura)"
```

### Step 4: Finalize Block 6
After all domains integrated:
```
git push -u origin upgrade/phase-6-integration-readonly
gh pr create --base main --title "BLOCO 6: Integração somente leitura — 12 domínios" --body "Site público consome PMS via API. 12 domínios: branding, enterprises, properties, accommodations, parks, products, attractions, promotions, travel, recommendations, search, leads."
```

### Step 5: Startup Diagnostics
1. `npm install` in root
2. Check .env files in root, backend/, apps/site-publico/, apps/turismo/
3. Start backend: `cd backend && npm run dev`
4. Start site-publico: `cd apps/site-publico && npm run dev`
5. Start turismo: `cd apps/turismo && npm run dev`
6. For each failure: identify root cause, fix, retest
7. Auto-generate DIAGNOSTIC-REPORT.md and STARTUP-GUIDE.md in root

DIAGNOSTIC-REPORT.md content:
- Date/time of execution
- Versions: Node.js, npm, PostgreSQL
- Status of each service (started/failed + error)
- .env variables present/missing per workspace
- TypeScript errors (tsc --noEmit) per workspace
- Ports: free/occupied
- Table of problems found with root cause and solution

STARTUP-GUIDE.md content:
- Exact prerequisites (versions, PostgreSQL, .env)
- Exact commands to start each service IN ORDER
- Healthcheck for each service
- Troubleshooting for most common errors

## Quality Criteria
- All 12 domains integrated without errors
- APIs return data correctly (mock if no table)
- Adapters handle errors gracefully with fallbacks
- Hooks use proper composite query keys
- Commits are atomic and descriptive
- PR created successfully
- All services start without critical errors

## Decision Points
- If workspace incorrect: Stop and notify
- If git state shows uncommitted changes: Always stash first
- If API creation fails: Check backend structure, use mock data if no table
- If adapter/hook fails: Verify types and imports
- If startup fails: Log errors and iterate fixes using common errors table

## Completion Checks
- Block 6 PR merged
- DIAGNOSTIC-REPORT.md and STARTUP-GUIDE.md auto-generated
- All services running on correct ports

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| EADDRINUSE :5000 | Port occupied | `npx kill-port 5000` |
| EADDRINUSE :3000 | Port occupied | `npx kill-port 3000` |
| ECONNREFUSED :5433 | PostgreSQL stopped | Start PostgreSQL service |
| MODULE_NOT_FOUND | Missing dependency | `npm install` in workspace |
| Cannot find module '@rsv360/shared' | Package not built | `cd packages/shared && npm run build` |
| React version mismatch | React 18 vs 19 conflict | `npm ls react` and align versions |
| .env not found | Missing .env file | Copy .env.example to .env |
| ERR_MODULE_NOT_FOUND .ts | tsx not installed | `npm install -D tsx` |
| FATAL: password authentication failed | Wrong DB credentials | Check DATABASE_URL in .env |
| tailwind-merge not found | Conflicting lock file | Remove duplicate lock file |