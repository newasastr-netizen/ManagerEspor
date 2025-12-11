
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

  const createRoundRobin = (teamIds: string[], groupName: string) => {
    for (let i = 0; i < teamIds.length; i++) {
      for (let j = i + 1; j < teamIds.length; j++) {
        schedule.push({
          id: `lpl-s2-${groupName}-${matchIdCounter++}`,
          week: Math.ceil((matchIdCounter + 1) / 5),
          round: matchIdCounter, 
          teamAId: teamIds[i],
          teamBId: teamIds[j],
          played: false,  
          isBo5: true
        });
      }
    }
  };

  createRoundRobin(ascendTeamIds, 'ascend');
  createRoundRobin(nirvanaTeamIds, 'nirvana');

  return schedule.sort(() => 0.5 - Math.random());
};

export const generateGroupStageSchedule = (groups: { A: string[], B: string[] }) => {
  const schedule: ScheduledMatch[] = [];
  const groupA = groups.A;
  const groupB = groups.B;
  
  const matches: {a: string, b: string}[] = [];
  
  groupA.forEach(teamA => {
      groupB.forEach(teamB => {
          matches.push({ a: teamA, b: teamB });
      });
  });

  const shuffledMatches = matches.sort(() => 0.5 - Math.random());

  let matchIdCounter = 0;
  const matchesPerWeek = 5;

  for (let i = 0; i < shuffledMatches.length; i++) {
      const m = shuffledMatches[i];
      const weekNum = Math.floor(i / matchesPerWeek) + 1;
      
      schedule.push({
          id: `gs-${matchIdCounter++}`,
          week: weekNum,
          round: i + 1,
          teamAId: m.a,
          teamBId: m.b,
          played: false,
          isBo5: false
      });
  }

  return schedule;
};
