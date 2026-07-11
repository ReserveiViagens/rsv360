import { z } from 'zod';

const catalogItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string(),
  price: z.number(),
  images: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
  location: z.string().optional(),
});

/**
 * Retrocompat: campos novos opcionais com defaults fail-safe.
 * `upgradeVarandaValor` do client é sempre descartado (preço só server-side).
 */
export const gerarPropostaBodySchema = z.preprocess(
  (body) => {
    if (!body || typeof body !== 'object' || Array.isArray(body)) return body;
    const raw = { ...(body as Record<string, unknown>) };
    delete raw.upgradeVarandaValor;
    return raw;
  },
  z
    .object({
      checkIn: z.string(),
      checkOut: z.string(),
      adults: z.coerce.number().int().min(0).default(2),
      children: z.coerce.number().int().min(0).default(0),
      hotelId: z.union([z.string(), z.number(), z.null()]).optional(),
      ticketIds: z.array(z.union([z.string(), z.number()])).optional(),
      attractionIds: z.array(z.union([z.string(), z.number()])).optional(),
      breakfastId: z.string().nullable().optional(),
      accommodationMode: z.string().optional(),
      accommodationKitId: z.string().nullable().optional(),
      accommodationItemIds: z.array(z.string()).optional(),
      name: z.string(),
      email: z.string().optional(),
      phone: z.string(),
      notes: z.string().optional(),
      paymentMethod: z.string().optional(),
      profile: z.string().optional(),
      total: z.coerce.number().optional(),
      travelInsurance: z.boolean().optional().default(false),
      hotelOnlyFlow: z.boolean().optional().default(false),
      selectedAcomodacaoId: z.union([z.number(), z.string(), z.null()]).optional(),
      wizardAddonIds: z.array(z.number()).optional(),
      /** Intenção do client — valor resolvido server-side. */
      upgradeVaranda: z.boolean().optional().default(false),
      /** Legado: mapeado 1:1 para upgradeVaranda (política PR+1), nunca somado. */
      suiteUpgrade: z.boolean().optional().default(false),
      arquetipoId: z.string().max(128).optional(),
      codigoExterno: z.string().max(128).optional(),
      catalog: z
        .object({
          hotels: z.array(catalogItemSchema).optional(),
          tickets: z.array(catalogItemSchema).optional(),
          attractions: z.array(catalogItemSchema).optional(),
        })
        .optional(),
      turnstileToken: z.string().optional(),
    })
    .passthrough(),
);

export type GerarPropostaBodyParsed = z.infer<typeof gerarPropostaBodySchema>;

export function parseGerarPropostaBody(body: unknown): GerarPropostaBodyParsed {
  return gerarPropostaBodySchema.parse(body);
}
