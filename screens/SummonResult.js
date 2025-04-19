import React, { useMemo } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
import FastImageWrapper from '../components/FastImageWrapper';

export default function SummonResult({ navigation, route }) {
  const resultParam = route.params?.result;

  const parsedResult = useMemo(() => {
    try {
      return resultParam ? JSON.parse(decodeURIComponent(resultParam)) : [];
    } catch (err) {
      if (__DEV__) console.warn('Fehler beim Parsen des Summon-Results:', err);
      return [];
    }
  }, [resultParam]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <FastImageWrapper source={item.image} containerStyle={styles.image} contentFit="contain" />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.rarity}>Rarity: {item.rarity}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Beschwörungsergebnis 🎉</Text>

      {parsedResult.length === 0 ? (
        <Text style={styles.noResult}>Keine Charaktere gefunden.</Text>
      ) : (
        <FlatList
          data={parsedResult}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Zurück zum Summon Portal"
          onPress={() => navigation.goBack()}
          color="#00BFFF"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
  },
  noResult: {
    color: 'white',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 18,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#222',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  name: {
    color: '#00BFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rarity: {
    color: 'white',
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
