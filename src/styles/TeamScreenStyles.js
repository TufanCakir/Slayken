// src/styles/TeamScreenStyles.js
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // Container für den gesamten Screen (dynamischer Hintergrund)
  container: {
    flex: 1,
  },
  // Innerer Container mit Padding, um den Inhalt abzusetzen
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  // Header-Text oben auf dem Screen
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
  },
  // Informationstext, falls noch keine Charaktere beschworen wurden
  infoText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginVertical: 10,
  },
  // Standard-Stil für einen Button (Spieler-Item)
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 5,
    borderWidth: 5,
    borderRadius: 5,
    borderColor: "black",
  },
  // Stil für einen ausgewählten Button
  selectedButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 5,
    borderWidth: 5,
    borderColor: "green",
    borderRadius: 5,
    backgroundColor: "black",
  },
  // Bild-Stil für den Spieler (runder Avatar)
  playerImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 25,
  },
  // Text-Stil für den Spielernamen
  playerName: {
    fontSize: 16,
    color: "#fff",
  },
  // Text für die Anzeige der aktuellen Teamgröße
  teamSizeText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginTop: 15,
  },
});

export default styles;
