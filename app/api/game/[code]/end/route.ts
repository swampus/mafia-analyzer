import { NextResponse } from "next/server"
import { loadGame } from "@/src/lib/gameStore"
import { requireAdmin } from "@/src/lib/admin"
import { redis } from "@/src/lib/redis"
import { rateLimit } from "@/src/lib/rateLimit"

const ARCHIVE_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

export async function POST(
  req: Request,
  { params }: { params: { code: string } }
) {

  if(!(await rateLimit("end:"+params.code,20,60))){
    return NextResponse.json({error:"Too many requests"}, {status:429})
  }

  const game:any = await loadGame(params.code)

  if (!game){
    return NextResponse.json({ error: "Game not found" }, { status: 404 })
  }

  const unauthorized = requireAdmin(req, game)
  if (unauthorized) return unauthorized

  if (game.endedAt){
    return NextResponse.json({ ok: true }) // idempotent end
  }

  game.endedAt = Date.now()
  game.status = "ended"

  game.events ??= []
  game.events.push({ t: game.endedAt, type: "GAME_ENDED" })

  await redis.set(`game:${params.code}`, game, { ex: ARCHIVE_TTL_SECONDS })

  return NextResponse.json({ ok: true })
}