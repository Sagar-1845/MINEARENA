import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap, useGSAP } from '@/lib/gsap';

interface HeaderNavProps {
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

interface NavItem {
  number: string;
  label: string;
  targetId?: string;
  route?: string;
  tag: string;
}

const MAIN_NAV_ITEMS: NavItem[] = [
  {
    number: '01',
    label: 'ABOUT',
    targetId: 'mission',
    route: '/',
    tag: 'ETHOS & PHILOSOPHY',
  },
  {
    number: '02',
    label: 'PROJECTS',
    targetId: 'specimens',
    route: '/',
    tag: 'LANDMARK SPECIMEN VAULT',
  },
  {
    number: '03',
    label: 'ENCLAVES',
    targetId: 'spatial-map',
    route: '/',
    tag: 'SPATIAL CYBER MAP',
  },
  {
    number: '04',
    label: 'GATEWAY',
    route: '/demo',
    tag: 'LIVE TOKENIZATION DEMO',
  },
  {
    number: '05',
    label: 'CAREERS',
    targetId: 'careers',
    route: '/',
    tag: 'JOIN ZEROLEAK TEAM',
  },
  {
    number: '06',
    label: 'CONTACT',
    targetId: 'contact',
    route: '/',
    tag: 'DROP US A LINE',
  },
];

const SECONDARY_LINKS = [
  { label: 'INVESTOR RELATIONS', num: '01', href: '/metrics' },
  { label: 'DPDP REGULATORY POLICY', num: '02', href: '/audit' },
  { label: 'PRIVACY VAULT GUARANTEE', num: '03', href: '/dataset' },
  { label: 'TERMS & DATA PROTECTION', num: '04', href: '/audit' },
  { label: 'STATUTORY APPROVALS', num: '05', href: '/audit' },
  { label: "FAQ'S & ARCHITECTURE", num: '06', href: '/demo' },
];

export const HeaderNav: React.FC<HeaderNavProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const backdropRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const linksListRef = useRef<HTMLUListElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const navigate = useNavigate();

  // 1. Initialize GSAP Timeline for Drawer Opening & Closing
  useGSAP(() => {
    if (!drawerRef.current || !backdropRef.current) return;

    // Set initial offscreen state
    gsap.set(backdropRef.current, { opacity: 0, pointerEvents: 'none' });
    gsap.set(drawerRef.current, { xPercent: 100 });

    const tl = gsap.timeline({
      paused: true,
      onStart: () => setIsAnimating(true),
      onComplete: () => setIsAnimating(false),
      onReverseComplete: () => {
        setIsAnimating(false);
        setIsOpen(false);
        document.body.style.overflow = '';
      },
    });

    // Fade in dark backdrop
    tl.to(backdropRef.current, {
      opacity: 1,
      pointerEvents: 'auto',
      duration: 0.45,
      ease: 'power2.out',
    });

    // Slide in light drawer from right
    tl.to(
      drawerRef.current,
      {
        xPercent: 0,
        duration: 0.65,
        ease: 'power4.out',
      },
      '-=0.25'
    );

    // Stagger in links
    if (linksListRef.current) {
      const items = linksListRef.current.querySelectorAll('.menu-item-link');
      tl.fromTo(
        items,
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          stagger: 0.06,
          ease: 'power3.out',
        },
        '-=0.35'
      );
    }

    tlRef.current = tl;

    return () => {
      tl.kill();
    };
  }, []);

  // 2. Play or reverse timeline when isOpen changes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      tlRef.current?.play();
    } else {
      tlRef.current?.reverse();
    }
  }, [isOpen]);

  // 3. Escape key closes menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isAnimating) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isAnimating]);

  const handleOpenMenu = () => {
    if (isAnimating) return;
    setIsOpen(true);
  };

  const handleCloseMenu = () => {
    if (isAnimating) return;
    setIsOpen(false);
  };

  const handleNavigate = (item: NavItem) => {
    handleCloseMenu();
    setTimeout(() => {
      if (item.targetId) {
        if (window.location.pathname !== '/') {
          navigate('/');
          setTimeout(() => {
            const el = document.getElementById(item.targetId!);
            el?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        } else {
          const el = document.getElementById(item.targetId);
          el?.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (item.route) {
        navigate(item.route);
      }
    }, 450);
  };

  return (
    <>
      {/* 1. Global Fixed Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 h-20 px-6 sm:px-12 md:px-16 flex items-center justify-between pointer-events-none select-none">
        {/* Left: Geometric Hubtown-Grade Brand Wordmark */}
        <Link
          to="/"
          className="pointer-events-auto flex items-center gap-3 group focus-visible:outline-none"
          aria-label="ZEROLEAK AI Home"
        >
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 280 32"
              className="w-36 sm:w-44 md:w-48 h-auto text-[#D5E0FF] group-hover:text-white transition-colors"
              fill="currentColor"
            >
              {/* Z */}
              <path d="M 0 0 H 30 V 6 L 8 26 H 30 V 32 H 0 V 26 L 22 6 H 0 Z" />
              {/* E */}
              <path d="M 38 0 H 68 V 6 H 46 V 13 H 64 V 19 H 46 V 26 H 68 V 32 H 38 Z" />
              {/* R */}
              <path d="M 76 0 H 106 V 18 H 84 V 32 H 76 Z M 84 6 V 12 H 98 V 6 Z M 96 18 L 106 32 H 96 L 88 20 Z" />
              {/* O (geometric chamfered) */}
              <path d="M 114 0 H 144 V 32 H 114 Z M 122 6 V 26 H 136 L 122 12 Z" />
              {/* L */}
              <path d="M 152 0 H 160 V 26 H 182 V 32 H 152 Z" />
              {/* E */}
              <path d="M 190 0 H 220 V 6 H 198 V 13 H 216 V 19 H 198 V 26 H 220 V 32 H 190 Z" />
              {/* A */}
              <path d="M 228 0 H 258 V 32 H 250 V 19 H 236 V 32 H 228 Z M 236 6 V 13 H 250 V 6 Z" />
              {/* K */}
              <path d="M 266 0 H 274 V 32 H 266 Z M 274 16 L 288 0 H 298 L 282 18 L 298 32 H 288 L 274 18 Z" />
            </svg>
          </div>
        </Link>

        {/* Right: Technical Monospace Links + Chamfered Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-6 sm:gap-8">
          {/* Subtle Monospace Top Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-[11px] font-mono tracking-[0.16em] uppercase text-[#D5E0FF]/80">
            <button
              onClick={() => handleNavigate(MAIN_NAV_ITEMS[0])}
              className="hover:text-white transition-colors cursor-pointer"
            >
              ABOUT
            </button>
            <button
              onClick={() => handleNavigate(MAIN_NAV_ITEMS[1])}
              className="hover:text-white transition-colors cursor-pointer"
            >
              PROJECTS
            </button>
            <button
              onClick={() => handleNavigate(MAIN_NAV_ITEMS[4])}
              className="hover:text-white transition-colors cursor-pointer"
            >
              CAREERS
            </button>
            <button
              onClick={() => handleNavigate(MAIN_NAV_ITEMS[5])}
              className="hover:text-white transition-colors cursor-pointer"
            >
              CONTACT
            </button>
            <Link
              to="/metrics"
              className="hover:text-white transition-colors cursor-pointer"
            >
              METRICS
            </Link>
          </nav>

          {/* Chamfered Button 1: GATEWAY DEMO (Hubtown-style reticle button) */}
          <Link to="/demo" className="hidden sm:inline-flex">
            <button className="relative flex items-center gap-2.5 px-4 py-2 border border-[#D5E0FF]/25 hover:border-[#D5E0FF]/60 bg-[#020A19]/50 backdrop-blur-md rounded-md text-[11px] font-mono tracking-[0.16em] uppercase text-[#D5E0FF] hover:text-white transition-all cursor-pointer">
              {/* 3-dot reticle indicator */}
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#00F5FF]" />
                <span className="w-1 h-1 rounded-full bg-[#00F5FF]/60" />
                <span className="w-1 h-1 rounded-full bg-[#00F5FF]/30" />
              </span>
              <span>LAUNCH DEMO</span>
            </button>
          </Link>

          {/* Chamfered Button 2: MENU (Hubtown signature light pill) */}
          <button
            onClick={handleOpenMenu}
            aria-expanded={isOpen}
            aria-controls="hubtown-navigation-drawer"
            className="flex items-center gap-3 px-5 py-2.5 rounded-md bg-[#D5E0FF] hover:bg-white text-[#020A19] font-mono text-xs font-bold tracking-[0.16em] uppercase shadow-[0_0_20px_rgba(213,224,255,0.25)] transition-all cursor-pointer"
          >
            {/* Hubtown 4-square geometric icon */}
            <div className="grid grid-cols-2 gap-1 w-3.5 h-3.5">
              <span className="w-1.5 h-1.5 bg-[#020A19]" />
              <span className="w-1.5 h-1.5 bg-[#020A19]" />
              <span className="w-1.5 h-1.5 bg-[#020A19]" />
              <span className="w-1.5 h-1.5 bg-[#020A19]" />
            </div>
            <span>MENU</span>
          </button>
        </div>
      </header>

      {/* 2. Dimmed Dark Backdrop Overlay */}
      <div
        ref={backdropRef}
        onClick={handleCloseMenu}
        className="fixed inset-0 z-50 bg-[#020A19]/75 backdrop-blur-md transition-opacity duration-300 pointer-events-none"
      />

      {/* 3. Hubtown-Grade Right Drawer (Light Ice-Blue Panel #D5E0FF) */}
      <aside
        id="hubtown-navigation-drawer"
        ref={drawerRef}
        className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[500px] md:w-[560px] lg:w-[600px] bg-[#D5E0FF] text-[#020A19] flex flex-col justify-between p-8 sm:p-12 md:p-14 shadow-2xl overflow-y-auto select-none"
      >
        {/* Top Drawer Controls: EXPLORE Tag + CLOSE Button */}
        <div className="flex items-center justify-between pb-6 border-b border-[#020A19]/15">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-[0.2em] text-[#020A19] uppercase">
            <span className="w-2 h-2 bg-[#020A19]" />
            <span>EXPLORE ZEROLEAK</span>
          </div>

          <button
            ref={closeBtnRef}
            onClick={handleCloseMenu}
            aria-label="Close Menu"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#020A19] text-[#D5E0FF] hover:text-white hover:bg-black font-mono text-xs font-bold tracking-widest uppercase transition-all cursor-pointer"
          >
            <span className="text-sm leading-none">✖</span>
            <span>CLOSE</span>
          </button>
        </div>

        {/* Center: Massive Black Editorial Links */}
        <div className="my-auto py-8">
          <ul ref={linksListRef} className="space-y-4 sm:space-y-6">
            {MAIN_NAV_ITEMS.map((item) => (
              <li key={item.number} className="menu-item-link overflow-hidden">
                <button
                  onClick={() => handleNavigate(item)}
                  className="group w-full text-left flex items-baseline justify-between transition-transform duration-300 hover:translate-x-3 cursor-pointer"
                >
                  <span className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#020A19] group-hover:text-black">
                    {item.label}
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#020A19]/50 group-hover:text-[#020A19] tracking-widest uppercase">
                    {item.tag}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Drawer Section: Statutory Links & URL */}
        <div className="pt-6 border-t border-[#020A19]/15 flex flex-col gap-6">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-[0.2em] text-[#020A19]/60 uppercase">
            <span className="w-1.5 h-1.5 bg-[#020A19]/60" />
            <span>STATUTORY & ARCHITECTURE LINKS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-[#020A19]/80">
            {SECONDARY_LINKS.map((link) => (
              <Link
                key={link.num}
                to={link.href}
                onClick={handleCloseMenu}
                className="flex items-center justify-between py-1 hover:text-black hover:font-bold transition-colors"
              >
                <span className="tracking-wider">{link.label}</span>
                <span className="text-[10px] opacity-40">{link.num}</span>
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-[#020A19]/10 flex items-center justify-between text-[11px] font-mono font-bold tracking-widest text-[#020A19]/70">
            <span>WWW.ZEROLEAK.AI</span>
            <span>MINEARENA 1.0 • BIET</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default HeaderNav;