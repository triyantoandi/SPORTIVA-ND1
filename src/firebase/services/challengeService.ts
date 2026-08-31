import { collection, doc, setDoc, getDocs, updateDoc, increment } from "firebase/firestore";
import { db } from "../config";
import { Challenge } from "../../types";
import { INITIAL_CHALLENGES } from "./seedService";
import { AuthService } from "./authService";

const LOCAL_CHALLENGES_KEY = "sportiva_cached_challenges";

export class ChallengeService {
  static getLocalChallenges(): Challenge[] {
    try {
      const data = localStorage.getItem(LOCAL_CHALLENGES_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Challenges local load:", e);
    }
    return INITIAL_CHALLENGES;
  }

  static saveLocalChallenges(challenges: Challenge[]): void {
    try {
      localStorage.setItem(LOCAL_CHALLENGES_KEY, JSON.stringify(challenges));
    } catch (e) {
      console.warn("Challenges save:", e);
    }
  }

  static async fetchChallenges(): Promise<Challenge[]> {
    try {
      const snap = await getDocs(collection(db, "challenges"));
      if (!snap.empty) {
        const remote = snap.docs.map(d => ({ id: d.id, ...d.data() } as Challenge));
        this.saveLocalChallenges(remote);
        return remote;
      }
    } catch (e) {
      console.warn("Using local challenges:", e);
    }
    return this.getLocalChallenges();
  }

  static async joinChallenge(challengeId: string): Promise<boolean> {
    const list = this.getLocalChallenges();
    const idx = list.findIndex(c => c.id === challengeId);
    if (idx === -1) return false;

    list[idx].isJoined = true;
    list[idx].participantCount = (list[idx].participantCount || 0) + 1;
    list[idx].userProgress = list[idx].userProgress || 0;
    this.saveLocalChallenges(list);

    try {
      await updateDoc(doc(db, "challenges", challengeId), {
        participantCount: increment(1)
      });
    } catch (e) {
      // Ignore
    }

    return true;
  }

  static async createChallenge(data: Partial<Challenge>): Promise<Challenge> {
    const user = AuthService.getStoredUser();
    const id = `chal_${Date.now()}`;
    const newChallenge: Challenge = {
      id,
      title: data.title || "New Community Challenge",
      description: data.description || "",
      badgeIcon: data.badgeIcon || "🏆",
      sportTypes: data.sportTypes || ["Running"],
      metric: data.metric || "distance",
      targetValue: data.targetValue || 50,
      unit: data.unit || "KM",
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      bannerUrl: data.bannerUrl || "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800",
      participantCount: 1,
      completedCount: 0,
      createdBy: user.fullName || "Athlete",
      createdAt: new Date().toISOString(),
      isJoined: true,
      userProgress: 0,
      isCompleted: false
    };

    const list = [newChallenge, ...this.getLocalChallenges()];
    this.saveLocalChallenges(list);

    try {
      await setDoc(doc(db, "challenges", id), newChallenge);
    } catch (e) {
      // Ignore
    }

    return newChallenge;
  }
}
