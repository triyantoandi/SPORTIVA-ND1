import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Health check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "SPORTIVA", timestamp: new Date().toISOString() });
});

// AI Fitness Coach API
app.post("/api/ai/coach", async (req, res) => {
  try {
    const { prompt, userProfile, activityContext } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getAIClient();
    if (!ai) {
      // Fallback structured coaching response if API key is not yet set
      return res.json({
        advice: `[AI Fitness Coach]\n\nBerdasarkan data aktivitas Anda:\n- Pertahankan konsistensi latihan aerobik zona 2-3.\n- Disarankan recovery run 3-5 km dengan pace santai setelah sesi berat.\n- Pastikan hidrasi dan waktu tidur 7-8 jam untuk optimalisasi pemulihan otot.\n\n*Catatan: Saran ini merupakan fitness insight untuk panduan latihan dan bukan merupakan diagnosis atau anjuran medis profesional.*`,
        trainingTip: "Fokus pada cadence 170-180 spm untuk efisiensi lari yang lebih baik.",
        recommendedWorkout: "Easy Recovery Run (4 KM, Pace 6:30/km)",
        recoveryScore: 82
      });
    }

    const systemInstruction = `Anda adalah SPORTIVA AI Fitness Coach profesional, ramah, analitis, dan suportif.
Anda menganalisis riwayat olahraga, jarak tempuh, pace, elevation, konsistensi, detak jantung, dan personal record pengguna.
Berikan saran berbasis sains olahraga: periodisasi latihan, zona detak jantung (Zone 2/Tempo/Interval), hidrasi, pencegahan overtraining, dan motivasi.
PENTING: Selalu sertakan disclaimer bahwa ini adalah fitness insight olahraga dan bukan diagnosis medis klinis. Untuk keluhan fisik cedera/medis, arahkan ke tenaga kesehatan.
Format respon Anda terstruktur rapi dengan poin-poin yang mudah dibaca oleh atlet.`;

    const userContextText = userProfile 
      ? `Profil Atlet: ${userProfile.fullName || 'Atlet'}, Level: ${userProfile.fitnessLevel || 'Intermediate'}, Target: ${userProfile.goals || 'Improve stamina & pace'}.` 
      : '';
    
    const activityContextText = activityContext 
      ? `Riwayat/Konteks Aktivitas Terkini: ${JSON.stringify(activityContext)}` 
      : '';

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${userContextText}\n${activityContextText}\n\nPertanyaan/Kebutuhan Atlet: ${prompt}`,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({
      advice: response.text || "Terus semangat berolahraga dan jaga konsistensi!",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("AI Coach error:", error);
    return res.status(500).json({ 
      error: "Gagal memproses rekomendasi AI Coach",
      details: error.message 
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SPORTIVA Server running on http://localhost:${PORT}`);
  });
}

startServer();
