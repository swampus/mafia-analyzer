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
  /** null => all rounds */
  round: number | null
}

/**
 * Lightweight analytics engine (no heavy deps), designed for real-time UI.
 * Produces 2 layers:
 *  - friendly: suspicion % + small human explanations + coalitions
 *  - pro: raw graph-ish metrics per player
 */
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

  // --- Build vote sets per voter
  const targetsByVoter = new Map<string, Set<string>>()
  const outWeight = new Map<string, number>()
  const inWeight = new Map<string, number>()
  const edgeWeight = new Map<string, number>()

  for (const v of votes) {
    const voterId = v.voter.id
    if (!targetsByVoter.has(voterId)) targetsByVoter.set(voterId, new Set())

    for (const t of (v.targets ?? [])) {
      targetsByVoter.get(voterId)!.add(t.id)
      outWeight.set(voterId, (outWeight.get(voterId) ?? 0) + 1)
      inWeight.set(t.id, (inWeight.get(t.id) ?? 0) + 1)
      const key = `${voterId}->${t.id}`
      edgeWeight.set(key, (edgeWeight.get(key) ?? 0) + 1)
    }
  }

  // --- Similarity matrix (Jaccard) between voters
    const jaccard = (a: Set<string>, b: Set<string>) => {
      if (a.size === 0 && b.size === 0) return 1
      if (a.size === 0 || b.size === 0) return 0

      let inter = 0
      a.forEach(x => {
        if (b.has(x)) inter++
      })

      const uni = a.size + b.size - inter
      return uni === 0 ? 0 : inter / uni
    }

  const voters = players.map(p => p.id)
  const sim = new Map<string, number>()
  for (let i = 0; i < voters.length; i++) {
    for (let j = i + 1; j < voters.length; j++) {
      const a = targetsByVoter.get(voters[i]) ?? new Set()
      const b = targetsByVoter.get(voters[j]) ?? new Set()
      const s = jaccard(a, b)
      sim.set(`${voters[i]}::${voters[j]}`, s)
    }
  }
  const getSim = (i: string, j: string) => {
    if (i === j) return 1
    const key = i < j ? `${i}::${j}` : `${j}::${i}`
    return sim.get(key) ?? 0
  }

  // --- Coalitions via simple similarity threshold graph (fast, explainable)
  const TH = 0.55
  const adjacency = new Map<string, string[]>()
  for (const id of voters) adjacency.set(id, [])
  for (let i = 0; i < voters.length; i++) {
    for (let j = i + 1; j < voters.length; j++) {
      const s = getSim(voters[i], voters[j])
      if (s >= TH) {
        adjacency.get(voters[i])!.push(voters[j])
        adjacency.get(voters[j])!.push(voters[i])
      }
    }
  }

  const coalitionOf = new Map<string, string | null>()
  for (const id of voters) coalitionOf.set(id, null)
  const coalitions: Array<{ id: string, members: string[], cohesion: number }> = []

  let cIdx = 1
  for (const start of voters) {
    if (coalitionOf.get(start)) continue
    const q = [start]
    const comp: string[] = []
    coalitionOf.set(start, `C${cIdx}`)
    while (q.length) {
      const x = q.shift()!
      comp.push(x)
      for (const y of adjacency.get(x) ?? []) {
        if (!coalitionOf.get(y)) {
          coalitionOf.set(y, `C${cIdx}`)
          q.push(y)
        }
      }
    }
    // only keep real groups (>=2), singletons become null
    if (comp.length >= 2) {
      const cohesion = avgPairwise(comp, getSim)
      coalitions.push({ id: `C${cIdx}`, members: comp, cohesion })
      cIdx++
    } else {
      coalitionOf.set(start, null)
    }
  }

  // Top coalition = tightest (cohesion) then biggest
  const topCoalition = coalitions
    .slice()
    .sort((a, b) => (b.cohesion - a.cohesion) || (b.members.length - a.members.length))[0]

  // --- Pro metrics per player
  const proPlayers = players.map(p => {
    const set = targetsByVoter.get(p.id) ?? new Set()
    const entropy = voteEntropy(p.id, votes)

    const coalitionId = coalitionOf.get(p.id) ?? null
    const within = coalitionId
      ? coalitions.find(c => c.id === coalitionId)?.members ?? []
      : []
    const withinAggression = within.length >= 2
      ? within
          .filter(x => x !== p.id)
          .reduce((acc, other) => acc + (edgeWeight.get(`${p.id}->${other}`) ?? 0), 0)
      : 0

    const outwardAggression = Array.from(set)
      .filter(t => within.length ? !within.includes(t) : true)
      .reduce((acc, t) => acc + (edgeWeight.get(`${p.id}->${t}`) ?? 0), 0)

    const simToTop = topCoalition
      ? avg(topCoalition.members.filter(x => x !== p.id).map(x => getSim(p.id, x)))
      : 0

    return {
      id: p.id,
      name: p.name,
      alive: p.alive,
      seat: p.seat ?? null,
      round: input.round,
      out_degree: outWeight.get(p.id) ?? 0,
      in_degree: inWeight.get(p.id) ?? 0,
      unique_targets: set.size,
      entropy,
      coalition: coalitionId,
      coalition_within_aggression: withinAggression,
      coalition_outward_aggression: outwardAggression,
      sim_to_top_coalition: simToTop,
    }
  })

  // --- Friendly suspicion score (heuristic, but stable + explainable)
  const friendlyPlayers = proPlayers.map(pp => {
    const reasons: string[] = []

    const coalition = pp.coalition ? coalitions.find(c => c.id === pp.coalition) : null

    // Signals
    const inTightCoalition = coalition && coalition.cohesion >= 0.65
    const lowInternalAggression = pp.coalition_within_aggression === 0 && (coalition?.members.length ?? 0) >= 2
    const coordinatedOutward = pp.coalition_outward_aggression >= 1 && inTightCoalition
    const chaoticVoting = pp.entropy >= 1.2 && pp.unique_targets >= 3

    if (inTightCoalition) reasons.push("High voting similarity within a coalition")
    if (lowInternalAggression) reasons.push("Rarely votes against members of their own group")
    if (coordinatedOutward) reasons.push("Votes are mostly directed outside the group")
    if (chaoticVoting) reasons.push("Highly inconsistent target changes (high entropy)")

    // Score: keep it bounded and smooth.
    // Note: this is NOT a true probability; it is a suspicion index.
    let z = -0.6
    if (inTightCoalition) z += 0.9
    if (lowInternalAggression) z += 0.7
    if (coordinatedOutward) z += 0.5
    if (chaoticVoting) z += 0.4
    z += 0.12 * (pp.out_degree)
    z -= 0.06 * (pp.in_degree)

    const suspicion = sigmoid(z)

    // Keep 2-3 reasons max for friendliness
    const topReasons = reasons.slice(0, 3)
    if (topReasons.length === 0) topReasons.push("Недостаточно данных: голосов мало")

    return {
      id: pp.id,
      name: pp.name,
      alive: pp.alive,
      coalition: pp.coalition,
      suspicion_pct: Math.round(suspicion * 100),
      reasons: topReasons,
    }
  })

  // Sort friendly view: suspicious first
  friendlyPlayers.sort((a, b) => (b.suspicion_pct - a.suspicion_pct) || a.name.localeCompare(b.name))

  const friendlyCoalitions = coalitions
    .map(c => ({
      id: c.id,
      cohesion: round2(c.cohesion),
      members: c.members.map(id => players.find(p => p.id === id)?.name ?? id),
      label: `Коалиция ${c.id} (cohesion ${round2(c.cohesion)})`,
    }))
    .sort((a, b) => (b.cohesion - a.cohesion) || (b.members.length - a.members.length))

  return {
    meta: {
      round: input.round,
      votes: votes.length,
      similarity_threshold: TH,
    },
    friendly: {
      players: friendlyPlayers,
      coalitions: friendlyCoalitions,
    },
    pro: {
      players: proPlayers
        .slice()
        .sort((a, b) => (b.sim_to_top_coalition - a.sim_to_top_coalition) || (b.out_degree - a.out_degree)),
    },
  }
}

function sigmoid(z: number) {
  return 1 / (1 + Math.exp(-z))
}

function round2(x: number) {
  return Math.round(x * 100) / 100
}

function avg(xs: number[]) {
  if (!xs.length) return 0
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

function avgPairwise(ids: string[], sim: (a: string, b: string) => number) {
  if (ids.length < 2) return 0
  let sum = 0
  let cnt = 0
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      sum += sim(ids[i], ids[j])
      cnt++
    }
  }
  return cnt ? sum / cnt : 0
}

function voteEntropy(voterId: string, votes: Array<{ voter: { id: string }, targets: Array<{ id: string }> }>) {
  const counts = new Map<string, number>()
  let total = 0
  for (const v of votes) {
    if (v.voter.id !== voterId) continue
    for (const t of (v.targets ?? [])) {
      counts.set(t.id, (counts.get(t.id) ?? 0) + 1)
      total++
    }
  }
  if (total <= 1) return 0
  let h = 0
  for (const c of counts.values()) {
    const p = c / total
    h -= p * Math.log(p)
  }
  return h
}