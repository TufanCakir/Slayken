import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useCoins } from '../context/CoinsContext';
import { useTeam } from '../context/TeamContext';
import FastImageWrapper from '../components/FastImageWrapper';
import backgroundList from '../data/background.json';

const { width, height } = Dimensions.get('window');

export default function CoinEvent({ navigation }) {
  const { coins, addCoins } = useCoins();
  const { team } = useTeam();
  const [background, setBackground] = useState(null);

  const rotation = useRef(new Animated.Value(0)).current;

  // 🎬 Lade Hintergrund & starte Rotation
  useEffect(() => {
    if (Array.isArray(backgroundList) && backgroundList.length > 0) {
      setBackground(backgroundList[0].image);
    }

    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 35000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleTap = useCallback(() => {
    if (team.length === 0) {
      Alert.alert('Kein Team', 'Bitte stelle zuerst ein Team zusammen.');
      return;
    }
    addCoins(50);
  }, [team, addCoins]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={styles.wrapper}>
      {background && (
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
          <FastImageWrapper
            source={background}
            containerStyle={styles.background}
            contentFit="cover"
          />
        </Animated.View>
      )}

      <Pressable style={styles.container} onPress={handleTap}>
        <Text style={styles.title}>⚔️ Coin-Kampf Event</Text>
        <Text style={styles.coins}>💰 Du hast {coins} Coins</Text>
        <Text style={styles.hint}>
          Tippe irgendwo, um Gegner zu besiegen und Coins zu erhalten!
        </Text>

        {team.length > 0 && (
          <View style={styles.teamImages}>
            {team.map((member, index) => (
              <View key={index} style={styles.characterWrapper}>
                <FastImageWrapper
                  source={member.image}
                  containerStyle={[
                    styles.characterImage,
                    { borderColor: member.rarityInfo?.color || '#444' },
                  ]}
                  contentFit="cover"
                />
                <Text style={styles.characterName}>{member.name}</Text>
                <Text style={[styles.rarityLabel, { color: member.rarityInfo?.color || 'white' }]}>
                  {member.rarityInfo?.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ marginTop: 40 }}>
          <Text style={styles.backButton} onPress={handleBack}>
            🔙 Zurück
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'black',
  },
  background: {
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#FFD700',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  coins: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10,
  },
  hint: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  backButton: {
    color: '#00BFFF',
    fontSize: 18,
    marginTop: 20,
    textDecorationLine: 'underline',
  },
  teamImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    gap: 12,
  },
  characterWrapper: {
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 16,
  },
  characterImage: {
    width: 72,
    height: 72,
    borderWidth: 2,
    borderRadius: 10,
  },
  characterName: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rarityLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
});
