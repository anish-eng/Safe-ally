// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// might need to make this admin later
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCldYBUGiYWMPLOKyzV5Ja2aJYvhdiIwSg",
  authDomain: "domesticabuse-12902.firebaseapp.com",
  projectId: "domesticabuse-12902",
  storageBucket: "domesticabuse-12902.firebasestorage.app",
  messagingSenderId: "684322539364",
  appId: "1:684322539364:web:cca065cb3d1d1a414c1c71",
  measurementId: "G-XY9JDJLRHQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const functions = getFunctions(app, "us-central1");
