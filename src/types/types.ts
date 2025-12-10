// src/types/types.ts

// 1. Mevsim Aşamaları (Enum)
export enum LPLSplitPhase {
  SPLIT_1_GROUPS = 'SPLIT_1_GROUPS',
  SPLIT_2_ASCEND_NIRVANA = 'SPLIT_2_ASCEND_NIRVANA',
  SPLIT_3_ROAD_TO_WORLDS = 'SPLIT_3_ROAD_TO_WORLDS',
  SEASON_END = 'SEASON_END',
}

export type GameStage = 
  | 'PRE_SEASON' 
  | 'GROUP_STAGE' 
  | 'PLAY_IN' 
  | 'PLAYOFFS' 
  | 'OFF_SEASON' 
  | 'MSI_PLAY_IN' 
  | 'MSI_BRACKET' 
  | 'LPL_SPLIT_2_GROUPS' // Split 2 Grup Aşaması (Ascend/Nirvana)
  | 'LPL_SPLIT_3_GROUPS'; // Split 3 (14 Takım)

// Mevcut Standing interface'ine isEliminated ekle
export interface Standing {
  teamId: string;
  name: string;
  wins: number;
  losses: number;
  gameWins: number;
  gameLosses: number;
  streak: number;
  group: 'A' | 'B' | 'C' | 'D' | 'Ascend' | 'Nirvana' | null; // Ascend ve Nirvana eklendi
  isEliminated?: boolean; // YENİ: Takımın elenip elenmediğini takip eder
}

// 2. Takım Modeli
export interface Team {
  id: string;
  name: string;
  logoUrl?: string; // İsteğe bağlı
  isEliminated: boolean; // LPL 2025 için kritik özellik!
  
  // İstatistikler (Basitleştirilmiş)
  wins: number;
  losses: number;
}

// 3. Gruplar için Veri Yapısı
// Split 1 için: { "A": [...], "B": [...] } şeklinde tutacağız.
export interface Split1Groups {
  [groupName: string]: Team[]; 
}

// Split 2 için: İki ayrı lig tablosu
export interface Split2Groups {
  ascendGroup: Team[];  // Üst Grup (İlk 8)
  nirvanaGroup: Team[]; // Alt Grup (Son 8)
}

// 4. Genel Oyun Durumu (State)
export interface SeasonState {
  currentPhase: LPLSplitPhase;
  allTeams: Team[];
  currentGroups: Split1Groups | Split2Groups | Team[] | null; // Duruma göre değişen yapı
}