import { PlayerCard, Role, TeamData, MatchResult } from '../types'; // Veya '../types/types' (dosya adına göre)
import { getTeamTier } from '../components/TeamLogo';

// Takım Gücü Hesaplama
export const calculateTeamPower = (
  roster: Record<Role, PlayerCard | null>,
  teamId: string,
  isUserTeam: boolean
): number => {
  const players = Object.values(roster).filter((p): p is PlayerCard => p !== null && p.role !== Role.COACH);
  
  if (players.length === 0) return 70; // Boş takım varsayılan güç

  // Baz güç (Oyuncu ortalaması)
  const baseTotal = players.reduce((acc, p) => acc + p.overall, 0);
  let power = Math.round(baseTotal / Math.max(1, players.length));

  // Koç bonusu
  const coach = roster[Role.COACH];
  if (coach) {
    power += Math.floor(coach.overall / 20); // Örn: 80 OVR koç +4 güç verir
  }

  // Sinerji bonusları (Basitleştirilmiş)
  // Aynı ülkeden/ligden oyuncular bonus verebilir
  const leagueCounts: Record<string, number> = {};
  players.forEach(p => {
      if(p.league) leagueCounts[p.league] = (leagueCounts[p.league] || 0) + 1;
  });
  
  Object.values(leagueCounts).forEach(count => {
      if(count >= 2) power += (count - 1); // 2 kişi +1, 3 kişi +2...
  });

  return power;
};

// Maç Simülasyonu (Draft Etkisi Eklenebilir)
export const simulateMatchSeries = (
  teamAId: string,
  teamBId: string,
  rosterA: any, // Tipleri projenizdeki gibi koruyun (Record<Role, PlayerCard>)
  rosterB: any,
  isBo5: boolean,
  draftBonus: number = 0 // YENİ: Varsayılan 0
): any => { // Tipleri MatchResult olarak koruyun
  // Takım güçlerini hesapla
  // calculateTeamPower fonksiyonunu import ettiğinden emin ol veya dosya içindeyse kullan
  // Burada senin mevcut engine.ts yapına göre düzenliyorum:
  const powerA = calculateTeamPower(rosterA, teamAId, true); 
  const powerB = calculateTeamPower(rosterB, teamBId, false);

  // Draft bonusunu A takımına (Kullanıcıya) ekle
  const finalPowerA = powerA + draftBonus;

  let winsA = 0;
  let winsB = 0;
  const gamesToWin = isBo5 ? 3 : 2;
  const maxGames = isBo5 ? 5 : 3;
  const gameScores: { user: number, enemy: number }[] = [];

  for (let i = 0; i < maxGames; i++) {
    if (winsA === gamesToWin || winsB === gamesToWin) break;

    // Rastgelelik (Underdog şansı) - Her maçta biraz değişir
    const luckFactor = (Math.random() - 0.5) * 10; 
    const effectivePowerA = finalPowerA + luckFactor;
    
    // Kazanma ihtimali (Sigmoid benzeri bir mantık)
    const diff = effectivePowerA - powerB;
    // Fark +10 ise %60, +20 ise %70 şans gibi
    let winProbabilityA = 0.50 + (diff * 0.015);
    winProbabilityA = Math.max(0.1, Math.min(0.9, winProbabilityA)); // %10 - %90 arası sınırla

    if (Math.random() < winProbabilityA) {
      winsA++;
      const kills = 12 + Math.floor(Math.random() * 15);
      const deaths = 4 + Math.floor(Math.random() * 10);
      gameScores.push({ user: kills, enemy: deaths });
    } else {
      winsB++;
      const kills = 4 + Math.floor(Math.random() * 10);
      const deaths = 12 + Math.floor(Math.random() * 15);
      gameScores.push({ user: kills, enemy: deaths });
    }
  }

  const isVictory = winsA > winsB;
  
  // Yorumcu (Draft etkisine göre yorum yap)
  let commentary = isVictory 
    ? "Fantastic strategy execution secured the win!" 
    : "Despite best efforts, the enemy team was too strong.";

  if (draftBonus > 5) commentary = "The superior draft strategy made the difference!";
  if (draftBonus < -5) commentary = "The team struggled against the enemy's counter-picks.";

  return {
    victory: isVictory,
    scoreUser: winsA,
    scoreEnemy: winsB,
    winnerId: isVictory ? teamAId : teamBId,
    gameScores,
    enemyTeam: '', 
    isBo5,
    commentary,
    playerStats: []
  };
};

// Oyuncu Gelişim Mantığı
export const processPlayerGrowth = (player: PlayerCard, facilityLevel: number = 1): PlayerCard => {
    let newStats = { ...player.stats };
    const age = player.age;
    
    // Genç oyuncular daha hızlı gelişir
    let growthChance = age < 22 ? 0.6 : (age < 26 ? 0.3 : 0.1);
    
    // Tesis bonusu
    growthChance += (facilityLevel * 0.05);

    if (Math.random() < growthChance) {
        if (Math.random() > 0.5) newStats.mechanics = Math.min(99, newStats.mechanics + 1);
        if (Math.random() > 0.5) newStats.macro = Math.min(99, newStats.macro + 1);
        if (Math.random() > 0.5) newStats.teamfight = Math.min(99, newStats.teamfight + 1);
    }

    // Yaşlı oyuncular düşüş yaşayabilir
    if (age > 27 && Math.random() < 0.2) {
        newStats.mechanics = Math.max(50, newStats.mechanics - 1);
    }

    const newOverall = Math.round((newStats.mechanics + newStats.macro + newStats.lane + newStats.teamfight) / 4);
    
    return {
        ...player,
        stats: newStats,
        overall: newOverall,
        age: player.age + 1 // Sezon sonu çağrılırsa yaş artar
    };
};

export const calculatePlayerValue = (overall: number, age: number): number => {
    // Üstel artış: 80 ortalama ile 90 ortalama arasında devasa maaş farkı olmalı
    const base = Math.pow(overall - 65, 2.5); 
    let value = Math.round(base * 2); // Çarpan

    // Genç yetenek daha pahalıdır
    if (age < 21) value = Math.round(value * 1.2);
    // Yaşlı kurtlar biraz daha ucuz
    if (age > 28) value = Math.round(value * 0.8);

    return Math.max(50, value); // Minimum 50G
};

// Haftalık Giderleri Hesapla
export const calculateWeeklyExpenses = (
    roster: Record<Role, PlayerCard | null>, 
    teamId: string
): { total: number, salaries: number, upkeep: number, breakdown: string[] } => {
    
    // 1. Oyuncu Maaşları Toplamı
    const players = Object.values(roster).filter(p => p !== null) as PlayerCard[];
    const salaries = players.reduce((acc, p) => acc + p.salary, 0);

    // 2. Takım Tier'ına Göre Giderler (Gaming House, Staff, Marketing)
    // getTeamTier fonksiyonu component içinde olduğu için burada basit bir mantık kuralım veya dışarıdan alalım.
    // Şimdilik takım ID'sine göre basit bir Tier tahmini yapalım (veya App.tsx'den Tier bilgisini yollayalım).
    // Basitlik adına:
    let tierMultiplier = 1;
    const sTierTeams = ['t1', 'geng', 'hle', 'dk', 'kt', 'g2', 'fnc', 'blg', 'jdg', 'tes'];
    if (sTierTeams.includes(teamId)) tierMultiplier = 3.5; // Büyük takımların masrafı çok olur
    else if (['kdf', 'fox', 'ns', 'bro'].includes(teamId)) tierMultiplier = 1.0; // Küçük takımlar az harcar
    else tierMultiplier = 2.0; // Orta sıra

    const baseUpkeep = 500; // Standart haftalık gider
    const upkeep = Math.round(baseUpkeep * tierMultiplier);

    const total = salaries + upkeep;

    return {
        total,
        salaries,
        upkeep,
        breakdown: [
            `Player Salaries: -${salaries}G`,
            `Gaming House & Staff: -${upkeep}G`,
            `Total Weekly Expenses: -${total}G`
        ]
    };
};