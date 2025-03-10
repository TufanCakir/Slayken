// BattleStyles.js
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
  battleStartButton: {
    padding: 15,
    borderRadius: 10,
  },
  battleStartButtonText: {
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
  // Container für die HP-Anzeige
  hpBarContainer: {
    width: 150,
    height: 20,
    backgroundColor: colors.surface,
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 10,
  },
  // Fortschrittsbalken der HP-Anzeige
  hpBar: {
    height: "100%",
    backgroundColor: colors.success,
  },
  // Text, der die HP-Zahl anzeigt
  hpBarText: {
    color: colors.textPrimary,
    fontSize: 12,
    position: "absolute",
    width: "100%",
    textAlign: "center",
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
