import { ROLE_GROUP, ROLE_COMPAT, FORMATIONS, EUROPEAN_CLUBS, CARABAO_SCHEDULE, CARABAO_FINAL_SLOT, FA_SCHEDULE, COPA_SCHEDULE, COPPA_SCHEDULE, DFB_SCHEDULE, COUPE_SCHEDULE } from "./config.js";
import { buildClubs, buildChampionshipClubs, buildLaLigaClubs, buildSerieAClubs, buildBundesligaClubs, buildLigue1Clubs, buildLaLiga2Clubs, buildSerieBClubs, buildBundes2Clubs, buildLigue2Clubs } from "../data/players.js";
import { buildEuropeanGuestClubs } from "./uclSelection.js";
import { attachSeasonSchedule } from "./seasonSchedule.js";
export function slotAccepts(slotRole, player){
  if (!player) return false;
  if (player.role === slotRole) return true;
  return (ROLE_COMPAT[slotRole] || []).includes(player.role);
}
const WIDE_ROLES = new Set(["LW", "LM", "RW", "RM"]);
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
  const lineup = readinessLineup(FORMATIONS[formation] || FORMATIONS["4-4-2"], players);
  return playersForLineup(players, lineup, formation);
}
// Preserve a club's preferred shape unless another legal system gains a meaningful XI-quality edge.
export function bestFormation(players, preferred="4-4-2"){
  const score = formation => topXI(players, formation).reduce((total, player) => total + player.ovr, 0);
  let best = preferred, top = score(preferred);
  for (const formation of Object.keys(FORMATIONS)){
    const candidate = score(formation);
    if (candidate > top + 6){ best = formation; top = candidate; }
  }
  return best;
}
// Use rested depth for AI teams and fast-forwarded seasons, without weakening the preferred XI when fresh.
export function readinessLineup(slots, players, preferred={}){
  const score=p=>matchOvr(p) + ((p.energy??100)-100)*0.48 + ((p.condition??100)-100)*0.18;
  const ranked=[...players].sort((a,b)=>score(b)-score(a));
  const lineup=autoLineup(slots,ranked,score);
  // Honour the manager's chosen player when they are close in readiness to the selected alternative.
  const used=new Set(Object.values(lineup));
  slots.forEach((slot,i)=>{
    const chosen=players.find(p=>p.id===preferred[i]);
    const current=players.find(p=>p.id===lineup[i]);
    if(chosen&&!used.has(chosen.id)&&current&&slotAccepts(slot.role,chosen)&&score(chosen)>=score(current)-3){
      used.delete(current.id);lineup[i]=chosen.id;used.add(chosen.id);
    }
  });
  return lineup;
}
export function playersForLineup(players, lineup, formation){
  return (FORMATIONS[formation] || FORMATIONS["4-4-2"]).flatMap((slot, i) => {
    const p = players.find(p => p.id === lineup[i]);
    if (!p) return [];
    const sameWing = WIDE_ROLES.has(p.role) && WIDE_ROLES.has(slot.role) && p.role[0] === slot.role[0];
    const fit = (p.role === slot.role || sameWing) ? 1 : slotAccepts(slot.role,p) ? 0.96 : 0.78;
    return [{...p, assignedRole:slot.role, group:ROLE_GROUP[slot.role], ovr:p.ovr*fit}];
  });
}

export function avg(arr, fallback){ return arr.length ? arr.reduce((s,p)=>s+p.ovr,0)/arr.length : fallback; }

export function matchOvr(player){return player.ovr+(player.confidence||0);}
export function teamRatings(players){
  players = players.map(p => ({...p, ovr:matchOvr(p)*(0.78 + 0.12*(p.condition ?? 100)/100 + 0.10*(p.energy ?? 100)/100)}));
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
// Major clubs keep a recognizable identity. Every other club receives a stable style
// from its squad level, formation and id, so the AI field never collapses to Balanced.
export const CLUB_TACTIC_PROFILES = {
  ars:{style:"tiki",line:68,trap:true}, liv:{style:"gegen",line:75,trap:true}, man:{style:"tiki",line:72,trap:true},
  mun:{style:"counter",line:44,trap:false}, che:{style:"tiki",line:66,trap:true}, tot:{style:"gegen",line:72,trap:true},
  new:{style:"gegen",line:65,trap:true}, ast:{style:"counter",line:44,trap:false},
  fcb:{style:"tiki",line:74,trap:true}, rma:{style:"counter",line:52,trap:false}, atl:{style:"bus",line:31,trap:false},
  ath:{style:"gegen",line:64,trap:true}, rea:{style:"tiki",line:61,trap:false},
  int:{style:"counter",line:46,trap:false}, acm:{style:"counter",line:48,trap:false}, juv:{style:"bus",line:36,trap:false},
  nap:{style:"tiki",line:63,trap:true}, ata:{style:"gegen",line:70,trap:true}, rom:{style:"direct",line:48,trap:false},
  fcb2:{style:"gegen",line:72,trap:true}, bor:{style:"gegen",line:70,trap:true}, bay:{style:"tiki",line:65,trap:true},
  rbl:{style:"gegen",line:73,trap:true}, ein:{style:"direct",line:52,trap:false},
  par2:{style:"tiki",line:70,trap:true}, oly2:{style:"gegen",line:66,trap:true}, oly:{style:"tiki",line:61,trap:false},
  asm:{style:"counter",line:48,trap:false}, lil:{style:"counter",line:42,trap:false},
};
function identityIndex(id="club"){
  let hash=2166136261;for(const char of id){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619);}return hash>>>0;
}
export function inferStyle(players, formation, clubId="", leagueAvg=null){
  if(CLUB_TACTIC_PROFILES[clubId])return CLUB_TACTIC_PROFILES[clubId].style;
  const shape = formationShape(formation);
  // Relative strength prevents every lower-rated league from defaulting to a deep block.
  const avgOvr = 76 + (avg(players, 70) - (leagueAvg ?? 76));
  if (shape.defCentral >= 4) return avgOvr >= 78 ? "counter" : "bus";
  if (shape.defCentral === 3) return avgOvr >= 80 ? "counter" : "bus";
  if (shape.attWide === 0 && shape.midWide === 0 && shape.attCentral >= 2) return avgOvr >= 80 ? "tiki" : "direct";
  if (avgOvr >= 82) return identityIndex(clubId)%2 ? "gegen" : "tiki";
  if (avgOvr <= 72) return "bus";
  const candidates=formation==="4-3-3"?["gegen","tiki","counter"]:formation==="4-4-2"?["direct","counter","bus"]:["counter","direct","gegen","tiki"];
  return candidates[identityIndex(clubId)%candidates.length];
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
  const suspended = new Set(unavailablePlayerIds(s,s.stage === "ucl" ? "ucl" : "domestic"));
  const club = s.clubs.find(c=>c.id===s.myClubId);
  return { formation: s.formation, style:s.tacticalStyle || "balanced", line:s.defensiveLine ?? 50, trap:!!s.offsideTrap, aggression:s.defensiveAggression??50,
    halftimeStyle:s.halftimeStyle || "keep", autoSubs:s.autoSubs !== false,
    bench:club.players.filter(p=>!Object.values(s.lineup).includes(p.id) && !suspended.has(p.id)) };
}
export function aiTactics(club){
  const formation = bestFormation(club.players, club.preferredFormation || "4-4-2");
  const style=inferStyle(club.players,formation,club.id,club.leagueAvg),profile=CLUB_TACTIC_PROFILES[club.id];
  const defaults={tiki:[66,true,42],gegen:[72,true,68],bus:[30,false,35],counter:[42,false,50],direct:[50,false,56]};
  const [line,trap,aggression]=defaults[style]||[50,false,50];
  return { formation, style, line:profile?.line??line, trap:profile?.trap??trap, aggression:profile?.aggression??aggression, autoSubs:true, bench:club.players };
}
// Attack-vs-defense model: formation-shape tactics, playing-style identity and matchups, defensive line/offside
// trap, home advantage, and a per-match variance swing (widened or narrowed by playing style).
// Events produce the score. Dismissals, fatigue, halftime plans and substitutes
// alter the players/tactics used for every subsequent minute.
export function simMatchSmart(teamAPlayers, teamBPlayers, homeA, tacticsA, tacticsB, rng=Math.random, minutes=95){
  const active = [teamAPlayers,teamBPlayers].map(team=>team.map(p=>({...p})));
  const initialPlayers = active.map(team=>team.map(p=>({...p})));
  const playerLogs = initialPlayers.map(team=>new Map(team.map(p=>[p.id,{playerId:p.id,name:p.name,role:p.role,group:p.group,start:0,end:minutes,goals:0,assists:0,shots:0,sot:0,xg:0,yellow:0,red:false}])));
  const tactics = [tacticsA,tacticsB].map(t=>({...t}));
  const events = [], goals = [0,0], goalLists = [[],[]], redCards = [null,null], yellowCards=[new Set(),new Set()], injuries=[[],[]];
  const totals = {shots:[0,0],sot:[0,0],xg:[0,0],touches:[0,0],bigChances:[0,0],bigChancesMissed:[0,0],passes:[0,0],accPasses:[0,0],fouls:[0,0],offsides:[0,0],corners:[0,0],tacklesWon:[0,0],interceptions:[0,0],clearances:[0,0],saves:[0,0],crosses:[0,0],successfulCrosses:[0,0],yellowCards:[0,0],redCards:[0,0]};
  const possession = [0,0], history=[];
  const snapshot = () => ({...Object.fromEntries(Object.entries(totals).map(([k,v])=>[k,v.map(n=>+n.toFixed(2))])),
    possession:possession[0]+possession[1] ? [0,1].map(i=>Math.round(100*possession[i]/(possession[0]+possession[1]))) : [50,50],
    passAcc:[0,1].map(i=>totals.passes[i] ? Math.round(100*totals.accPasses[i]/totals.passes[i]) : 0)});
  history.push(snapshot());
  const endMinute = minutes;
  for(let minute=1;minute<=endMinute;minute++){
    for(let side=0;side<2;side++){
      const tac=tactics[side];
      if(minute===46 && tac.halftimeStyle && tac.halftimeStyle!=="keep" && STYLES[tac.halftimeStyle]){
        tac.style=tac.halftimeStyle;
        events.push({minute,side,type:"tactics",text:`Switch to ${STYLES[tac.style].name}`});
      }
      if((minute===55 || minute===70) && tac.autoSubs){
        const unavailable = new Set([...playerLogs[side].keys(),...active[side].map(p=>p.id)]);
        const tired=[...active[side]].filter(p=>p.group!=="GK" && (p.energy??100)<(minute===55?84:78)).sort((a,b)=>(a.energy??100)-(b.energy??100));
        let substitutions=0;
        for(const out of tired){
          if(substitutions===(minute===55?3:2))break;
          const role=out.assignedRole || out.role;
          const incoming=[...(tac.bench||[])].filter(p=>!unavailable.has(p.id)&&slotAccepts(role,p)).sort((a,b)=>(b.energy??100)*b.ovr-(a.energy??100)*a.ovr)[0];
          if(!incoming || (incoming.energy??100)*matchOvr(incoming) <= (out.energy??100)*matchOvr(out)+300) continue;
          unavailable.add(incoming.id);substitutions++;
          active[side]=active[side].map(p=>p.id===out.id?{...incoming,assignedRole:role,group:ROLE_GROUP[role]}:p);
          const outLog=playerLogs[side].get(out.id);if(outLog)outLog.end=minute;
          playerLogs[side].set(incoming.id,{playerId:incoming.id,name:incoming.name,role:incoming.role,group:ROLE_GROUP[role],start:minute,end:95,goals:0,assists:0,shots:0,sot:0,xg:0,yellow:0,red:false});
          events.push({minute,side,type:"sub",playerId:incoming.id,outId:out.id,text:`${incoming.name} replaces ${out.name}`});
        }
      }
      // A low-energy, low-stamina player is more exposed. Most injuries are short,
      // but occasional longer absences make squad depth and rotation matter.
      if(injuries[side].length===0){
        const candidates=active[side].filter(player=>player.group!=="GK");
        const vulnerable=[...candidates].sort((a,b)=>((a.energy??100)/(a.stamina??80))-((b.energy??100)/(b.stamina??80)))[0];
        if(vulnerable){
          const energy=clamp(vulnerable.energy??100,0,100),stamina=clamp(vulnerable.stamina??80,1,100);
          const chance=0.000045+((100-energy)/100)*0.00016+Math.max(0,78-stamina)*0.000003;
          if(rng()<chance){
            const roll=rng();
            const matches=roll<0.62?1:roll<0.88?2+Math.floor(rng()*2):roll<0.98?4+Math.floor(rng()*3):7+Math.floor(rng()*4);
            const severity=matches===1?"knock":matches<=3?"minor injury":matches<=6?"muscle injury":"serious injury";
            injuries[side].push({playerId:vulnerable.id,name:vulnerable.name,matches,severity,minute});
            active[side]=active[side].filter(player=>player.id!==vulnerable.id);
            const outLog=playerLogs[side].get(vulnerable.id);if(outLog)outLog.end=minute;
            const used=new Set(playerLogs[side].keys());
            const role=vulnerable.assignedRole||vulnerable.role;
            const incoming=[...(tac.bench||[])].filter(player=>!used.has(player.id)&&slotAccepts(role,player)).sort((a,b)=>(b.energy??100)*b.ovr-(a.energy??100)*a.ovr)[0];
            if(incoming){
              active[side].push({...incoming,assignedRole:role,group:ROLE_GROUP[role]});
              playerLogs[side].set(incoming.id,{playerId:incoming.id,name:incoming.name,role:incoming.role,group:ROLE_GROUP[role],start:minute,end:minutes,goals:0,assists:0,shots:0,sot:0,xg:0,yellow:0,red:false});
              events.push({minute,side,type:"injury",playerId:vulnerable.id,outId:vulnerable.id,inId:incoming.id,matches,severity,text:`${vulnerable.name} leaves injured (${severity}, ${matches} match${matches===1?"":"es"}) — ${incoming.name} comes on`});
            }else events.push({minute,side,type:"injury",playerId:vulnerable.id,matches,severity,text:`${vulnerable.name} leaves injured (${severity}, ${matches} match${matches===1?"":"es"})`});
          }
        }
      }
      active[side]=active[side].map(p=>({...p,energy:Math.max(15,(p.energy??100)-(tac.style==="gegen"?0.34:0.23)*(84/(p.stamina??80)))}));

    }
    const ratings=active.map(teamRatings);
    for(let side=0;side<2;side++){
      const other=1-side,tac=tactics[side],opp=tactics[other];
      const style=STYLES[tac.style]||STYLES.balanced,oppStyle=STYLES[opp.style]||STYLES.balanced;
      const line=lineModifier(tac.line,tac.trap,ratings[side].defense,ratings[other].attack);
      const oppLine=lineModifier(opp.line,opp.trap,ratings[other].defense,ratings[side].attack);
      const rawRatio=ratings[side].attack*(1+style.attack+line.attackAdj+styleMatchupBonus(tac.style,opp.style)) /
        (ratings[other].defense*(1+oppStyle.defense+oppLine.defenseAdj+((opp.aggression??50)-50)*0.00025));
      const ratio=rawRatio**2;
      const advantage=homeA==null ? 1 : ((side===0)===homeA ? 1.12 : 0.92);
      const passes=Math.round(3+rng()*3+(tac.style==="tiki"?2:0));
      totals.passes[side]+=passes;totals.accPasses[side]+=Math.round(passes*(0.72+rng()*0.18));
      possession[side]+=passes*(ratings[side].attack/80);
      if(rng()<0.17)totals.tacklesWon[other]++;
      if(rng()<0.13)totals.interceptions[other]++;
      if(rng()<0.16){totals.crosses[side]++;if(rng()<0.31)totals.successfulCrosses[side]++;}
      // A restart must come from an actual defending foul. Discipline is resolved on that foul,
      // so there are no random dismissals or unearned penalties.
      let restart=null;
      const defenders=active[other].filter(p=>p.group!=="GK");
      const aggression=clamp(opp.aggression??50,0,100);
      if(defenders.length&&rng()<0.075+aggression*0.0008){
        totals.fouls[other]++;
        const tackler=defenders[Math.floor(rng()*defenders.length)];
        const inBox=rng()<0.012;
        const dangerous=!inBox&&rng()<0.07;
        restart=inBox?"penalty":dangerous?"freekick":null;
        events.push({minute,side:other,type:"foul",playerId:tackler.id,restart,
          text:inBox?`${tackler.name} fouls in the box — penalty!`:dangerous?`${tackler.name} fouls near the area — free kick`:`Foul by ${tackler.name}`});
        const bookChance=(0.11+aggression*0.001)*(yellowCards[other].has(tackler.id)?0.35:1);
        const log=playerLogs[other].get(tackler.id);
        if(rng()<bookChance){
          if(yellowCards[other].has(tackler.id)){
            if(minute>=10&&!redCards[other]){
              redCards[other]={id:tackler.id,name:tackler.name,minute,reason:"second yellow"};
              active[other]=active[other].filter(p=>p.id!==tackler.id);
              if(log){log.end=minute;log.yellow=2;log.red=true;}
              totals.yellowCards[other]++;totals.redCards[other]++;
              events.push({minute,side:other,type:"yellow",playerId:tackler.id,text:`Second yellow card for ${tackler.name}`});
              events.push({minute,side:other,type:"red",playerId:tackler.id,text:`Second yellow! ${tackler.name} is sent off`});
            }
          }else{
            yellowCards[other].add(tackler.id);
            if(log)log.yellow=1;
            totals.yellowCards[other]++;
            events.push({minute,side:other,type:"yellow",playerId:tackler.id,text:`Yellow card for ${tackler.name}`});
          }
        }else if(minute>=10&&!redCards[other]&&rng()<0.0005+aggression*0.000015){
          redCards[other]={id:tackler.id,name:tackler.name,minute,reason:"serious foul"};
          active[other]=active[other].filter(p=>p.id!==tackler.id);
          if(log){log.end=minute;log.red=true;}
          totals.redCards[other]++;
          events.push({minute,side:other,type:"red",playerId:tackler.id,text:`RED CARD! ${tackler.name} is sent off for a serious foul`});
        }
      }
      if(rng()<0.02) totals.offsides[side]++;
      if(rng()<0.03*Math.sqrt(ratio)) totals.corners[side]++;
      if(active[side].length && (restart==="penalty" || rng()<clamp(0.145*ratio*advantage*(1+tacticalModifier(tac.formation,opp.formation)),0.025,0.36))){
        const pool=active[side].filter(p=>p.group!=="GK");
        if(!pool.length) continue;
        const weights=pool.map(p=>p.group==="FWD"?4:p.group==="MID"?2:0.5);
        let pick=rng()*weights.reduce((a,b)=>a+b,0),shooter=pool.at(-1);
        for(let i=0;i<pool.length;i++){pick-=weights[i];if(pick<=0){shooter=pool[i];break;}}
        const method=restart||((rng()<0.15)?"corner":"goal");
        const xg=method==="penalty"?0.76:method==="freekick"?clamp(0.075*ratio,0.03,0.18):clamp((0.025+0.28*Math.pow(rng(),2.6))*ratio,0.02,0.75);
        const scored=rng()<xg;
        const shotLog=playerLogs[side].get(shooter.id);if(shotLog){shotLog.shots++;shotLog.xg+=xg;}
        totals.shots[side]++;totals.xg[side]+=xg;totals.touches[side]+=2;
        const onTarget=scored||rng()<0.34;
        if(onTarget){totals.sot[side]++;if(shotLog)shotLog.sot++;if(!scored)totals.saves[other]++;}
        if(rng()<0.32)totals.clearances[other]++;
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
        const shotY=method==="penalty"?0.5:xg>=0.25?0.35+rng()*0.30:0.18+rng()*0.64;
        const shotX=method==="penalty"?0.89:clamp(0.77+Math.sqrt(xg)*0.28+(rng()-0.5)*0.04,0.80,0.95);
        events.push({minute,side,isGoal:scored,playerId:shooter.id,xg:+xg.toFixed(3),zone:Math.min(2,Math.floor(shotY*3)),shotX:+shotX.toFixed(3),shotY:+shotY.toFixed(3),type:scored?method:method==="penalty"?"penalty-miss":method==="corner"?"corner-miss":"chance",
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
    const cleanSheet=goals[1-side]===0&&minutes>=60&&(log.group==="GK"||log.group==="DEF");
    return {...log,minutes,side,cleanSheet,rating:+clamp(raw,3,10).toFixed(1)};
  }));
  const allRatings=playerRatings.flat();
  const manOfTheMatch=[...allRatings].sort((a,b)=>b.rating-a.rating||b.goals-a.goals||b.assists-a.assists)[0];
  for(const rating of allRatings){
    rating.isMotm=rating===manOfTheMatch;
    rating.confidenceDelta=rating.red?-2:rating.rating<=5.5?-2:rating.rating<6?-1:(rating.isMotm||rating.goals>=3)?2:(rating.goals+rating.assists>0||rating.rating>=7.4)?1:0;
  }
  const match={events,endMinute,initialPlayers,goalLists,redCards,injuries,playerRatings,manOfTheMatch:{...manOfTheMatch},stats:{...snapshot(),history}};
  return {goalsA:goals[0],goalsB:goals[1],match};
}
export function matchFields(sim,isHome){
  const side=isHome?0:1;
  return {match:sim.match,goalList:sim.match.goalLists[side],oppGoalList:sim.match.goalLists[1-side],redCard:sim.match.redCards[side],
    injuries:sim.match.injuries[side],
    playerRatings:sim.match.playerRatings,manOfTheMatch:sim.match.manOfTheMatch,
    scorerStr:formatScorers(sim.match.goalLists[side])};
}
function sumMatchStats(regulation, extra){
  const stats={...regulation};
  for(const [key,value] of Object.entries(extra)){
    if(key==="history"||key==="passAcc"||key==="possession")continue;
    if(Array.isArray(value)&&Array.isArray(stats[key]))stats[key]=stats[key].map((n,index)=>+(n+(value[index]||0)).toFixed(2));
  }
  const passes=stats.passes||[0,0],accurate=stats.accPasses||[0,0];
  stats.passAcc=[0,1].map(index=>passes[index]?Math.round(100*accurate[index]/passes[index]):0);
  const poss=(stats.possession||[50,50]).map((_,index)=>(regulation.passes?.[index]||0)+(extra.passes?.[index]||0));
  stats.possession=poss[0]+poss[1]?[Math.round(100*poss[0]/(poss[0]+poss[1])),Math.round(100*poss[1]/(poss[0]+poss[1]))]:[50,50];
  stats.history=[...(regulation.history||[]),...(extra.history||[])];
  return stats;
}
// Extra time reuses the same event engine, then appends it to the regulation replay.
export function addExtraTime(regulation, teamAPlayers, teamBPlayers, homeA, tacticsA, tacticsB, rng=Math.random){
  const extra=simMatchSmart(teamAPlayers,teamBPlayers,homeA,tacticsA,tacticsB,rng,30);
  const shift=item=>({...item,minute:item.minute+95});
  const extraRatings=new Map(extra.match.playerRatings.flat().map(rating=>[rating.playerId,rating]));
  const ratings=regulation.match.playerRatings.map(side=>side.map(rating=>{
    const added=extraRatings.get(rating.playerId);if(!added)return rating;
    return {...rating,goals:rating.goals+added.goals,assists:rating.assists+added.assists,shots:rating.shots+added.shots,sot:rating.sot+added.sot,xg:+(rating.xg+added.xg).toFixed(3)};
  }));
  const allRatings=ratings.flat();
  const motm=[...allRatings].sort((a,b)=>b.rating-a.rating||b.goals-a.goals||b.assists-a.assists)[0];
  return {goalsA:regulation.goalsA+extra.goalsA,goalsB:regulation.goalsB+extra.goalsB,match:{
    ...regulation.match,endMinute:120,events:[...regulation.match.events,...extra.match.events.map(shift)],
    goalLists:[...regulation.match.goalLists.map((list,index)=>[...list,...extra.match.goalLists[index].map(shift)])],
    redCards:regulation.match.redCards.map((card,index)=>card||extra.match.redCards[index]),
    injuries:regulation.match.injuries.map((list,index)=>[...list,...extra.match.injuries[index].map(shift)]),
    playerRatings:ratings,manOfTheMatch:{...motm},stats:sumMatchStats(regulation.match.stats,extra.match.stats)
  }};
}
function shootoutOrder(players){
  const priority={ST:5,RW:4,LW:4,CAM:4,RM:3,LM:3,CM:3,CDM:2,CB:1,RB:1,LB:1,GK:0};
  return [...players].sort((a,b)=>(priority[b.assignedRole||b.role]||0)*100+b.ovr-((priority[a.assignedRole||a.role]||0)*100+a.ovr));
}
export function simulateShootout(teamAPlayers, teamBPlayers, rng=Math.random){
  const orders=[shootoutOrder(teamAPlayers),shootoutOrder(teamBPlayers)];
  const keepers=orders.map(team=>team.find(player=>player.role==="GK")||team.at(-1));
  const scores=[0,0],kicks=[];
  const take=(side,index)=>{
    const taker=orders[side][index%orders[side].length],keeper=keepers[1-side];
    const chance=clamp(0.73+(taker.ovr-keeper.ovr)*0.009+(rng()-0.5)*0.04,0.52,0.91);
    const scored=rng()<chance;scores[side]+=scored?1:0;kicks.push({side,playerId:taker.id,name:taker.name,scored});
  };
  for(let index=0;index<5;index++){take(0,index);take(1,index);}
  let index=5;
  while(scores[0]===scores[1]&&index<15){take(0,index);take(1,index);index++;}
  if(scores[0]===scores[1]){const side=rng()<0.5?0:1;scores[side]++;kicks.push({side,name:"Sudden death",scored:true});}
  return {scoreA:scores[0],scoreB:scores[1],wonA:scores[0]>scores[1],kicks};
}

export function performanceUpdatesForMatch(simulation,homeClubId,awayClubId,competition="league"){
  const [homeXI,awayXI]=simulation.match.initialPlayers;
  const strength=xi=>Math.round(xi.reduce((total,p)=>total+matchOvr(p),0)/Math.max(1,xi.length));
  return [
    {clubId:homeClubId,ratings:simulation.match.playerRatings[0],competition,opponentStrength:strength(awayXI)},
    {clubId:awayClubId,ratings:simulation.match.playerRatings[1],competition,opponentStrength:strength(homeXI)},
  ];
}
export function applyPerformanceUpdates(s,updates=[],recoverUnplayed=true){
  const byClub=new Map();
  for(const update of updates){
    if(!byClub.has(update.clubId))byClub.set(update.clubId,[]);
    byClub.get(update.clubId).push(...update.ratings.map(r=>({...r,competition:update.competition||"league",opponentStrength:update.opponentStrength??78})));
  }
  const updateClub=club=>{
    const ratings=byClub.get(club.id)||[];
    if(!recoverUnplayed&&!ratings.length)return club;
    const byPlayer=new Map(ratings.map(r=>[r.playerId,r]));
    return {...club,players:club.players.map(player=>{
      const r=byPlayer.get(player.id);
      const energy=player.energy??100,fitness=player.condition??100;
      if(!r)return {...player,energy:clamp(energy+20,15,100),condition:clamp(fitness+5,60,100)};
      const style=club.id===s.myClubId?s.tacticalStyle:aiTactics(club).style;
      const styleLoad=style==="gegen"?1.28:style==="tiki"?1.10:style==="bus"?0.85:1;
      const load=((r.minutes??95)/95)*(13+(r.opponentStrength-70)*0.25)*styleLoad*(84/(player.stamina??80))*(player.group==="GK"?0.55:1);
      const nextEnergy=clamp(Math.round(energy+15-load),15,99);
      const nextFitness=clamp(Math.round(fitness+2-((r.minutes??95)/95)*(style==="gegen"?5:3)*(84/(player.stamina??80))),60,100);
      const oldConfidence=player.confidence||0;
      const faded=oldConfidence>0?oldConfidence-1:oldConfidence<0?oldConfidence+1:0;
      const previous=player.competitionStats?.[r.competition]||{};
      const competitionStats={...(player.competitionStats||{}),[r.competition]:{
        appearances:(previous.appearances||0)+1,goals:(previous.goals||0)+r.goals,
        assists:(previous.assists||0)+r.assists,cleanSheets:(previous.cleanSheets||0)+(r.cleanSheet?1:0),
        yellowCards:(previous.yellowCards||0)+(r.yellow||0),redCards:(previous.redCards||0)+(r.red?1:0),
        ratingTotal:+((previous.ratingTotal||0)+r.rating).toFixed(2),ratedMatches:(previous.ratedMatches||0)+1,
        bestRating:Math.max(previous.bestRating||0,r.rating),motm:(previous.motm||0)+(r.isMotm?1:0),
      }};
      return {...player,
        energy:nextEnergy,condition:nextFitness,
        competitionStats,
        appearances:(player.appearances||0)+1,
        seasonGoals:(player.seasonGoals||0)+r.goals,
        seasonAssists:(player.seasonAssists||0)+r.assists,
        seasonCleanSheets:(player.seasonCleanSheets||0)+(r.cleanSheet?1:0),
        seasonYellowCards:(player.seasonYellowCards||0)+(r.yellow||0),
        seasonRedCards:(player.seasonRedCards||0)+(r.red?1:0),
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
  const poolKeys=["clubs","plClubs","laligaClubs","serieaClubs","bundesligaClubs","ligue1Clubs","championshipClubs","laliga2Clubs","serieBClubs","bundes2Clubs","ligue2Clubs"];
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
export function formatScorers(goalList){
  if (!goalList || !goalList.length) return "";
  const byName = {};
  goalList.forEach(g => { (byName[g.name] = byName[g.name]||[]).push(g.minute); });
  return Object.entries(byName).map(([name,mins]) => `${name} ${mins.sort((a,b)=>a-b).map(m=>m<=90?`'${m}`:`'90+${m-90}`).join(", ")}`).join(", ");
}
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
export function appendClubForm(form={},updates=[]){
  const next={...form};
  for(const result of updates){
    const letter=result.gf>result.ga?"W":result.gf<result.ga?"L":"D";
    next[result.clubId]=[...(next[result.clubId]||[]),letter].slice(-5);
  }
  return next;
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
export function autoLineup(formationSlots, players, rating=p=>p.ovr){
  const used = new Set();
  const lineup = {};
  formationSlots.forEach((slot,i) => {
    const pick = players.filter(p=>!used.has(p.id) && p.role===slot.role).sort((a,b)=>rating(b)-rating(a))[0];
    if (pick){ lineup[i]=pick.id; used.add(pick.id); }
  });
  formationSlots.forEach((slot,i) => {
    if (lineup[i]) return;
    const compat = ROLE_COMPAT[slot.role] || [slot.role];
    const pick = players.filter(p=>!used.has(p.id) && compat.includes(p.role)).sort((a,b)=>rating(b)-rating(a))[0];
    if (pick){ lineup[i]=pick.id; used.add(pick.id); }
  });
  formationSlots.forEach((slot,i) => {
    if (lineup[i]) return;
    const group = ROLE_GROUP[slot.role];
    const pick = players.filter(p=>!used.has(p.id) && p.group===group).sort((a,b)=>rating(b)-rating(a))[0];
    if (pick){ lineup[i]=pick.id; used.add(pick.id); }
  });
  formationSlots.forEach((slot,i)=>{
    if(lineup[i]) return;
    const pick=players.filter(p=>!used.has(p.id) && (slot.role==="GK"?p.role==="GK":p.role!=="GK")).sort((a,b)=>rating(b)-rating(a))[0];
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
  const unavailable=new Set(unavailablePlayerIds(s,competition));
  if(players.some(p=>unavailable.has(p.id))) return "Replace suspended or injured players before kickoff.";
  return "";
}
export function unavailablePlayerIds(s,competition="domestic"){
  const injured=Object.entries(s.injuries||{}).filter(([,injury])=>(injury?.matches||0)>0).map(([id])=>id);
  return [...new Set([...(s.suspensions?.[competition]||[]),...injured])];
}
export function applyInjuries(s, incidents=[]){
  const injuries={};
  for(const [id,injury] of Object.entries(s.injuries||{}))if((injury.matches||0)>1)injuries[id]={...injury,matches:injury.matches-1};
  for(const injury of incidents||[])injuries[injury.playerId]={name:injury.name,matches:injury.matches,severity:injury.severity};
  return {...s,injuries};
}
export function getMatchPlayers(s, competition="domestic"){
  const myClub = s.clubs.find(c=>c.id===s.myClubId);
  const suspended = new Set(unavailablePlayerIds(s,competition));
  return playersForLineup(myClub.players,s.lineup,s.formation).filter(p=>!suspended.has(p.id));
}
export function simulateRound(s, round, gw){
  const lineupPlayers = getMatchPlayers(s);
  let userResult = null;
  const fixtures=[];
  const updates = [],performanceUpdates=[];
  round.forEach(([home, away]) => {
    const homeClub = s.clubs.find(c=>c.id===home), awayClub = s.clubs.find(c=>c.id===away);
    const homePlayers = home===s.myClubId ? lineupPlayers : topXI(homeClub.players,homeClub.preferredFormation);
    const awayPlayers = away===s.myClubId ? lineupPlayers : topXI(awayClub.players,awayClub.preferredFormation);
    const homeTactics = home===s.myClubId ? myTactics(s) : aiTactics(homeClub);
    const awayTactics = away===s.myClubId ? myTactics(s) : aiTactics(awayClub);
    const simulation = simMatchSmart(homePlayers, awayPlayers, true, homeTactics, awayTactics);
    const {goalsA,goalsB}=simulation;
    fixtures.push({competition:s.league,round:gw,homeId:home,awayId:away,homeGoals:goalsA,awayGoals:goalsB});
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
  return { updates, userResult, performanceUpdates, fixtures };
}
export function ensureFixtures(s){
  if (s.roundsHalf1) return attachSeasonSchedule(s);
  const ids = s.clubs.map(c=>c.id);
  const r1 = roundRobin(ids);
  const r2 = r1.map(round => round.map(([h,a]) => [a,h]));
  return attachSeasonSchedule({ ...s, roundsHalf1:r1, roundsHalf2:r2, tableRaw: initTable(ids), fixtureResults:s.fixtureResults||[] });
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
  const domesticCup={SERIEA:{comp:"coppa",slots:COPPA_SCHEDULE},BUNDES:{comp:"dfb",slots:DFB_SCHEDULE},LIGUE1:{comp:"coupe",slots:COUPE_SCHEDULE}}[league];
  if(domesticCup){
    if(half!==2)return null;
    for(const slot of domesticCup.slots){const cs=cupStatus[domesticCup.comp];if(slot.afterRound===roundIndex&&cs?.alive!==false&&!cs?.playedRounds.includes(slot.round))return {comp:domesticCup.comp,round:slot.round};}
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
  const domesticPools={PL:[s.plClubs,s.championshipClubs],LALIGA:[s.laligaClubs,s.laliga2Clubs],SERIEA:[s.serieaClubs,s.serieBClubs],BUNDES:[s.bundesligaClubs,s.bundes2Clubs],LIGUE1:[s.ligue1Clubs,s.ligue2Clubs]};
  const pool=[...(domesticPools[s.league]||[s.clubs]).flat()].filter(club=>club.id!==s.myClubId);
  const avail = pool.filter(c=>!cs.faced.includes(c.id));
  const scheduled=s.seasonSchedule?.find(e=>e.kind==="cup"&&e.comp===comp&&e.round===round&&e.status==="scheduled"&&(e.homeId===s.myClubId||e.awayId===s.myClubId));
  const opp = scheduled?findClubAnywhere(s,scheduled.homeId===s.myClubId?scheduled.awayId:scheduled.homeId):(avail.length ? avail : pool)[Math.floor(Math.random()*(avail.length ? avail.length : pool.length))];
  if(!opp)throw new Error("The cup draw is not ready.");
  const lineupPlayers = getMatchPlayers(s);
  const oppPlayers = topXI(opp.players,opp.preferredFormation);
  const oppTactics = aiTactics(opp);
  const myTac = myTactics(s);
  const neutralVenue = round === "Final";
  const homeA = scheduled?scheduled.homeId===s.myClubId:Math.random() < 0.5;
  const homePlayers=homeA?lineupPlayers:oppPlayers, awayPlayers=homeA?oppPlayers:lineupPlayers;
  const homeTactics=homeA?myTac:oppTactics, awayTactics=homeA?oppTactics:myTac;
  let simulation = simMatchSmart(homePlayers, awayPlayers, neutralVenue ? null : true, homeTactics, awayTactics);
  if(simulation.goalsA===simulation.goalsB)simulation=addExtraTime(simulation,homePlayers,awayPlayers,neutralVenue?null:true,homeTactics,awayTactics);
  const performanceUpdates=performanceUpdatesForMatch(simulation,homeA?s.myClubId:opp.id,homeA?opp.id:s.myClubId,comp);
  const {goalsA,goalsB}=simulation;
  const myGoals = homeA?goalsA:goalsB, oppGoals = homeA?goalsB:goalsA;
  let wentToPens = false, wonPens = null, shootout=null;
  if (myGoals === oppGoals){
    wentToPens=true;shootout=simulateShootout(homePlayers,awayPlayers);
    wonPens=homeA?shootout.wonA:!shootout.wonA;
  }
  const won = myGoals > oppGoals || (wentToPens && wonPens);
  const {goalList,scorerStr,redCard}=matchFields(simulation,homeA);
  const matchResult = { ...matchFields(simulation,homeA), performanceUpdates, comp, round, opponent:opp.name, opponentColor:opp.color, opponentId:opp.id, homeA, neutralVenue, myGoals, oppGoals, wentToPens, wonPens, shootout:shootout&&{mine:homeA?shootout.scoreA:shootout.scoreB,opp:homeA?shootout.scoreB:shootout.scoreA,kicks:shootout.kicks}, won, scorerStr, goalList, redCard };
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
  const updates = [],performanceUpdates=[],fixtures=[];
  let userResult = null;
  round.forEach(([home, away]) => {
    const homeClub = uclClubs.find(c=>c.id===home), awayClub = uclClubs.find(c=>c.id===away);
    const simulation = simulateUclMatch(s, homeClub, awayClub);
    const {goalsA,goalsB}=simulation;
    fixtures.push({competition:"UCL",round:s.ucl.roundIndex+1,homeId:home,awayId:away,homeGoals:goalsA,awayGoals:goalsB});
    performanceUpdates.push(...performanceUpdatesForMatch(simulation,home,away,"ucl"));
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
  return { updates, userResult, performanceUpdates, fixtures };
}
export function simulateUclSingleMatch(s, opponent, stageLabel, forcedIsHome, allowPens=true, prior={mine:0,opp:0}){
  const lineupPlayers = getMatchPlayers(s, "ucl");
  const neutralVenue = forcedIsHome === null;
  const isHome = neutralVenue ? Math.random() < 0.5 : forcedIsHome!==undefined ? forcedIsHome : Math.random() < 0.5;
  const oppPlayers = topXI(opponent.players,opponent.preferredFormation);
  const oppTactics = aiTactics(opponent);
  const myTac = myTactics(s);
  const homePlayers=isHome?lineupPlayers:oppPlayers, awayPlayers=isHome?oppPlayers:lineupPlayers;
  const homeTactics=isHome?myTac:oppTactics, awayTactics=isHome?oppTactics:myTac;
  let simulation = simMatchSmart(homePlayers, awayPlayers, neutralVenue ? null : true, homeTactics, awayTactics);
  const normalMyGoals=isHome?simulation.goalsA:simulation.goalsB,normalOppGoals=isHome?simulation.goalsB:simulation.goalsA;
  if(allowPens&&prior.mine+normalMyGoals===prior.opp+normalOppGoals)simulation=addExtraTime(simulation,homePlayers,awayPlayers,neutralVenue?null:true,homeTactics,awayTactics);
  const performanceUpdates=performanceUpdatesForMatch(simulation,isHome?s.myClubId:opponent.id,isHome?opponent.id:s.myClubId,"ucl");
  const {goalsA,goalsB}=simulation;
  const myGoals = isHome?goalsA:goalsB, oppGoals = isHome?goalsB:goalsA;
  const aggregate={mine:prior.mine+myGoals,opp:prior.opp+oppGoals};
  const wentToPens=allowPens&&aggregate.mine===aggregate.opp;
  const shootout=wentToPens?simulateShootout(homePlayers,awayPlayers):null;
  const wonPens=wentToPens?(isHome?shootout.wonA:!shootout.wonA):null;
  const won=allowPens?(aggregate.mine>aggregate.opp||(wentToPens&&wonPens)):null;
  const {goalList,scorerStr,redCard}=matchFields(simulation,isHome);
  return { ...matchFields(simulation,isHome), performanceUpdates, stage:stageLabel, opponent:opponent.name, opponentColor:opponent.color, opponentId:opponent.id,
    isHome, neutralVenue, myGoals, oppGoals, scorerStr, goalList, redCard, wentToPens, wonPens, shootout:shootout&&{mine:isHome?shootout.scoreA:shootout.scoreB,opp:isHome?shootout.scoreB:shootout.scoreA,kicks:shootout.kicks}, won, result: myGoals>oppGoals?"W":myGoals<oppGoals?"L":"D" };
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
  const effDefenseMe = rMe.defense * (1 + styleMe.defense + lineMe.defenseAdj + ((myTac.aggression??50)-50)*0.00025);
  const effDefenseOpp = rOpp.defense * (1 + styleOpp.defense + lineOpp.defenseAdj + ((oppTac.aggression??50)-50)*0.00025);
  return { ratings:{me:rMe, opp:rOpp}, formationEdge, hints,
    styleMeName: styleMe.name, styleOppName: styleOpp.name, styleBonusMe, styleBonusOpp,
    lineMe, lineOpp, aggressionMe:myTac.aggression??50, aggressionOpp:oppTac.aggression??50, effAttackMe, effAttackOpp, effDefenseMe, effDefenseOpp };
}
export function findClubAnywhere(s, id){
  const pools = [s.clubs, s.europeanGuestClubs, s.championshipClubs, s.laliga2Clubs, s.serieBClubs, s.bundes2Clubs, s.ligue2Clubs, s.plClubs, s.laligaClubs, s.serieaClubs, s.bundesligaClubs, s.ligue1Clubs];
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
export function buildLiveMatchContext(s, userResult, oppClub, competition="UCL"){
  const myClubObj = s.clubs.find(c=>c.id===s.myClubId);
  const competitionKey=competition==="UCL"?"ucl":"domestic";
  const lineupPlayers = getMatchPlayers(s, competitionKey);
  const oppPlayers = topXI(oppClub.players,oppClub.preferredFormation);
  const homeName = userResult.isHome ? myClubObj.name : oppClub.name;
  const awayName = userResult.isHome ? oppClub.name : myClubObj.name;
  const match=userResult.match;
  // Old saves resume at their result screen; new matches always carry their events.
  const timeline=(match?.events||[]).map(e=>({...e,teamName:e.side===0?homeName:awayName}));
  const myTac=myTactics(s),oppTac=aiTactics(oppClub);
  const stats=match?.stats;
  const analysis = analyzeMatchup(lineupPlayers, oppPlayers, myTac, oppTac);
  return { timeline, homeName, awayName, homeClubId:userResult.isHome?myClubObj.id:oppClub.id,
    awayClubId:userResult.isHome?oppClub.id:myClubObj.id, homeColor:userResult.isHome?myClubObj.color:oppClub.color, awayColor:userResult.isHome?oppClub.color:myClubObj.color, competition,
    myName: myClubObj.name, oppName: oppClub.name, stats, analysis,
    playerRatings:match?.playerRatings,manOfTheMatch:match?.manOfTheMatch,myTacStyle: myTac.style, oppTacStyle: oppTac.style };
}

export function freshState(){
  const plClubs = buildClubs();
  const laligaClubs = buildLaLigaClubs();
  const serieaClubs = buildSerieAClubs();
  const bundesligaClubs = buildBundesligaClubs();
  const ligue1Clubs = buildLigue1Clubs();
  return {
    stage: "league-select", league: null, division:1, clubs: plClubs,
    season:1, history:[], loans:[], finances:[], halftimeStyle:"keep", autoSubs:true,
    plClubs, laligaClubs, serieaClubs, bundesligaClubs, ligue1Clubs, championshipClubs: buildChampionshipClubs(), laliga2Clubs:buildLaLiga2Clubs(), serieBClubs:buildSerieBClubs(), bundes2Clubs:buildBundes2Clubs(), ligue2Clubs:buildLigue2Clubs(), europeanGuestClubs:buildEuropeanGuestClubs(),
    myClubId: null, simMode: null,
    formation: "4-3-3", lineup: {}, budget: 0, tacticalStyle: "balanced", defensiveLine: 50, defensiveAggression: 50, offsideTrap: false,
    suspensions: { domestic: [], ucl: [] }, injuries: {},
    half: 1, roundIndex: 0, roundsHalf1: null, roundsHalf2: null, tableRaw: null, lastResult: null,
    results1: [], results2: [], fixtureResults: [], seasonSchedule: [], mail:[], table1: null, tableFinal: null,
    clubForm: {},
    cupStatus: { fa: emptyCupStatus(), carabao: emptyCupStatus(), copa: emptyCupStatus(), coppa:emptyCupStatus(), dfb:emptyCupStatus(), coupe:emptyCupStatus() }, lastCupResult: null,
    cups: { ucl: null }, ucl: null,
  };
}


export function seasonLabel(s){const y=2026+(s.season||1)-1;return `${y}/${String(y+1).slice(-2)}`;}
export const LEAGUE_NAMES={PL:"Premier League",LALIGA:"La Liga",SERIEA:"Serie A",BUNDES:"Bundesliga",LIGUE1:"Ligue 1"};
