/** Políticas puras do SmartVideo — testáveis sem DOM. */

export interface NetworkInformationLike {
  saveData?: boolean;
  downlink?: number;
}

export function deriveWebmFromMp4(url: string): string | undefined {
  if (!url || !/\.mp4(\?|#|$)/i.test(url)) return undefined;
  return url.replace(/\.mp4(\?|#|$)/i, '.webm$1');
}

export function shouldPreferPosterOnly(
  connection: NetworkInformationLike | null | undefined,
  prefersReducedMotion: boolean,
): boolean {
  if (prefersReducedMotion) return true;
  if (connection?.saveData) return true;
  const downlink = connection?.downlink;
  if (typeof downlink === 'number' && downlink > 0 && downlink < 1.5) return true;
  return false;
}

export function buildVideoSourceOrder(srcWebm?: string, srcMp4?: string): Array<{ src: string; type: string }> {
  const sources: Array<{ src: string; type: string }> = [];
  if (srcWebm) sources.push({ src: srcWebm, type: 'video/webm' });
  if (srcMp4) sources.push({ src: srcMp4, type: 'video/mp4' });
  return sources;
}

export function isLcpVideoElement(element: Element | null | undefined): boolean {
  return element?.tagName?.toLowerCase() === 'video';
}
