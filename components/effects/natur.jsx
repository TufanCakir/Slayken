import {
  Svg,
  Circle,
  Path,
  Defs,
  RadialGradient,
  Stop,
} from "react-native-svg";

export default function Naturball({ size = 64 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Defs>
        {/* Glow außen */}
        <RadialGradient id="natureGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="lightgreen" stopOpacity="0.5" />
          <Stop offset="100%" stopColor="green" stopOpacity="0" />
        </RadialGradient>

        {/* Kern */}
        <RadialGradient id="natureCore" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#a7f3d0" />
          <Stop offset="100%" stopColor="#22c55e" />
        </RadialGradient>

        {/* Innere Struktur (statt Flamme) */}
        <RadialGradient id="innerNature" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#16a34a" />
          <Stop offset="100%" stopColor="#065f46" />
        </RadialGradient>
      </Defs>

      {/* Äußerer Glow */}
      <Circle cx="32" cy="32" r="30" fill="url(#natureGlow)" />

      {/* Innerer Naturkreis */}
      <Circle cx="32" cy="32" r="22" fill="url(#natureCore)" />

      {/* Blattartige Form */}
      <Path
        d="M32 14 C38 20, 44 28, 32 50 C20 28, 26 20, 32 14"
        fill="url(#innerNature)"
      />

      {/* Partikel (Sporen, Funken) */}
      <Circle cx="12" cy="18" r="1.6" fill="#bbf7d0" opacity="0.7" />
      <Circle cx="50" cy="16" r="1.4" fill="#86efac" opacity="0.6" />
      <Circle cx="24" cy="48" r="1.7" fill="#4ade80" opacity="0.6" />
      <Circle cx="44" cy="54" r="1.5" fill="#22c55e" opacity="0.5" />
      <Circle cx="16" cy="38" r="1.3" fill="#bbf7d0" opacity="0.5" />
      <Circle cx="48" cy="42" r="1.4" fill="#86efac" opacity="0.6" />
      <Circle cx="28" cy="8" r="1.3" fill="#4ade80" opacity="0.4" />
      <Circle cx="36" cy="6" r="1.5" fill="#22c55e" opacity="0.5" />
      <Circle cx="54" cy="30" r="1.2" fill="#bbf7d0" opacity="0.5" />
      <Circle cx="10" cy="26" r="1.3" fill="#86efac" opacity="0.5" />
      <Circle cx="40" cy="12" r="1.3" fill="#4ade80" opacity="0.4" />
      <Circle cx="18" cy="50" r="1.4" fill="#22c55e" opacity="0.6" />
    </Svg>
  );
}
