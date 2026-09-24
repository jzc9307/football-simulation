export const ROLE_GROUP = { GK:"GK", LB:"DEF", CB:"DEF", RB:"DEF", CDM:"MID", CM:"MID", CAM:"MID", LM:"MID", RM:"MID", LW:"FWD", RW:"FWD", ST:"FWD" };
export const GROUP_COLOR = { GK:"#F5A623", DEF:"#3B82F6", MID:"#10B981", FWD:"#EF4444" };
export const ROLE_COMPAT = {
  GK:["GK"], CB:["CB"], LB:["LB"], RB:["RB"],
  CDM:["CDM","CM"], CM:["CM","CDM","CAM"], CAM:["CAM","CM","LW","RW"],
  LM:["LM","LW","CM"], RM:["RM","RW","CM"],
  LW:["LW","LM","CAM","RW"], RW:["RW","RM","CAM","LW"], ST:["ST","CAM"]
};
// Clubs playing in Europe get a bye into Carabao Cup Round 2, same as the real competition.
export const EUROPEAN_CLUBS = ["ars","liv","man","mun","che","tot","new"];
// Each entry fires once the user has completed exactly `afterRound` league games in that half.
export const CARABAO_SCHEDULE = [
  { afterRound:2, round:"Round 1", skipForEuropean:true },
  { afterRound:4, round:"Round 2" },
  { afterRound:7, round:"Round 3" },
  { afterRound:11, round:"Round 4" },
  { afterRound:14, round:"Quarter-Final" },
  { afterRound:17, round:"Semi-Final" },
];
export const CARABAO_FINAL_SLOT = { afterRound:6, round:"Final" }; // half 2
export const FA_SCHEDULE = [
  { afterRound:1, round:"Third Round" },
  { afterRound:4, round:"Fourth Round" },
  { afterRound:7, round:"Fifth Round" },
  { afterRound:10, round:"Quarter-Final" },
  { afterRound:13, round:"Semi-Final" },
  { afterRound:16, round:"Final" },
]; // half 2 — all PL/Championship clubs enter together at the Third Round, same as reality
export const COPA_SCHEDULE = [
  { afterRound:1, round:"Round of 32" },
  { afterRound:4, round:"Round of 16" },
  { afterRound:7, round:"Quarter-Final" },
  { afterRound:10, round:"Semi-Final" },
  { afterRound:13, round:"Final" },
]; // half 2 — Copa del Rey for La Liga saves
export const COPPA_SCHEDULE = [
  { afterRound:1, round:"Round of 16" },{ afterRound:5, round:"Quarter-Final" },{ afterRound:10, round:"Semi-Final" },{ afterRound:15, round:"Final" },
];
export const DFB_SCHEDULE = [
  { afterRound:1, round:"Round of 32" },{ afterRound:4, round:"Round of 16" },{ afterRound:8, round:"Quarter-Final" },{ afterRound:12, round:"Semi-Final" },{ afterRound:16, round:"Final" },
];
export const COUPE_SCHEDULE = [
  { afterRound:1, round:"Round of 64" },{ afterRound:4, round:"Round of 32" },{ afterRound:7, round:"Round of 16" },{ afterRound:10, round:"Quarter-Final" },{ afterRound:13, round:"Semi-Final" },{ afterRound:16, round:"Final" },
];

export const FORMATIONS = {
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
