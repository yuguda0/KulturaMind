import { Calendar, MapPin, Sparkles, BookOpen } from 'lucide-react';
import { Artifact } from '@/data/artifacts';

interface CulturalContextProps {
  artifact: Artifact;
}

const CulturalContext = ({ artifact }: CulturalContextProps) => {
  return (
    <div className="space-y-6">
      {/* Artifact Header - Clean and Bold */}
      <div className="space-y-3 pb-4 border-b border-border/50">
        <h2 className="text-3xl font-bold text-foreground leading-tight">
          {artifact.name}
        </h2>
        <p className="text-sm text-accent font-medium uppercase tracking-wide">
          {artifact.category}
        </p>
      </div>

      {/* Key Information - Minimal Layout */}
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-border/30">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Location</span>
          <span className="text-sm font-medium text-foreground">{artifact.location}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-border/30">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Culture</span>
          <span className="text-sm font-medium text-foreground">{artifact.culture}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-border/30">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Era</span>
          <span className="text-sm font-medium text-foreground">{artifact.era}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Year</span>
          <span className="text-sm font-medium text-foreground">{artifact.year}</span>
        </div>
      </div>

      {/* Description - Story Focus */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          The Story
        </h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {artifact.description}
        </p>
      </div>

      {/* Significance - Cultural Impact */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Cultural Impact
        </h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {artifact.significance}
        </p>
      </div>
    </div>
  );
};

export default CulturalContext;

