import React, { useState } from 'react';
import { LEAGUES } from '../data/leagues';
import { LeagueKey } from '../src/types/types'; 
import { Trophy, Swords, Star, Zap, Flame, Globe, Check, ChevronRight, Users } from 'lucide-react';

interface LeagueMapProps {
  onSelectLeague: (leagueId: LeagueKey) => void;
  selectedLeague: LeagueKey | null;
}

// HARİTA KAYDIRMA AYARLARI (Shift)
const MAP_CONFIG: Record<string, { top: string; left: string; shift: string }> = {
    LTA_NORTH: { top: '30%', left: '18%', shift: 'translate-x-[20%]' },
    LTA_SOUTH: { top: '65%', left: '28%', shift: 'translate-x-[15%]' },
    LEC: { top: '32%', left: '52%', shift: 'translate-x-0' },
    LPL: { top: '40%', left: '76%', shift: '-translate-x-[15%]' },
    LCK: { top: '38%', left: '84%', shift: '-translate-x-[20%]' },
    LCP: { top: '60%', left: '82%', shift: '-translate-x-[18%]' }
};

const LEAGUE_ICONS: Record<string, React.ElementType> = {
    LCK: Trophy,
    LPL: Swords,
    LEC: Zap,
    LTA_NORTH: Flame,
    LCP: Star,
    LTA_SOUTH: Globe
};

const LEAGUE_COLORS: Record<string, string> = {
    LCK: 'text-blue-400',
    LPL: 'text-red-500',
    LEC: 'text-teal-400',
    LTA_NORTH: 'text-yellow-400',
    LCP: 'text-orange-400',
    LTA_SOUTH: 'text-green-400'
};

export const LeagueMap: React.FC<LeagueMapProps> = ({ onSelectLeague, selectedLeague }) => {
  const [hoveredLeague, setHoveredLeague] = useState<LeagueKey | null>(null);
  const activeKey = hoveredLeague || selectedLeague;
  // @ts-ignore
  const activeLeague = activeKey ? LEAGUES[activeKey] : null;
  const mapImage = "https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg";
  
  const currentShift = selectedLeague ? (MAP_CONFIG[selectedLeague]?.shift || 'translate-x-0') : 'translate-x-0';

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#050910] animate-fade-in">
        
        <div className={`
            absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out
            ${currentShift}
        `}>
             <div 
                className={`w-full h-full bg-contain bg-no-repeat bg-center transform transition-all duration-700 ${activeLeague ? 'opacity-30 blur-[1px]' : 'opacity-100'}`}
                style={{ 
                    backgroundImage: `url(${mapImage})`, 
                    filter: 'invert(1) hue-rotate(180deg) brightness(0.6) contrast(1.2)' 
                }}
            />
        </div>

        <div className={`
            relative w-full max-w-[1200px] aspect-[16/9] z-10 
            transition-transform duration-700 ease-out
            ${currentShift}
        `}>
            {Object.keys(MAP_CONFIG).map((key) => {
                const leagueKey = key as LeagueKey;
                const pos = MAP_CONFIG[leagueKey];
                const isSelected = selectedLeague === leagueKey;
                const isHovered = hoveredLeague === leagueKey;
                const isDimmed = (selectedLeague && !isSelected) || (!selectedLeague && hoveredLeague && !isHovered);

                return (
                    <button
                        key={key}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 group outline-none transition-all duration-500 ease-out
                            ${isDimmed ? 'opacity-20 scale-75 grayscale' : 'opacity-100 scale-100'}
                        `}
                        style={{ top: pos.top, left: pos.left }}
                        onMouseEnter={() => setHoveredLeague(leagueKey)}
                        onMouseLeave={() => setHoveredLeague(null)}
                        onClick={() => onSelectLeague(leagueKey)}
                    >
                        <div className={`
                            relative flex items-center justify-center w-6 h-6 md:w-10 md:h-10 rounded-full border-2 transition-all duration-300 shadow-2xl
                            ${isSelected 
                                ? 'bg-yellow-500 border-white scale-125 shadow-[0_0_50px_rgba(234,179,8,0.8)]' 
                                : isHovered 
                                    ? 'bg-cyan-500 border-cyan-300 scale-150 shadow-[0_0_40px_rgba(6,182,212,0.8)]' 
                                    : 'bg-slate-800 border-slate-600 hover:scale-110'}
                        `}>
                            {React.createElement(LEAGUE_ICONS[key] || Trophy, { 
                                size: 16, 
                                className: `${isSelected || isHovered ? 'text-white' : 'text-gray-400'}` 
                            })}
                        </div>
                        
                        <div className={`
                            absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black tracking-widest px-2 py-1 rounded bg-black/60 backdrop-blur-sm border border-white/10
                            transition-all duration-300
                            ${isSelected || isHovered ? 'opacity-0 translate-y-2' : 'text-gray-500 opacity-100 group-hover:text-white'}
                        `}>
                            {key.replace('_', ' ')}
                        </div>
                    </button>
                );
            })}
        </div>

        <div className={`
            absolute top-0 left-0 h-full w-[500px] z-40
            bg-gradient-to-r from-black via-slate-950 to-transparent
            flex flex-col justify-center pl-16 pr-10
            transform transition-all duration-500 cubic-bezier(0.25, 0.46, 0.45, 0.94)
            ${activeLeague ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}
        `}>
            {activeLeague && (
                <div className="animate-in slide-in-from-left-10 duration-700 fade-in flex flex-col h-full justify-center relative">
                    
                    <div className="absolute -left-20 top-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none scale-150">
                         {React.createElement(LEAGUE_ICONS[activeKey!] || Trophy, { size: 600 })}
                    </div>

                    <div className="space-y-8 relative z-10 pl-4">
                        <div>
                            <div className={`text-xs font-bold tracking-[0.4em] uppercase mb-4 flex items-center gap-2 ${LEAGUE_COLORS[activeKey!] || 'text-gray-400'}`}>
                                <Globe size={14}/> {activeLeague.region}
                            </div>
                            <h1 className="text-8xl font-black font-display text-white tracking-tighter leading-none mb-6 drop-shadow-2xl">
                                {activeLeague.name}
                            </h1>
                        </div>

                        <button
                            onClick={() => activeKey && onSelectLeague(activeKey)}
                            className={`
                                group w-full max-w-sm py-5 px-6 rounded-2xl font-black text-sm uppercase tracking-[0.15em] flex items-center justify-between transition-all duration-300 shadow-2xl border
                                ${selectedLeague === activeKey 
                                    ? 'bg-gradient-to-r from-green-600 to-green-500 border-green-400/50 text-white cursor-default ring-4 ring-green-500/20 shadow-green-900/50' 
                                    : 'bg-white border-white text-black hover:bg-gray-100 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]'}
                            `}
                        >
                            <span>
                                {selectedLeague === activeKey ? 'Region Confirmed' : 'Select Region'}
                            </span>
                            {selectedLeague === activeKey ? (
                                <div className="bg-green-800 p-1.5 rounded-full"><Check size={18} /></div>
                            ) : (
                                <div className="bg-black text-white p-1.5 rounded-full group-hover:translate-x-1 transition-transform"><ChevronRight size={18} /></div>
                            )}
                        </button>

                        <p className="text-lg text-gray-400 leading-relaxed font-medium max-w-sm border-l-2 border-white/10 pl-6 py-2">
                            Join the <span className="text-white font-bold">{activeLeague.name}</span>. Battle against {activeLeague.teams.length} teams in a {activeLeague.settings.format} format for glory.
                        </p>

                        <div className="flex gap-10 pt-6 border-t border-white/5 opacity-80 pl-2">
                            <div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Teams</div>
                                <div className="text-3xl font-mono font-bold text-white flex items-center gap-2">
                                    <Users size={20} className="text-blue-500"/> {activeLeague.teams.length}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Format</div>
                                <div className="text-2xl font-mono font-bold text-white flex items-center gap-2">
                                    <Trophy size={20} className="text-gold-500"/> {activeLeague.settings.format}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
        
        {!activeLeague && (
             <div className="absolute left-24 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                 <h2 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent font-display tracking-tighter">
                     SELECT<br/>REGION
                 </h2>
             </div>
        )}

    </div>
  );
};