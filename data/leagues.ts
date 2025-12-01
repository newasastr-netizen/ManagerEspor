import { TeamData, PlayerCard } from '../types';
import { REAL_LCK_PLAYERS, REAL_LEC_PLAYERS, REAL_LPL_PLAYERS, REAL_TCL_PLAYERS } from './players';
import { LCK_TEAMS, LEC_TEAMS, LPL_TEAMS, TCL_TEAMS } from './teams';

export type LeagueKey = 'LCK' | 'LPL' | 'LEC'| 'TCL';

export interface LeagueSettings {
  teamCount: number;
  groupCount?: number; // LCK formatı için opsiyonel hale getirildi
  scheduleType: 'DOUBLE_ROBIN' | 'SINGLE_ROBIN';
  format?: 'LCK' | 'SIMPLE_GROUPS'; // Sezon formatını belirliyoruz
}

export interface LeagueDefinition {
  key: LeagueKey;
  name: string;
  teams: TeamData[];
  players: PlayerCard[];
  settings: LeagueSettings;
}

export const LEAGUES: Record<LeagueKey, LeagueDefinition> = {
  LCK: {
    key: 'LCK',
    name: 'LCK',
    teams: LCK_TEAMS,
    players: REAL_LCK_PLAYERS,
    settings: { teamCount: 10, groupCount: 2, scheduleType: 'DOUBLE_ROBIN', format: 'LCK' }
  },
  LPL: {
    key: 'LPL',
    name: 'LPL',
    teams: LPL_TEAMS,
    players: REAL_LPL_PLAYERS, // Bu satır zaten doğruydu, korunuyor.
    settings: { teamCount: 17, groupCount: 1, scheduleType: 'SINGLE_ROBIN', format: 'SIMPLE_GROUPS' }
  },
  LEC: {
    key: 'LEC',
    name: 'LEC',
    teams: LEC_TEAMS,
    players: REAL_LEC_PLAYERS,
    settings: { teamCount: 10, groupCount: 1, scheduleType: 'DOUBLE_ROBIN', format: 'LEC' }
  },
  TCL: {
    key: 'TCL',
    name: 'TCL',
    teams: TCL_TEAMS,
    players: REAL_TCL_PLAYERS,
    settings: { teamCount: 10, groupCount: 1, scheduleType: 'DOUBLE_ROBIN', format: 'SIMPLE_GROUPS' }
  }
}; 