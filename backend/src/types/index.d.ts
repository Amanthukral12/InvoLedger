import { CompanyDocument, CustomSession } from "./types";
import { Session } from "@prisma/client";
declare global {
  namespace Express {
    interface Request {
      company?: CompanyDocument;
      currentSession?: CustomSession & {
        company: CompanyDocument;
      };
    }
  }
}
