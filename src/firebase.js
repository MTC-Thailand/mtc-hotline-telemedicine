// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCn704WzidL0qz-SZNbWkqSOjm0CcIlnm8",
  authDomain: "mtc-telemedicine.firebaseapp.com",
  projectId: "mtc-telemedicine",
  storageBucket: "mtc-telemedicine.appspot.com",
  messagingSenderId: "795663161591",
  appId: "1:795663161591:web:1ecb2c9f6754534861dbf2",
  measurementId: "G-X7FBR9LYK4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }
