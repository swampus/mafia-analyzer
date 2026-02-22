import { NextResponse } from "next/server"
import { nanoid } from "nanoid"
import { loadGame, saveGame } from "@/src/lib/gameStore"
import { requireAdmin } from "@/src/lib/admin"
import { rateLimit } from "@/src/lib/rateLimit"


export async function POST(
  req: Request,
  { params }: { params:{ code:string } }
){

  // ✅ LOAD GAME
  const game:any = await loadGame(params.code)

  if(!game){
    return NextResponse.json({error:"Game not found"},{status:404})
  }

  // ✅ BLOCK IF ENDED
  if(game.endedAt){
    return NextResponse.json({error:"Game ended"},{status:400})
  }

  // ✅ RATE LIMIT PER IP
    const ip =
     req.headers.get("x-real-ip")
     ?? req.headers.get("x-forwarded-for")?.split(",")[0]
     ?? "unknown"

  if(!(await rateLimit("join:"+params.code+":"+ip,20,600))){
    return NextResponse.json({error:"Too many joins"},{status:429})
  }

  // ✅ BLOCK AFTER START
  if(game.round>0){
    return NextResponse.json(
      {error:"Game already started"},
      {status:400}
    )
  }

  // ✅ SAFE BODY READ
  let body:any={}
  try{
    body=await req.json()
  }catch{
    return NextResponse.json({error:"Invalid JSON"},{status:400})
  }

  const name = (body.name ?? "")
    .toString()
    .normalize("NFKC")
    .trim()

  if(!name){
    return NextResponse.json({error:"Name required"},{status:400})
  }

  // length
  if(name.length < 1 || name.length > 30){
    return NextResponse.json({error:"Name length 1..30"},{status:400})
  }

  // allowed chars (letters numbers space _ -)
  if(!/^[\p{L}\p{N}_\-\s]+$/u.test(name)){
    return NextResponse.json({error:"Invalid characters"},{status:400})
  }

  // duplicate name
  if(game.players?.some((p:any)=>p.name.toLowerCase()===name.toLowerCase())){
    return NextResponse.json({error:"Name already used"},{status:400})
  }

  // max players
  if((game.players?.length ?? 0) >= 30){
    return NextResponse.json({error:"Too many players"},{status:400})
  }

  // ✅ CREATE PLAYER
  const player={
    id:nanoid(),
    name,
    seat:(game.players?.length ?? 0)+1,
    alive:true,
    role:null,
    note:"",
    roleRevealed:false
  }

  game.players ??=[]
  game.players.push(player)

  await saveGame(params.code,game)

  return NextResponse.json(player)
}