import { NextResponse } from "next/server"
import { loadGame } from "@/src/lib/gameStore"
import { rateLimit } from "@/src/lib/rateLimit"

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {

  const code = params.code

  if(!rateLimit("join:"+code,50,60000)){
      return NextResponse.json({error:"Too many joins"}, {status:429})
  }

  const game = await loadGame(params.code)

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 })
  }

  return NextResponse.json(game)
}