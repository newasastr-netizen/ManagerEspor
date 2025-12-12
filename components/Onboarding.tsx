import React, { useState } from 'react';
import { LEAGUES, LeagueKey } from '../data/leagues';
import { TeamData } from '../src/types/types';
import { TeamLogo } from './TeamLogo';
import { Trophy, Check, ChevronRight, User } from 'lucide-react'; // DÜZELTME: User ve diğer ikonlar eklendi
import { LeagueMap } from './LeagueMap'; // DÜZELTME: Harita bileşeni import edildi

interface OnboardingProps {
  onComplete: (name: string, team: TeamData, leagueKey: LeagueKey, difficulty: 'Easy' | 'Normal' | 'Hard') => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [managerName, setManagerName] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<LeagueKey | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Normal' | 'Hard'>('Normal');

  const handleNext = () => {
    if (step === 3 && selectedLeague && selectedTeam) {
      const team = LEAGUES[selectedLeague].teams.find(t => t.id === selectedTeam);
      if (team) {
        onComplete(managerName, team, selectedLeague, difficulty);
      }
    } else {
      setStep(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://lolstatic-a.akamaihd.net/frontpage/apps/prod/harbinger/4_0_0/assets/img/hextech-magic-background.jpg')] bg-cover bg-center">
      {/* Karartma Katmanı */}
      <div className="absolute inset-0 bg-dark-950/90 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center p-4">
        
        {/* --- ADIM 1: İSİM VE BÖLGE SEÇİMİ (DÜNYA HARİTASI) --- */}
        {step === 1 && (
          <div className="space-y-8 animate-fade-in w-full">
             <div className="text-center space-y-2">
                <h2 className="text-5xl font-display font-bold text-white tracking-wide">Create Your Legacy</h2>
                <p className="text-gray-400 text-lg">Enter your name and select the region you want to conquer.</p>
             </div>

             {/* İsim Girişi */}
             <div className="max-w-md mx-auto">
                 <label className="block text-xs font-bold text-hextech-400 uppercase mb-2 ml-1">Manager Name</label>
                 <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input 
                      type="text" 
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      className="w-full bg-dark-800 border-2 border-dark-700 focus:border-hextech-500 text-white pl-12 pr-4 py-4 rounded-xl outline-none transition-all font-display text-lg placeholder:text-gray-600 shadow-xl"
                      placeholder="Enter your nickname..."
                    />
                 </div>
             </div>

             {/* Harita */}
             <div className="space-y-4">
                 <div className="flex justify-between items-end px-4">
                     <label className="block text-xs font-bold text-hextech-400 uppercase">Target Region</label>
                     {selectedLeague && <span className="text-gold-400 font-bold font-display text-2xl animate-pulse">{LEAGUES[selectedLeague].name}</span>}
                 </div>
                 
                 {/* Harita Bileşeni Burada Kullanılıyor */}
                 <LeagueMap 
                    selectedLeague={selectedLeague} 
                    onSelectLeague={(league) => {
                        setSelectedLeague(league);
                        setSelectedTeam(null); // Lig değişince takımı sıfırla
                    }} 
                 />
             </div>

             <div className="flex justify-center pt-6">
                <button 
                  onClick={() => setStep(2)}
                  disabled={!managerName || !selectedLeague}
                  className="btn-hextech px-16 py-5 text-xl rounded-full shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Select Team <ChevronRight strokeWidth={3} />
                </button>
             </div>
          </div>
        )}

        {/* --- ADIM 2: TAKIM SEÇİMİ --- */}
        {step === 2 && selectedLeague && (
            <div className="space-y-8 animate-fade-in w-full">
                <div className="text-center">
                    <h2 className="text-4xl font-display font-bold text-white">Select Your Team</h2>
                    <p className="text-gray-400 text-lg">Choose the organization you will lead to glory in {LEAGUES[selectedLeague].name}.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 max-h-[600px] overflow-y-auto p-4 custom-scrollbar">
                    {LEAGUES[selectedLeague].teams.map(team => (
                        <div 
                            key={team.id}
                            onClick={() => setSelectedTeam(team.id)}
                            className={`relative cursor-pointer group bg-dark-900 border-2 rounded-2xl p-6 flex flex-col items-center gap-4 transition-all duration-300 hover:-translate-y-2 ${selectedTeam === team.id ? 'border-gold-500 shadow-[0_0_30px_rgba(234,179,8,0.3)] bg-dark-800' : 'border-dark-700 hover:border-hextech-500'}`}
                        >
                            <TeamLogo team={team} size="w-24 h-24" className="drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" />
                            <div className="text-center">
                                <h3 className={`text-xl font-bold font-display ${selectedTeam === team.id ? 'text-white' : 'text-gray-300'}`}>{team.name}</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">{team.tier} TIER</p>
                            </div>
                            {selectedTeam === team.id && (
                                <div className="absolute top-3 right-3 bg-gold-500 text-black rounded-full p-1 shadow-lg">
                                    <Check size={16} strokeWidth={4} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-center gap-6 pt-4">
                    <button onClick={() => setStep(1)} className="px-8 py-3 text-gray-400 hover:text-white font-bold transition-colors uppercase tracking-wider">Back</button>
                    <button 
                        onClick={() => setStep(3)}
                        disabled={!selectedTeam}
                        className="btn-hextech px-12 py-4 text-xl rounded-full shadow-2xl hover:scale-105 transition-transform disabled:opacity-50"
                    >
                        Select Difficulty <ChevronRight className="inline ml-2" />
                    </button>
                </div>
            </div>
        )}

        {/* --- ADIM 3: ZORLUK SEVİYESİ --- */}
        {step === 3 && (
            <div className="space-y-8 animate-fade-in w-full max-w-3xl text-center">
                <div>
                    <h2 className="text-4xl font-display font-bold text-white">Select Difficulty</h2>
                    <p className="text-gray-400 text-lg">This will determine your starting budget and market conditions.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(['Easy', 'Normal', 'Hard'] as const).map((diff) => (
                        <button
                            key={diff}
                            onClick={() => setDifficulty(diff)}
                            className={`p-8 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-4 ${difficulty === diff ? 'bg-hextech-900/50 border-hextech-500 shadow-[0_0_30px_rgba(6,182,212,0.2)] scale-105' : 'bg-dark-900 border-dark-700 hover:border-gray-500'}`}
                        >
                            <Trophy size={48} className={difficulty === diff ? 'text-hextech-400' : 'text-gray-600'} />
                            <div>
                                <div className={`text-2xl font-bold font-display ${difficulty === diff ? 'text-white' : 'text-gray-400'}`}>{diff}</div>
                                <div className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-wider">
                                    {diff === 'Easy' && '10,000 Starting Gold'}
                                    {diff === 'Normal' && '7,500 Starting Gold'}
                                    {diff === 'Hard' && '5,000 Starting Gold'}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="flex justify-center gap-6 pt-8">
                    <button onClick={() => setStep(2)} className="px-8 py-3 text-gray-400 hover:text-white font-bold transition-colors uppercase tracking-wider">Back</button>
                    <button 
                        onClick={handleNext}
                        className="btn-gold px-16 py-5 text-xl rounded-full shadow-[0_0_40px_rgba(234,179,8,0.4)] hover:scale-105 transition-transform animate-pulse"
                    >
                        START GAME
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};