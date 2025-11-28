import React from 'react';
import { PlayerCard, Role, Rarity, TeamData } from '../types';
import { Shield, Sword, Brain, Zap, Crown, Users, Clock, TrendingUp, TrendingDown, Bandage, Frown, MessageSquare, AlertTriangle } from 'lucide-react';
import { TeamLogo } from './TeamLogo'; // TeamLogo bileşenini import ediyoruz

interface CardProps {
  player: PlayerCard;
  team?: TeamData | null; // Takım verisini prop olarak ekliyoruz
  onClick?: () => void;
  actionLabel?: string;
  disabled?: boolean;
  compact?: boolean;
  isOwned?: boolean; // To change display of price vs salary
}

// Helper component for Stat Rows with Tooltips
const StatRow = ({ label, value, description }: { label: string, value: number, description: string }) => (
  <div className="group/stat relative flex justify-between items-center text-xs border-b border-white/5 pb-1 cursor-help hover:bg-white/5 px-1 -mx-1 rounded transition-colors z-20">
    <span className="text-gray-500 font-semibold border-b border-dotted border-gray-600/50">{label}</span>
    <span className="text-white font-mono font-bold">{value}</span>
    
    {/* Tooltip */}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-dark-950/95 backdrop-blur-md border border-white/10 text-gray-200 text-[10px] leading-relaxed p-2.5 rounded-lg shadow-xl text-center opacity-0 translate-y-2 group-hover/stat:opacity-100 group-hover/stat:translate-y-0 transition-all duration-200 pointer-events-none z-50">
      {description}
      {/* Tooltip Arrow */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-dark-950 border-r border-b border-white/10 rotate-45"></div>
    </div>
  </div>
);

export const Card: React.FC<CardProps> = ({ player, team, onClick, actionLabel, disabled, compact, isOwned }) => {
  
  // Style configurations based on Rarity for the "Premium" look
  const getRarityStyles = (r: Rarity) => {
    switch (r) {
      case Rarity.LEGENDARY: 
        return {
          border: 'border-orange-400',
          shadow: 'shadow-orange-500/30',
          bg: 'bg-gradient-to-br from-gray-900 via-gray-900 to-orange-950/40',
          text: 'text-orange-400',
          glow: 'after:bg-orange-500'
        };
      case Rarity.EPIC: 
        return {
          border: 'border-purple-400',
          shadow: 'shadow-purple-500/30',
          bg: 'bg-gradient-to-br from-gray-900 via-gray-900 to-purple-950/40',
          text: 'text-purple-400',
          glow: 'after:bg-purple-500'
        };
      case Rarity.RARE: 
        return {
          border: 'border-red-400',
          shadow: 'shadow-red-500/30',
          bg: 'bg-gradient-to-br from-gray-900 via-gray-900 to-red-950/40',
          text: 'text-red-400',
          glow: 'after:bg-red-500'
        };
      default: 
        return {
          border: 'border-slate-500',
          shadow: 'shadow-slate-500/20',
          bg: 'bg-gradient-to-br from-gray-900 to-slate-900',
          text: 'text-slate-300',
          glow: 'after:bg-slate-500'
        };
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case Role.TOP: return <Shield size={16} />;
      case Role.JUNGLE: return <Users size={16} />; 
      case Role.MID: return <Zap size={16} />;
      case Role.ADC: return <Sword size={16} />;
      case Role.SUPPORT: return <Brain size={16} />;
      case Role.COACH: return <Crown size={16} />;
    }
  };

  const getGrowthIndicator = () => {
    if (!player.previousOverall) return null;
    const diff = player.overall - player.previousOverall;
    if (diff > 0) return <div className="flex items-center text-green-400 text-[10px] font-bold"><TrendingUp size={10} className="mr-0.5" />+{diff}</div>;
    if (diff < 0) return <div className="flex items-center text-red-400 text-[10px] font-bold"><TrendingDown size={10} className="mr-0.5" />{diff}</div>;
    return null;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'INJURY': return <Bandage size={12} className="text-red-500" />;
      case 'MORALE': return <Frown size={12} className="text-blue-400" />;
      case 'DRAMA': return <AlertTriangle size={12} className="text-orange-500" />;
      case 'CONTRACT': return <MessageSquare size={12} className="text-yellow-500" />;
      default: return null;
    }
  };

  const rarityStyles = getRarityStyles(player.rarity);
  const isFA = player.team === 'FA' || player.team === 'ACA';

  if (compact) {
    return (
      <>
        <style>
          {`
            @keyframes slideInRight {
              from { opacity: 0; transform: translateX(-10px); }
              to { opacity: 1; transform: translateX(0); }
            }
          `}
        </style>
        <div 
          onClick={!disabled ? onClick : undefined}
          style={{ animation: 'slideInRight 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}
          className={`relative flex items-center justify-between p-3 rounded-lg border border-dark-700 bg-dark-900/80 backdrop-blur mb-2 
            hover:bg-dark-800 hover:border-dark-600 hover:shadow-lg hover:shadow-hextech-500/10 hover:translate-x-1
            active:scale-[0.98] active:bg-dark-800
            transition-all duration-200 cursor-pointer group overflow-hidden 
            ${disabled ? 'opacity-50 cursor-not-allowed hover:translate-x-0 active:scale-100' : ''}`}
        >
          {/* Left Color Bar */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${rarityStyles.bg.replace('bg-gradient-to-br', '')} ${rarityStyles.glow.replace('after:bg-', 'bg-')}`}></div>

          <div className="flex items-center gap-3 pl-2">
            <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-gray-300 border border-white/10 group-hover:scale-110 transition-transform">
               {getRoleIcon(player.role)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display font-bold text-white group-hover:text-hextech-400 transition-colors">{player.name}</h4>
                {player.previousOverall && player.overall !== player.previousOverall && (
                  <span className={`text-[9px] font-bold px-1 rounded ${player.overall > player.previousOverall ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {player.overall > player.previousOverall ? '+' : ''}{player.overall - player.previousOverall}
                  </span>
                )}
                {/* Status Icons */}
                {player.events && player.events.length > 0 && (
                  <div className="flex gap-1">
                    {player.events.map(ev => (
                       <div key={ev.id} className="relative group/evt">
                          {getEventIcon(ev.type)}
                          <div className="absolute bottom-full left-0 mb-1 w-32 bg-black border border-white/20 text-[9px] text-gray-300 p-1.5 rounded opacity-0 group-hover/evt:opacity-100 pointer-events-none z-50">
                             {ev.title}: {ev.duration} games left
                          </div>
                       </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-gray-500">
                <div className="flex items-center gap-1.5">
                  <TeamLogo team={team} size="w-3 h-3" />
                  <span>{player.team}</span>
                </div>
                <span className="text-gray-600">•</span>
                <span>{player.age}yo</span>
                {player.contractDuration > 0 && (
                  <>
                   <span className="text-gray-600">•</span>
                   <span className="flex items-center gap-0.5 text-blue-400">
                     <Clock size={10} /> {player.contractDuration}S
                   </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xl font-display font-bold ${rarityStyles.text} group-hover:scale-110 transition-transform`}>{player.overall}</div>
          </div>
        </div>
      </>
    )
  }

  // Full Card View
  return (
    <>
      <style>
        {`
          @keyframes popIn {
            from { opacity: 0; transform: scale(0.9) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}
      </style>
      <div 
        style={{ animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
        className={`relative w-full aspect-[2/3] rounded-2xl p-[2px] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl active:scale-[0.98] group`}
      >
        {/* Glow Effect Layer */}
        <div className={`absolute inset-0 rounded-2xl opacity-50 blur-md transition-opacity duration-500 group-hover:opacity-100 ${rarityStyles.shadow} bg-current text-${rarityStyles.text.split('-')[1]}-500`}></div>
        
        {/* Main Card Container */}
        {/* NOTE: overflow-hidden removed from here to allow tooltips to pop out. 
            We apply overflow-hidden to the header and footer specifically. */}
        <div className={`relative w-full h-full rounded-2xl flex flex-col ${rarityStyles.bg} border-2 ${rarityStyles.border} group-hover:border-opacity-100 transition-colors`}>
          
          {/* Top Header */}
          <div className="relative h-1/2 w-full overflow-hidden bg-black/50 rounded-t-[14px]">
             {/* Placeholder Portrait */}
             <div className={`absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-110`} 
                  style={{backgroundImage: `url('${player.imageUrl}')`}}>
             </div>
             
             <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
             
             {/* Active Events Overlay */}
             {player.events && player.events.length > 0 && (
                <div className="absolute top-2 left-0 right-0 flex justify-center gap-2 z-20">
                    {player.events.map(ev => (
                       <div key={ev.id} className="relative group/evt bg-black/80 backdrop-blur border border-white/20 p-1.5 rounded-full shadow-lg">
                          {getEventIcon(ev.type)}
                          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-40 bg-dark-900 border border-red-500/50 text-white text-[10px] p-2 rounded shadow-xl opacity-0 group-hover/evt:opacity-100 pointer-events-none z-50">
                             <div className="font-bold text-red-300 mb-1">{ev.title}</div>
                             <div className="text-gray-400 mb-1">{ev.description}</div>
                             <div className="font-mono text-xs font-bold">{ev.duration} games left</div>
                             <div className="mt-1 pt-1 border-t border-white/10 text-red-400">
                                {Object.entries(ev.penalty).map(([k, v]) => (
                                    <div key={k}>-{v} {k.toUpperCase()}</div>
                                ))}
                             </div>
                          </div>
                       </div>
                    ))}
                </div>
             )}

             {/* Top Left OVR */}
             <div className="absolute top-3 left-3 flex flex-col items-center z-10">
               <div className={`text-4xl font-display font-bold leading-none ${rarityStyles.text} drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform`}>
                  {player.overall}
               </div>
               {getGrowthIndicator()}
               <div className="text-[9px] font-bold text-white/60 tracking-widest uppercase mt-1">OVR</div>
             </div>

             {/* Top Right Role Icon */}
             <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center text-white drop-shadow-md z-10 group-hover:rotate-12 transition-transform duration-300">
                {getRoleIcon(player.role)}
             </div>

             {/* Contract & Age Badge */}
             <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                {player.contractDuration > 0 ? (
                    <div className="flex items-center gap-1 bg-black/70 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-white border border-white/10">
                        <Clock size={10} className="text-blue-400" />
                        <span>{player.contractDuration} Seasons</span>
                    </div>
                ) : <div></div>}
                
                <div className="flex items-center gap-1 bg-black/70 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-gray-300 border border-white/10">
                    <span>{player.age} Years</span>
                </div>
             </div>
          </div>

          {/* Bottom Body */}
          <div className="flex-1 relative p-4 flex flex-col justify-between bg-gradient-to-b from-transparent to-black/80 rounded-b-[14px]">
             
             {/* Player Info */}
             <div className="text-right mb-2">
               <div className="flex justify-end items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-widest mb-1">
                  <span>{player.role}</span> | <TeamLogo team={team} size="w-4 h-4" /> <span>{player.team}</span>
               </div>
               <h3 className="font-display font-black text-2xl text-white uppercase tracking-tight leading-none truncate group-hover:text-white transition-colors">{player.name}</h3>
               
               {/* Financials Info */}
               <div className="flex justify-end items-center gap-3 mt-1">
                 {/* Salary */}
                 <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <span>Salary:</span>
                    <span className="font-mono text-white">{player.salary}G</span>
                 </div>
                 {/* Transfer Fee (Only show if not owned and not FA) */}
                 {!isOwned && !isFA && (
                    <div className="flex items-center gap-1 text-[10px] text-orange-400">
                      <span>Fee:</span>
                      <span className="font-mono">{player.price}G</span>
                    </div>
                 )}
               </div>
             </div>

             {/* Stats Grid */}
             <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                <StatRow 
                  label="MECH" 
                  value={player.stats.mechanics} 
                  description="Reflexes, APM, skillshot accuracy, and micro-play execution." 
                />
                <StatRow 
                  label="MACRO" 
                  value={player.stats.macro} 
                  description="Map awareness, objective control, rotations, and shotcalling." 
                />
                <StatRow 
                  label="LANE" 
                  value={player.stats.lane} 
                  description="CS efficiency, trading patterns, turret pressure, and 1v1 dominance." 
                />
                <StatRow 
                  label="TEAM" 
                  value={player.stats.teamfight} 
                  description="Damage output, positioning, target selection, and clutch factor." 
                />
             </div>

             {/* Action Button */}
             {actionLabel && (
               <button 
                 onClick={(e) => {
                   e.stopPropagation();
                   onClick && onClick();
                 }}
                 disabled={disabled}
                 className={`w-full py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all duration-200 active:scale-95 flex items-center justify-center gap-2
                   ${disabled 
                     ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
                     : `bg-white text-black hover:bg-gray-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] border border-white hover:-translate-y-0.5`}`}
               >
                 {actionLabel}
               </button>
             )}
          </div>
        </div>
      </div>
    </>
  );
};
