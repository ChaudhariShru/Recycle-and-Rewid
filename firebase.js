// ==========================================
// FIREBASE CONFIGURATION
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCw8km1P5zP66hkgkguMM3cLBY6RN8mOXs",
  authDomain: "recycleandrewind.firebaseapp.com",
  projectId: "recycleandrewind",
  storageBucket: "recycleandrewind.firebasestorage.app",
  messagingSenderId: "635406177827",
  appId: "1:635406177827:web:424f6291371b4e5336c396",
};

firebase.initializeApp(firebaseConfig);

// Global access
const auth = firebase.auth();
const db = firebase.firestore();

console.log("Firebase initialized");