import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Card } from './components/Card';
import { TeamLogo, getTeamTier } from './components/TeamLogo';
import { TeamStatsView } from './components/TeamStatsView';
import { MatchSimulationView } from './components/MatchSimulationView';
import { TrainingView } from './components/TrainingView';
import { Onboarding } from './components/Onboarding';
import { LEAGUES, LeagueKey, LeagueDefinition } from './data/leagues';
import { drawGroups, generateGroupStageSchedule, generateLPLSplit2Schedule } from './utils/scheduler';
import { Trophy, RotateCcw, AlertTriangle, Play, Handshake, Wand2, FastForward, SkipForward, XCircle, ArrowDownUp, Search, Mail, Newspaper, MessageSquare, Heart, HeartCrack } from 'lucide-react';
import { Role, PlayerCard, GameState, MatchResult, Rarity, TeamData, ScheduledMatch, PlayoffMatch, Standing, PlayerEvent, HistoryEntry, HistoryViewType } from './types';
import { MainMenu } from './components/MainMenu';
import { SponsorsView } from './components/SponsorsView'; 
import { simulateMatchSeries, calculateTeamPower, processPlayerGrowth, calculateWeeklyExpenses } from './utils/engine';


const ACTIVITIES = [
  { id: 'scrim', name: 'Scrimmage', cost: 50, slots: 2, description: 'Play a practice match against a random team.', gains: { teamfight: 2, macro: 1 } },
  { id: 'vod', name: 'VOD Review', cost: 20, slots: 1, description: 'Analyze past games to improve decision making.', gains: { macro: 2 } },
  { id: 'soloq', name: 'Solo Queue Grind', cost: 10, slots: 1, description: 'Hone individual mechanics in ranked play.', gains: { mechanics: 1, lane: 1 } },
  { id: '1v1', name: '1v1 Practice', cost: 15, slots: 1, description: 'Intensive laning phase practice.', gains: { lane: 2 } },
];

const scoutPlayers = async (count: number, existingIds: Set<string>, freeAgents: PlayerCard[]): Promise<PlayerCard[]> => {
  const pool = [...freeAgents].filter(p => !existingIds.has(p.id));
  return pool.sort(() => 0.5 - Math.random()).slice(0, count);
};

const DIFFICULTY_SETTINGS = {
  Easy: { initialCoins: 10000, feeMultiplier: 0 },
  Normal: { initialCoins: 7500, feeMultiplier: 0.5 },
  Hard: { initialCoins: 5000, feeMultiplier: 1.0 },
};

type Difficulty = keyof typeof DIFFICULTY_SETTINGS;

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
  const [view, setView] = useState<'MENU' | 'ONBOARDING' | 'GAME'>('MENU');
  const [hasSaveFile, setHasSaveFile] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setOfferSalary(player.salary);
        setOfferDuration(1);
        setLocalError(null);
        const saveExists = localStorage.getItem('lck_manager_save_v1');
        setHasSaveFile(!!saveExists);
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
               <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover grayscale" />
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
               src={player.imageUrl} 
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

interface NewMessagesModalProps {
  messages: PlayerMessage[];
  onClose: () => void;
}

const NewMessagesModal: React.FC<NewMessagesModalProps> = ({ messages, onClose }) => {
  if (messages.length === 0) return null;

  const title = messages.length > 1 ? "You Have New Messages" : "You Have a New Message";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-dark-900 border-2 border-hextech-500/50 w-full max-w-md rounded-2xl p-8 shadow-2xl text-center animate-fade-in">
        <Mail size={48} className="mx-auto text-hextech-400 mb-4" />
        <h2 className="text-2xl font-display font-bold text-white mb-4">{title}</h2>
        <p className="text-gray-400 mb-6">Don't forget to check your inbox.</p>
        <button onClick={onClose} className="w-full py-3 bg-hextech-600 hover:bg-hextech-500 text-white font-bold rounded-xl">OK</button>
      </div>
    </div>
  );
};

interface RetiredPlayerModalProps {
  player: PlayerCard;
  isOpen: boolean;
  onClose: () => void;
  onHireAsCoach: () => void;
  onLureBack: () => void;
  currentCoins: number;
}

const RetiredPlayerModal: React.FC<RetiredPlayerModalProps> = ({ player, isOpen, onClose, onHireAsCoach, onLureBack, currentCoins }) => {
  if (!isOpen) return null;
  const coachCost = Math.floor(player.salary * 0.75);
  const lureCost = Math.floor(player.salary * 2.5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-dark-900 border border-dark-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-dark-800 border border-dark-600 overflow-hidden">
            <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover grayscale" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{player.name}</h3>
            <p className="text-sm text-gray-400">Retired • {player.age}yo</p>
          </div>
        </div>
        <div className="mb-6 text-center p-3 rounded-lg bg-dark-950 border border-dark-800">
            <p className="text-sm text-gray-300">This player has retired. You can try to lure them back to the scene.</p>
            {player.retirementReason && <p className="text-xs text-yellow-400 font-bold mt-1">Reason: {player.retirementReason}</p>}
        </div>
        <div className="space-y-3">
          <button
            onClick={onHireAsCoach}
            disabled={currentCoins < coachCost}
            className="w-full p-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hire as Coach ({coachCost}G)
          </button>
          <button
            onClick={onLureBack}
            disabled={currentCoins < lureCost}
            className="w-full p-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Lure back to Playing ({lureCost}G)
          </button>
          {(currentCoins < coachCost || currentCoins < lureCost) && <p className="text-xs text-red-500 text-center">Insufficient Funds</p>}
        </div>
      </div>
    </div>
  );
};

const BracketMatch: React.FC<{ 
  match: PlayoffMatch, 
  style?: React.CSSProperties, 
  teams: TeamData[], 
  standings: Standing[],
  onHoverTeam: (teamId: string | null) => void,
  highlightedPath: string[]
}> = ({ match, style, teams, standings, onHoverTeam, highlightedPath }) => {
  const teamA = teams.find(t => t.id === match.teamAId);
  const teamB = teams.find(t => t.id === match.teamBId);
  const getRegion = (team: TeamData | undefined) => {
    if (!team) return null;
    const league = Object.values(LEAGUES).find(l => l.teams.some(t => t.id === team.id));
    return league ? league.region : null;
  };
  const regionColors: { [key: string]: string } = { KR: 'bg-blue-500', CN: 'bg-red-500', EU: 'bg-yellow-500', TCL: 'bg-green-500' };
  const isMatchHighlighted = highlightedPath.includes(match.id);

  return (
      <div 
        className={`bg-dark-900 border rounded-lg shadow-lg relative transition-all duration-300 ${isMatchHighlighted ? 'border-yellow-400 scale-105' : 'border-dark-700'}`}
        style={style}
      >
          <div className="flex">
            <div className="flex-1 p-3">
              <div 
                className={`flex justify-between items-center mb-2 ${match.winnerId === teamA?.id ? 'opacity-100' : match.winnerId ? 'opacity-40' : ''}`}
                onMouseEnter={() => onHoverTeam(teamA?.id || null)}
                onMouseLeave={() => onHoverTeam(null)}
              >
                  <div className="flex items-center gap-3">
                      <TeamLogo team={teamA} size="w-6 h-6" />
                      <span className={`font-bold text-sm ${match.winnerId === teamA?.id ? 'text-green-400' : 'text-white'}`}>
                          {teamA?.shortName || 'TBD'}
                      </span>
                  </div>
              </div>
              <div 
                className={`flex justify-between items-center ${match.winnerId === teamB?.id ? 'opacity-100' : match.winnerId ? 'opacity-40' : ''}`}
                onMouseEnter={() => onHoverTeam(teamB?.id || null)}
                onMouseLeave={() => onHoverTeam(null)}
              >
                  <div className="flex items-center gap-3">
                      <TeamLogo team={teamB} size="w-6 h-6" />
                      <span className={`font-bold text-sm ${match.winnerId === teamB?.id ? 'text-green-400' : 'text-white'}`}>
                          {teamB?.shortName || 'TBD'}
                      </span>
                  </div>
              </div>
            </div>
            <div className="flex flex-col justify-around items-center w-10 bg-dark-950 rounded-r-lg">
                <span className={`font-mono font-bold text-lg ${match.winnerId === teamA?.id ? 'text-green-400' : 'text-white'}`}>{match.seriesScoreA ?? 0}</span>
                <span className={`font-mono font-bold text-lg ${match.winnerId === teamB?.id ? 'text-green-400' : 'text-white'}`}>{match.seriesScoreB ?? 0}</span>
            </div>
            <div className="absolute -left-2 top-0 bottom-0 flex flex-col justify-around">
                <div className={`w-1 h-1/2 ${regionColors[getRegion(teamA) || ''] || 'bg-gray-600'}`}></div>
                <div className={`w-1 h-1/2 ${regionColors[getRegion(teamB) || ''] || 'bg-gray-600'}`}></div>
            </div>
        </div>
      </div>
  );
};

const BracketView: React.FC<{ matches: PlayoffMatch[], stage: string, teams: TeamData[], standings: Standing[], userTeamId: string, isCurrent: boolean }> = ({ matches, stage, teams, standings, userTeamId, isCurrent }) => {
    const renderRound = (roundName: string, matchIds: string[], customClass: string = '') => {
        return (
            <div key={roundName} className="flex flex-col space-y-6 flex-shrink-0 w-72">
                <h3 className="text-center font-bold text-lg text-hextech-300">{roundName}</h3>
                <div className={`flex flex-col gap-12 justify-center ${customClass}`}>
                    {matchIds.map(id => {
                        const match = getMatch(id);
                        if (!match) return null;
                        const isUserMatch = match.teamAId === userTeamId || match.teamBId === userTeamId;
                        return (
                            <div key={id} className="relative group">
                                <div className={`absolute -inset-0.5 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 animate-tilt ${!match.winnerId && isUserMatch ? 'opacity-75' : ''}`}></div>
                                <BracketMatch
                                    match={match}
                                    teams={teams}
                                    standings={standings}
                                    onHoverTeam={isCurrent ? setHighlightedTeam : () => {}}
                                    highlightedPath={highlightedPath}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };
    const [highlightedTeam, setHighlightedTeam] = useState<string | null>(null);
    const getMatch = (id: string) => matches.find(m => m.id === id);
    
    if (matches.length === 0) return <div>No bracket available</div>;

    const getTeamPath = (teamId: string | null): string[] => {
        if (!teamId) return [];
        const path: string[] = [];
        let currentMatch = matches.find(m => m.winnerId === teamId || m.teamAId === teamId || m.teamBId === teamId);
        
        while(currentMatch) {
            path.push(currentMatch.id);
            const nextMatchId = currentMatch.winnerId === teamId ? currentMatch.nextMatchId : currentMatch.loserMatchId;
            if (!nextMatchId) break;
            currentMatch = matches.find(m => m.id === nextMatchId);
        }
        return path;
    };

    const highlightedPath = isCurrent ? getTeamPath(highlightedTeam) : [];

    if (stage === 'MSI_BRACKET') {
        const rounds: { [key: string]: string[] } = {
            'UB Round 1': ['msi-b-r1-1', 'msi-b-r1-2', 'msi-b-r1-3', 'msi-b-r1-4'],
            'UB Semifinals': ['msi-b-sf-1', 'msi-b-sf-2'],
            'UB Final': ['msi-b-ubf'],
            'LB Round 1': ['msi-b-lb1-1', 'msi-b-lb1-2'],
            'LB Semifinal': ['msi-b-lbsf'],
            'LB Final': ['msi-b-lbf'],
            'Grand Final': ['msi-final'],
        };

        return (
            <div className="flex space-x-8 overflow-x-auto p-4 bg-dark-950 rounded-xl">
                {Object.entries(rounds).map(([roundName, matchIds]) => renderRound(roundName, matchIds, roundName.includes('Final') ? 'h-full' : ''))}
            </div>
        );
    }

    if (stage === 'MSI_PLAY_IN') {
        const playInRounds: { [key: string]: string[] } = {
            'UB Semifinals': ['msi-pi-ub1', 'msi-pi-ub2'],
            'UB Final & LB Semifinal': ['msi-pi-ub-final', 'msi-pi-lb1'],
            'LB Final': ['msi-pi-lb-final'],
        };
        return (
            <div className="flex justify-center space-x-8 overflow-x-auto p-4 bg-dark-950 rounded-xl">
                {Object.entries(playInRounds).map(([roundName, matchIds]) => renderRound(roundName, matchIds, 'h-full'))}
            </div>
        );
    }

    if (stage === 'PLAY_IN') {
        return (
            <div className="flex justify-center space-x-8 overflow-x-auto p-4 bg-dark-950 rounded-xl min-h-[500px]">
                {renderRound('Play-In Qualifiers', matches.map(m => m.id), 'h-full')}
            </div>
        )
    }
    
    const rounds = matches.reduce((acc, match) => {
        if (!acc.includes(match.roundName)) acc.push(match.roundName);
        return acc;
    }, [] as string[]);

    return (
      <div className="flex space-x-8 overflow-x-auto p-4 bg-dark-950 rounded-xl">
          {rounds.map(roundName => {
             const roundMatchIds = matches.filter(m => m.roundName === roundName).map(m => m.id);
             if(roundMatchIds.length === 0) return null;
             return renderRound(roundName, roundMatchIds, 'h-full');
          })}
      </div>
    )
};

interface IncomingOffer {
  player: PlayerCard;
  offeringTeamId: string;
  offeringTeamName: string;
  offerAmount: number;
  playerOpinion: string;
}

const MatchListView: React.FC<{ matches: PlayoffMatch[], teams: TeamData[], userTeamId: string }> = ({ matches, teams, userTeamId }) => {
  return (
      <div className="w-full max-w-5xl mx-auto space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map(match => {
                  const teamA = teams.find(t => t.id === match.teamAId);
                  const teamB = teams.find(t => t.id === match.teamBId);
                  return (
                      <div key={match.id} className="bg-dark-900 border border-dark-700 rounded-xl p-4 flex justify-between items-center">
                          <div className="text-xs font-bold text-gray-500 w-20">{match.roundName}</div>
                          <div className="flex-1 flex justify-between items-center px-4">
                              <div className="flex items-center gap-2"><TeamLogo team={teamA} size="w-6 h-6" /><span className="text-white font-bold">{teamA?.shortName}</span></div>
                              <div className="font-mono text-xl font-bold text-white">{match.winnerId ? `${match.seriesScoreA} - ${match.seriesScoreB}` : 'VS'}</div>
                              <div className="flex items-center gap-2"><span className="text-white font-bold">{teamB?.shortName}</span><TeamLogo team={teamB} size="w-6 h-6" /></div>
                          </div>
                      </div>
                  );
              })}
          </div>
      </div>
  );
};

const saveToHistory = (currentGs: GameState, title: string, viewType: HistoryViewType): HistoryEntry[] => {
    const newEntry: HistoryEntry = {
        id: `${title.replace(/\s/g, '-')}-${Date.now()}`,
        title: title,
        viewType: viewType,
        year: currentGs.year,
        split: currentGs.currentSplit,
        schedule: currentGs.schedule.length > 0 ? JSON.parse(JSON.stringify(currentGs.schedule)) : undefined,
        standings: currentGs.standings.length > 0 ? JSON.parse(JSON.stringify(currentGs.standings)) : undefined,
        playoffs: currentGs.playoffMatches.length > 0 ? JSON.parse(JSON.stringify(currentGs.playoffMatches)) : undefined,
    };
    const currentHistory = Array.isArray(currentGs.matchHistory) ? currentGs.matchHistory : [];
    return [...currentHistory, newEntry];
};

interface NewsArticle {
  id: string;
  type: 'TRANSFER' | 'RUMOR' | 'DRAMA' | 'RETIREMENT' | 'MAJOR_EVENT';
  title: string;
  content: string;
  date: { year: number, split: string, week: number };
  involved: { type: 'player' | 'team', name: string }[];
}

interface PlayerMessage {
  id: string;
  playerId: string;
  playerName: string;
  type: 'COMPLAINT' | 'THANKS' | 'REQUEST' | 'INFO';
  subject: string;
  body: string;
  isRead: boolean;
  date: { year: number, split: string, week: number };
}

const INITIAL_STATE: GameState = {
  managerName: '',
  teamId: '',
  leagueKey: 'LCK',
  coins: 10000,
  year: 2025,
  currentSeason: 1,
  currentSplit: 'SPRING',
  week: 0,
  difficulty: 'Normal',
  currentDay: 1,
  stage: 'PRE_SEASON',
  groups: { A: [], B: [] },
  winnersGroup: null,
  inventory: [],
  roster: { [Role.TOP]: null, [Role.JUNGLE]: null, [Role.MID]: null, [Role.ADC]: null, [Role.SUPPORT]: null, [Role.COACH]: null },
  aiRosters: {},
  standings: [],
  schedule: [],
  playoffMatches: [],
  freeAgents: [],
  trainingSlotsUsed: 0,
  matchHistory: [],
  newsFeed: [],
  playerMessages: [],
};

export default function App() {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [tab, setTab] = useState('dashboard');
  const [activeLeague, setActiveLeague] = useState<LeagueDefinition>(LEAGUES.LCK);
  const [view, setView] = useState<'MENU' | 'ONBOARDING' | 'GAME'>('MENU');
  const [hasSaveFile, setHasSaveFile] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftMatchInfo, setDraftMatchInfo] = useState<{matchId: string, opponentId: string, isBo5: boolean} | null>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    managerName: '',
    teamId: '',
    coins: DIFFICULTY_SETTINGS.Normal.initialCoins,
    year: 2025,
    currentSplit: 'SPRING',
    week: 0, 
    difficulty: 'Normal',
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
    trainingSlotsUsed: 0,
    matchHistory: [],
    newsFeed: [],
    playerMessages: [],
  });

  const [currentSponsor, setCurrentSponsor] = useState<any>(null);
  const [market, setMarket] = useState<PlayerCard[]>([]);
  const [isScouting, setIsScouting] = useState(false);
  const [lastMatch, setLastMatch] = useState<MatchResult | null>(null);
  const [filterRole, setFilterRole] = useState<Role | 'ALL' | 'COACH'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'FA' | 'TRANSFER'>('ALL');
  const [sortOrder, setSortOrder] = useState<'RATING' | 'PRICE' | 'SALARY'>('RATING');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 20000 });
  const [filterLeague, setFilterLeague] = useState<LeagueKey | 'ALL'>('ALL');
  const [marketPage, setMarketPage] = useState(1);

  const [pendingSimResult, setPendingSimResult] = useState<{
    userResult: MatchResult,
    matchId: string,
    opponentId: string
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const [isPlayingMatch, setIsPlayingMatch] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  interface NegotiationSession {
    player: PlayerCard;
    askingSalary: number;
    patience: number;
  }
  const [negotiationSession, setNegotiationSession] = useState<NegotiationSession | null>(null);
  const [negotiationFeedback, setNegotiationFeedback] = useState<string | null>(null);

  const [activeEventModal, setActiveEventModal] = useState<{event: PlayerEvent, player: PlayerCard} | null>(null);
  const [retiredPlayerModal, setRetiredPlayerModal] = useState<PlayerCard | null>(null);
  const [incomingOffers, setIncomingOffers] = useState<IncomingOffer[]>([]);
  const [newlyArrivedMessages, setNewlyArrivedMessages] = useState<PlayerMessage[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem('lck_manager_save_v1');
    if (savedData) {
      setHasSaveFile(true);
    }
  }, []);

  useEffect(() => {
    if (onboardingComplete && gameState.teamId) {
      localStorage.setItem('lck_manager_save_v1', JSON.stringify(gameState));
      setHasSaveFile(true);
    }
  }, [gameState, onboardingComplete]);

  const activeTeamData = activeLeague.teams.find(t => t && t.id === gameState?.teamId) || null;

  const allTeams = useMemo(() => {
    return Object.values(LEAGUES).flatMap(league => league.teams);
  }, []);

  useEffect(() => {
    setMarketPage(1);
  }, [filterRole, filterStatus, sortOrder, priceRange, filterLeague]);

  useEffect(() => {
    if (onboardingComplete && gameState.standings.length === 0) {
      let initialStandings: Standing[] = [];
      if (activeLeague.settings.format === 'LPL') {
         initialStandings = activeLeague.teams.map((t, index) => {
             const groupCode = ['A', 'B', 'C', 'D'][index % 4] as 'A' | 'B' | 'C' | 'D';
             return {
                teamId: t.id,
                name: t.shortName,
                wins: 0,
                losses: 0,
                gameWins: 0,
                gameLosses: 0,
                streak: 0,
                group: groupCode
             };
         });
      } else {
         initialStandings = activeLeague.teams.map(t => ({
            teamId: t.id,
            name: t.shortName,
            wins: 0,
            losses: 0,
            gameWins: 0,
            gameLosses: 0,
            streak: 0,
            group: 'A' as any 
         }));
      }
      setGameState(prev => ({ ...prev, standings: initialStandings }));
    }
  }, [onboardingComplete, activeLeague]);

  const handleNewGame = () => {
  localStorage.removeItem('lck_manager_save_v1');
  setGameState(INITIAL_STATE);
  setOnboardingComplete(false);
  setHasSaveFile(false); 
  setView('ONBOARDING');
  };

  const handleContinueGame = () => {
    const savedData = localStorage.getItem('lck_manager_save_v1');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setGameState(parsed);
      if (parsed.leagueKey && LEAGUES[parsed.leagueKey as LeagueKey]) {
          setActiveLeague(LEAGUES[parsed.leagueKey as LeagueKey]);
      }
      setOnboardingComplete(true);
      setView('GAME');
    }
  };

  const handleOnboardingComplete = (name: string, team: TeamData, leagueKey: LeagueKey, difficulty?: Difficulty) => {
    const selectedLeague = LEAGUES[leagueKey];
    setActiveLeague(selectedLeague);

    const finalDifficulty = difficulty || 'Normal';
    const difficultySettings = DIFFICULTY_SETTINGS[finalDifficulty];
    let startingCoins = difficultySettings.initialCoins;

    const teamTier = getTeamTier(team.id);
    let tierBonus = 0;
    if (teamTier === 'S') tierBonus = 5000;
    else if (teamTier === 'A') tierBonus = 2500;
    else if (teamTier === 'B') tierBonus = 0;
    else if (teamTier === 'C') tierBonus = -1000;

    startingCoins += tierBonus;

    const allPlayers = Object.entries(LEAGUES).flatMap(([key, leagueData]) => 
      leagueData.players.map(p => ({ ...p, league: key as LeagueKey }))
    );

    const userTeamPlayers = allPlayers
      .filter(p => p.team === team.shortName)
      .map(p => ({ ...p, contractDuration: 2, price: 0 }));

    const marketPlayers = allPlayers
      .filter(p => p.team !== team.shortName)
      .sort(() => 0.5 - Math.random());
    
    setGameState(prev => ({
      ...prev,
      managerName: name,
      teamId: team.id,
      difficulty: finalDifficulty,
      coins: startingCoins,
      inventory: userTeamPlayers,
      standings: [],
      roster: {
        [Role.TOP]: null,
        [Role.JUNGLE]: null,
        [Role.MID]: null,
        [Role.ADC]: null,
        [Role.SUPPORT]: null,
        [Role.COACH]: null
      }
    }));
    
    setMarket(marketPlayers);
    setOnboardingComplete(true);
    setView('GAME');
    setTab('market'); 
  };

  const handleSignSponsor = (sponsor: any) => {
    if (currentSponsor) {
        showNotification('error', "You already have an active sponsor.");
        return;
    }
    setCurrentSponsor(sponsor);
    setGameState(prev => ({ ...prev, coins: prev.coins + sponsor.signingBonus }));
    showNotification('success', `Signed with ${sponsor.name}! +${sponsor.signingBonus}G`);
};

  const processPlayerProgression = (player: PlayerCard, clutchFactor: number) => {
      let newStats = { ...player.stats };
      const age = player.age;
      let growthChance = 0.4;
      let declineChance = 0.0;

      if (age < 22) growthChance = 0.7;
      else if (age > 26) { growthChance = 0.1; declineChance = 0.4; }

      if (clutchFactor > 0) {
          growthChance += 0.2;
          declineChance = 0; 
      }

      if (Math.random() < growthChance) {
          if (Math.random() > 0.5) newStats.mechanics = Math.min(99, newStats.mechanics + 0.2);
          if (Math.random() > 0.5) newStats.macro = Math.min(99, newStats.macro + 0.2);
      }
      if (Math.random() < declineChance) {
          newStats.mechanics = Math.max(60, newStats.mechanics - 1);
      }
      
      const newOverall = Math.round((newStats.mechanics + newStats.macro + newStats.lane + newStats.teamfight) / 4);
      return { ...player, stats: newStats, overall: newOverall, previousOverall: player.overall, age: player.age + 1 };
  };

  const filteredMarket = useMemo(() => {
    const allPlayersMap = new Map<string, PlayerCard>();
    [...market, ...gameState.freeAgents].forEach(p => {
        if (p && p.status !== 'military_service') allPlayersMap.set(p.id, p);
    });
    const allKnownPlayers = Array.from(allPlayersMap.values());

    let result = [...allKnownPlayers];

    if (filterRole !== 'ALL') {
      result = result.filter(p => p.role === filterRole);
    }

    if (filterStatus === 'RETIRED') {
      result = result.filter(p => p.status === 'retired');
    } else if (filterStatus === 'FA') {
      result = result.filter(p => p.team === 'FA' || p.team === 'ACA');
    } else if (filterStatus === 'TRANSFER') {
      result = result.filter(p => p.team !== 'FA' && p.team !== 'ACA');
    }

    if (filterLeague !== 'ALL') {
      result = result.filter(p => p.league === filterLeague as LeagueKey);
    }

    result = result.filter(p => {
      const cost = (p.team === 'FA' || p.team === 'ACA') ? 0 : p.price;
      return cost >= priceRange.min && cost <= priceRange.max;
    });

    result.sort((a, b) => {
      if (sortOrder === 'RATING') return b.overall - a.overall;
      if (sortOrder === 'PRICE') return ((b.team === 'FA' ? 0 : b.price) - (a.team === 'FA' ? 0 : a.price));
      if (sortOrder === 'SALARY') return b.salary - a.salary;
      return 0;
    });

    return result;
  }, [market, filterRole, filterStatus, sortOrder, priceRange, filterLeague, gameState.freeAgents]);

  const PLAYERS_PER_PAGE = 12;
  const paginatedMarket = useMemo(() => {
    const startIndex = (marketPage - 1) * PLAYERS_PER_PAGE;
    const endIndex = startIndex + PLAYERS_PER_PAGE;
    return filteredMarket.slice(startIndex, endIndex);
  }, [filteredMarket, marketPage]);

  const getActiveSynergies = useCallback((roster: Record<Role, PlayerCard | null> | Record<string, PlayerCard>) => {
    const players = Object.values(roster).filter(p => p !== null) as PlayerCard[];
    if (players.length < 2) return { synergies: [], relationshipBonus: 0, totalBonus: 0 };

    const leagueCounts: Record<string, number> = {};
    const processedPairs = new Set<string>();
    let relationshipBonus = 0;
    
    players.forEach(p => {
      if (p.league) {
        leagueCounts[p.league] = (leagueCounts[p.league] || 0) + 1;
      }

      if (p.relationships) {
        p.relationships.forEach(rel => {
          const otherPlayer = players.find(pl => pl.id === rel.targetPlayerId);
          if (otherPlayer) {
            const pairKey = [p.id, otherPlayer.id].sort().join('-');
            if (!processedPairs.has(pairKey)) {
              if (rel.type === 'FRIENDSHIP') relationshipBonus += 2;
              if (rel.type === 'CONFLICT') relationshipBonus -= 3;
              processedPairs.add(pairKey);
            }
          }
        });
      }
    });

    const synergies: { league: string, count: number, bonus: number }[] = [];
    let leagueBonus = 0;

    Object.entries(leagueCounts).forEach(([league, count]) => {
      if (count >= 2) {
        const bonus = count * count;
        synergies.push({ league, count, bonus });
        leagueBonus += bonus;
      }
    });

    const totalBonus = leagueBonus + relationshipBonus;
    return { synergies, relationshipBonus, totalBonus };
  }, []);

  const getTeamMoraleModifier = (roster: Record<Role, PlayerCard | null>): number => {
    const players = Object.values(roster).filter((p): p is PlayerCard => p !== null && p.role !== Role.COACH);
    if (players.length === 0) return 0;
    const avgMorale = players.reduce((acc, p) => acc + (p.morale ?? 50), 0) / players.length;
    const modifier = Math.round((avgMorale - 50) / 10);
    return modifier;
  };

  const getTeamPower = useCallback((teamId: string = gameState.teamId) => {
    const roster = teamId === gameState.teamId ? gameState.roster : gameState.aiRosters[teamId];
    if (!roster) {
        const baseMap: Record<string, number> = {
            't1': 95, 'geng': 94, 'hle': 91, 'dk': 89, 'kt': 87,
            'kdf': 84, 'drx': 80, 'fox': 81, 'ns': 79, 'bro': 77
        };
        return baseMap[teamId] || 80;
    }

    const players = Object.values(roster).filter((p): p is PlayerCard => p !== null && p.role !== Role.COACH);
    if (players.length < 5) {
        const teamData = allTeams.find(t => t.id === teamId);
        const tier = teamData ? getTeamTier(teamData.id) : 'C';
        switch(tier) {
            case 'S': return 92;
            case 'A': return 88;
            case 'B': return 84;
            case 'C': return 80;
            default: return 78;
        }
    }

    const baseTotal = players.reduce((acc, p) => acc + p.overall, 0);
    const { totalBonus } = getActiveSynergies(roster as Record<Role, PlayerCard | null>);
    const moraleModifier = getTeamMoraleModifier(roster as Record<Role, PlayerCard | null>);

    // Koç bonusu
    const coach = (roster as Record<Role, PlayerCard | null>)[Role.COACH];
    const coachBonus = coach ? Math.floor(coach.overall / 20) : 0;

    return Math.round(baseTotal / 5) + totalBonus + moraleModifier + coachBonus;

}, [gameState.roster, gameState.teamId, gameState.aiRosters, getActiveSynergies, allTeams]);


  const updateTeamMorale = (roster: Record<Role, PlayerCard | null>, didWin: boolean, streak: number): Record<Role, PlayerCard | null> => {
    const newRoster = { ...roster };
    const moraleChange = didWin 
      ? (streak <= -3 ? 20 : (streak >= 3 ? 10 : 5))
      : (streak >= 3 ? -20 : (streak <= -3 ? -10 : -5));

    Object.keys(newRoster).forEach(key => {
        const player = newRoster[key as Role];
        if (player) player.morale = Math.max(0, Math.min(100, (player.morale ?? 50) + moraleChange));
    });
    return newRoster;
  };

  const isRosterComplete = useCallback(() => {
    const requiredRoles = [Role.TOP, Role.JUNGLE, Role.MID, Role.ADC, Role.SUPPORT];
    return requiredRoles.every(role => gameState.roster[role] !== null);
  }, [gameState.roster]);

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

      return { player, event: { id: crypto.randomUUID(), ...scenario, duration, penalty } };
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
    let updatedMarket = [...market];

    missingRoles.forEach(role => {
        const candidates = updatedMarket.filter(p => {
             const cost = (p.team === 'FA' || p.team === 'ACA') ? p.salary : p.price + p.salary;
             return p.role === role && cost <= budget;
        });

        if (candidates.length > 0) {
             const candidateIndex = Math.floor(Math.random() * candidates.length);
             const candidate = candidates[candidateIndex];
             const cost = (candidate.team === 'FA' || candidate.team === 'ACA') ? candidate.salary : candidate.price + candidate.salary;
             
             purchases.push({ 
                 ...candidate, 
                 team: activeTeamData?.shortName || 'MY TEAM', 
                 contractDuration: 1, 
                 price: 0 
             });
             
             budget -= cost;
             const marketIndex = updatedMarket.findIndex(p => p.id === candidate.id);
             if (marketIndex >= 0) updatedMarket.splice(marketIndex, 1);
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
        
        const boughtIds = new Set(purchases.map(p => p.id));
        const newFAs = prev.freeAgents.filter(fa => !boughtIds.has(fa.id));

        return {
            ...prev,
            coins: budget,
            roster: newRoster,
            freeAgents: newFAs
        };
    });

    setMarket(prev => prev.filter(p => !purchases.some(purch => purch.id === p.id)));
    showNotification('success', `Auto-filled ${purchases.length} roles!`);
  };

  const handleTraining = (playerId: string, activityId: string, cost: number, gains: Partial<PlayerCard['stats']>) => {
    setGameState(prev => {
      const newRoster = { ...prev.roster };
      const newInventory = [...prev.inventory];      
      let playerToUpdate: PlayerCard | null | undefined = null;
      let playerLocation: 'roster' | 'inventory' | null = null;
      let playerRoleOrIndex: Role | number | null = null;

      Object.entries(newRoster).forEach(([role, p]) => {
          if (p?.id === playerId) {
              playerToUpdate = p;
              playerLocation = 'roster';
              playerRoleOrIndex = role as Role;
          }
      });

      if (!playerToUpdate) {
          const inventoryIndex = newInventory.findIndex(p => p.id === playerId);
          if (inventoryIndex !== -1) {
              playerToUpdate = newInventory[inventoryIndex];
              playerLocation = 'inventory';
              playerRoleOrIndex = inventoryIndex;
          }
      }

      if (playerToUpdate && playerLocation && playerRoleOrIndex !== null) {
        const updatedPlayer = { 
            ...playerToUpdate, 
            stats: { ...playerToUpdate.stats } 
        };

        for (const stat in gains) {
            if (Object.prototype.hasOwnProperty.call(gains, stat)) {
                const key = stat as keyof PlayerCard['stats'];
                updatedPlayer.stats[key] = Math.min(99, updatedPlayer.stats[key] + (gains[key] || 0));
            }
        }

        updatedPlayer.overall = Math.round((updatedPlayer.stats.mechanics + updatedPlayer.stats.macro + updatedPlayer.stats.lane + updatedPlayer.stats.teamfight) / 4);

        if (playerLocation === 'roster') {
            newRoster[playerRoleOrIndex as Role] = updatedPlayer;
        } else {
            newInventory[playerRoleOrIndex as number] = updatedPlayer;
        }
      } else {
          console.error("Training failed: Player not found");
          return prev;
      }

      return {
        ...prev,
        coins: prev.coins - cost,
        trainingSlotsUsed: prev.trainingSlotsUsed + (ACTIVITIES.find(a => a.id === activityId)?.slots || 1),
        roster: newRoster,
        inventory: newInventory,
      };      
    });
};

  const openNegotiation = (player: PlayerCard) => {
    setNegotiationSession({ player, askingSalary: player.salary, patience: 3 });
    setNegotiationFeedback(null);
  };

  const handleNegotiationOffer = (salary: number, duration: number) => {
     if (!negotiationSession) return;
     const { player, askingSalary, patience } = negotiationSession;

     const acceptanceThreshold = askingSalary * 0.85;
     const isOfferAccepted = salary >= acceptanceThreshold;

     if (isOfferAccepted) {
        if (gameState.roster[player.role] && !isRosterComplete()) {
          showNotification('error', 'You must complete your main roster before hiring replacements for a filled role.');
          setNegotiationSession(null);
          return;
        }
        
        const transferFee = (player.team === 'FA' || player.team === 'ACA') ? 0 : player.price;
        const totalCost = transferFee + salary;

        const newPlayer = { 
          ...player, 
          salary, 
          contractDuration: duration, 
          team: activeTeamData?.shortName || 'MY TEAM', 
          price: 0
        };

        setGameState(prev => {
           const isRosterSlotFree = !prev.roster[player.role];
           const newRoster = { ...prev.roster };
           const newInventory = [...prev.inventory];

           const newAiRosters = { ...prev.aiRosters };
           if (player.team !== 'FA' && player.team !== 'ACA') {
               const sourceTeam = allTeams.find(t => t.shortName === player.team);
               if (sourceTeam && newAiRosters[sourceTeam.id]) {
                   const sourceRoster = { ...newAiRosters[sourceTeam.id] };
                   sourceRoster[player.role] = null;
                   newAiRosters[sourceTeam.id] = sourceRoster;
               }
           }

           if (isRosterSlotFree) {
              newRoster[player.role] = newPlayer;
           } else {
              newInventory.push(newPlayer);
           }

           return {
              ...prev,
              coins: prev.coins - totalCost,
              inventory: newInventory,
              roster: newRoster,
              aiRosters: newAiRosters,
              freeAgents: prev.freeAgents.filter(p => p.id !== player.id)
           };
        });

        setMarket(prev => prev.filter(p => p.id !== player.id));
        setNegotiationSession(null);
        setNegotiationFeedback(null);
        showNotification('success', `${player.name} has joined your team!`);
     } else {
        const newPatience = patience - 1;
        if (newPatience <= 0) {
            setNegotiationSession(null);
            setNegotiationFeedback(null);
            showNotification('error', `Negotiations with ${player.name} have broken down!`);
            setMarket(prev => prev.filter(p => p.id !== player.id));
        } else {
            const counterOffer = Math.floor(askingSalary * (1 + (0.9 - (salary / askingSalary)) * 0.2));
            setNegotiationSession({
                ...negotiationSession,
                patience: newPatience,
                askingSalary: counterOffer,
            });
            setNegotiationFeedback(`That's too low. My agent says I'm worth at least ${counterOffer}G.`);
        }
     }
  };

  const handleHireRetired = (player: PlayerCard, as: 'coach' | 'player') => {
    const cost = as === 'coach' ? Math.floor(player.salary * 0.75) : Math.floor(player.salary * 1.5);

    if (gameState.coins < cost) {
      showNotification('error', 'Insufficient funds.');
      return;
    }

    const newPlayer: PlayerCard = {
      ...player,
      team: activeTeamData?.shortName || 'MY TEAM',
      contractDuration: 2,
      status: undefined,
      role: as === 'coach' ? Role.COACH : player.originalRole!,
      salary: as === 'player' ? Math.floor(player.salary * 1.2) : player.salary,
    };

    setGameState(prev => {
      const isRosterSlotFree = !prev.roster[newPlayer.role];
      const newRoster = { ...prev.roster };
      const newInventory = [...prev.inventory];

      if (isRosterSlotFree) {
        newRoster[newPlayer.role] = newPlayer;
      } else {
        newInventory.push(newPlayer);
      }

      return {
        ...prev,
        coins: prev.coins - cost,
        inventory: newInventory,
        roster: newRoster,
        freeAgents: prev.freeAgents.filter(p => p.id !== player.id)
      };
    });

    setMarket(prev => prev.filter(p => p.id !== player.id));
    setRetiredPlayerModal(null);
    showNotification('success', `${player.name} has joined your team as a ${as}!`);
  };

  const handleAiTransfers = (currentGameState: GameState): Partial<GameState> => {
    const aiTeams = activeLeague.teams.filter(t => t.id !== currentGameState.teamId);
    let newAiRosters = JSON.parse(JSON.stringify(currentGameState.aiRosters));
    let newFreeAgents = JSON.parse(JSON.stringify(currentGameState.freeAgents));
    const transferLogs: string[] = [];
    const newsFeed: NewsArticle[] = [];
    const date = { year: currentGameState.year, split: currentGameState.currentSplit, week: currentGameState.week };
    const difficulty = currentGameState.difficulty;

    const settings = {
      Easy: { attemptChance: 0.2, upgradeThreshold: 5 },
      Normal: { attemptChance: 0.5, upgradeThreshold: 3 },
      Hard: { attemptChance: 0.8, upgradeThreshold: 2 },
    };

    const { attemptChance, upgradeThreshold } = settings[difficulty];

    aiTeams.forEach(team => {
       
        if (Math.random() > attemptChance) return;

        const roster = newAiRosters[team.id];
        if (!roster) return;

        const rosterPlayers = Object.values(roster) as PlayerCard[];
        if (rosterPlayers.length === 0) return;

        const weakestPlayer = rosterPlayers.reduce((min, p) => p.overall < min.overall ? p : min, rosterPlayers[0]);
        const teamLeague = LEAGUES[team.league as LeagueKey];

        const localUpgrades: PlayerCard[] = [];
        const foreignUpgrades: PlayerCard[] = [];

        Object.entries(newAiRosters).forEach(([otherTeamId, otherRoster]) => {
            if (otherTeamId === team.id) return;
            const otherPlayers = Object.values(otherRoster as any) as PlayerCard[];
            otherPlayers.filter(p => p.role === weakestPlayer.role && p.overall > weakestPlayer.overall + upgradeThreshold).forEach(p => {
                if (p.league === team.league) localUpgrades.push(p);
                else foreignUpgrades.push(p);
            });
        });
        newFreeAgents.filter(p => p.role === weakestPlayer.role && p.overall > weakestPlayer.overall + upgradeThreshold).forEach(p => localUpgrades.push(p));

        const potentialUpgrades = [...localUpgrades.sort((a, b) => b.overall - a.overall), ...foreignUpgrades.sort((a, b) => b.overall - a.overall)];

        if (potentialUpgrades.length > 0) {
            const upgrade = potentialUpgrades.sort((a, b) => b.overall - a.overall)[0];

            if (upgrade.team === 'FA' || upgrade.team === 'ACA') {
                newAiRosters[team.id][weakestPlayer.role] = { ...upgrade, team: team.shortName };
                newFreeAgents = newFreeAgents.filter(p => p.id !== upgrade.id);
                newFreeAgents.push({ ...weakestPlayer, team: 'FA', contractDuration: 0, price: 0 });
                const log = `${team.shortName} signed ${upgrade.name} (FA) and released ${weakestPlayer.name}.`;
                transferLogs.push(log);
                newsFeed.push({
                    id: crypto.randomUUID(), type: 'TRANSFER', title: `Free Agent Move: ${team.shortName}`,
                    content: `${team.shortName} made a significant move by signing ${upgrade.name} from the free agent market. As a result, they parted ways with ${weakestPlayer.name}.`,
                    date, involved: [{ type: 'team', name: team.shortName }, { type: 'player', name: upgrade.name }]
                });
            } else {
                const otherTeamId = activeLeague.teams.find(t => t.shortName === upgrade.team)?.id;
                if (otherTeamId && newAiRosters[otherTeamId]) {
                    newAiRosters[team.id][weakestPlayer.role] = { ...upgrade, team: team.shortName };
                    newAiRosters[otherTeamId][upgrade.role] = { ...weakestPlayer, team: upgrade.team };
                    const log = `${team.shortName} traded for ${upgrade.name} from ${upgrade.team}, sending ${weakestPlayer.name}.`;
                    transferLogs.push(log);
                    newsFeed.push({
                        id: crypto.randomUUID(), type: 'TRANSFER', title: `Trade Bomb: ${upgrade.name} Changed Teams!`,
                        content: `A trade that could shift the balance of the league has occurred! ${team.shortName} acquired star player ${upgrade.name} from ${upgrade.team}, sending ${weakestPlayer.name} in return.`,
                        date, involved: [
                            { type: 'team', name: team.shortName },
                            { type: 'team', name: upgrade.team },
                            { type: 'player', name: upgrade.name },
                            { type: 'player', name: weakestPlayer.name }
                        ]
                    });
                }
            }
        }
    });

    if (transferLogs.length > 0) showNotification('success', `AI teams made ${transferLogs.length} transfers!`);

    return { aiRosters: newAiRosters, freeAgents: newFreeAgents, newsFeed };
  };

  const startSeason = () => {
    if (!isRosterComplete()) {
      setError("You must sign a player for every role to start the season!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const allPlayerIdsInUse = new Set([
        ...gameState.inventory.map(p => p.id),
        ...(Object.values(gameState.roster) as (PlayerCard | null)[]).filter(p => p).map(p => p!.id)
    ]);
    Object.values(gameState.aiRosters).forEach(roster => {
        Object.values(roster).filter(p => p).forEach(p => allPlayerIdsInUse.add(p!.id));
    });

    const roles = [Role.TOP, Role.JUNGLE, Role.MID, Role.ADC, Role.SUPPORT];
    
    setGameState(prev => {
        const transferUpdates = handleAiTransfers(prev);

        const newAiRosters = { ...prev.aiRosters };
        const allPlayers = Object.entries(LEAGUES).flatMap(([key, leagueData]) => 
          leagueData.players.map(p => ({ ...p, league: key as LeagueKey }))
        );

        const pool = [...allPlayers, ...prev.freeAgents].filter(p => !allPlayerIdsInUse.has(p.id));
        const allAiTeams = Object.values(LEAGUES).flatMap(l => l.teams).filter(t => t.id !== prev.teamId);

        allAiTeams.forEach(team => {
            const teamLeagueKey = Object.keys(LEAGUES).find(key => 
                (LEAGUES as any)[key].teams.some((t: TeamData) => t.id === team.id)
            ) as LeagueKey | undefined;

            if (!teamLeagueKey) return;

            if (newAiRosters[team.id] && Object.keys(newAiRosters[team.id]).length >= 5) return;

            const newRoster: Record<Role, PlayerCard> = newAiRosters[team.id] ? {...newAiRosters[team.id]} as any : {} as any;

            const roll = Math.random();
            const foreignPlayerCount = roll < 0.25 ? 2 : 1;
            let currentForeignPlayers = 0;

            roles.forEach(role => {
                if (newRoster[role]) return;

                let playerIndex = pool.findIndex(p => p.role === role && p.league === teamLeagueKey);
                let useForeign = false;

                if (playerIndex === -1 || (currentForeignPlayers < foreignPlayerCount && Math.random() < 0.4)) {
                    const foreignIndex = pool.findIndex(p => p.role === role && p.league !== teamLeagueKey);
                    if (foreignIndex !== -1) {
                        playerIndex = foreignIndex;
                        useForeign = true;
                    }
                }

                if (playerIndex >= 0) {
                    const player = pool[playerIndex];
                    newRoster[role] = { ...player, team: team.shortName, contractDuration: 2 };
                    pool.splice(playerIndex, 1);
                    if (useForeign) currentForeignPlayers++;
                } else {
                    newRoster[role] = { ...activeLeague.players[0], id: `gen-${team.id}-${role}-${Date.now()}`, name: `Rookie ${role}`, role, overall: 70, age: 18, price: 0, salary: 20, contractDuration: 2, rarity: Rarity.COMMON, stats: {mechanics:70, macro:70, lane:70, teamfight:70}, team: team.shortName, league: teamLeagueKey };
                }
            });
            newAiRosters[team.id] = newRoster;
        });
        
        let groups, schedule, newStandings;

        if (activeLeague.settings.format === 'LPL') {
            if (prev.currentSplit === 'SUMMER') {
                const lplState = startLPLSplit2(prev);
                groups = lplState.groups;
                schedule = lplState.schedule;
                newStandings = lplState.standings;
            } else {
                const teams = activeLeague.teams;
                const shuffledTeams = [...teams].sort(() => 0.5 - Math.random());
                groups = {
                  A: shuffledTeams.slice(0, 4).map(t => t.id),
                  B: shuffledTeams.slice(4, 8).map(t => t.id),
                  C: shuffledTeams.slice(8, 12).map(t => t.id),
                  D: shuffledTeams.slice(12, 16).map(t => t.id),
                };

                schedule = [];
                let matchIdCounter = 0;
                Object.values(groups).forEach((group) => {
                  for (let i = 0; i < group.length; i++) {
                    for (let j = i + 1; j < group.length; j++) {
                      schedule.push({
                        id: `lpl-s1-${matchIdCounter++}`,
                        round: Math.floor(matchIdCounter / 2) + 1,
                        week: Math.ceil((matchIdCounter / 2 + 1) / 5),
                        teamAId: group[i] as string,
                        teamBId: group[j],
                        played: false,
                        isBo5: true, 
                      });
                    }
                  }
                });

                newStandings = teams.map(t => ({
                  teamId: t.id,
                  name: t.shortName,
                  wins: 0,
                  losses: 0,
                  gameWins: 0,
                  gameLosses: 0,
                  streak: 0,
                  group: Object.keys(groups).find(key => (groups as any)[key].includes(t.id)) as 'A' | 'B' | 'C' | 'D'
                }));
            }

        } else {
            groups = drawGroups(activeLeague.teams);
            schedule = generateGroupStageSchedule(groups, activeLeague.settings);
            
            newStandings = activeLeague.teams.map(t => ({
                teamId: t.id,
                name: t.shortName,
                wins: 0,
                losses: 0,
                gameWins: 0,
                gameLosses: 0,
                streak: 0,
                group: groups.A.includes(t.id) ? 'A' : 'B'
            } as Standing));
        }

        return { 
            ...prev, 
            ...transferUpdates, 
            stage: 'GROUP_STAGE',
            week: 1, 
            currentDay: 1,
            schedule: schedule,
            groups: groups,
            standings: newStandings,
            aiRosters: newAiRosters,
            winnersGroup: null,
            playoffMatches: []
        };
    });
    setTab('schedule');
  };

  const startLPLSplit1Playoffs = (prev: GameState): GameState => {
    const { standings, groups } = prev;

    const getGroupRankings = (groupKey: string) => {
        return standings
            .filter(s => s.group === groupKey)
            .sort((a, b) => b.wins - a.wins || (b.gameWins - b.gameLosses) - (a.gameWins - a.gameLosses));
    };

    const groupA = getGroupRankings('A');
    const groupB = getGroupRankings('B');
    const groupC = getGroupRankings('C');
    const groupD = getGroupRankings('D');

    const seeds = {
        UB1: groupA[0]?.teamId, UB2: groupB[0]?.teamId, UB3: groupC[0]?.teamId, UB4: groupD[0]?.teamId,
        LB1: groupA[1]?.teamId, LB2: groupB[1]?.teamId, LB3: groupC[1]?.teamId, LB4: groupD[1]?.teamId
    };

    if (!seeds.UB1 || !seeds.LB1) {
        console.error("Playoff oluşturulamadı: Yeterli takım yok.");
        return prev;
    }

    const matches: PlayoffMatch[] = [
        { id: 'ub-r1-1', roundName: 'Upper Semis', teamAId: seeds.UB1, teamBId: seeds.UB4, nextMatchId: 'ub-final', nextMatchSlot: 'A', loserMatchId: 'lb-r2-1', loserMatchSlot: 'A', isBo5: true },
        { id: 'ub-r1-2', roundName: 'Upper Semis', teamAId: seeds.UB2, teamBId: seeds.UB3, nextMatchId: 'ub-final', nextMatchSlot: 'B', loserMatchId: 'lb-r2-2', loserMatchSlot: 'A', isBo5: true },

        { id: 'lb-r1-1', roundName: 'Lower Round 1', teamAId: seeds.LB1, teamBId: seeds.LB4, nextMatchId: 'lb-r2-1', nextMatchSlot: 'B', isBo5: true },
        { id: 'lb-r1-2', roundName: 'Lower Round 1', teamAId: seeds.LB2, teamBId: seeds.LB3, nextMatchId: 'lb-r2-2', nextMatchSlot: 'B', isBo5: true },

        { id: 'lb-r2-1', roundName: 'Lower Round 2', teamAId: null, teamBId: null, nextMatchId: 'lb-semis', nextMatchSlot: 'A', isBo5: true },
        { id: 'lb-r2-2', roundName: 'Lower Round 2', teamAId: null, teamBId: null, nextMatchId: 'lb-semis', nextMatchSlot: 'B', isBo5: true },

        { id: 'lb-semis', roundName: 'Lower Semis', teamAId: null, teamBId: null, nextMatchId: 'lb-final', nextMatchSlot: 'B', isBo5: true },

        { id: 'ub-final', roundName: 'Upper Final', teamAId: null, teamBId: null, nextMatchId: 'grand-final', nextMatchSlot: 'A', loserMatchId: 'lb-final', loserMatchSlot: 'A', isBo5: true },

        { id: 'lb-final', roundName: 'Lower Final', teamAId: null, teamBId: null, nextMatchId: 'grand-final', nextMatchSlot: 'B', isBo5: true },

        { id: 'grand-final', roundName: 'Grand Final', teamAId: null, teamBId: null, isBo5: true },
    ];

    return {
        ...prev,
        stage: 'PLAYOFFS',
        week: 10,
        matchHistory: saveToHistory(prev, `${prev.year} ${prev.currentSplit}`, 'LEAGUE'),
        playoffMatches: matches
    };
  };

  const startLPLSplit2 = (prev: GameState): GameState => {
    const allStandings = [...prev.standings].sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return (b.gameWins - b.gameLosses) - (a.gameWins - a.gameLosses);
    });

    const ascendTeams = allStandings.slice(0, 8).map(s => s.teamId);
    const nirvanaTeams = allStandings.slice(8, 16).map(s => s.teamId);

    const groups = {
        A: ascendTeams,
        B: nirvanaTeams 
    };

    const schedule = generateLPLSplit2Schedule(ascendTeams, nirvanaTeams);

    const newStandings: Standing[] = activeLeague.teams.map(t => ({
        teamId: t.id,
        name: t.shortName,
        wins: 0,
        losses: 0,
        gameWins: 0,
        gameLosses: 0,
        streak: 0,
        group: ascendTeams.includes(t.id) ? 'Ascend' : 'Nirvana',
        isEliminated: false
    }));

    return {
        ...prev,
        stage: 'LPL_SPLIT_2_GROUPS',
        currentSplit: 'SPLIT_2',
        week: 1,
        currentDay: 1,
        schedule: schedule,
        groups: groups as any,
        standings: newStandings,
        playoffMatches: [],
    };
};

const startLPLSplit3 = (prev: GameState): GameState => {
    const nirvanaStandings = prev.standings
        .filter(s => s.group === 'Nirvana')
        .sort((a, b) => b.wins - a.wins);

    const eliminatedTeamIds = nirvanaStandings.slice(-2).map(s => s.teamId);

    const survivingTeams = prev.standings
        .filter(s => !eliminatedTeamIds.includes(s.teamId))
        .map(s => s.teamId);

    const eliminatedNames = activeLeague.teams
        .filter(t => eliminatedTeamIds.includes(t.id))
        .map(t => t.shortName)
        .join(' & ');
    showNotification('error', `${eliminatedNames} have been eliminated from the 2025 Season!`);

    const groups = { A: survivingTeams, B: [] };
    const schedule = generateGroupStageSchedule(groups, { ...activeLeague.settings, scheduleType: 'SINGLE_ROBIN' });

    const newStandings = prev.standings.map(s => ({
        ...s,
        wins: 0, losses: 0, gameWins: 0, gameLosses: 0,
        group: eliminatedTeamIds.includes(s.teamId) ? null : 'A',
        isEliminated: eliminatedTeamIds.includes(s.teamId)
    }));

    return {
        ...prev,
        stage: 'LPL_SPLIT_3_GROUPS',
        currentSplit: 'SPLIT_3',
        week: 1,
        currentDay: 1,
        schedule,
        standings: newStandings,
        playoffMatches: []
    };
};

  const endLPLPlacementStage = (currentGameState: GameState) => {
    const { standings, schedule } = currentGameState;
    const sortStandings = (groupCode: string) => {
        return standings.filter(s => s.group === groupCode).sort((a, b) => b.wins - a.wins);
    };

    const groupA = sortStandings('A');
    const groupB = sortStandings('B');
    const groupC = sortStandings('C');
    const groupD = sortStandings('D');
    const allGroups = [groupA, groupB, groupC, groupD];

    const lcqTeams: string[] = [];
    allGroups.forEach(grp => {
        if (grp[2]) lcqTeams.push(grp[2].teamId);
    });

    return initializeLPLLCQ(currentGameState, lcqTeams);
  };

  const initializeLPLLCQ = (prevGameState: GameState, lcqTeams: string[]): GameState => {
      const teams = [...lcqTeams].sort(() => 0.5 - Math.random());
      const matches: PlayoffMatch[] = [
          { id: 'lcq-r1-1', roundName: 'LCQ Round 1', teamAId: teams[0], teamBId: teams[1], nextMatchId: 'lcq-winner-match', nextMatchSlot: 'A', loserMatchId: 'lcq-loser-match', loserMatchSlot: 'A', isBo5: true },
          { id: 'lcq-r1-2', roundName: 'LCQ Round 1', teamAId: teams[2], teamBId: teams[3], nextMatchId: 'lcq-winner-match', nextMatchSlot: 'B', loserMatchId: 'lcq-loser-match', loserMatchSlot: 'B', isBo5: true },
          { id: 'lcq-winner-match', roundName: 'LCQ Winners Match', teamAId: null, teamBId: null, isBo5: true },
          { id: 'lcq-loser-match', roundName: 'LCQ Elimination Match', teamAId: null, teamBId: null, nextMatchId: 'lcq-decider', nextMatchSlot: 'B', isBo5: true },
          { id: 'lcq-decider', roundName: 'LCQ Decider Match', teamAId: null, teamBId: null, isBo5: true } 
      ];

      setTab('play');
      showNotification('success', 'Placements concluded! Proceeding to Last Chance Qualifier.');
      return {
          ...prevGameState,
          stage: 'LPL_SPLIT_2_LCQ',
          matchHistory: saveToHistory(prevGameState, `${prevGameState.year} Split 2 Placements`, 'LEAGUE'),
          playoffMatches: matches,
          schedule: [],
      };
  };

  const startLPLSplit2Playoffs = (prev: GameState): GameState => { 
      const topTeams = LEAGUES.LPL.teams
        .sort((a, b) => getTeamTier(a.id).localeCompare(getTeamTier(b.id)))
        .slice(0, 4)
        .map(t => t.id);
      
      const matches: PlayoffMatch[] = [
          { id: 'lpl-s2-sf-1', roundName: 'Semifinals', teamAId: topTeams[0], teamBId: topTeams[3], nextMatchId: 'lpl-s2-final', nextMatchSlot: 'A', isBo5: true },
          { id: 'lpl-s2-sf-2', roundName: 'Semifinals', teamAId: topTeams[1], teamBId: topTeams[2], nextMatchId: 'lpl-s2-final', nextMatchSlot: 'B', isBo5: true },
          { id: 'lpl-s2-final', roundName: 'Grand Final', teamAId: null, teamBId: null, isBo5: true }
      ];

      setTab('play');
      showNotification('success', 'LPL Split 2 Playoffs Started! Top 2 go to MSI.');
      return {
          ...prev,
          stage: 'PLAYOFFS',
          currentSplit: 'SPLIT_2',
          playoffMatches: matches
      };
  };

  const initializeMSI = (isUserQualified: boolean) => {
    if (isUserQualified) {
        showNotification('success', `Congratulations! You have qualified for MSI.`);
    } else {
        showNotification('info', `You didn't qualify, but the show goes on! Spectating MSI...`);
    }
    
    const getRepresentative = (leagueKey: string, count: number): string[] => {
        const league = LEAGUES[leagueKey as LeagueKey];
        if (!league) return [];
        
        let candidates = league.teams.filter(t => t.id !== gameState.teamId);
        
        if (gameState.teamId && activeLeague.name === leagueKey && isUserQualified) {
             candidates = league.teams.filter(t => t.id !== gameState.teamId);
        }

        const needed = (gameState.teamId && activeLeague.name === leagueKey && isUserQualified) ? count - 1 : count;
        const selected = candidates.sort(() => 0.5 - Math.random()).slice(0, needed).map(t => t.id);

        if (gameState.teamId && activeLeague.name === leagueKey && isUserQualified) {
            selected.unshift(gameState.teamId);
        }
        
        return selected; 
    };

    const lckTeams = getRepresentative('LCK', 4); // 4 Kore
    const lplTeams = getRepresentative('LPL', 3); // 3 Çin
    const lecTeams = getRepresentative('LEC', 2); // 2 Avrupa
    const tclTeams = getRepresentative('TCL', 1); // 1 Türkiye

    const bracketContenders = [
        ...lckTeams.slice(0, 3), // LCK 1,2,3
        ...lplTeams.slice(0, 2), // LPL 1,2
        ...lecTeams.slice(0, 1)  // LEC 1
    ];

    const playInContenders = [
        lckTeams[3], // LCK 4
        lplTeams[2], // LPL 3
        lecTeams[1], // LEC 2
        tclTeams[0]  // TCL 1
    ].filter(t => t); 

    const playInMatches: PlayoffMatch[] = [
      { id: 'msi-pi-ub1', roundName: 'MSI Play-In UB Semis', teamAId: playInContenders[0], teamBId: playInContenders[3], nextMatchId: 'msi-pi-ub-final', nextMatchSlot: 'A', loserMatchId: 'msi-pi-lb1', loserMatchSlot: 'A', isBo5: false },
      { id: 'msi-pi-ub2', roundName: 'MSI Play-In UB Semis', teamAId: playInContenders[1], teamBId: playInContenders[2], nextMatchId: 'msi-pi-ub-final', nextMatchSlot: 'B', loserMatchId: 'msi-pi-lb1', loserMatchSlot: 'B', isBo5: false },
      { id: 'msi-pi-ub-final', roundName: 'MSI Play-In UB Final', teamAId: null, teamBId: null, loserMatchId: 'msi-pi-lb-final', loserMatchSlot: 'B', isBo5: true },
      { id: 'msi-pi-lb1', roundName: 'MSI Play-In LB Semis', teamAId: null, teamBId: null, nextMatchId: 'msi-pi-lb-final', nextMatchSlot: 'A', isBo5: false },
      { id: 'msi-pi-lb-final', roundName: 'MSI Play-In LB Final', teamAId: null, teamBId: null, isBo5: true },
    ];

    setGameState(prev => ({
      ...prev,
      stage: 'MSI_PLAY_IN',
      playoffMatches: playInMatches,
      msiBracketContenders: bracketContenders,
      schedule: [], 
    }));
    setTab('play');
  };

  const getUserTeamRank = (gs: GameState): number => {
      const finals = gs.playoffMatches.find(m => m.roundName === 'Grand Final');
      
      if (finals?.winnerId === gs.teamId) return 1;
      
      if (finals && (finals.teamAId === gs.teamId || finals.teamBId === gs.teamId)) return 2;
      
      return 3; 
  };

  const advanceToNextStage = () => {
      const currentStage = gameState.stage;
      const currentSplit = gameState.currentSplit;
      const leagueFormat = activeLeague.settings.format;

      const isStandardSpringEnd = leagueFormat !== 'LPL' && currentSplit === 'SPRING' && currentStage === 'PLAYOFFS';
      const isLPLSplit2End = leagueFormat === 'LPL' && currentSplit === 'SPLIT_2' && currentStage === 'PLAYOFFS';

      if (isStandardSpringEnd || isLPLSplit2End) {
          const splitName = leagueFormat === 'LPL' ? 'Split 2' : 'Spring';
          const newHistory = saveToHistory(gameState, `${gameState.year} ${splitName} Playoffs`, 'BRACKET');

          const userRank = getUserTeamRank(gameState);
          
          const msiSlots: Record<string, number> = { 
              LCK: 4, 
              LPL: 3, 
              LEC: 2, 
              TCL: 1 
          };
          
          const limit = msiSlots[activeLeague.name] || 1;
          const didQualifyMSI = userRank <= limit;

          setGameState(prev => ({ 
              ...prev, 
              matchHistory: newHistory,
              stage: 'MSI_PLAY_IN', 
              currentSplit: 'MSI' 
          }));
          initializeMSI(didQualifyMSI);
          return;
      }

      if (currentStage === 'MSI_BRACKET' || currentStage === 'MSI_PLAY_IN') {
           const historyTitle = currentStage === 'MSI_PLAY_IN' ? 'MSI Play-In' : 'MSI Bracket';
           const newHistory = saveToHistory(gameState, `${gameState.year} ${historyTitle}`, 'BRACKET');
           
           if (leagueFormat === 'LPL') {
               setGameState(prev => ({
                   ...prev,
                   matchHistory: newHistory,
                   stage: 'PRE_SEASON', 
                   currentSplit: 'SPLIT_3', 
                   playoffMatches: [],
                   schedule: [],
                   week: 1,
                   currentDay: 1
               }));
               showNotification('success', 'MSI Concluded! Welcome to LPL Split 3.');
           } else {
               setGameState(prev => ({
                   ...prev,
                   matchHistory: newHistory,
                   stage: 'PRE_SEASON',
                   currentSplit: 'SUMMER', 
                   playoffMatches: [],
                   schedule: [],
                   week: 1,
                   currentDay: 1
               }));
               showNotification('success', 'MSI Concluded! Prepare for the Summer Split.');
           }
           setTab('market'); 
           return;
      }

      if (currentStage === 'LPL_SPLIT_2_PLACEMENTS') {
          setGameState(prev => endLPLPlacementStage(prev));
          return;
      }
      
      if (currentStage === 'LPL_SPLIT_2_LCQ') {
          const historyKey = `${gameState.year} Split 2 LCQ`;
          const newHistory = { ...gameState.matchHistory, [historyKey]: { playoffs: gameState.playoffMatches } };
          setGameState(startLPLSplit2Playoffs({ ...gameState, matchHistory: newHistory })); 
          return;
      }

      if (leagueFormat === 'LPL' && currentSplit === 'SPRING' && currentStage === 'PLAYOFFS') {
          const historyKey = `${gameState.year} Split 1 Playoffs`;
          const newHistory = saveToHistory(gameState, historyKey, 'BRACKET');
          const split2State = startLPLSplit2({ ...gameState, matchHistory: newHistory });
          setGameState({ ...split2State, currentSplit: 'SPLIT_2' });
          setTab('schedule');
          return;
      }

      if (leagueFormat === 'LPL' && currentStage === 'LPL_SPLIT_2_GROUPS' && gameState.schedule.every(m => m.played)) {
        const historyKey = `${gameState.year} Split 2 Groups`;
        const newHistory = saveToHistory(gameState, historyKey, 'LEAGUE');
        
        const split3State = startLPLSplit3({ ...gameState, matchHistory: newHistory });
        setGameState(split3State);
        showNotification('success', 'Split 2 Ended. Moving to Split 3 (Road to Worlds).');
        setTab('schedule');
        return;
      }
        if (leagueFormat === 'LPL' && currentStage === 'LPL_SPLIT_3_GROUPS' && gameState.schedule.every(m => m.played)) {
            setGameState(prev => initializeSimplePlayoffs(prev));
            return;
        }

        if (leagueFormat === 'LPL' && currentStage === 'LPL_SPLIT_2_GROUPS' && gameState.schedule.every(m => m.played)) {
            const historyKey = `${gameState.year} Split 2 Ascend/Nirvana`;
            const newHistory = saveToHistory(gameState, historyKey, 'LEAGUE');
            const split3State = startLPLSplit3({ ...gameState, matchHistory: newHistory });
            setGameState(split3State);
            showNotification('success', 'Split 2 Concluded! Bottom 2 teams of Nirvana are eliminated.');
            return;
        }

        if (leagueFormat === 'LPL' && currentStage === 'LPL_SPLIT_3_GROUPS' && gameState.schedule.every(m => m.played)) {
            const historyKey = `${gameState.year} Split 3 Road to Worlds`;
            const newHistory = saveToHistory(gameState, historyKey, 'LEAGUE');

            setGameState(prev => ({
              ...prev,
              matchHistory: newHistory,
              ...initializeSimplePlayoffs(prev) 
            }));
            return;
        }
      advanceYear(); 
  };

  const advanceYear = () => { 
      let seasonReward = 5000;
      const newNews: NewsArticle[] = [];
      const newMessages: PlayerMessage[] = [];
      const date = { year: gameState.year + 1, split: 'OFF_SEASON', week: 0 };
      const newIncomingOffers: IncomingOffer[] = [];

      const generateAiOffers = (player: PlayerCard) => {
        if (player.contractDuration <= 1) return;
        const offerChance = 0.05 + (player.overall - 80) * 0.005 + (25 - player.age) * 0.005;
        if (Math.random() > offerChance) return;

        const interestedTeams = activeLeague.teams.filter(t => {
            if (t.id === gameState.teamId) return false;
            const teamRoster = gameState.aiRosters[t.id];
            if (!teamRoster) return true;
            const playerInRole = teamRoster[player.role];
            return !playerInRole || playerInRole.overall < player.overall - 5;
        });

        if (interestedTeams.length > 0) {
            const offeringTeam = interestedTeams[Math.floor(Math.random() * interestedTeams.length)];
            const baseValue = player.salary * 2 + player.overall * 150;
            const offerAmount = Math.floor(baseValue * (0.2 + Math.random() * 0.3)); 
            
            let playerOpinion = "Player is unsure.";
            const offerRatio = offerAmount / baseValue;
            const morale = player.morale ?? 50;

            if (morale > 70 && offerRatio > 0.4) playerOpinion = "Player is interested.";
            else if (morale < 40 || offerRatio < 0.25) playerOpinion = "Player is not interested.";
            else if (offerRatio > 0.35) playerOpinion = "The offer caught their attention.";

            newIncomingOffers.push({
                player: player,
                offeringTeamId: offeringTeam.id,
                offeringTeamName: offeringTeam.shortName,
                offerAmount: offerAmount,
                playerOpinion: playerOpinion,
            });
        }
      };

      const allUserPlayers = [...Object.values(gameState.roster).filter(p => p), ...gameState.inventory] as PlayerCard[];
      allUserPlayers.forEach(p => generateAiOffers(p));

      let performanceTitle = "Participant";
      const retiredPlayerNames: string[] = [];
      const grandFinal = gameState.playoffMatches.find(m => m.roundName === 'Grand Final');
      
      if (grandFinal && grandFinal.winnerId) {
          if (grandFinal.winnerId === gameState.teamId) {
              seasonReward += 25000; 
              performanceTitle = "LCK Champion";
          } else if (grandFinal.teamAId === gameState.teamId || grandFinal.teamBId === gameState.teamId) {
              seasonReward += 20000;
              performanceTitle = "Runner-up";
          }
      }

      const clutchFactor = performanceTitle === "LCK Champion" ? 1 : 0;
      const newFreeAgents = [...gameState.freeAgents];
      
      const allUserPlayersBefore = [...Object.values(gameState.roster).filter(p => p), ...gameState.inventory] as PlayerCard[];

      const updatedInventory = gameState.inventory
        .map(p => processPlayerOffSeason(p, clutchFactor, retiredPlayerNames, newFreeAgents))
        .filter((p): p is PlayerCard => p !== null);

      const updatedRoster = { ...gameState.roster };
      (Object.keys(updatedRoster) as Role[]).forEach(key => {
          const role = key as Role;
          if (updatedRoster[role]) {
              updatedRoster[role] = processPlayerOffSeason(updatedRoster[role]!, clutchFactor, retiredPlayerNames, newFreeAgents);
          }
      });

      const allUserPlayersAfter = [...Object.values(updatedRoster).filter((p): p is PlayerCard => p !== null), ...updatedInventory];
      const afterIds = new Set(allUserPlayersAfter.map(p => p.id));

      allUserPlayersBefore.forEach(player => {
        if (!afterIds.has(player.id)) {
            if (retiredPlayerNames.includes(player.name)) {
                newNews.push({ id: crypto.randomUUID(), type: 'RETIREMENT', title: `${player.name} Retired`, content: `Veteran player ${player.name} (${player.age + 1}) announced their retirement from the professional arena.`, date, involved: [{ type: 'player', name: player.name }] });
            } else {
                newNews.push({ id: crypto.randomUUID(), type: 'RUMOR', title: `${player.name} Released`, content: `${player.name}, whose contract expired, has entered the free agent market.`, date, involved: [{ type: 'player', name: player.name }] });
            }
        } else {
            const updatedPlayer = allUserPlayersAfter.find(p => p.id === player.id)!;
            const morale = updatedPlayer.morale ?? 50;

            if (morale < 30 && Math.random() < 0.6) {
                newMessages.push({
                    id: crypto.randomUUID(), playerId: updatedPlayer.id, playerName: updatedPlayer.name,
                    type: 'COMPLAINT', subject: "Our performance this season...",
                    body: `Manager, I am not satisfied with how this season went. I think we performed below our potential as a team and I believe some things need to change. If we want the championship next season, we must take more serious steps.`,
                    isRead: false, date
                });
            } else if (morale > 85 && performanceTitle.includes("Champion") && Math.random() < 0.7) {
                newMessages.push({
                    id: crypto.randomUUID(), playerId: updatedPlayer.id, playerName: updatedPlayer.name,
                    type: 'THANKS', subject: "Thanks for the championship!",
                    body: `Manager, I am grateful to you and the whole team for this amazing season and championship! We achieved this success thanks to your belief and support. I can't wait to repeat the same success next season!`,
                    isRead: false, date
                });
            }

            if (updatedPlayer.contractDuration === 1 && player.contractDuration > 1) {
                 newMessages.push({
                    id: crypto.randomUUID(), playerId: updatedPlayer.id, playerName: updatedPlayer.name,
                    type: 'INFO', subject: "About my contract...",
                    body: `Hi manager, just wanted to give a reminder. I know my contract expires at the end of next season. I look forward to discussing my future with the team when the time is right.`,
                    isRead: false, date
                });
            }

            if (updatedPlayer.contractDuration === 1 && (updatedPlayer.morale ?? 50) > 70 && Math.random() < 0.6) {
                let salaryExpectationText = "";
                if (updatedPlayer.overall >= 88) {
                    salaryExpectationText = "Considering my current performance and market value, I hope to continue with a small increase in my salary.";
                } else {
                    salaryExpectationText = "I am ready to accept a small reduction in my salary to stay in this team.";
                }

                newMessages.push({
                    id: crypto.randomUUID(), playerId: updatedPlayer.id, playerName: updatedPlayer.name,
                    type: 'REQUEST', subject: "I want to renew my contract!",
                    body: `Manager, I really enjoy playing for this team and want to build a future here. My contract ends next season, but I'm ready to continue now. ${salaryExpectationText} If you accept, we can extend my contract for another 2 years. Waiting for your answer.`,
                    isRead: false, date
                });
            }
        }
      });

      newFreeAgents.forEach((p, index) => {
        if (p.status === 'military_service' && p.unavailableUntil && gameState.year + 1 >= p.unavailableUntil) {
            const returningPlayer = { ...p, status: 'retired', role: Role.COACH, originalRole: p.role, unavailableUntil: undefined };
            newFreeAgents[index] = returningPlayer;
            newNews.push({ id: crypto.randomUUID(), type: 'MAJOR_EVENT', title: `${p.name} Returned from Military Service!`, content: `${p.name} is returning to the scene as a coach after completing mandatory military service.`, date, involved: [{ type: 'player', name: p.name }] });
        }
      });


      const updatedAiRosters = { ...gameState.aiRosters };
      Object.keys(updatedAiRosters).forEach(teamId => {
          Object.keys(updatedAiRosters[teamId]).forEach(rKey => {
              const role = rKey as Role;
              const p = updatedAiRosters[teamId][role];
              if (p) {
                  const updatedPlayer = processPlayerOffSeason(p, 0, retiredPlayerNames, newFreeAgents);
                  updatedAiRosters[teamId][role] = updatedPlayer!; 
              }
          });
          
          const roles = [Role.TOP, Role.JUNGLE, Role.MID, Role.ADC, Role.SUPPORT];
          roles.forEach(role => {
              if (!updatedAiRosters[teamId][role]) {
                  const faIndex = newFreeAgents.findIndex(f => f.role === role);
                  if (faIndex >= 0) {
                      const fa = newFreeAgents[faIndex];
                      updatedAiRosters[teamId][role] = { ...fa, team: activeLeague.teams.find(t => t.id === teamId)?.shortName || 'AI', contractDuration: 2 };
                      newFreeAgents.splice(faIndex, 1);
                  } else {
                      updatedAiRosters[teamId][role] = { 
                          ...activeLeague.players[0], 
                          id: `gen-${teamId}-${role}-${Date.now()}`, 
                          name: `Rookie ${role}`, 
                          role, 
                          overall: 70, 
                          age: 18, 
                          price: 0, 
                          salary: 20, 
                          contractDuration: 2, 
                          rarity: Rarity.COMMON, 
                          stats: {mechanics:70, macro:70, lane:70, teamfight:70}, 
                          team: activeLeague.teams.find(t => t.id === teamId)?.shortName || 'AI'
                      };
                  }
              }
          });
      });

      const transferUpdates = handleAiTransfers({ ...gameState, aiRosters: updatedAiRosters, freeAgents: newFreeAgents, newsFeed: [], playerMessages: [] });

      setGameState(prev => ({
          ...prev, 
          stage: 'OFF_SEASON', 
          matchHistory: saveToHistory(prev, `${prev.year} ${prev.currentSplit} Playoffs`, 'BRACKET'),
          year: prev.year + 1,
          currentSplit: 'SPRING',
          week: 0,
          coins: prev.coins + seasonReward,
          inventory: updatedInventory,
          roster: updatedRoster,
          aiRosters: transferUpdates.aiRosters || updatedAiRosters,
          freeAgents: transferUpdates.freeAgents || newFreeAgents,
          newsFeed: [...prev.newsFeed, ...newNews, ...(transferUpdates.newsFeed || [])],
          playerMessages: [...prev.playerMessages, ...newMessages],
          playoffMatches: [] 
      })); 
      
      let notificationMessage = `${gameState.year} Season has ended! You earned ${seasonReward} G as ${performanceTitle}.`;
      if (retiredPlayerNames.length > 0) notificationMessage += ` Retirements: ${retiredPlayerNames.join(', ')}.`;
      
      showNotification('success', notificationMessage);
      if (newIncomingOffers.length > 0) {
        setIncomingOffers(newIncomingOffers);
        showNotification('success', `${newIncomingOffers.length} new offers received!`);
      }
      setMarket(prevMarket => prevMarket.filter(p => !retiredPlayerNames.includes(p.name)));
      if (newMessages.length > 0) {
        setNewlyArrivedMessages(newMessages);
      }
      setTab('dashboard'); 
  };

  const updatePlayerRelationships = (roster: Record<Role, PlayerCard | null>, didWin: boolean): Record<Role, PlayerCard | null> => {
    const players = Object.values(roster).filter((p): p is PlayerCard => p !== null && p.role !== Role.COACH);
    if (players.length < 2) return roster;

    let playerA = players[Math.floor(Math.random() * players.length)];
    let playerB = players[Math.floor(Math.random() * players.length)];
    while (playerA.id === playerB.id) {
      playerB = players[Math.floor(Math.random() * players.length)];
    }

    const chance = didWin ? 0.15 : 0.20;
    if (Math.random() > chance) return roster;

    const newRoster = { ...roster };

    const updateRelationship = (p1: PlayerCard, p2: PlayerCard, type: PlayerRelationship['type']) => {
      if (!p1.relationships) p1.relationships = [];
      if (!p2.relationships) p2.relationships = [];
      
      // Mevcut zıt ilişkiyi kaldır
      p1.relationships = p1.relationships.filter(r => r.targetPlayerId !== p2.id);
      p2.relationships = p2.relationships.filter(r => r.targetPlayerId !== p1.id);

      p1.relationships.push({ targetPlayerId: p2.id, type, strength: 50 });
      p2.relationships.push({ targetPlayerId: p1.id, type, strength: 50 });
      showNotification('info', `A new ${type.toLowerCase()} has formed between ${p1.name} and ${p2.name}.`);
    };

    if (didWin && Math.random() < 0.7) {
      updateRelationship(playerA, playerB, 'FRIENDSHIP');
    } else if (!didWin && Math.random() < 0.5) {
      updateRelationship(playerA, playerB, 'CONFLICT');
    }

    return newRoster;
  };

  const checkRetirement = (player: PlayerCard, isChampion: boolean): 'MILITARY' | 'NORMAL' | false => {
    const { age, morale, overall, previousOverall } = player;
    if (age < 26) return false;

    if (player.league === 'LCK' && age >= 28) {
        return 'MILITARY';
    }

    let retirementChance = 0;
    if (age === 26) retirementChance = 0.02;
    else if (age === 27) retirementChance = 0.05;
    else if (age === 28) retirementChance = 0.10;
    else if (age === 29) retirementChance = 0.20;
    else if (age >= 30) retirementChance = 0.30;

    if ((morale ?? 50) < 30) retirementChance *= 1.8;

    if (isChampion) retirementChance *= 0.2;
    else if (age > 28) retirementChance *= 1.5;
    if (overall > (previousOverall || overall - 1)) retirementChance *= 0.3;

    return Math.random() < retirementChance ? 'NORMAL' : false;
  };

  const processPlayerOffSeason = (
    player: PlayerCard, 
    clutchFactor: number, 
    retiredPlayerNames: string[], 
    newFreeAgents: PlayerCard[]
  ): PlayerCard | null => {
      const updated = processPlayerProgression(player, clutchFactor);
      updated.contractDuration -= 1;

      const convertToCoach = (p: PlayerCard, reason: string): PlayerCard => ({
        ...p,
        originalRole: p.role,
        retirementReason: reason,
        role: Role.COACH,
        status: 'retired',
        overall: Math.min(99, Math.round((p.stats.macro * 1.5 + p.stats.teamfight) / 2.5) + 5),
        salary: Math.floor(p.salary * 0.75),
        price: 0,
        team: 'FA',
        contractDuration: 0,
      });

      const retirementReason = checkRetirement(updated, clutchFactor > 0);
      if (retirementReason) {
          retiredPlayerNames.push(updated.name);
          if (retirementReason === 'MILITARY') {
              newFreeAgents.push({
                  ...updated,
                  status: 'military_service',
                  retirementReason: 'Military Service',
                  team: 'FA',
                  contractDuration: 0,
                  price: 0,
                  unavailableUntil: updated.age + 2,
              });
          } else {
              newFreeAgents.push(convertToCoach(updated, 'Performance/Age'));
          }
          return null;
      }

      if (updated.contractDuration <= 0) {
          newFreeAgents.push({ ...updated, team: 'FA', price: 0 }); 
          return null;
      }
      return updated;
  };

  const simulateSeries = (teamAId: string, teamBId: string, isBo5: boolean) => {
      const getRoster = (tid: string) => tid === gameState.teamId ? gameState.roster : gameState.aiRosters[tid] || {};
      const rosterA = getRoster(teamAId);
      const rosterB = getRoster(teamBId);

      const getPower = (roster: any) => {
          const players = Object.values(roster).filter(p => p !== null) as PlayerCard[];
          if (players.length === 0) return 0;
          return players.reduce((acc, p) => acc + p.overall, 0) / players.length;
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
          let draftPenaltyA = 0;
          let draftPenaltyB = 0;

          if (game >= 3) {
              if (powerA > powerB + 2) draftPenaltyB = (game - 2) * 3; 
              else if (powerB > powerA + 2) draftPenaltyA = (game - 2) * 3;
              else { draftPenaltyA = (game - 2) * 2; draftPenaltyB = (game - 2) * 2; }
          }

          const effectivePowerA = powerA - draftPenaltyA;
          const effectivePowerB = powerB - draftPenaltyB;
          const effectiveDiff = effectivePowerA - effectivePowerB;
          let winProbA = 0.50 + (effectiveDiff * 0.025); 
          winProbA = Math.max(0.1, Math.min(0.9, winProbA));

          if (Math.random() < winProbA) {
              winsA++;
              gameScores.push({ user: 15 + Math.floor(Math.random() * 15), enemy: 5 + Math.floor(Math.random() * 10) });
          } else {
              winsB++;
              gameScores.push({ user: 5 + Math.floor(Math.random() * 10), enemy: 15 + Math.floor(Math.random() * 15) });
          }
      }

      return { winnerId: winsA > winsB ? teamAId : teamBId, scoreA: winsA, scoreB: winsB, gameScores };
  };

  const endGroupStage = (currentState: GameState): GameState => {
      if (currentState.stage !== 'GROUP_STAGE') return currentState;
      const winsA = currentState.standings.filter(s => s.group === 'A').reduce((acc, s) => acc + s.wins, 0);
      const winsB = currentState.standings.filter(s => s.group === 'B').reduce((acc, s) => acc + s.wins, 0);
      const winnersGroup = winsA >= winsB ? 'A' : 'B';
      const losersGroup = winnersGroup === 'A' ? 'B' : 'A';
      const getSortedGroup = (grp: 'A' | 'B') => {
          return currentState.standings.filter(s => s.group === grp).sort((a, b) => {
              if (b.wins !== a.wins) return b.wins - a.wins;
              return (b.gameWins - b.gameLosses) - (a.gameWins - a.gameLosses);
          });
      };
      const sortedWinners = getSortedGroup(winnersGroup);
      const sortedLosers = getSortedGroup(losersGroup);
      const playInTeams = [ ...sortedWinners.slice(3, 5), ...sortedLosers.slice(0, 4) ];
      playInTeams.sort((a, b) => b.wins - a.wins);
      const playInMatches = initializePlayIns(playInTeams);
      showNotification('success', `Group Stage Ended! ${winnersGroup} is the Winners Group.`);
      setTab('play');
      return {
        ...currentState,
        stage: 'PLAY_IN', 
        winnersGroup, 
        week: 10,
        matchHistory: saveToHistory(currentState, `${currentState.year} ${currentState.currentSplit} Regular Season`, 'LEAGUE'),
        playoffMatches: playInMatches
      };
  };

  const initializePlayIns = (teams: Standing[]): PlayoffMatch[] => {
      if (teams.length < 6) console.warn("Not enough teams for play-in:", teams.length);
      const matches: PlayoffMatch[] = [
          { id: 'pi-1', roundName: 'Play-In Qualifier A', teamAId: teams[0]?.teamId || null, teamBId: teams[5]?.teamId || null, isBo5: true },
          { id: 'pi-2', roundName: 'Play-In Qualifier B', teamAId: teams[1]?.teamId || null, teamBId: teams[4]?.teamId || null, isBo5: true },
          { id: 'pi-3', roundName: 'Play-In Qualifier C', teamAId: teams[2]?.teamId || null, teamBId: teams[3]?.teamId || null, isBo5: true },
      ];
      return matches;
  };

  const initializeSimplePlayoffs = (currentState: GameState): GameState => {
    if (currentState.stage !== 'GROUP_STAGE') return currentState;
    const sortedStandings = [...currentState.standings].sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return (b.gameWins - b.gameLosses) - (a.gameWins - a.gameLosses);
    });
    const top6 = sortedStandings.slice(0, 6).map(s => s.teamId);
    const matches: PlayoffMatch[] = [
      { id: 'qf-1', roundName: 'Quarterfinals', teamAId: top6[2], teamBId: top6[5], nextMatchId: 'sf-1', nextMatchSlot: 'B', isBo5: true },
      { id: 'qf-2', roundName: 'Quarterfinals', teamAId: top6[3], teamBId: top6[4], nextMatchId: 'sf-2', nextMatchSlot: 'B', isBo5: true },
      { id: 'sf-1', roundName: 'Semifinals', teamAId: top6[0], teamBId: null, nextMatchId: 'f-1', nextMatchSlot: 'A', isBo5: true },
      { id: 'sf-2', roundName: 'Semifinals', teamAId: top6[1], teamBId: null, nextMatchId: 'f-1', nextMatchSlot: 'B', isBo5: true },
      { id: 'f-1', roundName: 'Grand Final', teamAId: null, teamBId: null, isBo5: true },
    ];
    showNotification('success', 'Regular Season has ended! The top 6 teams advance to Playoffs.');
    return {
      ...currentState,
      matchHistory: saveToHistory(currentState, `${currentState.year} ${currentState.currentSplit} Regular Season`, 'LEAGUE'),
      stage: 'PLAYOFFS', playoffMatches: matches, week: 10 
    };
  };

  const startLECGroupStage = (currentState: GameState): GameState => {
    if (currentState.stage !== 'GROUP_STAGE') return currentState;
    const top8 = currentState.standings.slice(0, 8).map(s => s.teamId);
    const groupA = [top8[0], top8[3], top8[4], top8[7]];
    const groupB = [top8[1], top8[2], top8[5], top8[6]];
    const createGroupMatches = (group: string[], prefix: string): PlayoffMatch[] => [
        { id: `${prefix}-ub-1`, roundName: `Group ${prefix.toUpperCase()} UB Semis`, teamAId: group[0], teamBId: group[3], nextMatchId: `${prefix}-ub-final`, nextMatchSlot: 'A', loserMatchId: `${prefix}-lb-1`, loserMatchSlot: 'A', isBo5: false },
        { id: `${prefix}-ub-2`, roundName: `Group ${prefix.toUpperCase()} UB Semis`, teamAId: group[1], teamBId: group[2], nextMatchId: `${prefix}-ub-final`, nextMatchSlot: 'B', loserMatchId: `${prefix}-lb-1`, loserMatchSlot: 'B', isBo5: false },
        { id: `${prefix}-lb-1`, roundName: `Group ${prefix.toUpperCase()} LB Semis`, teamAId: null, teamBId: null, nextMatchId: `${prefix}-lb-final`, nextMatchSlot: 'A', isBo5: false },
        { id: `${prefix}-ub-final`, roundName: `Group ${prefix.toUpperCase()} UB Final`, teamAId: null, teamBId: null, nextMatchId: `${prefix}-playoff-qual`, nextMatchSlot: 'A', loserMatchId: `${prefix}-lb-final`, loserMatchSlot: 'B', isBo5: false },
        { id: `${prefix}-lb-final`, roundName: `Group ${prefix.toUpperCase()} LB Final`, teamAId: null, teamBId: null, nextMatchId: `${prefix}-playoff-qual`, nextMatchSlot: 'B', isBo5: false },
    ];
    const matches = [...createGroupMatches(groupA, 'a'), ...createGroupMatches(groupB, 'b')];
    showNotification('success', 'LEC Regular Season ended! Top 8 advance to the Group Stage.');
    setTab('play');
    return {
      ...currentState,
      matchHistory: saveToHistory(currentState, `${currentState.year} ${currentState.currentSplit} Regular Season`, 'LEAGUE'),
      stage: 'LEC_GROUP_STAGE', playoffMatches: matches, week: 10 
    };
  };

  const initializePlayoffs = (currentState: GameState): GameState => {
      if (currentState.stage !== 'PLAY_IN') return currentState;

      const playInWinners = currentState.playoffMatches
          .map(m => m.winnerId)
          .filter((id): id is string => !!id);

      const { standings, winnersGroup } = currentState;
      const sortedWinners = standings.filter(s => s.group === winnersGroup).sort((a, b) => b.wins - a.wins);
      const directQualifiers = sortedWinners.slice(0, 3).map(s => s.teamId);
      const allQualifiers = [...directQualifiers, ...playInWinners];
      const seeds = allQualifiers;

      const matches: PlayoffMatch[] = [
              { id: 'qf-1', roundName: 'Quarterfinals 1', teamAId: seeds[2], teamBId: seeds[5], nextMatchId: 'sf-1', nextMatchSlot: 'B', isBo5: true },
              { id: 'qf-2', roundName: 'Quarterfinals 2', teamAId: seeds[3], teamBId: seeds[4], nextMatchId: 'sf-2', nextMatchSlot: 'B', isBo5: true },
              { id: 'sf-1', roundName: 'Semifinals 1', teamAId: seeds[0], teamBId: null, nextMatchId: 'f-1', nextMatchSlot: 'A', isBo5: true },
              { id: 'sf-2', roundName: 'Semifinals 2', teamAId: seeds[1], teamBId: null, nextMatchId: 'f-1', nextMatchSlot: 'B', isBo5: true },
              { id: 'f-1', roundName: 'Grand Final', teamAId: null, teamBId: null, isBo5: true },
          ];

          return {
              ...currentState,
              matchHistory: saveToHistory(currentState, `${currentState.year} ${currentState.currentSplit} Play-In`, 'LIST'),
              stage: 'PLAYOFFS',
              playoffMatches: matches
          };
  };

  const skipToNextMatch = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setGameState(prev => {
        let newState = { ...prev };
        let stopSkipping = false;
        let loopCount = 0;
        const MAX_LOOPS = 100;

        while (!stopSkipping && loopCount < MAX_LOOPS) {
          loopCount++;

          if (newState.stage === 'GROUP_STAGE' || newState.stage === 'LPL_SPLIT_2_GROUPS' || newState.stage === 'LPL_SPLIT_3_GROUPS') {
              const matchesToday = newState.schedule.filter(m => m.round === newState.currentDay);
              
              if (matchesToday.length === 0) { stopSkipping = true; break; }
              
              const userMatch = matchesToday.find(m => m.teamAId === newState.teamId || m.teamBId === newState.teamId);
              if (userMatch && !userMatch.played) { stopSkipping = true; break; }

              const newSchedule = [...newState.schedule];
              const newStandings = [...newState.standings];

              matchesToday.forEach(m => {
                  if (m.played || m.teamAId === newState.teamId || m.teamBId === newState.teamId) return;
                  
                  const league = Object.values(LEAGUES).find(l => l.teams.some(t => t.id === m.teamAId));
                  const isBo3 = league ? league.settings.isBo3 : false;
                  const sim = simulateSeries(m.teamAId, m.teamBId, isBo3 || !!m.isBo5);
                  
                  const idx = newSchedule.findIndex(s => s.id === m.id);
                  newSchedule[idx] = { ...m, played: true, winnerId: sim.winnerId, seriesScoreA: sim.scoreA, seriesScoreB: sim.scoreB };

                  const winnerStat = newStandings.find(s => s.teamId === sim.winnerId);
                  const loserStat = newStandings.find(s => s.teamId === (sim.winnerId === m.teamAId ? m.teamBId : m.teamAId));

                  if (winnerStat) {
                    winnerStat.wins++;
                    winnerStat.gameWins += Math.max(sim.scoreA, sim.scoreB);
                    winnerStat.gameLosses += Math.min(sim.scoreA, sim.scoreB);
                  }
                  if (loserStat) {
                    loserStat.losses++;
                    loserStat.gameWins += Math.min(sim.scoreA, sim.scoreB);
                    loserStat.gameLosses += Math.max(sim.scoreA, sim.scoreB);
                  }
              });

              newState.schedule = newSchedule;
              newState.standings = newStandings;

              if (newSchedule.every(m => m.played)) {
                  stopSkipping = true;
              } else {
                  const currentWeek = newState.week;
                  newState.currentDay++;
                  const matchesPerWeek = newState.stage === 'LPL_SPLIT_2_PLACEMENTS' ? 8 : 5;
                  newState.week = Math.ceil(newState.currentDay / matchesPerWeek);
                  
                  if (newState.week > currentWeek) newState.trainingSlotsUsed = 0;
              }
          } 
          else if (['PLAY_IN', 'PLAYOFFS', 'MSI_PLAY_IN', 'MSI_BRACKET', 'LPL_SPLIT_2_LCQ'].includes(newState.stage)) {
             const newMatches = [...newState.playoffMatches];
             const activeMatch = newMatches.find(m => !m.winnerId && m.teamAId && m.teamBId);

             if (!activeMatch) { stopSkipping = true; break; }
             if (activeMatch.teamAId === newState.teamId || activeMatch.teamBId === newState.teamId) { stopSkipping = true; break; }

             const sim = simulateSeries(activeMatch.teamAId!, activeMatch.teamBId!, !!activeMatch.isBo5);
             const idx = newMatches.findIndex(m => m.id === activeMatch.id);
             
             newMatches[idx].seriesScoreA = sim.scoreA;
             newMatches[idx].seriesScoreB = sim.scoreB;
             newMatches[idx].winnerId = sim.winnerId;

             if (newMatches[idx].nextMatchId) {
                 const nextIdx = newMatches.findIndex(m => m.id === newMatches[idx].nextMatchId);
                 if (nextIdx >= 0) {
                     if (newMatches[idx].nextMatchSlot === 'A') newMatches[nextIdx].teamAId = sim.winnerId;
                     else newMatches[nextIdx].teamBId = sim.winnerId;
                 }
             }
             
             if (newMatches[idx].loserMatchId) {
                 const loserId = sim.winnerId === activeMatch.teamAId ? activeMatch.teamBId : activeMatch.teamAId;
                 const loserIdx = newMatches.findIndex(m => m.id === newMatches[idx].loserMatchId);
                 if (loserIdx >= 0) {
                     if (newMatches[idx].loserMatchSlot === 'A') newMatches[loserIdx].teamAId = loserId;
                     else newMatches[loserIdx].teamBId = loserId;
                 }
             }

             if (newState.stage === 'LPL_SPLIT_2_LCQ') {
                 const winnerMatch = newMatches.find(m => m.id === 'lcq-winner-match');
                 const deciderMatch = newMatches.find(m => m.id === 'lcq-decider');
                 
                 if (winnerMatch && winnerMatch.winnerId && deciderMatch && !deciderMatch.teamAId) {
                     const loserId = winnerMatch.winnerId === winnerMatch.teamAId ? winnerMatch.teamBId : winnerMatch.teamAId;
                     const deciderIndex = newMatches.findIndex(m => m.id === 'lcq-decider');
                     if (deciderIndex >= 0) newMatches[deciderIndex].teamAId = loserId;
                 }
             }

             newState.playoffMatches = newMatches;
             
             if (newState.stage === 'LPL_SPLIT_2_LCQ' && newMatches.every(m => m.winnerId)) stopSkipping = true;
             if (newState.stage === 'PLAY_IN' && newMatches.every(m => m.winnerId)) stopSkipping = true;
             
             const finalMatch = newMatches.find(m => m.roundName === 'Grand Final');
             if (newState.stage === 'PLAYOFFS' && finalMatch && finalMatch.winnerId) stopSkipping = true;
             
             if (newState.stage === 'MSI_PLAY_IN' && newMatches.filter(m => m.roundName.includes('Final')).every(m => m.winnerId)) stopSkipping = true;
             
             const msiFinal = newMatches.find(m => m.id === 'msi-final');
             if (newState.stage === 'MSI_BRACKET' && msiFinal && msiFinal.winnerId) stopSkipping = true;
          }
        }

        if ((newState.stage === 'GROUP_STAGE' || newState.stage === 'LPL_SPLIT_2_PLACEMENTS') && newState.schedule.every(m => m.played)) {
             if (activeLeague.settings.format === 'LPL') {
                if (newState.stage === 'LPL_SPLIT_2_GROUPS' || newState.stage === 'LPL_SPLIT_3_GROUPS') {
                    return newState;
                }
                if (newState.stage === 'LPL_SPLIT_2_PLACEMENTS') {
                    return endLPLPlacementStage(newState);
                } else if (newState.currentSplit === 'SUMMER') {
                    return newState;
                } else {
                    if (newState.currentSplit === 'SPRING') {
                         return startLPLSplit1Playoffs(newState);
                    }
                    return newState;
                }
             } else {
                 if (activeLeague.settings.format === 'LEC') {
                     return startLECGroupStage(newState);
                 } else if (activeLeague.settings.format === 'LCK') {
                     return endGroupStage(newState);
                 } else {
                     return initializeSimplePlayoffs(newState);
                 }
             }
        }
        if (newState.stage === 'PLAY_IN' && newState.playoffMatches.every(m => m.winnerId)) {
            return initializePlayoffs(newState);
        }

        if (newState.stage === 'MSI_PLAY_IN' && newState.playoffMatches.length > 0 && newState.playoffMatches.filter(m => m.roundName.includes('Final')).every(m => m.winnerId)) {
             const playInHistory = saveToHistory(newState, `${newState.year} MSI Play-In`, 'BRACKET');
             
             const ubFinalWinner = newState.playoffMatches.find(m => m.id === 'msi-pi-ub-final')!.winnerId!;
             const lbFinalWinner = newState.playoffMatches.find(m => m.id === 'msi-pi-lb-final')!.winnerId!;
             const qualifiers = [ubFinalWinner, lbFinalWinner];
             const bracketContenders = [...(newState.msiBracketContenders || []), ...qualifiers].sort(() => 0.5 - Math.random());
             
             const bracketMatches: PlayoffMatch[] = [
                { id: 'msi-b-r1-1', roundName: 'UB Round 1', teamAId: bracketContenders[0], teamBId: bracketContenders[7], nextMatchId: 'msi-b-sf-1', nextMatchSlot: 'A', loserMatchId: 'msi-b-lb1-1', loserMatchSlot: 'A', isBo5: true },
                { id: 'msi-b-r1-2', roundName: 'UB Round 1', teamAId: bracketContenders[3], teamBId: bracketContenders[4], nextMatchId: 'msi-b-sf-1', nextMatchSlot: 'B', loserMatchId: 'msi-b-lb1-1', loserMatchSlot: 'B', isBo5: true },
                { id: 'msi-b-r1-3', roundName: 'UB Round 1', teamAId: bracketContenders[1], teamBId: bracketContenders[6], nextMatchId: 'msi-b-sf-2', nextMatchSlot: 'A', loserMatchId: 'msi-b-lb1-2', loserMatchSlot: 'A', isBo5: true },
                { id: 'msi-b-r1-4', roundName: 'UB Round 1', teamAId: bracketContenders[2], teamBId: bracketContenders[5], nextMatchId: 'msi-b-sf-2', nextMatchSlot: 'B', loserMatchId: 'msi-b-lb1-2', loserMatchSlot: 'B', isBo5: true },
                { id: 'msi-b-sf-1', roundName: 'UB Semifinals', teamAId: null, teamBId: null, nextMatchId: 'msi-b-ubf', nextMatchSlot: 'A', loserMatchId: 'msi-b-lbsf', loserMatchSlot: 'B', isBo5: true },
                { id: 'msi-b-sf-2', roundName: 'UB Semifinals', teamAId: null, teamBId: null, nextMatchId: 'msi-b-ubf', nextMatchSlot: 'B', loserMatchId: 'msi-b-lbsf', loserMatchSlot: 'A', isBo5: true },
                { id: 'msi-b-ubf', roundName: 'UB Final', teamAId: null, teamBId: null, nextMatchId: 'msi-final', nextMatchSlot: 'A', loserMatchId: 'msi-b-lbf', loserMatchSlot: 'B', isBo5: true },
                { id: 'msi-b-lb1-1', roundName: 'LB Round 1', teamAId: null, teamBId: null, nextMatchId: 'msi-b-lbsf', nextMatchSlot: 'A', isBo5: true },
                { id: 'msi-b-lb1-2', roundName: 'LB Round 1', teamAId: null, teamBId: null, nextMatchId: 'msi-b-lbsf', nextMatchSlot: 'B', isBo5: true },
                { id: 'msi-b-lbsf', roundName: 'LB Semifinal', teamAId: null, teamBId: null, nextMatchId: 'msi-b-lbf', nextMatchSlot: 'A', isBo5: true },
                { id: 'msi-b-lbf', roundName: 'LB Final', teamAId: null, teamBId: null, nextMatchId: 'msi-final', nextMatchSlot: 'B', isBo5: true },
                { id: 'msi-final', roundName: 'Grand Final', teamAId: null, teamBId: null, isBo5: true },
             ];
             
             return {
                 ...newState,
                 matchHistory: playInHistory,
                 stage: 'MSI_BRACKET',
                 playoffMatches: bracketMatches,
             };
        }

        if (newState.stage === 'MSI_BRACKET' && newState.playoffMatches.every(m => m.winnerId)) {
            const bracketHistory = saveToHistory(newState, `${newState.year} MSI Bracket`, 'BRACKET');
            
            return {
                ...newState,
                matchHistory: bracketHistory,
                stage: 'PRE_SEASON',
                currentSplit: 'SUMMER',
                playoffMatches: [],
                schedule: [], 
                week: 1,
                currentDay: 1
            };
        }

        return newState;
      });
      setIsSimulating(false);
    }, 100);
  };

  const handleDraftComplete = (draftBonus: number) => {
      setIsDrafting(false); 
      setIsPlayingMatch(true); 

      if (!draftMatchInfo) return;

      const { matchId, opponentId, isBo5 } = draftMatchInfo;
      const enemyRoster = gameState.aiRosters[opponentId] || {};

      const result = simulateMatchSeries(
           gameState.teamId,
           opponentId,
           gameState.roster, 
           enemyRoster,
           isBo5,
           draftBonus
       );

       result.enemyTeam = allTeams.find(t => t.id === opponentId)?.shortName || 'Enemy';

       setPendingSimResult({ userResult: result, matchId, opponentId });
       setIsSimulating(true);
  };

  const initiateMatch = () => {
     let validMatch: any;
     
     if (gameState.stage.includes('GROUP') || gameState.stage.includes('SPLIT')) {
        validMatch = gameState.schedule.find(m => 
            !m.played && 
            m.round === gameState.currentDay && 
            (m.teamAId === gameState.teamId || m.teamBId === gameState.teamId)
        );
     } else {
        validMatch = gameState.playoffMatches.find(m => 
            !m.winnerId && 
            m.teamAId && m.teamBId &&
            (m.teamAId === gameState.teamId || m.teamBId === gameState.teamId)
        );
     }

     if (validMatch) {
        const oppId = validMatch.teamAId === gameState.teamId ? validMatch.teamBId : validMatch.teamAId;
        
        if (!oppId) {
             showNotification('error', "Opponent is not determined yet.");
             return;
        }

        setDraftMatchInfo({
            matchId: validMatch.id,
            opponentId: oppId,
            isBo5: !!validMatch.isBo5
        });
        
        setIsDrafting(true); 
     } else {
        showNotification('error', "No playable match found for today. Check schedule or simulate.");
     }
  };

  const finalizeDaySimulation = (userResult: MatchResult | null) => {
    let income = 0;
    let expenses = 0;
    const financialLogs: string[] = [];

    if (userResult) {
        const matchIncome = userResult.victory ? 300 : 100;
        income += matchIncome;
        financialLogs.push(`Match Income: +${matchIncome}G`);
    }

    if (currentSponsor) {
        income += currentSponsor.weeklyIncome;
        financialLogs.push(`Sponsor (${currentSponsor.name}): +${currentSponsor.weeklyIncome}G`);

    }

    const weeklyCosts = calculateWeeklyExpenses(gameState.roster, gameState.teamId);
    const dailyUpkeep = Math.round(weeklyCosts.total / 2);

    expenses += dailyUpkeep;
    financialLogs.push(`Daily Operations: -${dailyUpkeep}G`);

    const netChange = income - expenses;
    const netColor = netChange >= 0 ? 'success' : 'error';
    const netSign = netChange >= 0 ? '+' : '';
    showNotification(netColor, `Daily Finances: ${netSign}${netChange}G`);

    setGameState(prev => ({ ...prev, coins: prev.coins + netChange }));

    setIsSimulating(false);
    setPendingSimResult(null);

     if (userResult && userResult.playerStats.length > 0) {
      const { newRoster, newInventory } = processMatchPlayerStats(
        gameState.roster,
        gameState.inventory,
        userResult.playerStats
      );
      setGameState(prev => ({ ...prev, roster: newRoster, inventory: newInventory }));
      showNotification('success', 'Player stats have been updated based on match performance!');
    }

     const randomEvt = generateRandomEvent(gameState.roster);
     if (randomEvt) {
         setActiveEventModal(randomEvt);
         setGameState(prev => {
             const roster = { ...prev.roster };
             const player = roster[randomEvt.player.role];
             if (player && player.id === randomEvt.player.id) {
                 const currentEvents = player.events || [];
                 const newStats = { ...player.stats };
                 if (randomEvt.event.penalty.mechanics) newStats.mechanics -= randomEvt.event.penalty.mechanics;
                 if (randomEvt.event.penalty.macro) newStats.macro -= randomEvt.event.penalty.macro;
                 if (randomEvt.event.penalty.lane) newStats.lane -= randomEvt.event.penalty.lane;
                 if (randomEvt.event.penalty.teamfight) newStats.teamfight -= randomEvt.event.penalty.teamfight;
                 
                 const newOverall = Math.round((newStats.mechanics + newStats.macro + newStats.lane + newStats.teamfight) / 4);
                 roster[randomEvt.player.role] = { ...player, stats: newStats, overall: newOverall, events: [...currentEvents, randomEvt.event] };
                 return { ...prev, roster };
             }
             return prev;
         });
     }

     setGameState(prev => {
       const eventResult = processEvents(prev);
       let updatedStandings = [...prev.standings];
       const updatedRoster = eventResult.roster;
       let nextState = { ...prev, roster: updatedRoster };
       let newRosterForMorale = { ...updatedRoster };

       if (nextState.stage === 'GROUP_STAGE') {
           const matchesToday = nextState.schedule.filter(m => m.round === nextState.currentDay);
           const newSchedule = [...nextState.schedule];
           let newRosterForMorale = { ...updatedRoster };

           matchesToday.forEach(m => {
               let winnerId, scoreA, scoreB;
               const isUserMatch = m.teamAId === nextState.teamId || m.teamBId === nextState.teamId;

               if (isUserMatch && userResult) {
                   winnerId = userResult.victory ? nextState.teamId : (m.teamAId === nextState.teamId ? m.teamBId : m.teamAId);
                   scoreA = m.teamAId === nextState.teamId ? userResult.scoreUser : userResult.scoreEnemy;
                   scoreB = m.teamAId === nextState.teamId ? userResult.scoreEnemy : userResult.scoreUser;
               } else {
                   if (m.played || isUserMatch) return;
                   const sim = simulateSeries(m.teamAId, m.teamBId, !!activeLeague.settings.isBo3);
                   winnerId = sim.winnerId;
                   scoreA = sim.scoreA;
                   scoreB = sim.scoreB;
               }

              if (isUserMatch) {
                   const didWin = winnerId === nextState.teamId;
                   const userStanding = updatedStandings.find(s => s.teamId === nextState.teamId);
                   const oldStreak = userStanding?.streak || 0;
                   const newStreak = didWin ? Math.max(1, oldStreak + 1) : Math.min(-1, oldStreak - 1);
                   if (userStanding) userStanding.streak = newStreak;
                   newRosterForMorale = updateTeamMorale(newRosterForMorale, didWin, oldStreak);
               }

               const idx = newSchedule.findIndex(s => s.id === m.id);
               newSchedule[idx] = { ...m, played: true, winnerId, seriesScoreA: scoreA, seriesScoreB: scoreB };

               const winnerStat = updatedStandings.find(s => s.teamId === winnerId);
               const loserStat = updatedStandings.find(s => s.teamId === (winnerId === m.teamAId ? m.teamBId : m.teamAId));

               if (winnerStat) {
                   winnerStat.wins++;
                   winnerStat.gameWins += Math.max(scoreA, scoreB);
                   winnerStat.gameLosses += Math.min(scoreA, scoreB);
               }
               if (loserStat) {
                   loserStat.losses++;
                   loserStat.gameWins += Math.min(scoreA, scoreB);
                   loserStat.gameLosses += Math.max(scoreA, scoreB);
               }
           });

           const allSeasonPlayed = newSchedule.every(m => m.played);
           const allTodayPlayed = matchesToday.every(m => newSchedule.find(s => s.id === m.id)?.played);

           if (allSeasonPlayed) {
                let finalState = { ...nextState, schedule: newSchedule, standings: updatedStandings, roster: newRosterForMorale };
                if (activeLeague.settings.format === 'LPL') {
                    if (finalState.stage === 'LPL_SPLIT_2_GROUPS' || finalState.stage === 'LPL_SPLIT_3_GROUPS') {
                        return finalState;
                    }
                    if (finalState.stage === 'LPL_SPLIT_2_PLACEMENTS') {
                         return endLPLPlacementStage(finalState);
                    }
                    if (finalState.currentSplit === 'SPRING') {
                        finalState = startLPLSplit1Playoffs(finalState);
                    }
                } else if (activeLeague.settings.format === 'LEC') {
                  finalState = startLECGroupStage(finalState);
                } else if (activeLeague.settings.format === 'LCK') {
                  finalState = endGroupStage(finalState);
                } else {
                  finalState = initializeSimplePlayoffs(finalState);
                }
                return finalState;
           }

           const newDay = allTodayPlayed ? nextState.currentDay + 1 : nextState.currentDay;
           const newWeek = Math.ceil(newDay / 5);

           const finalRoster = userResult ? updatePlayerRelationships(newRosterForMorale, userResult.victory) : newRosterForMorale;

           return { 
               ...nextState,
               roster: finalRoster,
               schedule: newSchedule, 
               standings: updatedStandings, 
               currentDay: newDay, 
               week: newWeek,
               trainingSlotsUsed: newWeek > nextState.week ? 0 : nextState.trainingSlotsUsed
           };
       }
       else if (['PLAY_IN', 'PLAYOFFS', 'MSI_PLAY_IN', 'MSI_BRACKET', 'LPL_SPLIT_2_LCQ'].includes(nextState.stage)) {
           const newMatches = [...nextState.playoffMatches];
           const matchIdToProcess = userResult ? pendingSimResult?.matchId : newMatches.find(m => !m.winnerId && m.teamAId && m.teamBId)?.id;
           let activeMatch = matchIdToProcess ? newMatches.find(m => m.id === matchIdToProcess) : undefined;

           if (!activeMatch && userResult === null && ['MSI_PLAY_IN', 'MSI_BRACKET'].includes(nextState.stage)) {
               activeMatch = newMatches.find(m => !m.winnerId && m.teamAId && m.teamBId);
           }
           
           if (activeMatch) {
               let winnerId;
               if (activeMatch.teamAId === nextState.teamId || activeMatch.teamBId === nextState.teamId) {
                   winnerId = userResult?.victory ? nextState.teamId : (activeMatch.teamAId === nextState.teamId ? activeMatch.teamBId : activeMatch.teamAId);
               } else if (userResult === null) {
                   const sim = simulateSeries(activeMatch.teamAId!, activeMatch.teamBId!, !!activeMatch.isBo5);
                   winnerId = sim.winnerId;
                   const resultObj: MatchResult = {
                       victory: false,
                       scoreUser: sim.scoreA,
                       scoreEnemy: sim.scoreB,
                       playerStats: [],
                       gameScores: [],
                       enemyTeam: allTeams.find(t => t.id === activeMatch.teamBId)?.shortName || '',
                       isBo5: !!activeMatch.isBo5
                   };
                   setLastMatch(resultObj);
               } else {
                   return nextState;
               }
               
               const idx = newMatches.findIndex(m => m.id === activeMatch.id);
               newMatches[idx].winnerId = winnerId!;
               const userResultExists = userResult && (activeMatch.teamAId === nextState.teamId || activeMatch.teamBId === nextState.teamId);
               newMatches[idx].seriesScoreA = userResultExists ? (activeMatch.teamAId === nextState.teamId ? userResult.scoreUser : userResult.scoreEnemy) : (winnerId === activeMatch.teamAId ? Math.max(2,3) : Math.floor(Math.random() * 2));
               newMatches[idx].seriesScoreB = userResultExists ? (activeMatch.teamBId === nextState.teamId ? userResult.scoreUser : userResult.scoreEnemy) : (winnerId === activeMatch.teamBId ? Math.max(2,3) : Math.floor(Math.random() * 2));

               if (newMatches[idx].nextMatchId) {
                   const nextIdx = newMatches.findIndex(m => m.id === activeMatch.nextMatchId);
                   if (nextIdx >= 0) {
                       if (activeMatch.nextMatchSlot === 'A') newMatches[nextIdx].teamAId = winnerId!;
                       else newMatches[nextIdx].teamBId = winnerId!;
                   }
               }

               if (newMatches[idx].loserMatchId) {
                   const loserId = winnerId === activeMatch.teamAId ? activeMatch.teamBId : activeMatch.teamAId;
                   const loserIdx = newMatches.findIndex(m => m.id === activeMatch.loserMatchId);
                   if (loserIdx >= 0) {
                       if (activeMatch.loserMatchSlot === 'A') newMatches[loserIdx].teamAId = loserId;
                       else newMatches[loserIdx].teamBId = loserId;
                   }
               }
           }

           if (nextState.stage === 'PLAY_IN' && newMatches.every(m => m.winnerId)) {
               return initializePlayoffs({ ...nextState, playoffMatches: newMatches });
           }
           
           if (nextState.stage === 'MSI_PLAY_IN' && newMatches.filter(m => m.roundName.includes('Final')).every(m => m.winnerId)) {
              const ubFinalWinner = newMatches.find(m => m.id === 'msi-pi-ub-final')!.winnerId!;
              const lbFinalWinner = newMatches.find(m => m.id === 'msi-pi-lb-final')!.winnerId!;
              const qualifiers = [ubFinalWinner, lbFinalWinner];
              showNotification('success', `MSI Play-In has concluded! ${qualifiers.join(' and ')} advance.`);
              
              const bracketContenders = [...(nextState.msiBracketContenders || []), ...qualifiers].sort(() => 0.5 - Math.random());
              const bracketMatches: PlayoffMatch[] = [
                { id: 'msi-b-r1-1', roundName: 'UB Round 1', teamAId: bracketContenders[0], teamBId: bracketContenders[7], nextMatchId: 'msi-b-sf-1', nextMatchSlot: 'A', loserMatchId: 'msi-b-lb1-1', loserMatchSlot: 'A', isBo5: true },
                { id: 'msi-b-r1-2', roundName: 'UB Round 1', teamAId: bracketContenders[3], teamBId: bracketContenders[4], nextMatchId: 'msi-b-sf-1', nextMatchSlot: 'B', loserMatchId: 'msi-b-lb1-1', loserMatchSlot: 'B', isBo5: true },
                { id: 'msi-b-r1-3', roundName: 'UB Round 1', teamAId: bracketContenders[1], teamBId: bracketContenders[6], nextMatchId: 'msi-b-sf-2', nextMatchSlot: 'A', loserMatchId: 'msi-b-lb1-2', loserMatchSlot: 'A', isBo5: true },
                { id: 'msi-b-r1-4', roundName: 'UB Round 1', teamAId: bracketContenders[2], teamBId: bracketContenders[5], nextMatchId: 'msi-b-sf-2', nextMatchSlot: 'B', loserMatchId: 'msi-b-lb1-2', loserMatchSlot: 'B', isBo5: true },
                { id: 'msi-b-sf-1', roundName: 'UB Semifinals', teamAId: null, teamBId: null, nextMatchId: 'msi-b-ubf', nextMatchSlot: 'A', loserMatchId: 'msi-b-lbsf', loserMatchSlot: 'B', isBo5: true },
                { id: 'msi-b-sf-2', roundName: 'UB Semifinals', teamAId: null, teamBId: null, nextMatchId: 'msi-b-ubf', nextMatchSlot: 'B', loserMatchId: 'msi-b-lbsf', loserMatchSlot: 'A', isBo5: true },
                { id: 'msi-b-ubf', roundName: 'UB Final', teamAId: null, teamBId: null, nextMatchId: 'msi-final', nextMatchSlot: 'A', loserMatchId: 'msi-b-lbf', loserMatchSlot: 'B', isBo5: true },
                { id: 'msi-b-lb1-1', roundName: 'LB Round 1', teamAId: null, teamBId: null, nextMatchId: 'msi-b-lbsf', nextMatchSlot: 'A', isBo5: true },
                { id: 'msi-b-lb1-2', roundName: 'LB Round 1', teamAId: null, teamBId: null, nextMatchId: 'msi-b-lbsf', nextMatchSlot: 'B', isBo5: true },
                { id: 'msi-b-lbsf', roundName: 'LB Semifinal', teamAId: null, teamBId: null, nextMatchId: 'msi-b-lbf', nextMatchSlot: 'A', isBo5: true },
                { id: 'msi-b-lbf', roundName: 'LB Final', teamAId: null, teamBId: null, nextMatchId: 'msi-final', nextMatchSlot: 'B', isBo5: true },
                { id: 'msi-final', roundName: 'Grand Final', teamAId: null, teamBId: null, isBo5: true },
              ];

               const stateForHistory = { ...nextState, playoffMatches: newMatches };
               const playInHistory = saveToHistory(stateForHistory, `${nextState.year} MSI Play-In`, 'BRACKET');

               return {
                ...nextState,
                stage: 'MSI_BRACKET',
                matchHistory: playInHistory,
                playoffMatches: bracketMatches,
              };
            }
           
           if (nextState.stage === 'MSI_BRACKET' && newMatches.every(m => m.winnerId)) {
               const msiWinnerId = newMatches.find(m => m.roundName.includes('Grand Final'))!.winnerId;
               const isMsiChampion = msiWinnerId === nextState.teamId;
               const reward = isMsiChampion ? 50000 : 10000;
               showNotification('success', `MSI has concluded! You earned ${reward}G.`);
               const stateForHistory = { ...nextState, playoffMatches: newMatches };
               const finalHistory = saveToHistory(stateForHistory, `${nextState.year} MSI Bracket`, 'BRACKET');

               return {
                   ...nextState,
                   coins: nextState.coins + reward,
                   matchHistory: finalHistory,
                   stage: 'PRE_SEASON',
                   currentSplit: 'SUMMER',
                   playoffMatches: [],
                   schedule: [],
                   week: 1,
                   currentDay: 1
               };
           }

           return { ...nextState, playoffMatches: newMatches };
       }
       return nextState;
     });
     setIsPlayingMatch(false);
  };

  const handleResetFilters = () => {
    setFilterRole('ALL');
    setFilterStatus('ALL');
    setSortOrder('RATING');
    setPriceRange({ min: 0, max: 20000 });
    setFilterLeague('ALL');
    setMarketPage(1);
  };

  const MarketViewComponent = () => {
    const totalPages = Math.ceil(filteredMarket.length / PLAYERS_PER_PAGE);
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 pt-4 border-t border-dark-800">
                <div className="xl:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Role</label>
                  <div className="flex gap-1 bg-dark-950 p-1 rounded-lg h-10 items-center">
                      <button onClick={() => setFilterRole('ALL')} className={`flex-1 py-1.5 rounded text-xs font-bold ${filterRole === 'ALL' ? 'bg-dark-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}>ALL</button>
                      {Object.values(Role).filter(r => r !== Role.COACH).map(role => (
                        <button key={role} onClick={() => setFilterRole(role)} className={`flex-1 py-1.5 rounded text-xs font-bold ${filterRole === role ? 'bg-hextech-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                            {role === Role.JUNGLE ? 'JUNGLE' : role.slice(0, 3)}
                        </button>
                      ))}
                      <button onClick={() => setFilterRole(Role.COACH)} className={`flex-1 py-1.5 rounded text-xs font-bold ${filterRole === Role.COACH ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                        COACH
                      </button>
                  </div>
                </div>
                <div className="xl:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status</label>
                  <div className="flex gap-1 bg-dark-950 p-1 rounded-lg h-10 items-center">
                      <button onClick={() => setFilterStatus('ALL')} className={`flex-1 py-1.5 rounded text-xs font-bold ${filterStatus === 'ALL' ? 'bg-dark-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}>All</button>
                      <button onClick={() => setFilterStatus('FA')} className={`flex-1 py-1.5 rounded text-xs font-bold ${filterStatus === 'FA' ? 'bg-green-600/20 text-green-400' : 'text-gray-500 hover:text-gray-300'}`}>Free Agents</button>
                      <button onClick={() => setFilterStatus('TRANSFER')} className={`flex-1 py-1.5 rounded text-xs font-bold ${filterStatus === 'TRANSFER' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>Transfer</button>
                      <button onClick={() => setFilterStatus('RETIRED' as any)} className={`flex-1 py-1.5 rounded text-xs font-bold ${filterStatus === 'RETIRED' ? 'bg-gray-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Retired</button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">League</label>
                  <div className="relative">
                      <select value={filterLeague} onChange={(e) => setFilterLeague(e.target.value as any)} className="w-full bg-dark-950 border border-dark-700 text-white text-sm font-bold pl-3 pr-8 rounded-lg focus:outline-none focus:border-hextech-500 appearance-none cursor-pointer h-10">
                        <option value="ALL">All Leagues</option>
                        {Object.keys(LEAGUES).map(key => (
                          <option key={key} value={key}>{(LEAGUES as any)[key].name}</option>
                        ))}
                      </select>
                  </div>
                </div>
                <div className="xl:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sort By</label>
                  <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                        <ArrowDownUp size={14} />
                      </div>
                      <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)} className="w-full bg-dark-950 border border-dark-700 text-white text-sm font-bold pl-9 pr-4 rounded-lg focus:outline-none focus:border-hextech-500 appearance-none cursor-pointer h-10">
                        <option value="RATING">Rating</option>
                        <option value="PRICE">Transfer Fee</option>
                        <option value="SALARY">Salary</option>
                      </select>
                  </div>
                </div>
                <div className="xl:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Transfer Fee</label>
                    <div className="flex items-center gap-2 bg-dark-950 px-3 rounded-lg border border-dark-700 h-10">
                      <span className="text-xs font-bold text-gray-500">Fee:</span>
                      <input type="number" value={priceRange.min} onChange={e => setPriceRange({...priceRange, min: Number(e.target.value)})} className="w-16 bg-transparent text-white text-xs font-mono focus:outline-none text-right" placeholder="Min" />
                      <span className="text-gray-600">-</span>
                      <input type="number" value={priceRange.max} onChange={e => setPriceRange({...priceRange, max: Number(e.target.value)})} className="w-16 bg-transparent text-white text-xs font-mono focus:outline-none" placeholder="Max" />
                    </div>
                </div>
                <div className="flex items-end">
                  <button onClick={handleResetFilters} className="w-full h-10 flex items-center justify-center gap-2 rounded-lg text-xs font-bold bg-dark-800 text-gray-400 hover:text-white hover:bg-dark-700 border border-dark-700">
                    <RotateCcw size={14} /> Reset
                  </button>
                </div>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedMarket.length === 0 && <div className="col-span-full text-center py-10 text-gray-500 italic">No players match your filters.</div>}
              {paginatedMarket.map(player => {
                 const team = activeLeague.teams.find(t => t.shortName === player.team);
                 return <Card 
                   key={player.id} 
                   player={player} 
                   team={team}
                   actionLabel={player.status === 'retired' ? 'Negotiate' : 'Negotiate'}
                   onClick={() => {
                     if (player.status === 'retired') {
                       setRetiredPlayerModal(player);
                     } else openNegotiation(player);
                   }}
                 />;
              })}
           </div>

           {totalPages > 1 && (
             <div className="flex justify-center items-center gap-4 pt-6 border-t border-dark-800">
                <button
                   onClick={() => setMarketPage(p => Math.max(1, p - 1))}
                   disabled={marketPage === 1}
                   className="px-4 py-2 bg-dark-800 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-700"
                >
                   Previous
                </button>
                <span className="text-gray-400 font-mono text-sm">
                   Page {marketPage} of {totalPages}
                </span>
                <button
                   onClick={() => setMarketPage(p => Math.min(totalPages, p + 1))}
                   disabled={marketPage >= totalPages}
                   className="px-4 py-2 bg-dark-800 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-700"
                >
                   Next
                </button>
             </div>
           )}
      </div>
    );
  };

  interface DraftPhaseProps {
  userTeam: TeamData;
  enemyTeam: TeamData;
  onDraftComplete: (draftScore: number) => void;
}

const DraftPhase: React.FC<DraftPhaseProps> = ({ userTeam, enemyTeam, onDraftComplete }) => {
  const [step, setStep] = useState<'SELECT' | 'REVEAL' | 'RESULT'>('SELECT');
  const [selectedStratId, setSelectedStratId] = useState<string | null>(null);
  const [enemyStrat, setEnemyStrat] = useState<any>(null);
  const [resultData, setResultData] = useState<{ bonus: number, msg: string } | null>(null);

  const strategies = [
    { id: 'AGGRESSIVE', name: 'Aggressive', sub: 'Early Game', icon: '🗡️', color: 'from-red-600 to-orange-600', beats: 'SCALING', loseTo: 'CONTROL' },
    { id: 'CONTROL', name: 'Control', sub: 'Macro Play', icon: '🛡️', color: 'from-blue-600 to-cyan-600', beats: 'AGGRESSIVE', loseTo: 'SCALING' },
    { id: 'SCALING', name: 'Scaling', sub: 'Late Game', icon: '⏳', color: 'from-purple-600 to-pink-600', beats: 'CONTROL', loseTo: 'AGGRESSIVE' },
  ];

  const handleSelect = (stratId: string) => {
    setSelectedStratId(stratId);
    
    const enemyChoice = strategies[Math.floor(Math.random() * strategies.length)];
    setEnemyStrat(enemyChoice);

    const userChoice = strategies.find(s => s.id === stratId)!;
    let bonus = 0;
    let msg = "";

    if (userChoice.beats === enemyChoice.id) {
        bonus = 6; msg = "COUNTER PICK!";
    } else if (userChoice.loseTo === enemyChoice.id) {
        bonus = -4; msg = "OUTDRAFTED...";
    } else {
        bonus = 0; msg = "SKILL MATCHUP";
    }

    setResultData({ bonus, msg });
    
    setStep('REVEAL');
    setTimeout(() => setStep('RESULT'), 2000);
    setTimeout(() => onDraftComplete(bonus), 3500);
  };

  const getSelectedStrategy = () => strategies.find(s => s.id === selectedStratId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl overflow-hidden pl-72">
      {/* Dinamik Arka Plan */}
      <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-1000 opacity-20 ${step === 'RESULT' && resultData?.bonus! > 0 ? 'from-green-500 to-green-900' : step === 'RESULT' && resultData?.bonus! < 0 ? 'from-red-900 to-black' : 'from-blue-900 to-gray-900'}`} />

      <div className="relative w-full max-w-7xl p-4 flex flex-col items-center">
         
         {/* ÜST KISIM: TAKIMLAR VE DURUM */}
         <div className="flex justify-between items-start w-full px-20 mb-8 h-32">
            <div className="text-center animate-in slide-in-from-top duration-700">
                <TeamLogo team={userTeam} size="w-20 h-20" className="mx-auto shadow-[0_0_20px_rgba(59,130,246,0.5)] rounded-full" />
            </div>

            <div className="text-center flex-1 pt-4">
                {step === 'SELECT' && <div className="text-4xl font-bold text-white animate-pulse font-display">CHOOSE YOUR STRATEGY</div>}
                {step === 'REVEAL' && <div className="text-4xl font-bold text-yellow-400 animate-bounce font-display">OPPONENT IS CHOOSING...</div>}
                {step === 'RESULT' && (
                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                        <div className={`text-6xl font-black italic ${resultData?.bonus! > 0 ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]' : resultData?.bonus! < 0 ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-gray-300'}`}>
                            {resultData?.msg}
                        </div>
                        <div className="text-2xl font-mono mt-2 text-white bg-black/50 px-6 py-1 rounded-full border border-white/20">
                            {resultData?.bonus! > 0 ? '+' : ''}{resultData?.bonus} Power
                        </div>
                    </div>
                )}
            </div>

            <div className="text-center animate-in slide-in-from-top duration-700 delay-100">
                <TeamLogo team={enemyTeam} size="w-20 h-20" className="mx-auto shadow-[0_0_20px_rgba(239,68,68,0.5)] rounded-full" />
            </div>
         </div>

         {/* ANA KART ALANI - 3D Perspektif Konteyneri */}
         <div className="relative w-full flex items-center justify-center perspective-1000 min-h-[500px]">
            
            {/* --- DURUM 1: SEÇİM EKRANI (3 KART YANYANA) --- */}
            {step === 'SELECT' && (
                <div className="flex justify-center items-center gap-10 animate-fade-in">
                    {strategies.map((strat, index) => (
                    <div 
                        key={strat.id}
                        onClick={() => handleSelect(strat.id)}
                        className={`relative w-72 h-[420px] rounded-2xl bg-gradient-to-br ${strat.color} p-1 shadow-xl cursor-pointer hover:scale-105 hover:-translate-y-4 transition-all duration-300 ease-out border-2 border-white/10 group animate-in slide-in-from-bottom fade-in duration-700 fill-mode-backwards`}
                        style={{ animationDelay: `${index * 150}ms` }}
                    >
                        <div className="w-full h-full bg-dark-900/95 rounded-xl flex flex-col items-center justify-center p-6 text-center backdrop-blur-md group-hover:bg-dark-900/80 transition-colors">
                            <div className="text-7xl mb-6 filter drop-shadow-lg group-hover:scale-110 transition-transform">{strat.icon}</div>
                            <h3 className="text-3xl font-bold text-white uppercase font-display">{strat.name}</h3>
                            <p className="text-md text-gray-300 font-mono mt-2">{strat.sub}</p>
                            <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold">
                                <span className="text-green-400 block">Strong vs: {strat.beats}</span>
                                <span className="text-red-400 block mt-1">Weak vs: {strat.loseTo}</span>
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
            )}

            {/* --- DURUM 2 & 3: SONUÇ EKRANI (SOLDA SEN, SAĞDA RAKİP) --- */}
            {(step === 'REVEAL' || step === 'RESULT') && getSelectedStrategy() && (
                <div className="flex w-full justify-center items-center gap-4 md:gap-16 lg:gap-24 animate-in fade-in zoom-in duration-500 min-h-[500px]">

                    {/* SOL: SENİN SEÇTİĞİN KART */}
                    <div className={`w-80 h-[480px] shrink-0 rounded-2xl bg-gradient-to-br ${getSelectedStrategy()!.color} p-1 shadow-[0_0_50px_rgba(200,160,50,0.5)] z-20 animate-in slide-in-from-left-20 duration-700 ring-4 ring-gold-400`}>
                        <div className="w-full h-full bg-dark-900/90 rounded-xl flex flex-col items-center justify-center p-8 text-center">
                            <div className="text-8xl mb-8 filter drop-shadow-2xl">{getSelectedStrategy()!.icon}</div>
                            <h3 className="text-4xl font-bold text-white uppercase font-display">{getSelectedStrategy()!.name}</h3>
                            <div className="mt-6 px-4 py-2 bg-blue-600/80 text-white text-sm font-bold rounded-full uppercase tracking-wider">Your Pick</div>
                        </div>
                    </div>

                    {/* ORTA: VS YAZISI (Artık akışın içinde, kartları itiyor) */}
                    <div className="flex flex-col items-center justify-center z-30 shrink-0">
                        <div className="text-9xl font-black text-white mix-blend-overlay animate-pulse font-display drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">VS</div>
                    </div>

                    {/* SAĞ: RAKİP KARTI */}
                    <div className={`relative w-80 h-[480px] shrink-0 transition-all duration-700 transform transform-style-3d z-20 animate-in slide-in-from-right-20 duration-700
                        ${step === 'REVEAL' ? 'rotate-y-180' : 'rotate-y-0'} rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.5)]`}>
                        
                        {/* Arka Yüz (Kapalı) */}
                        <div className="absolute inset-0 w-full h-full bg-dark-800 border-4 border-gray-600 rounded-2xl flex items-center justify-center backface-hidden bg-[url('/assets/card-back-pattern.png')] bg-repeat opacity-90 shadow-inner">
                            <div className="text-8xl animate-spin text-gray-500">❓</div>
                        </div>

                        {/* Ön Yüz (Açık) */}
                        <div className={`absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br ${enemyStrat.color} p-1 backface-hidden rotate-y-0`}>
                             <div className="w-full h-full bg-dark-900/90 rounded-xl flex flex-col items-center justify-center p-8 text-center">
                                <div className="text-8xl mb-8 filter drop-shadow-2xl">{enemyStrat.icon}</div>
                                <h3 className="text-4xl font-bold text-white uppercase font-display">{enemyStrat.name}</h3>
                                <div className="mt-6 px-4 py-2 bg-red-600/80 text-white text-sm font-bold rounded-full uppercase tracking-wider">Enemy Pick</div>
                            </div>
                        </div>
                    </div>

                </div>
            )}

         </div>
      </div>
    </div>
  );
};

  const MarketView = React.memo(MarketViewComponent);

  const InboxView: React.FC<{
    newsFeed: NewsArticle[];
    playerMessages: PlayerMessage[];
    onReadMessage: (messageId: string) => void;
    onAcceptRequest: (message: PlayerMessage) => void;
    teams: TeamData[];
  }> = ({ newsFeed, playerMessages, onReadMessage, onAcceptRequest }) => {
    const [view, setView] = useState<'messages' | 'news'>('messages');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const sortedMessages = useMemo(() => [...playerMessages].sort((a, b) => (a.isRead ? 1 : 0) - (b.isRead ? 1 : 0) || b.date.year - a.date.year || (b.date.week ?? 0) - (a.date.week ?? 0)), [playerMessages]);
    const sortedNews = useMemo(() => [...newsFeed].sort((a, b) => b.date.year - a.date.year || (b.date.week ?? 0) - (a.date.week ?? 0)), [newsFeed]);

    const itemsToShow = view === 'messages' ? sortedMessages : sortedNews;
    const selectedItem = itemsToShow.find(item => item.id === selectedId);

    useEffect(() => {
        if (selectedId && selectedItem && 'isRead' in selectedItem && !selectedItem.isRead) {
            onReadMessage(selectedId);
        }
    }, [selectedId, selectedItem, onReadMessage]);
    
    useEffect(() => {
        setSelectedId(null);
    }, [view]);

    const unreadMessagesCount = playerMessages.filter(m => !m.isRead).length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold font-display text-white">Chat</h2>
                <div className="flex gap-1 bg-dark-950 p-1 rounded-lg">
                    <button onClick={() => setView('messages')} className={`relative flex items-center gap-2 px-4 py-1.5 rounded text-sm font-bold ${view === 'messages' ? 'bg-hextech-600 text-white' : 'text-gray-400 hover:bg-dark-800'}`}>
                        <MessageSquare size={16} /> Messages
                        {unreadMessagesCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{unreadMessagesCount}</span>}
                    </button>
                    <button onClick={() => setView('news')} className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-bold ${view === 'news' ? 'bg-hextech-600 text-white' : 'text-gray-400 hover:bg-dark-800'}`}>
                        <Newspaper size={16} /> News
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
                <div className="lg:col-span-1 bg-dark-900 border border-dark-800 rounded-xl p-2 flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {itemsToShow.length === 0 && <div className="text-center text-gray-500 italic py-10">Nothing to display.</div>}
                        {itemsToShow.map(item => (
                            <div key={item.id} onClick={() => setSelectedId(item.id)} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedId === item.id ? 'bg-dark-950' : 'hover:bg-dark-800/50'} ${('isRead' in item && !item.isRead) ? 'border-l-4 border-hextech-500' : ''}`}>
                                <div className="flex justify-between items-start">
                                    <p className={`font-bold ${('isRead' in item && !item.isRead) ? 'text-white' : 'text-gray-300'}`}>{ 'playerName' in item ? item.playerName : item.title }</p>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">{item.date.year} {item.date.split}</span>
                                </div>
                                <p className="text-sm text-gray-400 truncate">{ 'subject' in item ? item.subject : item.content }</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-2 bg-dark-900 border border-dark-800 rounded-xl p-8">
                    {selectedItem ? (
                        <div className="animate-fade-in">
                            {'playerName' in selectedItem && (
                                <div className="mb-4">
                                <p className="text-sm text-gray-400">From: <span className="font-bold text-white">{selectedItem.playerName}</span></p>
                                <p className="text-sm text-gray-400">Subject: <span className="font-bold text-white">{selectedItem.subject}</span></p>
                                </div>
                            )}
                            <h3 className="text-2xl font-bold text-hextech-300 mb-4">{selectedItem.title || selectedItem.subject}</h3>
                            <div className="prose prose-invert prose-p:text-gray-300 prose-p:leading-relaxed">
                                <p>{'body' in selectedItem ? selectedItem.body : selectedItem.content}</p>
                            </div>
                            {'involved' in selectedItem && (
                                <div className="mt-6 pt-4 border-t border-dark-700">
                                <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Involved Parties</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedItem.involved.map((p, i) => (
                                            <span key={i} className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.type === 'team' ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'}`}>{p.name}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {'type' in selectedItem && selectedItem.type === 'REQUEST' && (
                                <div className="mt-6 pt-4 border-t border-dark-700 text-center">
                                    <button 
                                      onClick={() => onAcceptRequest(selectedItem as PlayerMessage)}
                                  disabled={selectedItem.subject.includes('[Accepted]')}
                                      className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >{selectedItem.subject.includes('[Accepted]') ? 'Offer Accepted' : 'Accept Offer'}</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
                            <Mail size={48} className="mb-4" />
                        <h3 className="text-lg font-bold">Select an item</h3>
                        <p>Select a news item or message from the list on the left to read.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  };

  const DashboardView = () => {
    const { synergies, totalBonus, relationshipBonus } = getActiveSynergies(gameState.roster);

    return (
      <div className="space-y-8 animate-fade-in-up">
        <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-display font-bold text-white mb-1">
              {activeTeamData?.name}
            </h2>
            <div className="flex gap-3 text-sm text-gray-400 items-center">
              <span>Power: <span className="text-white font-bold">{getTeamPower()}</span></span>
              <span className="text-gray-600">|</span>
              <span>Synergy: <span className="text-cyan-400 font-bold">+{totalBonus}</span> {relationshipBonus !== 0 && <span className={`text-xs font-mono ${relationshipBonus > 0 ? 'text-green-400' : 'text-red-400'}`}>({relationshipBonus > 0 ? '+' : ''}{relationshipBonus})</span>}</span>
              <span className="text-gray-600">|</span>
              <span>Coins: <span className="text-gold-400 font-bold">{gameState.coins}</span></span>
              <span className="text-gray-600">|</span>
              <span>Season: <span className="text-white font-bold">{gameState.currentSeason}</span></span>
            </div>
            {synergies.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {synergies.map(s => (
                  <div key={s.league} className="bg-cyan-900/50 border border-cyan-700/50 px-2.5 py-1 rounded-full text-xs">
                    <span className="font-bold text-cyan-300">{s.league} ({s.count})</span>
                    <span className="text-cyan-400 font-mono ml-1.5">+{s.bonus}</span>
                  </div>
                ))}
                {relationshipBonus > 0 && (
                  <div className="bg-green-900/50 border border-green-700/50 px-2.5 py-1 rounded-full text-xs">
                    <span className="font-bold text-green-300">Friendships</span><span className="text-green-400 font-mono ml-1.5">+{relationshipBonus}</span>
                  </div>)}
                {relationshipBonus < 0 && (
                  <div className="bg-red-900/50 border border-red-700/50 px-2.5 py-1 rounded-full text-xs">
                    <span className="font-bold text-red-300">Conflicts</span><span className="text-red-400 font-mono ml-1.5">{relationshipBonus}</span>
                  </div>)}
              </div>
            )}
          </div>
          <TeamLogo team={activeTeamData} size="w-16 h-16" />
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
              <h3 className="text-lg font-bold text-white mb-4">Finances</h3>
              <div className="flex justify-between items-center bg-dark-950 p-3 rounded mb-2">
                  <span className="text-gray-400">Sponsor</span>
                  <span className="text-gold-400 font-bold">{currentSponsor ? currentSponsor.name : 'None'}</span>
              </div>
              <button onClick={() => setTab('economy')} className="w-full py-2 bg-dark-800 hover:bg-dark-700 text-white rounded text-sm font-bold">
                  Manage Sponsors
              </button>
          </div>
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
              {gameState.stage === 'PRE_SEASON' 
                ? (isRosterComplete() ? 'Roster complete. Ready to start.' : 'Complete your roster to start season.') 
                : `Week ${gameState.week} Matches`}
            </p>
            
            <button 
              onClick={() => {
                  if (gameState.stage === 'PRE_SEASON') {
                      if (isRosterComplete()) setTab('play');
                      else setTab('market');
                  } else {
                      setTab('play');
                  }
              }}
              className="px-8 py-3 bg-hextech-600 hover:bg-hextech-500 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              {gameState.stage === 'PRE_SEASON' 
                  ? (isRosterComplete() ? 'Start Season' : 'Go to Market') 
                  : 'Play Match'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const processMatchPlayerStats = (
    currentRoster: Record<Role, PlayerCard | null>,
    currentInventory: PlayerCard[],
    matchStats: any[]
  ) => {
    return { newRoster: currentRoster, newInventory: currentInventory };
  };

  const handleOfferResponse = (offer: IncomingOffer, accepted: boolean) => {
    if (accepted) {
      setGameState(prev => {
        const newRoster = { ...prev.roster };
        const newInventory = [...prev.inventory];
        let playerFound = false;

        for (const role in newRoster) {
          if (newRoster[role as Role]?.id === offer.player.id) {
            newRoster[role as Role] = null;
            playerFound = true;
            break;
          }
        }

        if (!playerFound) {
          const inventoryIndex = newInventory.findIndex(p => p.id === offer.player.id);
          if (inventoryIndex > -1) {
            newInventory.splice(inventoryIndex, 1);
          }
        }

        const newAiRosters = { ...prev.aiRosters };
        if (!newAiRosters[offer.offeringTeamId]) newAiRosters[offer.offeringTeamId] = {};
        newAiRosters[offer.offeringTeamId][offer.player.role] = { ...offer.player, team: offer.offeringTeamName };

        return {
          ...prev,
          coins: prev.coins + offer.offerAmount,
          roster: newRoster,
          inventory: newInventory,
          aiRosters: newAiRosters
        };
      });
      showNotification('success', `${offer.player.name} has been sold to ${offer.offeringTeamName} for ${offer.offerAmount}G.`);
    } else {
      showNotification('error', `Offer for ${offer.player.name} from ${offer.offeringTeamName} has been rejected.`);
    }
    setIncomingOffers(prev => prev.filter(o => o.player.id !== offer.player.id));
  };

  const RosterView = () => (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold font-display text-white">Manage Roster</h2>
          <div className="text-sm text-gray-400">
             Drag & Drop functionality coming soon. Click to assign.
          </div>
       </div>

       {incomingOffers.length > 0 && gameState.stage === 'OFF_SEASON' && (
        <div className="bg-dark-950 border-2 border-gold-500/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gold-300 mb-4">Incoming Transfer Offers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingOffers.map(offer => (
              <div key={offer.player.id} className="bg-dark-900 border border-dark-700 rounded-xl p-4 flex flex-col gap-3">
                <div>
                  <p className="text-sm text-gray-400">Offer for <span className="font-bold text-white">{offer.player.name}</span> (OVR {offer.player.overall})</p>
                  <p className="text-xs">From: <span className="font-bold text-white">{offer.offeringTeamName}</span></p>
                </div>
                <div className="text-center font-mono text-lg font-bold text-gold-400 bg-dark-950 py-2 rounded-lg">
                  {offer.offerAmount} G
                </div>
                <div className="text-xs text-center text-gray-400 italic mt-1">
                  "{offer.playerOpinion}"
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleOfferResponse(offer, true)} className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-sm">
                    Accept
                  </button>
                  <button onClick={() => handleOfferResponse(offer, false)} className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-sm">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
             {(Object.values(Role) as Role[]).map(role => {
                const player = gameState.roster[role];
                return (
                   <div key={role} className="relative">
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 -translate-x-full text-xs font-bold text-gray-500 w-8 text-right">
                         {role}
                      </div>
                      {player ? (
                         <div>
                           <Card 
                             player={player} 
                             team={activeLeague.teams.find(t => t.shortName === player.team)}
                             compact
                             isOwned
                             actionLabel="Unassign"
                             onClick={() => {
                               setGameState(prev => ({
                                 ...prev,
                                   roster: { ...prev.roster, [role]: null },
                                   inventory: [...prev.inventory, player]
                               }));
                             }}
                           />
                           <div className="flex gap-2 mt-1.5 pl-16">
                              {player.relationships?.map(rel => {
                                const otherPlayer = Object.values(gameState.roster).find(p => p?.id === rel.targetPlayerId);
                                if (!otherPlayer) return null;
                                
                                if (rel.type === 'FRIENDSHIP') {
                                  return <div key={rel.targetPlayerId} className="flex items-center gap-1.5 text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded-full"><Heart size={12} className="text-green-400" /> Friend: <span className="font-bold">{otherPlayer.name}</span></div>
                                }
                                if (rel.type === 'CONFLICT') {
                                  return <div key={rel.targetPlayerId} className="flex items-center gap-1.5 text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded-full"><HeartCrack size={12} className="text-red-400" /> Conflict: <span className="font-bold">{otherPlayer.name}</span></div>
                                }
                                return null;
                              })}
                           </div>
                         </div>
                         ) : (<div className="h-16 border-2 border-dashed border-dark-700 rounded-lg flex items-center justify-center text-gray-600 font-bold bg-dark-900/50">Empty Slot</div>
                      )}
                   </div>
                )
             })}
          </div>

          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 flex flex-col h-[600px]">
             <h3 className="text-lg font-bold text-white mb-4 px-2">Bench</h3>
             <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {gameState.inventory.filter(p => {
                  const currentRoster = Object.values(gameState.roster) as (PlayerCard | null)[];
                  return !currentRoster.some(rp => rp?.id === p.id);
                }).map(p => (
                  <div key={p.id} className="flex items-center gap-2">
                    <div
                      onClick={() => assignToRoster(p)}
                      className="flex-1 p-3 bg-dark-950 border border-dark-800 rounded-lg cursor-pointer hover:border-hextech-500 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-white">{p.name}</span>
                          <div className="text-xs text-gray-400">OVR: {p.overall}</div>
                        </div>
                        <span className="text-xs text-gray-500">{p.role}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSellPlayer(p)}
                      className="px-3 py-2 bg-red-800/50 text-red-300 hover:bg-red-700/50 rounded-lg text-xs font-bold transition-colors"
                      title="Sell Player"
                    >
                      Sell
                    </button>
                  </div>
                ))}
                {gameState.inventory.length === 0 && <div className="text-gray-500 text-center italic mt-10">No players on bench.</div>}
             </div>
          </div>
       </div>
    </div>
  );

  const handleSellPlayer = (player: PlayerCard) => {
    if (gameState.stage !== 'OFF_SEASON') {
      showNotification('error', 'You cannot sell players mid-season.');
      return;
    }

    const sell = () => {
      const salePrice = Math.floor(player.salary * 1.5 + player.overall * 10); 
      setGameState(prev => ({
        ...prev,
        coins: prev.coins + salePrice,
        inventory: prev.inventory.filter(p => p.id !== player.id),
        freeAgents: [...prev.freeAgents, { ...player, team: 'FA', contractDuration: 0, price: 0 }]
      }));
      showNotification('success', `${player.name} has been sold for ${salePrice}G.`);
    };

    if ((player.morale ?? 50) > 75) {
      const salaryReduction = Math.floor(player.salary * 0.25);
      const newSalary = player.salary - salaryReduction;
      if (window.confirm(`${player.name} has high morale and wants to stay! They are willing to accept a new salary of ${newSalary}G (a ${salaryReduction}G reduction). Do you want to accept this new salary? (Press 'Cancel' to sell the player instead)`)) {
        setGameState(prev => ({
          ...prev,
          inventory: prev.inventory.map(p => p.id === player.id ? { ...p, salary: newSalary } : p)
        }));
        showNotification('success', `${player.name}'s salary has been reduced to ${newSalary}G!`);
      } else {
        sell();
      }
    } else {
      if (window.confirm(`Are you sure you want to sell ${player.name}?`)) {
        sell();
      }
    }
  };

  const assignToRoster = (player: PlayerCard) => {
    setGameState(prev => {
      if (prev.roster[player.role]) {
        showNotification('error', `The ${player.role} position is already filled.`);
        return prev;
      }
      
      return {
        ...prev,
        roster: { ...prev.roster, [player.role]: player },
        inventory: prev.inventory.filter(p => p.id !== player.id)
      };
    });
    showNotification('success', `${player.name} assigned to ${player.role}.`);
  };

  const handleReadMessage = (messageId: string) => {
    setGameState(prev => ({
        ...prev,
        playerMessages: prev.playerMessages.map(msg => 
            msg.id === messageId ? { ...msg, isRead: true } : msg
        )
    }));
  };

  const handleAcceptRenewalRequest = (message: PlayerMessage) => {
    const player = [...Object.values(gameState.roster), ...gameState.inventory].find(p => p?.id === message.playerId);

    if (!player) {
      showNotification('error', 'Player not found in your team.');
      return;
    }

    let newSalary;
    if (player.overall >= 88) {
      newSalary = Math.floor(player.salary * 1.05);
    } else {
      newSalary = Math.floor(player.salary * 0.95);
    }

    const updatedPlayer = { ...player, contractDuration: 2, salary: newSalary };

    setGameState(prev => {
      const newRoster = { ...prev.roster };
      const newInventory = [...prev.inventory];

      const rosterRole = Object.keys(newRoster).find(role => newRoster[role as Role]?.id === player.id) as Role | undefined;
      if (rosterRole) {
        newRoster[rosterRole] = updatedPlayer;
      } else {
        const inventoryIndex = newInventory.findIndex(p => p.id === player.id);
        if (inventoryIndex > -1) {
          newInventory[inventoryIndex] = updatedPlayer;
        }
      }

      const newMessages = prev.playerMessages.map(m => m.id === message.id ? { ...m, isRead: true, subject: `[Accepted] ${m.subject}` } : m);

      return { ...prev, roster: newRoster, inventory: newInventory, playerMessages: newMessages };
    });

    showNotification('success', `${player.name}'s contract has been extended for 2 years with a new salary of ${newSalary}G!`);
  };

  const ScheduleView = () => {
    const [filterYear, setFilterYear] = useState<number>(gameState.year);
    const [viewId, setViewId] = useState<string>('CURRENT');
    
    const historyList = useMemo(() => Array.isArray(gameState.matchHistory) ? gameState.matchHistory : [], [gameState.matchHistory]);

    const availableYears = useMemo(() => {
        const years = new Set([gameState.year]); 
        historyList.forEach(h => years.add(h.year));
        return Array.from(years).sort((a, b) => b - a);
    }, [gameState.year, historyList]);

    const tabs = useMemo(() => {
        const yearHistory = historyList.filter(h => h.year === filterYear); 
        const tabsList = [];

        yearHistory.forEach(h => {
            let displayTitle = h.title;
            let derivedStage = 'PLAYOFFS';

            if (h.title.includes('MSI')) {
                if (h.title.includes('Play-In')) {
                    displayTitle = "MSI Play-In";
                    derivedStage = 'MSI_PLAY_IN';
                } else {
                    displayTitle = "MSI Bracket";
                    derivedStage = 'MSI_BRACKET';
                }
            } else if (h.title.includes('Play-In')) {
                derivedStage = 'PLAY_IN';
            }

            let viewType = h.viewType;
            if (displayTitle.includes('Regular') || displayTitle.includes('Season')) viewType = 'LEAGUE';
            else viewType = 'BRACKET';

            tabsList.push({
                ...h,
                title: displayTitle,
                stage: derivedStage,
                viewType: viewType
            });
        });

        if (filterYear === gameState.year) {
            let currentTitle = "Current Stage";
            if (gameState.stage === 'MSI_PLAY_IN') currentTitle = "MSI Play-In (Current)";
            else if (gameState.stage === 'MSI_BRACKET') currentTitle = "MSI Bracket (Current)";
            else if (gameState.stage === 'LPL_SPLIT_2_GROUPS') currentTitle = "Ascend & Nirvana Groups";
            else if (gameState.stage === 'LPL_SPLIT_3_GROUPS') currentTitle = "Road to Worlds (Split 3)";
            else if (gameState.stage.includes('PLAYOFFS')) currentTitle = "Playoffs (Current)";
            else if (gameState.stage.includes('GROUP')) currentTitle = "Regular Season (Current)";
            let cViewType: HistoryViewType = 'LEAGUE';
            if (['PLAYOFFS', 'MSI_BRACKET', 'MSI_PLAY_IN', 'PLAY_IN', 'LPL_SPLIT_2_LCQ'].includes(gameState.stage)) {
                cViewType = 'BRACKET';
            } else {
                cViewType = 'LEAGUE';
            }

            tabsList.push({ 
                id: 'CURRENT', 
                title: currentTitle, 
                viewType: cViewType,
                schedule: gameState.schedule,
                playoffs: gameState.playoffMatches,
                standings: gameState.standings,
                stage: gameState.stage
            });
        }

        return tabsList;
    }, [filterYear, gameState.year, gameState.stage, historyList, gameState.schedule, gameState.playoffMatches, gameState.standings]);

    useEffect(() => {
        if (!tabs.some(t => t.id === viewId) && tabs.length > 0) setViewId(tabs[0].id);
    }, [filterYear, tabs, viewId]);

    const activeData = tabs.find(t => t.id === viewId);

    const displayTeams = useMemo(() => {
        if (!activeData || !activeData.standings) return allTeams;
        const combinedTeams = [...allTeams];
        const teamIds = new Set(allTeams.map(t => t.id));
        activeData.standings.forEach((s: any) => {
            if (!teamIds.has(s.teamId)) {
                combinedTeams.push({ id: s.teamId, name: s.name, shortName: s.name, tier: 'C', region: 'KR', logoUrl: '', colors: { primary: '#333', secondary: '#000' } } as any);
                teamIds.add(s.teamId);
            }
        });
        return combinedTeams;
    }, [activeData, allTeams]);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-end">
            <h2 className="text-2xl font-bold font-display text-white">Schedule & Results</h2>
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Year:</span>
                <select value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))} className="bg-dark-950 border border-dark-700 text-white text-sm font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:border-hextech-500 cursor-pointer">
                    {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
            </div>
        </div>
        
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide border-b border-dark-800">
          {tabs.length === 0 && <div className="text-gray-500 text-sm py-2 px-2">No records found.</div>}
          {tabs.map((item: any) => (
            <button key={item.id} onClick={() => setViewId(item.id)} className={`whitespace-nowrap px-4 py-2 rounded-t-lg text-sm font-bold transition-all border-t border-x border-b-0 ${viewId === item.id ? 'bg-hextech-600/20 text-hextech-300 border-hextech-500' : 'bg-dark-900 text-gray-500 border-dark-700 hover:bg-dark-800 hover:text-gray-300'}`}>
              {item.title}
            </button>
          ))}
        </div>
  
        <div className="mt-4 min-h-[400px]">
           {!activeData && <div className="text-center text-gray-500 py-10">Select a tab.</div>}

           {activeData && activeData.viewType === 'LIST' && (
               <MatchListView matches={activeData.playoffs || []} teams={displayTeams} userTeamId={gameState.teamId} />
           )}

           {activeData && activeData.viewType === 'BRACKET' && (
               <div className="animate-fade-in overflow-x-auto">
                   <BracketView 
                      matches={activeData.playoffs || []} 
                      stage={activeData.stage} 
                      teams={displayTeams} 
                      standings={activeData.standings || []} 
                      userTeamId={gameState.teamId} 
                      isCurrent={viewId === 'CURRENT'} 
                   />
               </div>
           )}

           {activeData && activeData.viewType === 'LEAGUE' && activeData.schedule && (
                <div className="space-y-8">
                    {Array.from(new Set(activeData.schedule.map((m: any) => m.week))).sort((a: any, b: any) => a - b).map((week: any) => (
                        <div key={week} className="space-y-4">
                            <h3 className="text-xl font-bold font-display text-hextech-300 border-b-2 border-hextech-700/50 pb-2">Week {week}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {(activeData.schedule as any[]).filter(m => m.week === week).map((m: ScheduledMatch) => {
                                    const teamA = displayTeams.find(t => t.id === m.teamAId);
                                    const teamB = displayTeams.find(t => t.id === m.teamBId);
                                    const isUserMatch = m.teamAId === gameState.teamId || m.teamBId === gameState.teamId;
                                    const winner = m.winnerId ? (m.winnerId === teamA?.id ? teamA : teamB) : null;
                                    const loser = m.winnerId ? (m.winnerId === teamA?.id ? teamB : teamA) : null;
                                    return (
                                        <div key={m.id} className={`bg-dark-900 border rounded-xl p-4 flex flex-col gap-3 transition-all hover:border-dark-600 ${isUserMatch ? 'border-blue-500/30' : 'border-dark-700'}`}>
                                            <div className="flex justify-between items-center">
                                                <div className={`flex items-center gap-3 flex-1 justify-end transition-opacity ${loser === teamA ? 'opacity-40' : 'opacity-100'}`}>
                                                    <span className={`font-bold text-sm ${winner === teamA ? 'text-white' : 'text-gray-300'}`}>{teamA?.shortName || m.teamAId}</span>
                                                    <TeamLogo team={teamA} size="w-8 h-8" />
                                                </div>
                                                <div className="text-center px-4">
                                                    <span className={`font-mono text-xl font-bold ${m.played ? 'text-white' : 'text-gray-600'}`}>
                                                        {m.played ? `${m.seriesScoreA} - ${m.seriesScoreB}` : 'VS'}
                                                    </span>
                                                </div>
                                                <div className={`flex items-center gap-3 flex-1 justify-start transition-opacity ${loser === teamB ? 'opacity-40' : 'opacity-100'}`}>
                                                    <TeamLogo team={teamB} size="w-8 h-8" />
                                                    <span className={`font-bold text-sm ${winner === teamB ? 'text-white' : 'text-gray-300'}`}>{teamB?.shortName || m.teamBId}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
           )}
        </div>
      </div>
    );
  };

  const StandingsView = () => {
    let groupsToShow: string[] = ['A', 'B'];
    
    if (activeLeague.settings.format === 'LPL') {
        if (gameState.stage === 'LPL_SPLIT_2_GROUPS') {
            groupsToShow = ['Ascend', 'Nirvana'];
        } else if (gameState.stage === 'LPL_SPLIT_3_GROUPS') {
             groupsToShow = ['A'];
        } else {
            groupsToShow = ['A', 'B', 'C', 'D'];
        }
    }

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-display text-white">Standings</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {groupsToShow.map(group => (
            <div key={group} className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
              <div className="p-4 bg-dark-950 border-b border-dark-800 font-bold text-white flex justify-between">
                <span>Group {group}</span>
                {gameState.winnersGroup === group && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Winners Group</span>}
              </div>
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
                    .sort((a, b) => b.wins - a.wins || (b.gameWins - b.gameLosses) - (a.gameWins - a.gameLosses))
                    .map((s, i) => (
                      <tr key={s.teamId} className={s.teamId === gameState.teamId ? 'bg-blue-900/10' : ''}>
                        <td className="px-4 py-3 font-bold text-white flex items-center gap-3">
                          <span className="text-gray-500 font-mono w-4">{i + 1}</span>
                          <TeamLogo
                            team={activeLeague.teams.find(t => t.id === s.teamId)}
                            streak={s.streak} />
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
  };

  const PlayView = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8 animate-fade-in w-full">
       
       {/* 1. PRE-SEASON */}
       {gameState.stage === 'PRE_SEASON' ? (
          <div className="text-center space-y-6 max-w-md bg-dark-900/50 p-8 rounded-2xl border border-dark-700">
             <Trophy size={64} className="mx-auto text-hextech-500 mb-4 animate-pulse" />
             <div>
                <h2 className="text-3xl font-display font-bold text-white">Pre-Season</h2>
                <p className="text-gray-400 mt-2">Complete your roster training and market activities before starting the split.</p>
             </div>
             <button onClick={startSeason} className="btn-hextech w-full rounded-xl shadow-xl flex items-center justify-center gap-3 text-lg py-4">
                <Play fill="currentColor" size={24} /> Start Season
             </button>
          </div>
       ) : gameState.stage === 'OFF_SEASON' ? (
           <div className="text-center space-y-6 max-w-md bg-dark-900/50 p-8 rounded-2xl border border-dark-700">
             <RotateCcw size={64} className="mx-auto text-hextech-500 mb-4" />
             <h2 className="text-3xl font-display font-bold text-white">Off-Season</h2>
             <p className="text-gray-400">The season has concluded.</p>
             <button onClick={startSeason} className="btn-hextech w-full py-4 text-lg">Start Season {gameState.currentSeason! + 1}</button>
          </div>
       ) : (
          <div className="w-full max-w-4xl bg-dark-900 border border-dark-800 rounded-2xl p-8 text-center space-y-8 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-hextech-500 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.8)]"></div>
             
             <div className="flex justify-between items-center text-xs font-bold text-hextech-400 uppercase tracking-widest border-b border-white/5 pb-4">
                <span>{gameState.stage.replace(/_/g, ' ')}</span>
                <span>Week {gameState.week} • Day {gameState.currentDay}</span>
             </div>
             
             {(() => {

                 let nextUserMatch: any;
                 let isFuture = false;
                 let isTBD = false;

                 if (gameState.stage.includes('GROUP') || gameState.stage.includes('SPLIT')) {
                    nextUserMatch = gameState.schedule.find(m => !m.played && (m.teamAId === gameState.teamId || m.teamBId === gameState.teamId));
                    
                    if (nextUserMatch && nextUserMatch.round > gameState.currentDay) {
                        isFuture = true;
                    }
                 } 
                 else {
                    nextUserMatch = gameState.playoffMatches.find(m => !m.winnerId && (m.teamAId === gameState.teamId || m.teamBId === gameState.teamId));
                    
                    if (nextUserMatch && (!nextUserMatch.teamAId || !nextUserMatch.teamBId)) {
                        isTBD = true;
                    }
                 }

                 const anyMatchToday = gameState.schedule.some(m => m.round === gameState.currentDay && !m.played) || 
                                       gameState.playoffMatches.some(m => !m.winnerId && m.teamAId && m.teamBId);
                 
                 const isSeasonOver = !anyMatchToday && !nextUserMatch && 
                                      ((gameState.playoffMatches.length > 0 && gameState.playoffMatches.every(m => m.winnerId)));

                 if (!nextUserMatch || isFuture || isTBD) {
                     let message = "No match scheduled for your team today.";
                     let btnText = "Simulate Day";
                     let btnAction = () => skipToNextMatch();

                     if (isSeasonOver) {
                         message = "Season concluded. Ready to advance?";
                         btnText = "Finish Season";
                         btnAction = () => advanceToNextStage();
                     } else if (isTBD) {
                         message = "Waiting for opponent to be determined...";
                         btnText = "Simulate Other Matches";
                     } else if (isFuture) {
                         message = `Your next match is in Round ${nextUserMatch.round}. (Current: ${gameState.currentDay})`;
                         btnText = "Simulate to Match Day";
                     }

                     return (
                        <div className="py-12 animate-in fade-in">
                            <div className="text-2xl text-gray-400 mb-8 font-light">{message}</div>
                            
                            {/* Eğer bugün oynanacak başka maçlar varsa Simüle etme butonu göster */}
                            {(anyMatchToday || isSeasonOver) && (
                                <button 
                                onClick={btnAction}
                                disabled={isPlayingMatch}
                                className="px-10 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 mx-auto shadow-lg hover:shadow-xl"
                                >
                                {isPlayingMatch ? 'Processing...' : <><FastForward size={24} /> {btnText}</>}
                                </button>
                            )}
                            
                            {/* Eğer bugün hiç maç yoksa ve kullanıcı maçı da gelecekteyse, otomatik gün atla */}
                            {!anyMatchToday && !isSeasonOver && isFuture && (
                                <div className="text-yellow-500">Wait... Automatically advancing day... (Click Simulate if stuck)</div>
                            )}
                        </div>
                     );
                 }
                 
                 const opponentId = nextUserMatch.teamAId === gameState.teamId ? nextUserMatch.teamBId : nextUserMatch.teamAId;
                 const opponent = allTeams.find(t => t.id === opponentId);
                 const myTeam = activeTeamData;

                 return (
                    <div className="animate-in zoom-in duration-500">
                        <div className="flex items-center justify-center gap-12 py-6 mb-8">
                            {/* MY TEAM */}
                            <div className="text-center group">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <TeamLogo team={myTeam} size="w-32 h-32" className="mx-auto mb-4 relative z-10 shadow-2xl rounded-full" />
                                </div>
                                <h3 className="text-2xl font-display font-bold text-white tracking-wider">{myTeam?.shortName}</h3>
                            </div>

                            {/* VS */}
                            <div className="flex flex-col items-center">
                                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-600 font-display italic">VS</div>
                                <div className="text-xs font-bold text-hextech-500 bg-hextech-900/30 px-3 py-1 rounded-full mt-2 border border-hextech-500/30">
                                    {nextUserMatch.isBo5 ? 'BO5 SERIES' : 'BO3 SERIES'}
                                </div>
                            </div>

                            {/* OPPONENT */}
                            <div className="text-center group">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-red-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <TeamLogo team={opponent} size="w-32 h-32" className="mx-auto mb-4 relative z-10 shadow-2xl rounded-full grayscale-[0.3] group-hover:grayscale-0 transition-all" />
                                </div>
                                <h3 className="text-2xl font-display font-bold text-white tracking-wider">{opponent?.shortName}</h3>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex flex-col gap-4 items-center">
                            <button 
                                onClick={initiateMatch}
                                disabled={isPlayingMatch}
                                className="btn-hextech w-full max-w-md text-2xl py-5 shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:shadow-[0_0_60px_rgba(6,182,212,0.5)] scale-100 hover:scale-105 transition-transform"
                            >
                                {isPlayingMatch ? 'Loading...' : <span className="flex items-center justify-center gap-3"><Play fill="currentColor" /> ENTER DRAFT</span>}
                            </button>
                            
                            <button 
                                onClick={skipToNextMatch}
                                disabled={isPlayingMatch}
                                className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <SkipForward size={14} /> Quick Simulate (Skip Draft)
                            </button>
                        </div>
                    </div>
                 )
             })()}
          </div>
       )}
    </div>
  );

  if (view === 'MENU') {
    return <MainMenu onNewGame={handleNewGame} onContinue={handleContinueGame} hasSave={hasSaveFile} />;
  }

  const unreadMessagesCount = gameState.playerMessages.filter(m => !m.isRead).length;

  return (
    <Layout 
      currentTab={tab} 
      onTabChange={setTab} 
      coins={gameState.coins} 
      week={gameState.week}
      teamData={activeTeamData}
      managerName={`${gameState.managerName} (${gameState.year} ${gameState.currentSplit})`}
      unreadMessages={unreadMessagesCount}
    >
      {/* ONBOARDING MODU: Yeni oyun başlatıldığında */}
      {view === 'ONBOARDING' && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {tab === 'economy' && (
          <SponsorsView 
              currentSponsor={currentSponsor}
              onSignSponsor={handleSignSponsor}
              userTeam={activeTeamData} // <--- BU SATIRI EKLE
          />
      )}

      {isDrafting && draftMatchInfo && activeTeamData && (
          <DraftPhase 
              userTeam={activeTeamData}
              enemyTeam={allTeams.find(t => t.id === draftMatchInfo.opponentId)!}
              onDraftComplete={handleDraftComplete}
          />
      )}
      
      {/* OYUN MODU: Onboarding bittiğinde veya devam et dendiğinde */}
      {view === 'GAME' && (
        <>
          {/* Simülasyon Ekranı */}
          {isSimulating && pendingSimResult && activeTeamData && (
            <MatchSimulationView 
               userTeam={activeTeamData}
               enemyTeam={allTeams.find((t: TeamData) => t.id === pendingSimResult.opponentId)}
               userRoster={gameState.roster}
               enemyRoster={gameState.aiRosters[pendingSimResult.opponentId] || {}} 
               result={pendingSimResult.userResult}
               onComplete={() => finalizeDaySimulation(pendingSimResult.userResult)}
            />
          )}
          
          {/* Modallar */}
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

          {retiredPlayerModal && (
            <RetiredPlayerModal
              player={retiredPlayerModal}
              isOpen={!!retiredPlayerModal}
              onClose={() => setRetiredPlayerModal(null)}
              onHireAsCoach={() => handleHireRetired(retiredPlayerModal, 'coach')}
              onLureBack={() => handleHireRetired(retiredPlayerModal, 'player')}
              currentCoins={gameState.coins} />
          )}

          {/* Bildirimler */}
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

          {/* Sekmeler (Tabs) */}
          {tab === 'dashboard' && <DashboardView />}
          {tab === 'roster' && <RosterView />}
          {tab === 'training' && <TrainingView roster={gameState.roster} inventory={gameState.inventory} coins={gameState.coins} trainingSlotsUsed={gameState.trainingSlotsUsed} onTrainPlayer={handleTraining} />}
          {tab === 'market' && <MarketView />}
          {tab === 'schedule' && <ScheduleView />}
          {tab === 'standings' && <StandingsView />}
          {tab === 'stats' && <TeamStatsView 
            teams={activeLeague.teams} 
            userTeamId={gameState.teamId} 
            userRoster={gameState.roster} 
            aiRosters={gameState.aiRosters}
            getTeamPower={getTeamPower}
            getActiveSynergies={getActiveSynergies} />}
          {tab === 'play' && <PlayView />}
          {tab === 'inbox' && <InboxView newsFeed={gameState.newsFeed} playerMessages={gameState.playerMessages} onReadMessage={handleReadMessage} teams={allTeams} />}
        </>
      )}
    </Layout>
  );
}