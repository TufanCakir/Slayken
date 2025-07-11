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
import { LinearGradient } from "expo-linear-gradient";
import { useThemeContext } from "../context/ThemeContext";

const TOS_SECTIONS = [
  {
    title: "1. Allgemeines",
    content:
      "Diese App wird bereitgestellt von Tufan Cakir. Mit der Nutzung der App erklären Sie sich mit diesen Bedingungen einverstanden. Wenn Sie nicht zustimmen, dürfen Sie die App nicht verwenden.",
  },
  {
    title: "2. Nutzung der App",
    content:
      "Die App darf nur für persönliche, nicht-kommerzielle Zwecke verwendet werden. Sie verpflichten sich, die App nicht zu missbrauchen, z. B. durch Hacking, automatisierte Zugriffe oder andere schädliche Aktivitäten.",
  },
  {
    title: "3. Geistiges Eigentum",
    content:
      "Alle Inhalte in der App, einschließlich Texte, Grafiken, Logos, Bilder und Software, sind urheberrechtlich geschützt und Eigentum des Entwicklers oder entsprechend gekennzeichneter Dritter.",
  },
  {
    title: "4. Datenschutz",
    content:
      "Unsere Datenschutzerklärung regelt, wie Ihre persönlichen Daten in der App verarbeitet werden. Mit der Nutzung der App stimmen Sie dieser Datenverarbeitung zu.",
  },
  {
    title: "5. Haftungsausschluss",
    content:
      "Diese App wird „wie sie ist“ bereitgestellt. Es wird keine Gewähr für Fehlerfreiheit, Aktualität oder Verfügbarkeit übernommen. Die Nutzung erfolgt auf eigene Gefahr.",
  },
  {
    title: "6. Änderungen der Bedingungen",
    content:
      "Wir behalten uns das Recht vor, diese Nutzungsbedingungen jederzeit zu ändern. Änderungen werden innerhalb der App oder auf unserer Website bekannt gegeben.",
  },
  {
    title: "7. Kontakt",
    content:
      "Bei Fragen zu diesen Bedingungen oder zur App können Sie uns jederzeit kontaktieren: E-Mail: support@bloodshade.slayken.com",
  },
];

// Einzelne Section als Subkomponente – mit LinearGradient
function TosSection({ title, content, styles, theme }) {
  return (
    <LinearGradient
      colors={theme.linearGradient}
      start={{ x: 0.12, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.sectionContainer}
    >
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.paragraph}>{content}</Text>
    </LinearGradient>
  );
}

export default function ToSScreen() {
  const navigation = useNavigation();
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  // Halbtransparenter Shadow für Hintergrund bleibt
  const overlayColor = theme.shadowColor + "cc";

  return (
    <SafeAreaView style={styles.container}>
      {/* Overlay bleibt erhalten */}
      <View
        style={[styles.overlay, { backgroundColor: overlayColor }]}
        pointerEvents="none"
      />

      {/* Header mit Gradient */}
      <LinearGradient
        colors={theme.linearGradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 0.9 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nutzungsbedingungen</Text>
      </LinearGradient>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.updated}>Letzte Aktualisierung: Mai 2025</Text>
        {TOS_SECTIONS.map(({ title, content }, idx) => (
          <TosSection
            key={idx}
            title={title}
            content={content}
            styles={styles}
            theme={theme}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme) {
  const text = theme.textColor;
  const border = theme.borderColor;

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 0,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 18,
      paddingTop: 52,
      paddingBottom: 14,
      zIndex: 2,
      // Kein backgroundColor, weil Gradient
    },
    backButton: {
      paddingRight: 10,
      paddingVertical: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    backText: {
      fontSize: 26,
      color: text,
      fontWeight: "600",
      marginTop: -2,
    },
    title: {
      fontSize: 21,
      marginLeft: 6,
      color: text,
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
      color: border,
      textAlign: "center",
    },
    sectionContainer: {
      marginBottom: 20,
      borderRadius: 12,
      padding: 15,
      // kein backgroundColor, weil Gradient!
      shadowColor: theme.accentColorDark,
      shadowOpacity: 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: text,
      marginBottom: 5,
      letterSpacing: 0.2,
    },
    paragraph: {
      fontSize: 15,
      color: text,
      lineHeight: 21,
      letterSpacing: 0.1,
    },
  });
}
