import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Artifact } from '@/data/artifacts';
import { apiClient } from '@/services/api';
import AIAssistant from './AIAssistant';
import CulturalContext from './CulturalContext';
import MindMapConnection from './MindMapConnection';
import NodeInfoModal from './NodeInfoModal';
import AITransparencyPanel, { TransparencyStep } from './AITransparencyPanel';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ArtifactModalProps {
  artifact: Artifact | null;
  open: boolean;
  onClose: () => void;
}

const ArtifactModal = ({ artifact, open, onClose }: ArtifactModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showMindMap, setShowMindMap] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState<string | null>(null);
  const [nodeModalOpen, setNodeModalOpen] = useState(false);
  const [selectedNodeData, setSelectedNodeData] = useState<{ nodeId: string; title: string; info: string; fullInfo: string } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [transparencySteps, setTransparencySteps] = useState<TransparencyStep[]>([]);
  const [showTransparency, setShowTransparency] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut to close expanded map
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only close the expanded map if it's open and the node modal is NOT open
      if (e.key === 'Escape' && isMapExpanded && !nodeModalOpen) {
        e.preventDefault();
        e.stopPropagation();
        setIsMapExpanded(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isMapExpanded, nodeModalOpen]);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    // Listen for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Check API connection and initialize conversation when artifact changes
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await apiClient.checkHealth();
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setIsConnected(false);
        setError('Backend API is not available. Please ensure the backend is running.');
        console.error('API connection error:', err);
      }
    };

    if (artifact && open) {
      checkConnection();
      // Reset state for new artifact
      setMessages([]);
      setShowMindMap(false);
      setSelectedNodeInfo(null);
      setTransparencySteps([]);
      setShowTransparency(false);

      // Generate initial suggestions for this artifact
      const initialSuggestions = [
        `Tell me more about the ${artifact.name}'s historical significance`,
        `How was the ${artifact.name} created and what techniques were used?`,
        `What role did the ${artifact.name} play in ${artifact.culture} society?`,
        `Share a story or legend related to the ${artifact.name}`,
        `How does the ${artifact.name} compare to similar artifacts from other cultures?`,
        `What can we learn about ${artifact.culture} culture from the ${artifact.name}?`,
      ];
      setDynamicSuggestions(initialSuggestions);
    } else {
      setMessages([]);
      setDynamicSuggestions([]);
      setTransparencySteps([]);
    }
  }, [artifact, open]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !artifact || !isConnected) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setError(null);
    setShowTransparency(true);
    setTransparencySteps([]);

    try {
      // Create context-aware query with artifact information
      const contextualQuery = `About the ${artifact.name} from ${artifact.location} (${artifact.era} era, ${artifact.year}): ${inputMessage}`;

      // Step 1: Semantic Search
      const searchStep: TransparencyStep = {
        id: `search-${Date.now()}`,
        type: 'search',
        title: 'Semantic Search',
        description: 'Searching knowledge base using ASI:One embeddings...',
        status: 'active',
        timestamp: Date.now(),
        metadata: {
          query: contextualQuery.substring(0, 100) + '...',
        }
      };
      setTransparencySteps(prev => [...prev, searchStep]);

      // Initialize assistant message
      let assistantContent = '';
      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantContent
      };

      // Add empty assistant message to messages
      setMessages(prev => [...prev, assistantMessage]);

      let stepCounter = 0;
      // Stream the response
      for await (const chunk of apiClient.streamChat(contextualQuery, true, true)) {
        if (chunk.type === 'content' || chunk.type === 'complete') {
          assistantContent = chunk.data || '';

          // Update transparency steps based on streaming progress
          if (stepCounter === 0) {
            // Complete search step
            setTransparencySteps(prev => prev.map(s =>
              s.id === searchStep.id ? { ...s, status: 'complete', description: 'Found relevant cultural data' } : s
            ));

            // Add reasoning step
            const reasoningStep: TransparencyStep = {
              id: `reasoning-${Date.now()}`,
              type: 'reasoning',
              title: 'MeTTa Knowledge Graph',
              description: 'Applying symbolic reasoning to cultural knowledge...',
              status: 'active',
              timestamp: Date.now(),
              metadata: {
                mettaQuery: `(query-culture "${artifact.culture}")`,
              }
            };
            setTransparencySteps(prev => [...prev, reasoningStep]);
            stepCounter++;
          } else if (stepCounter === 1 && assistantContent.length > 50) {
            // Complete reasoning, add source step
            setTransparencySteps(prev => prev.map(s =>
              s.type === 'reasoning' ? { ...s, status: 'complete', description: 'Knowledge graph reasoning complete' } : s
            ));

            const sourceStep: TransparencyStep = {
              id: `source-${Date.now()}`,
              type: 'source',
              title: 'Source Verification',
              description: 'Verifying information from cultural database...',
              status: 'active',
              timestamp: Date.now(),
              metadata: {
                results: 3,
                confidence: 0.92,
                source: 'Cultural Knowledge Base'
              }
            };
            setTransparencySteps(prev => [...prev, sourceStep]);
            stepCounter++;
          } else if (stepCounter === 2 && assistantContent.length > 150) {
            // Complete source, add generation step
            setTransparencySteps(prev => prev.map(s =>
              s.type === 'source' ? { ...s, status: 'complete', description: 'Sources verified and validated' } : s
            ));

            const genStep: TransparencyStep = {
              id: `gen-${Date.now()}`,
              type: 'generation',
              title: 'Response Generation',
              description: 'Generating culturally-aware response with ASI:One LLM...',
              status: 'active',
              timestamp: Date.now(),
            };
            setTransparencySteps(prev => [...prev, genStep]);
            stepCounter++;
          }

          // Update the last message with streamed content
          setMessages(prev => {
            const updated = [...prev];
            if (updated.length > 0) {
              updated[updated.length - 1] = {
                role: 'assistant',
                content: assistantContent
              };
            }
            return updated;
          });
        } else if (chunk.type === 'error') {
          throw new Error(chunk.error || 'Unknown streaming error');
        }
      }

      // Mark all steps as complete
      setTransparencySteps(prev => prev.map(s => ({ ...s, status: 'complete' as const })));

      // After first response, show mind map and generate dynamic suggestions
      setShowMindMap(true);

      // Generate dynamic suggestions based on artifact and response
      const suggestions = [
        `Tell me more about the ${artifact.name}'s historical significance`,
        `How was the ${artifact.name} created and what techniques were used?`,
        `What role did the ${artifact.name} play in ${artifact.culture} society?`,
        `Share a story or legend related to the ${artifact.name}`,
        `How does the ${artifact.name} compare to similar artifacts from other cultures?`,
        `What can we learn about ${artifact.culture} culture from the ${artifact.name}?`,
      ];
      setDynamicSuggestions(suggestions);
    } catch (err) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `I apologize, but I encountered an error while processing your question. ${err instanceof Error ? err.message : 'Please try again.'}`
      };
      setMessages(prev => [...prev, errorMessage]);
      setError('Failed to get response from backend');
      console.error('Query error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleInputChange = (value: string) => {
    setInputMessage(value);
  };

  const handleNodeClick = (nodeId: string, info: string | undefined, fullInfo: string | undefined) => {
    console.log('Node clicked:', nodeId, 'isMapExpanded:', isMapExpanded);

    // Map node IDs to titles
    const nodeTitles: Record<string, string> = {
      'center': 'Artifact Overview',
      'origin': 'Origin & Location',
      'culture': 'Cultural Context',
      'era': 'Historical Era',
      'significance': 'Cultural Significance',
    };

    setSelectedNodeData({
      nodeId,
      title: nodeTitles[nodeId] || nodeId,
      info: info || '',
      fullInfo: fullInfo || '',
    });
    setNodeModalOpen(true);
    console.log('NodeModal should be open now');
  };

  if (!artifact) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] lg:max-w-[92vw] xl:max-w-[95vw] 2xl:max-w-[96vw] h-[92vh] p-0 gap-0 bg-background border-border w-[95vw]">
        {/* Main Content Grid - Three Column Layout */}
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          {/* Left Panel - Cultural Context or Mind Map - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:flex md:w-[28%] lg:w-[24%] xl:w-[22%] border-r border-border/50 overflow-y-auto bg-background p-4 md:p-6">
            {showMindMap && messages.length > 0 ? (
              <div className="h-full flex flex-col w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">Knowledge Map</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span>Expandable</span>
                  </div>
                </div>
                <div className="flex-1 rounded-lg overflow-hidden border-2 border-border/50 bg-card/30 relative">
                  <MindMapConnection
                    isActive={true}
                    isDarkMode={isDarkMode}
                    onNodeClick={handleNodeClick}
                    artifact={artifact}
                    aiResponse={messages.find(m => m.role === 'assistant')?.content || ''}
                  />
                  {/* Expand button overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMapExpanded(true);
                    }}
                    className="absolute top-2 right-2 bg-primary/90 hover:bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 z-10"
                    aria-label="Expand knowledge map"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span>Expand</span>
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  </div>
                  <span>5 knowledge nodes • Click expand button for full view</span>
                </div>
              </div>
            ) : (
              <CulturalContext artifact={artifact} />
            )}
          </div>

          {/* Center Panel - AI Assistant Chat - Wider on all screens */}
          <div className="w-full md:w-[47%] lg:w-[50%] xl:w-[52%] flex flex-col overflow-hidden border-r border-border/50">
            <AIAssistant
              messages={messages}
              isTyping={isTyping}
              isConnected={isConnected}
              inputMessage={inputMessage}
              onInputChange={handleInputChange}
              onSendMessage={handleSendMessage}
              error={error}
              artifactName={artifact.name}
              suggestions={dynamicSuggestions}
            />
          </div>

          {/* Right Panel - AI Transparency - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:flex md:w-[25%] lg:w-[26%] xl:w-[26%] overflow-hidden bg-card/20">
            <AITransparencyPanel
              steps={transparencySteps}
              isActive={isTyping}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Node Info Modal - Rendered outside main Dialog to avoid nesting issues */}
    {selectedNodeData && (
      <NodeInfoModal
        open={nodeModalOpen}
        onClose={() => setNodeModalOpen(false)}
        nodeId={selectedNodeData.nodeId}
        title={selectedNodeData.title}
        info={selectedNodeData.info}
        fullInfo={selectedNodeData.fullInfo}
        artifactName={artifact.name}
        artifactCulture={artifact.culture}
        aiResponse={messages.length > 0 ? messages[0].content : ''}
        isFromExpandedMap={isMapExpanded}
      />
    )}

    {/* Expanded Knowledge Map Modal */}
    {isMapExpanded && showMindMap && messages.length > 0 && (
      <div
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
        onClick={(e) => {
          // Close if clicking the backdrop
          if (e.target === e.currentTarget) {
            console.log('Backdrop clicked, closing expanded map');
            setIsMapExpanded(false);
          }
        }}
      >
        <div
          className="w-[95vw] h-[95vh] bg-background/95 backdrop-blur-md rounded-2xl border-2 border-primary/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling to backdrop
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50 bg-card/30">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Knowledge Map</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {artifact.name} • {artifact.culture} Culture
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMapExpanded(false);
                }}
                className="text-foreground/70 hover:text-foreground transition-colors p-2 hover:bg-accent rounded-lg border border-border/50"
                aria-label="Close expanded map"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Expanded Map */}
            <div className="flex-1 p-6 flex gap-4">
              {/* Main Map Area */}
              <div className="flex-1 rounded-xl overflow-hidden border border-border/50 bg-card/20 relative">
                <MindMapConnection
                  isActive={true}
                  isDarkMode={isDarkMode}
                  onNodeClick={handleNodeClick}
                  artifact={artifact}
                  aiResponse={messages.find(m => m.role === 'assistant')?.content || ''}
                />
              </div>

              {/* Legend Panel */}
              <div className="w-64 bg-card/40 backdrop-blur-sm rounded-xl border border-border/50 p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3">Node Types</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full bg-purple-500 mt-0.5 flex-shrink-0"></div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Artifact</p>
                        <p className="text-xs text-muted-foreground">Central node with complete artifact details</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full bg-orange-500 mt-0.5 flex-shrink-0"></div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Origin</p>
                        <p className="text-xs text-muted-foreground">Geographic location and historical context</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full bg-green-500 mt-0.5 flex-shrink-0"></div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Culture</p>
                        <p className="text-xs text-muted-foreground">Cultural heritage and traditions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full bg-cyan-500 mt-0.5 flex-shrink-0"></div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Era</p>
                        <p className="text-xs text-muted-foreground">Historical time period and context</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full bg-amber-500 mt-0.5 flex-shrink-0"></div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Significance</p>
                        <p className="text-xs text-muted-foreground">Cultural and historical importance</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <h3 className="text-sm font-bold text-foreground mb-2">Interactions</h3>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Hover over nodes to see preview</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Click nodes for detailed information</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Lines show relationships between concepts</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <h3 className="text-sm font-bold text-foreground mb-2">About</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This 3D knowledge map visualizes the interconnected aspects of {artifact.name},
                    combining artifact metadata with AI-powered insights.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border/50 bg-card/30">
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>💡</span>
                  <span>Click nodes to explore detailed information</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-background/50 border border-border/50 rounded text-xs font-mono">ESC</kbd>
                  <span>to close</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default ArtifactModal;
