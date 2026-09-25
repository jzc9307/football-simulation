import { ROLE_GROUP } from "./config.js";
import { GUEST_CRESTS } from "./guestAssets.js";
import { FIRST_SEASON_UCL_ROUNDS } from "./firstSeasonFixtures.js";

const LEAGUE_KEYS={PL:"plClubs",LALIGA:"laligaClubs",SERIEA:"serieaClubs",BUNDES:"bundesligaClubs",LIGUE1:"ligue1Clubs",PORTUGAL:"portugalClubs"};
const UCL_SLOTS={PL:4,LALIGA:4,SERIEA:4,BUNDES:4,LIGUE1:4,PORTUGAL:2};
// Fixed first-season qualifiers. Subsequent seasons use the five domestic top fours;
// the remaining places come from this persistent European guest-club world.
// 2026/27 is a fixed, real-world-inspired entry list. Lyon appears in the
// supplied Europa list too, so it is intentionally kept in Europa: that keeps
// the two 36-club league phases mutually exclusive.
const FIRST_SEASON_IDS=["ars","ast","liv","man","mun","lil","par2","rcl","bor","fcb2","rbl","vfb","rom","com","int","nap","atl","fcb","rea","rma","vil","pt-porto","pt-sporting"];
const FIRST_SEASON_GUEST_IDS=["lask","sabah","bru","sla","aek","fey","psv","bod","viking","slovan","fener","gal","sha"];
const GUESTS=[
  ["psv","PSV Eindhoven","Netherlands",79,"#df2537"],
  ["fey","Feyenoord","Netherlands",78,"#e62e36"],["bru","Club Brugge","Belgium",77,"#173d92"],["cel","Celtic","Scotland",76,"#198659"],["ran","Rangers","Scotland",75,"#2570bc"],
  ["sha","Shakhtar Donetsk","Ukraine",77,"#e46b20"],["sal","RB Salzburg","Austria",77,"#d21f3c"],["gal","Galatasaray","Türkiye",78,"#f2a900"],["sla","Slavia Praha","Czechia",75,"#d51b2d"],
  ["oly","Olympiacos","Greece",76,"#d8202d"],["din","GNK Dinamo Zagreb","Croatia",74,"#2461aa"],["ybo","BSC Young Boys","Switzerland",74,"#e8bf1c"],["bod","Bodø/Glimt","Norway",73,"#e8c022"],
  ["ajae","AFC Ajax","Netherlands",78,"#d82332"],["fcs","FC København","Denmark",73,"#204b91"],["lud","Ludogorets","Bulgaria",72,"#1d9c57"],["qar","Qarabağ FK","Azerbaijan",71,"#244c92"],
  ["ararat","FC Ararat-Armenia","Armenia",67,"#cf262d"],["sturm","SK Sturm Graz","Austria",73,"#121212"],["ander","R.S.C. Anderlecht","Belgium",74,"#5b2c83"],["usg","Royale Union Saint-Gilloise","Belgium",73,"#e2b31d"],["levski","PFC Levski Sofia","Bulgaria",69,"#1b5ca8"],["omonoia","Omonoia FC","Cyprus",68,"#18723e"],["sparta","AC Sparta Praha","Czechia",73,"#7b263b"],["plzen","FC Viktoria Plzeň","Czechia",72,"#254b9d"],["ofi","OFI Crete FC","Greece",67,"#1c1c1c"],["ferenc","Ferencvárosi TC","Hungary",71,"#168f49"],["hapoel","Hapoel Be'er Sheva","Israel",68,"#d5232d"],["az","AZ Alkmaar","Netherlands",74,"#d42027"],["nec","NEC Nijmegen","Netherlands",70,"#bd1e2d"],["lillestrom","Lillestrøm SK","Norway",68,"#f2c300"],["jagiell","Jagiellonia Białystok","Poland",69,"#d9232e"],["lech","Lech Poznań","Poland",70,"#1e71b8"],["torreense","S.C.U. Torreense","Portugal",66,"#b4192a"],["celje","NK Celje","Slovenia",68,"#f1c21b"],["besiktas","Beşiktaş J.K.","Türkiye",72,"#191919"],["lask","LASK","Austria",71,"#151515"],["sabah","Sabah FK","Azerbaijan",67,"#e21f32"],["aek","AEK Athens FC","Greece",72,"#f4c21d"],["viking","Viking FK","Norway",69,"#da2a28"],["slovan","ŠK Slovan Bratislava","Slovakia",70,"#53a6db"],["fener","Fenerbahçe SK","Türkiye",75,"#f0c400"],
];
// Named senior squads replace the old procedurally generated European players.
// They are deliberately kept at 18 players: enough depth for injuries, rotation
// and the transfer market while avoiding a made-up reserve bench.
const REAL_GUEST_SQUADS={
 ben:"Anatoliy Trubin|GK;Samuel Soares|GK;António Silva|CB;Nicolás Otamendi|CB;Tomás Araújo|CB;Samuel Dahl|LB;Alexander Bah|RB;Fredrik Aursnes|CM;Richard Ríos|CM;Enzo Barrenechea|CDM;Heorhiy Sudakov|CAM;Andreas Schjelderup|LW;Gianluca Prestianni|RW;Kerem Aktürkoğlu|LW;Vangelis Pavlidis|ST;Franjo Ivanović|ST;Henrique Araújo|ST;Leandro Barreiro|CM",
 spo:"Rui Silva|GK;João Virgínia|GK;Gonçalo Inácio|CB;Ousmane Diomande|CB;Zeno Debast|CB;Matheus Reis|LB;Iván Fresneda|RB;Morten Hjulmand|CDM;Hidemasa Morita|CM;Daniel Bragança|CM;Pedro Gonçalves|CAM;Geovany Quenda|RW;Geny Catamo|RW;Francisco Trincão|RW;Maxi Araújo|LW;Conrad Harder|ST;Luis Suárez|ST;Fotis Ioannidis|ST",
 por:"Diogo Costa|GK;Cláudio Ramos|GK;Nehuén Pérez|CB;Jan Bednarek|CB;Tiago Djaló|CB;Francisco Moura|LB;Martim Fernandes|RB;Alan Varela|CDM;Gabri Veiga|CM;Rodrigo Mora|CAM;Fábio Vieira|CAM;Pepê|RW;Borja Sainz|LW;William Gomes|LW;Samu Aghehowa|ST;Deniz Gül|ST;Luuk de Jong|ST;Zaidu Sanusi|LB",
 psv:"Matej Kovář|GK;Nick Olij|GK;Ryan Flamingo|CB;Armando Obispo|CB;Adamo Nagalo|CB;Sergiño Dest|RB;Mauro Júnior|LB;Jerdy Schouten|CDM;Joey Veerman|CM;Ismael Saibari|CAM;Guus Til|CAM;Ivan Perišić|LW;Ruben van Bommel|LW;Couhaib Driouech|LW;Ricardo Pepi|ST;Alassane Pléa|ST;Luuk de Jong|ST;Kiliann Sildillia|RB",
 fey:"Timon Wellenreuther|GK;Justin Bijlow|GK;Gernot Trauner|CB;Thomas Beelen|CB;Facundo González|CB;Givairo Read|RB;Quilindschy Hartman|LB;In-beom Hwang|CM;Quinten Timber|CM;Jakub Moder|CM;Calvin Stengs|CAM;Igor Paixão|LW;Anis Hadj Moussa|RW;Leo Sauer|LW;Ayase Ueda|ST;Julián Carranza|ST;Casper Tengstedt|ST;Bart Nieuwkoop|RB",
 bru:"Simon Mignolet|GK;Nordin Jackers|GK;Joel Ordóñez|CB;Brandon Mechele|CB;Jorne Spileers|CB;Kyriani Sabbe|RB;Bjorn Meijer|LB;Ardon Jashari|CM;Raphael Onyedika|CDM;Hans Vanaken|CAM;Hugo Vetlesen|CM;Christos Tzolis|LW;Carlos Forbs|LW;Mamadou Diakhon|RW;Romeo Vermant|ST;Nicolo Tresoldi|ST;Ferran Jutglà|ST;Joaquin Seys|LB",
 cel:"Kasper Schmeichel|GK;Viljami Sinisalo|GK;Cameron Carter-Vickers|CB;Liam Scales|CB;Auston Trusty|CB;Alistair Johnston|RB;Kieran Tierney|LB;Callum McGregor|CDM;Reo Hatate|CM;Arne Engels|CM;Paulo Bernardo|CAM;Daizen Maeda|LW;Jota|LW;Yang Hyun-jun|RW;James Forrest|RW;Adam Idah|ST;Johnny Kenny|ST;Anthony Ralston|RB",
 ran:"Jack Butland|GK;Liam Kelly|GK;John Souttar|CB;Robin Pröpper|CB;Clinton Nsiala|CB;James Tavernier|RB;Jefté|LB;Nicolas Raskin|CDM;Mohamed Diomande|CM;Connor Barron|CM;Lyall Cameron|CAM;Oscar Cortés|LW;Rabbi Matondo|LW;Findlay Curtis|RW;Hamza Igamane|ST;Cyriel Dessers|ST;Danilo|ST;Dujon Sterling|RB",
 sha:"Dmytro Riznyk|GK;Kiril Fesiun|GK;Mykola Matviyenko|CB;Valeriy Bondar|CB;Alaa Ghram|CB;Yukhym Konoplia|RB;Pedro Henrique|LB;Marlon Gomes|CM;Dmytro Kryskiv|CM;Artem Bondarenko|CAM;Georgiy Sudakov|CAM;Kevin|LW;Eguinaldo|LW;Newerton|RW;Oleksandr Zubkov|RW;Kauã Elias|ST;Lassina Traoré|ST;Vinicius Tobias|RB",
 sal:"Alexander Schlager|GK;Janis Blaswich|GK;Samson Baidoo|CB;Kamil Piątkowski|CB;Joane Gadou|CB;Stefan Lainer|RB;Frans Krätzig|LB;Mads Bidstrup|CDM;Lucas Gourna-Douath|CM;Maurits Kjærgaard|CM;Sota Kitano|CAM;Dorgeles Nene|RW;Adam Daghim|RW;Yorbe Vertessen|LW;Karim Konaté|ST;Petar Ratkov|ST;Moussa Kounfolo Yeo|ST;Mamady Diambou|CM",
 gal:"Uğurcan Çakır|GK;Günay Güvenç|GK;Davinson Sánchez|CB;Abdülkerim Bardakcı|CB;Kaan Ayhan|CB;Roland Sallai|RB;Ismail Jakobs|LB;Lucas Torreira|CDM;Mario Lemina|CM;Gabriel Sara|CAM;İlkay Gündoğan|CM;Yunus Akgün|RW;Barış Alper Yılmaz|RW;Leroy Sané|LW;Victor Osimhen|ST;Mauro Icardi|ST;Ahmed Kutucu|ST;Eren Elmalı|LB",
 sla:"Jindřich Staněk|GK;Aleš Mandous|GK;Tomáš Holeš|CB;Igoh Ogbu|CB;David Zima|CB;Jan Bořil|LB;David Douděra|RB;Oscar Dorley|CDM;Christos Zafeiris|CM;David Moses|CM;Lukáš Provod|CAM;Ivan Schranz|RW;Vasil Kušej|LW;Youssoupha Sanyang|LW;Mojmír Chytil|ST;Tomáš Chorý|ST;Daniel Fila|ST;Michal Sadílek|CM",
 oly:"Konstantinos Tzolakis|GK;Alexandros Paschalakis|GK;Panagiotis Retsos|CB;Lorenzo Pirola|CB;David Carmo|CB;Rodinei|RB;Francisco Ortega|LB;Santiago Hezze|CDM;Dani García|CM;Christos Mouzakitis|CM;Chiquinho|CAM;Gelson Martins|RW;Kristoffer Velde|LW;Costas Fortounis|CAM;Ayoub El Kaabi|ST;Roman Yaremchuk|ST;Mehdi Taremi|ST;Costinha|RB",
 din:"Ivan Nevistić|GK;Danijel Zagorac|GK;Kevin Theophile-Catherine|CB;Raúl Torrente|CB;Mauro Perković|CB;Ronaël Pierre-Gabriel|RB;Bruno Goda|LB;Josip Mišić|CDM;Marko Rog|CM;Luka Stojković|CAM;Martin Baturina|CAM;Arber Hoxha|LW;Marko Pjaca|LW;Dario Špikić|RW;Sandro Kulenović|ST;Dion Drena Beljo|ST;Bruno Petković|ST;Bartol Franjić|CM",
 ybo:"Marvin Keller|GK;David von Ballmoos|GK;Loris Benito|CB;Mohamed Camara|CB;Tanguy Zoukrou|CB;Lewin Blum|RB;Jaouen Hadjam|LB;Sandro Lauper|CDM;Filip Ugrinić|CM;Kastriot Imeri|CAM;Christian Fassnacht|CAM;Alan Virginius|LW;Joel Monteiro|LW;Meschack Elia|RW;Cedric Itten|ST;Silvère Ganvoula|ST;Ebrima Colley|ST;Darian Males|CM",
 bod:"Nikita Haikin|GK;Julian Faye Lund|GK;Odin Bjørtuft|CB;Jostein Gundersen|CB;Villads Nielsen|CB;Fredrik Sjøvold|RB;Fredrik André Bjørkan|LB;Patrick Berg|CDM;Sondre Fet|CM;Ulrik Saltnes|CM;Håkon Evjen|CAM;Jens Petter Hauge|LW;Ole Didrik Blomberg|RW;Sondre Sørli|RW;Kasper Høgh|ST;Andreas Helmersen|ST;Mikkel Bro Hansen|ST;Haitam Aleesami|LB",
 ajae:"Remko Pasveer|GK;Vitezslav Jaroš|GK;Josip Šutalo|CB;Youri Baas|CB;Dies Janse|CB;Anton Gaaei|RB;Owen Wijndal|LB;Kenneth Taylor|CM;Davy Klaassen|CM;Kian Fitz-Jim|CM;Steven Berghuis|CAM;Mika Godts|LW;Raúl Moro|LW;Bertrand Traoré|RW;Wout Weghorst|ST;Brian Brobbey|ST;Kasper Dolberg|ST;Lucas Rosa|RB",
 fcs:"Dominik Kotarski|GK;Nathan Trott|GK;Gabriel Pereira|CB;Pantelis Hatzidiakos|CB;Kevin Diks|CB;Rodrigo Huescas|RB;Birger Meling|LB;Thomas Delaney|CDM;Lukas Lerager|CM;Victor Froholdt|CM;Mohamed Elyounoussi|CAM;Elias Achouri|LW;Viktor Claesson|RW;Andreas Cornelius|ST;Jordan Larsson|ST;Robert|ST;Magnus Mattsson|CAM;William Clem|CM",
 lud:"Hendrik Bonmann|GK;Sergio Padt|GK;Olivier Verdon|CB;Dinis Almeida|CB;Edvin Kurtulus|CB;Aslak Fonn Witry|RB;Anton Nedyalkov|LB;Pedro Naressi|CDM;Jakub Piotrowski|CM;Deroy Duarte|CM;Caio Vidal|CAM;Rick|LW;Bernard Tekpetey|RW;Kwadwo Duah|ST;Rwan Seco|ST;Matias Tissera|ST;Son|LB;Emanuel Insua|LB",
 qar:"Mateusz Kochalski|GK;Shahruddin Mahammadaliyev|GK;Bahlul Mustafazada|CB;Kevin Medina|CB;Matheus Silva|CB;Marko Janković|CM;Elvin Cafarquliyev|LB;Tural Bayramov|RB;Julio Romão|CDM;Kady Borges|CAM;Leandro Andrade|CAM;Abdellah Zoubir|LW;Redon Xhixha|RW;Nəriman Axundzadə|RW;Musa Qurbanlı|ST;Juninho|ST;Hamidou Keyta|ST;Yassine Benzia|CAM",
};
function seeded(input){let h=2166136261;for(const ch of input){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0)/4294967295;}
function slug(name){return name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");}
const FALLBACK_ROLES=["GK","GK","CB","CB","CB","LB","RB","CDM","CM","CM","CAM","LW","RW","LW","RW","ST","ST","ST"];
function guestPlayers(id,base){
  const named=(REAL_GUEST_SQUADS[id]||"").split(";").filter(Boolean);
  const rows=named.length?named:FALLBACK_ROLES.map((role,index)=>`${id.replace(/(^|[-_])\\w/g,part=>part.replace("-"," ").toUpperCase())} ${role} ${index+1}|${role}`);
  return rows.map((row,index)=>{const [name,role]=row.split("|"),roll=seeded(`${id}:${name}`),age=18+Math.floor(roll*16),starterBonus=index<2?0:index<11?2:index<15?0:-2,ovr=Math.max(63,Math.min(86,Math.round(base+starterBonus+(roll-.5)*5))),potential=Math.max(ovr,Math.min(91,ovr+(age<21?7:age<24?4:age<28?2:0)));return {id:`eu-${id}-${index}`,slug:slug(name),name,role,group:ROLE_GROUP[role],age,ovr,potential,value:Math.max(1,Math.round((ovr-57)*(ovr-57)*.09)),stamina:70+Math.floor(seeded(`${id}:s:${name}`)*20),club:`eu-${id}`,number:index===0?1:index===1?12:index+1,condition:100,energy:100,confidence:0,appearances:0};});
}
export function buildEuropeanGuestClubs(){return GUESTS.map(([id,name,country,base,color])=>({id:`eu-${id}`,name,shortName:name.replace(/^FC |^SL |^AFC |^GNK |^BSC /,""),country,color,crestUrl:GUEST_CRESTS[`eu-${id}`],budget:Math.round((base-65)*4+28),preferredFormation:"4-3-3",leagueAvg:base,guest:true,players:guestPlayers(id,base)}));}
// Existing saves predate part of the European guest world. Preserve their
// player-state changes while ensuring a load also gains every new club.
export function mergedEuropeanGuestClubs(state){
 const savedById=new Map((state?.europeanGuestClubs||[]).map(club=>[club.id,club]));
 return buildEuropeanGuestClubs().map(club=>{const saved=savedById.get(club.id);return saved?{...club,...saved,players:saved.players?.length?saved.players:club.players}:club;});
}
function strength(club){const best=[...club.players].sort((a,b)=>b.ovr-a.ovr).slice(0,11);return best.reduce((sum,player)=>sum+player.ovr,0)/Math.max(1,best.length);}
function stableShuffle(items,seed){return [...items].sort((a,b)=>seeded(`${seed}:${a.id}`)-seeded(`${seed}:${b.id}`));}
function clubMap(state){return new Map(Object.values(LEAGUE_KEYS).flatMap(key=>state[key]||[]).map(club=>[club.id,club]));}
export function uclQualified(state){return selectUclField(state).some(club=>club.id===state.myClubId);}
export function selectUclField(state){
  const domestic=clubMap(state),guests=mergedEuropeanGuestClubs(state);
  if((state.season||1)===1){const guestById=new Map(guests.map(club=>[club.id.replace(/^eu-/,""),club]));return [...FIRST_SEASON_IDS.map(id=>domestic.get(id)).filter(Boolean),...FIRST_SEASON_GUEST_IDS.map(id=>guestById.get(id)).filter(Boolean)];}
  const qualifiers=Object.entries(LEAGUE_KEYS).flatMap(([league,key])=>{const clubs=state[key]||[];const rows=state.qualificationTables?.[league]||(league===state.league&&state.tableFinal);const ranks=rows?.length?new Map(rows.map((row,index)=>[row.id,index])):null;return [...clubs].sort((a,b)=>ranks?(ranks.get(a.id)??999)-(ranks.get(b.id)??999):strength(b)-strength(a)).slice(0,UCL_SLOTS[league]||4);});
  const europaWinner=state.uel?.championId?domestic.get(state.uel.championId):null;
  const unique=[...new Map([...qualifiers,europaWinner].filter(Boolean).map(club=>[club.id,club])).values()];
  return [...unique,...stableShuffle(guests,`ucl-${state.season}`).filter(club=>!unique.some(qualifier=>qualifier.id===club.id)).slice(0,36-unique.length)];
}
export function createUclCampaign(state,roundRobin,initTable){const clubs=selectUclField(state),ids=clubs.map(club=>club.id),rounds=state.season===1?FIRST_SEASON_UCL_ROUNDS:roundRobin(ids).slice(0,8);return {stage:"hub",clubs,rounds,roundIndex:0,tableRaw:initTable(ids),form:{},lastMatch:null,campaignResults:[],campaignRecord:{w:0,d:0,l:0,gf:0,ga:0},phaseTable:null,qualification:null,knockoutRounds:[],knockoutRoundIndex:0,knockoutFaced:[],currentKnockoutOpponentId:null,leg:1,aggregate:{mine:0,opp:0},firstLegHomeA:undefined,outcome:null};}
// Repair old saves where the campaign has no persistent European guest-club field.
export function repairUclField(state){
 const guests=mergedEuropeanGuestClubs(state),base={...state,europeanGuestClubs:guests};
 const u=state.ucl;if(!u||!Array.isArray(u.clubs)||!Array.isArray(u.rounds))return base;
 // A live UCL table/bracket may still hold objects from an earlier save. Replace
 // only its guest references, retaining results and every domestic club exactly.
 const guestById=new Map(guests.map(club=>[club.id,club]));
 const refreshed=u.clubs.map(club=>guestById.get(club.id)||club);
 if(u.phaseTable||u.knockoutBracket)return {...base,ucl:{...u,clubs:refreshed,clubIds:refreshed.map(club=>club.id)}};
 const wanted=selectUclField({...base,ucl:{...u,clubs:refreshed}});
 if(refreshed.length===36&&refreshed.some(club=>club.guest))return {...base,ucl:{...u,clubs:refreshed,clubIds:refreshed.map(club=>club.id)}};
 const protectedIds=new Set([state.myClubId,u.lastMatch?.opponentId,...(u.campaignResults||[]).map(result=>result.opponentId)]);
 const keep=refreshed.filter(club=>protectedIds.has(club.id)),ids=new Set(keep.map(club=>club.id));
 const clubs=[...keep,...wanted.filter(club=>!ids.has(club.id)).slice(0,36-keep.length)];
 return clubs.length===36?{...base,ucl:{...u,clubs,clubIds:clubs.map(club=>club.id)}}:base;
}
