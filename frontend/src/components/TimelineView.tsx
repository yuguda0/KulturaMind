import { nigerianArtifacts } from '@/data/artifacts';
import { Calendar } from 'lucide-react';

const TimelineView = () => {
  const sortedArtifacts = [...nigerianArtifacts].sort((a, b) => {
    // Simple year extraction for sorting
    const yearA = parseInt(a.year.match(/-?\d+/)?.[0] || '0');
    const yearB = parseInt(b.year.match(/-?\d+/)?.[0] || '0');
    return yearA - yearB;
  });

  return (
    <div className="absolute top-20 left-4 bg-card/95 backdrop-blur-sm rounded-xl shadow-artifact border border-border max-w-sm max-h-[70vh] overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-heritage-gold" />
          Historical Timeline
        </h3>
      </div>
      <div className="overflow-y-auto px-4 py-3 space-y-3">
        {sortedArtifacts.map((artifact, index) => (
          <div key={artifact.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-heritage-clay border-2 border-heritage-gold"></div>
              {index < sortedArtifacts.length - 1 && (
                <div className="w-0.5 h-full bg-border min-h-[40px]"></div>
              )}
            </div>
            <div className="pb-4">
              <p className="text-xs font-semibold text-heritage-clay">{artifact.year}</p>
              <p className="text-sm font-medium text-foreground">{artifact.name}</p>
              <p className="text-xs text-muted-foreground">{artifact.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineView;
