import { GoogleGenAI, Type } from "@google/genai";
import { PlayerCard, Role, Rarity } from "../types";
import { REAL_LCK_PLAYERS } from "../data/players";

// Initialize Gemini Client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const modelName = "gemini-2.5-flash";

/**
 * Generates a list of scoutable players for the market.
 * Prioritizes unowned players from the REAL_LCK_PLAYERS list and Free Agents before falling back to Gemini.
 */
export const scoutPlayers = async (
  count: number = 4, 
  ownedPlayerIds: Set<string>,
  freeAgents: PlayerCard[] = []
): Promise<PlayerCard[]> => {
  
  // 1. Available Free Agents (Expired contracts)
  // Filter out any that might be owned (sanity check)
  const availableFAs = freeAgents.filter(p => !ownedPlayerIds.has(p.id));
  
  // 2. Try to find real LCK players not yet owned AND not in the FA pool (avoid duplicates)
  // If a real player is in 'freeAgents', we use the FA version (which has team='FA').
  const faIds = new Set(availableFAs.map(p => p.id));
  const availableRealPlayers = REAL_LCK_PLAYERS.filter(p => !ownedPlayerIds.has(p.id) && !faIds.has(p.id));
  
  const pool = [...availableFAs, ...availableRealPlayers];

  if (pool.length >= count) {
    // Return a random shuffle of available players
    return pool.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  // If we don't have enough real players, fill the rest with AI generated ones
  const playersToReturn = pool;
  const neededCount = count - pool.length;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Generate ${neededCount} NEW, FICTIONAL rookie League of Legends players for the LCK.
      Do not use real names like Faker, Chovy, etc. Use creative IGNs.
      Include a mix of stats (Mechanics, Macro, Lane, Teamfight) between 60 and 90.
      Assign a price based on their overall stats (approx 100-2000 coins).
      Assign a rarity.
      Ensure roles cover TOP, JUNGLE, MID, ADC, SUPPORT. 
      IMPORTANT: Use full role names "JUNGLE" (not JGL) and "SUPPORT" (not SUP).
      Return only JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              team: { type: Type.STRING, description: "Use 'FA' or 'ACA' for Free Agent/Academy" },
              // DÜZELTME: Enum değerlerini tam isim yapıyoruz
              role: { type: Type.STRING, enum: ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT", "COACH"] },
              price: { type: Type.INTEGER },
              stats: {
                type: Type.OBJECT,
                properties: {
                  mechanics: { type: Type.INTEGER },
                  macro: { type: Type.INTEGER },
                  lane: { type: Type.INTEGER },
                  teamfight: { type: Type.INTEGER }
                },
                required: ["mechanics", "macro", "lane", "teamfight"]
              }
            },
            required: ["name", "team", "role", "price", "stats"]
          }
        }
      }
    });

    const rawPlayers = JSON.parse(response.text || "[]");

    // Transform to internal type with IDs
    const aiPlayers = rawPlayers.map((p: any) => {
      const avg = Math.round((p.stats.mechanics + p.stats.macro + p.stats.lane + p.stats.teamfight) / 4);
      let rarity = Rarity.COMMON;
      if (avg >= 92) rarity = Rarity.LEGENDARY;
      else if (avg >= 85) rarity = Rarity.EPIC;
      else if (avg >= 75) rarity = Rarity.RARE;

      const salary = Math.max(20, Math.floor(Math.pow(avg - 60, 2) * 0.8));
      
      // AI Gen players are usually rookies or young talents
      const age = Math.floor(Math.random() * 4) + 17; 

      return {
        id: crypto.randomUUID(),
        name: p.name,
        team: p.team,
        role: p.role as Role,
        country: p.country || 'kr',
        stats: p.stats,
        price: p.price,
        salary,
        contractDuration: 0,
        overall: avg,
        previousOverall: avg,
        age: age,
        rarity: rarity,
        imageParams: `${p.team}-${p.role}`
      };
    });

    return [...playersToReturn, ...aiPlayers];

  } catch (error) {
    console.error("Gemini scouting failed, returning fallback:", error);
    return [...playersToReturn, ...generateFallbackPlayers(neededCount)];
  }
};

/**
 * Simulates a match commentary using Gemini.
 */
export const generateMatchCommentary = async (
  userTeamName: string,
  enemyTeamName: string,
  won: boolean,
  mvpName: string
): Promise<string> => {
  try {
    const resultStr = won ? "won" : "lost";
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Write a 2-sentence intense shoutcaster summary of a League of Legends LCK match.
      The user's team "${userTeamName}" ${resultStr} against "${enemyTeamName}".
      The MVP was ${mvpName}.
      Mention a specific play (e.g., Baron steal, Elder Dragon fight, backdoor).`,
      config: {
        maxOutputTokens: 100,
        temperature: 0.8
      }
    });
    return response.text || `An intense match where ${userTeamName} ${resultStr} against ${enemyTeamName}!`;
  } catch (error) {
    return `${userTeamName} clashed with ${enemyTeamName} and ${won ? "emerged victorious" : "was defeated"}.`;
  }
};

/**
 * Fallback generator if API fails or quota exceeded.
 */
const generateFallbackPlayers = (count: number): PlayerCard[] => {
  const roles = Object.values(Role);
  const names = ['Shadow', 'Light', 'Storm', 'Blaze', 'Frost', 'Nova', 'Spark', 'Void', 'Echo', 'Drift'];

  return Array.from({ length: count }).map(() => {
    const r = roles[Math.floor(Math.random() * roles.length)];
    const n = names[Math.floor(Math.random() * names.length)];
    
    const stats = {
      mechanics: 60 + Math.floor(Math.random() * 20),
      macro: 60 + Math.floor(Math.random() * 20),
      lane: 60 + Math.floor(Math.random() * 20),
      teamfight: 60 + Math.floor(Math.random() * 20),
    };
    const avg = Math.round((stats.mechanics + stats.macro + stats.lane + stats.teamfight) / 4);

    const salary = Math.max(20, Math.floor(Math.pow(avg - 60, 2) * 0.8));
    const age = Math.floor(Math.random() * 4) + 17;

    return {
      id: crypto.randomUUID(),
      name: `Rookie ${n}`,
      team: 'ACA',
      role: r,
      stats,
      price: avg * 10,
      salary,
      contractDuration: 0,
      overall: avg,
      previousOverall: avg,
      age,
      rarity: Rarity.COMMON,
    }
  });
};