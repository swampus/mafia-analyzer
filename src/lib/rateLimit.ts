import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

export async function rateLimit(key: string, limit = 30, windowSec = 60) {

  const now = Math.floor(Date.now()/1000)
  const bucket = `${key}:${Math.floor(now/windowSec)}`

  const count = await redis.incr(bucket)

  if(count === 1){
    await redis.expire(bucket, windowSec)
  }

  if(count > limit){
    return false
  }

  return true
}