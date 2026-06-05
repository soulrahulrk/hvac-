import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.orgId = user.orgId
        token.orgName = user.orgName
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
        session.user.orgId = token.orgId as string
        session.user.orgName = token.orgName as string
      }
      return session
    }
  },
  providers: [], // Providers must be empty here to run on Vercel Edge
} satisfies NextAuthConfig
