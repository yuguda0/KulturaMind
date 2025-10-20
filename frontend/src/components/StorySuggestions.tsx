import { ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StorySuggestion {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'origin' | 'significance' | 'connection' | 'practice';
}

interface StorySuggestionsProps {
  suggestions: StorySuggestion[];
  onSuggestionClick: (id: string, title: string) => void;
  isLoading?: boolean;
}

const categoryColors = {
  origin: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  significance: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  connection: 'from-pink-500/20 to-pink-600/20 border-pink-500/30',
  practice: 'from-green-500/20 to-green-600/20 border-green-500/30',
};

const categoryIcons = {
  origin: '🌍',
  significance: '✨',
  connection: '🔗',
  practice: '🎭',
};

const StorySuggestions = ({
  suggestions,
  onSuggestionClick,
  isLoading = false,
}: StorySuggestionsProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-semibold text-foreground">Explore the Story</h3>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {isLoading ? (
          // Loading skeleton
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-12 bg-muted/30 rounded-lg animate-pulse"
            />
          ))
        ) : suggestions.length > 0 ? (
          suggestions.map((suggestion) => (
            <Button
              key={suggestion.id}
              onClick={() => onSuggestionClick(suggestion.id, suggestion.title)}
              variant="ghost"
              className={`justify-start h-auto py-3 px-3 rounded-lg border transition-all duration-200 hover:scale-105 bg-gradient-to-r ${
                categoryColors[suggestion.category]
              } hover:border-accent/50 group`}
            >
              <div className="flex items-start gap-3 w-full text-left">
                <span className="text-lg mt-0.5">{categoryIcons[suggestion.category]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-tight">
                    {suggestion.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {suggestion.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0 mt-0.5" />
              </div>
            </Button>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            No suggestions available
          </p>
        )}
      </div>
    </div>
  );
};

export default StorySuggestions;

