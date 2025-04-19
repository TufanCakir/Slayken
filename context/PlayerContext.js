import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import playersJson from '../data/players.json';
import { useRarity } from './RarityContext';

// 🔑 Default Context
const PlayerContext = createContext(undefined);

// 🚀 Provider
export function PlayerProvider({ children }) {
  const [players, setPlayers] = useState([]);
  const { rarities } = useRarity(); // Globale Raritäten verwenden

  useEffect(() => {
    if (!playersJson || !Array.isArray(playersJson) || !rarities) return;

    const enhanced = playersJson.map(player => ({
      ...player,
      rarityInfo: rarities[player.rarity] || null,
    }));

    setPlayers(enhanced);
  }, [rarities]);

  return <PlayerContext.Provider value={{ players }}>{children}</PlayerContext.Provider>;
}

// 🧙 Hook
export function usePlayers() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayers must be used within PlayerProvider');
  }
  return context;
}
