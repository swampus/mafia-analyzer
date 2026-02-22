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

  const body=await req.json().catch(()=>({}))
  const mode=body.mode

  if(mode!=="classic" && mode!=="dark"){
    return NextResponse.json({error:"Invalid mode"},{status:400})
  }

  game.mode=mode

  await saveGame(params.code,game)

  return NextResponse.json({ok:true,mode})
}