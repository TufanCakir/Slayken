// providers/AppProviders.js
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoadingProvider } from "../context/LoadingContext";
import { MusicProvider } from "../context/MusicContext";
import { CharacterProvider } from "../context/CharacterContext";
import { LanguageProvider } from "../context/LanguageContext";
import { CoinProvider } from "../context/CoinContext";
import { CrystalProvider } from "../context/CrystalContext";
import { AccountLevelProvider } from "../context/AccountLevelContext";
import { ThemeProvider } from "../context/ThemeContext";
import { GiftProvider } from "../context/GiftContext";
import { ClassProvider } from "../context/ClassContext";

export function AppProviders({ children }) {
  return (
    <GiftProvider>
      <LoadingProvider>
        <MusicProvider>
          <ThemeProvider>
            <LanguageProvider>
              <AccountLevelProvider>
                <CrystalProvider>
                  <CoinProvider>
                    <CharacterProvider>
                      <ClassProvider>
                        <SafeAreaProvider>{children}</SafeAreaProvider>
                      </ClassProvider>
                    </CharacterProvider>
                  </CoinProvider>
                </CrystalProvider>
              </AccountLevelProvider>
            </LanguageProvider>
          </ThemeProvider>
        </MusicProvider>
      </LoadingProvider>
    </GiftProvider>
  );
}
