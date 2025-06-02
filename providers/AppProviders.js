// providers/AppProviders.js
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoadingProvider } from "../context/LoadingContext";
import { MusicProvider } from "../context/MusicContext";
import { CharacterProvider } from "../context/CharacterContext";
import { TeamProvider } from "../context/TeamContext";
import { LanguageProvider } from "../context/LanguageContext";
import { CoinProvider } from "../context/CoinContext";
import { CrystalProvider } from "../context/CrystalContext";
import { AccountLevelProvider } from "../context/AccountLevelContext";
import { ThemeProvider } from "../context/ThemeContext";
import { ChapterProvider } from "../context/ChapterContext";
import { SummonProvider } from "../context/SummonContext";

export function AppProviders({ children }) {
  return (
    <LoadingProvider>
      <MusicProvider>
        <ThemeProvider>
          <LanguageProvider>
            <ChapterProvider>
              <AccountLevelProvider>
                <CrystalProvider>
                  <CoinProvider>
                    <CharacterProvider>
                      <TeamProvider>
                        <SummonProvider>
                          <SafeAreaProvider>{children}</SafeAreaProvider>
                        </SummonProvider>
                      </TeamProvider>
                    </CharacterProvider>
                  </CoinProvider>
                </CrystalProvider>
              </AccountLevelProvider>
            </ChapterProvider>
          </LanguageProvider>
        </ThemeProvider>
      </MusicProvider>
    </LoadingProvider>
  );
}
