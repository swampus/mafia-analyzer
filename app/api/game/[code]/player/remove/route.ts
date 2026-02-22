import { NextResponse } from "next/server"
import { loadGame, saveGame } from "@/src/lib/gameStore"
import { requireAdmin } from "@/src/lib/admin"

export async function POST(
  req: Request,
  { params }: { params: { code: string } }
){
  const game:any = await loadGame(params.code)

  if(!game){
    return NextResponse.json({error:"Game not found"},{status:404})
  }

  const unauthorized=requireAdmin(req,game)
  if(unauthorized) return unauthorized

  let body:any={}
  try{ body=await req.json() }catch{}

  const {playerId}=body

  if(!playerId){
    return NextResponse.json({error:"playerId required"},{status:400})
  }

  game.players=(game.players??[]).filter((p:any)=>p.id!==playerId)

  await saveGame(params.code,game)

  return NextResponse.json({ok:true})
}