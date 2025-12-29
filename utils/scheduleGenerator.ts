import { TeamData, ScheduledMatch, LeagueKey } from '../src/types/types';
import { LEAGUES } from '../data/leagues';

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const generateRoundRobinPairings = (teams: TeamData[], rounds: number = 1): Partial<ScheduledMatch>[] => {
  const schedule: Partial<ScheduledMatch>[] = [];
  const teamIds = teams.map(t => t.id);
  
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
          id: `match-${round}-${i}-${home}-${away}-${Date.now()}`,
          round: round + 1, 
          teamAId: isSecondHalf ? away : home,
          teamBId: isSecondHalf ? home : away,
          played: false,
          isBo5: false
        });
      }
    }

    const fixed = currentRoundIds[0];
    const rest = currentRoundIds.slice(1);
    const last = rest.pop();
    if (last) rest.unshift(last);
    currentRoundIds = [fixed, ...rest];
  }

  return schedule.sort((a, b) => (a.round || 0) - (b.round || 0));
};

const applyCalendarToMatches = (
    matches: Partial<ScheduledMatch>[], 
    leagueKey: LeagueKey
): ScheduledMatch[] => {
    const settings = LEAGUES[leagueKey].settings;
    const calendar = settings.calendar;
    
    let currentDate = new Date(calendar.split1Start);
    let matchIndex = 0;
    
    for (let dayCounter = 0; dayCounter < 365; dayCounter++) {
        if (matchIndex >= matches.length) break;

        const dateString = formatDate(currentDate);
        const dayOfWeek = currentDate.getDay();

        if (settings.matchDays.includes(dayOfWeek)) {
            for (let i = 0; i < settings.matchesPerDay; i++) {
                if (matchIndex >= matches.length) break;

                const match = matches[matchIndex];
                
                // @ts-ignore
                matches[matchIndex] = {
                    ...match,
                    date: dateString,
                    timestamp: currentDate.getTime(),
                    dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
                    week: Math.floor(dayCounter / 7) + 1
                };

                matchIndex++;
            }
        }
        
        currentDate = addDays(currentDate, 1);
        const split1End = new Date(calendar.split1End);
        const split2Start = new Date(calendar.split2Start);

        if (currentDate > split1End && currentDate < split2Start) {
            currentDate = new Date(split2Start);
        }
    }

    return matches as ScheduledMatch[];
};

export const generateLeagueSchedule = (leagueKey: LeagueKey, teams: TeamData[]): ScheduledMatch[] => {
  if (!teams || teams.length < 2) return [];

  let rawMatches: Partial<ScheduledMatch>[] = [];

  const settings = LEAGUES[leagueKey].settings;
  
  if (settings.scheduleType === 'DOUBLE_ROBIN' || settings.scheduleType === 'HYBRID_LCK') {
      rawMatches = generateRoundRobinPairings(teams, 2);
  } else {
      rawMatches = generateRoundRobinPairings(teams, 1);
  }

  return applyCalendarToMatches(rawMatches, leagueKey);
};