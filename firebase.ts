import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCJW1uPvlclrKEXh6FUXtvEhJmg4ezavN8",
    authDomain: "school-diary-b3967.firebaseapp.com",
    projectId: "school-diary-b3967",
    storageBucket: "school-diary-b3967.firebasestorage.app",
    messagingSenderId: "942574705110",
    appId: "1:942574705110:web:7e74a9ed6a5649d0d22c77"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);
