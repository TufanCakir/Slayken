import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRarity } from './RarityContext';

const TEAM_KEY = '@slayken_global_team';
const TeamContext = createContext(undefined);

export function TeamProvider({ children }) {
  const [team, setTeam] = useState([]);
  const { rarities } = useRarity();

  // 📥 Team laden + Rarität ergänzen
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(TEAM_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const migrated = parsed.map(member => ({
              ...member,
              rarity: member.rarity,
              rarityInfo: member.rarityInfo ?? rarities[member.rarity] ?? null,
            }));
            setTeam(migrated);
          }
        }
      } catch (err) {
        if (__DEV__) console.warn('Team Load Error:', err);
      }
    })();
  }, [rarities]);

  // 💾 Team speichern
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(TEAM_KEY, JSON.stringify(team));
      } catch (err) {
        if (__DEV__) console.warn('Team Save Error:', err);
      }
    })();
  }, [team]);

  // ➕ Mitglied hinzufügen
  const addToTeam = useCallback(
    player => {
      setTeam(prev => {
        if (prev.find(p => p.id === player.id)) return prev;
        if (prev.length >= 5) return prev;
        return [...prev, { ...player, rarityInfo: rarities[player.rarity] ?? null }];
      });
    },
    [rarities],
  );

  // ➖ Mitglied entfernen
  const removeFromTeam = useCallback(id => {
    setTeam(prev => prev.filter(p => p.id !== id));
  }, []);

  // 🔁 Team zurücksetzen
  const resetTeam = useCallback(() => {
    setTeam([]);
  }, []);

  return (
    <TeamContext.Provider value={{ team, addToTeam, removeFromTeam, resetTeam }}>
      {children}
    </TeamContext.Provider>
  );
}

// 🪐 Hook
export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within TeamProvider');
  }
  return context;
}
