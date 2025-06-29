import React from 'react';
import Stars from './Stars';
import { View, StyleSheet } from 'react-native';

export default function NightStarLayer({ color }) {
  return (
    <View style={styles.container}>
      <Stars color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    opacity: 0.6,
  },
});
