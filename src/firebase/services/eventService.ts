import { collection, doc, setDoc, getDocs, updateDoc, increment } from "firebase/firestore";
import { db } from "../config";
import { EventItem } from "../../types";
import { INITIAL_EVENTS } from "./seedService";
import { AuthService } from "./authService";

const LOCAL_EVENTS_KEY = "sportiva_cached_events";

export class EventService {
  static getLocalEvents(): EventItem[] {
    try {
      const data = localStorage.getItem(LOCAL_EVENTS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      // Ignore
    }
    return INITIAL_EVENTS;
  }

  static saveLocalEvents(events: EventItem[]): void {
    try {
      localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
    } catch (e) {
      // Ignore
    }
  }

  static async fetchEvents(): Promise<EventItem[]> {
    try {
      const snap = await getDocs(collection(db, "events"));
      if (!snap.empty) {
        const remote = snap.docs.map(d => ({ id: d.id, ...d.data() } as EventItem));
        this.saveLocalEvents(remote);
        return remote;
      }
    } catch (e) {
      // Ignore
    }
    return this.getLocalEvents();
  }

  static async registerForEvent(eventId: string): Promise<string> {
    const user = AuthService.getStoredUser();
    const events = this.getLocalEvents();
    const idx = events.findIndex(e => e.id === eventId);
    if (idx === -1) return "BIB-000";

    const bib = `BIB-${Math.floor(100 + Math.random() * 900)}`;
    events[idx].isRegistered = true;
    events[idx].bibNumber = bib;
    events[idx].participantCount = (events[idx].participantCount || 0) + 1;
    this.saveLocalEvents(events);

    try {
      await updateDoc(doc(db, "events", eventId), {
        participantCount: increment(1)
      });
    } catch (e) {
      // Ignore
    }

    return bib;
  }

  static async createEvent(data: Partial<EventItem>): Promise<EventItem> {
    const user = AuthService.getStoredUser();
    const id = `event_${Date.now()}`;
    const newEvent: EventItem = {
      id,
      title: data.title || "SPORTIVA Community Race",
      description: data.description || "",
      sportType: data.sportType || "Running",
      date: data.date || new Date(Date.now() + 30 * 86400000).toISOString(),
      location: data.location || "Jember, East Java",
      distanceKm: data.distanceKm || 10.0,
      bannerUrl: data.bannerUrl || "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=800",
      registrationStatus: "open",
      participantCount: 1,
      rules: data.rules || "Standard IAAF / PASI Safety Rules apply.",
      createdBy: user.fullName || "Admin",
      createdAt: new Date().toISOString(),
      isRegistered: true,
      bibNumber: "BIB-001"
    };

    const events = [newEvent, ...this.getLocalEvents()];
    this.saveLocalEvents(events);

    try {
      await setDoc(doc(db, "events", id), newEvent);
    } catch (e) {
      // Ignore
    }

    return newEvent;
  }
}
