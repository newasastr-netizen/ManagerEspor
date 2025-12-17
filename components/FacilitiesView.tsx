import React from 'react';
import { Facility, FacilityType } from '../src/types/types'; // types yolunu projene göre ayarla
import { HOUSING_OPTIONS, GamingHouse } from '../data/realestate'; // Importu ekle
import { Home, MonitorPlay, Dumbbell, HeartPulse, ArrowUpCircle, CheckCircle2, Zap, MapPin, ArrowUp, Lock } from 'lucide-react';

interface FacilitiesViewProps {
  facilities: Record<FacilityType, Facility>;
  activeHousingId: string; // Yeni prop
  coins: number;
  onUpgrade: (type: FacilityType) => void;
  onMoveHouse: (houseId: string) => void; // Yeni prop
}

// Her tesis için özel görsel ve renk temaları
const FACILITY_THEMES: Record<FacilityType, { img: string; color: string; icon: React.ElementType; accent: string }> = {
  GAMING_HOUSE: {
    img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop', // Modern Gaming Room
    color: 'from-blue-600 to-blue-900',
    accent: 'text-blue-400',
    icon: Home
  },
  STREAM_ROOM: {
    img: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2042&auto=format&fit=crop', // PC Setup with RGB
    color: 'from-purple-600 to-purple-900',
    accent: 'text-purple-400',
    icon: MonitorPlay
  },
  GYM: {
    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop', // Gym
    color: 'from-orange-600 to-orange-900',
    accent: 'text-orange-400',
    icon: Dumbbell
  },
  MEDICAL_CENTER: {
    img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop', // Medical/Tech
    color: 'from-red-600 to-red-900',
    accent: 'text-red-400',
    icon: HeartPulse
  }
};

export const FacilitiesView: React.FC<FacilitiesViewProps> = ({ facilities, activeHousingId, coins, onUpgrade, onMoveHouse }) => {
  
  const currentHouse = HOUSING_OPTIONS.find(h => h.id === activeHousingId) || HOUSING_OPTIONS[0];

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      
      {/* --- BÖLÜM 1: HEADQUARTERS (EV SEÇİMİ) --- */}
      <div>
          <div className="flex justify-between items-end border-b border-white/10 pb-6 mb-6">
              <div>
                <h2 className="text-4xl font-display font-bold text-white tracking-wide flex items-center gap-3">
                    <MapPin className="text-gold-400" /> Headquarters Selection
                </h2>
                <p className="text-gray-400 mt-2 text-lg">Choose your base of operations. Better HQs provide significant bonuses.</p>
              </div>
              <div className="flex items-center gap-3 bg-dark-900 border border-gold-500/30 px-6 py-3 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.15)] transform hover:scale-105 transition-transform">
                  <div className="w-3 h-3 rounded-full bg-gold-400 animate-pulse"></div>
                  <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Budget</span>
                  <span className="text-gold-400 font-mono font-bold text-2xl">{coins.toLocaleString()} G</span>
              </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {HOUSING_OPTIONS.map(house => {
                  const isActive = house.id === activeHousingId;
                  const canAfford = coins >= house.deposit;

                  return (
                      <div key={house.id} className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-300 ${isActive ? 'border-green-500 scale-105 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'border-dark-700 hover:border-gold-400'}`}>
                          {/* Görsel */}
                          <div className="h-32 overflow-hidden">
                              <img src={house.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={house.name} />
                              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent"></div>
                          </div>

                          {/* İçerik */}
                          <div className="p-4 bg-dark-900 h-full flex flex-col">
                              <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-bold text-white leading-tight">{house.name}</h3>
                                  {isActive && <CheckCircle2 size={18} className="text-green-500 shrink-0" />}
                              </div>
                              
                              <div className="text-xs space-y-1 mb-4 flex-1">
                                  <p className="text-gray-500 italic mb-2 h-8 line-clamp-2">{house.description}</p>
                                  <div className="flex justify-between text-gray-400 border-b border-white/5 pb-1"><span>Weekly Rent:</span> <span className="text-white font-mono">{house.weeklyRent} G</span></div>
                                  <div className="flex justify-between text-gray-400"><span>XP Bonus:</span> <span className="text-blue-400 font-bold">x{house.bonuses.xpMultiplier}</span></div>
                                  <div className="flex justify-between text-gray-400"><span>Morale:</span> <span className="text-green-400 font-bold">{house.bonuses.moraleRegen > 0 ? '+' : ''}{house.bonuses.moraleRegen}/wk</span></div>
                                  <div className="flex justify-between text-gray-400"><span>Stamina:</span> <span className="text-orange-400 font-bold">+{house.bonuses.staminaRegen}/day</span></div>
                              </div>

                              {!isActive ? (
                                  <button 
                                    onClick={() => onMoveHouse(house.id)}
                                    disabled={!canAfford}
                                    className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${canAfford ? 'bg-gold-600 hover:bg-gold-500 text-white' : 'bg-dark-800 text-gray-500 cursor-not-allowed'}`}
                                  >
                                      {canAfford ? `Move In (${house.deposit} G)` : `Deposit: ${house.deposit} G`}
                                  </button>
                              ) : (
                                  <div className="w-full py-2 bg-green-900/30 text-green-500 rounded-lg text-xs font-bold text-center uppercase border border-green-500/30 flex items-center justify-center gap-2">
                                      <CheckCircle2 size={14} /> Current HQ
                                  </div>
                              )}
                          </div>
                      </div>
                  )
              })}
          </div>
      </div>

      {/* --- BÖLÜM 2: FACILITIES (ALT YAPI) --- */}
      <div>
          <h2 className="text-3xl font-display font-bold text-white mb-6 flex items-center gap-3">
              <Zap className="text-blue-400" /> Infrastructure Upgrades
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(facilities).filter(f => f.id !== 'GAMING_HOUSE').map((facility, index) => { // Gaming House'u buradan filtrele çünkü yukarıda HQ olarak var
                  const theme = FACILITY_THEMES[facility.id];
                  const Icon = theme.icon;
                  const nextLevelCost = facility.level < facility.maxLevel ? facility.upgradeCost[facility.level - 1] : null;
                  const canAfford = nextLevelCost !== null && coins >= nextLevelCost;
                  const isMaxed = facility.level >= facility.maxLevel;

                  // Seviye Çubukları (Progress Bar)
                  const renderLevelBars = () => (
                      <div className="flex gap-1 mt-4">
                          {Array.from({ length: facility.maxLevel }).map((_, i) => (
                              <div 
                                  key={i} 
                                  className={`h-2 flex-1 rounded-full transition-all duration-500 ${i < facility.level ? `bg-gradient-to-r ${theme.color} shadow-[0_0_8px_currentColor]` : 'bg-gray-700/50'}`}
                              />
                          ))}
                      </div>
                  );

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

                                  {renderLevelBars()}

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
                                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
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
                                          <div className="w-full py-3 bg-green-500/10 border border-green-500/30 text-green-400 font-bold rounded-xl text-center uppercase tracking-widest flex items-center justify-center gap-2 text-sm">
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

const CrownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
);