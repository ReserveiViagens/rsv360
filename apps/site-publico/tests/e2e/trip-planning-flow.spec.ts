/**
 * ✅ TESTES E2E: FLUXO COMPLETO DE PLANEJAMENTO DE VIAGEM
 */

import { test, expect } from '@playwright/test';

test.describe('Trip Planning Flow E2E', () => {
  test('deve criar plano de viagem completo', async ({ page }) => {
    await page.goto('http://localhost:3000/group-travel/trip-planning');

    // Preencher detalhes
    await page.fill('input[placeholder*="Nome da Viagem"]', 'Viagem E2E Test');
    await page.fill('input[placeholder*="Destino"]', 'Caldas Novas, GO');
    await page.fill('input[type="date"]', '2025-12-20');
    
    // Salvar
    await page.click('text=Salvar Plano');

    // Verificar se foi salvo
    await expect(page.locator('text=Plano de viagem salvo')).toBeVisible({ timeout: 5000 });
  });

  test('deve dividir orçamento', async ({ page }) => {
    await page.goto('http://localhost:3000/group-travel/trip-planning');

    // Ir para aba de orçamento
    await page.click('text=Orçamento');
    
    // Preencher orçamento
    await page.fill('input[type="number"]', '1000');
    
    // Verificar se calculadora aparece
    await expect(page.locator('text=Calculadora de Divisão')).toBeVisible();
  });
});

