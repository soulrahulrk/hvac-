import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (!parsedCredentials.success) {
          return null
        }

        const { email, password } = parsedCredentials.data

        const user = await prisma.user.findUnique({
          where: { email },
          include: { org: true }
        })

        if (!user) {
          return null
        }

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash)
        
        if (!passwordsMatch) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          orgId: user.orgId,
          orgName: user.org.name,
        }
      }
    })
  ],
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
})
