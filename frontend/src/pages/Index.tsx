import { useState } from "react";
import Header from "@/components/Header";
import MapView from "@/components/MapView";
import ArtifactModal from "@/components/ArtifactModal";
import TimelineView from "@/components/TimelineView";
import { Artifact } from "@/data/artifacts";

const Index = () => {
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleArtifactClick = (artifact: Artifact) => {
    setSelectedArtifact(artifact);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Keep artifact data for smooth closing animation
    setTimeout(() => setSelectedArtifact(null), 300);
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-background pt-14 sm:pt-16">
      <Header />
      <MapView onArtifactClick={handleArtifactClick} />
      {/* <TimelineView /> */}
      <ArtifactModal
        artifact={selectedArtifact}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </main>
  );
};

export default Index;
