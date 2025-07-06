import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const login = async () => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation handled by App.js
    } catch (e) {
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found') {
        setError('Invalid email or password.');
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌸 Welcome Back</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        placeholderTextColor="#888"
      />
      <Button title="Log In" onPress={login} />
      <Text style={styles.switchText} onPress={() => navigation.navigate('SignUp')}>
        No account? Sign up
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#FAF9F6' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  error: { color: 'red', marginBottom: 10, textAlign: 'center' },
  switchText: { marginTop: 15, textAlign: 'center', color: '#444' },
});


// import React, { useState } from 'react';
// import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '../firebaseConfig';

// export default function LoginScreen({ navigation }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const login = async () => {
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       navigation.replace('Garden');
//     } catch (e) {
//       console.log('Login error:', e);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
//       <TextInput
//         placeholder="Password"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//         style={styles.input}
//       />
//       <Button title="Log In" onPress={login} />
//       <Text onPress={() => navigation.navigate('SignUp')}>No account? Sign up</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 20 },
//   input: {
//     borderWidth: 1,
//     marginBottom: 12,
//     padding: 10,
//     borderRadius: 8,
//   },
// });
