// Datei: screens/ToSScreen.js
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
import { Ionicons } from "@expo/vector-icons";

export default function ToSScreen() {
  const navigation = useNavigation();
  const { theme } = useThemeContext();

  return (
    <SafeAreaView style={styles.container}>
      {/* Halbdurchsichtiger Overlay über dem globalen Hintergrundbild */}
      <View
        style={[styles.overlay, { backgroundColor: `${theme.shadowColor}CC` }]}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.accentColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.accentColor }]}>
          Nutzungsbedingungen
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.updated, { color: theme.accentColor }]}>
          Letzte Aktualisierung: Mai 2025
        </Text>

        {[
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
        ].map(({ section, text }, idx) => (
          <View key={idx} style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.accentColor }]}>
              {section}
            </Text>
            <Text style={[styles.paragraph, { color: theme.textColor }]}>
              {text}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Kein eigener Hintergrund: das globale bgImage aus App.js bleibt sichtbar
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    zIndex: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 0,
    zIndex: 2,
  },
  updated: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 12,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 22,
  },
});
