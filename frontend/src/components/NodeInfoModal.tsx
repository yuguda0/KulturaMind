import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal, DialogOverlay } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

interface NodeInfoModalProps {
  open: boolean;
  onClose: () => void;
  nodeId: string;
  title: string;
  info: string;
  fullInfo: string;
  artifactName: string;
  artifactCulture: string;
  aiResponse: string;
  isFromExpandedMap?: boolean; // Flag to indicate if opened from expanded map
}

// Extract relevant information from AI response based on node type
const extractNodeInfo = (
  nodeId: string,
  artifactName: string,
  artifactCulture: string,
  aiResponse: string
): string => {
  if (!aiResponse) {
    return `Information about the ${nodeId} of the ${artifactName} will appear here after the first AI response.`;
  }

  // Parse the AI response to extract relevant sections
  const lowerResponse = aiResponse.toLowerCase();
  
  switch (nodeId) {
    case 'origin':
      // Look for origin-related information
      if (lowerResponse.includes('origin') || lowerResponse.includes('location') || lowerResponse.includes('where')) {
        const originMatch = aiResponse.match(/(?:origin|location|where|from).*?(?:\.|$)/gi);
        if (originMatch) {
          return originMatch.slice(0, 3).join(' ');
        }
      }
      return `The ${artifactName} originates from the ${artifactCulture} culture and region. It represents an important geographical and cultural connection to its place of origin.`;

    case 'culture':
      // Look for culture-related information
      if (lowerResponse.includes('culture') || lowerResponse.includes('cultural')) {
        const cultureMatch = aiResponse.match(/(?:culture|cultural|society|tradition).*?(?:\.|$)/gi);
        if (cultureMatch) {
          return cultureMatch.slice(0, 3).join(' ');
        }
      }
      return `The ${artifactName} is deeply rooted in ${artifactCulture} culture. It reflects the values, beliefs, and artistic traditions of the ${artifactCulture} people.`;

    case 'era':
      // Look for era/time period information
      if (lowerResponse.includes('era') || lowerResponse.includes('period') || lowerResponse.includes('century') || lowerResponse.includes('age')) {
        const eraMatch = aiResponse.match(/(?:era|period|century|age|time|ancient|medieval|modern).*?(?:\.|$)/gi);
        if (eraMatch) {
          return eraMatch.slice(0, 3).join(' ');
        }
      }
      return `The ${artifactName} dates to a significant historical period. Its creation reflects the technological and artistic capabilities of its time.`;

    case 'significance':
      // Look for significance-related information
      if (lowerResponse.includes('significance') || lowerResponse.includes('important') || lowerResponse.includes('matter')) {
        const sigMatch = aiResponse.match(/(?:significance|important|matter|valuable|precious).*?(?:\.|$)/gi);
        if (sigMatch) {
          return sigMatch.slice(0, 3).join(' ');
        }
      }
      return `The ${artifactName} holds profound cultural and historical significance. It serves as a testament to the achievements and heritage of the ${artifactCulture} civilization.`;

    case 'center':
    default:
      return aiResponse.substring(0, 500) + (aiResponse.length > 500 ? '...' : '');
  }
};

const NodeInfoModal = ({
  open,
  onClose,
  nodeId,
  title,
  info,
  fullInfo,
  artifactName,
  artifactCulture,
  aiResponse,
  isFromExpandedMap = false,
}: NodeInfoModalProps) => {
  const extractedInfo = extractNodeInfo(nodeId, artifactName, artifactCulture, aiResponse);

  // Node-specific colors
  const nodeColors: Record<string, { bg: string; border: string; text: string }> = {
    center: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/20',
      border: 'border-purple-500/30 dark:border-purple-500/50',
      text: 'text-purple-600 dark:text-purple-400',
    },
    origin: {
      bg: 'bg-orange-500/10 dark:bg-orange-500/20',
      border: 'border-orange-500/30 dark:border-orange-500/50',
      text: 'text-orange-600 dark:text-orange-400',
    },
    culture: {
      bg: 'bg-green-500/10 dark:bg-green-500/20',
      border: 'border-green-500/30 dark:border-green-500/50',
      text: 'text-green-600 dark:text-green-400',
    },
    era: {
      bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
      border: 'border-cyan-500/30 dark:border-cyan-500/50',
      text: 'text-cyan-600 dark:text-cyan-400',
    },
    significance: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      border: 'border-amber-500/30 dark:border-amber-500/50',
      text: 'text-amber-600 dark:text-amber-400',
    },
  };

  const colors = nodeColors[nodeId] || nodeColors.center;

  // If opened from expanded map, use custom z-index
  if (isFromExpandedMap) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogPortal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[110] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            className={cn(
              "fixed left-[50%] top-[50%] z-[120] grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-h-[85vh] md:max-h-[80vh] border-border w-[95vw] md:w-auto"
            )}
          >
            <DialogHeader className="border-b border-border/50 pb-3 md:pb-4">
              <div className="flex items-start justify-between gap-2 md:gap-4">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-lg md:text-2xl font-bold text-foreground mb-1 md:mb-2 break-words">
                    {title}
                  </DialogTitle>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    {artifactName} • {artifactCulture} Culture
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </DialogHeader>

            <ScrollArea className="h-[calc(85vh-120px)] md:h-[calc(80vh-150px)] pr-3 md:pr-4">
              <div className="space-y-4 md:space-y-6 py-3 md:py-4">
                {/* Node-specific header */}
                <div className={`p-3 md:p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                  <h3 className={`font-semibold text-sm md:text-base ${colors.text} mb-1 md:mb-2`}>
                    {title}
                  </h3>
                  <p className="text-xs md:text-sm text-foreground">
                    {info}
                  </p>
                </div>

                {/* Extracted information from AI response */}
                <div className="space-y-2 md:space-y-3">
                  <h4 className="font-semibold text-sm md:text-base text-foreground">Detailed Information</h4>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-xs md:text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {extractedInfo}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Additional context */}
                <div className="bg-card/50 border border-border/50 rounded-lg p-3 md:p-4 space-y-1 md:space-y-2">
                  <h4 className="font-semibold text-foreground text-xs md:text-sm">Context</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    This information has been extracted from the AI Heritage Keeper's analysis of the {artifactName}.
                    Click on other nodes in the knowledge map to explore different aspects of this artifact.
                  </p>
                </div>

                {/* Related nodes suggestion */}
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 md:p-4 space-y-1 md:space-y-2">
                  <h4 className="font-semibold text-foreground text-xs md:text-sm">Explore More</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Try clicking on other nodes in the knowledge map to discover connections between different aspects
                    of the {artifactName} and its cultural significance.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    );
  }

  // Default rendering for normal modal
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] md:max-h-[80vh] bg-background border-border w-[95vw] md:w-auto">
        <DialogHeader className="border-b border-border/50 pb-3 md:pb-4">
          <div className="flex items-start justify-between gap-2 md:gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg md:text-2xl font-bold text-foreground mb-1 md:mb-2 break-words">
                {title}
              </DialogTitle>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {artifactName} • {artifactCulture} Culture
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-120px)] md:h-[calc(80vh-150px)] pr-3 md:pr-4">
          <div className="space-y-4 md:space-y-6 py-3 md:py-4">
            {/* Node-specific header */}
            <div className={`p-3 md:p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
              <h3 className={`font-semibold text-sm md:text-base ${colors.text} mb-1 md:mb-2`}>
                {title}
              </h3>
              <p className="text-xs md:text-sm text-foreground">
                {info}
              </p>
            </div>

            {/* Extracted information from AI response */}
            <div className="space-y-2 md:space-y-3">
              <h4 className="font-semibold text-sm md:text-base text-foreground">Detailed Information</h4>
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs md:text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {extractedInfo}
                </ReactMarkdown>
              </div>
            </div>

            {/* Additional context */}
            <div className="bg-card/50 border border-border/50 rounded-lg p-3 md:p-4 space-y-1 md:space-y-2">
              <h4 className="font-semibold text-foreground text-xs md:text-sm">Context</h4>
              <p className="text-xs md:text-sm text-muted-foreground">
                This information has been extracted from the AI Heritage Keeper's analysis of the {artifactName}.
                Click on other nodes in the knowledge map to explore different aspects of this artifact.
              </p>
            </div>

            {/* Related nodes suggestion */}
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 md:p-4 space-y-1 md:space-y-2">
              <h4 className="font-semibold text-foreground text-xs md:text-sm">Explore More</h4>
              <p className="text-xs md:text-sm text-muted-foreground">
                Try clicking on other nodes in the knowledge map to discover connections between different aspects
                of the {artifactName} and its cultural significance.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NodeInfoModal;

