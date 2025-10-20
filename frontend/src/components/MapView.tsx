import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Artifact } from "@/services/api";
import { apiClient } from "@/services/api";

interface MapViewProps {
  onArtifactClick: (artifact: Artifact) => void;
}

const MapView = ({ onArtifactClick }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState("");
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);

  // Mock artifacts for development
  const mockArtifacts: Artifact[] = [
    {
      id: "1",
      name: "Nok Terracotta Head",
      location: "Kaduna, Nigeria",
      coordinates: [7.5, 9.5],
      era: "500 BCE - 500 CE",
      year: "300 BCE",
      description: "Ancient terracotta sculpture from the Nok culture",
      significance: "Represents one of Africa's earliest sophisticated art forms",
      culturalContext: "Nok civilization",
      culture: "Nok",
      imageUrl: "https://images.unsplash.com/photo-1578926078328-123456789012?w=200&h=200&fit=crop"
    },
    {
      id: "2",
      name: "Benin Bronze Plaque",
      location: "Benin City, Nigeria",
      coordinates: [5.6, 6.3],
      era: "13th - 19th Century",
      year: "1500 CE",
      description: "Intricate bronze plaque from the Kingdom of Benin",
      significance: "Masterpiece of African metalwork and royal documentation",
      culturalContext: "Benin Kingdom",
      culture: "Yoruba",
      imageUrl: "https://images.unsplash.com/photo-1578926078328-123456789013?w=200&h=200&fit=crop"
    },
    {
      id: "3",
      name: "Igbo Ukwu Bronzes",
      location: "Anambra, Nigeria",
      coordinates: [6.8, 6.1],
      era: "9th - 10th Century",
      year: "900 CE",
      description: "Sophisticated bronze vessels and sculptures",
      significance: "Evidence of advanced metallurgical techniques in ancient Africa",
      culturalContext: "Igbo civilization",
      culture: "Igbo",
      imageUrl: "https://images.unsplash.com/photo-1578926078328-123456789014?w=200&h=200&fit=crop"
    }
  ];

  // Load artifacts from backend
  useEffect(() => {
    const loadArtifacts = async () => {
      try {
        const response = await apiClient.getArtifacts();
        if (response.artifacts && response.artifacts.length > 0) {
          setArtifacts(response.artifacts);
        } else {
          // Use mock data if backend returns empty
          setArtifacts(mockArtifacts);
        }
      } catch (error) {
        console.error('Failed to load artifacts from backend, using mock data:', error);
        // Fallback to mock data if backend is not available
        setArtifacts(mockArtifacts);
      }
    };

    loadArtifacts();
  }, []);

  // Handle theme changes
  useEffect(() => {
    if (!map.current) return;

    const isDarkMode = document.documentElement.classList.contains('dark');
    const newStyle = isDarkMode ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11";

    // Update map style when theme changes
    map.current.setStyle(newStyle);
  }, []);

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      if (!map.current) return;

      const isDarkMode = document.documentElement.classList.contains('dark');
      const newStyle = isDarkMode ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11";
      map.current.setStyle(newStyle);
    };

    // Watch for class changes on html element
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    const token =
      "pk.eyJ1IjoidmljbWFwcCIsImEiOiJjbWd3dzYxOGswc292MmtzYnR6MWN5ZjhkIn0.0rOfm0O950nX9jD05_8Z3w";
    if (!token) {
      alert(
        "Mapbox token is required to display the map. Please refresh and enter a valid token."
      );
      return;
    }

    setMapboxToken(token);
    mapboxgl.accessToken = token;

    // Initialize map centered on Nigeria with dark mode
    const isDarkMode = document.documentElement.classList.contains('dark');
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: isDarkMode ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11",
      center: [8.0, 9.0],
      zoom: 5.5,
      pitch: 45,
      bearing: 0,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      "top-right"
    );

    // Add 3D terrain (optional - makes the map more immersive)
    map.current.on("load", () => {
      // Add terrain source if you want 3D elevation
      map.current?.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });

      map.current?.setTerrain({ source: "mapbox-dem", exaggeration: 1 });

      // Add artifacts as floating image markers
      artifacts.forEach((artifact) => {
        // Create wrapper element
        const wrapperEl = document.createElement("div");
        wrapperEl.className = "marker-wrapper";

        // Create the floating image marker
        const markerEl = document.createElement("div");
        markerEl.className = "floating-artifact-marker";

        // Create image element
        const imgEl = document.createElement("img");
        imgEl.src = artifact.imageUrl; // Make sure your Artifact type has imageUrl
        imgEl.alt = artifact.name;
        imgEl.style.width = "100%";
        imgEl.style.height = "100%";
        imgEl.style.objectFit = "cover";
        imgEl.style.borderRadius = "12px";

        // Create floating effect container
        const floatContainer = document.createElement("div");
        floatContainer.className = "float-container";
        floatContainer.style.width = "80px";
        floatContainer.style.height = "80px";
        floatContainer.style.position = "relative";
        floatContainer.style.transition = "all 0.3s ease";

        // Add shadow element for floating effect
        const shadowEl = document.createElement("div");
        shadowEl.className = "floating-shadow";
        shadowEl.style.position = "absolute";
        shadowEl.style.bottom = "-10px";
        shadowEl.style.left = "50%";
        shadowEl.style.transform = "translateX(-50%)";
        shadowEl.style.width = "40px";
        shadowEl.style.height = "8px";
        shadowEl.style.backgroundColor = "rgba(0,0,0,0.2)";
        shadowEl.style.borderRadius = "50%";
        shadowEl.style.filter = "blur(4px)";
        shadowEl.style.transition = "all 0.3s ease";

        // Assemble the marker
        floatContainer.appendChild(imgEl);
        floatContainer.appendChild(shadowEl);
        markerEl.appendChild(floatContainer);
        wrapperEl.appendChild(markerEl);

        // Add hover effects
        wrapperEl.addEventListener("mouseenter", () => {
          floatContainer.style.transform = "scale(1.2) translateY(-5px)";
          shadowEl.style.width = "50px";
          shadowEl.style.filter = "blur(6px)";
          shadowEl.style.backgroundColor = "rgba(0,0,0,0.3)";
        });

        wrapperEl.addEventListener("mouseleave", () => {
          floatContainer.style.transform = "scale(1) translateY(0)";
          shadowEl.style.width = "40px";
          shadowEl.style.filter = "blur(4px)";
          shadowEl.style.backgroundColor = "rgba(0,0,0,0.2)";
        });

        // Add click handler
        wrapperEl.addEventListener("click", () => {
          onArtifactClick(artifact);
        });

        // Create and add marker
        const marker = new mapboxgl.Marker({
          element: wrapperEl,
          anchor: "bottom",
        })
          .setLngLat(artifact.coordinates)
          .addTo(map.current!);

        markersRef.current.push(marker);
      });
    });

    // Cleanup
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, [onArtifactClick, artifacts]);

  return (
    <div className="relative w-full h-screen pt-16">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-card/80 backdrop-blur-md px-6 py-4 rounded-lg shadow-lg border border-border/50 hover:shadow-xl transition-shadow duration-300 animate-slide-up animation-delay-200">
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground text-sm">Explore</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-lg">🏛️</span>
              <span className="text-sm text-muted-foreground">Click artifacts</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">💬</span>
              <span className="text-sm text-muted-foreground">Chat with AI</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">🌍</span>
              <span className="text-sm text-muted-foreground">Discover stories</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Stats Card */}
      <div className="absolute top-20 right-4 bg-card/80 backdrop-blur-md px-6 py-4 rounded-lg shadow-lg border border-border/50 hover:shadow-xl transition-shadow duration-300 animate-slide-up animation-delay-100">
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">19</p>
            <p className="text-xs text-muted-foreground">Artifacts</p>
          </div>
          <div className="text-center border-l border-r border-border/30">
            <p className="text-2xl font-bold text-secondary">3</p>
            <p className="text-xs text-muted-foreground">Cultures</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">∞</p>
            <p className="text-xs text-muted-foreground">Stories</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
