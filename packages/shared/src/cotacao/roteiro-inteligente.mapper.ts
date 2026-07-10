import { montarRoteiroCompleto } from './montar-roteiro-dia.js';
import { behaviorTagNarrativo } from './roteiro-narrativa.js';
import type {
  MontarRoteiroCompletoInput,
  RoteiroAtracao,
  RoteiroCompleto,
  TurnoRoteiro,
} from './roteiro-atracao.types.js';

export type RoteiroMood = 'relaxamento' | 'diversao' | 'natureza' | 'gastronomia';

export interface EstadiaRoteiroInteligenteInput {
  checkIn: string;
  checkOut: string;
  perfil?: 'casal' | 'familia';
  amenidadesHotel?: string[];
  catalogoAtracoes: RoteiroAtracao[];
  /** Quando true, prioriza parque dia_inteiro no catálogo (família + ingresso parque). */
  incluirParqueAquatico?: boolean;
}

export interface RoteiroAtividadeInteligente {
  id: string;
  day: number;
  dataIso: string;
  turno: TurnoRoteiro;
  atracaoSlug: string | null;
  title: string;
  description: string;
  image?: string;
  actionLabel?: string;
  type?: string;
  mood?: RoteiroMood;
  behaviorTag?: string;
}

function moodForTipo(tipo: string): RoteiroMood {
  if (tipo === 'parque' || tipo === 'ticket') return 'diversao';
  if (tipo === 'passeio' || tipo === 'monumento') return 'natureza';
  if (tipo === 'restaurante' || tipo === 'feira') return 'gastronomia';
  return 'relaxamento';
}

function actionLabelForTipo(tipo: string): string {
  if (tipo === 'parque') return 'Explorar parque';
  if (tipo === 'restaurante' || tipo === 'feira') return 'Ver gastronomia';
  if (tipo === 'shopping') return 'Ver shopping';
  if (tipo === 'relax_hotel') return 'Relaxar no hotel';
  return 'Ver detalhes';
}

function ordenarCatalogoParque(
  catalogo: RoteiroAtracao[],
  incluirParque: boolean,
): RoteiroAtracao[] {
  if (!incluirParque) return catalogo;
  const parque = catalogo.find((a) => a.slug === 'parque-aquatico-dia-inteiro');
  if (!parque) return catalogo;
  return [parque, ...catalogo.filter((a) => a.slug !== parque.slug)];
}

export function montarRoteiroInteligente(
  input: EstadiaRoteiroInteligenteInput,
): RoteiroCompleto {
  const catalogo = ordenarCatalogoParque(
    input.catalogoAtracoes,
    input.incluirParqueAquatico === true,
  );
  const motorInput: MontarRoteiroCompletoInput = {
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    perfil: input.perfil ?? 'casal',
    amenidadesHotel: input.amenidadesHotel,
    catalogoAtracoes: catalogo,
  };
  return montarRoteiroCompleto(motorInput);
}

export function mapRoteiroParaAtividades(
  roteiro: RoteiroCompleto,
  atracoes: RoteiroAtracao[],
  perfil: 'casal' | 'familia' = 'casal',
): RoteiroAtividadeInteligente[] {
  const bySlug = new Map(atracoes.map((a) => [a.slug, a]));
  const items: RoteiroAtividadeInteligente[] = [];

  for (const dia of roteiro.dias) {
    for (const slot of dia.slots) {
      const atracao = slot.atracaoSlug ? bySlug.get(slot.atracaoSlug) : undefined;
      const tipo = slot.tipo ?? atracao?.tipo ?? 'free';
      items.push({
        id: `${dia.dia}-${slot.turno}-${slot.atracaoSlug ?? 'livre'}`,
        day: dia.dia,
        dataIso: dia.dataIso,
        turno: slot.turno,
        atracaoSlug: slot.atracaoSlug,
        title: slot.titulo,
        description: slot.descricao ?? atracao?.descricao ?? 'Sugestão do roteiro',
        image: atracao?.imagem_url ?? undefined,
        actionLabel: actionLabelForTipo(String(tipo)),
        type: String(tipo),
        mood: moodForTipo(String(tipo)),
        behaviorTag: behaviorTagNarrativo(
          { ...slot, tipo: String(tipo) },
          atracao,
          perfil,
        ),
      });
    }
  }
  return items;
}

export interface DailyScheduleInteligenteItem {
  id: string;
  day: number;
  dataIso: string;
  turno: TurnoRoteiro;
  atracaoSlug: string | null;
  title: string;
  description: string;
  image?: string;
  actionLabel?: string;
  type?: string;
  mood?: RoteiroMood;
  behaviorTag?: string;
}

export function mapRoteiroParaDailySchedule(
  roteiro: RoteiroCompleto,
  atracoes: RoteiroAtracao[],
  perfil: 'casal' | 'familia' = 'casal',
): DailyScheduleInteligenteItem[] {
  return mapRoteiroParaAtividades(roteiro, atracoes, perfil).map((a) => ({
    id: a.id,
    day: a.day,
    dataIso: a.dataIso,
    turno: a.turno,
    atracaoSlug: a.atracaoSlug,
    title: a.title,
    description: a.description,
    image: a.image,
    actionLabel: a.actionLabel,
    type: a.type,
    mood: a.mood,
    behaviorTag: a.behaviorTag,
  }));
}
