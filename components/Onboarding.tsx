import React, { useState } from 'react';
import { TeamData, LeagueKey } from '../types';
import { LEAGUES } from '../data/leagues';
import { TeamLogo } from './TeamLogo';
import { ArrowRight, Crown } from 'lucide-react';

interface OnboardingProps {
  onComplete: (name: string, team: TeamData, leagueKey: LeagueKey) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [managerName, setManagerName] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<LeagueKey>('LCK');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  const handleContinue = () => {
    if (managerName.trim().length < 3) {
      alert('Please enter a name with at least 3 characters.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = () => {
    if (!selectedTeamId) {
      alert('Please select a team.');
      return;
    }
    const leagueData = LEAGUES[selectedLeague];
    const teamData = leagueData.teams.find(t => t.id === selectedTeamId);
    if (teamData) {
      onComplete(managerName, teamData, selectedLeague);
    }
  };

  const currentTeams = LEAGUES[selectedLeague].teams;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950 p-4">
      <div className="w-full max-w-lg bg-dark-900 border border-dark-800 rounded-2xl p-8 shadow-2xl space-y-8 animate-fade-in">
        
        <div className="text-center">
            <Crown className="mx-auto text-hextech-500 mb-4" size={32} />
            <h1 className="text-3xl font-display font-bold text-white">Manager Registration</h1>
            <p className="text-gray-400 mt-2">
              {step === 1 
                ? 'Enter your credentials to begin your managerial career.' 
                : `Enter your credentials to apply for the ${LEAGUES[selectedLeague].name} 2025 Season.`}
            </p>
        </div>

        {/* Step 1: Manager Name */}
        <div style={{ display: step === 1 ? 'block' : 'none' }} className="space-y-6">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Manager Name</label>
                <input 
                    type="text" 
                    value={managerName} 
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="e.g. FakerSlayer99"
                    className="w-full p-4 bg-dark-950 border border-dark-700 rounded-lg text-white focus:border-hextech-500 focus:outline-none transition-colors"
                    onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
                />
            </div>
            <button 
                onClick={handleContinue} 
                className="w-full py-4 bg-hextech-600 hover:bg-hextech-500 text-white font-bold text-lg rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
                Continue <ArrowRight size={20} />
            </button>
        </div>

        {/* Step 2: Select League */}
        <div style={{ display: step === 2 ? 'block' : 'none' }} className="space-y-6 animate-fade-in">
             <div className="text-center">
                <h2 className="text-xl font-bold font-display text-white">Select Your League</h2>
                <p className="text-gray-400 text-sm">Which region will you compete in?</p>
             </div>
            <div className="grid grid-cols-2 gap-4">
                {(Object.keys(LEAGUES) as LeagueKey[]).map(key => (
                    <button 
                        key={key} 
                        onClick={() => {
                            setSelectedLeague(key);
                            setStep(3);
                        }} 
                        className={`p-4 flex flex-col items-center justify-center gap-2 rounded-lg border-2 transition-all border-dark-700 bg-dark-800 hover:border-hextech-500 hover:bg-hextech-500/10`}
                    >
                        <span className="text-2xl font-bold text-white">{LEAGUES[key].name}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Step 3: Select Team */}
        <div style={{ display: step === 3 ? 'block' : 'none' }} className="space-y-6 animate-fade-in">
             <div className="text-center">
                <h2 className="text-xl font-bold font-display text-white">Select Your Team</h2>
                <p className="text-gray-400 text-sm">Which organization will you lead to glory?</p>
             </div>
            <div className={`grid ${
                selectedLeague === 'LPL' 
                ? 'grid-cols-4' 
                : 'grid-cols-5'
            } gap-4`}>
                {currentTeams.map(team => (
                    <button 
                        key={team.id} 
                        onClick={() => setSelectedTeamId(team.id)} 
                        className={`p-2 flex flex-col items-center justify-center gap-2 rounded-lg border-2 transition-all ${selectedTeamId === team.id ? 'border-hextech-500 bg-hextech-500/20' : 'border-dark-700 bg-dark-800 hover:border-dark-600'}`}
                    >
                        <TeamLogo team={team} size="w-12 h-12" />
                        <span className="text-xs font-bold text-gray-300">{team.shortName}</span>
                    </button>
                ))}
            </div>
            <button 
                onClick={handleSubmit} 
                disabled={!selectedTeamId}
                className="w-full py-4 bg-white disabled:bg-gray-500 disabled:cursor-not-allowed text-black font-bold uppercase rounded-xl hover:bg-gray-200 transition-colors"
            >
                Sign Contract with Team
            </button>
        </div>

      </div>
    </div>
  );
};
