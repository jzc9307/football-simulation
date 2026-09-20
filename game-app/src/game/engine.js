import { ROLE_GROUP, ROLE_COMPAT, FORMATIONS, EUROPEAN_CLUBS, CARABAO_SCHEDULE, CARABAO_FINAL_SLOT, FA_SCHEDULE, COPA_SCHEDULE } from "./config.js";
import { buildClubs, buildChampionshipClubs, buildLaLigaClubs, buildSerieAClubs, buildBundesligaClubs, buildLigue1Clubs } from "../data/players.js";
export function slotAccepts(slotRole, player){
  if (!player) return false;
  if (player.role === slotRole) return true;
  return (ROLE_COMPAT[slotRole] || []).includes(player.role);
}
// Tactics: each formation is reduced to zone counts (wide defenders, central defenders, central midfielders,
// wide midfielders, wide attackers, central strikers) computed directly from its slot list. A team's tactical
// edge comes from genuine mismatches — extra strikers against too few center-backs, spare width against a side
// with no out-and-out wide midfielders/wingers, more bodies in central midfield — rather than a fixed lookup table.
export function formationShape(formation){
  const slots = FORMATIONS[formation] || [];
  const cnt = r => slots.filter(s=>s.role===r).length;
  return {
    defWide: cnt("LB")+cnt("RB"),
    defCentral: cnt("CB"),
    midCentral: cnt("CDM")+cnt("CM")+cnt("CAM"),
    midWide: cnt("LM")+cnt("RM"),
    attWide: cnt("LW")+cnt("RW"),
    attCentral: cnt("ST"),
  };
}
export function tacticalBreakdown(myForm, oppForm){
  const my = formationShape(myForm), opp = formationShape(oppForm);
  const wideEdge = clamp((my.attWide + my.midWide - opp.defWide) * 0.03, -0.09, 0.09);
  const centralAttEdge = clamp((my.attCentral - opp.defCentral) * 0.035, -0.09, 0.09);
  const midEdge = clamp((my.midCentral - opp.midCentral) * 0.035, -0.09, 0.09);
  const total = clamp(wideEdge + centralAttEdge + midEdge, -0.20, 0.20);
  return { wideEdge, centralAttEdge, midEdge, total };
}
export function tacticalModifier(myForm, oppForm){ return tacticalBreakdown(myForm, oppForm).total; }
export function tacticalHints(myForm, oppForm){
  const b = tacticalBreakdown(myForm, oppForm);
  const hints = [];
  if (b.wideEdge >= 0.02) hints.push({ text:"Overload out wide ✓", color:"#7fd88f" });
  else if (b.wideEdge <= -0.02) hints.push({ text:"Exposed to their width ⚠", color:"#e8b84b" });
  if (b.centralAttEdge >= 0.02) hints.push({ text:"Outnumber their back line ✓", color:"#7fd88f" });
  else if (b.centralAttEdge <= -0.02) hints.push({ text:"Outnumbered up front ⚠", color:"#e8b84b" });
  if (b.midEdge >= 0.02) hints.push({ text:"Control of midfield ✓", color:"#7fd88f" });
  else if (b.midEdge <= -0.02) hints.push({ text:"Overrun in midfield ⚠", color:"#e8b84b" });
  if (!hints.length) hints.push({ text:"Even matchup", color:"#9ab89a" });
  return hints;
}
export function clamp(n,a,b){ return Math.max(a, Math.min(b,n)); }
export function topXI(players, formation="4-4-2"){
  const lineup = autoLineup(FORMATIONS[formation] || FORMATIONS["4-4-2"], players);
  return playersForLineup(players, lineup, formation);
}
export function playersForLineup(players, lineup, formation){
  return (FORMATIONS[formation] || FORMATIONS["4-4-2"]).flatMap((slot, i) => {
    const p = players.find(p => p.id === lineup[i]);
    if (!p) return [];
    const fit = p.role === slot.role ? 1 : slotAccepts(slot.role,p) ? 0.96 : 0.78;
    return [{...p, assignedRole:slot.role, group:ROLE_GROUP[slot.role], ovr:p.ovr*fit}];
  });
}

export function avg(arr, fallback){ return arr.length ? arr.reduce((s,p)=>s+p.ovr,0)/arr.length : fallback; }

export function teamRatings(players){
  players = players.map(p => ({...p, ovr:(p.ovr+(p.confidence||0))*(0.65 + 0.35*(p.condition ?? 100)/100)}));
  const gk = players.filter(p=>p.group==="GK");
  const def = players.filter(p=>p.group==="DEF");
  const mid = players.filter(p=>p.group==="MID");
  const fwd = players.filter(p=>p.group==="FWD");
  const attack = (avg(fwd,35)*1.3 + avg(mid,35)*0.9) / 2.2;
  const defense = (avg(gk,15)*0.9 + avg(def,30)*1.2 + avg(mid,35)*0.5) / 2.6;
  const strength = Math.min(1, players.length/11);
  return { attack:Math.max(5,attack*strength), defense:Math.max(5,defense*strength) };
}
// Playing styles layer on top of formation shape: each nudges attack/defense output and match variance,
// and has explicit good/bad matchups against other styles (independent of the formation-vs-formation battle).
export const STYLES = {
  balanced: { name:"Balanced", desc:"No extreme setup — steady in and out of possession.", attack:0, defense:0, variance:0 },
  tiki:     { name:"Tiki-Taka", desc:"Patient possession football. Controls the tempo, but needs quality to unlock a deep block.", attack:0.04, defense:0.02, variance:-0.05 },
  gegen:    { name:"Gegenpressing", desc:"Hunt the ball back the instant you lose it. High energy, high reward, high risk on the break.", attack:0.07, defense:0.04, variance:0.08 },
  bus:      { name:"Park the Bus", desc:"Everyone behind the ball. Concede almost nothing, rarely threaten yourself.", attack:-0.10, defense:0.14, variance:-0.06 },
  counter:  { name:"Counter-Attack", desc:"Sit in, soak up pressure, break at pace. Thrives against teams committing men forward.", attack:0.03, defense:0.05, variance:0.05 },
  direct:   { name:"Direct Play", desc:"Bypass midfield, go long and early. Leans on your strikers' quality more than build-up play.", attack:0.02, defense:-0.02, variance:0.04 },
};
// myStyle -> oppStyle -> bonus added to my attacking output (asymmetric on purpose — these are real football counters).
export const STYLE_MATCHUP = {
  gegen:   { tiki: 0.06, bus: -0.03 },
  tiki:    { gegen: -0.05, bus: -0.05 },
  counter: { gegen: 0.08, tiki: 0.05 },
  bus:     { gegen: 0.03, tiki: 0.04 },
  direct:  { gegen: 0.02, tiki: 0.03 },
};
export function styleMatchupBonus(myStyle, oppStyle){ return (STYLE_MATCHUP[myStyle] && STYLE_MATCHUP[myStyle][oppStyle]) || 0; }
// Infers a plausible style for an AI side from its squad quality and formation shape — no extra data needed per club.
export function inferStyle(players, formation){
  const shape = formationShape(formation);
  const avgOvr = avg(players, 70);
  if (shape.defCentral >= 4) return avgOvr >= 78 ? "counter" : "bus";
  if (shape.defCentral === 3) return avgOvr >= 80 ? "counter" : "bus";
  if (shape.attWide === 0 && shape.midWide === 0 && shape.attCentral >= 2) return avgOvr >= 80 ? "tiki" : "direct";
  if (avgOvr >= 83) return "gegen";
  if (avgOvr <= 72) return "bus";
  return "balanced";
}
// Defensive line: pushing up trades a small attacking/pressing edge for extra space in behind; the offside
// trap adds a defensive boost that scales with how your center-backs compare to their strikers (risky if they're rated well below the attackers they're trying to catch out).
export function lineModifier(line, trap, myDefRating, oppAttRating){
  const linePos = ((line ?? 50) - 50) / 50; // -1 (deep) .. +1 (high line)
  let attackAdj = linePos * 0.05;
  let defenseAdj = -linePos * 0.06;
  if (trap){
    const skillGap = (myDefRating - oppAttRating) / 10;
    defenseAdj += clamp(0.05 + skillGap*0.02, -0.05, 0.08);
  }
  return { attackAdj: clamp(attackAdj, -0.06, 0.06), defenseAdj: clamp(defenseAdj, -0.10, 0.10) };
}
export function myTactics(s){
  const suspended = new Set(s.suspensions?.[s.stage === "ucl" ? "ucl" : "domestic"] || []);
  const club = s.clubs.find(c=>c.id===s.myClubId);
  return { formation: s.formation, style:s.tacticalStyle || "balanced", line:s.defensiveLine ?? 50, trap:!!s.offsideTrap,
    halftimeStyle:s.halftimeStyle || "keep", autoSubs:s.autoSubs !== false,
    bench:club.players.filter(p=>!Object.values(s.lineup).includes(p.id) && !suspended.has(p.id)) };
}
export function aiTactics(club){
  const formation = club.preferredFormation || "4-4-2";
  return { formation, style: inferStyle(club.players, formation), line: 50, trap: false, autoSubs:true, bench:club.players };
}
// Attack-vs-defense model: formation-shape tactics, playing-style identity and matchups, defensive line/offside
// trap, home advantage, and a per-match variance swing (widened or narrowed by playing style).
// Events produce the score. Dismissals, fatigue, halftime plans and substitutes
// alter the players/tactics used for every subsequent minute.
export function simMatchSmart(teamAPlayers, teamBPlayers, homeA, tacticsA, tacticsB, rng=Math.random){
  const active = [teamAPlayers,teamBPlayers].map(team=>team.map(p=>({...p})));
  const initialPlayers = active.map(team=>team.map(p=>({...p})));
  const playerLogs = initialPlayers.map(team=>new Map(team.map(p=>[p.id,{playerId:p.id,name:p.name,role:p.role,group:p.group,start:0,end:95,goals:0,assists:0,shots:0,sot:0,xg:0,red:false}])));
  const tactics = [tacticsA,tacticsB].map(t=>({...t}));
  const events = [], goals = [0,0], goalLists = [[],[]], redCards = [null,null];
  const totals = {shots:[0,0],sot:[0,0],xg:[0,0],touches:[0,0],bigChances:[0,0],bigChancesMissed:[0,0],passes:[0,0],accPasses:[0,0],fouls:[0,0],offsides:[0,0],corners:[0,0]};
  const possession = [0,0], history=[];
  const snapshot = () => ({...Object.fromEntries(Object.entries(totals).map(([k,v])=>[k,v.map(n=>+n.toFixed(2))])),
    possession:possession[0]+possession[1] ? [0,1].map(i=>Math.round(100*possession[i]/(possession[0]+possession[1]))) : [50,50],
    passAcc:[0,1].map(i=>totals.passes[i] ? Math.round(100*totals.accPasses[i]/totals.passes[i]) : 0)});
  history.push(snapshot());
  const endMinute = 95;
  for(let minute=1;minute<=endMinute;minute++){
    for(let side=0;side<2;side++){
      const tac=tactics[side];
      if(minute===46 && tac.halftimeStyle && tac.halftimeStyle!=="keep" && STYLES[tac.halftimeStyle]){
        tac.style=tac.halftimeStyle;
        events.push({minute,side,type:"tactics",text:`Switch to ${STYLES[tac.style].name}`});
      }
      if(minute===60 && tac.autoSubs){
        const unavailable = new Set([...initialPlayers[side].map(p=>p.id),...active[side].map(p=>p.id)]);
        const tired=[...active[side]].filter(p=>p.group!=="GK").sort((a,b)=>(a.condition??100)-(b.condition??100));
        let substitutions=0;
        for(const out of tired){
          if(substitutions===3)break;
          const role=out.assignedRole || out.role;
          const incoming=[...(tac.bench||[])].filter(p=>!unavailable.has(p.id)&&slotAccepts(role,p)).sort((a,b)=>(b.condition??100)*b.ovr-(a.condition??100)*a.ovr)[0];
          if(!incoming) continue;
          unavailable.add(incoming.id);substitutions++;
          active[side]=active[side].map(p=>p.id===out.id?{...incoming,assignedRole:role,group:ROLE_GROUP[role]}:p);
          const outLog=playerLogs[side].get(out.id);if(outLog)outLog.end=minute;
          playerLogs[side].set(incoming.id,{playerId:incoming.id,name:incoming.name,role:incoming.role,group:ROLE_GROUP[role],start:minute,end:95,goals:0,assists:0,shots:0,sot:0,xg:0,red:false});
          events.push({minute,side,type:"sub",playerId:incoming.id,outId:out.id,text:`${incoming.name} replaces ${out.name}`});
        }
      }
      active[side]=active[side].map(p=>({...p,condition:Math.max(20,(p.condition??100)-(tac.style==="gegen"?0.43:0.27))}));
      if(!redCards[side] && rng()<0.00075){
        const outfield=active[side].filter(p=>p.group!=="GK");
        if(outfield.length){
          const p=outfield[Math.floor(rng()*outfield.length)];
          redCards[side]={id:p.id,name:p.name,minute};
          active[side]=active[side].filter(x=>x.id!==p.id);
          const log=playerLogs[side].get(p.id);if(log){log.end=minute;log.red=true;}
          events.push({minute,side,type:"red",playerId:p.id,text:`RED CARD! ${p.name} is sent off`});
        }
      }
    }
    const ratings=active.map(teamRatings);
    for(let side=0;side<2;side++){
      const other=1-side,tac=tactics[side],opp=tactics[other];
      const style=STYLES[tac.style]||STYLES.balanced,oppStyle=STYLES[opp.style]||STYLES.balanced;
      const line=lineModifier(tac.line,tac.trap,ratings[side].defense,ratings[other].attack);
      const oppLine=lineModifier(opp.line,opp.trap,ratings[other].defense,ratings[side].attack);
      const ratio=ratings[side].attack*(1+style.attack+line.attackAdj+styleMatchupBonus(tac.style,opp.style)) /
        (ratings[other].defense*(1+oppStyle.defense+oppLine.defenseAdj));
      const advantage=((side===0)===homeA)?1.12:0.92;
      const passes=Math.round(3+rng()*3+(tac.style==="tiki"?2:0));
      totals.passes[side]+=passes;totals.accPasses[side]+=Math.round(passes*(0.72+rng()*0.18));
      possession[side]+=passes*(ratings[side].attack/80);
      if(rng()<0.12) totals.fouls[side]++;
      if(rng()<0.02) totals.offsides[side]++;
      if(active[side].length && rng()<clamp(0.145*ratio*advantage*(1+tacticalModifier(tac.formation,opp.formation)),0.025,0.36)){
        const pool=active[side].filter(p=>p.group!=="GK");
        if(!pool.length) continue;
        const weights=pool.map(p=>p.group==="FWD"?4:p.group==="MID"?2:0.5);
        let pick=rng()*weights.reduce((a,b)=>a+b,0),shooter=pool.at(-1);
        for(let i=0;i<pool.length;i++){pick-=weights[i];if(pick<=0){shooter=pool[i];break;}}
        const methodRoll=rng(),method=methodRoll<0.03?"penalty":methodRoll<0.10?"freekick":methodRoll<0.25?"corner":"goal";
        const xg=method==="penalty"?0.76:clamp(0.10*ratio*(0.55+rng()),0.02,0.48);
        const scored=rng()<xg;
        const shotLog=playerLogs[side].get(shooter.id);if(shotLog){shotLog.shots++;shotLog.xg+=xg;}
        totals.shots[side]++;totals.xg[side]+=xg;totals.touches[side]+=2;
        const onTarget=scored||rng()<0.34;
        if(onTarget){totals.sot[side]++;if(shotLog)shotLog.sot++;}
        if(method==="corner")totals.corners[side]++;
        if(xg>=0.25){totals.bigChances[side]++;if(!scored)totals.bigChancesMissed[side]++;}
        let assist=null;
        if(scored){
          goals[side]++;if(shotLog)shotLog.goals++;
          if(method!=="penalty"&&rng()<0.78){
            const creators=active[side].filter(p=>p.id!==shooter.id&&p.group!=="GK");
            if(creators.length){
              const creatorWeights=creators.map(p=>p.group==="MID"?3:p.group==="FWD"?2:1);
              let assistPick=rng()*creatorWeights.reduce((a,b)=>a+b,0);assist=creators.at(-1);
              for(let i=0;i<creators.length;i++){assistPick-=creatorWeights[i];if(assistPick<=0){assist=creators[i];break;}}
              const assistLog=playerLogs[side].get(assist.id);if(assistLog)assistLog.assists++;
            }
          }
          goalLists[side].push({name:shooter.name,playerId:shooter.id,minute,assistName:assist?.name,assistId:assist?.id});
        }
        events.push({minute,side,isGoal:scored,playerId:shooter.id,type:scored?method:method==="penalty"?"penalty-miss":method==="corner"?"corner-miss":"chance",
          ...(assist?{assistId:assist.id,assistName:assist.name}:{}),
          text:scored?`${shooter.name} scores${method==="goal"?"!":` from a ${method}!`}${assist?` · assisted by ${assist.name}`:""}`:method==="penalty"?`Penalty missed! ${shooter.name}`:`${shooter.name} misses the chance`});
      }
    }
    history.push(snapshot());
  }
  const playerRatings=playerLogs.map((logs,side)=>[...logs.values()].map(log=>{
    const minutes=Math.max(1,log.end-log.start);
    const resultBonus=goals[side]>goals[1-side]?0.45:goals[side]===goals[1-side]?0.1:-0.25;
    const cleanSheetBonus=goals[1-side]===0?(log.group==="GK"?0.55:log.group==="DEF"?0.4:0):0;
    const goalWeight=log.group==="GK"||log.group==="DEF"?1.45:log.group==="MID"?1.1:0.9;
    const teamImpact=clamp((goals[side]-goals[1-side])*0.12+(totals.xg[side]-totals.xg[1-side])*0.08,-0.35,0.35);
    const keeperImpact=log.group==="GK"?Math.max(0,totals.sot[1-side]-goals[1-side])*0.08-goals[1-side]*0.12:0;
    const cameo=minutes<20?-0.15:0;
    const raw=6.2+resultBonus+cleanSheetBonus+goalWeight*log.goals+0.65*log.assists+0.08*log.sot-0.05*Math.max(0,log.shots-log.sot)+teamImpact+keeperImpact+(log.red?-1.8:0)+cameo+(rng()-0.5)*0.7;
    return {...log,minutes,side,rating:+clamp(raw,3,10).toFixed(1)};
  }));
  const allRatings=playerRatings.flat();
  const manOfTheMatch=[...allRatings].sort((a,b)=>b.rating-a.rating||b.goals-a.goals||b.assists-a.assists)[0];
  for(const rating of allRatings){
    rating.isMotm=rating===manOfTheMatch;
    rating.confidenceDelta=rating.red?-2:rating.rating<=5.5?-2:rating.rating<6?-1:(rating.isMotm||rating.goals>=3)?2:(rating.goals+rating.assists>0||rating.rating>=7.4)?1:0;
  }
  const match={events,endMinute,initialPlayers,goalLists,redCards,playerRatings,manOfTheMatch:{...manOfTheMatch},stats:{...snapshot(),history}};
  return {goalsA:goals[0],goalsB:goals[1],match};
}
export function matchFields(sim,isHome){
  const side=isHome?0:1;
  return {match:sim.match,goalList:sim.match.goalLists[side],oppGoalList:sim.match.goalLists[1-side],redCard:sim.match.redCards[side],
    playerRatings:sim.match.playerRatings,manOfTheMatch:sim.match.manOfTheMatch,
    scorerStr:formatScorers(sim.match.goalLists[side])};
}

export function performanceUpdatesForMatch(simulation,homeClubId,awayClubId){
  return [
    {clubId:homeClubId,ratings:simulation.match.playerRatings[0]},
    {clubId:awayClubId,ratings:simulation.match.playerRatings[1]},
  ];
}
export function applyPerformanceUpdates(s,updates=[]){
  const byClub=new Map();
  for(const update of updates){
    if(!byClub.has(update.clubId))byClub.set(update.clubId,[]);
    byClub.get(update.clubId).push(...update.ratings);
  }
  const updateClub=club=>{
    const ratings=byClub.get(club.id);if(!ratings)return club;
    const byPlayer=new Map(ratings.map(r=>[r.playerId,r]));
    return {...club,players:club.players.map(player=>{
      const r=byPlayer.get(player.id);if(!r)return player;
      const oldConfidence=player.confidence||0;
      const faded=oldConfidence>0?oldConfidence-1:oldConfidence<0?oldConfidence+1:0;
      return {...player,
        appearances:(player.appearances||0)+1,
        seasonGoals:(player.seasonGoals||0)+r.goals,
        seasonAssists:(player.seasonAssists||0)+r.assists,
        ratingTotal:+((player.ratingTotal||0)+r.rating).toFixed(2),
        ratedMatches:(player.ratedMatches||0)+1,
        bestRating:Math.max(player.bestRating||0,r.rating),
        motm:(player.motm||0)+(r.isMotm?1:0),
        seasonMinutes:(player.seasonMinutes||0)+r.minutes,
        lastRating:r.rating,
        lastConfidenceChange:r.confidenceDelta,
        confidence:clamp(faded+r.confidenceDelta,-2,2)};
    })};
  };
  const poolKeys=["clubs","plClubs","laligaClubs","serieaClubs","bundesligaClubs","ligue1Clubs","championshipClubs"];
  const next={...s};
  for(const key of poolKeys)if(Array.isArray(s[key]))next[key]=s[key].map(updateClub);
  if(s.ucl?.clubs)next.ucl={...s.ucl,clubs:s.ucl.clubs.map(updateClub)};
  return next;
}
export function playerSeasonAverage(player){return player.ratedMatches?player.ratingTotal/player.ratedMatches:0;}
export function seasonPlayerRows(clubs){
  return clubs.flatMap(club=>club.players.filter(p=>(p.ratedMatches||0)>0).map(player=>({player,club,average:playerSeasonAverage(player)})));
}
export function seasonBestXI(clubs){
  const rows=seasonPlayerRows(clubs);
  const ordered=[...rows].sort((a,b)=>b.average-a.average||(b.player.ratedMatches||0)-(a.player.ratedMatches||0)||(b.player.seasonGoals||0)-(a.player.seasonGoals||0));
  const used=new Set();
  return FORMATIONS["4-3-3"].flatMap(slot=>{
    const available=ordered.filter(r=>!used.has(r.player.id));
    const pick=available.find(r=>r.player.role===slot.role)
      || available.find(r=>(ROLE_COMPAT[slot.role]||[]).includes(r.player.role))
      || available.find(r=>r.player.group===ROLE_GROUP[slot.role]);
    if(!pick)return [];
    used.add(pick.player.id);
    return [{...pick,selectedRole:slot.role}];
  });
}
export function resolveTie(myGoals,oppGoals,prior={mine:0,opp:0},deciding=true,rng=Math.random){
  const aggregate={mine:prior.mine+myGoals,opp:prior.opp+oppGoals};
  const wentToPens=deciding && aggregate.mine===aggregate.opp;
  const wonPens=wentToPens?rng()<0.5:null;
  return {aggregate,wentToPens,wonPens,won:deciding?(aggregate.mine>aggregate.opp || (wentToPens&&wonPens)):null};
}
export function weightedScorer(players){
  const pool = players.length ? players : [{name:"Unknown"}];
  const weights = pool.map(p => p.group==="FWD"?4 : p.group==="MID"?2.2 : p.group==="DEF"?0.5 : 0.1);
  const total = weights.reduce((a,b)=>a+b,0);
  let r = Math.random()*total;
  for(let i=0;i<pool.length;i++){ r -= weights[i]; if(r<=0) return pool[i].name; }
  return pool[pool.length-1].name;
}
// Minute-stamped goals: "Wirtz '32, '90+5" instead of "Wirtz x2".
export function pickUniqueMinute(used){
  let m;
  do { m = 1 + Math.floor(Math.random()*95); } while (used.has(m));
  used.add(m);
  return m;
}
export function formatMinute(m){ return m<=90 ? `'${m}` : `'90+${m-90}`; }
export function buildGoalList(goalCount, players, usedMinutes){
  const used = usedMinutes || new Set();
  const list = [];
  for (let i=0;i<goalCount;i++) list.push({ name: weightedScorer(players), minute: pickUniqueMinute(used) });
  return list.sort((a,b)=>a.minute-b.minute);
}
export function formatScorers(goalList){
  if (!goalList || !goalList.length) return "";
  const byName = {};
  goalList.forEach(g => { (byName[g.name] = byName[g.name]||[]).push(g.minute); });
  return Object.entries(byName).map(([name,mins]) => `${name} ${mins.sort((a,b)=>a-b).map(formatMinute).join(", ")}`).join(", ");
}
// ~7% chance one of the lineup's outfield players is sent off. Independent of the fixed score outcome.
export function roundRobin(teamIds){
  const ids = [...teamIds];
  if (ids.length % 2 !== 0) ids.push(null);
  const n = ids.length;
  const rounds = [];
  const arr = ids.slice(1);
  for (let r = 0; r < n-1; r++){
    const round = [];
    const cur = [ids[0], ...arr];
    for (let i=0;i<n/2;i++){
      const a = cur[i], b = cur[n-1-i];
      if (a!=null && b!=null) round.push(r%2===0 ? [a,b] : [b,a]);
    }
    rounds.push(round);
    arr.unshift(arr.pop());
  }
  return rounds;
}
export function initTable(ids){ return Object.fromEntries(ids.map(id => [id,{id,played:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}])); }
export function applyUpdates(tableRaw, updates){
  const t = { ...tableRaw };
  updates.forEach(u => {
    const row = { ...t[u.clubId] };
    row.played++; row.gf += u.gf; row.ga += u.ga;
    if (u.gf > u.ga){ row.w++; row.pts += 3; } else if (u.gf < u.ga){ row.l++; } else { row.d++; row.pts++; }
    t[u.clubId] = row;
  });
  return t;
}
export function computeTableArray(tableRaw, clubs){
  return Object.values(tableRaw).map(r => ({ ...r, gd:r.gf-r.ga, club: clubs.find(c=>c.id===r.id) }))
    .sort((a,b)=> b.pts-a.pts || b.gd-a.gd || b.gf-a.gf);
}
export function ovrLabel(o){
  if (o>=86) return "World class";
  if (o>=81) return "Very good";
  if (o>=76) return "Strong";
  if (o>=71) return "Good";
  if (o>=66) return "Average";
  return "Weak";
}
export function fmtM(v){ return `£${v}m`; }
export function ord(n){ return n===1?"st":n===2?"nd":n===3?"rd":"th"; }
export function autoLineup(formationSlots, players){
  const used = new Set();
  const lineup = {};
  formationSlots.forEach((slot,i) => {
    const pick = players.filter(p=>!used.has(p.id) && p.role===slot.role).sort((a,b)=>b.ovr-a.ovr)[0];
    if (pick){ lineup[i]=pick.id; used.add(pick.id); }
  });
  formationSlots.forEach((slot,i) => {
    if (lineup[i]) return;
    const compat = ROLE_COMPAT[slot.role] || [slot.role];
    const pick = players.filter(p=>!used.has(p.id) && compat.includes(p.role)).sort((a,b)=>b.ovr-a.ovr)[0];
    if (pick){ lineup[i]=pick.id; used.add(pick.id); }
  });
  formationSlots.forEach((slot,i) => {
    if (lineup[i]) return;
    const group = ROLE_GROUP[slot.role];
    const pick = players.filter(p=>!used.has(p.id) && p.group===group).sort((a,b)=>b.ovr-a.ovr)[0];
    if (pick){ lineup[i]=pick.id; used.add(pick.id); }
  });
  formationSlots.forEach((slot,i)=>{
    if(lineup[i]) return;
    const pick=players.filter(p=>!used.has(p.id) && (slot.role==="GK"?p.role==="GK":p.role!=="GK")).sort((a,b)=>b.ovr-a.ovr)[0];
    if(pick){lineup[i]=pick.id;used.add(pick.id);}
  });
  return lineup;
}
export function lineupIssue(s, competition="domestic"){
  const club=s.clubs.find(c=>c.id===s.myClubId);
  if(!club) return "Choose a club first.";
  const players=playersForLineup(club.players,s.lineup,s.formation);
  if(players.length!==11 || new Set(players.map(p=>p.id)).size!==11) return "Select 11 different players before kickoff.";
  if(players[0].role!=="GK") return "Select a goalkeeper in the goalkeeper slot.";
  if(players.some(p=>(s.suspensions?.[competition]||[]).includes(p.id))) return "Replace suspended players before kickoff.";
  return "";
}
export function getMatchPlayers(s, competition="domestic"){
  const myClub = s.clubs.find(c=>c.id===s.myClubId);
  const suspended = new Set((s.suspensions && s.suspensions[competition]) || []);
  return playersForLineup(myClub.players,s.lineup,s.formation).filter(p=>!suspended.has(p.id));
}
export function simulateRound(s, round, gw){
  const lineupPlayers = getMatchPlayers(s);
  let userResult = null;
  const updates = [],performanceUpdates=[];
  round.forEach(([home, away]) => {
    const homeClub = s.clubs.find(c=>c.id===home), awayClub = s.clubs.find(c=>c.id===away);
    const homePlayers = home===s.myClubId ? lineupPlayers : topXI(homeClub.players,homeClub.preferredFormation);
    const awayPlayers = away===s.myClubId ? lineupPlayers : topXI(awayClub.players,awayClub.preferredFormation);
    const homeTactics = home===s.myClubId ? myTactics(s) : aiTactics(homeClub);
    const awayTactics = away===s.myClubId ? myTactics(s) : aiTactics(awayClub);
    const simulation = simMatchSmart(homePlayers, awayPlayers, true, homeTactics, awayTactics);
    const {goalsA,goalsB}=simulation;
    performanceUpdates.push(...performanceUpdatesForMatch(simulation,home,away));
    updates.push({ clubId:home, gf:goalsA, ga:goalsB });
    updates.push({ clubId:away, gf:goalsB, ga:goalsA });
    if (home===s.myClubId || away===s.myClubId){
      const isHome = home===s.myClubId;
      const opponent = s.clubs.find(c=>c.id===(isHome?away:home));
      const {goalsA,goalsB}=simulation;
  const myGoals = isHome?goalsA:goalsB, oppGoals = isHome?goalsB:goalsA;
      const {goalList,scorerStr,redCard}=matchFields(simulation,isHome);
      userResult = { ...matchFields(simulation,isHome), gw, opponent: opponent.name, opponentColor: opponent.color, opponentId: opponent.id, isHome, myGoals, oppGoals, scorerStr, goalList, redCard, result: myGoals>oppGoals?"W":myGoals<oppGoals?"L":"D" };
    }
  });
  return { updates, userResult, performanceUpdates };
}
export function ensureFixtures(s){
  if (s.roundsHalf1) return s;
  const ids = s.clubs.map(c=>c.id);
  const r1 = roundRobin(ids);
  const r2 = r1.map(round => round.map(([h,a]) => [a,h]));
  return { ...s, roundsHalf1:r1, roundsHalf2:r2, tableRaw: initTable(ids) };
}
export function pickN(pool, n){ return [...pool].sort(()=>Math.random()-0.5).slice(0, n); }
export function emptyCupStatus(){
  return { alive:null, faced:[], playedRounds:[], results:[], record:{w:0,d:0,l:0,gf:0,ga:0}, outcome:null };
}
// Is a cup fixture due right now, given how many league games have been played this half?
export function pendingCupSlot(myClubId, half, roundIndex, cupStatus, league){
  if (league === "LALIGA"){
    if (half !== 2) return null;
    for (const slot of COPA_SCHEDULE){
      if (slot.afterRound === roundIndex){
        const cs = cupStatus.copa;
        if (cs.alive === false) continue;
        if (cs.playedRounds.includes(slot.round)) continue;
        return { comp:"copa", round: slot.round };
      }
    }
    return null;
  }
  if (league !== "PL") return null;
  const isEuropean = EUROPEAN_CLUBS.includes(myClubId);
  if (half === 1){
    for (const slot of CARABAO_SCHEDULE){
      if (slot.skipForEuropean && isEuropean) continue;
      if (slot.afterRound === roundIndex){
        const cs = cupStatus.carabao;
        if (cs.alive === false) continue;
        if (cs.playedRounds.includes(slot.round)) continue;
        return { comp:"carabao", round: slot.round };
      }
    }
  } else {
    for (const slot of FA_SCHEDULE){
      if (slot.afterRound === roundIndex){
        const cs = cupStatus.fa;
        if (cs.alive === false) continue;
        if (cs.playedRounds.includes(slot.round)) continue;
        return { comp:"fa", round: slot.round };
      }
    }
    if (CARABAO_FINAL_SLOT.afterRound === roundIndex){
      const cs = cupStatus.carabao;
      if (cs.alive !== false && !cs.playedRounds.includes("Final")) return { comp:"carabao", round:"Final" };
    }
  }
  return null;
}
// Plays one cup fixture against a random not-yet-faced PL/Championship club. Returns the updated
// cup-status object for that competition plus the match result (for the result screen).
export function simulateCupMatch(s, comp, round){
  const cs = s.cupStatus[comp];
  const pool = [...s.clubs.filter(c=>c.id!==s.myClubId), ...(s.league==="PL" ? s.championshipClubs : [])];
  const avail = pool.filter(c=>!cs.faced.includes(c.id));
  const opp = (avail.length ? avail : pool)[Math.floor(Math.random()*(avail.length ? avail.length : pool.length))];
  const lineupPlayers = getMatchPlayers(s);
  const oppPlayers = topXI(opp.players,opp.preferredFormation);
  const oppTactics = aiTactics(opp);
  const myTac = myTactics(s);
  const homeA = Math.random() < 0.5;
  const simulation = simMatchSmart(
    homeA?lineupPlayers:oppPlayers, homeA?oppPlayers:lineupPlayers, true,
    homeA?myTac:oppTactics, homeA?oppTactics:myTac
  );
  const performanceUpdates=performanceUpdatesForMatch(simulation,homeA?s.myClubId:opp.id,homeA?opp.id:s.myClubId);
  const {goalsA,goalsB}=simulation;
  const myGoals = homeA?goalsA:goalsB, oppGoals = homeA?goalsB:goalsA;
  let wentToPens = false, wonPens = null;
  if (myGoals === oppGoals){ wentToPens = true; wonPens = Math.random() < 0.5; }
  const won = myGoals > oppGoals || (wentToPens && wonPens);
  const {goalList,scorerStr,redCard}=matchFields(simulation,homeA);
  const matchResult = { ...matchFields(simulation,homeA), performanceUpdates, comp, round, opponent:opp.name, opponentColor:opp.color, opponentId:opp.id, homeA, myGoals, oppGoals, wentToPens, wonPens, won, scorerStr, goalList, redCard };
  const record = { ...cs.record };
  record.gf += myGoals; record.ga += oppGoals;
  if (myGoals > oppGoals) record.w++; else if (myGoals < oppGoals) record.l++; else record.d++;
  const updatedCs = {
    alive: won, faced: [...cs.faced, opp.id], playedRounds: [...cs.playedRounds, round],
    results: [...cs.results, matchResult], record,
    outcome: !won ? (round==="Final" ? "RUNNER-UP" : `${round.toUpperCase()} EXIT`) : (round==="Final" ? "CHAMPION" : null)
  };
  return { updatedCs, matchResult };
}

/* ---- Champions League: 36-team league phase using real squads from the other two leagues ---- */
export function uclZoneLabel(rank){ return rank<=8 ? "Ro16" : rank<=24 ? "Playoff" : "Out"; }
export function uclZoneBg(rank, isMe){
  if (isMe) return "#1c2b1c";
  if (rank<=8) return "#132513";
  if (rank<=24) return "#1c1a12";
  return "#241414";
}
export function simulateUclMatch(s, homeClub, awayClub){
  const lineupPlayers = getMatchPlayers(s, "ucl");
  const homePlayers = homeClub.id===s.myClubId ? lineupPlayers : topXI(homeClub.players,homeClub.preferredFormation);
  const awayPlayers = awayClub.id===s.myClubId ? lineupPlayers : topXI(awayClub.players,awayClub.preferredFormation);
  const homeTactics = homeClub.id===s.myClubId ? myTactics(s) : aiTactics(homeClub);
  const awayTactics = awayClub.id===s.myClubId ? myTactics(s) : aiTactics(awayClub);
  return simMatchSmart(homePlayers, awayPlayers, true, homeTactics, awayTactics);
}
export function simulateUclRound(s, uclClubs, round){
  const updates = [],performanceUpdates=[];
  let userResult = null;
  round.forEach(([home, away]) => {
    const homeClub = uclClubs.find(c=>c.id===home), awayClub = uclClubs.find(c=>c.id===away);
    const simulation = simulateUclMatch(s, homeClub, awayClub);
    const {goalsA,goalsB}=simulation;
    performanceUpdates.push(...performanceUpdatesForMatch(simulation,home,away));
    updates.push({ clubId:home, gf:goalsA, ga:goalsB });
    updates.push({ clubId:away, gf:goalsB, ga:goalsA });
    if (home===s.myClubId || away===s.myClubId){
      const isHome = home===s.myClubId;
      const opponent = isHome ? awayClub : homeClub;
      const {goalsA,goalsB}=simulation;
  const myGoals = isHome?goalsA:goalsB, oppGoals = isHome?goalsB:goalsA;
      const {goalList,scorerStr,redCard}=matchFields(simulation,isHome);
      userResult = { ...matchFields(simulation,isHome), stage:"League Phase", opponent:opponent.name, opponentColor:opponent.color, opponentId:opponent.id,
        isHome, myGoals, oppGoals, scorerStr, goalList, redCard, result: myGoals>oppGoals?"W":myGoals<oppGoals?"L":"D" };
    }
  });
  return { updates, userResult, performanceUpdates };
}
export function simulateUclSingleMatch(s, opponent, stageLabel, forcedIsHome, allowPens=true, prior={mine:0,opp:0}){
  const lineupPlayers = getMatchPlayers(s, "ucl");
  const isHome = forcedIsHome!==undefined ? forcedIsHome : Math.random() < 0.5;
  const oppPlayers = topXI(opponent.players,opponent.preferredFormation);
  const oppTactics = aiTactics(opponent);
  const myTac = myTactics(s);
  const simulation = simMatchSmart(
    isHome?lineupPlayers:oppPlayers, isHome?oppPlayers:lineupPlayers, true,
    isHome?myTac:oppTactics, isHome?oppTactics:myTac
  );
  const performanceUpdates=performanceUpdatesForMatch(simulation,isHome?s.myClubId:opponent.id,isHome?opponent.id:s.myClubId);
  const {goalsA,goalsB}=simulation;
  const myGoals = isHome?goalsA:goalsB, oppGoals = isHome?goalsB:goalsA;
  const {wentToPens,wonPens,won}=resolveTie(myGoals,oppGoals,prior,allowPens);
  const {goalList,scorerStr,redCard}=matchFields(simulation,isHome);
  return { ...matchFields(simulation,isHome), performanceUpdates, stage:stageLabel, opponent:opponent.name, opponentColor:opponent.color, opponentId:opponent.id,
    isHome, myGoals, oppGoals, scorerStr, goalList, redCard, wentToPens, wonPens, won, result: myGoals>oppGoals?"W":myGoals<oppGoals?"L":"D" };
}
export function pickKnockoutOpponent(u, myClubId){
  const faced = u.knockoutFaced || [];
  const pool = u.clubs.filter(c => c.id!==myClubId && !faced.includes(c.id));
  const list = pool.length ? pool : u.clubs.filter(c=>c.id!==myClubId);
  return list[Math.floor(Math.random()*list.length)];
}

// Reveals the final stats progressively as the live minute counter advances (possession wobbles toward its
// final split; everything else accumulates roughly linearly), same trick as the event timeline.
export function revealStats(stats, minute){
  if(stats.history) return stats.history[Math.min(stats.history.length-1,Math.max(0,minute))];
  const frac = Math.max(0.03, Math.min(1, minute/90));
  const jitter = Math.sin(minute/6) * 4 * (1-frac);
  const posHome = clamp(Math.round(stats.possession[0] + jitter), 15, 85);
  const r = (v) => Math.round(v*frac);
  const rf = (v) => +(v*frac).toFixed(2);
  return {
    possession: [posHome, 100-posHome],
    xg: [rf(stats.xg[0]), rf(stats.xg[1])],
    shots: [r(stats.shots[0]), r(stats.shots[1])],
    sot: [Math.min(r(stats.sot[0]), r(stats.shots[0])), Math.min(r(stats.sot[1]), r(stats.shots[1]))],
    touches: [r(stats.touches[0]), r(stats.touches[1])],
    bigChances: [r(stats.bigChances[0]), r(stats.bigChances[1])],
    bigChancesMissed: [r(stats.bigChancesMissed[0]), r(stats.bigChancesMissed[1])],
    accPasses: [r(stats.accPasses[0]), r(stats.accPasses[1])],
    passAcc: stats.passAcc,
    fouls: [r(stats.fouls[0]), r(stats.fouls[1])],
    offsides: [r(stats.offsides[0]), r(stats.offsides[1])],
    corners: [r(stats.corners[0]), r(stats.corners[1])],
  };
}
// Exposes the exact deterministic math simMatchSmart used (ratings, formation edge, style matchup, defensive
// line/trap) so the result screen can explain *why* the match went the way it did.
export function analyzeMatchup(myPlayers, oppPlayers, myTac, oppTac){
  const rMe = teamRatings(myPlayers), rOpp = teamRatings(oppPlayers);
  const formationEdge = tacticalModifier(myTac.formation, oppTac.formation);
  const hints = tacticalHints(myTac.formation, oppTac.formation);
  const styleMe = STYLES[myTac.style] || STYLES.balanced;
  const styleOpp = STYLES[oppTac.style] || STYLES.balanced;
  const styleBonusMe = styleMe.attack + styleMatchupBonus(myTac.style, oppTac.style);
  const styleBonusOpp = styleOpp.attack + styleMatchupBonus(oppTac.style, myTac.style);
  const lineMe = lineModifier(myTac.line, myTac.trap, rMe.defense, rOpp.attack);
  const lineOpp = lineModifier(oppTac.line, oppTac.trap, rOpp.defense, rMe.attack);
  const effAttackMe = rMe.attack * (1 + styleBonusMe + lineMe.attackAdj);
  const effAttackOpp = rOpp.attack * (1 + styleBonusOpp + lineOpp.attackAdj);
  const effDefenseMe = rMe.defense * (1 + styleMe.defense + lineMe.defenseAdj);
  const effDefenseOpp = rOpp.defense * (1 + styleOpp.defense + lineOpp.defenseAdj);
  return { ratings:{me:rMe, opp:rOpp}, formationEdge, hints,
    styleMeName: styleMe.name, styleOppName: styleOpp.name, styleBonusMe, styleBonusOpp,
    lineMe, lineOpp, effAttackMe, effAttackOpp, effDefenseMe, effDefenseOpp };
}
export function findClubAnywhere(s, id){
  const pools = [s.clubs, s.championshipClubs, s.plClubs, s.laligaClubs, s.serieaClubs, s.bundesligaClubs, s.ligue1Clubs];
  for (const pool of pools){ if (pool){ const found = pool.find(c=>c.id===id); if (found) return found; } }
  return null;
}
// Removes any suspended player currently sitting in the lineup and refills that slot with the best
// eligible replacement, so a red card doesn't silently leave you playing a player short next time out.
export function cleanLineupOfSuspended(formation, players, lineup, suspendedIds){
  const suspended = new Set(suspendedIds || []);
  const hasSuspendedStarter = Object.values(lineup).some(pid => pid && suspended.has(pid));
  if (!hasSuspendedStarter) return lineup;
  const slots = FORMATIONS[formation] || [];
  const newLineup = {};
  const used = new Set();
  Object.entries(lineup).forEach(([idx,pid]) => {
    if (pid && !suspended.has(pid)){ newLineup[idx] = pid; used.add(pid); }
  });
  slots.forEach((slot,i) => {
    if (newLineup[i]) return;
    const eligible = players.filter(p=>!used.has(p.id) && !suspended.has(p.id));
    const pick = eligible.filter(p=>p.role===slot.role).sort((a,b)=>b.ovr-a.ovr)[0]
      || eligible.filter(p=>(ROLE_COMPAT[slot.role]||[]).includes(p.role)).sort((a,b)=>b.ovr-a.ovr)[0]
      || eligible.filter(p=>p.group===ROLE_GROUP[slot.role]).sort((a,b)=>b.ovr-a.ovr)[0]
      || eligible.filter(p=>slot.role==="GK"?p.role==="GK":p.role!=="GK").sort((a,b)=>b.ovr-a.ovr)[0];
    if (pick){ newLineup[i] = pick.id; used.add(pick.id); }
  });
  return newLineup;
}
export function buildLiveMatchContext(s, userResult, oppClub, competition="ucl"){
  const myClubObj = s.clubs.find(c=>c.id===s.myClubId);
  const lineupPlayers = getMatchPlayers(s, competition);
  const oppPlayers = topXI(oppClub.players,oppClub.preferredFormation);
  const homeName = userResult.isHome ? myClubObj.name : oppClub.name;
  const awayName = userResult.isHome ? oppClub.name : myClubObj.name;
  const match=userResult.match;
  // Old saves resume at their result screen; new matches always carry their events.
  const timeline=(match?.events||[]).map(e=>({...e,teamName:e.side===0?homeName:awayName}));
  const myTac=myTactics(s),oppTac=aiTactics(oppClub);
  const stats=match?.stats;
  const analysis = analyzeMatchup(lineupPlayers, oppPlayers, myTac, oppTac);
  return { timeline, homeName, awayName, myName: myClubObj.name, oppName: oppClub.name, stats, analysis,
    playerRatings:match?.playerRatings,manOfTheMatch:match?.manOfTheMatch,myTacStyle: myTac.style, oppTacStyle: oppTac.style };
}

export function freshState(){
  const plClubs = buildClubs();
  const laligaClubs = buildLaLigaClubs();
  const serieaClubs = buildSerieAClubs();
  const bundesligaClubs = buildBundesligaClubs();
  const ligue1Clubs = buildLigue1Clubs();
  return {
    stage: "league-select", league: null, clubs: plClubs,
    season:1, history:[], loans:[], finances:[], halftimeStyle:"keep", autoSubs:true,
    plClubs, laligaClubs, serieaClubs, bundesligaClubs, ligue1Clubs, championshipClubs: buildChampionshipClubs(),
    myClubId: null, simMode: null,
    formation: "4-3-3", lineup: {}, budget: 0, tacticalStyle: "balanced", defensiveLine: 50, offsideTrap: false,
    suspensions: { domestic: [], ucl: [] },
    half: 1, roundIndex: 0, roundsHalf1: null, roundsHalf2: null, tableRaw: null, lastResult: null,
    results1: [], results2: [], table1: null, tableFinal: null,
    cupStatus: { fa: emptyCupStatus(), carabao: emptyCupStatus(), copa: emptyCupStatus() }, lastCupResult: null,
    cups: { ucl: null }, ucl: null,
  };
}


export function applyMatchFitness(s,result){
  if(!result?.match)return s;
  const isHome=result.isHome ?? result.homeA;
  const side=isHome?0:1,match=result.match;
  const minutes=new Map(match.initialPlayers[side].map(p=>[p.id,match.endMinute]));
  for(const e of match.events.filter(e=>e.side===side)){
    if(e.type==="sub"){minutes.set(e.outId,e.minute);minutes.set(e.playerId,match.endMinute-e.minute);}
    if(e.type==="red")minutes.set(e.playerId,Math.min(minutes.get(e.playerId)??match.endMinute,e.minute));
  }
  // `condition` is readiness for the next fixture, not energy remaining at
  // full time. The old formula subtracted a full match's exertion on every
  // round and only restored 16 points. A fixed XI therefore fell towards 30%
  // while AI teams started each match fresh. Weekly recovery now prevents that
  // compounding penalty while still rewarding substitutions and squad rotation.
  const exertionPerMinute=s.tacticalStyle==="gegen"?0.08:0.06;
  return {...s,clubs:s.clubs.map(c=>c.id!==s.myClubId?c:{...c,players:c.players.map(p=>{
    const played=minutes.get(p.id);
    return {...p,
      condition:played===undefined
        ? clamp((p.condition??100)+12,82,100)
        : clamp(100-played*exertionPerMinute,82,100)};
  })})};
}
export function seasonLabel(s){const y=2026+(s.season||1)-1;return `${y}/${String(y+1).slice(-2)}`;}
export const LEAGUE_NAMES={PL:"Premier League",LALIGA:"La Liga",SERIEA:"Serie A",BUNDES:"Bundesliga",LIGUE1:"Ligue 1"};
