import Svg, { Path, Rect, Circle } from "react-native-svg";

export default function Icon({
  name,
  size = 40,
  color = "#fff",
  variant = "small",
}) {
  switch (name) {
    case "götter":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2l2 6h6l-5 4 2 6-5-3.5L7 18l2-6-5-4h6l2-6z"
            stroke={color}
            strokeWidth="2"
          />
        </Svg>
      );
    case "leere":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
          <Path d="M8 8l8 8M8 16l8-8" stroke={color} strokeWidth="1.5" />
        </Svg>
      );
    case "himmel":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2v20M5 10h14" stroke={color} strokeWidth="2" />
          <Circle cx="12" cy="6" r="2" fill={color} />
        </Svg>
      );
    case "ordnung":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="3"
            stroke={color}
            strokeWidth="2"
          />
          <Path d="M4 12h16" stroke={color} strokeWidth="2" />
        </Svg>
      );
    case "erdherzen":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2C7 5 4 10 4 14c0 5 4 8 8 8s8-3 8-8c0-4-3-9-8-12z"
            stroke={color}
            strokeWidth="2"
          />
        </Svg>
      );
    case "abgrund":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2c-5 0-9 5-9 10s4 10 9 10 9-5 9-10S17 2 12 2z"
            stroke={color}
            strokeWidth="2"
          />
          <Path d="M12 8v8" stroke={color} strokeWidth="2" />
        </Svg>
      );
    case "verdammnis":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2l4 8h6l-5 4 2 8-7-5-7 5 2-8-5-4h6l4-8z"
            stroke={color}
            strokeWidth="2"
          />
        </Svg>
      );
    case "feder":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M6 20l12-12M10 20l10-10M14 20l4-4"
            stroke={color}
            strokeWidth="2"
          />
        </Svg>
      );
    case "flammenrune":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2c2 4-2 6-2 10s3 6 3 8c0 2-2 2-2 2s6-2 6-8-5-6-5-12z"
            stroke={color}
            strokeWidth="2"
          />
        </Svg>
      );
  }
}
