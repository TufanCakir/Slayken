// EventStyles.js
import { StyleSheet } from "react-native";
import colors from "../../colors"; // Pfad anpassen, falls nötig

export const styles = StyleSheet.create({
  // Container für den gesamten Screen
  container: {
    flex: 1,
  },
  // Zentrierter Container (horizontal & vertikal)
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  // Text für Ladeanzeigen
  loadingText: {
    color: colors.textPrimary,
    fontSize: 18,
    marginBottom: 20,
  },
  // Button zum Kampfbeginn
  EventStartButton: {
    padding: 15,
    borderRadius: 10,
  },
  EventStartButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  // Container, um die Energy anzuzeigen
  energyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  energyInfoText: {
    color: colors.textPrimary,
    fontSize: 16,
    marginLeft: 8,
  },
  // Vollflächige überlagernde Komponente, um den Screen tippbar zu machen
  overlay: {
    flex: 1,
  },
  // Container für die Gegner-Informationen
  enemyContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    alignItems: "center",
  },
  // Style für Charakterbilder (Gegner und Spieler)
  characterImage: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
  // Name des Gegners
  entityName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  // HP-Bar Container: Positionierung und Abstand
  hpBarContainer: {
    height: 25,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    top: 300,
  },
  // Die eigentliche HP-Bar, deren Breite dynamisch angepasst wird
  hpBar: {
    height: "100%",
    backgroundColor: "red",
  },
  // Text, der die HP anzeigt, über der HP-Bar zentriert
  hpBarText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },
  // Anzeige des verursachten Schadens
  damageText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  // Container für die Spielerinformationen
  playerContainer: {
    position: "absolute",
    bottom: 150,
    right: 20,
    alignItems: "center",
  },
  // Statusleiste für Coins & Crystals
  statusBar: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  statusText: {
    color: colors.textPrimary,
    fontSize: 14,
    marginLeft: 4,
  },
  // Footer-Bereich für die Team-Ansicht
  teamFooter: {
    width: "100%",
    paddingVertical: 10,
    bottom: 100,
  },
});
