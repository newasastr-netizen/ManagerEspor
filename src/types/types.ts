
export interface GameDate {
  day: number;
  month: number;
  year: number;
  dayOfWeek: string;
  dateString: string;
}

export type CalendarEventType = 'MATCH' | 'TOURNAMENT_START' | 'TRANSFER_WINDOW' | 'HOLIDAY' | 'OTHER';

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: CalendarEventType;
  description?: string;
  relatedLeagueId?: string;
}

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

export type LeagueKey = 'LCK' | 'LPL' | 'LEC' | 'LTA_NORTH' | 'LTA_SOUTH' | 'LCP';
export type Difficulty = 'Easy' | 'Normal' | 'Hard';

export interface PlayerStats {
  mechanics: number;
  macro: number;
  lane: number;
  teamfight: number;
  consistency?: number;
}

export interface PlayerRelationship {
    targetPlayerId: string;
    type: 'FRIENDSHIP' | 'CONFLICT' | 'RIVALRY';
    strength: number;
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
  role: Role;
  country?: string;
  team: string;
  league?: LeagueKey | string; 
  stats: PlayerStats;
  overall: number;
  previousOverall?: number;
  age: number;
  price: number;
  salary: number;
  contractDuration: number; 
  rarity: Rarity; 
  imageUrl?: string; 
  image?: string;    
  imageParams?: string;
  morale?: number;
  events?: PlayerEvent[];
  relationships?: PlayerRelationship[];
  status?: 'active' | 'retired' | 'military_service';
  originalRole?: Role;
  retirementReason?: string;
  unavailableUntil?: number;
  contractYears?: number; 
  marketValue?: number;   
}

export interface TeamData {
  id: string;
  name: string;
  shortName: string;
  tier?: 'S' | 'A' | 'B' | 'C' | 'D';
  region?: string;
  logo?: string;
  logoUrl?: string; 
  primaryColor?: string; 
  colors?: { 
    primary: string;
    secondary: string;
  };
  color?: string; 
  prestige?: number;
  budget?: number;
  fans?: number;
}

export interface ScheduledMatch {
  id: string;
  date: string;
  timestamp: number;
  dayOfWeek?: string;
  week: number;
  round?: number;
  teamAId?: string;
  teamBId?: string;
  teamA?: string;
  teamB?: string;
  scoreA?: number;
  scoreB?: number;
  played: boolean;
  winnerId?: string;
  winner?: string;
  seriesScoreA?: number;
  seriesScoreB?: number;
  isBo5?: boolean;
  isPlayoff?: boolean;
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
    date?: string;
}

export interface MatchResult {
  [key: string]: any;
  victory: boolean;
  scoreUser: number;
  scoreEnemy: number;
}

export type GameStage = string;

export type FacilityType = 'GAMING_HOUSE' | 'STREAM_ROOM' | 'GYM' | 'MEDICAL_CENTER';

export interface Facility {
  id: FacilityType | string;
  name: string;
  level: number;
  maxLevel: number;
  upgradeCost: number[];
  description: string;
  benefit: string;
  maintenanceCost?: number;
  type?: 'TRAINING' | 'RECREATION' | 'BUSINESS' | 'HOUSING';
}

export interface NewsArticle {
  id: string;
  type: string;
  title: string;
  content?: string;
  message?: string;
  date: any;
  involved?: any[];
  read?: boolean;
}

export type NewsItem = NewsArticle;

export interface PlayerMessage {
  id: string;
  senderId?: string;
  senderName?: string;
  playerId?: string;
  playerName?: string;
  type: string;
  subject: string;
  body?: string;
  content?: string;
  isRead: boolean;
  date: any;
  actions?: { label: string; actionId: string }[];
}

export interface Standing {
  teamId: string;
  name: string;
  wins: number;
  losses: number;
  gameWins: number;
  gameLosses: number;
  streak: number;
  group?: string | null;
  isEliminated?: boolean; 
}

export interface HistoryEntry {
    id?: string;
    title?: string;
    viewType?: HistoryViewType;
    year?: number;
    split?: string;
    schedule?: ScheduledMatch[];
    standings?: Standing[];
    playoffs?: PlayoffMatch[];
    stage?: string;
    [key: string]: any;
}

export type HistoryViewType = 'LEAGUE' | 'BRACKET' | 'LIST';

export interface GameState {
  managerName: string;
  teamId: string;
  team?: TeamData;
  leagueKey: LeagueKey;
  league?: LeagueKey;
  coins: number;
  gameDate: GameDate;
  currentDay: number;
  week: number;
  year: number;
  currentSeason?: number;
  currentSplit: string;
  weeklySchedule?: ActivityType[];
  difficulty: Difficulty;
  stage: GameStage;
  facilities: Record<FacilityType | string, Facility>;
  roster: Record<Role, PlayerCard | null>;
  inventory: any[]; 
  aiRosters: Record<string, Record<Role, PlayerCard | null>>; 
  freeAgents: PlayerCard[];
  activeHousingId: string;
  groups: { A: string[], B: string[], C?: string[], D?: string[] };
  winnersGroup: 'A' | 'B' | null;
  schedule: ScheduledMatch[];
  globalCalendar?: CalendarEvent[];
  standings: Standing[];
  playoffs?: PlayoffMatch[]; 
  playoffMatches?: PlayoffMatch[];
  msiBracketContenders?: string[];
  fanbase: number;
  popularity: number;
  matchHistory: any[];
  newsFeed: NewsArticle[];
  playerMessages: PlayerMessage[];
  trainingSlotsUsed: number;
}

export interface Champion {
  id: string;
  name: string;
  role: Role;
  classes: string[];
  style: 'AGGRESSIVE' | 'CONTROL' | 'SCALING';
  tier: 'S' | 'A' | 'B' | 'C' | 'D';
}

export interface IncomingOffer {
  player: PlayerCard;
  offeringTeamId: string;
  offeringTeamName: string;
  offerAmount: number;
  playerOpinion: string;
}

export enum LPLSplitPhase {
  SPLIT_1_GROUPS = 'SPLIT_1_GROUPS',
  SPLIT_2_ASCEND_NIRVANA = 'SPLIT_2_ASCEND_NIRVANA',
  SPLIT_3_ROAD_TO_WORLDS = 'SPLIT_3_ROAD_TO_WORLDS',
  SEASON_END = 'SEASON_END',
}