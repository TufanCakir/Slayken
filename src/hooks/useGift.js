import { useCallback, useContext } from "react";
import { CoinsContext } from "../context/CoinsContext";
import { CrystalsContext } from "../context/CrystalsContext";

export const useGift = () => {
  const { coins, setCoins } = useContext(CoinsContext);
  const { crystals, setCrystals } = useContext(CrystalsContext);

  const addCoins = useCallback(
    (amount) => {
      setCoins((prevCoins) => prevCoins + amount);
    },
    [setCoins]
  );

  const addCrystals = useCallback(
    (amount) => {
      setCrystals((prevCrystals) => prevCrystals + amount);
    },
    [setCrystals]
  );

  return {
    addCoins,
    addCrystals,
    coins,
    crystals,
  };
};
