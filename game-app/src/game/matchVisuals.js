const SHOT_TYPES=new Set(['goal','penalty','freekick','corner','chance','penalty-miss','corner-miss']);
export function isShotEvent(event){return SHOT_TYPES.has(event.type);}
// A smoothed home-minus-away pressure curve built only from generated match events.
export function momentumSeries(events,until=95){
  const length=Math.max(95,until);
  const impulses=Array(length+1).fill(0);
  for(const event of events){
    if(event.minute>length||event.minute<1)continue;
    let weight=0;
    if(isShotEvent(event))weight=0.28+Math.min(0.8,(event.xg||0.08)*2)+(event.isGoal?1.15:0);
    else if(event.type==='red')weight=-0.75;
    if(weight)impulses[event.minute]+=(event.side===0?1:-1)*weight;
  }
  const radius=4,sigma=2.1;
  const smooth=impulses.map((_,minute)=>{
    let sum=0,weightSum=0;
    for(let offset=-radius;offset<=radius;offset++){
      const index=minute+offset;if(index<0||index>=impulses.length)continue;
      const weight=Math.exp(-(offset*offset)/(2*sigma*sigma));
      sum+=impulses[index]*weight;weightSum+=weight;
    }
    return sum/weightSum;
  });
  const scale=Math.max(.25,...smooth.map(Math.abs));
  return smooth.map(value=>Math.max(-1,Math.min(1,value/scale)));
}
