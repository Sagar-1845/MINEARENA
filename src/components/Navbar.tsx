import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Shield,
  Sun,
  Moon,
  Lock,
  Menu,
  X,
  Play,
  FileCheck2,
  BarChart3,
  Database,
  Terminal,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const NAV_LINKS = [
  { name: 'Gateway Demo', path: '/demo', icon: Play },
  { name: 'Document Intelligence', path: '/documents', icon: FileText },
  { name: 'Audit Log', path: '/audit', icon: FileCheck2 },
  { name: 'Metrics', path: '/metrics', icon: BarChart3 },
  { name: 'Dataset', path: '/dataset', icon: Database },
];

export const Navbar: React.FC<NavbarProps> = ({ theme, onToggleTheme }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled || mobileMenuOpen
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-lg'
          : 'bg-background/80 backdrop-blur-sm border-b border-border/50'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon rounded-xl p-1"
          aria-label="ZeroLeak AI Home"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border shadow-md transition-transform group-hover:scale-105">
            {/* Tricolor Accent Notch */}
            <div className="absolute -top-[1px] left-2 right-2 h-[2px] flex rounded-full overflow-hidden">
              <span className="flex-1 bg-saffron" />
              <span className="flex-1 bg-white/70" />
              <span className="flex-1 bg-indiaGreen" />
            </div>
            <Shield className="w-5 h-5 text-saffron transition-colors group-hover:text-neon" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-neon shadow-neon-glow" />
          </div>

          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-foreground leading-none">
              ZERO<span className="text-neon">LEAK</span> <span className="text-xs text-saffron font-bold">AI</span>
            </span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              Privacy Gateway
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-card/60 border border-border/80 px-2 py-1.5 rounded-full backdrop-blur-md shadow-sm">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn(
                'px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon',
                isActive
                  ? 'bg-secondary text-foreground font-semibold shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            Overview
          </NavLink>

          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon',
                    isActive
                      ? 'bg-secondary text-foreground font-semibold shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  )
                }
              >
                <Icon className="w-3.5 h-3.5 text-saffron" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Enclave Status Indicator (Desktop) */}
          <div className="hidden xl:flex items-center gap-2 text-xs font-mono text-muted-foreground bg-card/60 border border-border/70 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-indiaGreen animate-pulse" />
            <span className="text-[11px] text-foreground/80 font-medium">DPDP Gateway Online</span>
          </div>

          {/* Theme Switcher Button - minimum 44x44px touch target */}
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="rounded-xl border-border/80 min-h-[44px] min-w-[44px] h-11 w-11 text-foreground hover:text-saffron transition-all focus-visible:ring-2 focus-visible:ring-neon"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-saffron transition-transform hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700 transition-transform hover:-rotate-12" />
            )}
          </Button>

          {/* Primary CTA (Desktop) */}
          <Link to="/demo" className="hidden sm:inline-block">
            <Button
              variant="saffron"
              size="sm"
              className="font-mono text-xs font-bold gap-1.5 h-11 px-4 rounded-xl shadow-saffron-glow focus-visible:ring-2 focus-visible:ring-neon"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Launch Demo</span>
            </Button>
          </Link>

          {/* Mobile Hamburger Button - minimum 44x44px touch target */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="lg:hidden flex items-center justify-center min-h-[44px] min-w-[44px] h-11 w-11 rounded-xl border border-border/80 bg-card/80 text-foreground hover:text-saffron focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (Responsive for 360px) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-card/98 backdrop-blur-2xl px-4 py-5 space-y-2 shadow-2xl animate-in slide-in-from-top-3 duration-200">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-2 pb-1">
            Navigation Menu
          </div>

          <NavLink
            to="/"
            end
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-mono font-medium transition-colors min-h-[48px]',
                isActive
                  ? 'bg-secondary text-foreground font-bold border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              )
            }
          >
            <Shield className="w-4 h-4 text-saffron" />
            <span>Overview & Landing</span>
          </NavLink>

          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-mono font-medium transition-colors min-h-[48px]',
                    isActive
                      ? 'bg-secondary text-foreground font-bold border border-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  )
                }
              >
                <Icon className="w-4 h-4 text-neon" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}

          <div className="pt-3 border-t border-border/60">
            <Link
              to="/demo"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full block"
            >
              <Button
                variant="saffron"
                className="w-full min-h-[48px] font-mono text-sm font-bold gap-2 rounded-xl shadow-saffron-glow"
              >
                <Terminal className="w-4 h-4" />
                <span>Open Gateway Live Demo</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
