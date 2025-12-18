import React from 'react';
import { 
  LayoutDashboard, Users, Calendar, Trophy, Briefcase, 
  Settings, LogOut, DollarSign, Target, ShoppingBag, 
  Dumbbell, BarChart2, Mail, Play
} from 'lucide-react';
import { TeamData } from '../src/types/types';

interface LayoutGameState {
  managerName: string;
  team: TeamData | null;
  coins: number;
  week: number;
  fanbase?: number;
}

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  gameState: LayoutGameState;
  unreadMessages?: number;
}

const SidebarItem = ({ icon: Icon, label, isActive, onClick, badge }: any) => (
  <button
    onClick={onClick}
    className={`
      group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden
      ${isActive 
        ? 'bg-gradient-to-r from-blue-600/20 to-transparent text-white shadow-[inset_4px_0_0_0_#3b82f6]' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'}
    `}
  >
    {isActive && <div className="absolute inset-0 bg-blue-500/10 blur-md" />}
    <div className={`
      relative z-10 p-1.5 rounded-lg transition-all duration-300
      ${isActive ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-dark-800 group-hover:bg-dark-700 group-hover:scale-110'}
    `}>
      <Icon size={18} />
    </div>
    <span className={`relative z-10 font-medium tracking-wide text-sm transition-transform duration-300 ${isActive ? 'translate-x-1 font-bold' : 'group-hover:translate-x-1'}`}>
      {label}
    </span>
    {badge > 0 && (
      <span className="absolute right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
        {badge}
      </span>
    )}
  </button>
);

const ResourceBadge = ({ icon: Icon, value, label, color = "blue" }: any) => {
    const colorClasses: any = {
        gold: "text-gold-400 border-gold-500/30 shadow-gold-500/10",
        blue: "text-blue-400 border-blue-500/30 shadow-blue-500/10",
        green: "text-green-400 border-green-500/30 shadow-green-500/10",
        pink: "text-pink-400 border-pink-500/30 shadow-pink-500/10",
    };

    return (
        <div className={`
            flex items-center gap-3 px-4 py-2 rounded-xl border bg-dark-900/80 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-dark-800
            ${colorClasses[color] || "text-gray-400 border-gray-500/30"}
        `}>
            <div className={`p-1.5 rounded-lg bg-white/5`}>
                <Icon size={16} />
            </div>
            <div className="flex flex-col leading-none">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-0.5">{label}</span>
                <span className="font-mono font-bold text-base text-white">{value}</span>
            </div>
        </div>
    );
};

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, gameState, unreadMessages = 0 }) => {
  
  if (!gameState || !gameState.managerName) {
      return (
        <div className="h-screen w-full bg-[#050910] flex flex-col items-center justify-center text-gray-500 gap-4">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p>Loading Manager Interface...</p>
        </div>
      );
  }

  const managerInitial = gameState.managerName.charAt(0).toUpperCase();
  const teamName = gameState.team?.name || 'No Team Assigned';
  const fanbaseDisplay = gameState.fanbase ? `${gameState.fanbase}M` : '0.5M';

  return (
    <div className="flex h-screen w-full bg-[#050910] overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none translate-y-1/2"></div>

      <aside className="w-64 h-full bg-dark-950/50 backdrop-blur-xl border-r border-white/5 flex flex-col relative z-20 transition-all duration-500">
        <div className="p-6 pb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
             <Trophy size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-white leading-none tracking-wide">ESPORTS</h1>
            <span className="text-xs text-blue-400 font-bold tracking-[0.2em] uppercase">Manager</span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar py-2">
            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-4 mb-2 mt-2">Team</div>
            <SidebarItem icon={LayoutDashboard} label="Dashboard" isActive={currentView === 'dashboard'} onClick={() => onNavigate('dashboard')} />
            <SidebarItem icon={Users} label="Roster" isActive={currentView === 'roster'} onClick={() => onNavigate('roster')} />
            <SidebarItem icon={Dumbbell} label="Training" isActive={currentView === 'training'} onClick={() => onNavigate('training')} />
            <SidebarItem icon={ShoppingBag} label="Market" isActive={currentView === 'market'} onClick={() => onNavigate('market')} />
            
            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-4 mb-2 mt-4">Season</div>
            <SidebarItem icon={Play} label="Play" isActive={currentView === 'play'} onClick={() => onNavigate('play')} /> {/* Play Butonu Eklendi */}
            <SidebarItem icon={Calendar} label="Schedule" isActive={currentView === 'schedule'} onClick={() => onNavigate('schedule')} />
            <SidebarItem icon={Target} label="Standings" isActive={currentView === 'standings'} onClick={() => onNavigate('standings')} />
            <SidebarItem icon={BarChart2} label="Stats" isActive={currentView === 'stats'} onClick={() => onNavigate('stats')} />
            
            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-4 mb-2 mt-4">Office</div>
            <SidebarItem icon={Briefcase} label="Sponsors" isActive={currentView === 'economy'} onClick={() => onNavigate('economy')} />
            <SidebarItem icon={Mail} label="Inbox" isActive={currentView === 'inbox'} onClick={() => onNavigate('inbox')} badge={unreadMessages} />
            <SidebarItem icon={Settings} label="Settings" isActive={currentView === 'settings'} onClick={() => onNavigate('settings')} />
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center border-2 border-gray-500 group-hover:border-white transition-colors">
                    <span className="font-bold text-xs text-white">{managerInitial}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{gameState.managerName}</div>
                    <div className="text-[10px] text-gray-400 truncate">{teamName}</div>
                </div>
                <LogOut size={14} className="text-gray-500 group-hover:text-red-400 transition-colors" />
            </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full relative z-10">
        <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-dark-950/30">
            <div>
                <h2 className="text-2xl font-display font-bold text-white capitalize tracking-wide">
                    {currentView.replace('-', ' ')}
                </h2>
                <p className="text-xs text-gray-500">Manage your team to victory</p>
            </div>
            <div className="flex items-center gap-3">
                <ResourceBadge icon={DollarSign} label="Budget" value={`${gameState.coins.toLocaleString()} G`} color="gold" />
                <ResourceBadge icon={Target} label="Fanbase" value={fanbaseDisplay} color="pink" />
                <ResourceBadge icon={Calendar} label="Season" value={`Week ${gameState.week}`} color="blue" />
            </div>
        </header>

        <div className="flex-1 overflow-hidden p-6">
            <div className="w-full h-full bg-dark-900/40 border border-white/5 rounded-2xl backdrop-blur-sm shadow-2xl relative overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                    {children}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};