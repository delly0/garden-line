import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function DayMoodAura({ color = '#FFDDEE' }) {
  return (
    <LinearGradient
      colors={[color, `${color}55`, `${color}00`]} // Mid-stop adds softness
      style={styles.glow}
      start={{ x: 0.5, y: 0.5 }}
      end={{ x: 1, y: 1 }} 
    />
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    opacity: 0.3,
  },
});
