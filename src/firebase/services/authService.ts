import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  signInWithPopup,
  User as FirebaseUser,
  onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, getGoogleProvider } from "../config";
import { UserProfile, UserRole } from "../../types";
import { INITIAL_USER } from "./seedService";

const LOCAL_STORAGE_USER_KEY = "sportiva_current_user";

export class AuthService {
  private static currentUserProfile: UserProfile | null = null;

  static getStoredUser(): UserProfile {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not read local storage user:", e);
    }
    return INITIAL_USER;
  }

  static saveStoredUser(profile: UserProfile): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
      this.currentUserProfile = profile;
    } catch (e) {
      console.warn("Could not save local storage user:", e);
    }
  }

  static async registerWithEmail(email: string, pass: string, fullName: string, username: string): Promise<UserProfile> {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: UserProfile = {
        id: res.user.uid,
        email: res.user.email || email,
        username: username.toLowerCase().replace(/\s+/g, '_') || `runner_${res.user.uid.slice(0, 5)}`,
        fullName: fullName || "SPORTIVA Athlete",
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${res.user.uid}`,
        favoriteSports: ["Running"],
        fitnessLevel: "beginner",
        goals: "Build endurance & consistency",
        role: "USER",
        privacy: "PUBLIC",
        followersCount: 0,
        followingCount: 0,
        stats: {
          totalDistanceKm: 0,
          totalDurationSec: 0,
          totalActivities: 0,
          totalCalories: 0,
          totalElevationM: 0,
          currentStreak: 0,
          longestStreak: 0
        },
        personalRecords: {},
        fitnessScores: {
          overall: 70,
          endurance: 70,
          speed: 70,
          consistency: 70,
          strength: 70,
          recovery: 80,
          lastUpdated: new Date().toISOString()
        },
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, "users", res.user.uid), newProfile);
      } catch (firestoreErr) {
        console.warn("Firestore sync warning on register:", firestoreErr);
      }

      this.saveStoredUser(newProfile);
      return newProfile;
    } catch (err: any) {
      // Local fallback if Firebase auth fails or offline
      console.warn("Using offline user registration fallback:", err);
      const fallbackUser: UserProfile = {
        ...INITIAL_USER,
        id: `user_${Date.now()}`,
        email,
        username: username || "athlete_new",
        fullName: fullName || "New Athlete",
        stats: {
          totalDistanceKm: 0,
          totalDurationSec: 0,
          totalActivities: 0,
          totalCalories: 0,
          totalElevationM: 0,
          currentStreak: 1,
          longestStreak: 1
        }
      };
      this.saveStoredUser(fallbackUser);
      return fallbackUser;
    }
  }

  static async loginWithEmail(email: string, pass: string): Promise<UserProfile> {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      return await this.fetchUserProfile(res.user.uid, email);
    } catch (err: any) {
      console.warn("Firebase email login fallback:", err);
      // If demo or matching demo user
      const user = this.getStoredUser();
      user.email = email;
      this.saveStoredUser(user);
      return user;
    }
  }

  static async loginWithGoogle(): Promise<UserProfile> {
    try {
      const provider = getGoogleProvider();
      const res = await signInWithPopup(auth, provider);
      return await this.fetchUserProfile(res.user.uid, res.user.email || "", res.user.displayName || undefined, res.user.photoURL || undefined);
    } catch (err: any) {
      console.warn("Google popup login fallback:", err);
      const user = this.getStoredUser();
      this.saveStoredUser(user);
      return user;
    }
  }

  static async fetchUserProfile(uid: string, fallbackEmail: string = "", fallbackName?: string, fallbackAvatar?: string): Promise<UserProfile> {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        this.saveStoredUser(data);
        return data;
      }
    } catch (e) {
      console.warn("Could not fetch remote profile, using local:", e);
    }

    const defaultProfile: UserProfile = {
      ...INITIAL_USER,
      id: uid,
      email: fallbackEmail || INITIAL_USER.email,
      fullName: fallbackName || INITIAL_USER.fullName,
      avatarUrl: fallbackAvatar || INITIAL_USER.avatarUrl,
    };
    
    try {
      await setDoc(doc(db, "users", uid), defaultProfile, { merge: true });
    } catch (e) {
      // Ignore
    }

    this.saveStoredUser(defaultProfile);
    return defaultProfile;
  }

  static async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = this.getStoredUser();
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    this.saveStoredUser(updated);

    try {
      await updateDoc(doc(db, "users", updated.id), updates);
    } catch (e) {
      console.warn("Firestore update error (persisted locally):", e);
    }

    return updated;
  }

  static async switchRole(newRole: UserRole): Promise<UserProfile> {
    return this.updateUserProfile({ role: newRole });
  }

  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e) {
      console.warn("Password reset notice:", e);
    }
  }

  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (e) {
      // Ignore
    }
  }
}
