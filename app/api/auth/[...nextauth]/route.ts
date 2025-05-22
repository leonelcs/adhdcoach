import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Use the correct type for auth options
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  debug: true, // Enable debug mode to see more information
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, user }) {
      // Attach user.id to session
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Ensure user exists in DB with UUID
      if (user.email) {
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              id: uuidv4(),
              email: user.email,
              name: user.name,
              avatarUrl: user.image,
            },
          });
        }
      }
      return true;
    },
  },
};

// Create the handler correctly for App Router
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

