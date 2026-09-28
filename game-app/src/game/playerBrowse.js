import { ROLE_GROUP } from './config.js';

export const POSITION_OPTIONS = [
  { label:'Units', options:[['GK','Goalkeepers'],['DEF','Defenders'],['MID','Midfielders'],['FWD','Forwards']] },
  { label:'Defence', options:[['LB','LB · Left back'],['CB','CB · Centre back'],['RB','RB · Right back']] },
  { label:'Midfield', options:[['CDM','CDM · Defensive midfield'],['CM','CM · Central midfield'],['CAM','CAM · Attacking midfield'],['LM','LM · Left midfield'],['RM','RM · Right midfield']] },
  { label:'Attack', options:[['LW','LW · Left wing'],['RW','RW · Right wing'],['ST','ST · Striker']] },
];
export function matchesPosition(player, position='ALL') {
  if(position==='ALL')return true;
  if(['DEF','MID','FWD'].includes(position))return (player.group||ROLE_GROUP[player.role])===position;
  return player.role===position || (player.secondaryRoles||[]).includes(position);
}
export const PERFORMANCE_COLUMNS = [
  ['name','Player'],['role','Pos'],['ovr','OVR'],['appearances','Apps'],['goals','Goals'],
  ['assists','Assists'],['cleanSheets','Clean sheets'],['yellowCards','Yellow'],
  ['redCards','Red'],['average','Average'],['bestRating','Best'],
];
export function performanceStats(player, competition='all') {
  const stats=competition==='all'?{
    appearances:player.ratedMatches||0,goals:player.seasonGoals||0,assists:player.seasonAssists||0,
    cleanSheets:player.seasonCleanSheets||0,yellowCards:player.seasonYellowCards||0,redCards:player.seasonRedCards||0,
    ratingTotal:player.ratingTotal||0,ratedMatches:player.ratedMatches||0,bestRating:player.bestRating||0,
  }:player.competitionStats?.[competition]||{};
  return {...stats,appearances:stats.appearances??stats.ratedMatches??0,average:stats.ratedMatches?stats.ratingTotal/stats.ratedMatches:null,bestRating:stats.bestRating||null};
}
export function sortPerformancePlayers(players, {key='appearances',direction='desc'}={}, competition='all') {
  const value=p=>['name','role','ovr'].includes(key)?p[key]:performanceStats(p,competition)[key];
  return [...players].sort((a,b)=>{
    const av=value(a),bv=value(b);
    // Unplayed ratings remain at the bottom in either direction.
    if(av==null||bv==null){if(av!=null)return -1;if(bv!=null)return 1;}
    const comparison=typeof av==='string'?av.localeCompare(bv||''):(av||0)-(bv||0);
    return comparison*(direction==='asc'?1:-1)||a.name.localeCompare(b.name)||a.id.localeCompare(b.id);
  });
}
