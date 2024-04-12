// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBM9gP24PlaOA4kvID_WFx7RoB4y17mIg8",
  authDomain: "asi1b-5445c.firebaseapp.com",
  databaseURL: "https://asi1b-5445c-default-rtdb.firebaseio.com",
  projectId: "asi1b-5445c",
  storageBucket: "asi1b-5445c.appspot.com",
  messagingSenderId: "1072806194700",
  appId: "1:1072806194700:web:bdb501fada9c213701c829",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
