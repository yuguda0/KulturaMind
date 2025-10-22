/**
 * Onboarding Tour Component
 * Interactive guide explaining KulturaMind's mission and features
 */

import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Users, Globe, Award, Mic, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface OnboardingTourProps {
  onComplete: () => void;
}

const TOUR_STEPS = [
  {
    title: 'Welcome to KulturaMind',
    icon: <img src="/logo.png" alt="KulturaMind" className="w-16 h-16 object-contain" />,
    description: 'A decentralized AGI platform preserving African cultural heritage for future generations.',
    highlights: [
      '16+ African cultures documented',
      '160+ verified cultural items',
      'Powered by AI and community knowledge',
    ],
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Decentralized AGI',
    icon: <Globe className="w-12 h-12 text-blue-600" />,
    description: 'Five specialized AI agents work together to provide accurate, comprehensive cultural knowledge.',
    highlights: [
      'Heritage Keeper: Cultural knowledge base',
      'Research Agent: Web enrichment',
      'Verification Agent: Fact-checking',
      'Translation Agent: 8 languages',
      'Coordinator: Orchestrates all agents',
    ],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Community-Driven',
    icon: <Users className="w-12 h-12 text-green-600" />,
    description: 'Contribute your cultural knowledge and earn FET tokens. Expert validators ensure quality.',
    highlights: [
      'Submit cultural artifacts',
      'Earn up to 100 FET per contribution',
      'Expert validation system',
      'Decentralized governance',
    ],
    color: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Voice Interface',
    icon: <Mic className="w-12 h-12 text-yellow-600" />,
    description: 'Accessible to all, including low-literacy communities. Speak in your native language.',
    highlights: [
      'Voice input in 8 languages',
      'Automatic text-to-speech responses',
      'Mobile-first design',
      'No typing required',
    ],
    color: 'from-yellow-500 to-orange-500',
  },
  {
    title: 'Explore & Learn',
    icon: <BookOpen className="w-12 h-12 text-indigo-600" />,
    description: 'Discover festivals, art forms, traditions, languages, and proverbs from across Africa.',
    highlights: [
      'Interactive knowledge graph',
      'Chat with AI assistant',
      'Explore cultural connections',
      'Learn in your language',
    ],
    color: 'from-indigo-500 to-purple-500',
  },
  {
    title: 'Make an Impact',
    icon: <Award className="w-12 h-12 text-pink-600" />,
    description: 'Join us in preserving cultural heritage and building AGI that benefits everyone.',
    highlights: [
      'Preserve endangered cultures',
      'Empower global south communities',
      'Earn rewards for contributions',
      'Shape the future of AGI',
    ],
    color: 'from-pink-500 to-rose-500',
  },
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('kulturamind_onboarding_completed', 'true');
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-card border-border">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Icon with Gradient Background */}
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 mx-auto`}>
            {step.icon}
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center mb-4 text-foreground">{step.title}</h2>

          {/* Description */}
          <p className="text-muted-foreground text-center mb-6 text-lg">{step.description}</p>

          {/* Highlights */}
          <div className="space-y-3 mb-8">
            {step.highlights.map((highlight, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
                <span className="text-foreground">{highlight}</span>
              </div>
            ))}
          </div>

          {/* Visual Indicator */}
          {currentStep === 0 && (
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-purple-500/10 rounded-lg border-2 border-purple-500/30">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  🌍 Preserving heritage • 🤖 Powered by AGI • 👥 Community-driven
                </p>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-blue-500/10 rounded-lg border-2 border-blue-500/30">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  ⚡ 5 AI Agents • 🌐 Decentralized • 🔍 Fact-checked
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-green-500/10 rounded-lg border-2 border-green-500/30">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  💰 Earn FET Tokens • ✅ Expert Validation • 🏆 Build Reputation
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-yellow-500/10 rounded-lg border-2 border-yellow-500/30">
                <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                  🎤 Voice Input • 🔊 Audio Output • 📱 Mobile-First
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-indigo-500/10 rounded-lg border-2 border-indigo-500/30">
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                  🗺️ Knowledge Graph • 💬 AI Chat • 🌍 16+ Cultures
                </p>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-pink-500/10 rounded-lg border-2 border-pink-500/30">
                <p className="text-sm text-pink-600 dark:text-pink-400 font-medium">
                  🎯 Real Impact • 🌱 Growing Daily • 🤝 Join the Movement
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4 flex items-center justify-between z-10">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-purple-600 w-6'
                    : index < currentStep
                    ? 'bg-purple-400'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <Button onClick={handleNext}>
            {currentStep === TOUR_STEPS.length - 1 ? (
              <>
                Get Started
                <Sparkles className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

