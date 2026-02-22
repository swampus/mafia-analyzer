"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function JoinPage() {

  const [code, setCode] = useState("")
  const router = useRouter()

  return (

    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">

      <h1 className="text-3xl font-bold">Join Game</h1>

      <div className="text-center text-gray-600 max-w-sm text-sm">
        Ask your host for the <b>Game Code</b> and enter it below.
        <br/>
        <span className="italic">
          If you don’t know the code… either ask the host,
          or you’re not supposed to be in this mafia meeting 🙂
        </span>
      </div>

      <input
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder="Game code"
        className="border rounded-xl p-3 w-56 text-center font-mono tracking-widest"
      />

      <button
        onClick={() => router.push(`/game/${code}`)}
        className="px-6 py-3 bg-black text-white rounded-xl hover:scale-[1.02] transition"
      >
        Join
      </button>

      <div className="text-xs text-gray-500 text-center max-w-xs">
        Players can follow the game, check history and see how suspicious everyone looks.
        No registration required.
      </div>

    </main>

  )
}