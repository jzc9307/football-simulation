import { dateValue } from "../game/seasonSchedule.js";
export function formatDate(date,options={day:"numeric",month:"short",weekday:"short"}){
  return Number.isFinite(dateValue(date))?new Intl.DateTimeFormat("en-GB",{...options,timeZone:"UTC"}).format(new Date(dateValue(date))):"Date to be confirmed";
}
