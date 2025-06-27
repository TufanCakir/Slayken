import {
  Svg,
  Circle,
  Path,
  Defs,
  RadialGradient,
  Stop,
} from "react-native-svg";

export default function Voidball({ size = 64 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Defs>
        {/* Void Glow außen */}
        <RadialGradient id="voidGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#9f5fff" stopOpacity="0.55" />
          <Stop offset="60%" stopColor="#4b0675" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#000" stopOpacity="0" />
        </RadialGradient>

        {/* Void Core */}
        <RadialGradient id="voidCore" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#d1c7ff" />
          <Stop offset="100%" stopColor="#5e3887" />
        </RadialGradient>

        {/* Void Innere Flamme */}
        <RadialGradient id="voidFlame" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#8233c5" />
          <Stop offset="80%" stopColor="#230536" />
          <Stop offset="100%" stopColor="#000" />
        </RadialGradient>
      </Defs>

      {/* Glow außen */}
      <Circle cx="32" cy="32" r="30" fill="url(#voidGlow)" />

      {/* Innerer Void-Kreis */}
      <Circle cx="32" cy="32" r="22" fill="url(#voidCore)" />

      {/* Void-Flammenform */}
      <Path
        d="M22 34 C26 14, 44 14, 42 34 C40 54, 24 54, 22 34"
        fill="url(#voidFlame)"
      />
    </Svg>
  );
}
