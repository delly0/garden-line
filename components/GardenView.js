import React from 'react';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

export default function GardenView({ flowers, onPressFlower }) {
  return (
    <View style={{ flex: 1 }}>
      {flowers.map((flower) => (
        <TouchableOpacity key={flower.id} onPress={() => onPressFlower?.(flower.thought)}>
          <LottieView
            source={flower.source}
            autoPlay
            loop
            style={{
              position: 'absolute',
              width: width * 0.25,
              height: width * 0.25,
              left: flower.left * width,
              top: flower.top,
            }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

