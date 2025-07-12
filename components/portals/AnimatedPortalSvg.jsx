import React from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import {
  Svg,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Circle,
  Ellipse,
} from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function AnimatedPortalSvg({
  size = 72,
  colorA = "#ff6239",
  colorB = "#ffecd2",
  coreColor = "#fff",
  dual = false, // Für Himmel/Hölle-Portal
  style,
}) {
  // Animationen
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(29);

  React.useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 3700 }), -1, false);
    pulse.value = withRepeat(withTiming(33, { duration: 1200 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedGlowProps = useAnimatedProps(() => ({
    r: pulse.value,
  }));

  // Kern-Pulsieren
  const animatedCoreProps = useAnimatedProps(() => ({
    r: 18 + (pulse.value - 29) * 0.8,
  }));

  return (
    <Animated.View
      style={[{ width: size, height: size }, animatedStyle, style]}
    >
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          {/* Dual Gradient für Himmel/Hölle */}
          {dual ? (
            <LinearGradient id="dualGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={colorA} />
              <Stop offset="50%" stopColor="#fff" />
              <Stop offset="100%" stopColor={colorB} />
            </LinearGradient>
          ) : (
            <>
              {/* Normales Portal */}
              <RadialGradient id="portalCore" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#fff" stopOpacity="0.82" />
                <Stop offset="60%" stopColor={colorA} stopOpacity="0.92" />
                <Stop offset="100%" stopColor={colorB} stopOpacity="0.73" />
              </RadialGradient>
              <LinearGradient id="edge" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={colorA} />
                <Stop offset="100%" stopColor={colorB} />
              </LinearGradient>
            </>
          )}
          {/* Outer Glow */}
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="60%" stopColor={colorA} stopOpacity="0.56" />
            <Stop offset="95%" stopColor={colorB} stopOpacity="0.13" />
            <Stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {/* Outer Glow */}
        <AnimatedCircle
          cx="32"
          cy="32"
          fill="url(#glow)"
          opacity={0.66}
          animatedProps={animatedGlowProps}
        />
        {/* Magischer Rand */}
        <Ellipse
          cx="32"
          cy="32"
          rx="25"
          ry="28"
          fill="none"
          stroke={dual ? "url(#dualGrad)" : "url(#edge)"}
          strokeWidth="5"
          strokeDasharray="2 7"
          opacity={0.93}
        />
        {/* Komplett gefülltes Portal */}
        <AnimatedCircle
          cx="32"
          cy="32"
          fill={dual ? "url(#dualGrad)" : "url(#portalCore)"}
          opacity={0.97}
          animatedProps={animatedCoreProps}
        />
        {/* Inner Glow */}
        <Circle cx="32" cy="32" r="13" fill="url(#glow)" opacity={0.19} />
      </Svg>
    </Animated.View>
  );
}
