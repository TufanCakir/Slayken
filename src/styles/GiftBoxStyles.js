import { StyleSheet } from "react-native";
import colors from "../../colors";

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  // Ladeanzeige-Container: absolut über dem Hintergrundbild positioniert
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "transparent", // Damit das Hintergrundbild durchscheint
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: "center",
  },
  noGiftsText: {
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: 20,
  },
  giftItem: {
    backgroundColor: colors.textPrimary,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  giftType: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  disabledButton: {
    backgroundColor: colors.textSecondary,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
});

export default styles;
