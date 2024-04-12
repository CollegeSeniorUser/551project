// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1A0u9lFVdAlTCaPiTq0w539dabQsd8LY",
  authDomain: "asi1-99476.firebaseapp.com",
  databaseURL: "https://asi1-99476-default-rtdb.firebaseio.com",
  projectId: "asi1-99476",
  storageBucket: "asi1-99476.appspot.com",
  messagingSenderId: "1014743766775",
  appId: "1:1014743766775:web:861165f900af6f694fe5f2",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig, "secondary");
export const database = getDatabase(app);
