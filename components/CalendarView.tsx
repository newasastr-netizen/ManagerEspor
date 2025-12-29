import React, { useState, useMemo } from 'react';
import { ScheduledMatch, TeamData, GameDate } from '../src/types/types'; 
import { TeamLogo } from './TeamLogo';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Zap, Coffee, Tv, Users, Swords, Trophy } from 'lucide-react';

// Aktivite Tipleri
type ActivityType = 'TRAINING' | 'SCRIM' | 'STREAMING' | 'TEAM_BUILDING' | 'REST';

interface CalendarViewProps {
  schedule: ScheduledMatch[];
  currentDate: GameDate;
  teams: TeamData[];
  userTeamId: string;
  weeklySchedule: ActivityType[]; 
  onUpdateSchedule: (dayIndex: number, type: ActivityType) => void; 
}

const ACTIVITY_CONFIG: Record<ActivityType, { label: string, baseColor: string, icon: any }> = {
    TRAINING: { label: 'Tactical Training', baseColor: 'blue', icon: Zap },
    SCRIM: { label: 'Hard Scrims', baseColor: 'red', icon: Swords },
    STREAMING: { label: 'Live Stream', baseColor: 'purple', icon: Tv },
    TEAM_BUILDING: { label: 'Team Event', baseColor: 'green', icon: Users },
    REST: { label: 'Rest Day', baseColor: 'gray', icon: Coffee }
};

const CalendarView: React.FC<CalendarViewProps> = ({ 
    schedule, 
    currentDate, 
    teams, 
    userTeamId, 
    weeklySchedule, 
    onUpdateSchedule 
}) => {
  const [viewDate, setViewDate] = useState(() => {
      const d = new Date(currentDate.dateString);
      return { month: d.getMonth(), year: d.getFullYear() };
  });

  const calendarKey = `${viewDate.month}-${viewDate.year}`;
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => {
      setViewDate(prev => {
          const newMonth = prev.month - 1;
          if (newMonth < 0) return { month: 11, year: prev.year - 1 };
          return { ...prev, month: newMonth };
      });
  };

  const handleNextMonth = () => {
      setViewDate(prev => {
          const newMonth = prev.month + 1;
          if (newMonth > 11) return { month: 0, year: prev.year + 1 };
          return { ...prev, month: newMonth };
      });
  };

  const handleGoToToday = () => {
      const d = new Date(currentDate.dateString);
      setViewDate({ month: d.getMonth(), year: d.getFullYear() });
  };

  const calendarDays = useMemo(() => {
      const firstDayOfMonth = new Date(viewDate.year, viewDate.month, 1).getDay(); 
      const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 
      const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
      
      const days = [];
      for (let i = 0; i < startOffset; i++) days.push(null);
      for (let i = 1; i <= daysInMonth; i++) days.push(i);
      return days;
  }, [viewDate]);

  const getCellDateString = (day: number) => {
      const m = String(viewDate.month + 1).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      return `${viewDate.year}-${m}-${d}`;
  };

  const handleActivityClick = (dayIndex: number, currentType: ActivityType) => {
      const types = Object.keys(ACTIVITY_CONFIG) as ActivityType[];
      const currIdx = types.indexOf(currentType);
      const nextIdx = (currIdx + 1) % types.length;
      onUpdateSchedule(dayIndex, types[nextIdx]);
  };

  const getColorClasses = (color: string) => {
      const map: Record<string, string> = {
          blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40',
          red: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40',
          purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40',
          green: 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40',
          gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20 hover:border-gray-500/40',
      };
      return map[color] || map['gray'];
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c] rounded-2xl border border-white/5 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />

        {/* --- HEADER --- */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0 relative z-10 backdrop-blur-sm bg-[#0a0a0c]/80 border-b border-white/5 transition-all duration-300">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg shadow-blue-900/30 text-white animate-pulse-slow">
                    <CalendarIcon size={24} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white font-display tracking-tight">
                        {months[viewDate.month]} <span className="text-gray-600 font-light">{viewDate.year}</span>
                    </h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Team Schedule</p>
                </div>
            </div>
            
            <div className="flex items-center gap-1 bg-dark-900/50 p-1 rounded-lg border border-white/5">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-all active:scale-95"><ChevronLeft size={18} /></button>
                <button onClick={handleGoToToday} className="px-4 py-1.5 text-xs font-bold text-blue-400 hover:text-white transition-colors uppercase tracking-wider active:scale-95">Today</button>
                <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-all active:scale-95"><ChevronRight size={18} /></button>
            </div>
        </div>

        {/* --- DAYS HEADER --- */}
        <div className="grid grid-cols-7 border-b border-white/5 bg-[#111114] shrink-0 relative z-10">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
                <div key={d} className="py-3 text-center text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{d}</div>
            ))}
        </div>

        {/* --- CALENDAR GRID --- */}
        <div key={calendarKey} className="grid grid-cols-7 auto-rows-fr bg-[#1c1c21] gap-[1px] flex-1 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500">
            {calendarDays.map((day, index) => {
                if (!day) return <div key={`empty-${index}`} className="min-h-[170px] bg-[#0d0d10]"></div>;

                const dateStr = getCellDateString(day);
                const isToday = dateStr === currentDate.dateString;
                const dayObj = new Date(dateStr);
                const dayOfWeekIndex = (dayObj.getDay() + 6) % 7; 

                const dayMatches = schedule.filter(m => m.date === dateStr);
                const userMatch = dayMatches.find(m => m.teamAId === userTeamId || m.teamBId === userTeamId);
                const activityType = weeklySchedule[dayOfWeekIndex] || 'TRAINING';
                const activityConfig = ACTIVITY_CONFIG[activityType];

                return (
                    <div key={dateStr} className={`h-[120px] relative group overflow-hidden transition-all duration-200 z-0
                        ${isToday ? 'bg-blue-900/10' : 'bg-[#0e0e11] hover:bg-[#131316]'}
                        hover:shadow-xl hover:shadow-black/40 hover:z-20 hover:border-white/10 border border-transparent`}>
                        
                        {/* Today Highlight */}
                        {isToday && <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_15px_rgba(59,130,246,1)]" />}

                        {/* --- TOP: DATE NUMBER --- */}
                        <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10 pointer-events-none">
                            <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                {day}
                            </span>
                            {dayMatches.length > 0 && !userMatch && (
                                <span className="text-[10px] font-mono text-gray-600 bg-black/40 px-1.5 rounded border border-white/5 group-hover:border-white/10 backdrop-blur-sm">{dayMatches.length} Matches</span>
                            )}
                        </div>

                        {/* --- MIDDLE: MATCH LIST (SCROLLABLE) --- */}
                        {/* top-10: Tarih için boşluk */}
                        {/* bottom-10: Buton için boşluk */}
                        <div className="absolute top-10 bottom-11 left-0 right-0 overflow-y-auto custom-scrollbar px-2 space-y-1.5">
                            {dayMatches.map((match, i) => { 
                                const teamA = teams.find(t => t.id === match.teamAId);
                                const teamB = teams.find(t => t.id === match.teamBId);
                                const isUser = match.teamAId === userTeamId || match.teamBId === userTeamId;
                                const winnerId = match.winnerId;

                                return (
                                    <div key={match.id} style={{ animationDelay: `${i * 50}ms` }} className={`flex items-center justify-between p-1.5 rounded-lg border text-[10px] transition-all shadow-sm shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                                        isUser 
                                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-100' 
                                        : 'bg-[#18181b] border-white/5 text-gray-400'
                                    }`}>
                                        <div className="flex items-center gap-1.5 w-[35%] overflow-hidden">
                                            <TeamLogo team={teamA} size="w-3 h-3" /> 
                                            <span className={`truncate font-bold ${match.played && winnerId === teamA?.id ? 'text-white' : ''}`}>{teamA?.shortName}</span>
                                        </div>
                                        
                                        <div className="font-mono font-black text-center bg-black/30 px-1.5 py-0.5 rounded text-white min-w-[28px]">
                                            {match.played ? `${match.seriesScoreA}-${match.seriesScoreB}` : <span className="text-gray-600 text-[9px]">VS</span>}
                                        </div>

                                        <div className="flex items-center justify-end gap-1.5 w-[35%] overflow-hidden">
                                            <span className={`truncate font-bold ${match.played && winnerId === teamB?.id ? 'text-white' : ''}`}>{teamB?.shortName}</span> 
                                            <TeamLogo team={teamB} size="w-3 h-3" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* --- BOTTOM: ACTIVITY BUTTON (FIXED) --- */}
                        {/* bottom-2: En alttan 8px boşluk */}
                        <div className="absolute bottom-2 left-2 right-2 h-[30px] z-10">
                            {userMatch ? (
                                <div className="w-full h-full bg-gradient-to-r from-red-600 to-red-800 rounded-md shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 text-white border border-white/10 cursor-not-allowed">
                                    <Trophy size={12} className="text-yellow-300" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">MATCH DAY</span>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => handleActivityClick(dayOfWeekIndex, activityType)}
                                    className={`w-full h-full rounded-md border flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 active:scale-95 active:brightness-90 ${getColorClasses(activityConfig.baseColor)}`}
                                >
                                    <activityConfig.icon size={12} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{activityConfig.label}</span>
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>

        {/* --- LEGEND BAR --- */}
        <div className="px-6 py-4 bg-[#0e0e11] border-t border-white/5 shrink-0 relative z-10">
            <div className="flex flex-wrap gap-4 justify-center">
                {(Object.keys(ACTIVITY_CONFIG) as ActivityType[]).map(type => {
                    const conf = ACTIVITY_CONFIG[type];
                    return (
                        <div key={type} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] transition-colors hover:bg-white/[0.05] ${conf.baseColor === 'blue' ? 'hover:border-blue-500/30' : conf.baseColor === 'red' ? 'hover:border-red-500/30' : ''}`}>
                            <div className={`w-2 h-2 rounded-full ${conf.baseColor === 'blue' ? 'bg-blue-500' : conf.baseColor === 'red' ? 'bg-red-500' : conf.baseColor === 'purple' ? 'bg-purple-500' : conf.baseColor === 'green' ? 'bg-green-500' : 'bg-gray-500'} shadow-[0_0_8px_rgba(255,255,255,0.2)]`}></div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{conf.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default CalendarView;