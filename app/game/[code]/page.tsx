"use client"

import { useParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Network } from "vis-network"

export default function GamePage(){

  const {code}=useParams()

  const [roundView,setRoundView]=useState<number|null>(null)
  const [game,setGame]=useState<any>(null)

  const [tab,setTab]=useState<"friendly"|"pro"|"about">("friendly")

  const [allVotes,setAllVotes]=useState<any[]>([])

  async function load(){
    const res=await fetch(`/api/game/${code}?analytics=1`)
    if(res.ok){

      const g=await res.json()
      setGame(g)
      setRoundView(prev=>prev ?? g.round ?? 1)

      // 🔥 объединяем историю голосов
      setAllVotes(prev=>{
        const merged=[...prev]

        for(const v of (g.publicVotes ?? [])){
          const exists=merged.some(x =>
            x.round===v.round &&
            x.voter.id===v.voter.id &&
            JSON.stringify(x.targets)===JSON.stringify(v.targets)
          )
          if(!exists) merged.push(v)
        }

        return merged
      })
    }
  }

  useEffect(()=>{
    load()
    const i=setInterval(load,3000)
    return ()=>clearInterval(i)
  },[])

  if(!game) return <div className="p-6">Loading...</div>

  const activeRound = roundView ?? game.round ?? 1
  const rounds = Array.from({length:game.round ?? 1},(_,i)=>i+1)

  return(

    <main className="relative min-h-screen">

      {game.phase==="night"
        ? <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 -z-10"/>
        : <div className="fixed inset-0 bg-gradient-to-b from-amber-50 via-white to-amber-100 -z-10"/>
      }

      <div className={`p-6 max-w-xl mx-auto ${
        game.phase==="night" ? "text-slate-100" : "text-black"
      }`}>

        <h1 className="text-2xl font-bold mb-4">Game {code}</h1>

        <div className={`rounded-2xl border p-4 mb-4 ${
          game.phase==="night"
            ? "bg-slate-800 border-slate-700"
            : "bg-white"
        }`}>
          {game.phase==="night" ? "🌙 Night" : "☀️ Day"} | Round: <b>{game.round}</b>
        </div>

        {/* PLAYERS */}

        <div className="flex flex-col gap-2 mb-6">

          {game.players?.map((p:any)=>(
            <div key={p.id}
              className={`border rounded-xl p-3 flex justify-between ${
                game.phase==="night"
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white"
              }`}>
              <span>{p.name} {p.alive ? "" : "☠️"}</span>
              <span className="text-gray-500 text-sm">seat {p.seat ?? "?"}</span>
            </div>
          ))}

        </div>

        {/* ROUND BUTTONS */}

        <div className="flex gap-2 mb-4 flex-wrap">

          {rounds.map((r:number)=>(
            <button
              key={r}
              onClick={()=>setRoundView(r)}
              className={`px-3 py-1 rounded-lg border ${
                r===activeRound
                  ? "bg-blue-600 text-white"
                  : "bg-white text-black"
              }`}
            >
              Round {r}
            </button>
          ))}

        </div>

        {/* HISTORY */}

        <div className={`rounded-2xl border p-4 mb-4 ${
          game.phase==="night"
            ? "bg-slate-800 border-slate-700"
            : "bg-white"
        }`}>

          <h2 className="font-semibold mb-2">Votes history</h2>

          {allVotes.filter(v=>v.round===activeRound).length===0 && (
            <div className="text-sm opacity-60">No votes this round</div>
          )}

          {allVotes
            .filter(v=>v.round===activeRound)
            .map((v:any,i:number)=>(
              <div key={i} className="text-sm mb-1">
                <b>{v.voter.name}</b> → {v.targets.map((t:any)=>t.name).join(", ")}
              </div>
          ))}

        </div>

        {/* GRAPH */}

        {(game.publicGraph?.nodes ?? []).length>0 && (

          <div className={`rounded-2xl border p-4 ${
            game.phase==="night"
              ? "bg-slate-800 border-slate-700"
              : "bg-white"
          }`}>

            <VoteGraph game={game} votes={allVotes} round={activeRound}/>

          </div>
        )}

        {game.analytics && (

          <div className={`rounded-2xl border p-4 mt-4 ${
            game.phase==="night"
              ? "bg-slate-800 border-slate-700"
              : "bg-white"
          }`}>

            <div className="flex gap-2 mb-3">
              <button
                onClick={()=>setTab("friendly")}
                className={`px-3 py-1 rounded-lg border ${
                  tab==="friendly"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-black"
                }`}
              >
                User friendly
              </button>

              <button
                onClick={()=>setTab("pro")}
                className={`px-3 py-1 rounded-lg border ${
                  tab==="pro"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-black"
                }`}
              >
                Pro analytics
              </button>

              <button
                onClick={()=>setTab("about")}
                className={`px-3 py-1 rounded-lg border ${
                  tab==="about"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-black"
                }`}
              >
                How it works
              </button>
            </div>

            {tab==="friendly" && (
              <div className="flex flex-col gap-2">
                {game.analytics.friendly.players.map((p:any)=>(
                  <div key={p.id} className="border rounded-lg p-2">
                    <div className="font-semibold">
                      {p.name} — {p.suspicion_pct}% suspicious
                    </div>
                    <div className="text-sm opacity-70">
                      {p.reasons.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab==="pro" && (
              <div className="text-sm">
                {game.analytics.pro.players.map((p:any)=>(
                  <div key={p.id} className="border rounded-lg p-2 mb-1">
                    <b>{p.name}</b>
                    <div>out_degree: {p.out_degree}</div>
                    <div>in_degree: {p.in_degree}</div>
                    <div>entropy: {p.entropy.toFixed(2)}</div>
                    <div>coalition: {p.coalition ?? "-"}</div>
                    <div>bandwagon: {(p.bandwagon_score*100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            )}

            {tab==="about" && (
              <div className="text-sm space-y-3">
                <p>
                  This tool analyzes the voting graph of the game to detect behavioral patterns,
                  possible coalitions, and suspicious activity.
                </p>

                <div><b>out_degree</b> — number of votes made by a player.</div>
                <div><b>in_degree</b> — number of votes received.</div>
                <div><b>entropy</b> — consistency of target selection.</div>
                <div><b>coalition</b> — detected group with similar voting behavior.</div>
                <div><b>bandwagon_score</b> — how often a player votes with the majority.</div>

                <hr/>

                <div>
                  <b>Algorithms:</b>
                  <ul className="list-disc ml-5">
                    <li>Jaccard similarity — O(N² × T)</li>
                    <li>Graph component detection (BFS) — O(N + E)</li>
                    <li>Shannon entropy — O(V)</li>
                    <li>Bandwagon detection — O(V)</li>
                    <li>Logistic scoring model — O(N)</li>
                  </ul>
                </div>

                <p className="opacity-70">
                  Suspicion is statistical, not proof.
                </p>
              </div>
            )}

          </div>

        )}
      </div>

    </main>
  )
}


function VoteGraph({game,votes,round}:{game:any,votes:any[],round:number}){

  const containerRef=useRef<HTMLDivElement>(null)
  const networkRef=useRef<any>(null)

  useEffect(()=>{

    if(!containerRef.current) return

    const edges=(game.publicGraph.edges ?? [])
      .filter((e:any)=>{
        const vote=votes.find((v:any)=>
          v.round===round &&
          v.voter.id===e.from &&
          v.targets.some((t:any)=>t.id===e.to)
        )
        return !!vote
      })
      .map((e:any)=>({
        from:e.from,
        to:e.to,
        arrows:"to"
      }))

    const nodes=(game.publicGraph.nodes ?? []).map((n:any)=>({
      id:n.id,
      label:n.label,
      color:n.alive ? "#22c55e" : "#ef4444",
      fixed:true
    }))

    const data={nodes,edges}

    const options={
      height:"320px",
      interaction:{
        dragNodes:false,
        dragView:false,
        zoomView:false
      },
      physics:false
    }

    if(!networkRef.current){

      networkRef.current=new Network(
        containerRef.current,
        data,
        options
      )

    }else{

      networkRef.current.setData(data)

    }

  },[game,votes,round])

    useEffect(()=>{
      if(game?.analytics){
        setTab("friendly")
      }
    },[game?.analytics])

  return <div ref={containerRef}/>
}