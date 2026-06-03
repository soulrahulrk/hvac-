import { auth } from "./auth"
import { NextResponse } from "next/server"
import type { Session } from "next-auth"

export async function getSession(): Promise<Session | null> {
  return await auth()
}

export async function requireAuth() {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  
  return session.user
}

export async function withAuth(handler: (req: Request, user: Session["user"]) => Promise<Response>) {
  return async (req: Request) => {
    try {
      const user = await requireAuth()
      return await handler(req, user)
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      console.error(error)
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
  }
}
