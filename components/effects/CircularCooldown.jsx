import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import Svg, { Circle } from "react-native-svg";

const SIZE = 50;
const STROKE_WIDTH = 4;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function CircularCooldown({ duration }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: false, // SVG-Animation: nativeDriver nicht möglich
    }).start();
  }, [duration]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  return (
    <Svg width={SIZE} height={SIZE}>
      {/* Hintergrundkreis: Dunkelblau */}
      <Circle
        stroke="#1e293b"
        fill="none"
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        strokeWidth={STROKE_WIDTH}
      />
      {/* Fortschrittskreis: Kräftiges Blau/Cyan */}
      <AnimatedCircle
        stroke="#3b82f6"
        fill="none"
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        strokeWidth={STROKE_WIDTH}
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        // Optional: leichter Glow-Effekt für iOS
        // shadowColor="#60a5fa"
        // shadowOffset={{ width: 0, height: 0 }}
        // shadowOpacity={0.5}
        // shadowRadius={6}
      />
    </Svg>
  );
}
