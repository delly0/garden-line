import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function Moon({ x, y }) {
  return (
    <View style={[styles.moon, { left: x - 30, top: y - 30 }]} />
  );
}

const styles = StyleSheet.create({
  moon: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0EAFB',
    opacity: 0.6,
  },
});
