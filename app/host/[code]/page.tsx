"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { ROLES } from "@/src/data/roles"

function VoteBox({ game, voter, code, adminFetch, load, activeRound }: any) {

  const existing = useMemo(() => {
    return game.votes?.find(
      (v:any)=>v.voterId===voter.id && v.round===activeRound
    )
  },[game.votes, voter.id, activeRound])

  const [selected,setSelected] = useState<string[]>(existing?.targetIds ?? [])

  useEffect(()=>{
    setSelected(existing?.targetIds ?? [])
  },[existing, activeRound])

  const disabled = !!game.endedAt || game.round===0

  return (
    <div className="flex flex-col gap-2">

      <div className="flex flex-wrap gap-2">
        {game.players.map((t:any)=>{

          const checked = selected.includes(t.id)

          return(
            <label
              key={t.id}
              className={`flex items-center gap-1 text-sm border rounded-xl px-2 py-1 ${disabled?"opacity-50":""}`}
            >
              <input
                type="checkbox"
                disabled={disabled}
                checked={checked}
                onChange={()=>{
                  setSelected(prev =>
                    checked ? prev.filter(x=>x!==t.id) : [...prev,t.id]
                  )
                }}
              />
              {t.name}
            </label>
          )
        })}
      </div>

      <button
        disabled={disabled}
        onClick={async()=>{
          await adminFetch(`/api/game/${code}/vote`,{
            voterId:voter.id,
            targetIds:selected
          })
          load()
        }}
        className={`px-3 py-2 rounded-xl text-sm ${
          disabled ? "bg-gray-200 text-gray-500" : "bg-black text-white"
        }`}
      >
        Submit vote
      </button>

    </div>
  )
}

export default function HostPage(){

  const { code } = useParams()
  const search = useSearchParams()
  const admin = search.get("admin")

    useEffect(()=>{
      if(admin){
        localStorage.setItem("adminCode",admin)
      }
    },[admin])

const adminCode =
  admin ??
  (typeof window !== "undefined"
    ? localStorage.getItem("adminCode")
    : "") ??
  ""

  const [game,setGame] = useState<any>(null)
  const [name,setName] = useState("")
  const [viewRound,setViewRound] = useState(1)
  const [hideDead,setHideDead] = useState(false)

  async function load(){
    const res = await fetch(`/api/game/${code}`,{
      headers:{ "x-admin-code": adminCode }
    })
    if(res.ok) setGame(await res.json())
  }

  async function adminFetch(url:string,body?:any){
    await fetch(url,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "x-admin-code": adminCode
      },
      body: body ? JSON.stringify(body) : "{}"
    })
  }

async function addPlayer(){

  const cleanName = name.trim()

  if(!cleanName) return alert("Enter name")

  if(cleanName.length > 30){
    return alert("Name too long")
  }

  await fetch(`/api/game/${code}/player`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "x-admin-code": adminCode
    },
    body: JSON.stringify({ name: cleanName })
  })

  setName("")
  load()
}

  // polling
  useEffect(()=>{
    load()
    const i=setInterval(load,3000)
    return ()=>clearInterval(i)
  },[])

  // archive auto jump to last round
  useEffect(()=>{
    if(!game?.endedAt) return
    const max=Math.max(1,...((game.votes??[]).map((v:any)=>v.round??1)))
    setViewRound(max)
  },[game?.endedAt])

  if(!game) return <div className="p-6">Loading...</div>

  const isSetup = game.round===0
  const isArchived = !!game.endedAt
  const maxRound=Math.max(1,...((game.votes??[]).map((v:any)=>v.round??1)))
  const lastVoteRound = Math.max(
    1,
    ...((game.votes ?? []).map((v:any)=>v.round ?? 1))
  )

  const activeRound = isArchived ? viewRound : game.round

  // vote counting
  const counts:Record<string,number>={}
  for(const v of game.votes??[]){
    if(v.round!==activeRound) continue
    for(const id of v.targetIds??[]){
      counts[id]=(counts[id]??0)+1
    }
  }

  const maxVotes=Math.max(0,...Object.values(counts))
  const leaders=new Set(
    Object.entries(counts)
      .filter(([_,c])=>c===maxVotes && maxVotes>0)
      .map(([id])=>id)
  )

  const visiblePlayers = hideDead
    ? game.players.filter((p:any)=>p.alive)
    : game.players

    const rolesForMode = ROLES.filter(
      r => r.mode === (game.mode ?? "classic")
    )

    return(

    <main className={`p-4 max-w-xl mx-auto flex flex-col gap-4 transition-colors duration-500 ${
        game.phase==="night"
          ? "bg-slate-800 text-slate-100 min-h-screen"
          : "bg-white text-black min-h-screen"
    }`}>

      {/* HEADER */}
      <div className={`rounded-2xl border p-4 ${
             game.phase==="night"
               ? "bg-slate-700 border-slate-600"
               : "bg-white"
           }`}>

        <div className="text-sm text-gray-500">Game code</div>
        <div className="text-3xl font-mono">{code}</div>

        <div className="mt-2 text-sm">
          {isSetup
            ? <b className="text-orange-600">SETUP</b>
            : <><span className={`px-2 py-1 rounded-lg text-xs ${
                  game.phase==="night"
                    ? "bg-indigo-600 text-white"
                    : "bg-yellow-400 text-black"
                }`}>
                  {game.phase==="night" ? "🌙 NIGHT" : "🌞 DAY"}
                </span> | Round: <b>{game.round}</b></>
          }

          <div className="text-xs text-gray-500 mt-1">
            Mode: <b>{game.mode ?? "classic"}</b>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">

          {isSetup && (
            <>
              {/* MODE SELECT */}
              <div className="flex gap-2">
                <button
                  onClick={async()=>{
                    await adminFetch(`/api/game/${code}/mode`,{mode:"classic"})
                    load()
                  }}
                  className={`px-3 py-2 rounded-xl text-sm ${
                    (game.mode ?? "classic")==="classic"
                      ? "bg-black text-white"
                      : "bg-gray-200"
                  }`}
                >
                  Classic
                </button>

                <button
                  onClick={async()=>{
                    await adminFetch(`/api/game/${code}/mode`,{mode:"dark"})
                    load()
                  }}
                  className={`px-3 py-2 rounded-xl text-sm ${
                    game.mode==="dark"
                      ? "bg-black text-white"
                      : "bg-gray-200"
                  }`}
                >
                  Dark Cult
                </button>
              </div>

              {/* START GAME */}
              <button
                onClick={async()=>{
                  await adminFetch(`/api/game/${code}/round`,{action:"nextRound"})
                  load()
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm"
              >
                START GAME
              </button>
            </>
          )}

          {!isSetup && !isArchived && (
            <>
              <button
                onClick={async()=>{
                  await adminFetch(`/api/game/${code}/round`,{action:"togglePhase"})
                  load()
                }}
                className="px-4 py-2 bg-gray-800 text-white rounded-xl text-sm"
              >
                Day / Night
              </button>

              <button
                onClick={async()=>{
                  await adminFetch(`/api/game/${code}/round`,{action:"nextRound"})
                  load()
                }}
                className="px-4 py-2 bg-black text-white rounded-xl text-sm"
              >
                Next Round
              </button>
            </>
          )}

          {isArchived && (
            <>
              <button onClick={()=>setViewRound(r=>Math.max(1,r-1))}
                className="px-4 py-2 bg-gray-200 rounded-xl text-sm">
                ◀ Prev
              </button>

              <div className="px-4 py-2 border rounded-xl text-sm">
                Round {viewRound}/{maxRound}
              </div>

              <button onClick={()=>setViewRound(r=>Math.min(maxRound,r+1))}
                className="px-4 py-2 bg-gray-200 rounded-xl text-sm">
                Next ▶
              </button>
            </>
          )}

          <button
            onClick={async()=>{
              if(!confirm("End game?")) return
              await adminFetch(`/api/game/${code}/end`,{})
              load()
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm"
          >
            End Game
          </button>

        </div>

        {isArchived && (
          <div className="mt-3 rounded-2xl border p-3 bg-gray-50">
            <b>ARCHIVED</b> <span className="text-sm text-gray-600">Read-only mode</span>
          </div>
        )}

      </div>

    <div className="flex gap-2 flex-wrap">

    {Array.from({length:Math.max(game.round,1)},(_,i)=>i+1).map(r=>(
      <button
        key={r}
        onClick={()=>setViewRound(r)}
        className={`px-3 py-1 rounded border ${
          r===activeRound?"bg-black text-white":"bg-gray-200"
        }`}
      >
        Round {r}
      </button>
    ))}

    </div>

      {/* FILTER */}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={hideDead}
          onChange={()=>setHideDead(!hideDead)}
        />
        Hide dead players
      </label>


      {/* SUMMARY */}
      <div className={`rounded-2xl border p-4 backdrop-blur-sm ${
             game.phase==="night"
               ? "bg-slate-800/80 border-slate-600"
               : "bg-white/90"
           }`}>

        <div className="font-semibold mb-2">
          Vote summary (Round {activeRound})
        </div>

        {Object.keys(counts).length===0
          ? <div className="text-sm text-gray-500">No votes yet</div>
          : game.players.map((p:any)=>{
              const c=counts[p.id]??0
              if(!c) return null
              return(
                <div key={p.id} className="flex justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="font-mono">{c}</span>
                </div>
              )
            })
        }


      </div>


      {/* ADD PLAYER */}
      {isSetup && (
        <div className="rounded-2xl border p-4 flex gap-2">
          <input
            value={name}
            onChange={e=>setName(e.target.value)}
            placeholder="Player name"
            className="border rounded-xl p-2 flex-1"
          />
          <button
            onClick={addPlayer}
            className="px-4 py-2 bg-black text-white rounded-xl"
          >
            Add
          </button>
        </div>
      )}


      {/* PLAYERS */}
      <div className="flex flex-col gap-3">

        {visiblePlayers.map((p:any)=>{

           const myVote =
             game.votes?.find((v:any)=>String(v.voterId)===String(p.id) && v.round===activeRound)

          const voteNames =
            myVote?.targetIds?.map((id:string)=>
              game.players.find((x:any)=>x.id===id)?.name
            ).filter(Boolean).join(", ") ?? "—"

          return(
            <div key={p.id}
              className={`rounded-2xl border p-4 flex flex-col gap-3 ${
                leaders.has(p.id)?"border-yellow-500 bg-yellow-50":""
              }`}>

              <div className="flex justify-between items-center">

                <div className="flex flex-col">

                  <div className="flex items-center gap-2">

                    <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                      {p.seat ?? "?"}
                    </div>

                    <div className="text-lg font-semibold">
                      {p.name} {p.alive?"":"☠️"}
                    </div>

                  </div>

                  {/* ROLE */}

                  {isSetup ? (

                    <select
                      value={p.role ?? ""}
                      onChange={async e=>{
                        await adminFetch(`/api/game/${code}/player/role`,{
                          playerId:p.id,
                          role:e.target.value || null
                        })
                        load()
                      }}
                      className="border rounded-xl px-2 py-1 text-xs mt-1 w-fit"
                    >

                      <option value="">Select role…</option>

                      {rolesForMode.map((r:any)=>(
                        <option key={r.id ?? r.name} value={r.name}>
                          {r.name}
                        </option>
                      ))}

                    </select>

                  ) : (

                    <div className="mt-1">
                      <span className="inline-block px-2 py-1 rounded-lg bg-purple-100 text-purple-800 text-xs">
                        {p.role ?? "—"}
                      </span>
                    </div>

                  )}

                <textarea
                  placeholder="Host note…"
                  defaultValue={p.note ?? ""}
                  onBlur={async e=>{
                    await adminFetch(`/api/game/${code}/player/note`,{
                      playerId:p.id,
                      note:e.target.value
                    })
                  }}
                    className={`border rounded-xl px-2 py-1 text-xs mt-2 w-full placeholder:text-gray-500 ${
                      game.phase==="night"
                        ? "bg-slate-100 text-black border-slate-400"
                        : "bg-white text-black"
                    }`}
                />
                </div>



                <div className="flex gap-2">

                  {isSetup && (
                    <button
                      onClick={async()=>{
                        await adminFetch(`/api/game/${code}/player/remove`,{playerId:p.id})
                        load()
                      }}
                      className="px-3 py-2 bg-gray-300 rounded-xl text-sm"
                    >
                      Remove
                    </button>
                  )}

                  <button
                    disabled={isArchived}
                    onClick={async()=>{
                      await adminFetch(`/api/game/${code}/player/status`,{
                        playerId:p.id,
                        alive:!p.alive
                      })
                      load()
                    }}
                    className={`px-3 py-2 rounded-xl text-sm ${
                      isArchived
                        ? "bg-gray-200 text-gray-500"
                        : p.alive
                          ? "bg-red-600 text-white"
                          : "bg-green-600 text-white"
                    }`}
                  >
                    {p.alive?"Kill":"Revive"}
                  </button>

                </div>

              </div>

              <div className="text-sm text-gray-600">
                Vote: <span className="font-mono">{voteNames}</span>
              </div>

              <VoteBox
                game={game}
                voter={p}
                code={code}
                adminFetch={adminFetch}
                load={load}
                activeRound={activeRound}
              />

            </div>
          )
        })}

      </div>

    </main>
  )
}