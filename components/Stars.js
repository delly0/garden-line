import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { View, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function Stars({ color = '#FFDDEE' }) {
  // Generate ~30 stars at random positions
  const stars = Array.from({ length: 30 }, (_, i) => ({
    cx: Math.random() * width,
    cy: Math.random() * 200,
    r: Math.random() * 1.8 + 1, // radius 1–2.8
    opacity: Math.random() * 0.5 + 0.4, // 0.4–0.9
  }));

  return (
    <View style={{ position: 'absolute', width, height: 200 }}>
      <Svg width={width} height={200}>
        {stars.map((star, index) => (
          <Circle
            key={index}
            cx={star.cx}
            cy={star.cy}
            r={star.r}
            fill="#E0EAFB"
            opacity={star.opacity}
          />
        ))}
      </Svg>
    </View>
  );
}
