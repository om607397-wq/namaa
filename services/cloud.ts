import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from "firebase/auth";
import { getAllAppData, restoreAppData, getProfile } from "./storage";

// Configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyBheaN0G2MF3c88huVoaPcu4L98ZACdfwQ",
  authDomain: "engaz-95920.firebaseapp.com",
  projectId: "engaz-95920",
  storageBucket: "engaz-95920.firebasestorage.app",
  messagingSenderId: "453713084663",
  appId: "1:453713084663:web:ddf3e39c470c3d8bc753f2",
  measurementId: "G-BZH1RE3EZD"
};

// Initialize Firebase immediately
let app;
let db: any = null;
let auth: any = null;

try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase App Initialization Error:", error);
}

// Initialize services separately so one failure doesn't block others
if (app) {
  try {
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase Firestore Initialization Error:", error);
  }

  try {
    auth = getAuth(app);
    // Explicitly set persistence to LOCAL
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error("Auth Persistence Error:", error);
    });
  } catch (error) {
    console.error("Firebase Auth Initialization Error:", error);
  }
}

// --- Auth Functions ---

// Helper to clear only App Data, keeping Settings (like Dark Mode) if desired
export const clearLocalData = () => {
  Object.keys(localStorage).forEach(key => {
    // Remove all keys starting with 'injaz_' EXCEPT 'injaz_settings' (to keep theme)
    if (key.startsWith('injaz_') && key !== 'injaz_settings') {
       localStorage.removeItem(key);
    }
  });
};

export const registerUser = async (email: string, pass: string) => {
  if (!auth) throw new Error("Firebase Auth not initialized");
  // CRITICAL: Clear old data before registering a new user
  clearLocalData();
  return await createUserWithEmailAndPassword(auth, email, pass);
};

export const loginUser = async (email: string, pass: string) => {
  if (!auth) throw new Error("Firebase Auth not initialized");
  // We don't clear data here immediately, we rely on downloadDataFromCloud to overwrite it,
  // or the Login page useEffect to clear it on mount.
  return await signInWithEmailAndPassword(auth, email, pass);
};

export const loginWithGoogle = async () => {
  if (!auth) throw new Error("Firebase Auth not initialized");
  const provider = new GoogleAuthProvider();
  // CRITICAL: Clear old data before google login
  clearLocalData();
  return await signInWithPopup(auth, provider);
};

export const logoutUser = async () => {
  if (!auth) return;
  
  // CRITICAL FIX: Clear local storage data on logout
  // This prevents the "sticky account" issue where a new user sees old user's data
  clearLocalData();

  await signOut(auth);
  // Force reload to clear React state and ensure clean slate
  window.location.reload();
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = () => auth?.currentUser;

// --- Data Sync ---

const COLLECTION_NAME = "users_data";

export const uploadDataToCloud = async () => {
  if (!db) throw new Error("Firebase Firestore not initialized");
  if (!auth) throw new Error("Firebase Auth not initialized");
  
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");
  
  const data = getAllAppData();
  const profile = getProfile();
  
  // Use User UID as document ID
  await setDoc(doc(db, COLLECTION_NAME, user.uid), {
    updatedAt: new Date().toISOString(),
    profileName: profile.name,
    email: user.email,
    data: JSON.stringify(data)
  }, { merge: true });
};

export const downloadDataFromCloud = async () => {
  if (!db) throw new Error("Firebase Firestore not initialized");
  if (!auth) throw new Error("Firebase Auth not initialized");

  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  try {
    const docRef = doc(db, COLLECTION_NAME, user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const remoteData = docSnap.data();
      if (remoteData.data) {
        // Clear local data before restoring to ensure no mixing
        clearLocalData();
        const parsedData = JSON.parse(remoteData.data);
        restoreAppData(parsedData);
        console.log("Cloud data restored successfully");
        return true;
      }
    } else {
      console.log("No cloud data found, using fresh start.");
      // Ensure we are not showing OLD data from localStorage if cloud has nothing
      clearLocalData();
    }
  } catch (e) {
    console.warn("Error downloading data (might be permission or network):", e);
    return false;
  }
  return false;
};