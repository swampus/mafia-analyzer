import { redis } from "@/src/lib/redis"

export const GAME_TTL_SECONDS = 60 * 60 * 48 // dev: 48h

export async function loadGame(code: string) {
  return await redis.get<any>(`game:${code}`)
}

export async function saveGame(code: string, game: any) {
  await redis.set(`game:${code}`, game, { ex: GAME_TTL_SECONDS })
}