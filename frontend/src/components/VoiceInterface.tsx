/**
 * Voice Interface Component
 * Provides voice input/output for low-literacy users
 * Supports 8 African languages
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Languages } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

interface VoiceInterfaceProps {
  onVoiceInput: (text: string) => void;
  responseText?: string;
  className?: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English', flag: '🇬🇧' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'sw-KE', name: 'Swahili', flag: '🇰🇪' },
  { code: 'ha-NG', name: 'Hausa', flag: '🇳🇬' },
  { code: 'yo-NG', name: 'Yoruba', flag: '🇳🇬' },
  { code: 'ig-NG', name: 'Igbo', flag: '🇳🇬' },
  { code: 'zu-ZA', name: 'Zulu', flag: '🇿🇦' },
  { code: 'am-ET', name: 'Amharic', flag: '🇪🇹' },
];

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onVoiceInput,
  responseText,
  className = '',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [isSupported, setIsSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;

    if (!SpeechRecognition || !speechSynthesis) {
      setIsSupported(false);
      return;
    }

    synthRef.current = speechSynthesis;

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = selectedLanguage;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setInterimTranscript('');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);
      if (final) {
        setTranscript(final);
        onVoiceInput(final);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [selectedLanguage, onVoiceInput]);

  // Auto-speak response when it changes
  useEffect(() => {
    if (responseText && synthRef.current) {
      speakText(responseText);
    }
  }, [responseText]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Update language before starting
      recognitionRef.current.lang = selectedLanguage;
      recognitionRef.current.start();
    }
  };

  const speakText = (text: string) => {
    if (!synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage;
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isSupported) {
    return (
      <Card className={`p-4 bg-yellow-500/10 border-yellow-500/30 ${className}`}>
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          ⚠️ Voice interface not supported in this browser. Please use Chrome, Edge, or Safari.
        </p>
      </Card>
    );
  }

  return (
    <Card className={`p-4 space-y-4 bg-card border-border ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="KulturaMind" className="w-6 h-6 object-contain" />
          <Languages className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-sm text-foreground">Voice Interface</h3>
          <Badge variant="secondary" className="text-xs">
            Accessibility
          </Badge>
        </div>

        {/* Language Selector */}
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code} className="text-xs">
                {lang.flag} {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Voice Controls */}
      <div className="flex items-center gap-3">
        {/* Microphone Button */}
        <Button
          onClick={toggleListening}
          variant={isListening ? 'destructive' : 'default'}
          size="lg"
          className="flex-1"
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5 mr-2" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 mr-2" />
              Start Speaking
            </>
          )}
        </Button>

        {/* Speaker Button */}
        <Button
          onClick={isSpeaking ? stopSpeaking : () => responseText && speakText(responseText)}
          variant={isSpeaking ? 'destructive' : 'outline'}
          size="lg"
          disabled={!responseText}
        >
          {isSpeaking ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-1">You said:</p>
          <p className="text-sm text-foreground">
            {transcript}
            {interimTranscript && (
              <span className="text-muted-foreground italic"> {interimTranscript}</span>
            )}
          </p>
        </div>
      )}

      {/* Status Indicator */}
      <div className="flex items-center gap-2 text-xs">
        {isListening && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-pulse" />
            Listening...
          </div>
        )}
        {isSpeaking && (
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" />
            Speaking...
          </div>
        )}
        {!isListening && !isSpeaking && (
          <div className="text-muted-foreground">
            Tap microphone to speak in {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-500/10 p-2 rounded border border-blue-500/30">
        💡 <strong>Tip:</strong> Speak clearly and wait for the response. The AI will read answers aloud automatically.
      </div>
    </Card>
  );
};

