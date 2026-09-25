export function standingsZone(league,rank,total){
  if(league==='UCL'||league==='UEL')return rank<=8?{key:'direct',label:'Round of 16',color:'blue'}:rank<=24?{key:'playoff',label:'Knockout playoff',color:'cyan'}:{key:'out',label:'Eliminated',color:'red'};
  // Second tiers have their own route out of the division. They must never
  // inherit top-flight European qualification colours or labels.
  if(league==='CHAMPIONSHIP'){
    if(rank<=2)return {key:'promotion',label:'Automatic promotion',color:'green'};
    if(rank<=6)return {key:'promotion-playoff',label:'Promotion playoff',color:'amber'};
    if(rank>=22)return {key:'relegation',label:'Relegation',color:'red'};
    return null;
  }
  if(league==='BUNDES2'){
    if(rank<=2)return {key:'promotion',label:'Automatic promotion',color:'green'};
    if(rank===3)return {key:'promotion-playoff',label:'Promotion/relegation playoff',color:'amber'};
    if(rank===16)return {key:'relegation-playoff',label:'Relegation playoff',color:'amber'};
    if(rank>=17)return {key:'relegation',label:'Relegation',color:'red'};
    return null;
  }
  if(league==='LALIGA2'){
    if(rank<=2)return {key:'promotion',label:'Automatic promotion',color:'green'};
    if(rank<=6)return {key:'promotion-playoff',label:'Promotion playoff',color:'amber'};
    if(rank>=total-3)return {key:'relegation',label:'Relegation',color:'red'};
    return null;
  }
  if(league==='SERIEB'){
    if(rank<=2)return {key:'promotion',label:'Automatic promotion',color:'green'};
    if(rank<=8)return {key:'promotion-playoff',label:'Promotion playoff',color:'amber'};
    if(rank>=16&&rank<=17)return {key:'relegation-playoff',label:'Relegation playoff',color:'amber'};
    if(rank>=18)return {key:'relegation',label:'Relegation',color:'red'};
    return null;
  }
  if(league==='LIGUE2'){
    if(rank<=2)return {key:'promotion',label:'Automatic promotion',color:'green'};
    if(rank===3)return {key:'promotion-playoff',label:'Promotion playoff',color:'amber'};
    if(rank>=total-2)return {key:'relegation',label:'Relegation',color:'red'};
    return null;
  }
  // The champion gets a distinct gold mark. The following top-four places
  // route to the Champions League and fifth/sixth to Europa League.
  if(rank===1)return {key:'champion',label:'League winners',color:'gold'};
  if(rank<=4)return {key:'champions',label:'Champions League places',color:'blue'};
  if(rank<=6)return {key:'europa',label:'Europa League places',color:'orange'};
  if((league==='BUNDES'||league==='LIGUE1')&&rank===total-2)return {key:'relegation-playoff',label:'Relegation playoff',color:'amber'};
  const relegation=league==='BUNDES'||league==='LIGUE1'?2:3;
  if(rank>total-relegation)return {key:'relegation',label:'Relegation places',color:'red'};
  return null;
}
export function standingsLegend(league,total){
  const ranksByCompetition={
    UCL:[1,9,25],UEL:[1,9,25],
    CHAMPIONSHIP:[1,3,22],
    BUNDES2:[1,3,16,17],
    LALIGA2:[1,3,total-3],
    SERIEB:[1,3,16,18],
    LIGUE2:[1,3,total-2],
  };
  const ranks=ranksByCompetition[league]||[1,2,5,total-(league==='BUNDES'||league==='LIGUE1'?2:3)+1,...((league==='BUNDES'||league==='LIGUE1')?[total-2]:[])];
  return ranks.map(rank=>standingsZone(league,rank,total)).filter((zone,index,array)=>zone&&array.findIndex(item=>item?.key===zone.key)===index);
}
