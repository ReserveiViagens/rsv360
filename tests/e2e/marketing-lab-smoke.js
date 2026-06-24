#!/usr/bin/env node
/**
 * Smoke — modo marketing-lab (:3000) + redirect B2C para S1 (:5000)
 *
 * Uso: node tests/e2e/marketing-lab-smoke.js
 * Env: RSV_SMOKE_SITE_PUBLICO_URL (default http://localhost:3000)
 *      RSV_SMOKE_PRIMARY_SITE_URL (default http://localhost:5000)
 */

"use strict";

const lab = process.env.RSV_SMOKE_SITE_PUBLICO_URL || "http://localhost:3000";
const s1 = process.env.RSV_SMOKE_PRIMARY_SITE_URL || "http://localhost:5000";

function fail(message) {
	console.error(`FAIL: ${message}`);
	process.exit(1);
}

async function head(url) {
	const res = await fetch(url, { method: "GET", redirect: "manual" });
	return { status: res.status, location: res.headers.get("location") || "" };
}

async function getStatus(url) {
	const res = await fetch(url, { redirect: "follow" });
	return res.status;
}

async function main() {
	console.log("=== Marketing Lab smoke ===");

	const root = await head(`${lab}/`);
	if (![301, 302, 307, 308].includes(root.status)) {
		fail(`Expected redirect from /, got ${root.status}`);
	}
	if (!root.location.includes("/lab")) {
		fail(`Expected /lab redirect, got ${root.location}`);
	}
	console.log(`OK / -> ${root.location}`);

	const hoteis = await head(`${lab}/hoteis`);
	if (![301, 302, 307, 308].includes(hoteis.status)) {
		fail(`Expected redirect from /hoteis, got ${hoteis.status}`);
	}
	if (!hoteis.location.includes(":5000/hoteis")) {
		fail(`Expected :5000/hoteis, got ${hoteis.location}`);
	}
	console.log(`OK /hoteis -> ${hoteis.location}`);

	const labStatus = await getStatus(`${lab}/lab`);
	if (labStatus !== 200) {
		fail(`/lab returned ${labStatus}`);
	}
	console.log("OK /lab -> 200");

	const analyticsHtml = await (await fetch(`${lab}/analytics`)).text();
	if (!analyticsHtml.includes("B2C e reservas")) {
		fail("/analytics missing LabShell banner");
	}
	console.log("OK /analytics has LabShell");

	const marketingHtml = await (await fetch(`${lab}/marketing`)).text();
	if (marketingHtml.includes("Em construção")) {
		fail("/marketing still shows stub");
	}
	if (!marketingHtml.includes("Campanhas")) {
		fail("/marketing missing hub modules");
	}
	console.log("OK /marketing hub MVP");

	const campaignsStatus = await getStatus(`${lab}/marketing/campaigns`);
	if (campaignsStatus !== 200) {
		fail(`/marketing/campaigns returned ${campaignsStatus}`);
	}
	console.log("OK /marketing/campaigns -> 200");

	try {
		const s1Res = await fetch(`${s1}/health`, { signal: AbortSignal.timeout(3000) });
		if (s1Res.status === 200) {
			console.log("OK S1 health -> 200");
		} else {
			console.log(`WARN S1 :5000 health -> ${s1Res.status}`);
		}
	} catch {
		console.log("WARN S1 :5000 not reachable (start Crm-RSV-360)");
	}

	console.log("=== All checks passed ===");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
