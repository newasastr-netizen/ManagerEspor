import React from 'react';
import { Handshake, Lock } from 'lucide-react';
import { getTeamTier } from './TeamLogo';
import { TeamData } from '../src/types/types';

export interface Sponsor {
  id: string;
  name: string;
  weeklyIncome: number;
  signingBonus: number;
  duration: number;
  description: string;
  minTier: 'S' | 'A' | 'B' | 'C';
}

const AVAILABLE_SPONSORS: Sponsor[] = [
  // C Tier (Başlangıç)
  { id: 'local_pc', name: 'Hyper X', weeklyIncome: 200, signingBonus: 500, duration: 5, minTier: 'C', description: 'HyperX is a brand committed to making sure every gamer feels they are included.' },
  { id: 'snack', name: 'Kit Kat', weeklyIncome: 300, signingBonus: 800, duration: 8, minTier: 'C', description: 'Have a Break, Have a KitKat' },
  
  // B Tier
  { id: 'gear_store', name: 'Logitech', weeklyIncome: 500, signingBonus: 1500, duration: 10, minTier: 'B', description: 'Advanced Gaming Gear & Peripherals' },
  { id: 'energy_drink', name: 'Red Bull', weeklyIncome: 600, signingBonus: 1000, duration: 12, minTier: 'B', description: 'Red Bull Gives You Wiiings' },

  // A Tier
  { id: 'tech_giant', name: 'AGON BY AOC', weeklyIncome: 1000, signingBonus: 5000, duration: 15, minTier: 'A', description: 'Vision at Heart' },
  { id: 'car_brand', name: 'Mercedes-Benz', weeklyIncome: 1200, signingBonus: 4000, duration: 18, minTier: 'A', description: 'The Best or Nothing' },

  // S Tier (Sadece Şampiyonlar)
  { id: 'bmw', name: 'BMW', weeklyIncome: 2500, signingBonus: 15000, duration: 20, minTier: 'S', description: 'Ultimate Driving Machine' },
  { id: 'bank', name: 'Master Card', weeklyIncome: 3000, signingBonus: 10000, duration: 24, minTier: 'S', description: 'Explore the world with Mastercard®' },
];

interface SponsorsViewProps {
  currentSponsor: Sponsor | null;
  onSignSponsor: (sponsor: Sponsor) => void;
  userTeam: TeamData | null;
}

export const SponsorsView: React.FC<SponsorsViewProps> = ({ currentSponsor, onSignSponsor, userTeam }) => {
  const teamTier = userTeam ? getTeamTier(userTeam.id) : 'C';
  
  // Tier sıralaması (Kıyaslama yapmak için)
  const tierOrder = { 'S': 4, 'A': 3, 'B': 2, 'C': 1 };
  const currentTierValue = tierOrder[teamTier as keyof typeof tierOrder] || 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Handshake className="text-gold-400" /> Sponsors
         </h2>
         <div className="px-4 py-2 bg-dark-800 rounded-lg border border-dark-700">
             <span className="text-gray-400 text-sm">Your Team Rating: </span>
             <span className={`font-bold text-xl ${teamTier === 'S' ? 'text-gold-400' : 'text-white'}`}>{teamTier} Tier</span>
         </div>
      </div>

      {currentSponsor ? (
        <div className="bg-gradient-to-br from-dark-900 to-dark-800 border-2 border-gold-500 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
              <Handshake size={120} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Active Contract</h3>
          <div className="text-4xl font-display text-gold-400 mb-6">{currentSponsor.name}</div>
          
          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
              <div className="bg-dark-950 p-4 rounded-xl">
                  <div className="text-xs text-gray-500 uppercase">Weekly Income</div>
                  <div className="text-2xl font-mono text-green-400">+{currentSponsor.weeklyIncome} G</div>
              </div>
              <div className="bg-dark-950 p-4 rounded-xl">
                  <div className="text-xs text-gray-500 uppercase">Duration</div>
                  <div className="text-2xl font-mono text-white">{currentSponsor.duration} <span className="text-sm">weeks</span></div>
              </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {AVAILABLE_SPONSORS.map(sponsor => {
            const requiredValue = tierOrder[sponsor.minTier as keyof typeof tierOrder];
            const isLocked = requiredValue > currentTierValue;

            return (
                <div key={sponsor.id} className={`relative bg-dark-900 border ${isLocked ? 'border-dark-800 opacity-60' : 'border-dark-700 hover:border-hextech-500'} rounded-xl p-6 transition-all flex flex-col justify-between group`}>
                
                {isLocked && (
                    <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 rounded-xl">
                        <Lock className="text-gray-500 mb-2" size={32} />
                        <span className="text-gray-400 font-bold uppercase text-sm">Requires {sponsor.minTier} Tier</span>
                    </div>
                )}

                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white">{sponsor.name}</h3>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${sponsor.minTier === 'S' ? 'bg-gold-500/20 text-gold-400' : 'bg-dark-800 text-gray-400'}`}>
                            {sponsor.minTier} Tier
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4 h-8">{sponsor.description}</p>
                    
                    <div className="space-y-3 mb-6 bg-dark-950 p-3 rounded-lg">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Bonus:</span>
                        <span className="text-gold-400 font-bold">+{sponsor.signingBonus} G</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Weekly:</span>
                        <span className="text-green-400 font-bold">+{sponsor.weeklyIncome} G</span>
                    </div>
                    </div>
                </div>
                <button 
                    onClick={() => onSignSponsor(sponsor)}
                    disabled={isLocked}
                    className="w-full py-2 bg-hextech-600 hover:bg-hextech-500 disabled:bg-gray-700 text-white font-bold rounded-lg transition-colors"
                >
                    Sign Contract
                </button>
                </div>
            );
          })}
        </div>
      )}
    </div>
  );
};