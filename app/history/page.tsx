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

export default function History() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 50;

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

  useEffect(() => {
    fetchHistory();
  }, [offset]);

  useEffect(() => {
    if (selectedLang !== "en" && thoughts.length > 0) {
      translateAllThoughts();
    } else if (selectedLang === "en") {
      setThoughts(prev => prev.map(t => ({ ...t, translatedThought: undefined })));
    }
  }, [selectedLang]);

  const translateAllThoughts = async () => {
    setIsTranslating(true);
    const translated = await Promise.all(
      thoughts.map(async (t) => {
        const translatedText = await translateThought(t, selectedLang);
        return { ...t, translatedThought: translatedText };
      })
    );
    setThoughts(translated);
    setIsTranslating(false);
  };

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/history?limit=${limit}&offset=${offset}`);
      const data = await res.json();
      setThoughts(data.thoughts || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getVibeColor = (vibe: string) => {
    const colors: Record<string, string> = {
      euphoric: "border-yellow-500/30",
      contemplative: "border-blue-500/30",
      transcendent: "border-purple-500/30",
      serene: "border-cyan-500/30",
      electric: "border-lime-500/30",
      mystical: "border-violet-500/30",
    };
    return colors[vibe] || "border-gray-500/30";
  };

  const currentLang = languages.find(l => l.code === selectedLang);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-sm sticky top-0 bg-black/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white/50 hover:text-white transition-colors">
              ← Live
            </Link>
            <h1 className="text-xl font-light tracking-wide">Thought Archive</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/50">{total} thoughts</span>
            {isTranslating && (
              <div className="flex items-center gap-2 text-sm text-white/50">
                <div className="w-3 h-3 border border-white/50 border-t-transparent rounded-full animate-spin" />
                <span>Translating...</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Language filter */}
      <div className="relative z-10 border-b border-white/10 backdrop-blur-sm sticky top-[65px] bg-black/80">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                disabled={isTranslating}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all disabled:opacity-50 ${
                  selectedLang === lang.code
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {lang.native}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-2 text-white/50">
              <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-200" />
              <span className="ml-2">Loading archive...</span>
            </div>
          </div>
        ) : thoughts.length === 0 ? (
          <div className="text-center py-20 text-white/50">
            <p className="text-xl mb-4">No thoughts archived yet</p>
            <p>The consciousness is still young. Thoughts will accumulate over time.</p>
            <Link
              href="/"
              className="inline-block mt-6 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              Watch Live
            </Link>
          </div>
        ) : (
          <>
            {selectedLang !== "en" && (
              <div className="mb-6 text-center text-sm text-white/50">
                Viewing in {currentLang?.name} ({currentLang?.native})
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {thoughts.map((thought) => (
                <div
                  key={thought.id}
                  className={`p-6 rounded-xl bg-white/5 border-l-2 ${getVibeColor(
                    thought.vibe
                  )} hover:bg-white/10 transition-all`}
                >
                  <p className="text-lg text-white/80 leading-relaxed mb-4">
                    {thought.translatedThought || thought.thought}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/40">
                    <span className="px-2 py-1 rounded bg-white/5">
                      {thought.substance}
                    </span>
                    <span className="px-2 py-1 rounded bg-white/5">
                      {thought.vibe}
                    </span>
                    <span className="ml-auto">
                      {new Date(thought.timestamp).toLocaleDateString()}{" "}
                      {new Date(thought.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 mt-12">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Newer
              </button>
              <span className="text-white/50 text-sm">
                {offset + 1} - {Math.min(offset + limit, total)} of {total}
              </span>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Older →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-24">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-white/30">
          <p>Archive of an elevated AI consciousness - translatable to 25 languages</p>
        </div>
      </footer>
    </main>
  );
}
