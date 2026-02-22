import Link from "next/link"
import { ROLES } from "@/src/data/roles"
import RoleCard from "@/components/RoleCard"

export default function HelpPage(){

return(

<main className="p-6 max-w-6xl mx-auto flex flex-col gap-10">

<h1 className="text-4xl font-bold">Mafia Analyzer — Rules & Roles</h1>

<Link href="/" className="text-blue-600 underline">← Back</Link>

{/* GENERAL RULES */}
<section className="flex flex-col gap-3">

<h2 className="text-2xl font-semibold">Game Mechanics</h2>

<p>
This tool is a notebook for the host. The real game happens offline.
The host records roles, votes and night actions.
Players may optionally open the game page to view public state.
</p>

<ul className="list-disc ml-6">
<li>Game starts in SETUP mode</li>
<li>Host assigns roles manually</li>
<li>Press START GAME → Round 1 Day</li>
<li>Votes are recorded by host</li>
<li>Night actions are recorded manually</li>
<li>End Game → archive mode</li>
</ul>

</section>


{/* MODES */}
<section className="flex flex-col gap-3">

<h2 className="text-2xl font-semibold">Game Modes</h2>

<h3 className="font-bold">Classic Mode</h3>

<p>
Traditional Mafia game with investigative and protective roles.
Goal: eliminate mafia or outnumber town.
</p>

<h3 className="font-bold mt-3">Dark Cult Mode</h3>

<p>
Includes hidden cult that recruits followers at night.
Cult wins if only cult members remain alive.
If Patriarch dies — entire cult dies.
Some roles interact specially with cult recruitment.
</p>

</section>


{/* ROLES */}
{["classic","dark"].map(mode=>{

const roles=ROLES.filter(r=>r.mode===mode)

return(

<section key={mode}>

<h2 className="text-2xl font-semibold mb-4">
{mode==="classic"?"Classic Roles":"Dark Cult Roles"}
</h2>

<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

{roles.map(role=>(
<RoleCard key={role.id} role={role}/>
))}

</div>

</section>

)

})}

</main>

)

}