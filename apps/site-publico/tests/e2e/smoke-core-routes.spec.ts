import { expect, test, type Page } from "@playwright/test";

async function waitForTerminalState(
  page: Page,
  config: {
    successRegex: RegExp;
    errorRegex?: RegExp;
    loadingRegex: RegExp;
    timeoutMs?: number;
  }
) {
  const timeoutMs = config.timeoutMs ?? 15000;
  await expect
    .poll(
      async () => {
        const bodyText = await page.locator("body").innerText();
        const hasSuccess = config.successRegex.test(bodyText);
        const hasError = config.errorRegex ? config.errorRegex.test(bodyText) : false;
        const isOnlyLoading = config.loadingRegex.test(bodyText) && !hasSuccess && !hasError;

        if (hasSuccess) return "success";
        if (hasError) return "error";
        if (isOnlyLoading) return "loading-only";
        return "pending";
      },
      { timeout: timeoutMs, intervals: [500, 1000, 1500] }
    )
    .toMatch(/success|error/);
}

test.describe("Smoke - rotas centrais e protecao", () => {
  test("home nao fica em loading infinito", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1", { hasText: "Reservei Viagens" })).toBeVisible({ timeout: 15000 });
  });

  test("buscar renderiza formulario mesmo sem dados", async ({ page }) => {
    await page.goto("/buscar");
    await expect(page.getByRole("heading", { name: /Buscar Propriedades/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: /^Buscar$/i })).toBeVisible();
  });

  test("hoteis mostra conteudo ou erro amigavel", async ({ page }) => {
    await page.goto("/hoteis");
    await waitForTerminalState(page, {
      successRegex: /Hot[eé]is em Caldas Novas|[UÚ]LTIMAS VAGAS|Nenhum hotel configurado/i,
      errorRegex: /nao foi possivel|erro ao carregar|nenhum hotel/i,
      loadingRegex: /Carregando Hot[eé]is/i,
      timeoutMs: 16000,
    });
  });

  test("busca completa de hoteis carrega sem spinner eterno", async ({ page }) => {
    await page.goto("/hoteis/busca/completa");
    await expect(page.getByRole("heading", { name: /Encontre o Lugar Perfeito/i })).toBeVisible({ timeout: 15000 });
  });

  test("cotacao carrega fluxo em passos", async ({ page }) => {
    await page.goto("/cotacao");
    await waitForTerminalState(page, {
      successRegex: /Passo \d de 5|Nenhum item disponivel/i,
      errorRegex: /Nao foi possivel carregar/i,
      loadingRegex: /Carregando op[cç][oõ]es/i,
      timeoutMs: 16000,
    });
  });

  test("perfil sem auth redireciona para login", async ({ page }) => {
    await page.goto("/perfil");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fperfil|\/login\?redirect=\/perfil/);
  });

  test("minhas reservas sem auth redireciona para login", async ({ page }) => {
    await page.goto("/minhas-reservas");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fminhas-reservas|\/login\?redirect=\/minhas-reservas/);
  });

  test("admin cms sem admin_token redireciona para admin login", async ({ page }) => {
    await page.goto("/admin/cms");
    await expect(page).toHaveURL(/\/admin\/login\?from=%2Fadmin%2Fcms|\/admin\/login\?from=\/admin\/cms/);
  });

  test("admin tickets sem admin_token redireciona para admin login", async ({ page }) => {
    await page.goto("/admin/tickets");
    await expect(page).toHaveURL(/\/admin\/login\?from=%2Fadmin%2Ftickets|\/admin\/login\?from=\/admin\/tickets/);
  });

  test("admin verification sem admin_token redireciona para admin login", async ({ page }) => {
    await page.goto("/admin/verification");
    await expect(page).toHaveURL(
      /\/admin\/login\?from=%2Fadmin%2Fverification|\/admin\/login\?from=\/admin\/verification/
    );
  });

  test("dashboard sem auth redireciona para login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard|\/login\?redirect=\/dashboard/);
  });

  test("dashboard hotels sem auth redireciona para login", async ({ page }) => {
    await page.goto("/dashboard/hotels");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard%2Fhotels|\/login\?redirect=\/dashboard\/hotels/);
  });

  test("dashboard rsv sem auth redireciona para login", async ({ page }) => {
    await page.goto("/dashboard-rsv");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard-rsv|\/login\?redirect=\/dashboard-rsv/);
  });

  test("pricing dashboard sem auth redireciona para login", async ({ page }) => {
    await page.goto("/pricing/dashboard");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fpricing%2Fdashboard|\/login\?redirect=\/pricing\/dashboard/);
  });

  test("termos responde com placeholder estruturado", async ({ page }) => {
    await page.goto("/termos");
    await expect(page.getByRole("heading", { name: /Termos de Uso/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: /Politica de Privacidade/i })).toBeVisible();
  });

  test("privacidade redireciona para politica-privacidade", async ({ page }) => {
    await page.goto("/privacidade");
    await expect(page).toHaveURL(/\/politica-privacidade/);
  });

  test("leiloes novo responde sem 404", async ({ page }) => {
    await page.goto("/leiloes/novo");
    await expect(page.getByRole("heading", { name: /Novo Leilao/i })).toBeVisible({ timeout: 15000 });
  });

  test("endpoint api docs JSON responde 200", async ({ request }) => {
    const response = await request.get("/api/docs");
    expect(response.ok()).toBeTruthy();
  });
});
