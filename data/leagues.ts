import { TeamData, PlayerCard } from '../types';
import { REAL_LCK_PLAYERS, REAL_LPL_PLAYERS, REAL_LEC_PLAYERS, REAL_TCL_PLAYERS, REAL_LTA_PLAYERS } from './players';
import { LCK_TEAMS, LEC_TEAMS, LPL_TEAMS, TCL_TEAMS, LTA_TEAMS } from './teams';

export type LeagueKey = 'LCK' | 'LPL' | 'LEC'| 'TCL';

export interface LeagueSettings {
  teamCount: number;
  groupCount?: number;
  scheduleType: 'DOUBLE_ROBIN' | 'SINGLE_ROBIN';
  format?: 'LCK' | 'SIMPLE_GROUPS' | 'LPL' | 'LEC'; 
  isBo3?: boolean;
}

export interface LeagueDefinition {
  key: LeagueKey;
  name: string;
  region: string;
  teams: TeamData[];
  players: PlayerCard[];
  settings: LeagueSettings;
}

export const LEAGUES: Record<LeagueKey, LeagueDefinition> = {
  LCK: {
    key: 'LCK',
    name: 'LCK',
    region: 'KR',
    teams: LCK_TEAMS,
    players: REAL_LCK_PLAYERS,
    settings: { 
        teamCount: 10, 
        groupCount: 2, 
        scheduleType: 'DOUBLE_ROBIN', 
        format: 'LCK',
        isBo3: true 
    }
  },
  LPL: {
    key: 'LPL',
    name: 'LPL',
    region: 'CN',
    teams: LPL_TEAMS,
    players: REAL_LPL_PLAYERS,
    settings: { 
        teamCount: 16, 
        groupCount: 4, // 4 Grup (A,B,C,D)
        scheduleType: 'SINGLE_ROBIN', 
        format: 'LPL', 
        isBo3: true 
    }
  },
  LEC: {
    key: 'LEC',
    name: 'LEC',
    region: 'EU',
    teams: LEC_TEAMS,
    players: REAL_LEC_PLAYERS,
    settings: { 
        teamCount: 10, 
        groupCount: 1, 
        scheduleType: 'DOUBLE_ROBIN', 
        format: 'LEC',
        isBo3: false
    }
  },
  LTA: {
    id: 'lta',
    name: 'LTA North',
    region: 'Americas',
    logoUrl: '/logos/lta/LTA.png',
    teams: LTA_TEAMS,
    players: REAL_LTA_PLAYERS,
    settings: {
      format: 'STANDARD',
      matchesPerWeek: 2,
      scheduleType: 'DOUBLE_ROBIN',
      playoffTeams: 6,
      isBo3: true,
    },
  },
  TCL: {
    key: 'TCL',
    name: 'TCL',
    region: 'TR',
    teams: TCL_TEAMS,
    players: REAL_TCL_PLAYERS,
    settings: { 
        teamCount: 10, 
        groupCount: 1, 
        scheduleType: 'DOUBLE_ROBIN', 
        format: 'SIMPLE_GROUPS',
        isBo3: false 
    }
  }
};