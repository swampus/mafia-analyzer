export type Player = {
  id: string
  name: string
  alive: boolean
}

export type GameSession = {
  id: string
  adminCode: string
  players: Player[]
  votes: any[]
  phase: "day" | "night"
  round: number
  createdAt: number
}