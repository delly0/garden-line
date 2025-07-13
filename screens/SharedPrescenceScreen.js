import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import tinycolor from 'tinycolor2';
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function SharedPresenceScreen({ route }) {
  const { userColor, friendColor, friendName, friendId, chatId } = route.params;
  const userId = auth.currentUser?.uid;

  const [bgColor, setBgColor] = useState(userColor);
  const [isBothPresent, setIsBothPresent] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [isBothTouching, setIsBothTouching] = useState(false);

  const anim = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const sharedGlow = useRef(new Animated.Value(0)).current;

  // Animate background color blending
  useEffect(() => {
    const id = anim.addListener(({ value }) => {
      const mixedColor = tinycolor.mix(userColor, friendColor, value * 100).toHexString();
      setBgColor(mixedColor);
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 4000, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 4000, useNativeDriver: false }),
      ])
    ).start();

    return () => {
      anim.removeListener(id);
    };
  }, [anim, userColor, friendColor]);

  // Breathing circle animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.3, duration: 2000, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Animate glow when both touching
    useEffect(() => {
    if (isBothTouching) {
        Animated.loop(
        Animated.sequence([
            Animated.timing(sharedGlow, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true, // now animating opacity, which supports native driver
            }),
            Animated.timing(sharedGlow, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
            }),
        ])
        ).start();
    } else {
        sharedGlow.stopAnimation();
        sharedGlow.setValue(0);
    }
    }, [isBothTouching]);

  const glowInterpolate = sharedGlow.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffffff33', '#ffffff99'],
  });

  // Presence syncing with Firestore
  useEffect(() => {
    const sessionRef = doc(db, 'sharedPresenceSessions', chatId);

    const initPresence = async () => {
      await setDoc(sessionRef, {
        [userId]: {
          online: true,
          touching: false,
          lastUpdated: serverTimestamp(),
        },
      }, { merge: true });
    };

    initPresence();

    const unsubscribe = onSnapshot(sessionRef, (docSnap) => {
      const data = docSnap.data();
      if (!data) return;

      const bothPresent = data[userId]?.online && data[friendId]?.online;
      const bothTouching = data[userId]?.touching && data[friendId]?.touching;

      setIsBothPresent(bothPresent);
      setIsBothTouching(bothTouching);
    });

    return () => {
      updateDoc(sessionRef, {
        [`${userId}.online`]: false,
        [`${userId}.touching`]: false,
        [`${userId}.lastUpdated`]: serverTimestamp(),
      });
      unsubscribe();
    };
  }, []);

  const handleTouchChange = (touching) => {
    setIsTouching(touching);
    updateDoc(doc(db, 'sharedPresenceSessions', chatId), {
      [`${userId}.touching`]: touching,
      [`${userId}.lastUpdated`]: serverTimestamp(),
    });
  };

  return (
    <Pressable
      style={[styles.container, { backgroundColor: bgColor }]}
      onPressIn={() => handleTouchChange(true)}
      onPressOut={() => handleTouchChange(false)}
    >
      {isBothTouching ? (
        <Text style={styles.waitingText}>You're holding hands 🌸</Text>
      ) : isBothPresent ? (
        <Text style={styles.waitingText}>You're together now 💖</Text>
      ) : (
        <Text style={styles.waitingText}>Waiting for {friendName}...</Text>
      )}

      <Animated.View style={[styles.circle, { backgroundColor: glowInterpolate }]}>
        <Animated.View style={{ flex: 1, transform: [{ scale }] }} />
    </Animated.View>

    </Pressable>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 30,
    fontWeight: '500',
  },
  circle: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    backgroundColor: '#ffffff33',
  },
});