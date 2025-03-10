import { StyleSheet } from "react-native";
import colors from "../../colors";

export default StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "transparent", // Damit das Hintergrundbild sichtbar bleibt
  },
  revealedCharactersContainer: {
    paddingBottom: 20,
    alignItems: "center",
  },
  characterItem: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    alignItems: "center",
    width: "90%",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  characterImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  characterName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
});
