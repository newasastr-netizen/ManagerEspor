import { PlayerCard, Role, Rarity } from '../types';

// Helper to create players
const createPlayer = (name: string, team: string, role: Role, overall: number, ageOverride?: number): PlayerCard => {
  let rarity = Rarity.COMMON;
  if (overall >= 90) rarity = Rarity.LEGENDARY;
  else if (overall >= 84) rarity = Rarity.EPIC;
  else if (overall >= 75) rarity = Rarity.RARE;

  // Derive granular stats from overall for simplicity, adding some variance
  const variance = () => Math.floor(Math.random() * 6) - 3;
  
  // Salary Calculation
  const salaryBase = Math.floor(Math.pow(overall - 60, 2) * 0.8);
  const salary = Math.max(20, salaryBase);

  // Transfer Fee (Bonservis)
  const transferFee = Math.floor(salary * 2.5);

  // Determine Age based on "career stage" implied by rating/name if not provided
  // High rating usually means Prime (21-24) or Vet (25+). Low rating often Rookie (17-20).
  let age = 19;
  if (ageOverride) {
    age = ageOverride;
  } else {
    if (overall > 92) age = 26; // Legends usually older
    else if (overall > 85) age = Math.floor(Math.random() * 4) + 21; // 21-24
    else age = Math.floor(Math.random() * 4) + 17; // 17-20
  }

  // CRITICAL FIX: Include team in ID to prevent duplicates (e.g. Aiming DK vs Aiming FA)
  const uniqueId = `${name.toLowerCase().replace(/\s/g, '-')}-${team.toLowerCase()}`;

  return {
    id: uniqueId,
    name,
    team,
    role,
    overall,
    previousOverall: overall, // Initialize with current
    age,
    price: transferFee,
    salary: salary,
    contractDuration: Math.floor(Math.random() * 3) + 1, // 1 to 3 seasons
    rarity,
    stats: {
      mechanics: Math.min(99, overall + variance()),
      macro: Math.min(99, overall + variance()),
      lane: Math.min(99, overall + variance()),
      teamfight: Math.min(99, overall + variance()),
    },
    imageUrl: `/players/${name.toLowerCase().replace(/\s/g, '-')}.png`,
  };
};

export const REAL_LCK_PLAYERS: PlayerCard[] = [
  // T1 (World Champions - Young/Prime mix + Faker)
  createPlayer('Zeus', 'T1', Role.TOP, 94, 20),
  createPlayer('Oner', 'T1', Role.JUNGLE, 92, 21),
  createPlayer('Faker', 'T1', Role.MID, 95, 28),
  createPlayer('Gumayusi', 'T1', Role.ADC, 93, 22),
  createPlayer('Keria', 'T1', Role.SUPPORT, 94, 21),

  // Gen.G (Super Team - Prime Veterans)
  createPlayer('Kiin', 'GEN', Role.TOP, 93, 24),
  createPlayer('Canyon', 'GEN', Role.JUNGLE, 95, 22),
  createPlayer('Chovy', 'GEN', Role.MID, 96, 23),
  createPlayer('Ruler', 'GEN', Role.ADC, 95, 25),
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
  createPlayer('ShowMaker', 'DK', Role.MID, 91, 23),
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