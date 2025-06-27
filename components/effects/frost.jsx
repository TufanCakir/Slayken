import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

export default function FrostIcon({ size = 80 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* Äußerer Glow */}
        <RadialGradient id="frostGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#00ccff" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#001f33" stopOpacity="0" />
        </RadialGradient>

        {/* Eis-Gradient für den Kern */}
        <RadialGradient id="frostCore" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#aaf0ff" />
          <Stop offset="100%" stopColor="#00ccff" />
        </RadialGradient>
      </Defs>

      {/* Glow-Kreis */}
      <Circle cx="50" cy="50" r="45" fill="url(#frostGlow)" />

      {/* Frost-Kern */}
      <Circle cx="50" cy="50" r="35" fill="url(#frostCore)" />
    </Svg>
  );
}
