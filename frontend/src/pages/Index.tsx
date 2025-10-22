import { useState, useEffect } from "react";
import Header from "@/components/Header";
import MapView from "@/components/MapView";
import ArtifactModal from "@/components/ArtifactModal";
import TimelineView from "@/components/TimelineView";
import { OnboardingTour } from "@/components/OnboardingTour";
import { VoiceInterface } from "@/components/VoiceInterface";
import { CommunityContribution } from "@/components/CommunityContribution";
import { ImpactDashboard } from "@/components/ImpactDashboard";
import { Artifact } from "@/data/artifacts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, TrendingUp, Upload, Mic } from "lucide-react";

const Index = () => {
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState("explore");
  const [voiceInput, setVoiceInput] = useState("");

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('kulturamind_onboarding_completed');
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleArtifactClick = (artifact: Artifact) => {
    setSelectedArtifact(artifact);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Keep artifact data for smooth closing animation
    setTimeout(() => setSelectedArtifact(null), 300);
  };

  const handleVoiceInput = (text: string) => {
    setVoiceInput(text);
    // You can trigger a search or chat with the voice input
    console.log('Voice input:', text);
  };

  return (
    <>
      {showOnboarding && (
        <OnboardingTour onComplete={() => setShowOnboarding(false)} />
      )}

      <main className="relative w-full h-screen overflow-hidden bg-background pt-14 sm:pt-16">
        <Header />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
            <TabsList className="bg-white/90 backdrop-blur-sm shadow-lg">
              <TabsTrigger value="explore" className="gap-2">
                <Map className="w-4 h-4" />
                Explore
              </TabsTrigger>
              <TabsTrigger value="impact" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Impact
              </TabsTrigger>
              <TabsTrigger value="contribute" className="gap-2">
                <Upload className="w-4 h-4" />
                Contribute
              </TabsTrigger>
              <TabsTrigger value="voice" className="gap-2">
                <Mic className="w-4 h-4" />
                Voice
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="explore" className="h-full m-0">
            <MapView onArtifactClick={handleArtifactClick} />
          </TabsContent>

          <TabsContent value="impact" className="h-full m-0 overflow-y-auto p-6">
            <ImpactDashboard />
          </TabsContent>

          <TabsContent value="contribute" className="h-full m-0 overflow-y-auto p-6">
            <CommunityContribution />
          </TabsContent>

          <TabsContent value="voice" className="h-full m-0 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Voice Interface</h2>
                <p className="text-gray-600">
                  Speak in your language to explore African cultural heritage
                </p>
              </div>
              <VoiceInterface
                onVoiceInput={handleVoiceInput}
                responseText="Welcome to KulturaMind! Ask me anything about African cultures."
              />
            </div>
          </TabsContent>
        </Tabs>

        <ArtifactModal
          artifact={selectedArtifact}
          open={isModalOpen}
          onClose={handleCloseModal}
        />

        {/* Floating Action Button to restart tour */}
        <Button
          onClick={() => setShowOnboarding(true)}
          className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg z-20"
          size="icon"
          title="Restart Tour"
        >
          ?
        </Button>
      </main>
    </>
  );
};

export default Index;
