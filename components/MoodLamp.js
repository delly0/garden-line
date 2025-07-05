import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function MoodLamp({ color = '#FFDDEE' }) {
  return (
    <View style={[styles.lamp, { backgroundColor: color }]} />
  );
}

const styles = StyleSheet.create({
  lamp: {
    position: 'absolute',
    top: 100,
    right: 40,
    width: 50,
    height: 50,
    borderRadius: 25,
    opacity: 0.5,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
});
