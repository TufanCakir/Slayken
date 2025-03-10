// src/styles/TermsOfServiceStyles.js
import { StyleSheet } from "react-native";
import colors from "../../colors";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 10,
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: colors.gold,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.white,
    paddingBottom: 20,
  },
});
