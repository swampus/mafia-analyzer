export function buildPublicVotes(game:any){

 const players=new Map(
   (game.players??[]).map((p:any)=>[p.id,p.name])
 )

 return (game.votes??[]).map((v:any)=>({

   round:v.round,

   voter:{
     id:v.voterId,
     name:players.get(v.voterId) ?? "?"
   },

   targets:(v.targetIds??[]).map((id:string)=>({
     id,
     name:players.get(id) ?? "?"
   }))

 }))
}

export function buildPublicVoteGraph(game:any){

 const edges:Record<string,number>={}

 for(const v of game.votes??[]){
   for(const t of v.targetIds){
     const key=v.voterId+"->"+t
     edges[key]=(edges[key]??0)+1
   }
 }

 return{

   nodes:game.players.map((p:any)=>({
     id:p.id,
     label:p.name,
     alive:p.alive
   })),

   edges:Object.entries(edges).map(([k,w])=>{
     const[from,to]=k.split("->")
     return{from,to,weight:w}
   })

 }
}