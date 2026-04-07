import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZKSVAXYcNDXU_z6P1GiYxrsCGDWOocDE",
  authDomain: "code-alambre.firebaseapp.com",
  projectId: "code-alambre",
  storageBucket: "code-alambre.firebasestorage.app",
  messagingSenderId: "629045773894",
  appId: "1:629045773894:web:024f2222edc8b2b17bec47"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
