import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function Sun({ x, y }) {
  return (
    <View style={[styles.sun, { left: x - 40, top: y - 40 }]} />
  );
}

const styles = StyleSheet.create({
  sun: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD700',
    opacity: 0.8,
  },
});
