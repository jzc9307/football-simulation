import pl from "../assets/competition-logos/pl.svg";
import laliga from "../assets/competition-logos/laliga.svg";
import bundes from "../assets/competition-logos/bundes.svg";
import bundesKicker from "../assets/competition-logos/bundes2.png";
import seriea from "../assets/competition-logos/seriea.svg";
import ligue1 from "../assets/competition-logos/ligue1.svg";
import ucl from "../assets/competition-logos/ucl.svg";
import uel from "../assets/competition-logos/uel.png";
import faCup from "../assets/competition-logos/fa-cup.png";
import carabao from "../assets/competition-logos/carabao.png";
import copa from "../assets/competition-logos/copa.png";
import coppa from "../assets/competition-logos/coppa.png";
import dfb from "../assets/competition-logos/dfb.png";
import coupe from "../assets/competition-logos/coupe.png";
import championship from "../assets/competition-logos/championship.png";
import laliga2 from "../assets/competition-logos/laliga2.png";
import serieB from "../assets/competition-logos/serieb.png";
import bundes2 from "../assets/competition-logos/bundes2.png";
import ligue2 from "../assets/competition-logos/ligue2.png";

const brands={
  PL:{name:"Premier League",logo:pl,dark:"#251333",panel:"#3c2050",accent:"#00ff85",logoPlate:"#321745"},
  LALIGA:{name:"La Liga",logo:laliga,dark:"#29171a",panel:"#472326",accent:"#ff4b44",logoPlate:"#fff0eb"},
  // The old horizontal wordmark becomes unreadable in a compact mark.  This
  // crop is the red kicking-player lockup, which remains recognisable at every
  // UI size (the CSS crops out the 2. Bundesliga wordmark below it).
  BUNDES:{name:"Bundesliga",logo:bundesKicker,wordmark:bundes,dark:"#301319",panel:"#54212a",accent:"#fa404b",logoPlate:"#d20515"},
  SERIEA:{name:"Serie A",logo:seriea,dark:"#101d3a",panel:"#193768",accent:"#62bfff",logoPlate:"#eff8ff"},
  LIGUE1:{name:"Ligue 1",logo:ligue1,dark:"#151c31",panel:"#27385b",accent:"#ffdf30",logoPlate:"#fff8db"},
  UCL:{name:"Champions League",logo:ucl,dark:"#090f36",panel:"#15215c",accent:"#b6cbff",logoPlate:"#f1f4ff"},
  UEL:{name:"Europa League",logo:uel,dark:"#21150d",panel:"#4c2911",accent:"#ffae45",logoPlate:"#fff3dc"},
  FA:{name:"FA Cup",logo:faCup,dark:"#152b43",panel:"#1f4b72",accent:"#b9dcff",logoPlate:"#edf7ff"},
  CARABAO:{name:"Carabao Cup",logo:carabao,dark:"#12342b",panel:"#1d5b48",accent:"#9be45d",logoPlate:"#f0ffe5"},
  COPA:{name:"Copa del Rey",logo:copa,dark:"#4a1920",panel:"#7d2735",accent:"#f6cf62",logoPlate:"#fff4d5"},
  COPPA:{name:"Coppa Italia",logo:coppa,dark:"#12314b",panel:"#1b527a",accent:"#c8e8ff",logoPlate:"#f2faff"},
  DFB:{name:"DFB-Pokal",logo:dfb,dark:"#3f1219",panel:"#741f2a",accent:"#ffc2c2",logoPlate:"#fff2f2"},
  COUPE:{name:"Coupe de France",logo:coupe,dark:"#172d63",panel:"#234596",accent:"#f5e4a8",logoPlate:"#f5f8ff"},
  CHAMPIONSHIP:{name:"Championship",logo:championship,dark:"#281c15",panel:"#5d321e",accent:"#f4b64a",logoPlate:"#fff1d6"},
  LALIGA2:{name:"LaLiga Hypermotion",logo:laliga2,dark:"#2d1921",panel:"#66313e",accent:"#ff8a80",logoPlate:"#fff0ee"},
  SERIEB:{name:"Serie B",logo:serieB,dark:"#182d40",panel:"#265676",accent:"#8bd6ff",logoPlate:"#effaff"},
  BUNDES2:{name:"2. Bundesliga",logo:bundes2,dark:"#321b21",panel:"#682b35",accent:"#ff969b",logoPlate:"#fff2f3"},
  LIGUE2:{name:"Ligue 2",logo:ligue2,dark:"#21243d",panel:"#3d476e",accent:"#d0dcff",logoPlate:"#f3f6ff"},
};

export function competitionBrand(id){return brands[id]||brands.PL;}
export function competitionTheme(id){const brand=competitionBrand(id);return {"--competition-dark":brand.dark,"--competition-panel":brand.panel,"--competition-accent":brand.accent};}
