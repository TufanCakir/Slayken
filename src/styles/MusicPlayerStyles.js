import { StyleSheet } from "react-native";
import colors from "../../colors";

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    padding: 24,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  trackText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 5,
    borderRadius: 4,
    alignItems: "center",
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
});

export default styles;
