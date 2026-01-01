import { TeamData, PlayerCard, LeagueKey } from '../src/types/types';
import { ALL_TEAMS } from './teams';
import { REAL_LCK_PLAYERS, REAL_LPL_PLAYERS, REAL_LEC_PLAYERS, REAL_LCP_PLAYERS, REAL_LTA_NORTH_PLAYERS, REAL_LTA_SOUTH_PLAYERS } from './players';

export interface LeaguePhaseDates {
  split1Start: string;
  split1End: string;
  firstStandTournament?: string;
  split2Start: string;
  split2End: string;
  split3Start?: string;
  split3End?: string;
  seasonEnd: string;
}

export interface LeagueSettings {
  teamCount: number;
  groupCount?: number;
  scheduleType: 'DOUBLE_ROBIN' | 'SINGLE_ROBIN' | 'HYBRID_LCK' | 'GROUPS';
  format: 'LCK' | 'LPL' | 'LEC' | 'SIMPLE_GROUPS'; 
  matchesPerWeek: number;
  matchDays: number[];
  matchesPerDay: number;
  playoffTeams: number;
  isBo3: boolean;
  calendar: LeaguePhaseDates; 
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
        scheduleType: 'HYBRID_LCK', 
        format: 'LCK',
        matchesPerWeek: 10, 
        matchDays: [3, 4, 5, 6, 0],
        matchesPerDay: 2,
        playoffTeams: 6,
        isBo3: true,
        calendar: {
            split1Start: '2025-01-15',
            split1End: '2025-02-23',
            firstStandTournament: '2025-03-10',
            split2Start: '2025-04-02',
            split2End: '2025-06-01',
            split3Start: '2025-07-23',
            split3End: '2025-09-08',
            seasonEnd: '2025-11-09'
        }
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
        matchesPerWeek: 14,
        matchDays: [1, 2, 3, 4, 5, 6, 0],
        matchesPerDay: 2, 
        playoffTeams: 10,
        isBo3: true,
        calendar: {
            split1Start: '2025-01-12',
            split1End: '2025-03-01',
            firstStandTournament: '2025-03-10',
            split2Start: '2025-04-05',
            split2End: '2025-06-14',
            split3Start: '2025-07-19',
            split3End: '2025-09-27',
            seasonEnd: '2025-11-09'
        }
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
        matchesPerWeek: 8,
        matchDays: [6, 0, 1],
        matchesPerDay: 3, 
        playoffTeams: 8,
        isBo3: true,
        calendar: {
            split1Start: '2025-01-18',
            split1End: '2025-03-02',
            firstStandTournament: '2025-03-10',
            split2Start: '2025-03-29',
            split2End: '2025-06-08',
            split3Start: '2025-08-02',
            split3End: '2025-09-28',
            seasonEnd: '2025-11-09'
        }
    }
  },

  LTA_NORTH: {
    id: 'LTA_NORTH',
    name: 'LTA North',
    region: 'Americas',
    teams: ALL_TEAMS.filter(t => ['c9','tl','fly','100t','dig','shr','dsg','lyn'].includes(t.id)),
    players: REAL_LTA_NORTH_PLAYERS,
    settings: { 
        teamCount: 8,
        scheduleType: 'DOUBLE_ROBIN',
        format: 'SIMPLE_GROUPS',
        matchesPerWeek: 4,
        matchDays: [6, 0],
        matchesPerDay: 2,
        playoffTeams: 4,
        isBo3: true,
        calendar: {
            split1Start: '2025-01-25',
            split1End: '2025-02-23',
            firstStandTournament: '2025-03-10',
            split2Start: '2025-04-05',
            split2End: '2025-06-15',
            split3Start: '2025-07-26',
            split3End: '2025-09-28',
            seasonEnd: '2025-11-09'
        }
    }
  },

  LTA_SOUTH: {
    id: 'LTA_SOUTH',
    name: 'LTA South',
    region: 'Americas',
    teams: ALL_TEAMS.filter(t => ['loud','pain','red','vks','fluxo','furia','lev','isg'].includes(t.id)),
    players: REAL_LTA_SOUTH_PLAYERS,
    settings: { 
        teamCount: 8,
        scheduleType: 'DOUBLE_ROBIN',
        format: 'SIMPLE_GROUPS',
        matchesPerWeek: 4,
        matchDays: [6, 0],
        matchesPerDay: 2,
        playoffTeams: 4,
        isBo3: true,
        calendar: {
            split1Start: '2025-01-25',
            split1End: '2025-02-23',
            firstStandTournament: '2025-03-10',
            split2Start: '2025-04-05',
            split2End: '2025-06-15',
            split3Start: '2025-07-26',
            split3End: '2025-09-28',
            seasonEnd: '2025-11-09'
        }
    }
  },

  LCP: {
    id: 'LCP',
    name: 'LCP',
    region: 'Pacific',
    teams: ALL_TEAMS.filter(t => ['psg','gam','shg','dfm','cfo','vke','tsw','chiefs'].includes(t.id)),
    players: REAL_LCP_PLAYERS,
    settings: { 
        teamCount: 8,
        scheduleType: 'SINGLE_ROBIN',
        format: 'SIMPLE_GROUPS',
        matchesPerWeek: 6,
        matchDays: [5, 6, 0],
        matchesPerDay: 2,
        playoffTeams: 6,
        isBo3: true,
        calendar: {
            split1Start: '2025-01-17',
            split1End: '2025-02-23',
            firstStandTournament: '2025-03-10',
            split2Start: '2025-04-19',
            split2End: '2025-06-08',
            split3Start: '2025-07-26',
            split3End: '2025-09-21',
            seasonEnd: '2025-11-09'
        }
    }
  }
};