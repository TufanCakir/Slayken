import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTeam } from '../context/TeamContext';
import { useRarity } from '../context/RarityContext';
import { useFocusEffect } from '@react-navigation/native';
import FastImageWrapper from '../components/FastImageWrapper';

const STORAGE_KEY = '@slayken_summoned_players';
const TEAM_LIMIT = 5;

export default function TeamScreen({ navigation }) {
  const { team, addToTeam, removeFromTeam } = useTeam();
  const { rarities } = useRarity();
  const [summonedPlayers, setSummonedPlayers] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved);
      const enhanced = parsed.map(player => ({
        ...player,
        rarityInfo: player.rarityInfo || rarities[player.rarity],
      }));

      setSummonedPlayers(enhanced);
    } catch (error) {
      if (__DEV__) console.warn('Fehler beim Laden der Spieler:', error);
    }
  }, [rarities]);

  useFocusEffect(loadData);

  const isSelected = useCallback(player => team.some(p => p.id === player.id), [team]);

  const toggleSelect = useCallback(
    player => {
      const selected = isSelected(player);
      if (selected) {
        removeFromTeam(player.id);
      } else {
        if (team.length >= TEAM_LIMIT) {
          Alert.alert('Teamlimit erreicht', `Maximal ${TEAM_LIMIT} Charaktere erlaubt.`);
          return;
        }
        addToTeam(player);
      }
    },
    [team, isSelected, addToTeam, removeFromTeam],
  );

  const handleSave = useCallback(() => {
    Alert.alert('Team gespeichert', 'Dein Team wurde erfolgreich gespeichert.');
    navigation.goBack();
  }, [navigation]);

  const renderItem = ({ item }) => {
    const selected = isSelected(item);

    return (
      <TouchableOpacity
        onPress={() => toggleSelect(item)}
        style={[styles.card, selected && styles.selectedCard]}
      >
        <FastImageWrapper source={item.image} containerStyle={styles.image} contentFit="cover" />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={{ color: item.rarityInfo?.color || 'white' }}>
          {item.rarityInfo?.label || `Rarity: ${item.rarity}`}
        </Text>
        {selected && <Text style={styles.selected}>✅ Ausgewählt</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚔️ Wähle dein Team (max. {TEAM_LIMIT})</Text>

      <FlatList
        data={summonedPlayers}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>💾 Team bestätigen</Text>
      </TouchableOpacity>
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#222',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
  },
  selectedCard: {
    borderColor: '#00FF7F',
    backgroundColor: '#333',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  name: {
    color: '#00BFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selected: {
    marginTop: 4,
    color: '#00FF7F',
    fontWeight: 'bold',
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#00BFFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
