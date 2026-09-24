import { competitionBrand } from "./competitionBrand.js";
import { Trophy } from "lucide-react";

export function CompetitionMark({id,size="md"}){
  const brand=competitionBrand(id);
  return <span className={`competition-mark competition-mark-${size}`} style={{background:brand.logoPlate}} title={brand.name}>{brand.logo?<img src={brand.logo} alt={`${brand.name} logo`}/>:<span style={{display:"grid",justifyItems:"center",gap:2,color:brand.panel}}><Trophy size={size==="sm"?12:22}/><b style={{fontSize:size==="sm"?6:8,letterSpacing:".08em"}}>{brand.mark||brand.name.slice(0,2)}</b></span>}</span>;
}
