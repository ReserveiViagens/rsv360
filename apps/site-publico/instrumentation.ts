/**
 * PR-04a — Next.js boot assert (fail-closed JWT_SECRET).
 * PR-13e-followup-e — optional Redis for LLM gateway budget.
 * Runs on server runtime only.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { assertJwtSecretsConfigured, setLlmGatewayRedis } = await import(
      '@rsv360/shared'
    );
    assertJwtSecretsConfigured();

    const { wireLlmGatewayRedis } = await import('@/lib/llm-gateway-redis-boot');
    const mode = await wireLlmGatewayRedis(setLlmGatewayRedis);
    console.info(`[BOOT] LLM gateway budget: ${mode}`);
  }
}
