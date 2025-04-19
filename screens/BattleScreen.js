import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImageWrapper from '../components/FastImageWrapper';
import backgroundList from '../data/background.json';
import { useTeam } from '../context/TeamContext';

const { width, height } = Dimensions.get('window');

export default function BattleScreen({ navigation }) {
  const { team } = useTeam();
  const [background, setBackground] = useState(null);
  const [accountExp, setAccountExp] = useState(0);
  const rotation = useRef(new Animated.Value(0)).current;

  // 📥 Lade Hintergrund, starte Rotation und lade gespeicherte EXP
  useEffect(() => {
    if (Array.isArray(backgroundList) && backgroundList.length > 0) {
      setBackground(backgroundList[0].image);
    }

    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 30000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    (async () => {
      try {
        const stored = await AsyncStorage.getItem('@slayken_account_exp');
        const currentExp = stored ? parseInt(stored, 10) : 0;
        setAccountExp(currentExp);
      } catch (error) {
        if (__DEV__) console.warn('Fehler beim Laden der EXP:', error);
      }
    })();
  }, []);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const giveExp = useCallback(
    async (amount = 1) => {
      try {
        const newExp = accountExp + amount;
        await AsyncStorage.setItem('@slayken_account_exp', newExp.toString());
        setAccountExp(newExp);
      } catch (error) {
        if (__DEV__) console.warn('Fehler beim Hinzufügen von EXP:', error);
      }
    },
    [accountExp],
  );

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <TouchableWithoutFeedback onPress={() => giveExp(1)}>
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

        <View style={styles.container}>
          <Text style={styles.title}>⚔️ Battle</Text>
          <Text style={styles.expText}>Account EXP: {accountExp}</Text>

          {team.length > 0 && (
            <View style={styles.teamImages}>
              {team.map((member, index) => (
                <View key={index} style={styles.characterWrapper}>
                  <FastImageWrapper
                    source={member.image}
                    containerStyle={[
                      styles.characterImage,
                      { borderColor: member.rarityInfo?.color || '#666' },
                    ]}
                    contentFit="cover"
                  />
                  <Text style={styles.characterName}>{member.name}</Text>
                  <Text
                    style={[styles.rarityLabel, { color: member.rarityInfo?.color || 'white' }]}
                  >
                    {member.rarityInfo?.label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Pressable onPress={handleBack}>
            <Text style={styles.backButton}>🔙 Zurück</Text>
          </Pressable>
        </View>
      </View>
    </TouchableWithoutFeedback>
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
    color: 'red',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  expText: {
    color: '#00FFAA',
    fontSize: 18,
    marginBottom: 20,
  },
  teamImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
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
  backButton: {
    color: '#FFD700',
    fontSize: 18,
    textDecorationLine: 'underline',
    marginTop: 30,
  },
});
