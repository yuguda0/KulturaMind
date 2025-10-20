import { useState, useEffect } from 'react';
import { Moon, Sun, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onThemeToggle?: () => void;
}

const Header = ({ onThemeToggle }: HeaderProps) => {
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);

    // Listen for scroll
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const newIsDark = !isDark;

    if (newIsDark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    setIsDark(newIsDark);
    onThemeToggle?.();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border/50 shadow-lg'
          : 'bg-background/50 backdrop-blur-sm'
      }`}
    >
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo and Branding */}
          <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer min-w-0">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative bg-card px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-foreground truncate">
                KulturaMind
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Heritage Stories</p>
            </div>
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg hover:bg-accent/10 transition-colors h-9 w-9 sm:h-10 sm:w-10"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Animated gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
    </header>
  );
};

export default Header;

