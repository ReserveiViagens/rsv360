#!/usr/bin/env node
'use strict';

/**
 * Enterprise guardrails for Cursor agent shell commands.
 * Logic lives here; hooks.json only references this script.
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

const allow = () => {
  process.stdout.write(JSON.stringify({ permission: 'allow' }));
};

const deny = (userMessage, agentMessage) => {
  process.stdout.write(
    JSON.stringify({
      permission: 'deny',
      user_message: userMessage,
      agent_message: agentMessage,
    })
  );
};

const ask = (userMessage, agentMessage) => {
  process.stdout.write(
    JSON.stringify({
      permission: 'ask',
      user_message: userMessage,
      agent_message: agentMessage,
    })
  );
};

/** @param {string} cmd */
const checkCommand = (cmd, payload) => {
  const c = cmd.trim();

  if (
    !policy.hasEnterpriseUnlockToken(payload) &&
    policy.shellTargetsProtectedPath(c)
  ) {
    return {
      action: 'deny',
      user: 'Alteração de arquivos enterprise via terminal bloqueada.',
      agent:
        'Shell command targets protected enterprise policy files. Use ALTERAR_ENTERPRISE_RULES_V2 in owner message.',
    };
  }

  const denyRules = [
    {
      test: /\bgit\s+push\b[^\n]*(-f|--force)\b/i,
      user: 'Push forçado bloqueado pela política enterprise.',
      agent: 'git push --force is blocked by enterprise guardrails.',
    },
    {
      test: /\bgit\s+clean\b[^\n]*(-f|--force)[^\n]*x/i,
      user: 'git clean destrutivo bloqueado.',
      agent: 'Destructive git clean is blocked.',
    },
    {
      test: /(^|[;&|]\s*)(rm\s+-rf|rmdir\s+\/s)\b/i,
      user: 'Remoção recursiva agressiva bloqueada.',
      agent: 'Recursive delete commands are blocked.',
    },
    {
      test: /\b(DROP\s+DATABASE|DROP\s+TABLE|TRUNCATE\s+TABLE)\b/i,
      user: 'Comando destrutivo de banco bloqueado.',
      agent: 'Destructive SQL is blocked.',
    },
    {
      test: /\bDELETE\s+FROM\b(?![\s\S]*\bWHERE\b)/i,
      user: 'DELETE sem WHERE bloqueado.',
      agent: 'DELETE without WHERE is blocked.',
    },
    {
      test: /\b(azd\s+up|azd\s+deploy|terraform\s+apply|kubectl\s+apply|helm\s+upgrade)\b/i,
      user: 'Deploy automático bloqueado — revisão humana obrigatória.',
      agent: 'Deploy commands are blocked by enterprise policy.',
    },
    {
      test: /\b(vercel\s+--prod|netlify\s+deploy|firebase\s+deploy|heroku\s+container:release)\b/i,
      user: 'Deploy para produção bloqueado.',
      agent: 'Production deploy CLI is blocked.',
    },
    {
      test: /\bnpm\s+publish\b|\byarn\s+publish\b|\bpnpm\s+publish\b/i,
      user: 'Publicação de pacote bloqueada.',
      agent: 'Package publish is blocked.',
    },
    {
      test: /(^|[;&|]\s*)(echo|set|Out-File|Add-Content)[^\n]*(\.env\b|\.env\.)/i,
      user: 'Alteração de .env via terminal bloqueada.',
      agent: 'Shell modification of .env files is blocked.',
    },
    {
      test: /\bgit\s+commit\b[^\n]*(\.env\b|credentials|secret|private[_-]?key)/i,
      user: 'Commit de secrets/.env bloqueado.',
      agent: 'Committing secrets or .env is blocked.',
    },
  ];

  for (const rule of denyRules) {
    if (rule.test.test(c)) {
      return { action: 'deny', user: rule.user, agent: rule.agent };
    }
  }

  const askRules = [
    {
      test: /\bnpm\s+run\s+migrate\b|\bmigrate:rollback\b|\bknex\s+migrate\b/i,
      user: 'Migration de banco — confirme manualmente antes de executar.',
      agent: 'Database migration requires human approval.',
    },
    {
      test: /\bdocker\s+compose\s+up\b|\bdocker-compose\s+up\b/i,
      user: 'Subir containers pode alterar ambiente — confirme.',
      agent: 'Docker compose up requires confirmation.',
    },
    {
      test: /\bgit\s+push\b/i,
      user: 'Push para remoto — confirme branch e CI.',
      agent: 'git push requires human confirmation.',
    },
  ];

  for (const rule of askRules) {
    if (rule.test.test(c)) {
      return { action: 'ask', user: rule.user, agent: rule.agent };
    }
  }

  return { action: 'allow' };
};

readStdin()
  .then((raw) => {
    let payload = {};
    try {
      payload = JSON.parse(raw || '{}');
    } catch {
      allow();
      return;
    }

    const command = String(payload.command || '');
    const result = checkCommand(command, payload);

    if (result.action === 'deny') {
      deny(result.user, result.agent);
      return;
    }
    if (result.action === 'ask') {
      ask(result.user, result.agent);
      return;
    }
    allow();
  })
  .catch(() => {
    allow();
  });
