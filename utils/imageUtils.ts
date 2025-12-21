import { PlayerCard } from '../src/types/types';

export const DEFAULT_PLAYER_IMAGE = '/players/generic.png';

export const getPlayerImageUrl = (player: PlayerCard): string => {
    if (player.imageUrl && player.imageUrl.startsWith('http')) {
        return player.imageUrl;
    }

    const cleanName = player.name.toLowerCase().replace(/\s+/g, '');
    return `/players/${cleanName}.png`;
};