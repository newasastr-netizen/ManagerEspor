import { TeamData, ScheduledMatch, LeagueKey } from '../src/types/types';

/**
 * Round Robin (Lig Usulü) Fikstür Algoritması
 * @param teams Takım listesi
 * @param rounds Devre sayısı (1: Tek Devre, 2: Çift Devre)
 */
const generateRoundRobin = (teams: TeamData[], rounds: number = 1): ScheduledMatch[] => {
  const schedule: ScheduledMatch[] = [];
  const teamIds = teams.map(t => t.id);
  
  // Takım sayısı tek ise 'BAY' (BYE) ekle
  if (teamIds.length % 2 !== 0) {
    teamIds.push('BYE');
  }

  const n = teamIds.length;
  const matchPerRound = n / 2;
  const totalRounds = (n - 1) * rounds;

  let currentRoundIds = [...teamIds];

  for (let round = 0; round < totalRounds; round++) {
    const isSecondHalf = round >= (n - 1); 

    for (let i = 0; i < matchPerRound; i++) {
      const home = currentRoundIds[i];
      const away = currentRoundIds[n - 1 - i];

      if (home !== 'BYE' && away !== 'BYE') {
        schedule.push({
          id: `match-${round}-${i}-${home}-${away}`,
          // Başlangıçta her round bir hafta gibi hesaplanır, sonra lige göre sıkıştırılır
          week: round + 1, 
          teamAId: isSecondHalf ? away : home,
          teamBId: isSecondHalf ? home : away,
          played: false,
          isBo5: false
        });
      }
    }

    // Takımları döndür (1. sabit kalır, diğerleri döner)
    const fixed = currentRoundIds[0];
    const rest = currentRoundIds.slice(1);
    const last = rest.pop();
    if (last) rest.unshift(last);
    currentRoundIds = [fixed, ...rest];
  }

  return schedule;
};

/**
 * Seçilen lige göre özel fikstür üretir
 */
export const generateLeagueSchedule = (leagueKey: LeagueKey, teams: TeamData[]): ScheduledMatch[] => {
  let schedule: ScheduledMatch[] = [];

  switch (leagueKey) {
    case 'LCP':
    case 'LEC':
    case 'LPL':
      // BU LİGLER TEK DEVRE (Single Round Robin) OYNAR
      schedule = generateRoundRobin(teams, 1);
      break;

    case 'LCK':
    case 'LTA_NORTH':
    case 'LTA_SOUTH':
      // BU LİGLER ÇİFT DEVRE (Double Round Robin) OYNAR
      schedule = generateRoundRobin(teams, 2);
      break;

    default:
      // Bilinmeyen durumlar için varsayılan Çift Devre
      schedule = generateRoundRobin(teams, 2);
      break;
  }

  // LEC ve LPL gibi yoğun ligler için hafta düzenlemesi
  // Örn: LEC 3 haftada biter, LPL haftada 3 gün maç oynatır.
  if (leagueKey === 'LEC') {
      // LEC'de 9 maç haftası yerine 3 "Süper Hafta" gibi düşünelim
      schedule.forEach(match => {
          match.week = Math.ceil(match.week / 3);
      });
  }

  // Maçları haftalara göre sırala
  return schedule.sort((a, b) => a.week - b.week);
};