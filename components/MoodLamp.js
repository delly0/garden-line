import React, { useEffect, useState, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function MoodLamp({ currentUserColor }) {
  const [color, setColor] = useState('#ccc');
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const docRef = doc(db, 'moodLamp', 'shared'); // single doc named 'shared'
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setColor(docSnap.data().color || '#ccc');
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  const handlePress = async () => {
    if (!auth.currentUser) return;
    try {
      await setDoc(doc(db, 'moodLamp', 'shared'), {
        color: currentUserColor,
        lastUpdated: new Date(),
      }, { merge: true });
    } catch (e) {
      console.error('Error updating lamp color:', e);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.lampContainer} activeOpacity={0.8}>
      <Animated.View style={[styles.glow, { backgroundColor: color, opacity: glowOpacity }]} />
      <Animated.View style={[styles.lamp, { backgroundColor: color }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  lampContainer: {
    position: 'absolute',
    top: 300,  // adjust position as needed
    left: 150, // adjust position as needed
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  lamp: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowRadius: 4,
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 2 },
  },
  glow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    shadowColor: '#000',
    shadowRadius: 15,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
  },
});


// import React, { useEffect, useState } from 'react';
// import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
// import { db, auth } from '../firebaseConfig';
// import { doc, onSnapshot, setDoc } from 'firebase/firestore';

// export default function MoodLamp({ lampUserId, lampPosition }) {
//   const currentUser = auth.currentUser;
//   const [color, setColor] = useState('#ccc');
//   const glowAnim = React.useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     // Listen to mood lamp color changes in Firestore
//     const unsubscribe = onSnapshot(doc(db, 'moodLamps', lampUserId), (docSnap) => {
//       if (docSnap.exists()) {
//         setColor(docSnap.data().color || '#ccc');
//       }
//     });

//     return unsubscribe;
//   }, [lampUserId]);

//   useEffect(() => {
//     // Animate glowing effect - pulse opacity
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(glowAnim, {
//           toValue: 1,
//           duration: 1500,
//           useNativeDriver: true,
//         }),
//         Animated.timing(glowAnim, {
//           toValue: 0,
//           duration: 1500,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   }, []);

//   const handlePress = async () => {
//     if (!currentUser) return;

//     // Update lamp color to current user's color
//     // Assume you have user color stored locally or fetched from firestore
//     // For example, let's fetch current user color once or pass as prop
//     const currentUserColor = '#BAFFC9'; // replace this with actual user color state or prop

//     await setDoc(doc(db, 'moodLamps', lampUserId), {
//       color: currentUserColor,
//       userId: lampUserId,
//       lastUpdated: new Date(),
//     }, { merge: true });
//   };

//   // Interpolate glow animation between 0.5 and 1 opacity
//   const glowOpacity = glowAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0.5, 1],
//   });

//   return (
//     <TouchableOpacity
//       onPress={handlePress}
//       style={[styles.lampContainer, { top: lampPosition.y, left: lampPosition.x }]}
//       activeOpacity={0.8}
//     >
//       <Animated.View
//         style={[
//           styles.glow,
//           { backgroundColor: color, opacity: glowOpacity },
//         ]}
//       />
//       <View style={[styles.lamp, { backgroundColor: color }]} />
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   lampContainer: {
//     position: 'absolute',
//     width: 60,
//     height: 60,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   lamp: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     borderWidth: 2,
//     borderColor: '#fff',
//     shadowColor: '#000',
//     shadowRadius: 4,
//     shadowOpacity: 0.7,
//     shadowOffset: { width: 0, height: 2 },
//   },
//   glow: {
//     position: 'absolute',
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     shadowColor: '#000',
//     shadowRadius: 15,
//     shadowOpacity: 0.6,
//     shadowOffset: { width: 0, height: 0 },
//     // backgroundColor set dynamically to lamp color
//   },
// });
