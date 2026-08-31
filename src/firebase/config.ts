import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import firebaseConfigJson from "../../firebase-applet-config.json";

// Initialize Firebase App
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  if (!getApps().length) {
    app = initializeApp({
      apiKey: firebaseConfigJson.apiKey,
      authDomain: firebaseConfigJson.authDomain,
      projectId: firebaseConfigJson.projectId,
      storageBucket: firebaseConfigJson.storageBucket,
      messagingSenderId: firebaseConfigJson.messagingSenderId,
      appId: firebaseConfigJson.appId,
    });
  } else {
    app = getApp();
  }

  auth = getAuth(app);
  
  // Custom Firestore database ID as configured in firebase-applet-config.json
  const databaseId = firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== "(default)"
    ? firebaseConfigJson.firestoreDatabaseId
    : "(default)";

  db = getFirestore(app, databaseId);
} catch (err) {
  console.warn("Firebase initialization warning (using local fallbacks if needed):", err);
  // Fallback safe initialization
  app = getApps().length ? getApp() : initializeApp({
    apiKey: "AIzaDummyKey",
    projectId: "sportiva-fallback",
    authDomain: "sportiva.firebaseapp.com"
  });
  auth = getAuth(app);
  db = getFirestore(app);
}

export const getGoogleProvider = (): GoogleAuthProvider => {
  return new GoogleAuthProvider();
};

export { app, auth, db };
