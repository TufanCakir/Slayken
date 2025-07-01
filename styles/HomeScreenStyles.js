import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonList: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
    marginBottom: 70,
    width: "100%",
  },
  tutorialWrapper: {
    width: "96%",
    alignItems: "center",
    marginBottom: 28,
  },
  tutorialBlock: {
    borderRadius: 22,
    padding: 22,
    marginBottom: 14,
    width: "100%",
  },
  tutorialText: {
    color: "#60a5fa",
    fontSize: 17,
    marginBottom: 12,
    textAlign: "center",
  },
  tutorialButton: {
    alignSelf: "center",
    borderRadius: 20,
    borderWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  tutorialButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#f0f9ff",
    textAlign: "center",
    letterSpacing: 0.1,
  },
  fullButton: {
    flex: 1,
    marginVertical: 12,
    alignSelf: "center",
  },
});
