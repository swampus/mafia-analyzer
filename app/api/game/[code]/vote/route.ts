import { NextResponse } from "next/server"
import { loadGame, saveGame } from "@/src/lib/gameStore"
import { requireAdmin } from "@/src/lib/admin"
import { rateLimit } from "@/src/lib/rateLimit"

export async function POST(
  req: Request,
  { params }: { params: { code: string } }
) {
  const code = params.code
  const ip = req.headers.get("x-forwarded-for") ?? "local"

  // 🔒 anti-spam votes
  if(!rateLimit("vote:"+code+":"+ip,100,60000)){
    return NextResponse.json({error:"Too many votes"}, {status:429})
  }

  const game: any = await loadGame(code)

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 })
  }

  if (game.endedAt) {
    return NextResponse.json({ error: "Game ended (read-only)" }, { status: 400 })
  }

  const unauthorized = requireAdmin(req, game)
  if (unauthorized) return unauthorized

  const body = await req.json().catch(() => ({}))
  const voterId = body.voterId
  const targetIds = body.targetIds

  if (!voterId || !Array.isArray(targetIds)) {
    return NextResponse.json(
      { error: "voterId + targetIds[] required" },
      { status: 400 }
    )
  }

  game.votes ??= []

  game.votes = game.votes.filter(
    (v: any) => !(v.voterId === voterId && v.round === game.round)
  )

  game.votes.push({
    voterId,
    targetIds,
    round: game.round
  })

  await saveGame(code, game)
  return NextResponse.json({ ok: true })
}