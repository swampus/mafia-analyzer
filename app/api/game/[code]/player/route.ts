import { NextResponse } from "next/server"
import { nanoid } from "nanoid"
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

  // ✅ ADMIN CHECK
  const unauthorized = requireAdmin(req,game)
  if(unauthorized) return unauthorized

  // ✅ READ BODY SAFELY
  let body:any={}
  try{
    body = await req.json()
  }catch{}

  const name = String(body?.name ?? "").trim()

  if(!name){
    return NextResponse.json(
      {error:"Name required"},
      {status:400}
    )
  }

  if(name.length>40){
    return NextResponse.json(
      {error:"Name too long"},
      {status:400}
    )
  }

  if(game.round>0){
    return NextResponse.json(
      {error:"Cannot add players after game start"},
      {status:400}
    )
  }

  const player={
    id:nanoid(),
    name,
    seat:(game.players?.length ?? 0)+1,
    alive:true,
    role:null,
    roleRevealed:false,
    note:""
  }

  game.players ??=[]
  game.players.push(player)

  await saveGame(params.code,game)

  return NextResponse.json(player)
}