import React, { useEffect, useRef, useMemo } from "react";
import { Animated, Easing } from "react-native";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircularCooldown = React.memo(function CircularCooldown({
  duration,
  size = 36,
  strokeWidth = 3,
  color = "#3b82f6",
  bgColor = "#1e293b",
}) {
  const progress = useRef(new Animated.Value(0)).current;

  // Stable memoized geometry
  const { radius, circumference } = useMemo(() => {
    const r = (size - strokeWidth) / 2;
    return { radius: r, circumference: 2 * Math.PI * r };
  }, [size, strokeWidth]);

  // Run animation when duration changes
  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [duration, progress]);

  // Animated offset
  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <Svg width={size} height={size}>
      {/* Background circle */}
      <Circle
        stroke={bgColor}
        fill="none"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
      />
      {/* Animated cooldown circle */}
      <AnimatedCircle
        stroke={color}
        fill="none"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
    </Svg>
  );
});

export default CircularCooldown;
