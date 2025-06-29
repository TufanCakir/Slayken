import {
  Svg,
  Circle,
  Path,
  Defs,
  RadialGradient,
  Stop,
} from "react-native-svg";

export default function Stormstrike({ size = 64 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Defs>
        {/* Glow außen */}
        <RadialGradient id="stormGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
          <Stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </RadialGradient>

        {/* Kern */}
        <RadialGradient id="stormCore" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#60a5fa" />
          <Stop offset="100%" stopColor="#2563eb" />
        </RadialGradient>

        {/* Blitzfüllung */}
        <RadialGradient id="innerStrike" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#93c5fd" />
          <Stop offset="100%" stopColor="#1d4ed8" />
        </RadialGradient>
      </Defs>

      {/* Äußerer Glow */}
      <Circle cx="32" cy="32" r="30" fill="url(#stormGlow)" />

      {/* Innerer Kern */}
      <Circle cx="32" cy="32" r="22" fill="url(#stormCore)" />

      {/* Blitzform */}
      <Path
        d="M28 14 L36 28 L30 28 L38 50 L26 32 L32 32 Z"
        fill="url(#innerStrike)"
      />

      {/* Funken / Partikel */}
      <Circle cx="15" cy="20" r="1.5" fill="#60a5fa" opacity="0.7" />
      <Circle cx="50" cy="18" r="1.2" fill="#3b82f6" opacity="0.5" />
      <Circle cx="22" cy="48" r="1.4" fill="#2563eb" opacity="0.6" />
      <Circle cx="44" cy="52" r="1.6" fill="#3b82f6" opacity="0.6" />
      <Circle cx="18" cy="38" r="1.3" fill="#60a5fa" opacity="0.5" />
      <Circle cx="48" cy="42" r="1.7" fill="#60a5fa" opacity="0.5" />
      <Circle cx="30" cy="10" r="1.4" fill="#3b82f6" opacity="0.4" />
      <Circle cx="36" cy="8" r="1.3" fill="#60a5fa" opacity="0.5" />
      <Circle cx="54" cy="28" r="1.4" fill="#2563eb" opacity="0.5" />
      <Circle cx="10" cy="26" r="1.2" fill="#3b82f6" opacity="0.5" />
      <Circle cx="40" cy="12" r="1.3" fill="#60a5fa" opacity="0.4" />
      <Circle cx="18" cy="50" r="1.5" fill="#3b82f6" opacity="0.6" />
    </Svg>
  );
}
