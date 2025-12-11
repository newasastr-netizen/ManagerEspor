import React from 'react';
import { 
  LayoutDashboard, Users, TrendingUp, Calendar, Trophy, 
  ShoppingBag, Play, Mail, LogOut, Settings, Coins 
} from 'lucide-react';
import { TeamData } from '../src/types/types';
import { TeamLogo } from './TeamLogo';

interface LayoutProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
  coins: number;
  week: number;
  teamData: TeamData | null;
  managerName: string;
  unreadMessages: number;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, currentTab, onTabChange, coins, week, teamData, managerName, unreadMessages 
}) => {
  
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'roster', icon: Users, label: 'Roster' },
    { id: 'market', icon: ShoppingBag, label: 'Market' },
    
    // YENİ: Sponsorluk ve Finans sekmesi
    { id: 'economy', icon: Coins, label: 'Economy' }, 
    
    { id: 'training', icon: TrendingUp, label: 'Training' },
    { id: 'schedule', icon: Calendar, label: 'Schedule' },
    { id: 'standings', icon: Trophy, label: 'Standings' },
    
    // YENİ: Maç ve Draft sekmesi
    { id: 'play', icon: Play, label: 'Play' }, 
    
    { id: 'inbox', icon: Mail, label: 'Inbox', badge: unreadMessages },
  ];

  return (
    <div className="flex h-screen bg-[#050910] text-slate-300 selection:bg-hextech-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-72 flex flex-col border-r border-white/5 bg-[#0f172a]/40 backdrop-blur-xl relative z-50">
        
        {/* LOGO AREA */}
        <div className="p-8 pb-4 flex flex-col items-center border-b border-white/5">
           <div className="relative group cursor-pointer">
              <div className="absolute -inset-1 bg-gradient-to-r from-hextech-500 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
              <TeamLogo team={teamData} size="w-20 h-20" className="relative rounded-full border-2 border-white/10 shadow-2xl" />
           </div>
           <h1 className="mt-4 text-2xl font-display font-bold text-white tracking-widest">{teamData?.shortName || 'MANAGER'}</h1>
           <p className="text-xs text-hextech-400 font-bold uppercase tracking-wider">{managerName}</p>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'bg-hextech-600/20 text-hextech-300 border border-hextech-500/30 shadow-[0_0_15px_-5px_rgba(6,182,212,0.3)]' 
                    : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={isActive ? 'text-hextech-400' : 'text-slate-500 group-hover:text-slate-300'} />
                  <span className={`font-display font-medium text-lg ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">{item.badge}</span>
                ) : null}
              </button>
            )
          })}
        </nav>

        {/* FOOTER INFO */}
        <div className="p-6 border-t border-white/5 bg-[#0b1120]/50">
            <div className="flex justify-between items-center mb-3">
               <div className="text-xs text-slate-500 uppercase font-bold">Funds</div>
               <div className="flex items-center gap-1 text-gold-400 font-mono font-bold text-lg">
                  <Coins size={16} /> {coins.toLocaleString()}
               </div>
            </div>
            <div className="flex justify-between items-center">
               <div className="text-xs text-slate-500 uppercase font-bold">Week</div>
               <div className="text-white font-display font-bold text-xl">{week}</div>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden relative">
        {/* Dekoratif Arka Plan Işıkları */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-hextech-900/10 to-transparent pointer-events-none" />
        
        <div className="h-full overflow-y-auto p-8 lg:p-12 relative z-10 scroll-smooth">
           {children}
        </div>
      </main>

    </div>
  );
};