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
  const game: any = await loadGame(params.code)

  if(!rateLimit("join:"+params.code,50,60000)){
      return NextResponse.json({error:"Too many joins"}, {status:429})
  }

  if (game.endedAt) {
    return NextResponse.json({ error: "Game ended (read-only)" }, { status: 400 })
  }
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 })

  const unauthorized = requireAdmin(req, game)
  if (unauthorized) return unauthorized

  game.endedAt = Date.now()
  game.status = "ended"

  game.events ??= []
  game.events.push({ t: game.endedAt, type: "GAME_ENDED" })

  await redis.set(`game:${params.code}`, game, { ex: ARCHIVE_TTL_SECONDS })

  return NextResponse.json({ ok: true })
}