import { StyleSheet } from "react-native";
import colors from "../../colors";

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  levelText: {
    fontSize: 18,
    color: colors.textPrimary, // reiner Weißton für primären Text
    fontWeight: "bold",
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "column",
    alignItems: "center",
    marginHorizontal: 10,
  },
  labelText: {
    fontSize: 14,
    color: colors.textPrimary, // weiches Grau für sekundären Text
    marginBottom: 2,
  },
  statText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "bold",
  },
  countdownText: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 2,
  },
});

export default styles;
