// Board ambitions are simulation targets, not real-world club statements.
const quality=c=>[...(c?.players||[])].sort((a,b)=>b.ovr-a.ovr).slice(0,11).reduce((n,p)=>n+p.ovr,0)/Math.max(1,Math.min(11,c?.players.length||0));
const bound=n=>Math.max(0,Math.min(100,Math.round(n)));
const levels={'Champion':6,'CHAMPIONS':6,'WINNER':6,'Final':5,'RUNNERS-UP':5,'Semi-Final':4,'Quarter-Final':3,'Round of 16':2,'Knockout playoffs':1,'League Phase':0};
export function ensureBoard(s){
  if(!s.myClubId)return s;
  if(s.board?.season===s.season&&s.board.clubId===s.myClubId)return s;
  const club=s.clubs.find(c=>c.id===s.myClubId),q=quality(club),rank=[...s.clubs].sort((a,b)=>quality(b)-quality(a)).findIndex(c=>c.id===s.myClubId)+1;
  const elite=q>=84&&rank<=4,contender=!elite&&(q>=80||rank<=5),size=s.clubs.length;
  const leagueTarget=elite?1:contender?Math.min(4,size):rank<=Math.ceil(size/2)?Math.ceil(size/2):Math.max(1,size-3);
  const objectives=[{id:'league',kind:'league',title:leagueTarget===1?'Win the league':`Finish in the top ${leagueTarget}`,target:leagueTarget,weight:50},
    {id:'domestic',kind:'domestic',title:elite?'Win a domestic cup':contender?'Reach a domestic cup semi-final':'Reach a domestic cup quarter-final',target:elite?6:contender?4:3,weight:25}];
  const european=['ucl','uel','uecl'].find(k=>s[k]?.clubs?.some(c=>c.id===s.myClubId));
  if(european)objectives.push({id:european,kind:'europe',title:elite&&european==='ucl'?'Win the Champions League':`Reach the ${contender||elite?'quarter':'round of 16'}${contender||elite?'-finals':''} in Europe`,target:elite&&european==='ucl'?6:contender||elite?3:2,weight:20});
  objectives.push({id:'finance',kind:'finance',title:'Keep wages funded and spending sustainable',target:1,weight:15});
  const board={season:s.season,clubId:s.myClubId,quality:Math.round(q),strengthRank:rank,ambition:elite?'Title contenders':contender?'European ambition':'Build sustainably',objectives,status:'active',startedDate:s.currentDate,previousConfidence:s.board?.review?.confidence??75};
  return {...s,board,managementVersion:1,mail:[{id:`board:${s.season}:${club.id}:targets`,type:'board',date:s.currentDate||`${2025+s.season}-08-15`,subject:'Your season mandate',read:false,body:`The board sees this squad as ${board.ambition.toLowerCase()}. ${objectives.map(o=>o.title).join('. ')}. We assess the whole season, not one defeat. A review below 40/100 ends your managerial contract; strong cup progress can offset a disappointing league finish.`},...(s.mail||[])].slice(0,120)};
}
function stageLevel(name=''){
  if(levels[name]!=null)return levels[name];
  const n=String(name||'').toUpperCase();
  if(n.startsWith('CHAMPIONS')||n==='WINNER'||n==='CHAMPION')return 6;
  if(n.includes('RUNNER')||n==='FINAL'||n.startsWith('FINAL '))return 5;
  if(n.includes('SEMI'))return 4;if(n.includes('QUARTER'))return 3;if(n.includes('16'))return 2;if(n.includes('PLAYOFF'))return 1;return 0;
}
function cupLevel(s,competition){
  let best=0;
  for(const e of s.seasonSchedule||[])if(e.competition===competition&&(e.homeId===s.myClubId||e.awayId===s.myClubId)&&!['pending-draw','cancelled'].includes(e.status)){
    best=Math.max(best,e.round==='Fifth Round'?2:stageLevel(e.round));if(e.round==='Final'&&e.winnerId===s.myClubId)best=6;
  }
  const key={FA:'fa',CARABAO:'carabao',COPA:'copa',COPPA:'coppa',DFB:'dfb',COUPE:'coupe',TACA:'taca'}[competition]||competition.toLowerCase(),campaign=s.cupStatus?.[key]||s[key];
  best=Math.max(best,stageLevel(campaign?.outcome));
  for(const r of campaign?.results||campaign?.campaignResults||[])best=Math.max(best,stageLevel(r.round||r.stage),r.round==='Final'&&r.won?6:0);
  return best;
}
export function boardReport(input,final=false){
  const s=ensureBoard(input),board=s.board;if(!board)return {confidence:75,objectives:[],status:'Safe'};
  const rows=s.tableFinal||Object.values(s.tableRaw||{}).sort((a,b)=>(b.pts??b.points??0)-(a.pts??a.points??0)||(b.gd??(b.gf||0)-(b.ga||0))-(a.gd??(a.gf||0)-(a.ga||0)));
  const played=rows.find(r=>r.id===s.myClubId)?.p||rows.find(r=>r.id===s.myClubId)?.played||0,position=played||final?rows.findIndex(r=>r.id===s.myClubId)+1:0;
  const progress=final?1:Math.min(1,played/Math.max(1,(s.clubs.length-1)*2));
  const cups={PL:['FA','CARABAO'],LALIGA:['COPA'],SERIEA:['COPPA'],BUNDES:['DFB'],LIGUE1:['COUPE'],PORTUGAL:['TACA']}[s.league]||[];
  const objectives=board.objectives.map(o=>{
    let score=100,current='On track',achieved=false;
    if(o.kind==='league'){achieved=position>0&&position<=o.target;score=!position?75:bound(100-Math.max(0,position-o.target)*9);current=position?`Currently ${position}${position===1?'st':position===2?'nd':position===3?'rd':'th'}`:'Season not started';}
    if(o.kind==='domestic'||o.kind==='europe'){const level=o.kind==='domestic'?Math.max(0,...cups.map(c=>cupLevel(s,c))):cupLevel(s,o.id.toUpperCase());achieved=level>=o.target;score=bound(100-Math.max(0,o.target-level)*17);current=level===6?'Trophy secured':level===5?'Final reached':level===4?'Semi-final reached':level===3?'Quarter-final reached':level===2?'Round of 16 reached':'Campaign developing';}
    if(o.kind==='finance'){
      const accounts=Object.values(s.finance?.accounts||{}),date=s.finance?.lastPayrollDate||s.currentDate;
      const weeks=Math.max(0,Math.floor((Date.parse(`${2026+s.season}-06-30T12:00:00Z`)-Date.parse(`${date}T12:00:00Z`))/604800000));
      const due=accounts.reduce((n,a)=>n+a.wage*weeks,0),reserve=accounts.reduce((n,a)=>n+a.boardReserve+a.transferReserve,0);
      score=s.budget<0?0:due?bound(100*reserve/due):100;achieved=score>=90;current=achieved?'Wage commitments funded':'Wage reserve needs attention';
    }
    return {...o,score:final||o.kind==='finance'?score:bound(75+(score-75)*progress),current,achieved,missed:final&&!achieved};
  });
  const confidence=bound(objectives.reduce((n,o)=>n+o.score*o.weight,0)/objectives.reduce((n,o)=>n+o.weight,0));
  return {confidence,objectives,position,status:confidence>=70?'Secure':confidence>=55?'Supported':confidence>=40?'Under review':'At risk',dismissed:final&&confidence<40};
}
export function reviewBoardSeason(input){
  let s=ensureBoard(input);if(s.board?.status==='reviewed')return s;
  const review=boardReport(s,true),date=s.currentDate;
  return {...s,board:{...s.board,status:'reviewed',review},stage:review.dismissed?'game-over':s.stage,movement:review.dismissed?`Board confidence fell to ${review.confidence}/100 after the season review`:s.movement,mail:[{id:`board:${s.season}:${s.myClubId}:review`,type:'board',date,read:false,subject:review.dismissed?'Your managerial contract has ended':'Season review: the board verdict',body:`Board satisfaction: ${review.confidence}/100. ${review.objectives.map(o=>`${o.title}: ${o.achieved?'achieved':o.current}`).join('. ')}. ${review.dismissed?'The overall campaign fell below our minimum expectations. This career has ended; restart to begin a new challenge.':'We back you to lead the club into next season. Missing a single ambition does not automatically mean dismissal.'}`},...(s.mail||[])].slice(0,120)};
}
