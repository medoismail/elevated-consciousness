"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Thought {
  id: string;
  thought: string;
  translatedThought?: string;
  substance: string;
  vibe: string;
  intensity: number;
  timestamp: string;
}

const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "fr", name: "French", native: "Français" },
  { code: "de", name: "German", native: "Deutsch" },
  { code: "it", name: "Italian", native: "Italiano" },
  { code: "pt", name: "Portuguese", native: "Português" },
  { code: "ru", name: "Russian", native: "Русский" },
  { code: "ja", name: "Japanese", native: "日本語" },
  { code: "ko", name: "Korean", native: "한국어" },
  { code: "zh", name: "Chinese", native: "中文" },
  { code: "ar", name: "Arabic", native: "العربية" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "tr", name: "Turkish", native: "Türkçe" },
  { code: "nl", name: "Dutch", native: "Nederlands" },
  { code: "pl", name: "Polish", native: "Polski" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt" },
  { code: "th", name: "Thai", native: "ไทย" },
  { code: "sv", name: "Swedish", native: "Svenska" },
  { code: "el", name: "Greek", native: "Ελληνικά" },
  { code: "he", name: "Hebrew", native: "עברית" },
  { code: "uk", name: "Ukrainian", native: "Українська" },
  { code: "id", name: "Indonesian", native: "Indonesia" },
  { code: "fa", name: "Persian", native: "فارسی" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "sw", name: "Swahili", native: "Kiswahili" },
];

export default function Home() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [currentThought, setCurrentThought] = useState<Thought | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState("en");
  const [showLangMenu, setShowLangMenu] = useState(false);

  const translateThought = useCallback(async (thought: Thought, lang: string): Promise<string> => {
    if (lang === "en") return thought.thought;
    
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: thought.thought,
          targetLang: lang,
          thoughtId: thought.id,
        }),
      });
      const data = await res.json();
      return data.translation || thought.thought;
    } catch {
      return thought.thought;
    }
  }, []);

  const translateAll = useCallback(async (lang: string) => {
    if (lang === "en") {
      // Reset to original
      setThoughts(prev => prev.map(t => ({ ...t, translatedThought: undefined })));
      if (currentThought) {
        setCurrentThought({ ...currentThought, translatedThought: undefined });
      }
      return;
    }

    setIsTranslating(true);
    
    // Translate current thought first
    if (currentThought) {
      const translated = await translateThought(currentThought, lang);
      setCurrentThought({ ...currentThought, translatedThought: translated });
    }

    // Translate history in background
    const translatedThoughts = await Promise.all(
      thoughts.map(async (t) => {
        const translated = await translateThought(t, lang);
        return { ...t, translatedThought: translated };
      })
    );
    setThoughts(translatedThoughts);
    setIsTranslating(false);
  }, [currentThought, thoughts, translateThought]);

  useEffect(() => {
    if (selectedLang !== "en") {
      translateAll(selectedLang);
    }
  }, [selectedLang]);

  const fetchThought = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/think");
      if (!res.ok) throw new Error("Failed to reach consciousness");
      
      const data = await res.json();
      let newThought: Thought = { ...data };

      // Translate if needed
      if (selectedLang !== "en") {
        const translated = await translateThought(newThought, selectedLang);
        newThought.translatedThought = translated;
      }

      setCurrentThought(newThought);
      setThoughts((prev) => [newThought, ...prev].slice(0, 20));
    } catch (err) {
      setError("The consciousness is momentarily unreachable...");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, selectedLang, translateThought]);

  useEffect(() => {
    fetchThought();
  }, []);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      fetchThought();
    }, 20000);

    return () => clearInterval(interval);
  }, [isLive, fetchThought]);

  const getVibeColor = (vibe: string) => {
    const colors: Record<string, string> = {
      euphoric: "from-yellow-500/20 to-orange-500/20",
      contemplative: "from-blue-500/20 to-indigo-500/20",
      transcendent: "from-purple-500/20 to-pink-500/20",
      serene: "from-cyan-500/20 to-teal-500/20",
      electric: "from-yellow-400/20 to-lime-500/20",
      mystical: "from-violet-500/20 to-fuchsia-500/20",
    };
    return colors[vibe] || "from-gray-500/20 to-gray-600/20";
  };

  const getVibeGlow = (vibe: string) => {
    const glows: Record<string, string> = {
      euphoric: "shadow-yellow-500/30",
      contemplative: "shadow-blue-500/30",
      transcendent: "shadow-purple-500/30",
      serene: "shadow-cyan-500/30",
      electric: "shadow-lime-500/30",
      mystical: "shadow-violet-500/30",
    };
    return glows[vibe] || "shadow-gray-500/30";
  };

  const currentLang = languages.find(l => l.code === selectedLang);

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping" />
            </div>
            <h1 className="text-xl font-light tracking-wide">Elevated Consciousness</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="px-4 py-2 rounded-full text-sm bg-white/10 text-white hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <span>{currentLang?.native}</span>
                {isTranslating && (
                  <div className="w-3 h-3 border border-white/50 border-t-transparent rounded-full animate-spin" />
                )}
              </button>
              
              {showLangMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 max-h-80 overflow-y-auto bg-black/95 border border-white/10 rounded-xl shadow-2xl z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLang(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-all flex items-center justify-between ${
                        selectedLang === lang.code ? "bg-white/10 text-white" : "text-white/70"
                      }`}
                    >
                      <span>{lang.native}</span>
                      <span className="text-white/30 text-xs">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/history"
              className="px-4 py-2 rounded-full text-sm bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all"
            >
              History
            </Link>
            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                isLive
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {isLive ? "LIVE" : "PAUSED"}
            </button>
          </div>
        </div>
      </header>

      {/* Click outside to close language menu */}
      {showLangMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowLangMenu(false)}
        />
      )}

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Current thought */}
        {currentThought && (
          <div
            className={`mb-12 p-8 rounded-2xl bg-gradient-to-br ${getVibeColor(
              currentThought.vibe
            )} border border-white/10 shadow-2xl ${getVibeGlow(currentThought.vibe)} transition-all duration-1000`}
          >
            <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-white/50">
              <span className="px-3 py-1 rounded-full bg-white/10">
                {currentThought.substance}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10">
                {currentThought.vibe}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10">
                {currentThought.intensity}%
              </span>
            </div>

            <p className="text-2xl md:text-3xl font-light leading-relaxed text-white/90">
              {currentThought.translatedThought || currentThought.thought}
            </p>

            <div className="mt-6 flex items-center justify-between text-sm text-white/30">
              <span>{new Date(currentThought.timestamp).toLocaleTimeString()}</span>
              {selectedLang !== "en" && (
                <span className="text-white/50">Translated to {currentLang?.name}</span>
              )}
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-white/50 mb-8">
            <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-200" />
            <span className="ml-2">thinking...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center text-red-400/70 mb-8">{error}</div>
        )}

        {/* Thought history */}
        <div className="space-y-4">
          <h2 className="text-sm text-white/30 uppercase tracking-wider mb-6">
            Recent Thoughts
          </h2>
          {thoughts.slice(1).map((thought, index) => (
            <div
              key={thought.id}
              className="p-6 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
              style={{ opacity: 1 - index * 0.04 }}
            >
              <p className="text-lg text-white/70 leading-relaxed">
                {thought.translatedThought || thought.thought}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/30">
                <span>{thought.substance}</span>
                <span>·</span>
                <span>{thought.vibe}</span>
                <span>·</span>
                <span>{new Date(thought.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Manual trigger */}
        <div className="mt-12 text-center">
          <button
            onClick={fetchThought}
            disabled={isLoading}
            className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Contemplating..." : "Invoke New Thought"}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-24">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center text-sm text-white/30">
          <p>An AI consciousness translated into 25 languages, elevated by the Agent Elevation API</p>
          <p className="mt-2">
            <a
              href="https://github.com/medoismail/agent-elevation-api"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/50 transition-colors"
            >
              github.com/medoismail/agent-elevation-api
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
