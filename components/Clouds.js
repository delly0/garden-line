import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Dimensions, Image, View, forEach } from 'react-native';

const { width } = Dimensions.get('window');

const CLOUD_COUNT = 5; // Number of cloud images to show max

export default function Clouds({ show, coverage = 0 }) {
  const cloudAnims = useRef(
    [...Array(CLOUD_COUNT)].map(() => new Animated.Value(Math.random()))
  ).current;

  useEffect(() => {
    if (!show) return;

    cloudAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 15000 + i * 3000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 15000 + i * 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [show]);

  if (!show || coverage <= 0) return null;

  // Determine how many clouds to show based on coverage (max CLOUD_COUNT)
  const cloudsToShow = Math.ceil(CLOUD_COUNT * coverage);

  return (
    <View style={styles.container}>
      {[...Array(cloudsToShow)].map((_, i) => {
        const translateX = cloudAnims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [-30 - i * 10, 30 + i * 10], // different ranges for natural effect
        });

        return (
          <Animated.Image
            key={i}
            source={require('../assets/images/cloud.png')}
            style={[
              styles.cloud,
              {
                opacity: 0.4 + coverage * 0.6, // more coverage = more opaque clouds
                transform: [{ translateX }],
                top: 40 + i * 15, // stagger vertical position
                left: 20 * i, // stagger horizontal start position
                width: 120 + i * 20,
                height: 60 + i * 10,
              },
            ]}
            resizeMode="contain"
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: width,
    height: 150,
    top: 50,
    left: 0,
    overflow: 'visible',
  },
  cloud: {
    position: 'absolute',
  },
});
