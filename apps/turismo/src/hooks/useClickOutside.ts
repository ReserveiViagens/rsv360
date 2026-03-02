import { useEffect, RefObject } from 'react';

/**
 * Hook para detectar cliques fora de um elemento
 * @param ref - Ref do elemento para monitorar
 * @param handler - Função chamada quando clicar fora
 * @param enabled - Se o hook está habilitado
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      // Não faz nada se clicar no elemento ou em seus filhos
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    // Adiciona listeners para mouse e touch
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}
