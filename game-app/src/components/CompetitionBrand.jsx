import { competitionBrand } from "./competitionBrand.js";

export function CompetitionMark({id,size="md"}){
  const brand=competitionBrand(id);
  return <span className={`competition-mark competition-mark-${size}`} style={{background:brand.logoPlate}} title={brand.name}><img src={brand.logo} alt={`${brand.name} logo`}/></span>;
}
