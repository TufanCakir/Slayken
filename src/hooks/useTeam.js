import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useTeam() {
  const [team, setTeam] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Beim Mounten das Team aus AsyncStorage laden
  useEffect(() => {
    const loadTeam = async () => {
      try {
        const storedTeam = await AsyncStorage.getItem("myTeam");
        if (storedTeam) {
          setTeam(JSON.parse(storedTeam));
        }
      } catch (error) {
        console.error("Fehler beim Laden des Teams:", error);
      }
    };
    loadTeam();
  }, []);

  // Falls das Team leer ist, automatisch einen Standard-Charakter laden
  useEffect(() => {
    async function loadDefaultCharacter() {
      if (team.length === 0) {
        try {
          const response = await fetch(
            "https://raw.githubusercontent.com/TufanCakir/slayken-assets/main/players.json"
          );
          const players = await response.json();
          if (players && players.length > 0) {
            const defaultTeam = [players[0]];
            setTeam(defaultTeam);
            await AsyncStorage.setItem("myTeam", JSON.stringify(defaultTeam));
            setCurrentIndex(0);
          }
        } catch (error) {
          console.error("Fehler beim Laden des Standard-Charakters:", error);
        }
      }
    }
    loadDefaultCharacter();
  }, [team.length]);

  // Der aktuell ausgewählte Kämpfer (null, falls Team leer)
  const currentFighter = team.length > 0 ? team[currentIndex] : null;

  // Charakter zum Team hinzufügen
  const addToTeam = (character) => {
    const newTeam = [...team, character];
    setTeam(newTeam);
    AsyncStorage.setItem("myTeam", JSON.stringify(newTeam));
  };

  // Charakter aus dem Team entfernen
  const removeFromTeam = (characterId) => {
    const newTeam = team.filter((c) => c.id !== characterId);
    setTeam(newTeam);
    AsyncStorage.setItem("myTeam", JSON.stringify(newTeam));
  };

  // Wechselt zum nächsten Team-Mitglied
  const handleNextPlayer = () => {
    if (team.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % team.length);
  };

  // Wechselt zum vorherigen Team-Mitglied
  const handlePrevPlayer = () => {
    if (team.length === 0) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? team.length - 1 : prevIndex - 1
    );
  };

  // Beim Tippen auf ein Teammitglied diesen als aktuellen Kämpfer setzen
  const handleSelectFighter = (selectedPlayer) => {
    const index = team.findIndex((player) => player.id === selectedPlayer.id);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  };

  return {
    team,
    setTeam,
    currentFighter,
    addToTeam,
    removeFromTeam,
    handleNextPlayer,
    handlePrevPlayer,
    handleSelectFighter,
  };
}
