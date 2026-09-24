import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";


const firebaseConfig = {
  apiKey: "AIzaSyBcz6b0vU-Wn5ETU9GQk1M7F9npq7yC1uQ",
  authDomain: "diet-planner-new.firebaseapp.com",
  projectId: "diet-planner-new",
  storageBucket: "diet-planner-new.firebasestorage.app",
  messagingSenderId: "987687178599",
  appId: "1:987687178599:web:be77459e60354d6d541fc2"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const messaging = getMessaging(app);