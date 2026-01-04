import React, { useState, useMemo } from 'react';
import { GameState, TeamData, PlayerCard, Role, LeagueKey } from '../src/types/types';
import { Card, getRarityColor } from './Card';
import { TeamLogo } from './TeamLogo';

interface TeamStatsViewProps {
  teams: TeamData[];
  userTeamId: string;
  userRoster: GameState['roster'];
  aiRosters: GameState['aiRosters'];
  getTeamPower: (teamId: string) => number;
  getActiveSynergies: (roster: Record<Role, PlayerCard | null> | Record<string, PlayerCard>) => { totalBonus: number };
}

export const TeamStatsView: React.FC<TeamStatsViewProps> = ({ teams, userTeamId, userRoster, aiRosters, getTeamPower, getActiveSynergies }) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(userTeamId);

  const selectedTeamData = useMemo(() => {
    return teams.find(t => t.id === selectedTeamId);
  }, [selectedTeamId, teams]);

  const teamsMap = useMemo(() => new Map(teams.map(team => [team.id, team])), [teams]);

  const sortedTeamStats = useMemo(() => {
    const stats = teams.map(team => {
      const roster = team.id === userTeamId ? userRoster : aiRosters[team.id];
      const players = roster ? Object.values(roster).filter((p): p is PlayerCard => p !== null && p.role !== Role.COACH) : [];
      
      const synergyBonus = roster ? getActiveSynergies(roster).totalBonus : 0;
      const totalPower = getTeamPower(team.id);
      const basePower = totalPower - synergyBonus;

      const avgAge = players.length > 0 ? players.reduce((acc, p) => acc + p.age, 0) / players.length : 0;
      
      return {
        id: team.id,
        name: team.name,
        power: totalPower,
        synergyBonus,
        avgAge,
        basePower,
      };
    });

    return stats.sort((a, b) => b.power - a.power);
  }, [teams, userRoster, aiRosters, getTeamPower, getActiveSynergies, userTeamId]);

  const isLTA = teams.some(t => t.league === 'LTA North' || t.league === 'LTA South');

  if (isLTA) {
    const northTeams = sortedTeamStats.filter(t => t.league === 'LTA North');
    const southTeams = sortedTeamStats.filter(t => t.league === 'LTA South');

    const renderTable = (groupTeams: any[], title: string) => (
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2 pl-4 border-l-4 border-blue-500">{title}</h3>
        <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-dark-800 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3 text-center">W</th>
                <th className="px-4 py-3 text-center">L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {groupTeams.map((team, idx) => (
                <tr key={team.id} className="hover:bg-dark-800/50">
                  <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 text-white font-medium">{team.name}</td>
                  <td className="px-4 py-3 text-center text-green-400">{team.wins}</td>
                  <td className="px-4 py-3 text-center text-red-400">{team.losses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        {renderTable(northTeams, 'LTA North Conference')}
        {renderTable(southTeams, 'LTA South Conference')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-dark-900 border border-dark-800 rounded-xl p-6">
        <h2 className="text-2xl font-bold font-display text-white mb-6">League Power Rankings</h2>
        <table className="w-full text-sm text-left">
          <thead className="bg-dark-950 text-gray-500 font-bold uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3 text-center">Base Power</th>
              <th className="px-4 py-3 text-center">Synergy</th>
              <th className="px-4 py-3 text-center">Total Power</th>
              <th className="px-4 py-3 text-center">Avg. Age</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800">
            {sortedTeamStats.map((stat, index) => (
              <tr key={stat.id} onClick={() => setSelectedTeamId(stat.id)} className={`cursor-pointer transition-colors ${selectedTeamId === stat.id ? 'bg-hextech-600/10' : 'hover:bg-dark-800/50'}`}>
                <td className="px-4 py-3 font-mono text-gray-500">{index + 1}</td>
                <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                  <TeamLogo team={teamsMap.get(stat.id)} size="w-5 h-5" />
                  {stat.name}
                </td>
                <td className="px-4 py-3 text-center font-mono text-gray-300">{stat.basePower}</td>
                <td className="px-4 py-3 text-center font-mono text-cyan-400">
                  {stat.synergyBonus > 0 ? `+${stat.synergyBonus}` : '-'}
                </td>
                <td className="px-4 py-3 text-center font-mono font-bold text-lg text-blue-400">{stat.power}</td>
                <td className="px-4 py-3 text-center font-mono text-gray-400">{stat.avgAge.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          {selectedTeamData && <TeamLogo team={selectedTeamData} size="w-10 h-10" />}
          <h2 className="text-2xl font-bold font-display text-white">
            {selectedTeamData?.name || 'Select a Team'}
          </h2>
        </div>

        <div className="space-y-2">
          {(() => {
            const selectedRoster = selectedTeamId === userTeamId ? userRoster : aiRosters[selectedTeamId];
            if (!selectedRoster) {
              return <p className="text-center text-gray-500 italic py-8">No roster data available for this team.</p>;
            }
            return Object.values(Role).filter(r => r !== Role.COACH).map(role => {
              const player = selectedRoster[role];
              return (
                <div key={role} className="transition-transform hover:scale-[1.02]">
                  {player ? (
                    <Card player={player} team={selectedTeamData} compact isOwned={selectedTeamId === userTeamId} />
                  ) : (
                    <div className="h-16 border-2 border-dashed border-dark-700 rounded-lg flex items-center justify-center text-gray-600 font-bold bg-dark-900/50">
                      Vacant {role}
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};