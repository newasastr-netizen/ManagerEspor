import React from 'react';
import { TeamData, Role, PlayerCard } from '../types';
import { TeamLogo } from './TeamLogo';
import { Sparkles } from 'lucide-react';

interface TeamStatsViewProps {
  teams: TeamData[];
  userTeamId: string;
  userRoster: Record<Role, PlayerCard | null>;
  aiRosters: Record<string, Record<Role, PlayerCard>>;
}

export const TeamStatsView: React.FC<TeamStatsViewProps> = ({ teams, userTeamId, userRoster, aiRosters }) => {
  
  const getTeamStats = (teamId: string) => {
    let rosterPlayers: PlayerCard[] = [];
    
    if (teamId === userTeamId) {
      rosterPlayers = Object.values(userRoster).filter((p): p is PlayerCard => p !== null);
    } else {
      const aiRoster = aiRosters[teamId];
      if (aiRoster) {
        rosterPlayers = Object.values(aiRoster);
      }
    }

    // Avg OVR
    const totalOvr = rosterPlayers.reduce((acc, p) => acc + p.overall, 0);
    const avgOvr = rosterPlayers.length > 0 ? Math.round(totalOvr / rosterPlayers.length) : 0;

    // Role Counts
    const roleCounts: Record<string, number> = {};
    Object.values(Role).forEach(r => roleCounts[r] = 0);
    rosterPlayers.forEach(p => {
        roleCounts[p.role] = (roleCounts[p.role] || 0) + 1;
    });

    // Synergy
    const teamCounts: Record<string, number> = {};
    rosterPlayers.forEach(p => {
      if (['FA', 'ACA'].includes(p.team)) return;
      teamCounts[p.team] = (teamCounts[p.team] || 0) + 1;
    });
    
    let synergyBonus = 0;
    Object.values(teamCounts).forEach(count => {
       if (count === 2) synergyBonus += 2;
       else if (count === 3) synergyBonus += 4;
       else if (count === 4) synergyBonus += 6;
       else if (count >= 5) synergyBonus += 10;
    });

    return {
        playerCount: rosterPlayers.length,
        avgOvr,
        roleCounts,
        synergyBonus,
    };
  };

  const sortedTeams = [...teams].sort((a, b) => {
      const statsA = getTeamStats(a.id);
      const statsB = getTeamStats(b.id);
      // Sort by Total Power (Avg + Synergy)
      return (statsB.avgOvr + statsB.synergyBonus) - (statsA.avgOvr + statsA.synergyBonus);
  });

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-display font-bold">League Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedTeams.map(team => {
            const stats = getTeamStats(team.id);
            const isUser = team.id === userTeamId;
            const totalPower = stats.avgOvr + stats.synergyBonus;

            return (
                <div key={team.id} className={`bg-dark-900 border ${isUser ? 'border-blue-500' : 'border-dark-800'} rounded-2xl p-4 shadow-lg flex flex-col gap-4 hover:border-dark-600 transition-colors`}>
                    <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                        <TeamLogo team={team} size="w-12 h-12" className="text-xl shadow-lg" />
                        <div>
                            <h3 className="font-bold text-lg text-white leading-none">{team.name}</h3>
                            <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                {isUser ? <span className="text-blue-400 font-bold">Your Team</span> : <span>AI Controlled</span>}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-dark-950/50 p-3 rounded-xl flex flex-col items-center justify-center">
                            <span className="text-xs text-gray-500 font-bold uppercase">Team Power</span>
                            <span className="text-2xl font-display font-bold text-white">{totalPower}</span>
                        </div>
                         <div className="bg-dark-950/50 p-3 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
                            {stats.synergyBonus > 0 && <div className="absolute top-1 right-1 opacity-50 text-hextech-400"><Sparkles size={12} /></div>}
                            <span className="text-xs text-gray-500 font-bold uppercase">Synergy</span>
                            <span className={`text-2xl font-display font-bold ${stats.synergyBonus > 0 ? 'text-hextech-400' : 'text-gray-600'}`}>+{stats.synergyBonus}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs text-gray-400 font-bold uppercase">
                            <span>AVG OVR: <span className="text-white">{stats.avgOvr}</span></span>
                            <span>{stats.playerCount}/5 Players</span>
                        </div>
                        <div className="flex justify-between gap-1 h-1.5 w-full bg-dark-950 rounded-full overflow-hidden">
                            {[Role.TOP, Role.JUNGLE, Role.MID, Role.ADC, Role.SUPPORT].map(role => (
                                <div 
                                    key={role} 
                                    className={`flex-1 transition-colors ${stats.roleCounts[role] > 0 ? 'bg-green-500' : 'bg-red-900/30'}`} 
                                    title={`${role}: ${stats.roleCounts[role] ? 'Filled' : 'Empty'}`}
                                ></div>
                            ))}
                        </div>
                         <div className="flex justify-between text-[10px] text-gray-600 font-mono">
                            {[Role.TOP, Role.JUNGLE, Role.MID, Role.ADC, Role.SUPPORT].map(role => (
                                <span key={role} className={stats.roleCounts[role] > 0 ? 'text-gray-400' : 'text-red-900/50'}>{role.substring(0,3)}</span>
                            ))}
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};