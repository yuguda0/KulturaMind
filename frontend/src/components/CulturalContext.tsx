import { Calendar, MapPin, Sparkles, BookOpen } from 'lucide-react';
import { Artifact } from '@/data/artifacts';

interface CulturalContextProps {
  artifact: Artifact;
}

const CulturalContext = ({ artifact }: CulturalContextProps) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Artifact Header - Clean and Bold */}
      <div className="space-y-2 sm:space-y-3 pb-3 sm:pb-4 border-b border-border/50">
        <h2 className="text-xl sm:text-3xl font-bold text-foreground leading-tight break-words">
          {artifact.name}
        </h2>
        <p className="text-xs sm:text-sm text-accent font-medium uppercase tracking-wide">
          {artifact.category}
        </p>
      </div>

      {/* Key Information - Minimal Layout */}
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-start sm:items-center justify-between py-1.5 sm:py-2 border-b border-border/30 gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide flex-shrink-0">Location</span>
          <span className="text-xs sm:text-sm font-medium text-foreground text-right">{artifact.location}</span>
        </div>
        <div className="flex items-start sm:items-center justify-between py-1.5 sm:py-2 border-b border-border/30 gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide flex-shrink-0">Culture</span>
          <span className="text-xs sm:text-sm font-medium text-foreground text-right">{artifact.culture}</span>
        </div>
        <div className="flex items-start sm:items-center justify-between py-1.5 sm:py-2 border-b border-border/30 gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide flex-shrink-0">Era</span>
          <span className="text-xs sm:text-sm font-medium text-foreground text-right">{artifact.era}</span>
        </div>
        <div className="flex items-start sm:items-center justify-between py-1.5 sm:py-2 gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide flex-shrink-0">Year</span>
          <span className="text-xs sm:text-sm font-medium text-foreground text-right">{artifact.year}</span>
        </div>
      </div>

      {/* Description - Story Focus */}
      <div className="space-y-2 sm:space-y-3 pt-1 sm:pt-2">
        <h3 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wide">
          The Story
        </h3>
        <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
          {artifact.description}
        </p>
      </div>

      {/* Significance - Cultural Impact */}
      <div className="space-y-2 sm:space-y-3 pt-1 sm:pt-2">
        <h3 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wide">
          Cultural Impact
        </h3>
        <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
          {artifact.significance}
        </p>
      </div>
    </div>
  );
};

export default CulturalContext;

