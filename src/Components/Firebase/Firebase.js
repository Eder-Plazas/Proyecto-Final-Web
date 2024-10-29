
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB0MoDOnlvmrkIgbtrFPOFuYwfmVBEee-Y",
    authDomain: "proyecto-final-web-7a800.firebaseapp.com",
    projectId: "proyecto-final-web-7a800",
    storageBucket: "proyecto-final-web-7a800.appspot.com",
    messagingSenderId: "673604022801",
    appId: "1:673604022801:web:b2a6f2497be66fc97a37b0"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
