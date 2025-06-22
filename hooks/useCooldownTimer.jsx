import { useEffect, useState } from "react";

export default function useCooldownTimer(endTimestamp) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    let frame;
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, endTimestamp - now);
      setRemaining(diff / 1000);
      if (diff > 0) frame = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(frame);
  }, [endTimestamp]);

  return remaining;
}
