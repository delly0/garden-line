import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import Sun from '../components/Sun';
import NightStarLayer from '../components/NightStarLayer';
import DayMoodAura from '../components/DayMoodAura';

const { width } = Dimensions.get('window');

const flowerSources = [
  require('../assets/lottie/flower1.json'),
  require('../assets/lottie/flower2.json'),
  require('../assets/lottie/flower3.json'),
  require('../assets/lottie/flower4.json'),
];


export default function GardenScreen() {
  const [moodColor, setMoodColor] = useState('#FFDDEE');
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [plantedFlowers, setPlantedFlowers] = useState([]);

  const plantRandomFlower = () => {
    const source = flowerSources[Math.floor(Math.random() * flowerSources.length)];
    const left = Math.random() * 0.8 + 0.1; // 10% to 90% across

    // Flower spawn range: bottom 45% of screen height
    const screenHeight = Dimensions.get('window').height;
    const groundTopY = screenHeight * 0.40;
    const top = groundTopY + Math.random() * (screenHeight * 0.45 - width * 0.25); // subtract flower height

    const newFlower = {
      id: Date.now().toString(),
      source,
      left,
      top,
    };

    setPlantedFlowers((prev) => [...prev, newFlower]);
  };



  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 7) setTimeOfDay('sunrise');
    else if (hour >= 7 && hour < 18) setTimeOfDay('day');
    else if (hour >= 18 && hour < 20) setTimeOfDay('sunset');
    else setTimeOfDay('night');
  }, []);

  const getSkyStyle = () => {
    switch (timeOfDay) {
      case 'sunrise': return { backgroundColor: '#FFCBA4' };
      case 'day': return { backgroundColor: '#BEE3F8' };
      case 'sunset': return { backgroundColor: '#FDB5B5' };
      case 'night': return { backgroundColor: '#1B1F3B' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Sky Background */}
      <View style={[styles.sky, getSkyStyle()]} />

      {/* Mood Effects */}
      {(timeOfDay === 'night' || timeOfDay === 'sunset') && (
        <NightStarLayer color={moodColor} />
      )}

      {(timeOfDay === 'day') && (
        <>
          <DayMoodAura color={moodColor} />
          <Sun />
        </>
      )}

      {timeOfDay === 'sunrise' && <Sun />}

      {/* Ground visual */}
      <View style={styles.ground} />

      {/* Garden with Lottie flowers */}
      {plantedFlowers.map((flower) => (
      <LottieView
        key={flower.id}
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
    ))}

      {/* 🌞 Manual time-of-day toggle buttons */}
      <View style={styles.timeToggle}>
        {['sunrise', 'day', 'sunset', 'night'].map((t) => (
          <TouchableOpacity key={t} onPress={() => setTimeOfDay(t)} style={styles.timeButton}>
            <Text style={styles.timeText}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={plantRandomFlower} style={styles.plantButton}>
        <Text style={styles.plantButtonText}>Plant Flower 🌸</Text>
      </TouchableOpacity>

      {/* Mood Color Picker */}
      <View style={styles.colorPicker}>
        {['#FFDDEE', '#B2F7EF', '#FFF1A5', '#D0F0C0'].map((color) => (
          <TouchableOpacity
            key={color}
            onPress={() => setMoodColor(color)}
            style={[styles.colorCircle, { backgroundColor: color }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sky: {
    position: 'absolute',
    width: '100%',
    height: '55%',
  },
  gardenArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
    marginTop: 60,
  },
  row: {
    flexDirection: 'row',
    gap: 20,
    marginVertical: 10,
  },
  flowerWrapper: {
    marginTop: 20, // shifts flowers down to "sit" on ground
  },
  plant: {
    width: width * 0.35,
    height: width * 0.35,
  },
  colorPicker: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#999',
  },
  timeToggle: {
    position: 'absolute',
    top: 50, // moved down from 10 so it's tappable
    right: 10,
    flexDirection: 'row',
    backgroundColor: '#ffffffcc',
    padding: 6,
    borderRadius: 8,
    zIndex: 10,
    elevation: 10,
  },
  timeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#eee',
    marginHorizontal: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#333',
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '45%',
    backgroundColor: '#A3C9A8',
  },
  plantButton: {
    position: 'absolute',
    bottom: 90,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#aaa',
    alignSelf: 'center',
    elevation: 5,
  },
  plantButtonText: {
    fontSize: 16,
    color: '#444',
  },
});
