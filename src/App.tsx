
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Card } from './components/Card';
import { TeamLogo } from './components/TeamLogo';
import { TeamStatsView } from './components/TeamStatsView';
import { MatchSimulationView } from './components/MatchSimulationView';
import { TrainingView } from './components/TrainingView';
import { Onboarding, LCK_TEAMS } from './components/Onboarding';
import { scoutPlayers, generateMatchCommentary } from './services/geminiService';
import { Role, PlayerCard, GameState, MatchResult, Rarity, TeamData, ScheduledMatch, PlayoffMatch, Standing, PlayerEvent } from './types';
import { REAL_LCK_PLAYERS } from './data/players';
import { drawGroups, generateGroupStageSchedule } from './utils/scheduler';
import { Trophy, RotateCcw, Coins, AlertTriangle, Users, Play, Calendar, Lock, BarChart3, CheckCircle2, XCircle, Filter, ArrowDownUp, Search, Shield, Zap, Sword, Brain, Wand2, Handshake, Sparkles, CalendarDays, FastForward, SkipForward } from 'lucide-react';

// --- Initial Data ---
const INITIAL_COINS = 10000; 

// --- Negotiation Modal ---
interface NegotiationModalProps {
  player: PlayerCard;
  isOpen: boolean;
  onClose: () => void;
  onOffer: (salary: number, duration: number) => void;
  currentCoins: number;
  serverFeedback?: string | null;
  attemptsLeft?: number;
}

const NegotiationModal: React.FC<NegotiationModalProps> = ({ player, isOpen, onClose, onOffer, currentCoins, serverFeedback, attemptsLeft }) => {
  const [offerSalary, setOfferSalary] = useState(player.salary);
  const [offerDuration, setOfferDuration] = useState(1);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        setOfferSalary(player.salary);
        setOfferDuration(1);
        setLocalError(null);
    }
  }, [isOpen, player]);

  if (!isOpen) return null;

  const isFA = player.team === 'FA' || player.team === 'ACA';
  const transferFee = isFA ? 0 : player.price;
  const totalUpfrontCost = transferFee + offerSalary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-dark-900 border border-dark-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-fade-in">
         <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
         
         <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-dark-800 border border-dark-600 overflow-hidden">
               <img src={`https://picsum.photos/seed/${player.id}/200`} alt={player.name} className="w-full h-full object-cover grayscale" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white">{player.name}</h3>
               <p className="text-sm text-gray-400">{player.role} • {player.team} • {player.age}yo</p>
            </div>
         </div>

         <div className="space-y-6">
             {!isFA && (
                 <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex justify-between items-center">
                    <span className="text-sm text-red-300 font-bold">Transfer Fee (to {player.team})</span>
                    <span className="font-mono text-red-300 font-bold">{transferFee} G</span>
                 </div>
             )}

             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Contract Duration</label>
                <div className="flex gap-2">
                   {[1, 2, 3].map(yrs => (
                      <button 
                        key={yrs}
                        onClick={() => setOfferDuration(yrs)}
                        className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${offerDuration === yrs ? 'bg-hextech-600 border-hextech-500 text-white' : 'bg-dark-800 border-dark-700 text-gray-400 hover:bg-dark-700'}`}
                      >
                        {yrs} Season{yrs > 1 ? 's' : ''}
                      </button>
                   ))}
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Salary Offer (Per Season)</label>
                <div className="flex items-center gap-2">
                   <button onClick={() => setOfferSalary(s => Math.max(0, s - 50))} className="p-2 bg-dark-800 rounded hover:bg-dark-700">-</button>
                   <input 
                      type="number" 
                      value={offerSalary} 
                      onChange={(e) => setOfferSalary(Number(e.target.value))}
                      className="flex-1 bg-dark-950 border border-dark-700 rounded p-2 text-center text-white font-mono font-bold"
                   />
                   <button onClick={() => setOfferSalary(s => s + 50)} className="p-2 bg-dark-800 rounded hover:bg-dark-700">+</button>
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                   <span>Market Avg: {player.salary} G</span>
                   {attemptsLeft !== undefined && (
                      <span className={`${attemptsLeft < 2 ? 'text-red-400' : 'text-orange-300'}`}>Patience: {attemptsLeft} attempts left</span>
                   )}
                </div>
             </div>
             
             <div className="border-t border-dark-700 pt-4">
                <div className="flex justify-between items-center mb-1">
                   <span className="text-gray-400">Total Upfront Cost:</span>
                   <span className={`font-mono font-bold ${totalUpfrontCost > currentCoins ? 'text-red-500' : 'text-gold-400'}`}>
                      {totalUpfrontCost} G
                   </span>
                </div>
                {totalUpfrontCost > currentCoins && (
                   <p className="text-xs text-red-500 text-right">Insufficient Funds</p>
                )}
             </div>

             {serverFeedback && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-200 text-sm text-center font-bold animate-pulse">
                   {serverFeedback}
                </div>
             )}

             {localError && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/50 rounded text-orange-200 text-sm text-center font-bold animate-pulse">
                   {localError}
                </div>
             )}

             <button 
                onClick={() => {
                   if (totalUpfrontCost > currentCoins) {
                      setLocalError("You cannot afford this deal.");
                      return;
                   }
                   setLocalError(null);
                   onOffer(offerSalary, offerDuration);
                }}
                className="w-full py-3 bg-white text-black font-bold uppercase rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
             >
                <Handshake size={18} /> {serverFeedback ? 'Submit Counter-Offer' : 'Submit Offer'}
             </button>
         </div>
      </div>
    </div>
  );
}

// --- Event Modal ---
interface EventModalProps {
  event: PlayerEvent;
  player: PlayerCard;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, player, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-dark-900 border-2 border-red-500/50 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-bounce-in text-center">
         <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-500" size={32} />
         </div>
         
         <h2 className="text-2xl font-display font-bold text-white mb-2">Random Event Triggered!</h2>
         <p className="text-gray-400 mb-6">Something unexpected has happened to your team.</p>
         
         <div className="bg-dark-950 p-4 rounded-xl border border-dark-800 mb-6 text-left flex items-start gap-4">
            <img 
               src={`https://picsum.photos/seed/${player.id}/100`} 
               alt={player.name} 
               className="w-12 h-12 rounded-full border border-gray-600 grayscale"
            />
            <div>
               <h3 className="text-lg font-bold text-red-400">{event.title}</h3>
               <p className="text-sm text-gray-300">{event.description.replace('{player}', player.name)}</p>
               <div className="mt-2 flex gap-2 text-xs font-mono text-red-500 font-bold">
                  {Object.entries(event.penalty).map(([stat, val]) => (
                     <span key={stat}>-{val} {stat.toUpperCase()}</span>
                  ))}
               </div>
               <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
                  Duration: {event.duration} matches
               </div>
            </div>
         </div>

         <button 
           onClick={onClose}
           className="w-full py-3 bg-white text-black font-bold uppercase rounded-xl hover:bg-gray-200 transition-colors"
         >
           Acknowledge
         </button>
      </div>
    </div>
  );
};

// BracketMatch component definition (Moved outside of App)
const BracketMatch: React.FC<{ match: PlayoffMatch, style?: React.CSSProperties }> = ({ match, style }) => {
  const teamA = LCK_TEAMS.find(t => t.id === match.teamAId);
  const teamB = LCK_TEAMS.find(t => t.id === match.teamBId);
  
  return (
      <div className="bg-dark-900 border border-dark-700 rounded-lg p-3 w-64 shadow-lg relative z-10" style={style}>
          <div className="text-[10px] text-gray-500 font-bold uppercase mb-2 flex justify-between">
              <span>{match.roundName}</span>
              <span className="text-blue-400">{match.isBo5 ? 'Bo5' : 'Bo3'}</span>
          </div>
          
          <div className={`flex justify-between items-center mb-2 ${match.winnerId === teamA?.id ? 'opacity-100' : match.winnerId ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-2">
                  <TeamLogo team={teamA} size="w-6 h-6" />
                  <span className={`font-bold text-sm ${match.winnerId === teamA?.id ? 'text-green-400' : 'text-white'}`}>
                      {teamA?.shortName || 'TBD'}
                  </span>
              </div>
              <span className="font-mono font-bold">{match.seriesScoreA ?? 0}</span>
          </div>
          
          <div className={`flex justify-between items-center ${match.winnerId === teamB?.id ? 'opacity-100' : match.winnerId ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-2">
                  <TeamLogo team={teamB} size="w-6 h-6" />
                  <span className={`font-bold text-sm ${match.winnerId === teamB?.id ? 'text-green-400' : 'text-white'}`}>
                      {teamB?.shortName || 'TBD'}
                  </span>
              </div>
              <span className="font-mono font-bold">{match.seriesScoreB ?? 0}</span>
          </div>
      </div>
  );
};


export default function App() {
  // Navigation State
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [tab, setTab] = useState('dashboard');
  
  // Game State
  const [gameState, setGameState] = useState<GameState>({
    managerName: '',
    teamId: '',
    coins: INITIAL_COINS,
    year: 2025,
    currentSeason: 1,
    week: 0, 
    currentDay: 1, 
    stage: 'PRE_SEASON',
    groups: { A: [], B: [] },
    winnersGroup: null,
    inventory: [],
    roster: {
        [Role.TOP]: null,
        [Role.JUNGLE]: null,
        [Role.MID]: null,
        [Role.ADC]: null,
        [Role.SUPPORT]: null,
        [Role.COACH]: null
    },
    aiRosters: {},
    standings: [],
    schedule: [],
    playoffMatches: [],
    freeAgents: [],
    trainingSlotsUsed: 0
  });

  const [market, setMarket] = useState<PlayerCard[]>([]);
  const [isScouting, setIsScouting] = useState(false);
  const [lastMatch, setLastMatch] = useState<MatchResult | null>(null);
  
  // Market Filters
  const [filterRole, setFilterRole] = useState<Role | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'FA' | 'TRANSFER'>('ALL');
  const [sortOrder, setSortOrder] = useState<'RATING' | 'PRICE' | 'SALARY'>('RATING');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 20000 });

  // Simulation State
  const [pendingSimResult, setPendingSimResult] = useState<{
    userResult: MatchResult,
    matchId: string,
    opponentId: string
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const [isPlayingMatch, setIsPlayingMatch] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Negotiation State
  interface NegotiationSession {
    player: PlayerCard;
    askingSalary: number;
    patience: number;
  }
  const [negotiationSession, setNegotiationSession] = useState<NegotiationSession | null>(null);
  const [negotiationFeedback, setNegotiationFeedback] = useState<string | null>(null);

  // Random Event State
  const [activeEventModal, setActiveEventModal] = useState<{event: PlayerEvent, player: PlayerCard} | null>(null);

  const activeTeamData = LCK_TEAMS.find(t => t.id === gameState.teamId) || null;

  // Initialize Standings
  useEffect(() => {
    if (onboardingComplete && gameState.standings.length === 0) {
      const initialStandings = LCK_TEAMS.map(t => ({
        teamId: t.id,
        name: t.shortName,
        wins: 0,
        losses: 0,
        gameWins: 0,
        gameLosses: 0,
        streak: 0,
        group: 'A' as 'A' | 'B' // Placeholder
      }));
      setGameState(prev => ({ ...prev, standings: initialStandings }));
    }
  }, [onboardingComplete]);

  // Handle Onboarding Completion
  const handleOnboardingComplete = (name: string, team: TeamData) => {
    const shuffledPlayers = [...REAL_LCK_PLAYERS].sort(() => 0.5 - Math.random());
    
    setGameState(prev => ({
      ...prev,
      managerName: name,
      teamId: team.id,
      inventory: [],
      roster: {
        [Role.TOP]: null,
        [Role.JUNGLE]: null,
        [Role.MID]: null,
        [Role.ADC]: null,
        [Role.SUPPORT]: null,
        [Role.COACH]: null
      }
    }));
    
    setMarket(shuffledPlayers);
    setOnboardingComplete(true);
    setTab('market'); 
  };

  // Filtered Market Logic
  const filteredMarket = useMemo(() => {
    let result = [...market];

    // Role Filter
    if (filterRole !== 'ALL') {
      result = result.filter(p => p.role === filterRole);
    }

    // Status Filter
    if (filterStatus === 'FA') {
      result = result.filter(p => p.team === 'FA' || p.team === 'ACA');
    } else if (filterStatus === 'TRANSFER') {
      result = result.filter(p => p.team !== 'FA' && p.team !== 'ACA');
    }

    // Price Filter
    result = result.filter(p => {
      const cost = (p.team === 'FA' || p.team === 'ACA') ? 0 : p.price;
      return cost >= priceRange.min && cost <= priceRange.max;
    });

    // Sort
    result.sort((a, b) => {
      if (sortOrder === 'RATING') return b.overall - a.overall;
      if (sortOrder === 'PRICE') return ((b.team === 'FA' ? 0 : b.price) - (a.team === 'FA' ? 0 : a.price));
      if (sortOrder === 'SALARY') return b.salary - a.salary;
      return 0;
    });

    return result;
  }, [market, filterRole, filterStatus, sortOrder, priceRange]);

  // Helper to calculate synergies
  const getActiveSynergies = useCallback((roster: Record<Role, PlayerCard | null> | Record<string, PlayerCard>) => {
    const players = Object.values(roster).filter(p => p !== null) as PlayerCard[];
    const counts: Record<string, number> = {};
    
    players.forEach(p => {
      if (['FA', 'ACA'].includes(p.team)) return;
      counts[p.team] = (counts[p.team] || 0) + 1;
    });

    const synergies: { team: string, count: number, bonus: number }[] = [];
    let totalBonus = 0;

    Object.entries(counts).forEach(([team, count]) => {
      if (count >= 2) {
        let bonus = 0;
        if (count === 2) bonus = 2;
        if (count === 3) bonus = 4;
        if (count === 4) bonus = 6;
        if (count === 5) bonus = 10;
        
        synergies.push({ team, count, bonus });
        totalBonus += bonus;
      }
    });

    return { synergies, totalBonus };
  }, []);

  // Calculate Team Power
  const getTeamPower = useCallback((teamId: string = gameState.teamId) => {
    if (teamId === gameState.teamId) {
      const players = Object.values(gameState.roster).filter(p => p !== null) as PlayerCard[];
      if (players.length === 0) return 0;
      
      const baseTotal = players.reduce((acc, p) => acc + p.overall, 0);
      const { totalBonus } = getActiveSynergies(gameState.roster);
      
      return Math.round(baseTotal / 5) + totalBonus;
    } else {
      if (gameState.aiRosters[teamId]) {
         const roster = gameState.aiRosters[teamId];
         const { totalBonus } = getActiveSynergies(roster as unknown as Record<string, PlayerCard>);
         const players = Object.values(roster) as PlayerCard[];
         
         if (players.length > 0) {
            const total = players.reduce((acc, p) => acc + p.overall, 0);
            return Math.round(total / 5) + totalBonus;
         }
      }
      const baseMap: Record<string, number> = {
        't1': 95, 'geng': 94, 'hle': 91, 'dk': 89, 'kt': 87,
        'kdf': 84, 'drx': 80, 'fox': 81, 'ns': 79, 'bro': 77
      };
      return baseMap[teamId] || 80;
    }
  }, [gameState.roster, gameState.teamId, gameState.aiRosters, getActiveSynergies]);

  const isRosterComplete = useCallback(() => {
    const requiredRoles = [Role.TOP, Role.JUNGLE, Role.MID, Role.ADC, Role.SUPPORT];
    return requiredRoles.every(role => gameState.roster[role] !== null);
  }, [gameState.roster]);

  // --- Actions ---

  const showNotification = (type: 'success' | 'error', message: string) => {
      setNotification({ type, message });
      setTimeout(() => setNotification(null), 3000);
  };

  const generateRandomEvent = (roster: Record<Role, PlayerCard | null>): { player: PlayerCard, event: PlayerEvent } | null => {
     if (Math.random() > 0.05) return null;
     const players = Object.values(roster).filter((p): p is PlayerCard => p !== null);
     if (players.length === 0) return null;
     const player = players[Math.floor(Math.random() * players.length)];
     const scenarios: Omit<PlayerEvent, 'id' | 'duration' | 'penalty'>[] = [
        { type: 'INJURY', title: 'Finger Sprain', description: '{player} jammed their finger during practice.' },
        { type: 'INJURY', title: 'Wrist Pain', description: '{player} is complaining of wrist fatigue.' },
        { type: 'MORALE', title: 'Bad Mood', description: '{player} is feeling down after a solo queue loss streak.' },
        { type: 'DRAMA', title: 'Internal Conflict', description: '{player} argued with the coaching staff.' },
        { type: 'CONTRACT', title: 'Secret Talks', description: 'Rumors say {player} is talking to other teams.' },
     ];
     const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
     const duration = Math.floor(Math.random() * 3) + 2; 
     const penalty: Partial<PlayerCard['stats']> = {};
     if (scenario.type === 'INJURY') penalty.mechanics = Math.floor(Math.random() * 5) + 3; 
     else if (scenario.type === 'MORALE') { penalty.lane = 3; penalty.teamfight = 3; }
     else if (scenario.type === 'DRAMA') penalty.teamfight = 5; 
     else if (scenario.type === 'CONTRACT') penalty.macro = 4;

     return { id: crypto.randomUUID(), ...scenario, duration, penalty } as any;
  };

  const processEvents = (prevGameState: GameState): { roster: GameState['roster'], notifications: string[] } => {
     let newRoster = { ...prevGameState.roster };
     const notifications: string[] = [];
     Object.keys(newRoster).forEach(key => {
        const role = key as Role;
        const player = newRoster[role];
        if (player && player.events && player.events.length > 0) {
            let updatedEvents: PlayerEvent[] = [];
            let statsRestored = { ...player.stats };
            let hasChanges = false;
            player.events.forEach(ev => {
                const newDuration = ev.duration - 1;
                if (newDuration <= 0) {
                    hasChanges = true;
                    if (ev.penalty.mechanics) statsRestored.mechanics = Math.min(99, statsRestored.mechanics + ev.penalty.mechanics);
                    if (ev.penalty.macro) statsRestored.macro = Math.min(99, statsRestored.macro + ev.penalty.macro);
                    if (ev.penalty.lane) statsRestored.lane = Math.min(99, statsRestored.lane + ev.penalty.lane);
                    if (ev.penalty.teamfight) statsRestored.teamfight = Math.min(99, statsRestored.teamfight + ev.penalty.teamfight);
                    notifications.push(`${player.name} has recovered from ${ev.title}.`);
                } else {
                    updatedEvents.push({ ...ev, duration: newDuration });
                }
            });
            if (hasChanges || updatedEvents.length !== player.events.length) {
                const newOverall = Math.round((statsRestored.mechanics + statsRestored.macro + statsRestored.lane + statsRestored.teamfight) / 4);
                newRoster[role] = { ...player, stats: statsRestored, overall: newOverall, events: updatedEvents };
            } else {
                newRoster[role] = { ...player, events: updatedEvents };
            }
        }
     });
     return { roster: newRoster, notifications };
  };

  const scoutMarket = async () => {
    if (gameState.coins < 100) { setError("Not enough coins (100G)"); setTimeout(() => setError(null), 3000); return; }
    setIsScouting(true);
    setGameState(prev => ({ ...prev, coins: prev.coins - 100 }));
    const ownedIds = new Set([...gameState.inventory.map(p => p.id), ...(Object.values(gameState.roster) as PlayerCard[]).filter(p => p).map(p => p.id)]);
    const newPlayers = await scoutPlayers(4, ownedIds, gameState.freeAgents);
    setMarket(newPlayers);
    setIsScouting(false);
  };

  const handleAutoFill = () => {
    const requiredRoles = [Role.TOP, Role.JUNGLE, Role.MID, Role.ADC, Role.SUPPORT];
    const missingRoles = requiredRoles.filter(role => gameState.roster[role] === null);
    
    if (missingRoles.length === 0) {
      showNotification('error', 'Roster is already full!');
      return;
    }

    let budget = gameState.coins;
    let purchases: PlayerCard[] = [];
    let updatedMarket = [...filteredMarket]; 

    // Find affordable players for missing roles
    missingRoles.forEach(role => {
        // Find cheapest valid player in market for this role
        const candidateIndex = updatedMarket.findIndex(p => {
             const cost = (p.team === 'FA' || p.team === 'ACA') ? p.salary : p.price + p.salary;
             return p.role === role && cost <= budget;
        });

        if (candidateIndex !== -1) {
             const candidate = updatedMarket[candidateIndex];
             const cost = (candidate.team === 'FA' || candidate.team === 'ACA') ? candidate.salary : candidate.price + candidate.salary;
             
             purchases.push({ 
                 ...candidate, 
                 team: activeTeamData?.shortName || 'MY TEAM', 
                 contractDuration: 1, 
                 price: 0 
             });
             
             budget -= cost;
             updatedMarket.splice(candidateIndex, 1);
        }
    });

    if (purchases.length === 0) {
         showNotification('error', 'Could not afford any players for missing roles.');
         return;
    }

    setGameState(prev => {
        const newRoster = { ...prev.roster };
        purchases.forEach(p => {
            newRoster[p.role] = p;
        });
        
        // Remove bought players from free agents list if they were FAs
        const boughtIds = new Set(purchases.map(p => p.id));
        const newFAs = prev.freeAgents.filter(fa => !boughtIds.has(fa.id));

        return {
            ...prev,
            coins: budget,
            roster: newRoster,
            freeAgents: newFAs
        };
    });

    // Update global market state by removing purchased players
    setMarket(prev => prev.filter(p => !purchases.some(purch => purch.id === p.id)));
    showNotification('success', `Auto-filled ${purchases.length} roles!`);
  };

  const handleTraining = (playerId: string, activityId: string, cost: number, gains: Partial<PlayerCard['stats']>) => {
      // Mock implementation
      setGameState(prev => ({...prev, coins: prev.coins - cost, trainingSlotsUsed: prev.trainingSlotsUsed + 1}));
  };

  const openNegotiation = (player: PlayerCard) => {
    setNegotiationSession({ player, askingSalary: player.salary, patience: 3 });
  };

  const handleNegotiationOffer = (salary: number, duration: number) => {
     if (!negotiationSession) return;
     const { player } = negotiationSession;
     // Simplified success
     const newPlayer = { ...player, salary, contractDuration: duration, team: activeTeamData?.shortName || 'MY TEAM', price: 0 };
     setGameState(prev => ({
        ...prev,
        coins: prev.coins - salary,
        inventory: [...prev.inventory, newPlayer],
        roster: { ...prev.roster, [player.role]: prev.roster[player.role] || newPlayer },
        freeAgents: prev.freeAgents.filter(p => p.id !== player.id)
     }));
     setNegotiationSession(null);
  };

  const assignToRoster = (player: PlayerCard) => {
    setGameState(prev => {
      const existing = prev.roster[player.role];
      const newInventory = prev.inventory.filter(p => p.id !== player.id);
      // If there was someone in the roster spot, move them back to inventory? 
      // Assuming inventory contains ALL owned players, so we don't need to add back.
      // But if inventory is "Bench", we do.
      // Let's assume inventory is ALL players for now based on previous logic.
      return { ...prev, roster: { ...prev.roster, [player.role]: player } };
    });
  };

  // --- NEW LOGIC START ---

  const startSeason = () => {
    if (!isRosterComplete()) {
      setError("You must sign a player for every role to start the season!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // 1. Distribute remaining players to AI teams
    const userPlayerIds = new Set([
        ...gameState.inventory.map(p => p.id),
        ...(Object.values(gameState.roster) as (PlayerCard | null)[]).filter(p => p).map(p => p!.id)
    ]);

    const pool = REAL_LCK_PLAYERS.filter(p => !userPlayerIds.has(p.id)).sort((a, b) => b.overall - a.overall);
    const aiTeams = LCK_TEAMS.filter(t => t.id !== gameState.teamId);
    
    const newAiRosters: Record<string, Record<Role, PlayerCard>> = {};
    const roles = [Role.TOP, Role.JUNGLE, Role.MID, Role.ADC, Role.SUPPORT];
    
    aiTeams.forEach(team => {
        newAiRosters[team.id] = {} as any;
        roles.forEach(role => {
            const playerIndex = pool.findIndex(p => p.role === role);
            if (playerIndex >= 0) {
                const player = pool[playerIndex];
                newAiRosters[team.id][role] = { ...player, team: team.shortName };
                pool.splice(playerIndex, 1); 
            } else {
                // Fallback rookie
                newAiRosters[team.id][role] = { ...REAL_LCK_PLAYERS[0], id: `gen-${team.id}-${role}`, name: 'Rookie', role, overall: 70, age: 18, price: 0, salary: 20, contractDuration: 1, rarity: Rarity.COMMON, stats: {mechanics:70, macro:70, lane:70, teamfight:70}, team: team.shortName };
            }
        });
    });

    // 2. Draw Groups & Schedule
    const groups = drawGroups(LCK_TEAMS);
    const schedule = generateGroupStageSchedule(groups);
    
    // 3. Update Standings with Groups
    const newStandings = LCK_TEAMS.map(t => ({
        teamId: t.id,
        name: t.shortName,
        wins: 0,
        losses: 0,
        gameWins: 0,
        gameLosses: 0,
        streak: 0,
        group: groups.A.includes(t.id) ? 'A' : 'B'
    } as Standing));

    setGameState(prev => ({ 
      ...prev, 
      stage: 'GROUP_STAGE',
      week: 1, 
      currentDay: 1,
      schedule: schedule,
      groups: groups,
      standings: newStandings,
      aiRosters: newAiRosters,
      winnersGroup: null
    }));
    setTab('schedule');
  };

  const processPlayerProgression = (player: PlayerCard, standings: Standing[], playoffMatches: PlayoffMatch[]) => {
      // Simple progression logic: Young players gain stats, old players might lose mechanics
      let newStats = { ...player.stats };
      const age = player.age;
      
      if (age < 22) {
          // Growth
          if (Math.random() > 0.4) newStats.mechanics = Math.min(99, newStats.mechanics + 1);
          if (Math.random() > 0.4) newStats.lane = Math.min(99, newStats.lane + 1);
      } else if (age > 25) {
          // Decline
          if (Math.random() > 0.6) newStats.mechanics = Math.max(60, newStats.mechanics - 1);
      }
      
      const newOverall = Math.round((newStats.mechanics + newStats.macro + newStats.lane + newStats.teamfight) / 4);
      return { ...player, stats: newStats, overall: newOverall, previousOverall: player.overall, age: player.age + 1 };
  };

  const advanceSeason = () => { 
      // Update players
      const updatedInventory = gameState.inventory.map(p => processPlayerProgression(p, gameState.standings, gameState.playoffMatches));
      const updatedRoster = { ...gameState.roster };
      Object.keys(updatedRoster).forEach(key => {
          const role = key as Role;
          if (updatedRoster[role]) {
              updatedRoster[role] = processPlayerProgression(updatedRoster[role]!, gameState.standings, gameState.playoffMatches);
          }
      });

      setGameState(prev => ({
          ...prev, 
          stage: 'OFF_SEASON', 
          currentSeason: prev.currentSeason + 1, 
          week: 0,
          inventory: updatedInventory,
          roster: updatedRoster
      })); 
      setTab('dashboard'); 
  };

  // --- SERIES SIMULATION LOGIC (Hard Fearless Draft) ---
  const simulateSeries = (teamAId: string, teamBId: string, isBo5: boolean) => {
      const getRoster = (tid: string) => tid === gameState.teamId ? gameState.roster : gameState.aiRosters[tid] || {};
      const rosterA = getRoster(teamAId);
      const rosterB = getRoster(teamBId);

      const getPower = (roster: any) => {
          const players = Object.values(roster) as PlayerCard[];
          if (players.length === 0) return 0;
          return players.reduce((acc, p) => acc + p.overall, 0) / 5;
      };

      const powerA = getPower(rosterA);
      const powerB = getPower(rosterB);
      
      let winsA = 0;
      let winsB = 0;
      const gamesToWin = isBo5 ? 3 : 2;
      const maxGames = isBo5 ? 5 : 3;
      const gameScores = [];

      for (let game = 1; game <= maxGames; game++) {
          if (winsA === gamesToWin || winsB === gamesToWin) break;

          // FEARLESS DRAFT PENALTY
          let draftPenaltyA = 0;
          let draftPenaltyB = 0;

          if (game >= 3) {
              if (powerA > powerB + 2) draftPenaltyB = (game - 2) * 3; 
              else if (powerB > powerA + 2) draftPenaltyA = (game - 2) * 3;
              else {
                  draftPenaltyA = (game - 2) * 2;
                  draftPenaltyB = (game - 2) * 2;
              }
          }

          const effectivePowerA = powerA - draftPenaltyA;
          const effectivePowerB = powerB - draftPenaltyB;
          
          const effectiveDiff = effectivePowerA - effectivePowerB;
          let winProbA = 0.50 + (effectiveDiff * 0.025); 
          winProbA = Math.max(0.1, Math.min(0.9, winProbA));

          if (Math.random() < winProbA) {
              winsA++;
              gameScores.push({user: 15 + Math.floor(Math.random()*15), enemy: 5 + Math.floor(Math.random()*10)});
          } else {
              winsB++;
              gameScores.push({user: 5 + Math.floor(Math.random()*10), enemy: 15 + Math.floor(Math.random()*15)});
          }
      }

      const winnerId = winsA > winsB ? teamAId : teamBId;
      const scoreA = winsA;
      const scoreB = winsB;

      return { winnerId, scoreA, scoreB, gameScores };
  };

  const endGroupStage = (standings: Standing[]) => {
      const winsA = standings.filter(s => s.group === 'A').reduce((acc, s) => acc + s.wins, 0);
      const winsB = standings.filter(s => s.group === 'B').reduce((acc, s) => acc + s.wins, 0);
      
      const winnersGroup = winsA >= winsB ? 'A' : 'B';
      const losersGroup = winnersGroup === 'A' ? 'B' : 'A';

      const getSortedGroup = (grp: 'A' | 'B') => {
          return standings.filter(s => s.group === grp).sort((a, b) => {
              if (b.wins !== a.wins) return b.wins - a.wins;
              return (b.gameWins - b.gameLosses) - (a.gameWins - a.gameLosses);
          });
      };

      const sortedWinners = getSortedGroup(winnersGroup);
      const sortedLosers = getSortedGroup(losersGroup);

      // Play-In Participants: Winners Bot 2 + Losers Top 4
      const playInTeams = [
          ...sortedWinners.slice(3, 5),
          ...sortedLosers.slice(0, 4)
      ];

      playInTeams.sort((a, b) => b.wins - a.wins);
      initializePlayIns(playInTeams);

      setGameState(prev => ({
          ...prev,
          stage: 'PLAY_IN',
          winnersGroup,
          week: 10
      }));
      
      showNotification('success', `Group Stage Ended! ${winnersGroup} is the Winners Group.`);
  };

  const initializePlayIns = (teams: Standing[]) => {
      const matches: PlayoffMatch[] = [
          { id: 'pi-1', roundName: 'Play-In Qualifier A', teamAId: teams[0].teamId, teamBId: teams[5].teamId, isBo5: true },
          { id: 'pi-2', roundName: 'Play-In Qualifier B', teamAId: teams[1].teamId, teamBId: teams[4].teamId, isBo5: true },
          { id: 'pi-3', roundName: 'Play-In Qualifier C', teamAId: teams[2].teamId, teamBId: teams[3].teamId, isBo5: true },
      ];

      setGameState(prev => ({
          ...prev,
          playoffMatches: matches
      }));
      setTab('play');
  };

  const initializePlayoffs = (playInWinners: string[]) => {
      const { standings, winnersGroup } = gameState;
      const sortedWinners = standings.filter(s => s.group === winnersGroup).sort((a, b) => b.wins - a.wins);
      const directQualifiers = sortedWinners.slice(0, 3).map(s => s.teamId);
      
      const allQualifiers = [...directQualifiers, ...playInWinners];
      const seeds = allQualifiers; 

      const matches: PlayoffMatch[] = [
          { id: 'r1-1', roundName: 'Quarterfinals 1', teamAId: seeds[2], teamBId: seeds[5], nextMatchId: 'sf1', nextMatchSlot: 'B', isBo5: true },
          { id: 'r1-2', roundName: 'Quarterfinals 2', teamAId: seeds[3], teamBId: seeds[4], nextMatchId: 'sf2', nextMatchSlot: 'B', isBo5: true },
          { id: 'sf1', roundName: 'Semifinals 1', teamAId: seeds[0], teamBId: null, nextMatchId: 'f1', nextMatchSlot: 'A', isBo5: true },
          { id: 'sf2', roundName: 'Semifinals 2', teamAId: seeds[1], teamBId: null, nextMatchId: 'f1', nextMatchSlot: 'B', isBo5: true },
          { id: 'f1', roundName: 'Grand Final', teamAId: null, teamBId: null, isBo5: true },
      ];

      setGameState(prev => ({
          ...prev,
          stage: 'PLAYOFFS',
          playoffMatches: matches
      }));
  };

  const initiateMatch = () => {
     setIsPlayingMatch(true);
     let userMatch: { teamAId: string, teamBId: string, id: string, isBo5?: boolean } | undefined;

     if (gameState.stage === 'GROUP_STAGE') {
        const matchesToday = gameState.schedule.filter(m => m.round === gameState.currentDay);
        const regularMatch = matchesToday.find(m => m.teamAId === gameState.teamId || m.teamBId === gameState.teamId);
        if (regularMatch) userMatch = { ...regularMatch, isBo5: false };
     } else {
        const match = gameState.playoffMatches.find(m => (m.teamAId === gameState.teamId || m.teamBId === gameState.teamId) && !m.winnerId);
        if (match && match.teamAId && match.teamBId) userMatch = match;
     }

     if (userMatch) {
         const sim = simulateSeries(userMatch.teamAId, userMatch.teamBId, !!userMatch.isBo5);
         const won = sim.winnerId === gameState.teamId;
         const opponentId = userMatch.teamAId === gameState.teamId ? userMatch.teamBId : userMatch.teamAId;
         
         const scoreUser = sim.winnerId === gameState.teamId ? (userMatch.teamAId === gameState.teamId ? sim.scoreA : sim.scoreB) : (userMatch.teamAId === gameState.teamId ? sim.scoreA : sim.scoreB);
         const scoreEnemy = sim.winnerId === gameState.teamId ? (userMatch.teamAId === gameState.teamId ? sim.scoreB : sim.scoreA) : (userMatch.teamAId === gameState.teamId ? sim.scoreB : sim.scoreA);

         const resultObj: MatchResult = {
             victory: won,
             scoreUser: scoreUser,
             scoreEnemy: scoreEnemy,
             gameScores: sim.gameScores,
             enemyTeam: LCK_TEAMS.find(t => t.id === opponentId)?.shortName || '',
             reward: won ? 300 : 100,
             commentary: '',
             isBo5: !!userMatch.isBo5
         };

         setPendingSimResult({ userResult: resultObj, matchId: userMatch.id, opponentId });
         setIsSimulating(true);
     } else {
        finalizeDaySimulation(null);
     }
  };

  const finalizeDaySimulation = async (userResult: MatchResult | null) => {
     setIsSimulating(false);
     setPendingSimResult(null);

     setGameState(prev => {
        if (prev.stage === 'GROUP_STAGE') {
            const matchesToday = prev.schedule.filter(m => m.round === prev.currentDay);
            const newSchedule = [...prev.schedule];
            const newStandings = [...prev.standings];

            matchesToday.forEach(m => {
                let winnerId, scoreA, scoreB;
                const isUserMatch = m.teamAId === prev.teamId || m.teamBId === prev.teamId;

                if (isUserMatch && userResult) {
                    winnerId = userResult.victory ? prev.teamId : (m.teamAId === prev.teamId ? m.teamBId : m.teamAId);
                    scoreA = m.teamAId === prev.teamId ? userResult.scoreUser : userResult.scoreEnemy;
                    scoreB = m.teamAId === prev.teamId ? userResult.scoreEnemy : userResult.scoreUser;
                } else {
                    const sim = simulateSeries(m.teamAId, m.teamBId, false); 
                    winnerId = sim.winnerId;
                    scoreA = sim.scoreA;
                    scoreB = sim.scoreB;
                }

                const idx = newSchedule.findIndex(s => s.id === m.id);
                newSchedule[idx] = { ...m, played: true, winnerId, seriesScoreA: scoreA, seriesScoreB: scoreB };

                const winnerStat = newStandings.find(s => s.teamId === winnerId);
                const loserStat = newStandings.find(s => s.teamId === (winnerId === m.teamAId ? m.teamBId : m.teamAId));

                if (winnerStat) {
                    winnerStat.wins++;
                    winnerStat.gameWins += scoreA > scoreB ? scoreA : scoreB; 
                    winnerStat.gameLosses += scoreA > scoreB ? scoreB : scoreA;
                }
                if (loserStat) {
                    loserStat.losses++;
                    loserStat.gameWins += scoreA > scoreB ? scoreB : scoreA;
                    loserStat.gameLosses += scoreA > scoreB ? scoreA : scoreB;
                }
            });

            const allPlayed = newSchedule.every(m => m.played);
            
            if (allPlayed) {
                setTimeout(() => endGroupStage(newStandings), 100);
                return { ...prev, schedule: newSchedule, standings: newStandings };
            }

            return { ...prev, schedule: newSchedule, standings: newStandings, currentDay: prev.currentDay + 1, week: Math.ceil((prev.currentDay + 1)/5) };
        } 
        else if (prev.stage === 'PLAY_IN') {
            const newMatches = [...prev.playoffMatches];
            const activeMatch = newMatches.find(m => !m.winnerId);
            
            if (activeMatch) {
                let winnerId;
                if (activeMatch.teamAId === prev.teamId || activeMatch.teamBId === prev.teamId) {
                    winnerId = userResult?.victory ? prev.teamId : (activeMatch.teamAId === prev.teamId ? activeMatch.teamBId : activeMatch.teamAId);
                } else {
                    const sim = simulateSeries(activeMatch.teamAId!, activeMatch.teamBId!, true);
                    winnerId = sim.winnerId;
                }
                
                const idx = newMatches.findIndex(m => m.id === activeMatch.id);
                newMatches[idx].winnerId = winnerId!;
            }

            if (newMatches.every(m => m.winnerId)) {
                const qualifiers = newMatches.map(m => m.winnerId!);
                setTimeout(() => initializePlayoffs(qualifiers), 100);
            }

            return { ...prev, playoffMatches: newMatches };
        }
        else if (prev.stage === 'PLAYOFFS') {
            const matchToPlay = prev.playoffMatches.find(m => m.teamAId && m.teamBId && !m.winnerId);
             if (matchToPlay) {
                 let winnerId = '';
                 if (userResult) {
                     winnerId = userResult.victory ? prev.teamId : (matchToPlay.teamAId === prev.teamId ? matchToPlay.teamBId! : matchToPlay.teamAId!);
                 } else {
                     const sim = simulateSeries(matchToPlay.teamAId!, matchToPlay.teamBId!, true);
                     winnerId = sim.winnerId;
                 }

                 const updatedMatches = [...prev.playoffMatches];
                 const idx = updatedMatches.findIndex(m => m.id === matchToPlay.id);
                 updatedMatches[idx].winnerId = winnerId;

                 if (matchToPlay.nextMatchId) {
                    const nextIdx = updatedMatches.findIndex(m => m.id === matchToPlay.nextMatchId);
                    if (nextIdx >= 0) {
                        if (matchToPlay.nextMatchSlot === 'A') updatedMatches[nextIdx].teamAId = winnerId;
                        else updatedMatches[nextIdx].teamBId = winnerId;
                    }
                 }
                 return { ...prev, playoffMatches: updatedMatches };
             }
             return prev;
        }
        return prev;
     });
     setIsPlayingMatch(false);
  };

  const MarketView = () => {
     return (
        <div className="space-y-6">
           <div className="flex flex-col gap-4 bg-dark-900 p-6 rounded-xl border border-dark-800">
              <div className="flex justify-between items-start">
                 <div>
                    <h2 className="text-2xl font-bold font-display text-white">Transfer Market</h2>
                    <p className="text-gray-400 text-sm">Sign free agents or scout for new talent.</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <button 
                       onClick={handleAutoFill}
                       className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-lg transition-all"
                       title="Automatically fill empty roster spots within budget"
                    >
                       <Wand2 size={16} /> Auto-Fill Roster
                    </button>
                    <div className="h-8 w-px bg-dark-700"></div>
                    <div className="text-right">
                       <div className="text-xs text-gray-500 font-bold uppercase">Scouting Cost</div>
                       <div className="font-mono text-gold-400">100 G</div>
                    </div>
                    <button 
                      onClick={scoutMarket}
                      disabled={isScouting || gameState.coins < 100}
                      className="flex items-center gap-2 px-6 py-3 bg-hextech-600 hover:bg-hextech-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
                    >
                       {isScouting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Search size={18} />}
                       Scout Players
                    </button>
                 </div>
              </div>

              {/* Filter Panel */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-dark-800">
                 {/* Role Filter */}
                 <div className="flex gap-1 bg-dark-950 p-1 rounded-lg">
                    <button onClick={() => setFilterRole('ALL')} className={`flex-1 py-1.5 rounded text-xs font-bold ${filterRole === 'ALL' ? 'bg-dark-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}>ALL</button>
                    {Object.values(Role).filter(r => r !== Role.COACH).map(role => (
                       <button key={role} onClick={() => setFilterRole(role)} className={`flex-1 py-1.5 rounded text-xs font-bold ${filterRole === role ? 'bg-hextech-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                          {role === Role.JUNGLE ? 'JGL' : role}
                       </button>
                    ))}
                 </div>

                 {/* Status Filter */}
                 <div className="flex gap-1 bg-dark-950 p-1 rounded-lg">
                    <button onClick={() => setFilterStatus('ALL')} className={`flex-1 py-1.5 rounded text-xs font-bold ${filterStatus === 'ALL' ? 'bg-dark-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}>All</button>
                    <button onClick={() => setFilterStatus('FA')} className={`flex-1 py-1.5 rounded text-xs font-bold ${filterStatus === 'FA' ? 'bg-green-600/20 text-green-400' : 'text-gray-500 hover:text-gray-300'}`}>Free Agents</button>
                    <button onClick={() => setFilterStatus('TRANSFER')} className={`flex-1 py-1.5 rounded text-xs font-bold ${filterStatus === 'TRANSFER' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>Transfer</button>
                 </div>

                 {/* Sort Order */}
                 <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                       <ArrowDownUp size={14} />
                    </div>
                    <select 
                       value={sortOrder} 
                       onChange={(e) => setSortOrder(e.target.value as any)}
                       className="w-full bg-dark-950 border border-dark-700 text-white text-xs font-bold py-2 pl-9 pr-4 rounded-lg focus:outline-none focus:border-hextech-500 appearance-none cursor-pointer"
                    >
                       <option value="RATING">Rating (High to Low)</option>
                       <option value="PRICE">Price (Low to High)</option>
                       <option value="SALARY">Salary (Low to High)</option>
                    </select>
                 </div>

                 {/* Price Range */}
                 <div className="flex items-center gap-2 bg-dark-950 px-3 rounded-lg border border-dark-700">
                    <span className="text-xs font-bold text-gray-500">Fee:</span>
                    <input 
                       type="number" 
                       value={priceRange.min} 
                       onChange={e => setPriceRange({...priceRange, min: Number(e.target.value)})}
                       className="w-16 bg-transparent text-white text-xs font-mono focus:outline-none text-right"
                       placeholder="Min"
                    />
                    <span className="text-gray-600">-</span>
                    <input 
                       type="number" 
                       value={priceRange.max} 
                       onChange={e => setPriceRange({...priceRange, max: Number(e.target.value)})}
                       className="w-16 bg-transparent text-white text-xs font-mono focus:outline-none"
                       placeholder="Max"
                    />
                 </div>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMarket.length === 0 && <div className="col-span-full text-center py-10 text-gray-500 italic">No players match your filters.</div>}
              {filteredMarket.map(player => (
                 <Card 
                    key={player.id} 
                    player={player} 
                    actionLabel="Negotiate"
                    onClick={() => openNegotiation(player)}
                 />
              ))}
           </div>
        </div>
     );
  };

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-white mb-1">
            {activeTeamData?.name}
          </h2>
          <div className="flex gap-4 text-sm text-gray-400">
            <span>Power: <span className="text-white font-bold">{getTeamPower()}</span></span>
            <span>Coins: <span className="text-gold-400 font-bold">{gameState.coins}</span></span>
            <span>Season: <span className="text-white font-bold">{gameState.currentSeason}</span></span>
          </div>
        </div>
        <TeamLogo team={activeTeamData} size="w-16 h-16" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
           <h3 className="text-lg font-bold text-white mb-4">Active Roster</h3>
           <div className="space-y-2">
             {Object.values(Role).filter(r => r !== Role.COACH).map(role => {
               const p = gameState.roster[role];
               return (
                 <div key={role} className="flex justify-between items-center p-2 bg-dark-950 rounded border border-dark-800">
                   <span className="text-gray-500 text-xs font-bold w-10">{role}</span>
                   <span className={`flex-1 font-bold ${p ? 'text-white' : 'text-red-500'}`}>
                     {p ? p.name : 'VACANT'}
                   </span>
                   {p && <span className="text-xs text-gray-400">OVR {p.overall}</span>}
                 </div>
               )
             })}
           </div>
        </div>

        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800 flex flex-col justify-center items-center">
            <h3 className="text-lg font-bold text-white mb-2">Next Step</h3>
            <p className="text-gray-400 text-center mb-6">
              {gameState.stage === 'PRE_SEASON' ? 'Complete your roster and start the season.' : `Week ${gameState.week} Matches`}
            </p>
            <button 
              onClick={() => setTab(gameState.stage === 'PRE_SEASON' ? 'market' : 'play')}
              className="px-8 py-3 bg-hextech-600 hover:bg-hextech-500 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              {gameState.stage === 'PRE_SEASON' ? 'Go to Market' : 'Play Match'}
            </button>
        </div>
      </div>
    </div>
  );

  const RosterView = () => (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold font-display text-white">Manage Roster</h2>
          <div className="text-sm text-gray-400">
             Drag & Drop functionality coming soon. Click to assign.
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Roster */}
          <div className="lg:col-span-2 space-y-4">
             {(Object.values(Role) as Role[]).map(role => {
                const player = gameState.roster[role];
                return (
                   <div key={role} className="relative group">
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 -translate-x-full text-xs font-bold text-gray-500 w-8 text-right">
                         {role}
                      </div>
                      {player ? (
                         <Card 
                           player={player} 
                           compact 
                           isOwned 
                           onClick={() => {
                             // Unassign
                             setGameState(prev => ({
                               ...prev,
                               roster: { ...prev.roster, [role]: null },
                               inventory: [...prev.inventory, player] // Move back to bench if not already there? 
                               // Simplified: In this model, inventory tracks ALL owned. 
                               // So we don't duplicate. Just set roster slot to null.
                             }));
                           }}
                         />
                      ) : (
                         <div className="h-16 border-2 border-dashed border-dark-700 rounded-lg flex items-center justify-center text-gray-600 font-bold bg-dark-900/50">
                            Empty Slot
                         </div>
                      )}
                   </div>
                )
             })}
          </div>

          {/* Bench / Inventory */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 flex flex-col h-[600px]">
             <h3 className="text-lg font-bold text-white mb-4 px-2">Bench</h3>
             <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {gameState.inventory.filter(p => {
                    const currentRoster = Object.values(gameState.roster) as (PlayerCard | null)[];
                    return !currentRoster.some(rp => rp?.id === p.id);
                }).map(p => (
                   <div 
                     key={p.id} 
                     onClick={() => assignToRoster(p)}
                     className="p-3 bg-dark-950 border border-dark-800 rounded-lg cursor-pointer hover:border-hextech-500 transition-colors"
                   >
                      <div className="flex justify-between">
                         <span className="font-bold text-white">{p.name}</span>
                         <span className="text-xs text-gray-500">{p.role}</span>
                      </div>
                      <div className="text-xs text-gray-400">OVR: {p.overall}</div>
                   </div>
                ))}
                {gameState.inventory.length === 0 && <div className="text-gray-500 text-center italic mt-10">No players on bench.</div>}
             </div>
          </div>
       </div>
    </div>
  );

  const ScheduleView = () => (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold font-display text-white">Season Schedule</h2>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gameState.schedule.map(match => {
             const teamA = LCK_TEAMS.find(t => t.id === match.teamAId);
             const teamB = LCK_TEAMS.find(t => t.id === match.teamBId);
             const isUserMatch = match.teamAId === gameState.teamId || match.teamBId === gameState.teamId;

             return (
                <div key={match.id} className={`p-4 rounded-xl border ${match.played ? 'bg-dark-900 border-dark-800 opacity-70' : isUserMatch ? 'bg-blue-900/20 border-blue-500/50' : 'bg-dark-900 border-dark-700'}`}>
                   <div className="text-xs text-gray-500 font-bold uppercase mb-2 flex justify-between">
                      <span>Week {match.week}</span>
                      {match.played && <span className="text-green-400">Final</span>}
                   </div>
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <TeamLogo team={teamA} size="w-6 h-6" />
                         <span className={`font-bold ${match.winnerId === teamA?.id ? 'text-green-400' : 'text-gray-300'}`}>{teamA?.shortName}</span>
                      </div>
                      <div className="flex flex-col items-center px-4">
                         {match.played ? (
                            <span className="font-mono font-bold text-white text-lg">{match.seriesScoreA} - {match.seriesScoreB}</span>
                         ) : (
                            <span className="text-xs text-gray-600 font-bold">VS</span>
                         )}
                      </div>
                      <div className="flex items-center gap-2 flex-row-reverse">
                         <TeamLogo team={teamB} size="w-6 h-6" />
                         <span className={`font-bold ${match.winnerId === teamB?.id ? 'text-green-400' : 'text-gray-300'}`}>{teamB?.shortName}</span>
                      </div>
                   </div>
                </div>
             )
          })}
          {gameState.schedule.length === 0 && <div className="col-span-full text-center text-gray-500 py-10">Schedule not yet generated. Start the season first.</div>}
       </div>
    </div>
  );

  const StandingsView = () => (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold font-display text-white">Standings</h2>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {['A', 'B'].map(group => (
             <div key={group} className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
                <div className="p-4 bg-dark-950 border-b border-dark-800 font-bold text-white">Group {group}</div>
                <table className="w-full text-sm text-left">
                   <thead className="bg-dark-950 text-gray-500 font-bold uppercase text-xs">
                      <tr>
                         <th className="px-4 py-3">Team</th>
                         <th className="px-4 py-3 text-center">W</th>
                         <th className="px-4 py-3 text-center">L</th>
                         <th className="px-4 py-3 text-center">+/-</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-dark-800">
                      {gameState.standings
                         .filter(s => s.group === group)
                         .sort((a,b) => b.wins - a.wins || (b.gameWins - b.gameLosses) - (a.gameWins - a.gameLosses))
                         .map((s, i) => (
                            <tr key={s.teamId} className={s.teamId === gameState.teamId ? 'bg-blue-900/10' : ''}>
                               <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                                  <span className="text-gray-500 font-mono w-4">{i + 1}</span>
                                  {s.name}
                               </td>
                               <td className="px-4 py-3 text-center text-white">{s.wins}</td>
                               <td className="px-4 py-3 text-center text-gray-400">{s.losses}</td>
                               <td className="px-4 py-3 text-center text-gray-500">{s.gameWins - s.gameLosses}</td>
                            </tr>
                         ))}
                   </tbody>
                </table>
             </div>
          ))}
       </div>
    </div>
  );

  const PlayView = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
       {gameState.stage === 'PRE_SEASON' ? (
          <div className="text-center space-y-4 max-w-md">
             <Trophy size={64} className="mx-auto text-hextech-500 mb-4" />
             <h2 className="text-3xl font-display font-bold text-white">Pre-Season</h2>
             <p className="text-gray-400">Complete your roster training and market activities before starting the LCK split.</p>
             <button 
                onClick={startSeason}
                className="w-full py-4 bg-hextech-600 hover:bg-hextech-500 text-white font-bold text-xl rounded-xl shadow-xl transition-all"
             >
                Start Season
             </button>
          </div>
       ) : (
          <div className="w-full max-w-2xl bg-dark-900 border border-dark-800 rounded-2xl p-8 text-center space-y-6">
             <div className="text-xs font-bold text-hextech-400 uppercase tracking-widest">
                {gameState.stage.replace('_', ' ')} • Week {gameState.week}
             </div>
             
             {/* Matchup Preview */}
             {(() => {
                 let nextMatch: ScheduledMatch | PlayoffMatch | undefined;
                 if (gameState.stage === 'GROUP_STAGE') {
                     nextMatch = gameState.schedule.find(m => !m.played && (m.teamAId === gameState.teamId || m.teamBId === gameState.teamId));
                 } else {
                     nextMatch = gameState.playoffMatches.find(m => !m.winnerId && (m.teamAId === gameState.teamId || m.teamBId === gameState.teamId));
                 }

                 if (!nextMatch) return <div className="text-xl text-gray-400">No matches scheduled for today. Simulating other games...</div>;
                 
                 const teamA = LCK_TEAMS.find(t => t.id === nextMatch?.teamAId);
                 const teamB = LCK_TEAMS.find(t => t.id === nextMatch?.teamBId);

                 return (
                    <div className="flex items-center justify-center gap-8 py-8">
                        <div className="text-center">
                           <TeamLogo team={teamA} size="w-24 h-24" className="mx-auto mb-2" />
                           <h3 className="text-2xl font-display font-bold text-white">{teamA?.shortName}</h3>
                        </div>
                        <div className="text-4xl font-display font-bold text-gray-600">VS</div>
                        <div className="text-center">
                           <TeamLogo team={teamB} size="w-24 h-24" className="mx-auto mb-2" />
                           <h3 className="text-2xl font-display font-bold text-white">{teamB?.shortName}</h3>
                        </div>
                    </div>
                 )
             })()}

             <button 
               onClick={initiateMatch}
               disabled={isPlayingMatch}
               className="px-12 py-4 bg-white hover:bg-gray-200 text-black font-bold text-xl rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {isPlayingMatch ? 'Simulating...' : <><Play size={24} fill="currentColor" /> Play Match</>}
             </button>
          </div>
       )}
    </div>
  );

  return (
    <Layout 
      currentTab={tab} 
      onTabChange={setTab} 
      coins={gameState.coins} 
      week={gameState.week}
      teamData={activeTeamData}
      managerName={gameState.managerName}
    >
      {!onboardingComplete && <Onboarding onComplete={handleOnboardingComplete} />}

      {/* ... (Overlays) ... */}
      {isSimulating && pendingSimResult && activeTeamData && (
        <MatchSimulationView 
           userTeam={activeTeamData}
           enemyTeam={LCK_TEAMS.find((t: TeamData) => t.id === pendingSimResult.opponentId)}
           userRoster={gameState.roster}
           enemyRoster={gameState.aiRosters[pendingSimResult.opponentId] || {}} 
           result={pendingSimResult.userResult}
           onComplete={() => finalizeDaySimulation(pendingSimResult.userResult)}
        />
      )}
      
      {/* ... (Modals) ... */}
      {negotiationSession && (
        <NegotiationModal
          player={negotiationSession.player}
          isOpen={!!negotiationSession}
          onClose={() => setNegotiationSession(null)}
          onOffer={handleNegotiationOffer}
          currentCoins={gameState.coins}
          serverFeedback={negotiationFeedback}
          attemptsLeft={negotiationSession.patience}
        />
      )}

      {activeEventModal && (
        <EventModal
          event={activeEventModal.event}
          player={activeEventModal.player}
          onClose={() => setActiveEventModal(null)}
        />
      )}

      {notification && (
        <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-xl shadow-2xl font-bold animate-slide-in ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
           {notification.message}
        </div>
      )}

      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-red-600 text-white rounded-xl shadow-2xl font-bold animate-bounce-in">
           {error}
        </div>
      )}

      {onboardingComplete && (
        <>
          {tab === 'dashboard' && <DashboardView />}
          {tab === 'roster' && <RosterView />}
          {tab === 'training' && <TrainingView roster={gameState.roster} inventory={gameState.inventory} coins={gameState.coins} trainingSlotsUsed={gameState.trainingSlotsUsed} onTrainPlayer={handleTraining} />}
          {tab === 'market' && <MarketView />}
          {tab === 'schedule' && <ScheduleView />}
          {tab === 'standings' && <StandingsView />}
          {tab === 'stats' && <TeamStatsView teams={LCK_TEAMS} userTeamId={gameState.teamId} userRoster={gameState.roster} aiRosters={gameState.aiRosters} />}
          {tab === 'play' && <PlayView />}
        </>
      )}
    </Layout>
  );
}
