# 🕵️ Mafia Analyzer

**Real-time graph analytics for Mafia / social deduction games.**  
Track votes, detect coalitions, and reveal structural behavior patterns during gameplay.

👉 **Live demo:** https://mafia-analyzer.vercel.app/  
👉 **Article:** https://medium.com/@dmitrijs.gavrilovs.swampus/players-dont-matter-their-votes-do-a-graph-theoretic-view-of-mafia-a44a2aabb8dc

---

## 📌 What is this?

Mafia Analyzer is a lightweight web tool for running Mafia (or similar social deduction games) with **live voting tracking** and **graph-based analytics**.

Instead of relying only on memory or intuition, the system records actual votes and builds a **directed voting graph** that reveals:

- voting patterns
- coalition behavior
- influence structures
- suspicious dynamics

Because in Mafia:

> Players may say anything. Votes reveal what actually happens.

---

## 🎯 Features

### 🎮 Game management (Host mode)

The host can:

- create a game session
- add players
- assign roles
- switch **day / night**
- mark eliminated players
- record votes each round
- share the **game code** with players

---

### 👀 Player mode (Read-only)

Players can:

- join using the game code
- see active players
- view vote history per round
- watch the live voting graph
- see analytics in real time

No hidden roles are leaked.

---

### 📊 Real-time Analytics

The system builds a voting graph and computes:

- **out_degree** — how many votes a player casts
- **in_degree** — how many votes they receive
- **entropy** — stability of their voting targets
- **coalition detection** — groups with similar voting behavior
- **bandwagon score** — tendency to follow majority votes
- **influence score** — structural pressure propagation (PageRank-like)

These signals are combined into an **explainable suspicion index** with human-readable reasons.

More details in the article:

👉 *Players Don’t Matter. Their Votes Do: A Graph-Theoretic View of Mafia*

---

## 🚀 How to use

### For the Host

1. Open the app  
   https://mafia-analyzer.vercel.app/

2. Click **Host Game**

3. Add players

4. Assign roles (private)

5. Start the game

6. Each day:
    - record votes
    - update eliminated players
    - switch day/night

7. Share the **game code** with players

---

### For Players

1. Open the site
2. Enter the **game code**
3. Watch:

- live vote graph
- vote history
- active players
- analytics

Read-only mode ensures fair play.

---

## 🧠 Technical Idea

Each round produces a **directed weighted graph**:

- nodes → players
- edges → votes (voter → target)
- weights → vote frequency

Analytics include:

- Jaccard similarity for coalition detection
- BFS connected components for grouping
- Shannon entropy for behavioral stability
- majority alignment metrics
- iterative influence propagation

The goal is **interpretable real-time structural analysis**, not opaque ML.

---

## 🛠 Tech Stack

- Next.js / React
- TypeScript
- vis-network graph visualization
- Serverless deployment on Vercel

---

## 💡 Why this exists

Mafia is usually treated as a psychological game.

But structurally, it produces relational data.

Once votes are recorded as a graph, patterns emerge that are difficult to notice manually.

This project explores how far simple graph theory can go in analyzing social deduction dynamics.

---

## 📦 Local Development

```bash
git clone https://github.com/swampus/mafia-analyzer.git
cd mafia-analyzer
npm install
npm run dev
```

Open:

http://localhost:3000

---

## 🤝 Contributing

Ideas, issues, and improvements are welcome.

If you want to experiment with additional analytics or visualization features — feel free to open a PR or discussion.

---

## 📜 License

MIT License

---

## ⭐ If you like this project

- star the repo
- share the article
- try it during your next Mafia night

And remember:

**In social deduction games, confidence is loud — structure is honest.**
