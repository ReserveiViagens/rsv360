'use client';

import { useMemo } from 'react';
import {
  calcularPassosColapsados,
  hidratarWizardState,
  lerEntradaContextual,
  montarEntradaContextual,
  passoInicialContextual,
  resolverOrigemEntrada,
  type EntradaContextual,
} from '@rsv360/shared';
import {
  initialWizardState,
  WIZARD_DRAFT_MAX_AGE_MS,
  WIZARD_STEP_STORAGE_KEY,
  WIZARD_STORAGE_KEY,
  type StoredWizardDraft,
  type WizardState,
} from '@/components/cotacao/wizard/wizard-types';
import { isValidWizardRange, sanitizeWizardDates } from '@/components/cotacao/wizard/wizard-date-utils';
import { inferProfile } from '@/components/cotacao/wizard/wizard-behavior';

export interface EntradaBootstrap {
  ctx: EntradaContextual;
  initialState: WizardState;
  initialStep: number;
  passosColapsados: number[];
  hotelTravado: boolean;
  restoredFromDraft: boolean;
  hadInvalidDates: boolean;
}

function loadDraftForEntrada(): { state: WizardState; step: number; hadInvalidDates: boolean } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(WIZARD_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredWizardDraft;
    if (Date.now() - parsed.savedAt > WIZARD_DRAFT_MAX_AGE_MS) {
      localStorage.removeItem(WIZARD_STORAGE_KEY);
      localStorage.removeItem(WIZARD_STEP_STORAGE_KEY);
      return null;
    }
    const stepRaw = localStorage.getItem(WIZARD_STEP_STORAGE_KEY);
    const step = stepRaw ? Math.min(7, Math.max(0, parseInt(stepRaw, 10))) : parsed.step;
    const rawState = { ...initialWizardState, ...parsed.state };
    const hadStoredDates = Boolean(rawState.checkIn || rawState.checkOut);
    const dates = sanitizeWizardDates(rawState.checkIn, rawState.checkOut);
    const state: WizardState = {
      ...initialWizardState,
      ...parsed.state,
      checkIn: dates.checkIn,
      checkOut: dates.checkOut,
      adults: Math.max(1, Number(parsed.state.adults) || 1),
      children: Math.max(0, Number(parsed.state.children) || 0),
    };
    state.profile = inferProfile(state.adults, state.children);
    const hadInvalidDates = hadStoredDates && !isValidWizardRange(state.checkIn, state.checkOut);
    return { state, step, hadInvalidDates };
  } catch {
    return null;
  }
}

export function useEntradaContextual(searchParams: URLSearchParams): EntradaBootstrap {
  const serialized = searchParams.toString();

  return useMemo(() => {
    const params = lerEntradaContextual(searchParams);
    const draft = loadDraftForEntrada();
    const origem = resolverOrigemEntrada(params, Boolean(draft));
    const ctx = montarEntradaContextual(params, origem);
    const { state, hotelTravado } = hidratarWizardState(initialWizardState, ctx, draft?.state);
    const passosColapsados = calcularPassosColapsados(ctx, state, hotelTravado);
    const initialStep =
      origem === 'rascunho' && draft ? draft.step : passoInicialContextual(passosColapsados);

    return {
      ctx,
      initialState: state,
      initialStep,
      passosColapsados,
      hotelTravado,
      restoredFromDraft: origem === 'rascunho' && Boolean(draft),
      hadInvalidDates: draft?.hadInvalidDates ?? false,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- searchParams identity changes; string is stable
  }, [serialized]);
}
