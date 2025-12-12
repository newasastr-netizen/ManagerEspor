import React, { useState } from 'react';
import { LeagueKey } from '../data/leagues'; // veya '../types/types' (Dosya yapına göre kontrol et)
import { Hexagon, MapPin, Globe } from 'lucide-react';

interface LeagueMapProps {
  onSelectLeague: (league: LeagueKey) => void;
  selectedLeague: LeagueKey | null;
}

// Liglerin Harita Üzerindeki Konumları (Yüzde olarak)
const LEAGUE_LOCATIONS: Record<string, { top: string, left: string, name: string, region: string }> = {
  'LTA': { top: '32%', left: '22%', name: 'LTA North', region: 'Americas' },
  'LEC': { top: '28%', left: '51%', name: 'LEC', region: 'Europe' },
  'TCL': { top: '34%', left: '56%', name: 'TCL', region: 'Türkiye' },
  'LPL': { top: '38%', left: '76%', name: 'LPL', region: 'China' },
  'LCK': { top: '38%', left: '84%', name: 'LCK', region: 'Korea' },
};

export const LeagueMap: React.FC<LeagueMapProps> = ({ onSelectLeague, selectedLeague }) => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-5xl aspect-[16/9] bg-[#050910] rounded-2xl overflow-hidden border-2 border-hextech-900 shadow-2xl group">
      
      {/* 1. ARKA PLAN HARİTASI */}
      {/* Karanlık, teknolojik bir dünya haritası görseli */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 transition-all duration-700 group-hover:scale-105"
        style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')" }} 
      >
        {/* Haritayı "Hextech" temasına uydurmak için mavi filtre */}
        <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply"></div>
      </div>
      
      {/* Izgara Efekti (Tech Hissi İçin) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* Başlık */}
      <div className="absolute top-6 left-0 right-0 text-center pointer-events-none z-10">
        <h3 className="text-2xl font-display font-bold text-white tracking-[0.3em] uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
            Select Your Region
        </h3>
        <div className="flex items-center justify-center gap-2 text-hextech-400 text-xs mt-1">
            <Globe size={12} />
            <span>Global Servers Online</span>
        </div>
      </div>

      {/* 2. ETKİLEŞİM NOKTALARI (HOTSPOTS) */}
      {Object.entries(LEAGUE_LOCATIONS).map(([key, loc]) => {
        const isSelected = selectedLeague === key;
        const isHovered = hovered === key;

        return (
          <div
            key={key}
            className="absolute z-20 flex flex-col items-center cursor-pointer transition-all duration-300"
            style={{ top: loc.top, left: loc.left }}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelectLeague(key as LeagueKey)}
          >
             {/* İkon / Pin */}
             <div className="relative">
                 {/* Parlama Efekti */}
                 <div className={`absolute -inset-4 rounded-full blur-xl transition-all duration-500 ${isSelected ? 'bg-gold-500/60' : isHovered ? 'bg-hextech-500/60' : 'bg-transparent'}`}></div>
                 
                 {/* Hexagon Şekli */}
                 <div className={`relative w-12 h-12 flex items-center justify-center transition-transform duration-300 ${isHovered || isSelected ? 'scale-125' : 'scale-100'}`}>
                    <Hexagon 
                        className={`w-full h-full fill-current ${isSelected ? 'text-gold-500' : isHovered ? 'text-hextech-500' : 'text-slate-700'}`} 
                        strokeWidth={1.5}
                    />
                    <span className={`absolute font-bold text-[10px] ${isSelected ? 'text-black' : 'text-white'}`}>{key}</span>
                 </div>

                 {/* Konum Belirteci (Pin) */}
                 <MapPin 
                    size={16} 
                    className={`absolute -bottom-6 left-1/2 -translate-x-1/2 transition-all duration-300 ${isSelected ? 'text-gold-400 translate-y-1' : isHovered ? 'text-hextech-400 translate-y-0' : 'text-slate-600 -translate-y-1 opacity-50'}`} 
                    fill="currentColor"
                 />
             </div>

             {/* Bilgi Kartı (Tooltip) - Sadece Hover veya Seçiliyken görünür */}
             <div className={`
                absolute top-14 w-40 bg-dark-900/90 backdrop-blur-md border border-white/10 rounded-lg p-3 text-center shadow-2xl transition-all duration-300 transform origin-top
                ${isHovered || isSelected ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
             `}>
                 <div className={`text-xl font-display font-bold ${isSelected ? 'text-gold-400' : 'text-white'}`}>{loc.name}</div>
                 <div className="text-xs text-slate-400 uppercase tracking-wider">{loc.region}</div>
                 {isSelected && <div className="mt-2 text-[10px] bg-gold-500/20 text-gold-300 px-2 py-0.5 rounded border border-gold-500/30">SELECTED</div>}
             </div>
          </div>
        );
      })}

    </div>
  );
};