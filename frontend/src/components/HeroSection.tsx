import { Sparkles, Zap, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onExplore?: () => void;
}

const HeroSection = ({ onExplore }: HeroSectionProps) => {
  return (
    <div className="relative w-full min-h-screen bg-gradient-hero overflow-hidden flex items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-heritage-clay/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-agi-purple/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-heritage-green/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold text-accent">
            Powered by Real AGI + Cultural Memory
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
          <span className="bg-gradient-to-r from-heritage-clay via-agi-purple to-heritage-green bg-clip-text text-transparent">
            Preserve Culture
          </span>
          <br />
          <span className="text-foreground">Through AGI</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed animate-slide-up animation-delay-100">
          Discover, learn, and preserve African cultural heritage through intelligent AI conversations. 
          Every artifact tells a story. Every story deserves to be remembered.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 animate-slide-up animation-delay-200">
          <div className="p-4 rounded-lg bg-card/50 backdrop-blur border border-border hover:border-accent/50 transition-colors">
            <Zap className="w-6 h-6 text-accent mx-auto mb-2" />
            <h3 className="font-semibold text-foreground mb-1">Real AGI</h3>
            <p className="text-sm text-muted-foreground">Powered by advanced AI reasoning</p>
          </div>

          <div className="p-4 rounded-lg bg-card/50 backdrop-blur border border-border hover:border-accent/50 transition-colors">
            <Globe className="w-6 h-6 text-heritage-green mx-auto mb-2" />
            <h3 className="font-semibold text-foreground mb-1">Cultural Memory</h3>
            <p className="text-sm text-muted-foreground">Preserve heritage for generations</p>
          </div>

          <div className="p-4 rounded-lg bg-card/50 backdrop-blur border border-border hover:border-accent/50 transition-colors">
            <Sparkles className="w-6 h-6 text-heritage-gold mx-auto mb-2" />
            <h3 className="font-semibold text-foreground mb-1">Interactive</h3>
            <p className="text-sm text-muted-foreground">Engage with artifacts in real-time</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-300">
          <Button
            onClick={onExplore}
            className="bg-gradient-to-r from-heritage-clay to-agi-purple hover:shadow-lg text-white px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-300 group"
          >
            Explore Heritage Map
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            variant="outline"
            className="px-8 py-6 text-lg font-semibold rounded-lg border-2 border-accent text-accent hover:bg-accent/10"
          >
            Learn More
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 pt-12 border-t border-border/50 animate-slide-up animation-delay-400">
          <div>
            <p className="text-3xl font-bold text-accent">19+</p>
            <p className="text-sm text-muted-foreground">Cultural Artifacts</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-heritage-green">3</p>
            <p className="text-sm text-muted-foreground">African Cultures</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-heritage-gold">∞</p>
            <p className="text-sm text-muted-foreground">Stories to Preserve</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-accent rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-accent rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

