export function standingsZone(league,rank,total){
  if(league==='UCL')return rank<=8?{key:'direct',label:'Round of 16',color:'blue'}:rank<=24?{key:'playoff',label:'Knockout playoff',color:'cyan'}:{key:'out',label:'Eliminated',color:'red'};
  if(rank<=4)return {key:'champions',label:'Champions League places',color:'blue'};
  if(rank<=6)return {key:'europe',label:'European places',color:'violet'};
  if((league==='BUNDES'||league==='LIGUE1')&&rank===total-2)return {key:'relegation-playoff',label:'Relegation playoff',color:'amber'};
  const relegation=league==='BUNDES'||league==='LIGUE1'?2:3;
  if(rank>total-relegation)return {key:'relegation',label:'Relegation places',color:'red'};
  return null;
}
export function standingsLegend(league,total){
  const ranks=league==='UCL'?[1,9,25]:[1,5,total-(league==='BUNDES'||league==='LIGUE1'?2:3)+1,...((league==='BUNDES'||league==='LIGUE1')?[total-2]:[])];
  return ranks.map(rank=>standingsZone(league,rank,total)).filter((zone,index,array)=>zone&&array.findIndex(item=>item?.key===zone.key)===index);
}
