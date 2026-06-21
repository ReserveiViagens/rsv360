'use strict';

/** Tokens that unlock edits to protected enterprise policy files. */
const UNLOCK_TOKENS = ['REVOGAR_PACR_AMPLA_V1', 'ALTERAR_ENTERPRISE_RULES_V2'];

const PROTECTED_PATH_RULES = [
  /^\.cursor\/rules\//i,
  /^\.cursor\/automations\//i,
  /^\.cursor\/hooks\.json$/i,
  /^\.cursor\/hooks\//i,
  /^AGENTS\.md$/i,
  /^MEMORIES\.md$/i,
  /^docs\/cursor\/ENTERPRISE-AUTOMATION-SETUP\.md$/i,
];

function normalizePath(filePath) {
  if (!filePath) return '';
  return String(filePath).replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '');
}

function isProtectedEnterprisePath(filePath) {
  const p = normalizePath(filePath);
  return PROTECTED_PATH_RULES.some((re) => re.test(p));
}

function extractOwnerMessageText(payload) {
  // Tokens valid only in explicit owner/human message fields — never prompt/agent text.
  const parts = [];
  for (const key of ['user_message', 'lastUserMessage', 'userMessage']) {
    if (payload[key]) parts.push(String(payload[key]));
  }
  return parts.join('\n');
}

function hasEnterpriseUnlockToken(payload) {
  const ownerText = extractOwnerMessageText(payload);
  if (!ownerText.trim()) return false;
  return UNLOCK_TOKENS.some((token) => ownerText.includes(token));
}

function extractPathFromToolInput(toolInput) {
  if (!toolInput) return null;
  let input = toolInput;
  if (typeof input === 'string') {
    try {
      input = JSON.parse(input);
    } catch {
      return null;
    }
  }
  if (typeof input !== 'object' || input === null) return null;
  return input.path || input.target_notebook || input.file_path || input.filePath || null;
}

function shellTargetsProtectedPath(command) {
  const c = String(command || '');
  const normalized = c.replace(/\\/g, '/');
  const candidates = [
    ...normalized.matchAll(/(?:^|[\s"'=])([\w./-]+\.(?:mdc|md|json|cjs|js))(?:$|[\s"'])/gi),
    ...normalized.matchAll(/(?:^|[\s"'=])(\.cursor\/[\w./-]+)/gi),
    ...normalized.matchAll(/\b(AGENTS\.md|MEMORIES\.md)\b/gi),
  ].flatMap((m) => (m[1] ? [m[1]] : []));

  return candidates.some((p) => isProtectedEnterprisePath(p));
}

module.exports = {
  UNLOCK_TOKENS,
  normalizePath,
  isProtectedEnterprisePath,
  hasEnterpriseUnlockToken,
  extractPathFromToolInput,
  shellTargetsProtectedPath,
};
