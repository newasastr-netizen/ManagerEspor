import React, { useState } from 'react';
import { 
  Briefcase, DollarSign, Trophy, TrendingUp, 
  Target, Shield, Zap, Lock, CheckCircle2, Star 
} from 'lucide-react';

// --- TİP TANIMLARI (Normalde types.ts içinde olmalı ama kolaylık olsun diye burada) ---
interface SponsorTask {
  description: string;
  current: number;
  target: number;
  reward: number;
}

interface Sponsor {
  id: string;
  name: string;
  tier: 'S' | 'A' | 'B' | 'C';
  type: 'Main' | 'Kit' | 'Partner';
  income: number;
  logo: string;
  description: string;
  tasks?: SponsorTask[]; // Sponsorun verdiği yan görevler
  
  // Kilit açma şartları (Sadece kilitliler için)
  requiredFanbase?: number; // Milyon cinsinden
  currentFanbase?: number;
}

// --- MOCK DATA (Veri Simülasyonu) ---
const ACTIVE_SPONSORS: Sponsor[] = [
  {
    id: 'local_cafe',
    name: 'Pixel Cafe',
    tier: 'C',
    type: 'Partner',
    income: 250,
    logo: '☕',
    description: 'Free coffee for the players. Keeps morale high.',
    tasks: [
      { description: 'Get First Blood', current: 0, target: 1, reward: 500 }
    ]
  }
];

const AVAILABLE_OFFERS: Sponsor[] = [
  {
    id: 'keyboard_co',
    name: 'Clicky Keyboards',
    tier: 'B',
    type: 'Kit',
    income: 800,
    logo: '⌨️',
    description: 'Mid-range gear sponsor. Reliable income.',
    tasks: [
      { description: 'Win 2 Matches', current: 0, target: 2, reward: 2000 }
    ]
  },
  {
    id: 'energy_drink',
    name: 'Thunder Energy',
    tier: 'B',
    type: 'Partner',
    income: 600,
    logo: '⚡',
    description: 'Hyper-caffeinated drinks. Boosts stamina recovery.',
  }
];

const LOCKED_SPONSORS: Sponsor[] = [
  {
    id: 'tech_giant',
    name: 'Nvidia',
    tier: 'S',
    type: 'Main',
    income: 5000,
    logo: '🟢',
    description: 'Global tech giant. Only for the world champions.',
    requiredFanbase: 5.0,
    currentFanbase: 1.2
  },
  {
    id: 'shoe_brand',
    name: 'Nike',
    tier: 'A',
    type: 'Kit',
    income: 3500,
    logo: '👟',
    description: 'Just Do It. Massive merchandise revenue.',
    requiredFanbase: 3.0,
    currentFanbase: 1.2
  }
];

interface SponsorsViewProps {
  coins: number;
}

export const SponsorsView: React.FC<SponsorsViewProps> = ({ coins }) => {
  // Basit bir state ile "İmzalama" simülasyonu
  const [activeList, setActiveList] = useState<Sponsor[]>(ACTIVE_SPONSORS);
  const [offerList, setOfferList] = useState<Sponsor[]>(AVAILABLE_OFFERS);

  const handleSign = (sponsor: Sponsor) => {
    // Listeden çıkar, aktife ekle
    setOfferList(prev => prev.filter(s => s.id !== sponsor.id));
    setActiveList(prev => [...prev, sponsor]);
  };

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      
      {/* BAŞLIK VE ÖZET */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h2 className="text-4xl font-display font-bold text-white tracking-wide flex items-center gap-3">
            <Briefcase className="text-gold-400" size={36} /> Sponsorships
          </h2>
          <p className="text-gray-400 mt-2 text-lg">Manage partners, complete quests, earn budget.</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Weekly Income</div>
          <div className="text-3xl font-mono font-bold text-green-400 flex items-center justify-end gap-2">
            +{activeList.reduce((acc, s) => acc + s.income, 0).toLocaleString()} <span className="text-white text-base">G</span>
          </div>
        </div>
      </div>

      {/* --- 1. AKTİF SPONSORLAR (KARTLAR) --- */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <CheckCircle2 size={20} className="text-green-500" /> Active Contracts
        </h3>
        
        {activeList.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-gray-700 rounded-2xl text-center text-gray-500">
            No active sponsors. Sign a contract below!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeList.map(sponsor => (
              <div key={sponsor.id} className="relative group bg-gradient-to-br from-dark-800 to-dark-900 border border-green-500/30 rounded-2xl p-6 shadow-lg hover:shadow-green-900/20 transition-all">
                {/* Slot Badge */}
                <div className="absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded bg-dark-950 border border-gray-700 text-gray-300">
                  {sponsor.type.toUpperCase()} SLOT
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-dark-950 flex items-center justify-center text-3xl border border-gray-700 shadow-inner">
                    {sponsor.logo}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xl">{sponsor.name}</h4>
                    <div className="text-green-400 font-mono font-bold">+{sponsor.income} G/wk</div>
                  </div>
                </div>

                {/* Aktif Görevler */}
                {sponsor.tasks && sponsor.tasks.length > 0 && (
                  <div className="mt-4 bg-dark-950/50 rounded-xl p-3 border border-white/5">
                    <div className="text-[10px] uppercase font-bold text-gray-500 mb-2 flex justify-between">
                      <span>Active Objective</span>
                      <span className="text-gold-400 flex items-center gap-1"><Star size={10} /> Bonus: {sponsor.tasks[0].reward} G</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium text-gray-300 mb-1">
                      <span>{sponsor.tasks[0].description}</span>
                      <span>{sponsor.tasks[0].current}/{sponsor.tasks[0].target}</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-dark-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gold-500" 
                        style={{ width: `${(sponsor.tasks[0].current / sponsor.tasks[0].target) * 100}%` }} 
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- 2. TEKLİFLER (AÇIK) --- */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Zap size={20} className="text-blue-400" /> Available Offers
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {offerList.map(offer => (
            <div key={offer.id} className="bg-dark-800 border border-gray-700 rounded-xl p-5 flex items-center justify-between hover:border-blue-500/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-2xl">
                  {offer.logo}
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{offer.name}</h4>
                  <p className="text-sm text-gray-400">{offer.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">{offer.tier}-Tier</span>
                    <span className="text-green-400 font-mono">+{offer.income} G/wk</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleSign(offer)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-lg transition-transform active:scale-95"
              >
                Sign
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* --- 3. GELECEK HEDEFLER (KİLİTLİ) --- */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 opacity-60">
          <Lock size={20} /> Locked Opportunities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
          {LOCKED_SPONSORS.map(locked => {
            const progress = ((locked.currentFanbase || 0) / (locked.requiredFanbase || 1)) * 100;
            
            return (
              <div key={locked.id} className="relative bg-dark-900 border border-dark-700 rounded-xl p-6 overflow-hidden grayscale hover:grayscale-0 transition-all duration-500 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-lg bg-dark-800 flex items-center justify-center text-2xl border border-dark-600">
                    {locked.logo}
                  </div>
                  <Lock size={18} className="text-gray-500" />
                </div>
                
                <h4 className="font-bold text-white text-lg mb-1">{locked.name}</h4>
                <p className="text-sm text-gray-500 mb-4">{locked.description}</p>
                
                {/* İlerleme Durumu */}
                <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                  <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                    <span>Required Fanbase</span>
                    <span className={progress >= 100 ? 'text-green-400' : 'text-gray-300'}>
                      {locked.currentFanbase}M / {locked.requiredFanbase}M
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-dark-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 group-hover:bg-blue-400 transition-colors" 
                      style={{ width: `${Math.min(progress, 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};