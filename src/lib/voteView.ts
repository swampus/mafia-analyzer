// src/lib/voteView.ts

export function buildVoteHistory(game: any) {
  const playersById = new Map<string, any>(
    (game.players ?? []).map((p: any) => [p.id, p])
  )

  const votes = (game.votes ?? []) as Array<{ voterId: string, targetIds: string[], round: number }>

  // group by round
  const byRound = new Map<number, any[]>()

  for (const v of votes) {
    const voter = playersById.get(v.voterId)
    const targets = v.targetIds.map(id => playersById.get(id)).filter(Boolean)

    const item = {
      round: v.round,
      voterId: v.voterId,
      voterName: voter?.name ?? "Unknown",
      targetIds: v.targetIds,
      targetNames: targets.map(t => t.name),
    }

    if (!byRound.has(v.round)) byRound.set(v.round, [])
    byRound.get(v.round)!.push(item)
  }

  // sort rounds asc
  const rounds = Array.from(byRound.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([round, items]) => ({ round, items }))

  return rounds
}

export function buildVoteGraph(game: any, round: number | null = null) {
  const votes = (game.votes ?? []) as Array<{ voterId: string, targetIds: string[], round: number }>

  const edgeCounts = new Map<string, number>()

  for (const v of votes) {
    if (round !== null && v.round !== round) continue

    for (const t of v.targetIds) {
      const key = `${v.voterId}->${t}`
      edgeCounts.set(key, (edgeCounts.get(key) ?? 0) + 1)
    }
  }

  const edges = Array.from(edgeCounts.entries()).map(([key, weight]) => {
    const [from, to] = key.split("->")
    return { from, to, weight }
  })

  const nodes = (game.players ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    alive: p.alive,
    seat: p.seat,
  }))

  return { nodes, edges }
}