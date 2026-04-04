// Firebase web app config
// TODO: replace with your actual Firebase project config
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCkb2tVarvKJgrLjTCamLJbX-XgRBSvJ5A",
  authDomain: "dev-trials-c60de.firebaseapp.com",
  projectId: "dev-trials-c60de",
  storageBucket: "dev-trials-c60de.firebasestorage.app",
  messagingSenderId: "61817758260",
  appId: "1:61817758260:web:31a3c38b0072158d06e061",
  measurementId: "G-H7HL9MJCXM"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
