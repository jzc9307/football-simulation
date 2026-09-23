import { ROLE_GROUP } from "../game/config.js";

// FC 27 Career Mode roster data, retrieved from FCCareer on 2026-09-23.
// OVR and potential are stored separately; squads are capped at 30, while sparse source squads retain named legacy depth to meet the 22-player/two-GK rule.
const P = (slug, name, role, age, ovr, potential, value) => ({
  slug, name, role, group:ROLE_GROUP[role], age, ovr, potential, value,
  stamina: Math.max(66, Math.min(94, (role === "GK" ? 72 : ["LB","RB","LM","RM","LW","RW"].includes(role) ? 84 : role === "CB" ? 77 : 81) - Math.max(0, age - 29) * 2 + (ovr >= 86 ? 3 : 0))),
});

const RAW_PLCLUBS = [
  {
    "id": "afc",
    "name": "AFC Bournemouth",
    "color": "#DA291C",
    "budget": 30,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "alex-jay-scott",
        "Alex Jay Scott",
        "CM",
        23,
        81,
        83,
        9.5
      ],
      [
        "eli-junior-eric-anat-kroupi",
        "Eli Junior Eric Anat Kroupi",
        "ST",
        20,
        80,
        85,
        9
      ],
      [
        "adrien-truffert",
        "Adrien Truffert",
        "LB",
        24,
        80,
        81,
        14
      ],
      [
        "ore-petrovic",
        "Đorđe Petrović",
        "GK",
        26,
        79,
        85,
        25
      ],
      [
        "tyler-shaan-adams",
        "Tyler Shaan Adams",
        "CDM",
        27,
        79,
        81,
        20
      ],
      [
        "marcus-joseph-tavernier",
        "Marcus Joseph Tavernier",
        "LM",
        27,
        79,
        79,
        9
      ],
      [
        "justin-dean-kluivert",
        "Justin Dean Kluivert",
        "CAM",
        27,
        79,
        81,
        22
      ],
      [
        "francisco-evanilson-de-lima-barbosa",
        "Francisco Evanilson de Lima Barbosa",
        "ST",
        26,
        79,
        83,
        29
      ],
      [
        "bafode-diakite",
        "Bafodé Diakité",
        "CB",
        25,
        79,
        84,
        24
      ],
      [
        "ryan-christie",
        "Ryan Christie",
        "CDM",
        31,
        78,
        79,
        15
      ],
      [
        "lewis-john-cook",
        "Lewis John Cook",
        "CDM",
        29,
        78,
        80,
        17
      ],
      [
        "james-clayton-hill",
        "James Clayton Hill",
        "CB",
        24,
        78,
        78,
        2.7
      ],
      [
        "amine-adli",
        "Amine Adli",
        "LM",
        26,
        77,
        82,
        20
      ],
      [
        "antonio-joao-pereira-de-albuquerque-tavares-da-silva",
        "António João Pereira de Albuquerque Tavares da Silva",
        "CB",
        22,
        77,
        86,
        30
      ],
      [
        "david-robert-brooks",
        "David Robert Brooks",
        "RM",
        29,
        76,
        76,
        6
      ],
      [
        "juan-luis-sanchez-velasco",
        "Juan Luis Sánchez Velasco",
        "RB",
        23,
        76,
        83,
        12
      ],
      [
        "alvaro-daniel-rodriguez-munoz",
        "Álvaro Daniel Rodríguez Muñoz",
        "ST",
        22,
        75,
        82,
        2.9
      ],
      [
        "julian-vicente-araujo-zuniga",
        "Julián Vicente Araujo Zúñiga",
        "RB",
        25,
        74,
        81,
        8
      ],
      [
        "adam-james-smith",
        "Adam James Smith",
        "RB",
        35,
        73,
        73,
        1.1
      ],
      [
        "toth-alex-laszlo",
        "Tóth Alex László",
        "CM",
        20,
        73,
        84,
        3.6
      ],
      [
        "veljko-milosavljevic",
        "Veljko Milosavljević",
        "CB",
        19,
        72,
        84,
        3.5
      ],
      [
        "ben-gannon-doak",
        "Ben Gannon Doak",
        "RM",
        20,
        71,
        85,
        4.4
      ],
      [
        "maximilian-james-aarons",
        "Maximilian James Aarons",
        "RB",
        26,
        70,
        75,
        2.9
      ],
      [
        "daniel-david-jebbison",
        "Daniel David Jebbison",
        "ST",
        23,
        68,
        75,
        1.6
      ],
      [
        "julio-cesar-soler-barreto",
        "Julio César Soler Barreto",
        "LB",
        21,
        68,
        79,
        2.5
      ],
      [
        "william-jonathan-dennis",
        "William Jonathan Dennis",
        "GK",
        26,
        66,
        72,
        1.2
      ],
      [
        "matai-akinmboni",
        "Matai Akinmboni",
        "CB",
        19,
        57,
        74,
        0.3
      ]
    ]
  },
  {
    "id": "ars",
    "name": "Arsenal",
    "color": "#EF0107",
    "budget": 70,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "gabriel-dos-santos-magalhaes",
        "Gabriel dos Santos Magalhães",
        "CB",
        28,
        89,
        89,
        84
      ],
      [
        "david-raya-martin",
        "David Raya Martín",
        "GK",
        31,
        88,
        88,
        55
      ],
      [
        "declan-rice",
        "Declan Rice",
        "CDM",
        27,
        88,
        88,
        84
      ],
      [
        "william-alain-andre-gabriel-saliba",
        "William Alain André Gabriel Saliba",
        "CB",
        25,
        88,
        89,
        92
      ],
      [
        "bukayo-saka",
        "Bukayo Saka",
        "RW",
        25,
        87,
        90,
        119
      ],
      [
        "martin-degaard",
        "Martin Ødegaard",
        "CM",
        27,
        86,
        89,
        98
      ],
      [
        "viktor-einar-gyokeres",
        "Viktor Einar Gyökeres",
        "ST",
        28,
        86,
        88,
        93
      ],
      [
        "bruno-guimaraes-rodrigues-moura",
        "Bruno Guimarães Rodrigues Moura",
        "CM",
        28,
        86,
        87,
        78
      ],
      [
        "piero-martin-hincapie-reyna",
        "Piero Martín Hincapié Reyna",
        "LB",
        24,
        84,
        89,
        52
      ],
      [
        "eberechi-oluchi-eze",
        "Eberechi Oluchi Eze",
        "CAM",
        28,
        84,
        84,
        42
      ],
      [
        "ezri-konsa-ngoyo",
        "Ezri Konsa Ngoyo",
        "CB",
        28,
        84,
        84,
        31
      ],
      [
        "jurrien-david-norman-timber",
        "Jurriën David Norman Timber",
        "RB",
        25,
        84,
        85,
        39
      ],
      [
        "martin-zubimendi-ibanez",
        "Martín Zubimendi Ibáñez",
        "CDM",
        27,
        84,
        87,
        46
      ],
      [
        "mikel-merino-zazon",
        "Mikel Merino Zazón",
        "CM",
        30,
        83,
        83,
        36
      ],
      [
        "riccardo-calafiori",
        "Riccardo Calafiori",
        "LB",
        24,
        82,
        84,
        21
      ],
      [
        "christos-tzolis",
        "Christos Tzolis",
        "LW",
        24,
        82,
        87,
        43
      ],
      [
        "kai-lukas-havertz",
        "Kai Lukas Havertz",
        "ST",
        27,
        81,
        84,
        38
      ],
      [
        "benjamin-william-white",
        "Benjamin William White",
        "RB",
        28,
        81,
        83,
        35
      ],
      [
        "gabriel-teodoro-martinelli-silva",
        "Gabriel Teodoro Martinelli Silva",
        "LW",
        25,
        80,
        84,
        35
      ],
      [
        "chukwunonso-tristan-madueke",
        "Chukwunonso Tristan Madueke",
        "RW",
        24,
        80,
        84,
        30
      ],
      [
        "gabriel-fernando-de-jesus",
        "Gabriel Fernando de Jesus",
        "ST",
        29,
        79,
        80,
        22
      ],
      [
        "myles-anthony-lewis-skelly",
        "Myles Anthony Lewis-Skelly",
        "LB",
        19,
        78,
        87,
        28
      ],
      [
        "cristhian-andrey-mosquera-ibarguen",
        "Cristhian Andrey Mosquera Ibarguen",
        "CB",
        22,
        78,
        85,
        22
      ],
      [
        "kepa-arrizabalaga-revuelta",
        "Kepa Arrizabalaga Revuelta",
        "GK",
        31,
        78,
        79,
        12
      ],
      [
        "fabio-daniel-ferreira-vieira",
        "Fábio Daniel Ferreira Vieira",
        "CAM",
        26,
        78,
        81,
        19
      ],
      [
        "ethan-chidiebere-nwaneri",
        "Ethan Chidiebere Nwaneri",
        "RW",
        19,
        75,
        87,
        16
      ],
      [
        "reiss-luke-nelson",
        "Reiss Luke Nelson",
        "RM",
        26,
        75,
        78,
        7.5
      ],
      [
        "illan-stephane-meslier",
        "Illan Stéphane Meslier",
        "GK",
        26,
        71,
        75,
        2.4
      ]
    ]
  },
  {
    "id": "ast",
    "name": "Aston Villa",
    "color": "#670E36",
    "budget": 40,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "damian-emiliano-martinez-romero",
        "Damián Emiliano Martínez Romero",
        "GK",
        34,
        85,
        85,
        27
      ],
      [
        "boubacar-bernard-kamara",
        "Boubacar Bernard Kamara",
        "CDM",
        26,
        84,
        85,
        41
      ],
      [
        "oliver-george-arthur-watkins",
        "Oliver George Arthur Watkins",
        "ST",
        30,
        83,
        84,
        42
      ],
      [
        "john-mcginn",
        "John McGinn",
        "RM",
        31,
        83,
        83,
        25
      ],
      [
        "matthew-stuart-cash",
        "Matthew Stuart Cash",
        "RB",
        29,
        81,
        81,
        17
      ],
      [
        "pau-francisco-torres",
        "Pau Francisco Torres",
        "CB",
        29,
        81,
        81,
        18
      ],
      [
        "amadou-zeund-georges-ba-mvom-onana",
        "Amadou Zeund Georges Ba Mvom Onana",
        "CDM",
        25,
        81,
        83,
        23
      ],
      [
        "emiliano-buendia-stati",
        "Emiliano Buendía Stati",
        "LM",
        29,
        80,
        80,
        11
      ],
      [
        "johan-manzambi",
        "Johan Manzambi",
        "CM",
        20,
        80,
        84,
        2.6
      ],
      [
        "ian-ethan-maatsen",
        "Ian Ethan Maatsen",
        "LB",
        24,
        79,
        84,
        25
      ],
      [
        "joao-victor-gomes-da-silva",
        "João Victor Gomes da Silva",
        "CDM",
        25,
        78,
        83,
        20
      ],
      [
        "aaron-wan-bissaka",
        "Aaron Wan-Bissaka",
        "RB",
        28,
        78,
        81,
        22
      ],
      [
        "matteo-ruggeri",
        "Matteo Ruggeri",
        "LB",
        24,
        78,
        83,
        13
      ],
      [
        "alejandro-garnacho-ferreyra",
        "Alejandro Garnacho Ferreyra",
        "LM",
        22,
        77,
        84,
        22
      ],
      [
        "marco-bizot",
        "Marco Bizot",
        "GK",
        35,
        77,
        78,
        2.4
      ],
      [
        "tyrone-deon-mings",
        "Tyrone Deon Mings",
        "CB",
        33,
        77,
        78,
        9
      ],
      [
        "ross-barkley",
        "Ross Barkley",
        "CM",
        32,
        77,
        77,
        8.5
      ],
      [
        "leon-patrick-bailey-butler",
        "Leon Patrick Bailey Butler",
        "RM",
        29,
        77,
        79,
        19
      ],
      [
        "kevin-oghenetega-tamaraebi-bakumo-abraham",
        "Kevin Oghenetega Tamaraebi Bakumo-Abraham",
        "ST",
        28,
        77,
        77,
        12
      ],
      [
        "victor-jorgen-nilsson-lindelof",
        "Victor Jörgen Nilsson Lindelöf",
        "CB",
        32,
        77,
        77,
        4.6
      ],
      [
        "zion-suzuki",
        "Zion Suzuki",
        "GK",
        24,
        76,
        82,
        8
      ],
      [
        "lamare-trenton-chansey-bogarde",
        "Lamare Trenton Chansey Bogarde",
        "CDM",
        22,
        74,
        78,
        3.6
      ],
      [
        "modou-keba-cisse",
        "Modou Kéba Cissé",
        "CB",
        21,
        68,
        80,
        1.4
      ],
      [
        "tommi-dylan-brooklyn-oreilly",
        "Tommi Dylan Brooklyn O'Reilly",
        "RM",
        22,
        65,
        68,
        0.675
      ],
      [
        "triston-rowe",
        "Triston Rowe",
        "RB",
        19,
        65,
        80,
        0.65
      ],
      [
        "bradley-burrowes",
        "Bradley Burrowes",
        "RM",
        18,
        65,
        82,
        1.8
      ],
      [
        "joshua-feeney",
        "Joshua Feeney",
        "CB",
        21,
        64,
        75,
        0.75
      ]
    ]
  },
  {
    "id": "bre",
    "name": "Brentford",
    "color": "#E30613",
    "budget": 25,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "igor-thiago-nascimento-rodrigues",
        "Igor Thiago Nascimento Rodrigues",
        "ST",
        25,
        82,
        82,
        8
      ],
      [
        "mamadou-sangare",
        "Mamadou Sangaré",
        "CM",
        24,
        81,
        81,
        5
      ],
      [
        "michael-olabode-kayode",
        "Michael Olabode Kayode",
        "RB",
        22,
        81,
        81,
        6.5
      ],
      [
        "mikkel-krogh-damsgaard",
        "Mikkel Krogh Damsgaard",
        "CAM",
        26,
        80,
        83,
        29
      ],
      [
        "mathias-jensen",
        "Mathias Jensen",
        "CM",
        30,
        80,
        80,
        11
      ],
      [
        "caoimhin-odhran-kelleher",
        "Caoimhín Odhrán Kelleher",
        "GK",
        27,
        80,
        82,
        18
      ],
      [
        "dango-aboubacar-faissal-ouattara",
        "Dango Aboubacar Faissal Ouattara",
        "RM",
        24,
        79,
        81,
        15
      ],
      [
        "nathan-michael-collins",
        "Nathan Michael Collins",
        "CB",
        25,
        79,
        82,
        22
      ],
      [
        "kevin-schade",
        "Kevin Schade",
        "LM",
        24,
        79,
        83,
        21
      ],
      [
        "vitaly-janelt",
        "Vitaly Janelt",
        "CDM",
        28,
        78,
        78,
        8.5
      ],
      [
        "yehor-yarmoliuk",
        "Yehor Yarmoliuk",
        "CDM",
        22,
        78,
        78,
        3.8
      ],
      [
        "sepp-van-den-berg",
        "Sepp van den Berg",
        "CB",
        24,
        78,
        83,
        15
      ],
      [
        "kristoffer-vassbakk-kopp-ajer",
        "Kristoffer Vassbakk Köpp Ajer",
        "CB",
        28,
        77,
        77,
        6
      ],
      [
        "keane-william-lewis-potter",
        "Keane William Lewis-Potter",
        "LB",
        25,
        77,
        79,
        9.5
      ],
      [
        "rico-antonio-henry",
        "Rico Antonio Henry",
        "LB",
        29,
        76,
        76,
        7
      ],
      [
        "callum-eddie-graham-wilson",
        "Callum Eddie Graham Wilson",
        "ST",
        34,
        76,
        78,
        9
      ],
      [
        "jaidon-kya-denley-anthony",
        "Jaidon Kya Denley Anthony",
        "LM",
        26,
        76,
        76,
        5.5
      ],
      [
        "aaron-buchanan-hickey",
        "Aaron Buchanan Hickey",
        "RB",
        24,
        75,
        79,
        6
      ],
      [
        "ethan-rupert-pinnock",
        "Ethan Rupert Pinnock",
        "CB",
        33,
        75,
        77,
        7
      ],
      [
        "fabio-leandro-freitas-gouveia-carvalho",
        "Fábio Leandro Freitas Gouveia Carvalho",
        "CAM",
        24,
        74,
        82,
        9.5
      ],
      [
        "antoni-djibu-milambo",
        "Antoni-Djibu Milambo",
        "CM",
        21,
        73,
        85,
        7.5
      ],
      [
        "hakon-rafn-valdimarsson",
        "Hákon Rafn Valdimarsson",
        "GK",
        24,
        69,
        76,
        2.3
      ],
      [
        "jayden-ade-trindade-meghoma",
        "Jayden Ade Trindade Meghoma",
        "LB",
        20,
        68,
        78,
        1.3
      ],
      [
        "jannik-schuster",
        "Jannik Schuster",
        "CB",
        20,
        67,
        77,
        0.8
      ],
      [
        "gustavo-nunes-fernandes-gomes",
        "Gustavo Nunes Fernandes Gomes",
        "LM",
        20,
        67,
        81,
        1.8
      ],
      [
        "kaye-furo",
        "Kaye Furo",
        "ST",
        19,
        65,
        83,
        1.3
      ],
      [
        "ji-soo-kim",
        "Ji-soo Kim",
        "CB",
        21,
        65,
        76,
        1.3
      ],
      [
        "ellery-ronald-balcombe",
        "Ellery Ronald Balcombe",
        "GK",
        26,
        63,
        68,
        0.55
      ],
      [
        "benjamin-chiemela-fredrick",
        "Benjamin Chiemela Fredrick",
        "CB",
        21,
        63,
        76,
        0.75
      ]
    ]
  },
  {
    "id": "bri",
    "name": "Brighton & Hove Albion",
    "color": "#0057B8",
    "budget": 45,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "kaoru-mitoma",
        "Kaoru Mitoma",
        "LM",
        29,
        81,
        82,
        31
      ],
      [
        "luka-vuskovic",
        "Luka Vušković",
        "CB",
        19,
        81,
        87,
        5
      ],
      [
        "bart-verbruggen",
        "Bart Verbruggen",
        "GK",
        24,
        81,
        84,
        19
      ],
      [
        "yankuba-minteh",
        "Yankuba Minteh",
        "RM",
        22,
        80,
        85,
        23
      ],
      [
        "ferdi-erenay-kadoglu",
        "Ferdi Erenay Kadıoğlu",
        "LB",
        26,
        80,
        81,
        20
      ],
      [
        "carlos-noom-quomah-baleba",
        "Carlos Noom Quomah Baleba",
        "CDM",
        22,
        80,
        87,
        38
      ],
      [
        "yasin-abbas-ayari",
        "Yasin Abbas Ayari",
        "CDM",
        22,
        79,
        82,
        12
      ],
      [
        "pascal-gro",
        "Pascal Groß",
        "CDM",
        35,
        79,
        80,
        7
      ],
      [
        "mats-wieffer",
        "Mats Wieffer",
        "RB",
        26,
        79,
        82,
        18
      ],
      [
        "maxim-de-cuyper",
        "Maxim De Cuyper",
        "LB",
        25,
        78,
        86,
        31
      ],
      [
        "diego-alexander-gomez-amarilla",
        "Diego Alexander Gómez Amarilla",
        "CM",
        23,
        78,
        80,
        6
      ],
      [
        "olivier-maxime-boscagli",
        "Olivier Maxime Boscagli",
        "CB",
        28,
        78,
        81,
        19
      ],
      [
        "georginio-rutter",
        "Georginio Rutter",
        "CAM",
        24,
        77,
        83,
        17
      ],
      [
        "lewis-carl-dunk",
        "Lewis Carl Dunk",
        "CB",
        34,
        77,
        77,
        5
      ],
      [
        "matthew-sean-oriley",
        "Matthew Sean O'Riley",
        "CAM",
        25,
        77,
        83,
        21
      ],
      [
        "jack-luca-hinshelwood",
        "Jack Luca Hinshelwood",
        "CDM",
        21,
        77,
        83,
        12
      ],
      [
        "pascal-augustus-struijk",
        "Pascal Augustus Struijk",
        "CB",
        27,
        76,
        79,
        9
      ],
      [
        "promise-oluwatobi-emmanuel-david",
        "Promise Oluwatobi Emmanuel David",
        "ST",
        25,
        76,
        80,
        8.5
      ],
      [
        "joao-pedro-loureiro-da-costa",
        "João Pedro Loureiro da Costa",
        "RB",
        26,
        75,
        80,
        7.5
      ],
      [
        "igor-julio-dos-santos-de-paulo",
        "Igor Júlio dos Santos de Paulo",
        "CB",
        28,
        75,
        78,
        8
      ],
      [
        "evan-ferguson",
        "Evan Ferguson",
        "ST",
        21,
        74,
        82,
        6.5
      ],
      [
        "jason-sean-steele",
        "Jason Sean Steele",
        "GK",
        36,
        73,
        73,
        0.525
      ],
      [
        "stefanos-tzimas",
        "Stefanos Tzimas",
        "ST",
        20,
        73,
        81,
        5
      ],
      [
        "charalampos-kostoulas",
        "Charalampos Kostoulas",
        "ST",
        19,
        73,
        85,
        5.5
      ],
      [
        "michael-svoboda",
        "Michael Svoboda",
        "CB",
        27,
        72,
        72,
        1.4
      ],
      [
        "osman-ibrahim-abrahim",
        "Osman Ibrahim Abrahim",
        "LM",
        21,
        72,
        84,
        5.5
      ],
      [
        "eiran-joe-cashin",
        "Eiran Joe Cashin",
        "CB",
        24,
        71,
        79,
        4.4
      ],
      [
        "malick-junior-yalcouye",
        "Malick Junior Yalcouyé",
        "CM",
        20,
        70,
        82,
        4
      ],
      [
        "amario-cozier-duberry",
        "Amario Cozier-Duberry",
        "RM",
        21,
        69,
        78,
        2.1
      ],
      [
        "zadok-yohanna",
        "Zadok Yohanna",
        "RM",
        19,
        67,
        76,
        0.5750000000000001
      ]
    ]
  },
  {
    "id": "che",
    "name": "Chelsea",
    "color": "#034694",
    "budget": 75,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "enzo-jeremias-fernandez",
        "Enzo Jeremías Fernández",
        "CM",
        25,
        86,
        87,
        57
      ],
      [
        "moises-isaac-caicedo-corozo",
        "Moisés Isaac Caicedo Corozo",
        "CDM",
        24,
        86,
        89,
        93
      ],
      [
        "cole-jermaine-palmer",
        "Cole Jermaine Palmer",
        "CAM",
        24,
        85,
        90,
        109
      ],
      [
        "reece-james",
        "Reece James",
        "RB",
        26,
        84,
        84,
        32
      ],
      [
        "morgan-elliot-rogers",
        "Morgan Elliot Rogers",
        "CAM",
        24,
        84,
        86,
        45
      ],
      [
        "joao-pedro-junqueira-de-jesus",
        "João Pedro Junqueira de Jesus",
        "ST",
        24,
        83,
        84,
        27
      ],
      [
        "guy-maxence-lacroix",
        "Guy Maxence Lacroix",
        "CB",
        26,
        82,
        82,
        21
      ],
      [
        "pedro-lomba-neto",
        "Pedro Lomba Neto",
        "RM",
        26,
        81,
        82,
        27
      ],
      [
        "daniel-nii-tackie-mensah-welbeck",
        "Daniel Nii Tackie Mensah Welbeck",
        "ST",
        35,
        80,
        80,
        7
      ],
      [
        "robert-lynch-sanchez",
        "Robert Lynch Sánchez",
        "GK",
        28,
        80,
        80,
        11
      ],
      [
        "estevao-willian-almeida",
        "Estêvão Willian Almeida",
        "RM",
        19,
        80,
        89,
        30
      ],
      [
        "levi-lemar-samuel-colwill",
        "Levi Lemar Samuel Colwill",
        "CB",
        23,
        80,
        84,
        28
      ],
      [
        "malo-gusto",
        "Malo Gusto",
        "RB",
        23,
        79,
        84,
        25
      ],
      [
        "nicolas-jackson",
        "Nicolas Jackson",
        "ST",
        25,
        79,
        84,
        31
      ],
      [
        "valentin-barco",
        "Valentín Barco",
        "CM",
        22,
        79,
        83,
        12
      ],
      [
        "wesley-fofana",
        "Wesley Fofana",
        "CB",
        25,
        79,
        82,
        22
      ],
      [
        "josep-maria-chavarria-perez",
        "Josep María Chavarría Pérez",
        "LB",
        28,
        79,
        79,
        11
      ],
      [
        "jordan-brian-henderson",
        "Jordan Brian Henderson",
        "CDM",
        36,
        78,
        79,
        4.9
      ],
      [
        "emmanuel-esseh-emegha",
        "Emmanuel Esseh Emegha",
        "ST",
        23,
        78,
        83,
        22
      ],
      [
        "marco-palestra",
        "Marco Palestra",
        "RB",
        21,
        78,
        80,
        1.7
      ],
      [
        "mike-louis-penders",
        "Mike Louis Penders",
        "GK",
        21,
        78,
        84,
        5.5
      ],
      [
        "romeo-lavia",
        "Roméo Lavia",
        "CDM",
        22,
        78,
        85,
        27
      ],
      [
        "jorrel-hato",
        "Jorrel Hato",
        "LB",
        20,
        78,
        89,
        29
      ],
      [
        "axel-arthur-disasi",
        "Axel Arthur Disasi",
        "CB",
        28,
        77,
        78,
        11
      ],
      [
        "jamie-jermaine-bynoe-gittens",
        "Jamie Jermaine Bynoe-Gittens",
        "LM",
        22,
        77,
        85,
        28
      ],
      [
        "liam-rory-delap",
        "Liam Rory Delap",
        "ST",
        23,
        77,
        85,
        29
      ],
      [
        "mamadou-sarr",
        "Mamadou Sarr",
        "CB",
        21,
        77,
        84,
        15
      ],
      [
        "abdul-nasir-oluwatosin-oluwadoyinsolami-adarabioyo",
        "Abdul-Nasir Oluwatosin Oluwadoyinsolami Adarabioyo",
        "CB",
        28,
        77,
        80,
        15
      ],
      [
        "geovany-tcherno-quenda",
        "Geovany Tcherno Quenda",
        "RM",
        19,
        76,
        88,
        18
      ],
      [
        "dario-cassia-luis-essugo",
        "Dário Cassia Luís Essugo",
        "CDM",
        21,
        75,
        85,
        12
      ]
    ]
  },
  {
    "id": "cov",
    "name": "Coventry City",
    "color": "#78D0F2",
    "budget": 12,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "matthew-jacob-grimes",
        "Matthew Jacob Grimes",
        "CDM",
        31,
        76,
        76,
        3.6
      ],
      [
        "carl-andrew-rushworth",
        "Carl Andrew Rushworth",
        "GK",
        25,
        76,
        80,
        4.5
      ],
      [
        "ogochukwu-frank-onyeka",
        "Ogochukwu Frank Onyeka",
        "CDM",
        28,
        75,
        75,
        4.8
      ],
      [
        "jack-edward-rudoni",
        "Jack Edward Rudoni",
        "CAM",
        25,
        75,
        80,
        6.5
      ],
      [
        "gustavo-martin-emilio-hamer",
        "Gustavo Martin Emilio Hamer",
        "LM",
        29,
        75,
        77,
        11
      ],
      [
        "ephron-jardell-mason-clark",
        "Ephron Jardell Mason-Clark",
        "LM",
        27,
        75,
        75,
        2.2
      ],
      [
        "milan-fabrizio-van-ewijk",
        "Milan Fabrizio van Ewijk",
        "RB",
        26,
        75,
        79,
        6
      ],
      [
        "haji-amir-wright",
        "Haji Amir Wright",
        "ST",
        28,
        74,
        74,
        3.6
      ],
      [
        "aurele-florian-amenda",
        "Aurèle Florian Amenda",
        "CB",
        23,
        74,
        80,
        3.9
      ],
      [
        "bobby-craig-thomas",
        "Bobby Craig Thomas",
        "CB",
        25,
        74,
        77,
        2.7
      ],
      [
        "tatsuhiro-sakamoto",
        "Tatsuhiro Sakamoto",
        "RM",
        29,
        74,
        74,
        2.4
      ],
      [
        "taiwo-michael-awoniyi",
        "Taiwo Michael Awoniyi",
        "ST",
        29,
        74,
        75,
        6
      ],
      [
        "jay-rhys-dasilva",
        "Jay Rhys Dasilva",
        "LB",
        28,
        73,
        73,
        1.5
      ],
      [
        "loum-tchaouna",
        "Loum Tchaouna",
        "RM",
        23,
        73,
        78,
        3.1
      ],
      [
        "solomon-brandon-michael-clarke-thomas-asante",
        "Solomon Brandon Michael Clarke Thomas-Asante",
        "ST",
        27,
        73,
        73,
        1.7
      ],
      [
        "caleb-marfo-yirenkyi",
        "Caleb Marfo Yirenkyi",
        "CM",
        20,
        73,
        82,
        2.4
      ],
      [
        "liam-james-kitching",
        "Liam James Kitching",
        "CB",
        26,
        73,
        76,
        2.2
      ],
      [
        "victor-torp-overgaard",
        "VIctor Torp Overgaard",
        "CDM",
        27,
        73,
        73,
        2.1
      ],
      [
        "luke-matthew-woolfenden",
        "Luke Matthew Woolfenden",
        "CB",
        27,
        72,
        75,
        3.3
      ],
      [
        "sidiki-cherif",
        "Sidiki Chérif",
        "ST",
        19,
        72,
        79,
        2.4
      ],
      [
        "kaine-kesler-hayden",
        "Kaine Kesler-Hayden",
        "RB",
        23,
        72,
        79,
        4.5
      ],
      [
        "ellis-reco-simms",
        "Ellis Reco Simms",
        "ST",
        25,
        71,
        77,
        3.2
      ],
      [
        "joshua-elliot-eccles",
        "Joshua Elliot Eccles",
        "CDM",
        26,
        71,
        76,
        2.2
      ],
      [
        "joel-owen-latibeaudiere",
        "Joel Owen Latibeaudiere",
        "CB",
        26,
        71,
        74,
        1.8
      ],
      [
        "daniel-ian-bentley",
        "Daniel Ian Bentley",
        "GK",
        33,
        70,
        71,
        1
      ],
      [
        "oliver-lukas-dozae-nnonyelu-dovin",
        "Oliver Lukas Dozae Nnonyelu Dovin",
        "GK",
        24,
        70,
        79,
        3.1
      ],
      [
        "jake-brian-bidwell",
        "Jake Brian Bidwell",
        "LB",
        33,
        68,
        68,
        0.8250000000000001
      ],
      [
        "ben-wilson",
        "Ben Wilson",
        "GK",
        34,
        68,
        68,
        0.6
      ],
      [
        "miguel-angel-brau-blanquez",
        "Miguel Ángel Brau Blánquez",
        "LB",
        24,
        67,
        74,
        1.8
      ],
      [
        "raphael-borges-rodrigues",
        "Raphael Borges Rodrigues",
        "RM",
        23,
        63,
        75,
        1.2
      ]
    ]
  },
  {
    "id": "cry",
    "name": "Crystal Palace",
    "color": "#1B458F",
    "budget": 30,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "daniel-munoz-mejia",
        "Daniel Muñoz Mejía",
        "RB",
        30,
        82,
        82,
        23
      ],
      [
        "dean-bradley-henderson",
        "Dean Bradley Henderson",
        "GK",
        29,
        82,
        82,
        21
      ],
      [
        "adam-james-wharton",
        "Adam James Wharton",
        "CM",
        22,
        82,
        86,
        34
      ],
      [
        "ismaila-sarr",
        "Ismaïla Sarr",
        "RW",
        28,
        81,
        81,
        19
      ],
      [
        "jean-philippe-mateta",
        "Jean-Philippe Mateta",
        "ST",
        29,
        81,
        82,
        31
      ],
      [
        "oscar-mingueza-garcia",
        "Óscar Mingueza García",
        "RB",
        27,
        80,
        83,
        26
      ],
      [
        "christopher-jeffrey-richards",
        "Christopher Jeffrey Richards",
        "CB",
        26,
        80,
        80,
        13
      ],
      [
        "daichi-kamada",
        "Daichi Kamada",
        "CM",
        30,
        79,
        79,
        11
      ],
      [
        "tyrick-kwon-mitchell",
        "Tyrick Kwon Mitchell",
        "LB",
        27,
        79,
        80,
        16
      ],
      [
        "yeremy-jesus-pino-santos",
        "Yéremy Jesús Pino Santos",
        "LW",
        23,
        79,
        88,
        48
      ],
      [
        "anan-khalaili",
        "Anan Khalaili",
        "RM",
        22,
        78,
        84,
        6.5
      ],
      [
        "evann-guessand",
        "Evann Guessand",
        "RW",
        25,
        78,
        84,
        27
      ],
      [
        "walter-daniel-benitez",
        "Walter Daniel Benítez",
        "GK",
        33,
        78,
        79,
        8.5
      ],
      [
        "jrgen-strand-larsen",
        "Jørgen Strand Larsen",
        "ST",
        26,
        77,
        83,
        21
      ],
      [
        "william-james-hughes",
        "William James Hughes",
        "CDM",
        31,
        77,
        77,
        9
      ],
      [
        "cheick-oumar-doucoure",
        "Cheick Oumar Doucouré",
        "CDM",
        26,
        76,
        80,
        13
      ],
      [
        "jaydee-canvot",
        "Jaydee Canvot",
        "CB",
        20,
        76,
        82,
        3.5
      ],
      [
        "jefferson-andres-lerma-solis",
        "Jefferson Andrés Lerma Solís",
        "CDM",
        31,
        76,
        77,
        9
      ],
      [
        "dwight-james-matthew-mcneil",
        "Dwight James Matthew McNeil",
        "RM",
        26,
        76,
        81,
        19
      ],
      [
        "edward-keddar-nketiah",
        "Edward Keddar Nketiah",
        "ST",
        27,
        75,
        77,
        5.5
      ],
      [
        "chadi-riad-dnanou",
        "Chadi Riad Dnanou",
        "CB",
        23,
        74,
        81,
        4.9
      ],
      [
        "justin-devenny",
        "Justin Devenny",
        "CM",
        22,
        72,
        79,
        4.2
      ],
      [
        "borna-sosa",
        "Borna Sosa",
        "LB",
        28,
        72,
        73,
        2.9
      ],
      [
        "zavier-gozo",
        "Zavier Gozo",
        "RM",
        19,
        71,
        79,
        0.4
      ],
      [
        "romain-joy-kouakou-esse",
        "Romain Joy Kouakou Esse",
        "RM",
        21,
        70,
        82,
        3.8
      ],
      [
        "jesurun-rak-sakyi",
        "Jesurun Rak-Sakyi",
        "RM",
        23,
        70,
        80,
        5.5
      ],
      [
        "david-ikechukwu-ozoh",
        "David Ikechukwu Ozoh",
        "CDM",
        21,
        70,
        79,
        2.5
      ],
      [
        "joseph-charles-whitworth",
        "Joseph Charles Whitworth",
        "GK",
        22,
        66,
        78,
        1.8
      ],
      [
        "remi-luke-matthews",
        "Remi Luke Matthews",
        "GK",
        32,
        63,
        63,
        0.25
      ]
    ]
  },
  {
    "id": "eve",
    "name": "Everton",
    "color": "#003399",
    "budget": 35,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "jordan-lee-pickford",
        "Jordan Lee Pickford",
        "GK",
        32,
        85,
        85,
        23
      ],
      [
        "iliman-cheikh-baroy-ndiaye",
        "Iliman Cheikh Baroy Ndiaye",
        "LM",
        26,
        82,
        82,
        23
      ],
      [
        "james-david-garner",
        "James David Garner",
        "CDM",
        25,
        82,
        82,
        11
      ],
      [
        "kiernan-frank-dewsbury-hall",
        "Kiernan Frank Dewsbury-Hall",
        "CAM",
        28,
        81,
        81,
        13
      ],
      [
        "james-alan-tarkowski",
        "James Alan Tarkowski",
        "CB",
        33,
        80,
        80,
        14
      ],
      [
        "jarrad-paul-branthwaite",
        "Jarrad Paul Branthwaite",
        "CB",
        24,
        79,
        85,
        25
      ],
      [
        "christian-thers-nrgaard",
        "Christian Thers Nørgaard",
        "CDM",
        32,
        79,
        80,
        15
      ],
      [
        "brennan-price-johnson",
        "Brennan Price Johnson",
        "RW",
        25,
        78,
        83,
        25
      ],
      [
        "norberto-bercique-gomes-betuncal",
        "Norberto Bercique Gomes Betuncal",
        "ST",
        28,
        77,
        77,
        8
      ],
      [
        "vitalii-mykolenko",
        "Vitalii Mykolenko",
        "LB",
        27,
        77,
        79,
        15
      ],
      [
        "hayden-rhys-hackney",
        "Hayden Rhys Hackney",
        "CM",
        24,
        77,
        82,
        6.5
      ],
      [
        "jake-obrien",
        "Jake O'Brien",
        "RB",
        25,
        76,
        81,
        10
      ],
      [
        "timothy-emeka-iroegbunam",
        "Timothy Emeka Iroegbunam",
        "CDM",
        23,
        76,
        80,
        6
      ],
      [
        "thierno-barry",
        "Thierno Barry",
        "ST",
        23,
        76,
        85,
        24
      ],
      [
        "michael-vincent-keane",
        "Michael Vincent Keane",
        "CB",
        33,
        76,
        76,
        2
      ],
      [
        "carlos-jonas-alcaraz",
        "Carlos Jonás Alcaraz",
        "CAM",
        23,
        75,
        82,
        12
      ],
      [
        "merlin-rohl",
        "Merlin Röhl",
        "CAM",
        24,
        74,
        82,
        9.5
      ],
      [
        "tyler-jay-robert-dibling",
        "Tyler-Jay Robert Dibling",
        "RM",
        20,
        74,
        85,
        9
      ],
      [
        "harrison-armstrong",
        "Harrison Armstrong",
        "CM",
        19,
        73,
        83,
        2.5
      ],
      [
        "tyrique-george",
        "Tyrique George",
        "LM",
        20,
        72,
        84,
        4.4
      ],
      [
        "mark-travers",
        "Mark Travers",
        "GK",
        27,
        72,
        75,
        2.4
      ],
      [
        "nathan-kenneth-patterson",
        "Nathan Kenneth Patterson",
        "RB",
        24,
        71,
        76,
        2.6
      ],
      [
        "adam-aznou-ben-cheikh",
        "Adam Aznou Ben Cheikh",
        "LB",
        20,
        67,
        82,
        2.1
      ],
      [
        "thomas-lloyd-king",
        "Thomas Lloyd King",
        "GK",
        31,
        64,
        64,
        0.4
      ]
    ]
  },
  {
    "id": "ful",
    "name": "Fulham FC",
    "color": "#666",
    "budget": 30,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "alexander-chuka-iwobi",
        "Alexander Chuka Iwobi",
        "LM",
        30,
        80,
        80,
        21
      ],
      [
        "antonee-robinson",
        "Antonee Robinson",
        "LB",
        29,
        80,
        82,
        30
      ],
      [
        "sander-gard-bolin-berge",
        "Sander Gard Bolin Berge",
        "CDM",
        28,
        79,
        80,
        18
      ],
      [
        "joachim-christian-andersen",
        "Joachim Christian Andersen",
        "CB",
        30,
        79,
        79,
        12
      ],
      [
        "bernd-leno",
        "Bernd Leno",
        "GK",
        34,
        79,
        80,
        7
      ],
      [
        "kenny-joelle-tete",
        "Kenny Joelle Tete",
        "RB",
        30,
        78,
        78,
        9.5
      ],
      [
        "calvin-bassey-ughelumba",
        "Calvin Bassey Ughelumba",
        "CB",
        26,
        78,
        81,
        17
      ],
      [
        "emile-smith-rowe",
        "Emile Smith Rowe",
        "CAM",
        26,
        77,
        81,
        15
      ],
      [
        "kouassi-ryan-sessegnon",
        "Kouassi Ryan Sessegnon",
        "LB",
        26,
        77,
        79,
        7
      ],
      [
        "rodrigo-muniz-carvalho",
        "Rodrigo Muniz Carvalho",
        "ST",
        25,
        76,
        81,
        9
      ],
      [
        "jorge-cuenca-barreno",
        "Jorge Cuenca Barreno",
        "CB",
        26,
        76,
        78,
        5.5
      ],
      [
        "kevin-santos-lopes-de-macedo",
        "Kevin Santos Lopes de Macedo",
        "LM",
        23,
        76,
        81,
        12
      ],
      [
        "oscar-bobb",
        "Oscar Bobb",
        "RM",
        23,
        76,
        82,
        5.5
      ],
      [
        "gonzalo-garcia-torres",
        "Gonzalo García Torres",
        "ST",
        22,
        75,
        82,
        3.5
      ],
      [
        "timothy-castagne",
        "Timothy Castagne",
        "RB",
        30,
        75,
        76,
        6.5
      ],
      [
        "joshua-david-steven-king",
        "Joshua David Steven King",
        "CAM",
        19,
        74,
        83,
        2.8
      ],
      [
        "thomas-cairney",
        "Thomas Cairney",
        "CM",
        35,
        74,
        74,
        1.9
      ],
      [
        "benjamin-lecomte",
        "Benjamin Lecomte",
        "GK",
        35,
        73,
        74,
        0.725
      ],
      [
        "shea-emmanuel-charles",
        "Shea Emmanuel Charles",
        "CDM",
        22,
        73,
        82,
        5
      ],
      [
        "harrison-james-reed",
        "Harrison James Reed",
        "CDM",
        31,
        72,
        72,
        2
      ],
      [
        "luc-rollet-de-fougerolles",
        "Luc Rollet De Fougerolles",
        "CB",
        20,
        66,
        80,
        0.65
      ],
      [
        "jonah-daniel-kusi-asare",
        "Jonah Daniel Kusi-Asare",
        "ST",
        19,
        62,
        82,
        0.775
      ]
    ]
  },
  {
    "id": "hul",
    "name": "Hull City",
    "color": "#F18A00",
    "budget": 10,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "konstantinos-tzolakis",
        "Konstantinos Tzolakis",
        "GK",
        23,
        79,
        86,
        31
      ],
      [
        "hidemasa-morita",
        "Hidemasa Morita",
        "CM",
        31,
        78,
        79,
        17
      ],
      [
        "nobel-mendy",
        "Nobel Mendy",
        "CB",
        22,
        75,
        75,
        1.8
      ],
      [
        "oliver-robert-mcburnie",
        "Oliver Robert McBurnie",
        "ST",
        30,
        75,
        75,
        4.2
      ],
      [
        "jack-butland",
        "Jack Butland",
        "GK",
        33,
        75,
        75,
        2.8
      ],
      [
        "charles-roger-hughes",
        "Charles Roger Hughes",
        "CB",
        22,
        74,
        80,
        3.9
      ],
      [
        "elliot-stroud",
        "Elliot Stroud",
        "LB",
        24,
        74,
        77,
        2.8
      ],
      [
        "joseph-paul-gelhardt",
        "Joseph Paul Gelhardt",
        "CAM",
        24,
        73,
        77,
        3.2
      ],
      [
        "mohamed-bachir-belloumi",
        "Mohamed Bachir Belloumi",
        "RM",
        24,
        73,
        79,
        4.8
      ],
      [
        "john-egan",
        "John Egan",
        "CB",
        33,
        72,
        72,
        1.5
      ],
      [
        "patrick-james-coleman-mcnair",
        "Patrick James Coleman McNair",
        "CB",
        31,
        72,
        73,
        2.5
      ],
      [
        "matthew-robert-targett",
        "Matthew Robert Targett",
        "LB",
        31,
        72,
        72,
        1.6
      ],
      [
        "regan-newman-slater",
        "Regan Newman Slater",
        "CDM",
        27,
        72,
        73,
        2.1
      ],
      [
        "ryan-john-giles",
        "Ryan John Giles",
        "LB",
        26,
        72,
        75,
        2.4
      ],
      [
        "liam-alan-millar",
        "Liam Alan Millar",
        "LM",
        26,
        72,
        75,
        3.1
      ],
      [
        "matt-davidson-rider-crooks",
        "Matt Davidson Rider Crooks",
        "CAM",
        32,
        71,
        71,
        1.2
      ],
      [
        "lucas-gourna-douath",
        "Lucas Gourna-Douath",
        "CDM",
        23,
        70,
        81,
        4
      ],
      [
        "oluwasemilogo-adesewo-ibidapo-ajayi",
        "Oluwasemilogo Adesewo Ibidapo Ajayi",
        "CB",
        32,
        70,
        70,
        1.1
      ],
      [
        "lewie-jacob-coyle",
        "Lewie Jacob Coyle",
        "RB",
        30,
        70,
        70,
        1.4
      ],
      [
        "eliot-matazo",
        "Eliot Matazo",
        "CDM",
        24,
        70,
        77,
        2.7
      ],
      [
        "cody-callum-pierre-drameh",
        "Cody Callum Pierre Drameh",
        "RB",
        24,
        69,
        77,
        3
      ],
      [
        "abdulkadir-omur",
        "Abdülkadir Ömür",
        "RM",
        27,
        69,
        74,
        3.6
      ],
      [
        "kieran-oneill-dowell",
        "Kieran O'Neill Dowell",
        "RM",
        28,
        68,
        70,
        1.7
      ],
      [
        "darko-boateng-gyabi",
        "Darko Boateng Gyabi",
        "CM",
        22,
        68,
        77,
        1.9
      ],
      [
        "jens-hjert-dahl",
        "Jens Hjertø-Dahl",
        "CM",
        20,
        68,
        79,
        1.4
      ],
      [
        "babajide-david-akintola",
        "Babajide David Akintola",
        "RM",
        30,
        67,
        69,
        1.4
      ],
      [
        "lucas-herrington",
        "Lucas Herrington",
        "CB",
        19,
        66,
        81,
        0.675
      ],
      [
        "dillon-phillips",
        "Dillon Phillips",
        "GK",
        31,
        66,
        67,
        0.65
      ],
      [
        "matthew-james-jacob",
        "Matthew James Jacob",
        "LB",
        25,
        64,
        72,
        1.4
      ]
    ]
  },
  {
    "id": "ips",
    "name": "Ipswich Town",
    "color": "#0044A9",
    "budget": 12,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "daizen-maeda",
        "Daizen Maeda",
        "LM",
        28,
        78,
        79,
        19
      ],
      [
        "sasa-lukic",
        "Saša Lukić",
        "CDM",
        30,
        78,
        78,
        13
      ],
      [
        "julio-cesar-enciso-espinola",
        "Julio César Enciso Espínola",
        "CAM",
        22,
        78,
        84,
        7
      ],
      [
        "florentino-ibrain-morris-luis",
        "Florentino Ibrain Morris Luís",
        "CDM",
        27,
        77,
        83,
        25
      ],
      [
        "jaden-philogene-bidace",
        "Jaden Philogene-Bidace",
        "LM",
        24,
        76,
        81,
        9
      ],
      [
        "kjell-scherpen",
        "Kjell Scherpen",
        "GK",
        26,
        76,
        78,
        3.6
      ],
      [
        "jack-raymond-clarke",
        "Jack Raymond Clarke",
        "LM",
        25,
        75,
        80,
        6.5
      ],
      [
        "dara-joseph-oshea",
        "Dara Joseph O'Shea",
        "CB",
        27,
        75,
        78,
        6.5
      ],
      [
        "leif-davis",
        "Leif Davis",
        "LB",
        26,
        75,
        79,
        9
      ],
      [
        "issahaku-abdul-fatawu",
        "Issahaku Abdul Fatawu",
        "RM",
        22,
        75,
        83,
        15
      ],
      [
        "azor-matusiwa",
        "Azor Matusiwa",
        "CDM",
        28,
        75,
        78,
        8
      ],
      [
        "issa-laye-lucas-jean-diop",
        "Issa Laye Lucas Jean Diop",
        "CB",
        29,
        75,
        77,
        7
      ],
      [
        "cedric-kipre",
        "Cédric Kipré",
        "CB",
        29,
        74,
        76,
        4.2
      ],
      [
        "emersonn-correia-da-silva",
        "Emersonn Correia da Silva",
        "ST",
        22,
        74,
        79,
        1.7
      ],
      [
        "jacob-john-greaves",
        "Jacob John Greaves",
        "CB",
        26,
        74,
        79,
        6
      ],
      [
        "abdoul-guemissongui-ouattara",
        "Abdoul Guemissongui Ouattara",
        "RM",
        20,
        73,
        78,
        2.6
      ],
      [
        "christian-timothy-walton",
        "Christian Timothy Walton",
        "GK",
        30,
        73,
        73,
        1.2
      ],
      [
        "marcelino-ignacio-nunez-espinoza",
        "Marcelino Ignacio Núñez Espinoza",
        "CAM",
        26,
        73,
        76,
        4
      ],
      [
        "darnell-anthony-furlong",
        "Darnell Anthony Furlong",
        "RB",
        30,
        73,
        73,
        2.1
      ],
      [
        "jack-henry-philip-taylor",
        "Jack Henry Philip Taylor",
        "CDM",
        28,
        72,
        73,
        1.8
      ],
      [
        "anis-mehmeti",
        "Anis Mehmeti",
        "CAM",
        25,
        72,
        77,
        3.5
      ],
      [
        "kasey-ian-mcateer",
        "Kasey Ian McAteer",
        "RM",
        24,
        71,
        76,
        2.8
      ],
      [
        "alexander-palmer",
        "Alexander Palmer",
        "GK",
        30,
        71,
        75,
        2.6
      ],
      [
        "chuba-amechi-akpom",
        "Chuba Amechi Akpom",
        "ST",
        30,
        71,
        76,
        7.5
      ],
      [
        "chiedozie-somkelechukwu-ogbene",
        "Chiedozie Somkelechukwu Ogbene",
        "RM",
        29,
        70,
        74,
        4.2
      ],
      [
        "sindre-walle-egeli",
        "Sindre Walle Egeli",
        "RM",
        20,
        70,
        82,
        2.9
      ],
      [
        "kayne-van-oevelen",
        "Kayne van Oevelen",
        "GK",
        23,
        69,
        78,
        1.8
      ],
      [
        "cameron-humphreys",
        "Cameron Humphreys",
        "CAM",
        22,
        67,
        78,
        2.3
      ],
      [
        "ali-ibrahim-karim-ali-al-hamadi",
        "Ali Ibrahim Karim Ali Al Hamadi",
        "ST",
        24,
        65,
        73,
        1.7
      ],
      [
        "david-robert-edmund-button",
        "David Robert Edmund Button",
        "GK",
        37,
        62,
        62,
        0.045
      ]
    ]
  },
  {
    "id": "lee",
    "name": "Leeds United",
    "color": "#1D428A",
    "budget": 22,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "harry-wilson",
        "Harry Wilson",
        "RW",
        29,
        81,
        81,
        7.5
      ],
      [
        "anton-levi-stach",
        "Anton Levi Stach",
        "CM",
        27,
        80,
        82,
        21
      ],
      [
        "ethan-kwame-colm-raymond-ampadu",
        "Ethan Kwame Colm Raymond Ampadu",
        "CDM",
        26,
        80,
        80,
        9
      ],
      [
        "james-harrington-trafford",
        "James Harrington Trafford",
        "GK",
        23,
        79,
        84,
        15
      ],
      [
        "dominic-nathaniel-calvert-lewin",
        "Dominic Nathaniel Calvert-Lewin",
        "ST",
        29,
        79,
        79,
        4.3
      ],
      [
        "nico-elvedi",
        "Nico Elvedi",
        "CB",
        29,
        78,
        78,
        9
      ],
      [
        "gabriel-gudmundsson",
        "Gabriel Gudmundsson",
        "LB",
        27,
        78,
        78,
        12
      ],
      [
        "joseph-peter-rodon",
        "Joseph Peter Rodon",
        "CB",
        28,
        77,
        78,
        8
      ],
      [
        "jaka-bijol",
        "Jaka Bijol",
        "CB",
        27,
        77,
        79,
        12
      ],
      [
        "noah-arinzechukwu-okafor",
        "Noah Arinzechukwu Okafor",
        "LW",
        26,
        77,
        79,
        10
      ],
      [
        "lukas-okechukwu-nmecha",
        "Lukas Okechukwu Nmecha",
        "ST",
        27,
        76,
        77,
        9
      ],
      [
        "lucas-estella-perri",
        "Lucas Estella Perri",
        "GK",
        28,
        76,
        85,
        27
      ],
      [
        "sean-david-longstaff",
        "Sean David Longstaff",
        "CM",
        28,
        76,
        76,
        6.5
      ],
      [
        "brenden-russell-aaronson",
        "Brenden Russell Aaronson",
        "RW",
        25,
        76,
        78,
        6
      ],
      [
        "largie-ramazani",
        "Largie Ramazani",
        "LW",
        25,
        76,
        79,
        6.5
      ],
      [
        "james-michael-justin",
        "James Michael Justin",
        "RB",
        28,
        76,
        76,
        4.4
      ],
      [
        "ao-tanaka",
        "Ao Tanaka",
        "CM",
        28,
        76,
        79,
        9
      ],
      [
        "jayden-ian-bogle",
        "Jayden Ian Bogle",
        "RB",
        26,
        76,
        79,
        7.5
      ],
      [
        "daniel-owen-james",
        "Daniel Owen James",
        "RW",
        28,
        75,
        76,
        8
      ],
      [
        "ilia-iliev-gruev",
        "Ilia Iliev Gruev",
        "CDM",
        26,
        75,
        77,
        5
      ],
      [
        "tarik-muharemovic",
        "Tarik Muharemović",
        "CB",
        23,
        75,
        79,
        3.3
      ],
      [
        "degnand-wilfried-gnonto",
        "Degnand Wilfried Gnonto",
        "LW",
        22,
        74,
        83,
        9.5
      ],
      [
        "mateo-joseph-fernandez-regatillo",
        "Mateo Joseph Fernández Regatillo",
        "ST",
        22,
        72,
        81,
        3.6
      ],
      [
        "samuel-nicholas-chambers",
        "Samuel Nicholas Chambers",
        "CAM",
        19,
        62,
        78,
        0.8250000000000001
      ],
      [
        "alexander-thomas-cairns",
        "Alexander Thomas Cairns",
        "GK",
        33,
        62,
        63,
        0.24
      ]
    ]
  },
  {
    "id": "liv",
    "name": "Liverpool",
    "color": "#C8102E",
    "budget": 90,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "virgil-van-dijk",
        "Virgil van Dijk",
        "CB",
        35,
        88,
        90,
        57
      ],
      [
        "alisson-ramses-becker",
        "Alisson Ramsés Becker",
        "GK",
        33,
        87,
        89,
        51
      ],
      [
        "florian-richard-wirtz",
        "Florian Richard Wirtz",
        "CAM",
        23,
        86,
        93,
        151
      ],
      [
        "dominik-szoboszlai",
        "Dominik Szoboszlai",
        "CAM",
        25,
        86,
        86,
        50
      ],
      [
        "alexander-isak",
        "Alexander Isak",
        "ST",
        26,
        86,
        89,
        111
      ],
      [
        "ryan-jiro-gravenberch",
        "Ryan Jiro Gravenberch",
        "CDM",
        24,
        85,
        88,
        67
      ],
      [
        "hugo-ekitike",
        "Hugo Ekitiké",
        "ST",
        24,
        85,
        88,
        56
      ],
      [
        "alexis-mac-allister",
        "Alexis Mac Allister",
        "CM",
        27,
        84,
        88,
        93
      ],
      [
        "giorgi-mamardashvili",
        "Giorgi Mamardashvili",
        "GK",
        25,
        83,
        87,
        45
      ],
      [
        "cody-mathes-gakpo",
        "Cody Mathès Gakpo",
        "LM",
        27,
        82,
        85,
        50
      ],
      [
        "jeremie-agyekum-frimpong",
        "Jeremie Agyekum Frimpong",
        "RB",
        25,
        81,
        85,
        44
      ],
      [
        "milos-kerkez",
        "Milos Kerkez",
        "LB",
        22,
        81,
        86,
        42
      ],
      [
        "ronald-federico-araujo-da-silva",
        "Ronald Federico Araújo da Silva",
        "CB",
        27,
        80,
        86,
        42
      ],
      [
        "federico-chiesa",
        "Federico Chiesa",
        "RM",
        28,
        80,
        81,
        28
      ],
      [
        "conor-bradley",
        "Conor Bradley",
        "RB",
        23,
        79,
        84,
        21
      ],
      [
        "joseph-dave-gomez",
        "Joseph Dave Gomez",
        "CB",
        29,
        79,
        80,
        17
      ],
      [
        "victor-munoz-villanueva",
        "Víctor Muñoz Villanueva",
        "LM",
        23,
        79,
        79,
        1.8
      ],
      [
        "wataru-endo",
        "Wataru Endo",
        "CDM",
        33,
        78,
        79,
        12
      ],
      [
        "harvey-scott-elliott",
        "Harvey Scott Elliott",
        "CAM",
        23,
        77,
        84,
        23
      ],
      [
        "jeremy-jacquet",
        "Jérémy Jacquet",
        "CB",
        21,
        77,
        84,
        12
      ],
      [
        "konstantinos-tsimikas",
        "Konstantinos Tsimikas",
        "LB",
        30,
        76,
        77,
        9.5
      ],
      [
        "rio-bass-ray-ngumoha-adigun",
        "Rio Bass Ray Ngumoha Adigun",
        "LM",
        18,
        75,
        88,
        3.3
      ],
      [
        "vitezslav-jaros",
        "Vítězslav Jaroš",
        "GK",
        25,
        72,
        78,
        3.1
      ],
      [
        "stefan-bajcetic-maquieira",
        "Stefan Bajčetić Maquieira",
        "CDM",
        21,
        72,
        83,
        6.5
      ],
      [
        "giovanni-leoni",
        "Giovanni Leoni",
        "CB",
        19,
        71,
        82,
        3
      ],
      [
        "frederick-john-woodman",
        "Frederick John Woodman",
        "GK",
        29,
        71,
        71,
        1.3
      ],
      [
        "lewis-koumas",
        "Lewis Koumas",
        "LM",
        20,
        69,
        83,
        3.3
      ],
      [
        "james-mcconnell",
        "James McConnell",
        "CDM",
        22,
        68,
        79,
        2.5
      ],
      [
        "treymaurice-nyoni",
        "Treymaurice Nyoni",
        "CM",
        19,
        67,
        84,
        1.6
      ],
      [
        "calvin-william-ramsay",
        "Calvin William Ramsay",
        "RB",
        23,
        65,
        75,
        1.5
      ]
    ]
  },
  {
    "id": "man",
    "name": "Manchester City",
    "color": "#6CABDD",
    "budget": 85,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "erling-braut-haland",
        "Erling Braut Håland",
        "ST",
        26,
        91,
        92,
        157
      ],
      [
        "gianluigi-donnarumma",
        "Gianluigi Donnarumma",
        "GK",
        27,
        89,
        91,
        97
      ],
      [
        "ruben-dos-santos-gato-alves-dias",
        "Rúben dos Santos Gato Alves Dias",
        "CB",
        29,
        87,
        87,
        65
      ],
      [
        "mathis-rayan-cherki",
        "Mathis Rayan Cherki",
        "RW",
        23,
        86,
        88,
        53
      ],
      [
        "josko-gvardiol",
        "Joško Gvardiol",
        "CB",
        24,
        85,
        87,
        54
      ],
      [
        "addji-keaninkin-marc-israel-guehi",
        "Addji Keaninkin Marc-Israel Guéhi",
        "CB",
        26,
        85,
        85,
        35
      ],
      [
        "antoine-serlom-semenyo",
        "Antoine Serlom Semenyo",
        "RW",
        26,
        85,
        85,
        27
      ],
      [
        "philip-walter-foden",
        "Philip Walter Foden",
        "CAM",
        26,
        84,
        88,
        72
      ],
      [
        "jeremy-doku",
        "Jérémy Doku",
        "LW",
        24,
        84,
        85,
        32
      ],
      [
        "elliot-junior-anderson",
        "Elliot Junior Anderson",
        "CDM",
        23,
        84,
        85,
        30
      ],
      [
        "nico-oreilly",
        "Nico O'Reilly",
        "LB",
        21,
        83,
        83,
        6.5
      ],
      [
        "matheus-luiz-nunes",
        "Matheus Luiz Nunes",
        "RB",
        28,
        83,
        83,
        19
      ],
      [
        "omar-khaled-mohamed-marmoush",
        "Omar Khaled Mohamed Marmoush",
        "LW",
        27,
        82,
        85,
        51
      ],
      [
        "jack-peter-grealish",
        "Jack Peter Grealish",
        "LM",
        31,
        82,
        82,
        21
      ],
      [
        "abdukodir-khusanov",
        "Abdukodir Khusanov",
        "CB",
        22,
        82,
        85,
        22
      ],
      [
        "nicolas-gonzalez-iglesias",
        "Nicolás González Iglesias",
        "CDM",
        24,
        81,
        85,
        26
      ],
      [
        "rayan-ait-nouri",
        "Rayan Aït Nouri",
        "LB",
        25,
        81,
        85,
        35
      ],
      [
        "mateo-kovacic",
        "Mateo Kovačić",
        "CM",
        32,
        81,
        83,
        30
      ],
      [
        "savio-moreira-de-oliveira",
        "Sávio Moreira de Oliveira",
        "RW",
        22,
        80,
        87,
        47
      ],
      [
        "geronimo-rulli",
        "Gerónimo Rulli",
        "GK",
        34,
        80,
        82,
        10
      ],
      [
        "rico-henry-mark-lewis",
        "Rico Henry Mark Lewis",
        "RB",
        21,
        77,
        84,
        20
      ],
      [
        "vitor-de-oliveira-nunes-dos-reis",
        "Vitor de Oliveira Nunes dos Reis",
        "CB",
        20,
        76,
        84,
        3.5
      ],
      [
        "abdulai-juma-bah",
        "Abdulai Juma Bah",
        "CB",
        20,
        73,
        83,
        4.7
      ],
      [
        "claudio-jeremias-echeverri",
        "Claudio Jeremías Echeverri",
        "CAM",
        20,
        73,
        86,
        10
      ],
      [
        "issa-kabore",
        "Issa Kaboré",
        "RB",
        25,
        72,
        80,
        6
      ],
      [
        "marcus-bettinelli",
        "Marcus Bettinelli",
        "GK",
        34,
        69,
        70,
        0.525
      ],
      [
        "joshua-darius-kamani-wilson-esbrand",
        "Joshua Darius Kamani Wilson-Esbrand",
        "LB",
        23,
        66,
        78,
        2.2
      ]
    ]
  },
  {
    "id": "mun",
    "name": "Manchester United",
    "color": "#DA291C",
    "budget": 65,
    "preferredFormation": "4-3-3",
    "players": [
      [
        "bruno-miguel-borges-fernandes",
        "Bruno Miguel Borges Fernandes",
        "CAM",
        32,
        89,
        89,
        77
      ],
      [
        "youri-tielemans",
        "Youri Tielemans",
        "CM",
        29,
        85,
        85,
        54
      ],
      [
        "matheus-santos-carneiro-da-cunha",
        "Matheus Santos Carneiro da Cunha",
        "LM",
        27,
        84,
        85,
        45
      ],
      [
        "bryan-tetsadong-marceau-mbeumo",
        "Bryan Tetsadong Marceau Mbeumo",
        "RM",
        27,
        84,
        86,
        65
      ],
      [
        "senne-lammens",
        "Senne Lammens",
        "GK",
        24,
        82,
        87,
        28
      ],
      [
        "lisandro-martinez",
        "Lisandro Martínez",
        "CB",
        28,
        82,
        82,
        26
      ],
      [
        "marcus-rashford",
        "Marcus Rashford",
        "LW",
        28,
        82,
        82,
        23
      ],
      [
        "benjamin-sesko",
        "Benjamin Šeško",
        "ST",
        23,
        82,
        88,
        48
      ],
      [
        "matthijs-de-ligt",
        "Matthijs de Ligt",
        "CB",
        27,
        82,
        84,
        34
      ],
      [
        "jacob-harry-maguire",
        "Jacob Harry Maguire",
        "CB",
        33,
        82,
        82,
        14
      ],
      [
        "kobbie-mainoo",
        "Kobbie Mainoo",
        "CDM",
        21,
        81,
        85,
        23
      ],
      [
        "noussair-mazraoui",
        "Noussair Mazraoui",
        "RB",
        28,
        80,
        81,
        22
      ],
      [
        "andrey-nascimento-dos-santos",
        "Andrey Nascimento dos Santos",
        "CM",
        22,
        80,
        87,
        43
      ],
      [
        "luke-paul-hoare-shaw",
        "Luke Paul Hoare Shaw",
        "LB",
        31,
        79,
        79,
        15
      ],
      [
        "amad-diallo-traore",
        "Amad Diallo Traoré",
        "RM",
        24,
        79,
        85,
        28
      ],
      [
        "patrick-chinazaekpere-dorgu",
        "Patrick Chinazaekpere Dorgu",
        "LM",
        21,
        78,
        84,
        9
      ],
      [
        "leny-yoro",
        "Leny Yoro",
        "CB",
        20,
        78,
        86,
        29
      ],
      [
        "mason-tony-mount",
        "Mason Tony Mount",
        "CAM",
        27,
        78,
        78,
        13
      ],
      [
        "jose-diogo-dalot-teixeira",
        "José Diogo Dalot Teixeira",
        "RB",
        27,
        78,
        81,
        20
      ],
      [
        "joshua-orobosa-zirkzee",
        "Joshua Orobosa Zirkzee",
        "ST",
        25,
        77,
        83,
        17
      ],
      [
        "manuel-ugarte-ribeiro",
        "Manuel Ugarte Ribeiro",
        "CDM",
        25,
        77,
        83,
        23
      ],
      [
        "karl-darlow",
        "Karl Darlow",
        "GK",
        35,
        76,
        76,
        0.4
      ],
      [
        "ayden-edford-heaven",
        "Ayden Edford Heaven",
        "CB",
        19,
        75,
        84,
        3
      ],
      [
        "tobias-christopher-collyer",
        "Tobias Christopher Collyer",
        "CDM",
        22,
        70,
        78,
        3.4
      ],
      [
        "harry-john-amass",
        "Harry John Amass",
        "LB",
        19,
        69,
        83,
        2.7
      ],
      [
        "thomas-david-heaton",
        "Thomas David Heaton",
        "GK",
        40,
        67,
        67,
        0.11
      ],
      [
        "daniel-gore",
        "Daniel Gore",
        "CM",
        21,
        66,
        77,
        0.85
      ],
      [
        "chidozie-obi-martin",
        "Chidozie Obi-Martin",
        "ST",
        18,
        65,
        84,
        1.8
      ],
      [
        "diego-basilio-leon-blanco",
        "Diego Basilio León Blanco",
        "LB",
        19,
        64,
        85,
        1.8
      ],
      [
        "ethan-joseph-wheatley",
        "Ethan Joseph Wheatley",
        "ST",
        20,
        63,
        81,
        0.925
      ]
    ]
  },
  {
    "id": "new",
    "name": "Newcastle United",
    "color": "#241F20",
    "budget": 45,
    "preferredFormation": "4-3-3",
    "players": [
      [
        "lewis-kieran-hall",
        "Lewis Kieran Hall",
        "LB",
        22,
        83,
        86,
        31
      ],
      [
        "fabian-lukas-schar",
        "Fabian Lukas Schär",
        "CB",
        34,
        81,
        82,
        15
      ],
      [
        "malick-laye-thiaw",
        "Malick Laye Thiaw",
        "CB",
        25,
        81,
        84,
        20
      ],
      [
        "sven-adriaan-botman",
        "Sven Adriaan Botman",
        "CB",
        26,
        81,
        85,
        36
      ],
      [
        "valentino-francisco-livramento",
        "Valentino Francisco Livramento",
        "RB",
        23,
        81,
        86,
        32
      ],
      [
        "harvey-lewis-barnes",
        "Harvey Lewis Barnes",
        "LW",
        28,
        80,
        80,
        23
      ],
      [
        "joelinton-cassio-apolinario-de-lira",
        "Joelinton Cassio Apolinário de Lira",
        "CM",
        30,
        80,
        82,
        31
      ],
      [
        "yoane-wissa",
        "Yoane Wissa",
        "ST",
        30,
        80,
        82,
        31
      ],
      [
        "nick-woltemade",
        "Nick Woltemade",
        "ST",
        24,
        80,
        84,
        27
      ],
      [
        "anthony-david-junior-elanga",
        "Anthony David Junior Elanga",
        "RW",
        24,
        79,
        84,
        35
      ],
      [
        "jacob-kai-murphy",
        "Jacob Kai Murphy",
        "RW",
        31,
        79,
        81,
        25
      ],
      [
        "daniel-johnson-burn",
        "Daniel Johnson Burn",
        "CB",
        34,
        79,
        79,
        8.5
      ],
      [
        "nicholas-david-pope",
        "Nicholas David Pope",
        "GK",
        34,
        78,
        81,
        8.5
      ],
      [
        "jacob-matthew-ramsey",
        "Jacob Matthew Ramsey",
        "CM",
        25,
        78,
        82,
        20
      ],
      [
        "bazoumana-toure",
        "Bazoumana Touré",
        "LW",
        20,
        78,
        85,
        3.8
      ],
      [
        "lukas-hornicek",
        "Lukáš Horníček",
        "GK",
        24,
        77,
        83,
        6
      ],
      [
        "lewis-miley",
        "Lewis Miley",
        "CM",
        20,
        77,
        86,
        5.5
      ],
      [
        "amar-dedic",
        "Amar Dedić",
        "RB",
        24,
        76,
        79,
        6
      ],
      [
        "joseph-george-willock",
        "Joseph George Willock",
        "CM",
        27,
        76,
        78,
        9.5
      ],
      [
        "william-idamudia-daugaard-osula",
        "William Idamudia Daugaard Osula",
        "ST",
        23,
        75,
        78,
        2.7
      ],
      [
        "aladji-bamba",
        "Aladji Bamba",
        "CM",
        20,
        72,
        79,
        1.6
      ],
      [
        "sean-steur",
        "Sean Steur",
        "CM",
        18,
        72,
        83,
        1.5
      ],
      [
        "ewen-jaouen",
        "Ewen Jaouen",
        "GK",
        20,
        70,
        82,
        2.5
      ],
      [
        "mark-joseph-gillespie",
        "Mark Joseph Gillespie",
        "GK",
        34,
        62,
        62,
        0.13
      ]
    ]
  },
  {
    "id": "not",
    "name": "Nottingham Forest",
    "color": "#DD0000",
    "budget": 30,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "morgan-anthony-gibbs-white",
        "Morgan Anthony Gibbs-White",
        "CAM",
        26,
        83,
        84,
        38
      ],
      [
        "murillo-santiago-costa-dos-santos",
        "Murillo Santiago Costa dos Santos",
        "CB",
        24,
        82,
        87,
        48
      ],
      [
        "christopher-grant-wood",
        "Christopher Grant Wood",
        "ST",
        34,
        81,
        82,
        20
      ],
      [
        "matz-willy-els-sels",
        "Matz Willy Els Sels",
        "GK",
        34,
        81,
        83,
        12
      ],
      [
        "ousmane-diomande",
        "Ousmane Diomande",
        "CB",
        22,
        81,
        87,
        40
      ],
      [
        "nikola-milenkovic",
        "Nikola Milenković",
        "CB",
        28,
        80,
        84,
        37
      ],
      [
        "neco-shay-williams",
        "Neco Shay Williams",
        "LB",
        25,
        80,
        81,
        18
      ],
      [
        "temitayo-olufisayo-olaoluwa-aina",
        "Temitayo Olufisayo Olaoluwa Aina",
        "RB",
        29,
        79,
        80,
        19
      ],
      [
        "arnaud-kalimuendo-muinga",
        "Arnaud Kalimuendo Muinga",
        "ST",
        24,
        78,
        82,
        21
      ],
      [
        "xaver-schlager",
        "Xaver Schlager",
        "CDM",
        28,
        78,
        82,
        23
      ],
      [
        "callum-james-hudson-odoi",
        "Callum James Hudson-Odoi",
        "LM",
        25,
        78,
        82,
        20
      ],
      [
        "ibrahim-sangare",
        "Ibrahim Sangaré",
        "CDM",
        28,
        78,
        79,
        12
      ],
      [
        "nicolas-martin-dominguez",
        "Nicolás Martín Domínguez",
        "CDM",
        28,
        78,
        80,
        18
      ],
      [
        "dan-assane-ndoye",
        "Dan Assane Ndoye",
        "LM",
        25,
        77,
        82,
        24
      ],
      [
        "igor-jesus-maciel-da-cruz",
        "Igor Jesus Maciel da Cruz",
        "ST",
        25,
        77,
        81,
        16
      ],
      [
        "omari-elijah-giraud-hutchinson",
        "Omari Elijah Giraud-Hutchinson",
        "RM",
        22,
        76,
        83,
        13
      ],
      [
        "dilane-bakwa",
        "Dilane Bakwa",
        "RM",
        24,
        76,
        84,
        23
      ],
      [
        "nicolo-savona",
        "Nicolò Savona",
        "RB",
        23,
        75,
        80,
        4
      ],
      [
        "ryan-james-yates",
        "Ryan James Yates",
        "CDM",
        28,
        75,
        78,
        11
      ],
      [
        "felipe-rodrigues-da-silva",
        "Felipe Rodrigues da Silva",
        "CB",
        25,
        75,
        81,
        10
      ],
      [
        "jair-paula-da-cunha-filho",
        "Jair Paula da Cunha Filho",
        "CB",
        21,
        75,
        81,
        7.5
      ],
      [
        "james-john-mcatee",
        "James John McAtee",
        "RM",
        23,
        73,
        81,
        7
      ],
      [
        "luca-netz",
        "Luca Netz",
        "LB",
        23,
        73,
        77,
        3.4
      ],
      [
        "john-victor-maciel-furtado",
        "John Victor Maciel Furtado",
        "GK",
        30,
        71,
        71,
        1.3
      ],
      [
        "tyler-grant-bindon",
        "Tyler Grant Bindon",
        "CB",
        21,
        70,
        82,
        3.2
      ],
      [
        "steven-andreas-benda",
        "Steven-Andreas Benda",
        "GK",
        27,
        68,
        70,
        1
      ],
      [
        "zach-macfarlane-abbott",
        "Zach MacFarlane Abbott",
        "CB",
        20,
        63,
        77,
        0.6
      ],
      [
        "eric-emanuel-da-silva-moreira",
        "Eric Emanuel da Silva Moreira",
        "RB",
        20,
        61,
        78,
        0.85
      ]
    ]
  },
  {
    "id": "sun",
    "name": "Sunderland",
    "color": "#E03A3E",
    "budget": 20,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "granit-xhaka",
        "Granit Xhaka",
        "CDM",
        33,
        85,
        85,
        36
      ],
      [
        "omar-federico-alderete-fernandez",
        "Omar Federico Alderete Fernández",
        "CB",
        29,
        81,
        81,
        14
      ],
      [
        "nordi-mukiele-mulere",
        "Nordi Mukiele Mulere",
        "RB",
        28,
        81,
        81,
        19
      ],
      [
        "robin-roefs",
        "Robin Roefs",
        "GK",
        23,
        81,
        84,
        8
      ],
      [
        "enzo-jeremy-le-fee",
        "Enzo Jérémy Le Fée",
        "CAM",
        26,
        80,
        80,
        11
      ],
      [
        "noah-junior-sadiki",
        "Noah Junior Sadiki",
        "CDM",
        21,
        80,
        83,
        9
      ],
      [
        "reinildo-isnard-mandava",
        "Reinildo Isnard Mandava",
        "LB",
        32,
        80,
        80,
        13
      ],
      [
        "brian-ebenezer-adjei-brobbey",
        "Brian Ebenezer Adjei Brobbey",
        "ST",
        24,
        78,
        83,
        17
      ],
      [
        "daniel-george-ballard",
        "Daniel George Ballard",
        "CB",
        26,
        78,
        78,
        4
      ],
      [
        "trai-hume",
        "Trai Hume",
        "RB",
        24,
        78,
        79,
        6
      ],
      [
        "thomas-andre-a-meunier",
        "Thomas Andre A. Meunier",
        "RB",
        35,
        78,
        78,
        3.9
      ],
      [
        "mouhamadou-habib-diarra",
        "Mouhamadou Habib Diarra",
        "CM",
        22,
        77,
        83,
        17
      ],
      [
        "chemsdine-talbi",
        "Chemsdine Talbi",
        "RM",
        21,
        77,
        86,
        7.5
      ],
      [
        "simon-adingra",
        "Simon Adingra",
        "LM",
        24,
        76,
        83,
        15
      ],
      [
        "dayann-methalie",
        "Dayann Methalie",
        "LB",
        20,
        75,
        80,
        1.5
      ],
      [
        "wilson-isidor",
        "Wilson Isidor",
        "ST",
        26,
        75,
        77,
        3.6
      ],
      [
        "christopher-john-rigg",
        "Christopher John Rigg",
        "CAM",
        19,
        74,
        84,
        3.7
      ],
      [
        "luke-terry-onien",
        "Luke Terry O'Nien",
        "CB",
        31,
        73,
        73,
        1.9
      ],
      [
        "nilson-david-angulo-ramirez",
        "Nilson David Angulo Ramírez",
        "LM",
        23,
        73,
        78,
        2.3
      ],
      [
        "alan-james-browne",
        "Alan James Browne",
        "CM",
        31,
        72,
        72,
        2.2
      ],
      [
        "romaine-lee-mundle",
        "Romaine Lee Mundle",
        "LM",
        23,
        72,
        79,
        4.2
      ],
      [
        "jenson-seelt",
        "Jenson Seelt",
        "CB",
        23,
        68,
        78,
        2
      ],
      [
        "melker-ellborg",
        "Melker Ellborg",
        "GK",
        23,
        68,
        73,
        0.775
      ],
      [
        "ajibola-joshua-odunayo-afolarin-alese",
        "Ajibola Joshua Odunayo Afolarin Alese",
        "LB",
        25,
        66,
        73,
        1.6
      ],
      [
        "abdoullah-ba",
        "Abdoullah Ba",
        "RW",
        23,
        65,
        70,
        1.2
      ],
      [
        "simon-william-moore",
        "Simon William Moore",
        "GK",
        36,
        65,
        66,
        0.09
      ]
    ]
  },
  {
    "id": "tot",
    "name": "Tottenham Hotspur",
    "color": "#132257",
    "budget": 55,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "sandro-tonali",
        "Sandro Tonali",
        "CDM",
        26,
        85,
        88,
        77
      ],
      [
        "pedro-antonio-porro-sauceda",
        "Pedro Antonio Porro Sauceda",
        "RB",
        27,
        83,
        85,
        37
      ],
      [
        "marcos-nicolas-senesi-baron",
        "Marcos Nicolás Senesi Barón",
        "CB",
        29,
        82,
        82,
        12
      ],
      [
        "james-daniel-maddison",
        "James Daniel Maddison",
        "CM",
        29,
        82,
        84,
        42
      ],
      [
        "mohammed-kudus",
        "Mohammed Kudus",
        "RM",
        26,
        81,
        83,
        29
      ],
      [
        "jan-paul-van-hecke",
        "Jan Paul van Hecke",
        "CB",
        26,
        81,
        83,
        25
      ],
      [
        "dejan-kulusevski",
        "Dejan Kulusevski",
        "CM",
        26,
        81,
        86,
        48
      ],
      [
        "xavier-quentin-shay-simons",
        "Xavier Quentin Shay Simons",
        "CAM",
        23,
        81,
        87,
        59
      ],
      [
        "micky-van-de-ven",
        "Micky van de Ven",
        "CB",
        25,
        81,
        85,
        37
      ],
      [
        "mateus-goncalo-espanha-fernandes",
        "Mateus Gonçalo Espanha Fernandes",
        "CM",
        22,
        80,
        85,
        17
      ],
      [
        "andrew-henry-robertson",
        "Andrew Henry Robertson",
        "LB",
        32,
        80,
        82,
        22
      ],
      [
        "dominic-ayodele-solanke-mitchell",
        "Dominic Ayodele Solanke-Mitchell",
        "ST",
        29,
        79,
        80,
        23
      ],
      [
        "kevin-danso",
        "Kevin Danso",
        "CB",
        27,
        79,
        82,
        21
      ],
      [
        "iyenoma-destiny-udogie",
        "Iyenoma Destiny Udogie",
        "LB",
        23,
        79,
        84,
        29
      ],
      [
        "rodrigo-bentancur-colman",
        "Rodrigo Bentancur Colmán",
        "CDM",
        29,
        79,
        81,
        21
      ],
      [
        "pape-matar-sarr",
        "Pape Matar Sarr",
        "CM",
        24,
        79,
        84,
        27
      ],
      [
        "lucas-erik-holger-bergvall",
        "Lucas Erik Holger Bergvall",
        "CM",
        20,
        78,
        87,
        23
      ],
      [
        "wilson-serge-eric-odobert",
        "Wilson Serge Eric Odobert",
        "LM",
        21,
        78,
        83,
        13
      ],
      [
        "mathys-henri-tel",
        "Mathys Henri Tel",
        "LM",
        21,
        78,
        86,
        24
      ],
      [
        "conor-gallagher",
        "Conor Gallagher",
        "CM",
        26,
        78,
        85,
        36
      ],
      [
        "richarlison-de-andrade",
        "Richarlison de Andrade",
        "ST",
        29,
        78,
        78,
        15
      ],
      [
        "antonin-kinsky",
        "Antonín Kinský",
        "GK",
        23,
        77,
        81,
        7.5
      ],
      [
        "archie-gray",
        "Archie Gray",
        "CDM",
        20,
        77,
        86,
        12
      ],
      [
        "martin-dubravka",
        "Martin Dúbravka",
        "GK",
        37,
        77,
        77,
        1.2
      ],
      [
        "mikey-steven-danny-moore",
        "Mikey Steven Danny Moore",
        "LW",
        19,
        74,
        86,
        5.5
      ],
      [
        "benjamin-thomas-davies",
        "Benjamin Thomas Davies",
        "CB",
        33,
        74,
        75,
        3.6
      ],
      [
        "kota-takai",
        "Kota Takai",
        "CB",
        22,
        72,
        79,
        4.3
      ],
      [
        "jamie-paul-donley",
        "Jamie Paul Donley",
        "CAM",
        21,
        67,
        81,
        2.5
      ],
      [
        "brandon-anthony-austin",
        "Brandon Anthony Austin",
        "GK",
        27,
        67,
        71,
        1.1
      ],
      [
        "george-benedict-abbott",
        "George Benedict Abbott",
        "CM",
        21,
        66,
        78,
        1.7
      ]
    ]
  }
];

const RAW_CHAMPIONSHIPCLUBS = [
  {
    "id": "bir",
    "name": "Birmingham City",
    "color": "#0000FF",
    "budget": 0,
    "preferredFormation": "4-2-3-1",
    "tier": "championship",
    "players": [
      [
        "carlos-vicente-robles",
        "Carlos Vicente Robles",
        "RM",
        27,
        76,
        79,
        17
      ],
      [
        "marvin-ducksch",
        "Marvin Ducksch",
        "ST",
        32,
        73,
        76,
        6.5
      ],
      [
        "christoph-klarer",
        "Christoph Klarer",
        "CB",
        26,
        73,
        76,
        2.9
      ],
      [
        "luis-ismael-vazquez",
        "Luis Ismael Vázquez",
        "ST",
        25,
        73,
        74,
        2.1
      ],
      [
        "tomoki-iwata",
        "Tomoki Iwata",
        "RB",
        29,
        72,
        73,
        2.3
      ],
      [
        "max-andrew-bird",
        "Max Andrew Bird",
        "CM",
        26,
        72,
        77,
        4.3
      ],
      [
        "kristoffer-lund-hansen",
        "Kristoffer Lund Hansen",
        "LB",
        24,
        72,
        78,
        3.6
      ],
      [
        "phil-yannik-neumann",
        "Phil Yannik Neumann",
        "CB",
        29,
        72,
        75,
        3.2
      ],
      [
        "demarai-ramelle-gray",
        "Demarai Ramelle Gray",
        "LM",
        30,
        72,
        72,
        2.3
      ],
      [
        "dael-jonathan-fry",
        "Dael Jonathan Fry",
        "CB",
        29,
        72,
        74,
        2.5
      ],
      [
        "seung-ho-paik",
        "Seung-ho Paik",
        "CDM",
        29,
        72,
        72,
        2.1
      ],
      [
        "patrick-john-joseph-roberts",
        "Patrick John Joseph Roberts",
        "RM",
        29,
        72,
        72,
        2.4
      ],
      [
        "marc-henry-leonard",
        "Marc Henry Leonard",
        "CDM",
        24,
        71,
        76,
        2.8
      ],
      [
        "jhon-elmer-solis-romero",
        "Jhon Elmer Solís Romero",
        "CDM",
        21,
        71,
        81,
        3.9
      ],
      [
        "alexander-william-cochrane",
        "Alexander William Cochrane",
        "LB",
        26,
        71,
        76,
        3
      ],
      [
        "bright-osayi-samuel",
        "Bright Osayi-Samuel",
        "RB",
        28,
        71,
        77,
        8
      ],
      [
        "lee-david-buchanan",
        "Lee David Buchanan",
        "LB",
        25,
        70,
        76,
        2.4
      ],
      [
        "kanya-fujimoto",
        "Kanya Fujimoto",
        "CAM",
        27,
        70,
        77,
        5.5
      ],
      [
        "jay-stansfield",
        "Jay Stansfield",
        "ST",
        23,
        70,
        80,
        3.2
      ],
      [
        "august-priske-flyger",
        "August Priske Flyger",
        "ST",
        22,
        70,
        75,
        1.9
      ],
      [
        "james-giles-beadle",
        "James Giles Beadle",
        "GK",
        22,
        70,
        82,
        3.4
      ],
      [
        "ethan-benjamin-laird",
        "Ethan Benjamin Laird",
        "RB",
        25,
        70,
        75,
        2.1
      ],
      [
        "jack-robinson",
        "Jack Robinson",
        "CB",
        33,
        70,
        71,
        1.3
      ],
      [
        "taylor-gardner-hickman",
        "Taylor Gardner-Hickman",
        "CM",
        24,
        68,
        76,
        2.8
      ],
      [
        "scott-wright",
        "Scott Wright",
        "RM",
        29,
        68,
        69,
        1.5
      ],
      [
        "ryan-allsop",
        "Ryan Allsop",
        "GK",
        34,
        68,
        68,
        0.4
      ],
      [
        "bradley-paul-mayo",
        "Bradley Paul Mayo",
        "GK",
        22,
        55,
        68,
        0.23
      ]
    ]
  },
  {
    "id": "bla",
    "name": "Blackburn Rovers",
    "color": "#009EE0",
    "budget": 0,
    "preferredFormation": "4-3-1-2",
    "tier": "championship",
    "players": [
      [
        "todd-owen-cantwell",
        "Todd Owen Cantwell",
        "CAM",
        28,
        73,
        73,
        2.7
      ],
      [
        "oladapo-joshua-afolayan",
        "Oladapo Joshua Afolayan",
        "RM",
        29,
        70,
        72,
        2.5
      ],
      [
        "sean-desmond-mcloughlin",
        "Sean Desmond McLoughlin",
        "CB",
        29,
        70,
        70,
        1
      ],
      [
        "ryoya-morishita",
        "Ryoya Morishita",
        "CAM",
        29,
        70,
        70,
        1.6
      ],
      [
        "ryan-fiyinfoluwa-alebiosu",
        "Ryan Fiyinfoluwa Alebiosu",
        "RB",
        24,
        70,
        70,
        0.7000000000000001
      ],
      [
        "yuki-ohashi",
        "Yuki Ohashi",
        "ST",
        30,
        70,
        70,
        1.4
      ],
      [
        "balazs-toth",
        "Balázs Tóth",
        "GK",
        29,
        69,
        69,
        0.725
      ],
      [
        "aynsley-alan-william-pears",
        "Aynsley Alan William Pears",
        "GK",
        28,
        69,
        72,
        1.4
      ],
      [
        "moussa-baradji",
        "Moussa Baradji",
        "CM",
        25,
        69,
        73,
        1.8
      ],
      [
        "andri-lucas-gujohnsen",
        "Andri Lucas Guðjohnsen",
        "ST",
        24,
        69,
        74,
        1.9
      ],
      [
        "hayden-james-carter",
        "Hayden James Carter",
        "CB",
        26,
        68,
        75,
        2.1
      ],
      [
        "lewis-miller",
        "Lewis Miller",
        "CB",
        26,
        68,
        71,
        1.2
      ],
      [
        "adam-john-forshaw",
        "Adam John Forshaw",
        "CM",
        34,
        68,
        68,
        0.75
      ],
      [
        "mathias-jrgensen",
        "Mathias Jørgensen",
        "LM",
        25,
        68,
        69,
        1.2
      ],
      [
        "scott-bradley-wharton",
        "Scott Bradley Wharton",
        "CB",
        28,
        68,
        69,
        1.3
      ],
      [
        "yuri-oliveira-ribeiro",
        "Yuri Oliveira Ribeiro",
        "LB",
        29,
        68,
        70,
        1.4
      ],
      [
        "harry-leslie-pickering",
        "Harry Leslie Pickering",
        "LB",
        27,
        67,
        70,
        1.5
      ],
      [
        "dion-de-neve",
        "Dion De Neve",
        "LB",
        25,
        67,
        74,
        1.9
      ],
      [
        "augustus-kargbo",
        "Augustus Kargbo",
        "ST",
        27,
        67,
        70,
        1.4
      ],
      [
        "axel-henriksson",
        "Axel Henriksson",
        "CM",
        24,
        66,
        75,
        1.9
      ],
      [
        "jayden-raymond-fevrier",
        "Jayden Raymond Fevrier",
        "RM",
        23,
        66,
        71,
        1.2
      ],
      [
        "connor-patrick-oriordan",
        "Connor Patrick O'Riordan",
        "CB",
        22,
        65,
        75,
        1.2
      ],
      [
        "kristi-julian-montgomery",
        "Kristi Julian Montgomery",
        "CM",
        22,
        64,
        69,
        0.425
      ],
      [
        "matthew-litherland",
        "Matthew Litherland",
        "CB",
        20,
        62,
        72,
        0.275
      ],
      [
        "jake-joseph-garrett",
        "Jake Joseph Garrett",
        "CDM",
        23,
        61,
        70,
        0.925
      ],
      [
        "igor-tyjon",
        "Igor Tyjon",
        "ST",
        18,
        58,
        82,
        0.525
      ]
    ]
  },
  {
    "id": "brs",
    "name": "Bristol City",
    "color": "#E21C21",
    "budget": 0,
    "preferredFormation": "4-3-1-2",
    "tier": "championship",
    "players": [
      [
        "robert-joseph-andrew-dickie",
        "Robert Joseph Andrew Dickie",
        "CB",
        30,
        73,
        73,
        2.5
      ],
      [
        "tomi-horvat",
        "Tomi Horvat",
        "CM",
        27,
        72,
        76,
        4
      ],
      [
        "scott-edward-twine",
        "Scott Edward Twine",
        "CAM",
        27,
        72,
        73,
        2.8
      ],
      [
        "jason-paul-knight",
        "Jason Paul Knight",
        "CM",
        25,
        72,
        79,
        4.8
      ],
      [
        "robert-philip-atkinson",
        "Robert Philip Atkinson",
        "CB",
        28,
        72,
        74,
        2.2
      ],
      [
        "luke-mcnally",
        "Luke McNally",
        "CB",
        26,
        71,
        76,
        2.9
      ],
      [
        "george-tanner",
        "George Tanner",
        "CB",
        26,
        70,
        74,
        2.1
      ],
      [
        "dominic-ballard",
        "Dominic Ballard",
        "ST",
        21,
        70,
        73,
        0.875
      ],
      [
        "adam-fletcher-randell",
        "Adam Fletcher Randell",
        "CM",
        25,
        70,
        75,
        2.2
      ],
      [
        "jed-fearnley-wallace",
        "Jed Fearnley Wallace",
        "RM",
        32,
        70,
        70,
        1.3
      ],
      [
        "cameron-lewis-moir-pring",
        "Cameron Lewis Moir-Pring",
        "LB",
        28,
        70,
        71,
        1.7
      ],
      [
        "joseph-michael-williams",
        "Joseph Michael Williams",
        "CDM",
        29,
        69,
        71,
        1.5
      ],
      [
        "yu-hirakawa",
        "Yu Hirakawa",
        "RM",
        25,
        69,
        74,
        1.9
      ],
      [
        "lorent-tolaj",
        "Lorent Tolaj",
        "ST",
        24,
        68,
        72,
        1.4
      ],
      [
        "gibson-yah",
        "Gibson Yah",
        "CDM",
        22,
        68,
        73,
        1.1
      ],
      [
        "noah-eile",
        "Noah Eile",
        "CB",
        24,
        68,
        78,
        2.1
      ],
      [
        "sam-greenwood",
        "Sam Greenwood",
        "CAM",
        24,
        68,
        75,
        2.4
      ],
      [
        "samuel-lloyd-tickle",
        "Samuel Lloyd Tickle",
        "GK",
        24,
        66,
        75,
        2
      ],
      [
        "samuel-john-bell",
        "Samuel John Bell",
        "LM",
        24,
        66,
        74,
        1.9
      ],
      [
        "bradley-ray-collins",
        "Bradley Ray Collins",
        "GK",
        29,
        65,
        69,
        0.8
      ],
      [
        "lewis-rhys-thomas",
        "Lewis Rhys Thomas",
        "GK",
        28,
        59,
        60,
        0.19
      ],
      [
        "elijah-morrison",
        "Elijah Morrison",
        "LM",
        20,
        58,
        73,
        0.47500000000000003
      ]
    ]
  },
  {
    "id": "bur",
    "name": "Burnley",
    "color": "#6C1D45",
    "budget": 0,
    "preferredFormation": "4-2-3-1",
    "tier": "championship",
    "players": [
      [
        "joshua-jon-cullen",
        "Joshua Jon Cullen",
        "CDM",
        30,
        77,
        77,
        6.5
      ],
      [
        "zian-flemming",
        "Zian Flemming",
        "ST",
        28,
        76,
        76,
        3.6
      ],
      [
        "kyle-andrew-walker",
        "Kyle Andrew Walker",
        "RB",
        36,
        76,
        79,
        5.5
      ],
      [
        "anel-ahmedhodzic",
        "Anel Ahmedhodžić",
        "CB",
        27,
        75,
        78,
        5
      ],
      [
        "marcus-edwards",
        "Marcus Edwards",
        "RM",
        27,
        75,
        77,
        9
      ],
      [
        "gregoire-coudert",
        "Grégoire Coudert",
        "GK",
        27,
        75,
        75,
        0.925
      ],
      [
        "hannibal-mejbri",
        "Hannibal Mejbri",
        "CM",
        23,
        75,
        82,
        9.5
      ],
      [
        "mohamed-zeki-amdouni",
        "Mohamed Zeki Amdouni",
        "ST",
        25,
        74,
        81,
        9
      ],
      [
        "bashir-humphreys",
        "Bashir Humphreys",
        "CB",
        23,
        74,
        82,
        6.5
      ],
      [
        "connor-richard-john-roberts",
        "Connor Richard John Roberts",
        "RB",
        30,
        74,
        75,
        4.9
      ],
      [
        "lucas-pires-silva",
        "Lucas Pires Silva",
        "LB",
        25,
        74,
        78,
        5.5
      ],
      [
        "jacob-bruun-larsen",
        "Jacob Bruun Larsen",
        "LM",
        27,
        73,
        74,
        4.6
      ],
      [
        "lyle-brent-foster",
        "Lyle Brent Foster",
        "ST",
        26,
        72,
        77,
        3.6
      ],
      [
        "louis-jordan-beyer",
        "Louis Jordan Beyer",
        "CB",
        26,
        72,
        78,
        5.5
      ],
      [
        "joseph-adrian-worrall",
        "Joseph Adrian Worrall",
        "CB",
        29,
        72,
        73,
        2.6
      ],
      [
        "joshua-ishaele-jacob-heron-hunt-laurent",
        "Joshua Ishaele Jacob-Heron Hunt-Laurent",
        "CDM",
        31,
        72,
        73,
        2.5
      ],
      [
        "mike-tresor-ndayishimiye",
        "Mike Trésor Ndayishimiye",
        "LM",
        27,
        72,
        74,
        3.6
      ],
      [
        "armando-broja",
        "Armando Broja",
        "ST",
        25,
        72,
        77,
        3.6
      ],
      [
        "oliver-sonne-christensen",
        "Oliver Sonne Christensen",
        "RB",
        25,
        72,
        76,
        2.4
      ],
      [
        "hjalmar-ekdal",
        "Hjalmar Ekdal",
        "CB",
        27,
        71,
        74,
        2.6
      ],
      [
        "ugo-raghouber",
        "Ugo Raghouber",
        "CDM",
        23,
        71,
        79,
        3
      ],
      [
        "andreas-hountondji",
        "Andreas Hountondji",
        "ST",
        24,
        71,
        78,
        3.2
      ],
      [
        "max-alleyne",
        "Max Alleyne",
        "CB",
        21,
        70,
        76,
        1.3
      ],
      [
        "max-wei",
        "Max Weiß",
        "GK",
        22,
        70,
        80,
        2.6
      ],
      [
        "aaron-james-ramsey",
        "Aaron James Ramsey",
        "CAM",
        23,
        69,
        80,
        3.6
      ],
      [
        "ashley-luke-barnes",
        "Ashley Luke Barnes",
        "ST",
        36,
        69,
        70,
        0.675
      ],
      [
        "shurandy-ruggerio-sambo",
        "Shurandy Ruggerio Sambo",
        "RB",
        25,
        66,
        75,
        2.3
      ],
      [
        "jaydon-amauri-banel",
        "Jaydon Amauri Banel",
        "LM",
        21,
        66,
        77,
        1.4
      ],
      [
        "michael-oluwadurotimi-obafemi",
        "Michael Oluwadurotimi Obafemi",
        "ST",
        26,
        65,
        72,
        1.6
      ],
      [
        "enock-atta-agyei",
        "Enock Atta Agyei",
        "RM",
        21,
        63,
        75,
        1.2
      ]
    ]
  },
  {
    "id": "cha",
    "name": "Charlton Athletic",
    "color": "#D2122E",
    "budget": 0,
    "preferredFormation": "4-2-3-1",
    "tier": "championship",
    "players": [
      [
        "lloyd-richard-jones",
        "Lloyd Richard Jones",
        "CB",
        30,
        73,
        73,
        1.2
      ],
      [
        "thomas-kaminski",
        "Thomas Kaminski",
        "GK",
        33,
        70,
        74,
        2.1
      ],
      [
        "karlan-ahearne-grant",
        "Karlan Ahearne-Grant",
        "LM",
        29,
        70,
        71,
        2
      ],
      [
        "sonny-jack-carey",
        "Sonny Jack Carey",
        "CM",
        25,
        70,
        73,
        1.7
      ],
      [
        "kayne-ramsay",
        "Kayne Ramsay",
        "CB",
        25,
        70,
        74,
        1.8
      ],
      [
        "amarii-kyren-bell",
        "Amari'i Kyren Bell",
        "CB",
        32,
        70,
        70,
        1.1
      ],
      [
        "arthur-okonkwo",
        "Arthur Okonkwo",
        "GK",
        25,
        70,
        77,
        2.7
      ],
      [
        "joseph-scott-rankin-costello",
        "Joseph Scott Rankin-Costello",
        "RB",
        27,
        69,
        72,
        1.7
      ],
      [
        "conor-coventry",
        "Conor Coventry",
        "CDM",
        26,
        68,
        72,
        1.4
      ],
      [
        "charlie-robert-martin-lee-kelman",
        "Charlie Robert Martin Lee-Kelman",
        "ST",
        24,
        68,
        74,
        1.9
      ],
      [
        "tyreece-anthony-tupac-shakur-campbell",
        "Tyreece Anthony Tupac Shakur Campbell",
        "LM",
        23,
        68,
        73,
        1.6
      ],
      [
        "nathaniel-nyakie-chalobah",
        "Nathaniel Nyakie Chalobah",
        "CDM",
        31,
        68,
        69,
        1.2
      ],
      [
        "matthew-james-godden",
        "Matthew James Godden",
        "ST",
        35,
        68,
        68,
        0.775
      ],
      [
        "millenic-oluwole-sulaiman-alli",
        "Millenic Oluwole Sulaiman Alli",
        "LM",
        26,
        68,
        70,
        1.4
      ],
      [
        "greg-alexander-docherty",
        "Greg Alexander Docherty",
        "CM",
        30,
        68,
        68,
        0.75
      ],
      [
        "danny-john-mcnamara",
        "Danny John McNamara",
        "RB",
        27,
        67,
        71,
        1.6
      ],
      [
        "reece-frederick-james-burke",
        "Reece Frederick James Burke",
        "CB",
        30,
        67,
        71,
        1.6
      ],
      [
        "harvey-andrew-knibbs",
        "Harvey Andrew Knibbs",
        "CM",
        27,
        67,
        71,
        1.6
      ],
      [
        "robert-julian-apter",
        "Robert Julian Apter",
        "RM",
        23,
        67,
        76,
        1.9
      ],
      [
        "miles-leaburn",
        "Miles Leaburn",
        "ST",
        22,
        66,
        77,
        1.8
      ],
      [
        "joshua-edwards",
        "Joshua Edwards",
        "LB",
        26,
        66,
        69,
        0.925
      ],
      [
        "william-john-mannion",
        "William John Mannion",
        "GK",
        28,
        65,
        67,
        0.65
      ],
      [
        "ivan-mesik",
        "Ivan Mesík",
        "LB",
        25,
        65,
        74,
        1.8
      ],
      [
        "timothy-noor-ouma",
        "Timothy Noor Ouma",
        "CM",
        22,
        64,
        70,
        0.9
      ],
      [
        "micah-mbick",
        "Micah Mbick",
        "ST",
        19,
        64,
        72,
        0.375
      ],
      [
        "daniel-kanu",
        "Daniel Kanu",
        "ST",
        21,
        64,
        74,
        1.1
      ],
      [
        "nathan-asiimwe",
        "Nathan Asiimwe",
        "RB",
        21,
        63,
        68,
        0.625
      ],
      [
        "billy-dawson-koumetio",
        "Billy Dawson Koumetio",
        "CB",
        23,
        62,
        72,
        0.8250000000000001
      ],
      [
        "ibrahim-mohamed-fullah",
        "Ibrahim Mohamed Fullah",
        "CM",
        19,
        59,
        73,
        0.275
      ]
    ]
  },
  {
    "id": "der",
    "name": "Derby County",
    "color": "#000000",
    "budget": 0,
    "preferredFormation": "4-3-1-2",
    "tier": "championship",
    "players": [
      [
        "carlton-john-morris",
        "Carlton John Morris",
        "ST",
        30,
        74,
        74,
        3
      ],
      [
        "matthew-edward-barkell-clarke",
        "Matthew Edward Barkell Clarke",
        "CB",
        29,
        73,
        73,
        2.2
      ],
      [
        "jacob-mikael-widell-zetterstrom",
        "Jacob Mikael Widell Zetterström",
        "GK",
        28,
        73,
        75,
        2
      ],
      [
        "alex-james-mowatt",
        "Alex James Mowatt",
        "CDM",
        31,
        72,
        73,
        2.5
      ],
      [
        "lewis-travis",
        "Lewis Travis",
        "CDM",
        28,
        72,
        72,
        2.2
      ],
      [
        "filip-bilbija",
        "Filip Bilbija",
        "CAM",
        26,
        72,
        74,
        2.5
      ],
      [
        "samuel-joseph-szmodics",
        "Samuel Joseph Szmodics",
        "CAM",
        30,
        72,
        74,
        4.1
      ],
      [
        "sondre-klingen-langas",
        "Sondre Klingen Langås",
        "CB",
        25,
        71,
        77,
        2.7
      ],
      [
        "patrick-agyemang",
        "Patrick Agyemang",
        "ST",
        25,
        71,
        74,
        2.1
      ],
      [
        "bobby-lamont-clark",
        "Bobby-Lamont Clark",
        "CAM",
        21,
        71,
        77,
        1.4
      ],
      [
        "derry-john-murkin",
        "Derry John Murkin",
        "LB",
        27,
        70,
        71,
        1.5
      ],
      [
        "joseph-henry-ward",
        "Joseph Henry Ward",
        "RB",
        31,
        70,
        70,
        0.9
      ],
      [
        "charles-james-taylor",
        "Charles James Taylor",
        "LB",
        33,
        70,
        70,
        1.2
      ],
      [
        "dion-dannie-leonard-sanderson",
        "Dion Dannie Leonard Sanderson",
        "CB",
        26,
        70,
        70,
        1.3
      ],
      [
        "oscar-luigi-fraulo",
        "Oscar Luigi Fraulo",
        "CDM",
        22,
        69,
        80,
        3.1
      ],
      [
        "rhian-joel-brewster",
        "Rhian Joel Brewster",
        "ST",
        26,
        69,
        73,
        2
      ],
      [
        "ryan-peter-hedges",
        "Ryan Peter Hedges",
        "LM",
        31,
        69,
        70,
        1.6
      ],
      [
        "lars-jrgen-salvesen",
        "Lars-Jørgen Salvesen",
        "ST",
        30,
        68,
        68,
        1
      ],
      [
        "max-johnston",
        "Max Johnston",
        "RB",
        22,
        68,
        75,
        2.3
      ],
      [
        "corey-josiah-paul-blackett-taylor",
        "Corey Josiah Paul Blackett-Taylor",
        "LM",
        28,
        67,
        68,
        1.3
      ],
      [
        "kenzo-goudmijn",
        "Kenzo Goudmijn",
        "CM",
        24,
        67,
        74,
        1.9
      ],
      [
        "joshua-anthony-vickers",
        "Joshua Anthony Vickers",
        "GK",
        30,
        67,
        67,
        0.7000000000000001
      ],
      [
        "craig-forsyth",
        "Craig Forsyth",
        "LB",
        37,
        66,
        67,
        0.23
      ],
      [
        "ryan-simasiku-nyambe",
        "Ryan Simasiku Nyambe",
        "RB",
        28,
        65,
        67,
        0.975
      ],
      [
        "richard-mark-odonnell",
        "Richard Mark O'Donnell",
        "GK",
        38,
        64,
        64,
        0.045
      ]
    ]
  },
  {
    "id": "lei",
    "name": "Leicester City",
    "color": "#003090",
    "budget": 0,
    "preferredFormation": "4-4-2",
    "tier": "championship",
    "players": [
      [
        "wout-felix-lina-faes",
        "Wout Felix Lina Faes",
        "CB",
        28,
        74,
        74,
        3.1
      ],
      [
        "harry-james-souttar",
        "Harry James Souttar",
        "CB",
        27,
        72,
        75,
        3.3
      ],
      [
        "wesley-james-burns",
        "Wesley James Burns",
        "RM",
        31,
        72,
        72,
        2.3
      ],
      [
        "conor-mark-chaplin",
        "Conor Mark Chaplin",
        "CAM",
        29,
        71,
        74,
        4.2
      ],
      [
        "oliver-william-skipp",
        "Oliver William Skipp",
        "CDM",
        26,
        71,
        76,
        4.9
      ],
      [
        "woyo-coulibaly",
        "Woyo Coulibaly",
        "RB",
        27,
        71,
        75,
        2.8
      ],
      [
        "jakub-stolarczyk",
        "Jakub Stolarczyk",
        "GK",
        25,
        70,
        74,
        1.8
      ],
      [
        "stephy-alvaro-mavididi",
        "Stephy Alvaro Mavididi",
        "LM",
        28,
        70,
        75,
        6
      ],
      [
        "memeh-caleb-okoli",
        "Memeh Caleb Okoli",
        "CB",
        25,
        69,
        77,
        3.9
      ],
      [
        "liam-jamie-cullen",
        "Liam Jamie Cullen",
        "CAM",
        27,
        69,
        73,
        2.1
      ],
      [
        "bobby-armani-de-cordova-reid",
        "Bobby Armani De Cordova-Reid",
        "CAM",
        33,
        69,
        72,
        1.9
      ],
      [
        "hamza-dewan-choudhury",
        "Hamza Dewan Choudhury",
        "RB",
        28,
        69,
        73,
        2.5
      ],
      [
        "luke-jonathan-thomas",
        "Luke Jonathan Thomas",
        "LB",
        25,
        68,
        73,
        2
      ],
      [
        "thomas-watson",
        "Thomas Watson",
        "LM",
        20,
        68,
        82,
        2.9
      ],
      [
        "benjamin-harvey-nelson",
        "Benjamin Harvey Nelson",
        "CB",
        22,
        68,
        79,
        2
      ],
      [
        "alex-simon-mccarthy",
        "Alex Simon McCarthy",
        "GK",
        36,
        68,
        70,
        0.18
      ],
      [
        "samuel-charles-braybrooke",
        "Samuel Charles Braybrooke",
        "CDM",
        22,
        65,
        74,
        0.775
      ],
      [
        "franco-nahuel-ravizzoli",
        "Franco Nahuel Ravizzoli",
        "GK",
        29,
        64,
        67,
        0.5750000000000001
      ],
      [
        "louis-donald-page",
        "Louis Donald Page",
        "CAM",
        18,
        64,
        83,
        1
      ],
      [
        "william-thomas-alves",
        "William Thomas Alves",
        "LM",
        21,
        63,
        79,
        1.3
      ],
      [
        "jayden-joseph",
        "Jayden Joseph",
        "RB",
        20,
        63,
        73,
        0.35000000000000003
      ],
      [
        "michael-heinz-golding",
        "Michael Heinz Golding",
        "CAM",
        20,
        62,
        79,
        1
      ],
      [
        "olabade-olatomiwo-samuel-aluko",
        "Olabade Olatomiwo Samuel Aluko",
        "LB",
        19,
        60,
        79,
        0.625
      ]
    ]
  },
  {
    "id": "mid",
    "name": "Middlesbrough",
    "color": "#E32526",
    "budget": 0,
    "preferredFormation": "4-4-2",
    "tier": "championship",
    "players": [
      [
        "sebastian-berhalter",
        "Sebastian Berhalter",
        "CDM",
        25,
        76,
        76,
        1.5
      ],
      [
        "radek-vitek",
        "Radek Vítek",
        "GK",
        22,
        75,
        79,
        3.6
      ],
      [
        "maximilian-arfsten",
        "Maximilian Arfsten",
        "LM",
        25,
        75,
        75,
        1.6
      ],
      [
        "aidan-zen-patrick-morris",
        "Aidan Zen Patrick Morris",
        "CDM",
        24,
        74,
        78,
        4.2
      ],
      [
        "morgan-reece-whittaker",
        "Morgan Reece Whittaker",
        "RM",
        25,
        74,
        78,
        4.6
      ],
      [
        "luke-david-ayling",
        "Luke David Ayling",
        "CB",
        35,
        73,
        73,
        0.975
      ],
      [
        "callum-james-brittain",
        "Callum James Brittain",
        "RB",
        28,
        73,
        73,
        2.5
      ],
      [
        "adilson-malanda",
        "Adilson Malanda",
        "CB",
        24,
        72,
        80,
        2.9
      ],
      [
        "alfie-charles-jones",
        "Alfie Charles Jones",
        "CB",
        28,
        72,
        72,
        1.9
      ],
      [
        "riley-patrick-mcgree",
        "Riley Patrick McGree",
        "LM",
        27,
        72,
        73,
        2.8
      ],
      [
        "ashley-phillips",
        "Ashley Phillips",
        "CB",
        21,
        71,
        81,
        3.3
      ],
      [
        "tommy-daniel-john-conway",
        "Tommy Daniel John Conway",
        "ST",
        24,
        71,
        78,
        3.6
      ],
      [
        "vivaldo-borges-dos-santos-neto",
        "Vivaldo Borges dos Santos Neto",
        "LB",
        30,
        71,
        71,
        1.7
      ],
      [
        "jeremy-leonel-sarmiento-morante",
        "Jeremy Leonel Sarmiento Morante",
        "LM",
        24,
        70,
        78,
        3.5
      ],
      [
        "william-lankshear",
        "William Lankshear",
        "ST",
        21,
        70,
        78,
        1.4
      ],
      [
        "samuel-george-alan-edmundson",
        "Samuel George Alan Edmundson",
        "CB",
        29,
        70,
        72,
        1.7
      ],
      [
        "david-strelec",
        "Dávid Strelec",
        "ST",
        25,
        70,
        74,
        2.1
      ],
      [
        "solomon-brynn",
        "Solomon Brynn",
        "GK",
        25,
        69,
        74,
        1.6
      ],
      [
        "kyle-alexander-joseph",
        "Kyle Alexander Joseph",
        "ST",
        25,
        69,
        73,
        1.7
      ],
      [
        "myles-spencer-peart-harris",
        "Myles Spencer Peart-Harris",
        "LM",
        24,
        68,
        75,
        2.3
      ],
      [
        "alex-bangura",
        "Alex Bangura",
        "LB",
        27,
        68,
        72,
        1.7
      ],
      [
        "abdoulaye-raslan-kante",
        "Abdoulaye Raslan Kanté",
        "CDM",
        21,
        68,
        78,
        1.9
      ],
      [
        "leo-castledine",
        "Leo Castledine",
        "CAM",
        21,
        68,
        77,
        0.9500000000000001
      ],
      [
        "jonathan-peter-mclaughlin",
        "Jonathan Peter McLaughlin",
        "GK",
        39,
        66,
        66,
        0.09
      ],
      [
        "micah-philippe-jude-hamilton",
        "Micah Philippe Jude Hamilton",
        "LM",
        22,
        64,
        78,
        1.4
      ],
      [
        "law-mccabe",
        "Law McCabe",
        "CM",
        20,
        60,
        74,
        0.325
      ]
    ]
  },
  {
    "id": "mil",
    "name": "Millwall FC",
    "color": "#001C58",
    "budget": 0,
    "preferredFormation": "4-4-2",
    "tier": "championship",
    "players": [
      [
        "oluwafemi-javier-azeez",
        "Oluwafemi Javier Azeez",
        "RM",
        25,
        75,
        75,
        2.4
      ],
      [
        "tristan-crama",
        "Tristan Crama",
        "CB",
        24,
        75,
        75,
        1.7
      ],
      [
        "jake-matthew-cooper",
        "Jake Matthew Cooper",
        "CB",
        31,
        74,
        74,
        2.5
      ],
      [
        "caleb-joaquin-taylor",
        "Caleb Joaquin Taylor",
        "CB",
        23,
        73,
        78,
        2.5
      ],
      [
        "alfie-henry-doughty",
        "Alfie Henry Doughty",
        "LB",
        26,
        72,
        77,
        5
      ],
      [
        "casper-de-norre",
        "Casper De Norre",
        "CDM",
        29,
        72,
        72,
        2.1
      ],
      [
        "mathis-servais",
        "Mathis Servais",
        "CM",
        21,
        71,
        79,
        1.4
      ],
      [
        "camiel-neghli",
        "Camiel Neghli",
        "RM",
        24,
        71,
        75,
        2.4
      ],
      [
        "ryan-ian-leonard",
        "Ryan Ian Leonard",
        "RB",
        34,
        70,
        71,
        0.975
      ],
      [
        "maxime-teremoana-crocombe",
        "Maxime Teremoana Crocombe",
        "GK",
        33,
        70,
        70,
        0.375
      ],
      [
        "mihailo-ivanovic",
        "Mihailo Ivanović",
        "ST",
        21,
        70,
        78,
        3.1
      ],
      [
        "zak-norton-sturge",
        "Zak Norton Sturge",
        "LB",
        22,
        70,
        75,
        0.775
      ],
      [
        "tairyk-arconte",
        "Taïryk Arconte",
        "ST",
        22,
        70,
        74,
        1.6
      ],
      [
        "mark-sykes",
        "Mark Sykes",
        "RM",
        29,
        69,
        69,
        1.5
      ],
      [
        "luke-james-cundle",
        "Luke James Cundle",
        "CAM",
        24,
        69,
        73,
        1.6
      ],
      [
        "lyndon-john-dykes",
        "Lyndon John Dykes",
        "ST",
        30,
        69,
        69,
        1.2
      ],
      [
        "joshua-guy-coburn",
        "Joshua Guy Coburn",
        "ST",
        23,
        69,
        76,
        1.9
      ],
      [
        "lukas-bornhft-jensen",
        "Lukas Bornhøft Jensen",
        "GK",
        27,
        69,
        74,
        1.6
      ],
      [
        "daniel-tanveer-batth",
        "Daniel Tanveer Batth",
        "CB",
        35,
        68,
        70,
        0.525
      ],
      [
        "derek-mazou-sacko",
        "Derek Mazou-Sacko",
        "CDM",
        21,
        66,
        77,
        0.9500000000000001
      ],
      [
        "raees-bangura-williams",
        "Ra'ees Bangura-Williams",
        "RM",
        21,
        66,
        78,
        1.2
      ],
      [
        "jordi-martin-emmanuel-osei-tutu",
        "Jordi Martin Emmanuel Osei-Tutu",
        "RB",
        27,
        66,
        67,
        1
      ],
      [
        "kyrell-lisbie",
        "Kyrell Lisbie",
        "LM",
        22,
        65,
        70,
        0.55
      ],
      [
        "jenson-metcalfe",
        "Jenson Metcalfe",
        "CM",
        22,
        64,
        71,
        0.525
      ],
      [
        "daniel-kelly",
        "Daniel Kelly",
        "CM",
        20,
        63,
        76,
        0.625
      ],
      [
        "elkan-william-tio-baggott",
        "Elkan William Tio Baggott",
        "CB",
        23,
        63,
        71,
        1
      ],
      [
        "george-evans-millwall-fc",
        "George Evans",
        "GK",
        21,
        62,
        72,
        0.525
      ],
      [
        "joel-coleman",
        "Joel Coleman",
        "GK",
        30,
        60,
        60,
        0.17
      ],
      [
        "zakariya-lovelace",
        "Zakariya Lovelace",
        "ST",
        20,
        58,
        78,
        0.5750000000000001
      ],
      [
        "ajay-matthews",
        "Ajay Matthews",
        "ST",
        20,
        58,
        73,
        0.325
      ]
    ]
  },
  {
    "id": "nor",
    "name": "Norwich City",
    "color": "#00A650",
    "budget": 0,
    "preferredFormation": "4-2-3-1",
    "tier": "championship",
    "players": [
      [
        "kenneth-mclean",
        "Kenneth McLean",
        "CDM",
        34,
        73,
        73,
        1.2
      ],
      [
        "anthony-tite-musaba",
        "Anthony Tite Musaba",
        "LM",
        25,
        73,
        76,
        2.5
      ],
      [
        "vladan-kovacevic",
        "Vladan Kovačević",
        "GK",
        28,
        72,
        73,
        1.6
      ],
      [
        "ali-ahmed",
        "Ali Ahmed",
        "LM",
        25,
        72,
        74,
        1.9
      ],
      [
        "mathias-damm-kvistgaarden",
        "Mathias Damm Kvistgaarden",
        "ST",
        24,
        72,
        82,
        9.5
      ],
      [
        "darlin-zidane-yongwa-ngameni",
        "Darlin Zidane Yongwa Ngameni",
        "LB",
        25,
        72,
        76,
        3.1
      ],
      [
        "pelle-elkjr-mattsson",
        "Pelle Elkjær Mattsson",
        "CDM",
        25,
        72,
        80,
        3.9
      ],
      [
        "jack-william-stacey",
        "Jack William Stacey",
        "RB",
        30,
        71,
        72,
        2.1
      ],
      [
        "harry-jack-darling",
        "Harry Jack Darling",
        "CB",
        27,
        71,
        76,
        2.5
      ],
      [
        "jose-angel-cordoba-chambers",
        "José Ángel Córdoba Chambers",
        "CB",
        25,
        70,
        74,
        1.7
      ],
      [
        "ruairi-mcconville",
        "Ruairi McConville",
        "CB",
        21,
        70,
        73,
        0.8250000000000001
      ],
      [
        "mohamed-toure",
        "Mohamed Touré",
        "ST",
        22,
        70,
        76,
        2.7
      ],
      [
        "jakov-medic",
        "Jakov Medić",
        "CB",
        28,
        70,
        73,
        1.8
      ],
      [
        "kellen-fisher",
        "Kellen Fisher",
        "RB",
        22,
        70,
        77,
        3
      ],
      [
        "mirko-topic",
        "Mirko Topić",
        "CDM",
        25,
        70,
        78,
        3.5
      ],
      [
        "andre-chance-brooks",
        "Andre Chance Brooks",
        "RM",
        23,
        70,
        79,
        3.1
      ],
      [
        "samuel-edward-field",
        "Samuel Edward Field",
        "CDM",
        28,
        70,
        72,
        1.9
      ],
      [
        "jovon-willesley-makama",
        "Jovon Willesley Makama",
        "ST",
        22,
        70,
        74,
        1.1
      ],
      [
        "forson-amankwah",
        "Forson Amankwah",
        "CM",
        23,
        69,
        76,
        2.8
      ],
      [
        "anis-ben-slimane",
        "Anis Ben Slimane",
        "CAM",
        25,
        69,
        71,
        1.5
      ],
      [
        "oscar-schwartau",
        "Oscar Schwartau",
        "LM",
        20,
        69,
        77,
        1.7
      ],
      [
        "benjamin-joshua-chrisene",
        "Benjamin Joshua Chrisene",
        "LB",
        22,
        68,
        75,
        1.8
      ],
      [
        "ante-crnac",
        "Ante Crnac",
        "ST",
        22,
        68,
        75,
        2.5
      ],
      [
        "papa-amadou-diallo",
        "Papa Amadou Diallo",
        "LM",
        22,
        68,
        82,
        3
      ],
      [
        "liam-geoffrey-gibbs",
        "Liam Geoffrey Gibbs",
        "CM",
        23,
        68,
        74,
        1.9
      ],
      [
        "edmond-paris-maghoma",
        "Edmond-Paris Maghoma",
        "CM",
        25,
        68,
        72,
        1.3
      ],
      [
        "jacob-wright",
        "Jacob Wright",
        "CDM",
        20,
        67,
        80,
        2.3
      ],
      [
        "daniel-james-grimshaw",
        "Daniel James Grimshaw",
        "GK",
        28,
        67,
        71,
        1.1
      ],
      [
        "vicente-phillip-reyes-nunez",
        "Vicente Phillip Reyes Núñez",
        "GK",
        22,
        64,
        77,
        1.3
      ],
      [
        "lucien-mahovo",
        "Lucien Mahovo",
        "LB",
        21,
        64,
        77,
        1.3
      ]
    ]
  },
  {
    "id": "oxf",
    "name": "Oxford United",
    "color": "#002D62",
    "budget": 0,
    "preferredFormation": "4-4-2",
    "tier": "championship",
    "players": [
      [
        "cameron-mark-thomas-brannagan",
        "Cameron Mark Thomas Brannagan",
        "CDM",
        30,
        71,
        71,
        1.6
      ],
      [
        "brian-de-keersmaecker",
        "Brian De Keersmaecker",
        "CDM",
        26,
        71,
        75,
        2.1
      ],
      [
        "frankie-james-kent",
        "Frankie James Kent",
        "CB",
        30,
        70,
        72,
        2
      ],
      [
        "jin-woo-jeon",
        "Jin-woo Jeon",
        "RM",
        27,
        70,
        73,
        2.8
      ],
      [
        "micha-sawomir-helik",
        "Michał Sławomir Helik",
        "CB",
        31,
        69,
        70,
        1.3
      ],
      [
        "ciaron-maurice-brown",
        "Ciaron Maurice Brown",
        "CB",
        28,
        69,
        72,
        1.7
      ],
      [
        "tyler-charlie-goodrham",
        "Tyler Charlie Goodrham",
        "LM",
        23,
        68,
        76,
        2.7
      ],
      [
        "james-andrew-cumming",
        "James Andrew Cumming",
        "GK",
        27,
        68,
        74,
        1.6
      ],
      [
        "thomas-mark-harris",
        "Thomas Mark Harris",
        "ST",
        27,
        68,
        71,
        1.6
      ],
      [
        "gregory-alex-leigh",
        "Gregory Alex Leigh",
        "LB",
        31,
        68,
        68,
        1
      ],
      [
        "brodie-gilmore-spencer",
        "Brodie Gilmore Spencer",
        "RB",
        22,
        68,
        78,
        2.5
      ],
      [
        "jack-currie",
        "Jack Currie",
        "LB",
        24,
        68,
        73,
        1.6
      ],
      [
        "stanley-mills",
        "Stanley Mills",
        "RM",
        22,
        68,
        78,
        2.1
      ],
      [
        "jamie-carson-mcdonnell",
        "Jamie Carson McDonnell",
        "CDM",
        22,
        67,
        76,
        1.8
      ],
      [
        "louie-joseph-sibley",
        "Louie Joseph Sibley",
        "CAM",
        25,
        67,
        72,
        1.5
      ],
      [
        "samuel-patrick-robert-long",
        "Samuel Patrick Robert Long",
        "RB",
        31,
        67,
        67,
        0.8250000000000001
      ],
      [
        "aidomo-emakhu",
        "Aidomo Emakhu",
        "LM",
        22,
        67,
        75,
        1.3
      ],
      [
        "ben-siriki-dembele",
        "Ben Siriki Dembélé",
        "LM",
        30,
        67,
        70,
        1.6
      ],
      [
        "ruben-roosken",
        "Ruben Roosken",
        "LB",
        26,
        66,
        70,
        1.1
      ],
      [
        "peter-kioso",
        "Peter Kioso",
        "RB",
        27,
        66,
        69,
        1
      ],
      [
        "simon-christopher-eastwood",
        "Simon Christopher Eastwood",
        "GK",
        37,
        63,
        63,
        0.05
      ],
      [
        "gatlin-teye-odonkor",
        "Gatlin Teye O'Donkor",
        "ST",
        21,
        61,
        71,
        0.725
      ],
      [
        "james-golding",
        "James Golding",
        "CB",
        22,
        60,
        74,
        0.55
      ]
    ]
  },
  {
    "id": "por",
    "name": "Portsmouth",
    "color": "#001489",
    "budget": 0,
    "preferredFormation": "4-2-3-1",
    "tier": "championship",
    "players": [
      [
        "joshua-murphy",
        "Joshua Murphy",
        "LM",
        31,
        73,
        73,
        2.9
      ],
      [
        "nicolas-schmid",
        "Nicolas Schmid",
        "GK",
        29,
        71,
        74,
        1.7
      ],
      [
        "terry-devlin",
        "Terry Devlin",
        "RB",
        22,
        71,
        76,
        2.2
      ],
      [
        "ebrima-adams",
        "Ebrima Adams",
        "CDM",
        30,
        71,
        73,
        2.6
      ],
      [
        "conor-glynn-shaughnessy",
        "Conor Glynn Shaughnessy",
        "CB",
        30,
        70,
        71,
        1.5
      ],
      [
        "adrian-segecic",
        "Adrian Segecic",
        "RM",
        22,
        70,
        79,
        1.8
      ],
      [
        "regan-leslie-poole",
        "Regan Leslie Poole",
        "CB",
        28,
        70,
        71,
        1.4
      ],
      [
        "zachary-swanson",
        "Zachary Swanson",
        "RB",
        25,
        69,
        72,
        1.4
      ],
      [
        "john-david-swift",
        "John David Swift",
        "CAM",
        31,
        69,
        70,
        1.5
      ],
      [
        "colby-david-bishop",
        "Colby David Bishop",
        "ST",
        29,
        69,
        72,
        2.4
      ],
      [
        "connor-stuart-ogilvie",
        "Connor Stuart Ogilvie",
        "LB",
        30,
        69,
        69,
        1.2
      ],
      [
        "rocco-robert-shein",
        "Rocco Robert Shein",
        "CM",
        23,
        69,
        77,
        1.9
      ],
      [
        "keshi-stuart-oluyinka-adetokunboh-anderson",
        "Keshi Stuart Oluyinka Adetokunboh Anderson",
        "LM",
        31,
        69,
        70,
        1.5
      ],
      [
        "marko-milovanovic",
        "Marko Milovanović",
        "ST",
        23,
        69,
        76,
        1.9
      ],
      [
        "daniel-bielica",
        "Daniel Bielica",
        "GK",
        27,
        68,
        73,
        1.4
      ],
      [
        "marlon-pack",
        "Marlon Pack",
        "CDM",
        35,
        68,
        68,
        0.35000000000000003
      ],
      [
        "abu-kamara",
        "Abu Kamara",
        "RM",
        23,
        68,
        78,
        2.7
      ],
      [
        "joshua-michael-knight",
        "Joshua Michael Knight",
        "CB",
        29,
        67,
        71,
        1.5
      ],
      [
        "luke-gareth-le-roux",
        "Luke Gareth Le Roux",
        "CM",
        26,
        66,
        71,
        1.2
      ],
      [
        "benjamin-arthur",
        "Benjamin Arthur",
        "CB",
        20,
        66,
        80,
        0.975
      ],
      [
        "josef-john-bursik",
        "Josef John Bursik",
        "GK",
        26,
        66,
        71,
        0.925
      ],
      [
        "odin-ohray-bailey",
        "Odin Ohray Bailey",
        "CM",
        26,
        65,
        69,
        1
      ],
      [
        "jacob-brett-farrell",
        "Jacob Brett Farrell",
        "LB",
        23,
        65,
        74,
        2
      ],
      [
        "madiodio-dia",
        "Madiodio Dia",
        "CB",
        22,
        65,
        78,
        1.4
      ],
      [
        "hayden-john-matthews",
        "Hayden John Matthews",
        "CB",
        22,
        64,
        77,
        1.4
      ],
      [
        "mark-kosznovszky",
        "Márk Kosznovszky",
        "CM",
        24,
        64,
        70,
        0.9500000000000001
      ],
      [
        "thomas-waddingham",
        "Thomas Waddingham",
        "ST",
        21,
        63,
        78,
        1.2
      ],
      [
        "ben-killip",
        "Ben Killip",
        "GK",
        30,
        63,
        65,
        0.4
      ],
      [
        "harvey-antonio-blair",
        "Harvey Antonio Blair",
        "LM",
        23,
        62,
        73,
        0.8
      ],
      [
        "franco-umeh-chibueze",
        "Franco Umeh-Chibueze",
        "RM",
        21,
        62,
        76,
        0.9500000000000001
      ]
    ]
  },
  {
    "id": "pre",
    "name": "Preston North End",
    "color": "#1C3F94",
    "budget": 0,
    "preferredFormation": "4-3-1-2",
    "tier": "championship",
    "players": [
      [
        "daniel-lnne-iversen",
        "Daniel Lønne Iversen",
        "GK",
        29,
        73,
        73,
        1.5
      ],
      [
        "alfie-sean-devine",
        "Alfie Sean Devine",
        "CAM",
        22,
        72,
        84,
        3.8
      ],
      [
        "jordan-ben-storey",
        "Jordan Ben Storey",
        "CB",
        29,
        71,
        73,
        2
      ],
      [
        "alistair-edward-mccann",
        "Alistair Edward McCann",
        "CM",
        26,
        71,
        75,
        2.3
      ],
      [
        "leo-patrick-pierre-leroy",
        "Léo Patrick Pierre Leroy",
        "CDM",
        26,
        71,
        76,
        2.5
      ],
      [
        "milutin-osmajic",
        "Milutin Osmajić",
        "ST",
        27,
        71,
        73,
        2.1
      ],
      [
        "lewis-jack-gibson",
        "Lewis Jack Gibson",
        "CB",
        26,
        71,
        76,
        2.6
      ],
      [
        "callum-joseph-lang",
        "Callum Joseph Lang",
        "CAM",
        28,
        71,
        72,
        2.2
      ],
      [
        "liam-james-lindsay",
        "Liam James Lindsay",
        "CB",
        30,
        70,
        71,
        1.6
      ],
      [
        "thierry-small",
        "Thierry Small",
        "LB",
        22,
        70,
        78,
        2.2
      ],
      [
        "andrew-martyn-hughes",
        "Andrew Martyn Hughes",
        "CB",
        34,
        70,
        70,
        0.75
      ],
      [
        "harrison-thomas-clarke",
        "Harrison Thomas Clarke",
        "RB",
        25,
        70,
        75,
        2.2
      ],
      [
        "delano-burgzorg",
        "Delano Burgzorg",
        "LM",
        27,
        69,
        70,
        1.6
      ],
      [
        "jusef-erabi",
        "Jusef Erabi",
        "ST",
        23,
        69,
        77,
        2.7
      ],
      [
        "odeluga-joshua-offiah",
        "Odeluga Joshua Offiah",
        "CB",
        23,
        69,
        77,
        2.2
      ],
      [
        "bradley-michael-potts",
        "Bradley Michael Potts",
        "RB",
        32,
        68,
        69,
        1.2
      ],
      [
        "andrija-vukcevic",
        "Andrija Vukčević",
        "LB",
        29,
        68,
        68,
        0.65
      ],
      [
        "jordan-andrew-thompson",
        "Jordan Andrew Thompson",
        "CM",
        29,
        68,
        68,
        1.2
      ],
      [
        "pol-valentin-sancho",
        "Pol Valentín Sancho",
        "RB",
        29,
        68,
        68,
        0.925
      ],
      [
        "lee-anthony-nicholls",
        "Lee Anthony Nicholls",
        "GK",
        33,
        66,
        66,
        0.425
      ],
      [
        "max-wilson",
        "Max Wilson",
        "CAM",
        19,
        55,
        63,
        0.2
      ],
      [
        "b-whiteman",
        "B. Whiteman",
        "CDM",
        29,
        72,
        72,
        2
      ]
    ]
  },
  {
    "id": "que",
    "name": "Queens Park Rangers",
    "color": "#1D5BA4",
    "budget": 0,
    "preferredFormation": "4-2-3-1",
    "tier": "championship",
    "players": [
      [
        "ilias-chair",
        "Ilias Chair",
        "LM",
        28,
        73,
        74,
        4.5
      ],
      [
        "nicolas-martin-hautorp-madsen",
        "Nicolas Martin Hautorp Madsen",
        "CDM",
        26,
        73,
        75,
        2.6
      ],
      [
        "tariq-kwame-nii-lante-lamptey",
        "Tariq Kwame Nii-Lante Lamptey",
        "RB",
        25,
        72,
        76,
        3.8
      ],
      [
        "james-gerard-dunne",
        "James Gerard Dunne",
        "CB",
        28,
        72,
        74,
        3.2
      ],
      [
        "glen-adjei-kamara",
        "Glen Adjei Kamara",
        "CDM",
        30,
        72,
        74,
        3.6
      ],
      [
        "dennis-cirkin",
        "Dennis Cirkin",
        "LB",
        24,
        72,
        78,
        3.5
      ],
      [
        "jonathan-varane",
        "Jonathan Varane",
        "CDM",
        25,
        72,
        80,
        3.9
      ],
      [
        "jake-liam-clarke-salter",
        "Jake-Liam Clarke-Salter",
        "CB",
        28,
        70,
        73,
        2.4
      ],
      [
        "rumarn-kameron-scott-burrell",
        "Rumarn Kameron-Scott Burrell",
        "ST",
        25,
        70,
        70,
        0.625
      ],
      [
        "koki-saito",
        "Koki Saito",
        "LM",
        25,
        70,
        77,
        3.5
      ],
      [
        "ronnie-lee-edwards",
        "Ronnie Lee Edwards",
        "CB",
        23,
        70,
        80,
        3.3
      ],
      [
        "richard-kone",
        "Richard Koné",
        "ST",
        23,
        70,
        78,
        3.2
      ],
      [
        "paul-patrick-smyth",
        "Paul Patrick Smyth",
        "LM",
        29,
        69,
        69,
        1.3
      ],
      [
        "boy-kemper",
        "Boy Kemper",
        "LB",
        27,
        69,
        69,
        1
      ],
      [
        "harvey-james-vale",
        "Harvey James Vale",
        "RM",
        23,
        69,
        76,
        1.6
      ],
      [
        "pierce-charles",
        "Pierce Charles",
        "GK",
        21,
        69,
        78,
        1.5
      ],
      [
        "calum-brian-joseph-ward",
        "Calum Brian Joseph Ward",
        "GK",
        25,
        69,
        69,
        0.17
      ],
      [
        "kwame-afriyie-adubofour-poku",
        "Kwame Afriyie Adubofour Poku",
        "RM",
        25,
        69,
        75,
        2.2
      ],
      [
        "karamoko-kader-dembele",
        "Karamoko Kader Dembélé",
        "RM",
        23,
        68,
        78,
        3.6
      ],
      [
        "liam-morrison",
        "Liam Morrison",
        "CB",
        23,
        68,
        77,
        2.5
      ],
      [
        "amadou-salif-mbengue",
        "Amadou Salif Mbengue",
        "RB",
        24,
        68,
        75,
        2.2
      ],
      [
        "kieran-morgan",
        "Kieran Morgan",
        "CM",
        20,
        66,
        80,
        2
      ],
      [
        "rayan-jawad-kolli",
        "Rayan Jawad Kolli",
        "ST",
        21,
        65,
        79,
        1.7
      ],
      [
        "kealey-otieno-adamson",
        "Kealey Otieno Adamson",
        "RB",
        23,
        64,
        73,
        1.5
      ],
      [
        "ziyad-larkeche",
        "Ziyad Larkeche",
        "LB",
        23,
        63,
        72,
        1
      ],
      [
        "alfie-david-lloyd",
        "Alfie David Lloyd",
        "ST",
        23,
        63,
        73,
        0.9
      ],
      [
        "justin-patrick-nnamdi-obikwu",
        "Justin Patrick Nnamdi Obikwu",
        "ST",
        22,
        61,
        68,
        0.55
      ],
      [
        "isak-alexander-alemayehu-mulugeta",
        "Isak Alexander Alemayehu Mulugeta",
        "CM",
        19,
        60,
        74,
        0.5750000000000001
      ]
    ]
  },
  {
    "id": "she",
    "name": "Sheffield United",
    "color": "#EE2737",
    "budget": 0,
    "preferredFormation": "4-3-1-2",
    "tier": "championship",
    "players": [
      [
        "matthew-james-doherty",
        "Matthew James Doherty",
        "CB",
        34,
        73,
        74,
        2
      ],
      [
        "callum-luke-ohare",
        "Callum Luke O'Hare",
        "CAM",
        28,
        73,
        74,
        3.5
      ],
      [
        "japhet-manzambi-tanganga",
        "Japhet Manzambi Tanganga",
        "CB",
        27,
        72,
        75,
        3.3
      ],
      [
        "michael-john-cooper",
        "Michael John Cooper",
        "GK",
        26,
        72,
        81,
        9
      ],
      [
        "harrison-james-burrows",
        "Harrison James Burrows",
        "LB",
        24,
        72,
        80,
        6
      ],
      [
        "kalvin-mark-phillips",
        "Kalvin Mark Phillips",
        "CDM",
        30,
        72,
        74,
        3.6
      ],
      [
        "sydie-frederick-peck",
        "Sydie Frederick Peck",
        "CDM",
        22,
        71,
        82,
        3.6
      ],
      [
        "tahith-jose-chong",
        "Tahith Jose Chong",
        "CAM",
        26,
        70,
        76,
        2.8
      ],
      [
        "joseph-matthew-rothwell",
        "Joseph Matthew Rothwell",
        "CDM",
        31,
        70,
        74,
        3.5
      ],
      [
        "ivo-grbic",
        "Ivo Grbić",
        "GK",
        30,
        70,
        72,
        1.6
      ],
      [
        "thomas-christopher-cannon",
        "Thomas Christopher Cannon",
        "ST",
        23,
        70,
        78,
        3.8
      ],
      [
        "oliver-luke-arblaster",
        "Oliver Luke Arblaster",
        "CM",
        22,
        70,
        80,
        4.2
      ],
      [
        "sam-benjamin-mccallum",
        "Sam Benjamin McCallum",
        "LB",
        26,
        70,
        72,
        1.8
      ],
      [
        "tyrese-kai-campbell",
        "Tyrese Kai Campbell",
        "ST",
        26,
        70,
        76,
        3.3
      ],
      [
        "mark-james-mcguinness",
        "Mark James McGuinness",
        "CB",
        25,
        70,
        74,
        2.1
      ],
      [
        "oluwafemi-ibrahim-seriki",
        "Oluwafemi Ibrahim Seriki",
        "RB",
        24,
        70,
        77,
        2.6
      ],
      [
        "jamie-stuart-shackleton",
        "Jamie Stuart Shackleton",
        "RB",
        26,
        69,
        73,
        1.8
      ],
      [
        "adam-rhys-davies",
        "Adam Rhys Davies",
        "GK",
        34,
        68,
        68,
        0.6
      ],
      [
        "rhys-llewelyn-norrington-davies",
        "Rhys Llewelyn Norrington-Davies",
        "LB",
        27,
        68,
        71,
        1.5
      ],
      [
        "romelle-donovan",
        "Romelle Donovan",
        "RM",
        19,
        67,
        75,
        0.75
      ],
      [
        "nils-zatterstrom",
        "Nils Zätterström",
        "CB",
        21,
        64,
        78,
        1.3
      ],
      [
        "ryan-one",
        "Ryan Oné",
        "ST",
        20,
        63,
        74,
        0.775
      ],
      [
        "jamal-baptiste",
        "Jamal Baptiste",
        "CB",
        22,
        63,
        71,
        0.325
      ]
    ]
  },
  {
    "id": "shw",
    "name": "Sheffield Wednesday",
    "color": "#0066B3",
    "budget": 0,
    "preferredFormation": "4-3-3",
    "tier": "championship",
    "players": [
      [
        "barry-ryan-bannan",
        "Barry Ryan Bannan",
        "CM",
        36,
        72,
        73,
        1.2
      ],
      [
        "billy-james-mitchell",
        "Billy James Mitchell",
        "CDM",
        25,
        71,
        73,
        1.8
      ],
      [
        "jordi-liongola",
        "Jordi Liongola",
        "RM",
        26,
        71,
        71,
        1.4
      ],
      [
        "yan-valery",
        "Yan Valery",
        "RB",
        27,
        71,
        74,
        2.3
      ],
      [
        "joseph-patrick-lumley",
        "Joseph Patrick Lumley",
        "GK",
        31,
        69,
        70,
        1.1
      ],
      [
        "max-josef-lowe",
        "Max Josef Lowe",
        "CB",
        29,
        69,
        71,
        1.7
      ],
      [
        "jamal-akua-lowe",
        "Jamal Akua Lowe",
        "ST",
        32,
        69,
        70,
        1.6
      ],
      [
        "louie-mark-barry",
        "Louie Mark Barry",
        "LM",
        23,
        68,
        77,
        3.2
      ],
      [
        "callum-slattery",
        "Callum Slattery",
        "CM",
        27,
        68,
        68,
        1.1
      ],
      [
        "liam-jordan-palmer",
        "Liam Jordan Palmer",
        "CB",
        34,
        68,
        68,
        0.47500000000000003
      ],
      [
        "dishon-joel-bernard",
        "Di'Shon Joel Bernard",
        "CB",
        25,
        68,
        77,
        2.9
      ],
      [
        "ricardo-alexandre-almeida-santos",
        "Ricardo Alexandre Almeida Santos",
        "CB",
        31,
        67,
        67,
        0.8250000000000001
      ],
      [
        "mason-paul-james-burstow",
        "Mason Paul James Burstow",
        "ST",
        23,
        66,
        75,
        1.3
      ],
      [
        "gabriel-otegbayo",
        "Gabriel Otegbayo",
        "CB",
        21,
        66,
        75,
        1.1
      ],
      [
        "sil-laurentius-swinkels",
        "Sil Laurentius Swinkels",
        "CB",
        22,
        64,
        74,
        1
      ],
      [
        "sean-sheunesu-fusire",
        "Sean Sheunesu Fusire",
        "RB",
        21,
        63,
        68,
        0.35000000000000003
      ],
      [
        "ernie-weaver",
        "Ernie Weaver",
        "CB",
        20,
        63,
        70,
        0.19
      ],
      [
        "tyler-jaden-napier-edward-onyango",
        "Tyler Jaden Napier Edward Onyango",
        "CM",
        23,
        62,
        70,
        0.5
      ],
      [
        "connal-joe-trueman",
        "Connal Joe Trueman",
        "GK",
        30,
        61,
        62,
        0.275
      ],
      [
        "cole-mcghee",
        "Cole McGhee",
        "CB",
        20,
        60,
        69,
        0.24
      ],
      [
        "b-bannan",
        "B. Bannan",
        "CDM",
        35,
        73,
        73,
        1
      ],
      [
        "m-lowe",
        "M. Lowe",
        "CB",
        28,
        71,
        71,
        1
      ]
    ]
  },
  {
    "id": "sou",
    "name": "Southampton",
    "color": "#D71920",
    "budget": 0,
    "preferredFormation": "4-4-2",
    "tier": "championship",
    "players": [
      [
        "aaron-christopher-ramsdale",
        "Aaron Christopher Ramsdale",
        "GK",
        28,
        77,
        79,
        9.5
      ],
      [
        "yukinari-sugawara",
        "Yukinari Sugawara",
        "RB",
        26,
        75,
        78,
        5.5
      ],
      [
        "daniel-peretz",
        "Daniel Peretz",
        "GK",
        26,
        75,
        79,
        3.9
      ],
      [
        "leonardo-weschenfelder-scienza",
        "Leonardo Weschenfelder Scienza",
        "LM",
        28,
        75,
        75,
        3.3
      ],
      [
        "taylor-jay-harwood-bellis",
        "Taylor Jay Harwood-Bellis",
        "CB",
        24,
        75,
        81,
        8
      ],
      [
        "cyle-christopher-larin",
        "Cyle Christopher Larin",
        "ST",
        31,
        75,
        77,
        11
      ],
      [
        "flynn-downes",
        "Flynn Downes",
        "CDM",
        27,
        74,
        77,
        5.5
      ],
      [
        "finn-isaac-azaz",
        "Finn Isaac Azaz",
        "CAM",
        26,
        74,
        79,
        6.5
      ],
      [
        "ryan-phelim-manning",
        "Ryan Phelim Manning",
        "LB",
        30,
        74,
        74,
        2.7
      ],
      [
        "james-patrick-bree",
        "James Patrick Bree",
        "RB",
        28,
        73,
        73,
        1.5
      ],
      [
        "caspar-jander",
        "Caspar Jander",
        "CM",
        23,
        73,
        82,
        7
      ],
      [
        "mads-roerslev-rasmussen",
        "Mads Roerslev Rasmussen",
        "RB",
        27,
        72,
        75,
        3.5
      ],
      [
        "tom-allen-fellows",
        "Tom Allen Fellows",
        "RM",
        23,
        72,
        79,
        4.8
      ],
      [
        "welington-damascena-santos",
        "Welington Damascena Santos",
        "LB",
        25,
        72,
        79,
        4.5
      ],
      [
        "nathan-wood-gordon",
        "Nathan Wood-Gordon",
        "CB",
        24,
        72,
        75,
        2.2
      ],
      [
        "samuel-ikechukwu-edozie",
        "Samuel Ikechukwu Edozie",
        "LM",
        23,
        72,
        81,
        5.5
      ],
      [
        "jack-stephens",
        "Jack Stephens",
        "CB",
        32,
        72,
        72,
        1.6
      ],
      [
        "cameron-desmond-archer",
        "Cameron Desmond Archer",
        "ST",
        24,
        71,
        78,
        3.7
      ],
      [
        "lewis-norman-dobbin",
        "Lewis Norman Dobbin",
        "LM",
        23,
        71,
        77,
        2.3
      ],
      [
        "benjamin-anthony-brereton-diaz",
        "Benjamin Anthony Brereton Díaz",
        "RM",
        27,
        71,
        75,
        5
      ],
      [
        "damion-lamar-downs",
        "Damion Lamar Downs",
        "ST",
        22,
        70,
        80,
        3.5
      ],
      [
        "kuryu-matsuki",
        "Kuryu Matsuki",
        "CM",
        23,
        70,
        77,
        2.3
      ],
      [
        "joshua-quarshie",
        "Joshua Quarshie",
        "CB",
        22,
        69,
        79,
        2.9
      ],
      [
        "gavin-okeroghene-bazunu",
        "Gavin Okeroghene Bazunu",
        "GK",
        24,
        68,
        80,
        5
      ],
      [
        "divin-mubama",
        "Divin Mubama",
        "ST",
        21,
        68,
        78,
        1.2
      ],
      [
        "juan-larios-lopez",
        "Juan Larios López",
        "LB",
        22,
        68,
        70,
        0.47500000000000003
      ],
      [
        "george-long",
        "George Long",
        "GK",
        32,
        66,
        66,
        0.45
      ]
    ]
  },
  {
    "id": "sto",
    "name": "Stoke City",
    "color": "#E03A3E",
    "budget": 0,
    "preferredFormation": "4-2-3-1",
    "tier": "championship",
    "players": [
      [
        "benjamin-sorba-william-thomas",
        "Benjamin Sorba William Thomas",
        "LM",
        27,
        75,
        75,
        2.2
      ],
      [
        "viktor-tobias-johansson",
        "Viktor Tobias Johansson",
        "GK",
        28,
        74,
        76,
        4
      ],
      [
        "george-david-eric-hirst",
        "George David Eric Hirst",
        "ST",
        27,
        72,
        74,
        2.9
      ],
      [
        "ethan-stuart-william-galbraith",
        "Ethan Stuart William Galbraith",
        "RB",
        25,
        72,
        75,
        2.3
      ],
      [
        "benjamin-lewis-wilmot",
        "Benjamin Lewis Wilmot",
        "CB",
        26,
        72,
        73,
        1.7
      ],
      [
        "benjamin-anthony-johnson",
        "Benjamin Anthony Johnson",
        "RB",
        26,
        72,
        74,
        2.7
      ],
      [
        "million-manhoef",
        "Million Manhoef",
        "RM",
        24,
        71,
        78,
        3.7
      ],
      [
        "junior-baptiste-tchamadeu",
        "Junior Baptiste Tchamadeu",
        "RB",
        22,
        70,
        76,
        2.6
      ],
      [
        "jun-ho-bae",
        "Jun-ho Bae",
        "CAM",
        23,
        70,
        80,
        4.2
      ],
      [
        "svante-ulf-ingel-ingelsson",
        "Svante Ulf Ingel Ingelsson",
        "CM",
        28,
        70,
        70,
        1.4
      ],
      [
        "luke-graham",
        "Luke Graham",
        "CB",
        22,
        69,
        71,
        0.47500000000000003
      ],
      [
        "mohammed-bosun-lawal",
        "Mohammed Bosun Lawal",
        "CB",
        23,
        69,
        76,
        1.6
      ],
      [
        "el-hadji-djibril-soumare",
        "El Hadji Djibril Soumaré",
        "CDM",
        23,
        69,
        76,
        2.7
      ],
      [
        "aaron-cresswell",
        "Aaron Cresswell",
        "LB",
        36,
        69,
        73,
        0.8
      ],
      [
        "tomas-rigo",
        "Tomáš Rigo",
        "CDM",
        24,
        69,
        75,
        2.4
      ],
      [
        "benjamin-david-pearson",
        "Benjamin David Pearson",
        "CDM",
        31,
        69,
        70,
        1.3
      ],
      [
        "maksym-vadymovych-talovierov",
        "Maksym Vadymovych Talovierov",
        "CB",
        26,
        69,
        74,
        1.8
      ],
      [
        "eric-junior-bocat",
        "Eric-Junior Bocat",
        "LB",
        27,
        68,
        72,
        1.7
      ],
      [
        "mohamed-lamine-cisse",
        "Mohamed Lamine Cissé",
        "ST",
        23,
        68,
        78,
        2.7
      ],
      [
        "samuel-james-gallagher",
        "Samuel James Gallagher",
        "ST",
        31,
        68,
        69,
        1.4
      ],
      [
        "joshua-james-griffiths",
        "Joshua James Griffiths",
        "GK",
        25,
        68,
        73,
        1.4
      ],
      [
        "robert-bozenik",
        "Róbert Boženík",
        "ST",
        26,
        68,
        75,
        2.4
      ],
      [
        "benjamin-james-gibson",
        "Benjamin James Gibson",
        "CB",
        33,
        67,
        68,
        0.775
      ],
      [
        "francis-david-fielding",
        "Francis David Fielding",
        "GK",
        38,
        63,
        63,
        0.05
      ],
      [
        "freddie-anderson",
        "Freddie Anderson",
        "CB",
        19,
        58,
        74,
        0.4
      ]
    ]
  },
  {
    "id": "swa",
    "name": "Swansea City",
    "color": "#121212",
    "budget": 0,
    "preferredFormation": "4-4-2",
    "tier": "championship",
    "players": [
      [
        "zan-vipotnik",
        "Žan Vipotnik",
        "ST",
        24,
        76,
        76,
        2.4
      ],
      [
        "joseph-amankwaah-opoku",
        "Joseph Amankwaah Opoku",
        "LM",
        21,
        73,
        77,
        3
      ],
      [
        "cameron-robert-burgess",
        "Cameron Robert Burgess",
        "CB",
        30,
        73,
        73,
        2.5
      ],
      [
        "lawrence-ian-vigouroux",
        "Lawrence Ian Vigouroux",
        "GK",
        32,
        73,
        73,
        1
      ],
      [
        "joshua-lewis-tymon",
        "Joshua Lewis Tymon",
        "LB",
        27,
        73,
        73,
        1.9
      ],
      [
        "benjamin-george-cabango",
        "Benjamin George Cabango",
        "CB",
        26,
        72,
        77,
        2.6
      ],
      [
        "ross-cameron-stewart",
        "Ross Cameron Stewart",
        "ST",
        30,
        72,
        72,
        1.9
      ],
      [
        "goncalo-baptista-franco",
        "Gonçalo Baptista Franco",
        "CDM",
        25,
        72,
        78,
        3.4
      ],
      [
        "elijah-henry-just",
        "Elijah Henry Just",
        "CAM",
        26,
        72,
        72,
        1.1
      ],
      [
        "leo-walta",
        "Leo Walta",
        "CAM",
        23,
        71,
        77,
        3.1
      ],
      [
        "ji-sung-eom",
        "Ji-sung Eom",
        "LM",
        24,
        71,
        79,
        4.2
      ],
      [
        "marko-seufatu-nikola-stamenic",
        "Marko Seufatu Nikola Stamenić",
        "CDM",
        24,
        71,
        79,
        3.9
      ],
      [
        "ronald-pereira-martins",
        "Ronald Pereira Martins",
        "RM",
        25,
        70,
        77,
        3
      ],
      [
        "zeidane-inoussa",
        "Zeidane Inoussa",
        "LM",
        24,
        70,
        80,
        4.2
      ],
      [
        "adam-uche-idah",
        "Adam Uche Idah",
        "ST",
        25,
        70,
        78,
        4.7
      ],
      [
        "melker-widell",
        "Melker Widell",
        "CM",
        24,
        68,
        75,
        1.9
      ],
      [
        "filip-lissah",
        "Filip Lissah",
        "RB",
        21,
        68,
        72,
        0.35000000000000003
      ],
      [
        "jay-fulton",
        "Jay Fulton",
        "CDM",
        32,
        68,
        68,
        0.85
      ],
      [
        "stephen-welsh",
        "Stephen Welsh",
        "CB",
        26,
        68,
        73,
        1.6
      ],
      [
        "joshua-myles-abraham-key",
        "Joshua Myles Abraham Key",
        "RB",
        26,
        68,
        74,
        1.9
      ],
      [
        "moussa-kounfolo-yeo",
        "Moussa Kounfolo Yeo",
        "LM",
        22,
        67,
        78,
        2.7
      ],
      [
        "andrew-lee-fisher",
        "Andrew Lee Fisher",
        "GK",
        28,
        66,
        70,
        0.9
      ],
      [
        "florian-bianchini",
        "Florian Bianchini",
        "ST",
        25,
        65,
        73,
        1.7
      ]
    ]
  },
  {
    "id": "wat",
    "name": "Watford",
    "color": "#FBEE23",
    "budget": 0,
    "preferredFormation": "4-2-3-1",
    "tier": "championship",
    "players": [
      [
        "imran-louza",
        "Imrân Louza",
        "CM",
        27,
        74,
        75,
        3.7
      ],
      [
        "martin-ismael-payero",
        "Martín Ismael Payero",
        "CM",
        28,
        73,
        74,
        3.6
      ],
      [
        "federico-ravaglia",
        "Federico Ravaglia",
        "GK",
        26,
        72,
        75,
        1.9
      ],
      [
        "edoardo-bove",
        "Edoardo Bove",
        "CM",
        24,
        72,
        81,
        8.5
      ],
      [
        "marc-joel-bola",
        "Marc Joel Bola",
        "LB",
        28,
        72,
        73,
        2.5
      ],
      [
        "jordan-bhekithemba-zemura",
        "Jordan Bhekithemba Zemura",
        "LB",
        26,
        71,
        73,
        1.9
      ],
      [
        "jeremy-ngakia",
        "Jeremy Ngakia",
        "RB",
        26,
        71,
        73,
        1.9
      ],
      [
        "omar-haktab-traore",
        "Omar Haktab Traorè",
        "RB",
        28,
        70,
        74,
        3.2
      ],
      [
        "othmane-maamma",
        "Othmane Maamma",
        "RM",
        20,
        70,
        75,
        0.775
      ],
      [
        "matthew-william-pollock",
        "Matthew William Pollock",
        "CB",
        24,
        70,
        77,
        2.7
      ],
      [
        "edo-kayembe-kayembe",
        "Edo Kayembe Kayembe",
        "CM",
        28,
        70,
        72,
        2.1
      ],
      [
        "hector-matthew-kyprianou",
        "Hector Matthew Kyprianou",
        "CDM",
        25,
        69,
        76,
        2.5
      ],
      [
        "kwadwo-kyeremeh-baah",
        "Kwadwo Kyeremeh Baah",
        "RM",
        23,
        68,
        78,
        2.7
      ],
      [
        "luca-tange-kjerrumgaard",
        "Luca Tange Kjerrumgaard",
        "ST",
        23,
        68,
        76,
        1.6
      ],
      [
        "rocco-vata",
        "Rocco Vata",
        "LM",
        21,
        68,
        80,
        2.5
      ],
      [
        "kevin-keben-biakolo",
        "Kévin Keben Biakolo",
        "CB",
        22,
        68,
        78,
        2.9
      ],
      [
        "mamadou-doumbia",
        "Mamadou Doumbia",
        "ST",
        20,
        67,
        78,
        1.4
      ],
      [
        "daniel-bachmann",
        "Daniel Bachmann",
        "GK",
        32,
        66,
        68,
        0.8
      ],
      [
        "iker-bravo-solanilla",
        "Iker Bravo Solanilla",
        "ST",
        21,
        66,
        81,
        2.5
      ],
      [
        "samuel-colin-walker",
        "Samuel Colin Walker",
        "GK",
        34,
        65,
        65,
        0.16
      ],
      [
        "jack-grieves",
        "Jack Grieves",
        "RM",
        21,
        59,
        73,
        0.425
      ],
      [
        "michael-adu-poku",
        "Michael Adu-Poku",
        "RM",
        20,
        57,
        67,
        0.3
      ]
    ]
  },
  {
    "id": "wes",
    "name": "West Bromwich Albion",
    "color": "#122F67",
    "budget": 0,
    "preferredFormation": "4-4-2",
    "tier": "championship",
    "players": [
      [
        "felix-horn-myhre",
        "Felix Horn Myhre",
        "CM",
        27,
        73,
        77,
        5.5
      ],
      [
        "michael-andrew-johnston",
        "Michael Andrew Johnston",
        "LM",
        27,
        72,
        73,
        2.8
      ],
      [
        "nathaniel-harry-phillips",
        "Nathaniel Harry Phillips",
        "CB",
        29,
        71,
        71,
        1.5
      ],
      [
        "christopher-james-mepham",
        "Christopher James Mepham",
        "CB",
        28,
        71,
        75,
        3.2
      ],
      [
        "callum-john-styles",
        "Callum John Styles",
        "LB",
        26,
        71,
        75,
        2.2
      ],
      [
        "isaac-jude-price",
        "Isaac Jude Price",
        "CAM",
        22,
        71,
        79,
        3.1
      ],
      [
        "rabby-nzingoula",
        "Rabby Nzingoula",
        "CDM",
        20,
        70,
        77,
        2.8
      ],
      [
        "max-edward-oleary",
        "Max Edward O'Leary",
        "GK",
        29,
        70,
        73,
        1.5
      ],
      [
        "jayson-patrick-molumby",
        "Jayson Patrick Molumby",
        "CDM",
        27,
        70,
        72,
        1.8
      ],
      [
        "krystian-bielik",
        "Krystian Bielik",
        "CB",
        28,
        70,
        75,
        2.7
      ],
      [
        "george-campbell",
        "George Campbell",
        "CB",
        25,
        69,
        75,
        2.2
      ],
      [
        "aune-selland-heggeb",
        "Aune Selland Heggebø",
        "ST",
        25,
        69,
        75,
        2.4
      ],
      [
        "ousmane-diakite",
        "Ousmane Diakité",
        "CDM",
        26,
        69,
        74,
        1.8
      ],
      [
        "nolan-galves",
        "Nolan Galves",
        "RB",
        23,
        68,
        74,
        1.5
      ],
      [
        "conor-stephen-townsend",
        "Conor Stephen Townsend",
        "LB",
        33,
        68,
        68,
        0.8250000000000001
      ],
      [
        "barney-stewart",
        "Barney Stewart",
        "ST",
        22,
        67,
        67,
        0.375
      ],
      [
        "matthew-robert-ingram",
        "Matthew Robert Ingram",
        "GK",
        32,
        67,
        67,
        0.55
      ],
      [
        "jimmy-jay-morgan",
        "Jimmy-Jay Morgan",
        "CAM",
        20,
        65,
        78,
        0.85
      ],
      [
        "tammer-bany-odeh",
        "Tammer Bany Odeh",
        "CAM",
        22,
        63,
        74,
        1.3
      ],
      [
        "alex-williams",
        "Alex Williams",
        "RB",
        21,
        56,
        70,
        0.325
      ],
      [
        "joe-wallis",
        "Joe Wallis",
        "GK",
        21,
        55,
        68,
        0.23
      ],
      [
        "s-iling-junior",
        "S. Iling-Junior",
        "LM",
        21,
        74,
        78,
        8
      ]
    ]
  },
  {
    "id": "whu",
    "name": "West Ham United",
    "color": "#7A263A",
    "budget": 0,
    "preferredFormation": "4-3-1-2",
    "tier": "championship",
    "players": [
      [
        "jarrod-bowen",
        "Jarrod Bowen",
        "RM",
        29,
        83,
        83,
        37
      ],
      [
        "valentin-mariano-jose-castellanos-gimenez",
        "Valentín Mariano José Castellanos Giménez",
        "ST",
        27,
        78,
        81,
        25
      ],
      [
        "konstantinos-mavropanos",
        "Konstantinos Mavropanos",
        "CB",
        28,
        78,
        78,
        7.5
      ],
      [
        "el-hadji-malick-diouf",
        "El Hadji Malick Diouf",
        "LB",
        21,
        78,
        82,
        11
      ],
      [
        "joel-ivo-veltman",
        "Joël Ivo Veltman",
        "RB",
        34,
        77,
        78,
        7.5
      ],
      [
        "edson-omar-alvarez-velazquez",
        "Edson Omar Álvarez Velázquez",
        "CDM",
        28,
        77,
        79,
        15
      ],
      [
        "kyle-leonardus-walker-peters",
        "Kyle Leonardus Walker-Peters",
        "RB",
        29,
        76,
        76,
        5
      ],
      [
        "tomas-soucek",
        "Tomáš Souček",
        "CDM",
        31,
        76,
        78,
        12
      ],
      [
        "manor-solomon",
        "Manor Solomon",
        "LM",
        27,
        76,
        77,
        12
      ],
      [
        "jean-clair-dimitri-roger-todibo",
        "Jean-Clair Dimitri Roger Todibo",
        "CB",
        26,
        76,
        81,
        17
      ],
      [
        "alphonse-francis-areola",
        "Alphonse Francis Aréola",
        "GK",
        33,
        75,
        77,
        5
      ],
      [
        "mads-hermansen",
        "Mads Hermansen",
        "GK",
        26,
        74,
        81,
        9
      ],
      [
        "arne-engels",
        "Arne Engels",
        "CM",
        23,
        74,
        84,
        13
      ],
      [
        "joel-mohammed-ramzan-piroe",
        "Joël Mohammed Ramzan Piroe",
        "ST",
        27,
        74,
        78,
        7.5
      ],
      [
        "james-michael-edward-ward-prowse",
        "James Michael Edward Ward-Prowse",
        "CM",
        31,
        74,
        77,
        10
      ],
      [
        "maximilian-william-kilman",
        "Maximilian William Kilman",
        "CB",
        29,
        74,
        79,
        11
      ],
      [
        "soungoutou-magassa",
        "Soungoutou Magassa",
        "CDM",
        22,
        73,
        80,
        6
      ],
      [
        "gnaly-maxwel-cornet",
        "Gnaly Maxwel Cornet",
        "LM",
        29,
        73,
        74,
        4.2
      ],
      [
        "pablo-felipe-pereira-de-jesus",
        "Pablo Felipe Pereira de Jesus",
        "ST",
        22,
        73,
        80,
        3.6
      ],
      [
        "oliver-scarles",
        "Oliver Scarles",
        "LB",
        20,
        71,
        80,
        3.3
      ],
      [
        "kaelan-casey",
        "Kaelan Casey",
        "CB",
        21,
        63,
        74,
        0.55
      ],
      [
        "lewis-orford",
        "Lewis Orford",
        "CDM",
        20,
        61,
        78,
        0.8
      ]
    ]
  },
  {
    "id": "wol",
    "name": "Wolverhampton Wanderers",
    "color": "#FDB913",
    "budget": 0,
    "preferredFormation": "4-3-3",
    "tier": "championship",
    "players": [
      [
        "ladislav-krejci",
        "Ladislav Krejčí",
        "CB",
        27,
        78,
        82,
        18
      ],
      [
        "raul-alonso-jimenez-rodriguez",
        "Raúl Alonso Jiménez Rodríguez",
        "ST",
        35,
        78,
        78,
        5
      ],
      [
        "andre-trindade-da-costa-neto",
        "André Trindade da Costa Neto",
        "CDM",
        25,
        78,
        83,
        20
      ],
      [
        "kieran-john-trippier",
        "Kieran John Trippier",
        "RB",
        35,
        77,
        80,
        7.5
      ],
      [
        "marshall-nyasha-munetsi",
        "Marshall Nyasha Munetsi",
        "CM",
        30,
        76,
        76,
        7.5
      ],
      [
        "santiago-ignacio-bueno-sciutto",
        "Santiago Ignacio Bueno Sciutto",
        "CB",
        27,
        76,
        79,
        8.5
      ],
      [
        "hugo-bueno-lopez",
        "Hugo Bueno López",
        "LB",
        24,
        75,
        80,
        6.5
      ],
      [
        "tote-antonio-gomes",
        "Tote António Gomes",
        "CB",
        27,
        75,
        79,
        7
      ],
      [
        "jose-pedro-malheiro-de-sa",
        "José Pedro Malheiro de Sá",
        "GK",
        33,
        75,
        77,
        5
      ],
      [
        "samuel-luke-johnstone",
        "Samuel Luke Johnstone",
        "GK",
        33,
        74,
        76,
        3.7
      ],
      [
        "jean-ricner-bellegarde",
        "Jean-Ricner Bellegarde",
        "CM",
        28,
        74,
        76,
        6.5
      ],
      [
        "mateus-bula-dami-mane",
        "Mateus Bula Dami Mané",
        "CAM",
        19,
        74,
        79,
        0.625
      ],
      [
        "rodrigo-martins-gomes",
        "Rodrigo Martins Gomes",
        "LW",
        23,
        74,
        82,
        5.5
      ],
      [
        "sasa-kalajdzic",
        "Saša Kalajdžić",
        "ST",
        29,
        74,
        74,
        4.6
      ],
      [
        "fernando-lopez-gonzalez",
        "Fernando López González",
        "RW",
        22,
        73,
        82,
        7
      ],
      [
        "yerson-mosquera-valdelamar",
        "Yerson Mosquera Valdelamar",
        "CB",
        25,
        73,
        78,
        3.4
      ],
      [
        "david-mller-wolfe",
        "David Møller Wolfe",
        "LB",
        24,
        73,
        78,
        4.3
      ],
      [
        "hee-chan-hwang",
        "Hee-chan Hwang",
        "ST",
        30,
        73,
        75,
        5.5
      ],
      [
        "adam-james-armstrong",
        "Adam James Armstrong",
        "ST",
        29,
        73,
        73,
        3.1
      ],
      [
        "jordan-anthony-james",
        "Jordan Anthony James",
        "CM",
        22,
        73,
        80,
        3
      ],
      [
        "jackson-tchatchoua",
        "Jackson Tchatchoua",
        "RB",
        25,
        72,
        81,
        8
      ],
      [
        "rafiki-said-ahamada",
        "Rafiki Saïd Ahamada",
        "LM",
        26,
        72,
        72,
        1.8
      ],
      [
        "thomas-glyn-doyle",
        "Thomas Glyn Doyle",
        "CDM",
        24,
        72,
        78,
        4.6
      ],
      [
        "boubacar-traore",
        "Boubacar Traoré",
        "CDM",
        25,
        71,
        76,
        2.6
      ],
      [
        "ki-jana-delano-hoever",
        "Ki-Jana Delano Hoever",
        "RB",
        24,
        71,
        78,
        5.5
      ],
      [
        "yacouba-nasser-djiga",
        "Yacouba Nasser Djiga",
        "CB",
        23,
        70,
        78,
        3.3
      ],
      [
        "pedro-henrique-cardoso-de-lima",
        "Pedro Henrique Cardoso de Lima",
        "RB",
        20,
        68,
        83,
        2.7
      ],
      [
        "tawanda-blessing-chirewa",
        "Tawanda Blessing Chirewa",
        "LM",
        22,
        64,
        76,
        1.4
      ],
      [
        "enso-david-gonzalez-medina",
        "Enso David Gonzalez Medina",
        "LW",
        21,
        63,
        77,
        1.2
      ]
    ]
  },
  {
    "id": "wre",
    "name": "Wrexham",
    "color": "#E31B23",
    "budget": 0,
    "preferredFormation": "4-3-3",
    "tier": "championship",
    "players": [
      [
        "anthony-patterson",
        "Anthony Patterson",
        "GK",
        26,
        73,
        78,
        3.6
      ],
      [
        "benjamin-david-sheaf",
        "Benjamin David Sheaf",
        "CDM",
        28,
        73,
        77,
        4.9
      ],
      [
        "joshua-dean-windass",
        "Joshua Dean Windass",
        "CAM",
        32,
        73,
        73,
        1.9
      ],
      [
        "callum-craig-doyle",
        "Callum Craig Doyle",
        "CB",
        22,
        73,
        80,
        4.9
      ],
      [
        "dominic-john-hyam",
        "Dominic John Hyam",
        "CB",
        30,
        72,
        72,
        1.6
      ],
      [
        "kieffer-roberto-francisco-moore",
        "Kieffer Roberto Francisco Moore",
        "ST",
        34,
        72,
        72,
        1.9
      ],
      [
        "benjamin-whiteman",
        "Benjamin Whiteman",
        "CDM",
        30,
        72,
        72,
        2
      ],
      [
        "nathan-paul-broadhead",
        "Nathan Paul Broadhead",
        "LM",
        28,
        72,
        73,
        3.2
      ],
      [
        "liberato-gianpaolo-cacace",
        "Liberato Gianpaolo Cacace",
        "LB",
        25,
        72,
        77,
        3.3
      ],
      [
        "lewis-john-obrien",
        "Lewis John O'Brien",
        "CM",
        27,
        72,
        75,
        3
      ],
      [
        "matthew-lee-james",
        "Matthew Lee James",
        "CDM",
        35,
        70,
        70,
        0.6
      ],
      [
        "george-thomason",
        "George Thomason",
        "LB",
        25,
        70,
        73,
        1.7
      ],
      [
        "daniel-ward",
        "Daniel Ward",
        "GK",
        33,
        70,
        70,
        0.8
      ],
      [
        "max-george-cleworth",
        "Max George Cleworth",
        "CB",
        24,
        70,
        76,
        2.5
      ],
      [
        "conor-david-coady",
        "Conor David Coady",
        "CB",
        33,
        70,
        72,
        1.5
      ],
      [
        "george-david-dobson",
        "George David Dobson",
        "CM",
        28,
        70,
        71,
        1.5
      ],
      [
        "zachary-george-onyego-vyner",
        "Zachary George Onyego Vyner",
        "CB",
        29,
        70,
        72,
        1.6
      ],
      [
        "daniel-edward-peter-imray",
        "Daniel Edward Peter Imray",
        "RB",
        23,
        69,
        69,
        0.7000000000000001
      ],
      [
        "oliver-michael-rathbone",
        "Oliver Michael Rathbone",
        "CM",
        29,
        69,
        69,
        1.4
      ],
      [
        "davis-james-marshall-keillor-dunn",
        "Davis James Marshall Keillor-Dunn",
        "ST",
        28,
        68,
        69,
        1.4
      ],
      [
        "daniel-george-scarr",
        "Daniel George Scarr",
        "CB",
        31,
        68,
        68,
        0.7000000000000001
      ],
      [
        "samuel-toby-smith",
        "Samuel Toby Smith",
        "ST",
        28,
        68,
        69,
        1.4
      ],
      [
        "ryan-james-longman",
        "Ryan James Longman",
        "RB",
        25,
        68,
        72,
        1.5
      ],
      [
        "elliot-robert-lee",
        "Elliot Robert Lee",
        "CM",
        31,
        67,
        67,
        0.975
      ],
      [
        "bailey-tye-cadamarteri",
        "Bailey-Tye Cadamarteri",
        "ST",
        21,
        65,
        72,
        1.3
      ],
      [
        "sebastian-revan",
        "Sebastian Revan",
        "LB",
        23,
        64,
        71,
        0.85
      ],
      [
        "callum-alex-david-burton",
        "Callum Alex David Burton",
        "GK",
        30,
        62,
        62,
        0.275
      ],
      [
        "harry-ashfield",
        "Harry Ashfield",
        "CM",
        20,
        58,
        66,
        0.19
      ],
      [
        "aaron-thomas-james",
        "Aaron Thomas James",
        "CB",
        21,
        55,
        65,
        0.22
      ],
      [
        "alex-moore",
        "Alex Moore",
        "CM",
        20,
        53,
        69,
        0.15
      ]
    ]
  }
];

const RAW_LALIGACLUBS = [
  {
    "id": "ath",
    "name": "Athletic Club",
    "color": "#EE2523",
    "budget": 43,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "unai-simon-mendibil",
        "Unai Simón Mendibil",
        "GK",
        29,
        85,
        86,
        43
      ],
      [
        "aymeric-jean-louis-gerard-alphonse-laporte",
        "Aymeric Jean Louis Gerard Alphonse Laporte",
        "CB",
        32,
        84,
        84,
        21
      ],
      [
        "nicholas-williams-arthuer",
        "Nicholas Williams Arthuer",
        "LW",
        24,
        84,
        89,
        95
      ],
      [
        "daniel-vivian-moreno",
        "Daniel Vivian Moreno",
        "CB",
        27,
        82,
        87,
        50
      ],
      [
        "oihan-sancet-tirapu",
        "Oihan Sancet Tirapu",
        "CAM",
        26,
        82,
        88,
        59
      ],
      [
        "inaki-williams-arthuer",
        "Iñaki Williams Arthuer",
        "RW",
        32,
        80,
        83,
        30
      ],
      [
        "inigo-ruiz-de-galarreta-etxeberria",
        "Iñigo Ruiz de Galarreta Etxeberria",
        "CDM",
        33,
        79,
        80,
        15
      ],
      [
        "alejandro-berenguer-remiro",
        "Alejandro Berenguer Remiro",
        "RW",
        31,
        79,
        82,
        30
      ],
      [
        "yuri-berchiche-izeta",
        "Yuri Berchiche Izeta",
        "LB",
        36,
        79,
        79,
        5.5
      ],
      [
        "mikel-jauregizar-alboniga",
        "Mikel Jauregizar Alboniga",
        "CM",
        22,
        79,
        88,
        32
      ],
      [
        "gorka-guruzeta-rodriguez",
        "Gorka Guruzeta Rodríguez",
        "ST",
        30,
        78,
        79,
        18
      ],
      [
        "aitor-paredes-casamichana",
        "Aitor Paredes Casamichana",
        "CB",
        26,
        78,
        81,
        17
      ],
      [
        "benat-prados-diaz",
        "Beñat Prados Díaz",
        "CDM",
        25,
        77,
        84,
        21
      ],
      [
        "andoni-gorosabel-espinosa",
        "Andoni Gorosabel Espinosa",
        "RB",
        30,
        76,
        77,
        9.5
      ],
      [
        "jesus-areso-blanco",
        "Jesús Areso Blanco",
        "RB",
        27,
        76,
        79,
        9
      ],
      [
        "robert-navarro-munoz",
        "Robert Navarro Muñoz",
        "RW",
        24,
        76,
        82,
        9.5
      ],
      [
        "hugo-rincon-lumbreras",
        "Hugo Rincón Lumbreras",
        "RB",
        23,
        75,
        81,
        6.5
      ],
      [
        "alejandro-rego-mora",
        "Alejandro Rego Mora",
        "CDM",
        23,
        73,
        75,
        1.5
      ],
      [
        "adama-boiro-boiro",
        "Adama Boiro Boiro",
        "LB",
        24,
        73,
        82,
        6.5
      ],
      [
        "peio-canales-urtasun",
        "Peio Canales Urtasun",
        "CAM",
        21,
        73,
        80,
        1.7
      ],
      [
        "unai-vencedor-paris",
        "Unai Vencedor Paris",
        "CDM",
        25,
        72,
        75,
        2.4
      ],
      [
        "nicolas-serrano-galdeano",
        "Nicolás Serrano Galdeano",
        "LW",
        23,
        71,
        78,
        3.6
      ],
      [
        "maroan-sannadi-harrouch",
        "Maroan Sannadi Harrouch",
        "ST",
        25,
        71,
        80,
        6
      ],
      [
        "benat-gerenabarrena",
        "Beñat Gerenabarrena",
        "CM",
        23,
        70,
        73,
        1.6
      ],
      [
        "unai-egiluz-arroyo",
        "Unai Egiluz Arroyo",
        "CB",
        24,
        70,
        75,
        2.2
      ],
      [
        "alejandro-padilla-perez",
        "Alejandro Padilla Pérez",
        "GK",
        23,
        69,
        79,
        2.3
      ],
      [
        "mikel-santos-linares",
        "Mikel Santos Linares",
        "GK",
        21,
        63,
        75,
        1
      ]
    ]
  },
  {
    "id": "atl",
    "name": "Atlético Madrid",
    "color": "#CB3524",
    "budget": 54,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "jan-oblak",
        "Jan Oblak",
        "GK",
        33,
        88,
        88,
        45
      ],
      [
        "julian-alvarez",
        "Julián Álvarez",
        "ST",
        26,
        86,
        90,
        107
      ],
      [
        "alejandro-grimaldo-garcia",
        "Alejandro Grimaldo García",
        "LM",
        30,
        85,
        85,
        42
      ],
      [
        "marcos-llorente-moreno",
        "Marcos Llorente Moreno",
        "RB",
        31,
        85,
        85,
        37
      ],
      [
        "morten-blom-due-hjulmand",
        "Morten Blom Due Hjulmand",
        "CDM",
        27,
        83,
        86,
        43
      ],
      [
        "david-hancko",
        "Dávid Hancko",
        "CB",
        28,
        83,
        85,
        39
      ],
      [
        "pablo-barrios-rivas",
        "Pablo Barrios Rivas",
        "CM",
        23,
        83,
        87,
        47
      ],
      [
        "alejandro-baena-rodriguez",
        "Alejandro Baena Rodríguez",
        "LM",
        25,
        83,
        89,
        64
      ],
      [
        "ademola-olajade-alade-aylola-lookman",
        "Ademola Olajade Alade Aylola Lookman",
        "ST",
        28,
        83,
        84,
        46
      ],
      [
        "alexander-srloth",
        "Alexander Sørloth",
        "ST",
        30,
        83,
        84,
        42
      ],
      [
        "giuliano-simeone-baldini",
        "Giuliano Simeone Baldini",
        "RM",
        23,
        82,
        86,
        40
      ],
      [
        "cristian-gabriel-romero",
        "Cristian Gabriel Romero",
        "CB",
        28,
        82,
        84,
        33
      ],
      [
        "jose-maria-gimenez-de-vargas",
        "José María Giménez de Vargas",
        "CB",
        31,
        82,
        83,
        30
      ],
      [
        "juan-agustin-musso",
        "Juan Agustín Musso",
        "GK",
        32,
        82,
        82,
        9.5
      ],
      [
        "robin-le-normand",
        "Robin Le Normand",
        "CB",
        29,
        81,
        85,
        37
      ],
      [
        "jorge-resurreccion-merodio",
        "Jorge Resurrección Merodio",
        "CM",
        34,
        81,
        81,
        16
      ],
      [
        "marc-pubill-pages",
        "Marc Pubill Pagés",
        "CB",
        23,
        81,
        82,
        6.5
      ],
      [
        "kang-in-lee",
        "Kang-in Lee",
        "RW",
        25,
        80,
        84,
        27
      ],
      [
        "joao-lucas-de-souza-cardoso",
        "João Lucas de Souza Cardoso",
        "CDM",
        24,
        80,
        87,
        38
      ],
      [
        "thomas-lemar",
        "Thomas Lemar",
        "CM",
        30,
        77,
        77,
        11
      ],
      [
        "obed-gomez-vargas",
        "Obed Gómez Vargas",
        "CDM",
        21,
        72,
        79,
        3
      ],
      [
        "rodrigo-mendoza-martinez-moya",
        "Rodrigo Mendoza Martinez Moya",
        "CM",
        21,
        71,
        83,
        2.2
      ],
      [
        "carlos-martin-dominguez",
        "Carlos Martín Domínguez",
        "LW",
        24,
        70,
        78,
        3.6
      ]
    ]
  },
  {
    "id": "cao",
    "name": "CA Osasuna",
    "color": "#D2122E",
    "budget": 15,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "ante-budimir",
        "Ante Budimir",
        "ST",
        35,
        82,
        82,
        20
      ],
      [
        "flavien-enzo-thiedort-boyomo",
        "Flavien Enzo Thiedort Boyomo",
        "CB",
        24,
        79,
        85,
        26
      ],
      [
        "sergio-herrera-piron",
        "Sergio Herrera Pirón",
        "GK",
        33,
        79,
        79,
        8.5
      ],
      [
        "valentin-andre-henri-rosier",
        "Valentin André Henri Rosier",
        "RB",
        30,
        78,
        78,
        9.5
      ],
      [
        "ruben-garcia-santos",
        "Rubén García Santos",
        "RM",
        33,
        77,
        78,
        12
      ],
      [
        "aitor-fernandez-abarisketa",
        "Aitor Fernández Abarisketa",
        "GK",
        35,
        77,
        77,
        1.8
      ],
      [
        "jon-moncayola-tollar",
        "Jon Moncayola Tollar",
        "CM",
        28,
        77,
        79,
        16
      ],
      [
        "alejandro-catena-marugan",
        "Alejandro Catena Marugán",
        "CB",
        31,
        77,
        79,
        15
      ],
      [
        "moises-gomez-bordonado",
        "Moisés Gómez Bordonado",
        "CM",
        32,
        76,
        77,
        8.5
      ],
      [
        "abel-bretones-cruz",
        "Abel Bretones Cruz",
        "LB",
        26,
        76,
        80,
        8
      ],
      [
        "aimar-oroz-huarte",
        "Aimar Oroz Huarte",
        "CAM",
        24,
        76,
        83,
        17
      ],
      [
        "diego-rico-salguero",
        "Diego Rico Salguero",
        "LB",
        33,
        76,
        77,
        7.5
      ],
      [
        "lucas-torro-marset",
        "Lucas Torró Marset",
        "CDM",
        32,
        76,
        78,
        12
      ],
      [
        "raul-moro-prescoli",
        "Raúl Moro Prescoli",
        "LW",
        23,
        75,
        84,
        17
      ],
      [
        "raul-garcia-de-haro",
        "Raúl García de Haro",
        "ST",
        25,
        75,
        80,
        6
      ],
      [
        "jonathan-dubasin",
        "Jonathan Dubasin",
        "RW",
        26,
        74,
        75,
        3.8
      ],
      [
        "jorge-herrando-oroz",
        "Jorge Herrando Oroz",
        "CB",
        25,
        74,
        81,
        8
      ],
      [
        "enrique-barja-alfonso",
        "Enrique Barja Alfonso",
        "LW",
        29,
        73,
        74,
        4.2
      ],
      [
        "iker-munoz-cameros",
        "Iker Muñoz Cameros",
        "CDM",
        24,
        73,
        82,
        4.2
      ],
      [
        "asier-osambela-larraya",
        "Asier Osambela Larraya",
        "CB",
        21,
        66,
        76,
        0.775
      ],
      [
        "rockson-yeboah",
        "Rockson Yeboah",
        "CB",
        22,
        65,
        73,
        0.55
      ],
      [
        "mauro-echegoyen-berrozpe",
        "Mauro Echegoyen Berrozpe",
        "CDM",
        21,
        63,
        73,
        1.2
      ],
      [
        "inigo-arguibide-goni",
        "Iñigo Arguibide Goñi",
        "RB",
        21,
        63,
        76,
        0.6
      ]
    ]
  },
  {
    "id": "dep",
    "name": "Deportivo Alavés",
    "color": "#1F3F8F",
    "budget": 8,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "antonio-blanco-conde",
        "Antonio Blanco Conde",
        "CDM",
        26,
        78,
        81,
        8
      ],
      [
        "antonio-martinez-lopez",
        "Antonio Martínez López",
        "ST",
        29,
        78,
        78,
        4.3
      ],
      [
        "antonio-sivera-salva",
        "Antonio Sivera Salvá",
        "GK",
        30,
        77,
        78,
        6.5
      ],
      [
        "facundo-nahuel-tenaglia",
        "Facundo Nahuel Tenaglia",
        "CB",
        30,
        77,
        77,
        6.5
      ],
      [
        "lucas-ariel-boye",
        "Lucas Ariel Boyé",
        "ST",
        30,
        77,
        77,
        3
      ],
      [
        "jonathan-castro-otto",
        "Jonathan Castro Otto",
        "RB",
        32,
        76,
        76,
        3.1
      ],
      [
        "denis-suarez-fernandez",
        "Denis Suárez Fernández",
        "CM",
        32,
        74,
        74,
        3.5
      ],
      [
        "ander-guevara-lajo",
        "Ander Guevara Lajo",
        "CDM",
        29,
        74,
        77,
        7.5
      ],
      [
        "carles-alena-castillo",
        "Carles Aleñá Castillo",
        "LM",
        28,
        74,
        74,
        3.2
      ],
      [
        "abderrahman-rebbach",
        "Abderrahman Rebbach",
        "LW",
        28,
        73,
        73,
        1.5
      ],
      [
        "carlos-nahuel-benavidez-protesoni",
        "Carlos Nahuel Benavidez Protesoni",
        "CDM",
        28,
        73,
        76,
        3.5
      ],
      [
        "pablo-ibanez-lumbreras",
        "Pablo Ibáñez Lumbreras",
        "CM",
        27,
        73,
        73,
        2.7
      ],
      [
        "nicolas-valentini",
        "Nicolás Valentini",
        "CB",
        25,
        73,
        79,
        4.4
      ],
      [
        "angel-perez-hidalgo",
        "Ángel Pérez Hidalgo",
        "RM",
        24,
        72,
        72,
        0.85
      ],
      [
        "miguel-rodriguez-vidal",
        "Miguel Rodríguez Vidal",
        "RW",
        23,
        72,
        83,
        7
      ],
      [
        "youssef-enriquez",
        "Youssef Enríquez",
        "LB",
        20,
        70,
        81,
        1.2
      ],
      [
        "adrian-rodriguez-gimenez",
        "Adrián Rodríguez Giménez",
        "GK",
        25,
        68,
        72,
        1.1
      ],
      [
        "mariano-diaz-mejia",
        "Mariano Díaz Mejía",
        "ST",
        33,
        67,
        70,
        1.3
      ],
      [
        "mikel-rodriguez-ulacia",
        "Mikel Rodríguez Ulacia",
        "CM",
        24,
        67,
        74,
        1.6
      ],
      [
        "jesus-lazaro-owono-ngua-akeng",
        "Jesús Lázaro Owono Ngua Akeng",
        "GK",
        25,
        67,
        74,
        1.7
      ],
      [
        "mamadou-selu-diallo-diallo",
        "Mamadou Selu Diallo Diallo",
        "CM",
        22,
        64,
        73,
        0.6
      ],
      [
        "hugo-novoa-ramos",
        "Hugo Novoa Ramos",
        "RM",
        23,
        64,
        73,
        1.6
      ],
      [
        "tomas-alage-mendes-mendes",
        "Tomás Alage Mendes Mendes",
        "CM",
        21,
        62,
        73,
        0.6
      ]
    ]
  },
  {
    "id": "elc",
    "name": "Elche CF",
    "color": "#00944A",
    "budget": 8,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "pedro-bigas-rigo",
        "Pedro Bigas Rigo",
        "CB",
        36,
        76,
        76,
        1.4
      ],
      [
        "david-leopold-affengruber",
        "David Leopold Affengruber",
        "CB",
        25,
        76,
        84,
        12
      ],
      [
        "german-valera-karabinaite",
        "Germán Valera Karabinaite",
        "LM",
        24,
        76,
        77,
        3
      ],
      [
        "matias-ezequiel-dituro-curto",
        "Matías Ezequiel Dituro Curto",
        "GK",
        39,
        76,
        76,
        0.625
      ],
      [
        "marc-aguado-pallares",
        "Marc Aguado Pallarés",
        "CDM",
        26,
        74,
        77,
        2.9
      ],
      [
        "facundo-valentin-buonanotte",
        "Facundo Valentín Buonanotte",
        "CAM",
        21,
        74,
        82,
        11
      ],
      [
        "victor-chust-garcia",
        "Víctor Chust García",
        "CB",
        26,
        74,
        77,
        2.6
      ],
      [
        "fernando-nino-rodriguez",
        "Fernando Niño Rodríguez",
        "ST",
        25,
        72,
        75,
        2.4
      ],
      [
        "martim-carvalho-neto",
        "Martim Carvalho Neto",
        "CM",
        23,
        72,
        80,
        3.6
      ],
      [
        "gonzalo-villar-del-fraile",
        "Gonzalo Villar del Fraile",
        "CM",
        28,
        72,
        73,
        2.7
      ],
      [
        "ezequiel-ponce-martinez",
        "Ezequiel Ponce Martínez",
        "ST",
        29,
        72,
        73,
        3.1
      ],
      [
        "jose-antonio-ferrandez-pomares",
        "José Antonio Ferrández Pomares",
        "RM",
        36,
        72,
        72,
        0.9500000000000001
      ],
      [
        "lucas-antonio-cepeda-barturen",
        "Lucas Antonio Cepeda Barturen",
        "LW",
        23,
        71,
        81,
        5.5
      ],
      [
        "jose-antonio-morente-oliva",
        "José Antonio Morente Oliva",
        "LM",
        29,
        71,
        72,
        2.4
      ],
      [
        "federico-redondo-solari",
        "Federico Redondo Solari",
        "CM",
        23,
        70,
        79,
        4.7
      ],
      [
        "grady-george-diangana",
        "Grady George Diangana",
        "CAM",
        28,
        70,
        70,
        1.7
      ],
      [
        "yago-de-santiago-alonso",
        "Yago de Santiago Alonso",
        "LW",
        23,
        70,
        80,
        3
      ],
      [
        "aboubacar-sangare-traore",
        "Aboubacar Sangaré Traoré",
        "RB",
        19,
        69,
        77,
        1
      ],
      [
        "john-chetauya-nwankwo-donald-okeh",
        "John Chetauya Nwankwo Donald Okeh",
        "CB",
        25,
        69,
        76,
        2.6
      ],
      [
        "abiel-alessio-osorio",
        "Abiel Alessio Osorio",
        "ST",
        24,
        68,
        76,
        2.8
      ],
      [
        "matia-barzic-gutierrez",
        "Matia Barzić Gutiérrez",
        "CB",
        22,
        68,
        77,
        1.4
      ],
      [
        "bambo-diaby-diaby",
        "Bambo Diaby Diaby",
        "CB",
        28,
        67,
        70,
        1.3
      ],
      [
        "alejandro-iturbe-encabo",
        "Alejandro Iturbe Encabo",
        "GK",
        23,
        66,
        78,
        1.8
      ],
      [
        "ali-houary-jeddoub",
        "Ali Houary Jeddoub",
        "CAM",
        21,
        65,
        76,
        0.9500000000000001
      ],
      [
        "adam-boayar-benaisa",
        "Adam Boayar Benaisa",
        "ST",
        20,
        64,
        75,
        0.775
      ]
    ]
  },
  {
    "id": "fcb",
    "name": "FC Barcelona",
    "color": "#A50044",
    "budget": 90,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "rodrigo-hernandez-cascante",
        "Rodrigo Hernández Cascante",
        "CDM",
        30,
        90,
        90,
        102
      ],
      [
        "lamine-yamal-nasraoui-ebana",
        "Lamine Yamal Nasraoui Ebana",
        "RW",
        19,
        90,
        95,
        147
      ],
      [
        "pedro-gonzalez-lopez",
        "Pedro González López",
        "CM",
        23,
        90,
        93,
        150
      ],
      [
        "raphael-dias-belloli",
        "Raphael Dias Belloli",
        "LW",
        29,
        88,
        89,
        104
      ],
      [
        "frenkie-de-jong",
        "Frenkie de Jong",
        "CM",
        29,
        86,
        87,
        80
      ],
      [
        "joan-garcia-pons",
        "Joan García Pons",
        "GK",
        25,
        86,
        89,
        47
      ],
      [
        "pau-cubarsi-paredes",
        "Pau Cubarsí Paredes",
        "CB",
        19,
        86,
        88,
        41
      ],
      [
        "fermin-lopez-marin",
        "Fermín López Marín",
        "CAM",
        23,
        85,
        87,
        43
      ],
      [
        "jules-olivier-kounde",
        "Jules Olivier Koundé",
        "RB",
        27,
        85,
        88,
        86
      ],
      [
        "eric-garcia-martret",
        "Eric García Martret",
        "CB",
        25,
        85,
        85,
        24
      ],
      [
        "daniel-olmo-carvajal",
        "Daniel Olmo Carvajal",
        "CAM",
        28,
        84,
        86,
        62
      ],
      [
        "pablo-martin-paez-gavira",
        "Pablo Martín Páez Gavira",
        "CM",
        22,
        83,
        89,
        56
      ],
      [
        "joao-pedro-cavaco-cancelo",
        "João Pedro Cavaco Cancelo",
        "LB",
        32,
        83,
        84,
        31
      ],
      [
        "alejandro-balde-martinez",
        "Alejandro Balde Martínez",
        "LB",
        22,
        82,
        87,
        50
      ],
      [
        "anthony-michael-gordon",
        "Anthony Michael Gordon",
        "LW",
        25,
        82,
        86,
        50
      ],
      [
        "karim-david-adeyemi",
        "Karim-David Adeyemi",
        "RM",
        24,
        82,
        86,
        39
      ],
      [
        "wojciech-tomasz-szczesny",
        "Wojciech Tomasz Szczęsny",
        "GK",
        36,
        81,
        84,
        4.7
      ],
      [
        "andreas-bdtker-christensen",
        "Andreas Bødtker Christensen",
        "CB",
        30,
        79,
        81,
        20
      ],
      [
        "gerard-martin-langreo",
        "Gerard Martín Langreo",
        "CB",
        24,
        79,
        82,
        9
      ],
      [
        "marc-bernal-casas",
        "Marc Bernal Casas",
        "CDM",
        19,
        78,
        85,
        6.5
      ],
      [
        "marc-casado-torras",
        "Marc Casadó Torras",
        "CDM",
        23,
        78,
        86,
        34
      ],
      [
        "roony-bardghji",
        "Roony Bardghji",
        "RW",
        20,
        74,
        82,
        3.3
      ],
      [
        "hector-fort-garcia",
        "Héctor Fort García",
        "RB",
        20,
        72,
        82,
        2.7
      ],
      [
        "antonio-fernandez-casino",
        "Antonio Fernández Casino",
        "RW",
        18,
        65,
        83,
        1.5
      ],
      [
        "guillermo-fernandez-casino",
        "Guillermo Fernández Casino",
        "CM",
        18,
        64,
        80,
        0.675
      ]
    ]
  },
  {
    "id": "get",
    "name": "Getafe CF",
    "color": "#005999",
    "budget": 10,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "david-soria-solis",
        "David Soria Solís",
        "GK",
        33,
        80,
        81,
        13
      ],
      [
        "dakonam-ortega-djene",
        "Dakonam Ortega Djené",
        "CB",
        34,
        77,
        77,
        5
      ],
      [
        "martin-adrian-satriano-costa",
        "Martín Adrián Satriano Costa",
        "ST",
        25,
        77,
        78,
        6
      ],
      [
        "zaid-abner-romero",
        "Zaid Abner Romero",
        "CB",
        26,
        77,
        79,
        4.3
      ],
      [
        "johan-andres-mojica-palacio",
        "Johan Andrés Mojica Palacio",
        "LB",
        34,
        76,
        78,
        9.5
      ],
      [
        "borja-mayoral-moya",
        "Borja Mayoral Moya",
        "ST",
        29,
        76,
        77,
        11
      ],
      [
        "christantus-ugonna-uche-uche",
        "Christantus Ugonna Uche Uche",
        "ST",
        23,
        75,
        84,
        17
      ],
      [
        "orel-johnson-mangala",
        "Orel Johnson Mangala",
        "CDM",
        28,
        75,
        79,
        12
      ],
      [
        "enes-unal",
        "Enes Ünal",
        "ST",
        29,
        75,
        77,
        11
      ],
      [
        "juan-sebastian-boselli-graf",
        "Juan Sebastián Boselli Graf",
        "CB",
        22,
        74,
        81,
        6.5
      ],
      [
        "javier-munoz-jimenez",
        "Javier Muñoz Jiménez",
        "CM",
        31,
        74,
        76,
        7
      ],
      [
        "mario-martin-rielves",
        "Mario Martín Rielves",
        "CM",
        22,
        74,
        79,
        2.7
      ],
      [
        "ramon-terrats-espacio",
        "Ramón Terrats Espacio",
        "RM",
        25,
        74,
        82,
        16
      ],
      [
        "francisco-femenia-far",
        "Francisco Femenía Far",
        "RB",
        35,
        74,
        75,
        2.1
      ],
      [
        "abdelkabir-abqar",
        "Abdelkabir Abqar",
        "CB",
        27,
        74,
        79,
        5.5
      ],
      [
        "andres-garcia-robledo",
        "Andrés García Robledo",
        "RB",
        23,
        73,
        82,
        6.5
      ],
      [
        "saba-sazonov",
        "Saba Sazonov",
        "CB",
        24,
        73,
        78,
        4.2
      ],
      [
        "yvan-neyou-noupa",
        "Yvan Neyou Noupa",
        "CM",
        29,
        73,
        75,
        5.5
      ],
      [
        "alejandro-san-cristobal-sanchez",
        "Alejandro San Cristóbal Sánchez",
        "RM",
        29,
        73,
        73,
        3.1
      ],
      [
        "francho-serrano-gracia",
        "Francho Serrano Gracia",
        "CM",
        24,
        72,
        81,
        5
      ],
      [
        "juan-miguel-jimenez-lopez",
        "Juan Miguel Jiménez López",
        "ST",
        33,
        71,
        74,
        3.4
      ],
      [
        "juan-berrocal-gonzalez",
        "Juan Berrocal González",
        "CB",
        27,
        69,
        77,
        2.6
      ],
      [
        "david-cordon-mancha",
        "David Cordón Mancha",
        "LB",
        18,
        69,
        80,
        1.4
      ],
      [
        "jiri-letacek",
        "Jiří Letáček",
        "GK",
        27,
        69,
        74,
        1.6
      ],
      [
        "jean-yves-valou",
        "Jean Yves Valou",
        "CB",
        20,
        66,
        77,
        0.875
      ],
      [
        "ismael-bekhoucha-lemlal",
        "Ismael Bekhoucha Lemlal",
        "RB",
        21,
        64,
        74,
        0.75
      ],
      [
        "alberto-risco-alcantara",
        "Alberto Risco Alcántara",
        "CAM",
        21,
        62,
        75,
        0.9500000000000001
      ],
      [
        "jorge-benito-de-valle-martin",
        "Jorge Benito de Valle Martín",
        "GK",
        20,
        58,
        73,
        0.425
      ]
    ]
  },
  {
    "id": "gir",
    "name": "Girona FC",
    "color": "#CD2534",
    "budget": 16,
    "preferredFormation": "4-3-3",
    "players": [
      [
        "azzedine-ounahi",
        "Azzedine Ounahi",
        "CM",
        26,
        79,
        81,
        11
      ],
      [
        "viktor-tsygankov",
        "Viktor Tsygankov",
        "RW",
        28,
        78,
        79,
        19
      ],
      [
        "paulo-dino-gazzaniga-farias",
        "Paulo Dino Gazzaniga Farias",
        "GK",
        34,
        77,
        79,
        5.5
      ],
      [
        "vladyslav-vanat",
        "Vladyslav Vanat",
        "ST",
        24,
        77,
        81,
        12
      ],
      [
        "khalid-abdul-mumin-suleman",
        "Khalid Abdul Mumin Suleman",
        "CB",
        28,
        77,
        80,
        12
      ],
      [
        "francisco-jose-beltran-peinado",
        "Francisco José Beltrán Peinado",
        "CM",
        27,
        77,
        81,
        18
      ],
      [
        "arnau-martinez-lopez",
        "Arnau Martínez López",
        "RB",
        23,
        77,
        84,
        25
      ],
      [
        "alexandre-moreno-lopera",
        "Alexandre Moreno Lopera",
        "LB",
        33,
        76,
        77,
        7.5
      ],
      [
        "bryan-gil-salvatierra",
        "Bryan Gil Salvatierra",
        "LW",
        25,
        75,
        82,
        20
      ],
      [
        "alejandro-frances-torrijo",
        "Alejandro Francés Torrijo",
        "CB",
        24,
        75,
        82,
        11
      ],
      [
        "cristhian-ricardo-stuani-curbelo",
        "Cristhian Ricardo Stuani Curbelo",
        "ST",
        39,
        75,
        77,
        3.6
      ],
      [
        "donny-van-de-beek",
        "Donny van de Beek",
        "CAM",
        29,
        74,
        76,
        7.5
      ],
      [
        "cristian-portugues-manzanera",
        "Cristian Portugués Manzanera",
        "LW",
        34,
        74,
        76,
        4.7
      ],
      [
        "david-lopez-silva",
        "David López Silva",
        "CB",
        36,
        74,
        77,
        2.8
      ],
      [
        "yaser-esneider-asprilla-martinez",
        "Yaser Esneider Asprilla Martínez",
        "RM",
        22,
        74,
        82,
        12
      ],
      [
        "abel-ruiz-ortega",
        "Abel Ruiz Ortega",
        "ST",
        26,
        72,
        76,
        4.1
      ],
      [
        "min-su-kim",
        "Min-su Kim",
        "LW",
        20,
        71,
        80,
        2.4
      ],
      [
        "dawda-camara-sankhare",
        "Dawda Camara Sankharé",
        "ST",
        23,
        68,
        73,
        1.6
      ],
      [
        "ivan-morante-ruiz",
        "Iván Morante Ruiz",
        "CDM",
        25,
        68,
        77,
        2.5
      ],
      [
        "antonino-jastin-garcia-lopez",
        "Antonino Jastin García Lopéz",
        "LM",
        22,
        68,
        78,
        1.2
      ],
      [
        "antal-yaakobishvili",
        "Antal Yaakobishvili",
        "CB",
        22,
        65,
        80,
        1.6
      ],
      [
        "unai-hernandez-lorenzo",
        "Unai Hernández Lorenzo",
        "LM",
        21,
        65,
        84,
        2.2
      ],
      [
        "vladyslav-krapyvtsov",
        "Vladyslav Krapyvtsov",
        "GK",
        21,
        64,
        79,
        1.2
      ],
      [
        "gilbert-jordana-camara",
        "Gilbert Jordana Cámara",
        "RB",
        19,
        62,
        78,
        0.8
      ],
      [
        "papa-dame-ba",
        "Papa Dame Ba",
        "RM",
        22,
        62,
        70,
        0.725
      ]
    ]
  },
  {
    "id": "lev",
    "name": "Levante UD",
    "color": "#0057A8",
    "budget": 8,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "aissa-mandi",
        "Aïssa Mandi",
        "CB",
        34,
        79,
        79,
        2.7
      ],
      [
        "mathew-david-ryan",
        "Mathew David Ryan",
        "GK",
        34,
        79,
        79,
        4.6
      ],
      [
        "carlos-alvarez-rivera",
        "Carlos Álvarez Rivera",
        "RM",
        23,
        77,
        82,
        12
      ],
      [
        "manuel-sanchez-de-la-pena",
        "Manuel Sánchez de la Peña",
        "LB",
        26,
        76,
        80,
        8
      ],
      [
        "ivan-romero-de-avila-araque",
        "Iván Romero de Ávila Araque",
        "ST",
        25,
        75,
        78,
        3.8
      ],
      [
        "karl-edouard-blaise-etta-eyong",
        "Karl Edouard Blaise Etta Eyong",
        "ST",
        22,
        75,
        81,
        3
      ],
      [
        "adrian-de-la-fuente-barquilla",
        "Adrián de la Fuente Barquilla",
        "CB",
        27,
        74,
        77,
        3.1
      ],
      [
        "hugo-sotelo-gomez",
        "Hugo Sotelo Gómez",
        "CM",
        22,
        74,
        79,
        4.9
      ],
      [
        "jon-ander-olasagasti-imizcoz",
        "Jon Ander Olasagasti Imizcoz",
        "CM",
        26,
        74,
        79,
        6.5
      ],
      [
        "jeremy-isaiah-richard-toljan",
        "Jeremy Isaiah Richard Toljan",
        "RB",
        32,
        74,
        74,
        2.6
      ],
      [
        "roger-brugue-ayguade",
        "Roger Brugué Ayguadé",
        "ST",
        29,
        74,
        74,
        4.3
      ],
      [
        "thiago-cruz-fernandez",
        "Thiago Cruz Fernández",
        "LM",
        22,
        74,
        82,
        9.5
      ],
      [
        "oriol-rey-erenas",
        "Oriol Rey Erenas",
        "CM",
        28,
        73,
        74,
        3.5
      ],
      [
        "enzo-bardeli",
        "Enzo Bardeli",
        "CM",
        25,
        73,
        75,
        2.7
      ],
      [
        "victor-garcia-raja",
        "Víctor García Raja",
        "RM",
        29,
        72,
        72,
        1.4
      ],
      [
        "daniel-requena-sanchez",
        "Daniel Requena Sánchez",
        "CM",
        22,
        70,
        76,
        1.4
      ],
      [
        "pablo-cunat-campos",
        "Pablo Cuñat Campos",
        "GK",
        24,
        69,
        77,
        2.7
      ],
      [
        "francisco-cortes-gracia",
        "Francisco Cortés Gracia",
        "LW",
        19,
        68,
        81,
        1.5
      ],
      [
        "jorge-cabello-trujillo",
        "Jorge Cabello Trujillo",
        "CB",
        22,
        67,
        77,
        1.8
      ],
      [
        "nacho-perez-gomez",
        "Nacho Pérez Gómez",
        "RB",
        18,
        67,
        77,
        0.875
      ],
      [
        "martin-wilhelm-krug",
        "Martín Wilhelm Krug",
        "CB",
        20,
        62,
        76,
        0.875
      ],
      [
        "daniel-martin-rodriguez",
        "Daniel Martín Rodríguez",
        "GK",
        20,
        62,
        69,
        0.375
      ],
      [
        "ifeanyi-arthur-ndukwe",
        "Ifeanyi-Arthur Ndukwe",
        "CB",
        18,
        61,
        75,
        0.325
      ],
      [
        "alejandro-primo-hernandez",
        "Alejandro Primo Hernández",
        "GK",
        22,
        60,
        74,
        0.525
      ]
    ]
  },
  {
    "id": "rcc",
    "name": "RC Celta",
    "color": "#8AC3EE",
    "budget": 16,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "iago-aspas-juncal",
        "Iago Aspas Juncal",
        "RW",
        39,
        81,
        83,
        12
      ],
      [
        "borja-iglesias-quintas",
        "Borja Iglesias Quintas",
        "ST",
        33,
        80,
        80,
        17
      ],
      [
        "aleix-febas-perez",
        "Aleix Febas Pérez",
        "CM",
        30,
        79,
        79,
        2.3
      ],
      [
        "marcos-alonso-mendoza",
        "Marcos Alonso Mendoza",
        "CB",
        35,
        79,
        79,
        5.5
      ],
      [
        "ionut-andrei-radu",
        "Ionuț Andrei Radu",
        "GK",
        29,
        78,
        78,
        3
      ],
      [
        "moriba-kourouma-kourouma",
        "Moriba Kourouma Kourouma",
        "CM",
        23,
        78,
        83,
        22
      ],
      [
        "carl-anders-theodor-starfelt",
        "Carl Anders Theodor Starfelt",
        "CB",
        31,
        78,
        78,
        12
      ],
      [
        "javier-galan-gil",
        "Javier Galán Gil",
        "LB",
        31,
        77,
        80,
        18
      ],
      [
        "sergio-carreira-vilarino",
        "Sergio Carreira Vilariño",
        "RB",
        25,
        76,
        78,
        7.5
      ],
      [
        "javier-rueda-garcia",
        "Javier Rueda García",
        "RB",
        24,
        76,
        76,
        2.3
      ],
      [
        "javier-rodriguez-galiano",
        "Javier Rodríguez Galiano",
        "CB",
        23,
        76,
        82,
        12
      ],
      [
        "matias-vecino-falero",
        "Matías Vecino Falero",
        "CM",
        35,
        76,
        77,
        6.5
      ],
      [
        "williot-theo-swedberg",
        "Williot Theo Swedberg",
        "LW",
        22,
        76,
        81,
        8.5
      ],
      [
        "alvaro-nunez-cobo",
        "Álvaro Núñez Cobo",
        "RB",
        26,
        76,
        77,
        3.3
      ],
      [
        "hugo-alvarez-antunez",
        "Hugo Álvarez Antúnez",
        "LM",
        23,
        75,
        82,
        12
      ],
      [
        "altay-bayndr",
        "Altay Bayındır",
        "GK",
        28,
        75,
        77,
        5
      ],
      [
        "ferran-jutgla-blanch",
        "Ferran Jutglà Blanch",
        "ST",
        27,
        75,
        75,
        6
      ],
      [
        "miguel-roman-gonzalez",
        "Miguel Román González",
        "CM",
        23,
        74,
        78,
        2.7
      ],
      [
        "pablo-duran-fernandez",
        "Pablo Durán Fernández",
        "ST",
        25,
        74,
        78,
        6
      ],
      [
        "jones-el-abdellaoui",
        "Jones El-Abdellaoui",
        "RW",
        20,
        72,
        79,
        1.4
      ],
      [
        "ivan-villar-martinez",
        "Iván Villar Martínez",
        "GK",
        29,
        72,
        76,
        3
      ],
      [
        "yoel-lago-amil",
        "Yoel Lago Amil",
        "CB",
        22,
        71,
        79,
        4.4
      ],
      [
        "abdoulaye-faye",
        "Abdoulaye Faye",
        "CB",
        21,
        71,
        83,
        2.7
      ]
    ]
  },
  {
    "id": "rcd",
    "name": "RCD Espanyol",
    "color": "#0A4C96",
    "budget": 10,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "marko-dmitrovic",
        "Marko Dmitrović",
        "GK",
        34,
        79,
        79,
        5.5
      ],
      [
        "javier-puado-diaz",
        "Javier Puado Díaz",
        "LW",
        28,
        77,
        79,
        17
      ],
      [
        "eduardo-exposito-jaen",
        "Eduardo Expósito Jaén",
        "CAM",
        30,
        77,
        77,
        5.5
      ],
      [
        "leandro-daniel-cabrera-sasia",
        "Leandro Daniel Cabrera Sasía",
        "CB",
        35,
        76,
        76,
        1.8
      ],
      [
        "urko-gonzalez-de-zarate-quiros",
        "Urko González de Zarate Quirós",
        "CDM",
        25,
        76,
        80,
        4.9
      ],
      [
        "alex-calatrava-torrado",
        "Álex Calatrava Torrado",
        "CAM",
        26,
        75,
        75,
        2.5
      ],
      [
        "quilindschy-hartman",
        "Quilindschy Hartman",
        "LB",
        24,
        75,
        83,
        16
      ],
      [
        "pere-milla-pena",
        "Pere Milla Peña",
        "LM",
        33,
        75,
        75,
        1.5
      ],
      [
        "pol-lozano-vizuete",
        "Pol Lozano Vizuete",
        "CDM",
        26,
        75,
        78,
        6.5
      ],
      [
        "omar-el-hilali",
        "Omar El Hilali",
        "RB",
        23,
        75,
        83,
        16
      ],
      [
        "enrique-garcia-martinez",
        "Enrique García Martínez",
        "ST",
        36,
        75,
        76,
        3.2
      ],
      [
        "unai-nunez-gestoso",
        "Unai Núñez Gestoso",
        "CB",
        29,
        75,
        77,
        7
      ],
      [
        "tyrhys-dolan",
        "Tyrhys Dolan",
        "RW",
        24,
        74,
        78,
        3.1
      ],
      [
        "roberto-fernandez-jaen",
        "Roberto Fernández Jaén",
        "ST",
        24,
        74,
        81,
        8.5
      ],
      [
        "francisco-javier-hernandez-coarasa",
        "Francisco Javier Hernández Coarasa",
        "RM",
        22,
        73,
        81,
        3
      ],
      [
        "jofre-carreras-pages",
        "Jofre Carreras Pagès",
        "RW",
        25,
        73,
        78,
        6
      ],
      [
        "marcos-fernandez-sanchez",
        "Marcos Fernández Sánchez",
        "ST",
        23,
        72,
        74,
        1.3
      ],
      [
        "gabriel-silva-moscardo-de-salles",
        "Gabriel Silva Moscardo de Salles",
        "CDM",
        20,
        72,
        82,
        4.8
      ],
      [
        "ruben-sanchez-saez",
        "Rubén Sánchez Sáez",
        "RB",
        25,
        71,
        75,
        2.1
      ],
      [
        "clemens-riedel",
        "Clemens Riedel",
        "CB",
        23,
        70,
        81,
        3.2
      ],
      [
        "rafel-bauza-sureda",
        "Rafel Bauzà Sureda",
        "CDM",
        21,
        68,
        78,
        1.6
      ],
      [
        "roger-hinojo-estrada",
        "Roger Hinojo Estrada",
        "LB",
        21,
        68,
        77,
        1.1
      ],
      [
        "angel-fortuno-vinas",
        "Ángel Fortuño Viñas",
        "GK",
        24,
        65,
        75,
        1.4
      ]
    ]
  },
  {
    "id": "mal",
    "name": "RCD Mallorca",
    "color": "#CB1518",
    "budget": 17,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "sergi-darder-moll",
        "Sergi Darder Moll",
        "CM",
        32,
        78,
        81,
        22
      ],
      [
        "antonio-jose-raillo-arenas",
        "Antonio José Raíllo Arenas",
        "CB",
        34,
        78,
        81,
        13
      ],
      [
        "martin-valjent",
        "Martin Valjent",
        "CB",
        30,
        77,
        78,
        9.5
      ],
      [
        "arnau-tenas-urena",
        "Arnau Tenas Ureña",
        "GK",
        25,
        75,
        80,
        5.5
      ],
      [
        "pablo-torre-carral",
        "Pablo Torre Carral",
        "CAM",
        23,
        75,
        84,
        9.5
      ],
      [
        "manuel-morlanes-arino",
        "Manuel Morlanes Ariño",
        "CDM",
        27,
        75,
        80,
        14
      ],
      [
        "adrian-fuentes-gonzalez",
        "Adrián Fuentes González",
        "ST",
        30,
        74,
        74,
        0.875
      ],
      [
        "antoniu-roca-vives",
        "Antoniu Roca Vives",
        "RM",
        24,
        73,
        80,
        6
      ],
      [
        "antonio-latorre-grueso",
        "Antonio Latorre Grueso",
        "LB",
        28,
        72,
        74,
        3.2
      ],
      [
        "adrian-liso-lahoz",
        "Adrián Liso Lahoz",
        "ST",
        21,
        72,
        85,
        3.7
      ],
      [
        "zito-andre-sebastiao-luvumbo",
        "Zito André Sebastião Luvumbo",
        "ST",
        24,
        71,
        78,
        3.8
      ],
      [
        "mateu-jaume-morey-bauza",
        "Mateu Jaume Morey Bauzà",
        "RB",
        26,
        71,
        78,
        4.2
      ],
      [
        "alex-sala-herrero",
        "Álex Sala Herrero",
        "CDM",
        25,
        71,
        76,
        3.1
      ],
      [
        "adam-buksa",
        "Adam Buksa",
        "ST",
        30,
        71,
        73,
        3.1
      ],
      [
        "david-lopez-guijarro",
        "David López Guijarro",
        "CB",
        23,
        70,
        78,
        2.5
      ],
      [
        "abdon-prats-bastidas",
        "Abdón Prats Bastidas",
        "ST",
        33,
        70,
        73,
        2.5
      ],
      [
        "arnau-puigmal-martinez",
        "Arnau Puigmal Martínez",
        "RM",
        25,
        70,
        78,
        3.7
      ],
      [
        "antonio-sanchez-navarro",
        "Antonio Sánchez Navarro",
        "RM",
        29,
        70,
        73,
        3.1
      ],
      [
        "josep-cerda-amengual",
        "Josep Cerdà Amengual",
        "LW",
        23,
        68,
        69,
        0.8
      ],
      [
        "lucas-carl-edvard-bergstrom",
        "Lucas Carl Edvard Bergström",
        "GK",
        24,
        68,
        73,
        0.925
      ],
      [
        "ivan-cuellar-sacristan",
        "Iván Cuéllar Sacristán",
        "GK",
        42,
        67,
        67,
        0.11
      ],
      [
        "justin-noel-kalumba-mwana-ngongo",
        "Justin-Noël Kalumba Mwana Ngongo",
        "LM",
        21,
        65,
        73,
        1.1
      ],
      [
        "daniel-andres-luna-garcia",
        "Daniel Andrés Luna García",
        "RW",
        23,
        65,
        77,
        1.9
      ],
      [
        "aboubaka-soumahoro",
        "Aboubaka Soumahoro",
        "CB",
        21,
        64,
        78,
        1.3
      ],
      [
        "miquel-jan-salas-franch",
        "Miquel Jan Salas Franch",
        "CM",
        21,
        62,
        77,
        0.625
      ]
    ]
  },
  {
    "id": "ray",
    "name": "Rayo Vallecano",
    "color": "#E32119",
    "budget": 15,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "jorge-de-frutos-sebastian",
        "Jorge de Frutos Sebastián",
        "RW",
        29,
        81,
        81,
        14
      ],
      [
        "alvaro-garcia-rivera",
        "Álvaro García Rivera",
        "LW",
        33,
        81,
        81,
        17
      ],
      [
        "andrei-florin-ratiu",
        "Andrei Florin Rațiu",
        "RB",
        28,
        80,
        80,
        19
      ],
      [
        "isaac-palazon-camacho",
        "Isaac Palazón Camacho",
        "CAM",
        31,
        80,
        81,
        25
      ],
      [
        "augusto-martin-batalla-barga",
        "Augusto Martín Batalla Barga",
        "GK",
        30,
        79,
        80,
        14
      ],
      [
        "florian-gregoire-claude-lejeune",
        "Florian Grégoire Claude Lejeune",
        "CB",
        35,
        79,
        79,
        4.6
      ],
      [
        "oscar-valentin-martin-luengo",
        "Óscar Valentín Martín Luengo",
        "CDM",
        32,
        77,
        78,
        12
      ],
      [
        "pathe-ismael-ciss",
        "Pathé Ismaël Ciss",
        "CDM",
        32,
        77,
        77,
        7.5
      ],
      [
        "unai-lopez-cabrera",
        "Unai López Cabrera",
        "CM",
        30,
        76,
        76,
        7.5
      ],
      [
        "pedro-diaz-fanjul",
        "Pedro Díaz Fanjul",
        "CM",
        28,
        75,
        76,
        6.5
      ],
      [
        "marash-kumbulla",
        "Marash Kumbulla",
        "CB",
        26,
        75,
        80,
        13
      ],
      [
        "luiz-felipe-ramos-marchi",
        "Luiz Felipe Ramos Marchi",
        "CB",
        29,
        75,
        77,
        5.5
      ],
      [
        "sergio-camello-perez",
        "Sergio Camello Pérez",
        "ST",
        25,
        74,
        77,
        4.4
      ],
      [
        "daniel-cardenas-lindez",
        "Daniel Cárdenas Lindez",
        "GK",
        29,
        74,
        78,
        5
      ],
      [
        "ivan-balliu-campeny",
        "Iván Balliu Campeny",
        "RB",
        34,
        74,
        76,
        3.9
      ],
      [
        "georgiy-tsitaishvili",
        "Georgiy Tsitaishvili",
        "LM",
        25,
        74,
        78,
        3.7
      ],
      [
        "alexandre-zurawski",
        "Alexandre Zurawski",
        "ST",
        28,
        74,
        74,
        3.6
      ],
      [
        "francisco-perez-martinez",
        "Francisco Pérez Martínez",
        "RW",
        24,
        74,
        77,
        3.6
      ],
      [
        "randy-nteka",
        "Randy Nteka",
        "ST",
        28,
        70,
        71,
        1.9
      ],
      [
        "jozhua-tomayo-vertrouwd",
        "Jozhua Tomayo Vertrouwd",
        "CB",
        22,
        68,
        78,
        2.1
      ],
      [
        "diego-mendez-molero",
        "Diego Méndez Molero",
        "CDM",
        23,
        64,
        72,
        1.2
      ],
      [
        "pelayo-fernandez-balboa",
        "Pelayo Fernández Balboa",
        "CB",
        23,
        64,
        72,
        1.3
      ],
      [
        "etienne-etoo-pineda",
        "Etienne Eto'o Pineda",
        "ST",
        24,
        63,
        71,
        0.9
      ],
      [
        "samuel-becerra-gomez",
        "Samuel Becerra Gómez",
        "CM",
        20,
        61,
        72,
        0.525
      ],
      [
        "marco-de-las-sias-lopez",
        "Marco de las Sías López",
        "CB",
        20,
        59,
        69,
        0.45
      ]
    ]
  },
  {
    "id": "rea",
    "name": "Real Betis Balompié",
    "color": "#00954C",
    "budget": 23,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "francisco-roman-alarcon-suarez",
        "Francisco Román Alarcón Suárez",
        "CAM",
        34,
        83,
        84,
        27
      ],
      [
        "pablo-fornals-malla",
        "Pablo Fornals Malla",
        "CM",
        30,
        81,
        81,
        15
      ],
      [
        "abdessamad-ezzalzouli",
        "Abdessamad Ezzalzouli",
        "LW",
        24,
        81,
        83,
        17
      ],
      [
        "antony-matheus-dos-santos",
        "Antony Matheus dos Santos",
        "RW",
        26,
        81,
        84,
        34
      ],
      [
        "giovani-lo-celso",
        "Giovani Lo Celso",
        "CAM",
        30,
        80,
        82,
        30
      ],
      [
        "diego-javier-llorente-rios",
        "Diego Javier Llorente Ríos",
        "CB",
        33,
        79,
        80,
        15
      ],
      [
        "juan-camilo-hernandez-suarez",
        "Juan Camilo Hernández Suárez",
        "ST",
        27,
        79,
        81,
        19
      ],
      [
        "natan-bernardo-de-souza",
        "Natan Bernardo de Souza",
        "CB",
        25,
        79,
        84,
        20
      ],
      [
        "marc-bartra-aregall",
        "Marc Bartra Aregall",
        "CB",
        35,
        79,
        79,
        5.5
      ],
      [
        "marc-roca-junque",
        "Marc Roca Junqué",
        "CDM",
        29,
        78,
        79,
        14
      ],
      [
        "troy-daniel-parrott",
        "Troy Daniel Parrott",
        "ST",
        24,
        78,
        80,
        6.5
      ],
      [
        "alvaro-valles-rosa",
        "Álvaro Vallés Rosa",
        "GK",
        29,
        77,
        82,
        17
      ],
      [
        "francisco-jose-garcia-torres",
        "Francisco José García Torres",
        "LB",
        27,
        77,
        82,
        22
      ],
      [
        "aitor-ruibal-garcia",
        "Aitor Ruibal García",
        "RM",
        30,
        77,
        77,
        9.5
      ],
      [
        "diego-jose-conde-alcolado",
        "Diego José Conde Alcolado",
        "GK",
        27,
        76,
        82,
        12
      ],
      [
        "diego-valentin-gomez",
        "Diego Valentín Gómez",
        "CB",
        23,
        76,
        84,
        16
      ],
      [
        "hector-bellerin-moruno",
        "Héctor Bellerín Moruno",
        "RB",
        31,
        76,
        76,
        3.6
      ],
      [
        "rodrigo-riquelme-reche",
        "Rodrigo Riquelme Reche",
        "LM",
        26,
        76,
        80,
        14
      ],
      [
        "nelson-alexander-deossa-suarez",
        "Nelson Alexander Deossa Suárez",
        "CDM",
        26,
        75,
        80,
        8
      ],
      [
        "hector-junior-firpo-adames",
        "Héctor Junior Firpo Adamés",
        "LB",
        30,
        74,
        75,
        5
      ],
      [
        "iker-losada-aragunde",
        "Iker Losada Aragunde",
        "CAM",
        25,
        72,
        78,
        3.7
      ],
      [
        "angel-ortiz-monterrey",
        "Ángel Ortiz Monterrey",
        "RB",
        22,
        70,
        81,
        2.8
      ],
      [
        "pablo-garcia-fernandez",
        "Pablo García Fernández",
        "RW",
        20,
        70,
        87,
        3.1
      ],
      [
        "gonzalo-ezequiel-petit-abad",
        "Gonzalo Ezequiel Petit Abad",
        "ST",
        19,
        69,
        81,
        3.3
      ],
      [
        "manuel-gonzalez-pallares",
        "Manuel González Pallarés",
        "GK",
        19,
        64,
        77,
        0.45
      ]
    ]
  },
  {
    "id": "rma",
    "name": "Real Madrid",
    "color": "#FEBE10",
    "budget": 108,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "kylian-mbappe-lottin",
        "Kylian Mbappé Lottin",
        "ST",
        27,
        91,
        94,
        174
      ],
      [
        "jude-victor-william-bellingham",
        "Jude Victor William Bellingham",
        "CAM",
        23,
        90,
        94,
        175
      ],
      [
        "thibaut-nicolas-marc-courtois",
        "Thibaut Nicolas Marc Courtois",
        "GK",
        34,
        90,
        90,
        34
      ],
      [
        "vinicius-jose-paixao-de-oliveira-junior",
        "Vinicius José Paixão de Oliveira Junior",
        "LW",
        26,
        89,
        92,
        141
      ],
      [
        "federico-santiago-valverde-dipetta",
        "Federico Santiago Valverde Dipetta",
        "CM",
        28,
        87,
        90,
        121
      ],
      [
        "marc-cucurella-saseta",
        "Marc Cucurella Saseta",
        "LB",
        28,
        86,
        86,
        46
      ],
      [
        "bernardo-mota-veiga-de-carvalho-e-silva",
        "Bernardo Mota Veiga de Carvalho e Silva",
        "CM",
        32,
        84,
        84,
        41
      ],
      [
        "eder-gabriel-militao",
        "Éder Gabriel Militão",
        "CB",
        28,
        84,
        87,
        48
      ],
      [
        "trent-john-alexander-arnold",
        "Trent John Alexander-Arnold",
        "RB",
        27,
        84,
        87,
        73
      ],
      [
        "yan-diomande",
        "Yan Diomande",
        "RW",
        19,
        84,
        84,
        2
      ],
      [
        "ibrahima-konate",
        "Ibrahima Konaté",
        "CB",
        27,
        84,
        87,
        70
      ],
      [
        "aurelien-djani-tchouameni",
        "Aurélien Djani Tchouameni",
        "CDM",
        26,
        84,
        87,
        51
      ],
      [
        "rodrygo-silva-de-goes",
        "Rodrygo Silva de Goes",
        "LW",
        25,
        84,
        90,
        82
      ],
      [
        "denzel-justus-morris-dumfries",
        "Denzel Justus Morris Dumfries",
        "RB",
        30,
        83,
        84,
        37
      ],
      [
        "antonio-rudiger",
        "Antonio Rüdiger",
        "CB",
        33,
        83,
        86,
        44
      ],
      [
        "arda-guler",
        "Arda Güler",
        "RM",
        21,
        83,
        89,
        57
      ],
      [
        "brahim-abdelkader-diaz",
        "Brahim Abdelkader Díaz",
        "RM",
        27,
        81,
        83,
        37
      ],
      [
        "alvaro-fernandez-carreras",
        "Álvaro Fernández Carreras",
        "LB",
        23,
        81,
        88,
        45
      ],
      [
        "dean-donny-huijsen",
        "Dean Donny Huijsen",
        "CB",
        21,
        81,
        89,
        56
      ],
      [
        "eduardo-celmi-camavinga",
        "Eduardo Celmi Camavinga",
        "CM",
        23,
        81,
        90,
        74
      ],
      [
        "ferland-sinna-mendy",
        "Ferland Sinna Mendy",
        "LB",
        31,
        80,
        81,
        22
      ],
      [
        "andriy-lunin",
        "Andriy Lunin",
        "GK",
        27,
        80,
        86,
        30
      ],
      [
        "endrick-felipe-moreira-de-sousa",
        "Endrick Felipe Moreira de Sousa",
        "ST",
        20,
        79,
        91,
        25
      ],
      [
        "raul-asencio-del-rosario",
        "Raúl Asencio del Rosario",
        "CB",
        23,
        78,
        86,
        22
      ],
      [
        "carlos-espi-escrihuela",
        "Carlos Espí Escrihuela",
        "ST",
        21,
        77,
        83,
        2.9
      ],
      [
        "thiago-pitarch-pinar",
        "Thiago Pitarch Pinar",
        "CM",
        19,
        70,
        81,
        0.775
      ],
      [
        "jesus-fortea-tejedo",
        "Jesús Fortea Tejedo",
        "RB",
        19,
        63,
        76,
        0.6
      ],
      [
        "sergio-mestre-sanchez",
        "Sergio Mestre Sánchez",
        "GK",
        21,
        60,
        77,
        0.5750000000000001
      ]
    ]
  },
  {
    "id": "rov",
    "name": "Real Oviedo",
    "color": "#1F5FAF",
    "budget": 8,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "aaron-escandell-banacloche",
        "Aarón Escandell Banacloche",
        "GK",
        30,
        78,
        78,
        4.7
      ],
      [
        "ilyas-chaira-oihi",
        "Ilyas Chaira Oihi",
        "LW",
        25,
        74,
        77,
        3.5
      ],
      [
        "david-costas-cordal",
        "David Costas Cordal",
        "CB",
        31,
        74,
        74,
        1.9
      ],
      [
        "carlos-dominguez-caceres",
        "Carlos Domínguez Cáceres",
        "CB",
        25,
        73,
        79,
        6
      ],
      [
        "juan-cruz-alvaro-armada",
        "Juan Cruz Álvaro Armada",
        "LB",
        34,
        73,
        74,
        2.9
      ],
      [
        "alberto-reina-campos",
        "Alberto Reina Campos",
        "CAM",
        28,
        73,
        73,
        3.2
      ],
      [
        "daniel-pedro-calvo-sanroman",
        "Daniel Pedro Calvo Sanromán",
        "CB",
        32,
        72,
        73,
        2.1
      ],
      [
        "carlos-fernandez-luna",
        "Carlos Fernández Luna",
        "ST",
        30,
        71,
        71,
        1.4
      ],
      [
        "ignacio-vidal-miralles",
        "Ignacio Vidal Miralles",
        "RB",
        31,
        71,
        73,
        2.6
      ],
      [
        "jacobo-gonzalez-rodriganez",
        "Jacobo González Rodrigáñez",
        "LW",
        29,
        70,
        70,
        1.6
      ],
      [
        "estanislau-pedrola-fortuny",
        "Estanislau Pedrola Fortuny",
        "LM",
        23,
        70,
        81,
        3.4
      ],
      [
        "aritz-aldasoro-sarriegi",
        "Aritz Aldasoro Sarriegi",
        "CDM",
        27,
        70,
        75,
        2.1
      ],
      [
        "aisar-ahmed-ahmed",
        "Aisar Ahmed Ahmed",
        "RM",
        25,
        69,
        71,
        1.1
      ],
      [
        "luka-ilic",
        "Luka Ilić",
        "CAM",
        27,
        69,
        73,
        2.1
      ],
      [
        "pablo-saenz-ezquerra",
        "Pablo Sáenz Ezquerra",
        "RW",
        25,
        68,
        72,
        1.4
      ],
      [
        "daniel-villahermosa-martinez",
        "Daniel Villahermosa Martínez",
        "CM",
        25,
        68,
        71,
        1.1
      ],
      [
        "brandon-domingues",
        "Brandon Dominguès",
        "LM",
        26,
        68,
        73,
        2.1
      ],
      [
        "youness-lachhab-didi",
        "Youness Lachhab Didi",
        "CDM",
        27,
        66,
        68,
        0.85
      ],
      [
        "alexandru-mihai-isfan",
        "Alexandru Mihai Ișfan",
        "ST",
        26,
        65,
        65,
        0.7000000000000001
      ],
      [
        "marco-esteban-fernandez",
        "Marco Esteban Fernández",
        "CB",
        20,
        64,
        76,
        1
      ],
      [
        "miguel-de-jesus-narvaez-lopez",
        "Miguel de Jesús Narváez López",
        "GK",
        24,
        63,
        70,
        0.8250000000000001
      ],
      [
        "david-carmo",
        "David Carmo",
        "CB",
        25,
        76,
        77,
        8
      ]
    ]
  },
  {
    "id": "rso",
    "name": "Real Sociedad",
    "color": "#0067B1",
    "budget": 28,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "mikel-oyarzabal-ugarte",
        "Mikel Oyarzabal Ugarte",
        "ST",
        29,
        84,
        84,
        31
      ],
      [
        "alejandro-remiro-gargallo",
        "Alejandro Remiro Gargallo",
        "GK",
        31,
        81,
        84,
        28
      ],
      [
        "takefusa-kubo",
        "Takefusa Kubo",
        "RM",
        25,
        80,
        86,
        44
      ],
      [
        "goncalo-manuel-ganchinho-guedes",
        "Gonçalo Manuel Ganchinho Guedes",
        "LW",
        29,
        80,
        80,
        6
      ],
      [
        "ander-barrenetxea-muguruza",
        "Ander Barrenetxea Muguruza",
        "LW",
        24,
        79,
        83,
        17
      ],
      [
        "carlos-soler-barragan",
        "Carlos Soler Barragán",
        "CM",
        29,
        79,
        79,
        11
      ],
      [
        "sergio-gomez-martin",
        "Sergio Gómez Martín",
        "LB",
        26,
        78,
        82,
        24
      ],
      [
        "jon-gorrotxategi-etxaniz",
        "Jon Gorrotxategi Etxaniz",
        "CDM",
        24,
        78,
        81,
        6.5
      ],
      [
        "jon-martin-vicente",
        "Jon Martín Vicente",
        "CB",
        20,
        78,
        84,
        2.9
      ],
      [
        "yangel-clemente-herrera-ravelo",
        "Yangel Clemente Herrera Ravelo",
        "CM",
        28,
        78,
        82,
        30
      ],
      [
        "igor-zubeldia-elorza",
        "Igor Zubeldía Elorza",
        "CB",
        29,
        77,
        80,
        14
      ],
      [
        "jon-mikel-aramburu-mejias",
        "Jon Mikel Aramburu Mejías",
        "RB",
        24,
        77,
        85,
        23
      ],
      [
        "benat-turrientes-imaz",
        "Beñat Turrientes Imaz",
        "CDM",
        24,
        76,
        82,
        6.5
      ],
      [
        "luka-sucic",
        "Luka Sučić",
        "CM",
        24,
        76,
        86,
        32
      ],
      [
        "unai-marrero-larranaga",
        "Unai Marrero Larrañaga",
        "GK",
        24,
        74,
        77,
        2.7
      ],
      [
        "jon-pacheco-dozagarat",
        "Jon Pacheco Dozagarat",
        "CB",
        25,
        74,
        82,
        8.5
      ],
      [
        "orri-steinn-oskarsson",
        "Orri Steinn Óskarsson",
        "ST",
        22,
        74,
        83,
        9.5
      ],
      [
        "aihen-munoz-capellan",
        "Aihen Muñoz Capellán",
        "LB",
        29,
        73,
        75,
        5.5
      ],
      [
        "alvaro-odriozola-arzallus",
        "Álvaro Odriozola Arzallus",
        "RB",
        30,
        73,
        74,
        3.7
      ],
      [
        "arsen-zakharyan",
        "Arsen Zakharyan",
        "RM",
        23,
        73,
        83,
        9.5
      ],
      [
        "pablo-marin-tejada",
        "Pablo Marín Tejada",
        "CM",
        23,
        73,
        84,
        7
      ],
      [
        "mikel-goti-lopez",
        "Mikel Goti López",
        "CAM",
        24,
        69,
        76,
        2.3
      ],
      [
        "job-nguono-ochieng",
        "Job Nguono Ochieng",
        "LM",
        23,
        68,
        70,
        0.975
      ],
      [
        "jon-karrikaburu-jaimerena",
        "Jon Karrikaburu Jaimerena",
        "ST",
        23,
        67,
        76,
        2.3
      ]
    ]
  },
  {
    "id": "sev",
    "name": "Sevilla FC",
    "color": "#D3021D",
    "budget": 12,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "odysseas-vlachodimos",
        "Odysseas Vlachodimos",
        "GK",
        32,
        79,
        79,
        1.2
      ],
      [
        "ruben-estephan-vargas-martinez",
        "Rubén Estephan Vargas Martínez",
        "LW",
        28,
        78,
        78,
        6
      ],
      [
        "jose-angel-carmona-navarro",
        "José Ángel Carmona Navarro",
        "RB",
        24,
        77,
        84,
        16
      ],
      [
        "enrique-jesus-salas-valiente",
        "Enrique Jesús Salas Valiente",
        "CB",
        24,
        76,
        83,
        12
      ],
      [
        "juan-antonio-iglesias-sanchez",
        "Juan Antonio Iglesias Sánchez",
        "RB",
        28,
        76,
        76,
        4.5
      ],
      [
        "lucien-jefferson-agoume",
        "Lucien Jefferson Agoume",
        "CDM",
        24,
        76,
        83,
        12
      ],
      [
        "chidera-ejuke",
        "Chidera Ejuke",
        "LW",
        28,
        76,
        78,
        15
      ],
      [
        "alfonso-gonzalez-martinez",
        "Alfonso González Martínez",
        "LW",
        27,
        75,
        77,
        9
      ],
      [
        "gabriel-alonso-suazo-urbina",
        "Gabriel Alonso Suazo Urbina",
        "LB",
        29,
        74,
        74,
        4.1
      ],
      [
        "isaac-romero-bernal",
        "Isaac Romero Bernal",
        "ST",
        26,
        74,
        79,
        6.5
      ],
      [
        "arouna-sangante",
        "Arouna Sangante",
        "CB",
        24,
        74,
        80,
        5.5
      ],
      [
        "gerard-fernandez-castellano",
        "Gerard Fernández Castellano",
        "CAM",
        23,
        74,
        82,
        7
      ],
      [
        "adria-giner-pedrosa",
        "Adrià Giner Pedrosa",
        "LB",
        28,
        74,
        76,
        6
      ],
      [
        "giorgi-kochorashvili",
        "Giorgi Kochorashvili",
        "CM",
        27,
        74,
        77,
        5.5
      ],
      [
        "jon-guridi-aldalur",
        "Jon Guridi Aldalur",
        "CM",
        31,
        73,
        74,
        4.1
      ],
      [
        "fabio-rafael-rodrigues-cardoso",
        "Fábio Rafael Rodrigues Cardoso",
        "CB",
        32,
        73,
        75,
        3.8
      ],
      [
        "joaquin-martinez-gauna",
        "Joaquín Martínez Gauna",
        "LB",
        23,
        73,
        73,
        0.7000000000000001
      ],
      [
        "andres-lopez-gallo",
        "Andrés López Gallo",
        "CB",
        23,
        73,
        73,
        0.5750000000000001
      ],
      [
        "marcos-do-nascimento-teixeira",
        "Marcos do Nascimento Teixeira",
        "CB",
        30,
        73,
        76,
        5
      ],
      [
        "robert-philip-ure",
        "Robert Philip Ure",
        "ST",
        22,
        71,
        74,
        2.1
      ],
      [
        "manuel-bueno-sebastian",
        "Manuel Bueno Sebastián",
        "CM",
        22,
        67,
        79,
        1.7
      ],
      [
        "francisco-javier-gonzalez-perez",
        "Francisco Javier González Pérez",
        "GK",
        21,
        65,
        80,
        1.1
      ],
      [
        "rafael-romero-morilla",
        "Rafael Romero Morilla",
        "GK",
        23,
        62,
        73,
        0.775
      ]
    ]
  },
  {
    "id": "val",
    "name": "Valencia CF",
    "color": "#EE3524",
    "budget": 18,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "guido-rodriguez",
        "Guido Rodríguez",
        "CDM",
        32,
        78,
        78,
        7.5
      ],
      [
        "stole-dimitrievski",
        "Stole Dimitrievski",
        "GK",
        32,
        77,
        79,
        9.5
      ],
      [
        "jose-luis-gaya-pena",
        "José Luis Gayà Peña",
        "LB",
        31,
        77,
        81,
        22
      ],
      [
        "javier-guerra-moreno",
        "Javier Guerra Moreno",
        "CM",
        23,
        77,
        86,
        24
      ],
      [
        "luis-jesus-rioja-gonzalez",
        "Luis Jesús Rioja González",
        "RM",
        32,
        77,
        78,
        12
      ],
      [
        "hugo-duro-perales",
        "Hugo Duro Perales",
        "ST",
        26,
        77,
        83,
        21
      ],
      [
        "pablo-carmine-maffeo-becerra",
        "Pablo Carmine Maffeo Becerra",
        "RB",
        29,
        77,
        78,
        14
      ],
      [
        "diego-lopez-noguerol",
        "Diego López Noguerol",
        "LW",
        24,
        77,
        86,
        31
      ],
      [
        "justin-de-haas",
        "Justin de Haas",
        "CB",
        26,
        76,
        80,
        5.5
      ],
      [
        "umar-sadiq-mesbah",
        "Umar Sadiq Mesbah",
        "ST",
        29,
        76,
        77,
        11
      ],
      [
        "mouctar-diakhaby",
        "Mouctar Diakhaby",
        "CB",
        29,
        76,
        78,
        7.5
      ],
      [
        "jose-luis-garcia-vaya",
        "José Luis García Vayá",
        "CM",
        28,
        76,
        78,
        13
      ],
      [
        "filip-ugrinic",
        "Filip Ugrinić",
        "CM",
        27,
        75,
        78,
        7.5
      ],
      [
        "arnaut-danjuma-adam-groeneveld",
        "Arnaut Danjuma Adam Groeneveld",
        "LW",
        29,
        75,
        75,
        5.5
      ],
      [
        "cesar-tarrega-requeni",
        "César Tárrega Requeni",
        "CB",
        24,
        75,
        82,
        11
      ],
      [
        "daniel-raba-antolin",
        "Daniel Raba Antolín",
        "RW",
        30,
        74,
        76,
        7.5
      ],
      [
        "domingos-andre-ribeiro-almeida",
        "Domingos André Ribeiro Almeida",
        "CAM",
        26,
        74,
        80,
        8.5
      ],
      [
        "jose-manuel-arias-copete",
        "José Manuel Arias Copete",
        "CB",
        26,
        74,
        82,
        10
      ],
      [
        "dimitri-foulquier",
        "Dimitri Foulquier",
        "RB",
        33,
        72,
        74,
        2.9
      ],
      [
        "jesus-vazquez-alcalde",
        "Jesús Vázquez Alcalde",
        "LB",
        23,
        71,
        77,
        3.1
      ],
      [
        "sergi-canos-tenes",
        "Sergi Canós Tenés",
        "LM",
        29,
        68,
        71,
        1.9
      ],
      [
        "iker-cordoba-sanchez",
        "Iker Córdoba Sánchez",
        "CB",
        20,
        65,
        78,
        1.6
      ],
      [
        "cristian-rivero-sabater",
        "Cristian Rivero Sabater",
        "GK",
        28,
        65,
        69,
        0.75
      ],
      [
        "ruben-iranzo-lendinez",
        "Rubén Iranzo Lendínez",
        "CB",
        23,
        64,
        72,
        1
      ],
      [
        "alberto-mari-sanchez",
        "Alberto Marí Sánchez",
        "ST",
        25,
        64,
        70,
        1.2
      ],
      [
        "david-otorbi-ejededawe",
        "David Otorbi Ejededawe",
        "RW",
        18,
        64,
        78,
        1.1
      ],
      [
        "aimar-blazquez-labraca",
        "Aimar Blázquez Labraca",
        "ST",
        20,
        62,
        77,
        0.9500000000000001
      ]
    ]
  },
  {
    "id": "vil",
    "name": "Villarreal CF",
    "color": "#FFE667",
    "budget": 25,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "alberto-moleiro-gonzalez",
        "Alberto Moleiro González",
        "LM",
        22,
        82,
        86,
        36
      ],
      [
        "peter-gulacsi",
        "Péter Gulácsi",
        "GK",
        36,
        82,
        85,
        6
      ],
      [
        "nicolas-pepe",
        "Nicolas Pépé",
        "RW",
        31,
        81,
        81,
        21
      ],
      [
        "gerard-moreno-balaguero",
        "Gerard Moreno Balagueró",
        "ST",
        34,
        81,
        81,
        17
      ],
      [
        "ayoze-perez-gutierrez",
        "Ayoze Pérez Gutiérrez",
        "ST",
        33,
        80,
        83,
        31
      ],
      [
        "carlos-romero-serrano",
        "Carlos Romero Serrano",
        "LB",
        24,
        80,
        81,
        8.5
      ],
      [
        "pape-alassane-gueye",
        "Pape Alassane Gueye",
        "CM",
        27,
        80,
        81,
        18
      ],
      [
        "juan-marcos-foyth",
        "Juan Marcos Foyth",
        "CB",
        28,
        79,
        80,
        18
      ],
      [
        "georges-mikautadze",
        "Georges Mikautadze",
        "ST",
        25,
        79,
        83,
        17
      ],
      [
        "sergi-cardona-bermudez",
        "Sergi Cardona Bermúdez",
        "LB",
        27,
        79,
        82,
        22
      ],
      [
        "santiago-comesana-veiga",
        "Santiago Comesaña Veiga",
        "CM",
        29,
        79,
        79,
        14
      ],
      [
        "renato-de-palma-veiga",
        "Renato de Palma Veiga",
        "CB",
        23,
        78,
        84,
        16
      ],
      [
        "luiz-lucio-reis-junior",
        "Luiz Lúcio Reis Júnior",
        "GK",
        25,
        78,
        85,
        20
      ],
      [
        "alvaro-santiago-mourino-gonzalez",
        "Álvaro Santiago Mouriño González",
        "RB",
        24,
        78,
        85,
        8.5
      ],
      [
        "tajon-trevor-buchanan",
        "Tajon Trevor Buchanan",
        "RM",
        27,
        76,
        76,
        5
      ],
      [
        "logan-evans-costa",
        "Logan Evans Costa",
        "CB",
        25,
        76,
        84,
        20
      ],
      [
        "ilias-akhomach-chakkour",
        "Ilias Akhomach Chakkour",
        "RW",
        22,
        75,
        83,
        9.5
      ],
      [
        "pau-navarro-badenes",
        "Pau Navarro Badenes",
        "CB",
        21,
        74,
        85,
        3.6
      ],
      [
        "alexander-michael-freeman",
        "Alexander Michael Freeman",
        "RB",
        22,
        73,
        79,
        1.6
      ],
      [
        "willy-kambwala-ndengushi",
        "Willy Kambwala Ndengushi",
        "CB",
        22,
        72,
        83,
        4.8
      ],
      [
        "tanitoluwa-oluwatimikhin-oluwaseyi",
        "Tanitoluwa Oluwatimikhin Oluwaseyi",
        "ST",
        26,
        71,
        74,
        2.2
      ],
      [
        "ruben-gomez-peris",
        "Rubén Gómez Peris",
        "GK",
        24,
        63,
        71,
        0.925
      ]
    ]
  }
];

const RAW_SERIEACLUBS = [
  {
    "id": "acm",
    "name": "AC Milan",
    "color": "#FB090B",
    "budget": 39,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "mike-peterson-maignan",
        "Mike Peterson Maignan",
        "GK",
        31,
        87,
        88,
        61
      ],
      [
        "luka-modric",
        "Luka Modrić",
        "CM",
        41,
        85,
        85,
        12
      ],
      [
        "adrien-rabiot-provost",
        "Adrien Rabiot-Provost",
        "CM",
        31,
        85,
        85,
        35
      ],
      [
        "rafael-alexandre-da-conceicao-leao",
        "Rafael Alexandre da Conceição Leão",
        "LW",
        27,
        83,
        85,
        50
      ],
      [
        "christian-mate-pulisic",
        "Christian Mate Pulišić",
        "CAM",
        28,
        83,
        84,
        46
      ],
      [
        "mario-gila-fuentes",
        "Mario Gila Fuentes",
        "CB",
        26,
        81,
        84,
        24
      ],
      [
        "youssouf-fofana",
        "Youssouf Fofana",
        "CM",
        27,
        80,
        84,
        31
      ],
      [
        "oluwafikayomi-oluwadamilola-tomori",
        "Oluwafikayomi Oluwadamilola Tomori",
        "CB",
        28,
        80,
        84,
        30
      ],
      [
        "goncalo-matias-ramos",
        "Gonçalo Matias Ramos",
        "ST",
        25,
        80,
        84,
        31
      ],
      [
        "matteo-gabbia",
        "Matteo Gabbia",
        "CB",
        26,
        80,
        83,
        19
      ],
      [
        "alexis-jesse-saelemaekers",
        "Alexis Jesse Saelemaekers",
        "RB",
        27,
        80,
        80,
        21
      ],
      [
        "christopher-alan-nkunku",
        "Christopher Alan Nkunku",
        "ST",
        28,
        80,
        81,
        28
      ],
      [
        "diego-manuel-jadon-da-silva-moreira",
        "Diego Manuel Jadon da Silva Moreira",
        "RM",
        22,
        79,
        83,
        17
      ],
      [
        "ruben-ira-loftus-cheek",
        "Ruben Ira Loftus-Cheek",
        "CAM",
        30,
        79,
        80,
        21
      ],
      [
        "pervis-josue-estupinan-tenorio",
        "Pervis Josué Estupiñán Tenorio",
        "LB",
        28,
        78,
        80,
        19
      ],
      [
        "strahinja-pavlovic",
        "Strahinja Pavlović",
        "CB",
        25,
        78,
        83,
        14
      ],
      [
        "santiago-tomas-gimenez",
        "Santiago Tomás Giménez",
        "ST",
        25,
        78,
        84,
        27
      ],
      [
        "samuele-ricci",
        "Samuele Ricci",
        "CM",
        25,
        78,
        85,
        27
      ],
      [
        "samuel-chimerenka-chukwueze",
        "Samuel Chimerenka Chukwueze",
        "RM",
        27,
        78,
        80,
        23
      ],
      [
        "pietro-terracciano",
        "Pietro Terracciano",
        "GK",
        36,
        76,
        78,
        1.6
      ],
      [
        "ardon-jashari",
        "Ardon Jashari",
        "CDM",
        24,
        76,
        86,
        23
      ],
      [
        "koni-de-winter",
        "Koni De Winter",
        "CB",
        24,
        75,
        84,
        8.5
      ],
      [
        "davide-bartesaghi",
        "Davide Bartesaghi",
        "LB",
        20,
        74,
        78,
        1
      ],
      [
        "yunus-dimoara-musah",
        "Yunus Dimoara Musah",
        "CM",
        23,
        73,
        82,
        9.5
      ],
      [
        "filippo-terracciano",
        "Filippo Terracciano",
        "CB",
        23,
        71,
        80,
        4
      ],
      [
        "warren-pierre-bondo",
        "Warren Pierre Bondo",
        "CDM",
        23,
        70,
        79,
        4.7
      ],
      [
        "sankhoun-bocoum-diawara",
        "Sankhoun Bocoum Diawara",
        "CB",
        20,
        69,
        74,
        0.5
      ],
      [
        "kevin-zeroli",
        "Kevin Zeroli",
        "CM",
        21,
        66,
        78,
        1.7
      ],
      [
        "francesco-camarda",
        "Francesco Camarda",
        "ST",
        18,
        66,
        87,
        2.3
      ],
      [
        "alphadjo-cisse",
        "Alphadjo Cissè",
        "CAM",
        19,
        66,
        78,
        1.4
      ]
    ]
  },
  {
    "id": "ata",
    "name": "Atalanta",
    "color": "#1E71B8",
    "budget": 32,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "marco-carnesecchi",
        "Marco Carnesecchi",
        "GK",
        26,
        86,
        88,
        46
      ],
      [
        "ederson-jose-dos-santos-lourenco-da-silva",
        "Éderson José dos Santos Lourenço da Silva",
        "CM",
        27,
        82,
        85,
        40
      ],
      [
        "charles-de-ketelaere",
        "Charles De Ketelaere",
        "CAM",
        25,
        81,
        86,
        44
      ],
      [
        "marten-elco-de-roon",
        "Marten Elco de Roon",
        "CM",
        35,
        80,
        81,
        12
      ],
      [
        "mario-pasalic",
        "Mario Pašalić",
        "CM",
        31,
        79,
        80,
        20
      ],
      [
        "davide-zappacosta",
        "Davide Zappacosta",
        "RM",
        34,
        79,
        79,
        11
      ],
      [
        "isak-malcolm-kwaku-hien",
        "Isak Malcolm Kwaku Hien",
        "CB",
        27,
        79,
        81,
        17
      ],
      [
        "giorgio-scalvini",
        "Giorgio Scalvini",
        "CB",
        22,
        79,
        86,
        22
      ],
      [
        "odilon-kossounou-kouakou",
        "Odilon Kossounou Kouakou",
        "CB",
        25,
        79,
        85,
        29
      ],
      [
        "sead-kolasinac",
        "Sead Kolašinac",
        "CB",
        33,
        78,
        79,
        12
      ],
      [
        "giacomo-raspadori",
        "Giacomo Raspadori",
        "ST",
        26,
        78,
        81,
        19
      ],
      [
        "gianluca-scamacca",
        "Gianluca Scamacca",
        "ST",
        27,
        78,
        80,
        21
      ],
      [
        "lazar-samardzic",
        "Lazar Samardžić",
        "CAM",
        24,
        78,
        82,
        11
      ],
      [
        "nicola-zalewski",
        "Nicola Zalewski",
        "LM",
        24,
        78,
        79,
        10
      ],
      [
        "raoul-bellanova",
        "Raoul Bellanova",
        "RB",
        26,
        78,
        79,
        17
      ],
      [
        "nikola-krstovic",
        "Nikola Krstović",
        "ST",
        26,
        76,
        80,
        8.5
      ],
      [
        "eljif-elmas",
        "Eljif Elmas",
        "CAM",
        26,
        76,
        77,
        12
      ],
      [
        "marco-sportiello",
        "Marco Sportiello",
        "GK",
        34,
        76,
        76,
        2.4
      ],
      [
        "thomas-thiesson-kristensen",
        "Thomas Thiesson Kristensen",
        "CB",
        24,
        74,
        81,
        4.9
      ],
      [
        "honest-ahanor",
        "Honest Ahanor",
        "CB",
        18,
        74,
        81,
        1.9
      ],
      [
        "kamaldeen-sulemana",
        "Kamaldeen Sulemana",
        "LM",
        24,
        74,
        76,
        2.8
      ],
      [
        "gianluca-gaetano",
        "Gianluca Gaetano",
        "CAM",
        26,
        74,
        77,
        5.5
      ],
      [
        "mitchel-bakker",
        "Mitchel Bakker",
        "LB",
        26,
        73,
        80,
        7.5
      ],
      [
        "ibrahim-sulemana-kakari",
        "Ibrahim Sulemana Kakari",
        "CDM",
        23,
        73,
        80,
        4
      ],
      [
        "lorenzo-bernasconi",
        "Lorenzo Bernasconi",
        "LM",
        22,
        71,
        76,
        1.6
      ],
      [
        "federico-zuccon",
        "Federico Zuccon",
        "CM",
        23,
        66,
        75,
        1.9
      ],
      [
        "francesco-rossi",
        "Francesco Rossi",
        "GK",
        35,
        62,
        62,
        0.07
      ]
    ]
  },
  {
    "id": "bol",
    "name": "Bologna",
    "color": "#951C29",
    "budget": 15,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "riccardo-orsolini",
        "Riccardo Orsolini",
        "RM",
        29,
        82,
        82,
        31
      ],
      [
        "artem-dovbyk",
        "Artem Dovbyk",
        "ST",
        29,
        79,
        83,
        37
      ],
      [
        "ukasz-skorupski",
        "Łukasz Skorupski",
        "GK",
        35,
        78,
        79,
        3
      ],
      [
        "lewis-ferguson",
        "Lewis Ferguson",
        "CDM",
        27,
        77,
        81,
        19
      ],
      [
        "jens-odgaard",
        "Jens Odgaard",
        "CAM",
        27,
        76,
        77,
        9
      ],
      [
        "jonathan-david-henry-rowe",
        "Jonathan David Henry Rowe",
        "LM",
        23,
        76,
        82,
        12
      ],
      [
        "juan-miranda-gonzalez",
        "Juan Miranda González",
        "LB",
        26,
        76,
        79,
        9
      ],
      [
        "nicolo-cambiaghi",
        "Nicolò Cambiaghi",
        "LM",
        25,
        76,
        76,
        4.2
      ],
      [
        "nikola-moro",
        "Nikola Moro",
        "CDM",
        28,
        75,
        76,
        6
      ],
      [
        "emil-alfons-holm",
        "Emil Alfons Holm",
        "RB",
        26,
        75,
        78,
        5.5
      ],
      [
        "torbjrn-lysaker-heggem",
        "Torbjørn Lysaker Heggem",
        "CB",
        27,
        75,
        76,
        3.5
      ],
      [
        "roberto-piccoli",
        "Roberto Piccoli",
        "ST",
        25,
        75,
        80,
        8.5
      ],
      [
        "martin-vitik",
        "Martin Vitík",
        "CB",
        23,
        75,
        80,
        6
      ],
      [
        "federico-bernardeschi",
        "Federico Bernardeschi",
        "RM",
        32,
        75,
        77,
        8.5
      ],
      [
        "nicolo-casale",
        "Nicolò Casale",
        "CB",
        28,
        74,
        77,
        6
      ],
      [
        "karl-jesper-karlsson",
        "Karl Jesper Karlsson",
        "LW",
        28,
        74,
        75,
        6
      ],
      [
        "tommaso-pobega",
        "Tommaso Pobega",
        "CDM",
        27,
        74,
        77,
        5.5
      ],
      [
        "nadir-zortea",
        "Nadir Zortea",
        "RB",
        27,
        73,
        75,
        5
      ],
      [
        "mikel-amondarain",
        "Mikel Amondarain",
        "CM",
        21,
        73,
        75,
        1.2
      ],
      [
        "abdel-rahim-alhassane-bonkano",
        "Abdel Rahim Alhassane Bonkano",
        "LB",
        24,
        71,
        75,
        2.1
      ],
      [
        "oussama-el-azzouzi",
        "Oussama El Azzouzi",
        "CDM",
        25,
        70,
        73,
        1.7
      ],
      [
        "lorenzo-de-silvestri",
        "Lorenzo De Silvestri",
        "RB",
        38,
        69,
        71,
        0.425
      ],
      [
        "eivind-fauske-helland",
        "Eivind Fauske Helland",
        "CB",
        21,
        68,
        79,
        1.6
      ],
      [
        "massimo-pessina",
        "Massimo Pessina",
        "GK",
        18,
        62,
        74,
        0.23
      ]
    ]
  },
  {
    "id": "cag",
    "name": "Cagliari",
    "color": "#9E1B32",
    "budget": 8,
    "preferredFormation": "4-3-1-2",
    "players": [
      [
        "elia-caprile",
        "Elia Caprile",
        "GK",
        25,
        80,
        83,
        13
      ],
      [
        "sebastiano-esposito",
        "Sebastiano Esposito",
        "ST",
        24,
        76,
        82,
        12
      ],
      [
        "yerry-fernando-mina-gonzalez",
        "Yerry Fernando Mina González",
        "CB",
        31,
        76,
        77,
        8.5
      ],
      [
        "adam-obert",
        "Adam Obert",
        "LB",
        24,
        75,
        78,
        3.4
      ],
      [
        "daniel-maldini",
        "Daniel Maldini",
        "ST",
        24,
        74,
        81,
        8.5
      ],
      [
        "michel-ndary-adopo",
        "Michel Ndary Adopo",
        "CM",
        26,
        73,
        76,
        3.3
      ],
      [
        "jose-pedro-da-silva-figueiredo-freitas",
        "José Pedro da Silva Figueiredo Freitas",
        "CB",
        29,
        73,
        77,
        5.5
      ],
      [
        "gabriele-zappa",
        "Gabriele Zappa",
        "RB",
        26,
        73,
        77,
        5
      ],
      [
        "mattia-felici",
        "Mattia Felici",
        "LM",
        25,
        72,
        76,
        2.8
      ],
      [
        "juan-martin-rodriguez-camejo",
        "Juan Martín Rodríguez Camejo",
        "CB",
        21,
        72,
        74,
        1.5
      ],
      [
        "matteo-prati",
        "Matteo Prati",
        "CDM",
        22,
        72,
        81,
        4
      ],
      [
        "jacopo-fazzini",
        "Jacopo Fazzini",
        "CAM",
        23,
        72,
        81,
        5.5
      ],
      [
        "harry-billy-winks",
        "Harry Billy Winks",
        "CDM",
        30,
        71,
        74,
        3.6
      ],
      [
        "alieu-fadera",
        "Alieu Fadera",
        "LW",
        24,
        71,
        77,
        3
      ],
      [
        "kevin-carlos-omoruyi-benjamin",
        "Kevin Carlos Omoruyi Benjamin",
        "ST",
        25,
        70,
        79,
        4.7
      ],
      [
        "riyad-idrissi",
        "Riyad Idrissi",
        "LB",
        21,
        70,
        75,
        1.5
      ],
      [
        "alessandro-deiola",
        "Alessandro Deiola",
        "CM",
        31,
        70,
        70,
        1.2
      ],
      [
        "gennaro-borrelli",
        "Gennaro Borrelli",
        "ST",
        26,
        69,
        69,
        0.875
      ],
      [
        "boris-radunovic",
        "Boris Radunović",
        "GK",
        30,
        69,
        70,
        1.1
      ],
      [
        "giuseppe-aurelio",
        "Giuseppe Aurelio",
        "LB",
        26,
        69,
        71,
        1.5
      ],
      [
        "raphael-kofler",
        "Raphael Kofler",
        "CB",
        21,
        69,
        75,
        2.1
      ],
      [
        "kingstone-mutandwa",
        "Kingstone Mutandwa",
        "ST",
        23,
        68,
        72,
        1.1
      ],
      [
        "agustin-albarracin-basil",
        "Agustín Albarracín Basil",
        "LM",
        21,
        68,
        77,
        1.7
      ],
      [
        "alen-sherri",
        "Alen Sherri",
        "GK",
        28,
        66,
        71,
        1.2
      ],
      [
        "nicolo-cavuoti",
        "Nicolò Cavuoti",
        "CAM",
        23,
        65,
        72,
        0.725
      ]
    ]
  },
  {
    "id": "com",
    "name": "Como",
    "color": "#005BAC",
    "budget": 18,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "nicolas-paz-martinez",
        "Nicolás Paz Martínez",
        "CAM",
        22,
        84,
        89,
        39
      ],
      [
        "luis-milla-manzanares",
        "Luis Milla Manzanares",
        "CM",
        31,
        81,
        81,
        17
      ],
      [
        "trevoh-thomas-chalobah",
        "Trevoh Thomas Chalobah",
        "CB",
        27,
        80,
        82,
        21
      ],
      [
        "martin-baturina",
        "Martin Baturina",
        "CAM",
        23,
        79,
        83,
        22
      ],
      [
        "emil-audero-mulyadi",
        "Emil Audero Mulyadi",
        "GK",
        29,
        79,
        79,
        11
      ],
      [
        "alvaro-borja-morata-martin",
        "Álvaro Borja Morata Martín",
        "ST",
        33,
        78,
        81,
        21
      ],
      [
        "anastasios-douvikas",
        "Anastasios Douvikas",
        "ST",
        27,
        78,
        78,
        4.1
      ],
      [
        "jean-butez",
        "Jean Butez",
        "GK",
        31,
        78,
        78,
        5
      ],
      [
        "lucas-da-cunha",
        "Lucas Da Cunha",
        "CDM",
        25,
        78,
        79,
        6
      ],
      [
        "maximo-perrone",
        "Máximo Perrone",
        "CDM",
        23,
        78,
        83,
        6.5
      ],
      [
        "maxence-caqueret",
        "Maxence Caqueret",
        "CDM",
        26,
        78,
        80,
        14
      ],
      [
        "yan-bueno-couto",
        "Yan Bueno Couto",
        "RB",
        24,
        77,
        82,
        15
      ],
      [
        "assane-diao-diaoune",
        "Assane Diao Diaoune",
        "RM",
        21,
        76,
        87,
        16
      ],
      [
        "jacobo-ramon-naveros",
        "Jacobo Ramón Naveros",
        "CB",
        21,
        76,
        78,
        1.3
      ],
      [
        "nicolas-gerrit-kuhn",
        "Nicolas-Gerrit Kühn",
        "RM",
        26,
        76,
        81,
        19
      ],
      [
        "jesus-rodriguez-caraballo",
        "Jesús Rodriguez Caraballo",
        "LM",
        20,
        76,
        85,
        9
      ],
      [
        "marc-oliver-kempf",
        "Marc Oliver Kempf",
        "CB",
        31,
        76,
        76,
        2.5
      ],
      [
        "ivan-smolcic",
        "Ivan Smolčić",
        "RB",
        26,
        75,
        77,
        3.3
      ],
      [
        "alex-valle-gomez",
        "Álex Valle Gómez",
        "LB",
        22,
        75,
        82,
        5
      ],
      [
        "alberto-dossena",
        "Alberto Dossena",
        "CB",
        27,
        73,
        76,
        3.5
      ],
      [
        "noel-tornqvist",
        "Noel Törnqvist",
        "GK",
        24,
        73,
        79,
        3.1
      ],
      [
        "edoardo-goldaniga",
        "Edoardo Goldaniga",
        "CB",
        32,
        72,
        72,
        1.6
      ],
      [
        "luca-mazzitelli",
        "Luca Mazzitelli",
        "CM",
        30,
        72,
        72,
        1.8
      ],
      [
        "ignace-van-der-brempt",
        "Ignace Van der Brempt",
        "RB",
        24,
        72,
        78,
        3.6
      ],
      [
        "jayden-osei-addai",
        "Jayden Osei Addai",
        "RM",
        21,
        71,
        84,
        2.6
      ],
      [
        "ivan-azon-monzon",
        "Iván Azón Monzón",
        "ST",
        23,
        70,
        78,
        3.2
      ],
      [
        "matthias-braunoder",
        "Matthias Braunöder",
        "CM",
        24,
        68,
        76,
        2.8
      ],
      [
        "mattia-liberali",
        "Mattia Liberali",
        "CAM",
        19,
        68,
        84,
        1.8
      ],
      [
        "alessandro-gabrielloni",
        "Alessandro Gabrielloni",
        "ST",
        32,
        68,
        68,
        1.2
      ],
      [
        "tommaso-fumagalli",
        "Tommaso Fumagalli",
        "ST",
        26,
        68,
        74,
        2.1
      ]
    ]
  },
  {
    "id": "cre",
    "name": "Cremonese",
    "color": "#B71234",
    "budget": 8,
    "preferredFormation": "4-3-3",
    "players": [
      [
        "sebastiano-luperto",
        "Sebastiano Luperto",
        "CB",
        30,
        75,
        77,
        7
      ],
      [
        "federico-baschirotto",
        "Federico Baschirotto",
        "CB",
        29,
        75,
        76,
        5.5
      ],
      [
        "salvatore-elia",
        "Salvatore Elia",
        "RB",
        27,
        72,
        72,
        1.7
      ],
      [
        "andrea-fulignati",
        "Andrea Fulignati",
        "GK",
        31,
        72,
        72,
        1.1
      ],
      [
        "federico-bonazzoli",
        "Federico Bonazzoli",
        "ST",
        29,
        72,
        72,
        1.6
      ],
      [
        "jari-vandeputte",
        "Jari Vandeputte",
        "CM",
        30,
        72,
        72,
        2.3
      ],
      [
        "giuseppe-pezzella",
        "Giuseppe Pezzella",
        "LM",
        28,
        72,
        72,
        2
      ],
      [
        "michele-collocolo",
        "Michele Collocolo",
        "CM",
        26,
        71,
        75,
        3.1
      ],
      [
        "morten-thorsby",
        "Morten Thorsby",
        "CM",
        30,
        71,
        72,
        2.3
      ],
      [
        "tommaso-barbieri",
        "Tommaso Barbieri",
        "RB",
        24,
        71,
        76,
        2.7
      ],
      [
        "matteo-bianchetti",
        "Matteo Bianchetti",
        "CB",
        33,
        71,
        71,
        1.2
      ],
      [
        "alessandro-vogliacco",
        "Alessandro Vogliacco",
        "CB",
        28,
        70,
        72,
        1.6
      ],
      [
        "simone-pontisso",
        "Simone Pontisso",
        "CM",
        29,
        70,
        70,
        1.2
      ],
      [
        "milan-uric",
        "Milan Đurić",
        "ST",
        36,
        70,
        71,
        0.8
      ],
      [
        "tommaso-berti",
        "Tommaso Berti",
        "CAM",
        22,
        69,
        77,
        1.9
      ],
      [
        "alberto-grassi",
        "Alberto Grassi",
        "CM",
        31,
        69,
        70,
        1.5
      ],
      [
        "manuel-de-luca",
        "Manuel De Luca",
        "ST",
        28,
        69,
        70,
        1.7
      ],
      [
        "marco-festa",
        "Marco Festa",
        "GK",
        34,
        68,
        68,
        0.4
      ],
      [
        "fabio-gerli",
        "Fabio Gerli",
        "CDM",
        29,
        68,
        68,
        1.2
      ],
      [
        "marco-nasti",
        "Marco Nasti",
        "ST",
        23,
        67,
        75,
        1.9
      ],
      [
        "fellipe-jack-ozilio-moreira-pacheco",
        "Fellipe Jack Ozilio Moreira Pacheco",
        "CB",
        20,
        66,
        79,
        0.975
      ],
      [
        "francesco-folino",
        "Francesco Folino",
        "CB",
        24,
        65,
        73,
        1.2
      ],
      [
        "gianluca-saro",
        "Gianluca Saro",
        "GK",
        26,
        61,
        66,
        0.3
      ],
      [
        "dachi-lordkipanidze",
        "Dachi Lordkipanidze",
        "CM",
        21,
        56,
        68,
        0.35000000000000003
      ]
    ]
  },
  {
    "id": "fio",
    "name": "Fiorentina",
    "color": "#7E3C97",
    "budget": 18,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "david-de-gea-quintana",
        "David de Gea Quintana",
        "GK",
        35,
        83,
        85,
        9
      ],
      [
        "moise-bioty-kean",
        "Moise Bioty Kean",
        "ST",
        26,
        82,
        86,
        49
      ],
      [
        "alejandro-jimenez-sanchez",
        "Alejandro Jiménez Sánchez",
        "RB",
        21,
        79,
        80,
        3.9
      ],
      [
        "domilson-cordeiro-dos-santos",
        "Domilson Cordeiro dos Santos",
        "RB",
        27,
        78,
        79,
        15
      ],
      [
        "albert-gumundsson",
        "Albert Guðmundsson",
        "ST",
        29,
        77,
        79,
        18
      ],
      [
        "rolando-mandragora",
        "Rolando Mandragora",
        "CM",
        29,
        77,
        77,
        11
      ],
      [
        "franco-mastantuono",
        "Franco Mastantuono",
        "RM",
        19,
        77,
        88,
        22
      ],
      [
        "nicolo-fagioli",
        "Nicolò Fagioli",
        "CDM",
        25,
        76,
        82,
        16
      ],
      [
        "joao-mario-neto-lopes",
        "João Mário Neto Lopes",
        "RB",
        26,
        76,
        81,
        14
      ],
      [
        "arthur-atta",
        "Arthur Atta",
        "CM",
        23,
        76,
        78,
        3.1
      ],
      [
        "fabiano-parisi",
        "Fabiano Parisi",
        "LB",
        25,
        75,
        80,
        8
      ],
      [
        "luca-ranieri",
        "Luca Ranieri",
        "CB",
        27,
        75,
        79,
        8.5
      ],
      [
        "radu-matei-dragusin",
        "Radu Matei Drăgușin",
        "CB",
        24,
        74,
        81,
        8
      ],
      [
        "riccardo-sottil",
        "Riccardo Sottil",
        "LM",
        27,
        74,
        76,
        6.5
      ],
      [
        "mbala-nzola",
        "Mbala N'Zola",
        "ST",
        30,
        73,
        75,
        6
      ],
      [
        "marin-pongracic",
        "Marin Pongračić",
        "CB",
        29,
        73,
        76,
        4.5
      ],
      [
        "giovanni-fabbian",
        "Giovanni Fabbian",
        "CM",
        23,
        73,
        83,
        9.5
      ],
      [
        "marco-brescianini",
        "Marco Brescianini",
        "CM",
        26,
        72,
        74,
        2.5
      ],
      [
        "antonin-barak",
        "Antonín Barák",
        "CAM",
        31,
        72,
        75,
        5.5
      ],
      [
        "christ-ravynel-inao-oulai",
        "Christ Ravynel Inao Oulaï",
        "CDM",
        20,
        72,
        78,
        1.4
      ],
      [
        "cher-ndour",
        "Cher Ndour",
        "CM",
        22,
        72,
        83,
        3.8
      ],
      [
        "oliver-christensen",
        "Oliver Christensen",
        "GK",
        27,
        71,
        74,
        1.9
      ],
      [
        "mateo-pellegrino-casalanguila",
        "Mateo Pellegrino Casalanguila",
        "ST",
        24,
        71,
        74,
        2.1
      ],
      [
        "luca-lezzerini",
        "Luca Lezzerini",
        "GK",
        31,
        69,
        69,
        0.925
      ],
      [
        "eman-kospo",
        "Eman Košpo",
        "CB",
        19,
        61,
        76,
        0.725
      ]
    ]
  },
  {
    "id": "gen",
    "name": "Genoa",
    "color": "#AB1A2A",
    "budget": 8,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "leo-skiri-stigard",
        "Leo Skiri Østigård",
        "CB",
        26,
        76,
        80,
        5.5
      ],
      [
        "mohameth-djibril-ibrahima-sow",
        "Mohameth Djibril Ibrahima Sow",
        "CM",
        29,
        76,
        76,
        7.5
      ],
      [
        "morten-wetche-frendrup",
        "Morten Wetche Frendrup",
        "CDM",
        25,
        76,
        80,
        11
      ],
      [
        "tommaso-baldanzi",
        "Tommaso Baldanzi",
        "CAM",
        23,
        75,
        81,
        9
      ],
      [
        "johan-felipe-vasquez-ibarra",
        "Johan Felipe Vásquez Ibarra",
        "CB",
        27,
        75,
        78,
        6.5
      ],
      [
        "hamed-junior-traore",
        "Hamed Junior Traoré",
        "LM",
        26,
        75,
        80,
        14
      ],
      [
        "vitor-manuel-carvalho-oliveira",
        "Vítor Manuel Carvalho Oliveira",
        "ST",
        26,
        75,
        79,
        8
      ],
      [
        "brooke-dion-nelson-norton-cuffy",
        "Brooke Dion Nelson Norton-Cuffy",
        "RB",
        22,
        75,
        80,
        3
      ],
      [
        "justin-bijlow",
        "Justin Bijlow",
        "GK",
        28,
        75,
        76,
        4.8
      ],
      [
        "lorenzo-colombo",
        "Lorenzo Colombo",
        "ST",
        24,
        74,
        80,
        6
      ],
      [
        "aaron-martin-caricol",
        "Aarón Martín Caricol",
        "LB",
        29,
        74,
        74,
        3.8
      ],
      [
        "junior-walter-messias",
        "Junior Walter Messias",
        "CM",
        35,
        72,
        72,
        1.1
      ],
      [
        "alessandro-marcandalli",
        "Alessandro Marcandalli",
        "CB",
        23,
        72,
        75,
        1.8
      ],
      [
        "stefano-sabelli",
        "Stefano Sabelli",
        "RB",
        33,
        71,
        71,
        1.3
      ],
      [
        "mikael-egill-ellertsson",
        "Mikael Egill Ellertsson",
        "CM",
        24,
        71,
        76,
        2.8
      ],
      [
        "alan-agustin-matturro-romero",
        "Alan Agustín Matturro Romero",
        "CB",
        21,
        70,
        79,
        1.9
      ],
      [
        "mario-mitaj",
        "Mario Mitaj",
        "LB",
        23,
        69,
        76,
        2.6
      ],
      [
        "elias-havel",
        "Elias Havel",
        "ST",
        23,
        69,
        73,
        1.3
      ],
      [
        "sebastian-otoa",
        "Sebastian Otoa",
        "CB",
        22,
        68,
        74,
        1
      ],
      [
        "franz-ethan-meichtry",
        "Franz-Ethan Meichtry",
        "CAM",
        21,
        68,
        70,
        0.525
      ],
      [
        "amorim-alexsandro",
        "Amorim Alexsandro",
        "CM",
        21,
        67,
        72,
        1.3
      ],
      [
        "franz-valentin-stolz",
        "Franz Valentin Stolz",
        "GK",
        25,
        67,
        71,
        1
      ],
      [
        "lorenzo-venturino",
        "Lorenzo Venturino",
        "RM",
        20,
        65,
        71,
        0.35000000000000003
      ],
      [
        "daniele-sommariva",
        "Daniele Sommariva",
        "GK",
        29,
        62,
        65,
        0.4
      ],
      [
        "ernestas-lysionok",
        "Ernestas Lysionok",
        "GK",
        19,
        59,
        74,
        0.325
      ]
    ]
  },
  {
    "id": "hel",
    "name": "Hellas Verona FC",
    "color": "#666",
    "budget": 8,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "suat-serdar",
        "Suat Serdar",
        "CM",
        29,
        75,
        76,
        7.5
      ],
      [
        "nicola-leali",
        "Nicola Leali",
        "GK",
        33,
        74,
        74,
        0.925
      ],
      [
        "domagoj-bradaric",
        "Domagoj Bradarić",
        "LB",
        26,
        72,
        74,
        2.3
      ],
      [
        "antoine-joseph-emmanuel-bernede",
        "Antoine Joseph Emmanuel Bernede",
        "CM",
        27,
        72,
        75,
        3
      ],
      [
        "tomas-suslov",
        "Tomáš Suslov",
        "CAM",
        24,
        72,
        80,
        5
      ],
      [
        "grigoris-kastanos",
        "Grigoris Kastanos",
        "CAM",
        28,
        72,
        72,
        2.5
      ],
      [
        "martin-snder-frese",
        "Martin Sønder Frese",
        "LB",
        28,
        72,
        72,
        1.3
      ],
      [
        "abdoulrahmane-harroui",
        "Abdoulrahmane Harroui",
        "CM",
        28,
        71,
        72,
        2.5
      ],
      [
        "amin-sarr",
        "Amin Sarr",
        "ST",
        25,
        71,
        76,
        2.9
      ],
      [
        "daniel-fernando-mosquera-bonilla",
        "Daniel Fernando Mosquera Bonilla",
        "ST",
        26,
        70,
        74,
        2.5
      ],
      [
        "samuele-mulattieri",
        "Samuele Mulattieri",
        "ST",
        25,
        70,
        74,
        2.6
      ],
      [
        "rafik-belghali",
        "Rafik Belghali",
        "RB",
        24,
        70,
        73,
        1.6
      ],
      [
        "tobias-slotsager",
        "Tobias Slotsager",
        "CB",
        20,
        69,
        82,
        3.1
      ],
      [
        "dailon-rocha-livramento-do-rosario",
        "Dailon Rocha Livramento do Rosario",
        "ST",
        25,
        68,
        75,
        2.4
      ],
      [
        "andrias-edmundsson",
        "Andrias Edmundsson",
        "CB",
        25,
        67,
        68,
        0.75
      ],
      [
        "seid-korac",
        "Seid Korač",
        "CB",
        24,
        67,
        72,
        1
      ],
      [
        "nicolo-calabrese",
        "Nicolò Calabrese",
        "CB",
        21,
        66,
        70,
        0.45
      ],
      [
        "kacper-sezonienko",
        "Kacper Sezonienko",
        "LM",
        23,
        66,
        69,
        0.775
      ],
      [
        "mattia-compagnon",
        "Mattia Compagnon",
        "RM",
        24,
        66,
        70,
        1.1
      ],
      [
        "fallou-cham",
        "Fallou Cham",
        "RB",
        20,
        66,
        75,
        1.8
      ],
      [
        "nunzio-lella",
        "Nunzio Lella",
        "CM",
        26,
        66,
        71,
        1.3
      ],
      [
        "charlys-matheus-lima-pontes",
        "Charlys Matheus Lima Pontes",
        "CM",
        22,
        65,
        70,
        0.975
      ],
      [
        "daniel-oladele-akinbiyi-oyegoke",
        "Daniel Oladele Akinbiyi Oyegoke",
        "RB",
        23,
        65,
        73,
        0.8250000000000001
      ],
      [
        "giacomo-toniolo",
        "Giacomo Toniolo",
        "GK",
        22,
        56,
        66,
        0.275
      ]
    ]
  },
  {
    "id": "int",
    "name": "Inter",
    "color": "#010E80",
    "budget": 59,
    "preferredFormation": "4-3-3",
    "players": [
      [
        "nicolo-barella",
        "Nicolò Barella",
        "CM",
        29,
        87,
        87,
        80
      ],
      [
        "lautaro-javier-martinez",
        "Lautaro Javier Martínez",
        "ST",
        29,
        87,
        88,
        99
      ],
      [
        "federico-dimarco",
        "Federico Dimarco",
        "LB",
        28,
        86,
        86,
        52
      ],
      [
        "alessandro-bastoni",
        "Alessandro Bastoni",
        "CB",
        27,
        86,
        89,
        87
      ],
      [
        "marcus-lilian-thuram-ulien",
        "Marcus Lilian Thuram-Ulien",
        "ST",
        29,
        85,
        85,
        59
      ],
      [
        "hakan-calhanoglu",
        "Hakan Çalhanoğlu",
        "CDM",
        32,
        85,
        86,
        48
      ],
      [
        "ivan-provedel",
        "Ivan Provedel",
        "GK",
        32,
        83,
        83,
        16
      ],
      [
        "manuel-obafemi-akanji",
        "Manuel Obafemi Akanji",
        "CB",
        31,
        83,
        83,
        26
      ],
      [
        "john-stones",
        "John Stones",
        "CB",
        32,
        82,
        82,
        21
      ],
      [
        "piotr-sebastian-zielinski",
        "Piotr Sebastian Zieliński",
        "CM",
        32,
        82,
        82,
        18
      ],
      [
        "henrikh-mkhitaryan",
        "Henrikh Mkhitaryan",
        "CM",
        37,
        81,
        83,
        12
      ],
      [
        "carlos-augusto-zopalato-neves",
        "Carlos Augusto Zopalato Neves",
        "LB",
        27,
        80,
        82,
        28
      ],
      [
        "diop-tehuti-djed-hotep-spence",
        "Diop Tehuti Djed-Hotep Spence",
        "LB",
        26,
        80,
        82,
        19
      ],
      [
        "curtis-jones",
        "Curtis Jones",
        "CM",
        25,
        80,
        83,
        29
      ],
      [
        "benjamin-pavard",
        "Benjamin Pavard",
        "CB",
        30,
        80,
        84,
        36
      ],
      [
        "petar-sucic",
        "Petar Sučić",
        "CM",
        22,
        78,
        83,
        9.5
      ],
      [
        "ange-yoan-bonny",
        "Ange-Yoan Bonny",
        "ST",
        22,
        78,
        86,
        17
      ],
      [
        "yann-aurel-ludger-bisseck",
        "Yann Aurel Ludger Bisseck",
        "CB",
        25,
        78,
        80,
        9.5
      ],
      [
        "luis-henrique-tomaz-de-lima",
        "Luis Henrique Tomaz de Lima",
        "RB",
        24,
        77,
        83,
        21
      ],
      [
        "francesco-pio-esposito",
        "Francesco Pio Esposito",
        "ST",
        21,
        77,
        84,
        5.5
      ],
      [
        "aleksandar-stankovic",
        "Aleksandar Stankovic",
        "CDM",
        21,
        76,
        79,
        1.9
      ],
      [
        "andy-alune-diouf",
        "Andy Alune Diouf",
        "CM",
        23,
        76,
        81,
        9
      ],
      [
        "josep-martinez-riera",
        "Josep Martínez Riera",
        "GK",
        28,
        76,
        77,
        5
      ],
      [
        "kristjan-asllani",
        "Kristjan Asllani",
        "CDM",
        24,
        73,
        79,
        6
      ],
      [
        "raffaele-di-gennaro",
        "Raffaele Di Gennaro",
        "GK",
        32,
        68,
        68,
        0.65
      ],
      [
        "yanis-massolin",
        "Yanis Massolin",
        "CM",
        23,
        68,
        74,
        1.6
      ]
    ]
  },
  {
    "id": "juv",
    "name": "Juventus",
    "color": "#000000",
    "budget": 43,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "gleison-bremer-silva-nascimento",
        "Gleison Bremer Silva Nascimento",
        "CB",
        29,
        86,
        86,
        51
      ],
      [
        "kenan-yldz",
        "Kenan Yıldız",
        "CAM",
        21,
        84,
        89,
        39
      ],
      [
        "manuel-locatelli",
        "Manuel Locatelli",
        "CDM",
        28,
        84,
        85,
        43
      ],
      [
        "khephren-thuram-ulien",
        "Khéphren Thuram-Ulien",
        "CM",
        25,
        81,
        85,
        37
      ],
      [
        "pierre-kazeye-rommel-kalulu-kyatengwa",
        "Pierre Kazeye Rommel Kalulu Kyatengwa",
        "CB",
        26,
        81,
        85,
        28
      ],
      [
        "jonathan-christian-david",
        "Jonathan Christian David",
        "ST",
        26,
        80,
        85,
        41
      ],
      [
        "weston-james-earl-mckennie",
        "Weston James Earl McKennie",
        "CM",
        28,
        80,
        80,
        17
      ],
      [
        "guglielmo-vicario",
        "Guglielmo Vicario",
        "GK",
        29,
        80,
        84,
        26
      ],
      [
        "michele-di-gregorio",
        "Michele Di Gregorio",
        "GK",
        29,
        80,
        84,
        26
      ],
      [
        "andrea-cambiaso",
        "Andrea Cambiaso",
        "LB",
        26,
        80,
        82,
        22
      ],
      [
        "francisco-fernandes-da-conceicao",
        "Francisco Fernandes da Conceição",
        "CAM",
        23,
        80,
        86,
        36
      ],
      [
        "mehmet-zeki-celik",
        "Mehmet Zeki Çelik",
        "RB",
        29,
        79,
        79,
        7
      ],
      [
        "nicolas-ivan-gonzalez",
        "Nicolás Iván González",
        "LM",
        28,
        79,
        79,
        15
      ],
      [
        "federico-gatti",
        "Federico Gatti",
        "CB",
        28,
        79,
        83,
        24
      ],
      [
        "jeremie-boga",
        "Jérémie Boga",
        "CAM",
        29,
        78,
        78,
        7.5
      ],
      [
        "edon-zhegrova",
        "Edon Zhegrova",
        "RM",
        27,
        78,
        80,
        21
      ],
      [
        "douglas-luiz-soares-de-paulo",
        "Douglas Luiz Soares de Paulo",
        "CDM",
        28,
        78,
        80,
        23
      ],
      [
        "teun-koopmeiners",
        "Teun Koopmeiners",
        "CAM",
        28,
        78,
        81,
        28
      ],
      [
        "lloyd-casius-kelly",
        "Lloyd Casius Kelly",
        "CB",
        27,
        77,
        77,
        4.9
      ],
      [
        "randal-kolo-muani",
        "Randal Kolo Muani",
        "ST",
        27,
        77,
        82,
        31
      ],
      [
        "mattia-perin",
        "Mattia Perin",
        "GK",
        33,
        76,
        78,
        7
      ],
      [
        "jhon-janer-lucumi-bonilla",
        "Jhon Janer Lucumí Bonilla",
        "CB",
        28,
        76,
        78,
        8
      ],
      [
        "arkadiusz-krystian-milik",
        "Arkadiusz Krystian Milik",
        "ST",
        32,
        76,
        79,
        15
      ],
      [
        "fabio-miretti",
        "Fabio Miretti",
        "CM",
        23,
        75,
        80,
        6.5
      ],
      [
        "daniele-rugani",
        "Daniele Rugani",
        "CB",
        32,
        74,
        75,
        4.6
      ],
      [
        "juan-david-cabal-murillo",
        "Juan David Cabal Murillo",
        "LB",
        25,
        74,
        79,
        6
      ],
      [
        "kerim-sam-alajbegovic",
        "Kerim-Sam Alajbegović",
        "CAM",
        18,
        71,
        82,
        1.2
      ],
      [
        "jeff-ekhator-osayuki",
        "Jeff Ekhator Osayuki",
        "ST",
        19,
        68,
        78,
        0.8250000000000001
      ],
      [
        "carlo-pinsoglio",
        "Carlo Pinsoglio",
        "GK",
        36,
        68,
        69,
        0.15
      ]
    ]
  },
  {
    "id": "laz",
    "name": "Lazio",
    "color": "#87D8F7",
    "budget": 26,
    "preferredFormation": "4-3-3",
    "players": [
      [
        "mattia-zaccagni",
        "Mattia Zaccagni",
        "LW",
        31,
        82,
        84,
        41
      ],
      [
        "alessio-romagnoli",
        "Alessio Romagnoli",
        "CB",
        31,
        81,
        82,
        25
      ],
      [
        "davide-frattesi",
        "Davide Frattesi",
        "CM",
        26,
        80,
        83,
        32
      ],
      [
        "danilho-raimundo-doekhi",
        "Danilho Raimundo Doekhi",
        "CB",
        28,
        79,
        80,
        15
      ],
      [
        "nicolo-rovella",
        "Nicolò Rovella",
        "CDM",
        24,
        78,
        84,
        25
      ],
      [
        "adam-marusic",
        "Adam Marušić",
        "RB",
        33,
        78,
        78,
        9.5
      ],
      [
        "danilo-cataldi",
        "Danilo Cataldi",
        "CM",
        32,
        78,
        78,
        9
      ],
      [
        "boulaye-dia",
        "Boulaye Dia",
        "ST",
        29,
        78,
        80,
        22
      ],
      [
        "kenneth-ina-dorothea-taylor",
        "Kenneth Ina Dorothea Taylor",
        "CM",
        24,
        78,
        84,
        22
      ],
      [
        "gustav-tang-isaksen",
        "Gustav Tang Isaksen",
        "RW",
        25,
        76,
        79,
        10
      ],
      [
        "alfonso-pedraza-sag",
        "Alfonso Pedraza Sag",
        "LB",
        30,
        76,
        76,
        4.9
      ],
      [
        "josip-sutalo",
        "Josip Šutalo",
        "CB",
        26,
        76,
        82,
        18
      ],
      [
        "nuno-albertino-varela-tavares",
        "Nuno Albertino Varela Tavares",
        "LB",
        26,
        76,
        81,
        17
      ],
      [
        "samuel-florent-thomas-gigot",
        "Samuel Florent Thomas Gigot",
        "CB",
        32,
        75,
        77,
        7
      ],
      [
        "manuel-lazzari",
        "Manuel Lazzari",
        "RB",
        32,
        75,
        78,
        10
      ],
      [
        "matteo-cancellieri",
        "Matteo Cancellieri",
        "RW",
        24,
        74,
        79,
        4.8
      ],
      [
        "patricio-gabarron-gil",
        "Patricio Gabarrón Gil",
        "CB",
        33,
        74,
        75,
        3.6
      ],
      [
        "luca-pellegrini",
        "Luca Pellegrini",
        "LB",
        27,
        74,
        75,
        4.5
      ],
      [
        "tijjani-noslin",
        "Tijjani Noslin",
        "ST",
        27,
        74,
        77,
        5.5
      ],
      [
        "christos-mandas",
        "Christos Mandas",
        "GK",
        25,
        74,
        80,
        5.5
      ],
      [
        "oluwafisayo-faruq-dele-bashiru",
        "Oluwafisayo Faruq Dele-Bashiru",
        "CAM",
        25,
        74,
        77,
        4.4
      ],
      [
        "oliver-provstgaard-nielsen",
        "Oliver Provstgaard Nielsen",
        "CB",
        23,
        70,
        75,
        2.1
      ],
      [
        "edoardo-motta",
        "Edoardo Motta",
        "GK",
        21,
        69,
        72,
        0.47500000000000003
      ],
      [
        "romano-floriani-mussolini",
        "Romano Floriani Mussolini",
        "RM",
        23,
        68,
        77,
        2.7
      ],
      [
        "gabriele-artistico",
        "Gabriele Artistico",
        "ST",
        24,
        68,
        72,
        1.5
      ],
      [
        "petar-ratkov",
        "Petar Ratkov",
        "ST",
        23,
        68,
        78,
        2.7
      ],
      [
        "reda-belahyane",
        "Reda Belahyane",
        "CM",
        22,
        67,
        77,
        2.7
      ],
      [
        "filipe-bordon",
        "Filipe Bordon",
        "CB",
        21,
        66,
        75,
        1.2
      ],
      [
        "adrian-przyborek",
        "Adrian Przyborek",
        "CAM",
        19,
        66,
        78,
        2
      ],
      [
        "alessio-furlanetto",
        "Alessio Furlanetto",
        "GK",
        24,
        61,
        66,
        0.4
      ]
    ]
  },
  {
    "id": "lec",
    "name": "Lecce",
    "color": "#FFE600",
    "budget": 8,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "wladimiro-falcone",
        "Wladimiro Falcone",
        "GK",
        31,
        84,
        84,
        17
      ],
      [
        "antonino-gallo",
        "Antonino Gallo",
        "LB",
        26,
        75,
        78,
        7
      ],
      [
        "lassana-coulibaly",
        "Lassana Coulibaly",
        "CDM",
        30,
        74,
        74,
        3.6
      ],
      [
        "willem-davnis-louis-didier-geubbels",
        "Willem Davnis Louis Didier Geubbels",
        "ST",
        25,
        72,
        79,
        4.7
      ],
      [
        "esmevanio-kialonda-gaspar",
        "Esmevânio Kialonda Gaspar",
        "CB",
        28,
        72,
        76,
        4.5
      ],
      [
        "santiago-daniel-pierotti",
        "Santiago Daniel Pierotti",
        "RM",
        25,
        71,
        76,
        2.5
      ],
      [
        "youssef-maleh",
        "Youssef Maleh",
        "CM",
        28,
        71,
        72,
        2.2
      ],
      [
        "omri-gandelman",
        "Omri Gandelman",
        "CAM",
        26,
        71,
        75,
        2.6
      ],
      [
        "nikola-stulic",
        "Nikola Štulić",
        "ST",
        25,
        70,
        78,
        3.7
      ],
      [
        "lameck-banda",
        "Lameck Banda",
        "LM",
        25,
        70,
        77,
        3
      ],
      [
        "jamil-siebert",
        "Jamil Siebert",
        "CB",
        24,
        70,
        78,
        3.3
      ],
      [
        "gaby-jean",
        "Gaby Jean",
        "CB",
        26,
        69,
        75,
        2.2
      ],
      [
        "mohamed-kaba",
        "Mohamed Kaba",
        "CDM",
        24,
        69,
        76,
        2.5
      ],
      [
        "marco-bleve",
        "Marco Bleve",
        "GK",
        30,
        69,
        69,
        0.65
      ],
      [
        "danilo-filipe-de-melo-veiga",
        "Danilo Filipe de Melo Veiga",
        "RB",
        23,
        69,
        78,
        3
      ],
      [
        "medon-berisha",
        "Medon Berisha",
        "CM",
        22,
        69,
        78,
        2.3
      ],
      [
        "tiago-gabriel-coelho-oliveira",
        "Tiago Gabriel Coelho Oliveira",
        "CB",
        21,
        69,
        77,
        2.5
      ],
      [
        "christ-owen-kouassi-bathele",
        "Christ-Owen Kouassi Bathele",
        "RB",
        23,
        68,
        76,
        2.7
      ],
      [
        "konan-ignace-jocelyn-ndri",
        "Konan Ignace Jocelyn N'Dri",
        "RM",
        25,
        68,
        73,
        1.6
      ],
      [
        "oumar-ngom",
        "Oumar Ngom",
        "CDM",
        22,
        66,
        74,
        1.3
      ],
      [
        "corrie-richard-ndaba",
        "Corrie Richard Ndaba",
        "LB",
        26,
        66,
        70,
        0.975
      ],
      [
        "sadik-fofana",
        "Sadik Fofana",
        "CDM",
        23,
        65,
        72,
        1.4
      ],
      [
        "sebastian-esposito",
        "Sebastian Esposito",
        "CB",
        21,
        62,
        67,
        0.12
      ]
    ]
  },
  {
    "id": "nap",
    "name": "Napoli",
    "color": "#12A0D7",
    "budget": 37,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "scott-francis-mctominay",
        "Scott Francis McTominay",
        "CM",
        29,
        86,
        86,
        54
      ],
      [
        "kevin-de-bruyne",
        "Kevin De Bruyne",
        "CAM",
        35,
        85,
        87,
        37
      ],
      [
        "amir-kadri-rrahmani",
        "Amir Kadri Rrahmani",
        "CB",
        32,
        83,
        83,
        25
      ],
      [
        "stanislav-lobotka",
        "Stanislav Lobotka",
        "CM",
        31,
        83,
        83,
        35
      ],
      [
        "giovanni-di-lorenzo",
        "Giovanni Di Lorenzo",
        "RB",
        33,
        82,
        83,
        27
      ],
      [
        "andre-frank-zambo-anguissa",
        "André-Frank Zambo Anguissa",
        "CM",
        30,
        82,
        82,
        30
      ],
      [
        "alex-meret",
        "Alex Meret",
        "GK",
        29,
        81,
        84,
        26
      ],
      [
        "david-neres-campos",
        "David Neres Campos",
        "LW",
        29,
        81,
        81,
        26
      ],
      [
        "alessandro-buongiorno",
        "Alessandro Buongiorno",
        "CB",
        27,
        81,
        86,
        38
      ],
      [
        "leonardo-spinazzola",
        "Leonardo Spinazzola",
        "LB",
        33,
        80,
        80,
        9.5
      ],
      [
        "vanja-milinkovic-savic",
        "Vanja Milinković-Savić -",
        "GK",
        29,
        80,
        81,
        15
      ],
      [
        "matteo-politano",
        "Matteo Politano",
        "RW",
        33,
        80,
        81,
        22
      ],
      [
        "noa-noell-lang",
        "Noa Noëll Lang",
        "LM",
        27,
        79,
        81,
        25
      ],
      [
        "sam-beukema",
        "Sam Beukema",
        "CB",
        27,
        78,
        81,
        17
      ],
      [
        "rasmus-winther-hjlund",
        "Rasmus Winther Højlund",
        "ST",
        23,
        78,
        83,
        16
      ],
      [
        "mathias-olivera-miramontes",
        "Mathías Olivera Miramontes",
        "LB",
        28,
        77,
        78,
        14
      ],
      [
        "rafael-marin-zamora",
        "Rafael Marín Zamora",
        "CB",
        24,
        76,
        81,
        3.3
      ],
      [
        "benoit-badiashile-mukinayi",
        "Benoît Badiashile Mukinayi",
        "CB",
        25,
        76,
        80,
        9.5
      ],
      [
        "billy-clifford-gilmour",
        "Billy Clifford Gilmour",
        "CM",
        25,
        75,
        79,
        6.5
      ],
      [
        "lorenzo-lucca",
        "Lorenzo Lucca",
        "ST",
        26,
        75,
        80,
        11
      ],
      [
        "alisson-de-almeida-santos",
        "Alisson de Almeida Santos",
        "CAM",
        23,
        74,
        76,
        1.9
      ],
      [
        "michael-ijemuan-folorunsho",
        "Michael Ijemuan Folorunsho",
        "CM",
        28,
        74,
        75,
        6
      ],
      [
        "jens-lys-michel-cajuste",
        "Jens-Lys Michel Cajuste",
        "CDM",
        27,
        73,
        79,
        7
      ],
      [
        "jesper-grnge-lindstrm",
        "Jesper Grænge Lindstrøm",
        "RM",
        26,
        73,
        78,
        7.5
      ],
      [
        "cyril-ngonge",
        "Cyril Ngonge",
        "RM",
        26,
        72,
        75,
        3.1
      ],
      [
        "walid-cheddira",
        "Walid Cheddira",
        "ST",
        28,
        72,
        73,
        2.7
      ],
      [
        "giovane-santana",
        "Giovane Santana",
        "ST",
        22,
        71,
        79,
        1.8
      ],
      [
        "pasquale-mazzocchi",
        "Pasquale Mazzocchi",
        "RB",
        31,
        71,
        72,
        2.1
      ],
      [
        "costantino-favasuli",
        "Costantino Favasuli",
        "RM",
        22,
        69,
        76,
        1.6
      ],
      [
        "antonio-vergara",
        "Antonio Vergara",
        "CAM",
        23,
        69,
        74,
        1.6
      ]
    ]
  },
  {
    "id": "par",
    "name": "Parma",
    "color": "#FFDE00",
    "budget": 8,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "adrian-bernabe-garcia",
        "Adrián Bernabé García",
        "CM",
        25,
        76,
        81,
        8
      ],
      [
        "emanuele-valeri",
        "Emanuele Valeri",
        "LB",
        27,
        75,
        76,
        6
      ],
      [
        "enrico-delprato",
        "Enrico Delprato",
        "CB",
        26,
        75,
        78,
        7
      ],
      [
        "lamine-mandela-keita",
        "Lamine Mandela Keita",
        "CDM",
        24,
        75,
        80,
        5.5
      ],
      [
        "hans-nicolussi-caviglia",
        "Hans Nicolussi Caviglia",
        "CDM",
        26,
        75,
        80,
        7.5
      ],
      [
        "abdoulaye-niakhate-ndiaye",
        "Abdoulaye Niakhate Ndiaye",
        "CB",
        24,
        74,
        81,
        8
      ],
      [
        "matija-frigan",
        "Matija Frigan",
        "ST",
        23,
        73,
        83,
        7
      ],
      [
        "jose-david-romero",
        "José David Romero",
        "ST",
        23,
        72,
        76,
        2.7
      ],
      [
        "oliver-srensen-jensen",
        "Oliver Sørensen Jensen",
        "CM",
        24,
        72,
        80,
        6
      ],
      [
        "el-bilal-toure",
        "El Bilal Touré",
        "LM",
        24,
        72,
        81,
        7
      ],
      [
        "pontus-skule-erik-almqvist",
        "Pontus Skule Erik Almqvist",
        "RW",
        27,
        71,
        73,
        2.8
      ],
      [
        "botond-balogh",
        "Botond Balogh",
        "CB",
        24,
        70,
        79,
        3.3
      ],
      [
        "christian-nahuel-ordonez",
        "Christian Nahuel Ordoñez",
        "CM",
        22,
        70,
        83,
        4.8
      ],
      [
        "mariano-emir-troilo",
        "Mariano Emir Troilo",
        "CB",
        23,
        70,
        79,
        2
      ],
      [
        "edoardo-corvi",
        "Edoardo Corvi",
        "GK",
        25,
        69,
        71,
        0.925
      ],
      [
        "lautaro-rodrigo-valenti",
        "Lautaro Rodrigo Valenti",
        "CB",
        27,
        69,
        71,
        1.4
      ],
      [
        "benjamin-cremaschi",
        "Benjamin Cremaschi",
        "CM",
        21,
        68,
        80,
        2.9
      ],
      [
        "giovanni-daffara",
        "Giovanni Daffara",
        "GK",
        21,
        67,
        74,
        0.7000000000000001
      ],
      [
        "nesta-elphege",
        "Nesta Elphege",
        "ST",
        25,
        65,
        68,
        0.625
      ],
      [
        "rachid-kouda",
        "Rachid Kouda",
        "CM",
        24,
        65,
        72,
        1.3
      ],
      [
        "sascha-britschgi",
        "Sascha Britschgi",
        "RB",
        20,
        65,
        70,
        0.19
      ],
      [
        "peter-amoran",
        "Peter Amoran",
        "CB",
        22,
        63,
        74,
        0.75
      ],
      [
        "franco-ezequiel-carboni",
        "Franco Ezequiel Carboni",
        "LB",
        23,
        63,
        72,
        1
      ]
    ]
  },
  {
    "id": "pis",
    "name": "Pisa",
    "color": "#001E62",
    "budget": 8,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "matteo-tramoni",
        "Mattéo Tramoni",
        "CAM",
        26,
        74,
        77,
        5.5
      ],
      [
        "simone-canestrelli",
        "Simone Canestrelli",
        "CB",
        26,
        72,
        75,
        2.2
      ],
      [
        "stefano-moreo",
        "Stefano Moreo",
        "ST",
        33,
        72,
        72,
        1.5
      ],
      [
        "simone-zanon",
        "Simone Zanon",
        "RB",
        25,
        72,
        75,
        2.2
      ],
      [
        "felipe-ignacio-loyola-olea",
        "Felipe Ignacio Loyola Olea",
        "CM",
        25,
        71,
        76,
        2.8
      ],
      [
        "simone-scuffet",
        "Simone Scuffet",
        "GK",
        30,
        71,
        74,
        1.9
      ],
      [
        "samuele-angori",
        "Samuele Angori",
        "LM",
        22,
        71,
        78,
        3.1
      ],
      [
        "mehdi-pascal-marcel-leris",
        "Mehdi Pascal Marcel Léris",
        "RM",
        28,
        71,
        71,
        1.3
      ],
      [
        "antonio-aldo-caracciolo",
        "Antonio Aldo Caracciolo",
        "CB",
        36,
        71,
        71,
        0.5
      ],
      [
        "adrian-semper",
        "Adrian Šemper",
        "GK",
        28,
        71,
        74,
        1.8
      ],
      [
        "andrea-petagna",
        "Andrea Petagna",
        "ST",
        31,
        70,
        70,
        1.4
      ],
      [
        "giuseppe-leone",
        "Giuseppe Leone",
        "CM",
        25,
        70,
        74,
        2.1
      ],
      [
        "emanuel-vignato",
        "Emanuel Vignato",
        "CAM",
        26,
        70,
        73,
        2.2
      ],
      [
        "henrik-wendel-meister",
        "Henrik Wendel Meister",
        "ST",
        22,
        69,
        76,
        2.3
      ],
      [
        "gabriele-piccinini",
        "Gabriele Piccinini",
        "CM",
        25,
        68,
        75,
        2.4
      ],
      [
        "arturo-calabresi",
        "Arturo Calabresi",
        "CB",
        30,
        68,
        68,
        1
      ],
      [
        "omar-correia",
        "Omar Correia",
        "CM",
        26,
        68,
        69,
        0.775
      ],
      [
        "nicholas-bonfanti",
        "Nicholas Bonfanti",
        "ST",
        24,
        67,
        74,
        2.1
      ],
      [
        "tomas-do-lago-pontes-esteves",
        "Tomás do Lago Pontes Esteves",
        "RB",
        24,
        67,
        74,
        1.9
      ],
      [
        "emanuele-rao",
        "Emanuele Rao",
        "CAM",
        20,
        67,
        76,
        1.5
      ],
      [
        "alessandro-confente",
        "Alessandro Confente",
        "GK",
        28,
        67,
        67,
        0.5750000000000001
      ],
      [
        "malthe-hjholt",
        "Malthe Højholt",
        "CDM",
        25,
        66,
        72,
        1.2
      ],
      [
        "mateus-henrique-vanzelli-lusuardi",
        "Mateus Henrique Vanzelli Lusuardi",
        "CB",
        22,
        66,
        74,
        1.5
      ],
      [
        "tommaso-marras",
        "Tommaso Marras",
        "CAM",
        22,
        65,
        65,
        0.325
      ],
      [
        "rosen-petkov-bozhinov",
        "Rosen Petkov Bozhinov",
        "CB",
        21,
        64,
        75,
        0.75
      ],
      [
        "leonardo-loria",
        "Leonardo Loria",
        "GK",
        27,
        63,
        68,
        0.55
      ],
      [
        "isak-vural",
        "İsak Vural",
        "CM",
        20,
        63,
        79,
        1
      ],
      [
        "daniel-tyrell-denoon",
        "Daniel Tyrell Denoon",
        "CB",
        22,
        62,
        73,
        0.8250000000000001
      ],
      [
        "louis-buffon",
        "Louis Buffon",
        "LM",
        18,
        60,
        75,
        0.55
      ]
    ]
  },
  {
    "id": "rom",
    "name": "Roma",
    "color": "#666",
    "budget": 33,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "mile-svilar",
        "Mile Svilar",
        "GK",
        27,
        85,
        86,
        34
      ],
      [
        "paulo-bruno-exequiel-dybala",
        "Paulo Bruno Exequiel Dybala",
        "CAM",
        32,
        85,
        86,
        57
      ],
      [
        "gianluca-mancini",
        "Gianluca Mancini",
        "CB",
        30,
        84,
        84,
        31
      ],
      [
        "obite-evan-ndicka",
        "Obite Evan Ndicka",
        "CB",
        27,
        83,
        83,
        29
      ],
      [
        "donyell-malen",
        "Donyell Malen",
        "ST",
        27,
        83,
        83,
        21
      ],
      [
        "kouadio-emmanuel-boris-kone",
        "Kouadio Emmanuel Boris Koné",
        "CM",
        25,
        81,
        84,
        27
      ],
      [
        "bryan-cristante",
        "Bryan Cristante",
        "CM",
        31,
        81,
        81,
        20
      ],
      [
        "mario-hermoso-canseco",
        "Mario Hermoso Canseco",
        "CB",
        31,
        81,
        81,
        18
      ],
      [
        "wesley-vinicius-franca-lima",
        "Wesley Vinícius França Lima",
        "LB",
        23,
        80,
        85,
        23
      ],
      [
        "matias-soule-malvano",
        "Matías Soulé Malvano",
        "CAM",
        23,
        80,
        85,
        29
      ],
      [
        "lorenzo-pellegrini",
        "Lorenzo Pellegrini",
        "CAM",
        30,
        78,
        80,
        21
      ],
      [
        "neil-el-aynaoui",
        "Neil El Aynaoui",
        "CM",
        25,
        77,
        83,
        17
      ],
      [
        "nahuel-molina-lucero",
        "Nahuel Molina Lucero",
        "RB",
        28,
        77,
        80,
        19
      ],
      [
        "rodrigo-mora-de-carvalho",
        "Rodrigo Mora de Carvalho",
        "CAM",
        19,
        77,
        89,
        18
      ],
      [
        "santiago-tomas-castro",
        "Santiago Tomás Castro",
        "ST",
        22,
        77,
        84,
        17
      ],
      [
        "konstantinos-koulierakis",
        "Konstantinos Koulierakis",
        "CB",
        22,
        76,
        86,
        22
      ],
      [
        "anass-salah-eddine",
        "Anass Salah-Eddine",
        "LB",
        24,
        75,
        78,
        3.6
      ],
      [
        "devyne-fabian-jairo-rensch",
        "Devyne Fabian Jairo Rensch",
        "RM",
        23,
        75,
        80,
        6.5
      ],
      [
        "niccolo-pisilli",
        "Niccolò Pisilli",
        "CM",
        21,
        74,
        84,
        5.5
      ],
      [
        "daniele-ghilardi",
        "Daniele Ghilardi",
        "CB",
        23,
        74,
        80,
        4.9
      ],
      [
        "pierluigi-gollini",
        "Pierluigi Gollini",
        "GK",
        31,
        74,
        74,
        2.8
      ],
      [
        "devis-estiven-vasquez-llach",
        "Devis Estiven Vásquez Llach",
        "GK",
        28,
        72,
        75,
        2.3
      ],
      [
        "robinio-vaz",
        "Robinio Vaz",
        "ST",
        19,
        71,
        82,
        1.5
      ],
      [
        "jan-ziokowski",
        "Jan Ziółkowski",
        "CB",
        21,
        70,
        79,
        1.9
      ],
      [
        "mattia-mannini",
        "Mattia Mannini",
        "RB",
        20,
        65,
        78,
        1.6
      ]
    ]
  },
  {
    "id": "sas",
    "name": "Sassuolo",
    "color": "#00A651",
    "budget": 11,
    "preferredFormation": "4-3-3",
    "players": [
      [
        "domenico-berardi",
        "Domenico Berardi",
        "RW",
        32,
        82,
        82,
        30
      ],
      [
        "armand-gaetan-lauriente",
        "Armand Gaëtan Laurienté",
        "LW",
        27,
        80,
        80,
        23
      ],
      [
        "nemanja-matic",
        "Nemanja Matić",
        "CDM",
        38,
        77,
        77,
        2.1
      ],
      [
        "kristian-thorstvedt",
        "Kristian Thorstvedt",
        "CM",
        27,
        76,
        76,
        6.5
      ],
      [
        "ismael-kenneth-jordan-kone",
        "Ismaël Kenneth Jordan Koné",
        "CM",
        24,
        75,
        79,
        4.7
      ],
      [
        "jay-noah-idzes",
        "Jay Noah Idzes",
        "CB",
        26,
        75,
        77,
        3.1
      ],
      [
        "andrea-pinamonti",
        "Andrea Pinamonti",
        "ST",
        27,
        75,
        78,
        7.5
      ],
      [
        "arijanet-anan-muric",
        "Arijanet Anan Murić",
        "GK",
        27,
        74,
        75,
        2.4
      ],
      [
        "sebastian-wiktor-walukiewicz",
        "Sebastian Wiktor Walukiewicz",
        "RB",
        26,
        74,
        76,
        2.5
      ],
      [
        "stefano-turati",
        "Stefano Turati",
        "GK",
        25,
        74,
        82,
        8
      ],
      [
        "fedde-leysen",
        "Fedde Leysen",
        "CB",
        23,
        73,
        76,
        2.5
      ],
      [
        "josh-thomas-doig",
        "Josh Thomas Doig",
        "LB",
        24,
        73,
        78,
        4.3
      ],
      [
        "benjamin-dominguez",
        "Benjamín Domínguez",
        "LM",
        22,
        72,
        83,
        7
      ],
      [
        "cristian-volpato",
        "Cristian Volpato",
        "RW",
        22,
        72,
        78,
        3.1
      ],
      [
        "daniel-boloca",
        "Daniel Boloca",
        "CM",
        27,
        72,
        74,
        4.6
      ],
      [
        "nicholas-pierini",
        "Nicholas Pierini",
        "ST",
        28,
        71,
        71,
        2.1
      ],
      [
        "fali-cande",
        "Fali Candé",
        "CB",
        28,
        71,
        73,
        2
      ],
      [
        "riccardo-ciervo",
        "Riccardo Ciervo",
        "RM",
        24,
        70,
        72,
        1.4
      ],
      [
        "andrea-ghion",
        "Andrea Ghion",
        "CM",
        26,
        70,
        72,
        1.8
      ],
      [
        "cas-odenthal",
        "Cas Odenthal",
        "CB",
        25,
        70,
        74,
        1.9
      ],
      [
        "vasilije-adzic",
        "Vasilije Adžić",
        "CAM",
        20,
        69,
        79,
        1.7
      ],
      [
        "rafael-obrador-burguera",
        "Rafael Obrador Burguera",
        "LB",
        22,
        69,
        77,
        3
      ],
      [
        "luca-lipani",
        "Luca Lipani",
        "CM",
        21,
        69,
        77,
        1.7
      ],
      [
        "yeferson-paz-blandon",
        "Yeferson Paz Blandón",
        "RB",
        24,
        67,
        74,
        1.8
      ],
      [
        "edoardo-pieragnolo",
        "Edoardo Pieragnolo",
        "LB",
        23,
        67,
        71,
        1.4
      ],
      [
        "kieron-tom-bowie",
        "Kieron Tom Bowie",
        "ST",
        23,
        67,
        73,
        1.3
      ],
      [
        "fabrizio-caligara",
        "Fabrizio Caligara",
        "CM",
        26,
        67,
        71,
        1.4
      ],
      [
        "edoardo-iannoni",
        "Edoardo Iannoni",
        "CM",
        25,
        67,
        72,
        1.5
      ],
      [
        "filippo-missori",
        "Filippo Missori",
        "RB",
        22,
        67,
        73,
        1
      ],
      [
        "darryl-bakola",
        "Darryl Bakola",
        "CAM",
        18,
        66,
        80,
        1.2
      ]
    ]
  },
  {
    "id": "tor",
    "name": "Torino",
    "color": "#8B1220",
    "budget": 12,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "nikola-vlasic",
        "Nikola Vlašić",
        "CAM",
        28,
        80,
        80,
        19
      ],
      [
        "duvan-esteban-zapata-banguero",
        "Duván Esteban Zapata Banguero",
        "ST",
        35,
        79,
        82,
        15
      ],
      [
        "giovanni-pablo-simeone-baldini",
        "Giovanni Pablo Simeone Baldini",
        "ST",
        31,
        77,
        77,
        5.5
      ],
      [
        "che-zach-everton-fred-adams",
        "Ché Zach Everton Fred Adams",
        "ST",
        30,
        77,
        77,
        11
      ],
      [
        "saul-basilio-coco-bassey-oubina",
        "Saúl Basilio Coco Bassey Oubiña",
        "CB",
        27,
        76,
        79,
        8.5
      ],
      [
        "cristiano-biraghi",
        "Cristiano Biraghi",
        "LB",
        34,
        75,
        78,
        9.5
      ],
      [
        "ivan-ilic",
        "Ivan Ilić",
        "CM",
        25,
        75,
        81,
        12
      ],
      [
        "ardian-ismajli",
        "Ardian Ismajli",
        "CB",
        29,
        75,
        75,
        3.6
      ],
      [
        "cesare-casadei",
        "Cesare Casadei",
        "CM",
        23,
        75,
        83,
        9.5
      ],
      [
        "pietro-comuzzo",
        "Pietro Comuzzo",
        "CB",
        21,
        75,
        86,
        9.5
      ],
      [
        "franco-israel-wibmer",
        "Franco Israel Wibmer",
        "GK",
        26,
        74,
        80,
        6.5
      ],
      [
        "alberto-andrea-paleari",
        "Alberto Andrea Paleari",
        "GK",
        34,
        74,
        74,
        0.6
      ],
      [
        "zakaria-aboukhlal",
        "Zakaria Aboukhlal",
        "CAM",
        26,
        74,
        79,
        6
      ],
      [
        "marcus-holmgren-pedersen",
        "Marcus Holmgren Pedersen",
        "RB",
        26,
        73,
        75,
        3
      ],
      [
        "eray-ervin-comert",
        "Eray Ervin Cömert",
        "CB",
        28,
        73,
        74,
        2.5
      ],
      [
        "gaetano-pio-oristanio",
        "Gaetano Pio Oristanio",
        "CAM",
        23,
        73,
        80,
        7
      ],
      [
        "gvidas-gineitis",
        "Gvidas Gineitis",
        "CM",
        22,
        72,
        79,
        2.7
      ],
      [
        "kian-fitz-jim",
        "Kian Fitz-Jim",
        "CM",
        23,
        71,
        82,
        7
      ],
      [
        "emirhan-ilkhan",
        "Emirhan İlkhan",
        "CM",
        22,
        70,
        74,
        1.1
      ],
      [
        "sandro-kulenovic",
        "Sandro Kulenović",
        "ST",
        26,
        70,
        72,
        1.9
      ],
      [
        "faustino-adebola-rasheed-anjorin",
        "Faustino Adebola Rasheed Anjorin",
        "CM",
        24,
        68,
        75,
        2.4
      ],
      [
        "pietro-pellegri",
        "Pietro Pellegri",
        "ST",
        25,
        68,
        73,
        1.8
      ],
      [
        "niccolo-fortini",
        "Niccolò Fortini",
        "LB",
        20,
        67,
        80,
        2.4
      ],
      [
        "alessio-cacciamani",
        "Alessio Cacciamani",
        "LB",
        19,
        66,
        71,
        0.325
      ],
      [
        "diego-mascardi",
        "Diego Mascardi",
        "GK",
        19,
        65,
        69,
        0.325
      ],
      [
        "marco-dalla-vecchia",
        "Marco Dalla Vecchia",
        "CM",
        21,
        65,
        75,
        0.775
      ],
      [
        "ali-bina-dembele",
        "Ali Bina Dembélé",
        "CB",
        22,
        65,
        73,
        0.85
      ],
      [
        "alieu-eybi-njie",
        "Alieu Eybi Njie",
        "ST",
        21,
        65,
        77,
        1.7
      ],
      [
        "aaron-ciammaglichella",
        "Aaron Ciammaglichella",
        "CM",
        21,
        62,
        79,
        1
      ]
    ]
  },
  {
    "id": "udi",
    "name": "Udinese",
    "color": "#000000",
    "budget": 8,
    "preferredFormation": "4-3-3",
    "players": [
      [
        "oumar-mickael-solet-bomawoko",
        "Oumar Mickael Solet Bomawoko",
        "CB",
        26,
        78,
        83,
        19
      ],
      [
        "keinan-vincent-joseph-davis",
        "Keinan Vincent Joseph Davis",
        "ST",
        28,
        76,
        76,
        2.5
      ],
      [
        "nicolo-zaniolo",
        "Nicolò Zaniolo",
        "ST",
        27,
        76,
        77,
        9
      ],
      [
        "maduka-emilio-okoye",
        "Maduka Emilio Okoye",
        "GK",
        27,
        76,
        78,
        4.6
      ],
      [
        "mergim-vojvoda",
        "Mërgim Vojvoda",
        "RB",
        31,
        76,
        76,
        4.8
      ],
      [
        "jurgen-peter-ekkelenkamp",
        "Jurgen Peter Ekkelenkamp",
        "CM",
        26,
        75,
        77,
        5.5
      ],
      [
        "jesper-karlstrom",
        "Jesper Karlström",
        "CDM",
        31,
        75,
        75,
        4.7
      ],
      [
        "sandi-lovric",
        "Sandi Lovrić",
        "CM",
        28,
        73,
        75,
        6
      ],
      [
        "christian-kabasele",
        "Christian Kabasele",
        "CB",
        35,
        73,
        73,
        0.75
      ],
      [
        "jakub-piotrowski",
        "Jakub Piotrowski",
        "CM",
        28,
        72,
        72,
        1.6
      ],
      [
        "unai-gomez-etxebarria",
        "Unai Gómez Etxebarria",
        "CAM",
        23,
        72,
        82,
        7
      ],
      [
        "hassane-kamara",
        "Hassane Kamara",
        "LB",
        32,
        72,
        72,
        1.7
      ],
      [
        "alessandro-zanoli",
        "Alessandro Zanoli",
        "RB",
        25,
        72,
        79,
        4.5
      ],
      [
        "giorgi-chakvetadze",
        "Giorgi Chakvetadze",
        "LM",
        27,
        72,
        75,
        5
      ],
      [
        "nicolo-bertola",
        "Nicolò Bertola",
        "CB",
        23,
        72,
        76,
        2.5
      ],
      [
        "oier-zarraga-egana",
        "Oier Zarraga Egaña",
        "CM",
        27,
        71,
        72,
        2.2
      ],
      [
        "lennon-lee-miller",
        "Lennon Lee Miller",
        "CM",
        20,
        70,
        85,
        4.3
      ],
      [
        "rui-manuel-muati-modesto",
        "Rui Manuel Muati Modesto",
        "RB",
        26,
        70,
        70,
        1.7
      ],
      [
        "james-bright-adusei-abankwah",
        "James Bright Adusei Abankwah",
        "CB",
        22,
        69,
        76,
        1.8
      ],
      [
        "enzo-jacques-rodolphe-ebosse",
        "Enzo Jacques Rodolphe Ebosse",
        "CB",
        27,
        69,
        73,
        1.7
      ],
      [
        "saba-goglichidze",
        "Saba Goglichidze",
        "CB",
        22,
        68,
        79,
        2.9
      ],
      [
        "vakoun-issouf-bayo",
        "Vakoun Issouf Bayo",
        "ST",
        29,
        68,
        69,
        1.4
      ],
      [
        "idrissa-gueye",
        "Idrissa Guèye",
        "ST",
        20,
        68,
        83,
        3.7
      ],
      [
        "matteo-palma",
        "Matteo Palma",
        "CB",
        18,
        67,
        82,
        1
      ],
      [
        "branimir-mlacic",
        "Branimir Mlačić",
        "CB",
        19,
        65,
        76,
        0.725
      ],
      [
        "daniele-padelli",
        "Daniele Padelli",
        "GK",
        40,
        65,
        65,
        0.08
      ]
    ]
  }
];

const RAW_BUNDESLIGACLUBS = [
  {
    "id": "1fc",
    "name": "1. FC Heidenheim 1846",
    "color": "#004B93",
    "budget": 8,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "patrick-mainka",
        "Patrick Mainka",
        "CB",
        31,
        76,
        76,
        6
      ],
      [
        "budu-zivzivadze",
        "Budu Zivzivadze",
        "ST",
        32,
        72,
        72,
        2
      ],
      [
        "marnon-thomas-busch",
        "Marnon-Thomas Busch",
        "RB",
        31,
        72,
        72,
        2
      ],
      [
        "mathias-honsak",
        "Mathias Honsak",
        "LM",
        29,
        72,
        74,
        4.2
      ],
      [
        "julian-niehues",
        "Julian Niehues",
        "CDM",
        25,
        72,
        75,
        2
      ],
      [
        "marvin-pieringer",
        "Marvin Pieringer",
        "ST",
        26,
        72,
        76,
        7
      ],
      [
        "jan-schoppner",
        "Jan Schöppner",
        "CDM",
        27,
        72,
        76,
        4.7
      ],
      [
        "jonas-fohrenbach",
        "Jonas Föhrenbach",
        "LB",
        30,
        71,
        71,
        1.6
      ],
      [
        "tim-siersleben",
        "Tim Siersleben",
        "CB",
        26,
        71,
        75,
        2.8
      ],
      [
        "leart-shukri-paqarada",
        "Leart Shukri Paqarada",
        "LB",
        31,
        71,
        72,
        2
      ],
      [
        "frank-feller",
        "Frank Feller",
        "GK",
        22,
        70,
        77,
        2.3
      ],
      [
        "marcel-costly",
        "Marcel Costly",
        "RM",
        30,
        69,
        69,
        0.9
      ],
      [
        "sirlord-calvin-conteh",
        "Sirlord Calvin Conteh",
        "ST",
        30,
        69,
        69,
        1.4
      ],
      [
        "thomas-dahne",
        "Thomas Dähne",
        "GK",
        32,
        69,
        69,
        0.75
      ],
      [
        "oualid-mhamdi",
        "Oualid Mhamdi",
        "RB",
        23,
        69,
        70,
        0.7000000000000001
      ],
      [
        "luca-kerber",
        "Luca Kerber",
        "CM",
        24,
        69,
        77,
        3
      ],
      [
        "christian-joe-conteh",
        "Christian Joe Conteh",
        "RM",
        27,
        68,
        68,
        1
      ],
      [
        "michael-heule",
        "Michael Heule",
        "LB",
        25,
        68,
        68,
        0.47500000000000003
      ],
      [
        "mikkel-kaufmann-srensen",
        "Mikkel Kaufmann Sørensen",
        "ST",
        25,
        68,
        74,
        1.9
      ],
      [
        "paul-hennrich",
        "Paul Hennrich",
        "LM",
        21,
        67,
        76,
        0.9500000000000001
      ],
      [
        "maximilian-breunig",
        "Maximilian Breunig",
        "ST",
        26,
        65,
        73,
        1.8
      ],
      [
        "adam-kolle",
        "Adam Kölle",
        "CB",
        20,
        63,
        74,
        0.5
      ],
      [
        "yannik-wagner",
        "Yannik Wagner",
        "LM",
        19,
        60,
        77,
        0.5750000000000001
      ],
      [
        "paul-tschernuth",
        "Paul Tschernuth",
        "GK",
        24,
        59,
        69,
        0.425
      ]
    ]
  },
  {
    "id": "1fc2",
    "name": "1. FC Köln",
    "color": "#ED1C24",
    "budget": 8,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "marvin-schwabe",
        "Marvin Schwäbe",
        "GK",
        31,
        78,
        78,
        8
      ],
      [
        "said-el-mala",
        "Saïd El Mala",
        "LM",
        20,
        78,
        84,
        3.1
      ],
      [
        "ellyes-joris-skhiri",
        "Ellyes Joris Skhiri",
        "CDM",
        31,
        76,
        80,
        18
      ],
      [
        "ragnar-prince-friedel-ache",
        "Ragnar Prince Friedel Ache",
        "ST",
        28,
        76,
        76,
        3.6
      ],
      [
        "thijs-dallinga",
        "Thijs Dallinga",
        "ST",
        26,
        75,
        81,
        12
      ],
      [
        "gideon-mensah",
        "Gideon Mensah",
        "LB",
        28,
        74,
        75,
        4.5
      ],
      [
        "alessio-daniel-castro-montes",
        "Alessio Daniel Castro-Montes",
        "RM",
        29,
        74,
        77,
        11
      ],
      [
        "tom-krau",
        "Tom Krauß",
        "CDM",
        25,
        74,
        78,
        7
      ],
      [
        "isak-bergmann-johannesson",
        "Ísak Bergmann Jóhannesson",
        "CM",
        23,
        74,
        80,
        6
      ],
      [
        "marius-bulter",
        "Marius Bülter",
        "ST",
        33,
        74,
        76,
        6
      ],
      [
        "sebastian-sraas-sebulonsen",
        "Sebastian Søraas Sebulonsen",
        "RB",
        26,
        74,
        74,
        2.1
      ],
      [
        "gian-luca-waldschmidt",
        "Gian-Luca Waldschmidt",
        "CAM",
        30,
        73,
        73,
        2.3
      ],
      [
        "linton-maina",
        "Linton Maina",
        "LM",
        27,
        73,
        74,
        3.6
      ],
      [
        "ron-robert-zieler",
        "Ron-Robert Zieler",
        "GK",
        37,
        73,
        75,
        0.625
      ],
      [
        "joel-pascal-schmied",
        "Joël Pascal Schmied",
        "CB",
        27,
        72,
        72,
        1.5
      ],
      [
        "jahmai-simpson-pusey",
        "Jahmai Simpson-Pusey",
        "CB",
        20,
        72,
        79,
        2.4
      ],
      [
        "timo-bernd-hubers",
        "Timo Bernd Hübers",
        "CB",
        30,
        72,
        74,
        2.9
      ],
      [
        "jan-uwe-thielmann",
        "Jan Uwe Thielmann",
        "RM",
        24,
        72,
        78,
        3.7
      ],
      [
        "rav-van-den-berg",
        "Rav van den Berg",
        "CB",
        22,
        71,
        81,
        3.3
      ],
      [
        "luka-lochoshvili",
        "Luka Lochoshvili",
        "CB",
        28,
        71,
        72,
        1.6
      ],
      [
        "julian-andreas-pauli",
        "Julian Andreas Pauli",
        "CB",
        21,
        68,
        79,
        1.9
      ],
      [
        "imad-rondic",
        "Imad Rondić",
        "ST",
        27,
        66,
        69,
        1.1
      ],
      [
        "elias-geoffrey-bakatukanda",
        "Elias-Geoffrey Bakatukanda",
        "CB",
        22,
        65,
        75,
        1.8
      ],
      [
        "paul-okon-engstler",
        "Paul Okon-Engstler",
        "CDM",
        21,
        65,
        65,
        0.16
      ],
      [
        "fayssal-harchaoui",
        "Fayssal Harchaoui",
        "CDM",
        20,
        62,
        79,
        0.6
      ],
      [
        "malek-el-mala",
        "Malek El Mala",
        "ST",
        21,
        59,
        71,
        0.55
      ],
      [
        "matthias-kobbing",
        "Matthias Köbbing",
        "GK",
        29,
        56,
        59,
        0.13
      ]
    ]
  },
  {
    "id": "1fc3",
    "name": "1. FC Union Berlin",
    "color": "#EB1923",
    "budget": 9,
    "preferredFormation": "4-3-1-2",
    "players": [
      [
        "frederik-riis-rnnow",
        "Frederik Riis Rønnow",
        "GK",
        34,
        78,
        80,
        11
      ],
      [
        "leopold-querfeld",
        "Leopold Querfeld",
        "CB",
        22,
        77,
        85,
        12
      ],
      [
        "rani-khedira",
        "Rani Khedira",
        "CDM",
        32,
        76,
        76,
        3.9
      ],
      [
        "zeno-van-den-bosch",
        "Zeno Van Den Bosch",
        "CB",
        23,
        75,
        84,
        9
      ],
      [
        "andrej-ilic",
        "Andrej Ilić",
        "ST",
        26,
        75,
        75,
        3.1
      ],
      [
        "christopher-trimmel",
        "Christopher Trimmel",
        "RB",
        39,
        75,
        75,
        1.2
      ],
      [
        "derrick-arthur-kohn",
        "Derrick Arthur Köhn",
        "LB",
        27,
        75,
        76,
        6
      ],
      [
        "aljoscha-kemlein",
        "Aljoscha Kemlein",
        "CM",
        22,
        74,
        78,
        3.5
      ],
      [
        "andras-schafer",
        "András Schäfer",
        "CM",
        27,
        74,
        77,
        5.5
      ],
      [
        "michel-aebischer",
        "Michel Aebischer",
        "CM",
        29,
        74,
        74,
        4.2
      ],
      [
        "josip-juranovic",
        "Josip Juranović",
        "RB",
        31,
        73,
        75,
        4.9
      ],
      [
        "janik-haberer",
        "Janik Haberer",
        "CM",
        32,
        73,
        74,
        3.5
      ],
      [
        "ilyas-ansah",
        "Ilyas Ansah",
        "ST",
        21,
        73,
        80,
        3.1
      ],
      [
        "oliver-jasen-burke",
        "Oliver Jasen Burke",
        "ST",
        29,
        73,
        73,
        3.1
      ],
      [
        "tom-alexander-rothe",
        "Tom Alexander Rothe",
        "LB",
        21,
        73,
        81,
        8
      ],
      [
        "woo-yeong-jeong",
        "Woo-yeong Jeong",
        "CAM",
        26,
        73,
        76,
        4
      ],
      [
        "livan-baha-burcu",
        "Livan Baha Burcu",
        "LM",
        21,
        72,
        78,
        3.5
      ],
      [
        "robert-faxe-skov",
        "Robert Faxe Skov",
        "LB",
        30,
        72,
        74,
        3.7
      ],
      [
        "tim-skarke",
        "Tim Skarke",
        "ST",
        30,
        72,
        73,
        3.1
      ],
      [
        "marvin-friedrich",
        "Marvin Friedrich",
        "CB",
        30,
        72,
        74,
        3.5
      ],
      [
        "stanley-pierre-nsoki",
        "Stanley Pierre Nsoki",
        "CB",
        27,
        71,
        77,
        3.1
      ],
      [
        "emmanuel-delan-junior-latte-lath",
        "Emmanuel Delan Junior Latte Lath",
        "ST",
        27,
        70,
        76,
        4
      ],
      [
        "matheo-raab",
        "Matheo Raab",
        "GK",
        27,
        70,
        74,
        1.7
      ],
      [
        "marin-ljubicic",
        "Marin Ljubičić",
        "ST",
        24,
        69,
        79,
        4.2
      ],
      [
        "carl-klaus",
        "Carl Klaus",
        "GK",
        32,
        68,
        68,
        0.55
      ],
      [
        "andrik-markgraf",
        "Andrik Markgraf",
        "LB",
        20,
        63,
        78,
        1.1
      ],
      [
        "oluwaseun-god-power-osaro-ogbemudia",
        "Oluwaseun God Power Osaro Ogbemudia",
        "CB",
        20,
        63,
        76,
        0.55
      ]
    ]
  },
  {
    "id": "1fs",
    "name": "1. FSV Mainz 05",
    "color": "#C7102E",
    "budget": 15,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "kaishu-sano",
        "Kaishu Sano",
        "CDM",
        25,
        81,
        83,
        23
      ],
      [
        "nadiem-amiri",
        "Nadiem Amiri",
        "CM",
        29,
        80,
        81,
        26
      ],
      [
        "stefan-posch",
        "Stefan Posch",
        "CB",
        29,
        77,
        79,
        16
      ],
      [
        "anthony-caci",
        "Anthony Caci",
        "RB",
        29,
        77,
        78,
        13
      ],
      [
        "paul-nebel",
        "Paul Nebel",
        "CAM",
        23,
        77,
        85,
        29
      ],
      [
        "robin-zentner",
        "Robin Zentner",
        "GK",
        31,
        77,
        78,
        9.5
      ],
      [
        "eric-martel",
        "Eric Martel",
        "CDM",
        24,
        76,
        81,
        11
      ],
      [
        "jae-sung-lee",
        "Jae-sung Lee",
        "CM",
        34,
        76,
        77,
        8.5
      ],
      [
        "phillipp-mwene",
        "Phillipp Mwene",
        "LB",
        32,
        75,
        76,
        5.5
      ],
      [
        "benedict-hollerbach",
        "Benedict Hollerbach",
        "ST",
        25,
        75,
        82,
        16
      ],
      [
        "danny-vieira-da-costa",
        "Danny Vieira da Costa",
        "CB",
        33,
        75,
        75,
        3.8
      ],
      [
        "dominik-kohr",
        "Dominik Kohr",
        "CB",
        32,
        75,
        77,
        7
      ],
      [
        "phillip-tietz",
        "Phillip Tietz",
        "ST",
        29,
        75,
        75,
        6
      ],
      [
        "sheraldo-rudi-becker",
        "Sheraldo Rudi Becker",
        "ST",
        31,
        74,
        75,
        5.5
      ],
      [
        "silas-katompa-mvumpa",
        "Silas Katompa-Mvumpa",
        "ST",
        27,
        73,
        75,
        5
      ],
      [
        "stefan-bell",
        "Stefan Bell",
        "CB",
        35,
        73,
        74,
        2
      ],
      [
        "silvan-dominic-widmer",
        "Silvan Dominic Widmer",
        "RB",
        33,
        73,
        73,
        1.6
      ],
      [
        "andreas-schjlberg-hanche-olsen",
        "Andreas Schjølberg Hanche-Olsen",
        "CB",
        29,
        73,
        77,
        5.5
      ],
      [
        "alexander-schwolow",
        "Alexander Schwolow",
        "GK",
        34,
        73,
        73,
        0.525
      ],
      [
        "lennard-patrick-maloney",
        "Lennard Patrick Maloney",
        "CDM",
        26,
        72,
        74,
        2.6
      ],
      [
        "hyeon-seok-hong",
        "Hyeon-seok Hong",
        "CAM",
        27,
        71,
        75,
        3.8
      ],
      [
        "kacper-potulski",
        "Kacper Potulski",
        "CB",
        18,
        71,
        82,
        1
      ],
      [
        "sota-kawasaki",
        "Sota Kawasaki",
        "CM",
        25,
        71,
        76,
        2.8
      ],
      [
        "marco-richter",
        "Marco Richter",
        "RM",
        28,
        71,
        71,
        1.5
      ],
      [
        "william-bving-wick",
        "William Bøving Wick",
        "ST",
        23,
        71,
        78,
        3.8
      ],
      [
        "ransford-yeboah-konigsdorffer",
        "Ransford Yeboah Königsdörffer",
        "ST",
        25,
        71,
        77,
        3
      ],
      [
        "fabio-gruber",
        "Fabio Gruber",
        "CB",
        24,
        70,
        74,
        1.9
      ]
    ]
  },
  {
    "id": "bay",
    "name": "Bayer 04 Leverkusen",
    "color": "#E32221",
    "budget": 36,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "aleix-garcia-serrano",
        "Aleix García Serrano",
        "CM",
        29,
        84,
        84,
        37
      ],
      [
        "patrik-schick",
        "Patrik Schick",
        "ST",
        30,
        83,
        85,
        54
      ],
      [
        "exequiel-alejandro-palacios",
        "Exequiel Alejandro Palacios",
        "CM",
        27,
        83,
        86,
        52
      ],
      [
        "edmond-faycal-tapsoba",
        "Edmond Fayçal Tapsoba",
        "CB",
        27,
        82,
        83,
        28
      ],
      [
        "ibrahim-maza",
        "Ibrahim Maza",
        "CAM",
        20,
        80,
        84,
        4.4
      ],
      [
        "miguel-gutierrez-ortega",
        "Miguel Gutiérrez Ortega",
        "LB",
        25,
        80,
        85,
        35
      ],
      [
        "facundo-axel-medina",
        "Facundo Axel Medina",
        "CB",
        27,
        79,
        83,
        22
      ],
      [
        "malik-leon-tillman",
        "Malik Leon Tillman",
        "CAM",
        24,
        79,
        87,
        46
      ],
      [
        "robert-andrich",
        "Robert Andrich",
        "CB",
        31,
        78,
        81,
        22
      ],
      [
        "afonso-bastardo-moreira",
        "Afonso Bastardo Moreira",
        "LM",
        21,
        78,
        78,
        2.2
      ],
      [
        "nathan-adewale-temitayo-tella",
        "Nathan Adewale Temitayo Tella",
        "RM",
        27,
        78,
        79,
        17
      ],
      [
        "martin-terrier",
        "Martin Terrier",
        "CAM",
        29,
        77,
        79,
        18
      ],
      [
        "loic-bade",
        "Loïc Badé",
        "CB",
        26,
        77,
        84,
        20
      ],
      [
        "mark-flekken",
        "Mark Flekken",
        "GK",
        33,
        77,
        78,
        7
      ],
      [
        "christian-michel-kofane",
        "Christian Michel Kofane",
        "ST",
        20,
        77,
        84,
        3.1
      ],
      [
        "jarell-amorin-quansah",
        "Jarell Amorin Quansah",
        "CB",
        23,
        77,
        83,
        12
      ],
      [
        "victor-okoh-boniface",
        "Victor Okoh Boniface",
        "ST",
        25,
        76,
        85,
        38
      ],
      [
        "ernest-poku",
        "Ernest Poku",
        "RM",
        22,
        76,
        80,
        3.6
      ],
      [
        "jonas-hofmann",
        "Jonas Hofmann",
        "CAM",
        34,
        76,
        78,
        11
      ],
      [
        "ignacio-ezequiel-agustin-fernandez-carballo",
        "Ignacio Ezequiél Agustín Fernández Carballo",
        "CDM",
        24,
        75,
        83,
        12
      ],
      [
        "janis-jonathan-blaswich",
        "Janis Jonathan Blaswich",
        "GK",
        35,
        74,
        74,
        0.525
      ],
      [
        "lucas-vazquez-iglesias",
        "Lucas Vázquez Iglesias",
        "RB",
        35,
        74,
        77,
        3.9
      ],
      [
        "eliesse-ben-seghir",
        "Eliesse Ben Seghir",
        "CAM",
        21,
        74,
        85,
        17
      ],
      [
        "arthur-augusto-de-matos-soares",
        "Arthur Augusto de Matos Soares",
        "RM",
        23,
        73,
        80,
        4
      ],
      [
        "tim-oermann",
        "Tim Oermann",
        "CB",
        22,
        72,
        80,
        4.9
      ],
      [
        "jeanuel-belocian",
        "Jeanuël Belocian",
        "CB",
        21,
        71,
        82,
        3.6
      ],
      [
        "axel-tape-kobrissa",
        "Axel Tape-Kobrissa",
        "CB",
        19,
        67,
        82,
        1.7
      ],
      [
        "niklas-lomb",
        "Niklas Lomb",
        "GK",
        33,
        66,
        66,
        0.45
      ]
    ]
  },
  {
    "id": "bor",
    "name": "Borussia Dortmund",
    "color": "#FDE100",
    "budget": 46,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "nico-cedric-schlotterbeck",
        "Nico Cedric Schlotterbeck",
        "CB",
        26,
        87,
        88,
        64
      ],
      [
        "gregor-kobel",
        "Gregor Kobel",
        "GK",
        28,
        87,
        89,
        67
      ],
      [
        "serhou-yadaly-guirassy",
        "Serhou Yadaly Guirassy",
        "ST",
        30,
        85,
        87,
        80
      ],
      [
        "felix-kalu-nmecha",
        "Felix Kalu Nmecha",
        "CM",
        25,
        85,
        86,
        40
      ],
      [
        "waldemar-anton",
        "Waldemar Anton -",
        "CB",
        30,
        84,
        84,
        27
      ],
      [
        "joey-veerman",
        "Joey Veerman",
        "CM",
        27,
        82,
        82,
        22
      ],
      [
        "julian-ryerson",
        "Julian Ryerson",
        "RB",
        28,
        82,
        82,
        19
      ],
      [
        "emre-can",
        "Emre Can",
        "CB",
        32,
        81,
        82,
        21
      ],
      [
        "marcel-sabitzer",
        "Marcel Sabitzer",
        "CM",
        32,
        81,
        81,
        15
      ],
      [
        "maximilian-beier",
        "Maximilian Beier",
        "CAM",
        23,
        81,
        84,
        28
      ],
      [
        "daniel-svensson",
        "Daniel Svensson",
        "LB",
        24,
        79,
        82,
        15
      ],
      [
        "ramy-bensebaini",
        "Ramy Bensebaini",
        "CB",
        31,
        79,
        79,
        15
      ],
      [
        "giannis-konstantelias",
        "Giannis Konstantelias",
        "CAM",
        23,
        79,
        84,
        22
      ],
      [
        "carney-chibueze-chukwuemeka",
        "Carney Chibueze Chukwuemeka",
        "CAM",
        22,
        78,
        84,
        17
      ],
      [
        "fabio-daniel-soares-silva",
        "Fábio Daniel Soares Silva",
        "ST",
        24,
        78,
        85,
        29
      ],
      [
        "jobe-samuel-patrick-bellingham",
        "Jobe Samuel Patrick Bellingham",
        "CM",
        20,
        77,
        85,
        9
      ],
      [
        "konstantinos-karetsas",
        "Konstantinos Karetsas",
        "CAM",
        18,
        76,
        86,
        4
      ],
      [
        "alexander-niklas-meyer-schade",
        "Alexander Niklas Meyer-Schade",
        "GK",
        35,
        74,
        75,
        0.9500000000000001
      ],
      [
        "patrick-drewes",
        "Patrick Drewes",
        "GK",
        33,
        71,
        71,
        0.925
      ],
      [
        "kouakou-henry-joane-aaron-aimerick-gadou",
        "Kouakou Henry-Joane Aaron Aimerick Gadou",
        "CB",
        19,
        68,
        85,
        2
      ],
      [
        "justin-armando-lerma-soliz",
        "Justin Armando Lerma Soliz",
        "CAM",
        18,
        66,
        85,
        1.8
      ],
      [
        "filippo-calixte-mane",
        "Filippo Calixte Mané",
        "CB",
        21,
        65,
        79,
        0.975
      ],
      [
        "silas-ostrzinski",
        "Silas Ostrzinski",
        "GK",
        22,
        63,
        77,
        1
      ]
    ]
  },
  {
    "id": "bor2",
    "name": "Borussia Mönchengladbach",
    "color": "#000000",
    "budget": 13,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "tim-kleindienst",
        "Tim Kleindienst",
        "ST",
        31,
        80,
        81,
        26
      ],
      [
        "moritz-nicolas",
        "Moritz Nicolas",
        "GK",
        28,
        79,
        79,
        5
      ],
      [
        "franck-honorat",
        "Franck Honorat",
        "RM",
        30,
        78,
        80,
        21
      ],
      [
        "robin-hack",
        "Robin Hack",
        "LM",
        28,
        77,
        77,
        12
      ],
      [
        "kevin-diks-bakarbessy",
        "Kevin Diks Bakarbessy",
        "CB",
        29,
        77,
        77,
        4
      ],
      [
        "ko-itakura",
        "Ko Itakura",
        "CB",
        29,
        76,
        78,
        10
      ],
      [
        "daniel-batz",
        "Daniel Batz",
        "GK",
        35,
        75,
        75,
        0.21
      ],
      [
        "philipp-sander",
        "Philipp Sander",
        "CB",
        28,
        75,
        76,
        6
      ],
      [
        "jens-castrop",
        "Jens Castrop",
        "LM",
        23,
        75,
        79,
        3.6
      ],
      [
        "kevin-stoger",
        "Kevin Stöger",
        "CAM",
        33,
        74,
        76,
        6
      ],
      [
        "joseph-michael-scally",
        "Joseph Michael Scally",
        "RB",
        23,
        74,
        78,
        5.5
      ],
      [
        "enzo-leopold",
        "Enzo Leopold",
        "CM",
        26,
        74,
        77,
        4.3
      ],
      [
        "isac-alexi-sivert-lidberg",
        "Isac Alexi Sivert Lidberg",
        "ST",
        28,
        73,
        74,
        3.6
      ],
      [
        "yukhym-konoplya",
        "Yukhym Konoplya",
        "RB",
        27,
        73,
        75,
        2.9
      ],
      [
        "florian-christian-neuhaus",
        "Florian Christian Neuhaus",
        "CM",
        29,
        73,
        75,
        5.5
      ],
      [
        "hugo-bolin",
        "Hugo Bolin",
        "LM",
        23,
        72,
        76,
        2.6
      ],
      [
        "lukas-ullrich",
        "Lukas Ullrich",
        "LB",
        22,
        72,
        82,
        9
      ],
      [
        "shuto-machino",
        "Shuto Machino",
        "ST",
        26,
        72,
        78,
        7.5
      ],
      [
        "tomas-cvancara",
        "Tomáš Čvančara",
        "ST",
        26,
        71,
        76,
        3.4
      ],
      [
        "david-herold",
        "David Herold",
        "LB",
        23,
        71,
        76,
        2.6
      ],
      [
        "fabio-cristian-chiarodia",
        "Fabio Cristian Chiarodia",
        "CB",
        21,
        70,
        79,
        2.5
      ],
      [
        "daiki-hashioka",
        "Daiki Hashioka",
        "RB",
        27,
        70,
        73,
        1.9
      ],
      [
        "jan-jakob-olschowsky",
        "Jan Jakob Olschowsky",
        "GK",
        24,
        67,
        75,
        2.1
      ],
      [
        "tobias-sippel",
        "Tobias Sippel",
        "GK",
        38,
        64,
        66,
        0.09
      ]
    ]
  },
  {
    "id": "ein",
    "name": "Eintracht Frankfurt",
    "color": "#E1000F",
    "budget": 27,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "jonathan-michael-burkardt",
        "Jonathan Michael Burkardt",
        "ST",
        26,
        82,
        85,
        42
      ],
      [
        "ritsu-doan",
        "Ritsu Doan",
        "RM",
        28,
        80,
        82,
        33
      ],
      [
        "robin-leon-koch",
        "Robin Leon Koch",
        "CB",
        30,
        79,
        82,
        27
      ],
      [
        "arthur-nicolas-theate",
        "Arthur Nicolas Theate",
        "CB",
        26,
        78,
        84,
        27
      ],
      [
        "can-ylmaz-uzun",
        "Can Yılmaz Uzun",
        "CAM",
        20,
        78,
        83,
        9
      ],
      [
        "raphael-onyedika-nwadike",
        "Raphael Onyedika Nwadike",
        "CDM",
        25,
        78,
        84,
        20
      ],
      [
        "hugo-emanuel-larsson",
        "Hugo Emanuel Larsson",
        "CM",
        22,
        77,
        87,
        32
      ],
      [
        "mario-gotze",
        "Mario Götze",
        "CM",
        34,
        77,
        82,
        19
      ],
      [
        "fares-chaibi",
        "Farès Chaïbi",
        "CAM",
        23,
        76,
        81,
        8.5
      ],
      [
        "ansgar-knauff",
        "Ansgar Knauff",
        "LM",
        24,
        76,
        81,
        15
      ],
      [
        "sepe-elye-wahi",
        "Sepe Elye Wahi",
        "ST",
        23,
        76,
        82,
        12
      ],
      [
        "jean-matteo-bahoya-negoce",
        "Jean-Mattéo Bahoya Négoce",
        "LM",
        21,
        76,
        86,
        13
      ],
      [
        "michael-zetterer",
        "Michael Zetterer",
        "GK",
        31,
        75,
        77,
        6
      ],
      [
        "oscar-winther-hjlund",
        "Oscar Winther Højlund",
        "CM",
        21,
        74,
        83,
        5
      ],
      [
        "pharrell-nnamdi-collins",
        "Pharrell Nnamdi Collins",
        "CB",
        22,
        74,
        84,
        9
      ],
      [
        "niels-patrick-nkounkou",
        "Niels Patrick Nkounkou",
        "LM",
        25,
        72,
        78,
        3.5
      ],
      [
        "noel-aseko-nkili",
        "Noël Aséko-Nkili",
        "CM",
        20,
        72,
        79,
        0.975
      ],
      [
        "ayoube-amaimouni-echghouyab",
        "Ayoube Amaimouni-Echghouyab",
        "RM",
        21,
        72,
        72,
        1.1
      ],
      [
        "elias-niklas-baum",
        "Elias Niklas Baum",
        "RB",
        20,
        71,
        84,
        5.5
      ],
      [
        "kaua-morais-vieira-dos-santos",
        "Kauã Morais Vieira dos Santos",
        "GK",
        23,
        71,
        82,
        3.6
      ],
      [
        "younes-ebnoutalib",
        "Younes Ebnoutalib",
        "ST",
        23,
        70,
        70,
        0.9
      ],
      [
        "keita-kosugi",
        "Keita Kosugi",
        "LB",
        20,
        69,
        80,
        3.3
      ],
      [
        "ngankam-jessic-gaitan-ngankam",
        "Ngankam Jessic Gaïtan Ngankam",
        "ST",
        26,
        68,
        74,
        2.1
      ],
      [
        "paul-love-arrhov",
        "Paul Love Arrhov",
        "CAM",
        18,
        65,
        77,
        0.9
      ],
      [
        "timothy-chandler",
        "Timothy Chandler",
        "RB",
        36,
        63,
        64,
        0.18
      ],
      [
        "otavio-manoel-galdino-fernandes",
        "Otávio Manoel Galdino Fernandes",
        "CB",
        20,
        63,
        71,
        0.45
      ],
      [
        "jens-grahl",
        "Jens Grahl",
        "GK",
        37,
        63,
        64,
        0.06
      ],
      [
        "amil-siljevic",
        "Amil Siljevic",
        "GK",
        19,
        60,
        76,
        0.45
      ],
      [
        "julian-yao-mawuli-etse",
        "Julian Yao Mawuli Etse",
        "CB",
        20,
        59,
        69,
        0.4
      ]
    ]
  },
  {
    "id": "fca",
    "name": "FC Augsburg",
    "color": "#BA3733",
    "budget": 10,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "alexis-claude-maurice",
        "Alexis Claude-Maurice",
        "CAM",
        28,
        77,
        78,
        12
      ],
      [
        "chrislain-iris-aurel-matsima",
        "Chrislain Iris Aurel Matsima",
        "CB",
        24,
        77,
        85,
        22
      ],
      [
        "michael-gregoritsch",
        "Michael Gregoritsch",
        "ST",
        32,
        76,
        76,
        4.8
      ],
      [
        "jeffrey-gouweleeuw",
        "Jeffrey Gouweleeuw",
        "CB",
        35,
        76,
        77,
        5
      ],
      [
        "keven-schlotterbeck",
        "Keven Schlotterbeck",
        "CB",
        29,
        76,
        78,
        7.5
      ],
      [
        "finn-gilbert-dahmen",
        "Finn Gilbert Dahmen",
        "GK",
        28,
        76,
        79,
        9.5
      ],
      [
        "fabian-rieder",
        "Fabian Rieder",
        "CAM",
        24,
        76,
        82,
        9.5
      ],
      [
        "han-noah-massengo",
        "Han-Noah Massengo",
        "CDM",
        25,
        76,
        78,
        3.4
      ],
      [
        "anton-kade",
        "Anton Kade",
        "RM",
        22,
        76,
        79,
        3.6
      ],
      [
        "robin-fellhauer",
        "Robin Fellhauer",
        "RM",
        28,
        75,
        75,
        3.3
      ],
      [
        "kristijan-jakic",
        "Kristijan Jakić",
        "CDM",
        29,
        75,
        76,
        6.5
      ],
      [
        "hennes-behrens",
        "Hennes Behrens",
        "LB",
        21,
        73,
        73,
        0.8250000000000001
      ],
      [
        "nathanael-mbuku",
        "Nathanaël Mbuku",
        "RM",
        24,
        73,
        76,
        2.5
      ],
      [
        "mert-komur",
        "Mert Kömür",
        "CAM",
        21,
        73,
        82,
        2.9
      ],
      [
        "marius-wolf",
        "Marius Wolf",
        "RB",
        31,
        73,
        75,
        4.8
      ],
      [
        "nediljko-labrovic",
        "Nediljko Labrović",
        "GK",
        26,
        72,
        76,
        3.1
      ],
      [
        "noahkai-dominic-banks",
        "Noahkai Dominic Banks",
        "CB",
        19,
        72,
        78,
        1.9
      ],
      [
        "calvin-marc-brackelmann",
        "Calvin Marc Brackelmann",
        "CB",
        27,
        71,
        75,
        2.1
      ],
      [
        "yannik-keitel",
        "Yannik Keitel",
        "CDM",
        26,
        70,
        76,
        2.5
      ],
      [
        "steve-michel-mounie",
        "Steve Michel Mounié",
        "ST",
        31,
        70,
        73,
        3
      ],
      [
        "rodrigo-duarte-ribeiro",
        "Rodrigo Duarte Ribeiro",
        "ST",
        21,
        69,
        79,
        2.7
      ],
      [
        "tim-breithaupt",
        "Tim Breithaupt",
        "CDM",
        24,
        68,
        76,
        2.6
      ],
      [
        "uchenna-ogundu",
        "Uchenna Ogundu",
        "ST",
        20,
        66,
        75,
        0.775
      ],
      [
        "klaus-sima-suso",
        "Klaus Sima Suso",
        "CDM",
        21,
        66,
        74,
        0.525
      ],
      [
        "thomas-kastanaras",
        "Thomas Kastanaras",
        "ST",
        23,
        63,
        74,
        1.1
      ],
      [
        "mahmut-kucuksahin",
        "Mahmut Kücüksahin",
        "CDM",
        22,
        60,
        72,
        0.5750000000000001
      ]
    ]
  },
  {
    "id": "fcb2",
    "name": "FC Bayern München",
    "color": "#DC052D",
    "budget": 75,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "michael-akpovie-olise",
        "Michael Akpovie Olise",
        "RM",
        24,
        90,
        90,
        88
      ],
      [
        "harry-edward-kane",
        "Harry Edward Kane",
        "ST",
        33,
        90,
        90,
        87
      ],
      [
        "luis-fernando-diaz-marulanda",
        "Luis Fernando Díaz Marulanda",
        "LM",
        29,
        88,
        88,
        55
      ],
      [
        "joshua-walter-kimmich",
        "Joshua Walter Kimmich",
        "CDM",
        31,
        88,
        89,
        86
      ],
      [
        "dayotchanculle-oswald-upamecano",
        "Dayotchanculle Oswald Upamecano",
        "CB",
        27,
        87,
        88,
        63
      ],
      [
        "jonathan-glao-tah",
        "Jonathan Glao Tah",
        "CB",
        30,
        87,
        87,
        67
      ],
      [
        "jamal-musiala",
        "Jamal Musiala",
        "CAM",
        23,
        87,
        92,
        134
      ],
      [
        "konrad-laimer",
        "Konrad Laimer",
        "RB",
        29,
        85,
        85,
        28
      ],
      [
        "min-jae-kim",
        "Min-jae Kim",
        "CB",
        29,
        83,
        83,
        29
      ],
      [
        "serge-david-gnabry",
        "Serge David Gnabry",
        "CAM",
        31,
        83,
        83,
        30
      ],
      [
        "aleksandar-pavlovic",
        "Aleksandar Pavlović",
        "CDM",
        22,
        83,
        87,
        37
      ],
      [
        "ismael-saibari-ben-el-basra",
        "Ismael Saibari Ben El Basra",
        "CAM",
        25,
        83,
        84,
        27
      ],
      [
        "alphonso-boyle-davies",
        "Alphonso Boyle Davies",
        "LB",
        25,
        82,
        87,
        54
      ],
      [
        "joao-maria-lobo-alves-palhinha-goncalves",
        "João Maria Lobo Alves Palhinha Gonçalves",
        "CDM",
        31,
        82,
        83,
        31
      ],
      [
        "nathaniel-brown",
        "Nathaniel Brown",
        "LB",
        23,
        81,
        85,
        23
      ],
      [
        "manuel-peter-neuer",
        "Manuel Peter Neuer",
        "GK",
        40,
        81,
        84,
        4.7
      ],
      [
        "josip-stanisic",
        "Josip Stanišić",
        "RB",
        26,
        80,
        82,
        18
      ],
      [
        "jonas-kurt-urbig",
        "Jonas Kurt Urbig",
        "GK",
        23,
        79,
        84,
        8
      ],
      [
        "tom-bischof",
        "Tom Bischof",
        "CM",
        21,
        79,
        86,
        17
      ],
      [
        "hiroki-ito",
        "Hiroki Ito",
        "CB",
        27,
        78,
        82,
        18
      ],
      [
        "lennart-karl",
        "Lennart Karl",
        "RM",
        18,
        77,
        86,
        1.5
      ],
      [
        "bryan-zaragoza-martinez",
        "Bryan Zaragoza Martínez",
        "LM",
        25,
        77,
        83,
        17
      ],
      [
        "arijon-ibrahimovic",
        "Arijon Ibrahimović",
        "LM",
        20,
        75,
        77,
        0.85
      ],
      [
        "sacha-boey",
        "Sacha Boey",
        "RB",
        26,
        75,
        80,
        14
      ],
      [
        "sven-ulreich",
        "Sven Ulreich",
        "GK",
        38,
        73,
        73,
        0.35000000000000003
      ],
      [
        "david-michael-santos-daiber",
        "David Michael Santos Daiber",
        "CDM",
        19,
        59,
        79,
        0.6
      ]
    ]
  },
  {
    "id": "fcs",
    "name": "FC St. Pauli",
    "color": "#8B4513",
    "budget": 8,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "eric-anders-smith",
        "Eric Anders Smith",
        "CB",
        29,
        74,
        76,
        5.5
      ],
      [
        "joel-chima-fujita",
        "Joel Chima Fujita",
        "CAM",
        24,
        73,
        76,
        2.8
      ],
      [
        "mathias-knutsen-rasmussen",
        "Mathias Knutsen Rasmussen",
        "CM",
        28,
        73,
        73,
        2
      ],
      [
        "mathias-pereira-lage",
        "Mathias Pereira Lage",
        "ST",
        29,
        72,
        75,
        5.5
      ],
      [
        "martijn-kaars",
        "Martijn Kaars",
        "ST",
        27,
        72,
        73,
        2.4
      ],
      [
        "branimir-hrgota",
        "Branimir Hrgota",
        "CAM",
        33,
        71,
        71,
        1.5
      ],
      [
        "arkadiusz-pyrka",
        "Arkadiusz Pyrka",
        "RB",
        23,
        70,
        75,
        2.3
      ],
      [
        "marcus-klingenberg-mathisen",
        "Marcus Klingenberg Mathisen",
        "CB",
        30,
        70,
        73,
        2.2
      ],
      [
        "adam-dzwigaa",
        "Adam Dźwigała",
        "CB",
        30,
        69,
        69,
        1
      ],
      [
        "david-nemeth",
        "David Nemeth",
        "CB",
        25,
        69,
        75,
        2.4
      ],
      [
        "dimitar-mitov",
        "Dimitar Mitov",
        "GK",
        29,
        69,
        73,
        1.5
      ],
      [
        "louis-oppie",
        "Louis Oppie",
        "LB",
        24,
        69,
        74,
        1.8
      ],
      [
        "ricky-jade-jones",
        "Ricky-Jade Jones",
        "ST",
        23,
        68,
        72,
        1.5
      ],
      [
        "lars-ritzka",
        "Lars Ritzka",
        "LB",
        28,
        68,
        70,
        1.5
      ],
      [
        "connor-isaac-metcalfe",
        "Connor Isaac Metcalfe",
        "CM",
        26,
        68,
        73,
        1.9
      ],
      [
        "abdoulie-ceesay",
        "Abdoulie Ceesay",
        "ST",
        22,
        67,
        75,
        1.6
      ],
      [
        "ben-alexander-voll",
        "Ben Alexander Voll",
        "GK",
        25,
        67,
        72,
        1.2
      ],
      [
        "erik-melker-ahlstrand",
        "Erik Melker Ahlstrand",
        "RM",
        24,
        65,
        71,
        1.1
      ],
      [
        "scott-brian-banks",
        "Scott Brian Banks",
        "RM",
        24,
        64,
        70,
        0.975
      ],
      [
        "gisli-gottskalk-orarson",
        "Gísli Gottskálk Þórðarson",
        "CDM",
        22,
        64,
        73,
        1.2
      ],
      [
        "samuel-klein",
        "Samuel Klein",
        "CM",
        22,
        63,
        74,
        0.6
      ],
      [
        "simon-emil-spari",
        "Simon Emil Spari",
        "GK",
        24,
        61,
        71,
        0.625
      ],
      [
        "marwin-reiner-ian-schmitz",
        "Marwin Reiner Ian Schmitz",
        "CDM",
        19,
        59,
        79,
        0.6
      ],
      [
        "nick-schmidt",
        "Nick Schmidt",
        "CM",
        19,
        58,
        74,
        0.35000000000000003
      ]
    ]
  },
  {
    "id": "ham",
    "name": "Hamburger SV",
    "color": "#0C1C8C",
    "budget": 8,
    "preferredFormation": "4-3-3",
    "players": [
      [
        "daniel-heuer-fernandes",
        "Daniel Heuer Fernandes",
        "GK",
        33,
        79,
        79,
        2.1
      ],
      [
        "albert-mboyo-sambi-lokonga",
        "Albert Mboyo Sambi Lokonga",
        "CM",
        26,
        77,
        79,
        8
      ],
      [
        "nicolai-remberg",
        "Nicolai Remberg",
        "CDM",
        26,
        75,
        77,
        3.4
      ],
      [
        "sebastiaan-bornauw",
        "Sebastiaan Bornauw",
        "CB",
        27,
        75,
        76,
        4.6
      ],
      [
        "miro-max-maria-muheim",
        "Miro Max Maria Muheim",
        "LB",
        28,
        75,
        76,
        6
      ],
      [
        "nicolas-capaldo-taboas",
        "Nicolás Capaldo Taboas",
        "CB",
        28,
        75,
        75,
        3.6
      ],
      [
        "jordan-torunarigha",
        "Jordan Torunarigha",
        "CB",
        29,
        74,
        75,
        5
      ],
      [
        "jean-luc-mamadou-diarra-dompe",
        "Jean-Luc Mamadou Diarra Dompé",
        "LW",
        31,
        74,
        75,
        5.5
      ],
      [
        "martin-gabriel-belaid-adeline",
        "Martin Gabriel Belaïd Adeline",
        "CM",
        22,
        73,
        76,
        1.6
      ],
      [
        "albert-grnbk-erlykke",
        "Albert Grønbæk Erlykke",
        "CAM",
        25,
        73,
        79,
        6.5
      ],
      [
        "bilal-nadir",
        "Bilal Nadir",
        "CM",
        22,
        73,
        79,
        4.2
      ],
      [
        "terem-igobor-moffi",
        "Terem Igobor Moffi",
        "ST",
        27,
        73,
        78,
        7.5
      ],
      [
        "daniel-elfadli",
        "Daniel Elfadli",
        "CB",
        29,
        72,
        74,
        2.4
      ],
      [
        "rayan-philippe",
        "Rayan Philippe",
        "ST",
        25,
        72,
        77,
        3.6
      ],
      [
        "warmed-omari",
        "Warmed Omari",
        "CB",
        26,
        72,
        77,
        3.8
      ],
      [
        "yussuf-yurary-poulsen",
        "Yussuf Yurary Poulsen",
        "ST",
        32,
        71,
        74,
        3.6
      ],
      [
        "sander-tangvik",
        "Sander Tangvik",
        "GK",
        23,
        71,
        78,
        2.7
      ],
      [
        "bakery-jatta",
        "Bakery Jatta",
        "RM",
        28,
        70,
        70,
        1.5
      ],
      [
        "kofi-jeremy-amoako",
        "Kofi Jeremy Amoako",
        "CDM",
        21,
        69,
        81,
        1.5
      ],
      [
        "immanuel-johannes-pherai",
        "Immanuël-Johannes Pherai",
        "CAM",
        25,
        69,
        75,
        2.2
      ],
      [
        "patson-daka",
        "Patson Daka",
        "ST",
        27,
        68,
        73,
        2.8
      ],
      [
        "emir-sahiti",
        "Emir Sahiti",
        "RW",
        27,
        68,
        72,
        2.2
      ],
      [
        "otto-emerson-stange",
        "Otto Emerson Stange",
        "ST",
        19,
        66,
        82,
        1.1
      ],
      [
        "alexander-rssing-lelesiit",
        "Alexander Røssing-Lelesiit",
        "LW",
        19,
        63,
        80,
        0.675
      ],
      [
        "joel-agyekum",
        "Joel Agyekum",
        "CB",
        21,
        60,
        73,
        0.45
      ],
      [
        "fernando-dickes",
        "Fernando Dickes",
        "GK",
        18,
        57,
        77,
        0.4
      ]
    ]
  },
  {
    "id": "rbl",
    "name": "RB Leipzig",
    "color": "#DD0741",
    "budget": 26,
    "preferredFormation": "4-3-3",
    "players": [
      [
        "vilmos-tamas-orban",
        "Vilmos Tamás Orbán",
        "CB",
        33,
        83,
        84,
        28
      ],
      [
        "david-raum",
        "David Raum",
        "LB",
        28,
        83,
        83,
        32
      ],
      [
        "christoph-baumgartner",
        "Christoph Baumgartner",
        "CAM",
        27,
        82,
        82,
        14
      ],
      [
        "castello-junior-lukeba",
        "Castello Junior Lukeba",
        "CB",
        23,
        81,
        88,
        45
      ],
      [
        "nicolas-seiwald",
        "Nicolas Seiwald",
        "CDM",
        25,
        81,
        84,
        20
      ],
      [
        "bote-ridle-nzuzi-baku",
        "Bote Ridle Nzuzi Baku",
        "RB",
        28,
        79,
        79,
        15
      ],
      [
        "antonio-eromonsele-nordby-nusa",
        "Antonio Eromonsele Nordby Nusa",
        "LW",
        21,
        78,
        88,
        18
      ],
      [
        "benjamin-henrichs",
        "Benjamin Henrichs",
        "RB",
        29,
        78,
        80,
        19
      ],
      [
        "romulo-jose-cardoso-da-cruz",
        "Rômulo José Cardoso da Cruz",
        "ST",
        24,
        78,
        82,
        12
      ],
      [
        "maarten-vandevoordt",
        "Maarten Vandevoordt",
        "GK",
        24,
        78,
        86,
        15
      ],
      [
        "brajan-gruda",
        "Brajan Gruda",
        "CAM",
        22,
        77,
        84,
        9.5
      ],
      [
        "rocco-reitz",
        "Rocco Reitz",
        "CM",
        24,
        77,
        83,
        17
      ],
      [
        "forzan-assan-ouedraogo",
        "Forzan Assan Ouédraogo",
        "CM",
        20,
        76,
        85,
        3.6
      ],
      [
        "arthur-denis-vermeeren",
        "Arthur Denis Vermeeren",
        "CM",
        21,
        76,
        87,
        23
      ],
      [
        "maxime-esteve",
        "Maxime Estève",
        "CB",
        24,
        76,
        82,
        11
      ],
      [
        "saint-cyr-johan-bakayoko",
        "Saint-Cyr Johan Bakayoko",
        "RW",
        23,
        76,
        85,
        29
      ],
      [
        "el-chadaille-bitshiabu",
        "El Chadaille Bitshiabu",
        "CB",
        21,
        75,
        87,
        13
      ],
      [
        "lukas-manuel-klostermann",
        "Lukas Manuel Klostermann",
        "CB",
        30,
        75,
        79,
        13
      ],
      [
        "conrad-harder-weibel-schandorf",
        "Conrad Harder Weibel Schandorf",
        "ST",
        21,
        75,
        85,
        9.5
      ],
      [
        "rjan-haskjold-nyland",
        "Ørjan Håskjold Nyland",
        "GK",
        36,
        74,
        76,
        1.3
      ],
      [
        "ezechiel-banzuzi",
        "Ezechiel Banzuzi",
        "CM",
        21,
        73,
        84,
        3.8
      ],
      [
        "max-finkgrafe",
        "Max Finkgräfe",
        "LB",
        22,
        72,
        80,
        3
      ],
      [
        "tidiam-diadie-stephan-gomis",
        "Tidiam Diadie Stephan Gomis",
        "LM",
        20,
        71,
        85,
        3.1
      ],
      [
        "andrija-maksimovic",
        "Andrija Maksimović",
        "RW",
        19,
        71,
        81,
        4
      ],
      [
        "abdoul-kone",
        "Abdoul Koné",
        "CB",
        21,
        69,
        77,
        1.1
      ],
      [
        "leopold-zingerle",
        "Leopold Zingerle",
        "GK",
        32,
        69,
        69,
        0.75
      ],
      [
        "viggo-gebel",
        "Viggo Gebel",
        "CAM",
        18,
        63,
        81,
        1.2
      ],
      [
        "joyeux-masanka-bungi",
        "Joyeux Masanka Bungi",
        "LM",
        19,
        60,
        79,
        0.8250000000000001
      ]
    ]
  },
  {
    "id": "scf",
    "name": "SC Freiburg",
    "color": "#000000",
    "budget": 12,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "matthias-lukas-ginter",
        "Matthias Lukas Ginter",
        "CB",
        32,
        83,
        83,
        21
      ],
      [
        "noah-atubolu",
        "Noah Atubolu",
        "GK",
        24,
        79,
        83,
        14
      ],
      [
        "vincenzo-grifo",
        "Vincenzo Grifo",
        "LM",
        33,
        79,
        80,
        17
      ],
      [
        "philipp-lienhart",
        "Philipp Lienhart",
        "CB",
        30,
        79,
        80,
        17
      ],
      [
        "jan-niklas-beste",
        "Jan-Niklas Beste",
        "RM",
        27,
        77,
        77,
        8
      ],
      [
        "mio-backhaus",
        "Mio Backhaus",
        "GK",
        22,
        77,
        81,
        2.2
      ],
      [
        "igor-matanovic",
        "Igor Matanović",
        "ST",
        23,
        77,
        79,
        4.2
      ],
      [
        "yuito-suzuki",
        "Yuito Suzuki",
        "CAM",
        24,
        77,
        79,
        4.2
      ],
      [
        "maximilian-eggestein",
        "Maximilian Eggestein",
        "CDM",
        29,
        76,
        76,
        4.9
      ],
      [
        "philipp-treu",
        "Philipp Treu",
        "RB",
        25,
        76,
        79,
        6
      ],
      [
        "christian-gunter",
        "Christian Günter",
        "LB",
        33,
        75,
        77,
        7.5
      ],
      [
        "lukas-kubler",
        "Lukas Kübler",
        "RB",
        34,
        75,
        75,
        3.9
      ],
      [
        "yannik-engelhardt",
        "Yannik Engelhardt",
        "CDM",
        25,
        74,
        75,
        2.2
      ],
      [
        "patrick-osterhage",
        "Patrick Osterhage",
        "CDM",
        26,
        74,
        77,
        6.5
      ],
      [
        "derry-lionel-scherhant",
        "Derry Lionel Scherhant",
        "LM",
        23,
        73,
        77,
        3.2
      ],
      [
        "florian-muller",
        "Florian Müller",
        "GK",
        28,
        73,
        74,
        2.1
      ],
      [
        "maximilian-rosenfelder",
        "Maximilian Rosenfelder",
        "CB",
        23,
        73,
        83,
        9
      ],
      [
        "berkay-yilmaz",
        "Berkay Yilmaz",
        "LB",
        21,
        72,
        77,
        2.5
      ],
      [
        "keisuke-goto",
        "Keisuke Goto",
        "ST",
        21,
        72,
        72,
        0.375
      ],
      [
        "lucas-holer",
        "Lucas Höler",
        "ST",
        32,
        72,
        73,
        3
      ],
      [
        "rihito-yamamoto",
        "Rihito Yamamoto",
        "CM",
        24,
        72,
        72,
        1.4
      ],
      [
        "jordy-makengo-basambundu",
        "Jordy Makengo Basambundu",
        "LB",
        25,
        72,
        77,
        3.3
      ],
      [
        "bruno-ifechukwu-ogbus",
        "Bruno Ifechukwu Ogbus",
        "CB",
        20,
        72,
        76,
        0.55
      ],
      [
        "florent-muslija",
        "Florent Muslija",
        "CAM",
        28,
        72,
        72,
        2.2
      ],
      [
        "anthony-jung",
        "Anthony Jung",
        "CB",
        34,
        70,
        72,
        1.1
      ],
      [
        "cyriaque-kalou-bi-irie",
        "Cyriaque Kalou Bi Irié",
        "RM",
        21,
        70,
        82,
        3.8
      ],
      [
        "jannik-huth",
        "Jannik Huth",
        "GK",
        32,
        69,
        69,
        0.75
      ]
    ]
  },
  {
    "id": "svw",
    "name": "SV Werder Bremen",
    "color": "#1D9053",
    "budget": 15,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "jens-dalsgaard-stage",
        "Jens Dalsgaard Stage",
        "CM",
        29,
        79,
        79,
        14
      ],
      [
        "marco-friedl",
        "Marco Friedl",
        "CB",
        28,
        77,
        79,
        11
      ],
      [
        "mitchell-elijah-weiser",
        "Mitchell-Elijah Weiser",
        "RB",
        32,
        77,
        78,
        10
      ],
      [
        "senne-maaike-lynen",
        "Senne Maaike Lynen",
        "CDM",
        27,
        77,
        79,
        9
      ],
      [
        "amos-pieper",
        "Amos Pieper",
        "CB",
        28,
        76,
        78,
        6.5
      ],
      [
        "niclas-fullkrug",
        "Niclas Füllkrug",
        "ST",
        33,
        76,
        79,
        14
      ],
      [
        "felix-agu",
        "Felix Agu",
        "LB",
        26,
        74,
        78,
        7
      ],
      [
        "samuel-germain-kinduelu-mbangula-tshifunda",
        "Samuel-Germain Kinduelu Mbangula Tshifunda",
        "LM",
        22,
        74,
        84,
        6
      ],
      [
        "karl-jakob-hein",
        "Karl Jakob Hein",
        "GK",
        24,
        73,
        81,
        6
      ],
      [
        "eren-sami-dinkci",
        "Eren Sami Dinkçi",
        "CAM",
        24,
        73,
        80,
        6.5
      ],
      [
        "olivier-deman",
        "Olivier Deman",
        "LB",
        26,
        73,
        74,
        2.3
      ],
      [
        "marco-grull",
        "Marco Grüll",
        "LM",
        28,
        73,
        75,
        6
      ],
      [
        "niklas-stark",
        "Niklas Stark",
        "CB",
        31,
        73,
        75,
        4.6
      ],
      [
        "ivan-san-jose-cantalejo",
        "Iván San José Cantalejo",
        "CAM",
        22,
        72,
        80,
        3
      ],
      [
        "justin-gideon-njinmah",
        "Justin Gideon Njinmah",
        "ST",
        25,
        72,
        80,
        6
      ],
      [
        "cedric-jan-itten",
        "Cédric Jan Itten",
        "ST",
        29,
        72,
        72,
        1.6
      ],
      [
        "alexander-schlager",
        "Alexander Schlager",
        "GK",
        30,
        72,
        75,
        2.5
      ],
      [
        "ludovit-reis",
        "Ludovit Reis",
        "CM",
        26,
        70,
        76,
        4
      ],
      [
        "dawid-igor-kownacki",
        "Dawid Igor Kownacki",
        "ST",
        29,
        70,
        72,
        2.4
      ],
      [
        "julian-malatini",
        "Julián Malatini",
        "CB",
        25,
        69,
        77,
        2.9
      ],
      [
        "oskar-wojcik",
        "Oskar Wójcik",
        "CB",
        23,
        69,
        69,
        0.5750000000000001
      ],
      [
        "skelly-alvero",
        "Skelly Alvero",
        "CDM",
        24,
        68,
        76,
        2.5
      ],
      [
        "keke-maximilian-topp",
        "Keke Maximilian Topp",
        "ST",
        22,
        68,
        80,
        3
      ],
      [
        "markus-kolke",
        "Markus Kolke",
        "GK",
        36,
        67,
        67,
        0.17
      ],
      [
        "dariusz-stalmach",
        "Dariusz Stalmach",
        "CM",
        20,
        66,
        75,
        0.775
      ],
      [
        "patrice-covic",
        "Patrice Čović",
        "CAM",
        19,
        66,
        81,
        1.2
      ],
      [
        "salim-amani-musah",
        "Salim Amani Musah",
        "ST",
        20,
        64,
        78,
        0.85
      ],
      [
        "mick-schmetgens",
        "Mick Schmetgens",
        "CB",
        19,
        59,
        75,
        0.325
      ],
      [
        "stefan-smarkalev",
        "Stefan Smarkalev",
        "GK",
        19,
        59,
        77,
        0.5
      ]
    ]
  },
  {
    "id": "tsg",
    "name": "TSG 1899 Hoffenheim",
    "color": "#1C63B7",
    "budget": 9,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "oliver-baumann",
        "Oliver Baumann",
        "GK",
        36,
        84,
        84,
        4
      ],
      [
        "andrej-kramaric",
        "Andrej Kramarić",
        "CAM",
        35,
        81,
        81,
        12
      ],
      [
        "vladimir-coufal",
        "Vladimír Coufal",
        "RB",
        34,
        80,
        80,
        2.1
      ],
      [
        "leon-avdullahu",
        "Leon Avdullahu",
        "CDM",
        22,
        79,
        79,
        3.4
      ],
      [
        "fisnik-asllani",
        "Fisnik Asllani",
        "ST",
        24,
        79,
        79,
        4.9
      ],
      [
        "wouter-burger",
        "Wouter Burger",
        "CM",
        25,
        78,
        78,
        4.2
      ],
      [
        "ozan-muhammed-kabak",
        "Ozan Muhammed Kabak",
        "CB",
        26,
        78,
        78,
        6.5
      ],
      [
        "tim-lemperle",
        "Tim Lemperle",
        "ST",
        24,
        77,
        81,
        7
      ],
      [
        "patrick-wimmer",
        "Patrick Wimmer",
        "LM",
        25,
        77,
        83,
        17
      ],
      [
        "albian-hajdari",
        "Albian Hajdari",
        "CB",
        23,
        76,
        77,
        3
      ],
      [
        "robin-hranac",
        "Robin Hranáč",
        "CB",
        26,
        76,
        76,
        2.2
      ],
      [
        "adam-hlozek",
        "Adam Hložek",
        "ST",
        24,
        76,
        83,
        17
      ],
      [
        "alexander-prass",
        "Alexander Prass",
        "LB",
        25,
        76,
        77,
        5.5
      ],
      [
        "bernardo-fernandes-da-silva-junior",
        "Bernardo Fernandes da Silva Junior",
        "LB",
        31,
        75,
        75,
        4.6
      ],
      [
        "koki-machida",
        "Koki Machida",
        "CB",
        29,
        75,
        76,
        7
      ],
      [
        "arthur-largura-chaves",
        "Arthur Largura Chaves",
        "CB",
        25,
        75,
        80,
        6
      ],
      [
        "valentin-andre-stanislas-gendrey",
        "Valentin André Stanislas Gendrey",
        "RB",
        26,
        74,
        78,
        5.5
      ],
      [
        "mats-rots",
        "Mats Rots",
        "LB",
        20,
        74,
        79,
        2.5
      ],
      [
        "adam-daghim",
        "Adam Daghim",
        "RM",
        20,
        74,
        78,
        2
      ],
      [
        "dennis-geiger",
        "Dennis Geiger",
        "CDM",
        28,
        71,
        75,
        3.3
      ],
      [
        "nathan-de-cat",
        "Nathan De Cat",
        "CDM",
        18,
        71,
        83,
        1.2
      ],
      [
        "bambase-conte",
        "Bambasé Conté",
        "CAM",
        23,
        70,
        75,
        1.9
      ],
      [
        "max-moerstedt",
        "Max Moerstedt",
        "ST",
        20,
        69,
        81,
        2.4
      ],
      [
        "alessandro-vogt",
        "Alessandro Vogt",
        "ST",
        21,
        69,
        70,
        0.5
      ],
      [
        "cajetan-lenz",
        "Cajetan Lenz",
        "CDM",
        20,
        69,
        72,
        0.55
      ],
      [
        "luca-dante-philipp",
        "Luca Dante Philipp",
        "GK",
        25,
        68,
        72,
        1.4
      ],
      [
        "sean-dulic",
        "Sean Dulic",
        "CB",
        21,
        66,
        76,
        0.9
      ],
      [
        "lukas-blondal-petersson",
        "Lúkas Blöndal Petersson",
        "GK",
        22,
        65,
        69,
        0.47500000000000003
      ],
      [
        "luis-engelns",
        "Luis Engelns",
        "CM",
        19,
        65,
        78,
        1
      ]
    ]
  },
  {
    "id": "vfb",
    "name": "VfB Stuttgart",
    "color": "#E32219",
    "budget": 22,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "deniz-undav",
        "Deniz Undav",
        "ST",
        30,
        85,
        85,
        22
      ],
      [
        "angelo-stiller",
        "Angelo Stiller",
        "CDM",
        25,
        83,
        87,
        48
      ],
      [
        "maximilian-mittelstadt",
        "Maximilian Mittelstädt",
        "LB",
        29,
        83,
        83,
        28
      ],
      [
        "jeffrey-julian-gaston-chabot",
        "Jeffrey Julian Gaston Chabot",
        "CB",
        28,
        81,
        81,
        15
      ],
      [
        "ermedin-demirovic",
        "Ermedin Demirović",
        "ST",
        28,
        80,
        80,
        23
      ],
      [
        "bilal-el-khannouss",
        "Bilal El Khannouss",
        "CAM",
        22,
        78,
        84,
        17
      ],
      [
        "jamie-leweling",
        "Jamie Leweling",
        "RM",
        25,
        78,
        80,
        8.5
      ],
      [
        "chris-jan-fuhrich",
        "Chris Jan Führich",
        "LM",
        28,
        78,
        78,
        11
      ],
      [
        "grischa-promel",
        "Grischa Prömel",
        "CM",
        31,
        77,
        77,
        5.5
      ],
      [
        "ramon-hendriks",
        "Ramon Hendriks",
        "CB",
        25,
        76,
        76,
        2.3
      ],
      [
        "atakan-karazor",
        "Atakan Karazor",
        "CDM",
        29,
        76,
        76,
        6.5
      ],
      [
        "tiago-barreiros-de-melo-tomas",
        "Tiago Barreiros de Melo Tomás",
        "LM",
        24,
        76,
        82,
        12
      ],
      [
        "dzenan-pejcinovic",
        "Dženan Pejčinović",
        "ST",
        21,
        75,
        79,
        1.7
      ],
      [
        "finn-jeltsch",
        "Finn Jeltsch",
        "CB",
        20,
        75,
        87,
        5
      ],
      [
        "lorenz-assignon",
        "Lorenz Assignon",
        "RB",
        26,
        75,
        80,
        9.5
      ],
      [
        "josha-mamadou-karaboue-vagnoman",
        "Josha Mamadou Karaboue Vagnoman",
        "RB",
        25,
        75,
        78,
        5.5
      ],
      [
        "nikolas-terkelsen-nartey",
        "Nikolas Terkelsen Nartey",
        "CAM",
        26,
        74,
        74,
        1.7
      ],
      [
        "jose-maria-andres-baixauli",
        "José María Andrés Baixauli",
        "CDM",
        21,
        74,
        78,
        1.1
      ],
      [
        "badredine-bouanani",
        "Badredine Bouanani",
        "RM",
        21,
        74,
        82,
        11
      ],
      [
        "dan-axel-zagadou",
        "Dan-Axel Zagadou",
        "CB",
        27,
        73,
        78,
        8
      ],
      [
        "leo-sauer",
        "Leo Sauer",
        "LW",
        20,
        73,
        86,
        5.5
      ],
      [
        "luca-antony-jaquez",
        "Luca Antony Jaquez",
        "CB",
        23,
        72,
        78,
        2.9
      ],
      [
        "dennis-seimen",
        "Dennis Seimen",
        "GK",
        20,
        72,
        84,
        2
      ],
      [
        "ameen-al-dakhil",
        "Ameen Al Dakhil",
        "CB",
        24,
        71,
        79,
        4.4
      ],
      [
        "fabian-bredlow",
        "Fabian Bredlow",
        "GK",
        31,
        71,
        71,
        1.2
      ],
      [
        "leonidas-stergiou",
        "Leonidas Stergiou",
        "RB",
        24,
        71,
        79,
        3.9
      ],
      [
        "marius-funk",
        "Marius Funk",
        "GK",
        30,
        68,
        68,
        0.65
      ],
      [
        "stefan-drljaca",
        "Stefan Drljača",
        "GK",
        27,
        66,
        71,
        0.975
      ],
      [
        "justin-diehl",
        "Justin Diehl",
        "LM",
        21,
        66,
        81,
        2.1
      ],
      [
        "jeremy-alberto-arevalo-mera",
        "Jeremy Alberto Arévalo Mera",
        "ST",
        21,
        66,
        79,
        1.1
      ]
    ]
  },
  {
    "id": "vfl",
    "name": "VfL Wolfsburg",
    "color": "#65B32E",
    "budget": 19,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "kamil-mieczysaw-grabara",
        "Kamil Mieczysław Grabara",
        "GK",
        27,
        81,
        84,
        20
      ],
      [
        "mohamed-el-amine-amoura",
        "Mohamed El Amine Amoura",
        "ST",
        26,
        79,
        84,
        30
      ],
      [
        "maximilian-arnold",
        "Maximilian Arnold",
        "CDM",
        32,
        79,
        79,
        13
      ],
      [
        "christian-dannemann-eriksen",
        "Christian Dannemann Eriksen",
        "CAM",
        34,
        77,
        77,
        4.6
      ],
      [
        "joakim-mhle-pedersen",
        "Joakim Mæhle Pedersen",
        "LB",
        29,
        76,
        78,
        13
      ],
      [
        "mattias-olof-svanberg",
        "Mattias Olof Svanberg",
        "CM",
        27,
        76,
        79,
        9.5
      ],
      [
        "denis-vavro",
        "Denis Vavro",
        "CB",
        30,
        76,
        79,
        13
      ],
      [
        "timon-janis-wellenreuther",
        "Timon Janis Wellenreuther",
        "GK",
        30,
        76,
        77,
        6
      ],
      [
        "sael-kumbedi-nseke",
        "Saël Kumbedi Nseke",
        "RB",
        21,
        75,
        80,
        4.9
      ],
      [
        "vinicius-de-souza-costa",
        "Vinicius de Souza Costa",
        "CDM",
        27,
        75,
        79,
        9
      ],
      [
        "fabian-reese",
        "Fabian Reese",
        "LM",
        28,
        75,
        75,
        6
      ],
      [
        "moritz-jenz",
        "Moritz Jenz",
        "CB",
        27,
        74,
        79,
        8.5
      ],
      [
        "hauke-finn-wahl",
        "Hauke Finn Wahl",
        "CB",
        32,
        74,
        74,
        2.9
      ],
      [
        "aaron-zehnter",
        "Aaron Zehnter",
        "LB",
        21,
        74,
        80,
        5
      ],
      [
        "yannick-gerhardt",
        "Yannick Gerhardt",
        "CM",
        32,
        74,
        75,
        4.6
      ],
      [
        "alexander-olof-bernhardsson",
        "Alexander Olof Bernhardsson",
        "RM",
        28,
        73,
        73,
        2.8
      ],
      [
        "elvis-rexhbecaj",
        "Elvis Rexhbeçaj",
        "CM",
        28,
        73,
        75,
        4.8
      ],
      [
        "bence-dardai",
        "Bence Dárdai",
        "CAM",
        20,
        72,
        82,
        5
      ],
      [
        "aster-jan-vranckx",
        "Aster Jan Vranckx",
        "CM",
        23,
        72,
        79,
        6.5
      ],
      [
        "robert-nesta-glatzel",
        "Robert Nesta Glatzel",
        "ST",
        32,
        72,
        73,
        2.6
      ],
      [
        "fraser-david-ingham-hornby",
        "Fraser David Ingham Hornby",
        "ST",
        27,
        72,
        73,
        2.1
      ],
      [
        "kilian-fischer",
        "Kilian Fischer",
        "RB",
        25,
        72,
        77,
        5.5
      ],
      [
        "muhammed-mehmet-damar",
        "Muhammed Mehmet Damar",
        "CAM",
        22,
        72,
        81,
        4.2
      ],
      [
        "jonas-adjei-adjetey",
        "Jonas Adjei Adjetey",
        "CB",
        22,
        70,
        82,
        3.7
      ],
      [
        "rogerio-oliveira-da-silva",
        "Rogério Oliveira da Silva",
        "LB",
        28,
        69,
        74,
        3.2
      ],
      [
        "kento-shiogai",
        "Kento Shiogai",
        "ST",
        21,
        69,
        81,
        2.1
      ],
      [
        "pavao-pervan",
        "Pavao Pervan",
        "GK",
        38,
        69,
        71,
        0.21
      ],
      [
        "alessio-abilio-besio",
        "Alessio Abilio Besio",
        "ST",
        22,
        67,
        69,
        0.45
      ],
      [
        "mathys-angely",
        "Mathys Angély",
        "CB",
        19,
        61,
        79,
        0.775
      ],
      [
        "eryk-artur-grzywacz",
        "Eryk Artur Grzywacz",
        "CDM",
        20,
        60,
        77,
        0.6
      ]
    ]
  }
];

const RAW_LIGUE1CLUBS = [
  {
    "id": "aja",
    "name": "AJ Auxerre",
    "color": "#1D3D8F",
    "budget": 8,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "kevin-danois",
        "Kévin Danois",
        "CM",
        22,
        76,
        82,
        9.5
      ],
      [
        "romain-faivre",
        "Romain Faivre",
        "RM",
        28,
        75,
        76,
        8
      ],
      [
        "sinaly-diomande",
        "Sinaly Diomandé",
        "CB",
        25,
        74,
        77,
        3.9
      ],
      [
        "lamine-sy",
        "Lamine Sy",
        "RB",
        24,
        73,
        75,
        1.8
      ],
      [
        "remy-labeau-lascary",
        "Rémy Labeau Lascary",
        "ST",
        23,
        73,
        79,
        4.8
      ],
      [
        "clement-akpa",
        "Clément Akpa",
        "CB",
        24,
        73,
        80,
        6
      ],
      [
        "daniel-namaso-edi-mesumbe-loader",
        "Daniel Namaso Edi-Mesumbe Loader",
        "LM",
        26,
        73,
        78,
        4.7
      ],
      [
        "bryan-ikemefuna-okoh",
        "Bryan Ikemefuna Okoh",
        "CB",
        23,
        73,
        73,
        1.1
      ],
      [
        "marvin-senaya",
        "Marvin Senaya",
        "RB",
        25,
        72,
        74,
        2
      ],
      [
        "fredrik-oppegard",
        "Fredrik Oppegård",
        "LB",
        24,
        71,
        76,
        2.2
      ],
      [
        "josue-casimir",
        "Josué Casimir",
        "RM",
        24,
        71,
        76,
        2.8
      ],
      [
        "francisco-andres-sierralta-carvallo",
        "Francisco Andrés Sierralta Carvallo",
        "CB",
        29,
        70,
        70,
        1.4
      ],
      [
        "mamadou-diop",
        "Mamadou Diop",
        "GK",
        26,
        70,
        75,
        1.7
      ],
      [
        "arthur-piedfort",
        "Arthur Piedfort",
        "CDM",
        21,
        70,
        78,
        2.5
      ],
      [
        "naouirou-mohamed-ahamada",
        "Naouirou Mohamed Ahamada",
        "CM",
        24,
        70,
        75,
        2.4
      ],
      [
        "thelonius-alston-bradley-bair",
        "Thelonius Alston Bradley Bair",
        "ST",
        27,
        69,
        74,
        2.5
      ],
      [
        "paul-nardi",
        "Paul Nardi",
        "GK",
        32,
        69,
        73,
        1.6
      ],
      [
        "assane-diousse-el-hadji",
        "Assane Dioussé El Hadji",
        "CDM",
        28,
        69,
        70,
        1.4
      ],
      [
        "lasso-coulibaly",
        "Lasso Coulibaly",
        "RM",
        23,
        68,
        76,
        2.7
      ],
      [
        "sekou-fofana",
        "Sékou Fofana",
        "LB",
        23,
        67,
        68,
        0.525
      ],
      [
        "christ-melik-makosso",
        "Christ Melik Makosso",
        "CB",
        22,
        67,
        77,
        2.1
      ],
      [
        "telli-siwe",
        "Telli Siwe",
        "CB",
        21,
        66,
        75,
        0.55
      ],
      [
        "aristide-zossou",
        "Aristide Zossou",
        "LM",
        21,
        63,
        76,
        0.8
      ],
      [
        "eros-horatio-emmanuel-maddy",
        "Eros Horatio Emmanuel Maddy",
        "RM",
        25,
        62,
        68,
        0.725
      ],
      [
        "rayan-mandengue",
        "Rayan Mandengue",
        "LM",
        20,
        62,
        72,
        0.525
      ],
      [
        "louis-mezerette",
        "Louis Mezerette",
        "GK",
        20,
        60,
        74,
        0.45
      ],
      [
        "wei-xiangxin",
        "Wei Xiangxin",
        "ST",
        18,
        60,
        67,
        0.18
      ],
      [
        "elikya-legros",
        "Elikya Legros",
        "CB",
        18,
        59,
        74,
        0.47500000000000003
      ],
      [
        "ryan-rodin",
        "Ryan Rodin",
        "ST",
        20,
        59,
        71,
        0.55
      ],
      [
        "tidiane-devernois",
        "Tidiane Devernois",
        "CM",
        18,
        58,
        75,
        0.5
      ]
    ]
  },
  {
    "id": "asm",
    "name": "AS Monaco",
    "color": "#E51A23",
    "budget": 23,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "denis-lemi-zakaria-lako-lado",
        "Denis Lemi Zakaria Lako Lado",
        "CDM",
        29,
        81,
        83,
        30
      ],
      [
        "folarin-jolaoluwa-jerry-balogun",
        "Folarin Jolaoluwa Jerry Balogun",
        "ST",
        25,
        80,
        82,
        16
      ],
      [
        "lamine-camara",
        "Lamine Camara",
        "CM",
        22,
        80,
        85,
        24
      ],
      [
        "lukas-hradecky",
        "Lukáš Hrádecký",
        "GK",
        36,
        79,
        81,
        2.9
      ],
      [
        "aleksandr-golovin",
        "Aleksandr Golovin",
        "CAM",
        30,
        78,
        79,
        17
      ],
      [
        "jordan-teze",
        "Jordan Teze",
        "RB",
        26,
        78,
        80,
        9.5
      ],
      [
        "philipp-francois-kohn",
        "Philipp François Köhn",
        "GK",
        28,
        77,
        80,
        11
      ],
      [
        "eric-jeremy-edgar-dier",
        "Eric Jeremy Edgar Dier",
        "CB",
        32,
        77,
        79,
        12
      ],
      [
        "jan-thilo-kehrer",
        "Jan Thilo Kehrer",
        "CB",
        29,
        77,
        80,
        17
      ],
      [
        "anssumane-fati-vieira",
        "Anssumane Fati Vieira",
        "LM",
        23,
        77,
        82,
        12
      ],
      [
        "vanderson-de-oliveira-campos",
        "Vanderson de Oliveira Campos",
        "RB",
        25,
        77,
        83,
        16
      ],
      [
        "takumi-minamino",
        "Takumi Minamino",
        "LM",
        31,
        77,
        78,
        14
      ],
      [
        "mika-miles-biereth",
        "Mika Miles Biereth",
        "ST",
        23,
        76,
        85,
        29
      ],
      [
        "matthis-abline",
        "Matthis Abline",
        "ST",
        23,
        76,
        82,
        12
      ],
      [
        "mohamed-salisu-abdul-karim",
        "Mohamed Salisu Abdul Karim",
        "CB",
        27,
        76,
        81,
        10
      ],
      [
        "christian-mawissa-elebi",
        "Christian Mawissa Elebi",
        "CB",
        21,
        75,
        84,
        12
      ],
      [
        "mathys-detourbet",
        "Mathys Detourbet",
        "LM",
        19,
        73,
        80,
        0.725
      ],
      [
        "mamadou-coulibaly-as-monaco",
        "Mamadou Coulibaly",
        "CM",
        22,
        73,
        77,
        1.4
      ],
      [
        "flavio-basilua-jacinto-nazinho",
        "Flávio Basilua Jacinto Nazinho",
        "LB",
        23,
        72,
        77,
        2.2
      ],
      [
        "sadibou-sane",
        "Sadibou Sané",
        "CB",
        22,
        70,
        81,
        3.3
      ],
      [
        "stanis-idumbo-muzambo",
        "Stanis Idumbo Muzambo",
        "LM",
        21,
        68,
        82,
        2.5
      ],
      [
        "edan-diop",
        "Edan Diop",
        "LM",
        22,
        68,
        78,
        2.1
      ],
      [
        "paris-josua-brunner",
        "Paris Josua Brunner",
        "ST",
        20,
        66,
        79,
        2
      ],
      [
        "yann-francois-lienard",
        "Yann François Lienard",
        "GK",
        23,
        65,
        75,
        1.4
      ],
      [
        "jules-stawiecki",
        "Jules Stawiecki",
        "GK",
        19,
        60,
        77,
        0.55
      ]
    ]
  },
  {
    "id": "ang",
    "name": "Angers SCO",
    "color": "#000000",
    "budget": 8,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "jordan-lefort",
        "Jordan Lefort",
        "CB",
        33,
        76,
        76,
        2.1
      ],
      [
        "anthony-lopes",
        "Anthony Lopes",
        "GK",
        35,
        75,
        76,
        1.3
      ],
      [
        "ousmane-camara",
        "Ousmane Camara",
        "CB",
        23,
        75,
        77,
        2.9
      ],
      [
        "haris-belkebla",
        "Haris Belkebla",
        "CDM",
        32,
        75,
        75,
        3
      ],
      [
        "lilian-raolisoa",
        "Lilian Raolisoa",
        "RB",
        26,
        74,
        75,
        2.2
      ],
      [
        "carlens-jean-fedlaire-ruby-arcus",
        "Carlens Jean Fedlaire Ruby Arcus",
        "RB",
        30,
        74,
        74,
        1.6
      ],
      [
        "mohamed-amine-sbai",
        "Mohamed Amine Sbaï",
        "LM",
        25,
        73,
        74,
        1.9
      ],
      [
        "louis-mouton",
        "Louis Mouton",
        "CAM",
        24,
        73,
        78,
        3.5
      ],
      [
        "branco-van-den-boomen",
        "Branco van den Boomen",
        "CM",
        31,
        73,
        73,
        3
      ],
      [
        "jacques-ekomie",
        "Jacques Ekomié",
        "LB",
        23,
        73,
        77,
        2.6
      ],
      [
        "yassin-belkhdim",
        "Yassin Belkhdim",
        "CM",
        24,
        73,
        78,
        3.5
      ],
      [
        "amine-el-ouazzani",
        "Amine El Ouazzani",
        "ST",
        25,
        72,
        78,
        3.8
      ],
      [
        "prosper-peter",
        "Prosper Peter",
        "ST",
        19,
        72,
        78,
        1.1
      ],
      [
        "emmanuel-junior-biumla-bayiha",
        "Emmanuel Junior Biumla Bayiha",
        "CB",
        21,
        70,
        80,
        3.3
      ],
      [
        "jim-emilien-ngowet-allevinah",
        "Jim Émilien Ngowet Allevinah",
        "RM",
        31,
        69,
        72,
        2.3
      ],
      [
        "anthony-bermont",
        "Anthony Bermont",
        "LM",
        21,
        68,
        78,
        2.6
      ],
      [
        "joseph-kalulu-kyatengwa",
        "Joseph Kalulu Kyatengwa",
        "LB",
        21,
        67,
        73,
        0.8250000000000001
      ],
      [
        "marius-louer",
        "Marius Louër",
        "RB",
        19,
        67,
        72,
        0.45
      ],
      [
        "melvin-zinga",
        "Melvin Zinga",
        "GK",
        24,
        66,
        73,
        1.4
      ],
      [
        "oumar-kalifa-pona",
        "Oumar Kalifa Pona",
        "GK",
        20,
        62,
        72,
        0.35000000000000003
      ],
      [
        "h-abdelli",
        "H. Abdelli",
        "CAM",
        25,
        76,
        77,
        9
      ],
      [
        "h-belkebla",
        "H. Belkebla",
        "CDM",
        31,
        74,
        74,
        3
      ]
    ]
  },
  {
    "id": "fcl",
    "name": "FC Lorient",
    "color": "#F97300",
    "budget": 8,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "yvon-landry-mvogo-nganoma",
        "Yvon Landry Mvogo Nganoma",
        "GK",
        32,
        77,
        77,
        4
      ],
      [
        "arsene-kan-guy-kouassi",
        "Arsène Kan Guy Kouassi",
        "LB",
        22,
        77,
        77,
        1.8
      ],
      [
        "montassar-omar-talbi",
        "Montassar Omar Talbi",
        "CB",
        28,
        75,
        76,
        3.5
      ],
      [
        "arthur-avom-ebong",
        "Arthur Avom Ebong",
        "CM",
        21,
        75,
        81,
        4.1
      ],
      [
        "jean-victor-makengo",
        "Jean-Victor Makengo",
        "CAM",
        28,
        74,
        74,
        1.6
      ],
      [
        "theo-le-bris",
        "Théo Le Bris",
        "RM",
        23,
        74,
        79,
        3.1
      ],
      [
        "noah-cadiou",
        "Noah Cadiou",
        "CM",
        27,
        74,
        75,
        2.1
      ],
      [
        "oluwatosin-aiyegun",
        "Oluwatosin Aiyegun",
        "ST",
        28,
        72,
        72,
        2.2
      ],
      [
        "alec-georgen",
        "Alec Georgen",
        "RB",
        28,
        71,
        71,
        1.7
      ],
      [
        "mohamed-bamba",
        "Mohamed Bamba",
        "ST",
        24,
        70,
        75,
        2.4
      ],
      [
        "panos-katseris",
        "Panos Katseris",
        "RM",
        25,
        70,
        75,
        2.4
      ],
      [
        "nathaniel-adjei",
        "Nathaniel Adjei",
        "CB",
        24,
        70,
        76,
        2.1
      ],
      [
        "souleymane-isaak-toure",
        "Souleymane Isaak Touré",
        "CB",
        23,
        70,
        79,
        3.9
      ],
      [
        "bingourou-kamara",
        "Bingourou Kamara",
        "GK",
        29,
        69,
        71,
        1.3
      ],
      [
        "formose-mendy",
        "Formose Mendy",
        "CB",
        25,
        68,
        79,
        3.9
      ],
      [
        "souleymane-faye",
        "Souleymane Faye",
        "LW",
        23,
        67,
        72,
        1.3
      ],
      [
        "noah-mbamba-muanda",
        "Noah Mbamba-Muanda",
        "CDM",
        21,
        67,
        79,
        1.6
      ],
      [
        "dembo-sylla",
        "Dembo Sylla",
        "RM",
        23,
        67,
        75,
        1.3
      ],
      [
        "gabin-bernardeau",
        "Gabin Bernardeau",
        "CAM",
        20,
        67,
        78,
        2
      ],
      [
        "benjamin-leroy",
        "Benjamin Leroy",
        "GK",
        37,
        67,
        68,
        0.13
      ],
      [
        "bandiougou-fadiga",
        "Bandiougou Fadiga",
        "CM",
        25,
        64,
        69,
        0.75
      ],
      [
        "jeremy-hatchi",
        "Jérémy Hatchi",
        "LM",
        21,
        64,
        74,
        0.8
      ]
    ]
  },
  {
    "id": "fcm",
    "name": "FC Metz",
    "color": "#8B0304",
    "budget": 8,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "teji-tedy-savanier",
        "Téji Tedy Savanier",
        "CAM",
        34,
        73,
        75,
        3.5
      ],
      [
        "habibou-mouhamadou-diallo",
        "Habibou Mouhamadou Diallo",
        "ST",
        31,
        71,
        72,
        2.3
      ],
      [
        "jessy-deminguet",
        "Jessy Deminguet",
        "CDM",
        28,
        71,
        73,
        2.7
      ],
      [
        "nampalys-mendy",
        "Nampalys Mendy",
        "CDM",
        34,
        71,
        73,
        1.5
      ],
      [
        "jonathan-frost-fischer",
        "Jonathan Frost Fischer",
        "GK",
        24,
        71,
        75,
        1.8
      ],
      [
        "maxime-jean-yves-colin",
        "Maxime Jean-Yves Colin",
        "LB",
        34,
        69,
        69,
        0.725
      ],
      [
        "florian-jeremie-miguel",
        "Florian Jérémie Miguel",
        "LB",
        30,
        69,
        70,
        1.4
      ],
      [
        "pape-moussa-fall",
        "Pape Moussa Fall",
        "ST",
        22,
        68,
        71,
        0.55
      ],
      [
        "pape-mamadou-sy",
        "Pape Mamadou Sy",
        "GK",
        29,
        68,
        68,
        0.45
      ],
      [
        "cristian-david-castro-devenish",
        "Cristian David Castro Devenish",
        "CB",
        25,
        68,
        76,
        2.6
      ],
      [
        "jean-ruiz",
        "Jean Ruiz",
        "CB",
        28,
        68,
        69,
        1.1
      ],
      [
        "alpha-amadou-toure",
        "Alpha Amadou Touré",
        "CDM",
        20,
        68,
        78,
        1.1
      ],
      [
        "giorgi-abuashvili",
        "Giorgi Abuashvili",
        "LM",
        23,
        67,
        76,
        1.9
      ],
      [
        "urie-michel-mboula",
        "Urie-Michel Mboula",
        "CB",
        23,
        67,
        76,
        2.1
      ],
      [
        "morgan-bokele-mputu",
        "Morgan Bokele Mputu",
        "LM",
        22,
        66,
        77,
        1.8
      ],
      [
        "ibou-sane",
        "Ibou Sané",
        "ST",
        21,
        65,
        78,
        1.2
      ],
      [
        "lima-joseph-mangondo",
        "Lima Joseph Mangondo",
        "ST",
        21,
        60,
        74,
        0.525
      ],
      [
        "g-hein",
        "G. Hein",
        "CAM",
        28,
        76,
        76,
        6
      ],
      [
        "b-stambouli",
        "B. Stambouli",
        "CDM",
        34,
        73,
        73,
        1
      ],
      [
        "j-deminguet",
        "J. Deminguet",
        "CM",
        27,
        72,
        72,
        2
      ],
      [
        "f-ballo-toure",
        "F. Ballo-Touré",
        "LB",
        28,
        72,
        72,
        2
      ],
      [
        "c-sabaly",
        "C. Sabaly",
        "ST",
        26,
        72,
        72,
        3
      ]
    ]
  },
  {
    "id": "fcn",
    "name": "FC Nantes",
    "color": "#FFCE00",
    "budget": 8,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "ibrahima-sissoko",
        "Ibrahima Sissoko",
        "CDM",
        28,
        74,
        77,
        7.5
      ],
      [
        "maxime-dupe",
        "Maxime Dupé",
        "GK",
        33,
        74,
        74,
        2.1
      ],
      [
        "frederic-guilbert",
        "Frédéric Guilbert",
        "RB",
        31,
        73,
        75,
        4.8
      ],
      [
        "johann-lepenant",
        "Johann Lepenant",
        "CM",
        23,
        73,
        81,
        8.5
      ],
      [
        "mathieu-cafaro",
        "Mathieu Cafaro",
        "LM",
        29,
        71,
        73,
        3.1
      ],
      [
        "kelvin-amian-adou",
        "Kelvin Amian Adou",
        "RB",
        28,
        71,
        74,
        3.2
      ],
      [
        "mostafa-mohamed-ahmed-abdalla",
        "Mostafa Mohamed Ahmed Abdalla",
        "ST",
        28,
        71,
        73,
        3.3
      ],
      [
        "ignatius-kpene-ganago",
        "Ignatius Kpene Ganago",
        "ST",
        27,
        71,
        74,
        2.9
      ],
      [
        "killian-corredor",
        "Killian Corredor",
        "LM",
        25,
        71,
        76,
        4.2
      ],
      [
        "tylel-tati",
        "Tylel Tati",
        "CB",
        18,
        71,
        83,
        2.4
      ],
      [
        "louis-leroux",
        "Louis Leroux",
        "CM",
        20,
        71,
        82,
        3.8
      ],
      [
        "bahereba-guirassy",
        "Bahereba Guirassy",
        "LW",
        20,
        71,
        79,
        2.4
      ],
      [
        "fabien-centonze",
        "Fabien Centonze",
        "RB",
        30,
        70,
        70,
        1.4
      ],
      [
        "lucas-perrin",
        "Lucas Perrin",
        "CB",
        27,
        70,
        72,
        1.6
      ],
      [
        "yassine-benhattab",
        "Yassine Benhattab",
        "RM",
        23,
        69,
        77,
        2.3
      ],
      [
        "saidou-sow",
        "Saïdou Sow",
        "CB",
        24,
        69,
        76,
        2.6
      ],
      [
        "dehmaine-tabibou-assoumani",
        "Dehmaine Tabibou Assoumani",
        "CM",
        21,
        69,
        79,
        1.4
      ],
      [
        "antoine-joujou",
        "Antoine Joujou",
        "LM",
        23,
        68,
        75,
        2.2
      ],
      [
        "wilitty-younoussa",
        "Wilitty Younoussa",
        "CM",
        25,
        66,
        73,
        1.6
      ],
      [
        "lamine-diack",
        "Lamine Diack",
        "CDM",
        25,
        65,
        73,
        1.5
      ],
      [
        "bahmed-deuff",
        "Bahmed Deuff",
        "CDM",
        20,
        65,
        77,
        0.9
      ],
      [
        "sekou-doucoure",
        "Sékou Doucouré",
        "CB",
        21,
        64,
        77,
        1.1
      ],
      [
        "diockoumalang-gomes",
        "Diockoumalang Gomes",
        "CDM",
        21,
        63,
        78,
        1.1
      ],
      [
        "alexis-mirbach",
        "Alexis Mirbach",
        "GK",
        21,
        60,
        73,
        0.425
      ]
    ]
  },
  {
    "id": "leh",
    "name": "Le Havre AC",
    "color": "#005BAA",
    "budget": 8,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "ayumu-seko",
        "Ayumu Seko",
        "CB",
        26,
        74,
        74,
        1.8
      ],
      [
        "rassoul-ndiaye",
        "Rassoul Ndiaye",
        "CM",
        24,
        74,
        75,
        2.4
      ],
      [
        "mory-diaw",
        "Mory Diaw",
        "GK",
        33,
        74,
        74,
        0.8
      ],
      [
        "vincent-julien-sasso",
        "Vincent Julien Sasso",
        "CB",
        35,
        73,
        73,
        0.6
      ],
      [
        "lionel-mpasi-nzau",
        "Lionel M'Pasi N'Zau",
        "GK",
        32,
        73,
        73,
        0.675
      ],
      [
        "yanis-zouaoui",
        "Yanis Zouaoui",
        "LB",
        28,
        72,
        72,
        1.7
      ],
      [
        "elias-jelert-kristensen",
        "Elias Jelert Kristensen",
        "RB",
        23,
        72,
        78,
        4.4
      ],
      [
        "junior-mwanga",
        "Junior Mwanga",
        "CDM",
        23,
        72,
        78,
        3.5
      ],
      [
        "fode-doucoure",
        "Fodé Doucouré",
        "RM",
        25,
        71,
        73,
        1.9
      ],
      [
        "michael-amir-junior-richardson",
        "Michael Amir Junior Richardson",
        "CM",
        24,
        71,
        79,
        4.7
      ],
      [
        "mbwana-ally-samatta",
        "Mbwana Ally Samatta",
        "ST",
        33,
        71,
        72,
        1.9
      ],
      [
        "simon-ebonog",
        "Simon Ebonog",
        "CM",
        22,
        71,
        76,
        1.6
      ],
      [
        "timothee-joseph-pembele",
        "Timothée Joseph Pembélé",
        "RB",
        24,
        70,
        78,
        3.4
      ],
      [
        "joshua-erowoli-orisunmihare-oluwaseun-maja",
        "Joshua Erowoli Orisunmihare Oluwaseun Maja",
        "ST",
        27,
        70,
        75,
        3.1
      ],
      [
        "kaito-mizuta",
        "Kaito Mizuta",
        "CAM",
        26,
        68,
        69,
        0.85
      ],
      [
        "godson-kyeremeh",
        "Godson Kyeremeh",
        "RM",
        26,
        68,
        69,
        1.1
      ],
      [
        "felix-khonde-mambimbi",
        "Felix Khonde Mambimbi",
        "ST",
        25,
        67,
        72,
        1.4
      ],
      [
        "daren-nbenbege-mosengo",
        "Daren Nbenbege Mosengo",
        "CM",
        20,
        63,
        76,
        1.1
      ],
      [
        "paul-antoine-robin-stanislas-argney",
        "Paul Antoine Robin Stanislas Argney",
        "GK",
        20,
        63,
        77,
        0.5750000000000001
      ],
      [
        "guy-noel-prince-zohouri",
        "Guy-Noël Prince Zohouri",
        "CM",
        19,
        61,
        76,
        0.75
      ],
      [
        "a-toure",
        "A. Touré",
        "CDM",
        31,
        75,
        75,
        3
      ],
      [
        "g-lloris",
        "G. Lloris",
        "CB",
        29,
        74,
        74,
        3
      ]
    ]
  },
  {
    "id": "lil",
    "name": "Lille OSC",
    "color": "#C10015",
    "budget": 15,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "ayyoub-bouaddi",
        "Ayyoub Bouaddi",
        "CDM",
        18,
        80,
        86,
        12
      ],
      [
        "benjamin-andre",
        "Benjamin André",
        "CDM",
        36,
        80,
        80,
        7
      ],
      [
        "berke-ozer",
        "Berke Özer",
        "GK",
        26,
        79,
        80,
        11
      ],
      [
        "romain-paul-jean-michel-perraud",
        "Romain Paul Jean-Michel Perraud",
        "LB",
        28,
        78,
        78,
        4.4
      ],
      [
        "matias-fernandez-pardo",
        "Matias Fernandez-Pardo",
        "ST",
        21,
        78,
        84,
        13
      ],
      [
        "hakon-arnar-haraldsson",
        "Hákon Arnar Haraldsson",
        "CAM",
        23,
        78,
        84,
        23
      ],
      [
        "alexsandro-victor-de-souza-ribeiro",
        "Alexsandro Victor de Souza Ribeiro",
        "CB",
        27,
        78,
        84,
        27
      ],
      [
        "nabil-bentaleb",
        "Nabil Bentaleb",
        "CDM",
        31,
        77,
        77,
        9
      ],
      [
        "olivier-jonathan-giroud",
        "Olivier Jonathan Giroud",
        "ST",
        39,
        77,
        79,
        6
      ],
      [
        "nathan-ngoy",
        "Nathan Ngoy",
        "CB",
        23,
        77,
        78,
        2.9
      ],
      [
        "hamza-igamane",
        "Hamza Igamane",
        "ST",
        23,
        76,
        82,
        7
      ],
      [
        "felix-alexandre-andrade-sanches-correia",
        "Félix Alexandre Andrade Sanches Correia",
        "LM",
        25,
        75,
        80,
        8.5
      ],
      [
        "tiago-carvalho-santos",
        "Tiago Carvalho Santos",
        "RB",
        24,
        75,
        83,
        16
      ],
      [
        "osame-sahraoui",
        "Osame Sahraoui",
        "LM",
        25,
        75,
        82,
        12
      ],
      [
        "ethan-mbappe-lottin",
        "Ethan Mbappé Lottin",
        "RM",
        19,
        74,
        80,
        2.9
      ],
      [
        "basar-onal",
        "Başar Önal",
        "LM",
        22,
        74,
        78,
        2.6
      ],
      [
        "mohamed-lamine-bayo",
        "Mohamed Lamine Bayo",
        "ST",
        28,
        74,
        74,
        3.6
      ],
      [
        "calvin-ronald-verdonk",
        "Calvin Ronald Verdonk",
        "LB",
        29,
        73,
        73,
        1.7
      ],
      [
        "ngalayel-mukau",
        "Ngal'ayel Mukau",
        "CDM",
        21,
        73,
        83,
        8.5
      ],
      [
        "arnaud-bodart",
        "Arnaud Bodart",
        "GK",
        28,
        72,
        77,
        3.2
      ],
      [
        "tanguy-austin-nianzou-kouassi",
        "Tanguy-Austin Nianzou Kouassi",
        "CB",
        24,
        71,
        77,
        3.2
      ],
      [
        "noah-edjouma",
        "Noah Edjouma",
        "RM",
        20,
        69,
        79,
        2
      ],
      [
        "tiago-fontoura-da-fonseca-morais",
        "Tiago Fontoura da Fonseca Morais",
        "LW",
        23,
        69,
        78,
        3.1
      ],
      [
        "isaac-cossier",
        "Isaac Cossier",
        "CB",
        19,
        66,
        77,
        1
      ],
      [
        "loun-srdanovic",
        "Loun Srdanovic",
        "RB",
        20,
        65,
        74,
        0.4
      ]
    ]
  },
  {
    "id": "ogc",
    "name": "OGC Nice",
    "color": "#CC1C2C",
    "budget": 15,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "jonathan-clauss",
        "Jonathan Clauss",
        "RB",
        33,
        77,
        80,
        15
      ],
      [
        "axel-laurent-angel-lambert-witsel",
        "Axel Laurent Angel Lambert Witsel",
        "CDM",
        37,
        76,
        77,
        1.9
      ],
      [
        "melvin-michel-maxence-bard",
        "Melvin Michel Maxence Bard",
        "LB",
        25,
        76,
        82,
        19
      ],
      [
        "laurent-abergel",
        "Laurent Abergel",
        "CM",
        33,
        76,
        76,
        3.7
      ],
      [
        "gauthier-hein",
        "Gauthier Hein",
        "CAM",
        30,
        76,
        76,
        7.5
      ],
      [
        "yehvann-diouf",
        "Yehvann Diouf",
        "GK",
        26,
        76,
        83,
        17
      ],
      [
        "sofiane-diop",
        "Sofiane Diop",
        "LW",
        26,
        76,
        79,
        10
      ],
      [
        "youssouf-ndayishimiye",
        "Youssouf Ndayishimiye",
        "CB",
        27,
        75,
        82,
        14
      ],
      [
        "ali-abdi",
        "Ali Abdi",
        "LB",
        32,
        75,
        76,
        5.5
      ],
      [
        "morgan-sanson",
        "Morgan Sanson",
        "CM",
        32,
        75,
        76,
        7
      ],
      [
        "hicham-boudaoui",
        "Hicham Boudaoui",
        "CM",
        26,
        75,
        80,
        14
      ],
      [
        "mohamed-ali-cho",
        "Mohamed-Ali Cho",
        "RW",
        22,
        74,
        83,
        15
      ],
      [
        "moise-bombito-lumpungu",
        "Moïse Bombito Lumpungu",
        "CB",
        26,
        74,
        83,
        14
      ],
      [
        "kojo-peprah-oppong",
        "Kojo Peprah Oppong",
        "CB",
        22,
        74,
        78,
        2.5
      ],
      [
        "antoine-mendy",
        "Antoine Mendy",
        "CB",
        22,
        73,
        80,
        3.3
      ],
      [
        "nathan-ngoumou-minpole",
        "Nathan Ngoumou Minpole",
        "RM",
        26,
        72,
        75,
        3.1
      ],
      [
        "salis-abdul-samed",
        "Salis Abdul Samed",
        "CDM",
        26,
        72,
        75,
        3.4
      ],
      [
        "mohamed-abdelmonem",
        "Mohamed Abdelmonem",
        "CB",
        27,
        72,
        79,
        5.5
      ],
      [
        "isak-jansson",
        "Isak Jansson",
        "LW",
        24,
        71,
        78,
        3.8
      ],
      [
        "issiaga-camara",
        "Issiaga Camara",
        "CDM",
        21,
        66,
        77,
        1.3
      ],
      [
        "victor-orakpo",
        "Victor Orakpo",
        "ST",
        20,
        63,
        77,
        0.65
      ],
      [
        "hamza-koutoune",
        "Hamza Koutoune",
        "RB",
        20,
        61,
        76,
        0.6
      ],
      [
        "y-diouf",
        "Y. Diouf",
        "GK",
        25,
        78,
        79,
        14
      ]
    ]
  },
  {
    "id": "oly",
    "name": "Olympique Lyonnais",
    "color": "#DA004E",
    "budget": 16,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "corentin-tolisso",
        "Corentin Tolisso",
        "CM",
        32,
        82,
        82,
        25
      ],
      [
        "moussa-niakhate",
        "Moussa Niakhaté",
        "CB",
        30,
        81,
        81,
        9
      ],
      [
        "dominik-greif",
        "Dominik Greif",
        "GK",
        29,
        81,
        81,
        13
      ],
      [
        "ikoma-lois-openda",
        "Ikoma Loïs Openda",
        "ST",
        26,
        80,
        85,
        46
      ],
      [
        "tyler-scott-morton",
        "Tyler Scott Morton",
        "CDM",
        23,
        79,
        82,
        9
      ],
      [
        "pavel-sulc",
        "Pavel Šulc",
        "CAM",
        25,
        79,
        80,
        15
      ],
      [
        "nicolas-alejandro-tagliafico",
        "Nicolás Alejandro Tagliafico",
        "LB",
        34,
        78,
        78,
        9.5
      ],
      [
        "ainsley-cory-maitland-niles",
        "Ainsley Cory Maitland-Niles",
        "RB",
        29,
        77,
        77,
        10
      ],
      [
        "clinton-mukoni-mata-pedro-lourenco",
        "Clinton Mukoni Mata Pedro Lourenço",
        "CB",
        33,
        77,
        77,
        7
      ],
      [
        "malick-martin-fofana",
        "Malick Martin Fofana",
        "LM",
        21,
        77,
        86,
        31
      ],
      [
        "abner-vinicius-da-silva-santos",
        "Abner Vinícius da Silva Santos",
        "LB",
        26,
        76,
        77,
        5
      ],
      [
        "ruben-caine-kluivert",
        "Ruben Caine Kluivert",
        "CB",
        25,
        75,
        76,
        2.1
      ],
      [
        "remy-descamps",
        "Rémy Descamps",
        "GK",
        30,
        75,
        75,
        3.2
      ],
      [
        "francis-tanner-james-tessmann",
        "Francis Tanner James Tessmann",
        "CDM",
        24,
        75,
        81,
        8
      ],
      [
        "duje-caleta-car",
        "Duje Ćaleta-Car",
        "CB",
        30,
        74,
        74,
        3.6
      ],
      [
        "ernest-nuamah-appiah",
        "Ernest Nuamah Appiah",
        "RM",
        22,
        74,
        82,
        12
      ],
      [
        "khalis-merah",
        "Khalis Merah",
        "CAM",
        19,
        73,
        80,
        2
      ],
      [
        "mads-bidstrup",
        "Mads Bidstrup",
        "CDM",
        25,
        73,
        79,
        4.8
      ],
      [
        "julien-dienda-m-duranville",
        "Julien Dienda M. Duranville",
        "RM",
        20,
        72,
        87,
        5.5
      ],
      [
        "felix-bacher",
        "Felix Bacher",
        "CB",
        25,
        72,
        73,
        1.7
      ],
      [
        "noah-teye-nartey",
        "Noah Teye Nartey",
        "CM",
        20,
        71,
        82,
        2.4
      ],
      [
        "edgar-paul-akouokou",
        "Edgar Paul Akouokou",
        "CDM",
        28,
        69,
        72,
        1.9
      ],
      [
        "mohamed-ouedraogo",
        "Mohamed Ouédraogo",
        "LB",
        23,
        69,
        75,
        1.5
      ],
      [
        "mathys-de-carvalho",
        "Mathys De Carvalho",
        "CDM",
        21,
        68,
        77,
        1.1
      ],
      [
        "noham-kamara",
        "Noham Kamara",
        "CB",
        19,
        68,
        80,
        0.9500000000000001
      ],
      [
        "zachary-athekame",
        "Zachary Athekame",
        "RB",
        21,
        68,
        78,
        1.6
      ],
      [
        "mahamadou-diawara",
        "Mahamadou Diawara",
        "CM",
        21,
        67,
        77,
        3
      ],
      [
        "lassine-diarra",
        "Lassine Diarra",
        "GK",
        23,
        64,
        74,
        1.1
      ],
      [
        "alejandro-jesus-gomes-rodriguez",
        "Alejandro Jesús Gomes Rodríguez",
        "ST",
        18,
        64,
        79,
        1.3
      ]
    ]
  },
  {
    "id": "oly2",
    "name": "Olympique de Marseille",
    "color": "#2FAEE0",
    "budget": 30,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "amine-ferid-gouiri",
        "Amine Ferid Gouiri",
        "ST",
        26,
        80,
        84,
        26
      ],
      [
        "nayef-aguerd",
        "Nayef Aguerd",
        "CB",
        30,
        80,
        82,
        24
      ],
      [
        "pierre-emile-kordt-hjbjerg",
        "Pierre-Emile Kordt Højbjerg",
        "CDM",
        31,
        80,
        82,
        26
      ],
      [
        "quinten-ryan-crispito-timber",
        "Quinten Ryan Crispito Timber",
        "CM",
        25,
        79,
        85,
        32
      ],
      [
        "leonardo-julian-balerdi-rossa",
        "Leonardo Julián Balerdi Rossa",
        "CB",
        27,
        79,
        84,
        30
      ],
      [
        "igor-guilherme-barbosa-da-paixao",
        "Igor Guilherme Barbosa da Paixão",
        "LM",
        26,
        79,
        83,
        28
      ],
      [
        "timothy-tarpeh-weah",
        "Timothy Tarpeh Weah",
        "RM",
        26,
        78,
        78,
        13
      ],
      [
        "emerson-palmieri-dos-santos",
        "Emerson Palmieri dos Santos",
        "LB",
        32,
        77,
        77,
        9
      ],
      [
        "geoffrey-edwin-kondogbia",
        "Geoffrey Edwin Kondogbia",
        "CDM",
        33,
        76,
        78,
        9
      ],
      [
        "himad-abdelli",
        "Himad Abdelli",
        "CAM",
        26,
        75,
        80,
        11
      ],
      [
        "bamo-abdoul-meite",
        "Bamo Abdoul Meïté",
        "CB",
        24,
        75,
        78,
        4.2
      ],
      [
        "conrad-jaden-egan-riley",
        "Conrad Jaden Egan-Riley",
        "CB",
        23,
        75,
        82,
        11
      ],
      [
        "adilson-angel-abreu-de-almeida-gomes",
        "Adilson Angel Abreu de Almeida Gomes",
        "CAM",
        26,
        75,
        81,
        12
      ],
      [
        "neal-maupay",
        "Neal Maupay",
        "ST",
        30,
        74,
        75,
        6
      ],
      [
        "jeffrey-de-lange",
        "Jeffrey de Lange",
        "GK",
        28,
        74,
        76,
        3
      ],
      [
        "derek-austin-cornelius",
        "Derek Austin Cornelius",
        "CB",
        28,
        74,
        76,
        4.5
      ],
      [
        "amine-harit",
        "Amine Harit",
        "LM",
        29,
        74,
        75,
        5.5
      ],
      [
        "ulisses-alexandre-garcia-lopes",
        "Ulisses Alexandre Garcia Lopes",
        "LB",
        30,
        73,
        75,
        4.9
      ],
      [
        "faris-pemi-moumbagna",
        "Faris Pemi Moumbagna",
        "ST",
        26,
        71,
        77,
        4.3
      ],
      [
        "tochukwu-nnadi",
        "Tochukwu Nnadi",
        "CDM",
        23,
        70,
        70,
        0.3
      ],
      [
        "keyliane-hikram-abdallah",
        "Keyliane Hikram Abdallah",
        "RM",
        20,
        66,
        74,
        0.9500000000000001
      ],
      [
        "jelle-van-neck",
        "Jelle Van Neck",
        "GK",
        22,
        63,
        74,
        0.7000000000000001
      ],
      [
        "theo-vermot",
        "Théo Vermot",
        "GK",
        29,
        60,
        61,
        0.19
      ]
    ]
  },
  {
    "id": "pfc",
    "name": "Paris FC",
    "color": "#031C4E",
    "budget": 8,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "kevin-christian-trapp",
        "Kevin Christian Trapp",
        "GK",
        36,
        78,
        81,
        4.4
      ],
      [
        "pierre-lees-melou",
        "Pierre Lees-Melou",
        "CDM",
        33,
        77,
        78,
        9.5
      ],
      [
        "ilan-kais-kebbal",
        "Ilan Kais Kebbal",
        "RM",
        28,
        77,
        77,
        8
      ],
      [
        "lassine-sinayoko",
        "Lassine Sinayoko",
        "ST",
        26,
        77,
        77,
        5.5
      ],
      [
        "pablo-pagis",
        "Pablo Pagis",
        "CAM",
        23,
        76,
        79,
        2.7
      ],
      [
        "moses-daddy-ajala-simon",
        "Moses Daddy-Ajala Simon",
        "LM",
        31,
        76,
        77,
        11
      ],
      [
        "nanitamo-jonathan-ikone",
        "Nanitamo Jonathan Ikoné",
        "RM",
        28,
        75,
        76,
        8
      ],
      [
        "hamari-traore",
        "Hamari Traoré",
        "RB",
        34,
        75,
        79,
        9
      ],
      [
        "mamadou-moustapha-mbow",
        "Mamadou Moustapha Mbow",
        "CB",
        26,
        75,
        76,
        2.9
      ],
      [
        "diego-coppola",
        "Diego Coppola",
        "CB",
        22,
        75,
        81,
        8
      ],
      [
        "maxime-baila-lopez",
        "Maxime Baila Lopez",
        "CM",
        28,
        75,
        77,
        8.5
      ],
      [
        "obed-nkambadio",
        "Obed Nkambadio",
        "GK",
        23,
        74,
        81,
        6
      ],
      [
        "rudy-nzingoula-matondo",
        "Rudy Nzingoula Matondo",
        "CM",
        18,
        74,
        78,
        0.55
      ],
      [
        "nhoa-ryan-sangui",
        "Nhoa Ryan Sangui",
        "LB",
        20,
        73,
        79,
        2.3
      ],
      [
        "adama-mohamed-camara",
        "Adama Mohamed Camara",
        "CM",
        29,
        73,
        73,
        1.9
      ],
      [
        "otavio-ataide-da-silva",
        "Otávio Ataíde da Silva",
        "CB",
        24,
        73,
        81,
        8
      ],
      [
        "jean-philippe-krasso",
        "Jean-Philippe Krasso",
        "ST",
        29,
        73,
        74,
        4.6
      ],
      [
        "luca-warrick-daeovie-koleosho",
        "Luca Warrick Daeovie Koleosho",
        "LM",
        22,
        72,
        82,
        5
      ],
      [
        "thibault-de-smet",
        "Thibault De Smet",
        "LB",
        28,
        71,
        73,
        2.5
      ],
      [
        "patrick-zabi-eloge-gueu",
        "Patrick Zabi Eloge Gueu",
        "CM",
        19,
        71,
        75,
        0.75
      ],
      [
        "samir-sophian-chergui",
        "Samir Sophian Chergui",
        "CB",
        27,
        71,
        71,
        1.2
      ],
      [
        "vincent-marchetti",
        "Vincent Marchetti",
        "CM",
        29,
        70,
        70,
        1.7
      ],
      [
        "tuomas-ollila",
        "Tuomas Ollila",
        "LB",
        26,
        68,
        73,
        1.6
      ],
      [
        "omar-sissoko",
        "Omar Sissoko",
        "ST",
        20,
        61,
        74,
        0.5750000000000001
      ]
    ]
  },
  {
    "id": "par2",
    "name": "Paris Saint-Germain",
    "color": "#004170",
    "budget": 100,
    "preferredFormation": "4-3-3",
    "players": [
      [
        "masour-ousmane-dembele",
        "Masour Ousmane Dembélé",
        "ST",
        29,
        90,
        90,
        123
      ],
      [
        "vitor-machado-ferreira",
        "Vítor Machado Ferreira",
        "CM",
        26,
        90,
        91,
        129
      ],
      [
        "khvicha-kvaratskhelia",
        "Khvicha Kvaratskhelia",
        "LW",
        25,
        89,
        90,
        109
      ],
      [
        "willian-joel-pacho-tenorio",
        "Willian Joel Pacho Tenorio",
        "CB",
        24,
        89,
        89,
        83
      ],
      [
        "nuno-alexandre-tavares-mendes",
        "Nuno Alexandre Tavares Mendes",
        "LB",
        24,
        89,
        89,
        86
      ],
      [
        "joao-pedro-goncalves-neves",
        "João Pedro Gonçalves Neves",
        "CM",
        21,
        88,
        90,
        80
      ],
      [
        "achraf-hakimi-mouh",
        "Achraf Hakimi Mouh",
        "RB",
        27,
        88,
        90,
        111
      ],
      [
        "marcos-aoas-correa",
        "Marcos Aoás Corrêa",
        "CB",
        32,
        87,
        87,
        55
      ],
      [
        "desire-doue",
        "Désiré Doué",
        "RW",
        21,
        86,
        91,
        84
      ],
      [
        "fabian-ruiz-pena",
        "Fabián Ruiz Peña",
        "CM",
        30,
        86,
        86,
        53
      ],
      [
        "bradley-barcola",
        "Bradley Barcola",
        "LW",
        24,
        85,
        88,
        62
      ],
      [
        "ferran-torres-garcia",
        "Ferran Torres García",
        "ST",
        26,
        84,
        86,
        48
      ],
      [
        "matvey-safonov",
        "Matvey Safonov",
        "GK",
        27,
        83,
        83,
        15
      ],
      [
        "warren-zaire-emery",
        "Warren Zaïre-Emery",
        "CM",
        20,
        83,
        87,
        41
      ],
      [
        "lucas-francois-bernard-hernandez-pi",
        "Lucas François Bernard Hernández Pi",
        "CB",
        30,
        81,
        81,
        22
      ],
      [
        "maghnes-akliouche",
        "Maghnes Akliouche",
        "CAM",
        24,
        81,
        86,
        34
      ],
      [
        "lucas-chevalier",
        "Lucas Chevalier",
        "GK",
        24,
        80,
        88,
        44
      ],
      [
        "illia-zabarnyi",
        "Illia Zabarnyi",
        "CB",
        24,
        80,
        84,
        25
      ],
      [
        "lucas-digne",
        "Lucas Digne",
        "LB",
        33,
        80,
        80,
        16
      ],
      [
        "senny-mayulu",
        "Senny Mayulu",
        "CM",
        20,
        79,
        85,
        12
      ],
      [
        "lucas-lopes-beraldo",
        "Lucas Lopes Beraldo",
        "CDM",
        22,
        79,
        84,
        21
      ],
      [
        "mika-marcel-godts",
        "Mika Marcel Godts",
        "LW",
        21,
        78,
        85,
        9.5
      ],
      [
        "ibrahim-mbaye",
        "Ibrahim Mbaye",
        "RW",
        18,
        76,
        83,
        2.8
      ],
      [
        "renato-junior-luz-sanches",
        "Renato Júnior Luz Sanches",
        "CM",
        29,
        75,
        75,
        6
      ],
      [
        "pedro-fernandez",
        "Pedro Fernández",
        "CM",
        18,
        73,
        76,
        0.55
      ],
      [
        "yoram-zague",
        "Yoram Zague",
        "RB",
        20,
        64,
        80,
        1.6
      ]
    ]
  },
  {
    "id": "rcl",
    "name": "RC Lens",
    "color": "#FEE104",
    "budget": 8,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "florian-tristan-mariano-thauvin",
        "Florian Tristan Mariano Thauvin",
        "RW",
        33,
        82,
        82,
        6
      ],
      [
        "robin-risser-birckel",
        "Robin Risser Birckel",
        "GK",
        21,
        81,
        82,
        4.4
      ],
      [
        "matthieu-udol",
        "Matthieu Udol",
        "LB",
        30,
        81,
        81,
        3.5
      ],
      [
        "odsonne-edouard",
        "Odsonne Édouard",
        "ST",
        28,
        78,
        78,
        2.7
      ],
      [
        "samson-baidoo",
        "Samson Baidoo",
        "CB",
        22,
        78,
        81,
        3.3
      ],
      [
        "jonathan-gradit",
        "Jonathan Gradit",
        "CB",
        33,
        77,
        77,
        7
      ],
      [
        "pierre-ismaelo-ganiou",
        "Pierre-Ismaëlo Ganiou",
        "CB",
        21,
        77,
        77,
        1.8
      ],
      [
        "ruben-aguilar",
        "Ruben Aguilar",
        "RB",
        33,
        77,
        77,
        5
      ],
      [
        "saud-abdullah-abdul-hamid",
        "Saud Abdullah Abdul Hamid",
        "RB",
        27,
        77,
        78,
        7
      ],
      [
        "thorgan-ganael-francis-hazard",
        "Thorgan Ganael Francis Hazard",
        "CAM",
        33,
        75,
        75,
        2.4
      ],
      [
        "franjo-ivanovic",
        "Franjo Ivanović",
        "ST",
        22,
        75,
        83,
        13
      ],
      [
        "amadou-haidara",
        "Amadou Haïdara",
        "CM",
        28,
        75,
        78,
        12
      ],
      [
        "florian-sotoca",
        "Florian Sotoca",
        "ST",
        35,
        74,
        75,
        2.7
      ],
      [
        "yassine-mohammed-titraoui",
        "Yassine Mohammed Titraoui",
        "CDM",
        23,
        73,
        78,
        2.6
      ],
      [
        "abdallah-dipo-sima",
        "Abdallah Dipo Sima",
        "LW",
        25,
        73,
        79,
        6.5
      ],
      [
        "andrija-bulatovic",
        "Andrija Bulatovic",
        "CM",
        19,
        73,
        78,
        1.4
      ],
      [
        "rayan-fofana",
        "Rayan Fofana",
        "ST",
        20,
        73,
        78,
        1.7
      ],
      [
        "michael-bruno-dominique-cuisance",
        "Michaël Bruno Dominique Cuisance",
        "CM",
        27,
        72,
        75,
        3.1
      ],
      [
        "nidal-celik",
        "Nidal Čelik",
        "CB",
        20,
        71,
        78,
        1.3
      ],
      [
        "micha-krzysztof-skoras",
        "Michał Krzysztof Skóraś",
        "LW",
        26,
        71,
        73,
        2.1
      ],
      [
        "jhoanner-stalin-chavez-quintero",
        "Jhoanner Stalin Chávez Quintero",
        "LB",
        24,
        70,
        78,
        3.5
      ],
      [
        "maik-nawrocki",
        "Maik Nawrocki",
        "CB",
        25,
        70,
        77,
        2.9
      ],
      [
        "kyllian-anderson-antonio",
        "Kyllian Anderson Antonio",
        "CB",
        18,
        69,
        79,
        1.2
      ],
      [
        "regis-gurtner",
        "Régis Gurtner",
        "GK",
        39,
        69,
        69,
        0.15
      ],
      [
        "ilan-jourdren",
        "Ilan Jourdren",
        "GK",
        18,
        62,
        78,
        0.55
      ]
    ]
  },
  {
    "id": "rcs",
    "name": "RC Strasbourg Alsace",
    "color": "#0072BC",
    "budget": 15,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "joaquin-panichelli",
        "Joaquín Panichelli",
        "ST",
        23,
        79,
        83,
        9.5
      ],
      [
        "guela-doue",
        "Guéla Doué",
        "RB",
        23,
        78,
        82,
        15
      ],
      [
        "benjamin-james-chilwell",
        "Benjamin James Chilwell",
        "LB",
        29,
        77,
        77,
        9.5
      ],
      [
        "filip-jrgensen",
        "Filip Jørgensen",
        "GK",
        24,
        77,
        83,
        14
      ],
      [
        "ismael-landry-doukoure",
        "Ismaël Landry Doukouré",
        "CB",
        23,
        77,
        82,
        11
      ],
      [
        "becket-fabrice-martial-godo",
        "Becket Fabrice-Martial Godo",
        "LM",
        23,
        76,
        76,
        1.6
      ],
      [
        "samir-el-mourabet",
        "Samir El Mourabet",
        "CM",
        20,
        75,
        77,
        1.8
      ],
      [
        "algot-sebastian-nanasi",
        "Algot Sebastian Nanasi",
        "CAM",
        24,
        75,
        83,
        15
      ],
      [
        "andrew-abiola-omobamidele",
        "Andrew Abiola Omobamidele",
        "CB",
        24,
        74,
        78,
        4.2
      ],
      [
        "lucas-hgsberg",
        "Lucas Høgsberg",
        "CB",
        20,
        74,
        82,
        3.1
      ],
      [
        "mateo-del-blanco",
        "Mateo Del Blanco",
        "LB",
        22,
        74,
        82,
        4
      ],
      [
        "giovanni-alejandro-reyna",
        "Giovanni Alejandro Reyna",
        "CAM",
        23,
        73,
        81,
        9
      ],
      [
        "abdoul-karim-coulibaly",
        "Abdoul Karim Coulibaly",
        "CB",
        19,
        73,
        79,
        0.6
      ],
      [
        "gessime-yassine",
        "Gessime Yassine",
        "RM",
        20,
        73,
        77,
        1.7
      ],
      [
        "samuel-christian-osaze-amo-ameyaw",
        "Samuel Christian Osaze Amo-Ameyaw",
        "RM",
        20,
        72,
        79,
        2.9
      ],
      [
        "pape-demba-diop",
        "Pape Demba Diop",
        "CM",
        23,
        72,
        78,
        3
      ],
      [
        "soumaila-coulibaly",
        "Soumaïla Coulibaly",
        "CB",
        22,
        72,
        80,
        4.9
      ],
      [
        "maximillian-oyedele",
        "Maximillian Oyedele",
        "CM",
        21,
        71,
        79,
        3.5
      ],
      [
        "sekou-mara",
        "Sékou Mara",
        "ST",
        24,
        71,
        77,
        3.3
      ],
      [
        "mathis-amougou",
        "Mathis Amougou",
        "CM",
        20,
        71,
        82,
        5
      ],
      [
        "abakar-loubadhe-sylla",
        "Abakar Loubadhe Sylla",
        "CB",
        23,
        70,
        80,
        4.9
      ],
      [
        "diogo-lobao-de-sousa",
        "Diogo Lobão de Sousa",
        "CDM",
        20,
        70,
        70,
        0.45
      ],
      [
        "jeyland-yahir-mitchell-baltodano",
        "Jeyland Yahir Mitchell Baltodano",
        "CB",
        21,
        70,
        78,
        1.9
      ],
      [
        "fabio-amado-uri-balde",
        "Fabio Amado Uri Baldé",
        "LW",
        21,
        68,
        77,
        1.7
      ],
      [
        "milos-lukovic",
        "Miloš Luković",
        "ST",
        20,
        67,
        81,
        2.4
      ],
      [
        "omari-kellyman",
        "Omari Kellyman",
        "CAM",
        20,
        67,
        79,
        1
      ],
      [
        "benjamin-brantlind",
        "Benjamin Brantlind",
        "LM",
        18,
        66,
        76,
        0.4
      ],
      [
        "miosz-piekutowski",
        "Miłosz Piekutowski",
        "GK",
        20,
        65,
        72,
        0.75
      ],
      [
        "pape-daouda-diong",
        "Pape Daouda Diong",
        "CDM",
        20,
        65,
        79,
        1.6
      ]
    ]
  },
  {
    "id": "sta",
    "name": "Stade Brestois 29",
    "color": "#DC1E32",
    "budget": 8,
    "preferredFormation": "4-4-2",
    "players": [
      [
        "ludovic-ajorque",
        "Ludovic Ajorque",
        "ST",
        32,
        77,
        77,
        9
      ],
      [
        "brendan-chardonnet",
        "Brendan Chardonnet",
        "CB",
        31,
        76,
        77,
        8.5
      ],
      [
        "romain-del-castillo",
        "Romain Del Castillo",
        "RM",
        30,
        76,
        76,
        7.5
      ],
      [
        "hugo-magnetti",
        "Hugo Magnetti",
        "CDM",
        28,
        76,
        78,
        8
      ],
      [
        "kamory-doumbia",
        "Kamory Doumbia",
        "CAM",
        23,
        75,
        80,
        7
      ],
      [
        "gautier-lloris",
        "Gautier Lloris",
        "CB",
        31,
        75,
        75,
        3.5
      ],
      [
        "kenny-lala",
        "Kenny Lala",
        "RB",
        34,
        75,
        76,
        3.9
      ],
      [
        "bradley-locko-banzouzi",
        "Bradley Locko Banzouzi",
        "LB",
        24,
        75,
        81,
        8.5
      ],
      [
        "mama-samba-balde",
        "Mama Samba Baldé",
        "LW",
        30,
        73,
        73,
        3
      ],
      [
        "lucas-simon-pierre-tousart",
        "Lucas Simon Pierre Tousart",
        "CDM",
        29,
        73,
        75,
        4.1
      ],
      [
        "joris-chotard",
        "Joris Chotard",
        "CDM",
        24,
        73,
        79,
        6
      ],
      [
        "egil-selvik",
        "Egil Selvik",
        "GK",
        29,
        70,
        73,
        1.6
      ],
      [
        "pathe-mboup",
        "Pathé Mboup",
        "LM",
        22,
        70,
        79,
        3.1
      ],
      [
        "raphael-le-guen",
        "Raphaël Le Guen",
        "CB",
        20,
        70,
        74,
        0.875
      ],
      [
        "hamidou-makalou",
        "Hamidou Makalou",
        "CDM",
        20,
        68,
        80,
        1.2
      ],
      [
        "tolikpaley-luck-evrad-zogbe",
        "Tolikpaley Luck Evrad Zogbé",
        "RB",
        21,
        68,
        78,
        2.5
      ],
      [
        "justin-bourgault",
        "Justin Bourgault",
        "LB",
        21,
        65,
        76,
        1.5
      ],
      [
        "mamady-diambou",
        "Mamady Diambou",
        "CDM",
        23,
        65,
        75,
        1.8
      ],
      [
        "joseph-nonge-boende",
        "Joseph Nonge Boende",
        "CM",
        21,
        65,
        77,
        1.4
      ],
      [
        "axel-camblan",
        "Axel Camblan",
        "RM",
        23,
        64,
        72,
        1.1
      ],
      [
        "r-majecki",
        "R. Majecki",
        "GK",
        25,
        77,
        78,
        9
      ],
      [
        "l-ajorque",
        "L. Ajorque",
        "ST",
        31,
        77,
        77,
        8
      ]
    ]
  },
  {
    "id": "sta2",
    "name": "Stade Rennais FC",
    "color": "#E2001A",
    "budget": 13,
    "preferredFormation": "4-2-3-1",
    "players": [
      [
        "brice-lauriche-samba",
        "Brice Lauriche Samba",
        "GK",
        32,
        81,
        81,
        11
      ],
      [
        "esteban-lepaul",
        "Estéban Lepaul",
        "ST",
        26,
        81,
        81,
        8.5
      ],
      [
        "adrien-thomasson",
        "Adrien Thomasson",
        "CM",
        32,
        81,
        81,
        8.5
      ],
      [
        "valentin-rongier",
        "Valentin Rongier",
        "CDM",
        31,
        80,
        80,
        15
      ],
      [
        "charlie-richard-cresswell",
        "Charlie Richard Cresswell",
        "CB",
        24,
        78,
        81,
        8
      ],
      [
        "mousa-mohammad-mousa-sulaiman-al-tamari",
        "Mousa Mohammad Mousa Sulaiman Al Tamari",
        "LM",
        29,
        77,
        77,
        5.5
      ],
      [
        "sebastian-szymanski",
        "Sebastian Szymański",
        "CM",
        27,
        77,
        80,
        18
      ],
      [
        "mahdi-camara",
        "Mahdi Camara",
        "CM",
        28,
        77,
        79,
        16
      ],
      [
        "quentin-merlin",
        "Quentin Merlin",
        "LB",
        24,
        77,
        82,
        11
      ],
      [
        "ludovic-blas",
        "Ludovic Blas",
        "RM",
        28,
        76,
        77,
        11
      ],
      [
        "przemysaw-frankowski",
        "Przemysław Frankowski",
        "RB",
        31,
        76,
        76,
        4.8
      ],
      [
        "lilian-brassier",
        "Lilian Brassier",
        "CB",
        26,
        76,
        80,
        9.5
      ],
      [
        "anthony-rouault",
        "Anthony Rouault",
        "CB",
        25,
        76,
        81,
        10
      ],
      [
        "seko-mohamed-fofana",
        "Seko Mohamed Fofana",
        "CM",
        31,
        76,
        77,
        10
      ],
      [
        "issa-soumare",
        "Issa Soumaré",
        "LM",
        25,
        75,
        76,
        3.4
      ],
      [
        "alidu-seidu",
        "Alidu Seidu",
        "CB",
        26,
        74,
        80,
        6
      ],
      [
        "bryan-keith-reynolds-jr",
        "Bryan Keith Reynolds Jr",
        "RB",
        25,
        74,
        80,
        6
      ],
      [
        "abdelhamid-ait-boudlal",
        "Abdelhamid Ait Boudlal",
        "CB",
        20,
        73,
        81,
        2.7
      ],
      [
        "djaoui-cisse",
        "Djaoui Cissé",
        "CM",
        22,
        73,
        84,
        7
      ],
      [
        "arnaud-dominique-nordin",
        "Arnaud Dominique Nordin",
        "RM",
        28,
        73,
        73,
        3.2
      ],
      [
        "eliezer-mayenda-dossou",
        "Eliezer Mayenda Dossou",
        "ST",
        21,
        72,
        82,
        4.1
      ],
      [
        "mahamadou-aboubakar-nagida",
        "Mahamadou Aboubakar Nagida",
        "LB",
        21,
        70,
        80,
        2
      ],
      [
        "nicolas-lemaitre",
        "Nicolas Lemaître",
        "GK",
        29,
        70,
        72,
        1.4
      ],
      [
        "goncalo-calisto-oliveira",
        "Gonçalo Calisto Oliveira",
        "CB",
        20,
        65,
        79,
        1.3
      ],
      [
        "ayanda-sishuba",
        "Ayanda Sishuba",
        "CAM",
        21,
        63,
        78,
        1.4
      ]
    ]
  },
  {
    "id": "tou",
    "name": "Toulouse FC",
    "color": "#6A2C91",
    "budget": 8,
    "preferredFormation": "4-3-3",
    "players": [
      [
        "guillaume-restes",
        "Guillaume Restes",
        "GK",
        21,
        78,
        86,
        27
      ],
      [
        "yann-alexandre-gboho-gnantin",
        "Yann-Alexandre Gboho Gnantin",
        "LW",
        25,
        77,
        81,
        9
      ],
      [
        "rasmus-schmidt-nicolaisen",
        "Rasmus Schmidt Nicolaisen",
        "CB",
        29,
        76,
        78,
        7.5
      ],
      [
        "aron-leonard-dnnum",
        "Aron Leonard Dønnum",
        "RM",
        28,
        76,
        76,
        6
      ],
      [
        "cristian-sleiker-casseres-yepes",
        "Cristian Sleiker Cásseres Yépes",
        "CDM",
        26,
        76,
        79,
        5.5
      ],
      [
        "mark-alexander-mckenzie",
        "Mark Alexander McKenzie",
        "CB",
        27,
        75,
        79,
        5.5
      ],
      [
        "santiago-hidalgo-massa",
        "Santiago Hidalgo Massa",
        "RW",
        21,
        73,
        80,
        3.1
      ],
      [
        "thomas-jrgensen",
        "Thomas Jørgensen",
        "CM",
        20,
        72,
        82,
        2.4
      ],
      [
        "niklas-uwe-schmidt",
        "Niklas Uwe Schmidt",
        "CM",
        28,
        71,
        73,
        2.7
      ],
      [
        "alexis-vossah",
        "Alexis Vossah",
        "CDM",
        18,
        71,
        76,
        0.7000000000000001
      ],
      [
        "seny-koumbassa",
        "Seny Koumbassa",
        "CB",
        19,
        70,
        75,
        0.725
      ],
      [
        "rafik-messali",
        "Rafik Messali",
        "RB",
        23,
        70,
        75,
        1.3
      ],
      [
        "mathys-sauveur-niflore",
        "Mathys Sauveur Niflore",
        "GK",
        19,
        69,
        81,
        1.1
      ],
      [
        "abu-francis",
        "Abu Francis",
        "CM",
        25,
        69,
        74,
        1.9
      ],
      [
        "mario-sauer",
        "Mario Sauer",
        "CM",
        22,
        69,
        78,
        2.7
      ],
      [
        "jacen-rex-orlando-russell-rowe",
        "Jacen Rex Orlando Russell-Rowe",
        "ST",
        24,
        68,
        73,
        1.3
      ],
      [
        "julian-vignolo",
        "Julián Vignolo",
        "ST",
        19,
        66,
        77,
        1.7
      ],
      [
        "david-uyoyo-odogu",
        "David Uyoyo Odogu",
        "CB",
        20,
        65,
        83,
        1.7
      ],
      [
        "ilyas-azizi",
        "Ilyas Azizi",
        "LW",
        18,
        65,
        77,
        0.8250000000000001
      ],
      [
        "enzo-faty",
        "Enzo Faty",
        "ST",
        19,
        62,
        75,
        0.5750000000000001
      ],
      [
        "darris-zema",
        "Darris Zema",
        "RW",
        19,
        62,
        76,
        0.925
      ],
      [
        "ylies-aradj",
        "Ylies Aradj",
        "LB",
        21,
        61,
        77,
        0.925
      ],
      [
        "frederic-efuele-ngoyala",
        "Frédéric Efuele Ngoyala",
        "CB",
        21,
        61,
        74,
        0.75
      ],
      [
        "mathis-saka",
        "Mathis Saka",
        "CM",
        19,
        61,
        79,
        0.625
      ],
      [
        "naime-said-mchindra",
        "Naïme Saïd Mchindra",
        "GK",
        21,
        59,
        70,
        0.425
      ],
      [
        "gaetan-bakhouche",
        "Gaëtan Bakhouche",
        "CB",
        21,
        59,
        71,
        0.5
      ]
    ]
  }
];

const NUMBER_BY_ROLE = {
  GK:[1,13,25], RB:[2,22], LB:[3,23], CB:[4,5,6,15], CDM:[6,16], CM:[8,14,18], CAM:[10,20],
  RM:[7,19], RW:[7,19], LM:[11,17], LW:[11,17], ST:[9,10,14],
};
function stablePlayerId(clubId, slug){ return clubId + ":" + slug; }
function squadNumbers(players){
  const used = new Set();
  return players.map(player => {
    const preferred = NUMBER_BY_ROLE[player.role] || [];
    const number = preferred.find(value => !used.has(value)) || Array.from({length:99}, (_, index) => index + 1).find(value => !used.has(value));
    used.add(number); return number;
  });
}
function hydrate(raw){
  const leagueAvg = Math.round(raw.flatMap(club => club.players).reduce((total, player) => total + player[4], 0) / raw.flatMap(club => club.players).length);
  return raw.map(club => {
    const players = club.players.map(args => P(...args)); const numbers = squadNumbers(players);
    return {...club, leagueAvg, players:players.map((player, index) => ({...player, id:stablePlayerId(club.id, player.slug), club:club.id, number:numbers[index], loan:false, condition:100, energy:100, appearances:0}))};
  });
}

export function buildClubs(){ return hydrate(RAW_PLCLUBS); }
export function buildChampionshipClubs(){ return hydrate(RAW_CHAMPIONSHIPCLUBS); }
export function buildLaLigaClubs(){ return hydrate(RAW_LALIGACLUBS); }
export function buildSerieAClubs(){ return hydrate(RAW_SERIEACLUBS); }
export function buildBundesligaClubs(){ return hydrate(RAW_BUNDESLIGACLUBS); }
export function buildLigue1Clubs(){ return hydrate(RAW_LIGUE1CLUBS); }
