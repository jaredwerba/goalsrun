import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { sendMagicLinkEmail } from "@/lib/email";

const isProd = process.env.NODE_ENV === "production";
const prodHost = process.env.NEXT_PUBLIC_SITE_HOST || "goalslopes.run";
const prodOrigin = `https://${prodHost}`;
const prodOriginWWW = `https://www.${prodHost}`;
// Both apex and www resolve to the same Vercel deployment, so anyone landing
// on www would otherwise fail better-auth's CSRF origin check AND WebAuthn's
// expectedOrigin. Accept both. rpID stays on the apex — WebAuthn treats www
// as a same-RP subdomain so passkeys registered either place work on both.
const prodOrigins = [prodOrigin, prodOriginWWW];

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      passkey: schema.passkey,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: isProd ? prodOrigin : "http://localhost:3000",
  trustedOrigins: isProd ? [prodOriginWWW] : [],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
  },
  plugins: [
    passkey({
      rpName: "Goals Lopes",
      rpID: isProd ? prodHost : "localhost",
      origin: isProd ? prodOrigins : "http://localhost:3000",
    }),
    magicLink({
      // The booking gate is passkey-only. Magic link exists strictly as
      // recovery for someone whose passkey died — the account must exist.
      disableSignUp: true,
      expiresIn: 60 * 10, // 10 minutes
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail(email, url);
      },
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
