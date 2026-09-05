"use client";

import React, { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

export interface TestimonialItem {
  id: string;
  name: string;
  text: string;
  rating: number;
  avatarUrl?: string;
  role?: string;
}

export interface TestimonialSliderProps {
  title?: string;
  testimonials: TestimonialItem[];
  layout?: "carousel" | "masonry";
}

export default function TestimonialSlider({
  title = "What Our Customers Say",
  testimonials = [],
  layout = "carousel",
}: TestimonialSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const activeTestimonial = testimonials[activeIndex];

  // Helper to render rating stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, idx) => {
      const isFilled = idx < Math.floor(rating);
      return (
        <Star
          key={idx}
          className={`h-4 w-4 ${
            isFilled ? "fill-amber-400 text-amber-500" : "text-slate-200"
          }`}
        />
      );
    });
  };

  return (
    <section className="py-16 select-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 overflow-hidden">
      {/* Title */}
      {title && (
        <div className="text-center">
          <h2
            className="text-2xl font-bold tracking-tight text-[var(--color-text,#1e293b)] sm:text-3xl"
            style={{ fontFamily: "var(--font-heading, inherit)" }}
          >
            {title}
          </h2>
        </div>
      )}

      {layout === "carousel" ? (
        // Carousel Layout
        <div className="relative max-w-3xl mx-auto bg-slate-50/50 border border-slate-200/50 rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-6">
          {/* Quote Mark Decoration */}
          <div className="flex justify-center text-[var(--color-secondary,#d97706)] opacity-10">
            <Quote className="h-16 w-16 rotate-180 transform" />
          </div>

          {/* Testimonial Quote Text */}
          <p className="text-lg sm:text-xl text-slate-600 italic leading-relaxed">
            "{activeTestimonial.text}"
          </p>

          {/* User Profile Info */}
          <div className="flex flex-col items-center space-y-3">
            {activeTestimonial.avatarUrl ? (
              <img
                src={activeTestimonial.avatarUrl}
                alt={activeTestimonial.name}
                className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-xs"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-[var(--color-primary,#0f172a)] text-white font-extrabold flex items-center justify-center text-lg shadow-xs">
                {activeTestimonial.name.charAt(0)}
              </div>
            )}

            <div>
              <h4 className="font-extrabold text-sm text-[var(--color-text,#1e293b)]">
                {activeTestimonial.name}
              </h4>
              {activeTestimonial.role && (
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {activeTestimonial.role}
                </span>
              )}
            </div>

            {/* Stars */}
            <div className="flex gap-0.5 justify-center">
              {renderStars(activeTestimonial.rating)}
            </div>
          </div>

          {/* Nav Controls */}
          {testimonials.length > 1 && (
            <>
              {/* Arrows */}
              <div className="absolute inset-y-0 -left-4 sm:-left-16 flex items-center">
                <button
                  onClick={handlePrev}
                  className="p-3 rounded-full border border-slate-200 bg-white shadow-xs text-slate-500 hover:text-[var(--color-primary,#0f172a)] transition-all hover:bg-slate-50 cursor-pointer active:scale-90"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
              <div className="absolute inset-y-0 -right-4 sm:-right-16 flex items-center">
                <button
                  onClick={handleNext}
                  className="p-3 rounded-full border border-slate-200 bg-white shadow-xs text-slate-500 hover:text-[var(--color-primary,#0f172a)] transition-all hover:bg-slate-50 cursor-pointer active:scale-90"
                  aria-label="Next review"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Dot Indicators */}
              <div className="flex justify-center gap-1.5 pt-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeIndex
                        ? "w-6 bg-[var(--color-primary,#0f172a)]"
                        : "w-2 bg-slate-200 hover:bg-slate-300"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        // Masonry/Grid Layout
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-sm transition-all duration-300"
            >
              <div className="space-y-3">
                {/* Rating Stars */}
                <div className="flex gap-0.5">{renderStars(item.rating)}</div>
                
                {/* Review Quote */}
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  "{item.text}"
                </p>
              </div>

              {/* Profile Details */}
              <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                {item.avatarUrl ? (
                  <img
                    src={item.avatarUrl}
                    alt={item.name}
                    className="h-10 w-10 rounded-full object-cover border border-white shadow-2xs"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-[var(--color-primary,#0f172a)] text-white font-extrabold flex items-center justify-center text-sm shadow-2xs">
                    {item.name.charAt(0)}
                  </div>
                )}

                <div>
                  <h4 className="font-extrabold text-xs text-[var(--color-text,#1e293b)]">
                    {item.name}
                  </h4>
                  {item.role && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {item.role}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
