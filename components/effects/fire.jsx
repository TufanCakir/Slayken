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
        {/* Glow außen */}
        <RadialGradient id="fireGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="orange" stopOpacity="0.5" />
          <Stop offset="100%" stopColor="red" stopOpacity="0" />
        </RadialGradient>

        {/* Kern */}
        <RadialGradient id="fireCore" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#ffff00" />
          <Stop offset="100%" stopColor="orange" />
        </RadialGradient>

        {/* Innere Flamme */}
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

      {/* Partikel (natürlicher Look) */}
      <Circle cx="12" cy="18" r="1.6" fill="orange" opacity="0.7" />
      <Circle cx="50" cy="16" r="1.2" fill="yellow" opacity="0.5" />
      <Circle cx="24" cy="48" r="1.8" fill="red" opacity="0.6" />
      <Circle cx="44" cy="54" r="1.4" fill="orange" opacity="0.6" />
      <Circle cx="16" cy="38" r="1.3" fill="yellow" opacity="0.5" />
      <Circle cx="48" cy="42" r="1.7" fill="orange" opacity="0.5" />
      <Circle cx="28" cy="8" r="1.5" fill="yellow" opacity="0.4" />
      <Circle cx="36" cy="6" r="1.3" fill="orange" opacity="0.5" />
      <Circle cx="54" cy="30" r="1.4" fill="red" opacity="0.5" />
      <Circle cx="10" cy="26" r="1.2" fill="orange" opacity="0.5" />
      <Circle cx="40" cy="12" r="1.3" fill="yellow" opacity="0.4" />
      <Circle cx="18" cy="50" r="1.5" fill="orange" opacity="0.6" />
    </Svg>
  );
}
