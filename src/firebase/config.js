import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Determine environment based on server URL
const isProd = process.env.REACT_APP_SERVER_URL?.includes('api.stellium.ai') &&
               !process.env.REACT_APP_SERVER_URL?.includes('dev');

// Dev Firebase config (stellium-dev)
const devConfig = {
  apiKey: "AIzaSyCVoe9OYOBBRwqqZoS5qjG8miCx-zWZR5Q",
  authDomain: "stellium-dev.firebaseapp.com",
  projectId: "stellium-dev",
  storageBucket: "stellium-dev.firebasestorage.app",
  messagingSenderId: "1056285065517",
  appId: "1:1056285065517:web:1f1ae9f2c6ff2b8bf8d3a4",
  measurementId: "G-8Y0GW0XM5H"
};

// Prod Firebase config (stellium-70a2a)
const prodConfig = {
  apiKey: "AIzaSyBnSYzpgghCC3c-0vdP1mvPeoy2vAz8I4E",
  authDomain: "stellium-70a2a.firebaseapp.com",
  projectId: "stellium-70a2a",
  storageBucket: "stellium-70a2a.firebasestorage.app",
  messagingSenderId: "63614597334",
  appId: "1:63614597334:web:13270f94893e38fa357177",
  measurementId: "G-TE4T0E0LRF"
};

const firebaseConfig = isProd ? prodConfig : devConfig;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth, isProd };
