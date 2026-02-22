import { nanoid } from "nanoid"
import { NextResponse } from "next/server"
import { saveGame } from "@/src/lib/gameStore"
import { rateLimit } from "@/src/lib/rateLimit"

function gameCode(){
  return Math.floor(100000 + Math.random()*900000).toString()
}

export async function GET(){
  return NextResponse.json({ ok:true })
}

export async function POST(req:Request){

  // ✅ get IP
    const ip =
     req.headers.get("x-real-ip")
     ?? req.headers.get("x-forwarded-for")?.split(",")[0]
     ?? "unknown"

  // ✅ RATE LIMIT (anti bot)
  if(!(await rateLimit("create:"+ip,10,600))){
    return NextResponse.json(
      {error:"Too many games created"},
      {status:429}
    )
  }

  const code = gameCode()
  const adminCode = nanoid(8)

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

  await saveGame(code,game)

  return NextResponse.json({code,adminCode})
}