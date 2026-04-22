import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { passkey } from "@better-auth/passkey";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

const isProd = process.env.NODE_ENV === "production";
const prodHost = process.env.NEXT_PUBLIC_SITE_HOST || "goalslopes.run";
const prodOrigin = `https://${prodHost}`;

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
      origin: isProd ? prodOrigin : "http://localhost:3000",
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
