import { PlayerCard, Role, Rarity } from '../src/types/types';

const createPlayer = (name: string, team: string, role: Role, overall: number, ageOverride?: number, nationality: string = 'KR', potential?: 'A' | 'B' | 'C' | 'S', signatureChampions?: string[]): PlayerCard => {
  let rarity = Rarity.COMMON;
  if (overall >= 90) rarity = Rarity.LEGENDARY;
  else if (overall >= 84) rarity = Rarity.EPIC;
  else if (overall >= 75) rarity = Rarity.RARE;

  const variance = () => Math.floor(Math.random() * 6) - 3;
  
  const salaryBase = Math.floor(Math.pow(overall - 60, 2) * 0.8);
  const salary = Math.max(20, salaryBase);

  const transferFee = Math.floor(salary * 2.5);

  let age = 19;
  if (ageOverride) {
    age = ageOverride;
  } else {
    if (overall > 92) age = 26; 
    else if (overall > 85) age = Math.floor(Math.random() * 4) + 21; 
    else age = Math.floor(Math.random() * 4) + 17; 
  }

  let finalPotential = potential;
  if (!finalPotential) {
    if (age < 20 && overall > 80) finalPotential = 'S';
    else if (age < 22) finalPotential = 'A';
    else if (age < 26) finalPotential = 'B';
    else finalPotential = 'C';
  }
  
  const uniqueId = `${name.toLowerCase().replace(/\s/g, '-')}-${team.toLowerCase()}`;

  return {
    id: uniqueId,
    name,
    team,
    role,
    overall,
    previousOverall: overall,
    country: nationality,
    age,
    price: transferFee,
    salary: salary,
    contractDuration: Math.floor(Math.random() * 3) + 1,
    rarity,
    stats: {
      mechanics: Math.min(99, overall + variance()),
      macro: Math.min(99, overall + variance()),
      lane: Math.min(99, overall + variance()),
      teamfight: Math.min(99, overall + variance()),
    },
    morale: 50,
    imageUrl: `/players/${name.toLowerCase().replace(/\s/g, '-')}.png`,
  };
};

export const REAL_LCK_PLAYERS: PlayerCard[] = [
  // T1 (World Champions - Young/Prime mix + Faker)
  createPlayer('Zeus', 'T1', Role.TOP, 94, 20, 'KR', 'S', ['Jayce', 'Gnar', 'Yone']),
  createPlayer('Oner', 'T1', Role.JUNGLE, 92, 21, 'KR', 'A', ['Lee Sin', 'Viego', 'Jarvan IV']),
  createPlayer('Faker', 'T1', Role.MID, 95, 28, 'KR', 'S', ['Azir', 'Ryze', 'Orianna']),
  createPlayer('Gumayusi', 'T1', Role.ADC, 93, 22, 'KR', 'A', ['Jinx', 'Varus', 'Aphelios']),
  createPlayer('Keria', 'T1', Role.SUPPORT, 94, 21, 'KR', 'S', ['Thresh', 'Kalista', 'Lux']),

  // Gen.G (Super Team - Prime Veterans)
  createPlayer('Kiin', 'GEN', Role.TOP, 93, 24, 'KR', 'B', ['Kennen', 'Kled', 'Gnar']),
  createPlayer('Canyon', 'GEN', Role.JUNGLE, 95, 22),
  createPlayer('Chovy', 'GEN', Role.MID, 96, 23),
  createPlayer('Peyz', 'GEN', Role.ADC, 89, 25),
  createPlayer('Duro', 'GEN', Role.SUPPORT, 82, 19),

  // HLE (Strong Vets)
  createPlayer('Doran', 'HLE', Role.TOP, 89, 23),
  createPlayer('Peanut', 'HLE', Role.JUNGLE, 91, 26),
  createPlayer('Zeka', 'HLE', Role.MID, 92, 21),
  createPlayer('Viper', 'HLE', Role.ADC, 94, 23),
  createPlayer('Delight', 'HLE', Role.SUPPORT, 90, 21),

  // DK
  createPlayer('Siwoo', 'DK', Role.TOP, 78, 18),
  createPlayer('Lucid', 'DK', Role.JUNGLE, 85, 19),
  createPlayer('ShowMaker', 'DK', Role.MID, 91, 23, 'KR', 'B', ['Katarina', 'LeBlanc', 'Twisted Fate']),
  createPlayer('Aiming', 'DK', Role.ADC, 90, 23),
  createPlayer('BeryL', 'DK', Role.SUPPORT, 88, 26),

  // KT
  createPlayer('PerfecT', 'KT', Role.TOP, 80, 19),
  createPlayer('Cuzz', 'KT', Role.JUNGLE, 87, 24),
  createPlayer('Bdd', 'KT', Role.MID, 89, 25),
  createPlayer('deokdam', 'KT', Role.ADC, 85, 24),
  createPlayer('Way', 'KT', Role.SUPPORT, 75, 19), 
  createPlayer('Peter', 'KT', Role.SUPPORT, 78, 20), 

  // DRX
  createPlayer('Rich', 'DRX', Role.TOP, 79, 26),
  createPlayer('Sponge', 'DRX', Role.JUNGLE, 77, 20),
  createPlayer('Kyeahoo', 'DRX', Role.MID, 76, 20),
  createPlayer('Teddy', 'DRX', Role.ADC, 86, 26),
  createPlayer('Pleata', 'DRX', Role.SUPPORT, 77, 21),

  // FOX (FearX)
  createPlayer('Clear', 'FOX', Role.TOP, 81, 21),
  createPlayer('Raptor', 'FOX', Role.JUNGLE, 80, 21),
  createPlayer('VicLa', 'FOX', Role.MID, 82, 20),
  createPlayer('Diable', 'FOX', Role.ADC, 78, 19),
  createPlayer('Kellin', 'FOX', Role.SUPPORT, 83, 23),

  // NS (Nongshim)
  createPlayer('DnDn', 'NS', Role.TOP, 77, 20), 
  createPlayer('Sylvie', 'NS', Role.JUNGLE, 78, 20), 
  createPlayer('Fisher', 'NS', Role.MID, 79, 19),
  createPlayer('Jiwoo', 'NS', Role.ADC, 84, 19),
  createPlayer('Vital', 'NS', Role.SUPPORT, 76, 20),

  // KDF (Freecs)
  createPlayer('DuDu', 'KDF', Role.TOP, 85, 22),
  createPlayer('Pyosik', 'KDF', Role.JUNGLE, 86, 22),
  createPlayer('BuLLDoG', 'KDF', Role.MID, 81, 19),
  createPlayer('Berserker', 'KDF', Role.ADC, 88, 20),
  createPlayer('Life', 'KDF', Role.SUPPORT, 84, 21),

  // BRO (Brion)
  createPlayer('Morgan', 'BRO', Role.TOP, 78, 22),
  createPlayer('HamBak', 'BRO', Role.JUNGLE, 75, 19),
  createPlayer('Clozer', 'BRO', Role.MID, 83, 20),
  createPlayer('Hype', 'BRO', Role.ADC, 76, 19),
  createPlayer('Pollu', 'BRO', Role.SUPPORT, 75, 19),

  // Subs / Others 
  createPlayer('Andil', 'FA', Role.SUPPORT, 74, 20),
  createPlayer('Bull', 'FA', Role.ADC, 75, 20),
  createPlayer('Calix', 'FA', Role.MID, 72, 18),
  createPlayer('Casting', 'FA', Role.MID, 70, 18), 
  createPlayer('Croco', 'FA', Role.JUNGLE, 82, 23),
  createPlayer('Daystar', 'FA', Role.MID, 73, 19),
  createPlayer('DDoiV', 'FA', Role.TOP, 70, 19),
  createPlayer('Ellim', 'FA', Role.JUNGLE, 76, 23),
  createPlayer('GIDEON', 'FA', Role.JUNGLE, 80, 22),
  createPlayer('Lehends', 'FA', Role.SUPPORT, 89, 25),
  createPlayer('Paduck', 'FA', Role.ADC, 74, 19),
  createPlayer('Pungyeon', 'FA', Role.MID, 71, 19), 
  createPlayer('Quantum', 'FA', Role.SUPPORT, 70, 18),
  createPlayer('Smash', 'FA', Role.ADC, 80, 18),
  createPlayer('Soboro', 'FA', Role.TOP, 73, 21),
  createPlayer('ucal', 'FA', Role.MID, 81, 23),
  createPlayer('JeongHoon', 'FA', Role.SUPPORT, 79, 23), 
];

export const REAL_LEC_PLAYERS: PlayerCard[] = [
  // G2 Esports
  createPlayer('BrokenBlade', 'G2', Role.TOP, 89, 24, 'TR', 'B', ['Camille', 'Irelia', 'Jax']),
  createPlayer('Yike', 'G2', Role.JUNGLE, 87, 23, 'SE'),
  createPlayer('Caps', 'G2', Role.MID, 90, 24, 'DK', 'A', ['LeBlanc', 'Sylas', 'Yasuo']),
  createPlayer('Hans sama', 'G2', Role.ADC, 85, 25, 'FR'),
  createPlayer('Mikyx', 'G2', Role.SUPPORT, 83, 25, 'SI', 'B', ['Rakan', 'Pyke']),

  // Fnatic
  createPlayer('Oscarinin', 'FNC', Role.TOP, 81, 20, 'ES'),
  createPlayer('Razork', 'FNC', Role.JUNGLE, 82, 23, 'ES'),
  createPlayer('Humanoid', 'FNC', Role.MID, 79, 24, 'CZ'),
  createPlayer('Noah', 'FNC', Role.ADC, 80, 22, 'KR'),
  createPlayer('Jun', 'FNC', Role.SUPPORT, 81, 23, 'KR'),

  // Team BDS
  createPlayer('Adam', 'BDS', Role.TOP, 80, 22, 'FR'),
  createPlayer('Sheo', 'BDS', Role.JUNGLE, 78, 22, 'FR'),
  createPlayer('nuc', 'BDS', Role.MID, 79, 21, 'FR'),
  createPlayer('Ice', 'BDS', Role.ADC, 84, 20, 'KR'),
  createPlayer('Labrov', 'BDS', Role.SUPPORT, 81, 22, 'GR'),
  
  // Team Heretics
  createPlayer('Wunder', 'TH', Role.TOP, 83, 25, 'DK'),
  createPlayer('Jankos', 'TH', Role.JUNGLE, 86, 28, 'PL', 'C', ['Lee Sin', 'Elise', 'Sejuani']),
  createPlayer('Zwyroo', 'TH', Role.MID, 77, 25, 'PL'),
  createPlayer('Flakked', 'TH', Role.ADC, 81, 22, 'ES'),
  createPlayer('Kaiser', 'TH', Role.SUPPORT, 84, 25, 'DE'),

  // GIANTX
  createPlayer('Odoamne', 'GX', Role.TOP, 82, 29, 'RO'),
  createPlayer('Peach', 'GX', Role.JUNGLE, 79, 22, 'KR'),
  createPlayer('Jackies', 'GX', Role.MID, 80, 23, 'CZ'),
  createPlayer('Patrik', 'GX', Role.ADC, 83, 23, 'CZ'),
  createPlayer('IgNar', 'GX', Role.SUPPORT, 82, 27, 'KR'),

  // Karmine Corp
  createPlayer('Cabochard', 'KC', Role.TOP, 84, 27, 'FR'),
  createPlayer('Bo', 'KC', Role.JUNGLE, 85, 21, 'CN', 'A', ['Viego', 'Kindred']),
  createPlayer('Vladi', 'KC', Role.MID, 78, 19, 'CZ'),
  createPlayer('Upset', 'KC', Role.ADC, 88, 24, 'DE'),
  createPlayer('Targamas', 'KC', Role.SUPPORT, 82, 23, 'BE'),

  // Movistar KOI
  createPlayer('Myrwn', 'KOI', Role.TOP, 80, 22, 'ES'),
  createPlayer('Elyoya', 'KOI', Role.JUNGLE, 88, 24, 'ES'),
  createPlayer('Sertuss', 'KOI', Role.MID, 79, 22, 'DE'),
  createPlayer('Supa', 'KOI', Role.ADC, 82, 19, 'ES'),
  createPlayer('Alvaro', 'KOI', Role.SUPPORT, 80, 21, 'ES'),

  // Rogue
  createPlayer('Szygenda', 'RGE', Role.TOP, 78, 22, 'DK'),
  createPlayer('Markoon', 'RGE', Role.JUNGLE, 81, 21, 'NL'),
  createPlayer('Larssen', 'RGE', Role.MID, 84, 24, 'SE'),
  createPlayer('Comp', 'RGE', Role.ADC, 83, 22, 'GR'),
  createPlayer('Zoelys', 'RGE', Role.SUPPORT, 77, 19, 'FR'),

  // SK Gaming
  createPlayer('Irrelevant', 'SK', Role.TOP, 79, 21, 'DE'),
  createPlayer('Isma', 'SK', Role.JUNGLE, 78, 20, 'BE'),
  createPlayer('Nisqy', 'SK', Role.MID, 86, 25, 'BE'),
  createPlayer('Exakick', 'SK', Role.ADC, 82, 21, 'FR'),
  createPlayer('Doss', 'SK', Role.SUPPORT, 80, 24, 'DK'),

  // Team Vitality
  createPlayer('Photon', 'VIT', Role.TOP, 87, 22, 'KR'),
  createPlayer('Daglas', 'VIT', Role.JUNGLE, 83, 19, 'PL'),
  createPlayer('Vetheo', 'VIT', Role.MID, 85, 21, 'FR'),
  createPlayer('Carzzy', 'VIT', Role.ADC, 84, 22, 'CZ'),
  createPlayer('Hylissang', 'VIT', Role.SUPPORT, 86, 28, 'BG'),

  // Subs / Others (LEC Free Agents)
  createPlayer('Perkz', 'FA', Role.MID, 87, 25, 'HR', 'B', ['LeBlanc', 'Yasuo', 'Zoe']),
  createPlayer('Rekkles', 'FA', Role.ADC, 86, 27, 'SE', 'C', ['Tristana', 'Sivir', 'Kennen']),
  createPlayer('Jackspektra', 'FA', Role.ADC, 80, 23, 'NO'),
  createPlayer('Finn', 'FA', Role.TOP, 80, 24, 'SE'),
  createPlayer('Inspired', 'FA', Role.JUNGLE, 85, 22, 'PL'),
  createPlayer('Trymbi', 'FA', Role.SUPPORT, 78, 23, 'PL'),
];

export const REAL_TCL_PLAYERS: PlayerCard[] = [
  // Papara SuperMassive
  createPlayer('Armut', 'SUP', Role.TOP, 85, 24, 'TR'),
  createPlayer('Ksaez', 'SUP', Role.MID, 83, 22, 'TR'),
  createPlayer('Fleshy', 'SUP', Role.SUPPORT, 81, 23, 'TR'),

  // Beşiktaş Esports
  createPlayer('StarScreen', 'BJK', Role.TOP, 82, 23, 'TR'),
  createPlayer('Robin', 'BJK', Role.JUNGLE, 80, 21, 'TR'),
  createPlayer('Umut', 'BJK', Role.MID, 79, 20, 'TR'),

  // Galatasaray Esports
  createPlayer('Crazy', 'GS', Role.TOP, 81, 26, 'KR'),
  createPlayer('Elramir', 'GS', Role.JUNGLE, 84, 21, 'TR'),
  createPlayer('Pannon', 'GS', Role.SUPPORT, 80, 22, 'TR'),

  // Fenerbahçe Esports
  createPlayer('BAO', 'FB', Role.ADC, 83, 23, 'KR'),
  createPlayer('Absolute', 'FB', Role.SUPPORT, 78, 24, 'TR'),
];

export const REAL_LPL_PLAYERS: PlayerCard[] = [
  // Bilibili Gaming
  createPlayer('Bin', 'BLG', Role.TOP, 94, 21, 'CN', 'S', ['Jax', 'Fiora', 'Camille']),
  createPlayer('Xun', 'BLG', Role.JUNGLE, 92, 22, 'CN'),
  createPlayer('knight', 'BLG', Role.MID, 96, 24, 'CN', 'S', ['Sylas', 'Jayce', 'Ahri']),
  createPlayer('Elk', 'BLG', Role.ADC, 93, 22, 'CN'),
  createPlayer('ON', 'BLG', Role.SUPPORT, 88, 21, 'CN', 'A', ['Rakan', 'Nautilus']),

  // JDG Intel Esports Club
  createPlayer('Flandre', 'JDG', Role.TOP, 86, 26, 'CN'),
  createPlayer('Kanavi', 'JDG', Role.JUNGLE, 95, 24, 'KR'),
  createPlayer('Yagao', 'JDG', Role.MID, 89, 26, 'CN'),
  createPlayer('Ruler', 'JDG', Role.ADC, 95, 26, 'KR'),
  createPlayer('MISSING', 'JDG', Role.SUPPORT, 87, 25, 'KR'),

  // Top Esports
  createPlayer('369', 'TES', Role.TOP, 92, 23, 'CN'),
  createPlayer('Tian', 'TES', Role.JUNGLE, 93, 24, 'CN'),
  createPlayer('Creme', 'TES', Role.MID, 90, 20, 'CN', 'A', ['Akali', 'Sylas']),
  createPlayer('JackeyLove', 'TES', Role.ADC, 92, 24, 'CN', 'A', ['Draven', 'Kai\'Sa']),
  createPlayer('Meiko', 'TES', Role.SUPPORT, 91, 26, 'CN', 'B', ['Thresh', 'Lulu']),

  // LNG Esports
  createPlayer('Zika', 'LNG', Role.TOP, 88, 22, 'CN'),
  createPlayer('Weiwei', 'LNG', Role.JUNGLE, 87, 24, 'CN'),
  createPlayer('Scout', 'LNG', Role.MID, 94, 26, 'KR', 'B', ['Zoe', 'LeBlanc', 'Corki']),
  createPlayer('GALA', 'LNG', Role.ADC, 93, 23, 'CN'),
  createPlayer('Hang', 'LNG', Role.SUPPORT, 86, 21, 'CN'),

  // Weibo Gaming
  createPlayer('YSKM', 'WBG', Role.TOP, 84, 20, 'HK'),
  createPlayer('Xiaohao', 'WBG', Role.JUNGLE, 84, 21, 'CN'),
  createPlayer('Xiaohu', 'WBG', Role.MID, 91, 26, 'CN'),
  createPlayer('Light', 'WBG', Role.ADC, 89, 23, 'CN'),
  createPlayer('Crisp', 'WBG', Role.SUPPORT, 89, 26, 'CN'),

  // Anyone's Legend
  createPlayer('Hery', 'AL', Role.TOP, 82, 21, 'CN'),
  createPlayer('Croco', 'AL', Role.JUNGLE, 82, 24, 'KR'),
  createPlayer('Shanks', 'AL', Role.MID, 84, 22, 'CN'),
  createPlayer('Hope', 'AL', Role.ADC, 85, 23, 'KR'),
  createPlayer('SwordArt', 'AL', Role.SUPPORT, 83, 27, 'TW'),

  // EDward Gaming
  createPlayer('Ale', 'EDG', Role.TOP, 85, 23, 'CN'),
  createPlayer('Monki', 'EDG', Role.JUNGLE, 80, 20, 'CN'),
  createPlayer('Fisher', 'EDG', Role.MID, 84, 20, 'KR'),
  createPlayer('Leave', 'EDG', Role.ADC, 85, 21, 'CN'),
  createPlayer('Vampire', 'EDG', Role.SUPPORT, 81, 20, 'CN'),

  // FunPlus Phoenix
  createPlayer('Xiaolaohu', 'FPX', Role.TOP, 83, 21, 'CN'),
  createPlayer('milkyway', 'FPX', Role.JUNGLE, 86, 19, 'CN'),
  createPlayer('Care', 'FPX', Role.MID, 81, 21, 'CN'),
  createPlayer('Deokdam', 'FPX', Role.ADC, 85, 25, 'KR'),
  createPlayer('Life', 'FPX', Role.SUPPORT, 84, 22, 'KR'),

  // Invictus Gaming
  createPlayer('TheShy', 'IG', Role.TOP, 93, 25, 'KR'),
  createPlayer('Leyan', 'IG', Role.JUNGLE, 81, 22, 'CN'),
  createPlayer('Cryin', 'IG', Role.MID, 84, 24, 'CN'),
  createPlayer('Ahn', 'IG', Role.ADC, 82, 21, 'CN'),
  createPlayer('Wink', 'IG', Role.SUPPORT, 80, 24, 'CN'),

  // Ninjas in Pyjamas
  createPlayer('shanji', 'NIP', Role.TOP, 87, 22, 'CN'),
  createPlayer('Aki', 'NIP', Role.JUNGLE, 85, 24, 'CN'),
  createPlayer('Rookie', 'NIP', Role.MID, 90, 28, 'KR', 'C', ['Orianna', 'LeBlanc', 'Syndra']),
  createPlayer('Photic', 'NIP', Role.ADC, 88, 22, 'CN'),
  createPlayer('Zhuo', 'NIP', Role.SUPPORT, 84, 23, 'CN'),

  // Oh My God
  createPlayer('Cube', 'OMG', Role.TOP, 83, 22, 'CN'),
  createPlayer('Angel', 'OMG', Role.MID, 85, 23, 'CN'),
  createPlayer('Able', 'OMG', Role.ADC, 82, 23, 'CN'),
  createPlayer('ppgod', 'OMG', Role.SUPPORT, 81, 23, 'CN'),

  // Team WE
  createPlayer('Wayward', 'WE', Role.TOP, 84, 22, 'CN'),
  createPlayer('Heng', 'WE', Role.JUNGLE, 82, 21, 'CN'),
  createPlayer('FoFo', 'WE', Role.MID, 86, 25, 'TW'),
  createPlayer('LP', 'WE', Role.ADC, 83, 23, 'CN'),
  createPlayer('Iwandy', 'WE', Role.SUPPORT, 85, 23, 'CN'),

  // Ultra Prime
  createPlayer('Decade', 'UP', Role.TOP, 79, 22, 'CN'),
  createPlayer('H4cker', 'UP', Role.JUNGLE, 80, 26, 'CN'),
  createPlayer('Forge', 'UP', Role.MID, 82, 23, 'CN'),
  createPlayer('Doggo', 'UP', Role.ADC, 84, 21, 'TW'),
  createPlayer('Niket', 'UP', Role.SUPPORT, 78, 20, 'CN'),

  // LPL Free Agents
  createPlayer('Gori', 'FA', Role.MID, 83, 24, 'KR'),
  createPlayer('Jiejie', 'FA', Role.JUNGLE, 88, 23, 'CN'),
  createPlayer('Uzi', 'FA', Role.ADC, 88, 27, 'CN', 'C', ['Vayne', 'Kai\'Sa', 'Ezreal']),
  createPlayer('Ming', 'FA', Role.SUPPORT, 87, 26, 'CN'),
  createPlayer('Ning', 'FA', Role.JUNGLE, 86, 26, 'CN'),
  createPlayer('Doinb', 'FA', Role.MID, 88, 27, 'KR', 'C', ['Kled', 'Nautilus', 'Ryze']),
  createPlayer('Lwx', 'FA', Role.ADC, 86, 26, 'CN'),
];

export const REAL_LCP_PLAYERS: PlayerCard[] = [
  // PSG Talon
  createPlayer('Azhi', 'PSG', Role.TOP, 81, 23, 'TW'),
  createPlayer('JunJia', 'PSG', Role.JUNGLE, 86, 22, 'TW'),
  createPlayer('Maple', 'PSG', Role.MID, 88, 27, 'TW'),
  createPlayer('Betty', 'PSG', Role.ADC, 83, 24, 'TW'),
  createPlayer('Woody', 'PSG', Role.SUPPORT, 79, 21, 'TW'),

  // GAM Esports
  createPlayer('Kiaya', 'GAM', Role.TOP, 85, 23, 'VN'),
  createPlayer('Levi', 'GAM', Role.JUNGLE, 89, 27, 'VN'),
  createPlayer('Emo', 'GAM', Role.MID, 78, 19, 'VN'),
  createPlayer('EasyLove', 'GAM', Role.ADC, 79, 23, 'VN'),
  createPlayer('Elio', 'GAM', Role.SUPPORT, 77, 22, 'VN'),

  // Vikings Esports (VKE)
  createPlayer('Nanaue', 'VKE', Role.TOP, 76, 19, 'VN'),
  createPlayer('Gury', 'VKE', Role.JUNGLE, 78, 21, 'VN'),
  createPlayer('Kati', 'VKE', Role.MID, 82, 24, 'VN'),
  createPlayer('Shogun', 'VKE', Role.ADC, 84, 20, 'VN'),
  createPlayer('Bie', 'VKE', Role.SUPPORT, 80, 23, 'VN'),

  // Fukuoka SoftBank HAWKS (SHG)
  createPlayer('Evi', 'SHG', Role.TOP, 83, 28, 'JP'),
  createPlayer('Forest', 'SHG', Role.JUNGLE, 79, 22, 'KR'),
  createPlayer('Dasher', 'SHG', Role.MID, 78, 23, 'KR'),
  createPlayer('Marble', 'SHG', Role.ADC, 77, 20, 'JP'),
  createPlayer('Vsta', 'SHG', Role.SUPPORT, 78, 23, 'KR'),

  // CTBC Flying Oyster (CFO)
  createPlayer('Rest', 'CFO', Role.TOP, 80, 25, 'TW'),
  createPlayer('Karsa', 'CFO', Role.JUNGLE, 84, 27, 'TW'),
  createPlayer('Gori', 'CFO', Role.MID, 82, 23, 'KR'),
  createPlayer('Shunn', 'CFO', Role.ADC, 78, 21, 'TW'),
  createPlayer('SwordArt', 'CFO', Role.SUPPORT, 81, 27, 'TW'),

  // Frank Esports (FAK)
  createPlayer('Solokill', 'FAK', Role.TOP, 77, 21, 'HK'),
  createPlayer('Gemini', 'FAK', Role.JUNGLE, 79, 23, 'TW'),
  createPlayer('JimieN', 'FAK', Role.MID, 80, 21, 'TW'),
  createPlayer('MnM', 'FAK', Role.ADC, 78, 24, 'HK'),
  createPlayer('Kaiwing', 'FAK', Role.SUPPORT, 79, 26, 'HK'),

  // Deep Cross Gaming (DCG)
  createPlayer('Taco', 'DCG', Role.TOP, 76, 20, 'TW'),
  createPlayer('665', 'DCG', Role.JUNGLE, 77, 21, 'TW'),
  createPlayer('Cryscata', 'DCG', Role.MID, 79, 20, 'TW'),
  createPlayer('Tide', 'DCG', Role.ADC, 75, 19, 'TW'),
  createPlayer('Orca', 'DCG', Role.SUPPORT, 76, 20, 'TW'),

  // Chiefs Esports Club (CHF) - LCO Temsilcisi
  createPlayer('BioPanther', 'CHF', Role.TOP, 78, 24, 'AU'),
  createPlayer('Arthur', 'CHF', Role.JUNGLE, 80, 22, 'KR'),
  createPlayer('Tally', 'CHF', Role.MID, 77, 26, 'AU'),
  createPlayer('Raes', 'CHF', Role.ADC, 79, 25, 'NZ'),
  createPlayer('Aladoric', 'CHF', Role.SUPPORT, 76, 23, 'AU')
];

// --- LTA NORTH PLAYERS (Latin Amerika) ---
export const REAL_LTA_NORTH_PLAYERS: PlayerCard[] = [
  // Movistar R7
  createPlayer('Summit', 'R7', Role.TOP, 86, 26, 'KR'),
  createPlayer('Oddie', 'R7', Role.JUNGLE, 82, 26, 'PE'),
  createPlayer('Keine', 'R7', Role.MID, 83, 22, 'KR'),
  createPlayer('Ceo', 'R7', Role.ADC, 84, 20, 'AR'),
  createPlayer('Lyonz', 'R7', Role.SUPPORT, 80, 21, 'AR'),

  // Estral Esports
  createPlayer('Zothve', 'EST', Role.TOP, 78, 20, 'CL'),
  createPlayer('Josedeodo', 'EST', Role.JUNGLE, 83, 24, 'AR'),
  createPlayer('Cody', 'EST', Role.MID, 81, 25, 'CL'),
  createPlayer('Snaker', 'EST', Role.ADC, 79, 22, 'AR'),
  createPlayer('Ackerman', 'EST', Role.SUPPORT, 80, 23, 'AR'),

  // Isurus
  createPlayer('Pan', 'ISG', Role.TOP, 77, 21, 'AR'),
  createPlayer('Kiny', 'ISG', Role.JUNGLE, 76, 20, 'MX'),
  createPlayer('Seiya', 'ISG', Role.MID, 79, 27, 'MX'),
  createPlayer('Gavotto', 'ISG', Role.ADC, 78, 23, 'MX'),
  createPlayer('Jelly', 'ISG', Role.SUPPORT, 79, 24, 'KR'),

  // Six Karma
  createPlayer('Meaning', '6K', Role.TOP, 76, 20, 'KR'),
  createPlayer('OnFleek', '6K', Role.JUNGLE, 80, 25, 'KR'),
  createPlayer('Kz', '6K', Role.MID, 77, 21, 'CL'),
  createPlayer('5kid', '6K', Role.ADC, 76, 22, 'KR'),
  createPlayer('IgnaVilu', '6K', Role.SUPPORT, 75, 20, 'AR'),

  // Infinity
  createPlayer('Buggax', 'INF', Role.TOP, 78, 25, 'UY'),
  createPlayer('Solid', 'INF', Role.JUNGLE, 76, 23, 'PE'),
  createPlayer('TopLop', 'INF', Role.MID, 75, 21, 'CL'),
  createPlayer('WhiteLotus', 'INF', Role.ADC, 80, 26, 'AR'),
  createPlayer('Ackerman', 'INF', Role.SUPPORT, 77, 22, 'AR'), // Aynı isimli oyuncu olabilir

  // All Knights
  createPlayer('Hirit', 'AK', Role.TOP, 81, 24, 'KR'),
  createPlayer('Grell', 'AK', Role.JUNGLE, 79, 22, 'MX'),
  createPlayer('Leza', 'AK', Role.MID, 77, 23, 'MX'),
  createPlayer('Trigo', 'AK', Role.ADC, 78, 21, 'BR'),
  createPlayer('Gastruks', 'AK', Role.SUPPORT, 75, 23, 'AR'),

  // 100 Thieves (LTA North'a geçtiği varsayımıyla veya partner olarak)
  createPlayer('Sniper', '100T', Role.TOP, 80, 18, 'CA'),
  createPlayer('River', '100T', Role.JUNGLE, 83, 24, 'KR'),
  createPlayer('Quid', '100T', Role.MID, 81, 20, 'KR'),
  createPlayer('Tomo', '100T', Role.ADC, 79, 23, 'US'),
  createPlayer('Eyla', '100T', Role.SUPPORT, 80, 24, 'AU'),

  // Disguised (DSG) - Konuk Takım
  createPlayer('FakeGod', 'DSG', Role.TOP, 77, 23, 'US'),
  createPlayer('Tomio', 'DSG', Role.JUNGLE, 76, 21, 'CA'),
  createPlayer('Young', 'DSG', Role.MID, 75, 20, 'US'),
  createPlayer('Meech', 'DSG', Role.ADC, 78, 22, 'US'),
  createPlayer('Zeyzal', 'DSG', Role.SUPPORT, 79, 25, 'US'),
];

// --- LTA SOUTH PLAYERS (Brezilya) ---
export const REAL_LTA_SOUTH_PLAYERS: PlayerCard[] = [
  // paiN Gaming
  createPlayer('Wizer', 'PNG', Role.TOP, 83, 25, 'KR'),
  createPlayer('Cariok', 'PNG', Role.JUNGLE, 81, 24, 'BR'),
  createPlayer('dyNquedo', 'PNG', Role.MID, 82, 26, 'BR'),
  createPlayer('TitaN', 'PNG', Role.ADC, 84, 23, 'BR'),
  createPlayer('Kuri', 'PNG', Role.SUPPORT, 80, 23, 'KR'),

  // LOUD
  createPlayer('Robo', 'LLL', Role.TOP, 82, 26, 'BR'),
  createPlayer('Croc', 'LLL', Role.JUNGLE, 83, 25, 'KR'),
  createPlayer('Tinowns', 'LLL', Role.MID, 84, 26, 'BR'),
  createPlayer('Route', 'LLL', Role.ADC, 85, 24, 'KR'),
  createPlayer('RedBert', 'LLL', Role.SUPPORT, 78, 25, 'BR'),

  // FURIA
  createPlayer('Zwyroo', 'FUR', Role.TOP, 77, 24, 'BR'),
  createPlayer('Wiz', 'FUR', Role.JUNGLE, 79, 25, 'KR'),
  createPlayer('Tutsz', 'FUR', Role.MID, 78, 21, 'BR'),
  createPlayer('Ayu', 'FUR', Role.ADC, 76, 19, 'BR'),
  createPlayer('Jojo', 'FUR', Role.SUPPORT, 77, 24, 'BR'),

  // RED Canids
  createPlayer('fNb', 'RED', Role.TOP, 81, 24, 'BR'),
  createPlayer('Aegis', 'RED', Role.JUNGLE, 78, 20, 'BR'),
  createPlayer('Grevthar', 'RED', Role.MID, 77, 25, 'BR'),
  createPlayer('Brance', 'RED', Role.ADC, 82, 20, 'BR'),
  createPlayer('Frosty', 'RED', Role.SUPPORT, 76, 19, 'BR'),

  // Vivo Keyd Stars (VKS)
  createPlayer('Guigo', 'VKS', Role.TOP, 78, 21, 'BR'),
  createPlayer('Disamis', 'VKS', Role.JUNGLE, 79, 20, 'BR'),
  createPlayer('Toucouille', 'VKS', Role.MID, 81, 22, 'FR'),
  createPlayer('SMILEY', 'VKS', Role.ADC, 78, 24, 'SE'),
  createPlayer('ProDelta', 'VKS', Role.SUPPORT, 76, 21, 'BR'),

  // Fluxo (FX)
  createPlayer('Kiari', 'FX', Role.TOP, 75, 21, 'BR'),
  createPlayer('St1ng', 'FX', Role.JUNGLE, 76, 20, 'BR'),
  createPlayer('Fuuuu', 'FX', Role.MID, 74, 19, 'BR'),
  createPlayer('Trigo', 'FX', Role.ADC, 77, 22, 'BR'),
  createPlayer('Scamber', 'FX', Role.SUPPORT, 75, 23, 'BR'),

  // KaBuM! Esports (KBM)
  createPlayer('Lonely', 'KBM', Role.TOP, 78, 24, 'KR'),
  createPlayer('Malrang', 'KBM', Role.JUNGLE, 80, 23, 'KR'),
  createPlayer('Hauz', 'KBM', Role.MID, 77, 22, 'BR'),
  createPlayer('Netuno', 'KBM', Role.ADC, 79, 21, 'BR'),
  createPlayer('Ceos', 'KBM', Role.SUPPORT, 78, 24, 'BR'),

  // Liberty (LBR)
  createPlayer('Makes', 'LBR', Role.TOP, 74, 20, 'BR'),
  createPlayer('Drakehero', 'LBR', Role.JUNGLE, 73, 21, 'BR'),
  createPlayer('Piloto', 'LBR', Role.MID, 75, 22, 'BR'),
  createPlayer('Micao', 'LBR', Role.ADC, 76, 26, 'BR'),
  createPlayer('Cavalo', 'LBR', Role.SUPPORT, 74, 20, 'BR'),
];