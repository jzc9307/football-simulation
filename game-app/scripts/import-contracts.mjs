// Refresh the attributed FUTWIZ FC26 snapshot without modifying roster identities.
// Uses the public search action exposed by FUTWIZ's career table. No login/cookies.
import { freshState } from '../src/game/engine.js';
import { allClubs } from '../src/game/career.js';
const url='https://www.futwiz.com/fc27/career-mode/players';
const action='7fb8a0a24769efd59d26988252bbb6ba013134ce00';
const normalize=x=>String(x||'').replace(/[Øø]/g,'o').replace(/[Đđ]/g,'d').replace(/Ł/g,'L').replace(/ł/g,'l').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\bhaland\b/g,'haaland').replace(/[^a-z0-9 ]/g,' ').trim().replace(/\s+/g,' ');
async function page(page){
  const response=await fetch(url,{method:'POST',headers:{'Next-Action':action,'Content-Type':'text/plain;charset=UTF-8','Accept':'text/x-component'},body:JSON.stringify(['fc26',{filters:{gender:'men'},pagination:{page,limit:1000},sorting:{field:'rating',direction:'desc'}}])});
  if(!response.ok)throw Error(`FUTWIZ returned ${response.status}; do not bypass the challenge.`);
  const text=await response.text(),line=text.split('\n').find(x=>x.startsWith('1:'));
  const result=line&&JSON.parse(line.slice(2));if(!result?.success||!result.data)throw Error('Public search action unavailable.');
  return result.data;
}
const first=await page(1),rows=[...first.players];
for(let n=2;n<=Math.ceil(first.total/first.players.length);n+=6){const batch=await Promise.all(Array.from({length:Math.min(6,Math.ceil(first.total/first.players.length)-n+1)},(_,i)=>page(n+i)));batch.forEach(result=>rows.push(...result.players));}
const sourceRows=[...new Map(rows.map(p=>[p.pid,p])).values()].map(r=>({...r,full:normalize(`${r.fname} ${r.lname}`),common:normalize(r.common_name),sourceSlug:normalize(r.urlname?.replaceAll('-',' ')),team:normalize(r.team_name)}));
const players=[...new Map(allClubs(freshState()).flatMap(c=>c.players.map(p=>({...p,team:normalize(c.name)}))).map(p=>[p.slug,p])).values()];
const contracts={},unmatched=[];
for(const p of players){
  const name=normalize(p.name),tokens=name.split(' '),slug=normalize(p.slug.replaceAll('-',' '));
  const candidates=sourceRows.map(r=>{
    const {full,common,sourceSlug}=r;
    const same=[full,common,sourceSlug].includes(name)||[full,common,sourceSlug].includes(slug);
    const rt=full.split(' '),age=Number(r.dob),roles=[r.position,r.pos2,r.pos3,r.pos4];
    const consistent=Math.abs(age-p.age)<=2&&roles.includes(p.role);
    const subsequence=rt.length>=2&&tokens[0]===rt[0]&&tokens.at(-1)===rt.at(-1)&&rt.every(t=>tokens.includes(t)||t.length===1&&tokens.some(v=>v.startsWith(t)));
    const ct=common.split(' '),commonMatch=ct.length>=2&&ct.every(t=>tokens.includes(t));
    const sameTeam=r.team===p.team||r.team.endsWith(p.team)||p.team.endsWith(r.team);
    const surname=normalize(r.lname).split(' ').filter(t=>t.length>2&&!['dos','das','del','van','von'].includes(t));
    const localSurname=surname.length&&surname.every(t=>tokens.includes(t))&&sameTeam;
    return {r,score:same?100+(consistent?3:0)+(sameTeam?2:0):consistent&&subsequence?85:consistent&&commonMatch?80:consistent&&localSurname?70:0};
  }).filter(x=>x.score).sort((a,b)=>b.score-a.score);
  const best=candidates[0];
  if(!best||candidates[1]?.score===best.score){unmatched.push(p.name);continue;}
  const r=best.r,year=Number(r.contract_expires),wage=Number(String(r.wagep).replace(/[KM]/g,''))*(String(r.wagep).includes('M')?1e6:String(r.wagep).includes('K')?1000:1);
  if(!Number.isInteger(year)||year<2024||year>2040||!Number.isFinite(wage)||wage<0){unmatched.push(p.name);continue;}
  contracts[p.slug]=[year,wage,r.line_id,r.urlname,{abilities:[r.att2,r.att4,r.att3,r.att5,r.att6],height:r.height,foot:r.foot,nation:r.nation_name}];
}
process.stdout.write(JSON.stringify({contracts,meta:{source:'FUTWIZ FC26 career database',fetched:'2026-09-28',currency:'GBP',weekly:true,sourcePlayers:sourceRows.length,matched:Object.keys(contracts).length,total:players.length},unmatched}));
