import { LeagueKey } from './data/leagues';

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
  mechanics: number;
  macro: number;
  lane: number;
  teamfight: number;
}

export interface PlayerEvent {
  id: string;
  type: 'INJURY' | 'MORALE' | 'DRAMA' | 'CONTRACT';
  title: string;
  description: string;
  duration: number;
  penalty: Partial<PlayerStats>;
}

export interface PlayerCard {
  id: string;
  name: string;
  team: string;
  role: Role;
  stats: PlayerStats;
  overall: number;
  previousOverall?: number;
  age: number;
  price: number;
  salary: number;
  contractDuration: number;
  rarity: Rarity;
  imageParams?: string;
  events?: PlayerEvent[];
  signatureChampions?: string[];
  imageUrl?: string;
  status?: 'active' | 'retired';
  morale?: number;
  nationality?: string;
  originalRole?: Role;
  potential?: 'S' | 'A' | 'B' | 'C';
}

export interface MatchResult {
  victory: boolean;
  scoreUser: number;
  scoreEnemy: number;
  gameScores: {user: number, enemy: number}[];
  enemyTeam: string;
  reward: number;
  commentary: string;
  isBo5: boolean;
  playerStats: any[];
}

export interface TeamData {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor?: string;
  logoUrl?: string;
}

export interface Standing {
  teamId: string;
  name: string;
  wins: number;
  losses: number;
  gameWins: number;
  gameLosses: number;
  streak: number;
  group: 'A' | 'B' | 'C' | 'D' | null;
}

export interface ScheduledMatch {
  id: string;
  week: number;
  round: number; 
  teamAId: string;
  teamBId: string;
  played: boolean;
  winnerId?: string;
  seriesScoreA?: number;
  seriesScoreB?: number;
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
  nextMatchId?: string;
  nextMatchSlot?: 'A' | 'B';
  loserMatchId?: string;
  loserMatchSlot?: 'A' | 'B';
  isBo5: boolean;
}

// --- YENİ EKLENEN: Görünüm Tipi ---
export type HistoryViewType = 'LEAGUE' | 'BRACKET' | 'LIST';

export interface HistoryEntry {
  id: string;
  title: string;          
  viewType: HistoryViewType; // <-- ARTIK BU ALAN ZORUNLU
  year: number;
  split: string;
  schedule?: ScheduledMatch[];
  standings?: Standing[];
  playoffs?: PlayoffMatch[];
}

export type GameStage = 'PRE_SEASON' | 'GROUP_STAGE' | 'PLAY_IN' | 'PLAYOFFS' | 'OFF_SEASON' | 'MSI_PLAY_IN' | 'MSI_BRACKET' | 'LPL_SPLIT_2_PLACEMENTS' | 'LPL_SPLIT_2_LCQ' | 'LEC_GROUP_STAGE';

export interface GameState {
  managerName: string;
  teamId: string;
  leagueKey: LeagueKey; 
  coins: number;
  year: number; 
  currentSeason: number;
  currentSplit: string;
  week: number;
  currentDay: number; 
  difficulty: string;
  stage: GameStage | string;
  inventory: PlayerCard[];
  roster: Record<Role, PlayerCard | null>;
  aiRosters: Record<string, Record<Role, PlayerCard>>; 
  groups: { A: string[], B: string[], C?: string[], D?: string[] }; 
  winnersGroup: 'A' | 'B' | null; 
  standings: Standing[];
  schedule: ScheduledMatch[];
  playoffMatches: PlayoffMatch[];
  msiBracketContenders?: string[];
  freeAgents: PlayerCard[]; 
  trainingSlotsUsed: number;
  matchHistory: HistoryEntry[]; 
} 