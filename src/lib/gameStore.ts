import { redis } from "@/src/lib/redis"
import { rateLimit } from "@/src/lib/rateLimit"

export const GAME_TTL_SECONDS = 60 * 60 * 48 // 48h


function getIP(ip?:string){
  return ip ?? "global"
}


export async function loadGame(code: string, ip?:string){

  const client = getIP(ip)

  if(!rateLimit("load:"+code+":"+client,150,60000)){
    const err:any = new Error("RATE_LIMIT")
    err.code="RATE_LIMIT"
    throw err
  }

  return await redis.get<any>(`game:${code}`)
}


export async function saveGame(code: string, game: any, ip?:string){

  const client = getIP(ip)

  if(!rateLimit("save:"+code+":"+client,200,60000)){
    const err:any = new Error("RATE_LIMIT")
    err.code="RATE_LIMIT"
    throw err
  }

  await redis.set(`game:${code}`, game, { ex: GAME_TTL_SECONDS })
}