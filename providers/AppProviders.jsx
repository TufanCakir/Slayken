import { SafeAreaProvider } from "react-native-safe-area-context";
import { ShopProvider } from "../context/ShopContext";
import { StageProvider } from "../context/StageContext";
import { AssetsProvider } from "../context/AssetsContext";
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
import { MissionProvider } from "../context/MissionContext";
import { InventoryProvider } from "../context/InventoryContext";

export function AppProviders({ children }) {
  return (
    <SafeAreaProvider>
      <AssetsProvider>
        <InventoryProvider>
          <ShopProvider>
            <StageProvider>
              <GiftProvider>
                <LoadingProvider>
                  <MusicProvider>
                    <ThemeProvider>
                      <LanguageProvider>
                        <AccountLevelProvider>
                          <CrystalProvider>
                            <CoinProvider>
                              <MissionProvider>
                                <CharacterProvider>
                                  <ClassProvider>{children}</ClassProvider>
                                </CharacterProvider>
                              </MissionProvider>
                            </CoinProvider>
                          </CrystalProvider>
                        </AccountLevelProvider>
                      </LanguageProvider>
                    </ThemeProvider>
                  </MusicProvider>
                </LoadingProvider>
              </GiftProvider>
            </StageProvider>
          </ShopProvider>
        </InventoryProvider>
      </AssetsProvider>
    </SafeAreaProvider>
  );
}
