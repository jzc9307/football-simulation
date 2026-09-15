import React, { useState, useEffect, useRef } from "react";
import { ArrowLeftRight, Search, X, RotateCcw, ShoppingCart, Trophy } from "lucide-react";

/* ============================== DATA ============================== */
const ROLE_GROUP = { GK:"GK", LB:"DEF", CB:"DEF", RB:"DEF", CDM:"MID", CM:"MID", CAM:"MID", LM:"MID", RM:"MID", LW:"FWD", RW:"FWD", ST:"FWD" };
const GROUP_COLOR = { GK:"#F5A623", DEF:"#3B82F6", MID:"#10B981", FWD:"#EF4444" };
const ROLE_COMPAT = {
  GK:["GK"], CB:["CB"], LB:["LB"], RB:["RB"],
  CDM:["CDM","CM"], CM:["CM","CDM","CAM"], CAM:["CAM","CM","LW","RW"],
  LM:["LM","LW","CM"], RM:["RM","RW","CM"],
  LW:["LW","LM","CAM","RW"], RW:["RW","RM","CAM","LW"], ST:["ST","CAM"]
};
function slotAccepts(slotRole, player){
  if (!player) return false;
  if (player.role === slotRole) return true;
  return (ROLE_COMPAT[slotRole] || []).includes(player.role);
}
// Tactics: each formation is reduced to zone counts (wide defenders, central defenders, central midfielders,
// wide midfielders, wide attackers, central strikers) computed directly from its slot list. A team's tactical
// edge comes from genuine mismatches — extra strikers against too few center-backs, spare width against a side
// with no out-and-out wide midfielders/wingers, more bodies in central midfield — rather than a fixed lookup table.
function formationShape(formation){
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
function tacticalBreakdown(myForm, oppForm){
  const my = formationShape(myForm), opp = formationShape(oppForm);
  const wideEdge = clamp((my.attWide + my.midWide - opp.defWide) * 0.03, -0.09, 0.09);
  const centralAttEdge = clamp((my.attCentral - opp.defCentral) * 0.035, -0.09, 0.09);
  const midEdge = clamp((my.midCentral - opp.midCentral) * 0.035, -0.09, 0.09);
  const total = clamp(wideEdge + centralAttEdge + midEdge, -0.20, 0.20);
  return { wideEdge, centralAttEdge, midEdge, total };
}
function tacticalModifier(myForm, oppForm){ return tacticalBreakdown(myForm, oppForm).total; }
function tacticalHints(myForm, oppForm){
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
const P = (name, role, age, ovr, value) => ({ name, role, group: ROLE_GROUP[role], age, ovr, value });

const RAW_CLUBS = [
{ id:"afc", name:"AFC Bournemouth", color:"#DA291C", budget:30, preferredFormation:"4-2-3-1", players:[
  P("A. Semenyo","LM",25,80,23),
  P("Evanilson","ST",25,80,25),
  P("\u0110. Petrovi\u0107","GK",25,80,21),
  P("R. Christie","CDM",30,79,12),
  P("L. Cook","CDM",28,79,15),
  P("T. Adams","CDM",26,79,17),
  P("J. Kluivert","CAM",26,79,18),
  P("B. Diakit\u00e9","CB",24,79,21),
  P("A. Adli","ST",25,78,17),
  P("M. Senesi","CB",28,78,10),
  P("A. Truffert","LB",23,77,12),
  P("E. \u00dcnal","ST",28,77,9),
  P("M. Tavernier","CAM",26,76,8),
  P("D. Brooks","RM",27,75,5),
  P("A. Scott","CDM",21,74,8),
  P("E. Kroupi","ST",19,74,8),
  P("J. Araujo","RB",23,74,7),
  P("A. Smith","RB",34,73,1),
  P("\u00c1lex Jim\u00e9nez","RB",20,71,3),
  P("B. Gannon-Doak","RM",19,71,4)
]},
{ id:"ars", name:"Arsenal", color:"#EF0107", budget:70, preferredFormation:"4-2-3-1", players:[
  P("B. Saka","RW",23,88,102),
  P("Gabriel","CB",27,88,72),
  P("D. Rice","CM",26,87,72),
  P("M. \u00d8degaard","CM",26,87,84),
  P("V. Gy\u00f6keres","ST",27,87,80),
  P("W. Saliba","CB",24,87,79),
  P("David Raya","GK",29,87,47),
  P("Mikel Merino","CM",29,83,31),
  P("Zubimendi","CDM",26,83,39),
  P("E. Eze","CAM",27,83,36),
  P("L. Trossard","LW",30,83,30),
  P("P. Hincapi\u00e9","CB",23,83,45),
  P("B. White","RB",27,83,30),
  P("K. Havertz","ST",26,82,33),
  P("J. Timber","RB",24,82,33),
  P("Gabriel Martinelli","LW",24,81,30),
  P("Gabriel Jesus","ST",28,80,18),
  P("C. N\u00f8rgaard","CDM",31,80,13),
  P("N. Madueke","RW",23,80,26),
  P("Kepa","GK",30,79,10)
]},
{ id:"ast", name:"Aston Villa", color:"#670E36", budget:40, preferredFormation:"4-2-3-1", players:[
  P("Y. Tielemans","CAM",28,85,46),
  P("E. Mart\u00ednez","GK",32,85,23),
  P("O. Watkins","ST",29,84,36),
  P("B. Kamara","CDM",25,83,35),
  P("M. Rogers","LM",22,82,38),
  P("E. Konsa","CB",27,82,26),
  P("J. McGinn","RM",30,81,22),
  P("L. Digne","LB",31,80,13),
  P("Pau Torres","CB",28,80,15),
  P("J. Sancho","LM",25,80,23),
  P("I. Maatsen","LB",23,79,21),
  P("M. Cash","RB",27,79,15),
  P("A. Onana","CDM",23,79,20),
  P("D. Malen","RM",26,79,18),
  P("E. Guessand","RM",24,79,23),
  P("H. Elliott","CAM",22,78,19),
  P("T. Mings","CB",32,78,8),
  P("M. Bizot","GK",34,78,2),
  P("E. Buend\u00eda","CAM",28,77,9),
  P("R. Barkley","CM",31,77,7)
]},
{ id:"bre", name:"Brentford", color:"#E30613", budget:25, preferredFormation:"4-4-2", players:[
  P("M. Damsgaard","CAM",24,80,25),
  P("J. Henderson","CDM",35,79,4),
  P("N. Collins","CB",24,79,18),
  P("C. Kelleher","GK",26,79,15),
  P("K. Schade","LM",23,78,18),
  P("M. Jensen","CM",29,77,9),
  P("D. Ouattara","LM",23,77,13),
  P("S. van den Berg","CB",23,77,13),
  P("E. Pinnock","CB",32,77,6),
  P("K. Lewis-Potter","LB",24,76,8),
  P("V. Janelt","CM",27,76,7),
  P("R. Henry","LB",27,76,6),
  P("K. Ajer","RB",27,75,5),
  P("R. Nelson","RM",25,75,6),
  P("Igor Thiago","ST",24,75,7),
  P("F. Onyeka","CM",27,74,4),
  P("A. Hickey","RB",23,74,5),
  P("F\u00e1bio Carvalho","RM",22,74,8),
  P("A. Milambo","CM",20,73,6),
  P("M. Kayode","RB",20,73,6)
]},
{ id:"bri", name:"Brighton & Hove Albion", color:"#0057B8", budget:45, preferredFormation:"4-2-3-1", players:[
  P("K. Mitoma","LM",28,82,26),
  P("C. Baleba","CDM",21,81,33),
  P("M. De Cuyper","LB",24,80,27),
  P("J. van Hecke","CB",25,80,22),
  P("F. Kad\u0131o\u011flu","RB",25,79,17),
  P("O. Boscagli","CB",27,79,16),
  P("M. Wieffer","CDM",25,78,15),
  P("D. Welbeck","ST",34,78,6),
  P("J. Veltman","RB",33,78,6),
  P("B. Verbruggen","GK",22,78,16),
  P("G. Rutter","CAM",23,77,14),
  P("Y. Minteh","RM",20,77,20),
  P("L. Dunk","CB",33,77,4),
  P("J. Hinshelwood","CDM",20,75,10),
  P("Y. Ayari","CDM",21,75,10),
  P("S. March","RM",30,75,5),
  P("A. Webster","CB",30,75,4),
  P("B. Gruda","CAM",21,74,8),
  P("D. Coppola","CB",21,74,7),
  P("D. G\u00f3mez","CM",22,73,5)
]},
{ id:"che", name:"Chelsea", color:"#034694", budget:75, preferredFormation:"4-2-3-1", players:[
  P("M. Caicedo","CDM",23,87,80),
  P("C. Palmer","CAM",23,87,94),
  P("E. Fern\u00e1ndez","CDM",24,84,49),
  P("Marc Cucurella","LB",26,84,39),
  P("R. James","RB",25,81,27),
  P("Andrey Santos","CM",21,80,37),
  P("Pedro Neto","RM",25,80,23),
  P("L. Colwill","CB",22,80,24),
  P("M. Gusto","RB",22,79,22),
  P("Jo\u00e3o Pedro","ST",23,79,23),
  P("T. Chalobah","CB",25,79,18),
  P("W. Fofana","CB",24,79,18),
  P("R. Lavia","CDM",21,78,23),
  P("R. Sterling","LW",30,78,12),
  P("Est\u00eav\u00e3o","RM",18,78,25),
  P("J. Hato","LB",19,78,25),
  P("L. Delap","ST",22,78,25),
  P("J. Gittens","LM",20,78,24),
  P("T. Adarabioyo","CB",27,78,13),
  P("Robert S\u00e1nchez","GK",27,78,9)
]},
{ id:"cov", name:"Coventry City", color:"#78D0F2", budget:12, preferredFormation:"4-2-3-1", players:[
  P("J. Rudoni","CAM",24,74,6),
  P("M. van Ewijk","RB",24,74,5),
  P("M. Grimes","CDM",29,74,3),
  P("H. Wright","ST",27,73,3),
  P("L. Woolfenden","CB",26,73,3),
  P("T. Sakamoto","RM",28,72,2),
  P("K. Kesler-Hayden","RB",22,72,4),
  P("C. Rushworth","GK",23,72,4),
  P("E. Mason-Clark","LM",25,71,2),
  P("B. Thomas","CB",24,71,2),
  P("V. Torp","CDM",25,70,2),
  P("J. Eccles","CDM",25,70,2),
  P("E. Simms","ST",24,70,3),
  P("L. Kitching","CB",25,70,2),
  P("O. Dovin","GK",22,70,3),
  P("B. Thomas-Asante","ST",26,69,1),
  P("J. Dasilva","LB",27,69,1),
  P("J. Latibeaudiere","CB",25,69,2),
  P("J. Allen","CM",30,68,1),
  P("J. Bidwell","LB",32,68,1)
]},
{ id:"cry", name:"Crystal Palace", color:"#1B458F", budget:30, preferredFormation:"4-2-3-1", players:[
  P("J. Mateta","ST",28,82,27),
  P("M. Gu\u00e9hi","CB",24,82,30),
  P("D. Mu\u00f1oz","RB",29,81,19),
  P("D. Henderson","GK",28,81,18),
  P("Yeremy Pino","RM",22,80,41),
  P("A. Wharton","CM",21,79,29),
  P("I. Sarr","RW",27,79,16),
  P("M. Lacroix","CB",25,79,18),
  P("W. Ben\u00edtez","GK",32,79,7),
  P("T. Mitchell","LB",25,78,14),
  P("J. Lerma","CDM",30,77,8),
  P("D. Kamada","CM",28,77,9),
  P("W. Hughes","CM",30,77,8),
  P("C. Doucour\u00e9","CDM",25,77,11),
  P("C. Richards","CB",25,77,11),
  P("C. Uche","ST",22,76,15),
  P("E. Nketiah","ST",26,74,5),
  P("B. Sosa","LB",27,73,2),
  P("C. Riad","CB",22,72,4),
  P("J. Devenny","LW",21,71,4)
]},
{ id:"eve", name:"Everton", color:"#003399", budget:35, preferredFormation:"4-2-3-1", players:[
  P("J. Pickford","GK",31,84,19),
  P("J. Grealish","LM",29,80,18),
  P("J. Tarkowski","CB",32,80,12),
  P("I. Gueye","CDM",35,79,4),
  P("I. Ndiaye","RM",25,79,20),
  P("J. Branthwaite","CB",23,79,22),
  P("D. McNeil","LM",25,78,16),
  P("V. Mykolenko","LB",26,78,13),
  P("K. Dewsbury-Hall","CAM",26,77,11),
  P("T. Barry","ST",22,77,21),
  P("J. Garner","CDM",24,76,9),
  P("J. O'Brien","RB",24,76,9),
  P("Beto","ST",27,76,7),
  P("C. Alcaraz","CAM",22,75,10),
  P("M. R\u00f6hl","CAM",22,74,8),
  P("T. Iroegbunam","CDM",22,74,5),
  P("T. Dibling","RM",19,74,8),
  P("M. Keane","CB",32,73,2),
  P("M. Travers","GK",26,72,2),
  P("N. Patterson","RB",23,71,2)
]},
{ id:"ful", name:"Fulham FC", color:"#666", budget:30, preferredFormation:"4-2-3-1", players:[
  P("A. Robinson","LB",27,82,25),
  P("A. Iwobi","LM",29,80,18),
  P("S. Chukwueze","RM",26,80,20),
  P("B. Leno","GK",33,80,6),
  P("S. Berge","CDM",27,79,15),
  P("S. Luki\u0107","CDM",28,78,11),
  P("C. Bassey","CB",25,78,14),
  P("J. Andersen","CB",29,78,10),
  P("R. Jim\u00e9nez","ST",34,77,4),
  P("E. Smith Rowe","CAM",24,77,13),
  P("K. Tete","RB",29,77,8),
  P("H. Wilson","RM",28,76,6),
  P("T. Castagne","RB",29,76,6),
  P("Adama Traor\u00e9","RM",29,76,6),
  P("Kevin","LM",22,76,10),
  P("I. Diop","CB",28,76,6),
  P("R. Sessegnon","LB",25,75,6),
  P("Rodrigo Muniz","ST",24,75,8),
  P("T. Cairney","CM",34,74,2),
  P("Jorge Cuenca","CB",25,74,5)
]},
{ id:"hul", name:"Hull City", color:"#F18A00", budget:10, preferredFormation:"4-2-3-1", players:[
  P("O. McBurnie","ST",29,74,4),
  P("A. Had\u017eiahmetovi\u0107","CDM",28,73,2),
  P("J. Lundstram","CDM",31,73,2),
  P("M. Belloumi","RM",23,73,4),
  P("L. Millar","LM",25,72,3),
  P("J. Egan","CB",32,72,1),
  P("I. Pandur","GK",25,72,2),
  P("R. Giles","LB",25,71,2),
  P("E. Matazo","CDM",23,71,2),
  P("C. Hughes","CB",21,71,3),
  P("R. Slater","CDM",25,70,2),
  P("K. Palmer","CAM",28,70,1),
  P("J. Gelhardt","RM",23,70,3),
  P("L. Coyle","RB",29,70,1),
  P("B. Williams","LB",24,70,2),
  P("S. Ajayi","CB",31,70,1),
  P("M. Crooks","CAM",31,69,1),
  P("B. Akintola","LM",29,69,1),
  P("C. Drameh","RB",23,69,3),
  P("E. Destan","ST",23,68,2)
]},
{ id:"ips", name:"Ipswich Town", color:"#0044A9", budget:12, preferredFormation:"4-2-3-1", players:[
  P("L. Davis","LB",25,76,8),
  P("A. Matusiwa","CDM",27,76,7),
  P("C. Akpom","ST",29,76,6),
  P("J. Cajuste","CDM",25,75,6),
  P("J. Philogene","LM",23,75,8),
  P("D. O'Shea","CB",26,75,6),
  P("S. Szmodics","CAM",29,74,4),
  P("J. Clarke","LM",24,74,6),
  P("J. Greaves","CB",24,74,5),
  P("C. Kipr\u00e9","CB",28,74,4),
  P("A. Young","RB",39,73,1),
  P("M. N\u00fa\u00f1ez","CM",25,73,3),
  P("A. Palmer","GK",28,73,2),
  P("W. Burns","RM",30,72,2),
  P("B. Johnson","RB",25,72,2),
  P("D. Furlong","RB",29,72,2),
  P("G. Hirst","ST",26,72,2),
  P("K. McAteer","RM",23,71,2),
  P("J. Taylor","CDM",27,70,2),
  P("H. Clarke","RB",24,70,2)
]},
{ id:"lee", name:"Leeds United", color:"#1D428A", budget:22, preferredFormation:"4-4-2", players:[
  P("Lucas Perri","GK",27,81,23),
  P("A. Stach","CM",26,79,18),
  P("G. Gudmundsson","LB",26,77,10),
  P("J. Bijol","CB",26,77,10),
  P("A. Tanaka","CM",26,76,8),
  P("D. James","RM",27,76,7),
  P("N. Okafor","ST",25,76,9),
  P("L. Nmecha","ST",26,76,8),
  P("E. Ampadu","CB",24,76,8),
  P("P. Struijk","CB",25,76,8),
  P("J. Rodon","CB",27,76,7),
  P("S. Longstaff","CM",27,75,6),
  P("J. Bogle","RB",24,75,6),
  P("J. Piroe","ST",25,75,6),
  P("B. Aaronson","CAM",24,74,5),
  P("J. Justin","RB",27,74,4),
  P("J. Harrison","RM",28,74,4),
  P("I. Gruev","CDM",25,74,4),
  P("D. Calvert-Lewin","ST",28,74,4),
  P("W. Gnonto","LM",21,74,8)
]},
{ id:"liv", name:"Liverpool", color:"#C8102E", budget:90, preferredFormation:"4-2-3-1", players:[
  P("M. Salah","RM",33,91,71),
  P("V. van Dijk","CB",33,90,49),
  P("F. Wirtz","CAM",22,89,129),
  P("Alisson","GK",32,89,44),
  P("A. Isak","ST",25,88,95),
  P("A. Mac Allister","CDM",26,87,80),
  P("I. Konat\u00e9","CB",26,86,60),
  P("R. Gravenberch","CDM",23,85,57),
  P("C. Gakpo","LM",26,84,43),
  P("G. Mamardashvili","GK",24,84,39),
  P("D. Szoboszlai","CAM",24,83,43),
  P("J. Frimpong","RB",24,83,37),
  P("H. Ekitik\u00e9","ST",23,83,48),
  P("M. Kerkez","LB",21,82,36),
  P("A. Robertson","LB",31,82,19),
  P("F. Chiesa","RM",27,81,24),
  P("C. Jones","CAM",24,80,25),
  P("W. Endo","CDM",32,79,10),
  P("J. Gomez","CB",28,79,14),
  P("C. Bradley","RB",21,78,18)
]},
{ id:"man", name:"Manchester City", color:"#6CABDD", budget:85, preferredFormation:"4-2-3-1", players:[
  P("Rodri","CDM",29,90,88),
  P("E. Haaland","ST",24,90,135),
  P("G. Donnarumma","GK",26,89,83),
  P("T. Reijnders","CM",26,86,68),
  P("R\u00faben Dias","CB",28,86,55),
  P("P. Foden","RW",25,85,61),
  P("Bernardo Silva","CM",30,84,35),
  P("J. Gvardiol","CB",23,84,46),
  P("O. Marmoush","LW",26,84,43),
  P("M. Kova\u010di\u0107","CM",31,83,26),
  P("N. Ak\u00e9","CB",30,83,26),
  P("J. Stones","CB",31,82,18),
  P("Savinho","RW",21,82,40),
  P("R. A\u00eft-Nouri","LB",24,81,30),
  P("R. Cherki","RW",21,81,45),
  P("J. Doku","LW",23,80,28),
  P("Matheus Nunes","RB",26,79,16),
  P("Nico Gonz\u00e1lez","CDM",23,79,22),
  P("S. Ortega","GK",32,79,7),
  P("R. Lewis","RB",20,77,17)
]},
{ id:"mun", name:"Manchester United", color:"#DA291C", budget:65, preferredFormation:"4-3-3", players:[
  P("Bruno Fernandes","CM",30,87,66),
  P("B. Mbeumo","RW",25,85,55),
  P("Matheus Cunha","LW",26,83,39),
  P("M. de Ligt","CB",25,82,29),
  P("L. Mart\u00ednez","CB",27,81,22),
  P("N. Mazraoui","RB",27,80,19),
  P("Casemiro","CM",33,80,9),
  P("B. \u0160e\u0161ko","ST",22,80,41),
  P("H. Maguire","CB",32,80,12),
  P("Diogo Dalot","RB",26,79,17),
  P("L. Shaw","CB",29,79,12),
  P("M. Ugarte","CDM",24,79,20),
  P("Amad","CAM",22,79,24),
  P("L. Yoro","CB",19,78,25),
  P("S. Lammens","GK",22,78,24),
  P("K. Mainoo","CM",20,77,20),
  P("M. Mount","CAM",26,77,11),
  P("J. Zirkzee","ST",24,77,15),
  P("T. Malacia","LB",25,75,6),
  P("A. Bay\u0131nd\u0131r","GK",27,75,4)
]},
{ id:"new", name:"Newcastle United", color:"#241F20", budget:45, preferredFormation:"4-3-3", players:[
  P("S. Tonali","CDM",25,86,66),
  P("Bruno Guimar\u00e3es","CM",27,86,67),
  P("A. Gordon","LW",24,83,43),
  P("Joelinton","CM",28,82,26),
  P("F. Sch\u00e4r","CB",33,82,12),
  P("Y. Wissa","ST",28,82,27),
  P("S. Botman","CB",25,82,31),
  P("J. Murphy","RW",30,81,22),
  P("A. Elanga","RW",23,81,30),
  P("N. Pope","GK",33,81,7),
  P("K. Trippier","RB",34,80,6),
  P("L. Hall","LB",20,80,26),
  P("T. Livramento","LB",22,80,27),
  P("H. Barnes","LW",27,80,19),
  P("N. Woltemade","ST",23,79,23),
  P("D. Burn","CB",33,79,7),
  P("J. Ramsey","LM",24,78,17),
  P("M. Thiaw","CB",23,78,17),
  P("A. Ramsdale","GK",27,77,8),
  P("J. Willock","CM",25,76,8)
]},
{ id:"not", name:"Nottingham Forest", color:"#DD0000", budget:30, preferredFormation:"4-2-3-1", players:[
  P("Murillo","CB",22,83,41),
  P("N. Milenkovi\u0107","CB",27,83,31),
  P("M. Sels","GK",33,83,10),
  P("M. Gibbs-White","CAM",25,82,33),
  P("C. Wood","ST",33,82,17),
  P("Douglas Luiz","CM",27,80,19),
  P("E. Anderson","CDM",22,80,25),
  P("O. Aina","RB",28,80,16),
  P("D. Ndoye","RM",24,79,21),
  P("N. Dom\u00ednguez","CDM",27,79,15),
  P("C. Hudson-Odoi","LM",24,78,17),
  P("N. Williams","LB",24,78,15),
  P("A. Kalimuendo","ST",23,78,18),
  P("D. Bakwa","RM",22,78,19),
  P("O. Zinchenko","LB",28,77,8),
  P("I. Sangar\u00e9","CDM",27,77,10),
  P("R. Yates","CDM",27,77,9),
  P("Igor Jesus","ST",24,77,13),
  P("Morato","CB",24,76,9),
  P("O. Hutchinson","CAM",21,75,11)
]},
{ id:"sun", name:"Sunderland", color:"#E03A3E", budget:20, preferredFormation:"4-4-2", players:[
  P("G. Xhaka","CDM",32,85,31),
  P("Reinildo","LB",31,79,11),
  P("N. Mukiele","CB",27,79,16),
  P("L. Geertruida","CB",24,78,15),
  P("O. Alderete","CB",28,78,12),
  P("H. Diarra","CM",21,77,15),
  P("B. Brobbey","ST",23,77,15),
  P("E. Le F\u00e9e","CM",25,76,9),
  P("S. Adingra","LM",23,76,13),
  P("A. Masuaku","LB",31,75,4),
  P("B. Traor\u00e9","RW",29,75,5),
  P("N. Sadiki","CM",20,74,8),
  P("T. Hume","RB",23,74,5),
  P("R. Roefs","GK",22,74,7),
  P("D. Neil","CDM",23,73,6),
  P("C. Talbi","RM",20,73,6),
  P("D. Ballard","CB",25,73,3),
  P("A. Patterson","GK",25,73,3),
  P("L. O'Nien","CB",30,72,2),
  P("D. Cirkin","LB",23,72,3)
]},
{ id:"tot", name:"Tottenham Hotspur", color:"#132257", budget:55, preferredFormation:"4-2-3-1", players:[
  P("J. Maddison","CM",28,84,36),
  P("X. Simons","CAM",22,84,50),
  P("D. Kulusevski","CM",25,83,41),
  P("Palhinha","CDM",29,83,27),
  P("Pedro Porro","RB",25,82,32),
  P("M. van de Ven","CB",24,82,32),
  P("C. Romero","CB",27,82,28),
  P("G. Vicario","GK",28,82,22),
  P("R. Kolo Muani","ST",26,81,27),
  P("D. Udogie","LB",22,80,25),
  P("R. Bentancur","CDM",28,80,18),
  P("M. Kudus","RW",24,80,25),
  P("D. Solanke","ST",27,80,20),
  P("P. Sarr","CM",22,79,23),
  P("B. Johnson","LW",24,79,22),
  P("K. Danso","CB",26,79,18),
  P("Y. Bissouma","CDM",28,78,11),
  P("Richarlison","ST",28,78,12),
  P("D. Spence","LB",24,78,16),
  P("L. Bergvall","CM",19,77,19)
]},
];

function buildClubs(){
  return RAW_CLUBS.map(c => ({
    ...c,
    players: c.players.map((p,i) => ({ ...p, id:`${c.id}-${i}`, club:c.id, number:i+1, loan:false }))
  }));
}

// Championship (2nd tier) — NOT selectable as your club. Lighter rosters, used only for FA/Carabao Cup
// opposition and as extra depth in the transfer market. Includes the 3 clubs relegated from the PL.
const RAW_CHAMPIONSHIP = [
{ id:"bir", name:"Birmingham City", color:"#0000FF", budget:0, preferredFormation:"4-2-3-1", players:[
  P("B. Osayi-Samuel","RB",27,76,7),
  P("M. Ducksch","ST",31,76,6),
  P("K. Furuhashi","ST",30,75,5),
  P("K. Fujimoto","CAM",26,74,5),
  P("T. Doyle","CM",23,73,4),
  P("P. Neumann","CB",27,73,3),
  P("E. Cashin","CB",23,73,4),
  P("Paik Seung Ho","CDM",28,72,2),
  P("T. Iwata","CDM",28,72,2),
  P("A. Cochrane","LB",25,72,3),
  P("D. Gray","LM",29,72,2),
  P("P. Roberts","RM",28,72,2),
  P("C. Klarer","CB",25,72,2),
  P("J. Robinson","CB",31,71,1)
]},
{ id:"bla", name:"Blackburn Rovers", color:"#009EE0", budget:0, preferredFormation:"4-3-1-2", players:[
  P("S. Tronstad","CDM",29,72,2),
  P("T. Cantwell","CAM",27,72,2),
  P("R. Morishita","CM",28,70,1),
  P("Yuri Ribeiro","LB",28,70,1),
  P("R. Hedges","LM",29,70,1),
  P("H. Carter","CB",25,70,2),
  P("T. Gardner-Hickman","CM",23,69,2),
  P("H. Pickering","LB",26,69,1),
  P("Y. Ohashi","ST",28,69,1),
  P("M. Gueye","ST",27,69,1),
  P("S. Wharton","CB",27,69,1),
  P("A. Pears","GK",27,69,1),
  P("M. Baradji","CM",24,68,2),
  P("A. Forshaw","CM",33,68,1)
]},
{ id:"brs", name:"Bristol City", color:"#E21C21", budget:0, preferredFormation:"4-3-1-2", players:[
  P("J. Knight","CM",24,73,4),
  P("M. Bird","CM",24,73,4),
  P("R. Dickie","CB",29,73,2),
  P("S. Twine","CAM",25,72,2),
  P("A. Mehmeti","CAM",24,72,3),
  P("L. McNally","CB",25,72,2),
  P("Neto Borges","LB",28,71,1),
  P("E. Riis","ST",27,71,2),
  P("R. Atkinson","CB",26,71,2),
  P("R. Vitek","GK",21,71,3),
  P("R. McCrorie","RM",27,70,1),
  P("J. Williams","CDM",28,70,1),
  P("C. Pring","LB",27,70,1),
  P("G. Tanner","RB",25,70,2)
]},
{ id:"bur", name:"Burnley", color:"#6C1D45", budget:0, preferredFormation:"4-2-3-1", players:[
  P("Florentino","CDM",25,80,22),
  P("K. Walker","RB",35,79,5),
  P("Q. Hartman","LB",23,77,13),
  P("M. D\u00fabravka","GK",36,77,1),
  P("J. Cullen","CDM",29,76,6),
  P("M. Edwards","RM",26,76,8),
  P("M. Est\u00e8ve","CB",23,76,9),
  P("C. Roberts","RB",29,75,4),
  P("Z. Amdouni","ST",24,75,8),
  P("Hannibal","CAM",22,74,8),
  P("J. Larsen","LM",26,74,4),
  P("Lucas Pires","LB",24,74,5),
  P("J. Anthony","LM",25,74,5),
  P("J. Beyer","CB",25,74,5)
]},
{ id:"cha", name:"Charlton Athletic", color:"#D2122E", budget:0, preferredFormation:"4-2-3-1", players:[
  P("T. Kaminski","GK",32,74,2),
  P("R. Burke","CB",28,71,1),
  P("A. Bell","CB",31,70,1),
  P("J. Rankin-Costello","RB",25,69,1),
  P("J. Bree","RB",27,69,1),
  P("L. Jones","CB",29,69,1),
  P("H. Knibbs","CM",26,68,1),
  P("K. Ramsay","RB",24,68,2),
  P("C. Kelman","ST",23,68,2),
  P("M. Godden","ST",33,68,1),
  P("C. Coventry","CDM",25,67,1),
  P("G. Docherty","CDM",28,66,1),
  P("L. Berry","CAM",32,66,1),
  P("S. Carey","CAM",24,66,1)
]},
{ id:"der", name:"Derby County", color:"#000000", budget:0, preferredFormation:"4-3-1-2", players:[
  P("B. Brereton D\u00edaz","LM",26,74,4),
  P("E. Adams","CAM",29,73,2),
  P("C. Morris","ST",29,73,3),
  P("L. Travis","CDM",27,72,2),
  P("M. Clarke","CB",28,72,2),
  P("S. Lang\u00e5s","CB",24,71,2),
  P("J. Widell Zetterstr\u00f6m","GK",26,71,2),
  P("A. Weimann","CAM",33,70,1),
  P("O. Beck","LB",22,70,3),
  P("D. Batth","CB",34,70,1),
  P("R. Brewster","CAM",25,69,2),
  P("C. Nelson","CB",32,69,1),
  P("D. Ozoh","CM",20,68,2),
  P("C. Blackett-Taylor","LM",27,68,1)
]},
{ id:"lei", name:"Leicester City", color:"#003090", budget:0, preferredFormation:"4-4-2", players:[
  P("A. Fatawu","RM",21,76,13),
  P("B. Soumar\u00e9","CDM",26,75,6),
  P("V. Kristiansen","LB",22,75,7),
  P("S. Mavididi","LM",27,75,5),
  P("Ricardo Pereira","RB",31,74,3),
  P("H. Winks","CDM",29,74,3),
  P("O. Skipp","CDM",24,74,4),
  P("J. Vestergaard","CB",32,74,2),
  P("J. Ayew","ST",33,73,2),
  P("J. Carranza","ST",25,73,4),
  P("W. Faes","CB",27,73,3),
  P("C. Okoli","CB",23,73,3),
  P("H. Souttar","CB",26,73,3),
  P("B. De Cordova-Reid","RM",32,72,2)
]},
{ id:"mid", name:"Middlesbrough", color:"#E32526", budget:0, preferredFormation:"4-4-2", players:[
  P("H. Hackney","CM",23,73,6),
  P("A. Morris","CM",23,73,4),
  P("M. Whittaker","CAM",24,73,4),
  P("A. Browne","CM",30,72,2),
  P("R. McGree","LM",26,72,2),
  P("C. Brittain","RM",27,72,2),
  P("D. Fry","CB",27,72,2),
  P("M. Targett","LB",29,71,1),
  P("L. Ayling","CB",33,71,1),
  P("D. Lenihan","CB",31,71,1),
  P("A. Jones","CB",27,71,2),
  P("T. Conway","ST",22,70,3),
  P("G. Edmundson","CB",27,70,1),
  P("S. Dieng","GK",30,70,1)
]},
{ id:"mil", name:"Millwall FC", color:"#001C58", budget:0, preferredFormation:"4-4-2", players:[
  P("A. Doughty","LB",25,74,4),
  P("T. Ballo","LM",23,73,4),
  P("J. Cooper","CB",30,73,2),
  P("C. De Norre","CM",28,72,2),
  P("W. Smallbone","CM",25,72,3),
  P("M. Luongo","CM",32,72,1),
  P("R. Leonard","RB",33,71,1),
  P("J. Bryan","LB",31,70,1),
  P("F. Azeez","LM",24,70,2),
  P("D. McNamara","LB",26,69,1),
  P("M. Ivanovi\u0107","ST",20,69,3),
  P("L. Jensen","GK",26,69,1),
  P("B. Mitchell","CM",24,68,2),
  P("C. Neghli","RM",23,68,2)
]},
{ id:"nor", name:"Norwich City", color:"#00A650", budget:0, preferredFormation:"4-2-3-1", players:[
  P("J. Sargent","ST",25,75,6),
  P("M. Kvistgaarden","ST",23,74,8),
  P("J. Schlupp","LB",32,73,2),
  P("M. Jur\u00e1sek","RW",21,73,6),
  P("K. McLean","CDM",33,72,1),
  P("J. Stacey","RM",29,72,2),
  P("P. Mattsson","CDM",23,71,3),
  P("M. Topi\u0107","CM",24,71,3),
  P("H. Darling","CB",25,71,2),
  P("S. Duffy","CB",33,71,1),
  P("E. Marcondes","CAM",30,70,1),
  P("J. Medi\u0107","CB",26,70,2),
  P("V. Kovacevi\u0107","GK",27,70,1),
  P("A. Forson","CM",22,69,2)
]},
{ id:"oxf", name:"Oxford United", color:"#002D62", budget:0, preferredFormation:"4-4-2", players:[
  P("C. Brannagan","CM",29,71,1),
  P("B. Davies","CB",29,71,1),
  P("B. De Keersmaecker","CM",25,70,2),
  P("S. Demb\u00e9l\u00e9","LM",28,70,1),
  P("C. Brown","CB",27,70,1),
  P("M. Helik","CB",29,70,1),
  P("H. ter Avest","RB",28,69,1),
  P("P. P\u0142acheta","RM",27,69,1),
  P("F. Krastev","LM",23,69,2),
  P("N. Prelec","ST",24,69,2),
  P("J. Cumming","GK",25,69,1),
  P("W. Vaulks","CDM",31,68,1),
  P("M. Harris","ST",26,68,1),
  P("G. Leigh","LB",30,68,1)
]},
{ id:"por", name:"Portsmouth", color:"#001489", budget:0, preferredFormation:"4-2-3-1", players:[
  P("C. Chaplin","CAM",28,74,4),
  P("J. Murphy","LM",30,73,2),
  P("C. Bishop","ST",28,72,2),
  P("C. Lang","RM",26,71,2),
  P("N. Schmid","GK",28,71,1),
  P("J. Swift","CDM",30,70,1),
  P("C. Shaughnessy","CB",29,70,1),
  P("Yang Min Hyeok","RM",19,70,3),
  P("C. Ogilvie","LB",29,69,1),
  P("J. Knight","CB",27,69,1),
  P("A. Dozzell","CDM",26,68,1),
  P("R. Poole","CB",27,68,1),
  P("I. Bowat","CB",22,68,2),
  P("M. Pack","CDM",34,67,1)
]},
{ id:"pre", name:"Preston North End", color:"#1C3F94", budget:0, preferredFormation:"4-3-1-2", players:[
  P("B. Whiteman","CDM",29,72,2),
  P("M. Fr\u00f8kj\u00e6r","CAM",25,72,3),
  P("J. Storey","CB",27,71,2),
  P("L. Lindsay","CB",29,71,1),
  P("A. McCann","CM",25,70,2),
  P("W. Keane","ST",32,70,1),
  P("M. Osmaji\u0107","ST",25,70,2),
  P("A. Devine","CAM",20,70,3),
  P("A. Hughes","CB",33,70,1),
  P("D. Iversen","GK",27,70,1),
  P("B. Potts","RB",30,69,1),
  P("R. Brady","LB",33,69,1),
  P("S. \u00de\u00f3r\u00f0arson","CM",26,69,2),
  P("M. Smith","ST",33,69,1)
]},
{ id:"que", name:"Queens Park Rangers", color:"#1D5BA4", budget:0, preferredFormation:"4-2-3-1", players:[
  P("I. Chair","LM",27,74,4),
  P("J. Dunne","RB",27,73,3),
  P("P. Nardi","GK",31,73,1),
  P("K. Saito","LM",23,72,3),
  P("J. Clarke-Salter","CB",27,72,2),
  P("S. Cook","CB",34,72,1),
  P("N. Madsen","CAM",25,71,2),
  P("J. Varane","CDM",23,71,3),
  P("S. Field","CDM",27,71,2),
  P("M. Frey","ST",30,70,1),
  P("K. Demb\u00e9l\u00e9","RM",22,70,3),
  P("R. Kone","ST",21,69,3),
  P("I. Hayden","CDM",30,69,1),
  P("K. Poku","RM",23,69,2)
]},
{ id:"she", name:"Sheffield United", color:"#EE2737", budget:0, preferredFormation:"4-3-1-2", players:[
  P("G. Hamer","CM",28,77,9),
  P("M. Cooper","GK",25,76,8),
  P("H. Burrows","LB",23,74,5),
  P("C. Ogbene","RM",28,74,4),
  P("B. Mee","CB",35,74,1),
  P("C. O'Hare","CM",27,73,3),
  P("B. Godfrey","CB",27,73,2),
  P("J. Tanganga","CB",26,73,3),
  P("D. Ings","ST",32,72,2),
  P("T. Campbell","ST",25,72,3),
  P("O. Arblaster","CM",21,71,4),
  P("T. Chong","CAM",25,71,2),
  P("T. Cannon","ST",22,71,3),
  P("T. Davies","CM",27,70,2)
]},
{ id:"shw", name:"Sheffield Wednesday", color:"#0066B3", budget:0, preferredFormation:"4-3-3", players:[
  P("B. Bannan","CDM",35,73,1),
  P("M. Lowe","CB",28,71,1),
  P("Y. Valery","CB",26,71,2),
  P("J. Lowe","ST",30,70,1),
  P("N. Chalobah","CM",30,69,1),
  P("I. Ugbo","ST",26,69,1),
  P("D. Bernard","CB",24,69,2),
  P("E. Horvath","GK",30,69,1),
  P("S. Ingelsson","CM",27,68,1),
  P("H. Amass","LB",18,68,2),
  P("D. Iorfa","CB",30,68,1),
  P("L. Palmer","RB",33,67,1),
  P("P. Charles","GK",19,65,1),
  P("O. Kobacki","LM",23,64,1)
]},
{ id:"sou", name:"Southampton", color:"#D71920", budget:0, preferredFormation:"4-4-2", players:[
  P("F. Azaz","CAM",24,74,6),
  P("F. Downes","CM",26,74,5),
  P("T. Harwood-Bellis","CB",23,74,7),
  P("J. Aribo","CM",28,73,3),
  P("R. Manning","LB",29,73,2),
  P("E. Jelert","RB",22,73,4),
  P("C. Jander","CM",22,73,6),
  P("A. Armstrong","ST",28,73,3),
  P("M. Roerslev","RB",26,73,3),
  P("L\u00e9o Scienza","LM",26,73,3),
  P("G. Bazunu","GK",23,73,4),
  P("S. Charles","CM",21,72,4),
  P("T. Fellows","RM",22,72,4),
  P("Welington","LM",24,72,4)
]},
{ id:"sto", name:"Stoke City", color:"#E03A3E", budget:0, preferredFormation:"4-2-3-1", players:[
  P("V. Johansson","GK",26,74,3),
  P("A. Cresswell","LB",35,73,1),
  P("M. Manhoef","RM",23,72,3),
  P("S. Nzonzi","CDM",36,72,1),
  P("S. Thomas","LM",26,71,2),
  P("Bae Jun Ho","CAM",21,71,4),
  P("L. Baker","CDM",30,70,1),
  P("T. Rigo","CM",23,70,2),
  P("R. Bo\u017een\u00edk","ST",25,70,2),
  P("B. Pearson","CDM",30,70,1),
  P("A. Phillips","CB",20,70,3),
  P("\u00c9. Bocat","LB",25,69,1),
  P("S. Gallagher","ST",29,69,1),
  P("B. Wilmot","CB",25,69,1)
]},
{ id:"swa", name:"Swansea City", color:"#121212", budget:0, preferredFormation:"4-4-2", players:[
  P("M. Benson","RM",28,73,3),
  P("A. Idah","ST",24,73,4),
  P("C. Burgess","CB",29,73,2),
  P("Gon\u00e7alo Franco","CDM",24,72,3),
  P("M. Yalcouy\u00e9","CM",19,71,3),
  P("M. Stameni\u0107","CDM",23,71,3),
  P("Eom Ji Sung","LM",23,71,4),
  P("Z. Inoussa","LW",23,71,4),
  P("Ronald","RM",24,71,3),
  P("B. Cabango","CB",25,71,2),
  P("L. Vigouroux","GK",31,71,1),
  P("J. Tymon","LB",26,70,2),
  P("L. Cullen","ST",26,70,2),
  P("J. Key","RB",25,69,2)
]},
{ id:"wat", name:"Watford", color:"#FBEE23", budget:0, preferredFormation:"4-2-3-1", players:[
  P("G. Chakvetadze","LM",25,74,4),
  P("I. Louza","CM",26,73,3),
  P("N. Mendy","CDM",33,73,1),
  P("M. Sissoko","CM",35,72,1),
  P("M. Bola","LB",27,72,2),
  P("E. Kayembe","CM",27,71,2),
  P("F. Mendy","CB",24,71,3),
  P("M. Pollock","CB",23,71,2),
  P("E. Selvik","GK",27,70,1),
  P("J. Ngakia","RB",24,69,2),
  P("K. Keben","CB",21,69,2),
  P("P. Dwomoh","CM",21,68,2),
  P("C. Wiley","LB",20,68,2),
  P("H. Kyprianou","CDM",24,68,2)
]},
{ id:"wes", name:"West Bromwich Albion", color:"#122F67", budget:0, preferredFormation:"4-4-2", players:[
  P("S. Iling-Junior","LM",21,74,8),
  P("A. Mowatt","CDM",30,73,2),
  P("C. Mepham","CB",27,73,3),
  P("K. Bielik","CB",27,72,2),
  P("J. Maja","ST",26,72,3),
  P("M. Johnston","LM",26,72,2),
  P("K. Grant","LM",27,71,2),
  P("A. Gilchrist","RB",21,71,3),
  P("C. Styles","LB",25,70,2),
  P("J. Wallace","RM",31,70,1),
  P("C. Taylor","LB",31,70,1),
  P("T. Collyer","CDM",21,70,3),
  P("J. Molumby","CDM",25,70,2),
  P("D. Dike","ST",25,70,2)
]},
{ id:"whu", name:"West Ham United", color:"#7A263A", budget:0, preferredFormation:"4-3-1-2", players:[
  P("J. Bowen","ST",28,83,31),
  P("Lucas Paquet\u00e1","CAM",27,80,19),
  P("A. Wan-Bissaka","RB",27,80,19),
  P("N. F\u00fcllkrug","ST",32,79,12),
  P("T. Sou\u010dek","CM",30,78,10),
  P("C. Wilson","ST",33,78,8),
  P("J. Todibo","CB",25,78,14),
  P("J. Ward-Prowse","CM",30,77,9),
  P("G. Rodr\u00edguez","CDM",31,77,6),
  P("M. Kilman","CB",28,77,9),
  P("A. Areola","GK",32,77,4),
  P("Mateus Fernandes","CAM",20,76,14),
  P("C. Summerville","LM",23,76,14),
  P("K. Mavropanos","CB",27,76,6)
]},
{ id:"wol", name:"Wolverhampton Wanderers", color:"#FDB913", budget:0, preferredFormation:"4-3-3", players:[
  P("E. Agbadou","CB",28,79,15),
  P("T. Arokodare","ST",24,79,24),
  P("L. Krej\u010d\u00ed","CB",26,78,15),
  P("Jo\u00e3o Gomes","CM",24,78,17),
  P("Andr\u00e9","CM",23,78,17),
  P("J. Arias","LW",27,78,13),
  P("J. Larsen","ST",25,78,18),
  P("Jos\u00e9 S\u00e1","GK",32,77,4),
  P("M. Munetsi","RW",29,76,6),
  P("S. Bueno","CB",26,76,7),
  P("S. Johnstone","GK",32,76,3),
  P("J. Bellegarde","CAM",27,75,6),
  P("Hwang Hee Chan","ST",29,75,5),
  P("Toti","CB",26,75,6)
]},
{ id:"wre", name:"Wrexham", color:"#E31B23", budget:0, preferredFormation:"4-3-3", players:[
  P("B. Sheaf","CDM",27,74,4),
  P("N. Broadhead","LM",27,73,3),
  P("I. Kabor\u00e9","RB",24,73,5),
  P("L. Cacace","LB",24,72,3),
  P("L. O'Brien","CM",26,72,3),
  P("J. Windass","ST",31,72,2),
  P("C. Coady","CB",32,72,1),
  P("C. Doyle","CB",21,72,4),
  P("K. Moore","ST",32,72,2),
  P("D. Hyam","CB",29,71,1),
  P("D. Ward","GK",32,70,1),
  P("O. Rathbone","CM",28,69,1),
  P("G. Dobson","CM",27,69,1),
  P("R. Hardie","ST",28,69,1)
]},
];
function buildChampionshipClubs(){
  return RAW_CHAMPIONSHIP.map(c => ({
    ...c, budget:0, tier:"championship",
    players: c.players.map((p,i) => ({ ...p, id:`${c.id}-${i}`, club:c.id, number:i+1, loan:false }))
  }));
}

const RAW_LALIGA = [
{ id:"ath", name:"Athletic Club", color:"#EE2523", budget:43, preferredFormation:"4-2-3-1", players:[
  P("Nico Williams","LM",22,86,81),
  P("Unai Sim\u00f3n","GK",28,85,37),
  P("Sancet","CAM",25,84,50),
  P("Vivian","CB",25,84,43),
  P("I\u00f1aki Williams","RM",31,83,26),
  P("Berenguer","LM",29,82,26),
  P("A. Laporte","CB",31,82,18),
  P("Ruiz de Galarreta","CDM",31,80,13),
  P("Yuri Berchiche","LB",35,79,5),
  P("Guruzeta","ST",28,79,15),
  P("Jauregizar","CDM",21,78,27),
  P("Be\u00f1at Prados","CDM",24,78,18),
  P("Aitor Paredes","CB",25,78,14),
  P("Gorosabel","RB",28,77,8),
  P("Areso","RB",25,76,8),
  P("Lekue","RB",32,75,3),
  P("Vesga","CDM",32,74,2),
  P("Robert Navarro","RM",23,74,8),
  P("A. Boiro","LB",23,73,6),
  P("Unai G\u00f3mez","CAM",22,73,6)
]},
{ id:"atl", name:"Atl\u00e9tico Madrid", color:"#CB3524", budget:54, preferredFormation:"4-4-2", players:[
  P("J. Oblak","GK",32,88,39),
  P("J. Alvarez","ST",25,87,92),
  P("A. Griezmann","ST",34,85,22),
  P("Marcos Llorente","RB",30,84,31),
  P("\u00c1lex Baena","LM",23,84,55),
  P("A. S\u00f8rloth","ST",29,84,36),
  P("D. Hancko","CB",27,83,33),
  P("J. Gim\u00e9nez","CB",30,83,26),
  P("R. Le Normand","CB",28,83,31),
  P("Pablo Barrios","CM",22,82,40),
  P("C. Gallagher","CM",25,81,31),
  P("Koke","CM",33,81,14),
  P("Johnny Cardoso","CM",23,81,32),
  P("G. Simeone","RM",22,81,34),
  P("Javi Gal\u00e1n","LB",30,80,15),
  P("C. Lenglet","CB",30,80,15),
  P("N. Molina","RB",27,79,16),
  P("T. Almada","CAM",24,79,30),
  P("J. Musso","GK",31,79,8),
  P("N. Gonzalez","RM",27,78,13)
]},
{ id:"cao", name:"CA Osasuna", color:"#D2122E", budget:15, preferredFormation:"4-4-2", players:[
  P("A. Budimir","ST",33,82,17),
  P("Catena","CB",30,79,12),
  P("Sergio Herrera","GK",32,79,7),
  P("Moncayola","CM",27,78,14),
  P("Rub\u00e9n Garc\u00eda","ST",31,78,10),
  P("Lucas Torr\u00f3","CDM",30,78,10),
  P("F. Boyomo","CB",23,78,22),
  P("V. Rosier","RB",28,77,8),
  P("Moi G\u00f3mez","CM",31,77,7),
  P("Aimar Oroz","CM",23,77,14),
  P("Aitor Fern\u00e1ndez","GK",34,77,2),
  P("Abel Bretones","LB",24,75,7),
  P("S. Becker","ST",30,75,5),
  P("Juan Cruz","CB",32,74,2),
  P("Kike Barja","RM",28,74,4),
  P("Herrando","CB",24,74,7),
  P("Ra\u00fal Garc\u00eda","ST",24,73,5),
  P("Iker Mu\u00f1oz","CM",22,71,4),
  P("Iker Benito","LM",22,69,3),
  P("Ander Yoldi","CAM",24,66,1)
]},
{ id:"dep", name:"Deportivo Alav\u00e9s", color:"#1F3F8F", budget:8, preferredFormation:"4-2-3-1", players:[
  P("Carlos Vicente","RM",26,78,14),
  P("N. Tenaglia","CB",29,76,6),
  P("Ander Guevara","CDM",27,76,6),
  P("Sivera","GK",28,76,6),
  P("Jonny","RB",31,74,3),
  P("Denis Su\u00e1rez","CM",31,74,3),
  P("Guridi","CAM",30,74,4),
  P("Antonio Blanco","CDM",24,74,7),
  P("Toni Mart\u00ednez","ST",28,74,4),
  P("Pacheco","CB",24,74,7),
  P("L. Boy\u00e9","ST",29,73,3),
  P("Ale\u00f1\u00e1","LM",27,73,3),
  P("C. Protesoni","CDM",27,73,3),
  P("F. Garc\u00e9s","CB",25,73,3),
  P("Pablo Ib\u00e1\u00f1ez","CDM",26,72,2),
  P("Ra\u00fal Fern\u00e1ndez","GK",37,72,1),
  P("M. Diarra","LB",24,71,2),
  P("Mariano","ST",31,70,1),
  P("Calebe","CAM",25,69,2),
  P("A. Rebbach","LM",26,69,1)
]},
{ id:"elc", name:"Elche CF", color:"#00944A", budget:8, preferredFormation:"4-2-3-1", players:[
  P("Andr\u00e9 Silva","ST",29,76,6),
  P("I\u00f1aki Pe\u00f1a","GK",26,76,7),
  P("Adri\u00e0 Pedrosa","LB",27,75,5),
  P("D. Affengruber","CB",24,75,10),
  P("M. Dituro","GK",38,75,1),
  P("Bigas","CB",34,74,1),
  P("F. Redondo","CM",22,72,4),
  P("Aleix Febas","CDM",29,72,2),
  P("Josan","RM",35,72,1),
  P("Rafa Mir","ST",28,72,2),
  P("\u00c1lvaro N\u00fa\u00f1ez","RB",24,72,3),
  P("Valera","RM",23,71,3),
  P("V\u00edctor Chust","CB",25,71,2),
  P("Martim Neto","CM",22,70,3),
  P("Marc Aguado","CDM",25,70,2),
  P("G. Diangana","CAM",27,70,1),
  P("L. P\u00e9trot","LB",28,70,1),
  P("John Donald","CB",24,69,2),
  P("H\u00e9ctor Fort","RB",18,68,2),
  P("Yago Santiago","LM",22,68,3)
]},
{ id:"fcb", name:"FC Barcelona", color:"#A50044", budget:90, preferredFormation:"4-2-3-1", players:[
  P("Raphinha","LM",28,89,89),
  P("Pedri","CDM",22,89,129),
  P("Lamine Yamal","RM",17,89,126),
  P("R. Lewandowski","ST",36,88,27),
  P("F. de Jong","CDM",28,87,68),
  P("J. Kound\u00e9","RB",26,87,74),
  P("M. ter Stegen","GK",33,86,19),
  P("Dani Olmo","CAM",27,85,53),
  P("W. Szcz\u0119sny","GK",35,84,4),
  P("Gavi","CM",20,83,48),
  P("Ferran Torres","LW",25,83,41),
  P("Balde","LB",21,83,43),
  P("R. Araujo","CB",26,83,36),
  P("Joan Garc\u00eda","GK",24,83,40),
  P("Pau Cubars\u00ed","CB",18,82,35),
  P("Ferm\u00edn","CAM",22,80,37),
  P("M. Rashford","LM",27,80,19),
  P("A. Christensen","CB",29,80,17),
  P("Marc Casad\u00f3","CDM",21,79,29),
  P("Eric Garc\u00eda","CB",24,79,21)
]},
{ id:"get", name:"Getafe CF", color:"#005999", budget:10, preferredFormation:"4-4-2", players:[
  P("David Soria","GK",32,81,11),
  P("M. Arambarri","CM",29,80,18),
  P("Luis Milla","CDM",30,79,15),
  P("Diego Rico","LB",32,77,6),
  P("Borja Mayoral","ST",28,77,9),
  P("D. Djen\u00e9","CB",33,77,4),
  P("Javi Mu\u00f1oz","CM",30,76,6),
  P("Y. Neyou","CM",28,75,5),
  P("Kiko Femen\u00eda","RB",34,75,2),
  P("Juanmi","ST",32,74,3),
  P("Juan Iglesias","RB",26,74,4),
  P("Domingos Duarte","CB",30,74,3),
  P("A. Abqar","CB",26,74,5),
  P("\u00c1lex Sancris","RM",28,73,3),
  P("Coba da Costa","LM",22,71,4),
  P("Adri\u00e1n Liso","ST",20,69,3),
  P("J. Let\u00e1\u010dek","GK",26,69,1),
  P("Mario Mart\u00edn","CM",21,68,2),
  P("A. Kamara","RM",21,68,2),
  P("Davinchi","LB",17,64,1)
]},
{ id:"gir", name:"Girona FC", color:"#CD2534", budget:16, preferredFormation:"4-3-3", players:[
  P("D. Livakovi\u0107","GK",30,80,12),
  P("V. Tsygankov","RW",27,79,16),
  P("Arnau Mart\u00ednez","RB",22,79,22),
  P("P. Gazzaniga","GK",33,79,5),
  P("Bryan Gil","LW",24,78,17),
  P("T. Lemar","CM",29,77,9),
  P("D. Blind","CB",35,77,2),
  P("Iv\u00e1n Mart\u00edn","CM",26,77,12),
  P("\u00c1lex Moreno","LB",32,77,6),
  P("C. Stuani","ST",38,77,3),
  P("A. Witsel","CB",36,77,2),
  P("David L\u00f3pez","CB",35,77,2),
  P("Portu","RM",33,76,4),
  P("D. van de Beek","CAM",28,76,6),
  P("A. Ounahi","CM",25,76,9),
  P("V. Vanat","ST",23,76,10),
  P("Y. Asprilla","RM",21,75,10),
  P("Franc\u00e9s","CB",22,75,9),
  P("Hugo Rinc\u00f3n","RB",22,73,6),
  P("Abel Ruiz","ST",25,73,4)
]},
{ id:"lev", name:"Levante UD", color:"#0057A8", budget:8, preferredFormation:"4-2-3-1", players:[
  P("M. Ryan","GK",33,78,4),
  P("Carlos \u00c1lvarez","RM",21,75,10),
  P("Manu S\u00e1nchez","LB",24,75,7),
  P("Morales","ST",37,74,1),
  P("Olasagasti","CM",24,74,6),
  P("Brugui","LM",28,74,4),
  P("Pablo Mart\u00ednez","CM",27,73,3),
  P("Oriol Rey","CM",27,73,3),
  P("K. Arriaga","CDM",27,73,3),
  P("J. Toljan","RB",30,73,2),
  P("G. Koyalipou","ST",25,73,4),
  P("Elgezabal","CB",32,73,2),
  P("Dela","CB",26,72,3),
  P("Iker Losada","CAM",23,72,3),
  P("Unai Vencedor","CDM",24,71,2),
  P("Iv\u00e1n Romero","ST",24,71,3),
  P("V\u00edctor Garc\u00eda","RM",28,69,1),
  P("Diego Pamp\u00edn","LB",25,69,2),
  P("Pablo Campos","GK",23,69,2),
  P("Carlos Esp\u00ed","ST",19,68,2)
]},
{ id:"rcc", name:"RC Celta", color:"#8AC3EE", budget:16, preferredFormation:"4-4-2", players:[
  P("Iago Aspas","RW",37,83,10),
  P("Mingueza","RM",26,80,22),
  P("Borja Iglesias","ST",32,80,15),
  P("Marcos Alonso","CB",34,79,5),
  P("Fran Beltr\u00e1n","CM",26,78,15),
  P("I. Moriba","CM",22,78,18),
  P("C. Starfelt","CB",30,78,10),
  P("Bryan Zaragoza","LW",23,77,14),
  P("Hugo \u00c1lvarez","LM",21,76,10),
  P("Javi Rodr\u00edguez","CB",22,76,10),
  P("Ferran Jutgl\u00e0","ST",26,75,5),
  P("Carreira","RM",24,75,6),
  P("J. Aidoo","CB",29,75,4),
  P("W. Swedberg","LW",21,74,7),
  P("F. Cervi","LM",31,74,3),
  P("Pablo Dur\u00e1n","ST",24,74,5),
  P("Carlos Dom\u00ednguez","CB",24,74,5),
  P("I. Radu","GK",28,74,3),
  P("Dami\u00e1n Rodr\u00edguez","CM",22,73,4),
  P("Hugo Sotelo","CM",21,73,4)
]},
{ id:"rcd", name:"RCD Espanyol", color:"#0A4C96", budget:10, preferredFormation:"4-2-3-1", players:[
  P("M. Dmitrovi\u0107","GK",33,79,5),
  P("Puado","LM",27,78,14),
  P("Terrats","CM",24,77,14),
  P("O. El Hilali","RB",21,77,14),
  P("Kike Garc\u00eda","ST",35,76,3),
  P("Edu Exp\u00f3sito","CDM",28,75,5),
  P("Carlos Romero","LB",23,75,7),
  P("Pol Lozano","CDM",25,75,6),
  P("L. Cabrera","CB",34,75,2),
  P("Jofre","RM",24,74,5),
  P("Roberto","ST",23,74,7),
  P("Antoniu Roca","RM",22,73,5),
  P("Calero","CB",29,73,2),
  P("Salinas","LB",24,72,4),
  P("L. Koleosho","LM",20,72,4),
  P("Urko Gonz\u00e1lez","CDM",24,72,4),
  P("C. Pickel","CM",28,71,2),
  P("Pere Milla","CAM",32,71,1),
  P("Rub\u00e9n S\u00e1nchez","RB",24,69,2),
  P("T. Dolan","RM",23,69,3)
]},
{ id:"mal", name:"RCD Mallorca", color:"#CB1518", budget:17, preferredFormation:"4-2-3-1", players:[
  P("Sergi Darder","CM",31,81,18),
  P("Ra\u00edllo","CB",33,81,11),
  P("V. Muriqi","ST",31,79,13),
  P("J. Mojica","LB",32,78,8),
  P("Sam\u00fa Costa","CDM",24,78,25),
  P("Maffeo","RB",27,78,12),
  P("Manu Morlanes","CDM",26,77,12),
  P("M. Valjent","CB",29,77,8),
  P("M. Kumbulla","CB",25,77,11),
  P("Leo Rom\u00e1n","GK",24,77,12),
  P("Dani Rodr\u00edguez","CAM",37,76,2),
  P("Omar Mascarell","CM",32,75,4),
  P("T. Asano","RM",30,75,5),
  P("Pablo Torre","CM",22,74,8),
  P("Antonio S\u00e1nchez","RM",28,73,3),
  P("Toni Lato","LB",27,73,3),
  P("Mateu Morey","RB",25,73,4),
  P("Abd\u00f3n Prats","ST",32,73,2),
  P("Mateo Joseph","ST",21,70,3),
  P("Javi Llabr\u00e9s","LM",22,69,3)
]},
{ id:"ray", name:"Rayo Vallecano", color:"#E32119", budget:15, preferredFormation:"4-2-3-1", players:[
  P("Isi","RM",30,81,22),
  P("\u00c1lvaro Garc\u00eda","LM",32,80,14),
  P("A. Ra\u021biu","RB",27,79,16),
  P("A. Batalla","GK",29,79,12),
  P("De Frutos","ST",28,78,12),
  P("F. Lejeune","CB",34,78,4),
  P("\u00d3scar Valent\u00edn","CDM",30,78,10),
  P("Pep Chavarr\u00eda","LB",27,77,9),
  P("P. Ciss","CDM",31,77,6),
  P("A. Mumin","CB",27,77,10),
  P("Unai L\u00f3pez","CDM",29,76,6),
  P("I. Balliu","RB",33,76,3),
  P("Pedro D\u00edaz","CAM",27,75,6),
  P("Luiz Felipe","CB",28,75,5),
  P("Dani C\u00e1rdenas","GK",28,75,4),
  P("Pacha Espino","LB",33,74,2),
  P("Gumbau","CM",30,73,2),
  P("Alem\u00e3o","ST",27,73,3),
  P("Sergio Camello","ST",24,73,4),
  P("Fran P\u00e9rez","RM",22,72,3)
]},
{ id:"rea", name:"Real Betis Balompi\u00e9", color:"#00954C", budget:23, preferredFormation:"4-2-3-1", players:[
  P("Isco","CAM",33,84,23),
  P("G. Lo Celso","CAM",29,82,26),
  P("Antony","RM",25,81,29),
  P("Diego Llorente","CB",31,80,12),
  P("Fornals","CDM",29,79,13),
  P("Bartra","CB",34,79,5),
  P("Pau L\u00f3pez","GK",30,79,11),
  P("\u00c1lvaro Valles","GK",27,79,15),
  P("S. Amrabat","CDM",28,78,11),
  P("Cucho","ST",26,78,16),
  P("Marc Roca","CDM",28,78,12),
  P("Natan","CB",24,78,17),
  P("Aitor Ruibal","RB",29,77,8),
  P("Riquelme","LM",25,77,12),
  P("C. Bakambu","ST",34,77,4),
  P("Altimira","CDM",23,77,13),
  P("Abde","LM",23,77,14),
  P("V. G\u00f3mez","CB",22,76,13),
  P("N. Deossa","CM",25,75,7),
  P("Junior Firpo","LB",28,75,4)
]},
{ id:"rma", name:"Real Madrid", color:"#FEBE10", budget:108, preferredFormation:"4-2-3-1", players:[
  P("K. Mbapp\u00e9","ST",26,91,149),
  P("J. Bellingham","CAM",22,90,150),
  P("F. Valverde","CDM",26,89,104),
  P("Vini Jr.","LM",24,89,121),
  P("T. Courtois","GK",33,89,29),
  P("T. Alexander-Arnold","RB",26,86,63),
  P("A. R\u00fcdiger","CB",32,86,38),
  P("Carvajal","RB",33,85,24),
  P("Rodrygo","RW",24,85,70),
  P("A. Tchouam\u00e9ni","CDM",25,84,43),
  P("\u00c9der Milit\u00e3o","CB",27,84,41),
  P("E. Camavinga","CM",22,83,63),
  P("D. Alaba","CB",33,82,12),
  P("D. Huijsen","CB",20,82,48),
  P("Brahim","RM",25,82,31),
  P("F. Mendy","LB",30,81,19),
  P("Dani Ceballos","CM",28,81,22),
  P("A. G\u00fcler","RM",20,81,49),
  P("A. Lunin","GK",26,81,25),
  P("\u00c1lvaro Carreras","LB",22,80,39)
]},
{ id:"rov", name:"Real Oviedo", color:"#1F5FAF", budget:8, preferredFormation:"4-2-3-1", players:[
  P("David Carmo","CB",25,76,8),
  P("L. Dendoncker","CDM",30,75,5),
  P("Santi Cazorla","CAM",40,75,1),
  P("J. Brekalo","LM",27,75,5),
  P("Aar\u00f3n","GK",29,75,4),
  P("S. Rond\u00f3n","ST",35,74,2),
  P("E. Bailly","CB",31,74,2),
  P("S. Colombatto","CDM",28,73,2),
  P("Alberto Reina","CDM",27,73,3),
  P("Nacho Vidal","RB",30,73,2),
  P("Javi L\u00f3pez","LB",23,73,5),
  P("Dani Calvo","CB",31,73,2),
  P("I. Chaira","LM",24,72,3),
  P("David Costas","CB",30,72,2),
  P("F. Vi\u00f1as","ST",27,72,2),
  P("H. Hassan","RM",23,72,4),
  P("Alex For\u00e9s","ST",24,71,3),
  P("H. Moldovan","GK",27,71,1),
  P("L. Ili\u0107","CAM",25,70,2),
  P("B. Domingues","LM",25,70,2)
]},
{ id:"rso", name:"Real Sociedad", color:"#0067B1", budget:28, preferredFormation:"4-4-2", players:[
  P("\u00c1lex Remiro","GK",30,83,24),
  P("Oyarzabal","ST",28,82,27),
  P("T. Kubo","RM",24,82,37),
  P("Y. Herrera","CDM",27,81,25),
  P("Brais M\u00e9ndez","CAM",28,81,22),
  P("Sergio G\u00f3mez","LM",24,79,21),
  P("L. Su\u010di\u0107","CM",22,78,27),
  P("Zubeldia","CB",28,78,12),
  P("Carlos Soler","CM",28,77,9),
  P("J. Aramburu","RB",22,77,19),
  P("Barrenetxea","LM",23,77,14),
  P("U. Sadiq","ST",28,77,9),
  P("Aritz Elustondo","CB",31,77,6),
  P("Guedes","ST",28,75,5),
  P("Aihen Mu\u00f1oz","LB",27,75,5),
  P("A. Zakharyan","RM",22,74,8),
  P("Odriozola","RB",29,74,3),
  P("O. \u00d3skarsson","ST",20,74,8),
  P("D. \u0106aleta-Car","CB",28,74,3),
  P("Turrientes","CM",23,73,6)
]},
{ id:"sev", name:"Sevilla FC", color:"#D3021D", budget:12, preferredFormation:"4-2-3-1", players:[
  P("Azpilicueta","CB",35,78,3),
  P("C. Ejuke","RM",27,78,13),
  P("N. Gudelj","CDM",33,77,4),
  P("D. Sow","CM",28,76,6),
  P("A. S\u00e1nchez","ST",36,76,2),
  P("Joan Jord\u00e1n","CM",30,76,6),
  P("B. Mendy","CDM",25,76,9),
  P("Carmona","RB",23,76,14),
  P("Alfon","LM",26,76,8),
  P("\u00d8. Nyland","GK",34,76,1),
  P("R. Vargas","CAM",26,75,5),
  P("Juanlu S\u00e1nchez","RB",21,75,10),
  P("L. Agoum\u00e9","CDM",23,75,10),
  P("Marc\u00e3o","CB",29,75,4),
  P("Kike Salas","CB",23,75,10),
  P("F\u00e1bio Cardoso","CB",31,75,3),
  P("G. Suazo","LB",27,74,4),
  P("Isaac Romero","ST",25,74,6),
  P("A. Januzaj","RW",30,74,4),
  P("\u00c1lvaro Ferllo","GK",27,74,4)
]},
{ id:"val", name:"Valencia CF", color:"#EE3524", budget:18, preferredFormation:"4-2-3-1", players:[
  P("Gay\u00e0","LB",30,81,19),
  P("S. Dimitrievski","GK",31,79,8),
  P("Luis Rioja","RM",31,78,10),
  P("Hugo Duro","ST",25,78,18),
  P("Diego L\u00f3pez","LM",23,78,27),
  P("Pepelu","CM",26,77,11),
  P("Javi Guerra","CDM",22,77,20),
  P("L. Beltr\u00e1n","CAM",24,76,10),
  P("Thierry Correia","RB",26,76,8),
  P("B. Santamaria","CDM",30,76,6),
  P("Dani Raba","RM",29,76,6),
  P("M. Diakhaby","CB",28,76,6),
  P("Agirrezabala","GK",24,76,11),
  P("F. Ugrini\u0107","CM",26,75,6),
  P("Andr\u00e9 Almeida","CAM",25,75,7),
  P("A. Danjuma","LM",28,75,5),
  P("C\u00e9sar T\u00e1rrega","CB",23,75,9),
  P("Copete","CB",25,75,9),
  P("D. Foulquier","RB",32,74,2),
  P("L. Ramazani","LM",24,74,6)
]},
{ id:"vil", name:"Villarreal CF", color:"#FFE667", budget:25, preferredFormation:"4-4-2", players:[
  P("Ayoze","ST",31,83,26),
  P("T. Partey","CDM",32,83,21),
  P("Parejo","CM",36,82,8),
  P("Gerard Moreno","ST",33,81,14),
  P("N. P\u00e9p\u00e9","RM",30,80,18),
  P("Sergi Cardona","LB",25,79,18),
  P("Moleiro","LM",21,79,31),
  P("J. Foyth","CB",27,79,15),
  P("P. Gueye","CM",26,78,15),
  P("Santi Comesa\u00f1a","CM",28,78,12),
  P("G. Mikautadze","ST",24,77,15),
  P("M. Solomon","LM",25,77,10),
  P("L. Costa","CB",24,77,17),
  P("Diego Conde","GK",26,77,10),
  P("Luiz J\u00fanior","GK",24,77,17),
  P("Renato Veiga","CB",21,76,13),
  P("Pedraza","LB",29,75,4),
  P("T. Buchanan","RM",26,74,4),
  P("I. Akhomach","RM",21,74,8),
  P("S. Mouri\u00f1o","RB",23,74,7)
]},
];
function buildLaLigaClubs(){
  return RAW_LALIGA.map(c => ({
    ...c,
    players: c.players.map((p,i) => ({ ...p, id:`${c.id}-${i}`, club:c.id, number:i+1, loan:false }))
  }));
}

const RAW_SERIEA = [
{ id:"acm", name:"AC Milan", color:"#FB090B", budget:39, preferredFormation:"4-2-3-1", players:[
  P("M. Maignan","GK",29,87,52),
  P("C. Pulisic","CAM",26,84,40),
  P("Rafael Le\u00e3o","LW",26,84,43),
  P("A. Rabiot","CAM",30,83,30),
  P("L. Modri\u0107","CM",39,83,10),
  P("Y. Fofana","CM",26,81,26),
  P("C. Nkunku","CAM",27,81,24),
  P("F. Tomori","CB",27,81,25),
  P("R. Loftus-Cheek","CAM",29,80,18),
  P("P. Estupi\u00f1\u00e1n","LM",27,79,16),
  P("A. Saelemaekers","RM",26,79,18),
  P("S. Gim\u00e9nez","ST",24,79,23),
  P("S. Ricci","CDM",23,78,23),
  P("M. Gabbia","CB",25,78,16),
  P("P. Terracciano","GK",35,78,1),
  P("A. Jashari","CDM",22,77,19),
  P("S. Pavlovi\u0107","CB",24,76,12),
  P("K. De Winter","CB",23,74,7),
  P("Z. Athekame","RB",20,65,1),
  P("D. Odogu","CB",19,65,1)
]},
{ id:"ata", name:"Atalanta", color:"#1E71B8", budget:32, preferredFormation:"4-4-2", players:[
  P("A. Lookman","ST",27,84,39),
  P("M. Carnesecchi","GK",25,84,40),
  P("\u00c9derson","CM",25,82,34),
  P("C. De Ketelaere","CAM",24,82,37),
  P("M. de Roon","CM",34,81,10),
  P("M. Pa\u0161ali\u0107","CM",30,80,17),
  P("O. Kossounou","CB",24,80,25),
  P("D. Zappacosta","LM",33,79,9),
  P("S. Kola\u0161inac","CB",32,79,10),
  P("G. Scamacca","ST",26,79,18),
  P("B. Djimsiti","CB",32,79,10),
  P("R. Bellanova","RM",25,78,15),
  P("I. Hien","CB",26,78,14),
  P("G. Scalvini","CB",21,77,19),
  P("N. Zalewski","LM",23,76,9),
  P("M. Sportiello","GK",33,76,2),
  P("M. Bakker","LB",25,75,6),
  P("L. Samard\u017ei\u0107","CM",23,75,9),
  P("N. Krstovi\u0107","ST",25,75,7),
  P("Y. Musah","CM",22,74,8)
]},
{ id:"bol", name:"Bologna", color:"#951C29", budget:15, preferredFormation:"4-2-3-1", players:[
  P("R. Orsolini","RM",28,82,26),
  P("R. Freuler","CDM",33,81,11),
  P("\u0141. Skorupski","GK",34,79,3),
  P("L. Ferguson","CM",25,78,16),
  P("C. Immobile","ST",35,78,5),
  P("F. Bernardeschi","RM",31,77,7),
  P("Juan Miranda","LB",25,76,8),
  P("J. Odgaard","CAM",26,76,8),
  P("S. Castro","ST",20,76,14),
  P("T. Dallinga","ST",24,76,10),
  P("J. Lucum\u00ed","CB",27,76,7),
  P("N. Moro","CDM",27,75,5),
  P("N. Casale","CB",27,75,5),
  P("J. Rowe","LM",22,75,10),
  P("T. Pobega","CM",25,74,5),
  P("N. Zortea","RB",26,74,4),
  P("G. Fabbian","CM",22,74,8),
  P("E. Holm","RB",25,74,5),
  P("M. Vit\u00edk","CB",22,74,5),
  P("C. Lykogiannis","LB",31,73,2)
]},
{ id:"cag", name:"Cagliari", color:"#9E1B32", budget:8, preferredFormation:"4-3-1-2", players:[
  P("A. Belotti","ST",31,77,8),
  P("Y. Mina","CB",30,77,7),
  P("S. Luperto","CB",28,76,6),
  P("E. Caprile","GK",23,76,11),
  P("M. Folorunsho","CM",27,75,5),
  P("S. Esposito","ST",22,75,10),
  P("Z\u00e9 Pedro","CB",28,75,5),
  P("G. Gaetano","CAM",25,74,5),
  P("G. Zappa","RB",25,74,4),
  P("M. Adopo","CM",24,72,3),
  P("M. Prati","CDM",21,71,3),
  P("Zito Luvumbo","ST",23,71,3),
  P("M. Felici","LM",24,71,2),
  P("L. Mazzitelli","CM",29,71,2),
  P("S. K\u0131l\u0131\u00e7soy","ST",19,70,3),
  P("A. Obert","LB",22,70,3),
  P("B. Radunovi\u0107","GK",29,70,1),
  P("M. Rog","CM",29,68,1),
  P("A. Deiola","CM",29,68,1),
  P("L. Pavoletti","ST",36,68,1)
]},
{ id:"com", name:"Como", color:"#005BAC", budget:18, preferredFormation:"4-2-3-1", players:[
  P("Morata","ST",32,81,18),
  P("Nico Paz","CAM",20,79,33),
  P("S. Posch","RB",28,79,14),
  P("M. Baturina","CAM",22,78,18),
  P("N. K\u00fchn","RW",25,78,16),
  P("Diego Carlos","CB",32,78,8),
  P("M. Caqueret","CM",25,77,12),
  P("Sergi Roberto","CDM",33,77,4),
  P("A. Diao","LM",19,76,14),
  P("J. Butez","GK",30,76,4),
  P("Alberto Moreno","LB",32,75,3),
  P("M. Vojvoda","RM",30,75,4),
  P("L. Da Cunha","CDM",24,74,5),
  P("Jes\u00fas Rodr\u00edguez","LM",19,74,8),
  P("M. Perrone","CDM",22,73,6),
  P("T. Douvikas","ST",25,73,4),
  P("M. Kempf","CB",30,73,2),
  P("A. Dossena","CB",26,73,3),
  P("\u00c1lex Valle","LB",21,72,4),
  P("I. Smol\u010di\u0107","RB",24,72,3)
]},
{ id:"cre", name:"Cremonese", color:"#B71234", budget:8, preferredFormation:"4-3-3", players:[
  P("E. Audero","GK",28,78,9),
  P("J. Vardy","ST",38,76,2),
  P("A. Sanabria","ST",29,76,6),
  P("F. Baschirotto","CB",28,75,5),
  P("F. V\u00e1zquez","ST",36,74,1),
  P("D. Okereke","ST",27,74,4),
  P("M. Payero","CM",26,73,3),
  P("A. Zerbin","RB",26,73,3),
  P("L. Sernicola","LB",28,73,2),
  P("F. Moumbagna","ST",25,73,4),
  P("M. Collocolo","CM",25,72,3),
  P("W. Bondo","CDM",21,72,4),
  P("J. Vandeputte","CM",29,72,2),
  P("F. Ceccherini","CB",33,72,1),
  P("M. Silvestri","GK",34,72,1),
  P("F. Terracciano","CB",22,71,3),
  P("G. Pezzella","LB",27,71,2),
  P("D. Johnsen","ST",27,71,2),
  P("M. Bianchetti","CB",32,71,1),
  P("M. Valoti","CM",31,70,1)
]},
{ id:"fio", name:"Fiorentina", color:"#7E3C97", budget:18, preferredFormation:"4-4-2", players:[
  P("De Gea","GK",34,85,8),
  P("M. Kean","ST",25,83,42),
  P("E. D\u017eeko","ST",39,81,8),
  P("R. Gosens","LM",30,80,15),
  P("A. Gu\u00f0mundsson","CAM",28,79,15),
  P("Dod\u00f4","RM",26,78,13),
  P("N. Fagioli","CM",24,77,14),
  P("R. Mandragora","CM",28,77,9),
  P("L. Ranieri","CB",26,76,7),
  P("H. Nicolussi Caviglia","CDM",25,75,6),
  P("F. Parisi","LB",24,75,7),
  P("R. Piccoli","ST",24,75,7),
  P("S. Sohm","CM",24,74,6),
  P("C. Kouam\u00e9","ST",27,74,4),
  P("M. Pongra\u010di\u0107","CB",27,74,4),
  P("Pablo Mar\u00ed","CB",31,74,2),
  P("P. Comuzzo","CB",20,74,8),
  P("A. Sabiri","CAM",28,73,3),
  P("T. Lamptey","RB",24,73,3),
  P("J. Fazzini","CAM",22,72,5)
]},
{ id:"gen", name:"Genoa", color:"#AB1A2A", budget:8, preferredFormation:"4-4-2", players:[
  P("N. Stanciu","CAM",32,77,7),
  P("R. Malinovskyi","CM",32,76,5),
  P("M. Frendrup","CDM",24,76,9),
  P("Vitinha","ST",25,75,7),
  P("J. V\u00e1squez","CB",26,75,6),
  P("M. Cornet","LM",28,74,4),
  P("A. Gr\u00f8nb\u00e6k","CAM",24,74,6),
  P("Aar\u00f3n Mart\u00edn","LB",28,74,3),
  P("L. Colombo","ST",23,73,5),
  P("L. \u00d8stig\u00e5rd","CB",25,73,5),
  P("Junior Messias","CM",34,72,1),
  P("M. Thorsby","CM",29,72,2),
  P("V. Carboni","RM",20,72,5),
  P("J. Onana","CM",25,71,2),
  P("C. Ekuban","ST",31,71,1),
  P("S. Sabelli","RB",32,71,1),
  P("N. Leali","GK",32,71,1),
  P("B. Siegrist","GK",33,70,1),
  P("M. Ellertsson","LM",23,69,2),
  P("B. Norton-Cuffy","RB",21,68,3)
]},
{ id:"hel", name:"Hellas Verona FC", color:"#666", budget:8, preferredFormation:"4-2-3-1", players:[
  P("A. Al Musrati","CDM",29,78,10),
  P("S. Serdar","CM",28,76,6),
  P("Unai N\u00fa\u00f1ez","CB",28,76,6),
  P("L. Montip\u00f2","GK",29,76,5),
  P("V. Nelsson","CB",26,75,5),
  P("G. Orban","ST",22,74,7),
  P("N. Valentini","CB",24,73,4),
  P("J. Akpa Akpro","CM",32,72,2),
  P("T. Suslov","CAM",23,72,4),
  P("A. Bernede","CDM",26,72,3),
  P("A. Harroui","CM",27,72,2),
  P("G. Kastanos","CAM",27,72,2),
  P("R. Gagliardini","CDM",31,72,1),
  P("A. Bella-Kotchap","CB",23,72,3),
  P("D. Bradari\u0107","LB",25,71,2),
  P("A. Sarr","ST",24,71,2),
  P("C. Niasse","CM",25,71,2),
  P("D. Mosquera","ST",25,71,2),
  P("M. Frese","CB",27,69,1),
  P("E. Ebosse","CB",26,69,1)
]},
{ id:"int", name:"Inter", color:"#010E80", budget:59, preferredFormation:"4-3-3", players:[
  P("L. Mart\u00ednez","ST",27,88,85),
  P("N. Barella","CM",28,87,68),
  P("A. Bastoni","CB",26,87,75),
  P("Y. Sommer","GK",36,87,8),
  P("H. \u00c7alhano\u011flu","CDM",31,86,41),
  P("F. Dimarco","LB",27,85,45),
  P("M. Thuram","ST",27,85,50),
  P("D. Dumfries","RB",29,84,32),
  P("F. Acerbi","CB",37,84,6),
  P("S. de Vrij","CB",33,84,17),
  P("H. Mkhitaryan","CM",36,83,10),
  P("M. Akanji","CB",29,82,22),
  P("Carlos Augusto","LB",26,81,24),
  P("D. Frattesi","CM",25,81,28),
  P("M. Darmian","RB",35,81,7),
  P("P. Zieli\u0144ski","CM",31,80,15),
  P("Luis Henrique","RM",23,78,18),
  P("Y. Bisseck","CB",24,76,8),
  P("Y. Bonny","ST",21,76,15),
  P("A. Diouf","CM",22,75,8)
]},
{ id:"juv", name:"Juventus", color:"#000000", budget:43, preferredFormation:"4-4-2", players:[
  P("Bremer","CB",28,85,44),
  P("M. Locatelli","CM",27,84,37),
  P("L. Openda","ST",25,83,40),
  P("D. Vlahovi\u0107","ST",25,82,35),
  P("J. David","ST",25,82,35),
  P("T. Koopmeiners","CAM",27,81,24),
  P("F. Kosti\u0107","LM",32,81,18),
  P("K. Thuram","CM",24,81,31),
  P("M. Di Gregorio","GK",27,81,22),
  P("P. Kalulu","CB",25,80,24),
  P("F. Gatti","CB",27,80,21),
  P("A. Cambiaso","LM",25,79,18),
  P("K. Y\u0131ld\u0131z","CAM",20,79,33),
  P("A. Milik","ST",31,79,13),
  P("Francisco Concei\u00e7\u00e3o","CAM",22,79,31),
  P("E. Zhegrova","RM",26,79,18),
  P("W. McKennie","CM",26,78,14),
  P("M. Perin","GK",32,78,6),
  P("Jo\u00e3o M\u00e1rio","RM",25,77,12),
  P("D. Rugani","CB",30,75,4)
]},
{ id:"laz", name:"Lazio", color:"#87D8F7", budget:26, preferredFormation:"4-3-3", players:[
  P("M. Zaccagni","LW",30,84,35),
  P("M. Guendouzi","CM",26,82,31),
  P("A. Romagnoli","CB",30,82,22),
  P("I. Provedel","GK",31,82,14),
  P("V. Castellanos","ST",26,80,22),
  P("B. Dia","ST",28,80,18),
  P("N. Rovella","CM",23,79,21),
  P("Mario Gila","CB",24,79,21),
  P("Nuno Tavares","LB",25,78,15),
  P("A. Maru\u0161i\u0107","RB",32,78,8),
  P("M. Lazzari","RB",31,78,9),
  P("D. Cataldi","CDM",30,77,8),
  P("M. Vecino","CM",33,77,6),
  P("Pedro","RM",37,77,3),
  P("S. Gigot","CB",31,77,6),
  P("G. Isaksen","RM",24,76,9),
  P("Patric","CB",32,75,3),
  P("T. Noslin","ST",25,74,5),
  P("L. Pellegrini","LB",26,74,4),
  P("C. Mandas","GK",23,74,5)
]},
{ id:"lec", name:"Lecce", color:"#FFE600", budget:8, preferredFormation:"4-2-3-1", players:[
  P("W. Falcone","GK",30,81,15),
  P("A. Gallo","LB",25,75,6),
  P("F. Guilbert","RB",30,75,4),
  P("R. Sottil","LW",26,75,6),
  P("L. Coulibaly","CM",29,74,3),
  P("Kialonda Gaspar","CB",27,74,4),
  P("\u00c0lex Sala","CDM",24,72,3),
  P("Tete Morente","LM",28,72,2),
  P("N. \u0160tuli\u0107","ST",23,72,3),
  P("Y. Maleh","CM",26,71,2),
  P("L. Banda","LM",24,71,3),
  P("S. Pierotti","RW",24,70,2),
  P("Y. Ramadani","CM",29,70,1),
  P("J. Siebert","CB",23,70,3),
  P("C. Fr\u00fcchtl","GK",25,70,2),
  P("Danilo Veiga","RB",22,69,3),
  P("\u00de. Helgason","CM",24,69,2),
  P("O. Kouassi","RB",22,69,2),
  P("H. Rafia","CM",26,68,1),
  P("B. Pierret","CDM",25,68,1)
]},
{ id:"nap", name:"Napoli", color:"#12A0D7", budget:37, preferredFormation:"4-4-2", players:[
  P("K. De Bruyne","CM",34,87,31),
  P("S. McTominay","LM",28,85,46),
  P("R. Lukaku","ST",32,84,29),
  P("G. Di Lorenzo","RB",31,83,23),
  P("S. Lobotka","CDM",30,83,30),
  P("A. Rrahmani","CB",31,83,22),
  P("A. Zambo Anguissa","CM",29,82,25),
  P("A. Buongiorno","CB",26,82,32),
  P("A. Meret","GK",28,82,22),
  P("Miguel Guti\u00e9rrez","LB",23,81,30),
  P("M. Politano","RM",31,81,18),
  P("David Neres","LW",28,81,22),
  P("N. Lang","LW",26,80,22),
  P("V. Milinkovi\u0107-Savi\u0107","GK",28,79,13),
  P("L. Spinazzola","LB",32,78,8),
  P("M. Olivera","LB",27,78,12),
  P("S. Beukema","CB",26,78,14),
  P("E. Elmas","LM",25,77,10),
  P("R. H\u00f8jlund","ST",22,76,13),
  P("L. Lucca","ST",24,76,9)
]},
{ id:"par", name:"Parma", color:"#FFDE00", budget:8, preferredFormation:"4-2-3-1", players:[
  P("E. Valeri","LM",26,75,5),
  P("Hernani","CDM",31,75,3),
  P("E. Delprato","CB",25,75,6),
  P("P. Cutrone","ST",27,75,5),
  P("A. Ndiaye","CB",23,75,7),
  P("Adri\u00e1n Bernab\u00e9","CM",24,74,7),
  P("G. Oristanio","CAM",22,74,6),
  P("Z. Suzuki","GK",22,74,7),
  P("O. S\u00f8rensen","CAM",23,73,5),
  P("M. Keita","CM",23,73,5),
  P("J. Ondrejka","LM",22,73,6),
  P("M. Frigan","ST",22,73,6),
  P("C. Ordo\u00f1ez","CDM",20,72,4),
  P("P. Almqvist","CAM",25,72,2),
  P("N. Est\u00e9vez","CDM",29,71,1),
  P("A. Benedyczak","LM",24,71,2),
  P("M. \u0110uri\u0107","ST",35,71,1),
  P("A. Circati","CB",21,71,3),
  P("B. Cremaschi","CM",20,68,2),
  P("L. Valenti","CB",26,68,1)
]},
{ id:"pis", name:"Pisa", color:"#001E62", budget:8, preferredFormation:"4-4-2", players:[
  P("J. Cuadrado","RM",37,76,2),
  P("C. Stengs","CAM",26,76,8),
  P("Ra\u00fal Albiol","CB",39,76,1),
  P("M. Nzola","ST",28,75,5),
  P("M. Aebischer","CM",28,74,4),
  P("M. Tramoni","CAM",25,74,5),
  P("S. Scuffet","GK",29,72,2),
  P("I. Tour\u00e9","RM",27,71,2),
  P("S. Moreo","CAM",32,71,1),
  P("A. Caracciolo","CB",35,71,1),
  P("A. \u0160emper","GK",27,71,2),
  P("E. Vignato","CAM",24,70,2),
  P("S. Canestrelli","CB",24,70,2),
  P("M. Marin","CM",26,69,1),
  P("S. Angori","LM",21,69,3),
  P("M. L\u00e9ris","RM",27,68,1),
  P("G. Piccinini","CM",24,68,2),
  P("A. Calabresi","CB",29,68,1),
  P("E. Akinsanmiro","CM",20,67,2),
  P("Tom\u00e1s Esteves","RB",23,67,2)
]},
{ id:"rom", name:"Roma", color:"#666", budget:33, preferredFormation:"4-4-2", players:[
  P("P. Dybala","CAM",31,86,49),
  P("A. Dovbyk","ST",28,83,32),
  P("G. Mancini","CB",29,83,26),
  P("M. Svilar","GK",25,82,29),
  P("E. Ndicka","CB",25,81,25),
  P("L. Pellegrini","CAM",29,80,18),
  P("B. Cristante","CM",30,80,17),
  P("Mario Hermoso","CB",30,80,15),
  P("Angeli\u00f1o","LM",28,79,14),
  P("K. Kon\u00e9","CM",24,79,23),
  P("S. El Shaarawy","LM",32,79,12),
  P("L. Bailey","RM",27,79,16),
  P("M. Soul\u00e9","CAM",22,78,25),
  P("Wesley","RM",21,77,19),
  P("K. Tsimikas","LB",29,77,8),
  P("N. El Aynaoui","CM",23,77,14),
  P("Z. \u00c7elik","RB",28,76,6),
  P("T. Baldanzi","CAM",22,75,8),
  P("E. Bove","CM",23,74,7),
  P("D. Rensch","RB",22,74,6)
]},
{ id:"sas", name:"Sassuolo", color:"#00A651", budget:11, preferredFormation:"4-3-3", players:[
  P("D. Berardi","RW",30,82,25),
  P("A. Laurient\u00e9","LW",26,80,20),
  P("N. Mati\u0107","CM",36,77,2),
  P("K. Thorstvedt","CM",26,75,6),
  P("A. Pinamonti","ST",26,75,6),
  P("A. Vranckx","CM",22,74,6),
  P("D. Boloca","CM",26,74,4),
  P("S. Turati","GK",23,74,7),
  P("J. Doig","LB",23,73,4),
  P("I. Kon\u00e9","CM",23,72,4),
  P("W. Coulibaly","RB",26,72,2),
  P("W. Cheddira","ST",27,72,2),
  P("J. Idzes","CB",25,72,3),
  P("A. Muri\u0107","GK",26,72,2),
  P("Fali Cand\u00e9","CB",27,71,2),
  P("A. Fadera","LM",23,71,3),
  P("N. Pierini","ST",26,71,2),
  P("S. Walukiewicz","RB",25,71,2),
  P("F. Romagna","CB",28,70,1),
  P("T. Muharemovi\u0107","CB",22,70,3)
]},
{ id:"tor", name:"Torino", color:"#8B1220", budget:12, preferredFormation:"4-2-3-1", players:[
  P("D. Zapata","ST",34,82,13),
  P("N. Vla\u0161i\u0107","LW",27,79,16),
  P("C. Biraghi","LB",32,78,8),
  P("C. Adams","ST",28,77,9),
  P("P. Schuurs","CB",25,77,12),
  P("V. Lazaro","RB",29,76,6),
  P("I. Ili\u0107","CM",24,76,10),
  P("Sa\u00fal Coco","CB",26,76,7),
  P("G. Marip\u00e1n","CB",31,76,4),
  P("G. Simeone","ST",29,75,5),
  P("F. Israel","GK",25,75,6),
  P("A. Tameze","CDM",31,74,3),
  P("C. Casadei","CM",22,74,8),
  P("K. Asllani","CDM",23,74,5),
  P("Z. Aboukhlal","CAM",25,74,5),
  P("A. Masina","CB",31,74,2),
  P("A. Ismajli","CB",28,74,3),
  P("S. Sazonov","CB",23,73,4),
  P("N. Nkounkou","LB",24,72,3),
  P("M. Pedersen","RB",24,72,3)
]},
{ id:"udi", name:"Udinese", color:"#000000", budget:8, preferredFormation:"4-3-3", players:[
  P("O. Solet","CB",25,78,16),
  P("N. Zaniolo","RM",25,76,8),
  P("S. Lovri\u010d","CM",27,75,5),
  P("J. Karlstr\u00f6m","CDM",30,75,4),
  P("J. Ekkelenkamp","CM",25,74,5),
  P("M. Okoye","GK",25,74,4),
  P("K. Ehizibue","RB",30,73,2),
  P("A. Buksa","ST",28,73,3),
  P("H. Kamara","LB",31,72,1),
  P("A. Zanoli","RB",24,72,4),
  P("K. Davis","ST",27,72,2),
  P("C. Kabasele","CB",34,72,1),
  P("T. Kristensen","CB",23,72,4),
  P("L. Miller","CM",18,71,4),
  P("Oier Zarraga","CM",26,71,2),
  P("R. Sava","GK",23,71,3),
  P("J. Zemura","LB",25,70,2),
  P("I. Gueye","ST",18,70,3),
  P("J. Piotrowski","CM",27,69,1),
  P("A. Atta","CM",22,69,3)
]},
];
function buildSerieAClubs(){
  return RAW_SERIEA.map(c => ({
    ...c,
    players: c.players.map((p,i) => ({ ...p, id:`${c.id}-${i}`, club:c.id, number:i+1, loan:false }))
  }));
}

const RAW_BUNDESLIGA = [
{ id:"1fc", name:"1. FC Heidenheim 1846", color:"#004B93", budget:8, preferredFormation:"4-2-3-1", players:[
  P("P. Mainka","CB",30,76,5),
  P("M. Pieringer","ST",25,75,6),
  P("N. Dorsch","CDM",27,74,4),
  P("M. Honsak","LM",28,74,4),
  P("J. Sch\u00f6ppner","CDM",26,74,4),
  P("K. M\u00fcller","GK",34,74,1),
  P("A. Beck","CAM",28,73,3),
  P("O. Traor\u00e9","RB",27,73,3),
  P("D. Ramaj","GK",23,73,5),
  P("L. Pa\u00e7arada","LB",30,72,2),
  P("M. Busch","RB",30,72,2),
  P("B. Zivzivadze","ST",31,72,2),
  P("T. Siersleben","CB",25,72,2),
  P("J. F\u00f6hrenbach","LB",29,71,1),
  P("B. Gimber","CB",28,71,2),
  P("L. Kerber","CDM",23,70,3),
  P("S. Conteh","ST",28,69,1),
  P("J. Niehues","CDM",24,69,2),
  P("M. Kaufmann","ST",24,68,2),
  P("S. Schimmer","ST",31,68,1)
]},
{ id:"1fc2", name:"1. FC K\u00f6ln", color:"#ED1C24", budget:8, preferredFormation:"4-2-3-1", players:[
  P("A. Castro-Montes","RM",28,77,9),
  P("M. Schw\u00e4be","GK",30,77,7),
  P("M. B\u00fclter","ST",32,76,5),
  P("E. Martel","CDM",23,76,9),
  P("T. Krau\u00df","CDM",24,75,6),
  P("R. Zieler","GK",36,75,1),
  P("F. Kainz","CAM",32,74,3),
  P("J. Kami\u0144ski","LW",23,74,6),
  P("\u00cd. J\u00f3hannesson","CM",22,73,5),
  P("L. Maina","LM",26,73,3),
  P("T. H\u00fcbers","CB",28,73,2),
  P("R. Ache","ST",26,73,3),
  P("D. Heintz","CB",31,73,2),
  P("J. Thielmann","RW",23,72,3),
  P("D. Huseinba\u0161i\u0107","CM",23,72,3),
  P("L. Waldschmidt","CAM",29,72,2),
  P("K. Lund","LB",23,71,3),
  P("S. Sebulonsen","RB",25,70,2),
  P("J. Gazibegovi\u0107","RB",25,70,2),
  P("C. \u00d6zkacar","CB",24,70,2)
]},
{ id:"1fc3", name:"1. FC Union Berlin", color:"#EB1923", budget:9, preferredFormation:"4-3-1-2", players:[
  P("F. R\u00f8nnow","GK",32,80,9),
  P("D. Doekhi","CB",27,78,13),
  P("Diogo Leite","CB",26,78,14),
  P("J. Juranovi\u0107","RB",29,75,4),
  P("D. K\u00f6hn","LB",26,75,5),
  P("C. Trimmel","RB",38,75,1),
  P("R. Khedira","CDM",31,75,3),
  P("L. Querfeld","CB",21,75,10),
  P("R. Skov","LB",29,74,3),
  P("A. Kr\u00e1l","CM",27,74,4),
  P("J. Haberer","CM",31,74,3),
  P("A. Sch\u00e4fer","CM",26,74,5),
  P("T. Rothe","LB",20,74,7),
  P("T. Skarke","ST",28,73,3),
  P("O. Burke","ST",28,73,3),
  P("Jeong Woo Yeong","CAM",25,73,3),
  P("S. Nsoki","CB",26,72,3),
  P("A. Ili\u0107","ST",25,72,3),
  P("M. Ljubi\u010di\u0107","ST",23,71,4),
  P("L. Burcu","LM",20,70,3)
]},
{ id:"1fs", name:"1. FSV Mainz 05", color:"#C7102E", budget:15, preferredFormation:"4-4-2", players:[
  P("N. Amiri","CM",28,81,22),
  P("K. Sano","CM",24,79,20),
  P("A. Caci","RM",28,78,11),
  P("P. Nebel","CAM",22,78,25),
  P("R. Zentner","GK",30,78,8),
  P("Lee Jae Sung","CAM",32,77,7),
  P("D. Kohr","CB",31,77,6),
  P("B. Hollerbach","ST",24,77,14),
  P("P. Mwene","LM",31,76,5),
  P("D. da Costa","CB",31,75,3),
  P("A. Hanche-Olsen","CB",28,75,5),
  P("S. Bell","CB",33,74,2),
  P("A. Nordin","RM",27,73,3),
  P("S. Widmer","RB",32,72,1),
  P("L. Maloney","CDM",25,72,2),
  P("M. Leitsch","CB",27,72,2),
  P("S. Kawasaki","CM",23,71,2),
  P("W. B\u00f8ving","ST",22,71,3),
  P("A. Sieb","ST",22,71,4),
  P("N. Weiper","ST",20,70,3)
]},
{ id:"bay", name:"Bayer 04 Leverkusen", color:"#E32221", budget:36, preferredFormation:"4-4-2", players:[
  P("P. Schick","ST",29,85,46),
  P("Grimaldo","LM",29,84,36),
  P("E. Palacios","CM",26,84,45),
  P("Aleix Garc\u00eda","CM",28,83,31),
  P("M. Tillman","CAM",23,82,40),
  P("R. Andrich","CM",30,81,18),
  P("E. Tapsoba","CB",26,81,24),
  P("M. Terrier","ST",28,79,15),
  P("J. Hofmann","CAM",32,78,9),
  P("N. Tella","CAM",25,78,15),
  P("L. Bad\u00e9","CB",25,78,17),
  P("M. Flekken","GK",32,78,6),
  P("Lucas V\u00e1zquez","RB",34,77,3),
  P("E. Ben Seghir","LM",20,76,14),
  P("E. Fern\u00e1ndez","CDM",22,75,10),
  P("J. Quansah","CB",22,75,10),
  P("C. Echeverri","CAM",19,74,9),
  P("J. Blaswich","GK",34,73,1),
  P("I. Maza","CAM",19,71,4),
  P("Arthur","RM",22,71,3)
]},
{ id:"bor", name:"Borussia Dortmund", color:"#FDE100", budget:46, preferredFormation:"4-2-3-1", players:[
  P("S. Guirassy","ST",29,87,68),
  P("G. Kobel","GK",27,86,57),
  P("N. Schlotterbeck","CB",25,85,55),
  P("J. Brandt","CAM",29,83,31),
  P("F. Nmecha","CDM",24,82,34),
  P("E. Can","CB",31,82,18),
  P("W. Anton","CB",28,82,23),
  P("K. Adeyemi","CAM",23,81,34),
  P("N. S\u00fcle","CB",29,81,18),
  P("M. Sabitzer","CDM",31,80,13),
  P("P. Gro\u00df","CM",34,80,6),
  P("R. Bensebaini","CB",30,79,13),
  P("J. Ryerson","RB",27,79,16),
  P("M. Beier","ST",22,79,24),
  P("F\u00e1bio Silva","ST",22,79,25),
  P("D. Svensson","LM",23,77,13),
  P("Yan Couto","RM",23,77,13),
  P("C. Chukwuemeka","CAM",21,76,15),
  P("S. \u00d6zcan","CDM",27,75,5),
  P("A. Meyer","GK",34,75,1)
]},
{ id:"bor2", name:"Borussia M\u00f6nchengladbach", color:"#000000", budget:13, preferredFormation:"4-2-3-1", players:[
  P("T. Kleindienst","ST",29,81,22),
  P("F. Honorat","RM",28,80,18),
  P("R. Reitz","CDM",23,77,14),
  P("R. Hack","LM",26,77,10),
  P("N. Elvedi","CB",28,77,8),
  P("K. St\u00f6ger","CAM",31,76,5),
  P("J. Omlin","GK",31,76,3),
  P("F. Neuhaus","CM",28,75,5),
  P("P. Sander","CDM",27,75,5),
  P("S. Machino","ST",25,75,6),
  P("G. Reyna","RM",22,75,8),
  P("M. Nicolas","GK",27,75,4),
  P("K. Diks","CB",28,74,3),
  P("L. Ullrich","LB",21,74,8),
  P("J. Scally","RB",22,74,5),
  P("M. Friedrich","CB",29,74,3),
  P("H. Tabakovi\u0107","ST",31,73,2),
  P("L. Netz","LB",22,72,3),
  P("N. Ngoumou","RM",25,72,3),
  P("J. Castrop","CM",21,70,3)
]},
{ id:"ein", name:"Eintracht Frankfurt", color:"#E1000F", budget:27, preferredFormation:"4-2-3-1", players:[
  P("M. G\u00f6tze","CM",33,82,16),
  P("J. Burkardt","ST",24,82,36),
  P("R. Doan","RM",27,82,28),
  P("R. Koch","CB",28,82,23),
  P("E. Skhiri","CDM",30,80,15),
  P("A. Theate","LB",25,80,23),
  P("R. Kristensen","RB",27,79,15),
  P("H. Larsson","CDM",21,78,27),
  P("A. Knauff","RM",23,77,13),
  P("M. Batshuayi","ST",31,77,8),
  P("N. Brown","LB",22,77,19),
  P("M. Zetterer","GK",29,76,5),
  P("E. Wahi","ST",22,75,10),
  P("J. Bahoya","LM",20,75,11),
  P("F. Cha\u00efbi","CDM",22,74,7),
  P("C. Uzun","CAM",19,74,8),
  P("N. Collins","CB",21,74,8),
  P("M. Dahoud","CM",29,73,3),
  P("Aur\u00e9lio Buta","RB",28,73,2),
  P("O. H\u00f8jlund","CM",20,72,4)
]},
{ id:"fca", name:"FC Augsburg", color:"#BA3733", budget:10, preferredFormation:"4-4-2", players:[
  P("A. Claude-Maurice","CAM",27,77,10),
  P("J. Gouweleeuw","CB",33,77,4),
  P("C. Matsima","CB",23,77,19),
  P("F. Dahmen","GK",27,77,8),
  P("K. Jaki\u0107","CM",28,76,6),
  P("D. Giannoulis","LM",29,76,6),
  P("C. Zesiger","CB",27,76,7),
  P("K. Schlotterbeck","CB",28,76,6),
  P("M. Wolf","RM",30,75,4),
  P("P. Tietz","ST",27,75,5),
  P("E. Rexhbe\u00e7aj","CM",27,74,4),
  P("A. Maier","CM",26,74,4),
  P("F. Rieder","CAM",23,74,8),
  P("S. Essende","ST",27,74,4),
  P("R. Fellhauer","CDM",27,73,3),
  P("I. Gharbi","LM",21,73,6),
  P("N. Labrovi\u0107","GK",25,73,3),
  P("H. Massengo","CM",23,72,3),
  P("M. Pedersen","LB",28,72,2),
  P("E. Saad","CAM",25,72,2)
]},
{ id:"fcb2", name:"FC Bayern M\u00fcnchen", color:"#DC052D", budget:75, preferredFormation:"4-2-3-1", players:[
  P("J. Kimmich","CDM",30,89,74),
  P("H. Kane","ST",31,89,75),
  P("J. Musiala","CAM",22,88,115),
  P("J. Tah","CB",29,87,57),
  P("M. Olise","RM",23,86,76),
  P("L. D\u00edaz","LM",28,85,47),
  P("D. Upamecano","CB",26,85,54),
  P("A. Davies","LB",24,84,46),
  P("M. Neuer","GK",39,84,4),
  P("L. Goretzka","CDM",30,82,25),
  P("K. Laimer","RB",28,82,24),
  P("S. Gnabry","CAM",29,82,26),
  P("Kim Min Jae","CB",28,82,25),
  P("R. Guerreiro","LB",31,80,13),
  P("N. Jackson","ST",24,80,26),
  P("A. Pavlovi\u0107","CDM",21,79,32),
  P("H. Ito","CB",26,78,15),
  P("J. Stani\u0161i\u0107","LB",25,78,15),
  P("S. Boey","RB",24,77,12),
  P("T. Bischof","CM",20,76,14)
]},
{ id:"fcs", name:"FC St. Pauli", color:"#8B4513", budget:8, preferredFormation:"4-4-2", players:[
  P("N. Vasilj","GK",29,77,7),
  P("M. Pereira Lage","ST",28,75,5),
  P("J. Irvine","CM",32,75,4),
  P("E. Smith","CB",28,75,5),
  P("H. Wahl","CB",31,74,2),
  P("M. Saliakas","RM",28,73,2),
  P("D. Afolayan","RW",27,72,2),
  P("M. Kaars","ST",26,71,2),
  P("J. Sands","CM",24,71,2),
  P("D. Nemeth","CB",24,71,2),
  P("K. Mets","CB",32,70,1),
  P("C. Metcalfe","CM",25,69,2),
  P("J. Fujita","CM",23,69,2),
  P("D. Sinani","CAM",28,69,1),
  P("L. Ritzka","LB",27,69,1),
  P("A. Hountondji","ST",22,69,3),
  P("L. Oppie","LM",23,68,2),
  P("A. Pyrka","RB",22,68,2),
  P("A. D\u017awiga\u0142a","CB",29,68,1),
  P("B. Voll","GK",24,67,1)
]},
{ id:"ham", name:"Hamburger SV", color:"#0C1C8C", budget:8, preferredFormation:"4-3-3", players:[
  P("F\u00e1bio Vieira","CAM",25,78,16),
  P("M. Muheim","LB",27,75,5),
  P("A. Sambi Lokonga","CM",25,75,7),
  P("J. Domp\u00e9","LW",29,75,5),
  P("J. Torunarigha","CB",27,75,4),
  P("Y. Poulsen","ST",31,74,3),
  P("D. Heuer Fernandes","GK",32,74,2),
  P("N. Capaldo","CM",26,73,3),
  P("R. Glatzel","ST",31,73,2),
  P("W. Omari","CB",25,73,3),
  P("D. Peretz","GK",24,73,3),
  P("N. Remberg","CM",25,72,3),
  P("D. Elfadli","CB",28,72,2),
  P("J. Meffert","CDM",30,72,2),
  P("L. Vu\u0161kovi\u0107","CB",18,72,4),
  P("R. Philippe","ST",24,72,3),
  P("E. Sahiti","RW",26,71,2),
  P("R. K\u00f6nigsd\u00f6rffer","ST",23,71,3),
  P("G. Gocholeishvili","RB",24,70,2),
  P("B. Jatta","RW",27,69,1)
]},
{ id:"rbl", name:"RB Leipzig", color:"#DD0741", budget:26, preferredFormation:"4-3-3", players:[
  P("P. Gul\u00e1csi","GK",35,85,5),
  P("W. Orban","CB",32,84,24),
  P("D. Raum","LB",27,82,28),
  P("X. Schlager","CDM",27,80,20),
  P("B. Henrichs","RB",28,80,16),
  P("C. Lukeba","CB",22,80,38),
  P("R. Baku","RB",27,78,13),
  P("L. Klostermann","CB",29,78,11),
  P("J. Bakayoko","RW",22,78,25),
  P("A. Haidara","CM",27,77,10),
  P("N. Seiwald","CM",24,77,17),
  P("K. Kampl","CM",34,77,4),
  P("C. Baumgartner","CM",25,77,12),
  P("T. Werner","LW",29,77,9),
  P("A. Nusa","LW",20,76,15),
  P("R\u00f4mulo","ST",23,76,10),
  P("M. Vandevoordt","GK",23,76,12),
  P("E. Bitshiabu","CB",20,75,11),
  P("C. Harder","ST",20,74,8),
  P("K. Nedeljkovi\u0107","RB",19,72,4)
]},
{ id:"scf", name:"SC Freiburg", color:"#000000", budget:12, preferredFormation:"4-2-3-1", players:[
  P("M. Ginter","CB",31,82,18),
  P("V. Grifo","LM",32,80,14),
  P("P. Lienhart","CB",28,79,14),
  P("C. G\u00fcnter","LB",32,77,6),
  P("N. Atubolu","GK",23,77,12),
  P("J. Beste","LM",26,76,7),
  P("M. Eggestein","CDM",28,75,4),
  P("P. Osterhage","CDM",25,75,6),
  P("L. K\u00fcbler","RB",32,75,3),
  P("E. Dink\u00e7i","RM",23,74,6),
  P("P. Treu","LB",24,74,5),
  P("M. Rosenfelder","CB",22,74,8),
  P("L. H\u00f6ler","ST",30,73,3),
  P("N. H\u00f6fler","CDM",35,73,1),
  P("A. Jung","CB",33,72,1),
  P("J. Makengo","LB",23,72,3),
  P("F. M\u00fcller","GK",27,72,2),
  P("Y. Suzuki","CAM",23,71,4),
  P("J. Adamu","ST",24,71,2),
  P("D. Kyereh","CAM",29,71,2)
]},
{ id:"svw", name:"SV Werder Bremen", color:"#1D9053", budget:15, preferredFormation:"4-2-3-1", players:[
  P("V. Boniface","ST",24,81,32),
  P("C. Puertas","CAM",26,78,14),
  P("J. Stage","CDM",28,78,12),
  P("M. Weiser","RB",31,78,9),
  P("R. Schmid","CAM",25,78,16),
  P("M. Friedl","CB",27,77,9),
  P("S. Lynen","CDM",26,76,8),
  P("F. Agu","LB",25,75,6),
  P("M. W\u00f6ber","CB",27,75,5),
  P("M. Gr\u00fcll","LM",26,75,5),
  P("N. Stark","CB",30,75,4),
  P("A. Pieper","CB",27,75,6),
  P("Y. Sugawara","RB",25,74,5),
  P("L. Bittencourt","CAM",31,73,2),
  P("J. Njinmah","RM",24,73,5),
  P("K. Hein","GK",23,73,5),
  P("I. Schmidt","LB",25,72,2),
  P("S. Mbangula","LM",21,72,5),
  P("O. Deman","LB",25,71,2),
  P("J. Malatini","CB",24,69,2)
]},
{ id:"tsg", name:"TSG 1899 Hoffenheim", color:"#1C63B7", budget:9, preferredFormation:"4-2-3-1", players:[
  P("O. Baumann","GK",35,83,3),
  P("A. Kramari\u0107","CAM",34,81,10),
  P("A. Hlo\u017eek","ST",22,77,15),
  P("K. Machida","CB",27,76,6),
  P("G. Pr\u00f6mel","CM",30,75,5),
  P("Bernardo","LB",30,75,4),
  P("M. Berisha","ST",27,75,5),
  P("I. Bebou","ST",31,75,4),
  P("O. Kabak","CB",25,75,6),
  P("A. Prass","LB",24,74,5),
  P("K. Akpoguma","CB",30,74,3),
  P("V. Gendrey","RB",25,74,5),
  P("Arthur Chaves","CB",24,74,5),
  P("W. Burger","CDM",24,73,4),
  P("V. Coufal","RB",32,73,2),
  P("D. Geiger","CDM",27,73,3),
  P("T. Lemperle","ST",23,73,6),
  P("F. Asllani","ST",22,73,4),
  P("M. Damar","CAM",21,71,4),
  P("R. Hran\u00e1\u010d","CB",25,71,2)
]},
{ id:"vfb", name:"VfB Stuttgart", color:"#E32219", budget:22, preferredFormation:"4-2-3-1", players:[
  P("A. Stiller","CDM",24,83,41),
  P("M. Mittelst\u00e4dt","LB",28,82,24),
  P("A. N\u00fcbel","GK",28,81,18),
  P("D. Undav","ST",28,80,18),
  P("E. Demirovi\u0107","ST",27,80,20),
  P("J. Chabot","CB",27,78,13),
  P("C. F\u00fchrich","LM",27,77,9),
  P("Tiago Tom\u00e1s","LW",23,76,10),
  P("L. Assignon","RB",25,76,8),
  P("B. El Khannouss","CAM",21,76,15),
  P("A. Karazor","CDM",28,76,6),
  P("D. Zagadou","CB",26,76,7),
  P("J. Leweling","LM",24,75,7),
  P("B. Bouanani","RM",20,75,9),
  P("J. Vagnoman","RB",24,74,5),
  P("Silas","RM",26,74,4),
  P("F. Jeltsch","CB",18,72,4),
  P("A. Al Dakhil","CB",23,72,4),
  P("Y. Keitel","CDM",25,71,2),
  P("L. Stergiou","CB",23,71,3)
]},
{ id:"vfl", name:"VfL Wolfsburg", color:"#65B32E", budget:19, preferredFormation:"4-2-3-1", players:[
  P("M. Amoura","LM",25,80,25),
  P("M. Arnold","CDM",31,79,11),
  P("K. Grabara","GK",26,79,17),
  P("L. Majer","CAM",27,78,14),
  P("J. M\u00e6hle","LB",28,78,11),
  P("D. Vavro","CB",29,78,11),
  P("J. Wind","ST",26,78,15),
  P("A. Skov Olsen","RM",25,77,11),
  P("P. Wimmer","CAM",24,77,14),
  P("K. Koulierakis","CB",21,77,19),
  P("M. Svanberg","CM",26,76,8),
  P("Vinicius Souza","CDM",26,76,8),
  P("C. Eriksen","CM",33,76,4),
  P("M. Jenz","CB",26,76,7),
  P("Y. Gerhardt","CM",31,75,4),
  P("J. Lindstr\u00f8m","RM",25,75,6),
  P("M. M\u00fcller","GK",31,75,3),
  P("K. Fischer","RB",24,74,5),
  P("Rog\u00e9rio","LB",27,73,3),
  P("K. Paredes","LW",22,73,6)
]},
];
function buildBundesligaClubs(){
  return RAW_BUNDESLIGA.map(c => ({
    ...c,
    players: c.players.map((p,i) => ({ ...p, id:`${c.id}-${i}`, club:c.id, number:i+1, loan:false }))
  }));
}

const RAW_LIGUE1 = [
{ id:"aja", name:"AJ Auxerre", color:"#1D3D8F", budget:8, preferredFormation:"4-4-2", players:[
  P("D. L\u00e9on","GK",32,76,3),
  P("G. Mensah","LB",26,74,4),
  P("L. Sinayoko","ST",25,74,5),
  P("K. Danois","CM",21,74,8),
  P("C. Akpa","CB",23,74,5),
  P("E. Owusu","CM",27,73,3),
  P("S. Diomand\u00e9","CB",24,73,3),
  P("D. Namaso","ST",24,73,4),
  P("I. Osman","LM",20,72,5),
  P("J. Casimir","RM",23,71,2),
  P("S. Mara","ST",22,70,3),
  P("F. Sierralta","CB",28,70,1),
  P("A. Diouss\u00e9","CDM",27,69,1),
  P("M. Senaya","RB",24,69,2),
  P("O. El Azzouzi","CDM",24,68,1),
  P("L. Coulibaly","RM",22,68,2),
  P("F. Oppeg\u00e5rd","LB",22,67,2),
  P("L. Sy","RB",22,66,2),
  P("T. De Percin","GK",24,66,1),
  P("N. Buayi-Kiala","CM",21,62,1)
]},
{ id:"asm", name:"AS Monaco", color:"#E51A23", budget:23, preferredFormation:"4-4-2", players:[
  P("D. Zakaria","CM",28,82,25),
  P("L. Hr\u00e1deck\u00fd","GK",35,81,2),
  P("M. Akliouche","RM",23,80,29),
  P("A. Golovin","LM",29,79,15),
  P("P. Pogba","CM",32,79,12),
  P("E. Dier","CB",31,79,10),
  P("T. Kehrer","CB",28,79,14),
  P("T. Minamino","LM",30,78,12),
  P("M. Biereth","ST",22,78,25),
  P("L. Camara","CM",21,77,20),
  P("Vanderson","RB",24,77,13),
  P("Caio Henrique","LB",27,77,9),
  P("F. Balogun","ST",23,77,14),
  P("P. K\u00f6hn","GK",27,77,9),
  P("J. Teze","RB",25,76,8),
  P("M. Salisu","CB",26,76,9),
  P("Ansu Fati","LM",22,75,10),
  P("C. Mawissa","CB",20,75,10),
  P("K. Diatta","RM",26,74,4),
  P("K. Ouattara","LB",20,72,4)
]},
{ id:"ang", name:"Angers SCO", color:"#000000", budget:8, preferredFormation:"4-2-3-1", players:[
  P("H. Abdelli","CAM",25,76,9),
  P("H. Belkebla","CDM",31,74,3),
  P("J. Lefort","CB",31,73,2),
  P("H. Koffi","GK",28,73,2),
  P("F. Hanin","LB",35,72,1),
  P("J. Allevinah","RM",30,72,2),
  P("C. Arcus","RB",29,71,1),
  P("P. Capelle","CDM",38,70,1),
  P("Y. Belkhdim","CDM",23,70,3),
  P("L. Mouton","CM",23,70,3),
  P("A. Bamba","CB",35,70,1),
  P("L. Raolisoa","RB",25,70,2),
  P("E. Biumla","CB",20,70,3),
  P("O. Camara","CB",22,69,2),
  P("J. Ekomi\u00e9","LB",21,68,2),
  P("S. Ch\u00e9rif","LM",18,67,2),
  P("M. Courcoul","CDM",18,65,1),
  P("M. Zinga","GK",23,65,1),
  P("J. Kalumba","LM",20,63,1),
  P("P. Peter","ST",17,63,1)
]},
{ id:"fcl", name:"FC Lorient", color:"#F97300", budget:8, preferredFormation:"4-4-2", players:[
  P("Y. Mvogo","GK",31,76,3),
  P("L. Abergel","CM",32,75,3),
  P("B. Me\u00eft\u00e9","CB",23,73,4),
  P("M. Talbi","CB",27,73,3),
  P("D. Yongwa","LB",24,72,3),
  P("A. Tosin","ST",27,71,2),
  P("A. Avom Ebong","CM",20,71,4),
  P("B. Dieng","ST",25,71,2),
  P("J. Mvuka","RM",22,71,3),
  P("S. Soumano","ST",24,71,3),
  P("I. Tour\u00e9","CB",22,71,3),
  P("Igor Silva","RB",28,70,1),
  P("N. Cadiou","CDM",26,70,2),
  P("P. Katseris","RM",23,70,2),
  P("M. Bamba","ST",23,70,2),
  P("B. Kamara","GK",28,70,1),
  P("J. Makengo","CM",27,69,1),
  P("T. Le Bris","LM",22,69,3),
  P("D. Karim","CDM",21,69,3),
  P("P. Pagis","LM",22,68,2)
]},
{ id:"fcm", name:"FC Metz", color:"#8B0304", budget:8, preferredFormation:"4-2-3-1", players:[
  P("G. Hein","CAM",28,76,6),
  P("B. Stambouli","CDM",34,73,1),
  P("J. Deminguet","CM",27,72,2),
  P("F. Ballo-Tour\u00e9","LB",28,72,2),
  P("C. Sabaly","ST",26,72,3),
  P("H. Diallo","ST",30,72,2),
  P("G. Tsitaishvili","RM",24,72,3),
  P("B. Traor\u00e9","CDM",23,71,2),
  P("K. Kouao","RB",27,71,2),
  P("S. San\u00e9","CB",21,70,3),
  P("M. Colin","RB",33,69,1),
  P("T. Yegbe","CB",24,69,2),
  P("J. Fischer","GK",23,69,2),
  P("J. Gbamin","CB",29,68,1),
  P("J. Asoro","RM",26,67,1),
  P("U. Mboula","CB",22,67,2),
  P("Y. Lawson","LB",20,66,2),
  P("G. Abuashvili","LM",22,66,2),
  P("M. Mbaye","RM",21,65,2),
  P("M. Bokele","LM",21,65,2)
]},
{ id:"fcn", name:"FC Nantes", color:"#FFCE00", budget:8, preferredFormation:"4-2-3-1", players:[
  P("M. Abline","ST",22,76,10),
  P("A. Lopes","GK",34,76,1),
  P("F. Coquelin","CDM",34,75,2),
  P("J. Lepenant","CM",22,74,7),
  P("Hong Hyeon Seok","CAM",26,73,3),
  P("K. Amian","RB",27,73,3),
  P("Y. El Arabi","ST",38,73,1),
  P("M. Mohamed","ST",27,73,3),
  P("N. Cozza","LB",26,73,3),
  P("J. Mwanga","CDM",22,72,3),
  P("P. Carlgren","GK",33,71,1),
  P("F. Centonze","RB",29,70,1),
  P("L. Leroux","CM",19,70,3),
  P("C. Awaziem","CB",28,70,1),
  P("M. Lahdo","RW",22,68,2),
  P("Kwon Hyeok Kyu","CDM",24,67,2),
  P("Y. Benhattab","RW",22,67,2),
  P("B. Guirassy","LW",18,67,2),
  P("T. Tati","CB",17,67,2),
  P("U. Radakovi\u0107","CB",31,67,1)
]},
{ id:"leh", name:"Le Havre AC", color:"#005BAA", budget:8, preferredFormation:"4-4-2", players:[
  P("A. Tour\u00e9","CDM",31,75,3),
  P("G. Lloris","CB",29,74,3),
  P("Y. Kechta","CM",23,73,5),
  P("A. Sangante","CB",23,73,5),
  P("L. N\u00e9go","RB",34,72,1),
  P("R. Khadra","CAM",23,72,3),
  P("A. Samatta","ST",32,72,2),
  P("I. Soumar\u00e9","LM",24,72,3),
  P("\u00c9. Yout\u00e9 Kinkou\u00e9","CB",23,72,4),
  P("T. Delaine","LB",33,71,1),
  P("Y. Namli","RM",31,71,1),
  P("R. Ndiaye","CM",23,70,2),
  P("Y. Zouaoui","LB",27,70,1),
  P("M. Diaw","GK",32,70,1),
  P("F. Doucour\u00e9","RM",24,69,2),
  P("A. Seko","CB",25,69,2),
  P("L. Mpasi","GK",30,67,1),
  P("F. Mambimbi","ST",24,66,1),
  P("G. Kyeremeh","RM",25,66,1),
  P("S. Ebonog","CM",20,65,1)
]},
{ id:"lil", name:"Lille OSC", color:"#C10015", budget:15, preferredFormation:"4-2-3-1", players:[
  P("B. Andr\u00e9","CDM",34,80,6),
  P("Alexsandro","CB",25,80,23),
  P("O. Giroud","ST",38,79,5),
  P("H. Haraldsson","CAM",22,78,19),
  P("N. Bentaleb","CDM",30,77,8),
  P("Tiago Santos","RB",22,77,14),
  P("B. \u00d6zer","GK",25,77,9),
  P("T. Meunier","RB",33,76,3),
  P("O. Sahraoui","LM",24,76,10),
  P("Andr\u00e9 Gomes","CDM",31,75,3),
  P("A. Bouaddi","CDM",17,75,10),
  P("A. Mandi","CB",33,75,2),
  P("F\u00e9lix Correia","LM",24,75,7),
  P("C. Mbemba","CB",30,75,4),
  P("M. Fernandez-Pardo","RM",20,75,11),
  P("R. Perraud","LB",27,74,4),
  P("N. Mukau","CDM",20,74,7),
  P("H. Igamane","ST",22,73,6),
  P("A. Bodart","GK",27,73,3),
  P("C. Verdonk","LB",28,71,1)
]},
{ id:"ogc", name:"OGC Nice", color:"#CC1C2C", budget:15, preferredFormation:"4-4-2", players:[
  P("J. Clauss","RM",32,80,12),
  P("M. Bard","LM",24,78,16),
  P("Dante","CB",41,78,1),
  P("Y. Diouf","GK",25,78,14),
  P("H. Boudaoui","CM",25,77,12),
  P("C. Vanhoutte","CM",26,77,11),
  P("Y. Ndayishimiye","CB",26,77,12),
  P("M. Sanson","CM",30,76,6),
  P("A. Abdi","LB",31,76,5),
  P("S. Diop","LW",25,76,9),
  P("J. Boga","LW",28,76,6),
  P("M. Bombito","CB",25,76,12),
  P("M. Cho","RW",21,76,13),
  P("T. Moffi","ST",26,75,6),
  P("T. Ndombele","CM",28,74,4),
  P("M. Abdelmonem","CB",26,74,5),
  P("M. Dup\u00e9","GK",32,74,2),
  P("Tiago Gouveia","RM",24,73,4),
  P("S. Abdul Samed","CDM",25,73,3),
  P("T. Louchet","RM",22,72,5)
]},
{ id:"oly", name:"Olympique Lyonnais", color:"#DA004E", budget:16, preferredFormation:"4-2-3-1", players:[
  P("C. Tolisso","CAM",30,81,21),
  P("N. Tagliafico","LB",32,78,8),
  P("M. Fofana","LM",20,78,27),
  P("D. Greif","GK",28,78,11),
  P("A. Maitland-Niles","RB",27,77,9),
  P("Clinton Mata","CB",32,77,6),
  P("O. Mangala","CDM",27,77,10),
  P("P. \u0160ulc","CAM",24,77,12),
  P("M. Niakhat\u00e9","CB",29,77,8),
  P("T. Tessmann","CDM",23,75,7),
  P("E. Nuamah","RM",21,75,10),
  P("T. Morton","CDM",22,74,8),
  P("Abner Vin\u00edcius","LB",25,74,4),
  P("R. Ghezzal","RM",33,74,2),
  P("M. Satriano","ST",24,74,5),
  P("R. Descamps","GK",29,74,3),
  P("A. Karabec","RM",21,71,3),
  P("Afonso Moreira","LM",20,67,2),
  P("R. Kluivert","CB",24,67,2),
  P("K. Merah","CAM",18,66,2)
]},
{ id:"oly2", name:"Olympique de Marseille", color:"#2FAEE0", budget:30, preferredFormation:"4-2-3-1", players:[
  P("B. Pavard","CB",29,84,31),
  P("P. H\u00f8jbjerg","CDM",29,82,22),
  P("M. Greenwood","RM",23,82,37),
  P("G. Rulli","GK",33,82,9),
  P("P. Aubameyang","ST",36,81,8),
  P("N. Aguerd","CB",29,81,21),
  P("L. Balerdi","CB",26,81,26),
  P("Igor Paix\u00e3o","LM",25,80,24),
  P("A. Gouiri","ST",25,79,22),
  P("F. Medina","LB",26,79,18),
  P("M. O'Riley","CAM",24,78,18),
  P("G. Kondogbia","CB",32,78,8),
  P("T. Weah","RM",25,77,11),
  P("Emerson","LB",30,77,8),
  P("H. Traor\u00e9","LM",25,77,12),
  P("A. Vermeeren","CM",20,77,20),
  P("A. Gomes","CDM",24,76,10),
  P("A. Murillo","RB",29,76,6),
  P("N. Maupay","ST",28,75,5),
  P("U. Garcia","LB",29,75,4)
]},
{ id:"pfc", name:"Paris FC", color:"#031C4E", budget:8, preferredFormation:"4-4-2", players:[
  P("K. Trapp","GK",34,81,4),
  P("H. Traor\u00e9","RB",33,79,8),
  P("P. Lees-Melou","CDM",32,78,8),
  P("M. Simon","LM",29,77,9),
  P("M. Lopez","CM",27,76,7),
  P("J. Ikon\u00e9","RM",27,76,7),
  P("I. Kebbal","RM",26,76,7),
  P("Ot\u00e1vio","CB",23,75,7),
  P("J. Krasso","ST",27,74,4),
  P("M. Cafaro","LM",28,73,3),
  P("O. Nkambadio","GK",22,73,5),
  P("T. De Smet","LB",27,72,2),
  P("W. Geubbels","ST",23,72,4),
  P("M. Mbow","CB",25,72,2),
  P("A. Camara","CM",28,71,2),
  P("V. Marchetti","CM",27,70,1),
  P("T. Kolodziejczak","CB",33,69,1),
  P("A. Gory","ST",28,69,1),
  P("T. Ollila","LB",25,68,1),
  P("L. Doucet","CDM",22,68,2)
]},
{ id:"par2", name:"Paris Saint-Germain", color:"#004170", budget:100, preferredFormation:"4-3-3", players:[
  P("O. Demb\u00e9l\u00e9","ST",28,90,105),
  P("A. Hakimi","RB",26,89,95),
  P("Vitinha","CM",25,89,111),
  P("K. Kvaratskhelia","LW",24,87,94),
  P("Marquinhos","CB",31,87,47),
  P("Nuno Mendes","LB",23,86,74),
  P("W. Pacho","CB",23,86,71),
  P("Jo\u00e3o Neves","CM",20,85,68),
  P("Fabi\u00e1n Ruiz","CM",29,85,45),
  P("D. Dou\u00e9","RW",20,85,72),
  P("B. Barcola","LW",22,84,53),
  P("L. Chevalier","GK",23,83,38),
  P("L. Hern\u00e1ndez","CB",29,81,18),
  P("W. Za\u00efre-Emery","CM",19,80,35),
  P("Gon\u00e7alo Ramos","ST",24,80,26),
  P("Lee Kang In","RW",24,79,23),
  P("I. Zabarnyi","CB",22,79,21),
  P("Lucas Beraldo","CB",21,78,18),
  P("M. Safonov","GK",26,78,13),
  P("S. Mayulu","CM",19,75,10)
]},
{ id:"rcl", name:"RC Lens", color:"#FEE104", budget:8, preferredFormation:"4-4-2", players:[
  P("A. Thomasson","CM",31,77,7),
  P("J. Gradit","CB",32,77,6),
  P("D. Machado","LM",31,76,5),
  P("F. Thauvin","RW",32,76,5),
  P("R. Aguilar","RM",32,76,4),
  P("F. Sotoca","ST",34,75,2),
  P("S. Abdulhamid","RB",25,75,6),
  P("M. Udol","CB",29,74,3),
  P("A. Sima","LW",24,74,6),
  P("W. Sa\u00efd","ST",30,74,4),
  P("M. Guilavogui","ST",27,73,3),
  P("M. Sarr","CB",26,73,3),
  P("M. Sangar\u00e9","CM",23,72,4),
  P("J. Ch\u00e1vez","LB",23,72,3),
  P("O. Edouard","ST",27,72,2),
  P("R. Risser","GK",20,72,4),
  P("H. Ojediran","CDM",21,70,3),
  P("S. Baidoo","CB",21,70,3),
  P("R. Gurtner","GK",38,69,1),
  P("A. Bermont","LM",20,68,2)
]},
{ id:"rcs", name:"RC Strasbourg Alsace", color:"#0072BC", budget:15, preferredFormation:"4-4-2", players:[
  P("E. Emegha","ST",22,78,19),
  P("B. Chilwell","LM",28,77,8),
  P("Diego Moreira","RM",20,77,14),
  P("G. Dou\u00e9","CB",22,77,13),
  P("F. Lemar\u00e9chal","CAM",21,76,10),
  P("S. Nanasi","CAM",23,76,13),
  P("I. Doukour\u00e9","CB",21,76,9),
  P("M. Sarr","CB",19,76,13),
  P("V. Barco","CM",20,75,10),
  P("J. Panichelli","ST",22,74,8),
  P("K. P\u00e1ez","CAM",18,73,6),
  P("J. Enciso","CAM",21,73,6),
  P("A. Omobamidele","CB",23,73,4),
  P("M. Penders","GK",19,73,5),
  P("M. Amougou","CM",19,72,4),
  P("A. Sylla","CB",22,72,4),
  P("S. Coulibaly","CB",21,72,4),
  P("S. Sow","CB",22,71,2),
  P("M. Oyedele","CM",20,70,3),
  P("E. Sobol","LB",30,69,1)
]},
{ id:"sta", name:"Stade Brestois 29", color:"#DC1E32", budget:8, preferredFormation:"4-4-2", players:[
  P("L. Ajorque","ST",31,77,8),
  P("B. Chardonnet","CB",30,77,7),
  P("R. Majecki","GK",25,77,9),
  P("K. Lala","RB",33,76,3),
  P("R. Del Castillo","RW",29,76,6),
  P("H. Magnetti","CM",27,76,7),
  P("B. Locko","LB",23,75,7),
  P("J. Chotard","CM",23,74,5),
  P("K. Doumbia","CM",22,74,6),
  P("L. Tousart","CDM",28,74,4),
  P("J. Le Cardinal","CB",27,74,4),
  P("Mama Bald\u00e9","LW",29,73,3),
  P("J. Dina Ebimbe","RM",24,72,3),
  P("R. Labeau Lascary","ST",22,72,4),
  P("P. Mboup","LM",21,69,3),
  P("J. Diaz","CB",21,69,2),
  P("L. Zogb\u00e9","RB",20,68,2),
  P("D. Guindo","LB",22,67,2),
  P("G. Coudert","GK",26,66,1),
  P("J. Bourgault","LB",19,65,1)
]},
{ id:"sta2", name:"Stade Rennais FC", color:"#E2001A", budget:13, preferredFormation:"4-2-3-1", players:[
  P("B. Samba","GK",31,80,9),
  P("V. Rongier","CM",30,79,12),
  P("M. Camara","CM",27,78,14),
  P("S. Fofana","CM",30,77,9),
  P("L. Blas","RM",27,77,9),
  P("B. Embolo","ST",28,77,9),
  P("Q. Merlin","LB",23,76,9),
  P("H. Hateboer","CB",31,76,4),
  P("L. Brassier","CB",25,76,8),
  P("A. Rouault","CB",24,76,9),
  P("P. Frankowski","RB",30,75,4),
  P("M. Al Tamari","ST",28,75,5),
  P("E. Lepaul","ST",25,75,7),
  P("J. Jacquet","CB",19,75,10),
  P("G. Kamara","CDM",29,74,3),
  P("A. Seidu","CB",25,74,5),
  P("D. Ciss\u00e9","CDM",21,73,6),
  P("G. Gallon","GK",32,73,1),
  P("M. Me\u00eft\u00e9","ST",17,70,3),
  P("A. Ait Boudlal","CB",19,68,2)
]},
{ id:"tou", name:"Toulouse FC", color:"#6A2C91", budget:8, preferredFormation:"4-3-3", players:[
  P("G. Restes","GK",20,78,23),
  P("R. Nicolaisen","CB",28,76,6),
  P("A. D\u00f8nnum","RM",27,75,5),
  P("Y. Gboho","LW",24,75,8),
  P("C. C\u00e1sseres Jr","CM",25,74,5),
  P("D. Sidib\u00e9","CB",32,74,2),
  P("M. McKenzie","CB",26,74,5),
  P("C. Cresswell","CB",22,74,7),
  P("N. Schmidt","CM",27,72,2),
  P("W. Kamanzi","RB",24,72,3),
  P("F. Magri","ST",25,72,3),
  P("K. Haug","GK",27,70,1),
  P("S. Hidalgo","RW",20,69,3),
  P("A. Francis","CM",24,68,2),
  P("M. Sauer","CM",21,68,2),
  P("N. Edjouma","RM",19,66,2),
  P("\u00c1lex Dom\u00ednguez","GK",26,66,1),
  P("Emersonn","RW",20,65,1),
  P("J. Vignolo","ST",18,65,1),
  P("R. Messali","RB",22,64,1)
]},
];
function buildLigue1Clubs(){
  return RAW_LIGUE1.map(c => ({
    ...c,
    players: c.players.map((p,i) => ({ ...p, id:`${c.id}-${i}`, club:c.id, number:i+1, loan:false }))
  }));
}

const EURO_OPPONENTS = [
  { name:"Real Madrid", color:"#FEBE10", ovr:90 }, { name:"FC Barcelona", color:"#A50044", ovr:88 },
  { name:"Bayern Munich", color:"#DC052D", ovr:89 }, { name:"Paris Saint-Germain", color:"#004170", ovr:88 },
  { name:"Inter Milan", color:"#0068A8", ovr:85 }, { name:"AC Milan", color:"#FB090B", ovr:82 },
  { name:"Juventus", color:"#3d3d3d", ovr:83 }, { name:"Napoli", color:"#12A0D7", ovr:84 },
  { name:"Bayer Leverkusen", color:"#E32221", ovr:82 }, { name:"Borussia Dortmund", color:"#a89000", ovr:81 },
  { name:"RB Leipzig", color:"#DD0741", ovr:80 }, { name:"Atlético Madrid", color:"#CB3524", ovr:83 },
  { name:"Villarreal CF", color:"#b8a638", ovr:76 }, { name:"Sporting CP", color:"#006633", ovr:78 },
  { name:"Benfica", color:"#E31B23", ovr:79 }, { name:"PSV Eindhoven", color:"#ED1C24", ovr:77 },
];
const UCL_ROUNDS = ["Round of 16","Quarter-Final","Semi-Final","Final"];
// Clubs playing in Europe get a bye into Carabao Cup Round 2, same as the real competition.
const EUROPEAN_CLUBS = ["ars","liv","man","mun","che","tot","new"];
// Each entry fires once the user has completed exactly `afterRound` league games in that half.
const CARABAO_SCHEDULE = [
  { afterRound:2, round:"Round 1", skipForEuropean:true },
  { afterRound:4, round:"Round 2" },
  { afterRound:7, round:"Round 3" },
  { afterRound:11, round:"Round 4" },
  { afterRound:14, round:"Quarter-Final" },
  { afterRound:17, round:"Semi-Final" },
];
const CARABAO_FINAL_SLOT = { afterRound:6, round:"Final" }; // half 2
const FA_SCHEDULE = [
  { afterRound:1, round:"Third Round" },
  { afterRound:4, round:"Fourth Round" },
  { afterRound:7, round:"Fifth Round" },
  { afterRound:10, round:"Quarter-Final" },
  { afterRound:13, round:"Semi-Final" },
  { afterRound:16, round:"Final" },
]; // half 2 — all PL/Championship clubs enter together at the Third Round, same as reality
const COPA_SCHEDULE = [
  { afterRound:1, round:"Round of 32" },
  { afterRound:4, round:"Round of 16" },
  { afterRound:7, round:"Quarter-Final" },
  { afterRound:10, round:"Semi-Final" },
  { afterRound:13, round:"Final" },
]; // half 2 — Copa del Rey for La Liga saves

const FORMATIONS = {
  "4-3-3": [
    {role:"GK",x:50,y:90},{role:"LB",x:15,y:68},{role:"CB",x:38,y:73},{role:"CB",x:62,y:73},{role:"RB",x:85,y:68},
    {role:"CM",x:30,y:46},{role:"CM",x:50,y:52},{role:"CM",x:70,y:46},
    {role:"LW",x:20,y:16},{role:"ST",x:50,y:10},{role:"RW",x:80,y:16}
  ],
  "4-4-2": [
    {role:"GK",x:50,y:90},{role:"LB",x:15,y:68},{role:"CB",x:38,y:73},{role:"CB",x:62,y:73},{role:"RB",x:85,y:68},
    {role:"LM",x:15,y:42},{role:"CM",x:38,y:46},{role:"CM",x:62,y:46},{role:"RM",x:85,y:42},
    {role:"ST",x:38,y:12},{role:"ST",x:62,y:12}
  ],
  "4-2-3-1": [
    {role:"GK",x:50,y:90},{role:"LB",x:15,y:68},{role:"CB",x:38,y:73},{role:"CB",x:62,y:73},{role:"RB",x:85,y:68},
    {role:"CDM",x:38,y:54},{role:"CDM",x:62,y:54},
    {role:"LW",x:20,y:26},{role:"CAM",x:50,y:30},{role:"RW",x:80,y:26},
    {role:"ST",x:50,y:10}
  ],
  "3-5-2": [
    {role:"GK",x:50,y:90},{role:"CB",x:30,y:73},{role:"CB",x:50,y:76},{role:"CB",x:70,y:73},
    {role:"LB",x:12,y:48},{role:"CM",x:32,y:46},{role:"CM",x:50,y:50},{role:"CM",x:68,y:46},{role:"RB",x:88,y:48},
    {role:"ST",x:38,y:12},{role:"ST",x:62,y:12}
  ],
  "3-4-3": [
    {role:"GK",x:50,y:90},{role:"CB",x:30,y:73},{role:"CB",x:50,y:76},{role:"CB",x:70,y:73},
    {role:"LB",x:10,y:50},{role:"CM",x:35,y:48},{role:"CM",x:65,y:48},{role:"RB",x:90,y:50},
    {role:"LW",x:20,y:14},{role:"ST",x:50,y:10},{role:"RW",x:80,y:14}
  ],
  "5-3-2": [
    {role:"GK",x:50,y:90},{role:"LB",x:10,y:66},{role:"CB",x:30,y:73},{role:"CB",x:50,y:76},{role:"CB",x:70,y:73},{role:"RB",x:90,y:66},
    {role:"CM",x:30,y:46},{role:"CM",x:50,y:50},{role:"CM",x:70,y:46},
    {role:"ST",x:38,y:12},{role:"ST",x:62,y:12}
  ],
  "4-3-1-2": [
    {role:"GK",x:50,y:90},{role:"LB",x:15,y:68},{role:"CB",x:38,y:73},{role:"CB",x:62,y:73},{role:"RB",x:85,y:68},
    {role:"CDM",x:50,y:58},
    {role:"CM",x:30,y:42},{role:"CM",x:70,y:42},
    {role:"CAM",x:50,y:26},
    {role:"ST",x:38,y:12},{role:"ST",x:62,y:12}
  ],
};

const STORAGE_KEY = "pl-manager-save-v8";

/* ============================== HELPERS ============================== */
function poisson(lambda){
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
}
function clamp(n,a,b){ return Math.max(a, Math.min(b,n)); }
function topXI(players){ return [...players].sort((a,b)=>b.ovr-a.ovr).slice(0,11); }
function avg(arr, fallback){ return arr.length ? arr.reduce((s,p)=>s+p.ovr,0)/arr.length : fallback; }

function teamRatings(players){
  const gk = players.filter(p=>p.group==="GK");
  const def = players.filter(p=>p.group==="DEF");
  const mid = players.filter(p=>p.group==="MID");
  const fwd = players.filter(p=>p.group==="FWD");
  const attack = (avg(fwd,68)*1.3 + avg(mid,68)*0.9) / 2.2;
  const defense = (avg(gk,68)*0.9 + avg(def,68)*1.2 + avg(mid,68)*0.5) / 2.6;
  return { attack, defense };
}
// Playing styles layer on top of formation shape: each nudges attack/defense output and match variance,
// and has explicit good/bad matchups against other styles (independent of the formation-vs-formation battle).
const STYLES = {
  balanced: { name:"Balanced", desc:"No extreme setup — steady in and out of possession.", attack:0, defense:0, variance:0 },
  tiki:     { name:"Tiki-Taka", desc:"Patient possession football. Controls the tempo, but needs quality to unlock a deep block.", attack:0.04, defense:0.02, variance:-0.05 },
  gegen:    { name:"Gegenpressing", desc:"Hunt the ball back the instant you lose it. High energy, high reward, high risk on the break.", attack:0.07, defense:0.04, variance:0.08 },
  bus:      { name:"Park the Bus", desc:"Everyone behind the ball. Concede almost nothing, rarely threaten yourself.", attack:-0.10, defense:0.14, variance:-0.06 },
  counter:  { name:"Counter-Attack", desc:"Sit in, soak up pressure, break at pace. Thrives against teams committing men forward.", attack:0.03, defense:0.05, variance:0.05 },
  direct:   { name:"Direct Play", desc:"Bypass midfield, go long and early. Leans on your strikers' quality more than build-up play.", attack:0.02, defense:-0.02, variance:0.04 },
};
// myStyle -> oppStyle -> bonus added to my attacking output (asymmetric on purpose — these are real football counters).
const STYLE_MATCHUP = {
  gegen:   { tiki: 0.06, bus: -0.03 },
  tiki:    { gegen: -0.05, bus: -0.05 },
  counter: { gegen: 0.08, tiki: 0.05 },
  bus:     { gegen: 0.03, tiki: 0.04 },
  direct:  { gegen: 0.02, tiki: 0.03 },
};
function styleMatchupBonus(myStyle, oppStyle){ return (STYLE_MATCHUP[myStyle] && STYLE_MATCHUP[myStyle][oppStyle]) || 0; }
// Infers a plausible style for an AI side from its squad quality and formation shape — no extra data needed per club.
function inferStyle(players, formation){
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
function lineModifier(line, trap, myDefRating, oppAttRating){
  const linePos = ((line ?? 50) - 50) / 50; // -1 (deep) .. +1 (high line)
  let attackAdj = linePos * 0.05;
  let defenseAdj = -linePos * 0.06;
  if (trap){
    const skillGap = (myDefRating - oppAttRating) / 10;
    defenseAdj += clamp(0.05 + skillGap*0.02, -0.05, 0.08);
  }
  return { attackAdj: clamp(attackAdj, -0.06, 0.06), defenseAdj: clamp(defenseAdj, -0.10, 0.10) };
}
function myTactics(s){
  return { formation: s.formation, style: s.tacticalStyle || "balanced", line: s.defensiveLine ?? 50, trap: !!s.offsideTrap };
}
function aiTactics(club){
  const formation = club.preferredFormation || "4-4-2";
  return { formation, style: inferStyle(club.players, formation), line: 50, trap: false };
}
// Attack-vs-defense model: formation-shape tactics, playing-style identity and matchups, defensive line/offside
// trap, home advantage, and a per-match variance swing (widened or narrowed by playing style).
function simMatchSmart(teamAPlayers, teamBPlayers, homeA, tacticsA, tacticsB){
  const rA = teamRatings(teamAPlayers), rB = teamRatings(teamBPlayers);
  const tactFormA = 1 + tacticalModifier(tacticsA.formation, tacticsB.formation);
  const tactFormB = 1 + tacticalModifier(tacticsB.formation, tacticsA.formation);
  const styleA = STYLES[tacticsA.style] || STYLES.balanced;
  const styleB = STYLES[tacticsB.style] || STYLES.balanced;
  const styleAttA = styleA.attack + styleMatchupBonus(tacticsA.style, tacticsB.style);
  const styleAttB = styleB.attack + styleMatchupBonus(tacticsB.style, tacticsA.style);
  const lineAdjA = lineModifier(tacticsA.line, tacticsA.trap, rA.defense, rB.attack);
  const lineAdjB = lineModifier(tacticsB.line, tacticsB.trap, rB.defense, rA.attack);
  const effAttackA = rA.attack * (1 + styleAttA + lineAdjA.attackAdj);
  const effAttackB = rB.attack * (1 + styleAttB + lineAdjB.attackAdj);
  const effDefenseA = rA.defense * (1 + styleA.defense + lineAdjA.defenseAdj);
  const effDefenseB = rB.defense * (1 + styleB.defense + lineAdjB.defenseAdj);
  const swingHalfA = clamp(0.15 + (styleA.variance||0), 0.05, 0.35);
  const swingHalfB = clamp(0.15 + (styleB.variance||0), 0.05, 0.35);
  const formSwingA = 1 - swingHalfA + Math.random()*2*swingHalfA;
  const formSwingB = 1 - swingHalfB + Math.random()*2*swingHalfB;
  const lamA = clamp(1.35 * Math.pow(effAttackA / effDefenseB, 1.7) * (homeA ? 1.15 : 0.92) * formSwingA * tactFormA, 0.15, 4.4);
  const lamB = clamp(1.35 * Math.pow(effAttackB / effDefenseA, 1.7) * (homeA ? 0.9 : 1.12) * formSwingB * tactFormB, 0.15, 4.4);
  return { goalsA: poisson(lamA), goalsB: poisson(lamB) };
}
// Simplified flat-rating model for European nights (opponents outside our league don't have full squads).
function simMatchFlat(oA, oB, homeA){
  const diff = (oA - oB) / 9;
  const lamA = clamp(1.3 + diff*0.55 + (homeA?0.25:0), 0.15, 4.2);
  const lamB = clamp(1.3 - diff*0.55 + (homeA?0:0.2), 0.15, 4.2);
  return { goalsA: poisson(lamA), goalsB: poisson(lamB) };
}
function weightedScorer(players){
  const pool = players.length ? players : [{name:"Unknown"}];
  const weights = pool.map(p => p.group==="FWD"?4 : p.group==="MID"?2.2 : p.group==="DEF"?0.5 : 0.1);
  const total = weights.reduce((a,b)=>a+b,0);
  let r = Math.random()*total;
  for(let i=0;i<pool.length;i++){ r -= weights[i]; if(r<=0) return pool[i].name; }
  return pool[pool.length-1].name;
}
function roundRobin(teamIds){
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
function initTable(ids){ return Object.fromEntries(ids.map(id => [id,{id,played:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}])); }
function applyUpdates(tableRaw, updates){
  const t = { ...tableRaw };
  updates.forEach(u => {
    const row = { ...t[u.clubId] };
    row.played++; row.gf += u.gf; row.ga += u.ga;
    if (u.gf > u.ga){ row.w++; row.pts += 3; } else if (u.gf < u.ga){ row.l++; } else { row.d++; row.pts++; }
    t[u.clubId] = row;
  });
  return t;
}
function computeTableArray(tableRaw, clubs){
  return Object.values(tableRaw).map(r => ({ ...r, gd:r.gf-r.ga, club: clubs.find(c=>c.id===r.id) }))
    .sort((a,b)=> b.pts-a.pts || b.gd-a.gd || b.gf-a.gf);
}
function ovrLabel(o){
  if (o>=86) return "World class";
  if (o>=81) return "Very good";
  if (o>=76) return "Strong";
  if (o>=71) return "Good";
  if (o>=66) return "Average";
  return "Weak";
}
function fmtM(v){ return `£${v}m`; }
function ord(n){ return n===1?"st":n===2?"nd":n===3?"rd":"th"; }
function autoLineup(formationSlots, players){
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
  return lineup;
}
function getMatchPlayers(s){
  const myClub = s.clubs.find(c=>c.id===s.myClubId);
  const ids = Object.values(s.lineup).filter(Boolean);
  const chosen = myClub.players.filter(p=>ids.includes(p.id));
  return chosen.length >= 7 ? chosen : topXI(myClub.players);
}
function simulateRound(s, round, gw){
  const lineupPlayers = getMatchPlayers(s);
  let userResult = null;
  const updates = [];
  round.forEach(([home, away]) => {
    const homeClub = s.clubs.find(c=>c.id===home), awayClub = s.clubs.find(c=>c.id===away);
    const homePlayers = home===s.myClubId ? lineupPlayers : topXI(homeClub.players);
    const awayPlayers = away===s.myClubId ? lineupPlayers : topXI(awayClub.players);
    const homeTactics = home===s.myClubId ? myTactics(s) : aiTactics(homeClub);
    const awayTactics = away===s.myClubId ? myTactics(s) : aiTactics(awayClub);
    const { goalsA, goalsB } = simMatchSmart(homePlayers, awayPlayers, true, homeTactics, awayTactics);
    updates.push({ clubId:home, gf:goalsA, ga:goalsB });
    updates.push({ clubId:away, gf:goalsB, ga:goalsA });
    if (home===s.myClubId || away===s.myClubId){
      const isHome = home===s.myClubId;
      const opponent = s.clubs.find(c=>c.id===(isHome?away:home));
      const myGoals = isHome?goalsA:goalsB, oppGoals = isHome?goalsB:goalsA;
      const scorers = Array.from({length:myGoals}, () => weightedScorer(lineupPlayers));
      const counts = {}; scorers.forEach(n => counts[n]=(counts[n]||0)+1);
      const scorerStr = Object.entries(counts).map(([n,c]) => c>1?`${n} x${c}`:n).join(", ");
      userResult = { gw, opponent: opponent.name, opponentColor: opponent.color, isHome, myGoals, oppGoals, scorerStr, result: myGoals>oppGoals?"W":myGoals<oppGoals?"L":"D" };
    }
  });
  return { updates, userResult };
}
function ensureFixtures(s){
  if (s.roundsHalf1) return s;
  const ids = s.clubs.map(c=>c.id);
  const r1 = roundRobin(ids);
  const r2 = r1.map(round => round.map(([h,a]) => [a,h]));
  return { ...s, roundsHalf1:r1, roundsHalf2:r2, tableRaw: initTable(ids) };
}
function pickN(pool, n){ return [...pool].sort(()=>Math.random()-0.5).slice(0, n); }
function runKnockout(roundNames, opponents, matchSimFn, scorerPool){
  let record = { w:0, d:0, l:0, gf:0, ga:0 };
  const results = [];
  let outcome = null;
  for (let i=0; i<roundNames.length; i++){
    const opp = opponents[i];
    const homeA = Math.random() < 0.5;
    const { myGoals, oppGoals } = matchSimFn(opp, homeA);
    let wentToPens = false, wonPens = null;
    if (myGoals === oppGoals){ wentToPens = true; wonPens = Math.random() < 0.5; }
    const won = myGoals > oppGoals || (wentToPens && wonPens);
    record.gf += myGoals; record.ga += oppGoals;
    if (myGoals > oppGoals) record.w++; else if (myGoals < oppGoals) record.l++; else record.d++;
    const scorers = Array.from({length:myGoals}, () => weightedScorer(scorerPool));
    const counts = {}; scorers.forEach(n => counts[n]=(counts[n]||0)+1);
    const scorerStr = Object.entries(counts).map(([n,c]) => c>1?`${n} x${c}`:n).join(", ");
    results.push({ round: roundNames[i], opponent: opp.name, opponentColor: opp.color || "#555", myGoals, oppGoals, homeA, wentToPens, wonPens, won, scorerStr });
    if (!won){ outcome = i===roundNames.length-1 ? "RUNNER-UP" : `${roundNames[i].toUpperCase()} EXIT`; break; }
    if (i === roundNames.length-1) outcome = "CHAMPION";
  }
  return { results, record, outcome };
}
function emptyCupStatus(){
  return { alive:null, faced:[], playedRounds:[], results:[], record:{w:0,d:0,l:0,gf:0,ga:0}, outcome:null };
}
// Is a cup fixture due right now, given how many league games have been played this half?
function pendingCupSlot(myClubId, half, roundIndex, cupStatus, league){
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
function simulateCupMatch(s, comp, round){
  const cs = s.cupStatus[comp];
  const pool = [...s.clubs.filter(c=>c.id!==s.myClubId), ...(s.league==="PL" ? s.championshipClubs : [])];
  const avail = pool.filter(c=>!cs.faced.includes(c.id));
  const opp = (avail.length ? avail : pool)[Math.floor(Math.random()*(avail.length ? avail.length : pool.length))];
  const lineupPlayers = getMatchPlayers(s);
  const oppRankedPlayers = [...opp.players].sort((a,b)=>b.ovr-a.ovr);
  const oppPlayersRaw = comp==="carabao" ? oppRankedPlayers.slice(3,14) : topXI(opp.players);
  const oppPlayers = oppPlayersRaw.length ? oppPlayersRaw : topXI(opp.players);
  const oppTactics = aiTactics(opp);
  const myTac = myTactics(s);
  const homeA = Math.random() < 0.5;
  const { goalsA, goalsB } = simMatchSmart(
    homeA?lineupPlayers:oppPlayers, homeA?oppPlayers:lineupPlayers, true,
    homeA?myTac:oppTactics, homeA?oppTactics:myTac
  );
  const myGoals = homeA?goalsA:goalsB, oppGoals = homeA?goalsB:goalsA;
  let wentToPens = false, wonPens = null;
  if (myGoals === oppGoals){ wentToPens = true; wonPens = Math.random() < 0.5; }
  const won = myGoals > oppGoals || (wentToPens && wonPens);
  const scorers = Array.from({length:myGoals}, () => weightedScorer(lineupPlayers));
  const counts = {}; scorers.forEach(n => counts[n]=(counts[n]||0)+1);
  const scorerStr = Object.entries(counts).map(([n,c]) => c>1?`${n} x${c}`:n).join(", ");
  const matchResult = { comp, round, opponent:opp.name, opponentColor:opp.color, homeA, myGoals, oppGoals, wentToPens, wonPens, won, scorerStr };
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
function uclZoneLabel(rank){ return rank<=8 ? "Ro16" : rank<=24 ? "Playoff" : "Out"; }
function uclZoneBg(rank, isMe){
  if (isMe) return "#1c2b1c";
  if (rank<=8) return "#132513";
  if (rank<=24) return "#1c1a12";
  return "#241414";
}
function simulateUclMatch(s, homeClub, awayClub){
  const lineupPlayers = getMatchPlayers(s);
  const homePlayers = homeClub.id===s.myClubId ? lineupPlayers : topXI(homeClub.players);
  const awayPlayers = awayClub.id===s.myClubId ? lineupPlayers : topXI(awayClub.players);
  const homeTactics = homeClub.id===s.myClubId ? myTactics(s) : aiTactics(homeClub);
  const awayTactics = awayClub.id===s.myClubId ? myTactics(s) : aiTactics(awayClub);
  return simMatchSmart(homePlayers, awayPlayers, true, homeTactics, awayTactics);
}
function simulateUclRound(s, uclClubs, round){
  const updates = [];
  let userResult = null;
  round.forEach(([home, away]) => {
    const homeClub = uclClubs.find(c=>c.id===home), awayClub = uclClubs.find(c=>c.id===away);
    const { goalsA, goalsB } = simulateUclMatch(s, homeClub, awayClub);
    updates.push({ clubId:home, gf:goalsA, ga:goalsB });
    updates.push({ clubId:away, gf:goalsB, ga:goalsA });
    if (home===s.myClubId || away===s.myClubId){
      const isHome = home===s.myClubId;
      const opponent = isHome ? awayClub : homeClub;
      const myGoals = isHome?goalsA:goalsB, oppGoals = isHome?goalsB:goalsA;
      const lineupPlayers = getMatchPlayers(s);
      const scorers = Array.from({length:myGoals}, () => weightedScorer(lineupPlayers));
      const counts = {}; scorers.forEach(n => counts[n]=(counts[n]||0)+1);
      const scorerStr = Object.entries(counts).map(([n,c]) => c>1?`${n} x${c}`:n).join(", ");
      userResult = { stage:"League Phase", opponent:opponent.name, opponentColor:opponent.color, opponentId:opponent.id,
        isHome, myGoals, oppGoals, scorerStr, result: myGoals>oppGoals?"W":myGoals<oppGoals?"L":"D" };
    }
  });
  return { updates, userResult };
}
function simulateUclSingleMatch(s, opponent, stageLabel){
  const lineupPlayers = getMatchPlayers(s);
  const isHome = Math.random() < 0.5;
  const oppPlayers = topXI(opponent.players);
  const oppTactics = aiTactics(opponent);
  const myTac = myTactics(s);
  const { goalsA, goalsB } = simMatchSmart(
    isHome?lineupPlayers:oppPlayers, isHome?oppPlayers:lineupPlayers, true,
    isHome?myTac:oppTactics, isHome?oppTactics:myTac
  );
  const myGoals = isHome?goalsA:goalsB, oppGoals = isHome?goalsB:goalsA;
  let wentToPens = false, wonPens = null;
  if (myGoals === oppGoals){ wentToPens = true; wonPens = Math.random() < 0.5; }
  const won = myGoals > oppGoals || (wentToPens && wonPens);
  const scorers = Array.from({length:myGoals}, () => weightedScorer(lineupPlayers));
  const counts = {}; scorers.forEach(n => counts[n]=(counts[n]||0)+1);
  const scorerStr = Object.entries(counts).map(([n,c]) => c>1?`${n} x${c}`:n).join(", ");
  return { stage:stageLabel, opponent:opponent.name, opponentColor:opponent.color, opponentId:opponent.id,
    isHome, myGoals, oppGoals, scorerStr, wentToPens, wonPens, won, result: myGoals>oppGoals?"W":myGoals<oppGoals?"L":"D" };
}
function pickKnockoutOpponent(u, myClubId){
  const faced = u.knockoutFaced || [];
  const pool = u.clubs.filter(c => c.id!==myClubId && !faced.includes(c.id));
  const list = pool.length ? pool : u.clubs.filter(c=>c.id!==myClubId);
  return list[Math.floor(Math.random()*list.length)];
}

// Builds a minute-by-minute event script for the live match ticker. The final score is already decided
// (by simMatchSmart) — this just dramatizes how it plausibly happened, so the score never contradicts events.
const CHANCE_TEXTS = ["shoots just wide!", "denied by a brilliant save!", "heads it over the bar!", "strikes the post!", "forces a smart stop!", "can't quite connect with the cross!"];
function buildMatchTimeline(myName, myPlayers, oppName, oppPlayers, myGoals, oppGoals){
  const events = [];
  const usedMinutes = new Set();
  const pickMinute = () => { let m; do { m = 1 + Math.floor(Math.random()*90); } while (usedMinutes.has(m)); usedMinutes.add(m); return m; };
  for (let i=0;i<myGoals;i++) events.push({ minute:pickMinute(), type:"goal", teamName:myName, text:`${weightedScorer(myPlayers)} scores!` });
  for (let i=0;i<oppGoals;i++) events.push({ minute:pickMinute(), type:"goal", teamName:oppName, text:`${weightedScorer(oppPlayers)} scores!` });
  const cardCount = Math.floor(Math.random()*4);
  for (let i=0;i<cardCount;i++){
    const mine = Math.random()<0.5;
    const pool = mine?myPlayers:oppPlayers;
    const player = pool[Math.floor(Math.random()*pool.length)];
    events.push({ minute:pickMinute(), type:"yellow", teamName:mine?myName:oppName, text:`Yellow card — ${player.name}` });
  }
  if (Math.random() < 0.12){
    const mine = Math.random()<0.5;
    const pool = mine?myPlayers:oppPlayers;
    const player = pool[Math.floor(Math.random()*pool.length)];
    events.push({ minute:pickMinute(), type:"red", teamName:mine?myName:oppName, text:`RED CARD! ${player.name} is sent off` });
  }
  const chanceCount = 2 + Math.floor(Math.random()*3);
  for (let i=0;i<chanceCount;i++){
    const mine = Math.random()<0.5;
    const pool = mine?myPlayers:oppPlayers;
    const player = pool[Math.floor(Math.random()*pool.length)];
    events.push({ minute:pickMinute(), type:"chance", teamName:mine?myName:oppName, text:`${player.name} ${CHANCE_TEXTS[Math.floor(Math.random()*CHANCE_TEXTS.length)]}` });
  }
  events.sort((a,b) => a.minute-b.minute);
  return events;
}
function buildLiveMatchContext(s, userResult, oppClub){
  const myClubObj = s.clubs.find(c=>c.id===s.myClubId);
  const lineupPlayers = getMatchPlayers(s);
  const oppPlayers = topXI(oppClub.players);
  const homeName = userResult.isHome ? myClubObj.name : oppClub.name;
  const awayName = userResult.isHome ? oppClub.name : myClubObj.name;
  const timeline = buildMatchTimeline(myClubObj.name, lineupPlayers, oppClub.name, oppPlayers, userResult.myGoals, userResult.oppGoals);
  return { timeline, homeName, awayName };
}

function freshState(){
  const plClubs = buildClubs();
  const laligaClubs = buildLaLigaClubs();
  const serieaClubs = buildSerieAClubs();
  const bundesligaClubs = buildBundesligaClubs();
  const ligue1Clubs = buildLigue1Clubs();
  return {
    stage: "league-select", league: null, clubs: plClubs,
    plClubs, laligaClubs, serieaClubs, bundesligaClubs, ligue1Clubs, championshipClubs: buildChampionshipClubs(),
    myClubId: null, simMode: null,
    formation: "4-3-3", lineup: {}, budget: 0, tacticalStyle: "balanced", defensiveLine: 50, offsideTrap: false,
    half: 1, roundIndex: 0, roundsHalf1: null, roundsHalf2: null, tableRaw: null, lastResult: null,
    results1: [], results2: [], table1: null, tableFinal: null,
    cupStatus: { fa: emptyCupStatus(), carabao: emptyCupStatus(), copa: emptyCupStatus() }, lastCupResult: null,
    cups: { ucl: null }, ucl: null,
  };
}

/* ============================== APP ============================== */
export default function App(){
  const [state, setState] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [cupsOpen, setCupsOpen] = useState(false);
  const [tacticsOpen, setTacticsOpen] = useState(false);
  const [marketFilter, setMarketFilter] = useState({ q:"", pos:"ALL", sort:"value_desc" });
  const [toast, setToast] = useState("");
  const [dragPos, setDragPos] = useState(null);
  const [hoverSlot, setHoverSlot] = useState(null);
  const dragMeta = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        if (res && res.value) setState({ ...freshState(), ...JSON.parse(res.value) });
        else setState(freshState());
      } catch { setState(freshState()); }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded || !state) return;
    (async () => { try { await window.storage.set(STORAGE_KEY, JSON.stringify(state)); } catch {} })();
  }, [state, loaded]);

  function flashToast(msg){ setToast(msg); setTimeout(()=>setToast(""), 2000); }

  function startDrag(e, player, meta){
    e.preventDefault();
    dragMeta.current = { player, ...meta };
    setDragPos({ x: e.clientX, y: e.clientY });
  }
  useEffect(() => {
    if (!dragPos) return;
    function move(e){
      setDragPos({ x: e.clientX, y: e.clientY });
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const slotEl = el && el.closest("[data-slot-index]");
      setHoverSlot(slotEl ? parseInt(slotEl.getAttribute("data-slot-index"), 10) : null);
    }
    function up(e){
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const slotEl = el && el.closest("[data-slot-index]");
      const benchEl = el && el.closest("[data-bench]");
      const meta = dragMeta.current;
      dragMeta.current = null;
      setDragPos(null);
      setHoverSlot(null);
      if (!meta) return;
      if (slotEl){
        const idx = parseInt(slotEl.getAttribute("data-slot-index"), 10);
        const slotRole = slotEl.getAttribute("data-slot-role");
        if (!slotAccepts(slotRole, meta.player)){ flashToast("Can't play there"); return; }
        movePlayerToSlot(idx, meta.player.id, meta.source, meta.slotIndex);
      } else if (benchEl && meta.source === "slot"){
        setLineupSlot(meta.slotIndex, undefined);
      }
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [dragPos ? 1 : 0]);

  if (!loaded || !state) {
    return <div style={{background:"#0a0e0a",minHeight:400,display:"flex",alignItems:"center",justifyContent:"center",color:"#8a8"}}>Loading squad data…</div>;
  }

  const myClub = state.clubs.find(c => c.id === state.myClubId);

  function updateClub(clubId, fn){ setState(s => ({ ...s, clubs: s.clubs.map(c => c.id===clubId ? fn(c) : c) })); }
  function updateAnyClub(clubId, fn){
    setState(s => {
      if (s.clubs.some(c=>c.id===clubId)) return { ...s, clubs: s.clubs.map(c => c.id===clubId ? fn(c) : c) };
      return { ...s, championshipClubs: s.championshipClubs.map(c => c.id===clubId ? fn(c) : c) };
    });
  }

  function restart(){
    if (!confirm("Restart the whole save? This wipes your squad, transfers and results.")) return;
    setState(freshState());
  }

  function pickLeague(lg){
    const map = { PL: s=>s.plClubs, LALIGA: s=>s.laligaClubs, SERIEA: s=>s.serieaClubs, BUNDES: s=>s.bundesligaClubs, LIGUE1: s=>s.ligue1Clubs };
    setState(s => ({ ...s, league: lg, clubs: (map[lg]||map.PL)(s), stage: "select" }));
  }
  function selectClub(clubId){
    const club = state.clubs.find(c=>c.id===clubId);
    setState(s => ({ ...s, myClubId: clubId, budget: club.budget, lineup: autoLineup(FORMATIONS[s.formation], club.players), stage: "mode" }));
  }
  function pickMode(mode){ setState(s => ({ ...s, simMode: mode, stage: "squad" })); }

  function setLineupSlot(slotIdx, playerId){
    setState(s => {
      const lineup = { ...s.lineup };
      Object.keys(lineup).forEach(k => { if (lineup[k]===playerId) delete lineup[k]; });
      if (playerId) lineup[slotIdx] = playerId; else delete lineup[slotIdx];
      return { ...s, lineup };
    });
  }
  function movePlayerToSlot(targetIdx, playerId, source, sourceSlotIdx){
    setState(s => {
      const lineup = { ...s.lineup };
      const displaced = lineup[targetIdx];
      Object.keys(lineup).forEach(k => { if (lineup[k]===playerId) delete lineup[k]; });
      lineup[targetIdx] = playerId;
      if (source==="slot" && sourceSlotIdx!=null && displaced && displaced!==playerId) lineup[sourceSlotIdx] = displaced;
      return { ...s, lineup };
    });
  }
  function setFormation(f){
    setState(s => { const club = s.clubs.find(c=>c.id===s.myClubId); return { ...s, formation:f, lineup: autoLineup(FORMATIONS[f], club.players) }; });
  }
  function setTacticalStyle(key){ setState(s => ({ ...s, tacticalStyle: key })); }
  function setDefensiveLine(val){ setState(s => ({ ...s, defensiveLine: val })); }
  function setOffsideTrap(val){ setState(s => ({ ...s, offsideTrap: val })); }
  function editNumber(playerId, num){
    updateClub(state.myClubId, c => ({ ...c, players: c.players.map(p => p.id===playerId ? {...p, number:num} : p) }));
  }
  function sellPlayer(playerId){
    const p = myClub.players.find(pl=>pl.id===playerId);
    if (!p) return;
    if (!confirm(`Sell ${p.name} for ${fmtM(Math.round(p.value*0.9))}?`)) return;
    updateClub(state.myClubId, c => ({ ...c, players: c.players.filter(pl=>pl.id!==playerId) }));
    setState(s => ({ ...s, budget: s.budget + Math.round(p.value*0.9),
      lineup: Object.fromEntries(Object.entries(s.lineup).filter(([,v])=>v!==playerId)) }));
    flashToast(`Sold ${p.name}`);
  }
  function loanOut(playerId){
    const p = myClub.players.find(pl=>pl.id===playerId);
    if (!p) return;
    if (!confirm(`Loan out ${p.name} for the season?`)) return;
    updateClub(state.myClubId, c => ({ ...c, players: c.players.filter(pl=>pl.id!==playerId) }));
    setState(s => ({ ...s, lineup: Object.fromEntries(Object.entries(s.lineup).filter(([,v])=>v!==playerId)) }));
    flashToast(`${p.name} out on loan`);
  }
  function buyPlayer(seller, player){
    if (state.budget < player.value){ flashToast("Not enough budget"); return; }
    updateAnyClub(seller.id, c => ({ ...c, players: c.players.filter(p=>p.id!==player.id) }));
    const nextNum = (() => { const used = new Set(myClub.players.map(p=>p.number)); for(let n=1;n<100;n++) if(!used.has(n)) return n; return 99; })();
    updateClub(state.myClubId, c => ({ ...c, players: [...c.players, { ...player, club: state.myClubId, number: nextNum, loan:false }] }));
    setState(s => ({ ...s, budget: s.budget - player.value }));
    flashToast(`Signed ${player.name} for ${fmtM(player.value)}`);
  }
  function loanIn(seller, player){
    if (!confirm(`Take ${player.name} on loan (free) from ${seller.name}?`)) return;
    updateAnyClub(seller.id, c => ({ ...c, players: c.players.filter(p=>p.id!==player.id) }));
    const nextNum = (() => { const used = new Set(myClub.players.map(p=>p.number)); for(let n=1;n<100;n++) if(!used.has(n)) return n; return 99; })();
    updateClub(state.myClubId, c => ({ ...c, players: [...c.players, { ...player, club: state.myClubId, number: nextNum, loan:true }] }));
    flashToast(`${player.name} joins on loan`);
  }

  // Instant half-season sim: plays all 19 league rounds AND resolves any cup fixtures that fall due
  // along the way, using the same fixed lineup for every match in the half.
  function runHalf(half){
    setState(s => {
      const cur = ensureFixtures(s);
      const rounds = half===1 ? cur.roundsHalf1 : cur.roundsHalf2;
      let tableRaw = cur.tableRaw;
      let cupStatus = { ...cur.cupStatus };
      const results = [];
      rounds.forEach((round, idx) => {
        const slot = pendingCupSlot(cur.myClubId, half, idx, cupStatus, cur.league);
        if (slot){
          const { updatedCs } = simulateCupMatch({ ...cur, cupStatus }, slot.comp, slot.round);
          cupStatus = { ...cupStatus, [slot.comp]: updatedCs };
        }
        const gw = (half===1?0:19) + idx + 1;
        const { updates, userResult } = simulateRound(cur, round, gw);
        tableRaw = applyUpdates(tableRaw, updates);
        if (userResult) results.push(userResult);
      });
      if (half===2){
        const slot = pendingCupSlot(cur.myClubId, half, 19, cupStatus, cur.league);
        if (slot){ const { updatedCs } = simulateCupMatch({ ...cur, cupStatus }, slot.comp, slot.round); cupStatus = { ...cupStatus, [slot.comp]: updatedCs }; }
      }
      const tableArr = computeTableArray(tableRaw, cur.clubs);
      return { ...cur, tableRaw, cupStatus, stage: half===1?"half-results":"full-results",
        results1: half===1?results:cur.results1, results2: half===2?results:cur.results2,
        table1: half===1?tableArr:cur.table1, tableFinal: half===2?tableArr:cur.tableFinal };
    });
  }
  function beginMatchday(half){
    setState(s => { const cur = ensureFixtures(s); return { ...cur, half, roundIndex: 0, stage: "matchday-prep" }; });
  }
  function playRound(){
    setState(s => {
      const rounds = s.half===1 ? s.roundsHalf1 : s.roundsHalf2;
      const round = rounds[s.roundIndex];
      const gw = (s.half===1?0:19) + s.roundIndex + 1;
      const { updates, userResult } = simulateRound(s, round, gw);
      const tableRaw = applyUpdates(s.tableRaw, updates);
      return { ...s, tableRaw, lastResult: userResult, stage: "matchday-result",
        results1: s.half===1 ? [...s.results1, userResult] : s.results1,
        results2: s.half===2 ? [...s.results2, userResult] : s.results2 };
    });
  }
  function playCupMatch(comp, round){
    setState(s => {
      const { updatedCs, matchResult } = simulateCupMatch(s, comp, round);
      return { ...s, cupStatus: { ...s.cupStatus, [comp]: updatedCs }, lastCupResult: matchResult, stage: "cup-result" };
    });
  }
  function continueAfterCup(){ setState(s => ({ ...s, stage: "matchday-prep" })); }
  function nextMatch(){
    setState(s => {
      if (s.roundIndex === 18){
        const tableArr = computeTableArray(s.tableRaw, s.clubs);
        return { ...s, stage: s.half===1?"half-results":"full-results",
          table1: s.half===1?tableArr:s.table1, tableFinal: s.half===2?tableArr:s.tableFinal };
      }
      return { ...s, roundIndex: s.roundIndex+1, stage: "matchday-prep" };
    });
  }
  function goToMidWindow(){ setState(s => ({ ...s, stage: "squad2" })); }
  function finalizeSeason(){ setState(s => ({ ...s, stage: "summary" })); }

  // Champions League: real 36-team league-phase format, drawing opponents (with real squads) from
  // whichever two leagues you're NOT currently playing in. Interactive, one match at a time.
  function buildUclPool(s){
    const others = [];
    if (s.league !== "PL") others.push(...s.plClubs);
    if (s.league !== "LALIGA") others.push(...s.laligaClubs);
    if (s.league !== "SERIEA") others.push(...s.serieaClubs);
    if (s.league !== "BUNDES") others.push(...s.bundesligaClubs);
    if (s.league !== "LIGUE1") others.push(...s.ligue1Clubs);
    return others;
  }
  function enterUcl(){
    setState(s => {
      if (s.ucl && s.ucl.stage !== "final") return { ...s, stage: "ucl" };
      const pool = buildUclPool(s);
      const chosen = pickN(pool, Math.min(35, pool.length));
      const me = s.clubs.find(c=>c.id===s.myClubId);
      const clubs = [me, ...chosen];
      const ids = clubs.map(c=>c.id);
      const rounds = roundRobin(ids).slice(0, 8);
      return { ...s, stage: "ucl", ucl: {
        stage: "hub", clubs, rounds, roundIndex: 0, tableRaw: initTable(ids), lastMatch: null,
        campaignResults: [], campaignRecord: { w:0,d:0,l:0,gf:0,ga:0 },
        phaseTable: null, qualification: null, playoffOpponentId: null,
        knockoutRounds: [], knockoutRoundIndex: 0, knockoutFaced: [], currentKnockoutOpponentId: null, outcome: null,
      }};
    });
  }
  function uclGoToPrep(){ setState(s => ({ ...s, ucl: { ...s.ucl, stage: "match-prep" } })); }
  function uclPlayLeagueMatch(){
    setState(s => {
      const u = s.ucl;
      const round = u.rounds[u.roundIndex];
      const { updates, userResult } = simulateUclRound(s, u.clubs, round);
      const tableRaw = applyUpdates(u.tableRaw, updates);
      const record = { ...u.campaignRecord };
      record.gf += userResult.myGoals; record.ga += userResult.oppGoals;
      if (userResult.myGoals>userResult.oppGoals) record.w++; else if (userResult.myGoals<userResult.oppGoals) record.l++; else record.d++;
      const oppClub = u.clubs.find(c=>c.id===userResult.opponentId);
      const liveContext = buildLiveMatchContext(s, userResult, oppClub);
      return { ...s, ucl: { ...u, tableRaw, lastMatch: userResult, liveContext, stage: "match-live",
        campaignResults: [...u.campaignResults, userResult], campaignRecord: record } };
    });
  }
  function uclFinishLiveMatch(){
    setState(s => {
      const map = { "match-live":"match-result", "playoff-live":"playoff-result", "knockout-live":"knockout-result" };
      return { ...s, ucl: { ...s.ucl, stage: map[s.ucl.stage] || s.ucl.stage } };
    });
  }
  function uclContinueAfterMatch(){
    setState(s => {
      const u = s.ucl;
      if (u.roundIndex === 7){
        const phaseTable = computeTableArray(u.tableRaw, u.clubs);
        const rank = phaseTable.findIndex(r=>r.id===s.myClubId)+1;
        const qualification = rank<=8 ? "top8" : rank<=24 ? "playoff" : "eliminated";
        return { ...s, ucl: { ...u, phaseTable, qualification, stage: "phase-summary" } };
      }
      return { ...s, ucl: { ...u, roundIndex: u.roundIndex+1, stage: "hub" } };
    });
  }
  function uclContinueAfterPhaseSummary(){
    setState(s => {
      const u = s.ucl;
      if (u.qualification === "eliminated"){
        const outcome = "LEAGUE PHASE EXIT";
        return { ...s, ucl: { ...u, outcome, stage:"final" }, cups: { ...s.cups, ucl: { results:u.campaignResults, record:u.campaignRecord, outcome } } };
      }
      if (u.qualification === "playoff"){
        const zone = u.phaseTable.slice(8,24).filter(r=>r.id!==s.myClubId);
        const oppRow = zone[Math.floor(Math.random()*zone.length)];
        return { ...s, ucl: { ...u, playoffOpponentId: oppRow.club.id, stage: "playoff-prep" } };
      }
      const knockoutRounds = ["Round of 16","Quarter-Final","Semi-Final","Final"];
      const opp = pickKnockoutOpponent({ ...u, knockoutFaced: [] }, s.myClubId);
      return { ...s, ucl: { ...u, knockoutRounds, knockoutRoundIndex:0, knockoutFaced:[], currentKnockoutOpponentId: opp.id, stage: "knockout-prep" } };
    });
  }
  function uclPlayPlayoff(){
    setState(s => {
      const u = s.ucl;
      const opp = u.clubs.find(c=>c.id===u.playoffOpponentId);
      const result = simulateUclSingleMatch(s, opp, "Playoff");
      const record = { ...u.campaignRecord };
      record.gf+=result.myGoals; record.ga+=result.oppGoals;
      if (result.myGoals>result.oppGoals) record.w++; else if (result.myGoals<result.oppGoals) record.l++; else record.d++;
      const liveContext = buildLiveMatchContext(s, result, opp);
      return { ...s, ucl: { ...u, lastMatch: result, liveContext, stage: "playoff-live", campaignResults:[...u.campaignResults,result], campaignRecord:record } };
    });
  }
  function uclContinueAfterPlayoff(){
    setState(s => {
      const u = s.ucl;
      if (!u.lastMatch.won){
        const outcome = "PLAYOFF ROUND EXIT";
        return { ...s, ucl: { ...u, outcome, stage:"final" }, cups: { ...s.cups, ucl: { results:u.campaignResults, record:u.campaignRecord, outcome } } };
      }
      const knockoutRounds = ["Round of 16","Quarter-Final","Semi-Final","Final"];
      const opp = pickKnockoutOpponent({ ...u, knockoutFaced: [u.playoffOpponentId] }, s.myClubId);
      return { ...s, ucl: { ...u, knockoutRounds, knockoutRoundIndex:0, knockoutFaced:[u.playoffOpponentId], currentKnockoutOpponentId: opp.id, stage: "knockout-prep" } };
    });
  }
  function uclPlayKnockout(){
    setState(s => {
      const u = s.ucl;
      const opp = u.clubs.find(c=>c.id===u.currentKnockoutOpponentId);
      const roundName = u.knockoutRounds[u.knockoutRoundIndex];
      const result = simulateUclSingleMatch(s, opp, roundName);
      const record = { ...u.campaignRecord };
      record.gf+=result.myGoals; record.ga+=result.oppGoals;
      if (result.myGoals>result.oppGoals) record.w++; else if (result.myGoals<result.oppGoals) record.l++; else record.d++;
      const liveContext = buildLiveMatchContext(s, result, opp);
      return { ...s, ucl: { ...u, lastMatch: result, liveContext, stage: "knockout-live",
        campaignResults:[...u.campaignResults,result], campaignRecord:record, knockoutFaced:[...(u.knockoutFaced||[]), opp.id] } };
    });
  }
  function uclContinueAfterKnockout(){
    setState(s => {
      const u = s.ucl;
      const isLastRound = u.knockoutRoundIndex === u.knockoutRounds.length-1;
      if (!u.lastMatch.won){
        const outcome = u.knockoutRounds[u.knockoutRoundIndex]==="Final" ? "RUNNER-UP" : `${u.knockoutRounds[u.knockoutRoundIndex].toUpperCase()} EXIT`;
        return { ...s, ucl: { ...u, outcome, stage:"final" }, cups: { ...s.cups, ucl: { results:u.campaignResults, record:u.campaignRecord, outcome } } };
      }
      if (isLastRound){
        const outcome = "CHAMPION";
        return { ...s, ucl: { ...u, outcome, stage:"final" }, cups: { ...s.cups, ucl: { results:u.campaignResults, record:u.campaignRecord, outcome } } };
      }
      const nextIdx = u.knockoutRoundIndex+1;
      const opp = pickKnockoutOpponent(u, s.myClubId);
      return { ...s, ucl: { ...u, knockoutRoundIndex: nextIdx, currentKnockoutOpponentId: opp.id, stage: "knockout-prep" } };
    });
  }
  function uclBackToSeason(){ setState(s => ({ ...s, stage: myClub ? (s.tableFinal ? "summary" : "squad") : "select" })); }
  const uclActions = { enterUcl, uclGoToPrep, uclPlayLeagueMatch, uclFinishLiveMatch, uclContinueAfterMatch, uclContinueAfterPhaseSummary,
    uclPlayPlayoff, uclContinueAfterPlayoff, uclPlayKnockout, uclContinueAfterKnockout, uclBackToSeason };

  const squadCommonProps = { state, myClub, onSetFormation: setFormation, onDragStart: startDrag, onEditNumber: editNumber, onSell: sellPlayer, onLoanOut: loanOut, onOpenMarket: ()=>setMarketOpen(true), onOpenCups: ()=>setCupsOpen(true), onOpenTactics: ()=>setTacticsOpen(true), draggingPlayer: dragMeta.current?.player || null, hoverSlot };

  let stageEl = null;
  if (state.stage === "league-select") stageEl = <LeagueSelect onPick={pickLeague} />;
  else if (state.stage === "select") stageEl = <TeamSelect clubs={state.clubs} league={state.league} onSelect={selectClub} />;
  else if (state.stage === "mode") stageEl = <ModeSelect onPick={pickMode} />;
  else if (state.stage === "squad" && myClub) stageEl = <SquadScreen {...squadCommonProps}
    onSimulate={()=> state.simMode==="half" ? runHalf(1) : beginMatchday(1)}
    simulateLabel={state.simMode==="half" ? "Simulate First Half (GW1-19)" : "Start Season"} />;
  else if (state.stage === "squad2" && myClub) stageEl = <SquadScreen {...squadCommonProps}
    onSimulate={()=> state.simMode==="half" ? runHalf(2) : beginMatchday(2)}
    simulateLabel={state.simMode==="half" ? "Simulate Second Half (GW20-38)" : "Continue Season"} />;
  else if (state.stage === "matchday-prep" && myClub){
    const cupSlot = pendingCupSlot(state.myClubId, state.half, state.roundIndex, state.cupStatus, state.league);
    if (cupSlot){
      const compLabel = cupSlot.comp === "fa" ? "FA Cup" : "Carabao Cup";
      stageEl = (
        <div>
          <div style={{ background:"#1c1a12", border:"1px solid #6b5a2d", borderRadius:10, padding:"10px 16px", marginBottom:14, textAlign:"center" }}>
            <div style={{ fontSize:12, color:"#e8d09a" }}>🏆 {compLabel} — {cupSlot.round}</div>
            <div style={{ fontSize:11, color:"#9ab89a", marginTop:2 }}>Opponent drawn at kickoff — set your lineup and go.</div>
          </div>
          <SquadScreen {...squadCommonProps} onSimulate={()=>playCupMatch(cupSlot.comp, cupSlot.round)} simulateLabel={`Play ${compLabel} — ${cupSlot.round}`} />
        </div>
      );
    } else {
      const rounds = state.half===1 ? state.roundsHalf1 : state.roundsHalf2;
      const round = rounds[state.roundIndex];
      const match = round.find(([h,a]) => h===state.myClubId || a===state.myClubId);
      const isHome = match[0] === state.myClubId;
      const opponent = state.clubs.find(c => c.id === (isHome ? match[1] : match[0]));
      const oppForm = opponent.preferredFormation || "4-4-2";
      const oppStyle = inferStyle(opponent.players, oppForm);
      const myStyle = state.tacticalStyle || "balanced";
      const hints = tacticalHints(state.formation, oppForm);
      const sBonus = styleMatchupBonus(myStyle, oppStyle), sBonusAgainst = styleMatchupBonus(oppStyle, myStyle);
      if (sBonus >= 0.04) hints.push({ text:`${STYLES[myStyle].name} exploits their ${STYLES[oppStyle].name} ✓`, color:"#7fd88f" });
      else if (sBonusAgainst >= 0.04) hints.push({ text:`Vulnerable to their ${STYLES[oppStyle].name} ⚠`, color:"#e8b84b" });
      stageEl = (
        <div>
          <div style={{ background:"#16321c", border:"1px solid #2d6b3f", borderRadius:10, padding:"10px 16px", marginBottom:14, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:6 }}>
            <div style={{ fontSize:12, color:"#9ab89a" }}>Matchday {(state.half===1?0:19) + state.roundIndex + 1} / 38</div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontWeight:700, fontSize:14 }}>{isHome ? `${myClub.name} (${state.formation}) vs ${opponent.name} (${oppForm})` : `${opponent.name} (${oppForm}) vs ${myClub.name} (${state.formation})`}</div>
              <div style={{ fontSize:10, color:"#9ab8e8", marginTop:1 }}>You: {STYLES[myStyle].name} · Them: {STYLES[oppStyle].name}</div>
              <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginTop:3 }}>
                {hints.map((h,i)=><span key={i} style={{ fontSize:10, color:h.color, fontWeight:600 }}>{h.text}</span>)}
              </div>
            </div>
            <div style={{ fontSize:11, color:"#9ab89a", fontWeight:700 }}>{isHome ? "HOME" : "AWAY"}</div>
          </div>
          <SquadScreen {...squadCommonProps} onSimulate={playRound} simulateLabel={`Play Match vs ${opponent.name}`} />
        </div>
      );
    }
  }
  else if (state.stage === "cup-result"){
    const r = state.lastCupResult;
    const compLabel = r.comp === "fa" ? "FA Cup" : "Carabao Cup";
    stageEl = (
      <div style={{ textAlign:"center", padding:"20px 0" }}>
        <div style={{ fontSize:12, color:"#e8d09a", marginBottom:10 }}>🏆 {compLabel} · {r.round}</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:18, marginBottom:10, flexWrap:"wrap" }}>
          <div style={{ fontWeight:700, fontSize:15 }}>{r.homeA ? myClub.name : r.opponent}</div>
          <div style={{ fontSize:32, fontWeight:800 }}>{r.homeA?r.myGoals:r.oppGoals} - {r.homeA?r.oppGoals:r.myGoals}</div>
          <div style={{ fontWeight:700, fontSize:15 }}>{r.homeA ? r.opponent : myClub.name}</div>
        </div>
        {r.wentToPens && <div style={{ fontSize:12, color:"#e8b84b", marginBottom:6 }}>Decided on penalties — {r.wonPens ? "you won" : "you lost"} the shootout</div>}
        <ResultBadge result={r.won ? "W" : "L"} />
        {r.scorerStr && <div style={{ fontSize:12, color:"#9ab89a", marginTop:10 }}>⚽ {r.scorerStr}</div>}
        <div style={{ marginTop:10, fontSize:13, fontWeight:700, color: r.won ? "#7fd88f" : "#e08a8a" }}>
          {r.won ? (r.round==="Final" ? "🏆 Champions!" : "Through to the next round") : (r.round==="Final" ? "Runners-up" : "Knocked out")}
        </div>
        <div style={{ marginTop:26 }}>
          <button onClick={continueAfterCup} style={primaryBtnStyle}>Back to the League →</button>
        </div>
      </div>
    );
  }
  else if (state.stage === "matchday-result"){
    const isLast = state.roundIndex === 18;
    const r = state.lastResult;
    stageEl = (
      <div style={{ textAlign:"center", padding:"20px 0" }}>
        <div style={{ fontSize:12, color:"#6a8a6a", marginBottom:10 }}>Full Time · GW{r.gw}</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:18, marginBottom:10, flexWrap:"wrap" }}>
          <div style={{ fontWeight:700, fontSize:15 }}>{r.isHome ? myClub.name : r.opponent}</div>
          <div style={{ fontSize:32, fontWeight:800 }}>{r.isHome?r.myGoals:r.oppGoals} - {r.isHome?r.oppGoals:r.myGoals}</div>
          <div style={{ fontWeight:700, fontSize:15 }}>{r.isHome ? r.opponent : myClub.name}</div>
        </div>
        <ResultBadge result={r.result} />
        {r.scorerStr && <div style={{ fontSize:12, color:"#9ab89a", marginTop:10 }}>⚽ {r.scorerStr}</div>}
        <div style={{ marginTop:26 }}>
          <button onClick={nextMatch} style={primaryBtnStyle}>{isLast ? "View Half-Time Table →" : "Next Fixture →"}</button>
        </div>
      </div>
    );
  }
  else if (state.stage === "half-results") stageEl = <ResultsScreen title="First Half of the Season" results={state.results1} table={state.table1} myClubId={state.myClubId} onContinue={goToMidWindow} continueLabel="Go to Transfer Window →" cupStatus={state.cupStatus} />;
  else if (state.stage === "full-results") stageEl = <ResultsScreen title="Final Season Results" results={state.results2} table={state.tableFinal} myClubId={state.myClubId} onContinue={finalizeSeason} continueLabel="Finalise Season →" projectedTable={state.table1} cupStatus={state.cupStatus} />;
  else if (state.stage === "summary") stageEl = <SummaryScreen state={state} myClub={myClub} onRestart={restart} onOpenCups={()=>setCupsOpen(true)} />;
  else if (state.stage === "ucl" && state.ucl) stageEl = <UclPage state={state} myClub={myClub} squadCommonProps={squadCommonProps} actions={uclActions} />;

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", background:"#0a0e0a", minHeight:"100vh", width:"100%", color:"#e8ede8" }}>
      <style>{`
        html, body { margin:0; padding:0; width:100%; min-height:100%; background:#0a0e0a; }
        #root, #app, #__next { width:100%; max-width:none; margin:0; padding:0; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; height:8px; }
        ::-webkit-scrollbar-thumb { background:#2a3a2a; border-radius:4px; }
        select, input, button { font-family: inherit; }
        button { cursor:pointer; }
        .grid-2col { display:grid; grid-template-columns: minmax(300px,420px) 1fr; gap:24px; align-items:start; }
        .ucl-prep-grid { display:grid; grid-template-columns: 1fr 340px; gap:24px; align-items:start; }
        @media (max-width:760px){
          .grid-2col { grid-template-columns: 1fr; }
          .ucl-prep-grid { grid-template-columns: 1fr; }
          .app-pad { padding: 14px 10px 50px !important; }
          .top-actions { width:100%; justify-content:space-between; }
        }
        @keyframes pulseGlow { 0%{box-shadow:0 0 0 0 rgba(127,216,143,0.45);} 70%{box-shadow:0 0 0 10px rgba(127,216,143,0);} 100%{box-shadow:0 0 0 0 rgba(127,216,143,0);} }
        .slot-eligible { animation: pulseGlow 1.1s infinite; }
      `}</style>

      {toast && (
        <div style={{ position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", background:"#1c2b1c", border:"1px solid #3a5a3a", color:"#c8f5c8", padding:"8px 16px", borderRadius:8, fontSize:13, zIndex:999 }}>{toast}</div>
      )}

      {dragPos && dragMeta.current && (
        <div style={{ position:"fixed", left:dragPos.x, top:dragPos.y, transform:"translate(-50%,-55%) rotate(-4deg)", pointerEvents:"none", zIndex:1000 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(13,22,13,0.94)", backdropFilter:"blur(6px)", border:"1px solid rgba(127,216,143,0.4)", borderRadius:12, padding:"7px 14px 7px 7px", boxShadow:"0 14px 30px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05)" }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:GROUP_COLOR[dragMeta.current.player.group], display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#0a0e0a", fontSize:12, flexShrink:0 }}>
              {dragMeta.current.player.number}
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"#f0f5f0", whiteSpace:"nowrap" }}>{dragMeta.current.player.name}</div>
              <div style={{ fontSize:9, color:"#8fae8f" }}>{dragMeta.current.player.role}</div>
            </div>
          </div>
        </div>
      )}

      <div className="app-pad" style={{ maxWidth:"100%", width:"100%", margin:"0 auto", padding:"20px clamp(16px,3vw,60px) 60px" }}>
        <Header myClub={myClub} league={state.league} onRestart={restart} />
        {stageEl}
      </div>

      {marketOpen && myClub && (
        <TransferMarket state={state} myClub={myClub} filter={marketFilter} setFilter={setMarketFilter}
          onClose={()=>setMarketOpen(false)} onBuy={buyPlayer} onLoanIn={loanIn} />
      )}
      {cupsOpen && myClub && (
        <CupsHub state={state} onClose={()=>setCupsOpen(false)} onEnterUcl={()=>{ setCupsOpen(false); enterUcl(); }} />
      )}
      {tacticsOpen && myClub && (
        <TacticsModal state={state} onClose={()=>setTacticsOpen(false)} onSetStyle={setTacticalStyle} onSetLine={setDefensiveLine} onSetTrap={setOffsideTrap} />
      )}
    </div>
  );
}

const primaryBtnStyle = { background:"#2d6b3f", border:"none", color:"#fff", fontWeight:700, fontSize:14, padding:"12px 28px", borderRadius:10 };

/* ============================== SUBCOMPONENTS ============================== */
function Header({ myClub, league, onRestart }){
  const LEAGUE_LABELS = { LALIGA:"LA LIGA MANAGER", SERIEA:"SERIE A MANAGER", BUNDES:"BUNDESLIGA MANAGER", LIGUE1:"LIGUE 1 MANAGER" };
  const label = LEAGUE_LABELS[league] || "PREMIER LEAGUE MANAGER";
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, paddingBottom:14, borderBottom:"1px solid #1c2b1c", flexWrap:"wrap", gap:10 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:34, height:34, borderRadius:8, background: myClub?myClub.color:"#3a5a3a", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:14, color:"#fff", flexShrink:0 }}>
          {myClub ? myClub.name.split(" ").map(w=>w[0]).slice(0,2).join("") : "?"}
        </div>
        <div>
          <div style={{ fontSize:11, letterSpacing:1, color:"#6a8a6a" }}>{label}</div>
          <div style={{ fontSize:16, fontWeight:700 }}>{myClub ? myClub.name : "Choose your club"}</div>
        </div>
      </div>
      <button onClick={onRestart} style={{ display:"flex", alignItems:"center", gap:6, background:"transparent", border:"1px solid #2a3a2a", color:"#9ab89a", padding:"7px 12px", borderRadius:8, fontSize:12 }}>
        <RotateCcw size={13}/> Restart
      </button>
    </div>
  );
}

function LeagueSelect({ onPick }){
  const cardStyle = { background:"#111a11", border:"1px solid #2a3a2a", borderRadius:14, padding:24, width:260, textAlign:"left", color:"#e8ede8" };
  return (
    <div style={{ textAlign:"center", padding:"20px 0 40px" }}>
      <h2 style={{ fontSize:18, marginBottom:16 }}>Choose your league</h2>
      <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
        <button onClick={()=>onPick("PL")} style={cardStyle}>
          <div style={{ fontSize:26, marginBottom:8 }}>🏴󠁧󠁢󠁥󠁮󠁧󠁿</div>
          <div style={{ fontWeight:700, marginBottom:4, fontSize:15 }}>Premier League</div>
          <div style={{ fontSize:12, color:"#9ab89a" }}>England · 20 clubs · FA Cup, Carabao Cup and Champions League all in play.</div>
        </button>
        <button onClick={()=>onPick("LALIGA")} style={cardStyle}>
          <div style={{ fontSize:26, marginBottom:8 }}>🇪🇸</div>
          <div style={{ fontWeight:700, marginBottom:4, fontSize:15 }}>La Liga</div>
          <div style={{ fontSize:12, color:"#9ab89a" }}>Spain · 20 clubs · Copa del Rey and Champions League.</div>
        </button>
        <button onClick={()=>onPick("SERIEA")} style={cardStyle}>
          <div style={{ fontSize:26, marginBottom:8 }}>🇮🇹</div>
          <div style={{ fontWeight:700, marginBottom:4, fontSize:15 }}>Serie A</div>
          <div style={{ fontSize:12, color:"#9ab89a" }}>Italy · 20 clubs · Champions League available. Domestic cups not yet modelled.</div>
        </button>
        <button onClick={()=>onPick("BUNDES")} style={cardStyle}>
          <div style={{ fontSize:26, marginBottom:8 }}>🇩🇪</div>
          <div style={{ fontWeight:700, marginBottom:4, fontSize:15 }}>Bundesliga</div>
          <div style={{ fontSize:12, color:"#9ab89a" }}>Germany · 18 clubs · Champions League available. Domestic cups not yet modelled.</div>
        </button>
        <button onClick={()=>onPick("LIGUE1")} style={cardStyle}>
          <div style={{ fontSize:26, marginBottom:8 }}>🇫🇷</div>
          <div style={{ fontWeight:700, marginBottom:4, fontSize:15 }}>Ligue 1</div>
          <div style={{ fontSize:12, color:"#9ab89a" }}>France · 18 clubs · Champions League available. Domestic cups not yet modelled.</div>
        </button>
      </div>
    </div>
  );
}
function TeamSelect({ clubs, league, onSelect }){
  const LEAGUE_NAMES = { LALIGA:"La Liga", SERIEA:"Serie A", BUNDES:"Bundesliga", LIGUE1:"Ligue 1" };
  const leagueName = LEAGUE_NAMES[league] || "Premier League";
  return (
    <div>
      <p style={{ color:"#9ab89a", fontSize:13, marginBottom:16 }}>
        Pick your club for the 2026/27 {leagueName} season. Real current squads, real transfer values — build your XI, work the market, then simulate.
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12 }}>
        {clubs.map(c => (
          <button key={c.id} onClick={()=>onSelect(c.id)} style={{
            background:"#111a11", border:"1px solid #223322", borderRadius:12, padding:"16px 10px", textAlign:"center",
            display:"flex", flexDirection:"column", alignItems:"center", gap:8
          }}>
            <div style={{ width:44,height:44,borderRadius:10, background:c.color, display:"flex",alignItems:"center",justifyContent:"center", fontWeight:800, color:"#fff", fontSize:15 }}>
              {c.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
            </div>
            <div style={{ fontSize:13, fontWeight:600 }}>{c.name}</div>
            <div style={{ fontSize:11, color:"#6a8a6a" }}>Budget {fmtM(c.budget)} · {c.players.length} players</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ModeSelect({ onPick }){
  const cardStyle = { background:"#111a11", border:"1px solid #2a3a2a", borderRadius:14, padding:20, width:230, textAlign:"left", color:"#e8ede8" };
  return (
    <div style={{ textAlign:"center", padding:"10px 0 30px" }}>
      <h2 style={{ fontSize:17, marginBottom:16 }}>How do you want to play the season?</h2>
      <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
        <button onClick={()=>onPick("match")} style={cardStyle}>
          <div style={{ fontSize:24, marginBottom:8 }}>🎮</div>
          <div style={{ fontWeight:700, marginBottom:4 }}>Match by Match</div>
          <div style={{ fontSize:12, color:"#9ab89a" }}>See each fixture, tweak your XI before kickoff, then simulate one game at a time.</div>
        </button>
        <button onClick={()=>onPick("half")} style={cardStyle}>
          <div style={{ fontSize:24, marginBottom:8 }}>⚡</div>
          <div style={{ fontWeight:700, marginBottom:4 }}>Instant Half-Season</div>
          <div style={{ fontSize:12, color:"#9ab89a" }}>Lock your XI once, simulate all 19 games in one go.</div>
        </button>
      </div>
    </div>
  );
}

function Pitch({ formation, lineup, players, onDragStart, draggingPlayer, hoverSlot }){
  const slots = FORMATIONS[formation];
  const dragging = !!draggingPlayer;
  return (
    <div data-bench="false" style={{ position:"relative", width:"100%", maxWidth:460, margin:"0 auto", paddingTop:"125%", borderRadius:14, overflow:"hidden",
      background:"linear-gradient(180deg,#0f2413,#132c17 50%,#0f2413)", border:"1px solid #1c3a1c" }}>
      {[...Array(5)].map((_,i)=>(
        <div key={i} style={{ position:"absolute", left:0, right:0, top:`${i*20}%`, height:"1px", background:"rgba(255,255,255,0.05)" }}/>
      ))}
      <div style={{ position:"absolute", left:"50%", top:"50%", width:90, height:90, marginLeft:-45, marginTop:-45, border:"1px solid rgba(255,255,255,0.08)", borderRadius:"50%" }}/>
      {slots.map((slot, i) => {
        const group = ROLE_GROUP[slot.role];
        const playerId = lineup[i];
        const player = players.find(p=>p.id===playerId);
        const isHover = hoverSlot === i && dragging;
        const eligible = dragging ? slotAccepts(slot.role, draggingPlayer) : false;
        let ring = "rgba(255,255,255,0.28)";
        let cls = "";
        if (dragging && !player){
          if (eligible){ cls = "slot-eligible"; ring = "rgba(127,216,143,0.6)"; }
          else ring = "rgba(255,255,255,0.1)";
        }
        if (isHover) ring = eligible ? "#7fd88f" : "#e08a8a";
        return (
          <div key={i} data-slot-index={i} data-slot-role={slot.role}
            style={{ position:"absolute", left:`${slot.x}%`, top:`${slot.y}%`, width:60, textAlign:"center",
              transform:`translate(-50%,-50%) scale(${isHover?1.18:1})`, transition:"transform 100ms ease" }}>
            <div className={cls}
              onPointerDown={ player ? (e)=>onDragStart(e, player, { source:"slot", slotIndex:i }) : undefined }
              style={{ width:36, height:36, margin:"0 auto 3px", borderRadius:"50%",
                background: player ? `linear-gradient(150deg, ${GROUP_COLOR[group]}, ${GROUP_COLOR[group]}bb)` : "rgba(255,255,255,0.03)",
                border: player ? "2px solid #0a0e0a" : `2px dashed ${ring}`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800,
                color: player ? "#0a0e0a" : "rgba(255,255,255,0.5)",
                cursor: player ? "grab" : "default", touchAction:"none",
                boxShadow: player ? "0 2px 8px rgba(0,0,0,0.45), 0 0 0 2px #0a0e0a" : (isHover ? `0 0 0 5px ${ring}33` : "none") }}>
              {player ? player.number : slot.role}
            </div>
            <div style={{ fontSize:9, color:"#9ab89a", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {player ? player.name.split(" ").slice(-1)[0] : slot.role}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SquadScreen({ state, myClub, onSetFormation, onDragStart, onEditNumber, onSell, onLoanOut, onOpenMarket, onOpenCups, onOpenTactics, onSimulate, simulateLabel, draggingPlayer, hoverSlot, showMarketBar=true }){
  const usedIds = new Set(Object.values(state.lineup).filter(Boolean));
  const filledSlots = Object.values(state.lineup).filter(Boolean).length;
  const order = ["GK","DEF","MID","FWD"];
  const sorted = [...myClub.players].sort((a,b)=> order.indexOf(a.group)-order.indexOf(b.group) || b.ovr-a.ovr);

  return (
    <div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:10, alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <span style={{ fontSize:12, color:"#9ab89a" }}>Formation</span>
          <select value={state.formation} onChange={e=>onSetFormation(e.target.value)}
            style={{ background:"#111a11", color:"#e8ede8", border:"1px solid #2a3a2a", borderRadius:7, padding:"6px 10px", fontSize:13 }}>
            {Object.keys(FORMATIONS).map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          {onOpenTactics && <button onClick={onOpenTactics} style={{ display:"flex", alignItems:"center", gap:6, background:"#12181c", border:"1px solid #2d4a6b", color:"#a8d0f0", padding:"7px 14px", borderRadius:8, fontSize:13, fontWeight:600 }}>
            🧠 Tactics ({STYLES[state.tacticalStyle||"balanced"].name})
          </button>}
        </div>
        {showMarketBar && <div className="top-actions" style={{ display:"flex", gap:8 }}>
          <div style={{ background:"#111a11", border:"1px solid #2a3a2a", borderRadius:7, padding:"6px 12px", fontSize:13 }}>
            Budget: <b style={{color:"#7fd88f"}}>{fmtM(state.budget)}</b>
          </div>
          {onOpenCups && <button onClick={onOpenCups} style={{ display:"flex", alignItems:"center", gap:6, background:"#1c1a12", border:"1px solid #6b5a2d", color:"#e8d09a", padding:"7px 14px", borderRadius:8, fontSize:13, fontWeight:600 }}>
            🏆 Cups
          </button>}
          <button onClick={onOpenMarket} style={{ display:"flex", alignItems:"center", gap:6, background:"#16321c", border:"1px solid #2d6b3f", color:"#a8f0b8", padding:"7px 14px", borderRadius:8, fontSize:13, fontWeight:600 }}>
            <ArrowLeftRight size={14}/> Transfer Market
          </button>
        </div>}
      </div>

      <p style={{ fontSize:11, color:"#6a8a6a", marginBottom:10 }}>Drag a player from your squad onto the pitch. Eligible slots glow while you drag. Drag a starter onto the squad list to bench them.</p>

      <div className="grid-2col">
        <div>
          <Pitch formation={state.formation} lineup={state.lineup} players={myClub.players} onDragStart={onDragStart} draggingPlayer={draggingPlayer} hoverSlot={hoverSlot} />
          <div style={{ fontSize:11, color:"#6a8a6a", marginTop:8, display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
            <Legend color={GROUP_COLOR.GK} label="Keeper"/><Legend color={GROUP_COLOR.DEF} label="Defence"/>
            <Legend color={GROUP_COLOR.MID} label="Midfield"/><Legend color={GROUP_COLOR.FWD} label="Attack"/>
          </div>
        </div>

        <div>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:8, color:"#cfe8cf" }}>Squad ({myClub.players.length})</div>
          <div data-bench="true" style={{ maxHeight:460, overflowY:"auto", display:"flex", flexDirection:"column", gap:6 }}>
            {sorted.map(p => (
              <div key={p.id} style={{ display:"flex", alignItems:"center", gap:8, background: usedIds.has(p.id)?"#132513":"#0e150e", border:"1px solid #1c2b1c", borderRadius:8, padding:"6px 10px" }}>
                <div onPointerDown={(e)=>onDragStart(e, p, { source:"squad" })}
                  style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:0, cursor:"grab", touchAction:"none" }}>
                  <div style={{ width:8,height:8,borderRadius:"50%", background:GROUP_COLOR[p.group], flexShrink:0 }}/>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {p.name}{p.loan && <span style={{color:"#e8b84b",fontSize:10}}> (loan)</span>}{usedIds.has(p.id) && <span style={{color:"#7fd88f",fontSize:10}}> · starting</span>}
                    </div>
                    <div style={{ fontSize:10, color:"#6a8a6a" }}>{p.role} · Age {p.age} · OVR {p.ovr} · {fmtM(p.value)}</div>
                  </div>
                </div>
                <input type="number" min={1} max={99} value={p.number} onChange={e=>onEditNumber(p.id, clamp(parseInt(e.target.value||"1",10),1,99))}
                  style={{ width:38, background:"#0a0e0a", border:"1px solid #223322", color:"#e8ede8", borderRadius:5, fontSize:12, padding:"5px 3px", textAlign:"center" }}/>
                <button onClick={()=>onLoanOut(p.id)} title="Loan out" style={{ background:"transparent", border:"1px solid #2a3a2a", color:"#9ab89a", borderRadius:6, fontSize:10, padding:"5px 7px" }}>Loan</button>
                <button onClick={()=>onSell(p.id)} title="Sell" style={{ background:"transparent", border:"1px solid #5a2a2a", color:"#e08a8a", borderRadius:6, fontSize:10, padding:"5px 7px" }}>Sell</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop:20, textAlign:"center" }}>
        {filledSlots < 7 && <div style={{ color:"#e8b84b", fontSize:12, marginBottom:8 }}>Fill at least 7 starting slots for a fair simulation.</div>}
        <button onClick={onSimulate} style={primaryBtnStyle}>{simulateLabel}</button>
      </div>
    </div>
  );
}
function Legend({ color, label }){
  return <span style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{width:8,height:8,borderRadius:"50%",background:color,display:"inline-block"}}/>{label}</span>;
}

function CupProgressStrip({ cupStatus }){
  const label = (cs) => cs.outcome ? cs.outcome : cs.playedRounds.length ? `Alive — last won ${cs.playedRounds[cs.playedRounds.length-1]}` : "Not yet started";
  const color = (cs) => cs.outcome === "CHAMPION" ? "#7fd88f" : cs.outcome ? "#e08a8a" : cs.playedRounds.length ? "#7fd88f" : "#6a8a6a";
  return (
    <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:16 }}>
      <div style={{ background:"#111a11", border:"1px solid #2a3a2a", borderRadius:10, padding:"8px 14px", fontSize:12 }}>
        🏆 FA Cup: <b style={{color:color(cupStatus.fa)}}>{label(cupStatus.fa)}</b>
      </div>
      <div style={{ background:"#111a11", border:"1px solid #2a3a2a", borderRadius:10, padding:"8px 14px", fontSize:12 }}>
        🥤 Carabao Cup: <b style={{color:color(cupStatus.carabao)}}>{label(cupStatus.carabao)}</b>
      </div>
    </div>
  );
}
function ResultsScreen({ title, results, table, myClubId, onContinue, continueLabel, projectedTable, cupStatus }){
  const myRow = table.find(r=>r.id===myClubId);
  const myRank = table.findIndex(r=>r.id===myClubId)+1;
  const projRank = projectedTable ? projectedTable.findIndex(r=>r.id===myClubId)+1 : null;

  return (
    <div>
      <h2 style={{ fontSize:18, marginBottom:4 }}>{title}</h2>
      <p style={{ color:"#6a8a6a", fontSize:12, marginBottom:16 }}>Simulated {results.length} league matches based on your chosen XI.</p>

      {cupStatus && <CupProgressStrip cupStatus={cupStatus} />}

      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20 }}>
        <StatBox label="Position" value={`${myRank}${ord(myRank)}`} />
        <StatBox label="Points" value={myRow.pts} />
        <StatBox label="Record" value={`${myRow.w}-${myRow.d}-${myRow.l}`} />
        <StatBox label="Goal Diff" value={(myRow.gd>=0?"+":"")+myRow.gd} />
        {projRank && <StatBox label="Half-Season Projection" value={`${projRank}${ord(projRank)}`} sub={myRank<projRank?"Overperformed":myRank>projRank?"Underperformed":"Matched projection"} />}
      </div>

      <div className="grid-2col">
        <div>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:8, color:"#cfe8cf" }}>Match Results</div>
          <div style={{ maxHeight:420, overflowY:"auto", display:"flex", flexDirection:"column", gap:6 }}>
            {results.map((r,i)=>(
              <div key={i} style={{ background:"#0e150e", border:"1px solid #1c2b1c", borderRadius:8, padding:"8px 12px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"#6a8a6a" }}>
                    <span>GW{r.gw}</span>
                    <ResultBadge result={r.result}/>
                    <span style={{fontWeight:600, color:"#dfe8df"}}>{r.opponent}</span>
                    <span style={{fontSize:10}}>({r.isHome?"H":"A"})</span>
                  </div>
                  <div style={{ fontWeight:800, fontSize:14, color: r.result==="W"?"#7fd88f":r.result==="L"?"#e08a8a":"#e8b84b" }}>
                    {r.isHome ? `${r.myGoals}-${r.oppGoals}` : `${r.oppGoals}-${r.myGoals}`}
                  </div>
                </div>
                {r.scorerStr && <div style={{ fontSize:11, color:"#6a8a6a", marginTop:3 }}>⚽ {r.scorerStr}</div>}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:8, color:"#cfe8cf" }}>League Table</div>
          <div style={{ maxHeight:420, overflowY:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead><tr style={{ color:"#6a8a6a", textAlign:"left" }}>
                <th style={{padding:"4px 6px"}}>#</th><th>Club</th><th>P</th><th>Pts</th><th>GD</th>
              </tr></thead>
              <tbody>
                {table.map((r,i)=>(
                  <tr key={r.id} style={{ background: r.id===myClubId?"#132513":"transparent", borderTop:"1px solid #1c2b1c" }}>
                    <td style={{padding:"5px 6px"}}>{i+1}</td>
                    <td style={{fontWeight:r.id===myClubId?700:400}}>{r.club.name}</td>
                    <td>{r.played}</td><td style={{fontWeight:700}}>{r.pts}</td><td>{r.gd>=0?"+":""}{r.gd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ marginTop:20, textAlign:"center" }}>
        <button onClick={onContinue} style={primaryBtnStyle}>{continueLabel}</button>
      </div>
    </div>
  );
}
function StatBox({ label, value, sub }){
  return (
    <div style={{ background:"#111a11", border:"1px solid #2a3a2a", borderRadius:10, padding:"10px 16px", minWidth:110 }}>
      <div style={{ fontSize:10, color:"#6a8a6a", marginBottom:2 }}>{label}</div>
      <div style={{ fontSize:18, fontWeight:800 }}>{value}</div>
      {sub && <div style={{ fontSize:10, color:"#7fd88f" }}>{sub}</div>}
    </div>
  );
}
function ResultBadge({ result }){
  const c = result==="W"?"#2d6b3f":result==="L"?"#6b2d2d":"#6b5a2d";
  return <span style={{ background:c, color:"#fff", fontSize:10, fontWeight:800, padding:"1px 6px", borderRadius:4 }}>{result}</span>;
}

function SummaryScreen({ state, myClub, onRestart, onOpenCups }){
  const finalRank = state.tableFinal.findIndex(r=>r.id===state.myClubId)+1;
  const halfRank = state.table1.findIndex(r=>r.id===state.myClubId)+1;
  const lineupPlayers = myClub.players.filter(p => Object.values(state.lineup).includes(p.id));
  const byGroup = g => lineupPlayers.filter(p=>p.group===g);
  const groups = ["GK","DEF","MID","FWD"];
  const trend = finalRank<halfRank ? "OVERPERFORMED" : finalRank>halfRank ? "UNDERPERFORMED" : "ON TARGET";
  const uclUnlocked = finalRank <= 4;

  return (
    <div>
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <Trophy size={36} color="#e8b84b" style={{marginBottom:8}}/>
        <h2 style={{ fontSize:22, marginBottom:2 }}>Season Complete</h2>
        <p style={{ color:"#9ab89a", fontSize:13 }}>{myClub.name} · 2026/27 Premier League</p>
      </div>

      <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginBottom:24 }}>
        <StatBox label="Finished" value={`${finalRank}${ord(finalRank)}`} />
        <StatBox label="Half-Season Projection" value={`${halfRank}${ord(halfRank)}`} />
        <StatBox label="Trend" value={trend.split(" ")[0]} sub={trend} />
      </div>

      {uclUnlocked && (
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:12, color:"#7fd88f", marginBottom:8 }}>Top 4 finish — Champions League qualification secured ⭐</div>
          <button onClick={onOpenCups} style={{ ...primaryBtnStyle, background:"#3d3410", border:"1px solid #e8b84b", color:"#e8d09a" }}>🏆 Play Cup Competitions</button>
        </div>
      )}
      {!uclUnlocked && (
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <button onClick={onOpenCups} style={{ ...primaryBtnStyle, background:"#1c1a12", border:"1px solid #6b5a2d", color:"#e8d09a" }}>🏆 Play FA Cup / Carabao Cup</button>
        </div>
      )}

      <div style={{ background:"#111a11", border:"1px solid #2a3a2a", borderRadius:12, padding:18, marginBottom:20 }}>
        <div style={{ display:"flex", flexWrap:"wrap", gap:16, justifyContent:"space-around", textAlign:"center" }}>
          {groups.map(g => {
            const gp = byGroup(g);
            const o = gp.length ? gp.reduce((s,p)=>s+p.ovr,0)/gp.length : 0;
            return (
              <div key={g}>
                <div style={{ fontSize:11, color:GROUP_COLOR[g], fontWeight:700 }}>{g}</div>
                <div style={{ fontSize:14, fontWeight:700 }}>{gp.length? ovrLabel(o) : "—"}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ fontSize:13, fontWeight:700, marginBottom:8, color:"#cfe8cf" }}>Final Table</div>
      <div style={{ maxHeight:400, overflowY:"auto", marginBottom:20 }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead><tr style={{ color:"#6a8a6a", textAlign:"left" }}>
            <th style={{padding:"4px 6px"}}>#</th><th>Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th>
          </tr></thead>
          <tbody>
            {state.tableFinal.map((r,i)=>(
              <tr key={r.id} style={{ background: r.id===state.myClubId?"#132513":"transparent", borderTop:"1px solid #1c2b1c" }}>
                <td style={{padding:"5px 6px"}}>{i+1}</td>
                <td style={{fontWeight:r.id===state.myClubId?700:400}}>{r.club.name}</td>
                <td>{r.played}</td><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td><td>{r.gd>=0?"+":""}{r.gd}</td><td style={{fontWeight:700}}>{r.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign:"center" }}>
        <button onClick={onRestart} style={primaryBtnStyle}>Start a New Season</button>
      </div>
    </div>
  );
}

function ScheduleCupCard({ title, icon, desc, cs, isEuropean }){
  const started = cs.playedRounds.length > 0;
  const statusText = cs.outcome ? cs.outcome : started ? `Alive — through to next round after beating ${cs.results[cs.results.length-1].opponent}` : (isEuropean ? "Awaiting Round 2 (bye from Round 1)" : "Not yet drawn");
  const statusColor = cs.outcome === "CHAMPION" ? "#7fd88f" : cs.outcome ? "#e08a8a" : started ? "#7fd88f" : "#9ab89a";
  return (
    <div style={{ background:"#111a11", border:"1px solid #2a3a2a", borderRadius:12, padding:16, marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ fontWeight:700, fontSize:14 }}>{icon} {title}</div>
        {cs.outcome && <span style={{ background: cs.outcome==="CHAMPION"?"#2d6b3f":"#6b2d2d", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:5 }}>{cs.outcome}</span>}
      </div>
      <div style={{ fontSize:11, color:"#6a8a6a", marginBottom:8 }}>{desc}</div>
      <div style={{ fontSize:12, fontWeight:600, color: statusColor, marginBottom: started ? 10 : 0 }}>{statusText}</div>
      {started && (
        <div>
          <div style={{ display:"flex", gap:14, fontSize:12, color:"#9ab89a", marginBottom:8 }}>
            <span>Record: <b style={{color:"#e8ede8"}}>{cs.record.w}-{cs.record.d}-{cs.record.l}</b></span>
            <span>Goals: <b style={{color:"#e8ede8"}}>{cs.record.gf}-{cs.record.ga}</b></span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            {cs.results.map((r,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#0e150e", border:"1px solid #1c2b1c", borderRadius:6, padding:"6px 10px", fontSize:11, gap:6, flexWrap:"wrap" }}>
                <span style={{ color:"#6a8a6a" }}>{r.round}</span>
                <span style={{ fontWeight:600 }}>{r.homeA ? "vs" : "at"} {r.opponent}</span>
                <span style={{ fontWeight:800, color: r.won?"#7fd88f":"#e08a8a" }}>{r.myGoals}-{r.oppGoals}{r.wentToPens ? ` (pens ${r.wonPens?"W":"L"})` : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
function UclCard({ ucl, played, locked, onEnter }){
  const inProgress = ucl && ucl.stage !== "final";
  return (
    <div style={{ background:"#111a11", border:"1px solid #2a3a2a", borderRadius:12, padding:16, marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ fontWeight:700, fontSize:14 }}>⭐ Champions League</div>
        {played && <span style={{ background: played.outcome==="CHAMPION"?"#2d6b3f":"#6b2d2d", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:5 }}>{played.outcome}</span>}
      </div>
      <div style={{ fontSize:11, color:"#6a8a6a", marginBottom:10 }}>
        {locked ? "Unlocks once you finish top 4 in the league." : "New 36-team league phase: play 8 different clubs from the other leagues. Finish top 8 for a direct Round of 16 spot, 9th-24th go to a playoff, 25th and below are out."}
      </div>
      {locked && <div style={{ fontSize:11, color:"#e8b84b" }}>🔒 Locked</div>}
      {!locked && !played && (
        <button onClick={onEnter} style={{ background:"#2d6b3f", border:"none", color:"#fff", fontWeight:700, fontSize:12, padding:"8px 16px", borderRadius:8 }}>
          {inProgress ? "Resume Campaign →" : "Enter the Draw"}
        </button>
      )}
      {played && (
        <div>
          <div style={{ display:"flex", gap:14, fontSize:12, color:"#9ab89a", marginBottom:8 }}>
            <span>Record: <b style={{color:"#e8ede8"}}>{played.record.w}-{played.record.d}-{played.record.l}</b></span>
            <span>Goals: <b style={{color:"#e8ede8"}}>{played.record.gf}-{played.record.ga}</b></span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:10 }}>
            {played.results.map((r,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#0e150e", border:"1px solid #1c2b1c", borderRadius:6, padding:"6px 10px", fontSize:11, gap:6, flexWrap:"wrap" }}>
                <span style={{ color:"#6a8a6a" }}>{r.stage}</span>
                <span style={{ fontWeight:600 }}>{r.isHome ? "vs" : "at"} {r.opponent}</span>
                <span style={{ fontWeight:800, color: r.result==="W"?"#7fd88f":r.result==="L"?"#e08a8a":"#e8b84b" }}>{r.myGoals}-{r.oppGoals}{r.wentToPens ? ` (pens ${r.wonPens?"W":"L"})` : ""}</span>
              </div>
            ))}
          </div>
          <button onClick={onEnter} style={{ background:"transparent", border:"1px solid #2a3a2a", color:"#9ab89a", fontSize:11, padding:"6px 12px", borderRadius:7 }}>Play Again</button>
        </div>
      )}
    </div>
  );
}

function RivalSquadPanel({ club }){
  const order = ["GK","DEF","MID","FWD"];
  const xi = topXI(club.players);
  const xiIds = new Set(xi.map(p=>p.id));
  const sorted = [...club.players].sort((a,b)=> order.indexOf(a.group)-order.indexOf(b.group) || b.ovr-a.ovr);
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <div style={{ width:34, height:34, borderRadius:8, background:club.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#fff", fontSize:13 }}>
          {club.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
        </div>
        <div>
          <div style={{ fontWeight:700, fontSize:14 }}>{club.name}</div>
          <div style={{ fontSize:11, color:"#9ab89a" }}>{club.preferredFormation || "4-4-2"} · Predicted XI</div>
        </div>
      </div>
      <div style={{ maxHeight:460, overflowY:"auto", display:"flex", flexDirection:"column", gap:6 }}>
        {sorted.map(p => (
          <div key={p.id} style={{ display:"flex", alignItems:"center", gap:8, background: xiIds.has(p.id)?"#132513":"#0e150e", border:"1px solid #1c2b1c", borderRadius:8, padding:"6px 10px" }}>
            <div style={{ width:8,height:8,borderRadius:"50%", background:GROUP_COLOR[p.group], flexShrink:0 }}/>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {p.name}{xiIds.has(p.id) && <span style={{color:"#7fd88f",fontSize:10}}> · starting</span>}
              </div>
              <div style={{ fontSize:10, color:"#6a8a6a" }}>{p.role} · Age {p.age} · OVR {p.ovr}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UclBanner({ text, sub }){
  return (
    <div style={{ background:"linear-gradient(135deg,#0b1a3a,#132257)", border:"1px solid #2a3f7a", borderRadius:12, padding:"14px 18px", marginBottom:16, textAlign:"center" }}>
      <div style={{ fontSize:11, letterSpacing:2, color:"#9ab8e8" }}>⭐ UEFA CHAMPIONS LEAGUE ⭐</div>
      <div style={{ fontSize:16, fontWeight:800, marginTop:2 }}>{text}</div>
      {sub && <div style={{ fontSize:12, color:"#9ab8e8", marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function UclTable({ table, myClubId }){
  return (
    <div style={{ maxHeight:480, overflowY:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
        <thead><tr style={{ color:"#6a8a6a", textAlign:"left" }}>
          <th style={{padding:"4px 6px"}}>#</th><th>Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th><th>Zone</th>
        </tr></thead>
        <tbody>
          {table.map((r,i)=>(
            <tr key={r.id} style={{ background: uclZoneBg(i+1, r.id===myClubId), borderTop:"1px solid #1c2b1c" }}>
              <td style={{padding:"5px 6px"}}>{i+1}</td>
              <td style={{fontWeight:r.id===myClubId?700:400}}>{r.club.name}</td>
              <td>{r.played}</td><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td><td>{r.gd>=0?"+":""}{r.gd}</td><td style={{fontWeight:700}}>{r.pts}</td>
              <td style={{fontSize:10, color:"#9ab89a"}}>{uclZoneLabel(i+1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UclHub({ state, myClub, onPlayNext }){
  const u = state.ucl;
  const tableArr = computeTableArray(u.tableRaw, u.clubs);
  const myRank = tableArr.findIndex(r=>r.id===state.myClubId)+1;
  const round = u.rounds[u.roundIndex];
  const match = round.find(([h,a]) => h===state.myClubId || a===state.myClubId);
  const isHome = match[0] === state.myClubId;
  const opponent = u.clubs.find(c => c.id === (isHome ? match[1] : match[0]));
  const upcoming = u.rounds.slice(u.roundIndex+1).map((r,i) => {
    const m = r.find(([h,a]) => h===state.myClubId || a===state.myClubId);
    const isH = m[0] === state.myClubId;
    const opp = u.clubs.find(c => c.id === (isH ? m[1] : m[0]));
    return { md: u.roundIndex+2+i, opp, isHome: isH };
  });
  return (
    <div>
      <UclBanner text={`League Phase — Matchday ${u.roundIndex+1} of 8`} sub={`Currently ${myRank}${ord(myRank)} of ${tableArr.length}`} />
      <div className="grid-2col">
        <div>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:8, color:"#cfe8cf" }}>League Phase Table</div>
          <UclTable table={tableArr} myClubId={state.myClubId} />
        </div>
        <div>
          <div style={{ background:"#111a11", border:"1px solid #2a3a2a", borderRadius:12, padding:16, marginBottom:14 }}>
            <div style={{ fontSize:11, color:"#9ab89a", marginBottom:6 }}>NEXT MATCH</div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{ width:38, height:38, borderRadius:8, background:opponent.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#fff" }}>
                {opponent.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
              </div>
              <div>
                <div style={{ fontWeight:700 }}>{opponent.name}</div>
                <div style={{ fontSize:11, color:"#9ab89a" }}>{isHome ? "Home" : "Away"} · Matchday {u.roundIndex+1}</div>
              </div>
            </div>
            <button onClick={onPlayNext} style={primaryBtnStyle}>View Squads & Play →</button>
          </div>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:8, color:"#cfe8cf" }}>Upcoming Fixtures</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {upcoming.map((f,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", background:"#0e150e", border:"1px solid #1c2b1c", borderRadius:8, padding:"7px 12px", fontSize:12 }}>
                <span style={{color:"#6a8a6a"}}>MD{f.md}</span>
                <span>{f.isHome ? "vs" : "at"} {f.opp.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UclMatchPrep({ state, myClub, squadCommonProps, onPlay }){
  const u = state.ucl;
  const round = u.rounds[u.roundIndex];
  const match = round.find(([h,a]) => h===state.myClubId || a===state.myClubId);
  const isHome = match[0] === state.myClubId;
  const opponent = u.clubs.find(c => c.id === (isHome ? match[1] : match[0]));
  return (
    <div>
      <UclBanner text={isHome ? `${myClub.name} vs ${opponent.name}` : `${opponent.name} vs ${myClub.name}`} sub={`League Phase · Matchday ${u.roundIndex+1} of 8`} />
      <div className="ucl-prep-grid">
        <SquadScreen {...squadCommonProps} onSimulate={onPlay} simulateLabel={`Kick Off vs ${opponent.name}`} showMarketBar={false} />
        <div>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:8, color:"#cfe8cf" }}>Rival Squad</div>
          <RivalSquadPanel club={opponent} />
        </div>
      </div>
    </div>
  );
}

function UclMatchResult({ myClub, result, onContinue }){
  return (
    <div style={{ textAlign:"center", padding:"20px 0" }}>
      <UclBanner text="Full Time" sub={`League Phase · vs ${result.opponent}`} />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:18, marginBottom:10, flexWrap:"wrap" }}>
        <div style={{ fontWeight:700, fontSize:15 }}>{result.isHome ? myClub.name : result.opponent}</div>
        <div style={{ fontSize:32, fontWeight:800 }}>{result.isHome?result.myGoals:result.oppGoals} - {result.isHome?result.oppGoals:result.myGoals}</div>
        <div style={{ fontWeight:700, fontSize:15 }}>{result.isHome ? result.opponent : myClub.name}</div>
      </div>
      <ResultBadge result={result.result} />
      {result.scorerStr && <div style={{ fontSize:12, color:"#9ab89a", marginTop:10 }}>⚽ {result.scorerStr}</div>}
      <div style={{ marginTop:26 }}>
        <button onClick={onContinue} style={primaryBtnStyle}>Back to Table →</button>
      </div>
    </div>
  );
}

function UclPhaseSummary({ state, onContinue }){
  const u = state.ucl;
  const table = u.phaseTable;
  const myRank = table.findIndex(r=>r.id===state.myClubId)+1;
  const q = u.qualification;
  const headline = q==="top8" ? "Top 8 finish — straight through to the Round of 16!" : q==="playoff" ? "Playoff spot — one match for a Round of 16 place." : "Eliminated at the league phase.";
  return (
    <div>
      <UclBanner text="League Phase Complete" sub={`Finished ${myRank}${ord(myRank)} of ${table.length}`} />
      <div style={{ textAlign:"center", fontSize:14, fontWeight:700, color: q==="eliminated"?"#e08a8a":"#7fd88f", marginBottom:16 }}>{headline}</div>
      <UclTable table={table} myClubId={state.myClubId} />
      <div style={{ textAlign:"center", marginTop:20 }}>
        <button onClick={onContinue} style={primaryBtnStyle}>{q==="eliminated" ? "Finish Campaign →" : "Continue →"}</button>
      </div>
    </div>
  );
}

function UclSingleMatchPrep({ myClub, opponent, roundLabel, subLabel, squadCommonProps, onPlay }){
  return (
    <div>
      <UclBanner text={roundLabel} sub={subLabel || `${myClub.name} vs ${opponent.name}`} />
      <div className="ucl-prep-grid">
        <SquadScreen {...squadCommonProps} onSimulate={onPlay} simulateLabel={`Kick Off — ${roundLabel}`} showMarketBar={false} />
        <div>
          <div style={{ fontSize:13, fontWeight:700, marginBottom:8, color:"#cfe8cf" }}>Rival Squad</div>
          <RivalSquadPanel club={opponent} />
        </div>
      </div>
    </div>
  );
}

function UclSingleMatchResult({ myClub, result, roundLabel, isCampaignOver, onContinue }){
  return (
    <div style={{ textAlign:"center", padding:"20px 0" }}>
      <UclBanner text={`Full Time — ${roundLabel}`} />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:18, marginBottom:10, flexWrap:"wrap" }}>
        <div style={{ fontWeight:700, fontSize:15 }}>{result.isHome ? myClub.name : result.opponent}</div>
        <div style={{ fontSize:32, fontWeight:800 }}>{result.isHome?result.myGoals:result.oppGoals} - {result.isHome?result.oppGoals:result.myGoals}</div>
        <div style={{ fontWeight:700, fontSize:15 }}>{result.isHome ? result.opponent : myClub.name}</div>
      </div>
      {result.wentToPens && <div style={{ fontSize:12, color:"#e8b84b", marginBottom:6 }}>Decided on penalties — {result.wonPens ? "you won" : "you lost"} the shootout</div>}
      <ResultBadge result={result.won ? "W" : "L"} />
      {result.scorerStr && <div style={{ fontSize:12, color:"#9ab89a", marginTop:10 }}>⚽ {result.scorerStr}</div>}
      <div style={{ marginTop:10, fontSize:13, fontWeight:700, color: result.won ? "#7fd88f" : "#e08a8a" }}>
        {result.won ? (isCampaignOver ? "🏆 Champions of Europe!" : "Through to the next round") : (roundLabel==="Final" ? "Runners-up" : "Knocked out")}
      </div>
      <div style={{ marginTop:26 }}>
        <button onClick={onContinue} style={primaryBtnStyle}>{(!result.won || isCampaignOver) ? "View Campaign Summary →" : "Continue →"}</button>
      </div>
    </div>
  );
}

function UclFinal({ myClub, rec, onBack }){
  return (
    <div>
      <div style={{ textAlign:"center", marginBottom:20 }}>
        <Trophy size={36} color="#e8b84b" style={{marginBottom:8}}/>
        <h2 style={{ fontSize:20 }}>Champions League {rec.outcome==="CHAMPION" ? "— Champions!" : rec.outcome==="RUNNER-UP" ? "— Runners-up" : "Campaign Over"}</h2>
        <div style={{ fontSize:13, color:"#9ab89a" }}>{myClub.name} · 2026/27</div>
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginBottom:20 }}>
        <StatBox label="Result" value={rec.outcome} />
        <StatBox label="Record" value={`${rec.record.w}-${rec.record.d}-${rec.record.l}`} />
        <StatBox label="Goals" value={`${rec.record.gf}-${rec.record.ga}`} />
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:20 }}>
        {rec.results.map((r,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#0e150e", border:"1px solid #1c2b1c", borderRadius:8, padding:"7px 12px", fontSize:12, gap:6, flexWrap:"wrap" }}>
            <span style={{ color:"#6a8a6a" }}>{r.stage}</span>
            <span>{r.isHome ? "vs" : "at"} {r.opponent}</span>
            <span style={{ fontWeight:800, color: r.result==="W"?"#7fd88f":r.result==="L"?"#e08a8a":"#e8b84b" }}>
              {r.isHome?r.myGoals:r.oppGoals}-{r.isHome?r.oppGoals:r.myGoals}{r.wentToPens ? ` (pens ${r.wonPens?"W":"L"})` : ""}
            </span>
          </div>
        ))}
      </div>
      <div style={{ textAlign:"center" }}>
        <button onClick={onBack} style={primaryBtnStyle}>Back to Season →</button>
      </div>
    </div>
  );
}

function LiveMatchScreen({ homeName, awayName, timeline, onDone, banner }){
  const [minute, setMinute] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);
  const feedRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setMinute(m => {
        if (m >= 90){ clearInterval(timerRef.current); setDone(true); return 90; }
        return m+1;
      });
    }, 110); // ~10 seconds for the full 90 minutes
    return () => clearInterval(timerRef.current);
  }, []);

  const revealed = timeline.filter(e => e.minute <= minute);
  useEffect(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [revealed.length]);

  function skip(){
    clearInterval(timerRef.current);
    setMinute(90);
    setDone(true);
  }

  const homeGoals = revealed.filter(e => e.type==="goal" && e.teamName===homeName).length;
  const awayGoals = revealed.filter(e => e.type==="goal" && e.teamName===awayName).length;
  const ICONS = { goal:"⚽", yellow:"🟨", red:"🟥", chance:"➡️" };

  return (
    <div>
      {banner}
      <div style={{ textAlign:"center", marginBottom:16 }}>
        <div style={{ fontSize:12, color: done?"#e8b84b":"#7fd88f", fontWeight:700, marginBottom:6 }}>{done ? "FULL TIME" : `${minute}'`}</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:18, flexWrap:"wrap" }}>
          <div style={{ fontWeight:700, fontSize:16 }}>{homeName}</div>
          <div style={{ fontSize:34, fontWeight:800 }}>{homeGoals} - {awayGoals}</div>
          <div style={{ fontWeight:700, fontSize:16 }}>{awayName}</div>
        </div>
      </div>
      <div ref={feedRef} style={{ maxHeight:340, overflowY:"auto", display:"flex", flexDirection:"column", gap:6, marginBottom:20, padding:"2px 4px", background:"#0a120a", border:"1px solid #1c2b1c", borderRadius:10 }}>
        {revealed.length===0 && <div style={{ textAlign:"center", color:"#6a8a6a", fontSize:12, padding:"16px 0" }}>Kick-off…</div>}
        {revealed.map((e,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, background: e.type==="goal"?"#132513":"#0e150e", border:"1px solid #1c2b1c", borderRadius:8, padding:"6px 12px", fontSize:12, margin:"0 6px" }}>
            <span style={{ color:"#6a8a6a", minWidth:28, fontWeight:700 }}>{e.minute}'</span>
            <span style={{ fontSize:14 }}>{ICONS[e.type]}</span>
            <span>{e.text} <span style={{ color:"#6a8a6a" }}>({e.teamName})</span></span>
          </div>
        ))}
      </div>
      <div style={{ textAlign:"center" }}>
        {!done ? (
          <button onClick={skip} style={{ background:"transparent", border:"1px solid #2a3a2a", color:"#9ab89a", fontWeight:600, fontSize:13, padding:"10px 20px", borderRadius:9 }}>Skip to Full Time</button>
        ) : (
          <button onClick={onDone} style={primaryBtnStyle}>Continue →</button>
        )}
      </div>
    </div>
  );
}

function UclPage({ state, myClub, squadCommonProps, actions }){
  const u = state.ucl;
  if (!u) return null;
  if (u.stage === "hub") return <UclHub state={state} myClub={myClub} onPlayNext={actions.uclGoToPrep} />;
  if (u.stage === "match-prep") return <UclMatchPrep state={state} myClub={myClub} squadCommonProps={squadCommonProps} onPlay={actions.uclPlayLeagueMatch} />;
  if (u.stage === "match-live") return <LiveMatchScreen homeName={u.liveContext.homeName} awayName={u.liveContext.awayName} timeline={u.liveContext.timeline} onDone={actions.uclFinishLiveMatch} banner={<UclBanner text="Kick-Off" sub={`League Phase · vs ${u.lastMatch.opponent}`} />} />;
  if (u.stage === "match-result") return <UclMatchResult myClub={myClub} result={u.lastMatch} onContinue={actions.uclContinueAfterMatch} />;
  if (u.stage === "phase-summary") return <UclPhaseSummary state={state} onContinue={actions.uclContinueAfterPhaseSummary} />;
  if (u.stage === "playoff-prep"){
    const opp = u.clubs.find(c=>c.id===u.playoffOpponentId);
    return <UclSingleMatchPrep myClub={myClub} opponent={opp} roundLabel="Knockout Playoff" squadCommonProps={squadCommonProps} onPlay={actions.uclPlayPlayoff} />;
  }
  if (u.stage === "playoff-live") return <LiveMatchScreen homeName={u.liveContext.homeName} awayName={u.liveContext.awayName} timeline={u.liveContext.timeline} onDone={actions.uclFinishLiveMatch} banner={<UclBanner text="Kick-Off — Knockout Playoff" />} />;
  if (u.stage === "playoff-result") return <UclSingleMatchResult myClub={myClub} result={u.lastMatch} roundLabel="Playoff" isCampaignOver={!u.lastMatch.won} onContinue={actions.uclContinueAfterPlayoff} />;
  if (u.stage === "knockout-prep"){
    const opp = u.clubs.find(c=>c.id===u.currentKnockoutOpponentId);
    const roundName = u.knockoutRounds[u.knockoutRoundIndex];
    return <UclSingleMatchPrep myClub={myClub} opponent={opp} roundLabel={roundName} squadCommonProps={squadCommonProps} onPlay={actions.uclPlayKnockout} />;
  }
  if (u.stage === "knockout-live"){
    const roundName = u.knockoutRounds[u.knockoutRoundIndex];
    return <LiveMatchScreen homeName={u.liveContext.homeName} awayName={u.liveContext.awayName} timeline={u.liveContext.timeline} onDone={actions.uclFinishLiveMatch} banner={<UclBanner text={`Kick-Off — ${roundName}`} />} />;
  }
  if (u.stage === "knockout-result"){
    const roundName = u.knockoutRounds[u.knockoutRoundIndex];
    const isCampaignOver = !u.lastMatch.won || roundName === "Final";
    return <UclSingleMatchResult myClub={myClub} result={u.lastMatch} roundLabel={roundName} isCampaignOver={isCampaignOver} onContinue={actions.uclContinueAfterKnockout} />;
  }
  if (u.stage === "final") return <UclFinal myClub={myClub} rec={{ results:u.campaignResults, record:u.campaignRecord, outcome:u.outcome }} onBack={actions.uclBackToSeason} />;
  return null;
}
function CupsHub({ state, onClose, onEnterUcl }){
  const uclUnlocked = !!(state.tableFinal && state.tableFinal.findIndex(r=>r.id===state.myClubId)+1 <= 4);
  const isEuropean = EUROPEAN_CLUBS.includes(state.myClubId);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100 }}>
      <div style={{ background:"#0d160d", border:"1px solid #223322", borderRadius:"16px 16px 0 0", width:"100%", maxWidth:600, maxHeight:"85vh", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", borderBottom:"1px solid #1c2b1c" }}>
          <div style={{ fontWeight:700, fontSize:15 }}>Cup Competitions</div>
          <button onClick={onClose} style={{ background:"transparent", border:"none", color:"#9ab89a" }}><X size={18}/></button>
        </div>
        <div style={{ overflowY:"auto", padding:"14px 18px 20px" }}>
          {state.league === "PL" && (
            <>
              <ScheduleCupCard title="FA Cup" icon="🏆" desc="Third Round → Final. Slotted into your second-half fixture list — no manual entry needed."
                cs={state.cupStatus.fa} isEuropean={false} />
              <ScheduleCupCard title="Carabao Cup" icon="🥤" desc={isEuropean ? "Your club is in Europe, so you get a bye straight to Round 2." : "Round 1 → Final. Opponents rotate their squads, so expect weaker sides."}
                cs={state.cupStatus.carabao} isEuropean={isEuropean} />
            </>
          )}
          {state.league === "LALIGA" && (
            <ScheduleCupCard title="Copa del Rey" icon="🏆" desc="Round of 32 → Final. Slotted into your second-half fixture list."
              cs={state.cupStatus.copa} isEuropean={false} />
          )}
          {(state.league === "SERIEA" || state.league === "BUNDES" || state.league === "LIGUE1") && (
            <div style={{ fontSize:12, color:"#9ab89a", marginBottom:14, background:"#111a11", border:"1px solid #2a3a2a", borderRadius:10, padding:12 }}>
              {state.league === "SERIEA" ? "Coppa Italia isn't modelled yet" : state.league === "BUNDES" ? "DFB-Pokal isn't modelled yet" : "Coupe de France isn't modelled yet"} — Champions League is still available below.
            </div>
          )}
          <UclCard ucl={state.ucl} played={state.cups.ucl} locked={!uclUnlocked} onEnter={onEnterUcl} />
        </div>
      </div>
    </div>
  );
}

function TacticsModal({ state, onClose, onSetStyle, onSetLine, onSetTrap }){
  const styleList = Object.entries(STYLES).map(([key,v]) => ({ key, ...v }));
  const line = state.defensiveLine ?? 50;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100 }}>
      <div style={{ background:"#0d160d", border:"1px solid #223322", borderRadius:"16px 16px 0 0", width:"100%", maxWidth:640, maxHeight:"85vh", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", borderBottom:"1px solid #1c2b1c" }}>
          <div style={{ fontWeight:700, fontSize:15 }}>🧠 Tactics</div>
          <button onClick={onClose} style={{ background:"transparent", border:"none", color:"#9ab89a" }}><X size={18}/></button>
        </div>
        <div style={{ overflowY:"auto", padding:"14px 18px 26px" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#cfe8cf", marginBottom:8 }}>Playing Style</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:8, marginBottom:22 }}>
            {styleList.map(st => {
              const active = (state.tacticalStyle||"balanced") === st.key;
              return (
                <button key={st.key} onClick={()=>onSetStyle(st.key)} style={{
                  textAlign:"left", background: active?"#1c3a1c":"#111a11",
                  border: active?"1px solid #4a8a4a":"1px solid #2a3a2a",
                  borderRadius:10, padding:12, color:"#e8ede8"
                }}>
                  <div style={{ fontWeight:700, fontSize:13, marginBottom:4, color: active?"#a8f0b8":"#e8ede8" }}>{st.name}</div>
                  <div style={{ fontSize:10, color:"#9ab89a", lineHeight:1.4 }}>{st.desc}</div>
                </button>
              );
            })}
          </div>

          <div style={{ fontSize:12, fontWeight:700, color:"#cfe8cf", marginBottom:8 }}>Defensive Line</div>
          <input type="range" min={0} max={100} value={line} onChange={e=>onSetLine(parseInt(e.target.value,10))}
            style={{ width:"100%", marginBottom:6, accentColor:"#2d6b3f" }} />
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#6a8a6a", marginBottom:22 }}>
            <span>Deep / Low Block</span><span style={{fontWeight:700, color:"#9ab89a"}}>{line}</span><span>High Line</span>
          </div>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#111a11", border:"1px solid #2a3a2a", borderRadius:10, padding:"12px 16px" }}>
            <div style={{ paddingRight:12 }}>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>Offside Trap</div>
              <div style={{ fontSize:10, color:"#9ab89a" }}>Push the line up to catch attackers offside. Works best when your defenders outclass their forwards — risky otherwise.</div>
            </div>
            <button onClick={()=>onSetTrap(!state.offsideTrap)} style={{
              width:46, height:26, borderRadius:13, background: state.offsideTrap?"#2d6b3f":"#2a3a2a", position:"relative", border:"none", flexShrink:0, cursor:"pointer"
            }}>
              <div style={{ position:"absolute", top:2, left: state.offsideTrap?22:2, width:22, height:22, borderRadius:"50%", background:"#fff", transition:"left 150ms" }}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function TransferMarket({ state, myClub, filter, setFilter, onClose, onBuy, onLoanIn }){
  const others = [...state.clubs.filter(c=>c.id!==myClub.id), ...(state.league==="PL" ? state.championshipClubs : [])];
  let list = [];
  others.forEach(c => c.players.forEach(p => list.push({ ...p, sellerClub: c })));
  if (filter.q) list = list.filter(p => p.name.toLowerCase().includes(filter.q.toLowerCase()));
  if (filter.pos !== "ALL") list = list.filter(p => p.group === filter.pos);
  list.sort((a,b) => filter.sort==="value_desc" ? b.value-a.value : filter.sort==="value_asc" ? a.value-b.value : b.ovr-a.ovr);
  list = list.slice(0, 60);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100 }}>
      <div style={{ background:"#0d160d", border:"1px solid #223322", borderRadius:"16px 16px 0 0", width:"100%", maxWidth:760, maxHeight:"85vh", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", borderBottom:"1px solid #1c2b1c" }}>
          <div style={{ fontWeight:700, fontSize:15 }}>Transfer Market</div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ fontSize:12, color:"#9ab89a" }}>Budget: <b style={{color:"#7fd88f"}}>{fmtM(state.budget)}</b></div>
            <button onClick={onClose} style={{ background:"transparent", border:"none", color:"#9ab89a" }}><X size={18}/></button>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, padding:"10px 18px", borderBottom:"1px solid #1c2b1c", flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, background:"#111a11", border:"1px solid #2a3a2a", borderRadius:7, padding:"5px 10px", flex:1, minWidth:160 }}>
            <Search size={13} color="#6a8a6a"/>
            <input value={filter.q} onChange={e=>setFilter(f=>({...f,q:e.target.value}))} placeholder="Search player…"
              style={{ background:"transparent", border:"none", outline:"none", color:"#e8ede8", fontSize:13, width:"100%" }}/>
          </div>
          <select value={filter.pos} onChange={e=>setFilter(f=>({...f,pos:e.target.value}))}
            style={{ background:"#111a11", color:"#e8ede8", border:"1px solid #2a3a2a", borderRadius:7, padding:"5px 10px", fontSize:12 }}>
            <option value="ALL">All positions</option><option value="GK">GK</option><option value="DEF">DEF</option><option value="MID">MID</option><option value="FWD">FWD</option>
          </select>
          <select value={filter.sort} onChange={e=>setFilter(f=>({...f,sort:e.target.value}))}
            style={{ background:"#111a11", color:"#e8ede8", border:"1px solid #2a3a2a", borderRadius:7, padding:"5px 10px", fontSize:12 }}>
            <option value="value_desc">Value: High to Low</option><option value="value_asc">Value: Low to High</option><option value="ovr_desc">Rating: High to Low</option>
          </select>
        </div>
        <div style={{ overflowY:"auto", padding:"8px 18px 18px", display:"flex", flexDirection:"column", gap:6 }}>
          {list.map(p => (
            <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, background:"#111a11", border:"1px solid #1c2b1c", borderRadius:8, padding:"8px 12px", flexWrap:"wrap" }}>
              <div style={{ width:8,height:8,borderRadius:"50%", background:GROUP_COLOR[p.group], flexShrink:0 }}/>
              <div style={{ flex:1, minWidth:120 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{p.name}</div>
                <div style={{ fontSize:10, color:"#6a8a6a" }}>{p.sellerClub.name}{p.sellerClub.tier==="championship" && " (Championship)"} · {p.role} · Age {p.age} · OVR {p.ovr}</div>
              </div>
              <div style={{ fontSize:13, fontWeight:700, color:"#e8b84b", minWidth:60, textAlign:"right" }}>{fmtM(p.value)}</div>
              <button onClick={()=>onLoanIn(p.sellerClub, p)} style={{ background:"transparent", border:"1px solid #2a3a2a", color:"#9ab89a", borderRadius:6, fontSize:10, padding:"6px 8px" }}>Loan</button>
              <button onClick={()=>onBuy(p.sellerClub, p)} disabled={state.budget<p.value}
                style={{ display:"flex",alignItems:"center",gap:4, background: state.budget<p.value ? "#1c2b1c":"#2d6b3f", color: state.budget<p.value?"#5a7a5a":"#fff", border:"none", borderRadius:6, fontSize:11, fontWeight:700, padding:"6px 10px" }}>
                <ShoppingCart size={11}/> Buy
              </button>
            </div>
          ))}
          {list.length===0 && <div style={{ color:"#6a8a6a", fontSize:13, textAlign:"center", padding:20 }}>No players match your search.</div>}
        </div>
      </div>
    </div>
  );
}