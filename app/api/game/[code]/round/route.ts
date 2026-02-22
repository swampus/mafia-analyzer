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

  const {action}=await req.json()

    if(action==="nextRound"){

      if(game.round===0){
        game.round=1
      }else{
        game.round+=1
      }

      game.phase="day"
      }

  if(action==="togglePhase"){
    game.phase=game.phase==="day"?"night":"day"
  }

  await saveGame(params.code,game)

  return NextResponse.json(game)
}