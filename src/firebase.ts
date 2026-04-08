import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCXbUQtgZrARKIMqi2hV-mFgXLBrV7EMjg",
  authDomain: "cms-app-114.firebaseapp.com",
  databaseURL: "https://cms-app-114-default-rtdb.firebaseio.com",
  projectId: "cms-app-114",
  storageBucket: "cms-app-114.firebasestorage.app",
  messagingSenderId: "299612499191",
  appId: "1:299612499191:web:252fd9a8f2297327fe77f2"
};

export const app = initializeApp(firebaseConfig);