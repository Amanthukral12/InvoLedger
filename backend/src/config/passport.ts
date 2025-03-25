import { PrismaClient } from "@prisma/client";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import dotenv from "dotenv";
import passport from "passport";
import {
  GoogleStrategyOptionsWithRequest,
  VerifyCallbackDocument,
} from "../types/types";
import { v4 as uuidv4 } from "uuid";
dotenv.config();
const prisma = new PrismaClient();

passport.serializeUser((session: any, done) => {
  done(null, {
    company: session.company,
    sessionId: session.sessionId,
  });
});

passport.deserializeUser(async (serializedSession: any, done) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: serializedSession.company.id },
    });
    done(null, { company, sessionId: serializedSession.sessionId });
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    } as GoogleStrategyOptionsWithRequest,
    async (
      req: any,
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done
    ): Promise<void> => {
      try {
        let company = await prisma.company.findUnique({
          where: { googleId: profile.id },
        });
        if (!company) {
          company = await prisma.company.create({
            data: {
              googleId: profile.id,
              email: profile.emails?.[0].value!,
              name: profile.displayName,
              avatar: profile.photos?.[0].value,
            },
          });
        }
        const sessionId = uuidv4();
        const verifyCallbackDoc: VerifyCallbackDocument = {
          company,
          sessionId,
        };
        done(null, verifyCallbackDoc);
      } catch (error) {
        done(error, undefined, undefined);
      }
    }
  )
);
export default passport;
