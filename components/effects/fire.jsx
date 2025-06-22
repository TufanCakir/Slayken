import React from "react";
import {
  Svg,
  Circle,
  Path,
  Defs,
  RadialGradient,
  Stop,
} from "react-native-svg";

export default function Fireball({ size = 64 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Defs>
        {/* Glow-Effekt außen */}
        <RadialGradient id="fireGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="orange" stopOpacity="0.5" />
          <Stop offset="100%" stopColor="red" stopOpacity="0" />
        </RadialGradient>

        {/* Flammenkörper mit Farbverlauf */}
        <RadialGradient id="fireCore" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#ffff00" />
          <Stop offset="100%" stopColor="orange" />
        </RadialGradient>

        {/* Innenflamme */}
        <RadialGradient id="innerFlame" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#ff3300" />
          <Stop offset="100%" stopColor="#990000" />
        </RadialGradient>
      </Defs>

      {/* Äußerer Glow */}
      <Circle cx="32" cy="32" r="30" fill="url(#fireGlow)" />

      {/* Innerer Feuerkreis */}
      <Circle cx="32" cy="32" r="22" fill="url(#fireCore)" />

      {/* Flammenform */}
      <Path
        d="M20 32 C25 10, 45 10, 44 32 C43 54, 25 54, 20 32"
        fill="url(#innerFlame)"
      />
    </Svg>
  );
}
