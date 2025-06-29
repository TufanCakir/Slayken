import {
  Svg,
  Circle,
  Path,
  Defs,
  RadialGradient,
  Stop,
} from "react-native-svg";

export default function Windblade({ size = 64 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Defs>
        {/* Äußerer Glow */}
        <RadialGradient id="windGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
          <Stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </RadialGradient>

        {/* Kern */}
        <RadialGradient id="windCore" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#7dd3fc" />
          <Stop offset="100%" stopColor="#38bdf8" />
        </RadialGradient>

        {/* Blade-Füllung */}
        <RadialGradient id="innerBlade" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#bae6fd" />
          <Stop offset="100%" stopColor="#0ea5e9" />
        </RadialGradient>
      </Defs>

      {/* Glow */}
      <Circle cx="32" cy="32" r="30" fill="url(#windGlow)" />

      {/* Kern */}
      <Circle cx="32" cy="32" r="22" fill="url(#windCore)" />

      {/* Blade-Form */}
      <Path
        d="M32 12 C28 28, 36 36, 28 52 C38 44, 44 32, 32 12 Z"
        fill="url(#innerBlade)"
      />

      {/* Funken / Luftwirbel */}
      <Circle cx="15" cy="20" r="1.5" fill="#7dd3fc" opacity="0.7" />
      <Circle cx="50" cy="18" r="1.2" fill="#38bdf8" opacity="0.5" />
      <Circle cx="22" cy="48" r="1.4" fill="#0ea5e9" opacity="0.6" />
      <Circle cx="44" cy="52" r="1.6" fill="#38bdf8" opacity="0.6" />
      <Circle cx="18" cy="38" r="1.3" fill="#7dd3fc" opacity="0.5" />
      <Circle cx="48" cy="42" r="1.7" fill="#7dd3fc" opacity="0.5" />
      <Circle cx="30" cy="10" r="1.4" fill="#38bdf8" opacity="0.4" />
      <Circle cx="36" cy="8" r="1.3" fill="#7dd3fc" opacity="0.5" />
      <Circle cx="54" cy="28" r="1.4" fill="#0ea5e9" opacity="0.5" />
      <Circle cx="10" cy="26" r="1.2" fill="#38bdf8" opacity="0.5" />
      <Circle cx="40" cy="12" r="1.3" fill="#7dd3fc" opacity="0.4" />
      <Circle cx="18" cy="50" r="1.5" fill="#38bdf8" opacity="0.6" />
    </Svg>
  );
}
