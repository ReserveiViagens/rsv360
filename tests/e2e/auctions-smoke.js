#!/usr/bin/env node
/**
 * Smoke — API leilões v1 (:3002) + proxy S1 opcional (:5000)
 *
 * Uso: npm run smoke:auctions
 * Env:
 *   RSV_AUCTIONS_BACKEND_URL (default http://127.0.0.1:3002)
 *   RSV_SMOKE_PRIMARY_SITE_URL (default http://127.0.0.1:5000) — opcional
 *   SEED_TEST_USER_EMAIL (default test@local.dev)
 *   SEED_TEST_USER_PASSWORD (default dev-only-fallback-do-not-use-in-prod)
 */

"use strict";

const backend =
  (process.env.RSV_AUCTIONS_BACKEND_URL || "http://127.0.0.1:3002").replace(/\/$/, "");
const s1 = (process.env.RSV_SMOKE_PRIMARY_SITE_URL || "http://127.0.0.1:5000").replace(
  /\/$/,
  "",
);
const email = (process.env.SEED_TEST_USER_EMAIL || "test@local.dev").toLowerCase();
const password =
  process.env.SEED_TEST_USER_PASSWORD || "dev-only-fallback-do-not-use-in-prod";

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

async function fetchJson(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(15_000),
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { res, body };
}

async function main() {
  console.log("=== Auctions smoke ===");
  console.log(`Backend: ${backend}`);

  const health = await fetchJson(`${backend}/health`);
  if (health.res.status !== 200) {
    fail(`/health returned ${health.res.status}`);
  }
  console.log("OK /health -> 200");

  const active = await fetchJson(`${backend}/api/v1/auctions/active`);
  if (active.res.status !== 200) {
    fail(`/api/v1/auctions/active returned ${active.res.status}`);
  }
  if (!Array.isArray(active.body)) {
    fail("/api/v1/auctions/active must return a JSON array");
  }
  if (active.body.length === 0) {
    fail(
      "No active auctions — run: docker compose exec backend npm run migrate && docker compose exec backend node scripts/seed-auctions.js",
    );
  }
  const auction = active.body[0];
  if (!auction?.id || !auction?.title) {
    fail("Active auction missing id/title");
  }
  console.log(`OK /api/v1/auctions/active -> ${active.body.length} item(s)`);

  const detail = await fetchJson(`${backend}/api/v1/auctions/${auction.id}`);
  if (detail.res.status !== 200) {
    fail(`/api/v1/auctions/${auction.id} returned ${detail.res.status}`);
  }
  if (detail.body?.id !== auction.id) {
    fail("Auction detail id mismatch");
  }
  console.log(`OK /api/v1/auctions/${auction.id} -> ${detail.body.title}`);

  const login = await fetchJson(`${backend}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (login.res.status === 429) {
    fail(`Login rate limited — reset auth_rate_limits or wait: ${login.body?.error}`);
  }
  if (login.res.status !== 200 || !login.body?.success) {
    fail(`Login failed (${login.res.status}): ${login.body?.error || "unknown"}`);
  }
  const token = login.body?.data?.access_token;
  if (!token) {
    fail("Login response missing access_token");
  }
  console.log("OK POST /api/v1/auth/login -> token");

  const minBid =
    Number(auction.current_price ?? auction.start_price) +
    Number(auction.min_increment ?? 1);
  const bid = await fetchJson(`${backend}/api/v1/auctions/${auction.id}/bids`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount: minBid }),
  });
  if (bid.res.status !== 201 || !bid.body?.success) {
    fail(
      `POST bid failed (${bid.res.status}): ${bid.body?.message || bid.body?.error || "unknown"}`,
    );
  }
  if (!bid.body?.data?.amount || Number(bid.body.data.amount) < minBid) {
    fail("Bid response missing expected amount");
  }
  console.log(`OK POST /api/v1/auctions/${auction.id}/bids -> R$ ${bid.body.data.amount}`);

  const after = await fetchJson(`${backend}/api/v1/auctions/${auction.id}`);
  if (Number(after.body?.current_price) < minBid) {
    fail(`current_price not updated (expected >= ${minBid}, got ${after.body?.current_price})`);
  }
  console.log(`OK current_price updated -> ${after.body.current_price}`);

  try {
    const s1Res = await fetchJson(`${s1}/api/leiloes`);
    if (s1Res.res.status === 200 && s1Res.body?.success && s1Res.body?.source === "rsv360") {
      const count = Array.isArray(s1Res.body.data) ? s1Res.body.data.length : 0;
      console.log(`OK S1 /api/leiloes -> ${count} item(s) (source: rsv360)`);
    } else if (s1Res.res.status === 502) {
      console.log("WARN S1 /api/leiloes -> 502 (backend :3002 unreachable from S1?)");
    } else {
      console.log(`WARN S1 /api/leiloes -> ${s1Res.res.status}`);
    }
  } catch {
    console.log("WARN S1 :5000 not reachable (start Crm-RSV-360 for proxy check)");
  }

  console.log("=== All checks passed ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
