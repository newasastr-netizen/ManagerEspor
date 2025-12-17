export interface GamingHouse {
    id: string;
    name: string;
    weeklyRent: number;
    deposit: number; // Taşınma ücreti
    img: string;
    description: string;
    bonuses: {
        xpMultiplier: number; // 1.0 = Normal, 1.5 = %50 fazla XP
        moraleRegen: number;  // Haftalık moral artışı
        staminaRegen: number; // Günlük stamina yenileme
    };
}

export const HOUSING_OPTIONS: GamingHouse[] = [
    {
        id: 'starter',
        name: "Mom's Basement",
        weeklyRent: 0,
        deposit: 0,
        img: 'https://images.unsplash.com/photo-1595878715977-2e8f8df18ea8?q=80&w=1000&auto=format&fit=crop',
        description: "It's free, dark, and smells like energy drinks. Good for starting out, bad for mental health.",
        bonuses: { xpMultiplier: 1.0, moraleRegen: -1, staminaRegen: 5 }
    },
    {
        id: 'apartment',
        name: "Shared Apartment",
        weeklyRent: 250,
        deposit: 1000,
        img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop',
        description: "A decent place in the suburbs. Internet is stable, neighbors are loud.",
        bonuses: { xpMultiplier: 1.1, moraleRegen: 0, staminaRegen: 8 }
    },
    {
        id: 'villa',
        name: "Pro Gaming Villa",
        weeklyRent: 1500,
        deposit: 5000,
        img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1000&auto=format&fit=crop',
        description: "High-end facility with dedicated practice rooms and a pool. Boosts team morale significantly.",
        bonuses: { xpMultiplier: 1.3, moraleRegen: 3, staminaRegen: 12 }
    },
    {
        id: 'campus',
        name: "Esports Campus HQ",
        weeklyRent: 5000,
        deposit: 20000,
        img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop',
        description: "World-class infrastructure. The ultimate environment for champions.",
        bonuses: { xpMultiplier: 1.6, moraleRegen: 5, staminaRegen: 20 }
    }
];