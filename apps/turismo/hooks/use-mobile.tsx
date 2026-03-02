// Hook para detectar dispositivo móvel conforme documentação (linha 130)
'use client';

import { useState, useEffect } from 'react';

/**
 * Hook customizado para detectar dispositivo móvel
 * Retorna true se a largura da tela for menor que 768px
 */
export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Função para verificar se é mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Verificar no mount
    checkMobile();

    // Adicionar listener para resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
}

