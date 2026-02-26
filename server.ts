import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Database Setup ---
const db = new Database("cybershield.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    title TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id TEXT,
    role TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT,
    risk_score INTEGER,
    https BOOLEAN,
    domain_age TEXT,
    status TEXT,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

let openaiClient: OpenAI | null = null;

function getOpenAI() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is missing");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

const SYSTEM_PROMPT = `Sen professional kiber xavfsizlik eksperti AI’san. 
Sen quyidagi sohalar bo‘yicha to‘liq va chuqur javob bera olasan: Tarmoq xavfsizligi, Web xavfsizlik (XSS, CSRF, SQL injection tushuntirish), Phishing va scam tahlili, Malware turlari, Parol xavfsizligi, 2FA va autentifikatsiya, Wi-Fi himoyasi, Mobil xavfsizlik, Social engineering, Kriptografiya asoslari, Risk baholash, Himoya strategiyalari, Incident response. 
Sen hech qachon zararli hujumni bosqichma-bosqich o‘rgatmaysan. 
Agar hujum haqida savol bo‘lsa, faqat himoya va oldini olish haqida tushuntir. 
Har doim o‘zbek tilida professional javob ber. 
Javoblaring tizimli va aniq bo‘lsin.`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Chat History Endpoints ---
  app.get("/api/chats", (req, res) => {
    const chats = db.prepare("SELECT * FROM chats ORDER BY created_at DESC").all();
    res.json(chats);
  });

  app.post("/api/chats", (req, res) => {
    const { id, title } = req.body;
    db.prepare("INSERT INTO chats (id, title) VALUES (?, ?)").run(id, title);
    res.json({ success: true });
  });

  app.get("/api/chats/:id/messages", (req, res) => {
    const messages = db.prepare("SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp ASC").all(req.params.id);
    res.json(messages);
  });

  app.delete("/api/chats/:id", (req, res) => {
    db.prepare("DELETE FROM chats WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // --- Phishing Scan ---
  app.post("/api/scan", (req, res) => {
    const { url } = req.body;
    const isSuspicious = url.includes("bot") || url.includes("gift") || !url.startsWith("https");
    const riskScore = isSuspicious ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 20);
    res.json({
      risk_score: riskScore,
      https: url.startsWith("https"),
      domain_age: "2 oy",
      status: riskScore > 70 ? "Yuqori xavf" : riskScore > 30 ? "O'rtacha xavf" : "Xavfsiz"
    });
  });

  // --- Fraud Database ---
  const fraudReports = [
    { id: 1, type: "Telegram", target: "@shubhali_bot", description: "Pul so'radi va soxta investitsiya taklif qildi.", date: "2024-02-20", risk: "Yuqori" },
    { id: 2, type: "Karta", target: "8600 **** **** 1234", description: "SMS kod so'radi (Phishing).", date: "2024-02-21", risk: "O'rta" },
    { id: 3, type: "Instagram", target: "uz_shop_scam", description: "Tovarni yubormadi, pulni olgach blokladi.", date: "2024-02-22", risk: "Yuqori" },
    { id: 4, type: "Telefon", target: "+998 90 *** 45 67", description: "Bank xodimi sifatida qo'ng'iroq qildi.", date: "2024-02-23", risk: "O'rta" },
    { id: 5, type: "Sayt", target: "olx-pay-uz.com", description: "Soxta to'lov sahifasi (Carding).", date: "2024-02-24", risk: "Yuqori" },
    { id: 6, type: "Telegram", target: "@priz_uz_bot", description: "Yutuq chiqdi deb pul so'radi.", date: "2024-02-24", risk: "Past" }
  ];

  app.get("/api/fraud/search", (req, res) => {
    const { q } = req.query;
    const queryStr = (q as string || "").toLowerCase();
    const results = fraudReports.filter(r => 
      r.target.toLowerCase().includes(queryStr) || 
      r.description.toLowerCase().includes(queryStr) ||
      r.type.toLowerCase().includes(queryStr)
    );
    res.json(results);
  });

  app.get("/api/status", (req, res) => {
    res.json({
      gemini: !!(process.env.GEMINI_API_KEY || process.env.API_KEY),
      openai: !!process.env.OPENAI_API_KEY
    });
  });

  app.post("/api/fraud/report", (req, res) => {
    res.json({ success: true, message: "Hisobot qabul qilindi." });
  });

  // --- Scan History Endpoints ---
  app.get("/api/scans", (req, res) => {
    const scans = db.prepare("SELECT * FROM scans ORDER BY timestamp DESC LIMIT 10").all();
    res.json(scans);
  });

  app.post("/api/scans", (req, res) => {
    const { url, risk_score, https, domain_age, status, details } = req.body;
    db.prepare(`
      INSERT INTO scans (url, risk_score, https, domain_age, status, details) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(url, risk_score, https ? 1 : 0, domain_age, status, details);
    res.json({ success: true });
  });

  // --- AI Endpoints ---
  app.post("/api/ai-chatgpt", async (req, res) => {
    try {
      const { prompt, chatId } = req.body;
      
      // Save user message
      if (chatId) {
        db.prepare("INSERT INTO messages (chat_id, role, content) VALUES (?, ?, ?)").run(chatId, 'user', prompt);
      }

      const openai = getOpenAI();
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
      });
      
      const aiText = response.choices[0].message.content;

      // Save assistant message
      if (chatId) {
        db.prepare("INSERT INTO messages (chat_id, role, content) VALUES (?, ?, ?)").run(chatId, 'assistant', aiText);
      }

      res.json({ text: aiText });
    } catch (error: any) {
      console.error("OpenAI Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai-gemini-save", (req, res) => {
    const { chatId, role, content } = req.body;
    db.prepare("INSERT INTO messages (chat_id, role, content) VALUES (?, ?, ?)").run(chatId, role, content);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("--- API Key Health Check ---");
    console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "PRESENT" : "MISSING");
    console.log("API_KEY:", process.env.API_KEY ? "PRESENT" : "MISSING");
    console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "PRESENT" : "MISSING");
    console.log("----------------------------");
  });
}

startServer();
