type PublicVote = {
  round: number
  voter: { id: string, name: string }
  targets: Array<{ id: string, name: string }>
}

type Player = {
  id: string
  name: string
  alive: boolean
  seat?: number
}

export type VoteAnalyticsInput = {
  game: any
  publicVotes: PublicVote[]
  round: number | null
}

/** Real-time Mafia vote analytics: builds vote graph, detects coalitions, computes graph metrics (degree, entropy, bandwagon), and outputs an explainable suspicion score. */
export function buildVoteAnalytics(input: VoteAnalyticsInput) {

  const players: Player[] = (input.game?.players ?? []).map((p: any) => ({
    id: String(p.id),
    name: String(p.name ?? "?"),
    alive: !!p.alive,
    seat: p.seat,
  }))

  const votes = (input.publicVotes ?? []).filter(v =>
    input.round == null ? true : v.round === input.round
  )

  // ---------- vote maps ----------
  const targetsByVoter = new Map<string, Set<string>>()
  const outWeight = new Map<string, number>()
  const inWeight = new Map<string, number>()
  const edgeWeight = new Map<string, number>()
  const voters = players.map(p => p.id)
  // popularity map for bandwagon
  const targetPopularity = new Map<string, number>()

  for (const v of votes) {

    const voterId = v.voter.id
    if (!targetsByVoter.has(voterId)) targetsByVoter.set(voterId, new Set())

    for (const t of (v.targets ?? [])) {

      targetsByVoter.get(voterId)!.add(t.id)

      outWeight.set(voterId, (outWeight.get(voterId) ?? 0) + 1)
      inWeight.set(t.id, (inWeight.get(t.id) ?? 0) + 1)

      const key = `${voterId}->${t.id}`
      edgeWeight.set(key, (edgeWeight.get(key) ?? 0) + 1)

      targetPopularity.set(t.id,(targetPopularity.get(t.id) ?? 0)+1)
    }
  }

  // ---------- Jaccard similarity ----------
  const jaccard = (a: Set<string>, b: Set<string>) => {

    if (a.size === 0 && b.size === 0) return 1
    if (a.size === 0 || b.size === 0) return 0

    let inter = 0
    a.forEach(x => { if (b.has(x)) inter++ })

    const uni = a.size + b.size - inter
    return uni === 0 ? 0 : inter / uni
  }

  const sim = new Map<string, number>()

  for (let i = 0; i < voters.length; i++) {
    for (let j = i + 1; j < voters.length; j++) {
      const a = targetsByVoter.get(voters[i]) ?? new Set()
      const b = targetsByVoter.get(voters[j]) ?? new Set()
      sim.set(`${voters[i]}::${voters[j]}`, jaccard(a,b))
    }
  }

  const getSim = (i:string,j:string)=>{
    if(i===j) return 1
    const key=i<j?`${i}::${j}`:`${j}::${i}`
    return sim.get(key)??0
  }

  // ---------- coalition detection ----------
  const TH=0.55
  const adjacency=new Map<string,string[]>()
  voters.forEach(id=>adjacency.set(id,[]))

  for(let i=0;i<voters.length;i++){
    for(let j=i+1;j<voters.length;j++){
      const s=getSim(voters[i],voters[j])
      if(s>=TH){
        adjacency.get(voters[i])!.push(voters[j])
        adjacency.get(voters[j])!.push(voters[i])
      }
    }
  }

  const coalitionOf=new Map<string,string|null>()
  voters.forEach(id=>coalitionOf.set(id,null))

  const coalitions:Array<{id:string,members:string[],cohesion:number}>=[]
  let cIdx=1

  for(const start of voters){

    if(coalitionOf.get(start)) continue

    const q=[start]
    const comp:string[]=[]
    coalitionOf.set(start,`C${cIdx}`)

    while(q.length){
      const x=q.shift()!
      comp.push(x)
      for(const y of adjacency.get(x)??[]){
        if(!coalitionOf.get(y)){
          coalitionOf.set(y,`C${cIdx}`)
          q.push(y)
        }
      }
    }

    if(comp.length>=2){
      coalitions.push({
        id:`C${cIdx}`,
        members:comp,
        cohesion:avgPairwise(comp,getSim)
      })
      cIdx++
    }else{
      coalitionOf.set(start,null)
    }
  }

  const topCoalition=coalitions
    .slice()
    .sort((a,b)=>(b.cohesion-a.cohesion)||(b.members.length-a.members.length))[0]

  // ---------- influence (PageRank-lite) ----------
  const influence = computeInfluence(voters, edgeWeight)

  // ---------- bandwagon threshold ----------
  let maxPopularity=0
  targetPopularity.forEach(v=>{ if(v>maxPopularity) maxPopularity=v })
  const popularTargets=new Set<string>()
  targetPopularity.forEach((v,k)=>{
    if(v>=maxPopularity*0.8) popularTargets.add(k)
  })

  // ---------- pro players ----------
  const proPlayers=players.map(p=>{

    const set=targetsByVoter.get(p.id)??new Set()
    const entropy=voteEntropy(p.id,votes)

    let bandwagonHits=0
    set.forEach(t=>{ if(popularTargets.has(t)) bandwagonHits++ })
    const bandwagonScore=set.size?bandwagonHits/set.size:0

    const coalitionId=coalitionOf.get(p.id)??null
    const within=coalitionId?coalitions.find(c=>c.id===coalitionId)?.members??[]:[]
    const withinAgg=within.filter(x=>x!==p.id)
      .reduce((a,o)=>a+(edgeWeight.get(`${p.id}->${o}`)??0),0)

    const outwardAgg=Array.from(set)
      .filter(t=>within.length?!within.includes(t):true)
      .reduce((a,t)=>a+(edgeWeight.get(`${p.id}->${t}`)??0),0)

    const simToTop=topCoalition
      ?avg(topCoalition.members.filter(x=>x!==p.id).map(x=>getSim(p.id,x)))
      :0

    return{
      id:p.id,
      name:p.name,
      influence: influence.get(p.id) ?? 0,
      alive:p.alive,
      seat:p.seat??null,
      round:input.round,
      out_degree:outWeight.get(p.id)??0,
      in_degree:inWeight.get(p.id)??0,
      unique_targets:set.size,
      entropy,
      bandwagon_score:bandwagonScore,
      coalition:coalitionId,
      coalition_within_aggression:withinAgg,
      coalition_outward_aggression:outwardAgg,
      sim_to_top_coalition:simToTop
    }
  })

  // ---------- friendly score ----------
  const friendlyPlayers=proPlayers.map(pp=>{

    const reasons:string[]=[]
    const coalition=pp.coalition?coalitions.find(c=>c.id===pp.coalition):null

    const inTight=coalition&&coalition.cohesion>=0.65
    const lowInternal=pp.coalition_within_aggression===0&&(coalition?.members.length??0)>=2
    const outward=pp.coalition_outward_aggression>=1&&inTight
    const chaotic=pp.entropy>=1.2&&pp.unique_targets>=3
    const bandwagon=pp.bandwagon_score>=0.8&&pp.unique_targets>=2

    if(inTight) reasons.push("High voting similarity within a coalition")
    if(lowInternal) reasons.push("Rarely votes against members of their own group")
    if(outward) reasons.push("Votes are mostly directed outside the group")
    if(chaotic) reasons.push("Highly inconsistent target changes (high entropy)")
    if(bandwagon) reasons.push("Frequently follows the majority vote")

    let z=-0.6
    if(inTight) z+=0.9
    if(lowInternal) z+=0.7
    if(outward) z+=0.5
    if(chaotic) z+=0.4
    if(bandwagon) z+=0.5
    z+=0.12*pp.out_degree
    z+=0.8*(pp as any).influence ?? 0
    z-=0.06*pp.in_degree

    const suspicion=sigmoid(z)

    const topReasons=reasons.slice(0,3)
    if(!topReasons.length) topReasons.push("Not enough votes yet (small dataset)")

    return{
      id:pp.id,
      name:pp.name,
      alive:pp.alive,
      coalition:pp.coalition,
      suspicion_pct:Math.round(suspicion*100),
      reasons:topReasons
    }
  })

  friendlyPlayers.sort((a,b)=>(b.suspicion_pct-a.suspicion_pct)||a.name.localeCompare(b.name))

  const friendlyCoalitions=coalitions
    .map(c=>({
      id:c.id,
      cohesion:round2(c.cohesion),
      members:c.members.map(id=>players.find(p=>p.id===id)?.name??id),
      label:`Coalition ${c.id} (cohesion ${round2(c.cohesion)})`
    }))
    .sort((a,b)=>(b.cohesion-a.cohesion)||(b.members.length-a.members.length))

  return{
    meta:{
      round:input.round,
      votes:votes.length,
      similarity_threshold:TH
    },
    friendly:{players:friendlyPlayers,coalitions:friendlyCoalitions},
    pro:{players:proPlayers.sort((a,b)=>(b.sim_to_top_coalition-a.sim_to_top_coalition))}
  }
}

function sigmoid(z:number){return 1/(1+Math.exp(-z))}
function round2(x:number){return Math.round(x*100)/100}
function avg(xs:number[]){return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0}

function avgPairwise(ids:string[],sim:(a:string,b:string)=>number){
  let sum=0,cnt=0
  for(let i=0;i<ids.length;i++){
    for(let j=i+1;j<ids.length;j++){
      sum+=sim(ids[i],ids[j])
      cnt++
    }
  }
  return cnt?sum/cnt:0
}

function voteEntropy(voterId:string,votes:Array<{voter:{id:string},targets:Array<{id:string}>}>){
  const counts=new Map<string,number>()
  let total=0
  for(const v of votes){
    if(v.voter.id!==voterId)continue
    for(const t of (v.targets??[])){
      counts.set(t.id,(counts.get(t.id)??0)+1)
      total++
    }
  }
  if(total<=1)return 0
  let h=0
  counts.forEach(c=>{
    const p=c/total
    h-=p*Math.log(p)
  })
  return h
}

function computeInfluence(players:string[], edgeWeight:Map<string,number>){

  const N=players.length
  const score=new Map<string,number>()

  players.forEach(p=>score.set(p,1/N))

  const ITER=20
  const DAMP=0.85

  for(let k=0;k<ITER;k++){

    const next=new Map<string,number>()
    players.forEach(p=>next.set(p,(1-DAMP)/N))

    players.forEach(from=>{

      let totalOut=0
      players.forEach(to=>{
        totalOut+=edgeWeight.get(`${from}->${to}`)??0
      })

      if(totalOut===0) return

      players.forEach(to=>{
        const w=edgeWeight.get(`${from}->${to}`)??0
        if(!w) return

        const contrib=DAMP*(score.get(from)!)*(w/totalOut)
        next.set(to,next.get(to)!+contrib)
      })
    })

    next.forEach((v,k)=>score.set(k,v))
  }

  return score
}