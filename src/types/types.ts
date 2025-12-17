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
    strength: number;
}

export interface PlayerCard {
  id: string;
  name: string;
  role: Role;
  country?: string;
  team: string;
  league?: LeagueKey;
  stats: PlayerStats;
  overall: number;
  previousOverall?: number;
  age: number;
  price: number;
  salary: number;
  contractDuration: number;
  rarity?: Rarity;
  imageUrl?: string;
  imageParams?: string;
  morale?: number;
  events?: PlayerEvent[];
  relationships?: PlayerRelationship[];
  status?: 'active' | 'retired' | 'military_service';
  originalRole?: Role;
  retirementReason?: string;
  unavailableUntil?: number;
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

export type LeagueKey = 'LCK' | 'LPL' | 'LEC' | 'TCL' | 'LTA';

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
  facilities: Record<FacilityType, Facility>;
  roster: Record<Role, PlayerCard | null>;
  inventory: PlayerCard[];
  aiRosters: Record<string, Record<Role, PlayerCard>>;
  freeAgents: PlayerCard[];
  activeHousingId: string;
  groups: { A: string[], B: string[], C?: string[], D?: string[] };
  winnersGroup: 'A' | 'B' | null;
  schedule: ScheduledMatch[];
  standings: Standing[];
  playoffMatches: PlayoffMatch[];
  msiBracketContenders?: string[];

  matchHistory: HistoryEntry[];
  newsFeed: NewsArticle[];
  playerMessages: PlayerMessage[];
  trainingSlotsUsed: number;
}


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

export type FacilityType = 'GAMING_HOUSE' | 'STREAM_ROOM' | 'GYM' | 'MEDICAL_CENTER';

export interface Facility {
  id: FacilityType;
  name: string;
  level: number;
  maxLevel: number;
  upgradeCost: number[];
  description: string;
  benefit: string;
}

export interface PlayerEvent {
  id: string;
  type: 'INJURY' | 'MORALE' | 'DRAMA' | 'CONTRACT';
  title: string;
  description: string;
  duration: number;
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