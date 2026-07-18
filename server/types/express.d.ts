export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        /** Finite numeric id — auth.middleware rejects !Number.isFinite after Number(payload.userId). */
        id?: number;
        email?: string;
        name?: string;
        role?: string;
        /** Runtime uses string enterprise ids (e.g. 'ent_1'); do not narrow to number. */
        enterpriseId?: string | number;
      };
      propertyId?: number;
    }
  }
}
