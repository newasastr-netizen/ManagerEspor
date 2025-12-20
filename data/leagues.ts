import { TeamData, PlayerCard, LeagueKey } from '../src/types/types';
import { ALL_TEAMS } from './teams';
import { REAL_LCK_PLAYERS, REAL_LPL_PLAYERS, REAL_LEC_PLAYERS } from './players';

export interface LeagueSettings {
  teamCount: number;
  groupCount?: number;
  scheduleType: 'DOUBLE_ROBIN' | 'SINGLE_ROBIN';
  format: 'LCK' | 'LPL' | 'LEC' | 'SIMPLE_GROUPS'; 
  matchesPerWeek: number;
  playoffTeams: number;
  isBo3: boolean;
}

export interface LeagueDefinition {
  id: LeagueKey;
  name: string;
  region: string;
  teams: TeamData[];
  players: PlayerCard[];
  settings: LeagueSettings;
}

export const LEAGUES: Record<LeagueKey, LeagueDefinition> = {
  LCK: {
    id: 'LCK',
    name: 'LCK',
    region: 'Korea',
    teams: ALL_TEAMS.filter(t => ['t1','gen','hle','dk','kt','drx','fox','ns','kdf','bro'].includes(t.id)),
    players: REAL_LCK_PLAYERS || [],
    settings: { 
        teamCount: 10, 
        scheduleType: 'DOUBLE_ROBIN', 
        format: 'LCK',
        matchesPerWeek: 2,
        playoffTeams: 6,
        isBo3: true 
    }
  },
  LPL: {
    id: 'LPL',
    name: 'LPL',
    region: 'China',
    teams: ALL_TEAMS.filter(t => ['blg','tes','wbg','lng','jdg','nip','fpx','al','omg','tt','rng','ig','edg','we','lgd','up'].includes(t.id)),
    players: REAL_LPL_PLAYERS || [],
    settings: { 
        teamCount: 16, 
        scheduleType: 'SINGLE_ROBIN', 
        format: 'LPL', 
        matchesPerWeek: 3,
        playoffTeams: 10,
        isBo3: true 
    }
  },
  LEC: {
    id: 'LEC',
    name: 'LEC',
    region: 'EMEA',
    teams: ALL_TEAMS.filter(t => ['g2','fnc','bds','gx','kc','koi','rge','sk','th','vit'].includes(t.id)),
    players: REAL_LEC_PLAYERS || [],
    settings: { 
        teamCount: 10,
        scheduleType: 'SINGLE_ROBIN',
        format: 'LEC',
        matchesPerWeek: 2,
        playoffTeams: 8,
        isBo3: false,
    }
  },

  LTA_NORTH: {
    id: 'LTA_NORTH',
    name: 'LTA North',
    region: 'Americas',
    teams: ALL_TEAMS.filter(t => ['c9','tl','fly','100t','dig','sr','dsg','lyn'].includes(t.id)),
    players: [],
    settings: { 
        teamCount: 8,
        scheduleType: 'DOUBLE_ROBIN',
        format: 'SIMPLE_GROUPS',
        matchesPerWeek: 2,
        playoffTeams: 4,
        isBo3: true
    }
  },

  LTA_SOUTH: {
    id: 'LTA_SOUTH',
    name: 'LTA South',
    region: 'Americas',
    teams: ALL_TEAMS.filter(t => ['loud','pain','red','vks','fluxo','furia','lev','isg'].includes(t.id)),
    players: [],
    settings: { 
        teamCount: 8,
        scheduleType: 'DOUBLE_ROBIN',
        format: 'SIMPLE_GROUPS',
        matchesPerWeek: 2,
        playoffTeams: 4,
        isBo3: true
    }
  },

  LCP: {
    id: 'LCP',
    name: 'LCP',
    region: 'Pacific',
    teams: ALL_TEAMS.filter(t => ['psg','gam','shg','dfm','cfo','vke','tsw','chiefs'].includes(t.id)),
    players: [],
    settings: { 
        teamCount: 8,
        scheduleType: 'SINGLE_ROBIN',
        format: 'SIMPLE_GROUPS',
        matchesPerWeek: 2,
        playoffTeams: 6,
        isBo3: true
    }
  }
};