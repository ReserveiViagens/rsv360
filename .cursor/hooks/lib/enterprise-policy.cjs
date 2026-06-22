'use strict';

/** Tokens that unlock edits to protected enterprise policy files. */
const UNLOCK_TOKENS = ['REVOGAR_PACR_AMPLA_V1', 'ALTERAR_ENTERPRISE_RULES_V2'];

/** Fully locked unless owner token (excludes MEMORIES.md — special automation policy). */
const POLICY_LOCKED_PATH_RULES = [
  /^\.cursor\/rules\//i,
  /^\.cursor\/automations\//i,
  /^\.cursor\/hooks\.json$/i,
  /^\.cursor\/hooks\//i,
  /^AGENTS\.md$/i,
  /^docs\/cursor\/ENTERPRISE-AUTOMATION-SETUP\.md$/i,
];

const MEMORIES_PATH = 'MEMORIES.md';

const SENSITIVE_CONTENT_PATTERNS = [
  /\b(?:password|senha|passwd|api[_-]?key|auth[_-]?token|access[_-]?token|secret|private[_-]?key)\s*[:=]/i,
  /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/,
  /\b(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}\b/,
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  /\b(?:cookie|session[_-]?id|bearer\s+[A-Za-z0-9._-]+)/i,
  /\.env(?:\.|$|\b)/i,
  /BEGIN (?:RSA |EC )?PRIVATE KEY/i,
  /\bsk-[A-Za-z0-9]{10,}\b/,
  /\bghp_[A-Za-z0-9]{20,}\b/,
];

function stripQuotes(value) {
  return String(value).replace(/^["']|["']$/g, '');
}

/**
 * Normalize repo-relative paths from Windows/Linux absolute or relative inputs.
 * e.g. C:/Users/.../repo/.cursor/rules/foo.mdc -> .cursor/rules/foo.mdc
 */
function normalizePathToRepoRelative(filePath) {
  if (!filePath) return '';
  let p = stripQuotes(String(filePath)).replace(/\\/g, '/').trim();

  const anchorPatterns = [
    /(?:^|\/)((?:\.cursor\/(?:rules|automations|hooks)(?:\/|$)[^?#]*))$/i,
    /(?:^|\/)((?:\.cursor\/hooks\.json))$/i,
    /(?:^|\/)((?:docs\/cursor\/ENTERPRISE-AUTOMATION-SETUP\.md))$/i,
    /(?:^|\/)((?:AGENTS\.md))$/i,
    /(?:^|\/)((?:MEMORIES\.md))$/i,
  ];

  for (const re of anchorPatterns) {
    const match = p.match(re);
    if (match) return match[1].replace(/^\/+/, '');
  }

  const lower = p.toLowerCase();
  const cursorIdx = lower.indexOf('/.cursor/');
  if (cursorIdx >= 0) return p.slice(cursorIdx + 1);

  if (lower.endsWith('/agents.md')) return 'AGENTS.md';
  if (lower.endsWith('/memories.md')) return 'MEMORIES.md';

  return p.replace(/^\.\//, '').replace(/^\/+/, '');
}

/** @deprecated alias */
function normalizePath(filePath) {
  return normalizePathToRepoRelative(filePath);
}

function isMemoriesPath(filePath) {
  return normalizePathToRepoRelative(filePath).toLowerCase() === MEMORIES_PATH.toLowerCase();
}

function isPolicyLockedPath(filePath) {
  const p = normalizePathToRepoRelative(filePath);
  return POLICY_LOCKED_PATH_RULES.some((re) => re.test(p));
}

function isProtectedEnterprisePath(filePath) {
  return isPolicyLockedPath(filePath) || isMemoriesPath(filePath);
}

function extractOwnerMessageText(payload) {
  const parts = [];
  for (const key of ['user_message', 'lastUserMessage', 'userMessage']) {
    if (payload[key]) parts.push(String(payload[key]));
  }
  return parts.join('\n');
}

function hasEnterpriseUnlockToken(payload) {
  const ownerText = extractOwnerMessageText(payload);
  if (!ownerText.trim()) return false;
  return UNLOCK_TOKENS.some((token) => {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`).test(ownerText);
  });
}

function parseToolInput(toolInput) {
  if (!toolInput) return null;
  if (typeof toolInput === 'object') return toolInput;
  try {
    return JSON.parse(toolInput);
  } catch {
    return null;
  }
}

function extractPathFromToolInput(toolInput) {
  const input = parseToolInput(toolInput);
  if (!input || typeof input !== 'object') return null;
  return input.path || input.target_notebook || input.file_path || input.filePath || null;
}

function extractContentFromToolInput(toolInput) {
  const input = parseToolInput(toolInput);
  if (!input || typeof input !== 'object') return '';
  return String(input.new_string || input.contents || input.content || input.old_string || '');
}

function containsSensitiveMemoriesContent(text) {
  const value = String(text || '');
  if (!value.trim()) return false;
  return SENSITIVE_CONTENT_PATTERNS.some((re) => re.test(value));
}

function isAutomationContext(payload) {
  if (payload.automation === true || payload.fromAutomation === true) return true;
  const haystack = [
    payload.source,
    payload.trigger,
    payload.user_message,
    payload.agent_message,
  ]
    .filter(Boolean)
    .join('\n');
  return /\benterprise-automation\b|\bfind critical bugs\b|\bautomation:\s*true\b/i.test(haystack);
}

function isStructuralMemoriesEdit(toolInput) {
  const input = parseToolInput(toolInput);
  if (!input) return true;

  const oldString = String(input.old_string || '');
  const newString = String(input.new_string || input.contents || input.content || '');

  const structuralNeedles = [
    '# Enterprise Bug-Finding',
    '## Notes',
    '**Nunca armazenar**',
    '<!-- automation: open findings list -->',
    '<!-- automation: rejected findings with reason and date -->',
    '## Open findings',
    '## Rejected / wont-fix (recent)',
  ];

  for (const needle of structuralNeedles) {
    if (oldString.includes(needle) && !newString.includes(needle)) return true;
    if (!oldString && newString && !newString.includes('# Enterprise Bug-Finding')) return true;
  }

  if (/^#\s/m.test(newString) && !/^#\s+Enterprise Bug-Finding/m.test(newString)) return true;
  if (/^##\s+(?!Open findings|Rejected)/m.test(newString)) return true;

  return false;
}

function isFindingsOnlyMemoriesEdit(toolInput) {
  const input = parseToolInput(toolInput);
  if (!input) return false;

  const oldString = String(input.old_string || '');
  const newString = String(input.new_string || input.contents || input.content || '');

  if (containsSensitiveMemoriesContent(newString)) return false;
  if (isStructuralMemoriesEdit(toolInput)) return false;

  if (oldString) {
    const allowedOld =
      /_Nenhum achado ativo\._/i.test(oldString) ||
      /^-\s+\[/m.test(oldString) ||
      /achado/i.test(oldString) ||
      /wont-fix/i.test(oldString) ||
      /rejected/i.test(oldString);
    return allowedOld;
  }

  return (
    /^-\s+\[[ x]?\]/m.test(newString) ||
    /_Nenhum achado ativo\._/i.test(newString) ||
    /Severity:/i.test(newString)
  );
}

/**
 * MEMORIES.md: automation may update active findings; structural/policy edits need token.
 */
function evaluateMemoriesToolEdit(payload, toolInput) {
  const path = extractPathFromToolInput(toolInput);
  if (!path || !isMemoriesPath(path)) return { action: 'not_memories' };

  if (hasEnterpriseUnlockToken(payload)) return { action: 'allow' };

  const toolName = String(payload.tool_name || payload.toolName || '').toLowerCase();
  if (toolName === 'delete') {
    return { action: 'deny', reason: 'structural' };
  }

  const content = extractContentFromToolInput(toolInput);
  if (containsSensitiveMemoriesContent(content)) {
    return { action: 'deny', reason: 'sensitive' };
  }

  if (isStructuralMemoriesEdit(toolInput)) {
    return { action: 'deny', reason: 'structural' };
  }

  if (isAutomationContext(payload) && isFindingsOnlyMemoriesEdit(toolInput)) {
    return { action: 'allow' };
  }

  return { action: 'deny', reason: 'no_token' };
}

function extractPathCandidatesFromShell(command) {
  const normalized = String(command || '').replace(/\\/g, '/');
  const patterns = [
    /(?:^|[\s"'=])([A-Za-z]:[^"';\s|&]*?\.(?:mdc|md|json|cjs|js))/gi,
    /(?:^|[\s"'=])(\/(?:[\w.-]+\/)+[\w.-]+\.(?:mdc|md|json|cjs|js))/gi,
    /(?:^|[\s"'=])((?:\.cursor\/|[\w.-]+\/)*\.cursor\/[\w./-]+)/gi,
    /(?:^|[\s"'=])((?:[\w.-]+\/)*docs\/cursor\/[\w./-]+\.md)/gi,
    /\b(AGENTS\.md|MEMORIES\.md)\b/gi,
  ];

  const found = new Set();
  for (const re of patterns) {
    for (const match of normalized.matchAll(re)) {
      if (match[1]) found.add(normalizePathToRepoRelative(match[1]));
    }
  }
  return [...found];
}

function shellExtractProtectedPaths(command) {
  return extractPathCandidatesFromShell(command).filter((p) => isProtectedEnterprisePath(p));
}

function isReadOnlyShellCommand(command) {
  const c = String(command || '').trim();
  const readOnlyPatterns = [
    /^\s*cat\b/i,
    /^\s*type\b[\s/]/i,
    /\bGet-Content\b/i,
    /\bgit\s+diff\b/i,
    /\bgit\s+show\b/i,
    /\bgrep\b/i,
    /\brg\b/i,
    /\bfindstr\b/i,
    /\bSelect-String\b/i,
    /^\s*head\b/i,
    /^\s*tail\b/i,
    /^\s*less\b/i,
    /^\s*more\b/i,
    /^\s*wc\b/i,
    /^\s*node\s+--check\b/i,
  ];
  return readOnlyPatterns.some((re) => re.test(c));
}

function shellCommandMutatesFilesystem(command) {
  const c = String(command || '');
  const mutatePatterns = [
    />{1,2}/,
    /\|\s*tee\b/i,
    /\b(Set-Content|Add-Content|Out-File|Copy-Item|Move-Item|Remove-Item|New-Item|ni\b|del\b|\brm\b|\bmv\b|\bcp\b)\b/i,
    /\b(sed\s+-i|git\s+checkout\s+--|git\s+restore\b(?![^\n]*--source))/i,
    /\bgit\s+(add|reset|restore)\b/i,
    /\becho\b[^\n]*>/i,
    /\bnano\b|\bvi\b|\bvim\b/i,
    /\bgit\s+apply\b/i,
    /\bgit\s+commit\b/i,
  ];
  return mutatePatterns.some((re) => re.test(c));
}

function shellUsesInterpretedWrite(command) {
  const c = String(command || '');
  if (/\bnode\s+--check\b/i.test(c)) return false;
  return /\b(node|python3?)\b[^\n]*\s(-e|-c)\b/i.test(c);
}

/** Legacy helper — true if any protected path appears (read or write). */
function shellTargetsProtectedPath(command) {
  return shellExtractProtectedPaths(command).length > 0;
}

/** Block shell only when command mutates protected policy paths (read-only allowed). */
function shellMutatesProtectedPath(command) {
  const paths = shellExtractProtectedPaths(command);
  if (paths.length === 0) return false;
  if (isReadOnlyShellCommand(command)) return false;
  const mutates = shellCommandMutatesFilesystem(command) || shellUsesInterpretedWrite(command);
  if (!mutates) return false;
  return paths.some((p) => isPolicyLockedPath(p) || isMemoriesPath(p));
}

function hasUnsafeDeleteWithoutWhere(command) {
  const segments = String(command || '').split(/;|&&|\|\|/);
  for (const segment of segments) {
    if (/\bDELETE\s+FROM\b/i.test(segment) && !/\bWHERE\b/i.test(segment)) {
      return true;
    }
  }
  return false;
}

module.exports = {
  UNLOCK_TOKENS,
  MEMORIES_PATH,
  normalizePath,
  normalizePathToRepoRelative,
  isMemoriesPath,
  isPolicyLockedPath,
  isProtectedEnterprisePath,
  hasEnterpriseUnlockToken,
  extractPathFromToolInput,
  extractContentFromToolInput,
  containsSensitiveMemoriesContent,
  evaluateMemoriesToolEdit,
  shellTargetsProtectedPath,
  shellMutatesProtectedPath,
  shellExtractProtectedPaths,
  isReadOnlyShellCommand,
  shellCommandMutatesFilesystem,
  shellUsesInterpretedWrite,
  hasUnsafeDeleteWithoutWhere,
  parseToolInput,
};
