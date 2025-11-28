import { TeamData, PlayerCard } from '../types';
import { REAL_LCK_PLAYERS } from './players';

export type LeagueKey = 'LCK' | 'LPL' | 'LEC';

export interface LeagueSettings {
  teamCount: number;
  groupCount: number;
  scheduleType: 'DOUBLE_ROBIN' | 'SINGLE_ROBIN';
}

export interface LeagueDefinition {
  key: LeagueKey;
  name: string;
  teams: TeamData[];
  players: PlayerCard[];
  settings: LeagueSettings;
}

// Örnek LPL ve LEC takımları. Bunları daha sonra detaylandırabilirsiniz.
const LPL_TEAMS: TeamData[] = [
  { id: 'jdg', name: 'JD Gaming', shortName: 'JDG', primaryColor: '#e4032e', logoUrl: '/logos/lpl/JDG.png' },
  { id: 'blg', name: 'Bilibili Gaming', shortName: 'BLG', primaryColor: '#33A1F4', logoUrl: '/logos/lpl/BLG.png' },
  // ... diğer LPL takımları
];

const LEC_TEAMS: TeamData[] = [
  { id: 'g2', name: 'G2 Esports', shortName: 'G2', primaryColor: '#000000', logoUrl: '/logos/lec/G2.png' },
  { id: 'fnc', name: 'Fnatic', shortName: 'FNC', primaryColor: '#ff5900', logoUrl: '/logos/lec/FNC.png' },
  // ... diğer LEC takımları
];

// DÜZELTME: LCK_TEAMS'in başında 'export' kelimesi olduğundan emin olun.
export const LCK_TEAMS: TeamData[] = [
    { id: 't1', name: 'T1', shortName: 'T1', primaryColor: '#E4002B', logoUrl: '/logos/lck/T1.png' },
    { id: 'gen', name: 'Gen.G', shortName: 'GEN', primaryColor: '#AA8A00', logoUrl: '/logos/lck/GEN.png' },
    { id: 'hle', name: 'Hanwha Life Esports', shortName: 'HLE', primaryColor: '#F47B20', logoUrl: '/logos/lck/HLE.png' },
    { id: 'dk', name: 'Dplus KIA', shortName: 'DK', primaryColor: '#00C4B3', logoUrl: '/logos/lck/DK.png' },
    { id: 'kt', name: 'KT Rolster', shortName: 'KT', primaryColor: '#000000', logoUrl: '/logos/lck/KT.png' },
    { id: 'drx', name: 'DRX', shortName: 'DRX', primaryColor: '#5383E8', logoUrl: '/logos/lck/DRX.png' },
    { id: 'fox', name: 'FearX', shortName: 'FOX', primaryColor: '#FF6F00', logoUrl: '/logos/lck/FOX.png' },
    { id: 'ns', name: 'Nongshim RedForce', shortName: 'NS', primaryColor: '#D12229', logoUrl: '/logos/lck/NS.png' },
    { id: 'kdf', name: 'Kwangdong Freecs', shortName: 'KDF', primaryColor: '#E61B23', logoUrl: '/logos/lck/KDF.png' },
    { id: 'bro', name: 'OK BRION', shortName: 'BRO', primaryColor: '#0A2240', logoUrl: '/logos/lck/BRO.png' },
];

export const LEAGUES: Record<LeagueKey, LeagueDefinition> = {
  LCK: {
    key: 'LCK',
    name: 'League of Champions Korea',
    teams: LCK_TEAMS,
    players: REAL_LCK_PLAYERS,
    settings: { teamCount: 10, groupCount: 2, scheduleType: 'DOUBLE_ROBIN' }
  },
  LPL: {
    key: 'LPL',
    name: 'League of Legends Pro League',
    teams: LPL_TEAMS,
    players: [], // TODO: LPL oyuncu verilerini buraya ekleyin
    settings: { teamCount: 17, groupCount: 2, scheduleType: 'SINGLE_ROBIN' }
  },
  LEC: {
    key: 'LEC',
    name: 'League of Legends EMEA Championship',
    teams: LEC_TEAMS,
    players: [], // TODO: LEC oyuncu verilerini buraya ekleyin
    settings: { teamCount: 10, groupCount: 1, scheduleType: 'DOUBLE_ROBIN' }
  }
};