import {
  ScrollView,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// Blue Theme Colors
const BLUE_OVERLAY = "#1e293bcc";
const BLUE_ACCENT = "#38bdf8";
const BLUE_HEADER = "#2563eb";
const BLUE_TEXT = "#f0f9ff";
const BLUE_MUTED = "#a7c7e7";

export default function ToSScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Halbdurchsichtiger Overlay über dem globalen Hintergrundbild */}
      <View style={styles.overlay} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={BLUE_ACCENT} />
        </TouchableOpacity>
        <Text style={styles.title}>Nutzungsbedingungen</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.updated}>Letzte Aktualisierung: Mai 2025</Text>

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
            <Text style={styles.sectionTitle}>{section}</Text>
            <Text style={styles.paragraph}>{text}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    backgroundColor: BLUE_OVERLAY,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 52,
    paddingBottom: 14,
    zIndex: 2,
    backgroundColor: "#1e293b80",
  },
  title: {
    fontSize: 21,
    marginLeft: 14,
    color: BLUE_ACCENT,
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 100,
    paddingTop: 0,
    zIndex: 2,
  },
  updated: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 14,
    color: BLUE_MUTED,
    textAlign: "center",
  },
  sectionContainer: {
    marginBottom: 20,
    backgroundColor: "#1e293bcc",
    borderRadius: 12,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: BLUE_ACCENT,
    marginBottom: 5,
    letterSpacing: 0.2,
  },
  paragraph: {
    fontSize: 15,
    color: BLUE_TEXT,
    lineHeight: 21,
    letterSpacing: 0.1,
  },
});
