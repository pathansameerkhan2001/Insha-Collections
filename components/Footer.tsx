"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, Check } from "lucide-react";
import { FacebookIcon, InstagramIcon, YouTubeIcon, PinterestIcon } from "./BrandIcons";

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
    <footer className="w-full bg-[#FAF6F0] text-[#231610] border-t border-[#EAE2D8] pt-0 pb-8 sm:pb-10 overflow-hidden">
      {/* 1. Newsletter Strip Section */}
      <div className="relative w-full bg-[#F5ECE5]/70 border-b border-[#EAE2D8] py-7 sm:py-9 overflow-hidden">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
            {/* Left: Envelope Icon + Text */}
            <div className="flex items-center gap-4 sm:gap-5 text-center sm:text-left flex-col sm:flex-row">
              <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full border border-[#B97A48]/50 bg-[#FAF6F0] flex items-center justify-center text-[#B97A48] flex-shrink-0 shadow-xs">
                <Mail className="w-5 h-5 stroke-[1.4]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base md:text-[17px] font-normal text-[#231610] tracking-[0.14em] uppercase font-serif-luxury leading-snug">
                  STAY UPDATED WITH INSHA COLLECTIONS
                </h3>
                <p className="text-xs sm:text-[13px] text-[#6B5E55] font-normal mt-0.5 leading-relaxed">
                  Subscribe to get special offers, new arrivals, style inspiration and more.
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
                  className="flex-1 min-w-[180px] sm:min-w-[240px] md:min-w-[260px] px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-white text-[#231610] placeholder-[#9E9085] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#BA7442] to-[#9C5A2C] hover:from-[#A86435] hover:to-[#8B4E24] text-white text-xs font-semibold tracking-[0.14em] uppercase font-sans transition-all duration-300 flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer"
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

      {/* ========================================================================= */}
      {/* SECTION 1: INSHA COLLECTIONS / CLIENT SECTION                             */}
      {/* ========================================================================= */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-0 items-center">
          
          {/* LEFT (4 cols): Insha Collections Official Circular Logo */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-center justify-center">
            <Link href="/" className="group inline-block focus:outline-none" aria-label="Insha Collections Homepage">
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 md:w-52 md:h-52 rounded-full p-2 flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]">
                <Image
                  src="/images/New-logo.jpeg"
                  alt="Insha Collections Logo"
                  width={220}
                  height={220}
                  priority
                  className="object-contain mix-blend-multiply rounded-full select-none"
                />
              </div>
            </Link>
          </div>

          {/* CENTER (4 cols): CONTACT US */}
          <div className="lg:col-span-4 lg:border-l lg:border-[#E8DFD3] lg:pl-10 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h4 className="text-sm sm:text-base font-normal text-[#231610] tracking-[0.2em] uppercase font-serif-luxury">
              CONTACT US
            </h4>

            {/* Delicate divider with diamond */}
            <div className="flex items-center gap-2 mt-1.5 mb-5">
              <div className="h-[1px] w-8 sm:w-10 bg-[#C8B8A6]" />
              <span className="text-[#B97A48] text-[8px] select-none">◆</span>
              <div className="h-[1px] w-8 sm:w-10 bg-[#C8B8A6]" />
            </div>

            {/* Contact Details with circular soft badges */}
            <div className="space-y-4 text-xs sm:text-[13.5px] text-[#3D312A] font-normal w-full max-w-sm">
              {/* Phone */}
              <div className="flex items-center gap-3.5 justify-center lg:justify-start">
                <div className="w-8 h-8 rounded-full bg-[#EFE7DE] text-[#8C6B4E] flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <Phone className="w-4 h-4 stroke-[1.5]" />
                </div>
                <div className="flex flex-col gap-0.5 items-center lg:items-start">
                  <a href="tel:+919618648050" className="hover:text-[#BA7442] transition-colors font-medium">
                    +91 9618648050
                  </a>
                  <a href="tel:+919000407681" className="hover:text-[#BA7442] transition-colors font-medium">
                    +91 9000407681
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-center gap-3.5 justify-center lg:justify-start">
                <div className="w-8 h-8 rounded-full bg-[#EFE7DE] text-[#8C6B4E] flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <Clock className="w-4 h-4 stroke-[1.5]" />
                </div>
                <span className="text-[#3D312A]">Mon - Sat: 10:00 AM - 8:00 PM</span>
              </div>

              {/* Physical Address */}
              <div className="flex items-start gap-3.5 justify-center lg:justify-start text-center lg:text-left">
                <div className="w-8 h-8 rounded-full bg-[#EFE7DE] text-[#8C6B4E] flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5">
                  <MapPin className="w-4 h-4 stroke-[1.5]" />
                </div>
                <p className="text-[#3D312A] leading-relaxed max-w-[280px] sm:max-w-xs">
                  Room no 6, Rachuru complex, Y V Street, Kadapa 516001, Andhra Pradesh, India
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT (4 cols): FOLLOW US */}
          <div className="lg:col-span-4 lg:border-l lg:border-[#E8DFD3] lg:pl-10 flex flex-col items-center text-center">
            <h4 className="text-sm sm:text-base font-normal text-[#231610] tracking-[0.2em] uppercase font-serif-luxury">
              FOLLOW US
            </h4>

            {/* Delicate divider with diamond */}
            <div className="flex items-center gap-2 mt-1.5 mb-5">
              <div className="h-[1px] w-8 sm:w-10 bg-[#C8B8A6]" />
              <span className="text-[#B97A48] text-[8px] select-none">◆</span>
              <div className="h-[1px] w-8 sm:w-10 bg-[#C8B8A6]" />
            </div>

            {/* Tagline */}
            <div className="max-w-xs space-y-1">
              <p className="text-xs sm:text-[13px] text-[#5A4D45] leading-relaxed">
                Timeless elegance crafted for every you.
              </p>
              <p className="text-xs sm:text-[13px] text-[#5A4D45] leading-relaxed">
                Premium quality, trusted by thousands.
              </p>
            </div>

            {/* Social Icons Row */}
            <div className="flex items-center gap-3.5 mt-5">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/insha.collections24/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Insha Collections on Facebook"
                className="w-10 h-10 rounded-full bg-[#EFE7DE] text-[#4A392F] hover:text-[#B97A48] hover:bg-white border border-transparent hover:border-[#D5C2AF] flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-108"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/insha.collections24/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Insha Collections on Instagram"
                className="w-10 h-10 rounded-full bg-[#EFE7DE] text-[#4A392F] hover:text-[#B97A48] hover:bg-white border border-transparent hover:border-[#D5C2AF] flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-108"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>

              {/* Pinterest */}
              <a
                href="https://www.instagram.com/insha.collections24/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Insha Collections on Pinterest"
                className="w-10 h-10 rounded-full bg-[#EFE7DE] text-[#4A392F] hover:text-[#B97A48] hover:bg-white border border-transparent hover:border-[#D5C2AF] flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-108"
              >
                <PinterestIcon className="w-4 h-4" />
              </a>

              {/* YouTube */}
              <a
                href="https://www.instagram.com/insha.collections24/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Insha Collections on YouTube"
                className="w-10 h-10 rounded-full bg-[#EFE7DE] text-[#4A392F] hover:text-[#B97A48] hover:bg-white border border-transparent hover:border-[#D5C2AF] flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-108"
              >
                <YouTubeIcon className="w-4 h-4" />
              </a>
            </div>

            {/* Handwritten Signature Flourish: Stay Connected ♡ */}
            <p className="font-serif italic text-lg sm:text-xl text-[#9E6E49] mt-4 flex items-center justify-center gap-1.5 tracking-wide">
              <span>Stay Connected</span>
              <span className="text-[#9E6E49] text-base not-italic">♡</span>
            </p>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEPARATION DIVIDER WITH CENTER DIAMOND                                     */}
      {/* ========================================================================= */}
      <div className="relative w-full max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 my-2">
        <div className="relative w-full border-t border-[#E8DFD3] flex items-center justify-center">
          <span className="absolute -top-2 bg-[#FAF6F0] px-3 text-[#B97A48] text-[9px] select-none">
            ◆
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: BRANDNIX / DESIGNER ATTRIBUTION & COPYRIGHT SECTION            */}
      {/* ========================================================================= */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 pb-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center">
          
          {/* LEFT: Copyright Info */}
          <div className="text-center md:text-left text-xs sm:text-[13px] text-[#7A6F68] space-y-0.5 order-2 md:order-1">
            <p>© {new Date().getFullYear()} Insha Collections.</p>
            <p>All rights reserved.</p>
          </div>

          {/* CENTER: Brandnix Attribution Block */}
          <div className="flex flex-col items-center justify-center text-center space-y-1.5 order-1 md:order-2">
            {/* 'Designed by' with horizontal accent lines */}
            <div className="flex items-center gap-3 text-xs sm:text-[13px] text-[#7A6F68] font-serif italic">
              <div className="h-[1px] w-12 sm:w-16 bg-[#D8CCC0]" />
              <span>Designed by</span>
              <div className="h-[1px] w-12 sm:w-16 bg-[#D8CCC0]" />
            </div>

            {/* BRANDNIX Clickable Wordmark */}
            <a
              href="https://www.brandnix.in/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Brandnix Design & Digital Agency website"
              className="text-2xl sm:text-3xl font-extrabold tracking-[0.2em] text-[#1A1412] hover:text-[#BA7442] transition-colors duration-200 uppercase font-sans cursor-pointer"
            >
              BRANDNIX
            </a>

            {/* Brandnix Tagline */}
            <p className="text-[10px] sm:text-[11px] tracking-[0.28em] text-[#9E6E49] font-semibold uppercase">
              IDEAS | DESIGN | DIGITAL | BEYOND
            </p>
          </div>

          {/* RIGHT: Shop with Confidence & Support Tagline */}
          <div className="text-center md:text-right text-xs text-[#7A6F68] space-y-1 order-3">
            <p className="font-serif italic text-xs sm:text-[13.5px] text-[#5A4D45] flex items-center justify-center md:justify-end gap-1">
              <span>Shop with Confidence</span>
              <span className="text-[#9E6E49] text-xs not-italic">♡</span>
            </p>
            <p className="text-[11px] text-[#8C7E75]">
              Support Local | Support Women | Support Elegance
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
