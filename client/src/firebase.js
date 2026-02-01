import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyA-BsQ5SGdOFfZycKJSekZ6VrVskGVIuJg",
    authDomain: "campus-connects-49a93.firebaseapp.com",
    projectId: "campus-connects-49a93",
    storageBucket: "campus-connects-49a93.firebasestorage.app",
    messagingSenderId: "454794694447",
    appId: "1:454794694447:web:af09561203b3941c575bda"
};

const app = initializeApp(firebaseConfig);

// Initialize messaging with error handling
let messaging = null;
try {
    messaging = getMessaging(app);
} catch (error) {
    console.warn('Firebase messaging not available:', error.message);
}

export { messaging };
