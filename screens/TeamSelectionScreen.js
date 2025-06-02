// Datei: screens/TeamSelectionScreen.js
import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";

import { useTeam } from "../context/TeamContext";
import { useSummon } from "../context/SummonContext";
import { useThemeContext } from "../context/ThemeContext";
import Footer from "../components/Footer";
import rarityData from "../data/rarityData.json";
import { t } from "../i18n"; // ← Übersetzungsfunktion importieren

// Basis-URL für alle Avatar-Bilder
const GITHUB_BASE =
  "https://raw.githubusercontent.com/TufanCakir/slayken-assets/main/characters";

// -------------- DYNAMIC CARD WIDTH --------------
// Immer 3 Karten pro Zeile, egal welche Bildschirmgröße
const { width: SCREEN_WIDTH } = Dimensions.get("window");
// Wird später im Style genutzt, um drei Karten nebeneinander zu packen:
const HORIZONTAL_PADDING = 8 * 2; // FlatList contentContainerStyle: paddingHorizontal: 8
const CARD_MARGIN = 4 * 2; // jede Karte hat marginHorizontal: 4 (links+rechts)
const NUM_COLUMNS = 3;
const CARD_WIDTH =
  (SCREEN_WIDTH - HORIZONTAL_PADDING - CARD_MARGIN * NUM_COLUMNS) / NUM_COLUMNS;
// -------------------------------------------------

/**
 * Memoisierte Einzelkarte fürs Rendering
 */
const CharacterCard = React.memo(function CharacterCard({
  character,
  selected,
  onToggle,
  theme,
  uiThemeType,
}) {
  const { id, name, type, level, rarity, avatarUrl } = character;
  const backgroundColor = uiThemeType === "dark" ? "#000" : "#fff";
  const rarityInfo = rarityData.rarities[rarity] || {};
  const borderColor = rarityInfo.color ?? theme.borderColor;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor,
          width: CARD_WIDTH,
        },
      ]}
      onPress={() => onToggle(id)}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${type}, ${
        rarity || t("unknownRarity")
      }, ${t("levelLabel")} ${level}, ${
        selected ? t("inTeam") : t("notInTeam")
      }`}
    >
      <Image
        source={{ uri: avatarUrl }}
        style={styles.avatar}
        contentFit="contain"
      />

      <Text style={[styles.name, { color: theme.textColor }]} numberOfLines={1}>
        {name}
      </Text>

      <Text
        style={[styles.type, { color: theme.shadowColor }]}
        numberOfLines={1}
      >
        {type}
      </Text>

      <Text style={[styles.level, { color: theme.textColor }]}>
        {`${t("levelLabel")} ${level}`}
      </Text>

      {rarityInfo.label && (
        <Text style={[styles.rarity, { color: rarityInfo.color }]}>
          {rarityInfo.label}
        </Text>
      )}

      <Text style={[styles.actionText, { color: theme.accentColor }]}>
        {selected ? t("removeLabel") : t("addLabel")}
      </Text>
    </TouchableOpacity>
  );
});

export default function TeamSelectionScreen() {
  const { theme, uiThemeType } = useThemeContext();
  const { team, addMember, removeMember, setActiveMemberId } = useTeam();
  const { summons } = useSummon();

  /**
   * Nur Unique-IDs anzeigen: Wir legen eine Map an, damit jede ID
   * nur einmal im Array landet. Dabei ergänzen wir direkt die volle
   * avatarUrl („https://…/characters/xyz.png“).
   */
  const summonedCharacters = useMemo(() => {
    const mapById = {};
    summons.forEach((s) => {
      // s.avatar enthält nur den Dateinamen (z.B. "lyric.png")
      if (!mapById[s.id]) {
        mapById[s.id] = {
          ...s,
          avatarUrl: `${GITHUB_BASE}/${s.avatar}`,
        };
      }
    });
    return Object.values(mapById);
  }, [summons]);

  // Prüfen, ob ein Charakter bereits im Team ist
  const isInTeam = useCallback((id) => team.some((m) => m.id === id), [team]);

  // Bei Tap: Wird der Charakter bereits im Team gehalten? Wenn ja, entfernen; sonst hinzufügen.
  const handleToggleMember = useCallback(
    (id) => {
      const char = summonedCharacters.find((c) => c.id === id);
      if (!char) return;

      if (isInTeam(id)) {
        removeMember(id);
      } else {
        // Wenn wir in den TeamContext schreiben, übergeben wir dasselbe Objekt,
        // inklusive avatarUrl, weil TeamContext bereits volle URL erwartet.
        addMember(char);
      }
    },
    [summonedCharacters, isInTeam, addMember, removeMember]
  );

  // Einzelne Karte für FlatList
  const renderCharacter = useCallback(
    ({ item }) => {
      const selected = isInTeam(item.id);
      return (
        <CharacterCard
          character={item}
          selected={selected}
          onToggle={handleToggleMember}
          theme={theme}
          uiThemeType={uiThemeType}
        />
      );
    },
    [isInTeam, handleToggleMember, theme, uiThemeType]
  );

  const handleSelectCharacter = (id) => {
    setActiveMemberId(id);
    // optionales Kontext-Navigation: navigation.navigate("BattleScreen", { bossName: "Azroth" });
  };

  // Falls noch keine Summons vorhanden: Hinweis anzeigen
  const renderEmptySummons = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.textColor }]}>
        {t("noSummonedCharacters")}{" "}
        {/* z.B. "Du hast noch keine Charaktere beschworen." */}
      </Text>
    </View>
  );

  // Unten: Aktuelles Team anzeigen
  const renderTeamRow = () => {
    if (team.length === 0) {
      return (
        <View style={styles.teamEmptyContainer}>
          <Text style={[styles.teamEmptyText, { color: theme.textColor }]}>
            {t("noTeamMemberSelected")} {/* z.B. "Kein Mitglied ausgewählt" */}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.teamRow}>
        {team.map((member) => (
          <TouchableOpacity
            key={member.id}
            onPress={() => {
              // Optional: „sylas“ nicht entfernbar lassen
              if (member.id !== "sylas") removeMember(member.id);
            }}
            style={styles.teamAvatarWrapper}
          >
            <Image
              source={{ uri: member.avatarUrl }}
              style={styles.teamAvatar}
              contentFit="contain"
            />
            <Text style={[styles.removeText, { color: theme.textColor }]}>
              ✖
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Image
        source={theme.bgImage}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      <View style={styles.wrapper}>
        <Text style={[styles.heading, { color: theme.textColor }]}>
          {t("selectCharacters")} {/* z.B. "Charaktere auswählen" */}
        </Text>

        <FlatList
          data={summonedCharacters}
          keyExtractor={(item) => item.id} // IDs jetzt eindeutig
          renderItem={renderCharacter}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptySummons}
        />

        <Text style={[styles.heading, { color: theme.textColor }]}>
          {t("currentTeam")} {/* z.B. "Aktuelles Team" */}
        </Text>
        {renderTeamRow()}
      </View>

      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000", // Fallback, damit hinter dem Hintergrundbild nichts durchscheint
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 12,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  listContent: {
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  card: {
    margin: 4,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
    // Schatten für iOS / Android
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  name: {
    marginTop: 6,
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  type: {
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
  level: {
    fontSize: 12,
    marginTop: 4,
  },
  rarity: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 2,
  },
  actionText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "bold",
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 84,
    borderRadius: 18,
    borderWidth: 2,
    marginVertical: 7,
    padding: 10,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  teamAvatarWrapper: {
    marginHorizontal: 6,
    alignItems: "center",
  },
  teamAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  removeText: {
    fontSize: 10,
    marginTop: 2,
    textAlign: "center",
  },
  teamEmptyContainer: {
    minHeight: 84,
    borderRadius: 18,
    borderWidth: 2,
    marginVertical: 7,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  teamEmptyText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  emptyContainer: {
    marginTop: 32,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
  },
});
