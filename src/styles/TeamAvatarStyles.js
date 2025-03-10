import { StyleSheet } from "react-native";
import colors from "../../colors"; // Pfad ggf. anpassen

export const styles = StyleSheet.create({
  // Container um den Avatar; erhält einen Rahmen, wenn er ausgewählt ist
  teamAvatarContainer: {
    margin: 5,
    padding: 5,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "transparent",
  },
  // Spezifischer Style für den ausgewählten Avatar
  selectedTeamAvatar: {
    borderColor: colors.primary,
  },
  // Style für das Bild des Avatars
  teamAvatar: {
    width: 100,
    height: 100,
    borderRadius: 25,
  },
});
