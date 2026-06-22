#!/usr/bin/env node
'use strict';

/**
 * Blocks agent edits to enterprise policy files unless unlock token is present.
 * MEMORIES.md: automation may update findings only (no secrets / no structural edits).
 * Hook event: preToolUse (Write, StrReplace, Delete, EditNotebook)
 */

const policy = require('./lib/enterprise-policy.cjs');

const readStdin = () =>
  new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
  });

const respond = (permission, userMessage, agentMessage) => {
  process.stdout.write(
    JSON.stringify({
      permission,
      user_message: userMessage,
      agent_message: agentMessage,
    })
  );
};

const denyProtected = (path, reason) => {
  respond(
    'deny',
    'Arquivo enterprise protegido. Inclua ALTERAR_ENTERPRISE_RULES_V2 ou REVOGAR_PACR_AMPLA_V1 na mensagem do owner para alterar.',
    `Protected enterprise path blocked (${reason}): ${policy.normalizePathToRepoRelative(path)}`
  );
};

const failClosed = (reason) => {
  respond(
    'deny',
    'Hook enterprise falhou — edição bloqueada por segurança (fail-closed).',
    reason
  );
};

const mightTargetProtectedPath = (raw, payload) => {
  const haystack = `${raw || ''}\n${JSON.stringify(payload || {})}`;
  return (
    /\.cursor\/(rules|automations|hooks)/i.test(haystack) ||
    /\bAGENTS\.md\b/i.test(haystack) ||
    /\bMEMORIES\.md\b/i.test(haystack) ||
    /ENTERPRISE-AUTOMATION-SETUP\.md/i.test(haystack)
  );
};

readStdin()
  .then((raw) => {
    let payload = {};
    try {
      payload = JSON.parse(raw || '{}');
    } catch {
      if (mightTargetProtectedPath(raw, {})) {
        failClosed('Invalid hook payload JSON while protected path detected');
        return;
      }
      respond('allow');
      return;
    }

    if (policy.hasEnterpriseUnlockToken(payload)) {
      respond('allow');
      return;
    }

    const toolInput = payload.tool_input || payload.toolInput || payload.input || {};
    const path = policy.extractPathFromToolInput(toolInput);

    if (!path) {
      respond('allow');
      return;
    }

    const normalized = policy.normalizePathToRepoRelative(path);

    if (policy.isMemoriesPath(normalized)) {
      const memoriesDecision = policy.evaluateMemoriesToolEdit(payload, toolInput);
      if (memoriesDecision.action === 'allow') {
        respond('allow');
        return;
      }
      if (memoriesDecision.action === 'deny') {
        const messages = {
          sensitive: 'MEMORIES.md: conteúdo sensível proibido (secrets, PII, tokens).',
          structural: 'MEMORIES.md: alteração estrutural/política exige token do owner.',
          no_token: 'MEMORIES.md: edição não permitida fora da seção de achados da automação.',
        };
        respond(
          'deny',
          messages[memoriesDecision.reason] || messages.no_token,
          `MEMORIES.md edit blocked (${memoriesDecision.reason || 'policy'})`
        );
        return;
      }
    }

    if (policy.isPolicyLockedPath(normalized)) {
      denyProtected(path, 'policy-locked');
      return;
    }

    respond('allow');
  })
  .catch(() => {
    failClosed('protect-enterprise-files hook error');
  });
