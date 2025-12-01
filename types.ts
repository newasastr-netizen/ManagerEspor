export enum Role {
  TOP = 'TOP',
  JUNGLE = 'JGL',
  MID = 'MID',
  ADC = 'ADC',
  SUPPORT = 'SUP',
  COACH = 'COACH'
}

export enum Rarity {
  COMMON = 'Common',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary'
}

export interface PlayerStats {
  mechanics: number; // 0-100
  macro: number;    // 0-100
  lane: number;     // 0-100
  teamfight: number; // 0-100
}

export interface PlayerEvent {
  id: string;
  type: 'INJURY' | 'MORALE' | 'DRAMA' | 'CONTRACT';
  title: string;
  description: string;
  duration: number; // Number of matches/days remaining
  penalty: Partial<PlayerStats>; // The stats deducted
}

export interface PlayerCard {
  id: string;
  name: string;
  team: string; // LCK Team Name (T1, Gen.G, etc.) or 'FA'
  role: Role;
  stats: PlayerStats;
  overall: number;
  previousOverall?: number; // To track growth/decline across seasons
  age: number; // Player age
  price: number; // This acts as "Transfer Fee" (Bonservis)
  salary: number; // Cost per season
  contractDuration: number; // Seasons remaining
  rarity: Rarity;
  imageParams?: string; // For placeholder generation
  events?: PlayerEvent[]; // Active random events
  signatureChampions?: string[]; // İmza şampiyonlar
  imageUrl?: string;
  status?: 'active' | 'retired';
  morale?: number; // 0-100 arası moral değeri
}

export interface MatchResult {
  victory: boolean;
  scoreUser: number; // Series Score (e.g. 2)
  scoreEnemy: number; // Series Score (e.g. 1)
  gameScores: {user: number, enemy: number}[]; // Kills per game
  enemyTeam: string;
  reward: number;
  commentary: string;
  isBo5: boolean;
}

export interface TeamData {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
}

export interface Standing {
  teamId: string;
  name: string;
  wins: number; // Series Wins
  losses: number; // Series Losses
  gameWins: number; // Individual Game Wins
  gameLosses: number; // Individual Game Losses
  streak: number; // Positive for win streak, negative for loss streak
  group: 'A' | 'B' | null;
}

export interface ScheduledMatch {
  id: string;
  week: number;
  round: number; 
  teamAId: string;
  teamBId: string;
  played: boolean;
  winnerId?: string;
  seriesScoreA?: number; // Sets won
  seriesScoreB?: number; // Sets won
  isBo5?: boolean;
}

export interface PlayoffMatch {
  id: string;
  roundName: string;
  teamAId: string | null;
  teamBId: string | null;
  winnerId?: string;
  seriesScoreA?: number;
  seriesScoreB?: number;
  nextMatchId?: string; // Where the winner goes
  nextMatchSlot?: 'A' | 'B';
  loserMatchId?: string; // Where the loser goes (if double elim)
  loserMatchSlot?: 'A' | 'B';
  isBo5: boolean;
}

export type GameStage = 'PRE_SEASON' | 'GROUP_STAGE' | 'PLAY_IN' | 'PLAYOFFS' | 'OFF_SEASON' | 'LEC_GROUP_STAGE' | 'LEC_PLAYOFFS';

export interface GameState {
  managerName: string;
  teamId: string;
  coins: number;
  year: number; 
  currentSeason: number; // 1, 2, or 3
  week: number;
  currentDay: number; 
  stage: GameStage;
  
  inventory: PlayerCard[];
  roster: Record<Role, PlayerCard | null>;
  // Map of TeamID -> { Role -> PlayerCard }
  aiRosters: Record<string, Record<Role, PlayerCard>>; 
  
  // Standings & Format
  groups: { A: string[], B: string[] }; // Team IDs in Group A and B
  winnersGroup: 'A' | 'B' | null; // Which group won the group stage
  standings: Standing[];
  
  schedule: ScheduledMatch[];
  playoffMatches: PlayoffMatch[];
  
  freeAgents: PlayerCard[]; // Track players who became FA
  trainingSlotsUsed: number; // New: Tracks weekly training activity
}
