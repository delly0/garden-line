import { useMemo } from 'react';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function useCelestialPosition(timeOfDay) {
  const hour = new Date().getHours();

  const { x, y } = useMemo(() => {
    // Define vertical boundaries for the sun/moon
    const topOfSky = 50; // pixels from top
    const bottomOfSky = height * 0.55 - 80; // just above the ground

    let t;

    if (timeOfDay === 'night') {
      // Moon path: 6pm (18) to 6am (6)
      const nightHour = hour >= 18 ? hour - 18 : hour + 6; // range 0–12
      t = nightHour / 12; // 0 = 6pm, 1 = 6am
    } else {
      // Sun path: 6am (6) to 6pm (18)
      t = (hour - 6) / 12;
    }

    // Clamp between 0 and 1
    const clampedT = Math.max(0, Math.min(1, t));

    const y = bottomOfSky - clampedT * (bottomOfSky - topOfSky);
    const x = width / 2; // always centered horizontally

    return { x, y };
  }, [timeOfDay, hour]);

  return { x, y };
}
