import { redis } from "@/src/lib/redis"
import { nanoid } from "nanoid"
import { NextResponse } from "next/server"
import { saveGame } from "@/src/lib/gameStore"
import { rateLimit } from "@/src/lib/rateLimit"

function gameCode() {
  return Math.floor(100000 + Math.random()*900000).toString()
}

export async function GET() {
  return NextResponse.json({ ok: "GET works" })
}

export async function POST() {

  const code = gameCode()
  const adminCode = nanoid(8)

  if(!rateLimit("join:"+code,50,60000)){
      return NextResponse.json({error:"Too many joins"}, {status:429})
  }

    const game = {
      id: code,
      adminCode,
      players: [],
      votes: [],
      phase: "day",
      round: 0,
      status: "active",
      endedAt: null,
      mode: "classic",
      createdAt: Date.now()
    }

  await saveGame(code, game)

  return NextResponse.json({ code, adminCode })
}