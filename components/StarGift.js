import Svg, { Path } from "react-native-svg";

export default function StarGift({ size = 50, color = "#FFD700" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Path
        d="M32 4L38.8 24H60L42 38L48.8 58L32 44L15.2 58L22 38L4 24H25.2L32 4Z"
        fill={color}
        stroke="#000"
        strokeWidth="2"
      />
    </Svg>
  );
}
