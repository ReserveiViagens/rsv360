// Sistema de inicialização de templates conforme documentação (linha 729-745)
// Função initializeDefaultTemplates() com sistema de versionamento (v1.0.0)
// Carregamento de templates e atualização automática

import { BudgetTemplate } from './types/budget';
import { templateStorage } from './template-storage';
import { 
  getAllCaldasNovasHotelTemplates, 
  caldasNovasHotelsTemplates 
} from './caldas-novas-hotels';
import { 
  getAllCaldasNovasParkTemplates, 
  caldasNovasParksTemplates 
} from './caldas-novas-parques';
import { 
  getAllCaldasNovasAttractionTemplates, 
  caldasNovasAttractionsTemplates 
} from './caldas-novas-atracoes';
import { 
  getAllCaldasNovasTourTemplates, 
  caldasNovasToursTemplates 
} from './caldas-novas-passeios';

/**
 * Versão dos templates conforme documento
 */
const TEMPLATE_VERSION = "1.0.0";

/**
 * Função de inicialização de templates padrão conforme documento (linha 729-745)
 * 
 * Fluxo:
 * 1. Verificar versão no localStorage
 * 2. Se versão diferente ou não existir, carregar templates
 * 3. Combinar todos os templates:
 *    - caldasNovasHotels (90)
 *    - caldasNovasParques (52)
 *    - caldasNovasAtracoes (9)
 *    - caldasNovasPasseios (6)
 * 4. Salvar no localStorage via templateStorage
 * 5. Salvar versão atual
 */
export function initializeDefaultTemplates(): void {
  if (typeof window === 'undefined') {
    return; // Executar apenas no cliente
  }

  try {
    // Verificar versão atual
    const currentVersion = templateStorage.getVersion();
    const existingTemplates = templateStorage.getAll();
    
    // Se a versão é a mesma e já existem templates, não fazer nada
    if (currentVersion === TEMPLATE_VERSION && existingTemplates.length > 0) {
      console.log(`Templates já inicializados com versão ${TEMPLATE_VERSION}`);
      return;
    }
    
    console.log(`Inicializando templates versão ${TEMPLATE_VERSION}...`);
    
    // Combinar todos os templates conforme documento
    const allTemplates: BudgetTemplate[] = [];
    
    // 1. Hotéis (90 templates - conforme documento)
    console.log('Carregando templates de hotéis...');
    const hotelTemplates = getAllCaldasNovasHotelTemplates();
    allTemplates.push(...hotelTemplates);
    console.log(`✓ ${hotelTemplates.length} templates de hotéis carregados`);
    
    // 2. Parques (52 templates - conforme documento)
    console.log('Carregando templates de parques...');
    const parkTemplates = getAllCaldasNovasParkTemplates();
    allTemplates.push(...parkTemplates);
    console.log(`✓ ${parkTemplates.length} templates de parques carregados`);
    
    // 3. Atrações (9 templates - conforme documento)
    console.log('Carregando templates de atrações...');
    const attractionTemplates = getAllCaldasNovasAttractionTemplates();
    allTemplates.push(...attractionTemplates);
    console.log(`✓ ${attractionTemplates.length} templates de atrações carregados`);
    
    // 4. Passeios (6 templates - conforme documento)
    console.log('Carregando templates de passeios...');
    const tourTemplates = getAllCaldasNovasTourTemplates();
    allTemplates.push(...tourTemplates);
    console.log(`✓ ${tourTemplates.length} templates de passeios carregados`);
    
    // Salvar todos os templates no localStorage via templateStorage
    console.log('Salvando templates no localStorage...');
    for (const template of allTemplates) {
      templateStorage.save(template);
    }
    
    // Atualizar versão
    templateStorage.initializeDefaults();
    
    console.log(`✅ Templates inicializados com sucesso! Total: ${allTemplates.length} templates`);
    console.log(`   - Hotéis: ${hotelTemplates.length}`);
    console.log(`   - Parques: ${parkTemplates.length}`);
    console.log(`   - Atrações: ${attractionTemplates.length}`);
    console.log(`   - Passeios: ${tourTemplates.length}`);
    
  } catch (error) {
    console.error('Erro ao inicializar templates padrão:', error);
    throw error;
  }
}

/**
 * Força a atualização dos templates (útil quando há mudanças)
 */
export function forceUpdateTemplates(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  console.log('Forçando atualização de templates...');
  
  // Limpar templates existentes
  templateStorage.clearAll();
  
  // Reinicializar
  initializeDefaultTemplates();
}

/**
 * Verifica se os templates precisam ser atualizados
 */
export function needsTemplateUpdate(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const currentVersion = templateStorage.getVersion();
  return currentVersion !== TEMPLATE_VERSION;
}

/**
 * Exporta a versão dos templates
 */
export { TEMPLATE_VERSION };

