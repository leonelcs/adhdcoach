import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

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
};

// Create the handler correctly for App Router
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

