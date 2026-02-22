import { NextResponse } from "next/server"
import { loadGame, saveGame } from "@/src/lib/gameStore"
import { requireAdmin } from "@/src/lib/admin"
import { rateLimit } from "@/src/lib/rateLimit"

export async function POST(
  req:Request,
  { params }:{ params:{ code:string } }
){

  const game:any = await loadGame(params.code)

  if(!game){
    return NextResponse.json({error:"Game not found"},{status:404})
  }

  // ✅ ADMIN CHECK
  const unauthorized = requireAdmin(req,game)
  if(unauthorized) return unauthorized

  // ✅ RATE LIMIT
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ??
    "local"

  if(!rateLimit("vote:"+params.code+":"+ip,40,60000)){
    return NextResponse.json({error:"Too many votes"},{status:429})
  }

  // ✅ READ BODY SAFE
  let body:any={}
  try{
    body = await req.json()
  }catch{
    return NextResponse.json({error:"Invalid JSON"},{status:400})
  }

  const voterId = body.voterId
  const targetIds = body.targetIds

  if(!voterId || !Array.isArray(targetIds)){
    return NextResponse.json(
      {error:"voterId + targetIds[] required"},
      {status:400}
    )
  }

  // ✅ validate voter exists
  const voter = game.players?.find((p:any)=>p.id===voterId)
  if(!voter){
    return NextResponse.json({error:"Invalid voter"},{status:400})
  }

  // ✅ validate targets exist
  for(const id of targetIds){
    if(!game.players.find((p:any)=>p.id===id)){
      return NextResponse.json({error:"Invalid target"}, {status:400})
    }
  }

  game.votes ??=[]

  // remove previous vote this round
  game.votes = game.votes.filter(
    (v:any)=>!(v.voterId===voterId && v.round===game.round)
  )

  // add new vote
  game.votes.push({
    voterId,
    targetIds,
    round:game.round
  })

  await saveGame(params.code,game)

  return NextResponse.json({ok:true})
}