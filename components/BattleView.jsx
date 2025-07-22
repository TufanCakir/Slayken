import React from "react";
import { View, StyleSheet } from "react-native";
import BattleScene from "./BattleScene";

/**
 * BattleView – Wrapper für eine einzelne Boss/Character-Battle
 *
 * Props:
 * - selectedEvent: Boss- oder Character-Objekt (erforderlich)
 * - bossHp: aktuelle Boss-HP
 * - bossMaxHp: maximale Boss-HP
 * - bossDefeated: bool, ob besiegt
 * - handleFight: Kampf-Handler
 * - character: aktiver Charakter (optional)
 * - imageMap: Map für Images (optional)
 * - onBack: Back-Button-Handler (optional)
 */
function BattleView({
  selectedEvent,
  bossHp,
  bossMaxHp,
  bossDefeated,
  handleFight,
  character,
  imageMap,
  onBack,
}) {
  if (!selectedEvent) return null;

  return (
    <View style={styles.container}>
      <BattleScene
        boss={selectedEvent}
        bossHp={bossHp}
        bossMaxHp={bossMaxHp}
        bossDefeated={bossDefeated}
        handleFight={handleFight}
        character={character}
        onBack={onBack}
        bossBackground={selectedEvent.background}
        imageMap={imageMap}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// React.memo verhindert Re-Renders, falls sich die Props nicht ändern!
export default React.memo(BattleView);
