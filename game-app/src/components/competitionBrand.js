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
};

export function competitionBrand(id){return brands[id]||brands.PL;}
export function competitionTheme(id){const brand=competitionBrand(id);return {"--competition-dark":brand.dark,"--competition-panel":brand.panel,"--competition-accent":brand.accent};}
