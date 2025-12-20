import { PlayerCard, Role, TeamData, MatchResult } from '../src/types/types';
import { getTeamTier } from '../components/TeamLogo';

export const calculateTeamPower = (
  roster: Record<Role, PlayerCard | null>,
  teamId: string,
  isUserTeam: boolean
): number => {
  const players = Object.values(roster).filter((p): p is PlayerCard => p !== null && p.role !== Role.COACH);
  
  if (players.length === 0) return 70;
  const baseTotal = players.reduce((acc, p) => acc + p.overall, 0);
  let power = Math.round(baseTotal / Math.max(1, players.length));

  const coach = roster[Role.COACH];
  if (coach) {
    power += Math.floor(coach.overall / 20);
  }

  const leagueCounts: Record<string, number> = {};
  players.forEach(p => {
      if(p.league) leagueCounts[p.league] = (leagueCounts[p.league] || 0) + 1;
  });
  
  Object.values(leagueCounts).forEach(count => {
      if(count >= 2) power += (count - 1);
  });

  return power;
};

export const calculateFanChange = (
    result: MatchResult,
    currentFanbase: number,
    teamTier: string,
    enemyTier: string
): number => {
    let change = 0;

    if (result.victory) {
        change += 0.05;
        
        if (result.scoreUser - result.scoreEnemy >= 2) {
            change += 0.02;
        }
    } else {
        if (currentFanbase > 0.5) {
            change -= 0.02;
        }
    }

    const tiers = ['D', 'C', 'B', 'A', 'S'];
    const myTierIdx = tiers.indexOf(teamTier);
    const enemyTierIdx = tiers.indexOf(enemyTier);

    if (result.victory && enemyTierIdx > myTierIdx) {
        const diff = enemyTierIdx - myTierIdx;
        change += (diff * 0.05);
    }
    
    return Number(change.toFixed(3));
};

export const simulateMatchSeries = (
  teamAId: string,
  teamBId: string,
  rosterA: any,
  rosterB: any,
  isBo5: boolean,
  draftBonus: number = 0
): any => {
  const powerA = calculateTeamPower(rosterA, teamAId, true); 
  const powerB = calculateTeamPower(rosterB, teamBId, false);
  const finalPowerA = powerA + draftBonus;

  let winsA = 0;
  let winsB = 0;
  const gamesToWin = isBo5 ? 3 : 2;
  const maxGames = isBo5 ? 5 : 3;
  const gameScores: { user: number, enemy: number }[] = [];

  for (let i = 0; i < maxGames; i++) {
    if (winsA === gamesToWin || winsB === gamesToWin) break;

    const luckFactor = (Math.random() - 0.5) * 10; 
    const effectivePowerA = finalPowerA + luckFactor;
    
    const diff = effectivePowerA - powerB;
    let winProbabilityA = 0.50 + (diff * 0.015);
    winProbabilityA = Math.max(0.1, Math.min(0.9, winProbabilityA));

    if (Math.random() < winProbabilityA) {
      winsA++;
      const kills = 12 + Math.floor(Math.random() * 15);
      const deaths = 4 + Math.floor(Math.random() * 10);
      gameScores.push({ user: kills, enemy: deaths });
    } else {
      winsB++;
      const kills = 4 + Math.floor(Math.random() * 10);
      const deaths = 12 + Math.floor(Math.random() * 15);
      gameScores.push({ user: kills, enemy: deaths });
    }
  }

  const isVictory = winsA > winsB;
  
  let commentary = isVictory 
    ? "Fantastic strategy execution secured the win!" 
    : "Despite best efforts, the enemy team was too strong.";

  if (draftBonus > 5) commentary = "The superior draft strategy made the difference!";
  if (draftBonus < -5) commentary = "The team struggled against the enemy's counter-picks.";

  return {
    victory: isVictory,
    scoreUser: winsA,
    scoreEnemy: winsB,
    winnerId: isVictory ? teamAId : teamBId,
    gameScores,
    enemyTeam: '', 
    isBo5,
    commentary,
    playerStats: []
  };
};

export const processPlayerGrowth = (player: PlayerCard, facilityLevel: number = 1): PlayerCard => {
    let newStats = { ...player.stats };
    const age = player.age;
    
    let growthChance = age < 22 ? 0.6 : (age < 26 ? 0.3 : 0.1);
    
    growthChance += (facilityLevel * 0.05);

    if (Math.random() < growthChance) {
        if (Math.random() > 0.5) newStats.mechanics = Math.min(99, newStats.mechanics + 1);
        if (Math.random() > 0.5) newStats.macro = Math.min(99, newStats.macro + 1);
        if (Math.random() > 0.5) newStats.teamfight = Math.min(99, newStats.teamfight + 1);
    }

    if (age > 27 && Math.random() < 0.2) {
        newStats.mechanics = Math.max(50, newStats.mechanics - 1);
    }

    const newOverall = Math.round((newStats.mechanics + newStats.macro + newStats.lane + newStats.teamfight) / 4);
    
    return {
        ...player,
        stats: newStats,
        overall: newOverall,
        age: player.age + 1
    };
};

export const calculatePlayerValue = (overall: number, age: number): number => {
    const base = Math.pow(overall - 65, 2.5); 
    let value = Math.round(base * 2);

    if (age < 21) value = Math.round(value * 1.2);

    if (age > 28) value = Math.round(value * 0.8);

    return Math.max(50, value);
};

export const calculateWeeklyExpenses = (
    roster: Record<Role, PlayerCard | null>, 
    teamId: string
): { total: number, salaries: number, upkeep: number, breakdown: string[] } => {
    
    const players = Object.values(roster).filter(p => p !== null) as PlayerCard[];
    const salaries = players.reduce((acc, p) => acc + p.salary, 0);
    let tierMultiplier = 1;
    const sTierTeams = ['t1', 'geng', 'hle', 'dk', 'kt', 'g2', 'fnc', 'blg', 'jdg', 'tes'];
    if (sTierTeams.includes(teamId)) tierMultiplier = 3.5;
    else if (['kdf', 'fox', 'ns', 'bro'].includes(teamId)) tierMultiplier = 1.0;
    else tierMultiplier = 2.0;
    const baseUpkeep = 500;
    const upkeep = Math.round(baseUpkeep * tierMultiplier);

    const total = salaries + upkeep;

    return {
        total,
        salaries,
        upkeep,
        breakdown: [
            `Player Salaries: -${salaries}G`,
            `Gaming House & Staff: -${upkeep}G`,
            `Total Weekly Expenses: -${total}G`
        ]
    };
};