import React from "react";
import {
  ScrollView,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useThemeContext } from "../context/ThemeContext";

export default function ToSScreen() {
  const navigation = useNavigation();
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const sections = [
    {
      section: "1. Allgemeines",
      text: "Diese App wird bereitgestellt von Tufan Cakir. Mit der Nutzung der App erklären Sie sich mit diesen Bedingungen einverstanden. Wenn Sie nicht zustimmen, dürfen Sie die App nicht verwenden.",
    },
    {
      section: "2. Nutzung der App",
      text: "Die App darf nur für persönliche, nicht-kommerzielle Zwecke verwendet werden. Sie verpflichten sich, die App nicht zu missbrauchen, z. B. durch Hacking, automatisierte Zugriffe oder andere schädliche Aktivitäten.",
    },
    {
      section: "3. Geistiges Eigentum",
      text: "Alle Inhalte in der App, einschließlich Texte, Grafiken, Logos, Bilder und Software, sind urheberrechtlich geschützt und Eigentum des Entwicklers oder entsprechend gekennzeichneter Dritter.",
    },
    {
      section: "4. Datenschutz",
      text: "Unsere Datenschutzerklärung regelt, wie Ihre persönlichen Daten in der App verarbeitet werden. Mit der Nutzung der App stimmen Sie dieser Datenverarbeitung zu.",
    },
    {
      section: "5. Haftungsausschluss",
      text: "Diese App wird „wie sie ist“ bereitgestellt. Es wird keine Gewähr für Fehlerfreiheit, Aktualität oder Verfügbarkeit übernommen. Die Nutzung erfolgt auf eigene Gefahr.",
    },
    {
      section: "6. Änderungen der Bedingungen",
      text: "Wir behalten uns das Recht vor, diese Nutzungsbedingungen jederzeit zu ändern. Änderungen werden innerhalb der App oder auf unserer Website bekannt gegeben.",
    },
    {
      section: "7. Kontakt",
      text: "Bei Fragen zu diesen Bedingungen oder zur App können Sie uns jederzeit kontaktieren: E-Mail: support@bloodshade.slayken.com",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Halbdurchsichtiger Overlay für bessere Lesbarkeit */}
      <View style={styles.overlay} pointerEvents="none" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nutzungsbedingungen</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.updated}>Letzte Aktualisierung: Mai 2025</Text>
        {sections.map(({ section, text }, idx) => (
          <View key={idx} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section}</Text>
            <Text style={styles.paragraph}>{text}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.accentColor,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.shadowColor + "cc", // halbtransparentes Overlay (für Lesbarkeit)
      zIndex: 0,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 18,
      paddingTop: 52,
      paddingBottom: 14,
      backgroundColor: theme.accentColor + "cc",
      zIndex: 2,
    },
    backButton: {
      paddingRight: 10,
      paddingVertical: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    backText: {
      fontSize: 26,
      color: theme.textColor,
      fontWeight: "600",
      marginTop: -2,
    },
    title: {
      fontSize: 21,
      marginLeft: 6,
      color: theme.textColor,
      letterSpacing: 0.3,
      fontWeight: "bold",
    },
    scrollContent: {
      paddingHorizontal: 18,
      paddingBottom: 80,
      zIndex: 2,
    },
    updated: {
      fontSize: 14,
      fontStyle: "italic",
      marginBottom: 14,
      color: theme.borderColor,
      textAlign: "center",
    },
    sectionContainer: {
      marginBottom: 20,
      backgroundColor: theme.shadowColor + "cc",
      borderRadius: 12,
      padding: 15,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.textColor,
      marginBottom: 5,
      letterSpacing: 0.2,
    },
    paragraph: {
      fontSize: 15,
      color: theme.textColor,
      lineHeight: 21,
      letterSpacing: 0.1,
    },
  });
}
