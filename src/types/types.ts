// --- TEMEL OYUN TİPLERİ ---

export enum Role {
  TOP = 'TOP',
  JUNGLE = 'JUNGLE',
  MID = 'MID',
  ADC = 'ADC',
  SUPPORT = 'SUPPORT',
  COACH = 'COACH',
}

export enum Rarity {
  COMMON = 'Common',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary',
}

export interface PlayerStats {
  mechanics: number;
  macro: number;
  lane: number;
  teamfight: number;
}

export interface PlayerRelationship {
    targetPlayerId: string;
    type: 'FRIENDSHIP' | 'CONFLICT';
    strength: number; // 0-100
}

export interface PlayerCard {
  id: string;
  name: string;
  role: Role;
  country?: string;
  team: string; // 'FA', 'ACA' or Team ShortName
  league?: LeagueKey;
  stats: PlayerStats;
  overall: number;
  previousOverall?: number;
  age: number;
  price: number; // Transfer Fee
  salary: number; // Weekly/Yearly Salary
  contractDuration: number; // Seasons
  rarity?: Rarity;
  imageUrl?: string;
  imageParams?: string; // For dynamic avatar generation
  morale?: number; // 0-100
  events?: PlayerEvent[];
  relationships?: PlayerRelationship[];
  status?: 'active' | 'retired' | 'military_service';
  originalRole?: Role; // Emekli oyuncular koç olduğunda eski rolünü tutmak için
  retirementReason?: string;
  unavailableUntil?: number; // Yıl olarak (askerlik vb.)
}

export interface TeamData {
  id: string;
  name: string;
  shortName: string;
  tier: 'S' | 'A' | 'B' | 'C';
  region: string;
  logoUrl: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

export interface ScheduledMatch {
  id: string;
  week: number;
  round: number; // Day/Order index
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
    isBo5?: boolean;
}

export interface MatchResult {
  victory: boolean;
  scoreUser: number;
  scoreEnemy: number;
  reward: number;
  gameScores: { user: number, enemy: number }[];
  enemyTeam: string;
  playerStats: { playerId: string, kills: number, deaths: number, assists: number }[];
  commentary: string;
  isBo5: boolean;
}

export type LeagueKey = 'LCK' | 'LPL' | 'LEC' | 'TCL'; // Genişletilebilir

// --- OYUN DURUMU (STATE) ---

export interface GameState {
  managerName: string;
  teamId: string;
  leagueKey: LeagueKey;
  coins: number;
  year: number;
  currentSeason?: number;
  currentSplit: 'SPRING' | 'SUMMER' | 'WINTER' | 'MSI' | 'WORLDS' | 'SPLIT_1' | 'SPLIT_2' | 'SPLIT_3';
  week: number;
  difficulty: 'Easy' | 'Normal' | 'Hard';
  currentDay: number;
  stage: GameStage;
  
  // Data
  roster: Record<Role, PlayerCard | null>;
  inventory: PlayerCard[]; // Bench / Academy
  aiRosters: Record<string, Record<Role, PlayerCard>>; // TeamID -> Roster
  freeAgents: PlayerCard[];
  
  // Competition
  groups: { A: string[], B: string[], C?: string[], D?: string[] };
  winnersGroup: 'A' | 'B' | null; // For LCK/LEC format
  schedule: ScheduledMatch[];
  standings: Standing[];
  playoffMatches: PlayoffMatch[];
  msiBracketContenders?: string[]; // MSI'a katılan takımların ID'leri

  // History & Meta
  matchHistory: HistoryEntry[]; // Eski sezonlar
  newsFeed: NewsArticle[];
  playerMessages: PlayerMessage[];
  trainingSlotsUsed: number;
}

// --- LPL & FORMAT ÖZEL TİPLERİ ---

export enum LPLSplitPhase {
  SPLIT_1_GROUPS = 'SPLIT_1_GROUPS',
  SPLIT_2_ASCEND_NIRVANA = 'SPLIT_2_ASCEND_NIRVANA',
  SPLIT_3_ROAD_TO_WORLDS = 'SPLIT_3_ROAD_TO_WORLDS',
  SEASON_END = 'SEASON_END',
}

export type GameStage = 
  | 'PRE_SEASON' 
  | 'GROUP_STAGE' 
  | 'PLAY_IN' 
  | 'PLAYOFFS' 
  | 'OFF_SEASON' 
  | 'MSI_PLAY_IN' 
  | 'MSI_BRACKET' 
  | 'LEC_GROUP_STAGE'
  | 'LPL_SPLIT_2_PLACEMENTS'
  | 'LPL_SPLIT_2_GROUPS' 
  | 'LPL_SPLIT_2_LCQ'
  | 'LPL_SPLIT_3_GROUPS'; 

export interface Standing {
  teamId: string;
  name: string;
  wins: number;
  losses: number;
  gameWins: number;
  gameLosses: number;
  streak: number;
  group: 'A' | 'B' | 'C' | 'D' | 'Ascend' | 'Nirvana' | null; 
  isEliminated?: boolean; 
}

// --- DİĞER YARDIMCI TİPLER ---

export type HistoryViewType = 'LEAGUE' | 'BRACKET' | 'LIST';

export interface HistoryEntry {
    id: string;
    title: string;
    viewType: HistoryViewType;
    year: number;
    split: string;
    schedule?: ScheduledMatch[];
    standings?: Standing[];
    playoffs?: PlayoffMatch[];
    stage?: string;
}

export interface PlayerEvent {
  id: string;
  type: 'INJURY' | 'MORALE' | 'DRAMA' | 'CONTRACT';
  title: string;
  description: string;
  duration: number; // Matches or Weeks
  penalty: Partial<PlayerStats>;
}

export interface IncomingOffer {
  player: PlayerCard;
  offeringTeamId: string;
  offeringTeamName: string;
  offerAmount: number;
  playerOpinion: string;
}

export interface NewsArticle {
  id: string;
  type: 'TRANSFER' | 'RUMOR' | 'DRAMA' | 'RETIREMENT' | 'MAJOR_EVENT';
  title: string;
  content: string;
  date: { year: number, split: string, week: number };
  involved: { type: 'player' | 'team', name: string }[];
}

export interface PlayerMessage {
  id: string;
  playerId: string;
  playerName: string;
  type: 'COMPLAINT' | 'THANKS' | 'REQUEST' | 'INFO';
  subject: string;
  body: string;
  isRead: boolean;
  date: { year: number, split: string, week: number };
}