"use client"

import { useParams } from "next/navigation"
import { useEffect,useState } from "react"

export default function GamePage(){

  const {code}=useParams()
  const [game,setGame]=useState<any>(null)

  async function load(){
    const res=await fetch(`/api/game/${code}`)
    if(res.ok) setGame(await res.json())
  }

  useEffect(()=>{
    load()
    const i=setInterval(load,3000)
    return ()=>clearInterval(i)
  },[])

  if(!game) return <div className="p-6">Loading...</div>

  return(

    <main className="relative min-h-screen">

      {/* GLOBAL BACKGROUND */}

      {game.phase==="night" && (
        <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 -z-10">

          {/* stars */}
          <div className="absolute w-1 h-1 bg-white rounded-full top-10 left-10 opacity-80"/>
          <div className="absolute w-1 h-1 bg-white rounded-full top-24 left-1/3 opacity-70"/>
          <div className="absolute w-1 h-1 bg-white rounded-full top-40 right-20 opacity-80"/>
          <div className="absolute w-1 h-1 bg-white rounded-full bottom-32 left-1/4 opacity-70"/>
          <div className="absolute w-1 h-1 bg-white rounded-full bottom-16 right-1/3 opacity-80"/>

        </div>
      )}

      {game.phase!=="night" && (
        <div className="fixed inset-0 bg-gradient-to-b from-amber-50 via-white to-amber-100 -z-10"/>
      )}

      {/* CONTENT */}

      <div className={`p-6 max-w-xl mx-auto transition-colors duration-700 ${
        game.phase==="night" ? "text-slate-100" : "text-black"
      }`}>

        <h1 className="text-2xl font-bold mb-4">Game {code}</h1>

        <div className={`rounded-2xl border p-4 mb-4 ${
          game.phase==="night"
            ? "bg-slate-800 border-slate-700"
            : "bg-white"
        }`}>
          <span className="inline-flex items-center gap-2">
            {game.phase==="night" ? "🌙 Night" : "☀️ Day"}
          </span> | Round: <b>{game.round}</b>
        </div>

        <div className="flex flex-col gap-2">

          {game.players?.map((p:any)=>(

            <div key={p.id}
              className={`border rounded-xl p-3 flex justify-between ${
                game.phase==="night"
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white"
              }`}>

              <span>
                {p.name} {p.alive ? "" : "☠️"}
              </span>

              <span className="text-gray-500 text-sm">
                seat {p.seat ?? "?"}
              </span>

            </div>

          ))}

        </div>

      </div>

    </main>
  )
}