import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCQGtATDVT-q1PX_28_p5v-oOI6gmeJkEQ",
  authDomain: "garden-line.firebaseapp.com",
  projectId: "garden-line",
  storageBucket: "garden-line.firebasestorage.app",
  messagingSenderId: "53074852327",
  appId: "1:53074852327:web:e7ee35f8c527e6a6e26542",
  measurementId: "G-YR4VJ5XC8X"
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
