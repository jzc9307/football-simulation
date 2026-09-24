import pl from "../assets/competition-logos/pl.svg";
import laliga from "../assets/competition-logos/laliga.svg";
import bundes from "../assets/competition-logos/bundes.svg";
import seriea from "../assets/competition-logos/seriea.svg";
import ligue1 from "../assets/competition-logos/ligue1.svg";
import ucl from "../assets/competition-logos/ucl.svg";

const brands={
  PL:{name:"Premier League",logo:pl,dark:"#251333",panel:"#3c2050",accent:"#00ff85",logoPlate:"#321745"},
  LALIGA:{name:"La Liga",logo:laliga,dark:"#29171a",panel:"#472326",accent:"#ff4b44",logoPlate:"#fff0eb"},
  BUNDES:{name:"Bundesliga",logo:bundes,dark:"#301319",panel:"#54212a",accent:"#fa404b",logoPlate:"#fff4f3"},
  SERIEA:{name:"Serie A",logo:seriea,dark:"#101d3a",panel:"#193768",accent:"#62bfff",logoPlate:"#eff8ff"},
  LIGUE1:{name:"Ligue 1",logo:ligue1,dark:"#151c31",panel:"#27385b",accent:"#ffdf30",logoPlate:"#fff8db"},
  UCL:{name:"Champions League",logo:ucl,dark:"#090f36",panel:"#15215c",accent:"#b6cbff",logoPlate:"#f1f4ff"},
  FA:{name:"FA Cup",mark:"FA",dark:"#152b43",panel:"#1f4b72",accent:"#b9dcff",logoPlate:"#edf7ff"},
  CARABAO:{name:"Carabao Cup",mark:"EFL",dark:"#12342b",panel:"#1d5b48",accent:"#9be45d",logoPlate:"#f0ffe5"},
  COPA:{name:"Copa del Rey",mark:"C",dark:"#4a1920",panel:"#7d2735",accent:"#f6cf62",logoPlate:"#fff4d5"},
  COPPA:{name:"Coppa Italia",mark:"CI",dark:"#12314b",panel:"#1b527a",accent:"#c8e8ff",logoPlate:"#f2faff"},
  DFB:{name:"DFB-Pokal",mark:"DFB",dark:"#3f1219",panel:"#741f2a",accent:"#ffc2c2",logoPlate:"#fff2f2"},
  COUPE:{name:"Coupe de France",mark:"CF",dark:"#172d63",panel:"#234596",accent:"#f5e4a8",logoPlate:"#f5f8ff"},
  CHAMPIONSHIP:{name:"Championship",mark:"EFL",dark:"#281c15",panel:"#5d321e",accent:"#f4b64a",logoPlate:"#fff1d6"},
  LALIGA2:{name:"LaLiga Hypermotion",mark:"LL2",dark:"#2d1921",panel:"#66313e",accent:"#ff8a80",logoPlate:"#fff0ee"},
  SERIEB:{name:"Serie B",mark:"B",dark:"#182d40",panel:"#265676",accent:"#8bd6ff",logoPlate:"#effaff"},
  BUNDES2:{name:"2. Bundesliga",mark:"2BL",dark:"#321b21",panel:"#682b35",accent:"#ff969b",logoPlate:"#fff2f3"},
  LIGUE2:{name:"Ligue 2",mark:"L2",dark:"#21243d",panel:"#3d476e",accent:"#d0dcff",logoPlate:"#f3f6ff"},
};

export function competitionBrand(id){return brands[id]||brands.PL;}
export function competitionTheme(id){const brand=competitionBrand(id);return {"--competition-dark":brand.dark,"--competition-panel":brand.panel,"--competition-accent":brand.accent};}
