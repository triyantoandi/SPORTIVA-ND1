import { collection, doc, setDoc, getDocs, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../config";
import { Club } from "../../types";
import { INITIAL_CLUBS } from "./seedService";
import { AuthService } from "./authService";

const LOCAL_CLUBS_KEY = "sportiva_cached_clubs";

export class ClubService {
  static getLocalClubs(): Club[] {
    try {
      const data = localStorage.getItem(LOCAL_CLUBS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Clubs local load:", e);
    }
    return INITIAL_CLUBS;
  }

  static saveLocalClubs(clubs: Club[]): void {
    try {
      localStorage.setItem(LOCAL_CLUBS_KEY, JSON.stringify(clubs));
    } catch (e) {
      console.warn("Clubs local save:", e);
    }
  }

  static async fetchClubs(): Promise<Club[]> {
    try {
      const snap = await getDocs(collection(db, "clubs"));
      if (!snap.empty) {
        const remote = snap.docs.map(d => ({ id: d.id, ...d.data() } as Club));
        this.saveLocalClubs(remote);
        return remote;
      }
    } catch (e) {
      console.warn("Using local clubs:", e);
    }
    return this.getLocalClubs();
  }

  static async joinClub(clubId: string): Promise<boolean> {
    const clubs = this.getLocalClubs();
    const idx = clubs.findIndex(c => c.id === clubId);
    if (idx === -1) return false;

    const club = clubs[idx];
    club.isMember = true;
    club.memberCount = (club.memberCount || 0) + 1;
    clubs[idx] = club;
    this.saveLocalClubs(clubs);

    try {
      await updateDoc(doc(db, "clubs", clubId), { memberCount: increment(1) });
    } catch (e) {
      // Ignore
    }
    return true;
  }

  static async leaveClub(clubId: string): Promise<boolean> {
    const clubs = this.getLocalClubs();
    const idx = clubs.findIndex(c => c.id === clubId);
    if (idx === -1) return false;

    const club = clubs[idx];
    club.isMember = false;
    club.memberCount = Math.max(0, (club.memberCount || 1) - 1);
    clubs[idx] = club;
    this.saveLocalClubs(clubs);

    try {
      await updateDoc(doc(db, "clubs", clubId), { memberCount: increment(-1) });
    } catch (e) {
      // Ignore
    }
    return false;
  }

  static async createClub(data: {
    name: string;
    description: string;
    city: string;
    country: string;
    sportTypes: any[];
    logoUrl?: string;
    coverUrl?: string;
    isPrivate: boolean;
  }): Promise<Club> {
    const user = AuthService.getStoredUser();
    const clubId = `club_${Date.now()}`;
    const newClub: Club = {
      id: clubId,
      name: data.name,
      description: data.description,
      logoUrl: data.logoUrl || "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=300",
      coverUrl: data.coverUrl || "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800",
      city: data.city || "Jember",
      country: data.country || "Indonesia",
      sportTypes: data.sportTypes.length > 0 ? data.sportTypes : ["Running"],
      isPrivate: data.isPrivate,
      memberCount: 1,
      totalDistanceKm: 0,
      adminIds: [user.id],
      moderatorIds: [],
      createdBy: user.id,
      isMember: true,
      isAdmin: true,
      createdAt: new Date().toISOString()
    };

    const clubs = [newClub, ...this.getLocalClubs()];
    this.saveLocalClubs(clubs);

    try {
      await setDoc(doc(db, "clubs", clubId), newClub);
    } catch (e) {
      console.warn("Remote club creation fallback:", e);
    }

    return newClub;
  }
}
