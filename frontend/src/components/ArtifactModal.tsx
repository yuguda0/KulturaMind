import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Artifact } from '@/data/artifacts';
import { apiClient } from '@/services/api';
import AIAssistant from './AIAssistant';
import CulturalContext from './CulturalContext';
import MindMapConnection from './MindMapConnection';
import NodeInfoModal from './NodeInfoModal';

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
  const scrollRef = useRef<HTMLDivElement>(null);

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

    try {
      // Create context-aware query with artifact information
      const contextualQuery = `About the ${artifact.name} from ${artifact.location} (${artifact.era} era, ${artifact.year}): ${inputMessage}`;

      // Initialize assistant message
      let assistantContent = '';
      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantContent
      };

      // Add empty assistant message to messages
      setMessages(prev => [...prev, assistantMessage]);

      // Stream the response
      for await (const chunk of apiClient.streamChat(contextualQuery, true, true)) {
        if (chunk.type === 'content' || chunk.type === 'complete') {
          assistantContent = chunk.data || '';
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
  };

  if (!artifact) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] md:h-[90vh] p-0 gap-0 bg-background border-border w-[95vw] md:w-auto max-h-[90vh]">
        {/* Main Content Grid - Responsive Layout */}
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          {/* Left Panel - Cultural Context or Mind Map - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:flex md:w-2/5 border-r border-border/50 overflow-y-auto bg-background p-4 md:p-6">
            {showMindMap && messages.length > 0 ? (
              <div className="h-full flex flex-col w-full">
                <h3 className="text-lg font-bold mb-4 text-foreground">Knowledge Map</h3>
                <div className="flex-1 rounded-lg overflow-hidden border border-border/50 bg-card/30">
                  <MindMapConnection
                    isActive={true}
                    isDarkMode={isDarkMode}
                    onNodeClick={handleNodeClick}
                  />
                </div>
              </div>
            ) : (
              <CulturalContext artifact={artifact} />
            )}
          </div>

          {/* Right Panel - AI Assistant Chat - Full width on mobile */}
          <div className="w-full md:w-3/5 flex flex-col overflow-hidden">
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
      />
    )}
  </>
  );
};

export default ArtifactModal;
