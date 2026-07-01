import type { AvailabilityItem, WizardProfile, WizardState } from './wizard-types';

export function inferProfile(adults: number, children: number): WizardProfile {
  if (children >= 2) return 'familia';
  if (children === 1) return 'familia';
  if (adults === 2 && children === 0) return 'casal';
  if (adults >= 3) return 'familia';
  return 'aventura';
}

function profileScore(item: AvailabilityItem, profile: WizardProfile): number {
  const tags = (item.metadata?.behaviorTags as string[] | undefined) ?? [];
  if (tags.includes(profile)) return 10;
  if (profile === 'familia' && tags.includes('familia')) return 10;
  if (profile === 'casal' && (tags.includes('casal') || item.metadata?.premiumLabel)) return 8;
  return 0;
}

export function sortByProfile<T extends { behaviorTags?: string[]; id: string }>(
  items: T[],
  profile: WizardProfile,
): T[] {
  return [...items].sort((a, b) => {
    const scoreA = a.behaviorTags?.includes(profile) ? 1 : 0;
    const scoreB = b.behaviorTags?.includes(profile) ? 1 : 0;
    return scoreB - scoreA;
  });
}

export function sortCatalogItems(items: AvailabilityItem[], profile: WizardProfile): AvailabilityItem[] {
  return [...items].sort((a, b) => profileScore(b, profile) - profileScore(a, profile));
}

export function getBehaviorBadge(item: AvailabilityItem, profile: WizardProfile): string | undefined {
  const tags = (item.metadata?.behaviorTags as string[] | undefined) ?? [];
  if (tags.includes(profile)) {
    if (profile === 'familia') return 'Ideal para famílias';
    if (profile === 'casal') return 'Perfeito para casais';
    return 'Aventura';
  }
  const premium = item.metadata?.premiumLabel as string | undefined;
  if (premium && profile === 'casal') return premium;
  return undefined;
}

export function updateProfileFromGuests(state: WizardState): WizardProfile {
  return inferProfile(state.adults, state.children);
}
