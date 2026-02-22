import { NextResponse } from "next/server"
import { loadGame, saveGame } from "@/src/lib/gameStore"
import { requireAdmin } from "@/src/lib/admin"

export async function POST(
  req: Request,
  { params }: { params: { code: string } }
){

  const game:any = await loadGame(params.code)
  if(!game) return NextResponse.json({error:"Game not found"},{status:404})

  const unauthorized=requireAdmin(req,game)
  if(unauthorized) return unauthorized

  const body=await req.json().catch(()=>({}))
  const {playerId,role}=body

  const player=game.players?.find((p:any)=>p.id===playerId)
  if(!player){
    return NextResponse.json({error:"Player not found"},{status:404})
  }

  player.role=role ?? null

  await saveGame(params.code,game)

  return NextResponse.json({ok:true})
}