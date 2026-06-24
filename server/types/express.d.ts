export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id?: string | number;
        email?: string;
        name?: string;
        role?: string;
        enterpriseId?: string | number;
      };
      propertyId?: number;
    }
  }
}
