import React, { useRef, useEffect, useMemo } from "react";
import { Animated, Easing, View, StyleSheet } from "react-native";
import { Image } from "expo-image";

const GlassSpinner = React.memo(function GlassSpinner({
  size = 82,
  imageSource,
}) {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [spinAnim]);

  const spin = useMemo(
    () =>
      spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
      }),
    [spinAnim]
  );

  const imgSource = imageSource || require("../assets/loading.png");

  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Image
          source={imgSource}
          style={{ width: size, height: size }}
          contentFit="contain"
        />
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default GlassSpinner;
