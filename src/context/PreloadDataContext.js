import React, { createContext, useState, useEffect } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { Asset } from "expo-asset";

export const PreloadDataContext = createContext({
  backgrounds: [],
  enemies: [],
  players: [],
});

export const PreloadDataProvider = ({ children }) => {
  const [backgrounds, setBackgrounds] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // JSON-URLs – passe diese an deine Endpunkte an
  const backgroundsUrl =
    "https://raw.githubusercontent.com/TufanCakir/slayken-assets/refs/heads/main/backgrounds.json";
  const enemiesUrl =
    "https://raw.githubusercontent.com/TufanCakir/slayken-assets/refs/heads/main/enemies.json";
  const playersUrl =
    "https://raw.githubusercontent.com/TufanCakir/slayken-assets/refs/heads/main/players.json";

  useEffect(() => {
    async function preloadData() {
      try {
        // Lade alle JSON-Daten parallel
        const [bgRes, enemyRes, playerRes] = await Promise.all([
          fetch(backgroundsUrl),
          fetch(enemiesUrl),
          fetch(playersUrl),
        ]);

        if (!bgRes.ok || !enemyRes.ok || !playerRes.ok) {
          throw new Error(
            "Ein oder mehrere Datenquellen sind nicht erreichbar."
          );
        }

        const backgroundsData = await bgRes.json();
        const enemiesData = await enemyRes.json();
        const playersData = await playerRes.json();

        // Optional: Preload der Assets, wenn URLs vorhanden sind
        await Promise.all([
          ...backgroundsData.map((bg) =>
            bg.url ? Asset.fromURI(bg.url).downloadAsync() : Promise.resolve()
          ),
          ...enemiesData.map((enemy) =>
            enemy.image
              ? Asset.fromURI(enemy.image).downloadAsync()
              : Promise.resolve()
          ),
          ...playersData.map((player) =>
            player.image
              ? Asset.fromURI(player.image).downloadAsync()
              : Promise.resolve()
          ),
        ]);

        // Daten in die States setzen
        setBackgrounds(backgroundsData);
        setEnemies(enemiesData);
        setPlayers(playersData);
      } catch (err) {
        console.error("Fehler beim Preloading der Daten:", err);
      } finally {
        setLoading(false);
      }
    }

    preloadData();
  }, []);

  if (loading) {
    // Während des globalen Ladens zeigen wir einen Vollbild-Ladeindikator
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <PreloadDataContext.Provider value={{ backgrounds, enemies, players }}>
      {children}
    </PreloadDataContext.Provider>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
