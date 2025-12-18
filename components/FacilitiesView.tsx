import React from 'react';
import { Facility, FacilityType } from '../src/types/types'; // types.ts dosyasının yeri önemli, '../types' veya '../src/types/types' olabilir. Projene göre ayarla.
import { HOUSING_OPTIONS } from '../data/realestate'; 
import { Home, MonitorPlay, Dumbbell, HeartPulse, ArrowUp, Zap, MapPin, CheckCircle2, Lock } from 'lucide-react';

interface FacilitiesViewProps {
  facilities: Record<FacilityType, Facility>;
  activeHousingId: string;
  coins: number;
  onUpgrade: (type: FacilityType) => void;
  onMoveHouse: (houseId: string) => void;
}

// Görsel Temalar
const FACILITY_THEMES: Record<FacilityType, { img: string; color: string; icon: React.ElementType; accent: string }> = {
  GAMING_HOUSE: {
    img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
    color: 'from-blue-600 to-blue-900',
    accent: 'text-blue-400',
    icon: Home
  },
  STREAM_ROOM: {
    img: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2042&auto=format&fit=crop',
    color: 'from-purple-600 to-purple-900',
    accent: 'text-purple-400',
    icon: MonitorPlay
  },
  GYM: {
    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop',
    color: 'from-orange-600 to-orange-900',
    accent: 'text-orange-400',
    icon: Dumbbell
  },
  MEDICAL_CENTER: {
    img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop',
    color: 'from-red-600 to-red-900',
    accent: 'text-red-400',
    icon: HeartPulse
  }
};

export const FacilitiesView: React.FC<FacilitiesViewProps> = ({ facilities, activeHousingId, coins, onUpgrade, onMoveHouse }) => {
  // Eski kayıtlarda activeHousingId undefined ise 'starter' yap
  const safeHousingId = activeHousingId || 'starter'; 

  return (
    <div className="space-y-12 animate-fade-in pb-10">
      
      {/* ------------------------------------------------ */}
      {/* BÖLÜM 1: HEADQUARTERS (EV SEÇİMİ & TAŞINMA)      */}
      {/* ------------------------------------------------ */}
      <div>
          <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-6">
              <div>
                <h2 className="text-3xl font-display font-bold text-white tracking-wide flex items-center gap-3">
                    <MapPin className="text-gold-400" /> Headquarters
                </h2>
                <p className="text-gray-400 mt-1 text-sm">Choose your base of operations. Higher tier HQs provide passive bonuses.</p>
              </div>
              <div className="bg-dark-900 border border-gold-500/30 px-6 py-2 rounded-xl text-gold-400 font-mono font-bold text-lg shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                  {coins.toLocaleString()} G
              </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {HOUSING_OPTIONS.map(house => {
                  const isActive = house.id === safeHousingId;
                  const canAfford = coins >= house.deposit;

                  return (
                      <div key={house.id} className={`relative group rounded-2xl overflow-hidden border-2 transition-all duration-300 ${isActive ? 'border-green-500 scale-105 shadow-[0_0_25px_rgba(34,197,94,0.3)] z-10' : 'border-dark-700 hover:border-gold-400 hover:shadow-lg'}`}>
                          
                          {/* Arka Plan Görseli */}
                          <div className="h-40 overflow-hidden relative">
                              <img src={house.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={house.name} />
                              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent"></div>
                              
                              {/* Aktif Etiketi */}
                              {isActive && (
                                  <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                                      <CheckCircle2 size={12} /> CURRENT
                                  </div>
                              )}
                          </div>

                          {/* İçerik */}
                          <div className="p-5 bg-dark-900 h-full flex flex-col relative">
                              <div className="mb-3">
                                  <h3 className="font-bold text-white text-lg leading-tight">{house.name}</h3>
                                  <p className="text-xs text-gray-500 italic mt-1 line-clamp-2 h-8">{house.description}</p>
                              </div>
                              
                              {/* Özellikler */}
                              <div className="space-y-2 mb-5 bg-black/20 p-3 rounded-lg border border-white/5">
                                  <div className="flex justify-between text-xs">
                                      <span className="text-gray-400">Rent</span>
                                      <span className="text-white font-mono">{house.weeklyRent} G/wk</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                      <span className="text-gray-400">XP Gain</span>
                                      <span className="text-blue-400 font-bold">x{house.bonuses.xpMultiplier}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                      <span className="text-gray-400">Morale</span>
                                      <span className={`${house.bonuses.moraleRegen >= 0 ? 'text-green-400' : 'text-red-400'} font-bold`}>{house.bonuses.moraleRegen > 0 ? '+' : ''}{house.bonuses.moraleRegen}/wk</span>
                                  </div>
                              </div>

                              {/* Buton */}
                              <div className="mt-auto">
                                  {!isActive ? (
                                      <button 
                                        onClick={() => onMoveHouse(house.id)}
                                        disabled={!canAfford}
                                        className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all transform active:scale-95 ${
                                            canAfford 
                                            ? 'bg-gold-600 hover:bg-gold-500 text-white shadow-lg hover:shadow-gold-500/20' 
                                            : 'bg-dark-800 text-gray-500 cursor-not-allowed border border-white/5'
                                        }`}
                                      >
                                          {canAfford ? `Move In (${house.deposit} G)` : `Deposit: ${house.deposit} G`}
                                      </button>
                                  ) : (
                                      <div className="w-full py-3 bg-green-500/10 border border-green-500/30 text-green-400 font-bold rounded-xl text-center text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                          <CheckCircle2 size={14} /> Active HQ
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  )
              })}
          </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* BÖLÜM 2: INFRASTRUCTURE (TESİS YÜKSELTME)        */}
      {/* ------------------------------------------------ */}
      <div>
          <h2 className="text-3xl font-display font-bold text-white mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
              <Zap className="text-blue-400" /> Infrastructure
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.values(facilities).filter(f => f.id !== 'GAMING_HOUSE').map((facility, index) => {
                  const theme = FACILITY_THEMES[facility.id];
                  const Icon = theme.icon;
                  const nextLevelCost = facility.level < facility.maxLevel ? facility.upgradeCost[facility.level - 1] : null;
                  const canAfford = nextLevelCost !== null && coins >= nextLevelCost;
                  const isMaxed = facility.level >= facility.maxLevel;

                  return (
                      <div 
                        key={facility.id} 
                        className="relative h-[400px] rounded-3xl overflow-hidden group border border-white/5 hover:border-white/20 transition-all duration-500 shadow-xl bg-dark-900"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                          {/* Arka Plan Görseli */}
                          <div className="absolute inset-0">
                              <img 
                                src={theme.img} 
                                alt={facility.name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-60"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/80 to-transparent"></div>
                              <div className={`absolute inset-0 bg-gradient-to-br ${theme.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 mix-blend-overlay`}></div>
                          </div>

                          {/* İçerik */}
                          <div className="relative h-full p-6 flex flex-col justify-end z-10">
                              {/* İkon */}
                              <div className="absolute top-6 left-6">
                                  <div className={`p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                      <Icon size={24} className={`${theme.accent}`} />
                                  </div>
                              </div>

                              <div className="space-y-4">
                                  <div>
                                      <h3 className="text-2xl font-display font-bold text-white mb-1 group-hover:text-white transition-colors">{facility.name}</h3>
                                      <p className="text-gray-400 leading-snug text-sm h-9 line-clamp-2">{facility.description}</p>
                                  </div>

                                  {/* Seviye Çubuğu */}
                                  <div className="flex gap-1">
                                      {Array.from({ length: facility.maxLevel }).map((_, i) => (
                                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < facility.level ? `bg-gradient-to-r ${theme.color}` : 'bg-gray-700/50'}`} />
                                      ))}
                                  </div>

                                  {/* Bonus Bilgisi */}
                                  <div className="bg-white/5 rounded-xl p-3 border border-white/5 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                                      <div className="flex justify-between items-center mb-1">
                                          <span className="text-[10px] font-bold text-gray-500 uppercase">Current Effect</span>
                                          <span className={`text-xs font-bold ${theme.accent}`}>{facility.benefit.replace('{lvl}', String(facility.level))}</span>
                                      </div>
                                      {!isMaxed && (
                                         <div className="flex justify-between items-center pt-2 border-t border-white/10 mt-2">
                                              <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">Next Level <ArrowUp size={10}/></span>
                                              <span className="text-xs font-bold text-white">{facility.benefit.replace('{lvl}', String(facility.level + 1))}</span>
                                         </div>
                                      )}
                                  </div>

                                  {/* Aksiyon Butonu */}
                                  <div className="pt-1">
                                      {!isMaxed ? (
                                          <button 
                                            onClick={() => onUpgrade(facility.id)}
                                            disabled={!canAfford}
                                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all transform active:scale-95 ${
                                                canAfford 
                                                ? `bg-gradient-to-r ${theme.color} text-white shadow-lg hover:shadow-2xl hover:brightness-110 border border-white/20` 
                                                : 'bg-dark-800 text-gray-500 cursor-not-allowed border border-white/5'
                                            }`}
                                          >
                                              {canAfford ? (
                                                  <>
                                                      <Zap size={16} className={canAfford ? 'animate-pulse' : ''} /> 
                                                      <span className="text-sm">UPGRADE</span>
                                                  </>
                                              ) : (
                                                  <>
                                                      <Lock size={16} /> 
                                                      <span className="text-sm">LOCKED</span>
                                                  </>
                                              )}
                                              <div className="h-3 w-px bg-white/20 mx-2"></div>
                                              <span className={`font-mono text-sm ${canAfford ? 'text-white' : 'text-gray-500'}`}>
                                                  {nextLevelCost?.toLocaleString()} G
                                              </span>
                                          </button>
                                      ) : (
                                          <div className="w-full py-3 bg-green-500/10 border border-green-500/30 text-green-400 font-bold rounded-xl text-center uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                                              <CheckCircle2 size={16} /> Max Level
                                          </div>
                                      )}
                                  </div>
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