import React, { useState } from 'react';
import { HOUSING_OPTIONS } from '../data/realestate'; 
import { Home, MonitorPlay, Dumbbell, HeartPulse, CheckCircle2, Lock, ArrowRight, Wallet, MapPin, TrendingUp, Sparkles } from 'lucide-react';

interface FacilitiesViewProps {
  facilities: any; 
  activeHousingId: string;
  coins: number;
  onUpgrade: (id: any) => void;
  onMoveHouse: (id: string) => void;
}

const FACILITY_THEMES: Record<string, { color: string; icon: any; accent: string; bgGradient: string }> = {
  STREAM_ROOM: {
    color: 'text-purple-400',
    accent: 'border-purple-500/50 shadow-[0_0_30px_-10px_rgba(168,85,247,0.5)]',
    bgGradient: 'from-purple-900/40 via-dark-900 to-dark-950',
    icon: MonitorPlay
  },
  GYM: {
    color: 'text-orange-400',
    accent: 'border-orange-500/50 shadow-[0_0_30px_-10px_rgba(249,115,22,0.5)]',
    bgGradient: 'from-orange-900/40 via-dark-900 to-dark-950',
    icon: Dumbbell
  },
  MEDICAL_CENTER: {
    color: 'text-emerald-400',
    accent: 'border-emerald-500/50 shadow-[0_0_30px_-10px_rgba(16,185,129,0.5)]',
    bgGradient: 'from-emerald-900/40 via-dark-900 to-dark-950',
    icon: HeartPulse
  },
  DEFAULT: {
    color: 'text-blue-400',
    accent: 'border-blue-500/50 shadow-[0_0_30px_-10px_rgba(59,130,246,0.5)]',
    bgGradient: 'from-blue-900/40 via-dark-900 to-dark-950',
    icon: Home
  }
};

export const FacilitiesView: React.FC<FacilitiesViewProps> = ({ facilities, activeHousingId, coins, onUpgrade, onMoveHouse }) => {
  const [activeTab, setActiveTab] = useState<'INFRASTRUCTURE' | 'REAL_ESTATE'>('INFRASTRUCTURE');

  // Aktif evi bul (Güvenlik önlemli)
  // @ts-ignore
  const currentHouse = HOUSING_OPTIONS.find(h => h.id === activeHousingId) || HOUSING_OPTIONS[0] || { name: 'Starter', maintenance: 0, capacity: 5, img: '', description: '' };

  return (
    <div className="h-full flex flex-col overflow-hidden animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-6 px-2 shrink-0 gap-4">
        <div>
          <h2 className="text-4xl font-display font-bold text-white tracking-wide flex items-center gap-3">
            <Home className="text-blue-500" size={32} />
            Facilities
          </h2>
          <p className="text-gray-400 mt-1 text-sm">Manage your team's living conditions and training environment.</p>
        </div>

        <div className="flex p-1 bg-dark-800/50 rounded-xl border border-white/5">
            <button 
                onClick={() => setActiveTab('INFRASTRUCTURE')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'INFRASTRUCTURE' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
                <Sparkles size={16} /> Infrastructure
            </button>
            <button 
                onClick={() => setActiveTab('REAL_ESTATE')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'REAL_ESTATE' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
                <MapPin size={16} /> Real Estate
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 mt-4">
        
        {/* --- 1. INFRASTRUCTURE TAB --- */}
        {activeTab === 'INFRASTRUCTURE' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {Object.values(facilities).filter((f: any) => f.id !== 'GAMING_HOUSE').map((facility: any) => {
                    const theme = FACILITY_THEMES[facility.id] || FACILITY_THEMES.DEFAULT;
                    
                    // Güvenli Maliyet Hesabı
                    const costArray = facility.upgradeCost || [];
                    const costIndex = Math.max(0, facility.level - 1);
                    const nextLevelCost = (facility.level < facility.maxLevel && costArray[costIndex] !== undefined) 
                        ? costArray[costIndex] 
                        : 0;

                    const canAfford = coins >= nextLevelCost;
                    const isMaxed = facility.level >= facility.maxLevel;
                    const progressPercent = (facility.level / facility.maxLevel) * 100;

                    return (
                        <div key={facility.id} className={`relative group overflow-hidden rounded-3xl border bg-gradient-to-br ${theme.bgGradient} ${theme.accent} transition-all duration-500 hover:scale-[1.01]`}>
                            <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none transform group-hover:rotate-12 transition-transform duration-700">
                                <theme.icon size={150} />
                            </div>

                            <div className="p-8 relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${theme.color}`}>
                                        <theme.icon size={32} />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Current Level</div>
                                        <div className="text-3xl font-mono font-bold text-white">
                                            {facility.level}<span className="text-gray-600 text-lg">/{facility.maxLevel}</span>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2">{facility.name}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6 h-10 line-clamp-2">{facility.description}</p>

                                <div className="mb-8">
                                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                                        <span>Progress</span>
                                        <span>{Math.round(progressPercent)}%</span>
                                    </div>
                                    <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                        <div 
                                            className={`h-full rounded-full bg-gradient-to-r ${activeTab === 'INFRASTRUCTURE' ? 'from-blue-500 to-cyan-400' : 'from-purple-500 to-pink-500'}`} 
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">Benefit</div>
                                        <div className={`font-bold ${theme.color}`}>{facility.benefit ? facility.benefit.replace('{lvl}', String(facility.level)) : ''}</div>
                                    </div>

                                    {!isMaxed ? (
                                        <button 
                                            onClick={() => onUpgrade(facility.id)}
                                            disabled={!canAfford}
                                            className={`
                                                relative px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3
                                                ${canAfford 
                                                    ? 'bg-white text-black hover:bg-gray-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                                                    : 'bg-dark-800 text-gray-500 cursor-not-allowed border border-white/5'}
                                            `}
                                        >
                                            {canAfford ? (
                                                <>
                                                    <span className="flex flex-col items-start leading-none">
                                                        <span className="text-[10px] uppercase tracking-wider opacity-60">Upgrade</span>
                                                        <span>{nextLevelCost.toLocaleString()} G</span>
                                                    </span>
                                                    <ArrowRight size={18} />
                                                </>
                                            ) : (
                                                <>
                                                    <Lock size={16} /> 
                                                    <span>{nextLevelCost.toLocaleString()} G</span>
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg font-bold flex items-center gap-2 text-sm">
                                            <CheckCircle2 size={16} /> MAXED
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

        {/* --- 2. REAL ESTATE TAB --- */}
        {activeTab === 'REAL_ESTATE' && (
            <div className="space-y-8 pb-10">
                {/* Mevcut Ev */}
                <div className="relative rounded-3xl overflow-hidden min-h-[300px] flex items-end p-8 border border-white/10 group">
                    <img 
                        src={currentHouse.img} 
                        alt="Current House" 
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                    
                    <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <div className="inline-block px-3 py-1 bg-green-500 text-black text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                                Current Headquarters
                            </div>
                            <h2 className="text-5xl font-display font-bold text-white mb-2">{currentHouse.name}</h2>
                            <p className="text-gray-300 max-w-xl text-lg">{currentHouse.description}</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-dark-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[120px]">
                                <div className="text-gray-400 text-xs font-bold uppercase mb-1">Upkeep</div>
                                {/* Güvenli Erişim: maintenance yoksa 0 */}
                                <div className="text-red-400 font-mono font-bold text-xl">-{(currentHouse.maintenance || 0).toLocaleString()} G/w</div>
                            </div>
                            <div className="bg-dark-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[120px]">
                                <div className="text-gray-400 text-xs font-bold uppercase mb-1">Capacity</div>
                                <div className="text-blue-400 font-mono font-bold text-xl">{currentHouse.capacity} ppl</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Taşınma Seçenekleri */}
                <div>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <MapPin className="text-purple-500" /> Available Properties
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* @ts-ignore - HOUSING_OPTIONS tip hatasını sustur */}
                        {HOUSING_OPTIONS.map((house: any) => {
                            const isCurrent = house.id === activeHousingId;
                            
                            // --- DÜZELTME BURADA: cost veya price özelliğini ara, yoksa 0 ---
                            const houseCost = house.cost || house.price || 0; 
                            const canAfford = coins >= houseCost;

                            if (isCurrent) return null;

                            return (
                                <div key={house.id} className="group bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all hover:-translate-y-1 hover:shadow-2xl">
                                    <div className="h-48 overflow-hidden relative">
                                        <div className="absolute top-3 right-3 z-10 px-3 py-1 bg-black/60 backdrop-blur rounded-lg text-xs font-bold text-white border border-white/10">
                                            Lvl {house.level}
                                        </div>
                                        <img src={house.img} alt={house.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent"></div>
                                    </div>
                                    <div className="p-6">
                                        <h4 className="text-xl font-bold text-white mb-1">{house.name}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                                            <span className="flex items-center gap-1"><Wallet size={12}/> Upkeep: {house.maintenance}G</span>
                                            <span>•</span>
                                            <span className="text-blue-400">{house.description ? house.description.split('.')[0] : ''}</span>
                                        </div>
                                        
                                        <button 
                                            onClick={() => onMoveHouse(house.id)}
                                            disabled={!canAfford}
                                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                                                ${canAfford 
                                                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]' 
                                                    : 'bg-dark-800 text-gray-500 cursor-not-allowed border border-white/5'}
                                            `}
                                        >
                                            {canAfford ? 'Move In' : 'Too Expensive'} 
                                            <span className="opacity-50">|</span> 
                                            {/* FİYAT GÖSTERİMİ DÜZELTİLDİ */}
                                            {houseCost.toLocaleString()} G
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};