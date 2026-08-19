import type { UserRole } from "../../generated/prisma/client.js";

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
