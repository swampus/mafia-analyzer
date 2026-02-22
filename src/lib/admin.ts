import { NextResponse } from "next/server"

export function requireAdmin(req: any, game: any) {

  const admin =
    req?.headers?.get?.("x-admin-code") ||
    req?.headers?.["x-admin-code"]

  if (!admin || admin !== game.adminCode) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return null
}