import { NextResponse } from "next/server"
import { loadGame, saveGame } from "@/src/lib/gameStore"
import { requireAdmin } from "@/src/lib/admin"

export async function POST(req: Request, { params }: any) {

  const game = await loadGame(params.code)
  if (!game) return NextResponse.json({ error:"Game not found" },{ status:404 })

  const auth = requireAdmin(req, game)
  if (auth) return auth

  if(!(await rateLimit("join:"+code,50,60))){
    return NextResponse.json({error:"Too many joins"}, {status:429})
  }

  const { playerId, note } = await req.json()

  const p = game.players.find((x:any)=>x.id===playerId)
  if (!p) return NextResponse.json({ error:"Player not found" },{ status:404 })

  p.note = note ?? ""

  await saveGame(params.code, game)

  return NextResponse.json({ ok:true })
}