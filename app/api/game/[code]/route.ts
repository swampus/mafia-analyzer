import { NextResponse } from "next/server"
import { loadGame } from "@/src/lib/gameStore"
import { rateLimit } from "@/src/lib/rateLimit"
import { buildPublicVotes, buildPublicVoteGraph } from "@/src/lib/publicVotes"

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {

  const ip =
    req.headers.get("x-real-ip")
    ?? req.headers.get("x-forwarded-for")?.split(",")[0]
    ?? "unknown"

  if(!(await rateLimit("view:"+params.code+":"+ip,120,60))){
    return NextResponse.json({error:"Too many requests"},{status:429})
  }

  const game = await loadGame(params.code)

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 })
  }

  const publicVotes = buildPublicVotes(game)
  const publicGraph = buildPublicVoteGraph(game)

    const safePlayers = (game.players ?? []).map((p:any) => ({
      id: p.id,
      name: p.name,
      seat: p.seat,
      alive: p.alive,
      note: p.note,
      roleRevealed: p.roleRevealed
    }))

    return NextResponse.json({
      ...game,
      players: safePlayers,
      publicVotes,
      publicGraph
    })
}