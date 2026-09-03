"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, Check } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail("");
    }, 3000);
  };

  return (
    <footer className="w-full bg-[#FAF7F2] text-[#231610] border-t border-[#EAE2D8] pt-0 pb-12 sm:pb-16 overflow-hidden">
      {/* 1. Newsletter Strip Section */}
      <div className="relative w-full bg-[#F5EFE9]/90 border-b border-[#EAE2D8] py-8 sm:py-10 md:py-12 overflow-hidden">
        {/* Subtle Botanical Leaf Decorative SVGs on Left & Right */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 sm:opacity-50 select-none hidden sm:block">
          <svg
            width="140"
            height="100"
            viewBox="0 0 140 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#B97A48]"
          >
            <path
              d="M-10 90C20 80 50 60 70 20M70 20C65 35 50 45 35 48M70 20C75 35 90 40 105 38M45 55C30 60 20 75 18 90M55 45C65 58 70 75 68 92M25 72C15 80 8 92 6 100"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M30 40C24 38 18 42 16 48C22 50 28 46 30 40ZM60 22C54 18 46 20 42 26C48 30 56 28 60 22ZM85 28C88 22 84 14 78 12C74 18 78 26 85 28ZM40 68C34 66 28 72 26 78C32 80 38 74 40 68Z"
              stroke="currentColor"
              strokeWidth="1"
              fill="currentColor"
              fillOpacity="0.08"
            />
          </svg>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 sm:opacity-50 select-none hidden sm:block">
          <svg
            width="140"
            height="100"
            viewBox="0 0 140 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#B97A48] rotate-180"
          >
            <path
              d="M-10 90C20 80 50 60 70 20M70 20C65 35 50 45 35 48M70 20C75 35 90 40 105 38M45 55C30 60 20 75 18 90M55 45C65 58 70 75 68 92M25 72C15 80 8 92 6 100"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M30 40C24 38 18 42 16 48C22 50 28 46 30 40ZM60 22C54 18 46 20 42 26C48 30 56 28 60 22ZM85 28C88 22 84 14 78 12C74 18 78 26 85 28ZM40 68C34 66 28 72 26 78C32 80 38 74 40 68Z"
              stroke="currentColor"
              strokeWidth="1"
              fill="currentColor"
              fillOpacity="0.08"
            />
          </svg>
        </div>

        {/* Content Container */}
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
            {/* Left: Envelope Icon + Text */}
            <div className="flex items-center gap-4 sm:gap-5 text-center sm:text-left flex-col sm:flex-row">
              {/* Envelope Circle Icon */}
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border border-[#B97A48]/60 bg-[#FAF7F2] flex items-center justify-center text-[#B97A48] flex-shrink-0 shadow-xs">
                <Mail className="w-6 h-6 stroke-[1.35]" />
              </div>

              {/* Headings */}
              <div>
                <h3 className="text-base sm:text-lg md:text-[19px] font-normal text-[#231610] tracking-[0.14em] uppercase font-serif-luxury leading-snug">
                  STAY UPDATED WITH INSHA COLLECTIONS
                </h3>
                <p className="text-xs sm:text-[13.5px] text-[#6B5E55] font-normal mt-0.5 leading-relaxed">
                  Subscribe to get special offers, new arrivals, <br className="hidden sm:inline" />
                  style inspiration and more.
                </p>
              </div>
            </div>

            {/* Right: Email Input + Subscribe Button */}
            <form onSubmit={handleSubscribe} className="w-full sm:w-auto flex-shrink-0 max-w-md">
              <div className="flex items-stretch shadow-xs rounded-lg overflow-hidden border border-[#D5C2AF] bg-white">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 min-w-[180px] sm:min-w-[240px] md:min-w-[280px] px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-white text-[#231610] placeholder-[#9E9085] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 sm:px-7 py-2.5 sm:py-3 bg-gradient-to-r from-[#BA7442] to-[#9C5A2C] hover:from-[#A86435] hover:to-[#8B4E24] text-white text-xs font-semibold tracking-[0.14em] uppercase font-sans transition-all duration-300 flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer"
                >
                  {subscribed ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.2]" />
                      <span>SUBSCRIBED</span>
                    </>
                  ) : (
                    <span>SUBSCRIBE</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Body (Logo + Description + Socials on Left | CONTACT US on Right) */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12 pt-12 sm:pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-14 md:gap-16 lg:gap-24 items-center">
          {/* Left Column: Circular Logo, Tagline, Social Icons */}
          <div className="flex flex-col items-center text-center">
            {/* Circular Logo Frame */}
            <Link href="/" className="group inline-block focus:outline-none">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-white p-2 border border-[#E0D0BE] shadow-xs flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src="/images/New-logo.jpeg"
                    alt="Insha Collections Logo"
                    fill
                    priority
                    className="object-contain mix-blend-multiply"
                    sizes="(max-width: 640px) 160px, 192px"
                  />
                </div>
              </div>
            </Link>

            {/* Tagline / Brand Description */}
            <p className="text-xs sm:text-[13.5px] text-[#5A4D45] max-w-xs sm:max-w-sm mt-4 leading-relaxed font-normal">
              Timeless elegance crafted for every you. Premium quality, trusted by thousands.
            </p>

            {/* Social Icons Row (Facebook, Instagram, YouTube) */}
            <div className="flex items-center gap-3 sm:gap-3.5 mt-5">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/insha.collections24/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Insha Collections on Facebook"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#D5C2AF] text-[#231610] hover:text-[#BA7442] hover:border-[#BA7442] bg-[#FAF7F2] hover:bg-white flex items-center justify-center transition-all duration-200 shadow-xs"
              >
                <svg
                  className="w-4 h-4 sm:w-[17px] sm:h-[17px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/insha.collections24/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Insha Collections on Instagram"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#D5C2AF] text-[#231610] hover:text-[#BA7442] hover:border-[#BA7442] bg-[#FAF7F2] hover:bg-white flex items-center justify-center transition-all duration-200 shadow-xs"
              >
                <svg
                  className="w-4 h-4 sm:w-[17px] sm:h-[17px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://www.instagram.com/insha.collections24/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Insha Collections on YouTube"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#D5C2AF] text-[#231610] hover:text-[#BA7442] hover:border-[#BA7442] bg-[#FAF7F2] hover:bg-white flex items-center justify-center transition-all duration-200 shadow-xs"
              >
                <svg
                  className="w-4 h-4 sm:w-[17px] sm:h-[17px]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Column: ONLY "CONTACT US" Section with Vertical Left Divider on Desktop */}
          <div className="md:border-l md:border-[#EAE2D8] md:pl-12 lg:pl-16 flex flex-col items-center md:items-start text-center md:text-left">
            {/* Title: CONTACT US */}
            <h4 className="text-base sm:text-lg font-normal text-[#231610] tracking-[0.16em] uppercase font-serif-luxury">
              CONTACT US
            </h4>

            {/* Delicate Divider with Rhombus */}
            <div className="flex items-center gap-2 mt-2 mb-6 sm:mb-7">
              <div className="h-[1px] w-10 sm:w-14 bg-gradient-to-r from-transparent to-[#B97A48]/70" />
              <span className="text-[#B97A48] text-[9px] select-none">◆</span>
              <div className="h-[1px] w-10 sm:w-14 bg-gradient-to-l from-transparent to-[#B97A48]/70" />
            </div>

            {/* Contact Rows */}
            <div className="space-y-4 sm:space-y-5 text-xs sm:text-[14px] text-[#3D312A] font-normal w-full max-w-sm">
              {/* Phone Numbers */}
              <div className="flex items-start gap-3.5 justify-center md:justify-start group">
                <div className="text-[#B97A48] flex-shrink-0 mt-0.5">
                  <Phone className="w-5 h-5 stroke-[1.4]" />
                </div>
                <div className="flex flex-col gap-1 items-center md:items-start">
                  <a
                    href="tel:+919618648050"
                    className="hover:text-[#BA7442] transition-colors"
                  >
                    +91 9618648050
                  </a>
                  <a
                    href="tel:+919000407681"
                    className="hover:text-[#BA7442] transition-colors"
                  >
                    +91 9000407681
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-center gap-3.5 justify-center md:justify-start">
                <div className="text-[#B97A48] flex-shrink-0">
                  <Clock className="w-5 h-5 stroke-[1.4]" />
                </div>
                <span>Mon - Sat: 10:00 AM - 8:00 PM</span>
              </div>

              {/* Address */}
              <div className="flex items-center gap-3.5 justify-center md:justify-start">
                <div className="text-[#B97A48] flex-shrink-0">
                  <MapPin className="w-5 h-5 stroke-[1.4]" />
                </div>
                <span>123, Insha Collections, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
