export type UserRole = 'USER' | 'CLUB_ADMIN' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

export type PrivacyLevel = 'PUBLIC' | 'FOLLOWERS_ONLY' | 'PRIVATE';

export type SportType = 
  | 'Running' 
  | 'Walking' 
  | 'Cycling' 
  | 'Hiking' 
  | 'Trekking' 
  | 'Swimming' 
  | 'Gym' 
  | 'Strength' 
  | 'HIIT' 
  | 'Yoga' 
  | 'Badminton' 
  | 'Football' 
  | 'Basketball' 
  | 'Tennis' 
  | 'Volleyball' 
  | 'Rowing' 
  | 'Skating' 
  | 'Treadmill' 
  | 'Indoor Cycling';

export interface GPSPoint {
  lat: number;
  lng: number;
  altitude?: number | null;
  elevation?: number | null;
  speed?: number | null; // m/s
  heading?: number | null;
  accuracy?: number | null;
  timestamp: number;
  heartRate?: number;
  cadence?: number;
}

export interface Split {
  splitNumber: number;
  distanceKm: number;
  timeSec: number;
  paceMinPerKm: number;
  elevationChangeM: number;
  avgHeartRate?: number;
}

export interface PersonalRecords {
  fastest1k?: { timeSec: number; date: string; activityId: string };
  fastest5k?: { timeSec: number; date: string; activityId: string };
  fastest10k?: { timeSec: number; date: string; activityId: string };
  longestRun?: { distanceKm: number; date: string; activityId: string };
  longestRide?: { distanceKm: number; date: string; activityId: string };
  highestElevation?: { elevationM: number; date: string; activityId: string };
}

export interface FitnessScores {
  overall: number; // 0 - 100
  endurance: number;
  speed: number;
  consistency: number;
  strength: number;
  recovery: number;
  lastUpdated: string;
}

export interface UserStats {
  totalDistanceKm: number;
  totalDurationSec: number;
  totalActivities: number;
  totalCalories: number;
  totalElevationM: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
}

export interface GearItem {
  id: string;
  name: string;
  brand: string;
  type: 'shoes' | 'bike' | 'other';
  distanceKm: number;
  maxDistanceKm: number;
  isRetired?: boolean;
  dateAdded: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  bio?: string;
  location?: string;
  favoriteSports: SportType[];
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  goals?: string;
  heightCm?: number;
  weightKg?: number;
  role: UserRole;
  privacy: PrivacyLevel;
  isVerified?: boolean;
  isSuspended?: boolean;
  followersCount: number;
  followingCount: number;
  stats: UserStats;
  personalRecords: PersonalRecords;
  fitnessScores: FitnessScores;
  gear?: GearItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface BestEffortItem {
  timeSec: number;
  paceMinKm: number;
  startKm?: number;
  date?: string;
  isPR?: boolean;
}

export interface HeartRateZoneDistribution {
  zone1Sec: number; // Z1 Active Recovery (<60% max HR)
  zone2Sec: number; // Z2 Aerobic Base (60-70%)
  zone3Sec: number; // Z3 Tempo (70-80%)
  zone4Sec: number; // Z4 Threshold (80-90%)
  zone5Sec: number; // Z5 Anaerobic / VO2 Max (>90%)
}

export interface RunningDynamics {
  avgCadenceSpm: number;
  maxCadenceSpm: number;
  avgStrideLengthM: number;
  avgVerticalOscillationCm: number;
  verticalRatioPct: number;
  groundContactTimeMs: number;
  groundContactBalancePct: { left: number; right: number };
  avgPowerWatts: number;
  maxPowerWatts: number;
  workKj: number;
  gapPaceMinPerKm: number; // Grade Adjusted Pace
  aerobicTrainingEffect: number; // 0.0 - 5.0
  anaerobicTrainingEffect: number; // 0.0 - 5.0
  recoveryTimeHours: number;
  heartRateZones?: HeartRateZoneDistribution;
  bestEfforts?: {
    effort400m?: BestEffortItem;
    effort1k?: BestEffortItem;
    effort1mi?: BestEffortItem;
    effort5k?: BestEffortItem;
    effort10k?: BestEffortItem;
  };
  cardiacDriftPct?: number; // Aerobic decoupling %
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userLocation?: string;
  title: string;
  sportType: SportType;
  startTime: string;
  endTime: string;
  durationSec: number;
  distanceKm: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  avgPaceMinPerKm: number;
  gapPaceMinPerKm?: number;
  elevationGainM: number;
  caloriesKcal: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  cadence?: number;
  runningDynamics?: RunningDynamics;
  routePoints: GPSPoint[];
  splits: Split[];
  privacy: PrivacyLevel;
  photos: string[];
  caption?: string;
  kudosCount: number;
  commentCount: number;
  hasUserKudoed?: boolean;
  isFlaggedSuspicious?: boolean;
  antiCheatReason?: string;
  deviceInfo?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  activityId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  mentions?: string[];
  createdAt: string;
}

export interface Kudos {
  id: string;
  activityId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  createdAt: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  city: string;
  country: string;
  sportTypes: SportType[];
  isPrivate: boolean;
  memberCount: number;
  totalDistanceKm: number;
  adminIds: string[];
  moderatorIds: string[];
  createdBy: string;
  createdAt: string;
  isMember?: boolean;
  isAdmin?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  badgeIcon: string;
  sportTypes: SportType[];
  metric: 'distance' | 'duration' | 'activities' | 'elevation' | 'calories';
  targetValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  bannerUrl: string;
  participantCount: number;
  completedCount: number;
  createdBy: string;
  createdAt: string;
  userProgress?: number;
  isJoined?: boolean;
  isCompleted?: boolean;
}

export interface RouteItem {
  id: string;
  title: string;
  description: string;
  sportType: SportType;
  distanceKm: number;
  elevationGainM: number;
  difficulty: 'easy' | 'moderate' | 'hard' | 'extreme';
  estimatedDurationSec: number;
  waypoints: { lat: number; lng: number; altitude?: number; label?: string }[];
  popularity: number;
  location: string;
  createdBy: string;
  createdAt: string;
  savedByCount?: number;
  isSaved?: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  sportType: SportType;
  date: string;
  location: string;
  distanceKm: number;
  bannerUrl: string;
  registrationStatus: 'open' | 'closed' | 'completed';
  participantCount: number;
  rules: string;
  createdBy: string;
  createdAt: string;
  isRegistered?: boolean;
  bibNumber?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'distance' | 'streak' | 'elevation' | 'speed' | 'social';
  icon: string;
  conditionType: string;
  conditionValue: number;
  unlockedAt?: string;
  isUnlocked?: boolean;
}

export interface WorkoutDay {
  dayOfWeek?: number; // 1-7
  day?: string; // e.g. "Senin", "Rabu", "Sabtu"
  title: string;
  description: string;
  distanceKm?: number;
  durationMin?: number;
  targetDistanceKm?: number;
  targetDurationMin?: number;
  restDay?: boolean;
  workoutType: string;
  isCompleted?: boolean;
}

export interface TrainingWeek {
  weekNumber: number;
  focus?: string;
  workouts: WorkoutDay[];
}

export interface TrainingPlan {
  id: string;
  title: string;
  category: 'Running' | 'Cycling' | 'Fitness' | 'Weight Loss' | string;
  sportType?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  targetLevel?: string;
  durationWeeks: number;
  targetGoal: string;
  description: string;
  weeks?: TrainingWeek[];
  schedule?: {
    week: number;
    days: WorkoutDay[];
  }[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'activity' | 'challenge' | 'achievement' | 'comment' | 'kudos' | 'follow' | 'club' | 'streak' | 'ai_coach';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'activity' | 'user' | 'comment' | 'club';
  targetId: string;
  targetTitle?: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  createdAt: string;
}
