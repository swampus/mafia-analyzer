import { NextResponse } from "next/server"
import { loadGame } from "@/src/lib/gameStore"
import { rateLimit } from "@/src/lib/rateLimit"

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {

  const code = params.code

  const ip = req.headers.get("x-forwarded-for") ?? "local"

     if(!rateLimit("create:"+ip,10,60000)){
       return NextResponse.json({error:"Too many games"}, {status:429})
     }

  const game = await loadGame(params.code)

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 })
  }

  return NextResponse.json(game)
}