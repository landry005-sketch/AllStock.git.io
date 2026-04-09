/* eslint-disable @typescript-eslint/no-unused-expressions */
types/express.d.ts
import { UserPayload } from './auth'; // Si tu as un type pour ton token

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
        role: string;
        org_id: string; // Ton org_id pour le filtrage StockFlow
      };
    }
  }
}