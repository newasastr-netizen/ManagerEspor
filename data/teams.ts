import { TeamData } from '../src/types/types';

export const ALL_TEAMS: TeamData[] = [
  // --- LCK (KOREA) ---
  { id: 't1', name: 'T1', shortName: 'T1', primaryColor: '#e4002bff', logoUrl: '/logos/lck/T1.png', tier: 'S', region: 'Korea', logo: '/logos/lck/T1.png', prestige: 100, fans: 50, budget: 20000 },
  { id: 'gen', name: 'Gen.G', shortName: 'GEN', primaryColor: '#AA8A00', logoUrl: '/logos/lck/GEN.png', tier: 'S', region: 'Korea', logo: '/logos/lck/GEN.png', prestige: 95, fans: 30, budget: 18000 },
  { id: 'hle', name: 'Hanwha Life Esports', shortName: 'HLE', primaryColor: '#F47B20', logoUrl: '/logos/lck/HLE.png', tier: 'S', region: 'Korea', logo: '/logos/lck/HLE.png', prestige: 90, fans: 25, budget: 19000 },
  { id: 'dk', name: 'Dplus KIA', shortName: 'DK', primaryColor: '#00C4B3', logoUrl: '/logos/lck/DK.png', tier: 'A', region: 'Korea', logo: '/logos/lck/DK.png', prestige: 85, fans: 35, budget: 15000 },
  { id: 'kt', name: 'KT Rolster', shortName: 'KT', primaryColor: '#000000', logoUrl: '/logos/lck/KT.png', tier: 'A', region: 'Korea', logo: '/logos/lck/KT.png', prestige: 80, fans: 20, budget: 14000 },
  { id: 'drx', name: 'DRX', shortName: 'DRX', primaryColor: '#5383E8', logoUrl: '/logos/lck/DRX.png', tier: 'B', region: 'Korea', logo: '/logos/lck/DRX.png', prestige: 70, fans: 15, budget: 10000 },
  { id: 'fox', name: 'FearX', shortName: 'FOX', primaryColor: '#FF6F00', logoUrl: '/logos/lck/FOX.png', tier: 'C', region: 'Korea', logo: '/logos/lck/FOX.png', prestige: 60, fans: 8, budget: 8000 },
  { id: 'ns', name: 'Nongshim RedForce', shortName: 'NS', primaryColor: '#D12229', logoUrl: '/logos/lck/NS.png', tier: 'C', region: 'Korea', logo: '/logos/lck/NS.png', prestige: 55, fans: 5, budget: 7000 },
  { id: 'kdf', name: 'Kwangdong Freecs', shortName: 'KDF', primaryColor: '#E61B23', logoUrl: '/logos/lck/KDF.png', tier: 'C', region: 'Korea', logo: '/logos/lck/KDF.png', prestige: 60, fans: 7, budget: 7500 },
  { id: 'bro', name: 'OK BRION', shortName: 'BRO', primaryColor: '#0A2240', logoUrl: '/logos/lck/BRO.png', tier: 'D', region: 'Korea', logo: '/logos/lck/BRO.png', prestige: 50, fans: 4, budget: 5000 },

  // --- LPL (CHINA) ---
  { id: 'blg', name: 'Bilibili Gaming', shortName: 'BLG', primaryColor: '#33A1F4', logoUrl: '/logos/lpl/BLG.png', tier: 'S', region: 'China', logo: '/logos/lpl/BLG.png', prestige: 95, fans: 40, budget: 25000 },
  { id: 'tes', name: 'Top Esports', shortName: 'TES', primaryColor: '#E3242B', logoUrl: '/logos/lpl/TES.png', tier: 'S', region: 'China', logo: '/logos/lpl/TES.png', prestige: 90, fans: 45, budget: 22000 },
  { id: 'wbg', name: 'Weibo Gaming', shortName: 'WBG', primaryColor: '#FF8C00', logoUrl: '/logos/lpl/WBG.png', tier: 'A', region: 'China', logo: '/logos/lpl/WBG.png', prestige: 85, fans: 35, budget: 20000 },
  { id: 'lng', name: 'LNG Esports', shortName: 'LNG', primaryColor: '#00BFFF', logoUrl: '/logos/lpl/LNG.png', tier: 'A', region: 'China', logo: '/logos/lpl/LNG.png', prestige: 85, fans: 30, budget: 18000 },
  { id: 'jdg', name: 'JD Gaming', shortName: 'JDG', primaryColor: '#E4032E', logoUrl: '/logos/lpl/JDG.png', tier: 'A', region: 'China', logo: '/logos/lpl/JDG.png', prestige: 88, fans: 32, budget: 24000 },
  { id: 'nip', name: 'Ninjas in Pyjamas', shortName: 'NIP', primaryColor: '#FBCB07', logoUrl: '/logos/lpl/NIP.png', tier: 'B', region: 'China', logo: '/logos/lpl/NIP.png', prestige: 75, fans: 20, budget: 15000 },
  { id: 'fpx', name: 'FunPlus Phoenix', shortName: 'FPX', primaryColor: '#E8451B', logoUrl: '/logos/lpl/FPX.png', tier: 'B', region: 'China', logo: '/logos/lpl/FPX.png', prestige: 70, fans: 25, budget: 12000 },
  { id: 'al', name: 'Anyone\'s Legend', shortName: 'AL', primaryColor: '#C8A557', logoUrl: '/logos/lpl/AL.png', tier: 'B', region: 'China', logo: '/logos/lpl/AL.png', prestige: 65, fans: 10, budget: 10000 },
  { id: 'omg', name: 'Oh My God', shortName: 'OMG', primaryColor: '#000000', logoUrl: '/logos/lpl/OMG.png', tier: 'C', region: 'China', logo: '/logos/lpl/OMG.png', prestige: 60, fans: 15, budget: 8000 },
  { id: 'lgd', name: 'LGD Gaming', shortName: 'LGD', primaryColor: '#CF102D', logoUrl: '/logos/lpl/LGD.png', tier: 'C', region: 'China', logo: '/logos/lpl/LGD.png', prestige: 55, fans: 12, budget: 7000 },
  { id: 'tt', name: 'TT Gaming', shortName: 'TT', primaryColor: '#F48120', logoUrl: '/logos/lpl/TT.png', tier: 'C', region: 'China', logo: '/logos/lpl/TT.png', prestige: 50, fans: 8, budget: 6000 },
  { id: 'ig', name: 'Invictus Gaming', shortName: 'IG', primaryColor: '#C7C8C8', logoUrl: '/logos/lpl/IG.png', tier: 'C', region: 'China', logo: '/logos/lpl/IG.png', prestige: 65, fans: 20, budget: 9000 },
  { id: 'we', name: 'Team WE', shortName: 'WE', primaryColor: '#B51C2C', logoUrl: '/logos/lpl/WE.png', tier: 'C', region: 'China', logo: '/logos/lpl/WE.png', prestige: 60, fans: 18, budget: 8500 },
  { id: 'edg', name: 'EDward Gaming', shortName: 'EDG', primaryColor: '#1A1A1A', logoUrl: '/logos/lpl/EDG.png', tier: 'C', region: 'China', logo: '/logos/lpl/EDG.png', prestige: 70, fans: 30, budget: 14000 },
  { id: 'rng', name: 'Royal Never Give Up', shortName: 'RNG', primaryColor: '#FDBA21', logoUrl: '/logos/lpl/RNG.png', tier: 'C', region: 'China', logo: '/logos/lpl/RNG.png', prestige: 75, fans: 35, budget: 13000 },
  { id: 'up', name: 'Ultra Prime', shortName: 'UP', primaryColor: '#00A4E8', logoUrl: '/logos/lpl/UP.png', tier: 'D', region: 'China', logo: '/logos/lpl/UP.png', prestige: 45, fans: 5, budget: 5000 },

  // --- LEC (EMEA) ---
  { id: 'g2', name: 'G2 Esports', shortName: 'G2', primaryColor: '#FFFFFF', logoUrl: '/logos/lec/G2.png', tier: 'S', region: 'Europe', logo: '/logos/lec/G2.png', prestige: 95, fans: 55, budget: 18000 },
  { id: 'fnc', name: 'Fnatic', shortName: 'FNC', primaryColor: '#FF5900', logoUrl: '/logos/lec/FNC.png', tier: 'A', region: 'Europe', logo: '/logos/lec/FNC.png', prestige: 90, fans: 50, budget: 16000 },
  { id: 'bds', name: 'Team BDS', shortName: 'BDS', primaryColor: '#E40575', logoUrl: '/logos/lec/BDS.png', tier: 'A', region: 'Europe', logo: '/logos/lec/BDS.png', prestige: 80, fans: 20, budget: 12000 },
  { id: 'koi', name: 'Movistar KOI', shortName: 'KOI', primaryColor: '#8A025E', logoUrl: '/logos/lec/KOI.png', tier: 'B', region: 'Europe', logo: '/logos/lec/KOI.png', prestige: 75, fans: 25, budget: 13000 },
  { id: 'th', name: 'Team Heretics', shortName: 'TH', primaryColor: '#F5B800', logoUrl: '/logos/lec/TH.png', tier: 'B', region: 'Europe', logo: '/logos/lec/TH.png', prestige: 70, fans: 15, budget: 11000 },
  { id: 'sk', name: 'SK Gaming', shortName: 'SK', primaryColor: '#FFFFFF', logoUrl: '/logos/lec/SK.png', tier: 'B', region: 'Europe', logo: '/logos/lec/SK.png', prestige: 65, fans: 10, budget: 9000 },
  { id: 'vit', name: 'Team Vitality', shortName: 'VIT', primaryColor: '#FEE100', logoUrl: '/logos/lec/VIT.png', tier: 'B', region: 'Europe', logo: '/logos/lec/VIT.png', prestige: 70, fans: 18, budget: 14000 },
  { id: 'gx', name: 'GIANTX', shortName: 'GX', primaryColor: '#00ADBC', logoUrl: '/logos/lec/GX.png', tier: 'C', region: 'Europe', logo: '/logos/lec/GX.png', prestige: 60, fans: 8, budget: 8000 },
  { id: 'rge', name: 'Rogue', shortName: 'RGE', primaryColor: '#00A9E0', logoUrl: '/logos/lec/RGE.png', tier: 'C', region: 'Europe', logo: '/logos/lec/RGE.png', prestige: 65, fans: 12, budget: 9000 },
  { id: 'kc', name: 'Karmine Corp', shortName: 'KC', primaryColor: '#0075C2', logoUrl: '/logos/lec/KC.png', tier: 'C', region: 'Europe', logo: '/logos/lec/KC.png', prestige: 70, fans: 45, budget: 10000 },

  // --- LTA NORTH (AMERICAS NORTH) ---
  { id: 'c9', name: 'Cloud9', shortName: 'C9', logoUrl: '/logos/lta/C9.png', primaryColor: '#00AEEF', tier: 'A', region: 'LTA North', logo: '/logos/lta_north/C9.png', prestige: 88, fans: 40, budget: 17000 },
  { id: 'tl', name: 'Team Liquid', shortName: 'TL', logoUrl: '/logos/lta/TL.png', primaryColor: '#0C223F', tier: 'A', region: 'LTA North', logo: '/logos/lta_north/TL.png', prestige: 88, fans: 35, budget: 18000 },
  { id: 'fly', name: 'FlyQuest', shortName: 'FLY', logoUrl: '/logos/lta/FLY.png', primaryColor: '#3ba43fff', tier: 'B', region: 'LTA North', logo: '/logos/lta_north/FLY.png', prestige: 80, fans: 15, budget: 14000 },
  { id: '100t', name: '100 Thieves', shortName: '100T', logoUrl: '/logos/lta/100T.png', primaryColor:'#FF0000', tier: 'B', region: 'LTA North', logo: '/logos/lta_north/100T.png', prestige: 75, fans: 25, budget: 13000 },
  { id: 'dig', name: 'Dignitas', shortName: 'DIG', logoUrl:'/logos/lta/DIG.png' , primaryColor:'#FFD100' , tier:'C' , region:'LTA North' , logo:'/logos/lta_north/DIG.png' , prestige:65 , fans: 10 , budget: 9000},
  { id: 'dsg', name: 'Disguised', shortName: 'DSG', logoUrl: '/logos/lta/DSG.png', primaryColor: '#F6B93B', tier: 'C', region: 'LTA North', logo:'/logos/lta_north/DSG.png' , prestige : 55, fans : 30, budget : 8000 },
  { id: 'lyn', name: 'Lyon Gaming', shortName: 'LYN', logoUrl: '/logos/lta/LYN.png', primaryColor: '#D32F2F', tier: 'D', region: 'LTA North', logo: '/logos/lta_north/LYN.png', prestige: 50, fans: 12, budget: 6000 },
  { id: 'shr', name: 'Shopify Rebellion', shortName: 'SHR', logoUrl: '/logos/lta/SHR.png', primaryColor: '#3a1a45ff', tier: 'D', region: 'LTA North', logo: '/logos/lta_north/SHR.png', prestige: 50, fans: 12, budget: 6000 },

  // --- LTA SOUTH (AMERICAS SOUTH - YENİ) ---
  { id: 'loud', name: 'LOUD', shortName: 'LLL', primaryColor: '#11FF00', logoUrl: '/logos/lta_south/LOUD.png', tier: 'B', region: 'LTA South', logo: '/logos/lta_south/LOUD.png', prestige: 75, fans: 60, budget: 12000 },
  { id: 'pain', name: 'paiN Gaming', shortName: 'PNG', primaryColor: '#000000', logoUrl: '/logos/lta_south/PNG.png', tier: 'B', region: 'LTA South', logo: '/logos/lta_south/PNG.png', prestige: 75, fans: 55, budget: 12000 },
  { id: 'red', name: 'RED Canids', shortName: 'RED', primaryColor: '#FF0000', logoUrl: '/logos/lta_south/RED.png', tier: 'C', region: 'LTA South', logo: '/logos/lta_south/RED.png', prestige: 65, fans: 20, budget: 9000 },
  { id: 'vks', name: 'Vivo Keyd Stars', shortName: 'VKS', primaryColor: '#800080', logoUrl: '/logos/lta_south/VKS.png', tier: 'C', region: 'LTA South', logo: '/logos/lta_south/VKS.png', prestige: 60, fans: 18, budget: 8500 },
  { id: 'fluxo', name: 'Fluxo', shortName: 'FX', primaryColor: '#4B0082', logoUrl: '/logos/lta_south/FX.png', tier: 'C', region: 'LTA South', logo: '/logos/lta_south/FX.png', prestige: 60, fans: 25, budget: 9500 },
  { id: 'furia', name: 'FURIA', shortName: 'FUR', primaryColor: '#000000', logoUrl: '/logos/lta_south/FUR.png', tier: 'C', region: 'LTA South', logo: '/logos/lta_south/FUR.png', prestige: 65, fans: 30, budget: 11000 },
  { id: 'lev', name: 'Leviatán', shortName: 'LEV', primaryColor: '#00A8FF', logoUrl: '/logos/lta_south/LEV.png', tier: 'D', region: 'LTA South', logo: '/logos/lta_south/LEV.png', prestige: 55, fans: 10, budget: 7000 },
  { id: 'isg', name: 'Isurus', shortName: 'ISG', primaryColor: '#0055AA', logoUrl: '/logos/lta_south/ISG.png', tier: 'D', region: 'LTA South', logo: '/logos/lta_south/ISG.png', prestige: 55, fans: 8, budget: 6500 },

  // --- LCP (PACIFIC - YENİ) ---
  { id: 'psg', name: 'PSG Talon', shortName: 'PSG', primaryColor: '#D6002A', logoUrl: '/logos/lcp/PSG.png', tier: 'B', region: 'LCP', logo: '/logos/lcp/PSG.png', prestige: 75, fans: 20, budget: 13000 },
  { id: 'gam', name: 'GAM Esports', shortName: 'GAM', primaryColor: '#FFD700', logoUrl: '/logos/lcp/GAM.png', tier: 'B', region: 'LCP', logo: '/logos/lcp/GAM.png', prestige: 70, fans: 45, budget: 9000 },
  { id: 'shg', name: 'SoftBank HAWKS', shortName: 'SHG', primaryColor: '#F2C600', logoUrl: '/logos/lcp/SHG.png', tier: 'C', region: 'LCP', logo: '/logos/lcp/SHG.png', prestige: 65, fans: 12, budget: 16000 },
  { id: 'dfm', name: 'DetonatioN FM', shortName: 'DFM', primaryColor: '#0055A5', logoUrl: '/logos/lcp/DFM.png', tier: 'C', region: 'LCP', logo: '/logos/lcp/DFM.png', prestige: 65, fans: 15, budget: 11000 },
  { id: 'cfo', name: 'CTBC Flying Oyster', shortName: 'CFO', primaryColor: '#003399', logoUrl: '/logos/lcp/CFO.png', tier: 'C', region: 'LCP', logo: '/logos/lcp/CFO.png', prestige: 60, fans: 10, budget: 9500 },
  { id: 'vke', name: 'Vikings Esports', shortName: 'VKE', primaryColor: '#000000', logoUrl: '/logos/lcp/VKE.png', tier: 'C', region: 'LCP', logo: '/logos/lcp/VKE.png', prestige: 60, fans: 30, budget: 7500 },
  { id: 'tsw', name: 'Team Secret Whales', shortName: 'TSW', primaryColor: '#00FFFF', logoUrl: '/logos/lcp/TSW.png', tier: 'C', region: 'LCP', logo: '/logos/lcp/TW.png', prestige: 60, fans: 12, budget: 8500 },
  { id: 'chiefs', name: 'Chiefs', shortName: 'CHF', primaryColor: '#0047AB', logoUrl: '/logos/lcp/CHF.png', tier: 'D', region: 'LCP', logo: '/logos/lcp/CHF.png', prestige: 50, fans: 5, budget: 5000 },
];