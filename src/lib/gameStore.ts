import { redis } from "@/src/lib/redis"
import { rateLimit } from "@/src/lib/rateLimit"

export const GAME_TTL_SECONDS = 60 * 60 * 48 // 48h


function getIP(ip?:string){
  return ip ?? "global"
}


export async function loadGame(code: string, ip?:string){

  const client = getIP(ip)

  if(!(await rateLimit("load:"+code+":"+client,150,60))){
    const err:any = new Error("RATE_LIMIT")
    err.code="RATE_LIMIT"
    throw err
  }

  const data = await redis.get(`game:${code}`)

  if(!data) return null

  if(typeof data === "string"){
    return JSON.parse(data)
  }

  return data
}


export async function saveGame(code: string, game: any, ip?:string){

  const client = getIP(ip)

  if(!(await rateLimit("save:"+code+":"+client,200,60))){
    const err:any = new Error("RATE_LIMIT")
    err.code="RATE_LIMIT"
    throw err
  }

  await redis.set(`game:${code}`, JSON.stringify(game), { ex: GAME_TTL_SECONDS })
}