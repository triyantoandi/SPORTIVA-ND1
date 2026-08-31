import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "../config";
import { RouteItem } from "../../types";
import { INITIAL_ROUTES } from "./seedService";
import { AuthService } from "./authService";

const LOCAL_ROUTES_KEY = "sportiva_cached_routes";

export class RouteService {
  static getLocalRoutes(): RouteItem[] {
    try {
      const data = localStorage.getItem(LOCAL_ROUTES_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Routes local load error:", e);
    }
    return INITIAL_ROUTES;
  }

  static saveLocalRoutes(routes: RouteItem[]): void {
    try {
      localStorage.setItem(LOCAL_ROUTES_KEY, JSON.stringify(routes));
    } catch (e) {
      // Ignore
    }
  }

  static async fetchRoutes(sportFilter?: string): Promise<RouteItem[]> {
    try {
      const snap = await getDocs(collection(db, "routes"));
      if (!snap.empty) {
        const remote = snap.docs.map(d => ({ id: d.id, ...d.data() } as RouteItem));
        this.saveLocalRoutes(remote);
        return sportFilter && sportFilter !== "All" ? remote.filter(r => r.sportType === sportFilter) : remote;
      }
    } catch (e) {
      // Fallback
    }

    const local = this.getLocalRoutes();
    return sportFilter && sportFilter !== "All" ? local.filter(r => r.sportType === sportFilter) : local;
  }

  static async toggleSaveRoute(routeId: string): Promise<boolean> {
    const routes = this.getLocalRoutes();
    const idx = routes.findIndex(r => r.id === routeId);
    if (idx === -1) return false;

    routes[idx].isSaved = !routes[idx].isSaved;
    this.saveLocalRoutes(routes);
    return routes[idx].isSaved || false;
  }

  static async createRoute(route: {
    title: string;
    description: string;
    sportType: any;
    distanceKm: number;
    elevationGainM: number;
    difficulty: any;
    estimatedDurationSec: number;
    waypoints: { lat: number; lng: number; altitude?: number; label?: string }[];
    location: string;
  }): Promise<RouteItem> {
    const user = AuthService.getStoredUser();
    const id = `route_${Date.now()}`;
    const newRoute: RouteItem = {
      id,
      title: route.title,
      description: route.description,
      sportType: route.sportType,
      distanceKm: route.distanceKm,
      elevationGainM: route.elevationGainM,
      difficulty: route.difficulty,
      estimatedDurationSec: route.estimatedDurationSec,
      waypoints: route.waypoints,
      popularity: 85,
      location: route.location || "Indonesia",
      createdBy: user.fullName || "Athlete",
      createdAt: new Date().toISOString(),
      isSaved: true
    };

    const routes = [newRoute, ...this.getLocalRoutes()];
    this.saveLocalRoutes(routes);

    try {
      await setDoc(doc(db, "routes", id), newRoute);
    } catch (e) {
      // Local fallback
    }

    return newRoute;
  }
}
