import React from "react";
import Svg, {
  Circle,
  Path,
  Defs,
  RadialGradient,
  Stop,
} from "react-native-svg";

export default function HealIcon({ size = 80 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* Sanfter Glow-Verlauf */}
        <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#00ff88" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
        </RadialGradient>

        {/* Innerer Kreis mit leichtem Verlauf */}
        <RadialGradient id="circleGradient" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#00ffaa" />
          <Stop offset="100%" stopColor="#00cc88" />
        </RadialGradient>
      </Defs>

      {/* Glow-Kreis */}
      <Circle cx="50" cy="50" r="45" fill="url(#glow)" />

      {/* Hauptkreis mit Gradient */}
      <Circle cx="50" cy="50" r="35" fill="url(#circleGradient)" />

      {/* Herzform */}
      <Path
        d="M50 70
           C 20 50, 30 20, 50 35
           C 70 20, 80 50, 50 70 Z"
        fill="#00ffcc"
      />

      {/* Weißes Plus */}
      <Path
        d="M50 38 L50 62 M38 50 L62 50"
        stroke="#ffffff"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </Svg>
  );
}
