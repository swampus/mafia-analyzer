import Link from "next/link"
import Image from "next/image"

export default function HomePage() {

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-10 p-6">

      {/* HERO BLOCK */}
      <div className="flex flex-col md:flex-row items-center gap-8">

        {/* ROUND IMAGE */}
        <div className="relative w-64 h-64 md:w-72 md:h-72">
          <Image
            src="/mafia.png"
            alt="Mafia game"
            fill
            className="object-cover rounded-full shadow-2xl border-4 border-white"
          />
        </div>

        {/* TITLE + BUTTONS */}
        <div className="flex flex-col items-center md:items-start gap-6">

          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold">Mafia Analyzer</h1>
            <p className="text-gray-600 mt-2 max-w-md">
              A lightweight tool for hosts to manage offline Mafia games,
              track votes, rounds, night actions, and review game history.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-64">

            <Link
              href="/host"
              className="px-6 py-4 bg-black text-white rounded-2xl text-center hover:scale-[1.02] transition"
            >
              HOST GAME
            </Link>

            <Link
              href="/join"
              className="px-6 py-4 bg-gray-800 text-white rounded-2xl text-center hover:scale-[1.02] transition"
            >
              JOIN GAME
            </Link>

            <Link
              href="/help"
              className="px-6 py-4 bg-gray-200 rounded-2xl text-center hover:scale-[1.02] transition"
            >
              HELP / RULES
            </Link>

          </div>

        </div>

      </div>

      {/* INFO CARDS */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full">

        <InfoCard
          title="Designed for the Host v.0.2"
          text="Run the game smoothly — track roles, votes, rounds, and night actions. Players can optionally follow history and use analytical insights to understand game dynamics."
        />

        <InfoCard
          title="Two Game Modes"
          text="Play classic Mafia or try the Dark Cult mode with recruitment mechanics, hidden alliances, and evolving strategy."
        />

        <InfoCard
          title="No Registration Needed"
          text="Free and anonymous. Only the host needs the app — players can simply sit at the table and play."
        />

        <InfoCard
          title="Cloud Hosted"
          text="Runs on Vercel with Upstash storage. Fast, lightweight, and accessible from any device."
        />

       <InfoCard
         title="Open Source"
         text={
           <>
             MIT licensed. Explore or contribute on{" "}
             <a
               href="https://github.com/swampus/mafia-analyzer"
               target="_blank"
               rel="noopener noreferrer"
               className="underline font-medium"
             >
               GitHub
             </a>
           </>
         }
       />

       <InfoCard
         title="Ideas & Issues"
         text={
           <>
             Have suggestions? Open an issue on{" "}
             <a
               href="https://github.com/swampus/mafia-analyzer/issues"
               target="_blank"
               rel="noopener noreferrer"
               className="underline font-medium"
             >
               GitHub Issues
             </a>
             {" "}and help improve the project.
           </>
         }
       />

      </div>

    </main>
  )
}

function InfoCard({title,text}:{title:string,text:React.ReactNode}){
  return(
    <div className="rounded-2xl border p-5 bg-white/70 backdrop-blur shadow-sm">
      <div className="font-semibold mb-2">{title}</div>
      <div className="text-sm text-gray-600">{text}</div>
    </div>
  )
}