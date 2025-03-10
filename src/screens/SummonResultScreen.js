import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  Button,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../styles/SummonResultStyles";

export default function SummonResultScreen() {
  const navigation = useNavigation();
  const [latestSummoned, setLatestSummoned] = useState([]);
  const [loading, setLoading] = useState(false);

  // Für die sequentielle Anzeige der enthüllten Charaktere
  const [revealedCharacters, setRevealedCharacters] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Beim Fokussieren: Letzten Summon aus AsyncStorage laden und Anzeige-Status zurücksetzen
  useFocusEffect(
    useCallback(() => {
      const loadLatestSummoned = async () => {
        try {
          const storedLatest = await AsyncStorage.getItem("latestSummoned");
          if (storedLatest) {
            const parsed = JSON.parse(storedLatest);
            setLatestSummoned(parsed);
            setRevealedCharacters([]); // Reset der bereits angezeigten Charaktere
            setCurrentIndex(0); // Start bei 0
          }
        } catch (error) {
          console.error("Fehler beim Laden des letzten Summons:", error);
        }
      };
      loadLatestSummoned();
    }, [])
  );

  // Effekt, um nacheinander jeden Charakter zu enthüllen
  useEffect(() => {
    if (latestSummoned.length > 0 && currentIndex < latestSummoned.length) {
      const timer = setTimeout(() => {
        setRevealedCharacters((prev) => [
          ...prev,
          latestSummoned[currentIndex],
        ]);
        setCurrentIndex(currentIndex + 1);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, latestSummoned]);

  // Rendert die bereits enthüllten Charaktere
  const renderRevealedCharacters = () => {
    return revealedCharacters.map((character, index) => (
      <View key={index} style={styles.characterItem}>
        {character.image && (
          <Image
            source={{ uri: character.image }}
            style={styles.characterImage}
          />
        )}
        <Text style={styles.characterName}>{character.name}</Text>
      </View>
    ));
  };

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.revealedCharactersContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#FFF" />
          ) : (
            <>
              {renderRevealedCharacters()}
              {/* Wenn noch nicht alle Charaktere enthüllt wurden, wird hier nichts zusätzliches angezeigt */}
            </>
          )}
        </ScrollView>
      </View>
      <Button title="Zurück" onPress={() => navigation.goBack()} />
    </View>
  );
}
