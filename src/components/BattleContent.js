// src/components/BattleContent.js
import React, { useMemo } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ImageBackground,
} from "react-native";
import TeamAvatar from "../components/TeamAvatar";
import { styles } from "../styles/BattleStyles";
import Footer from "./Footer";

const BattleContent = ({
  currentBackground,
  currentEnemy,
  enemyHp,
  enemyMaxHp,
  lastDamage,
  currentFighter,
  team,
  coins,
  crystals,
  onScreenTap,
  onSelectFighter,
}) => {
  const enemyHpPercentage = useMemo(
    () => Math.max(0, Math.min(100, (enemyHp / enemyMaxHp) * 100)),
    [enemyHp, enemyMaxHp]
  );

  return (
    <ImageBackground
      source={currentBackground ? { uri: currentBackground.image } : undefined}
      style={styles.container}
    >
      <Pressable onPress={onScreenTap} style={styles.overlay}>
        {/* Gegner-Info */}
        {currentEnemy && (
          <View style={styles.enemyContainer}>
            {currentEnemy.imageNoBg && (
              <Image
                source={{ uri: currentEnemy.imageNoBg }}
                style={styles.characterImage}
              />
            )}
            <Text style={styles.entityName}>{currentEnemy.name}</Text>
            {/* HP-Anzeige */}
            <View style={styles.hpBarContainer}>
              <View
                style={[styles.hpBar, { width: `${enemyHpPercentage}%` }]}
              />
              <Text style={styles.hpBarText}>
                {enemyHp} / {enemyMaxHp}
              </Text>
            </View>
            {/* Schadensanzeige */}
            {lastDamage > 0 && (
              <Text style={styles.damageText}>Damage: {lastDamage}</Text>
            )}
          </View>
        )}

        {/* Spieler-Info */}
        {currentFighter && (
          <View style={styles.playerContainer}>
            {(currentFighter.imageNoBg || currentFighter.image) && (
              <Image
                source={{
                  uri: currentFighter.imageNoBg || currentFighter.image,
                }}
                style={styles.characterImage}
              />
            )}
          </View>
        )}

        {/* Statusanzeige: Coins & Crystals */}
        <View style={styles.statusBar}>
          <View style={styles.statusItem}>
            <Text style={styles.statusText}>Coins: {coins}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusText}>Crystals: {crystals}</Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.teamFooter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {team.map((player) => (
            <TeamAvatar
              key={player.id}
              player={player}
              isSelected={currentFighter && currentFighter.id === player.id}
              onSelect={onSelectFighter}
            />
          ))}
        </ScrollView>
      </View>
      <Footer />
    </ImageBackground>
  );
};

export default React.memo(BattleContent);
