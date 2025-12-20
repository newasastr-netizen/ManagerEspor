export interface RealEstateOption {
  id: string;
  name: string;
  level: number;
  cost: number;        // Satın alma/taşınma maliyeti
  maintenance: number; // Haftalık kira/bakım
  capacity: number;    // Oyuncu kapasitesi (moral bonusu için)
  description: string;
  img: string;
}

export const HOUSING_OPTIONS: RealEstateOption[] = [
  {
    id: 'starter',
    name: 'Basement Studio',
    level: 1,
    cost: 0,
    maintenance: 50,
    capacity: 5,
    description: 'A cramped basement studio. Cheap but barely fits the team. Morale recovers slowly here.',
    img: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'apartment',
    name: 'City Apartment',
    level: 2,
    cost: 2500,
    maintenance: 200,
    capacity: 6,
    description: 'A decent apartment in the city center. Good internet and separate rooms for players.',
    img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop'
  },
  {
    id: 'penthouse',
    name: 'Luxury Penthouse',
    level: 3,
    cost: 15000,
    maintenance: 800,
    capacity: 8,
    description: 'High-end living space with a view. Greatly boosts morale and attracts star players.',
    img: 'https://images.unsplash.com/photo-1512918760532-3edbed7174ce?q=80&w=2079&auto=format&fit=crop'
  },
  {
    id: 'mansion',
    name: 'Esports Mansion',
    level: 4,
    cost: 50000,
    maintenance: 2500,
    capacity: 10,
    description: 'The ultimate gaming facility. Includes private chef, gym, and pool. Maximum morale boost.',
    img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop'
  },
  {
    id: 'campus',
    name: 'Tech Campus HQ',
    level: 5,
    cost: 250000,
    maintenance: 8000,
    capacity: 15,
    description: 'A state-of-the-art campus dedicated to your team. The pinnacle of esports organizations.',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop'
  }
];