import React from "react";

// Student studying in Germany hero illustration
export const HeroIllustration = () => (
  <svg viewBox="0 0 500 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="heroGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6439FF" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#4F75FF" stopOpacity="0.8" />
      </linearGradient>
      <linearGradient id="heroGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00CCDD" />
        <stop offset="100%" stopColor="#7CF5FF" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="15" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Decorative background blobs */}
    <circle cx="400" cy="120" r="100" fill="url(#heroGrad2)" opacity="0.3" filter="url(#glow)" />
    <circle cx="100" cy="300" r="80" fill="url(#heroGrad1)" opacity="0.4" filter="url(#glow)" />
    
    {/* Main Laptop/Desk shape */}
    <rect x="80" y="320" width="340" height="20" rx="10" fill="#333" opacity="0.2" />
    
    {/* Germany gate / Brandenburger Tor minimalist illustration */}
    <path d="M 120,320 L 120,200 L 140,200 L 140,320 M 160,320 L 160,200 L 180,200 L 180,320 M 200,320 L 200,200 L 220,200 L 220,320" stroke="url(#heroGrad1)" strokeWidth="4" fill="none" opacity="0.5" />
    <rect x="110" y="190" width="120" height="15" rx="4" fill="url(#heroGrad1)" opacity="0.6" />
    
    {/* Big floating book / degree cap representing education */}
    <g transform="translate(250, 100) scale(0.9)">
      {/* Graduate Cap */}
      <polygon points="100,20 180,50 100,80 20,50" fill="url(#heroGrad1)" filter="url(#glow)" />
      <polygon points="60,65 60,110 100,130 140,110 140,65" fill="url(#heroGrad2)" />
      <path d="M 180,50 L 180,95 C 180,105 170,110 170,110" stroke="#ffc738" strokeWidth="4" fill="none" />
      <circle cx="170" cy="110" r="6" fill="#ffc738" />
    </g>

    {/* Student working on laptop shape */}
    <g transform="translate(180, 180)">
      {/* Chair */}
      <path d="M -40,140 L -10,60 L 20,60 L 20,140" stroke="#555" strokeWidth="8" fill="none" strokeLinecap="round" />
      {/* Person */}
      <circle cx="30" cy="-20" r="24" fill="url(#heroGrad2)" />
      <path d="M -10,120 L 10,40 C 10,40 30,20 50,40 L 70,80 L 100,75" stroke="url(#heroGrad1)" strokeWidth="16" fill="none" strokeLinecap="round" />
      <path d="M 30,40 L 20,120 L -10,160" stroke="#333" strokeWidth="12" fill="none" strokeLinecap="round" />
      {/* Laptop */}
      <path d="M 90,80 L 130,80 L 145,50" stroke="url(#heroGrad2)" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 85,83 L 135,83" stroke="#333" strokeWidth="4" fill="none" />
    </g>

    {/* Floating Success indicators */}
    <g transform="translate(50, 60)" filter="url(#glow)">
      <rect x="0" y="0" width="130" height="50" rx="10" fill="rgba(255,255,255,0.9)" />
      <circle cx="25" cy="25" r="12" fill="#00CCDD" />
      <path d="M 20,25 L 23,28 L 30,21" stroke="white" strokeWidth="2" fill="none" />
      <text x="45" y="25" fill="#333" fontSize="10" fontWeight="bold">Admitted</text>
      <text x="45" y="37" fill="#888" fontSize="8">TU Munich</text>
    </g>

    <g transform="translate(340, 260)" filter="url(#glow)">
      <rect x="0" y="0" width="120" height="50" rx="10" fill="rgba(255,255,255,0.9)" />
      <circle cx="25" cy="25" r="12" fill="#6439FF" />
      <text x="21" y="29" fill="white" fontSize="12" fontWeight="bold">€</text>
      <text x="45" y="25" fill="#333" fontSize="10" fontWeight="bold">Blocked Acc.</text>
      <text x="45" y="37" fill="#888" fontSize="8">Approved 100%</text>
    </g>
  </svg>
);

// Fintiba blocked account banking illustration
export const BankIllustration = () => (
  <svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bankGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00CCDD" />
        <stop offset="100%" stopColor="#4F75FF" />
      </linearGradient>
      <filter id="glow2" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="10" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Floating card */}
    <rect x="60" y="70" width="280" height="170" rx="16" fill="url(#bankGrad)" filter="url(#glow2)" />
    
    {/* Card Details */}
    <circle cx="110" cy="120" r="20" fill="white" opacity="0.2" />
    <rect x="80" y="170" width="140" height="12" rx="4" fill="white" opacity="0.3" />
    <rect x="80" y="195" width="80" height="8" rx="2" fill="white" opacity="0.2" />
    
    {/* Chip */}
    <rect x="80" y="105" width="30" height="24" rx="4" fill="#ffc738" />
    
    {/* Shield Check representing secure blocked account */}
    <g transform="translate(240, 40)" filter="url(#glow2)">
      <circle cx="40" cy="40" r="35" fill="white" />
      <path d="M 40,22 L 58,29 L 58,45 C 58,57 49,65 40,68 C 31,65 22,57 22,45 L 22,29 Z" fill="#6439FF" />
      <path d="M 32,45 L 37,50 L 48,37" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
    
    {/* Currency symbol Euro floating */}
    <circle cx="310" cy="210" r="25" fill="#ffc738" filter="url(#glow2)" />
    <text x="302" y="219" fill="white" fontSize="26" fontWeight="bold" fontFamily="sans-serif">€</text>
  </svg>
);

// Team collaboration illustration
export const TeamIllustration = () => (
  <svg viewBox="0 0 500 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="teamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6439FF" />
        <stop offset="100%" stopColor="#7CF5FF" />
      </linearGradient>
    </defs>
    <circle cx="250" cy="200" r="140" fill="url(#teamGrad)" opacity="0.15" />
    
    {/* Minimalist Team Nodes */}
    <g transform="translate(150, 150)">
      <circle cx="0" cy="0" r="30" fill="#6439FF" />
      <path d="M -20,40 C -20,25 20,25 20,40" stroke="white" strokeWidth="4" fill="none" />
    </g>
    <g transform="translate(350, 150)">
      <circle cx="0" cy="0" r="30" fill="#00CCDD" />
      <path d="M -20,40 C -20,25 20,25 20,40" stroke="white" strokeWidth="4" fill="none" />
    </g>
    <g transform="translate(250, 250)">
      <circle cx="0" cy="0" r="35" fill="#4F75FF" />
      <path d="M -25,45 C -25,30 25,30 25,45" stroke="white" strokeWidth="4" fill="none" />
    </g>
    
    {/* Connecting lines */}
    <path d="M 180,150 L 320,150 M 150,180 L 215,235 M 350,180 L 285,235" stroke="#4F75FF" strokeWidth="3" strokeDasharray="6" fill="none" />
    
    {/* Global network arc */}
    <path d="M 120,220 C 180,310 320,310 380,220" stroke="#00CCDD" strokeWidth="4" fill="none" />
  </svg>
);

// Vision / Future goals illustration
export const VisionIllustration = () => (
  <svg viewBox="0 0 500 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="visGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4F75FF" />
        <stop offset="100%" stopColor="#6439FF" />
      </linearGradient>
    </defs>
    
    {/* Glowing target/vision paths */}
    <circle cx="250" cy="200" r="130" stroke="url(#visGrad)" strokeWidth="2" strokeDasharray="8 8" fill="none" opacity="0.4" />
    <circle cx="250" cy="200" r="90" stroke="#00CCDD" strokeWidth="3" strokeDasharray="4 4" fill="none" opacity="0.6" />
    <circle cx="250" cy="200" r="50" fill="url(#visGrad)" opacity="0.2" />
    
    {/* Target bullseye */}
    <circle cx="250" cy="200" r="20" fill="#6439FF" />
    <circle cx="250" cy="200" r="8" fill="#00CCDD" />
    
    {/* Arrow striking center */}
    <path d="M 100,50 L 235,185" stroke="#ffc738" strokeWidth="6" strokeLinecap="round" />
    <polygon points="230,165 240,190 215,180" fill="#ffc738" />
    <path d="M 85,35 L 110,60 M 75,45 L 100,70" stroke="#ffc738" strokeWidth="4" />
  </svg>
);

// Ausbildung/Vocational Career illustration
export const AusbildungIllustration = () => (
  <svg viewBox="0 0 500 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ausGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6439FF" />
        <stop offset="100%" stopColor="#00CCDD" />
      </linearGradient>
    </defs>
    
    {/* Background Grid */}
    <rect x="80" y="60" width="340" height="280" rx="16" fill="url(#ausGrad)" opacity="0.08" />
    
    {/* Split Screen showing Dual Education (School vs Work) */}
    {/* School side: Books and cap */}
    <g transform="translate(160, 180)">
      <circle cx="0" cy="0" r="50" fill="#6439FF" opacity="0.9" />
      <polygon points="0,-25 35,-10 0,5 -35,-10" fill="white" />
      <rect x="-15" y="-5" width="30" height="20" fill="white" />
      <path d="M -15,10 C -15,20 15,20 15,10" stroke="white" strokeWidth="2" fill="none" />
      <text x="-35" y="60" fill="#6439FF" fontSize="14" fontWeight="bold">Classroom</text>
    </g>
    
    {/* Link / Integration Arrow */}
    <path d="M 230,180 C 250,150 250,210 270,180" stroke="#ffc738" strokeWidth="6" strokeLinecap="round" fill="none" />
    <polygon points="275,180 265,172 265,188" fill="#ffc738" />
    
    {/* Work side: Gear and Wrench representing practical work */}
    <g transform="translate(340, 180)">
      <circle cx="0" cy="0" r="50" fill="#00CCDD" opacity="0.9" />
      {/* Gear */}
      <circle cx="0" cy="0" r="18" stroke="white" strokeWidth="6" fill="none" />
      <rect x="-5" y="-23" width="10" height="46" fill="white" />
      <rect x="-23" y="-5" width="46" height="10" fill="white" />
      <circle cx="0" cy="0" r="10" fill="#00CCDD" />
      <text x="-30" y="60" fill="#00CCDD" fontSize="14" fontWeight="bold">Practical Work</text>
    </g>

    {/* Money / Salary icon floating above */}
    <g transform="translate(250, 80)">
      <rect x="-60" y="-20" width="120" height="40" rx="10" fill="#4F75FF" />
      <text x="-38" y="6" fill="white" fontSize="14" fontWeight="bold">Earn Salary</text>
    </g>
  </svg>
);
