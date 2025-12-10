
import { TeamData, ScheduledMatch } from '../types';

export const drawGroups = (teams: TeamData[]) => {
  const shuffled = [...teams].sort(() => 0.5 - Math.random());
  const groupA = shuffled.slice(0, 5).map(t => t.id);
  const groupB = shuffled.slice(5, 10).map(t => t.id);
  return { A: groupA, B: groupB };
};

export const generateLPLSplit2Schedule = (ascendTeamIds: string[], nirvanaTeamIds: string[]) => {
  const schedule: ScheduledMatch[] = [];
  let matchIdCounter = 0;

  // Helper: Tek devreli lig usulü fikstür (Single Round Robin)
  const createRoundRobin = (teamIds: string[], groupName: string) => {
    for (let i = 0; i < teamIds.length; i++) {
      for (let j = i + 1; j < teamIds.length; j++) {
        schedule.push({
          id: `lpl-s2-${groupName}-${matchIdCounter++}`,
          week: Math.ceil((matchIdCounter + 1) / 5), // Haftalara böl
          round: matchIdCounter, 
          teamAId: teamIds[i],
          teamBId: teamIds[j],
          played: false,  
          isBo5: true // LPL formatında maçlar genelde Bo3 veya Bo5 olur, burayı ayarla
        });
      }
    }
  };

  createRoundRobin(ascendTeamIds, 'ascend');
  createRoundRobin(nirvanaTeamIds, 'nirvana');

  // Karıştır
  return schedule.sort(() => 0.5 - Math.random());
};

export const generateGroupStageSchedule = (groups: { A: string[], B: string[] }) => {
  const schedule: ScheduledMatch[] = [];
  const groupA = groups.A;
  const groupB = groups.B;

  // Cross-Group Play: Each team in A plays every team in B once.
  // Total Matches = 5 * 5 = 25 Matches.
  // We can spread this over 5 Weeks (5 matches per week).
  
  const matches: {a: string, b: string}[] = [];
  
  // Generate all pairings
  groupA.forEach(teamA => {
      groupB.forEach(teamB => {
          matches.push({ a: teamA, b: teamB });
      });
  });

  // Shuffle matches for randomness
  const shuffledMatches = matches.sort(() => 0.5 - Math.random());

  // Assign to Weeks (5 matches per week -> 5 Weeks)
  let matchIdCounter = 0;
  const matchesPerWeek = 5;

  for (let i = 0; i < shuffledMatches.length; i++) {
      const m = shuffledMatches[i];
      const weekNum = Math.floor(i / matchesPerWeek) + 1;
      
      schedule.push({
          id: `gs-${matchIdCounter++}`,
          week: weekNum,
          round: i + 1, // Sequential day/round logic
          teamAId: m.a,
          teamBId: m.b,
          played: false,
          isBo5: false // Group stage is Bo3
      });
  }

  return schedule;
};
