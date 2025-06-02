// components/ScreenLayout.js
import { View, StyleSheet } from "react-native";
import Header from "./Header";
import Footer from "./Footer";
import { useThemeContext } from "../context/ThemeContext";

export default function ScreenLayout({ children, style }) {
  const { theme } = useThemeContext();

  return (
    <View style={[styles.wrapper, style]}>
      <Header />
      <View style={styles.content}>{children}</View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
