import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Header from "./Header";
import Footer from "./Footer";
import { useThemeContext } from "../context/ThemeContext";

// Memoized version
const ScreenLayout = React.memo(function ScreenLayout({ children, style }) {
  const { theme } = useThemeContext();

  // Styles nur neu berechnen, wenn Theme wechselt
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.wrapper, style]}>
      <Header />
      <View style={styles.content}>{children}</View>
      <Footer />
    </View>
  );
});

export default ScreenLayout;

function createStyles(theme) {
  return StyleSheet.create({
    wrapper: {
      flex: 1,
    },
    content: {
      flex: 1,
    },
  });
}
