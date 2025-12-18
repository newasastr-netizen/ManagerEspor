import React, { useState, useMemo } from 'react';
import { LEAGUES, LeagueKey } from '../data/leagues';
import { TeamData, Difficulty, Role } from '../src/types/types';
import { LeagueMap } from './LeagueMap';
import { TeamLogo, getTeamTier } from './TeamLogo';
import { ChevronRight, ChevronLeft, User, Shield, Sword, BarChart3, Users, CheckCircle2 } from 'lucide-react';

interface OnboardingProps {
  onComplete: (name: string, team: TeamData, league: LeagueKey, difficulty: Difficulty) => void;
}

const getDeterministicFanbase = (teamId: string) => {
    let hash = 0;
    for (let i = 0; i < teamId.length; i++) {
        hash = teamId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const value = (Math.abs(hash) % 140) / 10 + 1.0;
    return value.toFixed(1);
};

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedLeague, setSelectedLeague] = useState<LeagueKey | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);
  const [managerName, setManagerName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Normal');

  const activeLeagueData = selectedLeague ? LEAGUES[selectedLeague] : null;

  // 1. Takım Sıralaması
  const sortedTeams = useMemo(() => {
      if (!activeLeagueData) return [];
      return [...activeLeagueData.teams].sort((a, b) => {
          const tierOrder = { 'S': 0, 'A': 1, 'B': 2, 'C': 3, 'D': 4 };
          // @ts-ignore
          return tierOrder[getTeamTier(a.id)] - tierOrder[getTeamTier(b.id)];
      });
  }, [activeLeagueData]);

  // 2. Seçilen Takımın Oyuncuları
  const teamPlayers = useMemo(() => {
      if (!selectedTeam || !activeLeagueData) return [];
      
      const targetId = selectedTeam.id.toLowerCase().trim();
      const targetName = selectedTeam.name.toLowerCase().trim();
      // @ts-ignore
      const targetShort = selectedTeam.shortName ? selectedTeam.shortName.toLowerCase().trim() : '';

      return activeLeagueData.players.filter(p => {
          const pTeam = p.team.toLowerCase().trim();
          return (
              pTeam === targetId ||           
              pTeam === targetName ||         
              (targetShort && pTeam === targetShort) || 
              targetName.includes(pTeam) ||   
              pTeam.includes(targetName)      
          );
      });
  }, [selectedTeam, activeLeagueData]);

  // 3. Takım Gücü (Overall)
  const teamOverall = useMemo(() => {
      if (teamPlayers.length === 0) return 0;
      const totalRating = teamPlayers.reduce((acc, p) => acc + p.overall, 0);
      return Math.round(totalRating / teamPlayers.length);
  }, [teamPlayers]);

  const fanbaseCount = selectedTeam ? getDeterministicFanbase(selectedTeam.id) : "0";

  // --- Handlers ---

  const handleNext = () => {
    if (step === 1 && selectedLeague) setStep(2);
    else if (step === 2 && selectedTeam) setStep(3);
    else if (step === 3 && managerName) onComplete(managerName, selectedTeam!, selectedLeague!, difficulty);
  };

  const handleBack = () => {
    if (step === 2) {
        setSelectedLeague(null);
        setStep(1);
    } else if (step > 1) {
        setStep(step - 1);
    }
  };

  // --- Render ---

  const renderTeamSelection = () => {
      if (!activeLeagueData) return null;

      return (
        <div className="flex h-full w-full overflow-hidden">
            {/* SOL PANEL: TAKIM LİSTESİ */}
            <div className="w-2/3 p-8 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="flex items-center gap-4 mb-8 shrink-0">
                    <button onClick={handleBack} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-4xl font-display font-bold text-white">Select Team</h2>
                        <p className="text-gray-400">Choose a team from {activeLeagueData.name} to manage.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
                    {sortedTeams.map((team, index) => {
                         const isSelected = selectedTeam?.id === team.id;
                         const tier = getTeamTier(team.id);
                         return (
                             <button
                                key={team.id}
                                onClick={() => setSelectedTeam(team)}
                                style={{ animationDelay: `${index * 50}ms` }}
                                className={`
                                    relative p-4 rounded-xl border-2 text-left transition-all duration-300 group hover:-translate-y-1 animate-fade-in-up
                                    ${isSelected 
                                        ? 'bg-blue-900/40 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                                        : 'bg-dark-800 border-dark-700 hover:border-dark-500 hover:bg-dark-750'}
                                `}
                             >
                                 <div className="flex items-center justify-between mb-3">
                                     <TeamLogo team={team} size="w-12 h-12" />
                                     <span className={`text-xs font-bold px-2 py-1 rounded border ${
                                         tier === 'S' ? 'bg-gold-500/20 text-gold-400 border-gold-500/50' : 
                                         tier === 'A' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 
                                         tier === 'B' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                                     }`}>
                                         TIER {tier}
                                     </span>
                                 </div>
                                 <div className="font-bold text-white text-lg mb-1">{team.name}</div>
                                 <div className="text-xs text-gray-500 font-mono">EST. 2024</div>
                                 
                                 {isSelected && (
                                     <div className="absolute top-2 right-2 text-blue-500 animate-in zoom-in">
                                         <CheckCircle2 size={20} fill="currentColor" className="text-white" />
                                     </div>
                                 )}
                             </button>
                         )
                    })}
                </div>
            </div>

            {/* SAĞ PANEL: TAKIM DETAYLARI */}
            <div className="w-1/3 bg-dark-950 border-l border-dark-800 flex flex-col relative shadow-2xl h-full">
                {selectedTeam ? (
                    <div className="flex flex-col h-full animate-in slide-in-from-right duration-500">
                        
                        {/* Üst Kısım */}
                        <div className="p-8 pb-4 text-center border-b border-white/5 relative overflow-hidden shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>
                            <div className="relative z-10 transform transition-transform duration-500 hover:scale-105">
                                <TeamLogo team={selectedTeam} size="w-32 h-32 mx-auto mb-4 drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]" />
                            </div>
                            <h2 className="text-3xl font-black font-display text-white tracking-wide">{selectedTeam.name}</h2>
                            <p className="text-blue-400 font-bold tracking-widest text-sm mt-1">{activeLeagueData.name} • {activeLeagueData.region}</p>
                        </div>

                        {/* Orta Kısım */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-dark-900 p-3 rounded-lg border border-dark-700">
                                    <div className="text-gray-500 text-[10px] font-bold uppercase mb-1">Team Rating</div>
                                    <div className={`text-2xl font-mono font-bold flex items-center gap-2 ${teamOverall >= 88 ? 'text-gold-400' : teamOverall >= 82 ? 'text-blue-400' : 'text-gray-300'}`}>
                                        <BarChart3 size={18} /> {teamOverall > 0 ? teamOverall : '-'}
                                    </div>
                                </div>
                                <div className="bg-dark-900 p-3 rounded-lg border border-dark-700">
                                    <div className="text-gray-500 text-[10px] font-bold uppercase mb-1">Fanbase</div>
                                    <div className="text-2xl font-mono font-bold text-white flex items-center gap-2">
                                        <Users size={18} className="text-pink-500"/> {fanbaseCount}M
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Sword size={12}/> Current Roster
                                </h3>
                                <div className="space-y-2">
                                    {Object.values(Role).filter(r => r !== Role.COACH).map(role => {
                                        const player = teamPlayers.find(p => p.role === role);
                                        const playerRating = player ? player.overall : 0;

                                        return (
                                            <div key={role} className="flex items-center justify-between p-2.5 bg-dark-900 rounded border border-dark-800 hover:border-dark-600 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center border border-dark-700 text-[10px] font-bold text-gray-400 shrink-0">
                                                        {role === Role.TOP ? 'TOP' : role === Role.JUNGLE ? 'JGL' : role === Role.MID ? 'MID' : role === Role.ADC ? 'ADC' : 'SUP'}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className={`text-sm font-bold truncate ${player ? 'text-white' : 'text-gray-600 italic'}`}>
                                                            {player ? player.name : 'Vacant'}
                                                        </span>
                                                        {player && <span className="text-[10px] text-gray-500">Lv {player.age}</span>}
                                                    </div>
                                                </div>
                                                
                                                {/* Rating Bar */}
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-xs font-mono font-bold text-gray-400 w-6 text-right">{playerRating > 0 ? playerRating : '-'}</span>
                                                    <div className="h-2 w-16 bg-black/50 rounded-full overflow-hidden border border-white/5">
                                                        <div 
                                                            className={`h-full transition-all duration-1000 ease-out rounded-full ${
                                                                playerRating >= 90 ? 'bg-gradient-to-r from-gold-600 to-gold-400' : 
                                                                playerRating >= 84 ? 'bg-gradient-to-r from-blue-600 to-blue-400' : 
                                                                playerRating >= 78 ? 'bg-gradient-to-r from-green-600 to-green-400' :
                                                                'bg-gray-600'
                                                            }`} 
                                                            style={{ width: `${playerRating > 0 ? playerRating : 0}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 bg-dark-900/50 backdrop-blur-sm mt-auto shrink-0">
                            <button
                                onClick={handleNext}
                                className="group w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
                            >
                                Confirm Selection <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 p-8 text-center animate-pulse">
                        <Shield size={64} className="mb-4 opacity-20" />
                        <h3 className="text-xl font-bold mb-2">Select a Team</h3>
                        <p className="text-sm max-w-[200px]">Choose a team from the list on the left to view details.</p>
                    </div>
                )}
            </div>
        </div>
      );
  };

  const renderManagerDetails = () => (
    <div className="max-w-md w-full mx-auto animate-fade-in-up">
        <div className="flex items-center gap-4 mb-8">
            <button onClick={handleBack} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
                <ChevronLeft size={24} />
            </button>
            <h2 className="text-4xl font-display font-bold text-white">Manager Profile</h2>
        </div>

        <div className="bg-dark-900 border border-dark-700 rounded-2xl p-8 shadow-2xl">
             <div className="space-y-6">
                 <div>
                     <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Manager Name</label>
                     <div className="relative">
                         <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                         <input 
                            type="text" 
                            value={managerName}
                            onChange={(e) => setManagerName(e.target.value)}
                            placeholder="Enter your IGN..."
                            className="w-full bg-dark-950 border border-dark-700 text-white rounded-xl py-4 pl-12 pr-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-bold text-lg"
                         />
                     </div>
                 </div>

                 <div>
                     <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Difficulty</label>
                     <div className="grid grid-cols-3 gap-3">
                         {(['Easy', 'Normal', 'Hard'] as Difficulty[]).map(diff => (
                             <button
                                key={diff}
                                onClick={() => setDifficulty(diff)}
                                className={`py-3 rounded-xl font-bold border-2 transition-all ${
                                    difficulty === diff 
                                    ? diff === 'Easy' ? 'bg-green-900/30 border-green-500 text-green-400' :
                                      diff === 'Normal' ? 'bg-blue-900/30 border-blue-500 text-blue-400' : 'bg-red-900/30 border-red-500 text-red-400'
                                    : 'bg-dark-950 border-dark-800 text-gray-500 hover:border-dark-600'
                                }`}
                             >
                                 {diff}
                             </button>
                         ))}
                     </div>
                 </div>
                 
                 <button 
                    onClick={handleNext}
                    disabled={!managerName}
                    className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                 >
                     Start Career <ChevronRight size={20} />
                 </button>
             </div>
        </div>
    </div>
  );

  return (
    <div className="w-full h-screen flex flex-col bg-[#050910] text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://lolstatic-a.akamaihd.net/frontpage/apps/prod/harbinger/l7-0/img/hextech-magic-background.jpg')] bg-cover bg-center opacity-10 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent z-50"></div>

      {step === 1 && (
        <LeagueMap onSelectLeague={(l) => { setSelectedLeague(l); setStep(2); }} selectedLeague={selectedLeague} />
      )}

      {step === 2 && renderTeamSelection()}

      {step === 3 && (
          <div className="flex-1 flex items-center justify-center relative z-10 w-full h-full">
              {renderManagerDetails()}
          </div>
      )}
    </div>
  );
};