import Svg, { Rect, Path } from "react-native-svg";

export default function GiftBox({ size = 50, color = "#FFD700" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Rect x="8" y="20" width="48" height="36" fill={color} />
      <Path d="M8 28H56" stroke="#000" strokeWidth="2" />
      <Path
        d="M32 8C38 12 26 20 26 20H38C38 20 26 12 32 8Z"
        fill={color}
        stroke="#000"
        strokeWidth="2"
      />
    </Svg>
  );
}
