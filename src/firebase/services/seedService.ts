import { Activity, Challenge, Club, EventItem, RouteItem, Achievement, TrainingPlan, UserProfile } from "../../types";

export const INITIAL_USER: UserProfile = {
  id: "user_andi_sportiva",
  email: "triyantoandi80@gmail.com",
  username: "andi_triyanto",
  fullName: "Andi Triyanto",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  bio: "Marathon runner & endurance cyclist based in Jember, East Java. Chasing PRs and exploring trails.",
  location: "Jember, East Java, Indonesia",
  favoriteSports: ["Running", "Cycling", "Hiking", "Trekking"],
  fitnessLevel: "advanced",
  goals: "Sub-3:30 Marathon & 100K Century Ride",
  heightCm: 175,
  weightKg: 68,
  role: "USER",
  privacy: "PUBLIC",
  isVerified: true,
  followersCount: 342,
  followingCount: 189,
  stats: {
    totalDistanceKm: 1428.5,
    totalDurationSec: 428400,
    totalActivities: 114,
    totalCalories: 98450,
    totalElevationM: 8420,
    currentStreak: 12,
    longestStreak: 28,
    lastActivityDate: new Date().toISOString()
  },
  personalRecords: {
    fastest1k: { timeSec: 218, date: "2026-06-12T06:30:00Z", activityId: "act_1" },
    fastest5k: { timeSec: 1284, date: "2026-07-20T06:15:00Z", activityId: "act_2" },
    fastest10k: { timeSec: 2780, date: "2026-08-10T05:45:00Z", activityId: "act_3" },
    longestRun: { distanceKm: 21.1, date: "2026-07-04T05:30:00Z", activityId: "act_4" },
    longestRide: { distanceKm: 85.4, date: "2026-08-01T06:00:00Z", activityId: "act_5" },
    highestElevation: { elevationM: 640, date: "2026-08-15T06:00:00Z", activityId: "act_6" }
  },
  fitnessScores: {
    overall: 84,
    endurance: 88,
    speed: 79,
    consistency: 91,
    strength: 74,
    recovery: 85,
    lastUpdated: new Date().toISOString()
  },
  gear: [
    {
      id: "gear_1",
      name: "Vaporfly 3",
      brand: "Nike",
      type: "shoes",
      distanceKm: 342.5,
      maxDistanceKm: 800,
      isRetired: false,
      dateAdded: "2026-03-01T00:00:00Z"
    },
    {
      id: "gear_2",
      name: "Novablast 4",
      brand: "Asics",
      type: "shoes",
      distanceKm: 180.2,
      maxDistanceKm: 800,
      isRetired: false,
      dateAdded: "2026-05-15T00:00:00Z"
    },
    {
      id: "gear_3",
      name: "Emonda SL 6 Pro",
      brand: "Trek",
      type: "bike",
      distanceKm: 1240.0,
      maxDistanceKm: 10000,
      isRetired: false,
      dateAdded: "2025-11-20T00:00:00Z"
    }
  ],
  createdAt: "2025-01-10T08:00:00Z"
};

// Realistic GPS trace around Jember City Center / Alun-alun & Rembangan Foothills
export const DEMO_ROUTE_POINTS = [
  { lat: -8.1724, lng: 113.7001, altitude: 85, timestamp: Date.now() - 3600000, heartRate: 138, cadence: 168 },
  { lat: -8.1712, lng: 113.7015, altitude: 87, timestamp: Date.now() - 3300000, heartRate: 142, cadence: 172 },
  { lat: -8.1695, lng: 113.7032, altitude: 90, timestamp: Date.now() - 3000000, heartRate: 146, cadence: 174 },
  { lat: -8.1678, lng: 113.7056, altitude: 94, timestamp: Date.now() - 2700000, heartRate: 151, cadence: 175 },
  { lat: -8.1650, lng: 113.7078, altitude: 102, timestamp: Date.now() - 2400000, heartRate: 156, cadence: 172 },
  { lat: -8.1620, lng: 113.7095, altitude: 112, timestamp: Date.now() - 2100000, heartRate: 162, cadence: 170 },
  { lat: -8.1590, lng: 113.7118, altitude: 124, timestamp: Date.now() - 1800000, heartRate: 165, cadence: 168 },
  { lat: -8.1610, lng: 113.7145, altitude: 118, timestamp: Date.now() - 1500000, heartRate: 158, cadence: 174 },
  { lat: -8.1645, lng: 113.7120, altitude: 108, timestamp: Date.now() - 1200000, heartRate: 152, cadence: 176 },
  { lat: -8.1680, lng: 113.7080, altitude: 98, timestamp: Date.now() - 900000, heartRate: 148, cadence: 178 },
  { lat: -8.1705, lng: 113.7040, altitude: 91, timestamp: Date.now() - 600000, heartRate: 145, cadence: 176 },
  { lat: -8.1724, lng: 113.7001, altitude: 85, timestamp: Date.now() - 300000, heartRate: 140, cadence: 170 }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: "act_demo_1",
    userId: "user_andi_sportiva",
    userName: "Andi Triyanto",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    userLocation: "Jember, Indonesia",
    title: "Morning Sunrise Tempo Run 🌅",
    sportType: "Running",
    startTime: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() - 3.4 * 3600 * 1000).toISOString(),
    durationSec: 2306, // 38m 26s
    distanceKm: 7.24,
    avgSpeedKmh: 11.3,
    maxSpeedKmh: 14.8,
    avgPaceMinPerKm: 5.3, // 5:18 /km
    gapPaceMinPerKm: 5.08, // 5:05 /km flat equivalent
    elevationGainM: 82,
    caloriesKcal: 487,
    avgHeartRate: 148,
    maxHeartRate: 168,
    cadence: 174,
    runningDynamics: {
      avgCadenceSpm: 174,
      maxCadenceSpm: 188,
      avgStrideLengthM: 1.14,
      avgVerticalOscillationCm: 7.4,
      verticalRatioPct: 6.5,
      groundContactTimeMs: 224,
      groundContactBalancePct: { left: 50.1, right: 49.9 },
      avgPowerWatts: 248,
      maxPowerWatts: 326,
      workKj: 572,
      gapPaceMinPerKm: 5.08,
      aerobicTrainingEffect: 3.8,
      anaerobicTrainingEffect: 1.8,
      recoveryTimeHours: 24,
      heartRateZones: {
        zone1Sec: 230,
        zone2Sec: 1268,
        zone3Sec: 576,
        zone4Sec: 184,
        zone5Sec: 48
      },
      bestEfforts: {
        effort400m: { timeSec: 104, paceMinKm: 4.33, startKm: 6.2 },
        effort1k: { timeSec: 298, paceMinKm: 4.96, startKm: 6.0 },
        effort1mi: { timeSec: 498, paceMinKm: 5.15, startKm: 5.2 },
        effort5k: { timeSec: 1584, paceMinKm: 5.28, startKm: 1.0 }
      },
      cardiacDriftPct: 2.1
    },
    routePoints: DEMO_ROUTE_POINTS,
    splits: [
      { splitNumber: 1, distanceKm: 1.0, timeSec: 310, paceMinPerKm: 5.17, elevationChangeM: 2, avgHeartRate: 138 },
      { splitNumber: 2, distanceKm: 1.0, timeSec: 314, paceMinPerKm: 5.23, elevationChangeM: 7, avgHeartRate: 142 },
      { splitNumber: 3, distanceKm: 1.0, timeSec: 318, paceMinPerKm: 5.30, elevationChangeM: 12, avgHeartRate: 148 },
      { splitNumber: 4, distanceKm: 1.0, timeSec: 324, paceMinPerKm: 5.40, elevationChangeM: 22, avgHeartRate: 160 },
      { splitNumber: 5, distanceKm: 1.0, timeSec: 320, paceMinPerKm: 5.33, elevationChangeM: 18, avgHeartRate: 164 },
      { splitNumber: 6, distanceKm: 1.0, timeSec: 312, paceMinPerKm: 5.20, elevationChangeM: -10, avgHeartRate: 154 },
      { splitNumber: 7, distanceKm: 1.0, timeSec: 308, paceMinPerKm: 5.13, elevationChangeM: -15, avgHeartRate: 149 },
      { splitNumber: 8, distanceKm: 0.24, timeSec: 70, paceMinPerKm: 4.86, elevationChangeM: -2, avgHeartRate: 145 }
    ],
    privacy: "PUBLIC",
    photos: ["https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80"],
    caption: "Great fresh morning breeze around Alun-Alun Jember. Pacing felt super smooth today! Consistency over perfection 🏃‍♂️🔥",
    kudosCount: 24,
    commentCount: 5,
    hasUserKudoed: true,
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: "act_demo_2",
    userId: "user_budi_02",
    userName: "Budi Santoso",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    userLocation: "Surabaya, Indonesia",
    title: "Weekend Coastal Endurance Ride 🚴",
    sportType: "Cycling",
    startTime: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() - 22.5 * 3600 * 1000).toISOString(),
    durationSec: 5040, // 1h 24m
    distanceKm: 32.4,
    avgSpeedKmh: 23.1,
    maxSpeedKmh: 42.5,
    avgPaceMinPerKm: 2.6,
    elevationGainM: 145,
    caloriesKcal: 780,
    avgHeartRate: 142,
    maxHeartRate: 165,
    cadence: 84,
    routePoints: DEMO_ROUTE_POINTS,
    splits: [],
    privacy: "PUBLIC",
    photos: ["https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80"],
    caption: "Solid paceline with the Java Gravel squad. Tailwind on the return stretch was pure bliss!",
    kudosCount: 42,
    commentCount: 8,
    hasUserKudoed: false,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: "act_demo_3",
    userId: "user_siti_03",
    userName: "Siti Rahmawati",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
    userLocation: "Bandung, Indonesia",
    title: "Tahura Forest Trail Exploration 🌲",
    sportType: "Hiking",
    startTime: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() - 45.8 * 3600 * 1000).toISOString(),
    durationSec: 7920, // 2h 12m
    distanceKm: 9.8,
    avgSpeedKmh: 4.4,
    maxSpeedKmh: 7.2,
    avgPaceMinPerKm: 13.5,
    elevationGainM: 380,
    caloriesKcal: 620,
    avgHeartRate: 132,
    routePoints: DEMO_ROUTE_POINTS,
    splits: [],
    privacy: "PUBLIC",
    photos: ["https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop&q=80"],
    caption: "Muddy trails, fresh pine air, and great company. Legs definitely feeling that 380m climb!",
    kudosCount: 31,
    commentCount: 3,
    hasUserKudoed: false,
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  }
];

export const INITIAL_CLUBS: Club[] = [
  {
    id: "club_jember_runners",
    name: "Jember Running Community",
    description: "Komunitas pelari paling aktif di Jember dan Tapal Kuda. Terbuka untuk semua level pelari dari 5K hingga Ultra.",
    logoUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=300&auto=format&fit=crop&q=80",
    coverUrl: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop&q=80",
    city: "Jember",
    country: "Indonesia",
    sportTypes: ["Running", "Hiking", "Trekking"],
    isPrivate: false,
    memberCount: 428,
    totalDistanceKm: 14850,
    adminIds: ["user_andi_sportiva"],
    moderatorIds: ["user_budi_02"],
    createdBy: "user_andi_sportiva",
    isMember: true,
    isAdmin: true,
    createdAt: "2025-01-15T00:00:00Z"
  },
  {
    id: "club_java_cyclists",
    name: "East Java Road & Gravel Club",
    description: "Peloton sepeda Jawa Timur. Group rides sabtu & minggu, gran fondo preparation, dan trail hunting.",
    logoUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=300&auto=format&fit=crop&q=80",
    coverUrl: "https://images.unsplash.com/photo-1474962558142-9ca83af74bb7?w=800&auto=format&fit=crop&q=80",
    city: "Surabaya",
    country: "Indonesia",
    sportTypes: ["Cycling", "Indoor Cycling"],
    isPrivate: false,
    memberCount: 312,
    totalDistanceKm: 42900,
    adminIds: ["user_budi_02"],
    moderatorIds: [],
    createdBy: "user_budi_02",
    isMember: false,
    createdAt: "2025-02-01T00:00:00Z"
  },
  {
    id: "club_trail_seekers",
    name: "Archipelago Mountain Seekers",
    description: "Menaklukkan puncak dan jalur setapak Indonesia. Sharing rute hiking, safety guideline, dan camping workout.",
    logoUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&auto=format&fit=crop&q=80",
    coverUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
    city: "Bandung",
    country: "Indonesia",
    sportTypes: ["Hiking", "Trekking", "Walking"],
    isPrivate: false,
    memberCount: 219,
    totalDistanceKm: 9840,
    adminIds: ["user_siti_03"],
    moderatorIds: [],
    createdBy: "user_siti_03",
    isMember: false,
    createdAt: "2025-02-15T00:00:00Z"
  }
];

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: "chal_30d_100k",
    title: "30-Day Running Challenge: 100 KM",
    description: "Buktikan konsistensi lari Anda sepanjang bulan ini. Capai akumulasi total 100 kilometer untuk membuka medali legendaris SPORTIVA Centurion.",
    badgeIcon: "🏆",
    sportTypes: ["Running", "Treadmill"],
    metric: "distance",
    targetValue: 100,
    unit: "KM",
    startDate: "2026-08-01T00:00:00Z",
    endDate: "2026-08-31T23:59:59Z",
    bannerUrl: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&auto=format&fit=crop&q=80",
    participantCount: 1420,
    completedCount: 384,
    createdBy: "SPORTIVA Official",
    createdAt: "2026-07-25T00:00:00Z",
    userProgress: 82.4,
    isJoined: true,
    isCompleted: false
  },
  {
    id: "chal_climb_3000m",
    title: "King of the Hill: 3,000m Elevation Gain",
    description: "Kumpulkan total elevasi pendakian lari, trail run, atau gowes tanjakan minimal 3,000 meter vertikal.",
    badgeIcon: "🌄",
    sportTypes: ["Running", "Cycling", "Hiking"],
    metric: "elevation",
    targetValue: 3000,
    unit: "m",
    startDate: "2026-08-01T00:00:00Z",
    endDate: "2026-08-31T23:59:59Z",
    bannerUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
    participantCount: 650,
    completedCount: 118,
    createdBy: "SPORTIVA Official",
    createdAt: "2026-07-25T00:00:00Z",
    userProgress: 1840,
    isJoined: true,
    isCompleted: false
  },
  {
    id: "chal_century_ride_200k",
    title: "Gran Fondo: 200 KM Cycling Month",
    description: "Tuntaskan akumulasi 200 kilometer bersepeda jalan raya maupun gravel dalam 30 hari.",
    badgeIcon: "⚡",
    sportTypes: ["Cycling", "Indoor Cycling"],
    metric: "distance",
    targetValue: 200,
    unit: "KM",
    startDate: "2026-08-01T00:00:00Z",
    endDate: "2026-08-31T23:59:59Z",
    bannerUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80",
    participantCount: 890,
    completedCount: 270,
    createdBy: "SPORTIVA Official",
    createdAt: "2026-07-25T00:00:00Z",
    userProgress: 145.0,
    isJoined: false,
    isCompleted: false
  }
];

export const INITIAL_ROUTES: RouteItem[] = [
  {
    id: "route_jember_alunalun_loop",
    title: "Jember City Heritage & Alun-Alun 10K Loop",
    description: "Rute aspal datar yang nyaman dan ramah pelari melintasi pusat kota Jember, Kampus UNEJ, dan Alun-Alun.",
    sportType: "Running",
    distanceKm: 10.2,
    elevationGainM: 45,
    difficulty: "easy",
    estimatedDurationSec: 3300,
    waypoints: [
      { lat: -8.1724, lng: 113.7001, label: "Start: Alun-Alun Jember" },
      { lat: -8.1650, lng: 113.7120, label: "Bundaran UNEJ" },
      { lat: -8.1580, lng: 113.7190, label: "Jl. Kalimantan" },
      { lat: -8.1724, lng: 113.7001, label: "Finish: Alun-Alun" }
    ],
    popularity: 98,
    location: "Jember, East Java",
    createdBy: "Andi Triyanto",
    createdAt: "2026-06-10T00:00:00Z",
    isSaved: true
  },
  {
    id: "route_rembangan_climb",
    title: "Puncak Rembangan Hill Climb 16K",
    description: "Rute tanjakan legendaris dengan pemandangan kebun kopi dan udara sejuk pegunungan. Elevasi curam di kilometer akhir.",
    sportType: "Cycling",
    distanceKm: 16.5,
    elevationGainM: 520,
    difficulty: "hard",
    estimatedDurationSec: 4200,
    waypoints: [
      { lat: -8.1724, lng: 113.7001, label: "Start: Kota Jember" },
      { lat: -8.1250, lng: 113.7100, label: "Simpang Baratan" },
      { lat: -8.0850, lng: 113.7250, label: "Finish: Hotel Rembangan" }
    ],
    popularity: 92,
    location: "Jember, East Java",
    createdBy: "Budi Santoso",
    createdAt: "2026-06-18T00:00:00Z",
    isSaved: false
  },
  {
    id: "route_papuma_coastal_trail",
    title: "Tanjung Papuma Coastal Trail Hike",
    description: "Jalur trail menelusuri tebing karang dan pantai selatan Jawa Timur dengan pemandangan samudera eksotis.",
    sportType: "Hiking",
    distanceKm: 8.4,
    elevationGainM: 210,
    difficulty: "moderate",
    estimatedDurationSec: 6600,
    waypoints: [
      { lat: -8.4315, lng: 113.5540, label: "Pantai Watu Ulo" },
      { lat: -8.4380, lng: 113.5620, label: "Puncak Tebing Siti Hinggil" },
      { lat: -8.4410, lng: 113.5590, label: "Pantai Pasir Putih Papuma" }
    ],
    popularity: 95,
    location: "Wuluhan, Jember",
    createdBy: "Andi Triyanto",
    createdAt: "2026-07-02T00:00:00Z",
    isSaved: true
  }
];

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: "event_jember_10k_2026",
    title: "JEMBER 10K NIGHT RUN 2026",
    description: "Lomba lari malam terbesar di Tapal Kuda. Nikmati gemerlap lampu kota Jember dengan rute bersertifikasi nasional dan refreshment melimpah.",
    sportType: "Running",
    date: "2026-09-26T18:30:00Z",
    location: "Alun-Alun Jember, Jawa Timur",
    distanceKm: 10.0,
    bannerUrl: "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=800&auto=format&fit=crop&q=80",
    registrationStatus: "open",
    participantCount: 850,
    rules: "1. Peserta wajib mengenakan nomor dada (BIB) di depan dada.\n2. Cut-off time 2 jam 15 menit.\n3. Medali penamat (Finisher Medal) & Jersey race pack resmi.",
    createdBy: "Admin SPORTIVA",
    createdAt: "2026-07-01T00:00:00Z",
    isRegistered: true,
    bibNumber: "BIB-0428"
  },
  {
    id: "event_bali_gran_fondo",
    title: "BALI EMERALD GRAN FONDO 120K",
    description: "Jelajahi keindahan rute pesisir dan persawahan terasering pulau Dewata dalam ajang endurance cycling persahabatan.",
    sportType: "Cycling",
    date: "2026-10-18T06:00:00Z",
    location: "Sanur to Ubud, Bali",
    distanceKm: 120.0,
    bannerUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80",
    registrationStatus: "open",
    participantCount: 420,
    rules: "1. Helm wajib digunakan sepanjang perjalanan.\n2. Pit stop di KM 40, KM 80, dan KM 110.\n3. Marshall dan ambulans siaga mengawal rute.",
    createdBy: "Admin SPORTIVA",
    createdAt: "2026-07-15T00:00:00Z",
    isRegistered: false
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach_first_activity",
    title: "First Movement",
    description: "Selesaikan aktivitas olahraga GPS pertama Anda di SPORTIVA.",
    category: "social",
    icon: "🏃",
    conditionType: "activity_count",
    conditionValue: 1,
    isUnlocked: true,
    unlockedAt: "2025-01-10T09:00:00Z"
  },
  {
    id: "ach_7d_streak",
    title: "7-Day Fire Streak",
    description: "Berolahraga secara konsisten 7 hari berturut-turut tanpa putus.",
    category: "streak",
    icon: "🔥",
    conditionType: "streak",
    conditionValue: 7,
    isUnlocked: true,
    unlockedAt: "2025-02-14T08:00:00Z"
  },
  {
    id: "ach_100k_club",
    title: "Century 100 KM Club",
    description: "Kumpulkan akumulasi jarak tempuh total 100 Kilometer.",
    category: "distance",
    icon: "🏆",
    conditionType: "total_distance",
    conditionValue: 100,
    isUnlocked: true,
    unlockedAt: "2025-03-01T07:30:00Z"
  },
  {
    id: "ach_500k_runner",
    title: "500 KM Road Warrior",
    description: "Tembus total jarak 500 Kilometer di SPORTIVA.",
    category: "distance",
    icon: "🚀",
    conditionType: "total_distance",
    conditionValue: 500,
    isUnlocked: true,
    unlockedAt: "2025-06-20T06:00:00Z"
  },
  {
    id: "ach_mountain_explorer",
    title: "Mountain Explorer",
    description: "Capai elevasi pendakian lebih dari 500 meter dalam satu sesi aktivitas.",
    category: "elevation",
    icon: "🌄",
    conditionType: "single_elevation",
    conditionValue: 500,
    isUnlocked: true,
    unlockedAt: "2026-08-15T08:00:00Z"
  },
  {
    id: "ach_speed_demon",
    title: "Speed Demon",
    description: "Catat pace lari di bawah 4:30/km untuk jarak minimal 5 kilometer.",
    category: "speed",
    icon: "⚡",
    conditionType: "pace_5k",
    conditionValue: 4.5,
    isUnlocked: false
  },
  {
    id: "ach_night_runner",
    title: "Night Runner",
    description: "Selesaikan aktivitas malam hari antara pukul 20:00 hingga 04:00.",
    category: "social",
    icon: "🌙",
    conditionType: "night_workout",
    conditionValue: 1,
    isUnlocked: true,
    unlockedAt: "2026-07-28T21:15:00Z"
  },
  {
    id: "ach_early_bird",
    title: "Early Bird",
    description: "Selesaikan aktivitas pagi subuh sebelum pukul 06:00.",
    category: "social",
    icon: "☀️",
    conditionType: "early_workout",
    conditionValue: 1,
    isUnlocked: true,
    unlockedAt: "2026-08-10T05:45:00Z"
  }
];

export const INITIAL_TRAINING_PLANS: TrainingPlan[] = [
  {
    id: "plan_5k_beginner",
    title: "5K Couch-to-Runner Foundation",
    category: "Running",
    sportType: "Running",
    level: "Beginner",
    targetLevel: "Beginner",
    durationWeeks: 6,
    targetGoal: "Tuntaskan lari 5K tanpa jeda jalan kaki dengan stamina prima",
    description: "Program terstruktur bertahap dari kombinasi jalan-lari (run-walk method) menuju non-stop 5K.",
    weeks: [
      {
        weekNumber: 1,
        focus: "Adaptasi Aerobik & Kebiasaan Gerak",
        workouts: [
          { day: "Senin", dayOfWeek: 1, title: "Interval Run-Walk", description: "1 min jog + 2 min walk x 8 reps (24 min)", targetDistanceKm: 2.5, workoutType: "Interval", isCompleted: true },
          { day: "Rabu", dayOfWeek: 3, title: "Easy Aerobic Walk", description: "Jalan cepat konsisten dengan postur tegak", targetDurationMin: 30, workoutType: "Aerobic", isCompleted: true },
          { day: "Jumat", dayOfWeek: 5, title: "Progression Run-Walk", description: "90s jog + 2 min walk x 6 reps", targetDistanceKm: 2.8, workoutType: "Interval", isCompleted: false },
          { day: "Minggu", dayOfWeek: 7, title: "Long Easy Walk/Jog", description: "Sesi akhir pekan ritme rileks santai", targetDistanceKm: 3.5, workoutType: "Long Run", isCompleted: false }
        ]
      },
      {
        weekNumber: 2,
        focus: "Peningkatan Durasi Berlari Kontinu",
        workouts: [
          { day: "Senin", dayOfWeek: 1, title: "Interval 2 Min Jog", description: "2 min jog + 90s walk x 6 reps", targetDistanceKm: 3.0, workoutType: "Interval", isCompleted: false },
          { day: "Rabu", dayOfWeek: 3, title: "Cross Training / Core", description: "Latihan penguatan otot kaki dan core", targetDurationMin: 35, workoutType: "Strength", isCompleted: false },
          { day: "Jumat", dayOfWeek: 5, title: "Easy Pace Jog", description: "Lari santai ritme konstan 15 menit berturut-turut", targetDistanceKm: 2.5, workoutType: "Base Run", isCompleted: false },
          { day: "Minggu", dayOfWeek: 7, title: "Long Run 4 KM", description: "Long run akhir pekan di zona detak jantung 2", targetDistanceKm: 4.0, workoutType: "Long Run", isCompleted: false }
        ]
      }
    ],
    schedule: [
      {
        week: 1,
        days: [
          { dayOfWeek: 1, title: "Run-Walk Intervals", description: "1 min run, 2 min walk x 8 reps (24 min)", distanceKm: 2.5, workoutType: "Interval" },
          { dayOfWeek: 2, title: "Rest & Core Mobility", description: "Peregangan dinamis dan pemulihan aktif", restDay: true, workoutType: "Rest" },
          { dayOfWeek: 3, title: "Easy Aerobic Walk", description: "Jalan cepat konsisten", distanceKm: 3.0, durationMin: 30, workoutType: "Aerobic Walk" },
          { dayOfWeek: 5, title: "Run-Walk Progression", description: "90 sec run, 2 min walk x 6 reps", distanceKm: 2.8, workoutType: "Interval" },
          { dayOfWeek: 7, title: "Long Easy Walk/Jog", description: "Sesi akhir pekan ritme rileks", distanceKm: 3.5, workoutType: "Long Run" }
        ]
      }
    ]
  },
  {
    id: "plan_10k_intermediate",
    title: "10K Speed & Endurance Builder",
    category: "Running",
    sportType: "Running",
    level: "Intermediate",
    targetLevel: "Intermediate",
    durationWeeks: 8,
    targetGoal: "Pecahkan rekor Sub-50 Menit 10K",
    description: "Kombinasi tempo run, interval 800m, dan long run progresif untuk meningkatkan VO2 Max dan lactate threshold.",
    weeks: [
      {
        weekNumber: 1,
        focus: "Threshold Base & Interval Pembuka",
        workouts: [
          { day: "Senin", dayOfWeek: 1, title: "Easy Zone 2 Run", description: "Lari santai ritme percakapan untuk fondasi aerobik", targetDistanceKm: 5.0, workoutType: "Base Run", isCompleted: true },
          { day: "Rabu", dayOfWeek: 3, title: "Threshold Tempo Run", description: "Warm up 1km, 4km @ Target 10K Pace, Cool down 1km", targetDistanceKm: 6.0, workoutType: "Tempo", isCompleted: false },
          { day: "Jumat", dayOfWeek: 5, title: "Interval 5x400m", description: "Kecepatan 5K pace dengan jog 90s recovery", targetDistanceKm: 5.0, workoutType: "Speed Interval", isCompleted: false },
          { day: "Minggu", dayOfWeek: 7, title: "Weekend Long Run", description: "Jaga heart rate stabil di zona 2", targetDistanceKm: 9.0, workoutType: "Long Run", isCompleted: false }
        ]
      },
      {
        weekNumber: 2,
        focus: "VO2 Max Stimulation",
        workouts: [
          { day: "Senin", dayOfWeek: 1, title: "Recovery Easy Run", description: "Lari rileks melancarkan aliran darah", targetDistanceKm: 6.0, workoutType: "Recovery", isCompleted: false },
          { day: "Rabu", dayOfWeek: 3, title: "Interval 4x800m", description: "Pace 4:45/km dengan recovery 200m jog", targetDistanceKm: 7.0, workoutType: "Interval", isCompleted: false },
          { day: "Jumat", dayOfWeek: 5, title: "Progressive Pace 6 KM", description: "Setiap kilometer dinaikkan kecepatannya", targetDistanceKm: 6.0, workoutType: "Tempo", isCompleted: false },
          { day: "Minggu", dayOfWeek: 7, title: "Long Run 11 KM", description: "Long run endurance akhir pekan", targetDistanceKm: 11.0, workoutType: "Long Run", isCompleted: false }
        ]
      }
    ],
    schedule: [
      {
        week: 1,
        days: [
          { dayOfWeek: 1, title: "Easy Zone 2 Run", description: "Lari santai ritme percakapan", distanceKm: 5.0, workoutType: "Base Run" },
          { dayOfWeek: 3, title: "Threshold Tempo Run", description: "Warm up 1km, 4km @ Target 10K Pace, Cool down 1km", distanceKm: 6.0, workoutType: "Tempo" },
          { dayOfWeek: 5, title: "Interval 5x400m", description: "Kecepatan 5K pace dengan jog 90s recovery", distanceKm: 5.0, workoutType: "Speed Interval" },
          { dayOfWeek: 7, title: "Weekend Long Run", description: "Jaga heart rate stabil di zona 2", distanceKm: 9.0, workoutType: "Long Run" }
        ]
      }
    ]
  },
  {
    id: "plan_half_marathon",
    title: "Half Marathon 21.1K Mastery",
    category: "Running",
    sportType: "Running",
    level: "Advanced",
    targetLevel: "Advanced",
    durationWeeks: 12,
    targetGoal: "Finish Half Marathon Sub-1:45",
    description: "Periodisasi latihan komprehensif: fase base building, peak mileage, dan tapering strategis.",
    weeks: [
      {
        weekNumber: 1,
        focus: "Volume Accumulation & Cruise Pace",
        workouts: [
          { day: "Senin", dayOfWeek: 1, title: "Recovery Run", description: "Pace sangat ringan membuang sisa asam laktat", targetDistanceKm: 6.0, workoutType: "Recovery", isCompleted: true },
          { day: "Rabu", dayOfWeek: 3, title: "Cruise Intervals", description: "4 x 1.5 KM @ Half Marathon Pace (4:55/km)", targetDistanceKm: 8.5, workoutType: "Interval", isCompleted: false },
          { day: "Jumat", dayOfWeek: 5, title: "Mid-week Medium Long", description: "Ritme konstan menjaga stamina otot", targetDistanceKm: 9.0, workoutType: "Endurance", isCompleted: false },
          { day: "Minggu", dayOfWeek: 7, title: "Long Run Endurance", description: "Lari panjang dengan simulasi nutrisi & hidrasi", targetDistanceKm: 14.0, workoutType: "Long Run", isCompleted: false }
        ]
      },
      {
        weekNumber: 2,
        focus: "Lactate Clearance & Aerobic Power",
        workouts: [
          { day: "Senin", dayOfWeek: 1, title: "Easy Aerobic Run", description: "Lari santai Zona 2", targetDistanceKm: 7.0, workoutType: "Base Run", isCompleted: false },
          { day: "Rabu", dayOfWeek: 3, title: "Tempo Run 8 KM", description: "Warm up 2k + 5k Tempo @ 4:50/km + Cool 1k", targetDistanceKm: 8.0, workoutType: "Tempo", isCompleted: false },
          { day: "Jumat", dayOfWeek: 5, title: "Strides & Easy Run", description: "6 KM easy + 6x100m strides akselerasi", targetDistanceKm: 7.0, workoutType: "Speed", isCompleted: false },
          { day: "Minggu", dayOfWeek: 7, title: "Long Run 16 KM", description: "Long run berbukit membangun daya tahan", targetDistanceKm: 16.0, workoutType: "Long Run", isCompleted: false }
        ]
      }
    ],
    schedule: [
      {
        week: 1,
        days: [
          { dayOfWeek: 1, title: "Recovery Run", description: "Pace sangat ringan membuang asam laktat", distanceKm: 6.0, workoutType: "Recovery" },
          { dayOfWeek: 3, title: "Cruise Intervals", description: "4 x 1.5 KM @ Half Marathon Pace", distanceKm: 8.5, workoutType: "Interval" },
          { dayOfWeek: 5, title: "Mid-week Medium Long", description: "Ritme konstan", distanceKm: 9.0, workoutType: "Endurance" },
          { dayOfWeek: 7, title: "Long Run Endurance", description: "Lari panjang dengan hidrasi teratur", distanceKm: 14.0, workoutType: "Long Run" }
        ]
      }
    ]
  }
];
