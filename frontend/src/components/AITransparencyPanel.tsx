import { useState, useEffect } from 'react';
import { Brain, Database, Sparkles, CheckCircle2, Loader2, FileText, Zap } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TransparencyStep {
  id: string;
  type: 'search' | 'reasoning' | 'source' | 'generation';
  title: string;
  description: string;
  status: 'pending' | 'active' | 'complete';
  timestamp: number;
  metadata?: {
    query?: string;
    results?: number;
    confidence?: number;
    source?: string;
    mettaQuery?: string;
  };
}

interface AITransparencyPanelProps {
  steps: TransparencyStep[];
  isActive: boolean;
  className?: string;
}

const AITransparencyPanel = ({ steps, isActive, className }: AITransparencyPanelProps) => {
  const [visibleSteps, setVisibleSteps] = useState<TransparencyStep[]>([]);

  // Animate steps appearing one by one
  useEffect(() => {
    if (steps.length === 0) {
      setVisibleSteps([]);
      return;
    }

    // Add new steps with a slight delay for animation
    const newSteps = steps.slice(visibleSteps.length);
    if (newSteps.length > 0) {
      newSteps.forEach((step, index) => {
        setTimeout(() => {
          setVisibleSteps(prev => [...prev, step]);
        }, index * 150); // Stagger by 150ms
      });
    }
  }, [steps]);

  const getStepIcon = (type: string, status: string) => {
    const iconClass = cn(
      'w-4 h-4 flex-shrink-0',
      status === 'active' && 'animate-pulse',
      status === 'complete' && 'text-secondary',
      status === 'pending' && 'text-muted-foreground'
    );

    switch (type) {
      case 'search':
        return <Database className={iconClass} />;
      case 'reasoning':
        return <Brain className={iconClass} />;
      case 'source':
        return <FileText className={iconClass} />;
      case 'generation':
        return <Sparkles className={iconClass} />;
      default:
        return <Zap className={iconClass} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Loader2 className="w-3 h-3 animate-spin text-accent" />;
      case 'complete':
        return <CheckCircle2 className="w-3 h-3 text-secondary" />;
      default:
        return null;
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'search':
        return 'border-l-accent';
      case 'reasoning':
        return 'border-l-primary';
      case 'source':
        return 'border-l-secondary';
      case 'generation':
        return 'border-l-accent';
      default:
        return 'border-l-muted';
    }
  };

  if (!isActive && visibleSteps.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center h-full text-center p-6', className)}>
        <div className="mb-4 p-4 rounded-full bg-accent/10">
          <Brain className="w-8 h-8 text-accent" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">AI Transparency</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          When you ask a question, you'll see the AI's reasoning process here in real-time
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
        <Brain className="w-4 h-4 text-accent" />
        <h3 className="font-semibold text-sm text-foreground">AI Reasoning Process</h3>
        {isActive && (
          <Badge variant="outline" className="ml-auto text-xs bg-accent/10 text-accent border-accent/30">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Processing
          </Badge>
        )}
      </div>

      {/* Steps Timeline */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {visibleSteps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'relative pl-6 pb-3 border-l-2 transition-all duration-300 animate-slide-up',
                getStepColor(step.type),
                index === visibleSteps.length - 1 && 'pb-0'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Step Icon */}
              <div className="absolute -left-[9px] top-0 bg-background p-0.5 rounded-full border-2 border-current">
                {getStepIcon(step.type, step.status)}
              </div>

              {/* Step Content */}
              <div className="space-y-1">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-foreground">{step.title}</h4>
                      {getStatusIcon(step.status)}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                {step.metadata && (
                  <div className="mt-2 space-y-1">
                    {step.metadata.query && (
                      <div className="text-xs bg-card/50 rounded px-2 py-1 border border-border/30">
                        <span className="text-muted-foreground">Query: </span>
                        <span className="text-foreground font-mono">{step.metadata.query}</span>
                      </div>
                    )}
                    {step.metadata.mettaQuery && (
                      <div className="text-xs bg-card/50 rounded px-2 py-1 border border-border/30">
                        <span className="text-muted-foreground">MeTTa: </span>
                        <span className="text-foreground font-mono text-[10px]">{step.metadata.mettaQuery}</span>
                      </div>
                    )}
                    {step.metadata.results !== undefined && (
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {step.metadata.results} results
                        </Badge>
                        {step.metadata.confidence !== undefined && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] px-1.5 py-0",
                              step.metadata.confidence > 0.8 ? "bg-secondary/10 text-secondary border-secondary/30" :
                              step.metadata.confidence > 0.6 ? "bg-accent/10 text-accent border-accent/30" :
                              "bg-muted/10 text-muted-foreground border-muted/30"
                            )}
                          >
                            {Math.round(step.metadata.confidence * 100)}% confidence
                          </Badge>
                        )}
                      </div>
                    )}
                    {step.metadata.source && (
                      <div className="text-xs text-muted-foreground">
                        <span className="opacity-70">Source: </span>
                        <span className="text-foreground">{step.metadata.source}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer Summary */}
      {visibleSteps.length > 0 && !isActive && (
        <div className="px-4 py-3 border-t border-border/50 bg-card/30">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-secondary" />
              <span>{visibleSteps.filter(s => s.status === 'complete').length} steps completed</span>
            </div>
            <div className="flex items-center gap-1">
              <Database className="w-3 h-3" />
              <span>{visibleSteps.filter(s => s.type === 'search').length} searches</span>
            </div>
            <div className="flex items-center gap-1">
              <Brain className="w-3 h-3" />
              <span>{visibleSteps.filter(s => s.type === 'reasoning').length} reasoning</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITransparencyPanel;

