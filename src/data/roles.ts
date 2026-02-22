// src/data/roles.ts

export type Role = {
  id: string
  name: string
  mode: "classic" | "dark"
  team: "mafia" | "town" | "cult" | "neutral"
  type: string        // MTG-style: Human, Cultist, Undead...
  ability: string
  description: string
  flavor?: string
  image: string
}

export const ROLES: Role[] = [

/* =====================
   CLASSIC MODE
===================== */

{
id:"don",
name:"Don Mafia",
mode:"classic",
team:"mafia",
type:"Human Crime Boss",
ability:"Leads mafia at night",
description:"Main mafia leader. Makes final decision on night kill.",
flavor:"An offer you can't refuse.",
image:"/roles/don.png"
},

{
id:"mafia",
name:"Mafia",
mode:"classic",
team:"mafia",
type:"Human Criminal",
ability:"Participates in night kill",
description:"Regular mafia member.",
flavor:"Just business.",
image:"/roles/mafia.png"
},

{
id:"detective",
name:"Detective",
mode:"classic",
team:"town",
type:"Human Investigator",
ability:"Check one player each night",
description:"Learns if target is mafia.",
flavor:"The truth always leaves traces.",
image:"/roles/detective.png"
},

{
id:"doctor",
name:"Doctor",
mode:"classic",
team:"town",
type:"Human Medic",
ability:"Protect one player at night",
description:"Saved player survives mafia attack.",
flavor:"Not today.",
image:"/roles/doctor.png"
},

{
id:"party_girl",
name:"Party Girl",
mode:"classic",
team:"neutral",
type:"Human Chaos",
ability:"Spend night with someone",
description:"Target may avoid mafia kill. If target is hanged — Party Girl dies too.",
flavor:"Bad decisions make great stories.",
image:"/roles/party_girl.png"
},

{
id:"hacker",
name:"Hacker",
mode:"classic",
team:"town",
type:"Human Tech",
ability:"Reveals identities in powers of two days",
description:"Each day 1,2,4,8… may expose a player publicly. If Party Girl visits him — he dies.",
flavor:"Access granted.",
image:"/roles/hacker.png"
},

{
id:"advocate",
name:"Advocate",
mode:"classic",
team:"town",
type:"Human Lawyer",
ability:"Protect from vote next day",
description:"Chosen player cannot be voted tomorrow.",
flavor:"Objection sustained.",
image:"/roles/advocate.png"
},

{
id:"bureaucrat",
name:"Bureaucrat",
mode:"classic",
team:"town",
type:"Human Official",
ability:"Remove someone's vote next day",
description:"Target loses voting rights.",
flavor:"Please fill form 27B/6.",
image:"/roles/bureaucrat.png"
},

{
id:"psychopath",
name:"Psychopath",
mode:"classic",
team:"neutral",
type:"Human Killer",
ability:"May kill at night",
description:"Independent killer.",
flavor:"Some people just want chaos.",
image:"/roles/psychopath.png"
},

{
id:"priest",
name:"Priest",
mode:"classic",
team:"town",
type:"Human Clergy",
ability:"Special religious effects",
description:"If Party Girl visits Priest — she loses power forever. If Priest dies: mafia skip next turn; if hanged — town skips next vote.",
flavor:"May God forgive you.",
image:"/roles/priest.png"
},

{
id:"vampire",
name:"Vampire",
mode:"classic",
team:"town",
type:"Undead",
ability:"Cannot be killed at night",
description:"Only day hanging works.",
flavor:"Night is my ally.",
image:"/roles/vampire.png"
},


/* =====================
   DARK CULT MODE
===================== */

{
id:"patriarch",
name:"Cult Patriarch",
mode:"dark",
team:"cult",
type:"Cult Leader",
ability:"Recruit follower each night",
description:"If Patriarch dies — all cultists die.",
flavor:"The city will kneel.",
image:"/roles/patriarch.png"
},

{
id:"cultist",
name:"Cultist",
mode:"dark",
team:"cult",
type:"Cult Follower",
ability:"Works for cult",
description:"Recruited during game. Keeps original card secret.",
flavor:"The truth has found me.",
image:"/roles/cultist.png"
},

{
id:"agent",
name:"Agent",
mode:"dark",
team:"town",
type:"Government Operative",
ability:"Detect cult OR one kill",
description:"May detect cult/patriarch. Can perform one kill. If Patriarch dies — Agent wins.",
flavor:"Mission classified.",
image:"/roles/agent.png"
},

{
id:"scientist",
name:"Scientist",
mode:"dark",
team:"town",
type:"Human Genius",
ability:"Cannot be recruited",
description:"Patriarch notices missing person if revealed.",
flavor:"Science resists superstition.",
image:"/roles/scientist.png"
},

/* shared roles also used in dark mode */

{
id:"don_dark",
name:"Don Mafia",
mode:"dark",
team:"mafia",
type:"Human Crime Boss",
ability:"Leads mafia",
description:"Same as classic Don.",
flavor:"Power never sleeps.",
image:"/roles/don.png"
},

{
id:"mafia_dark",
name:"Mafia",
mode:"dark",
team:"mafia",
type:"Human Criminal",
ability:"Night kill",
description:"Regular mafia.",
flavor:"Still business.",
image:"/roles/mafia.png"
},

{
id:"doctor_dark",
name:"Doctor",
mode:"dark",
team:"town",
type:"Human Medic",
ability:"Protect at night",
description:"Same as classic doctor.",
flavor:"Stitch by stitch.",
image:"/roles/doctor.png"
},

{
id:"detective_dark",
name:"Detective",
mode:"dark",
team:"town",
type:"Human Investigator",
ability:"Check mafia",
description:"Same as classic.",
flavor:"Nothing escapes me.",
image:"/roles/detective.png"
},

{
id:"advocate_dark",
name:"Advocate",
mode:"dark",
team:"town",
type:"Human Lawyer",
ability:"Protect from vote",
description:"Same as classic.",
flavor:"Case dismissed.",
image:"/roles/advocate.png"
},

{
id:"party_dark",
name:"Party Girl",
mode:"dark",
team:"neutral",
type:"Human Chaos",
ability:"Night visit",
description:"Same as classic.",
flavor:"Oops.",
image:"/roles/party_girl.png"
},

{
id:"hacker_dark",
name:"Hacker",
mode:"dark",
team:"town",
type:"Human Tech",
ability:"Expose identities",
description:"Same as classic.",
flavor:"Firewall breached.",
image:"/roles/hacker.png"
},

{
id:"bureaucrat_dark",
name:"Bureaucrat",
mode:"dark",
team:"town",
type:"Human Official",
ability:"Remove vote",
description:"Same as classic.",
flavor:"Stamp approved.",
image:"/roles/bureaucrat.png"
},

{
id:"vampire_dark",
name:"Vampire",
mode:"dark",
team:"town",
type:"Undead",
ability:"Night immune",
description:"Same as classic.",
flavor:"Still undead.",
image:"/roles/vampire.png"
},

]