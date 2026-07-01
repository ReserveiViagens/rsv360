'use client';

import { useEffect, useRef } from 'react';
import { trackCotacaoEvent, WIZARD_STEP_NAMES } from '@/lib/cotacao-analytics';
import { useWizard } from '@/components/cotacao/wizard/WizardContext';
import type { EntradaContextual } from '@rsv360/shared';

const LEAD_ABANDONO_KEY = 'rsv360-lead-abandono-sent';
const SESSAO_KEY = 'rsv360-cotacao-sessao-id';

function getOrCreateSessaoId(): string {
  try {
    const existing = sessionStorage.getItem(SESSAO_KEY);
    if (existing) return existing;
    const id = `cs-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(SESSAO_KEY, id);
    return id;
  } catch {
    return `cs-${Date.now()}`;
  }
}

function lgpdConsentAccepted(): boolean {
  try {
    return localStorage.getItem('reservei-lgpd-consent') === 'accepted';
  } catch {
    return false;
  }
}

export function useCotacaoLeadAbandono(entrada: EntradaContextual) {
  const { currentStep, state, runningTotal } = useWizard();
  const stateRef = useRef({ currentStep, state, runningTotal, entrada });
  stateRef.current = { currentStep, state, runningTotal, entrada };

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'hidden') return;

      const { currentStep: step, state: st, runningTotal: total, entrada: ctx } = stateRef.current;
      if (step >= 7) return;

      try {
        if (sessionStorage.getItem(LEAD_ABANDONO_KEY)) return;
      } catch {
        /* ignore */
      }

      const consentimentoLgpd = lgpdConsentAccepted();
      const whatsapp = st.phone?.trim() || null;
      const payload = {
        passo: step,
        passoNome: WIZARD_STEP_NAMES[step],
        whatsapp,
        nome: st.name?.trim() || null,
        hotelId: st.hotelId != null ? String(st.hotelId) : null,
        checkin: st.checkIn || null,
        checkout: st.checkOut || null,
        adults: st.adults,
        children: st.children,
        ref: st.ref ?? ctx.ref ?? null,
        canal: st.canal ?? ctx.canal ?? null,
        consentimentoLgpd,
        sessaoId: getOrCreateSessaoId(),
        variant: ctx.variant,
        payload: {
          profile: st.profile,
          runningTotal: total,
          hotelOnlyFlow: st.hotelOnlyFlow,
          origem: ctx.origem,
        },
      };

      try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon('/api/cotacao/lead-abandono', blob);
        sessionStorage.setItem(LEAD_ABANDONO_KEY, '1');
      } catch {
        /* ignore beacon errors */
      }

      trackCotacaoEvent('cotacao_lead_abandono', {
        step,
        stepName: WIZARD_STEP_NAMES[step],
        profile: st.profile,
        runningTotal: total,
        variant: ctx.variant,
        source: ctx.origem,
        ref: st.ref ?? ctx.ref ?? undefined,
        canal: st.canal ?? ctx.canal ?? undefined,
        consentimentoLgpd,
        enviadoWhatsapp: Boolean(whatsapp && consentimentoLgpd),
      });
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);
}
