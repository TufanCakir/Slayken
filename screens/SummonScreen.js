import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlayers } from '../context/PlayerContext';
import { useCrystals } from '../context/CrystalsContext';
import { useRarity } from '../context/RarityContext';

const STORAGE_KEY = '@slayken_summoned_players';
const FREE_MULTI_KEY = '@slayken_free_multi_used';
const COST_SINGLE = 5;
const COST_MULTI = 50;

export default function SummonScreen({ navigation }) {
  const { players } = usePlayers();
  const { crystals, removeCrystals } = useCrystals();
  const { rarities } = useRarity();

  const [summoned, setSummoned] = useState([]);
  const [freeMultiUsed, setFreeMultiUsed] = useState(false);

  // 📥 Lade gespeicherte Spieler & Free-Summon Status
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setSummoned(JSON.parse(saved));

        const freeUsed = await AsyncStorage.getItem(FREE_MULTI_KEY);
        setFreeMultiUsed(freeUsed === 'true');
      } catch (error) {
        if (__DEV__) console.warn('Fehler beim Laden der Daten:', error);
      }
    })();
  }, []);

  // 💾 Speichere Summons bei Änderung
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(summoned));
  }, [summoned]);

  // 🔁 Zufälliger Spieler
  const getRandomPlayer = useCallback(() => {
    const index = Math.floor(Math.random() * players.length);
    const player = players[index];
    const rarityKey = player.rarity;
    return {
      ...player,
      rarityInfo: rarities[rarityKey] || { color: 'white', label: 'Unknown' },
    };
  }, [players, rarities]);

  // 🔹 Einzelsummon
  const handleSingleSummon = useCallback(() => {
    if (crystals < COST_SINGLE) {
      Alert.alert('Nicht genug Crystals', `Du brauchst ${COST_SINGLE} Crystals.`);
      return;
    }

    try {
      const newPlayer = getRandomPlayer();
      setSummoned(prev => [...prev, newPlayer]);
      removeCrystals(COST_SINGLE);
      navigation.navigate('SummonResult', {
        result: encodeURIComponent(JSON.stringify([newPlayer])),
      });
    } catch (err) {
      if (__DEV__) console.warn('Fehler bei Single Summon:', err);
    }
  }, [crystals, getRandomPlayer, removeCrystals, navigation]);

  // 🔸 Multisummon (Free oder 50 Crystals)
  const handleMultiSummon = useCallback(async () => {
    try {
      const newPlayers = Array.from({ length: 10 }, getRandomPlayer);
      setSummoned(prev => [...prev, ...newPlayers]);

      if (!freeMultiUsed) {
        await AsyncStorage.setItem(FREE_MULTI_KEY, 'true');
        setFreeMultiUsed(true);
      } else {
        if (crystals < COST_MULTI) {
          Alert.alert('Nicht genug Crystals', `Du brauchst ${COST_MULTI} Crystals.`);
          return;
        }
        removeCrystals(COST_MULTI);
      }

      navigation.navigate('SummonResult', {
        result: encodeURIComponent(JSON.stringify(newPlayers)),
      });
    } catch (err) {
      if (__DEV__) console.warn('Fehler bei Multi Summon:', err);
    }
  }, [crystals, freeMultiUsed, getRandomPlayer, removeCrystals, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎴 Summon Portal</Text>
      <Text style={styles.crystals}>💎 Du hast {crystals} Crystals</Text>

      <View style={styles.buttonContainer}>
        <Button
          title={`Single Summon (${COST_SINGLE} Crystals)`}
          onPress={handleSingleSummon}
          color="#00BFFF"
        />
        <View style={{ height: 12 }} />
        <Button
          title={
            freeMultiUsed
              ? `Multi Summon (10x) (${COST_MULTI} Crystals)`
              : '⭐ Free Multi Summon (10x)'
          }
          onPress={handleMultiSummon}
          color={freeMultiUsed ? '#1E90FF' : '#32CD32'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00BFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  crystals: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  buttonContainer: {
    alignItems: 'center',
  },
});
