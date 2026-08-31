import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  updateDoc, 
  increment,
  addDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../config";
import { Activity, Comment, GPSPoint, UserProfile } from "../../types";
import { INITIAL_ACTIVITIES } from "./seedService";
import { AuthService } from "./authService";
import { calculateSplits, validateAntiCheat, checkPersonalRecords, PRBreakEvent } from "../../utils/geoUtils";
import { computeRunningDynamics } from "../../utils/runningAnalytics";

const LOCAL_ACTIVITIES_KEY = "sportiva_cached_activities";
const OFFLINE_QUEUE_KEY = "sportiva_offline_activity_queue";

export class ActivityService {
  private static cachedActivities: Activity[] | null = null;

  static getLocalActivities(): Activity[] {
    try {
      const data = localStorage.getItem(LOCAL_ACTIVITIES_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn("Could not load local activities:", e);
    }
    return INITIAL_ACTIVITIES;
  }

  static saveLocalActivities(activities: Activity[]): void {
    try {
      localStorage.setItem(LOCAL_ACTIVITIES_KEY, JSON.stringify(activities));
      this.cachedActivities = activities;
    } catch (e) {
      console.warn("Could not cache activities:", e);
    }
  }

  static async fetchFeed(sportFilter?: string): Promise<Activity[]> {
    try {
      const q = query(
        collection(db, "activities"),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const remoteList: Activity[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
        this.saveLocalActivities(remoteList);
        return sportFilter && sportFilter !== "All"
          ? remoteList.filter(a => a.sportType === sportFilter)
          : remoteList;
      }
    } catch (e) {
      console.warn("Firestore fetch error, using cached feed:", e);
    }

    const local = this.getLocalActivities();
    return sportFilter && sportFilter !== "All"
      ? local.filter(a => a.sportType === sportFilter)
      : local;
  }

  static async fetchUserActivities(userId: string): Promise<Activity[]> {
    const all = await this.fetchFeed();
    return all.filter(a => a.userId === userId);
  }

  static async getActivityById(id: string): Promise<Activity | null> {
    try {
      const docSnap = await getDoc(doc(db, "activities", id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Activity;
      }
    } catch (e) {
      console.warn("Could not fetch remote activity, searching cache:", e);
    }

    const local = this.getLocalActivities();
    return local.find(a => a.id === id) || null;
  }

  static async saveCompletedActivity(params: {
    sportType: any;
    title: string;
    caption?: string;
    photos?: string[];
    privacy?: any;
    durationSec: number;
    distanceKm: number;
    avgSpeedKmh: number;
    maxSpeedKmh: number;
    avgPaceMinPerKm: number;
    elevationGainM: number;
    caloriesKcal: number;
    avgHeartRate?: number;
    maxHeartRate?: number;
    cadence?: number;
    routePoints: GPSPoint[];
    startTime: string;
    endTime: string;
  }): Promise<{ activity: Activity; newPRs: PRBreakEvent[] }> {
    const user = AuthService.getStoredUser();
    const activityId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Generate accurate automatic splits
    const splits = calculateSplits(params.routePoints, 1.0);

    // Compute advanced running dynamics if Running or Treadmill
    let runningDynamics = undefined;
    let gapPaceMinPerKm = undefined;

    if (params.sportType === "Running" || params.sportType === "Treadmill") {
      runningDynamics = computeRunningDynamics({
        points: params.routePoints,
        durationSec: params.durationSec,
        distanceKm: params.distanceKm,
        avgPaceMinKm: params.avgPaceMinPerKm,
        avgSpeedKmh: params.avgSpeedKmh,
        elevationGainM: params.elevationGainM,
        avgHeartRate: params.avgHeartRate,
        maxHeartRate: params.maxHeartRate,
        cadence: params.cadence,
        weightKg: user.weightKg || 68,
        splits
      });
      gapPaceMinPerKm = runningDynamics.gapPaceMinPerKm;
    }

    // Run Anti-Cheat security detection
    const antiCheat = validateAntiCheat(params.routePoints, params.sportType);

    const newActivity: Activity = {
      id: activityId,
      userId: user.id,
      userName: user.fullName || "SPORTIVA Athlete",
      userAvatar: user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
      userLocation: user.location || "Indonesia",
      title: params.title || `Workout ${params.sportType}`,
      sportType: params.sportType,
      startTime: params.startTime,
      endTime: params.endTime,
      durationSec: params.durationSec,
      distanceKm: params.distanceKm,
      avgSpeedKmh: params.avgSpeedKmh,
      maxSpeedKmh: params.maxSpeedKmh,
      avgPaceMinPerKm: params.avgPaceMinPerKm,
      gapPaceMinPerKm,
      elevationGainM: params.elevationGainM,
      caloriesKcal: params.caloriesKcal,
      avgHeartRate: params.avgHeartRate,
      maxHeartRate: params.maxHeartRate,
      cadence: params.cadence,
      runningDynamics,
      routePoints: params.routePoints,
      splits,
      privacy: params.privacy || "PUBLIC",
      photos: params.photos || [],
      caption: params.caption || "",
      kudosCount: 0,
      commentCount: 0,
      hasUserKudoed: false,
      isFlaggedSuspicious: antiCheat.isFlagged,
      antiCheatReason: antiCheat.reason,
      createdAt: new Date().toISOString()
    };

    // Check PR breaks
    const { updatedPRs, newRecords } = checkPersonalRecords(newActivity, user.personalRecords);

    // Update user stats
    const updatedStats = {
      ...user.stats,
      totalDistanceKm: Number((user.stats.totalDistanceKm + newActivity.distanceKm).toFixed(2)),
      totalDurationSec: user.stats.totalDurationSec + newActivity.durationSec,
      totalActivities: user.stats.totalActivities + 1,
      totalCalories: user.stats.totalCalories + newActivity.caloriesKcal,
      totalElevationM: user.stats.totalElevationM + newActivity.elevationGainM,
      currentStreak: user.stats.currentStreak + 1,
      longestStreak: Math.max(user.stats.longestStreak, user.stats.currentStreak + 1),
      lastActivityDate: new Date().toISOString()
    };

    // Calculate upgraded fitness score
    const updatedScores = {
      ...user.fitnessScores,
      endurance: Math.min(99, user.fitnessScores.endurance + 1),
      consistency: Math.min(99, user.fitnessScores.consistency + 1),
      overall: Math.min(99, Math.round((user.fitnessScores.overall * 4 + 85) / 5)),
      lastUpdated: new Date().toISOString()
    };

    AuthService.updateUserProfile({
      stats: updatedStats,
      personalRecords: updatedPRs,
      fitnessScores: updatedScores
    });

    // Save locally
    const existing = this.getLocalActivities();
    const updatedActivities = [newActivity, ...existing];
    this.saveLocalActivities(updatedActivities);

    // Sync to Firestore
    try {
      await setDoc(doc(db, "activities", activityId), newActivity);
    } catch (e) {
      console.warn("Could not save to Firestore immediately, queued locally:", e);
      this.enqueueOfflineActivity(newActivity);
    }

    return { activity: newActivity, newPRs: newRecords };
  }

  static enqueueOfflineActivity(activity: Activity): void {
    try {
      const q = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]");
      q.push(activity);
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(q));
    } catch (e) {
      console.warn("Queue error:", e);
    }
  }

  static async toggleKudos(activityId: string): Promise<boolean> {
    const activities = this.getLocalActivities();
    const idx = activities.findIndex(a => a.id === activityId);
    if (idx === -1) return false;

    const act = activities[idx];
    const isNowKudoed = !act.hasUserKudoed;
    act.hasUserKudoed = isNowKudoed;
    act.kudosCount = isNowKudoed ? act.kudosCount + 1 : Math.max(0, act.kudosCount - 1);

    activities[idx] = act;
    this.saveLocalActivities(activities);

    try {
      await updateDoc(doc(db, "activities", activityId), {
        kudosCount: increment(isNowKudoed ? 1 : -1)
      });
    } catch (e) {
      // Ignore
    }

    return isNowKudoed;
  }

  static async addComment(activityId: string, text: string): Promise<Comment> {
    const user = AuthService.getStoredUser();
    const comment: Comment = {
      id: `comm_${Date.now()}`,
      activityId,
      userId: user.id,
      userName: user.fullName || "SPORTIVA Athlete",
      userAvatar: user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
      text,
      createdAt: new Date().toISOString()
    };

    const activities = this.getLocalActivities();
    const idx = activities.findIndex(a => a.id === activityId);
    if (idx !== -1) {
      activities[idx].commentCount = (activities[idx].commentCount || 0) + 1;
      this.saveLocalActivities(activities);
    }

    try {
      await addDoc(collection(db, "comments"), comment);
      await updateDoc(doc(db, "activities", activityId), {
        commentCount: increment(1)
      });
    } catch (e) {
      console.warn("Comment synced locally:", e);
    }

    return comment;
  }

  static async fetchComments(activityId: string): Promise<Comment[]> {
    try {
      const q = query(
        collection(db, "comments"),
        where("activityId", "==", activityId),
        orderBy("createdAt", "asc")
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment));
      }
    } catch (e) {
      // Local demo fallback
    }

    return [
      {
        id: "comm_demo_1",
        activityId,
        userId: "user_budi_02",
        userName: "Budi Santoso",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
        text: "Pace yang luar biasa mas Andi! Cadence-nya juga stabil banget 🔥👏",
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "comm_demo_2",
        activityId,
        userId: "user_siti_03",
        userName: "Siti Rahmawati",
        userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
        text: "Keren rute Alun-Alun Jember! Besok weekend long run bareng yuk 🙌",
        createdAt: new Date(Date.now() - 1800000).toISOString()
      }
    ];
  }

  static async deleteActivity(activityId: string): Promise<void> {
    const activities = this.getLocalActivities().filter(a => a.id !== activityId);
    this.saveLocalActivities(activities);

    try {
      await deleteDoc(doc(db, "activities", activityId));
    } catch (e) {
      console.warn("Delete local only:", e);
    }
  }
}
