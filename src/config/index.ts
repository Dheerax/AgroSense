// Firebase configuration
// STEP 1: Go to Firebase Console -> Project Settings -> General Tab
// STEP 2: Scroll down to "Your apps" section  
// STEP 3: Click on your Android app
// STEP 4: Copy the config object from "Firebase SDK snippet"
// STEP 5: Replace the values below with your actual Firebase config
export const firebaseConfig = {
  // Replace with your Firebase config from Firebase Console
  apiKey: "AIzaSyD_QqWm6YXP1lbTfaFLH-xP2_XdKSC6awI",                    // From Firebase Console
  authDomain: "agrosense-ede09.firebaseapp.com",   // Replace agrosense-app with your project ID
  projectId: "agrosense-ede09",                     // Replace with your actual project ID
  storageBucket: "agrosense-ede09.appspot.com",    // Replace agrosense-app with your project ID
  messagingSenderId: "431028442747",              // Replace with your sender ID
  appId: "1:431028442747:android:abcdef123456"   // Replace with your app ID
};

// Weather API configuration
export const weatherConfig = {
  // OpenWeatherMap API key - get from openweathermap.org
  apiKey: "2e48929c43e79a18716e2c8e8120d4f5",
  baseUrl: "https://api.openweathermap.org/data/2.5"
};

// App configuration
export const appConfig = {
  defaultLanguage: "en",
  supportedLanguages: ["en", "hi", "ta", "te", "bn"], // English, Hindi, Tamil, Telugu, Bengali
  refreshInterval: 180000, // 3 minutes for IoT data
  weatherRefreshInterval: 600000, // 10 minutes for weather
};
