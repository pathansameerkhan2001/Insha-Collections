import React from "react";

interface FeatureItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const features: FeatureItem[] = [
  {
    id: "premium",
    title: "PREMIUM QUALITY",
    subtitle: "Finest Quality Products",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9C7A50"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex-shrink-0"
      >
        <circle cx="12" cy="12" r="9.5" strokeWidth="1.2" />
        <path d="M12 4.5v15M5.5 8.5l13 7M5.5 15.5l13-7" strokeWidth="1.2" />
        <polygon points="12,8.5 14.5,12 12,15.5 9.5,12" fill="#9C7A50" fillOpacity="0.18" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: "secure",
    title: "SECURE PAYMENT",
    subtitle: "100% Safe & Secure",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9C7A50"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex-shrink-0"
      >
        <rect x="3.5" y="8.5" width="17" height="12.5" rx="2" strokeWidth="1.35" />
        <path d="M7.5 8.5V6a4.5 4.5 0 0 1 9 0v2.5" strokeWidth="1.35" />
        <path d="M12 12.5v4M10 14.5h4" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    id: "delivery",
    title: "FAST DELIVERY",
    subtitle: "Quick delivery at your door",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9C7A50"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex-shrink-0"
      >
        <path d="M1.5 6h3.5M1.5 9.5h3.5M1.5 13h3.5" strokeWidth="1.35" />
        <path d="M5.5 5h10.5v12H5.5z" strokeWidth="1.35" />
        <path d="M16 9.5h3.5l2.5 3v4.5H16V9.5z" strokeWidth="1.35" />
        <circle cx="9" cy="18" r="2" strokeWidth="1.35" />
        <circle cx="19" cy="18" r="2" strokeWidth="1.35" />
      </svg>
    ),
  },
  {
    id: "returns",
    title: "EASY RETURNS",
    subtitle: "Hassle free returns",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9C7A50"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex-shrink-0"
      >
        <path d="M4 11.5a8 8 0 1 1 2.34 5.66" strokeWidth="1.35" />
        <polyline points="4 6.5 4 11.5 9 11.5" strokeWidth="1.35" />
        <line x1="12" y1="8" x2="12" y2="13" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "support",
    title: "CUSTOMER SUPPORT",
    subtitle: "24/7 Support",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9C7A50"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex-shrink-0"
      >
        <rect x="2.5" y="11" width="3" height="6" rx="1.5" strokeWidth="1.35" />
        <rect x="18.5" y="11" width="3" height="6" rx="1.5" strokeWidth="1.35" />
        <path d="M4 11V9a8 8 0 0 1 16 0v2" strokeWidth="1.35" />
        <path d="M18.5 17c0 2-2 3.5-4 3.5h-2" strokeWidth="1.35" />
        <circle cx="11.5" cy="20.5" r="1" fill="#9C7A50" />
      </svg>
    ),
  },
];

export default function FeatureBar() {
  return (
    <section className="w-full bg-[#FAF6F2] border-t border-b border-[#EAE2D8] py-4 sm:py-5">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-5 gap-x-3 sm:gap-x-4 lg:gap-x-6 items-center justify-between">
          {features.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 sm:gap-3.5 justify-start sm:justify-center group"
            >
              <div className="transition-transform duration-200 group-hover:scale-105 flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[12px] sm:text-[12.5px] md:text-[13px] font-bold text-[#231610] uppercase tracking-[0.05em] leading-snug font-sans">
                  {item.title}
                </span>
                <span className="text-[11px] sm:text-[11.5px] md:text-[12px] text-[#6B5E55] font-normal leading-tight mt-0.5">
                  {item.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
