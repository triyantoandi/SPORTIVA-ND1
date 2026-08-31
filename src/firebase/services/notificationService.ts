import { NotificationItem, ReportItem } from "../../types";

const LOCAL_NOTIFS_KEY = "sportiva_cached_notifs";
const LOCAL_REPORTS_KEY = "sportiva_cached_reports";

export class NotificationService {
  static getNotifications(): NotificationItem[] {
    try {
      const data = localStorage.getItem(LOCAL_NOTIFS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      // Ignore
    }

    return [
      {
        id: "notif_1",
        userId: "user_andi_sportiva",
        type: "streak",
        title: "🔥 12-Day Streak On Fire!",
        message: "Luar biasa! Pertahankan konsistensi latihan Anda hari ini agar rekor streak terus berlanjut.",
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "notif_2",
        userId: "user_andi_sportiva",
        type: "challenge",
        title: "🏆 Target Challenge 100 KM Hampir Tercapai",
        message: "Tersisa 17.6 KM lagi untuk menuntaskan 30-Day Running Challenge!",
        isRead: false,
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: "notif_3",
        userId: "user_andi_sportiva",
        type: "kudos",
        title: "❤️ Budi Santoso memberi Kudos",
        message: "Budi Santoso menyukai aktivitas 'Morning Sunrise Tempo Run 🌅'",
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: "notif_4",
        userId: "user_andi_sportiva",
        type: "ai_coach",
        title: "🤖 Insight AI Coach Mingguan",
        message: "Performa lari dan konsistensi Anda naik 8% dibanding bulan lalu. Cek rekomendasi recovery!",
        isRead: true,
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
  }

  static markAllAsRead(): void {
    const list = this.getNotifications().map(n => ({ ...n, isRead: true }));
    try {
      localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify(list));
    } catch (e) {
      // Ignore
    }
  }

  static addNotification(notif: Omit<NotificationItem, "id" | "isRead" | "createdAt">): void {
    const current = this.getNotifications();
    const item: NotificationItem = {
      ...notif,
      id: `notif_${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify([item, ...current]));
    } catch (e) {
      // Ignore
    }
  }
}

export class AdminService {
  static getReports(): ReportItem[] {
    try {
      const data = localStorage.getItem(LOCAL_REPORTS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      // Ignore
    }

    return [
      {
        id: "rep_1",
        reporterId: "user_siti_03",
        reporterName: "Siti Rahmawati",
        targetType: "activity",
        targetId: "act_suspicious_99",
        targetTitle: "Cycling 85 km/h uphill on Rembangan",
        reason: "GPS speed flag: Impossible pace detected (85 km/h on steep gradient)",
        status: "pending",
        createdAt: new Date(Date.now() - 43200000).toISOString()
      },
      {
        id: "rep_2",
        reporterId: "user_budi_02",
        reporterName: "Budi Santoso",
        targetType: "comment",
        targetId: "comm_spam_44",
        reason: "Spam promo commercial link",
        status: "reviewed",
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  }

  static updateReportStatus(reportId: string, status: 'reviewed' | 'dismissed' | 'actioned'): void {
    const list = this.getReports();
    const idx = list.findIndex(r => r.id === reportId);
    if (idx !== -1) {
      list[idx].status = status;
      try {
        localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(list));
      } catch (e) {
        // Ignore
      }
    }
  }
}
