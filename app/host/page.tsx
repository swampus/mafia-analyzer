"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

export default function HostStart() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function create() {
    if (loading) return
    setLoading(true)

    try {
      const res = await fetch("/api/game", { method: "POST" })
      if (!res.ok) throw new Error("Create failed")
      const data = await res.json()

      router.push(`/host/${data.code}?admin=${data.adminCode}`)
    } catch (e) {
      alert("Failed to create game")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl flex flex-col gap-6">

        <div className="text-center">
          <h1 className="text-3xl font-bold">Host Game</h1>
          <p className="text-gray-600 mt-2">
            Create a new offline Mafia session and manage it from your phone or laptop.
          </p>
        </div>

        <div className="rounded-2xl border bg-white/70 backdrop-blur p-5 flex flex-col gap-3">
          <div className="font-semibold">How it works</div>

          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-2">
            <li>
              You create a game and get a <b>Game Code</b> (6 digits).
              Share it with players — they can open <b>Join Game</b> and follow the session if they want.
            </li>
            <li>
              You also get an <b>Admin Code</b>. This code unlocks <b>Host/Admin mode</b>
              &nbsp;where you manage the game (roles, actions, votes, rounds).
            </li>
            <li>
              In Admin mode the host can:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>add/remove players during setup</li>
                <li>assign roles (manually) and track night actions</li>
                <li>record votes (including multi-votes if your rules allow it)</li>
                <li>switch Day/Night and move to the next round</li>
                <li>end the game and keep it as an archived, read-only session</li>
              </ul>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border p-5 bg-amber-50">
          <div className="font-semibold">Privacy note (GDPR)</div>
          <p className="text-sm text-gray-700 mt-2">
            Please <b>don’t use real full names</b>. Use nicknames.
            Game data is stored temporarily (about a week) to support history and analytics.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            If you want to be extra correct: avoid personal data. This is a hobby tool, not a government registry.
          </p>

          <div className="text-xs text-gray-600 mt-3">
            GDPR reference: “General Data Protection Regulation (EU) 2016/679”.
          </div>
        </div>

        <button
          onClick={create}
          className={`px-6 py-4 rounded-2xl text-white text-center transition ${
            loading ? "bg-gray-500" : "bg-black hover:scale-[1.01]"
          }`}
        >
          {loading ? "Creating..." : "Create Game"}
        </button>

        <div className="text-center text-sm text-gray-600">
          Want to join instead?{" "}
          <Link href="/join" className="underline">
            Go to Join Game
          </Link>
        </div>

      </div>
    </main>
  )
}