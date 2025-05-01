// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJtayHr8OUWepbmD8qFhn_R1cpDnjVCtY",
  authDomain: "subscription-42024.firebaseapp.com",
  projectId: "subscription-42024",
  storageBucket: "subscription-42024.appspot.com",
  messagingSenderId: "271775222342",
  appId: "1:271775222342:web:6cd5e9b3ec8946a8845847",
  measurementId: "G-JLPPEKYDEK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(firebase);
const firebase = getAuth(app);
export const database = getDatabase(app);
export const firestore = getFirestore(app);
export default firebase;
