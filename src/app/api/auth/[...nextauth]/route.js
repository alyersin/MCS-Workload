import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { adminAuth } from "@/utils/firebaseAdmin";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials during authorize");
          return null;
        }

        const response = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              returnSecureToken: true,
            }),
          }
        );

        const data = await response.json();

        if (data.error) {
          console.error("Firebase Auth Error:", data.error);
          return null;
        }

        const userRecord = await adminAuth.getUserByEmail(credentials.email);

        return {
          id: userRecord.uid,
          uid: userRecord.uid,
          email: userRecord.email,
          name: userRecord.displayName || userRecord.email,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.uid || user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        uid: token.uid || token.sub || null,
      };
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
