"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Sparkles, 
  ArrowLeft, 
  RotateCcw, 
  CheckCircle2, 
  ExternalLink, 
  History, 
  Send, 
  Loader2 
} from "lucide-react";
import { useVendorStore } from "@/context/VendorStoreContext";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  patchApplied?: boolean;
}

interface Version {
  id: string;
  versionNumber: number;
  operationType: string;
  timestamp: Date;
}

function StoreBuilderChatContent() {
  const { activeStore, stores } = useVendorStore();
  const searchParams = useSearchParams();
  const queryStoreId = searchParams.get("storeId");
  const storeId = queryStoreId || activeStore?.id || "default-store";
  const currentStore = stores.find((s) => s.id === storeId || s.slug === storeId) || activeStore;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      role: "ai",
      content: "Hi there! I'm your AI Store Assistant. I can help you modify your store design, update content, change colors, or add new sections. What would you like to change today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [storeData, setStoreData] = useState({
    name: currentStore?.name || "My Store",
    status: (currentStore as any)?.status || "published",
    slug: currentStore?.slug || "store"
  });

  useEffect(() => {
    if (currentStore) {
      setStoreData({
        name: currentStore.name || "My Store",
        status: (currentStore as any).status || "published",
        slug: currentStore.slug || "store"
      });
    }
  }, [currentStore]);

  // Load versions
  useEffect(() => {
    const fetchVersions = async () => {
      setVersions([
        {
          id: "v3",
          versionNumber: 3,
          operationType: "Added Custom Promo Banner",
          timestamp: new Date(Date.now() - 1000 * 60 * 10)
        },
        {
          id: "v2",
          versionNumber: 2,
          operationType: "Updated Theme Colors to Purple & Rose Pink",
          timestamp: new Date(Date.now() - 1000 * 60 * 30)
        },
        {
          id: "v1",
          versionNumber: 1,
          operationType: "Initial AI Store Generation",
          timestamp: new Date(Date.now() - 1000 * 60 * 60)
        }
      ]);
    };

    fetchVersions();
  }, [storeId]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1500));
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: `I've updated the store based on your request: "${userMsg.content}". The changes have been applied successfully.`,
        timestamp: new Date(),
        patchApplied: true
      };

      setMessages(prev => [...prev, aiMsg]);
      
      // Add new version
      setVersions(prev => [
        {
          id: `v${prev.length + 1}`,
          versionNumber: prev.length + 1,
          operationType: "AI Editor Update",
          timestamp: new Date()
        },
        ...prev
      ]);
      
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndo = async (versionNumber: number) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    
    const sysMsg: Message = {
      id: Date.now().toString(),
      role: "ai",
      content: `I have restored the store back to Version ${versionNumber}.`,
      timestamp: new Date(),
      patchApplied: true
    };
    
    setMessages(prev => [...prev, sysMsg]);
    setIsLoading(false);
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-800 flex flex-col overflow-hidden font-sans">
      {/* Top Header */}
      <header className="h-16 bg-card border-b border-default flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 shadow-2xs">
        <div className="flex items-center gap-4">
          <Link href="/my-stores" className="p-2 -ml-2 hover:bg-neutral-100 rounded-xl text-subtle hover:text-heading transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="font-extrabold text-base sm:text-lg text-heading font-display">AI Store Editor</h1>
          </div>
          <div className="h-4 w-px bg-neutral-200 hidden sm:block mx-2"></div>
          <span className="text-body font-bold text-xs">{storeData.name}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => versions.length > 0 && handleUndo(versions[1]?.versionNumber || 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-heading bg-neutral-100 hover:bg-neutral-200 rounded-xl border border-default transition-all active:scale-95 cursor-pointer"
            title="Undo Last Action"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undo</span>
          </button>
          
          <a 
            href={`/store/${storeData.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-extrabold text-white bg-gradient-to-r from-accent-500 to-accent-600 hover:brightness-110 rounded-xl shadow-xs transition-all active:scale-95"
          >
            <span>Live Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Main Workspace: Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Chat Interface */}
        <div className="w-full lg:w-5/12 flex flex-col bg-card border-r border-default">
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isAi = msg.role === "ai";
              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 ${isAi ? "items-start" : "items-start flex-row-reverse"}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                    isAi 
                      ? "bg-primary-50 text-primary-700 border border-primary-200" 
                      : "bg-accent-500 text-white"
                  }`}>
                    {isAi ? <Sparkles className="w-4 h-4" /> : <div className="text-xs font-extrabold">You</div>}
                  </div>
                  
                  <div className={`max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm shadow-xs ${
                    isAi 
                      ? "bg-neutral-50 text-heading border border-default" 
                      : "bg-gradient-to-br from-primary-600 to-primary-700 text-white"
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    
                    {msg.patchApplied && (
                      <div className="mt-3 pt-2.5 border-t border-neutral-200/80 flex items-center gap-1.5 text-xs font-bold text-success-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-success-600" />
                        <span>Changes applied to storefront</span>
                      </div>
                    )}
                    
                    <span className={`block text-[10px] mt-1.5 text-right ${isAi ? "text-subtle" : "text-white/75"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 border border-primary-200 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-neutral-50 border border-default rounded-2xl p-4 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                  <span className="text-xs text-subtle font-medium">Generating updates...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Suggestions */}
          <div className="px-4 py-2 bg-slate-50 border-t border-default flex gap-2 overflow-x-auto text-xs">
            {[
              "Change hero background to dark gold",
              "Add a 20% discount coupon banner",
              "Make CTA button larger",
              "Show 4 products per row",
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => setInputText(prompt)}
                className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-card hover:bg-neutral-100 text-subtle hover:text-heading border border-default transition-colors text-xs font-medium cursor-pointer shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 bg-card border-t border-default flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tell AI what to change in your store..."
              className="flex-1 bg-neutral-50 border border-default rounded-xl px-4 py-2.5 text-xs sm:text-sm text-heading placeholder:text-subtle focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white disabled:opacity-40 hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Side: Live Storefront Preview */}
        <div className="hidden lg:flex flex-1 flex-col bg-slate-100 border-l border-default overflow-hidden">
          {/* Browser Mockup Bar */}
          <div className="h-10 bg-card border-b border-default px-4 flex items-center justify-between text-xs text-subtle">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-error-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-warning-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-success-400" />
              </div>
              <span className="font-mono text-[11px] ml-2 text-subtle">
                https://{storeData.slug}.digishop.ai
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-[11px] font-bold text-success-700 bg-success-50 px-2 py-0.5 rounded-md border border-success-200">
              <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse"></span>
              Live Sync
            </div>
          </div>

          {/* Iframe View */}
          <div className="flex-1 p-4 overflow-hidden">
            <iframe 
              src={`/store/${storeData.slug}`} 
              className="w-full h-full rounded-2xl bg-card border border-default shadow-md"
              title="Storefront Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoreBuilderChatPage() {
  return (
    <React.Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
            <span>Loading AI Store Editor...</span>
          </div>
        </div>
      }
    >
      <StoreBuilderChatContent />
    </React.Suspense>
  );
}
