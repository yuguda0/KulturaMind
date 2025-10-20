import { useRef, useEffect, useState } from 'react';
import { Send, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import StorySuggestions from './StorySuggestions';
import MindMapConnection from './MindMapConnection';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface StorySuggestion {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'origin' | 'significance' | 'connection' | 'practice';
}

interface AIAssistantProps {
  messages: Message[];
  isTyping: boolean;
  isConnected: boolean;
  inputMessage: string;
  onInputChange: (message: string) => void;
  onSendMessage: () => void;
  error?: string | null;
  artifactName?: string;
  suggestions?: string[];
}

const AIAssistant = ({
  messages,
  isTyping,
  isConnected,
  inputMessage,
  onInputChange,
  onSendMessage,
  error,
  artifactName = 'this artifact',
  suggestions: dynamicSuggestions = [],
}: AIAssistantProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<StorySuggestion[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Use dynamic suggestions if provided, otherwise use generic ones
  useEffect(() => {
    if (dynamicSuggestions.length > 0) {
      // Convert dynamic suggestions to StorySuggestion format
      const formattedSuggestions = dynamicSuggestions.slice(0, 4).map((text, index) => ({
        id: `suggestion-${index}`,
        title: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        description: text,
        icon: ['📖', '🎨', '🌟', '💫'][index % 4],
        category: ['origin', 'significance', 'connection', 'practice'][index % 4] as any,
      }));
      setSuggestions(formattedSuggestions);
    } else {
      setSuggestions([
        {
          id: 'origin',
          title: 'Where does it come from?',
          description: 'Explore the origins and creation',
          icon: '🌍',
          category: 'origin',
        },
        {
          id: 'significance',
          title: 'Why is it important?',
          description: 'Understand its cultural impact',
          icon: '✨',
          category: 'significance',
        },
        {
          id: 'connection',
          title: 'How does it connect?',
          description: 'See links to other artifacts',
          icon: '🔗',
          category: 'connection',
        },
        {
          id: 'practice',
          title: 'How was it used?',
          description: 'Learn about its practices',
          icon: '🎭',
          category: 'practice',
        },
      ]);
    }
  }, [dynamicSuggestions, artifactName]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && isConnected && !isTyping) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleSuggestionClick = (id: string, title: string) => {
    onInputChange(title);
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden border-l border-border">
      {/* Header - Minimal */}
      <div className="px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-foreground text-sm">Heritage Keeper</h3>
        </div>
      </div>

      {/* Messages Area */}
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-6 px-6 overflow-y-auto">
          {/* Suggestion Prompt */}
          <div className="space-y-3 flex-shrink-0">
            <div className="mb-4 p-3 rounded-full bg-accent/10 inline-block">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground">
              Explore the story of this artifact
            </p>
            <p className="text-xs text-muted-foreground/70">
              👇 Click a suggestion below or ask your own question
            </p>
          </div>

          {/* Story Suggestions */}
          <div className="flex-shrink-0">
            <StorySuggestions
              suggestions={suggestions}
              onSuggestionClick={handleSuggestionClick}
            />
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                } animate-slide-up`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-accent text-accent-foreground rounded-br-none'
                      : 'bg-card/50 border border-border/50 text-foreground rounded-bl-none'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="text-sm leading-relaxed prose prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          code: ({ children }) => (
                            <code className="bg-background/50 px-1 py-0.5 rounded text-xs font-mono">
                              {children}
                            </code>
                          ),
                          h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-slide-up">
                <div className="bg-card/50 border border-border/50 px-4 py-3 rounded-lg rounded-bl-none">
                  <div className="flex items-center gap-2">
                    <div className="typing-indicator flex gap-1">
                      <span className="w-2 h-2 bg-accent rounded-full"></span>
                      <span className="w-2 h-2 bg-accent rounded-full"></span>
                      <span className="w-2 h-2 bg-accent rounded-full"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex justify-center">
                <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      {/* Input Area */}
      <div className="border-t border-border/50 bg-background p-6 space-y-3">
        {!isConnected && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Backend API is not available. Please ensure the backend is running.
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Ask about this artifact..."
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isConnected || isTyping}
            className="flex-1 rounded-lg border-border/50 bg-card/50 focus:ring-accent"
          />
          <Button
            onClick={onSendMessage}
            disabled={!isConnected || isTyping || !inputMessage.trim()}
            className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;

