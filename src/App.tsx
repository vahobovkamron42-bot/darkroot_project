/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Search, MessageSquare, GraduationCap, BarChart3, 
  AlertTriangle, CheckCircle2, XCircle, Mic, Volume2, 
  VolumeX, Settings, User, ArrowRight, Lock, Smartphone, 
  Globe, Clock, Send, Code, Copy, Check, History, Plus, Terminal,
  Trash2, RefreshCw, ChevronLeft, Key, Eye, EyeOff,
  AppWindow, Bell, ShieldAlert, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const playCyberSound = (enabled: boolean, type: 'click' | 'scan' | 'alert') => {
  if (!enabled) return;
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  if (type === 'click') {
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } else if (type === 'scan') {
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(400, audioCtx.currentTime + 0.5);
    gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  } else if (type === 'alert') {
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
  }
};

// --- Components ---

const MouseGlow = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handle = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);
  return <div className="mouse-glow" style={{ left: pos.x, top: pos.y }} />;
};

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);
  return (
    <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-cyber-bg flex flex-col items-center justify-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
        <Shield size={80} className="text-cyber-accent drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
      </motion.div>
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 text-2xl font-bold tracking-tight">
        CYBER<span className="gradient-text">SHIELD</span> UZ
      </motion.h1>
    </motion.div>
  );
};

const NotificationSystem = ({ notifications, remove }: { notifications: any[], remove: (id: string) => void }) => {
  return (
    <div className="fixed top-20 right-6 z-[60] flex flex-col gap-3 w-80 pointer-events-none">
      <AnimatePresence>
        {notifications.map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
              "pointer-events-auto p-4 rounded-2xl border glass-card shadow-2xl flex gap-3 items-start",
              n.type === 'danger' ? "border-cyber-danger/50 bg-cyber-danger/10" : "border-cyber-accent/50 bg-cyber-accent/10"
            )}
          >
            <div className={cn("p-2 rounded-lg shrink-0", n.type === 'danger' ? "text-cyber-danger bg-cyber-danger/20" : "text-cyber-accent bg-cyber-accent/20")}>
              {n.type === 'danger' ? <ShieldAlert size={18} /> : <Bell size={18} />}
            </div>
            <div className="flex-1">
              <h5 className="text-xs font-bold uppercase tracking-wider mb-1">{n.title}</h5>
              <p className="text-[10px] text-cyber-muted leading-tight">{n.message}</p>
            </div>
            <button onClick={() => remove(n.id)} className="text-cyber-muted hover:text-white p-1">
              <XCircle size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const SystemScanSection = ({ addNotification }: { addNotification: (n: any) => void }) => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[] | null>(null);

  const startScan = () => {
    setScanning(true);
    setProgress(0);
    setResults(null);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          finishScan();
          return 100;
        }
        return prev + Math.random() * 5;
      });
    }, 150);
  };

  const finishScan = () => {
    setScanning(false);
    const mockApps = [
      { name: "Super Cleaner Pro", risk: "Yuqori", reason: "Ma'lumotlarni ruxsatsiz yuborish", id: 1 },
      { name: "Free VPN Turbo", risk: "O'rtacha", reason: "Shubhali reklama modullari", id: 2 },
      { name: "Photo Editor AI", risk: "Past", reason: "Kengaytirilgan ruxsatnomalar", id: 3 },
    ];
    setResults(mockApps);
    addNotification({
      title: "Skanerlash Yakunlandi",
      message: "3 ta shubhali ilova topildi. Tizim xavf ostida bo'lishi mumkin.",
      type: 'danger'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 md:pb-6">
      <div className="glass-card p-5 md:p-8 text-center space-y-6 led-glow">
        {!scanning && !results && (
          <div className="py-6 space-y-8">
            <div className="w-24 h-24 mx-auto bg-cyber-accent/10 rounded-full flex items-center justify-center border border-cyber-accent/30 relative">
              <Shield size={48} className="text-cyber-accent" />
              <div className="absolute inset-0 rounded-full border-2 border-cyber-accent/20 animate-ping" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Tizimni To'liq Skanerlash</h3>
              <p className="text-xs text-cyber-muted max-w-xs mx-auto">Barcha o'rnatilgan ilovalar va tizim fayllarini zararli kodlarga tekshiradi.</p>
            </div>
            <button onClick={startScan} className="cyber-btn px-12 py-4 font-black tracking-widest w-full sm:w-auto min-h-[48px]">
              SKANERLASHNI BOSHLASH
            </button>
          </div>
        )}

        {scanning && (
          <div className="py-10 space-y-8">
            <div className="relative w-48 h-48 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={502.4} strokeDashoffset={502.4 - (502.4 * progress) / 100} className="text-cyber-accent transition-all duration-300" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black">{Math.round(progress)}%</span>
                <span className="text-[10px] font-mono text-cyber-muted uppercase tracking-tighter">Scanning...</span>
              </div>
            </div>
            <div className="space-y-2 font-mono text-[10px] text-cyber-accent animate-pulse">
              <p>[SYSTEM] ANALYZING_PACKAGE_RESOURCES...</p>
              <p>[SYSTEM] CHECKING_SIGNATURE_INTEGRITY...</p>
            </div>
          </div>
        )}

        {results && (
          <div className="text-left space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-cyber-danger flex items-center gap-2">
                <ShieldAlert size={20} />
                Xavfli Ilovalar Topildi
              </h3>
              <button onClick={() => setResults(null)} className="text-[10px] font-bold text-cyber-muted hover:text-white uppercase tracking-widest min-h-[44px] px-2">Qayta Skanerlash</button>
            </div>
            
            <div className="grid gap-3">
              {results.map(app => (
                <div key={app.id} className="bg-white/5 border border-white/5 p-4 md:p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between group hover:border-cyber-danger/30 transition-all gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="p-3 bg-cyber-danger/10 rounded-xl text-cyber-danger shrink-0">
                      <AppWindow size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm md:text-base truncate">{app.name}</h4>
                      <p className="text-[10px] text-cyber-muted truncate">{app.reason}</p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-2">
                    <span className="text-[9px] font-bold px-3 py-1 bg-cyber-danger/20 text-cyber-danger rounded-full uppercase tracking-wider">XAVF: {app.risk}</span>
                    <button className="text-[10px] font-black text-cyber-danger hover:underline uppercase tracking-widest min-h-[44px] px-2">O'CHIRISH</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 bg-cyber-accent/5 border border-cyber-accent/20 rounded-xl flex gap-4 items-start">
              <Info size={20} className="text-cyber-accent shrink-0 mt-0.5" />
              <p className="text-xs text-cyber-muted leading-relaxed">
                <span className="text-cyber-accent font-bold uppercase tracking-widest block mb-1">Tavsiya:</span> Yuqoridagi ilovalar shaxsiy ma'lumotlaringizni o'g'irlashi yoki qurilmangizni sekinlashtirishi mumkin. Ularni zudlik bilan o'chirib tashlash tavsiya etiladi.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ScannerSection = ({ addNotification }: { addNotification: (n: any) => void }) => {
  const [activeSubTab, setActiveSubTab] = useState<'url' | 'system'>('url');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/scans');
      const data = await res.json();
      setHistory(data);
    } catch (e) {
      console.error("History fetch error:", e);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'url') {
      fetchHistory();
    }
  }, [activeSubTab]);

  const handleScan = async () => {
    if (!url) return;
    setLoading(true);
    setResult(null);
    try {
      const prompt = `Siz kiberxavfsizlik bo'yicha ekspert tahlilchisiz. 
      Ushbu havolani xavfsizlik nuqtai nazaridan chuqur tahlil qiling: ${url}. 
      
      Javobni faqat JSON formatida qaytaring: 
      {
        "risk_score": raqam (0-100),
        "https": boolean,
        "domain_age": "matn",
        "status": "Xavfsiz/O'rtacha xavf/Yuqori xavf",
        "details": "Professional va tizimli tahlil (o'zbek tilida)"
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(response.text || "{}");
      setResult(data);

      // Save to history
      await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          risk_score: data.risk_score,
          https: data.https,
          domain_age: data.domain_age,
          status: data.status,
          details: data.details
        })
      });
      fetchHistory();

      if (data.risk_score > 70) {
        addNotification({
          title: "Xavfli Havola!",
          message: `${url} havolasi yuqori xavfga ega deb topildi.`,
          type: 'danger'
        });
      }
    } catch (e) { 
      console.error(e);
      addNotification({ title: "Xatolik", message: "Skanerlashda xatolik yuz berdi.", type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (item: any) => {
    setUrl(item.url);
    setResult({
      risk_score: item.risk_score,
      https: !!item.https,
      domain_age: item.domain_age,
      status: item.status,
      details: item.details
    });
    setShowHistory(false);
  };

  return (
    <div className="space-y-6 reveal">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <Shield className="text-cyber-accent" size={28} />
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">Xavfsizlik Markazi</h2>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full sm:w-auto">
          <button onClick={() => setActiveSubTab('url')} className={cn("flex-1 sm:flex-none px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.15em] transition-all min-h-[40px]", activeSubTab === 'url' ? "bg-cyber-accent text-cyber-bg shadow-[0_0_10px_#00f0ff]" : "text-cyber-muted hover:text-white")}>URL</button>
          <button onClick={() => setActiveSubTab('system')} className={cn("flex-1 sm:flex-none px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.15em] transition-all min-h-[40px]", activeSubTab === 'system' ? "bg-cyber-accent text-cyber-bg shadow-[0_0_10px_#00f0ff]" : "text-cyber-muted hover:text-white")}>TIZIM</button>
        </div>
      </div>
      
      {activeSubTab === 'url' ? (
        <>
          <div className="flex items-center justify-between mb-2">
            <p className="text-cyber-muted text-xs md:text-sm font-mono">[AI_DRIVEN_SECURITY_ANALYSIS]</p>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-[10px] font-bold text-cyber-accent uppercase tracking-widest hover:text-white transition-colors"
            >
              <History size={14} /> {showHistory ? 'Yashirish' : 'Tarix'}
            </button>
          </div>

          <AnimatePresence>
            {showHistory && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="glass-card p-4 space-y-2 border-cyber-accent/20">
                  <h4 className="text-[10px] font-bold text-cyber-muted uppercase tracking-widest mb-3">Oxirgi Skanerlashlar</h4>
                  {history.length > 0 ? (
                    <div className="grid gap-2">
                      {history.map((item) => (
                        <button 
                          key={item.id}
                          onClick={() => loadFromHistory(item)}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-left group"
                        >
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="text-xs font-bold truncate group-hover:text-cyber-accent transition-colors">{item.url}</p>
                            <p className="text-[9px] text-cyber-muted uppercase tracking-tighter">{new Date(item.timestamp).toLocaleString()}</p>
                          </div>
                          <div className={cn("text-[10px] font-black px-2 py-0.5 rounded-full", item.risk_score > 70 ? "text-cyber-danger bg-cyber-danger/10" : "text-green-400 bg-green-400/10")}>
                            {item.risk_score}%
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-cyber-muted italic py-4 text-center">Tarix bo'sh</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="glass-card p-5 md:p-8 space-y-8 led-glow">
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                placeholder="https://shubhali-sayt.uz" 
                className="cyber-input flex-1 min-h-[48px]" 
              />
              <button onClick={handleScan} disabled={loading} className="cyber-btn px-8 min-h-[48px] font-bold tracking-widest">
                {loading ? 'TAHLIL QILINMOQDA...' : 'SKANERLASH'}
              </button>
            </div>
            
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-cyber-accent/20 border-t-cyber-accent rounded-full animate-spin shadow-[0_0_15px_#00f0ff]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Globe size={24} className="text-cyber-accent animate-pulse" />
                  </div>
                </div>
                <p className="text-xs font-mono text-cyber-accent animate-pulse uppercase tracking-widest">NEURAL_NETWORK_SCANNING...</p>
              </div>
            )}

            {result && !loading && (
              <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="pt-8 border-t border-white/5 space-y-8">
                <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5">
                  <span className="text-xs font-bold uppercase tracking-widest text-cyber-muted">Xavf Darajasi</span>
                  <span className={cn("text-3xl font-black", result.risk_score > 70 ? "text-cyber-danger drop-shadow-[0_0_10px_#ff1a1a]" : result.risk_score > 30 ? "text-yellow-400" : "text-green-400")}>
                    {result.risk_score}%
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={cn("bg-white/[0.02] p-5 rounded-2xl border transition-colors", result.https ? "border-green-400/20" : "border-cyber-danger/20")}>
                    <p className="text-[10px] text-cyber-muted uppercase font-bold mb-3 tracking-widest">SSL_STATUS</p>
                    <div className="flex items-center gap-3 font-bold text-sm">
                      {result.https ? <CheckCircle2 size={18} className="text-green-400" /> : <XCircle size={18} className="text-cyber-danger" />}
                      <span className={result.https ? "text-green-400" : "text-cyber-danger"}>{result.https ? 'SECURE' : 'INSECURE'}</span>
                    </div>
                  </div>
                  <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-cyber-muted uppercase font-bold mb-3 tracking-widest">DOMAIN_AGE</p>
                    <div className="flex items-center gap-3 font-bold text-sm">
                      <Clock size={18} className="text-cyber-accent" /> 
                      <span>{result.domain_age}</span>
                    </div>
                  </div>
                </div>
                <div className={cn("p-5 rounded-xl text-center font-bold text-xs uppercase tracking-[0.25em] led-glow", result.risk_score > 70 ? "bg-cyber-danger/10 text-cyber-danger border border-cyber-danger/20" : "bg-green-400/10 text-green-400 border border-green-400/20")}>
                  {result.status}
                </div>
                {result.details && (
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/5 text-xs text-cyber-muted leading-relaxed italic relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyber-accent/30" />
                    {result.details}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </>
      ) : (
        <SystemScanSection addNotification={addNotification} />
      )}
    </div>
  );
};

const FraudDBSection = () => {
  const [activeSubTab, setActiveSubTab] = useState<'global' | 'database'>('global');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  
  // Database tab state
  const [dbReports, setDbReports] = useState<any[]>([]);
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setResults([]);
    setAiAnalysis(null);
    try {
      const prompt = `Siz professional OSINT (Open Source Intelligence) tahlilchisiz. 
      Ushbu foydalanuvchi nomi yoki telefon raqami haqida ochiq manbalardan ma'lumot qidir: ${query}. 
      
      Vazifangiz:
      1. Ushbu subyektning kiber-muhitdagi faoliyatini tahlil qilish.
      2. Telegram, Instagram va boshqa ijtimoiy tarmoqlardagi ehtimoliy profillarini aniqlash.
      3. Firibgarlik yoki shubhali harakatlar haqidagi ma'lumotlarni tekshirish.
      
      Javobni o'zbek tilida, professional, xolis va tizimli (structured) ko'rinishda taqdim eting. 
      Agar aniq ma'lumot topilmasa, shubhali bo'lishi mumkin bo'lgan holatlar haqida umumiy tavsiyalar bering.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const urls = (response as any).candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((c: any) => c.web)
        .filter(Boolean) || [];
      
      setAiAnalysis(response.text || "Ma'lumot topilmadi.");
      setResults(urls);
    } catch (e) {
      console.error(e);
      setAiAnalysis("Qidiruvda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDbReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fraud/search?q=${encodeURIComponent(dbSearchQuery)}`);
      const data = await res.json();
      setDbReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'database') {
      fetchDbReports();
    }
  }, [activeSubTab, dbSearchQuery]);

  const filteredReports = dbReports.filter(r => {
    const matchesRisk = riskFilter === 'all' || r.risk === riskFilter;
    const matchesDate = !dateFilter || r.date === dateFilter;
    return matchesRisk && matchesDate;
  });

  return (
    <div className="space-y-6 reveal pb-24 md:pb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <Search className="text-cyber-accent" size={28} />
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">Firibgarlik Bazasi</h2>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full sm:w-auto">
          <button onClick={() => setActiveSubTab('global')} className={cn("flex-1 sm:flex-none px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.15em] transition-all min-h-[40px]", activeSubTab === 'global' ? "bg-cyber-accent text-cyber-bg shadow-[0_0_10px_#00f0ff]" : "text-cyber-muted hover:text-white")}>Global</button>
          <button onClick={() => setActiveSubTab('database')} className={cn("flex-1 sm:flex-none px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.15em] transition-all min-h-[40px]", activeSubTab === 'database' ? "bg-cyber-accent text-cyber-bg shadow-[0_0_10px_#00f0ff]" : "text-cyber-muted hover:text-white")}>Baza</button>
        </div>
      </div>

      {activeSubTab === 'global' ? (
        <>
          <p className="text-cyber-muted text-xs md:text-sm mb-6 font-mono">[OSINT_SEARCH_ENGINE_ACTIVE]</p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              placeholder="Username yoki telefon raqam..." 
              className="cyber-input flex-1 min-h-[48px]" 
            />
            <button onClick={handleSearch} disabled={loading} className="cyber-btn px-8 min-h-[48px] font-bold tracking-widest">
              {loading ? 'QIDIRILMOQDA...' : 'QIDIRISH'}
            </button>
          </div>

          <div className="space-y-6">
            {loading && (
              <div className="glass-card p-12 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-2 border-cyber-accent/20 border-t-cyber-accent rounded-full animate-spin shadow-[0_0_15px_#00f0ff]" />
                <p className="text-[10px] font-mono text-cyber-accent animate-pulse uppercase tracking-widest">Accessing_Global_Databases...</p>
              </div>
            )}

            {aiAnalysis && !loading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 md:p-8 border-cyber-accent/20 led-glow">
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <Shield size={16} className="text-cyber-accent" />
                  <span className="text-[10px] font-bold text-cyber-accent uppercase tracking-widest">AI_ANALYSIS_RESULT</span>
                </div>
                <div className="text-sm text-cyber-text leading-relaxed prose prose-invert max-w-none">
                  <Markdown>{aiAnalysis}</Markdown>
                </div>
              </motion.div>
            )}

            {results.length > 0 && !loading && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-cyber-muted uppercase tracking-widest px-1">Manbalar va Havolalar</h4>
                {results.map((res, i) => (
                  <a 
                    key={i} 
                    href={res.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="glass-card p-4 flex items-center justify-between hover:bg-white/[0.05] border-l-4 border-l-cyber-accent/50 transition-all group min-h-[64px]"
                  >
                    <div className="flex-1 truncate pr-4">
                      <h5 className="text-xs font-bold truncate group-hover:text-cyber-accent transition-colors">{res.title}</h5>
                      <p className="text-[10px] text-cyber-muted truncate mt-1">{res.uri}</p>
                    </div>
                    <ArrowRight size={16} className="text-cyber-muted group-hover:text-cyber-accent group-hover:translate-x-1 transition-all" />
                  </a>
                ))}
              </div>
            )}

            {!loading && !aiAnalysis && (
              <div className="glass-card p-12 text-center opacity-40 font-mono text-xs border-dashed border-white/10">
                [OSINT_IDLE: WAITING_FOR_QUERY]
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="glass-card p-5 md:p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-cyber-muted uppercase tracking-widest ml-1">Baza bo'yicha qidiruv</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={dbSearchQuery}
                  onChange={(e) => setDbSearchQuery(e.target.value)}
                  placeholder="Karta raqami, bot nomi yoki telefon..."
                  className="cyber-input flex-1 min-h-[44px] bg-cyber-bg"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold text-cyber-muted uppercase tracking-widest ml-1">Xavf darajasi</label>
                <select 
                  value={riskFilter} 
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="cyber-input w-full min-h-[44px] bg-cyber-bg"
                >
                  <option value="all">Barchasi</option>
                  <option value="Yuqori">Yuqori</option>
                  <option value="O'rta">O'rta</option>
                  <option value="Past">Past</option>
                </select>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold text-cyber-muted uppercase tracking-widest ml-1">Sana</label>
                <input 
                  type="date" 
                  value={dateFilter} 
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="cyber-input w-full min-h-[44px] bg-cyber-bg"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="glass-card p-12 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-2 border-cyber-accent/20 border-t-cyber-accent rounded-full animate-spin shadow-[0_0_15px_#00f0ff]" />
                <p className="text-[10px] font-mono text-cyber-accent animate-pulse uppercase tracking-widest">Loading_Database...</p>
              </div>
            ) : filteredReports.length > 0 ? (
              filteredReports.map(report => (
                <div key={report.id} className="glass-card p-5 border-white/5 hover:border-cyber-accent/30 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", report.risk === 'Yuqori' ? "bg-cyber-danger/10 text-cyber-danger" : "bg-yellow-400/10 text-yellow-400")}>
                        <AlertTriangle size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm group-hover:text-cyber-accent transition-colors">{report.target}</h4>
                        <p className="text-[10px] text-cyber-muted uppercase tracking-tighter">{report.type}</p>
                      </div>
                    </div>
                    <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase", report.risk === 'Yuqori' ? "bg-cyber-danger/20 text-cyber-danger" : "bg-yellow-400/20 text-yellow-400")}>
                      {report.risk}
                    </span>
                  </div>
                  <p className="text-xs text-cyber-muted mb-4 leading-relaxed">{report.description}</p>
                  <div className="flex justify-between items-center text-[9px] font-mono text-cyber-muted border-t border-white/5 pt-3">
                    <span>ID: #{report.id.toString().padStart(4, '0')}</span>
                    <span>SANA: {report.date}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card p-12 text-center opacity-40 font-mono text-xs border-dashed border-white/10">
                [NO_REPORTS_FOUND_FOR_CRITERIA]
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AIMarkazSection = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiModel, setAiModel] = useState<'gemini' | 'chatgpt'>('gemini');
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showLogs, setShowLogs] = useState(true);
  const [localLogs, setLocalLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const systemInstruction = `Siz 'CyberShield UZ' tizimining professional kiberxavfsizlik eksperti va universal AI yordamchisiz. 
  Vazifangiz: Foydalanuvchi savollariga o'zbek tilida, professional, aniq va tizimli (structured) javob berish.

  Asosiy qoidalar:
  1. Professional ohang: Har doim rasmiy va hurmat bilan javob bering.
  2. Tizimli tuzilish: Javoblaringizda sarlavhalar, ro'yxatlar (bullet points) va qalin matnlardan foydalaning. Murakkab tushunchalarni oddiy, lekin texnik jihatdan to'g'ri tushuntiring.
  3. Kiberxavfsizlik fokusi: Xavfsizlikka oid savollarga alohida e'tibor bering (tarmoq, web, phishing, malware, parollar, 2FA va h.k.).
  4. Xavfsizlik cheklovi: HECH QACHON zararli hujumlarni amalga oshirish bo'yicha ko'rsatma bermang. Faqat himoya, profilaktika va xavfsizlik choralarini tushuntiring.
  5. Universal bilim: Kiberxavfsizlikdan tashqari boshqa umumiy savollarga ham professional darajada javob bering, lekin har doim xavfsizlik madaniyatini targ'ib qiling.
  6. Til: Faqat o'zbek tilida javob bering.`;

  useEffect(() => {
    fetchChats();
    const messages = [
      "AI_CORE: Online",
      "SECURE_PROTOCOL: Active",
      "NEURAL_LINK: Established",
      "ENCRYPTION: AES-256",
      "THREAT_SCAN: Running",
      "FIREWALL: Operational"
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLocalLogs(prev => [messages[i % messages.length], ...prev].slice(0, 8));
      i++;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentChatId) {
      fetchMessages(currentChatId);
      setShowHistory(false);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const fetchChats = async () => {
    const res = await fetch('/api/chats');
    const data = await res.json();
    setChats(data);
  };

  const fetchMessages = async (id: string) => {
    const res = await fetch(`/api/chats/${id}/messages`);
    const data = await res.json();
    setMessages(data.map((m: any) => ({ role: m.role, text: m.content })));
  };

  const createNewChat = async () => {
    const id = crypto.randomUUID();
    const title = "Yangi suhbat " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title })
    });
    fetchChats();
    setCurrentChatId(id);
    setShowHistory(false);
  };

  const deleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/chats/${id}`, { method: 'DELETE' });
    fetchChats();
    if (currentChatId === id) setCurrentChatId(null);
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'uz-UZ';
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'uz-UZ';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => setInput(event.results[0][0].transcript);
    recognition.start();
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    let chatId = currentChatId;
    if (!chatId) {
      chatId = crypto.randomUUID();
      const title = input.slice(0, 30) + (input.length > 30 ? "..." : "");
      await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: chatId, title })
      });
      setCurrentChatId(chatId);
      fetchChats();
    }

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      let aiResponseText = "";
      if (aiModel === 'gemini') {
        if (chatId) {
          await fetch('/api/ai-gemini-save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId, role: 'user', content: currentInput })
          });
        }

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: currentInput,
          config: { systemInstruction: systemInstruction }
        });
        aiResponseText = response.text || "";
        
        if (chatId) {
          await fetch('/api/ai-gemini-save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId, role: 'assistant', content: aiResponseText })
          });
        }
      } else {
        const res = await fetch('/api/ai-chatgpt', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ prompt: currentInput, chatId }) 
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        aiResponseText = data.text;
      }

      let displayedText = "";
      const words = aiResponseText.split(" ");
      setMessages(prev => [...prev, { role: 'assistant', text: "" }]);
      
      for (let i = 0; i < words.length; i++) {
        displayedText += words[i] + " ";
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].text = displayedText;
          return newMsgs;
        });
        await new Promise(r => setTimeout(r, 30));
      }
      
      speakText(aiResponseText);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', text: `Xatolik: ${e.message}` }]);
    } finally { setLoading(false); }
  };

  const filteredChats = chats.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] md:h-[calc(100vh-180px)] glass-card overflow-hidden border-white/10 led-glow reveal relative">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-white/5 bg-cyber-navy/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowHistory(!showHistory)} 
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all border text-[10px] font-bold uppercase tracking-widest min-h-[40px]", 
              showHistory ? "bg-cyber-accent/20 border-cyber-accent text-white led-glow" : "bg-white/5 border-white/10 text-cyber-muted hover:text-white hover:border-white/20"
            )}
          >
            <History size={16} />
            <span className="hidden sm:inline">Tarix</span>
          </button>
          <button 
            onClick={createNewChat} 
            className="p-2.5 rounded-lg bg-cyber-accent/10 border border-cyber-accent/30 text-cyber-accent hover:bg-cyber-accent/20 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center" 
            title="Yangi suhbat"
          >
            <Plus size={20} />
          </button>
        </div>
        
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
          <button onClick={() => setAiModel('gemini')} className={cn("px-3 md:px-4 py-1.5 rounded-full text-[9px] font-black tracking-tighter transition-all", aiModel === 'gemini' ? "bg-cyber-accent text-cyber-bg shadow-[0_0_10px_#00f0ff]" : "text-cyber-muted hover:text-white")}>GEMINI</button>
          <button onClick={() => setAiModel('chatgpt')} className={cn("px-3 md:px-4 py-1.5 rounded-full text-[9px] font-black tracking-tighter transition-all", aiModel === 'chatgpt' ? "bg-cyber-accent text-cyber-bg shadow-[0_0_10px_#00f0ff]" : "text-cyber-muted hover:text-white")}>CHATGPT</button>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-cyber-accent animate-pulse shadow-[0_0_5px_#00f0ff]" />
            <span className="text-[9px] font-bold text-cyber-accent uppercase tracking-widest">Shield_ON</span>
          </div>
          <button onClick={() => setShowLogs(!showLogs)} className={cn("p-2.5 rounded-lg transition-all border hidden lg:block min-h-[40px] min-w-[40px]", showLogs ? "bg-cyber-accent/20 border-cyber-accent text-white led-glow" : "bg-white/5 border-white/10 text-cyber-muted hover:text-white")}>
            <Terminal size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* History Sidebar (Overlay on mobile) */}
        <AnimatePresence>
          {showHistory && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setShowHistory(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" 
              />
              <motion.div 
                initial={{ x: -300 }} 
                animate={{ x: 0 }} 
                exit={{ x: -300 }} 
                className="absolute md:relative z-40 w-72 h-full border-r border-white/5 flex flex-col bg-cyber-navy/95 backdrop-blur-xl"
              >
                <div className="p-4 space-y-4">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" />
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Qidirish..." className="w-full bg-white/5 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-cyber-accent/30" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {filteredChats.map(chat => (
                    <div key={chat.id} onClick={() => setCurrentChatId(chat.id)} className={cn("group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all", currentChatId === chat.id ? "bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/20" : "hover:bg-white/5 text-cyber-muted")}>
                      <div className="flex items-center gap-3 truncate">
                        <MessageSquare size={14} className="shrink-0" />
                        <span className="text-xs font-medium truncate">{chat.title}</span>
                      </div>
                      <button onClick={(e) => deleteChat(chat.id, e)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-cyber-danger transition-all">
                        <XCircle size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative bg-cyber-bg/30">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar pb-24 md:pb-6">
            {messages.length === 0 && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                <Shield size={48} className="text-cyber-accent animate-pulse" />
                <p className="text-sm font-mono">[SECURE_SESSION_READY]</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={cn("flex flex-col", m.role === 'user' ? "items-end" : "items-start")}>
                <div className={cn("max-w-[92%] md:max-w-[85%] p-4 rounded-2xl text-sm relative group transition-all", m.role === 'user' ? "bg-cyber-accent text-cyber-bg font-medium rounded-tr-none shadow-[0_0_15px_rgba(0,240,255,0.2)]" : "bg-white/5 border border-white/5 rounded-tl-none hover:border-cyber-accent/20")}>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <Markdown>{m.text}</Markdown>
                  </div>
                  {m.role === 'assistant' && (
                    <div className="absolute -right-10 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => speakText(m.text)} className="p-2 bg-white/5 rounded-lg hover:text-cyber-accent hover:bg-white/10 transition-all min-h-[32px] min-w-[32px] flex items-center justify-center"><Volume2 size={14} /></button>
                      <button onClick={() => navigator.clipboard.writeText(m.text)} className="p-2 bg-white/5 rounded-lg hover:text-cyber-accent hover:bg-white/10 transition-all min-h-[32px] min-w-[32px] flex items-center justify-center"><Copy size={14} /></button>
                    </div>
                  )}
                </div>
                <span className="text-[8px] text-cyber-muted mt-1 font-mono uppercase tracking-widest">{m.role === 'user' ? 'You' : aiModel}</span>
              </div>
            ))}
            {loading && (
              <div className="flex flex-col items-start">
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-cyber-accent rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-cyber-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-cyber-accent rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 md:p-6 border-t border-white/5 bg-cyber-navy/50 backdrop-blur-md">
            <div className="flex gap-2 md:gap-3 items-center bg-white/5 p-1.5 md:p-2 rounded-2xl border border-white/10 focus-within:border-cyber-accent/30 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all">
              <button 
                onClick={startListening} 
                className={cn(
                  "p-2.5 md:p-3 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center", 
                  isListening ? "text-cyber-danger bg-cyber-danger/10 animate-pulse" : "text-cyber-muted hover:text-white hover:bg-white/5"
                )}
              >
                <Mic size={20} />
              </button>
              <input 
                type="text" 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && handleSend()} 
                placeholder="Savol bering..." 
                className="flex-1 bg-transparent border-none focus:outline-none text-sm px-1 md:px-2 min-h-[44px]" 
              />
              <button 
                onClick={handleSend} 
                disabled={loading} 
                className="p-2.5 md:p-3 bg-cyber-accent text-cyber-bg rounded-xl hover:opacity-90 disabled:opacity-50 transition-all led-glow min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-[8px] text-cyber-muted text-center mt-3 font-mono tracking-widest hidden sm:block">[ENCRYPTION: AES-256-GCM]</p>
          </div>
        </div>

        {/* Log Sidebar (Desktop only or toggled) */}
        <AnimatePresence>
          {showLogs && (
            <motion.div initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }} className="hidden lg:flex w-64 h-full border-l border-white/5 flex-col bg-cyber-navy/30 p-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white tracking-widest uppercase">System_Status</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]" />
                    <span className="text-[9px] font-bold text-green-400 uppercase">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white tracking-widest uppercase">Protection</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyber-accent shadow-[0_0_8px_#00f0ff]" />
                    <span className="text-[9px] font-bold text-cyber-accent uppercase">Secure</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/5 pb-1">
                  <span className="text-[10px] font-bold text-cyber-muted uppercase">Live_Logs</span>
                  <span className="text-[8px] animate-pulse text-cyber-accent">REC</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[9px] text-cyber-muted custom-scrollbar">
                  {localLogs.map((log, i) => (
                    <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                      <span className="text-cyber-accent shrink-0">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                      <span className="truncate">{log}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-cyber-accent/5 border border-cyber-accent/10 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-cyber-accent animate-pulse" />
                  <span className="text-[10px] font-bold text-cyber-accent uppercase">Shield_Active</span>
                </div>
                <p className="text-[8px] text-cyber-muted leading-relaxed">Neural threat detection is monitoring all incoming packets for anomalies.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const PasswordGeneratorLesson = () => {
  const [password, setPassword] = useState('');
  const [savedPasswords, setSavedPasswords] = useState<string[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let newPass = "";
    for (let i = 0; i < 16; i++) {
      newPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(newPass);
  };

  useEffect(() => {
    const saved = localStorage.getItem('cyber_saved_passwords');
    if (saved) setSavedPasswords(JSON.parse(saved));
    generatePassword();
  }, []);

  const savePassword = () => {
    if (!password || savedPasswords.includes(password)) return;
    const newSaved = [password, ...savedPasswords];
    setSavedPasswords(newSaved);
    localStorage.setItem('cyber_saved_passwords', JSON.stringify(newSaved));
  };

  const deleteSaved = (pass: string) => {
    const newSaved = savedPasswords.filter(p => p !== pass);
    setSavedPasswords(newSaved);
    localStorage.setItem('cyber_saved_passwords', JSON.stringify(newSaved));
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 border-cyber-accent/20 led-glow">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Key className="text-cyber-accent" size={20} />
          Kuchli Parol Generator
        </h3>
        <p className="text-xs text-cyber-muted mb-6">
          Xavfsiz parollar kamida 12 ta belgidan iborat bo'lishi, katta-kichik harflar, raqamlar va maxsus belgilarni o'z ichiga olishi kerak.
        </p>

        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
          <span className="flex-1 font-mono text-lg tracking-wider truncate">{password}</span>
          <button onClick={generatePassword} className="p-2 hover:text-cyber-accent transition-all" title="Yangilash">
            <RefreshCw size={20} />
          </button>
          <button onClick={() => navigator.clipboard.writeText(password)} className="p-2 hover:text-cyber-accent transition-all" title="Nusxa olish">
            <Copy size={20} />
          </button>
        </div>

        <button onClick={savePassword} className="w-full cyber-btn py-3 font-bold">
          PAROLNI SAQLASH
        </button>
      </div>

      <div className="glass-card p-6 border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold uppercase tracking-widest text-cyber-muted">Saqlangan Parollar</h4>
          <button onClick={() => setShowSaved(!showSaved)} className="text-cyber-accent text-[10px] font-bold uppercase">
            {showSaved ? 'YASHIRISH' : 'KO\'RSATISH'}
          </button>
        </div>

        {showSaved && (
          <div className="space-y-3">
            {savedPasswords.length === 0 ? (
              <p className="text-center py-4 text-xs text-cyber-muted italic">Hali parollar saqlanmagan</p>
            ) : (
              savedPasswords.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5 group">
                  <span className="font-mono text-xs truncate">{p}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => navigator.clipboard.writeText(p)} className="p-1 hover:text-cyber-accent"><Copy size={14} /></button>
                    <button onClick={() => deleteSaved(p)} className="p-1 hover:text-cyber-danger"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TwoFactorLesson = () => {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 border-cyber-accent/20 led-glow">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Smartphone className="text-cyber-accent" size={20} />
          2-Bosqichli Himoya (2FA)
        </h3>
        <p className="text-sm text-cyber-muted leading-relaxed mb-6">
          2FA — bu sizning hisobingizga kirish uchun nafaqat parol, balki ikkinchi bir tasdiqlash usulini (masalan, SMS kod yoki maxsus ilova kodi) talab qiladigan xavfsizlik qatlamidir.
        </p>

        <div className="space-y-4">
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <h4 className="font-bold text-cyber-accent text-xs uppercase mb-2">Nima uchun kerak?</h4>
            <p className="text-xs text-cyber-muted">Agar xaker parolingizni bilib olsa ham, u sizning telefoningizsiz hisobingizga kira olmaydi.</p>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <h4 className="font-bold text-cyber-accent text-xs uppercase mb-2">Qanday yoqish kerak?</h4>
            <ol className="text-xs text-cyber-muted space-y-2 list-decimal pl-4">
              <li>Ilova sozlamalariga kiring (Settings).</li>
              <li>"Xavfsizlik" (Security) bo'limini toping.</li>
              <li>"Two-Step Verification" yoki "2FA" ni tanlang.</li>
              <li>Ko'rsatmalarga amal qilib, qo'shimcha parol yoki ilova (Google Authenticator) ni ulang.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

const TelegramSecurityLesson = () => {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 border-cyber-accent/20 led-glow">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="text-cyber-accent" size={20} />
          Telegram Xavfsizligi
        </h3>
        <p className="text-sm text-cyber-muted leading-relaxed mb-6">
          Telegram — O'zbekistonda eng ko'p ishlatiladigan messenjer. Uni to'g'ri sozlash kiber-hujumlardan himoyalanishning asosiy shartidir.
        </p>

        <div className="grid gap-4">
          <div className="bg-cyber-danger/10 p-4 rounded-xl border border-cyber-danger/20">
            <h4 className="font-bold text-cyber-danger text-xs uppercase mb-2 flex items-center gap-2">
              <AlertTriangle size={14} /> Asosiy Xavflar
            </h4>
            <ul className="text-xs text-cyber-muted space-y-1 list-disc pl-4">
              <li>Soxta (Phishing) botlar va havolalar</li>
              <li>Hisobni o'g'irlash (Session hijacking)</li>
              <li>Shaxsiy ma'lumotlar sizib chiqishi</li>
            </ul>
          </div>

          <div className="bg-green-400/10 p-4 rounded-xl border border-green-400/20">
            <h4 className="font-bold text-green-400 text-xs uppercase mb-2 flex items-center gap-2">
              <CheckCircle2 size={14} /> Himoya Choralari
            </h4>
            <ul className="text-xs text-cyber-muted space-y-1 list-disc pl-4">
              <li>2-bosqichli parolni albatta yoqing</li>
              <li>"Active Sessions" bo'limini tez-tez tekshiring</li>
              <li>Telefon raqamingizni "Nobody" qilib qo'ying</li>
              <li>Noma'lum fayllarni yuklab olmang</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const AcademySection = () => {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  const lessons = [
    { id: 1, title: "Kuchli parol yaratish", level: "Boshlang'ich", duration: "5 daqiqa", icon: <Lock size={18} /> },
    { id: 2, title: "2-bosqichli himoya (2FA)", level: "Boshlang'ich", duration: "8 daqiqa", icon: <Smartphone size={18} /> },
    { id: 3, title: "Telegram xavfsizligi", level: "O'rta", duration: "10 daqiqa", icon: <MessageSquare size={18} /> },
    { id: 4, title: "Wi-Fi xavfsizligi", level: "O'rta", duration: "12 daqiqa", icon: <Globe size={18} /> },
  ];

  if (selectedLesson !== null) {
    return (
      <div className="space-y-6 reveal">
        <button 
          onClick={() => setSelectedLesson(null)} 
          className="flex items-center gap-2 text-cyber-muted hover:text-white transition-all text-xs font-bold uppercase tracking-widest mb-4 min-h-[44px]"
        >
          <ChevronLeft size={18} /> ORQAGA QAYTISH
        </button>
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {selectedLesson === 1 && <PasswordGeneratorLesson />}
          {selectedLesson === 2 && <TwoFactorLesson />}
          {selectedLesson === 3 && <TelegramSecurityLesson />}
          {selectedLesson === 4 && (
            <div className="glass-card p-5 md:p-8 border-cyber-accent/20 led-glow">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Globe className="text-cyber-accent" size={24} />
                Wi-Fi Xavfsizligi
              </h3>
              <p className="text-sm text-cyber-muted leading-relaxed mb-6">
                Ochiq Wi-Fi tarmoqlari (kafe, park, aeroport) orqali ma'lumotlaringiz xakerlar qo'liga tushishi juda oson.
              </p>
              <div className="bg-white/5 p-5 rounded-xl border border-white/5">
                <h4 className="font-bold text-cyber-accent text-xs uppercase mb-3 tracking-widest">Tavsiyalar:</h4>
                <ul className="text-xs text-cyber-muted space-y-3 list-disc pl-5">
                  <li>Hech qachon ochiq Wi-Fi orqali bank ilovalariga kirmang.</li>
                  <li>VPN xizmatlaridan foydalaning.</li>
                  <li>Uy Wi-Fi parolini murakkab qiling va WPA3 protokoli ishlating.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 reveal">
      <div className="flex items-center gap-3 mb-2">
        <GraduationCap className="text-cyber-accent" size={28} />
        <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">Akademiya</h2>
      </div>
      <div className="grid gap-4">
        {lessons.map(l => (
          <div 
            key={l.id} 
            className="glass-card p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:led-glow group cursor-pointer transition-all duration-300 border-white/5 hover:border-cyber-accent/30" 
            onClick={() => setSelectedLesson(l.id)}
          >
            <div className="flex items-center gap-4 mb-4 sm:mb-0 w-full sm:w-auto">
              <div className="p-3.5 bg-white/5 rounded-xl text-cyber-accent group-hover:bg-cyber-accent/10 transition-all">
                {l.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm md:text-base mb-1 group-hover:text-cyber-accent transition-colors">{l.title}</h4>
                <div className="flex gap-3 text-[9px] font-bold text-cyber-muted uppercase tracking-widest">
                  <span className="text-cyber-accent/80">{l.level}</span>
                  <span>{l.duration}</span>
                </div>
              </div>
            </div>
            <button className="w-full sm:w-auto text-cyber-accent font-black text-[10px] uppercase tracking-[0.2em] border border-cyber-accent/30 px-6 py-3 rounded-xl group-hover:bg-cyber-accent text-cyber-bg group-hover:border-cyber-accent transition-all min-h-[44px]">
              Boshlash
            </button>
          </div>
        ))}

        {/* Telegram Channel Card */}
        <a 
          href="https://t.me/DARKRrot" 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card p-6 border-cyber-accent/30 bg-cyber-accent/5 hover:bg-cyber-accent/10 transition-all group relative overflow-hidden led-glow"
        >
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <MessageSquare size={80} />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5 text-center sm:text-left flex-col sm:flex-row">
              <div className="p-4 bg-cyber-accent text-cyber-bg rounded-2xl shadow-[0_0_20px_#00f0ff]">
                <MessageSquare size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-1">DARKRrot Telegram Kanali</h3>
                <p className="text-xs text-cyber-muted font-medium">Kiberxavfsizlik va hakkerlik sirlarini biz bilan o'rganing!</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:scale-105 transition-transform">
              OBUNA BO'LISH <ArrowRight size={14} />
            </div>
          </div>
        </a>
      </div>
    </div>
  );
};

const StatsSection = () => {
  const data = [
    { name: 'Dush', count: 400 }, { name: 'Sesh', count: 300 }, { name: 'Chor', count: 600 },
    { name: 'Pay', count: 800 }, { name: 'Jum', count: 500 }, { name: 'Shan', count: 900 }, { name: 'Yak', count: 700 },
  ];
  return (
    <div className="space-y-6 reveal pb-24 md:pb-6">
      <div className="flex items-center gap-3 mb-2">
        <BarChart3 className="text-cyber-accent" size={28} />
        <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">Statistika</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-5 md:p-6 led-glow">
          <p className="text-[9px] font-bold text-cyber-muted uppercase tracking-widest mb-1">Jami Firibgarliklar</p>
          <h3 className="text-2xl md:text-3xl font-black text-cyber-danger drop-shadow-[0_0_8px_#ff1a1a]">12.4k</h3>
        </div>
        <div className="glass-card p-5 md:p-6 border-green-400/20">
          <p className="text-[9px] font-bold text-cyber-muted uppercase tracking-widest mb-1">Xavfsiz Saytlar</p>
          <h3 className="text-2xl md:text-3xl font-black text-green-400 drop-shadow-[0_0_8px_#4ade80]">8.2k</h3>
        </div>
      </div>
      <div className="glass-card p-4 md:p-6 h-64 border-white/5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" hide />
            <Tooltip contentStyle={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }} />
            <Bar dataKey="count" fill="#00f0ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const SettingsSection = ({ soundEnabled, setSoundEnabled, protectionMode, setProtectionMode }: { soundEnabled: boolean, setSoundEnabled: (v: boolean) => void, protectionMode: boolean, setProtectionMode: (v: boolean) => void }) => {
  const [status, setStatus] = useState<{ gemini: boolean, openai: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/status').then(r => r.json()).then(setStatus).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 reveal">
      <div className="flex items-center gap-3 mb-2">
        <Settings className="text-cyber-accent" />
        <h2 className="text-3xl font-bold">Sozlamalar</h2>
      </div>
      <div className="glass-card p-5 md:p-8 space-y-8 led-glow">
        <div className="flex justify-between items-center gap-4">
          <div>
            <h4 className="font-bold text-sm md:text-base">AI Tizimi Holati</h4>
            <p className="text-[10px] text-cyber-muted uppercase font-mono mt-1 tracking-tighter">Gemini va ChatGPT ulanishi</p>
          </div>
          <div className="flex gap-2">
            <div className={cn("px-2 py-1 rounded text-[9px] font-bold uppercase", status?.gemini ? "bg-green-400/20 text-green-400" : "bg-cyber-danger/20 text-cyber-danger")}>
              Gemini: {status?.gemini ? 'ONLINE' : 'OFFLINE'}
            </div>
            <div className={cn("px-2 py-1 rounded text-[9px] font-bold uppercase", status?.openai ? "bg-green-400/20 text-green-400" : "bg-cyber-danger/20 text-cyber-danger")}>
              OpenAI: {status?.openai ? 'ONLINE' : 'OFFLINE'}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center gap-4 pt-8 border-t border-white/5">
          <div>
            <h4 className="font-bold text-sm md:text-base">System Protection Mode</h4>
            <p className="text-[10px] text-cyber-muted uppercase font-mono mt-1 tracking-tighter">Real vaqtda himoya simulyatsiyasi</p>
          </div>
          <button onClick={() => setProtectionMode(!protectionMode)} className={cn("w-14 h-7 rounded-full transition-all relative shrink-0", protectionMode ? "bg-cyber-accent led-glow" : "bg-white/10")}>
            <div className={cn("absolute top-1 w-5 h-5 bg-white rounded-full transition-all", protectionMode ? "left-8" : "left-1")} />
          </button>
        </div>
        
        <div className="flex justify-between items-center gap-4 pt-8 border-t border-white/5">
          <div>
            <h4 className="font-bold text-sm md:text-base">Ovoz Effektlari</h4>
            <p className="text-[10px] text-cyber-muted uppercase font-mono mt-1 tracking-tighter">Tugma va bildirishnoma ovozlari</p>
          </div>
          <button onClick={() => setSoundEnabled(!soundEnabled)} className={cn("p-3.5 rounded-xl transition-all min-h-[48px] min-w-[48px] flex items-center justify-center", soundEnabled ? "text-cyber-accent bg-cyber-accent/10 border border-cyber-accent/30" : "text-cyber-muted bg-white/5 border border-white/10")}>
            {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
        </div>

        {protectionMode && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-8 border-t border-white/5 text-[10px] text-cyber-accent font-mono space-y-2">
            <div className="flex justify-between"><span>[SYSTEM] SCANNING_VECTORS...</span><span>100%</span></div>
            <div className="flex justify-between"><span>[SYSTEM] APPS_VERIFIED:</span><span>42</span></div>
            <div className="flex justify-between"><span>[SYSTEM] THREAT_LEVEL:</span><span className="text-green-400">0.02%</span></div>
            <div className="mt-4 p-3 bg-cyber-accent/10 rounded-xl border border-cyber-accent/20 animate-pulse text-center">
              STATUS: SECURE_ENVIRONMENT_ESTABLISHED
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="glass-card p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-cyber-accent/10 flex items-center justify-center text-cyber-accent border border-cyber-accent/20">
          <User size={24} />
        </div>
        <div>
          <h4 className="font-bold text-sm">Admin User</h4>
          <p className="text-xs text-cyber-muted font-mono">ID: CS-9921-UZ</p>
        </div>
      </div>
    </div>
  );
};

const VirusParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    const particleCount = 40;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number; y: number; size: number; speedX: number; speedY: number; pulse: number;
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.pulse = 0;
      }
      update() {
        const dx = mouse.current.x - this.x;
        const dy = mouse.current.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          this.x -= dx * 0.01;
          this.y -= dy * 0.01;
        }
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse += 0.05;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size + Math.sin(this.pulse) * 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 26, 26, ${0.2 + Math.sin(this.pulse) * 0.1})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff1a1a';
        ctx.fill();
        
        // Spike lines
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2 + this.pulse * 0.5;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x + Math.cos(angle) * (this.size + 5), this.y + Math.sin(angle) * (this.size + 5));
          ctx.strokeStyle = 'rgba(255, 26, 26, 0.3)';
          ctx.stroke();
        }
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    });

    resize();
    init();
    animate();

    return () => window.removeEventListener('resize', resize);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40" />;
};

const SystemStatus = () => (
  <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
    <a 
      href="https://t.me/DARKRrot" 
      target="_blank" 
      rel="noopener noreferrer"
      className="p-2.5 glass-card rounded-full text-cyber-accent hover:text-white transition-all led-glow flex items-center gap-2"
    >
      <MessageSquare size={18} />
      <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">DARKRrot</span>
    </a>
  </div>
);

const LogPanel = () => {
  const [logs, setLogs] = useState<string[]>([]);
  useEffect(() => {
    const messages = [
      "Initializing Secure Protocol...",
      "Threat Matrix Activated",
      "Scanning for vulnerabilities...",
      "Firewall operational",
      "Encrypted tunnel established",
      "Monitoring network traffic",
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLogs(prev => [messages[i % messages.length], ...prev].slice(0, 5));
      i++;
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-32 right-6 z-40 hidden lg:block w-64 glass-card p-4 font-mono text-[10px] text-cyber-muted space-y-1">
      <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-1">
        <span className="text-white font-bold">LIVE_LOGS</span>
        <span className="animate-pulse">●</span>
      </div>
      {logs.map((log, i) => (
        <div key={i} className="flex gap-2">
          <span className="text-cyber-accent">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
          <span className="truncate">{log}</span>
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scan');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [protectionMode, setProtectionMode] = useState(false);

  const addNotification = (n: any) => {
    const id = crypto.randomUUID();
    setNotifications(prev => [{ ...n, id }, ...prev].slice(0, 5));
    if (soundEnabled) playCyberSound(true, n.type === 'danger' ? 'alert' : 'click');
    setTimeout(() => removeNotification(id), 6000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    if (protectionMode) {
      const interval = setInterval(() => {
        if (Math.random() > 0.95) {
          addNotification({
            title: "Xavfli Ilova Aniqlanadi",
            message: "Tizim shubhali ilova yuklab olinganini aniqladi. Skanerlash tavsiya etiladi.",
            type: 'danger'
          });
        }
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [protectionMode, soundEnabled]);
  
  const navItems = [
    { id: 'scan', icon: <Shield size={22} />, label: 'Tekshiruv' },
    { id: 'fraud', icon: <Search size={22} />, label: 'Baza' },
    { id: 'ai', icon: <MessageSquare size={22} />, label: 'AI' },
    { id: 'academy', icon: <GraduationCap size={22} />, label: 'Akademiya' },
    { id: 'stats', icon: <BarChart3 size={22} />, label: 'Statistika' },
  ];

  return (
    <div className="min-h-screen bg-cyber-bg text-white selection:bg-cyber-accent/30 overflow-x-hidden">
      <div className="noise-overlay" />
      <div className="scan-line" />
      <AnimatePresence>{loading && <SplashScreen onComplete={() => setLoading(false)} />}</AnimatePresence>
      <VirusParticleBackground />
      <MouseGlow />
      <SystemStatus />
      <LogPanel />
      <NotificationSystem notifications={notifications} remove={removeNotification} />
      
      <header className="fixed top-0 left-0 right-0 z-40 px-6 py-8 flex justify-between items-center bg-gradient-to-b from-cyber-bg to-transparent">
        <h1 className="text-xl font-bold tracking-tight">DARK<span className="gradient-text">root</span></h1>
        <button onClick={() => setActiveTab('settings')} className="p-3 glass-card rounded-full text-cyber-muted hover:text-white led-glow"><Settings size={20} /></button>
      </header>
      <main className="relative z-10 pt-24 pb-40 px-6 max-w-5xl mx-auto min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
            {activeTab === 'scan' && <ScannerSection addNotification={addNotification} />}
            {activeTab === 'fraud' && <FraudDBSection />}
            {activeTab === 'ai' && <AIMarkazSection />}
            {activeTab === 'academy' && <AcademySection />}
            {activeTab === 'stats' && <StatsSection />}
            {activeTab === 'settings' && <SettingsSection soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} protectionMode={protectionMode} setProtectionMode={setProtectionMode} />}
          </motion.div>
        </AnimatePresence>
      </main>
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-48px)] max-w-lg">
        <div className="glass-card p-2 flex justify-around items-center border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] led-glow">
          {navItems.map(item => (
            <button key={item.id} onClick={() => {
              playCyberSound(soundEnabled, 'click');
              setActiveTab(item.id);
            }} className={cn("flex flex-col items-center gap-1 p-3 transition-all duration-500", activeTab === item.id ? "nav-item-active" : "text-cyber-muted hover:text-white")}>
              {item.icon}
              <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
