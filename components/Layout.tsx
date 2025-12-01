import React from 'react';
import { LayoutDashboard, ShoppingBag, Users, PlayCircle, Coins, UserCircle, Trophy, CalendarDays, BarChart3, Dumbbell } from 'lucide-react';
import { TeamData } from '../types';
import { TeamLogo } from './TeamLogo';

interface LayoutProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
  coins: number;
  week: number;
  teamData: TeamData | null;
  managerName: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentTab, onTabChange, coins, week, teamData, managerName }) => {
  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'roster', label: 'My Team', icon: <Users size={20} /> },
    { id: 'training', label: 'Training', icon: <Dumbbell size={20} /> },
    { id: 'market', label: 'Transfer', icon: <ShoppingBag size={20} /> },
    { id: 'schedule', label: 'Schedule', icon: <CalendarDays size={20} /> },
    { id: 'standings', label: 'Standings', icon: <Trophy size={20} /> },
    { id: 'stats', label: 'League Stats', icon: <BarChart3 size={20} /> },
    { id: 'play', label: week === 0 ? 'Season Start' : 'Play', icon: <PlayCircle size={20} /> },
  ];

  const primaryColor = teamData?.primaryColor || '#0ea5e9';

  return (
    <div className="flex h-screen bg-dark-950 text-gray-100 font-sans selection:bg-hextech-500 selection:text-white">
      
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-dark-900 border-r border-dark-800 flex flex-col items-center lg:items-stretch py-6 z-20 shadow-2xl">
        {/* Team Header */}
        <div className="mb-10 px-4 flex items-center justify-center lg:justify-start gap-3">
          <TeamLogo 
             team={teamData} 
             size="w-10 h-10" 
             className="rounded-lg shadow-lg text-xl"
          />
          <div className="hidden lg:flex flex-col">
            <h1 className="font-display font-bold text-xl text-white leading-none tracking-tight">
              {teamData?.shortName || 'LCK'}
            </h1>
            <span className="text-xs text-gray-400 uppercase tracking-widest">Manager 25</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 w-full space-y-2 px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center justify-center lg:justify-start gap-4 p-3 rounded-xl transition-all duration-200 group relative overflow-hidden`}
            >
              {/* Active Background with dynamic team color */}
              {currentTab === tab.id && (
                 <div 
                    className="absolute inset-0 opacity-20"
                    style={{ backgroundColor: primaryColor }}
                 ></div>
              )}

              <div className={`${currentTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-white'} z-10`}>
                {tab.icon}
              </div>
              <span className={`hidden lg:block font-semibold text-sm tracking-wide z-10 ${currentTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                {tab.label}
              </span>
              
              {/* Active Indicator Bar */}
              {currentTab === tab.id && (
                <div 
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                  style={{ backgroundColor: primaryColor }}
                ></div>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Stats */}
        <div className="mt-auto px-4 pt-6 border-t border-dark-800">
          {/* Manager Info */}
          <div className="hidden lg:flex items-center gap-3 mb-4 px-2">
            <UserCircle size={24} className="text-gray-500" />
            <div className="overflow-hidden">
               <div className="text-sm font-bold text-white truncate">{managerName || 'Manager'}</div>
               <div className="text-xs text-gray-500">Head Coach</div>
            </div>
          </div>

          <div className="bg-dark-950 rounded-xl p-4 border border-dark-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase font-bold">Budget</span>
              <Coins size={14} className="text-gold-400" />
            </div>
            <span className="font-display text-xl font-bold text-gold-400 tracking-wider">{coins.toLocaleString()} G</span>
            
            <div className="h-px bg-dark-800 my-1"></div>
             <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase font-bold">Week</span>
              <span className="font-display text-lg text-white">
                {week > 9 ? 'Playoffs' : (week === 0 ? <span className="text-xs">Pre-Season</span> : week)}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Background Decoration */}
        <div 
           className="absolute top-0 left-0 w-full h-96 opacity-10 blur-3xl -z-10 pointer-events-none rounded-full translate-y-[-50%]"
           style={{ backgroundColor: primaryColor }}
        ></div>
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};