import { competitionBrand } from "./competitionBrand.js";

export function CompetitionMark({id,size="md"}){
  const brand=competitionBrand(id);
  return <span className={`competition-mark competition-mark-${size}`} style={{background:brand.logoPlate}} title={brand.name}>{brand.logo?<img src={brand.logo} alt={`${brand.name} logo`}/>:<b style={{fontSize:size==="sm"?8:10,color:brand.panel}}>{brand.mark||brand.name.slice(0,2)}</b>}</span>;
}
