import { NextAuthConfig } from "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    orgId?: string
    orgName?: string
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: string
      orgId: string
      orgName: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    orgId?: string
    orgName?: string
  }
}
