import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function Sun() {
  return <View style={styles.sun} />;
}

const styles = StyleSheet.create({
  sun: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD700',
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    opacity: 0.8,
  },
});
