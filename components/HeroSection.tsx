"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroSlide {
  id: string;
  src: string;
  alt: string;
  bgColor: string;
}

const SLIDE_DURATION = 5500; // 5.5 seconds per slide

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "jewellery",
    src: "/images/hero-jewellery-banner.jpg",
    alt: "Insha Collections - Anti Tarnish Jewellery - Elegance That Lasts",
    bgColor: "#FAF5EE",
  },
  {
    id: "korean",
    src: "/images/hero-korean-banner.jpg",
    alt: "Insha Collections - Korean Collection - Trendy. Stylish. Effortless.",
    bgColor: "#FAF5EE",
  },
  {
    id: "dresses",
    src: "/images/hero-dresses-banner.jpg",
    alt: "Insha Collections - Readymade Collection - Style That Fits You",
    bgColor: "#F8F3EC",
  },
  {
    id: "handlooms",
    src: "/images/hero-handlooms-banner.jpg",
    alt: "Insha Collections - Handloom Collection - Timeless Weaves. Timeless Homes.",
    bgColor: "#F7F1E8",
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
  }),
  center: {
    x: "0%",
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
  }),
};

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [slideKey, setSlideKey] = useState(0);

  // Touch Swipe Handling for Mobile
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef(false);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    setSlideKey((k) => k + 1);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    setSlideKey((k) => k + 1);
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      if (index === currentSlide) return;
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
      setSlideKey((k) => k + 1);
    },
    [currentSlide]
  );

  // Autoplay Timer (5.5s)
  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [nextSlide, isHovered, slideKey]);

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = touchStartX.current - e.touches[0].clientX;
    const diffY = touchStartY.current - e.touches[0].clientY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const minSwipeDistance = 40;

    if (isSwiping.current && Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    isSwiping.current = false;
  };

  const currentSlideData = HERO_SLIDES[currentSlide];

  return (
    <section
      className="w-full relative overflow-hidden select-none group transition-colors duration-700 ease-out"
      style={{ backgroundColor: currentSlideData.bgColor }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Hero Collections Showcase"
    >
      <div className="w-full relative max-w-[1920px] mx-auto">
        {/* Compact, balanced height (max 480-515px on desktop) */}
        <div className="relative w-full aspect-[16/8.2] sm:aspect-[16/7.8] md:aspect-[16/7.2] lg:aspect-[16/6.8] min-h-[230px] sm:min-h-[310px] md:min-h-[390px] lg:min-h-[450px] max-h-[515px] overflow-hidden">
          {/* Horizontal Slide Carousel Track */}
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.7 },
              }}
              className="absolute inset-0 w-full h-full"
            >
              <div className="relative w-full h-full">
                <Image
                  src={currentSlideData.src}
                  alt={currentSlideData.alt}
                  fill
                  priority={currentSlide === 0}
                  quality={100}
                  className="object-cover object-center pointer-events-none"
                  sizes="(max-width: 1920px) 100vw, 1920px"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Minimalist Slide Indicators with Progress (Bottom-Center) */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 rounded-full bg-[#231610]/45 backdrop-blur-md border border-[#C5A47E]/30 shadow-sm">
            {HERO_SLIDES.map((slide, index) => {
              const isActive = index === currentSlide;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}: ${slide.id}`}
                  className="group relative h-1.5 sm:h-2 rounded-full overflow-hidden transition-all duration-300 ease-out focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A47E]"
                  style={{ width: isActive ? "28px" : "8px" }}
                >
                  {/* Indicator Background Track */}
                  <div className="absolute inset-0 bg-[#FAF7F3]/30 group-hover:bg-[#FAF7F3]/60 transition-colors" />

                  {/* Active Slide Gold Progress Fill */}
                  {isActive && (
                    <motion.div
                      key={`progress-${slideKey}`}
                      className="absolute inset-0 bg-gradient-to-r from-[#DFCAAD] via-[#C5A47E] to-[#A57D4E] rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{
                        duration: isHovered ? 0 : SLIDE_DURATION / 1000,
                        ease: "linear",
                      }}
                      style={{ originX: 0 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Polished Navigation Arrows (Desktop & Tablet) */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous banner"
            className="group/btn absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-[#231610]/35 hover:bg-[#231610]/80 text-[#FAF7F3] hover:text-[#C5A47E] border border-[#C5A47E]/35 hover:border-[#C5A47E] backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 sm:opacity-75 focus:opacity-100 shadow-md hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.6] transition-transform duration-200 group-hover/btn:-translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next banner"
            className="group/btn absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-[#231610]/35 hover:bg-[#231610]/80 text-[#FAF7F3] hover:text-[#C5A47E] border border-[#C5A47E]/35 hover:border-[#C5A47E] backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 sm:opacity-75 focus:opacity-100 shadow-md hover:scale-105 active:scale-95"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.6] transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
