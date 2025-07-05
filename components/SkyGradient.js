import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SkyGradient({ timeOfDay }) {
  const gradients = {
    day: ['#A6D5FA', '#E1F4FF'],
    sunrise: ['#FFA17F', '#FFD194'],
    sunset: ['#FDB99B', '#CF8BF3'],
    night: ['#1B1F3B', '#2C3E50'],
  };

  const colors = gradients[timeOfDay] || gradients.day;

  return (
    <LinearGradient
      colors={colors}
      style={styles.gradient}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    />
  );
}

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    width,
    height: height * 0.55,
    top: 0,
    left: 0,
  },
});
