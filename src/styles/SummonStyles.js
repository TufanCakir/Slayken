import { StyleSheet } from "react-native";
import colors from "../../colors";

export const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: "center",
  },
  crystalsContainer: {
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  crystalsText: {
    fontSize: 18,
    color: colors.textPrimary,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  singleSummonButton: {
    backgroundColor: colors.warriorBlue,
  },
  multiSummonButton: {
    backgroundColor: colors.dragonRed,
  },
  buttonText: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: "center",
  },
});

export default styles;
