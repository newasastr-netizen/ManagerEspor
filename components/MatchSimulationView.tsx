import React, { useEffect, useState, useRef } from 'react';
import { PlayerCard, MatchResult, TeamData, Role, PlayerStats } from '../types';
import { TeamLogo } from './TeamLogo';
import { FastForward, Hexagon, Shield, Circle, Swords, Skull, Users, Zap, Flame, Move, Trophy, Crown, AlertOctagon, Ghost, TreeDeciduous } from 'lucide-react';

interface MatchSimulationViewProps {
  userTeam: TeamData;
  enemyTeam: TeamData | undefined;
  userRoster: Record<Role, PlayerCard | null>;
  enemyRoster: Record<string, PlayerCard>;
  result: MatchResult;
  onComplete: () => void;
}

type StructureType = 'outer' | 'inner' | 'inhib_turret' | 'inhibitor' | 'nexus_turret' | 'nexus';
type Lane = 'TOP' | 'MID' | 'BOT' | 'BASE' | 'JUNGLE';

interface StructureEntity {
  id: string;
  team: 'blue' | 'red';
  type: StructureType;
  lane: Lane;
  x: number;
  y: number;
  alive: boolean;
  hp: number;
  maxHp: number;
  lastAttackedTime: number;
}

interface MapEntity {
  id: string;
  role: Role;
  name: string;
  team: 'blue' | 'red';
  x: number;
  y: number;
  isDead: boolean;
  respawnTimer: number;
  hp: number;
  maxHp: number;
  damage: number;
  stats: PlayerStats;
  targetId: string | null;
  currentStamina: number;
  isClutching: boolean;
  contributionScore: number;
}

interface MinionEntity {
  id: string;
  team: 'blue' | 'red';
  lane: Lane;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  damage: number;
  targetId: string | null;
  spawnTime: number;
}

interface JungleCampEntity {
    id: string;
    type: 'buff' | 'camp' | 'scuttle';
    name: string;
    teamOwner: 'blue' | 'red' | 'neutral';
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    alive: boolean;
    respawnTime: number;
}

interface ObjectiveState {
  alive: boolean;
  nextSpawnTime: number;
}

const TOWER_HP = 5000;
const INHIB_HP = 4000;
const NEXUS_TURRET_HP = 5000;
const NEXUS_HP = 10000;
const BASE_CHAMP_SPEED = 37.5;
const MINION_SPEED = 60; 

const INITIAL_STRUCTURES: StructureEntity[] = [

  { id: 'b-top-inhib', team: 'blue', type: 'inhibitor', lane: 'TOP', x: 5, y: 88, alive: true, hp: INHIB_HP, maxHp: INHIB_HP, lastAttackedTime: -1 },
  { id: 'b-top-inhibt', team: 'blue', type: 'inhib_turret', lane: 'TOP', x: 5, y: 80, alive: true, hp: TOWER_HP, maxHp: TOWER_HP, lastAttackedTime: -1 },
  { id: 'b-top-inner', team: 'blue', type: 'inner', lane: 'TOP', x: 5, y: 55, alive: true, hp: TOWER_HP, maxHp: TOWER_HP, lastAttackedTime: -1 },
  { id: 'b-top-outer', team: 'blue', type: 'outer', lane: 'TOP', x: 5, y: 30, alive: true, hp: TOWER_HP, maxHp: TOWER_HP, lastAttackedTime: -1 },

  { id: 'b-mid-inhib', team: 'blue', type: 'inhibitor', lane: 'MID', x: 12, y: 88, alive: true, hp: INHIB_HP, maxHp: INHIB_HP, lastAttackedTime: -1 },
  { id: 'b-mid-inhibt', team: 'blue', type: 'inhib_turret', lane: 'MID', x: 18, y: 82, alive: true, hp: TOWER_HP, maxHp: TOWER_HP, lastAttackedTime: -1 },
  { id: 'b-mid-inner', team: 'blue', type: 'inner', lane: 'MID', x: 28, y: 72, alive: true, hp: TOWER_HP, maxHp: TOWER_HP, lastAttackedTime: -1 },
  { id: 'b-mid-outer', team: 'blue', type: 'outer', lane: 'MID', x: 38, y: 62, alive: true, hp: TOWER_HP, maxHp: TOWER_HP, lastAttackedTime: -1 },

  { id: 'b-bot-inhib', team: 'blue', type: 'inhibitor', lane: 'BOT', x: 12, y: 95, alive: true, hp: INHIB_HP, maxHp: INHIB_HP, lastAttackedTime: -1 },
  { id: 'b-bot-inhibt', team: 'blue', type: 'inhib_turret', lane: 'BOT', x: 20, y: 95, alive: true, hp: TOWER_HP, maxHp: TOWER_HP, lastAttackedTime: -1 },
  { id: 'b-bot-inner', team: 'blue', type: 'inner', lane: 'BOT', x: 45, y: 95, alive: true, hp: TOWER_HP, maxHp: TOWER_HP, lastAttackedTime: -1 },
  { id: 'b-bot-outer', team: 'blue', type: 'outer', lane: 'BOT', x: 70, y: 95, alive: true, hp: TOWER_HP, maxHp: TOWER_HP, lastAttackedTime: -1 },

  { id: 'b-nexus-t1', team: 'blue', type: 'nexus_turret', lane: 'BASE', x: 10, y: 90, alive: true, hp: NEXUS_TURRET_HP, maxHp: NEXUS_TURRET_HP, lastAttackedTime: -1 },
  { id: 'b-nexus-t2', team: 'blue', type: 'nexus_turret', lane: 'BASE', x: 8, y: 92, alive: true, hp: NEXUS_TURRET_HP, maxHp: NEXUS_TURRET_HP, lastAttackedTime: -1 },
  { id: 'b-nexus', team: 'blue', type: 'nexus', lane: 'BASE', x: 5, y: 95, alive: true, hp: NEXUS_HP, maxHp: NEXUS_HP, lastAttackedTime: -1 },

  { id: 'r-top-inhib', team: 'red', type: 'inhibitor', lane: 'TOP', x: 88, y: 5, alive: true, hp: INHIB_HP, maxHp: INHIB_HP, lastAttackedTime: -1 },
  { id: 'r-top-inhibt', team: 'red', type: 'inhib_turret', lane: 'TOP', x: 80, y: 5, alive: true, hp: TOWER_HP, maxHp: TOWER_HP, lastAttackedTime: -1 },
  { id: 'r-top-inner', team: 'red', type: 'inner', lane: 'TOP', x: 55, y: 5, alive: true, hp: TOWER_HP, maxHp: TOWER_HP, lastAttackedTime: -1 },
  { id: 'r-top-outer', team: 'red', type: 'outer', lane: 'TOP', x: 30, y: 5, alive: true, hp: TOWER_HP, maxHp: TOWER_HP, lastAttackedTime: -1 },

  { id: 'r-mid-inhib', team: 'red', type: 'inhibitor', lane: 'MID', x: 88, y: 12, alive: true, hp: INHIB_HP, maxHp: INHIB_HP, lastAttackedTime: -1 },
  { id: 'r-mid-inhibt', team: 'red', type: 'inhib_turret', lane: 'MID', x: 82, y: 18, alive: true, hp: TOWER_HP, maxHp: TOWER_HP, lastAttackedTime: -1 },
  { id: 'r-mid-inner', team: 'red', type: 'inner', lane: 'MID', x: 72, y: 28, alive: true, hp: TOWER_HP, maxHp: TOWER_HP, lastAttackedTime: -1 },
  { id: 'r-mid-outer', team: 'red', type: 'outer', lane: 'MID', x: 62, y: 38, alive: true, hp: TOWER_HP, maxHp: TOWER_HP, lastAttackedTime: -1 },

  { id: 'r-bot-inhib', team: 'red', type: 'inhibitor', lane: 'BOT', x: 95, y: 12, alive: true, hp: INHIB_HP, maxHp: INHIB_HP, lastAttackedTime: -1 },
  { id: 'r-bot-inhibt', team: 'red', type: 'inhib_turret', lane: 'BOT', x: 95, y: 20, alive: true, hp: TOWER_HP, maxHp: TOWER_HP, lastAttackedTime: -1 },
  { id: 'r-bot-inner', team: 'red', type: 'inner', lane: 'BOT', x: 95, y: 45, alive: true, hp: TOWER_HP, maxHp: TOWER_HP, lastAttackedTime: -1 },
  { id: 'r-bot-outer', team: 'red', type: 'outer', lane: 'BOT', x: 95, y: 70, alive: true, hp: TOWER_HP, maxHp: TOWER_HP, lastAttackedTime: -1 },

  { id: 'r-nexus-t1', team: 'red', type: 'nexus_turret', lane: 'BASE', x: 90, y: 10, alive: true, hp: NEXUS_TURRET_HP, maxHp: NEXUS_TURRET_HP, lastAttackedTime: -1 },
  { id: 'r-nexus-t2', team: 'red', type: 'nexus_turret', lane: 'BASE', x: 92, y: 8, alive: true, hp: NEXUS_TURRET_HP, maxHp: NEXUS_TURRET_HP, lastAttackedTime: -1 },
  { id: 'r-nexus', team: 'red', type: 'nexus', lane: 'BASE', x: 95, y: 5, alive: true, hp: NEXUS_HP, maxHp: NEXUS_HP, lastAttackedTime: -1 },
];

const INITIAL_JUNGLE_CAMPS: JungleCampEntity[] = [
    { id: 'b-gromp', type: 'camp', name: 'Gromp', teamOwner: 'blue', x: 10, y: 60, hp: 1800, maxHp: 1800, alive: false, respawnTime: 1.75 },
    { id: 'b-blue', type: 'buff', name: 'Blue Sentinel', teamOwner: 'blue', x: 20, y: 55, hp: 2500, maxHp: 2500, alive: false, respawnTime: 1.75 },
    { id: 'b-wolves', type: 'camp', name: 'Wolves', teamOwner: 'blue', x: 22, y: 68, hp: 1500, maxHp: 1500, alive: false, respawnTime: 1.75 },
    { id: 'b-raptors', type: 'camp', name: 'Raptors', teamOwner: 'blue', x: 55, y: 62, hp: 1400, maxHp: 1400, alive: false, respawnTime: 1.75 },
    { id: 'b-red', type: 'buff', name: 'Red Brambleback', teamOwner: 'blue', x: 58, y: 78, hp: 2500, maxHp: 2500, alive: false, respawnTime: 1.75 },
    { id: 'b-krugs', type: 'camp', name: 'Krugs', teamOwner: 'blue', x: 75, y: 92, hp: 1600, maxHp: 1600, alive: false, respawnTime: 1.75 },

    { id: 'r-gromp', type: 'camp', name: 'Gromp', teamOwner: 'red', x: 90, y: 40, hp: 1800, maxHp: 1800, alive: false, respawnTime: 1.75 },
    { id: 'r-blue', type: 'buff', name: 'Blue Sentinel', teamOwner: 'red', x: 80, y: 45, hp: 2500, maxHp: 2500, alive: false, respawnTime: 1.75 },
    { id: 'r-wolves', type: 'camp', name: 'Wolves', teamOwner: 'red', x: 78, y: 32, hp: 1500, maxHp: 1500, alive: false, respawnTime: 1.75 },
    { id: 'r-raptors', type: 'camp', name: 'Raptors', teamOwner: 'red', x: 45, y: 38, hp: 1400, maxHp: 1400, alive: false, respawnTime: 1.75 },
    { id: 'r-red', type: 'buff', name: 'Red Brambleback', teamOwner: 'red', x: 42, y: 22, hp: 2500, maxHp: 2500, alive: false, respawnTime: 1.75 },
    { id: 'r-krugs', type: 'camp', name: 'Krugs', teamOwner: 'red', x: 25, y: 8, hp: 1600, maxHp: 1600, alive: false, respawnTime: 1.75 },

    { id: 'scuttle-top', type: 'scuttle', name: 'Scuttle Crab', teamOwner: 'neutral', x: 20, y: 20, hp: 1200, maxHp: 1200, alive: false, respawnTime: 3.5 },
    { id: 'scuttle-bot', type: 'scuttle', name: 'Scuttle Crab', teamOwner: 'neutral', x: 80, y: 80, hp: 1200, maxHp: 1200, alive: false, respawnTime: 3.5 },
];

const POSITIONS = {
  BLUE_BASE: { x: 5, y: 95 },
  RED_BASE: { x: 95, y: 5 },
  BARON: { x: 30, y: 30 }, 
  DRAGON: { x: 70, y: 70 }, 
  TOP_LEFT_CORNER: { x: 5, y: 5 },
  BOT_RIGHT_CORNER: { x: 95, y: 95 }
};

export const MatchSimulationView: React.FC<MatchSimulationViewProps> = ({ 
  userTeam, enemyTeam, userRoster, enemyRoster, result, onComplete 
}) => {
  
  const [gameMinutes, setGameMinutes] = useState(0); 
  const [structures, setStructures] = useState<StructureEntity[]>(() => INITIAL_STRUCTURES.map(s => ({ ...s })));
  const [jungleCamps, setJungleCamps] = useState<JungleCampEntity[]>(() => INITIAL_JUNGLE_CAMPS.map(c => ({ ...c })));
  const [entities, setEntities] = useState<MapEntity[]>([]);
  const [minions, setMinions] = useState<MinionEntity[]>([]);
  const [logs, setLogs] = useState<{time: string, msg: string, type: 'kill'|'obj'|'normal'|'turret'}[]>([]);
  const [currentScore, setCurrentScore] = useState({ blue: 0, red: 0 });
  const [dragon, setDragon] = useState<ObjectiveState>({ alive: false, nextSpawnTime: 5 });
  const [dragonStacks, setDragonStacks] = useState({ blue: 0, red: 0 });
  const [nextIsElder, setNextIsElder] = useState(false);
  const [baron, setBaron] = useState<ObjectiveState>({ alive: false, nextSpawnTime: 20 });
  const [gameOver, setGameOver] = useState(false);
  const [nextMinionSpawn, setNextMinionSpawn] = useState(1.08); // First spawn at 1:05 (1m 5s = 1.083m)
  const [teamPowerDiff, setTeamPowerDiff] = useState(0);

  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const createEntities = (team: 'blue' | 'red'): MapEntity[] => {
      const base = team === 'blue' ? POSITIONS.BLUE_BASE : POSITIONS.RED_BASE;
      return Object.values(Role).filter(r => r !== Role.COACH).map(role => {
        let name = '';
        let card: PlayerCard | null = null;
        if (team === 'blue') {
             card = userRoster[role];
             name = card?.name || role;
        } else {
             card = (enemyRoster as any)[role];
             name = card?.name || role;
        }
        
        const baseHp = 2500 + ((card?.overall || 70) * 20);
        const baseDmg = 150 + ((card?.overall || 70) * 3);
        const playerStats = card?.stats || { mechanics: 70, macro: 70, lane: 70, teamfight: 70 };

        const startStamina = 80 + Math.floor(Math.random() * 21);

        return {
          id: `${team}-${role}`,
          role: role as Role,
          name,
          team,
          x: base.x,
          y: base.y,
          isDead: false,
          respawnTimer: 0,
          hp: baseHp,
          maxHp: baseHp,
          damage: baseDmg,
          stats: playerStats,
          targetId: null,
          currentStamina: startStamina,
          isClutching: false,
          contributionScore: 0
        };
      });
    };

    const blueEntities = createEntities('blue');
    const redEntities = createEntities('red');
    setEntities([...blueEntities, ...redEntities]);

    const getAvgOvr = (ent: MapEntity[]) => ent.reduce((acc, e) => acc + ((e.damage - 150)/3), 0) / ent.length;
    const blueOvr = getAvgOvr(blueEntities);
    const redOvr = getAvgOvr(redEntities);
    setTeamPowerDiff(blueOvr - redOvr);

    addLog("Welcome to Summoner's Rift!", 'normal');
    addLog("Minions will spawn at 1:05, Jungle Camps at 1:45.", 'normal');
  }, []);

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setGameMinutes(prev => prev + 0.10); 
      updateGameLogic();
    }, 100); 

    return () => clearInterval(interval);
  }, [gameMinutes, dragon, baron, structures, entities, minions, gameOver, nextMinionSpawn, jungleCamps]);

  const getCurrentGameTimeStr = () => {
    const mins = Math.floor(gameMinutes);
    const secs = Math.floor((gameMinutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addLog = (msg: string, type: 'kill'|'obj'|'normal'|'turret' = 'normal') => {
    setLogs(prev => [...prev, { time: getCurrentGameTimeStr(), msg, type }]);
  };

  const isStructureVulnerable = (s: StructureEntity, currentStructures: StructureEntity[]): boolean => {
    if (!s.alive) return false;

    const laneStructures = currentStructures.filter(os => os.team === s.team && os.lane === s.lane);

    if (s.type === 'outer') return true;
    
    if (s.type === 'inner') {
        const outer = laneStructures.find(os => os.type === 'outer');
        return !outer?.alive;
    }

    if (s.type === 'inhib_turret') {
        const inner = laneStructures.find(os => os.type === 'inner');
        return !inner?.alive;
    }

    if (s.type === 'inhibitor') {
        const inhibT = laneStructures.find(os => os.type === 'inhib_turret');
        return !inhibT?.alive;
    }

    if (s.type === 'nexus_turret') {
        const teamInhibs = currentStructures.filter(os => os.team === s.team && os.type === 'inhibitor');
        const anyDead = teamInhibs.some(i => !i.alive);
        return anyDead;
    }

    if (s.type === 'nexus') {

        const nTurrets = currentStructures.filter(os => os.team === s.team && os.type === 'nexus_turret');
        return nTurrets.every(t => !t.alive);
    }

    return false;
  };

  const getWaypointPath = (currX: number, currY: number, destX: number, destY: number): { x: number, y: number } => {
      // Top Lane logic: x=5 or y=5
      const onLeftEdge = currX < 15;
      const onTopEdge = currY < 15;
      const destOnTop = destY < 15;
      const destOnLeft = destX < 15;

      if (onLeftEdge && destOnTop && !onTopEdge) {
          return POSITIONS.TOP_LEFT_CORNER;
      }
      if (onTopEdge && destOnLeft && !onLeftEdge) {
          return POSITIONS.TOP_LEFT_CORNER;
      }

      // Bot Lane Logic: y=95 or x=95
      const onBottomEdge = currY > 85;
      const onRightEdge = currX > 85;
      const destOnBottom = destY > 85;
      const destOnRight = destX > 85;

      if (onBottomEdge && destOnRight && !onRightEdge) {
          return POSITIONS.BOT_RIGHT_CORNER;
      }
      if (onRightEdge && destOnBottom && !onBottomEdge) {
          return POSITIONS.BOT_RIGHT_CORNER;
      }

      return { x: destX, y: destY };
  };

  const updateGameLogic = () => {
    let newStructures = [...structures];
    let newScore = { ...currentScore };
    let newMinions = [...minions];
    let newJungleCamps = [...jungleCamps];
    let gameEnded = false;
    const pendingScoreUpdates: Record<string, number> = {};

    const winningTeam = result.victory ? 'blue' : 'red';
    
    let timeScaling = 1.0;
    if (gameMinutes > 30) timeScaling = 6.0;
    else if (gameMinutes > 20) timeScaling = 3.5; 
    else if (gameMinutes > 10) timeScaling = 1.5;

    newJungleCamps = newJungleCamps.map(camp => {
        if (!camp.alive && gameMinutes >= camp.respawnTime) {
            return { ...camp, alive: true, hp: camp.maxHp };
        }
        return camp;
    });

    if (gameMinutes >= nextMinionSpawn) {
       setNextMinionSpawn(prev => prev + 1.5); // Spawn every 90s (1.5 mins)
       
       const spawnMinion = (team: 'blue' | 'red', lane: Lane, offsetSeconds: number) => {
          const base = team === 'blue' ? POSITIONS.BLUE_BASE : POSITIONS.RED_BASE;
          const champBaseDmg = 150 + (gameMinutes * 3);
          const minionDmg = champBaseDmg * 0.55;

          const spawnTime = gameMinutes + (offsetSeconds / 60);

          const minionHP = 500 + (gameMinutes * 25);

          newMinions.push({
             id: `m-${team}-${lane}-${Math.floor(gameMinutes * 100)}-${offsetSeconds}`,
             team,
             lane,
             x: base.x,
             y: base.y,
             hp: minionHP,
             maxHp: minionHP,
             damage: minionDmg, 
             targetId: null,
             spawnTime: spawnTime
          });
       };

       (['TOP', 'MID', 'BOT'] as Lane[]).forEach(lane => {
          for (let i = 0; i < 6; i++) {
             spawnMinion('blue', lane, i);
             spawnMinion('red', lane, i);
          }
       });
    }

    if (!dragon.alive && gameMinutes >= dragon.nextSpawnTime) {
      setDragon(prev => ({ ...prev, alive: true }));
      addLog(nextIsElder ? "ELDER DRAGON has spawned!" : "Elemental Drake has spawned", 'obj');
    }
    if (!baron.alive && gameMinutes >= baron.nextSpawnTime) {
      setBaron(prev => ({ ...prev, alive: true }));
      addLog("Baron Nashor has spawned", 'obj');
    }

    newMinions = newMinions.map(minion => {
       if (gameMinutes < minion.spawnTime) return minion;
       if (minion.hp <= 0) return null;

       let moveX = minion.x;
       let moveY = minion.y;

       const enemyBase = minion.team === 'blue' ? POSITIONS.RED_BASE : POSITIONS.BLUE_BASE;

       const nearbyEnemyStruct = newStructures.find(s => 
          s.team !== minion.team && 
          s.alive && 
          (s.lane === minion.lane || s.lane === 'BASE') &&
          isStructureVulnerable(s, newStructures) &&
          Math.hypot(s.x - minion.x, s.y - minion.y) < 8
       );

       const nearbyEnemyMinion = newMinions.find(m => 
          m && m.team !== minion.team &&
          m.hp > 0 &&
          gameMinutes >= m.spawnTime &&
          Math.hypot(m.x - minion.x, m.y - minion.y) < 6
       );

       if (nearbyEnemyStruct) {
          const sIndex = newStructures.findIndex(s => s.id === nearbyEnemyStruct.id);
          const dmg = minion.damage * 0.02 * timeScaling;
          newStructures[sIndex].hp -= dmg;
          newStructures[sIndex].lastAttackedTime = gameMinutes;

          if (newStructures[sIndex].hp <= 0) {
             newStructures[sIndex].alive = false;
             newStructures[sIndex].hp = 0;
             addLog(`Minions destroyed ${minion.team === 'blue' ? 'Red' : 'Blue'} ${nearbyEnemyStruct.type}`, 'turret');
             if (nearbyEnemyStruct.type === 'nexus') {
                gameEnded = true;
                addLog(`VICTORY FOR ${minion.team.toUpperCase()} TEAM!`, 'normal');
             }
          }
       } else if (nearbyEnemyMinion) {

          const roll = Math.random();
          const dmgMod = roll < 0.5 ? 1.2 : 0.8;
          nearbyEnemyMinion.hp -= minion.damage * dmgMod;
       } else {
          let targetX = minion.x;
          let targetY = minion.y;

          if (minion.lane === 'MID') {
             targetX = enemyBase.x;
             targetY = enemyBase.y;
          } else if (minion.lane === 'TOP') {
              const corner = POSITIONS.TOP_LEFT_CORNER;
              if (minion.team === 'blue') {
                  if (minion.y > corner.y + 1) { targetX = corner.x; targetY = corner.y; }
                  else { targetX = enemyBase.x; targetY = enemyBase.y; }
              } else {
                  if (minion.x > corner.x + 1) { targetX = corner.x; targetY = corner.y; }
                  else { targetX = enemyBase.x; targetY = enemyBase.y; }
              }
          } else if (minion.lane === 'BOT') {
              const corner = POSITIONS.BOT_RIGHT_CORNER;
              if (minion.team === 'blue') {
                  if (minion.x < corner.x - 1) { targetX = corner.x; targetY = corner.y; }
                  else { targetX = enemyBase.x; targetY = enemyBase.y; }
              } else {
                  if (minion.y < corner.y - 1) { targetX = corner.x; targetY = corner.y; }
                  else { targetX = enemyBase.x; targetY = enemyBase.y; }
              }
          }

          const dx = targetX - minion.x;
          const dy = targetY - minion.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          if (dist > 1) {
             const speed = MINION_SPEED; 
             moveX += (dx / dist) * speed * 0.1; 
             moveY += (dy / dist) * speed * 0.1;
          }
       }

       return { ...minion, x: moveX, y: moveY };
    }).filter(m => m !== null) as MinionEntity[];

    setMinions(newMinions);

    const newEntities = entities.map(entity => {
      if (entity.isDead) {
        if (entity.respawnTimer > 0) {
          return { ...entity, respawnTimer: entity.respawnTimer - 0.10 }; 
        } else {
          const base = entity.team === 'blue' ? POSITIONS.BLUE_BASE : POSITIONS.RED_BASE;
          return { 
            ...entity, 
            isDead: false, 
            x: base.x, 
            y: base.y, 
            hp: entity.maxHp,
            currentStamina: 100, 
            isClutching: false,
            targetId: null
          };
        }
      }

      const myBase = entity.team === 'blue' ? POSITIONS.BLUE_BASE : POSITIONS.RED_BASE;
      const enemyBase = entity.team === 'blue' ? POSITIONS.RED_BASE : POSITIONS.BLUE_BASE;

      const enemies = entities.filter(e => e.team !== entity.team && !e.isDead);
      const enemyStructures = newStructures.filter(s => s.team !== entity.team && s.alive);
      const alliedStructures = newStructures.filter(s => s.team === entity.team && s.alive);

      const distToBase = Math.hypot(entity.x - myBase.x, entity.y - myBase.y);
      let newHp = entity.hp;
      let newStamina = entity.currentStamina;
      let currentContribution = entity.contributionScore;

      if (distToBase < 6) {
          newHp = Math.min(entity.maxHp, entity.hp + (entity.maxHp * 0.1));
          newStamina = Math.min(100, entity.currentStamina + 8);
      }

      let isClutch = false;
      if (entity.stats.teamfight > 80 || entity.stats.macro > 80) {
          const distBaron = Math.hypot(entity.x - POSITIONS.BARON.x, entity.y - POSITIONS.BARON.y);
          const distDragon = Math.hypot(entity.x - POSITIONS.DRAGON.x, entity.y - POSITIONS.DRAGON.y);
          const isBaseSiege = distToBase < 20 && enemies.some(e => Math.hypot(e.x - myBase.x, e.y - myBase.y) < 20);

          if ((baron.alive && distBaron < 15) || (dragon.alive && distDragon < 15) || isBaseSiege) {
             isClutch = true;
          }
      }
      
      let targetX = entity.x;
      let targetY = entity.y;
      let action: 'fight' | 'defend' | 'push' | 'flee' | 'farm' | 'gank' = 'push';
      let targetEnemyId: string | null = null;
      
      const hpPercentage = newHp / entity.maxHp;

      const distDragonEntity = Math.hypot(entity.x - POSITIONS.DRAGON.x, entity.y - POSITIONS.DRAGON.y);
      const distBaronEntity = Math.hypot(entity.x - POSITIONS.BARON.x, entity.y - POSITIONS.BARON.y);
      const isFightingForObjective = (dragon.alive && distDragonEntity < 20) || (baron.alive && distBaronEntity < 20);
      
      const enemiesInBase = enemies.some(e => Math.hypot(e.x - myBase.x, e.y - myBase.y) < 25);
      
      const criticalWaveMinion = newMinions.find(m => 
        m.team !== entity.team && 
        Math.hypot(m.x - myBase.x, m.y - myBase.y) < 30 &&
        m.hp > 0
      );
      
      const isBaseSiege = enemiesInBase || !!criticalWaveMinion;

      const fleeThreshold = isFightingForObjective ? 0.10 : 0.25;
      
      const atFountain = distToBase < 8;
      const needsHealing = hpPercentage < 0.99 && !isBaseSiege; // Only stay to heal if base isn't burning

      if ((hpPercentage < fleeThreshold && distToBase > 5 && !isClutch) || (atFountain && needsHealing)) {
          action = 'flee';
          targetX = myBase.x;
          targetY = myBase.y;
      } 
      else {
          const nearbyEnemies = enemies
              .map(e => ({ ...e, dist: Math.hypot(e.x - entity.x, e.y - entity.y) }))
              .filter(e => e.dist < 15)
              .sort((a, b) => a.dist - b.dist);

          const closestEnemy = nearbyEnemies[0];
          
          const nearbyEnemyMinions = newMinions
             .filter(m => m.team !== entity.team && gameMinutes >= m.spawnTime)
             .map(m => ({ ...m, dist: Math.hypot(m.x - entity.x, m.y - entity.y) }))
             .filter(m => m.dist < 8)
             .sort((a,b) => a.dist - b.dist);

          if (closestEnemy && closestEnemy.dist < 8) {
              action = 'fight';
              targetX = closestEnemy.x;
              targetY = closestEnemy.y;
              targetEnemyId = closestEnemy.id;
          } 
          else if (nearbyEnemyMinions.length > 0) {
             action = 'fight';
             targetX = nearbyEnemyMinions[0].x;
             targetY = nearbyEnemyMinions[0].y;
          }
          else {
              if (isBaseSiege && !isClutch && !isFightingForObjective) {
                  action = 'defend';
                  
                  if (enemiesInBase) {
                     const threat = enemies.find(e => Math.hypot(e.x - myBase.x, e.y - myBase.y) < 25);
                     if (threat) {
                         targetX = threat.x;
                         targetY = threat.y;
                     } else {
                         targetX = myBase.x; targetY = myBase.y;
                     }
                  } else if (criticalWaveMinion) {
                      targetX = criticalWaveMinion.x;
                      targetY = criticalWaveMinion.y;
                  } else {
                      targetX = myBase.x;
                      targetY = myBase.y;
                  }
              }
              else {
                  const aliveAllies = entities.filter(e => e.team === entity.team && !e.isDead).length;
                  const wantBaron = baron.alive && gameMinutes > 20 && aliveAllies >= 4 && Math.random() > 0.4;
                  
                  const wantDragon = dragon.alive && !wantBaron && Math.random() > 0.4;

                  const aliveCamps = newJungleCamps.filter(c => c.alive && (c.teamOwner === entity.team || c.teamOwner === 'neutral'));
                  const shouldFarm = entity.role === Role.JUNGLE && aliveCamps.length > 0 && !wantBaron && !wantDragon && !isBaseSiege;

                  if (shouldFarm) {
                     const nearestCamp = aliveCamps.sort((a,b) => Math.hypot(a.x - entity.x, a.y - entity.y) - Math.hypot(b.x - entity.x, b.y - entity.y))[0];
                     if (nearestCamp) {
                         action = 'farm';
                         targetX = nearestCamp.x;
                         targetY = nearestCamp.y;
                     }
                  }
                  else if (wantBaron && (entity.role === Role.JUNGLE || gameMinutes > 25)) {
                     targetX = POSITIONS.BARON.x;
                     targetY = POSITIONS.BARON.y;
                     if (closestEnemy && closestEnemy.dist < 15) {
                         action = 'fight';
                         targetX = closestEnemy.x;
                         targetY = closestEnemy.y;
                     }
                  } else if (wantDragon) {
                     targetX = POSITIONS.DRAGON.x;
                     targetY = POSITIONS.DRAGON.y;
                     if (closestEnemy && closestEnemy.dist < 15) {
                         action = 'fight';
                         targetX = closestEnemy.x;
                         targetY = closestEnemy.y;
                     }
                  } 
                  else {
                     let laneTarget: StructureEntity | undefined;
                     let targetLane: Lane = 'MID';

                     if (gameMinutes < 10) {
                         if (entity.role === Role.TOP) targetLane = 'TOP';
                         else if (entity.role === Role.ADC || entity.role === Role.SUPPORT) targetLane = 'BOT';
                         else targetLane = 'MID';
                     } 
                     else {
                         const topHp = enemyStructures.filter(s => s.lane === 'TOP').length;
                         const midHp = enemyStructures.filter(s => s.lane === 'MID').length;
                         const botHp = enemyStructures.filter(s => s.lane === 'BOT').length;
                         
                         if (topHp <= midHp && topHp <= botHp) targetLane = 'TOP';
                         else if (botHp <= topHp && botHp <= midHp) targetLane = 'BOT';
                         else targetLane = 'MID';
                     }

                     if (entity.role === Role.JUNGLE) {
                         const lanes: Lane[] = ['TOP', 'MID', 'BOT'];
                         targetLane = lanes[Math.floor(Math.random() * lanes.length)];
                         action = 'gank';
                     }

                     const laneStructs = enemyStructures.filter(s => s.lane === targetLane);
                     laneTarget = laneStructs.find(s => isStructureVulnerable(s, newStructures));

                     if (!laneTarget) {
                         const baseStructs = enemyStructures.filter(s => s.lane === 'BASE');
                         laneTarget = baseStructs.find(s => isStructureVulnerable(s, newStructures));
                     }
                     
                     if (!laneTarget) {
                         const vulnerable = enemyStructures.filter(s => isStructureVulnerable(s, newStructures));
                         laneTarget = vulnerable.sort((a,b) => Math.hypot(a.x - entity.x, a.y - entity.y) - Math.hypot(b.x - entity.x, b.y - entity.y))[0];
                     }

                     if (laneTarget) {
                        targetX = laneTarget.x;
                        targetY = laneTarget.y;
                        action = 'push';
                     } else {
                         targetX = enemyBase.x;
                         targetY = enemyBase.y;
                         action = 'push';
                     }
                  }
              }
          }
      }

      let finalDest = { x: targetX, y: targetY };
      
      if (action !== 'flee' && action !== 'farm') {
         finalDest = getWaypointPath(entity.x, entity.y, targetX, targetY);
      }
      
      targetX = finalDest.x;
      targetY = finalDest.y;

      let moveSpeedBase = action === 'flee' ? BASE_CHAMP_SPEED * 1.1 : BASE_CHAMP_SPEED;
      moveSpeedBase *= (1 + (entity.stats.macro / 200)); 

      if (newStamina < 20) moveSpeedBase *= 0.7;

      const dx = targetX - entity.x;
      const dy = targetY - entity.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      let moveX = entity.x;
      let moveY = entity.y;

      let stopDist = 1;
      if (action === 'push') stopDist = 8;
      if (action === 'fight') stopDist = 6;
      if (action === 'farm') stopDist = 2;
      
      if (dist > stopDist) {
         const nextX = entity.x + (dx / dist) * moveSpeedBase * 0.10;
         const nextY = entity.y + (dy / dist) * moveSpeedBase * 0.10;

         const structureCollision = newStructures.some(s => 
             s.alive && s.team !== entity.team && Math.hypot(s.x - nextX, s.y - nextY) < 4
         );

         if (!structureCollision && dist > 0.1) {
            moveX = nextX;
            moveY = nextY;
            newStamina = Math.max(0, newStamina - 0.05);
         }
      } else {
         if (action === 'fight') {
             moveX += (Math.random() - 0.5) * 0.5;
             moveY += (Math.random() - 0.5) * 0.5;
         }
      }

      let dmgMultiplier = 1.0;
      if (entity.team === 'blue' && teamPowerDiff > 0) dmgMultiplier = 1 + (teamPowerDiff / 50);
      if (entity.team === 'red' && teamPowerDiff < 0) dmgMultiplier = 1 + (Math.abs(teamPowerDiff) / 50);

      if (action === 'farm') {
          const campIndex = newJungleCamps.findIndex(c => c.alive && Math.hypot(c.x - moveX, c.y - moveY) < 4);
          if (campIndex !== -1) {
              let farmDmg = entity.damage * 0.8 * timeScaling;
              if (entity.role === Role.JUNGLE) farmDmg *= 2.5;

              newJungleCamps[campIndex].hp -= farmDmg;
              if (newJungleCamps[campIndex].hp <= 0) {
                  newJungleCamps[campIndex].alive = false;
                  let respawnDuration = 2.5;
                  if (newJungleCamps[campIndex].type === 'buff') respawnDuration = 5;
                  if (newJungleCamps[campIndex].type === 'scuttle') respawnDuration = 3.5;
                  
                  newJungleCamps[campIndex].respawnTime = gameMinutes + respawnDuration;
                  
                  currentContribution += 10;
                  newStamina = Math.min(100, newStamina + 10);
                  newHp = Math.min(entity.maxHp, newHp + (entity.maxHp * 0.1));
              }
          }
      }

      const nearbyEnemyMinions = newMinions.filter(m => m.team !== entity.team && gameMinutes >= m.spawnTime && Math.hypot(m.x - moveX, m.y - moveY) < 6);
      if (nearbyEnemyMinions.length > 0) {
         let minionDmg = 5;
         
         const nearbyStruct = enemyStructures.find(s => s.alive && Math.hypot(s.x - moveX, s.y - moveY) < 10);
         if (action === 'push' && nearbyStruct) {
             minionDmg = 20;
         }

         newHp -= (nearbyEnemyMinions.length * minionDmg);
      }
      
      if (nearbyEnemyMinions.length > 0) {
         const waveClear = 0.5 + (entity.stats.lane / 150);
         nearbyEnemyMinions.forEach(m => {
             m.hp -= (entity.damage * waveClear * dmgMultiplier); 
         });
      }

      const nearbyEnemyTurret = enemyStructures.find(s => s.alive && Math.hypot(s.x - moveX, s.y - moveY) < 10);
      if (nearbyEnemyTurret) {
          const turretDmg = entity.maxHp * 0.015;
          newHp -= turretDmg;
      }

      const attackers = enemies.filter(e => !e.isDead && Math.hypot(e.x - moveX, e.y - moveY) < 8);
      if (attackers.length > 0) {
          attackers.forEach(attacker => {
             let rawDmg = attacker.damage * 0.3;
             rawDmg *= timeScaling;

             if (attacker.currentStamina < 30) rawDmg *= 0.8;
             if (attacker.isClutching) rawDmg *= 1.3;

             if (Math.random() < (attacker.stats.mechanics / 300)) {
                 rawDmg *= 1.5;
             }

             if (Math.random() < (entity.stats.mechanics / 500)) {
                 rawDmg *= 0.5;
             }

             if (gameMinutes < 14 && attacker.role === entity.role) {
                 const diff = attacker.stats.lane - entity.stats.lane;
                 if (diff > 0) rawDmg *= (1 + (diff / 200)); 
             }
             
             if (attacker.team === 'blue' && teamPowerDiff > 0) rawDmg *= (1 + (teamPowerDiff / 50));
             if (attacker.team === 'red' && teamPowerDiff < 0) rawDmg *= (1 + (Math.abs(teamPowerDiff) / 50));

             rawDmg *= (Math.random() * 0.4 + 0.8); 

             newHp -= rawDmg;
             attacker.currentStamina = Math.max(0, attacker.currentStamina - 0.2);
          });
      }

      const nearbyStruct = enemyStructures.find(s => isStructureVulnerable(s, newStructures) && Math.hypot(s.x - moveX, s.y - moveY) < 10);
      
      if (nearbyStruct) {
          const sIndex = newStructures.findIndex(s => s.id === nearbyStruct.id);
          if (sIndex !== -1) {
              let structDmg = (entity.damage * 0.15) * timeScaling;
              
              structDmg *= (1 + (entity.stats.lane / 200));

              if (gameMinutes > 25) structDmg *= 2.5;

              if (isClutch) structDmg *= 1.5;
              if (gameMinutes < 14 && nearbyStruct.type === 'outer') structDmg *= 0.15; 
              if (entity.team === winningTeam) structDmg *= 1.5;
              
              structDmg *= dmgMultiplier; // Team Diff

              const newStructHp = newStructures[sIndex].hp - structDmg;
              newStructures[sIndex] = { ...newStructures[sIndex], hp: newStructHp, lastAttackedTime: gameMinutes };

              if (newStructHp <= 0) {
                  newStructures[sIndex] = { ...newStructures[sIndex], alive: false, hp: 0 };
                  
                  currentContribution += 30;

                  let logMsg = `${entity.team === 'blue' ? 'Blue' : 'Red'} destroyed `;
                  if (nearbyStruct.type === 'outer') logMsg += 'Outer Turret';
                  else if (nearbyStruct.type === 'inner') logMsg += 'Inner Turret';
                  else if (nearbyStruct.type === 'inhib_turret') logMsg += 'Inhibitor Turret';
                  else if (nearbyStruct.type === 'inhibitor') logMsg += 'Inhibitor';
                  else if (nearbyStruct.type === 'nexus_turret') logMsg += 'Nexus Turret';
                  else if (nearbyStruct.type === 'nexus') logMsg += 'Nexus!';
                  
                  addLog(logMsg, 'turret');

                  if (nearbyStruct.type === 'nexus') {
                    gameEnded = true;
                    addLog(`VICTORY FOR ${entity.team.toUpperCase()} TEAM!`, 'normal');
                  }
              }
          }
      }

      const objectiveDmg = entity.damage * 0.3 * timeScaling;

      const distBaronMoved = Math.hypot(moveX - POSITIONS.BARON.x, moveY - POSITIONS.BARON.y);
      if (baron.alive && distBaronMoved < 8) {
          const alliesNearby = entities.filter(e => e.team === entity.team && !e.isDead && Math.hypot(e.x - POSITIONS.BARON.x, e.y - POSITIONS.BARON.y) < 15).length;
          
          if (alliesNearby >= 3) {
             if (Math.random() < 0.2) { 
                const captureBaseChance = 0.05; 
                const clutchMod = isClutch ? 0.02 : 0;
                
                if (Math.random() < (captureBaseChance + clutchMod)) {
                     setBaron({ alive: false, nextSpawnTime: gameMinutes + 6 });
                     currentContribution += 50;
                     addLog(`${entity.name} secured Baron! (+50 pts)`, 'obj');
                }
             }
          }
      }
      
      const distDragonMoved = Math.hypot(moveX - POSITIONS.DRAGON.x, moveY - POSITIONS.DRAGON.y);
      if (dragon.alive && distDragonMoved < 8) {
           const alliesNearby = entities.filter(e => e.team === entity.team && !e.isDead && Math.hypot(e.x - POSITIONS.DRAGON.x, e.y - POSITIONS.DRAGON.y) < 15).length;

          if (alliesNearby >= 2) {
            if (Math.random() < 0.2) {
                const captureBaseChance = 0.15;
                const clutchMod = isClutch ? 0.05 : 0;

                if (Math.random() < (captureBaseChance + clutchMod)) {
                    setDragon({ alive: false, nextSpawnTime: gameMinutes + 5 });
                    currentContribution += 50;

                    const newStacks = { ...dragonStacks };
                    if (entity.team === 'blue') newStacks.blue += 1;
                    else newStacks.red += 1;
                    setDragonStacks(newStacks);

                    const isElderKill = nextIsElder;
                    
                    if (newStacks[entity.team] >= 4) {
                    setNextIsElder(true);
                    }

                    addLog(`${entity.name} secured ${isElderKill ? 'ELDER DRAGON' : 'Dragon'}! (+50 pts)`, 'obj');
                }
            }
          }
      }

      let isDead = false;
      let respawnTimer = 0;

      if (newHp <= 0) {
          isDead = true;
          if (gameMinutes < 15) respawnTimer = 0.5;
          else if (gameMinutes < 25) respawnTimer = 1.0;
          else if (gameMinutes < 30) respawnTimer = 2.5;
          else respawnTimer = 5.0;

          const killer = attackers.length > 0 ? attackers[0] : null;
          if (killer) {
            newScore[killer.team] += 1;
            
            const points = 100;
            pendingScoreUpdates[killer.id] = (pendingScoreUpdates[killer.id] || 0) + points;

            const isSolo = attackers.length === 1;
            if (isSolo) {
                addLog(`SOLO KILL! ${killer.name} executed ${entity.name} (+${points} pts)`, 'kill');
            } else {
                addLog(`${killer.name} killed ${entity.name} (+${points} pts)`, 'kill');
            }

          } else {
             addLog(`${entity.name} has been slain`, 'kill');
          }
      }

      return {
          ...entity,
          x: moveX,
          y: moveY,
          isDead,
          respawnTimer,
          hp: Math.max(0, newHp),
          targetId: targetEnemyId,
          currentStamina: newStamina,
          isClutching: isClutch,
          contributionScore: currentContribution
      };
    });

    const finalEntities = newEntities.map(e => {
        if (pendingScoreUpdates[e.id]) {
            return { ...e, contributionScore: (e.contributionScore || 0) + pendingScoreUpdates[e.id] };
        }
        return e;
    });

    setEntities(finalEntities);
    setStructures(newStructures);
    setCurrentScore(newScore);
    setJungleCamps(newJungleCamps);

    if (gameEnded) {
      setGameOver(true);
      setTimeout(onComplete, 3000);
    }
  };

  const getStructureIcon = (s: StructureEntity) => {
      const color = s.team === 'blue' ? 'text-blue-500' : 'text-red-500';
      const fill = s.team === 'blue' ? 'fill-blue-900' : 'fill-red-900';
      const deadClass = !s.alive ? 'opacity-20 grayscale' : '';
      
      const hpPercent = s.maxHp > 0 ? (s.hp / s.maxHp) * 100 : 0;
      
      const isAttacked = s.alive && (gameMinutes - s.lastAttackedTime < 0.15);
      const shakeClass = isAttacked ? 'animate-shake' : '';
      const flashClass = isAttacked ? 'brightness-150' : '';
      
      let hpColor = 'bg-green-500';
      if (hpPercent < 30) hpColor = 'bg-red-500';
      else if (hpPercent < 60) hpColor = 'bg-yellow-500';

      const Icon = () => {
        switch (s.type) {
            case 'nexus': return <Hexagon className={`${color} ${fill} ${deadClass} ${flashClass}`} size={32} strokeWidth={3} />;
            case 'nexus_turret': return <Shield className={`${color} ${fill} ${deadClass} ${flashClass}`} size={20} strokeWidth={3} />;
            case 'inhibitor': return <Circle className={`${color} ${fill} ${deadClass} ${flashClass}`} size={20} strokeWidth={4} />;
            default: return <Shield className={`${color} ${fill} ${deadClass} ${flashClass}`} size={16} />;
        }
      };

      return (
        <div className={`relative flex flex-col items-center group ${shakeClass}`}>
           <Icon />
           {s.alive && s.hp < s.maxHp && (
               <div className="absolute -bottom-2 w-10 h-1.5 bg-gray-900 rounded-sm overflow-hidden border border-black/50 shadow-sm z-20">
                   <div className={`h-full transition-all duration-300 ${hpColor}`} style={{ width: `${hpPercent}%` }}></div>
               </div>
           )}
        </div>
      );
  };

  const DragonHUD = ({ stacks }: { stacks: number }) => {
     return (
        <div className="flex gap-1 items-center bg-black/40 px-2 py-1 rounded-full border border-white/10">
           {Array.from({length: 4}).map((_, i) => {
              const active = i < stacks;
              return (
                 <div key={i} className={`w-3 h-3 rounded-full border ${active ? 'bg-orange-500 border-orange-300 shadow-[0_0_5px_orange]' : 'bg-gray-800 border-gray-600'}`}></div>
              )
           })}
        </div>
     );
  };

  const PlayerHUD = ({ entities, team, teamName }: { entities: MapEntity[], team: 'blue' | 'red', teamName: string }) => {
    return (
       <div className={`flex flex-col gap-2 p-3 bg-dark-900/80 rounded-xl border ${team === 'blue' ? 'border-blue-500/30' : 'border-red-500/30'}`}>
          <h3 className={`text-xs font-bold uppercase tracking-widest mb-1 ${team === 'blue' ? 'text-blue-400' : 'text-red-400'}`}>{teamName}</h3>
          {entities.map(e => {
             const hpPercent = (e.hp / e.maxHp) * 100;
             const displayRespawn = Math.ceil(e.respawnTimer * 10); 
             
             let barColor = 'bg-blue-500';
             if (team === 'red') barColor = 'bg-red-500';
             if (hpPercent < 30) barColor = 'bg-red-500 animate-pulse';

             return (
               <div key={e.id} className="relative flex items-center gap-2 group">
                  <div className={`relative w-10 h-10 rounded-full border-2 overflow-hidden shrink-0 ${team === 'blue' ? 'border-blue-600 bg-blue-900' : 'border-red-600 bg-red-900'} ${e.isDead ? 'grayscale brightness-50' : ''}`}>
                      <div className="flex items-center justify-center w-full h-full text-white font-bold text-[10px] uppercase">
                         {e.role.substring(0,3)}
                      </div>
                      {e.isDead && (
                         <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-mono text-white text-sm font-bold z-10">
                            {displayRespawn}
                         </div>
                      )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-center text-[10px] font-bold text-gray-300 mb-0.5">
                        <span className="truncate max-w-[80px]">{e.name}</span>
                        <div className="flex items-center gap-1">
                            {e.contributionScore > 0 && <span className="text-gold-400 font-mono text-[9px] flex items-center gap-0.5"><Trophy size={8}/>{e.contributionScore}</span>}
                            <span>{Math.floor(e.hp)}</span>
                        </div>
                     </div>
                     <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden border border-black/50">
                        <div className={`h-full transition-all duration-300 ${barColor}`} style={{ width: `${hpPercent}%` }}></div>
                     </div>
                  </div>
               </div>
             )
          })}
       </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 overflow-hidden">
      <style>
         {`
           @keyframes shake {
             0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
             25% { transform: translate(-52%, -52%) rotate(-5deg); }
             75% { transform: translate(-48%, -48%) rotate(5deg); }
           }
           .animate-shake {
             animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both;
           }
         `}
      </style>

      <div className="w-full max-w-[90rem] flex justify-between items-center mb-4 text-white shrink-0">
        <div className="flex items-center gap-4 bg-blue-900/20 p-2 pr-6 rounded-r-full border-l-4 border-blue-500 min-w-[300px]">
           <TeamLogo team={userTeam} size="w-12 h-12" />
           <div className="text-left flex-1">
             <div className="flex items-center justify-between gap-4">
                 <div className="font-bold text-2xl leading-none">{userTeam.shortName}</div>
                 <div className="text-blue-400 font-mono text-xl">{currentScore.blue}</div>
             </div>
             <div className="mt-1">
                 <DragonHUD stacks={dragonStacks.blue} />
             </div>
           </div>
        </div>

        <div className="flex flex-col items-center">
           <div className="bg-dark-800 px-6 py-2 rounded-lg text-gray-200 font-mono text-2xl font-bold shadow-lg border border-white/10 min-w-[100px] text-center">
             {getCurrentGameTimeStr()}
           </div>
           {gameMinutes < 14 && <div className="text-[10px] text-yellow-500 uppercase font-bold mt-1">Turret Plating Active</div>}
           {gameMinutes > 30 && <div className="text-[10px] text-red-500 uppercase font-bold mt-1 animate-pulse">SUDDEN DEATH</div>}
        </div>

        <div className="flex items-center gap-4 bg-red-900/20 p-2 pl-6 rounded-l-full border-r-4 border-red-500 min-w-[300px] flex-row-reverse">
           <TeamLogo team={enemyTeam} size="w-12 h-12" />
           <div className="text-right flex-1">
             <div className="flex items-center justify-between gap-4 flex-row-reverse">
                 <div className="font-bold text-2xl leading-none">{enemyTeam?.shortName || 'ENEMY'}</div>
                 <div className="text-red-400 font-mono text-xl">{currentScore.red}</div>
             </div>
             <div className="mt-1 flex justify-end">
                 <DragonHUD stacks={dragonStacks.red} />
             </div>
           </div>
        </div>
      </div>

      <div className="flex gap-4 w-full max-w-[90rem] h-[75vh] items-stretch">
          
          <div className="w-48 flex flex-col gap-4 overflow-y-auto shrink-0">
             <PlayerHUD entities={entities.filter(e => e.team === 'blue')} team="blue" teamName={userTeam.shortName} />
             <div className="flex-1"></div>
             <PlayerHUD entities={entities.filter(e => e.team === 'red')} team="red" teamName={enemyTeam?.shortName || 'ENEMY'} />
          </div>

          <div className="flex-1 relative aspect-square bg-[#0f1923] border-4 border-dark-700 rounded-xl overflow-hidden shadow-2xl mx-auto">
             <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <path d="M 5 95 L 5 5 L 95 5" fill="none" stroke="#64748b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                
                <line x1="5" y1="95" x2="95" y2="5" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
                
                <path d="M 5 95 L 95 95 L 95 5" fill="none" stroke="#64748b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                
                <circle cx="5" cy="95" r="15" fill="#3b82f6" opacity="0.2" />
                <circle cx="95" cy="5" r="15" fill="#ef4444" opacity="0.2" />
             </svg>

             {jungleCamps.map(camp => {
                 if (!camp.alive) return null;
                 return (
                     <div 
                        key={camp.id}
                        className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center text-gray-400 opacity-60"
                        style={{ left: `${camp.x}%`, top: `${camp.y}%` }}
                     >
                        {camp.type === 'scuttle' ? <Ghost size={14} /> : <TreeDeciduous size={16} />}
                     </div>
                 )
             })}

             {structures.map(s => (
                 <div 
                    key={s.id} 
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-300"
                    style={{ left: `${s.x}%`, top: `${s.y}%` }}
                 >
                     {getStructureIcon(s)}
                 </div>
             ))}

             <div className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-500 ${baron.alive ? 'opacity-100 scale-100 animate-bounce' : 'opacity-20 scale-90 grayscale'}`} style={{ left: `${POSITIONS.BARON.x}%`, top: `${POSITIONS.BARON.y}%` }}>
                {!baron.alive && baron.nextSpawnTime - gameMinutes < 1 && (
                    <div className="absolute inset-0 border-2 border-dashed border-purple-400 rounded-full animate-spin"></div>
                )}
                <div className="w-8 h-8 rounded-full bg-purple-900 border-2 border-purple-500 flex items-center justify-center shadow-[0_0_15px_purple]">
                    <span className="font-bold text-purple-300 text-xs">B</span>
                </div>
             </div>
             
             <div className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-500 ${dragon.alive ? 'opacity-100 scale-100 animate-bounce' : 'opacity-20 scale-90 grayscale'}`} style={{ left: `${POSITIONS.DRAGON.x}%`, top: `${POSITIONS.DRAGON.y}%` }}>
                {!dragon.alive && dragon.nextSpawnTime - gameMinutes < 1 && (
                    <div className="absolute inset-0 border-2 border-dashed border-orange-400 rounded-full animate-spin"></div>
                )}
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-[0_0_15px_orange] ${nextIsElder ? 'bg-white border-gray-300' : 'bg-orange-900 border-orange-500'}`}>
                    <span className={`font-bold text-xs ${nextIsElder ? 'text-black' : 'text-orange-300'}`}>{nextIsElder ? 'E' : 'D'}</span>
                </div>
             </div>

             {minions.map(m => {
                 if (gameMinutes < m.spawnTime) return null;
                 return (
                     <div 
                        key={m.id}
                        className={`absolute w-1.5 h-1.5 rounded-full z-20 ${m.team === 'blue' ? 'bg-blue-300' : 'bg-red-300'}`}
                        style={{ left: `${m.x}%`, top: `${m.y}%` }}
                     ></div>
                 )
             })}

             {entities.map(e => {
                 if (e.isDead) return null;
                 
                 const hpPercent = (e.hp / e.maxHp) * 100;
                 const isLow = hpPercent < 30;
                 
                 let barColor = e.team === 'blue' ? 'bg-blue-400' : 'bg-red-400';
                 if (hpPercent < 50) barColor = 'bg-yellow-400';
                 if (hpPercent < 25) barColor = 'bg-red-500 animate-pulse';

                 return (
                     <div 
                        key={e.id}
                        className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center transition-all duration-100 linear group"
                        style={{ left: `${e.x}%`, top: `${e.y}%` }}
                     >
                        {e.isClutching && (
                           <>
                             <div className="absolute inset-0 rounded-full shadow-[0_0_20px_4px_rgba(250,204,21,0.6)] animate-pulse"></div>
                             <div className="absolute -top-6 text-yellow-400 drop-shadow-md animate-bounce">
                                <Crown size={12} fill="currentColor" />
                             </div>
                           </>
                        )}
                        
                        <div className="absolute -top-3 w-8 h-1 bg-black rounded-full overflow-hidden border border-white/20">
                           <div className={`h-full transition-all duration-300 ${barColor}`} style={{ width: `${hpPercent}%` }}></div>
                        </div>

                        <div className={`w-full h-full rounded-full border border-white shadow-sm flex items-center justify-center ${e.team === 'blue' ? 'bg-blue-600' : 'bg-red-600'} ${isLow ? 'animate-pulse ring-2 ring-red-500' : ''} ${e.isClutching ? 'ring-2 ring-yellow-400' : ''}`}>
                            <span className="text-[8px] font-bold text-white leading-none">{e.role[0]}</span>
                        </div>
                     </div>
                 )
             })}
          </div>

          <div className="w-80 bg-dark-900 border border-dark-700 rounded-xl overflow-hidden flex flex-col shadow-xl shrink-0">
             <div className="p-3 bg-dark-800 border-b border-dark-700 font-bold text-gray-300 flex items-center gap-2">
                <Swords size={16} /> Match Events
             </div>
             <div ref={logContainerRef} className="flex-1 overflow-y-auto p-2 space-y-1 text-xs font-mono scroll-smooth">
                {logs.length === 0 && <div className="text-gray-600 text-center mt-10">Match Starting...</div>}
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-2 p-1.5 rounded hover:bg-white/5 transition-colors">
                        <span className="text-gray-500 shrink-0">{log.time}</span>
                        <span className={`break-words ${
                            log.type === 'kill' ? 'text-red-400 font-bold' : 
                            log.type === 'obj' ? 'text-yellow-400' : 
                            log.type === 'turret' ? 'text-blue-300' : 'text-gray-300'
                        }`}>
                           {log.type === 'kill' && <Skull size={10} className="inline mr-1" />}
                           {log.msg}
                        </span>
                    </div>
                ))}
             </div>
          </div>
      </div>

      <div className="mt-6 flex gap-4">
         <button onClick={onComplete} className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-200 text-black font-bold rounded-lg shadow-xl transition-all">
            <FastForward size={20} /> End Simulation
         </button>
      </div>
    </div>
  );
};