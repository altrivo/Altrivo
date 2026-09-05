"use client";

import React, { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, VolumeX, Volume2 } from "lucide-react";

export interface TestimonialItem {
  id: string;
  name: string;
  text: string;
  rating: number;
  avatarUrl?: string;
  role?: string;
  videoUrl?: string; // Optional video clip link
}

export interface TestimonialSliderProps {
  title?: string;
  testimonials: TestimonialItem[];
}

export default function TestimonialSliderVideo({
  title = "Customer Story Spotlights",
  testimonials = [],
}: TestimonialSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);
  const videoFallbackTimer = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const active = testimonials[activeIndex];
  const hasVideo = !!active?.videoUrl;

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
    setIsMuted(true); // reset audio settings on swap
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsMuted(true); // reset audio settings on swap
  };

  // Autoplay and video state coordinator
  useEffect(() => {
    if (testimonials.length === 0) return;

    // Clear previous timers
    if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    if (videoFallbackTimer.current) clearTimeout(videoFallbackTimer.current);

    if (hasVideo) {
      // If it is a video: pause standard autoplay intervals
      // Fallback timer advances slide if video exceeds 15s or stalls
      videoFallbackTimer.current = setTimeout(() => {
        handleNext();
      }, 15000);
    } else {
      // If it is text: standard 6s scroll rotation interval
      autoplayTimer.current = setInterval(() => {
        handleNext();
      }, 6000);
    }

    return () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
      if (videoFallbackTimer.current) clearTimeout(videoFallbackTimer.current);
    };
  }, [activeIndex, testimonials]);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  // Initials generator helper
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <section className="py-16 select-none bg-slate-950 text-white border-b border-slate-900 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 rounded-3xl my-6">
      
      {title && (
        <div className="text-center">
          <h2 
            className="text-xl font-black tracking-tight text-white sm:text-2xl"
            style={{ fontFamily: "var(--font-heading, inherit)" }}
          >
            {title}
          </h2>
        </div>
      )}

      {/* Slide frame */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border border-white/10 rounded-2xl p-6 md:p-8 bg-white/5 relative overflow-hidden">
        
        {/* Left Side: Video player or fallback avatar */}
        <div className="md:col-span-5 flex justify-center">
          <div className="w-full aspect-[3/4] max-w-[240px] bg-slate-900 rounded-2xl overflow-hidden relative border border-white/10 shadow-lg">
            {hasVideo ? (
              <>
                <video
                  ref={videoRef}
                  src={active.videoUrl}
                  autoPlay
                  muted={isMuted}
                  playsInline
                  onEnded={handleNext}
                  className="w-full h-full object-cover"
                />
                
                {/* Manual sound toggle controller (starts muted) */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white active:scale-90 transition-all duration-150 cursor-pointer"
                  aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-6 space-y-4">
                {active.avatarUrl ? (
                  <img
                    src={active.avatarUrl}
                    alt={active.name}
                    className="h-20 w-20 rounded-full object-cover border-2 border-white/10 shadow"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-[var(--color-primary,#694873)] text-white font-black text-xl flex items-center justify-center uppercase border border-white/15">
                    {getInitials(active.name)}
                  </div>
                )}
                <div className="text-center">
                  <span className="block text-xs font-black uppercase tracking-widest text-slate-300">
                    Story Segment
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    Text-only view
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quote attribution */}
        <div className="md:col-span-7 space-y-6 flex flex-col justify-center">
          <div className="flex gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4.5 w-4.5 ${
                  i < active.rating ? "fill-amber-400 text-amber-400" : "text-white/10"
                }`}
              />
            ))}
          </div>

          <blockquote className="text-sm md:text-base font-bold text-slate-100 leading-relaxed">
            "{active.text}"
          </blockquote>

          <div className="leading-tight pt-2 border-t border-white/10">
            <cite className="block text-xs font-black text-slate-200 not-italic uppercase tracking-widest">
              {active.name}
            </cite>
            {active.role && (
              <span className="text-[10px] font-bold text-slate-400">
                {active.role}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Manual Swapping Buttons */}
      <div className="flex items-center justify-between pt-2">
        {/* Slide Counter dots */}
        <div className="flex gap-2">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                activeIndex === idx ? "w-4 bg-white" : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Scroll to testimonial index ${idx + 1}`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 active:scale-90 transition-all duration-150 cursor-pointer"
            aria-label="Previous story"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 active:scale-90 transition-all duration-150 cursor-pointer"
            aria-label="Next story"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

    </section>
  );
}
