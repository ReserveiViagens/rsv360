#!/usr/bin/env node
'use strict';

/**
 * Blocks agent edits to enterprise policy files unless unlock token is present.
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

readStdin()
  .then((raw) => {
    let payload = {};
    try {
      payload = JSON.parse(raw || '{}');
    } catch {
      respond('allow');
      return;
    }

    if (policy.hasEnterpriseUnlockToken(payload)) {
      respond('allow');
      return;
    }

    const toolInput = payload.tool_input || payload.toolInput || payload.input || {};
    const path = policy.extractPathFromToolInput(toolInput);

    if (path && policy.isProtectedEnterprisePath(path)) {
      respond(
        'deny',
        'Arquivo enterprise protegido. Inclua ALTERAR_ENTERPRISE_RULES_V2 ou REVOGAR_PACR_AMPLA_V1 na mensagem do owner para alterar.',
        `Protected enterprise path blocked: ${policy.normalizePath(path)}. Required token: ALTERAR_ENTERPRISE_RULES_V2`
      );
      return;
    }

    respond('allow');
  })
  .catch(() => {
    respond('allow');
  });
