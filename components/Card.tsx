import React, { useState } from 'react';
import { PlayerCard, Role, Rarity, TeamData } from '../src/types/types';
import { TeamLogo } from './TeamLogo';
import { Axe, Sparkles, Flame, Crosshair, Shield, User, CircleHelp, Coins, Globe } from 'lucide-react';

interface CardProps {
  player: PlayerCard;
  team?: TeamData;
  compact?: boolean;
  onClick?: () => void;
  actionLabel?: string;
  isOwned?: boolean;
}

const cardStyles = {
  [Rarity.COMMON]: {
    bg: 'bg-gradient-to-b from-slate-400 to-slate-700',
    border: 'border-slate-300',
    text: 'text-slate-100',
    accent: 'bg-slate-800'
  },
  [Rarity.RARE]: {
    bg: 'bg-gradient-to-b from-cyan-400 to-blue-700',
    border: 'border-cyan-200',
    text: 'text-cyan-50',
    accent: 'bg-blue-900'
  },
  [Rarity.EPIC]: {
    bg: 'bg-gradient-to-b from-purple-400 to-fuchsia-800',
    border: 'border-purple-200',
    text: 'text-purple-50',
    accent: 'bg-purple-900'
  },
  [Rarity.LEGENDARY]: {
    bg: 'bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-800',
    border: 'border-yellow-100',
    text: 'text-yellow-50',
    accent: 'bg-yellow-950'
  },
};

const RoleIcon = ({ role, size = 16, className = "" }: { role: Role | string, size?: number, className?: string }) => {
    let safeRole = role ? role.toString().toUpperCase() : 'UNKNOWN';
    if (safeRole === 'JGL') safeRole = 'JUNGLE';
    if (safeRole === 'SUP') safeRole = 'SUPPORT';
    if (safeRole === 'MID') safeRole = 'MID';

    switch (safeRole) {
        case 'TOP': return <Axe size={size} className={className} />;
        case 'JUNGLE': return <Sparkles size={size} className={className} />;
        case 'MID': return <Flame size={size} className={className} />;
        case 'ADC': return <Crosshair size={size} className={className} />;
        case 'SUPPORT': return <Shield size={size} className={className} />;
        case 'COACH': return <User size={size} className={className} />;
        default: return <CircleHelp size={size} className={className} />;
    }
};

const CountryFlag = ({ countryCode }: { countryCode?: string }) => {
    if (!countryCode || countryCode === 'xx') {
        return <Globe className="text-gray-500 w-full h-full p-0.5 opacity-50" />;
    }

    const src = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;

    return (
        <img 
            src={src} 
            alt={countryCode} 
            className="w-full h-full object-cover"
            onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('bg-gray-800');
            }}
        />
    );
};

export const Card: React.FC<CardProps> = ({ player, team, compact, onClick, actionLabel }) => {
  const style = cardStyles[player.rarity || Rarity.COMMON];
  const flagCode = player.country ? player.country.toLowerCase() : 'xx';

  if (compact) {
    return (
        <div 
          onClick={onClick}
          className={`flex items-center gap-3 p-2 rounded-lg border-l-4 cursor-pointer hover:bg-white/5 transition-all bg-dark-900/50 ${style.border.replace('border', 'border-l')}`}
        >
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
                <img src={player.imageUrl} className="w-full h-full object-cover" alt={player.name} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                    <span className="font-display font-bold text-white truncate">{player.name}</span>
                    <span className={`font-black text-lg ${style.text.replace('text-', 'text-')}`}>{player.overall}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 items-center">
                     <span className="flex items-center gap-1"><RoleIcon role={player.role} size={12}/> {player.role.toString().slice(0,3)}</span>
                     <div className="w-4 h-3 rounded-[1px] overflow-hidden opacity-80">
                        <CountryFlag countryCode={flagCode} />
                     </div>
                </div>
            </div>
             {actionLabel && <button className="px-2 py-1 text-[10px] bg-white/10 rounded uppercase font-bold text-white">{actionLabel}</button>}
        </div>
    );
  }

  return (
    <div className="relative group cursor-pointer transition-transform hover:-translate-y-2 hover:scale-105 duration-300" onClick={onClick}>
      
      <div className={`relative w-64 h-96 mx-auto clip-shield ${style.bg} p-[3px] shadow-2xl`}>
         <div className="absolute inset-[3px] bg-dark-950 clip-shield overflow-hidden">
             
             <div className={`absolute inset-0 opacity-30 bg-[url('/assets/pattern.png')] bg-cover mix-blend-overlay ${style.bg}`}></div>
             <div className="absolute inset-0 bg-shine opacity-50 z-20 pointer-events-none"></div>

             <div className="relative h-full w-full z-10 flex flex-col">
                
                <div className="flex h-[60%] relative">
                    
                    {/* SOL PANEL */}
                    <div className="w-[28%] flex flex-col items-center pt-5 gap-1 z-20 border-r border-white/5 bg-black/20 backdrop-blur-[1px]">
                        <div className={`text-4xl font-display font-black leading-none ${style.text} drop-shadow-md`}>{player.overall}</div>
                        
                        <div className="text-[10px] font-bold text-white/80 uppercase tracking-widest flex flex-col items-center gap-0.5 mb-1">
                            <RoleIcon role={player.role} size={16} className={style.text} />
                            {player.role.toString().slice(0,3)}
                        </div>

                        {/* BAYRAK KISMI (GÜNCELLENDİ) */}
                        <div className="w-6 h-4 shadow-sm border border-white/20 my-1 overflow-hidden rounded-[2px] bg-black/50">
                            <CountryFlag countryCode={flagCode} />
                        </div>

                        {team && <div className="w-7 h-7 mt-1 opacity-90"><TeamLogo team={team} size="w-7 h-7" /></div>}
                    </div>

                    {/* OYUNCU RESMİ */}
                    <div className="absolute right-0 top-3 w-[75%] h-full z-10">
                        <img 
                            src={player.imageUrl} 
                            alt={player.name} 
                            className="w-full h-full object-cover object-top drop-shadow-[-5px_0_10px_rgba(0,0,0,0.8)] mask-gradient-bottom"
                        />
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-end relative">
                    <div className="text-center mb-1 relative z-20 px-2">
                        <h2 className="text-2xl font-display font-black text-white uppercase tracking-wide leading-none drop-shadow-lg truncate">
                            {player.name}
                        </h2>
                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent mt-1"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] font-bold text-white/90 px-4 pb-2">
                        <div className="flex justify-between px-1"><span className="opacity-60">MEC</span> <span className="font-mono">{player.stats.mechanics}</span></div>
                        <div className="flex justify-between px-1"><span className="opacity-60">MAC</span> <span className="font-mono">{player.stats.macro}</span></div>
                        <div className="flex justify-between px-1"><span className="opacity-60">LNE</span> <span className="font-mono">{player.stats.lane}</span></div>
                        <div className="flex justify-between px-1"><span className="opacity-60">TF</span> <span className="font-mono">{player.stats.teamfight}</span></div>
                    </div>

                    <div className={`mt-2 mb-4 mx-4 rounded flex items-center justify-center gap-2 py-1.5 ${style.accent} border border-white/10 group-hover:opacity-0 transition-opacity duration-300`}>
                         <Coins size={12} className="text-gold-400" />
                         <span className="text-xs font-bold text-gold-300 font-mono tracking-wider">{player.salary.toLocaleString()} G</span>
                    </div>

                </div>
             </div>
         </div>
         
         <div className={`absolute inset-0 clip-shield border-[1px] border-white/30 z-30 pointer-events-none mix-blend-overlay`}></div>
      </div>
      
      {actionLabel && (
          <div className="absolute inset-x-0 bottom-6 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
             <button className="px-5 py-2 bg-white text-black font-bold uppercase rounded-full text-xs shadow-[0_0_20px_rgba(255,255,255,0.5)] transform hover:scale-105 transition-transform">
                 {actionLabel}
             </button>
          </div>
      )}
    </div>
  );
};