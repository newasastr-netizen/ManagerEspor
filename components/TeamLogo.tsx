import React, { useState } from 'react';
import { TeamData } from '../types';

interface TeamLogoProps {
  team: TeamData | null | undefined;
  size?: string;
  className?: string;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({ team, size = "w-8 h-8", className = "" }) => {
  const [imgError, setImgError] = useState(false);

  if (!team) return <div className={`${size} bg-dark-800 rounded-lg ${className}`}></div>;

  // If we have a logo and it hasn't errored, show the image on transparent background
  if (team.logoUrl && !imgError) {
    return (
      <div className={`${size} relative flex items-center justify-center shrink-0 ${className}`}>
         <img 
           src={team.logoUrl} 
           alt={team.shortName} 
           className="w-full h-full object-contain drop-shadow-md"
           onError={() => setImgError(true)}
           loading="lazy"
         />
      </div>
    );
  }

  // Fallback: Colored Box with Letter
  // className passes through text styling like text-xl, text-white etc.
  return (
    <div 
      className={`${size} relative rounded flex items-center justify-center shrink-0 overflow-hidden shadow-lg border border-white/10 ${className}`} 
      style={{ backgroundColor: team.primaryColor }}
    >
       <span className="font-display font-bold text-white drop-shadow-md leading-none select-none text-[inherit]">
         {team.shortName.substring(0, 1)}
       </span>
    </div>
  );
};
