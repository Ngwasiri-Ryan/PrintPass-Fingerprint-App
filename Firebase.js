import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDnXc3q4nsNHcNixP7S60-NtqNRlkzNYaE",
  authDomain: "fingerprint-app-21420.firebaseapp.com",
  projectId: "fingerprint-app-21420",
  storageBucket: "fingerprint-app-21420.appspot.com",
  messagingSenderId: "246016884812",
  appId: "1:246016884812:web:2ea81a2cf38a06931e34e9",
  measurementId: "G-BCLYFHRVD8"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db  = getFirestore(app);

export {db as firestore}


