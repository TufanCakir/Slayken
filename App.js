import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Screens
import HomeScreen from './screens/HomeScreen';
import BattleScreen from './screens/BattleScreen';
import SummonScreen from './screens/SummonScreen';
import TeamScreen from './screens/TeamScreen';
import SettingsScreen from './screens/SettingsScreen';

// Context Providers
import { RarityProvider } from './context/RarityContext';
import { PlayerProvider } from './context/PlayerContext';
import { TeamProvider } from './context/TeamContext';
import { GlobalProvider } from './context/GlobalContext';
import { CrystalsProvider } from './context/CrystalsContext';
import { CoinsProvider } from './context/CoinsContext';
import { AccountProvider } from './context/AccountContext';

enableScreens();
const Tab = createBottomTabNavigator();

// 🔄 Kombinierte App Provider
function AppProviders({ children }) {
  return (
    <RarityProvider>
      <PlayerProvider>
        <TeamProvider>
          <GlobalProvider>
            <CrystalsProvider>
              <CoinsProvider>
                <AccountProvider>{children}</AccountProvider>
              </CoinsProvider>
            </CrystalsProvider>
          </GlobalProvider>
        </TeamProvider>
      </PlayerProvider>
    </RarityProvider>
  );
}

export default function App() {
  // 🧭 Icon Mapping für Tabs
  const iconMap = useMemo(
    () => ({
      Home: Ionicons,
      Battle: MaterialCommunityIcons,
      Summon: MaterialCommunityIcons,
      Team: Ionicons,
      Settings: Ionicons,
    }),
    [],
  );

  const iconNameMap = {
    Home: 'home',
    Battle: 'sword-cross',
    Summon: 'crystal-ball',
    Team: 'people',
    Settings: 'settings',
  };

  return (
    <SafeAreaProvider>
      <AppProviders>
        <NavigationContainer>
          <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarIcon: ({ color, size }) => {
                const IconComponent = iconMap[route.name] || Ionicons;
                const iconName = iconNameMap[route.name] || 'alert';
                return <IconComponent name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#00BFFF',
              tabBarInactiveTintColor: 'gray',
              tabBarStyle: { backgroundColor: '#111' },
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Battle" component={BattleScreen} />
            <Tab.Screen name="Summon" component={SummonScreen} />
            <Tab.Screen name="Team" component={TeamScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
        <StatusBar style="light" />
      </AppProviders>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
