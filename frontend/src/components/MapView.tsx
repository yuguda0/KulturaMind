import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Artifact } from "@/services/api";
import { apiClient } from "@/services/api";
import MapSearch from "./MapSearch";

interface MapViewProps {
  onArtifactClick: (artifact: Artifact) => void;
}

interface SearchableItem {
  id: string;
  name: string;
  type: 'artifact' | 'culture' | 'location';
  culture?: string;
  location?: string;
  coordinates?: [number, number];
  artifact?: Artifact;
}

const MapView = ({ onArtifactClick }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState("");
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);

  // Calculate unique cultures from artifacts
  const uniqueCultures = new Set(artifacts.map(a => a.culture).filter(Boolean));

  // Handle search result selection - pan and zoom to location
  const handleSearchResultSelect = useCallback((item: SearchableItem) => {
    if (!map.current || !item.coordinates) return;

    // Determine zoom level based on search type
    let zoomLevel = 10; // Default zoom for artifacts
    if (item.type === 'culture') {
      zoomLevel = 7; // Wider view for cultures
    } else if (item.type === 'location') {
      zoomLevel = 9; // Medium view for locations
    }

    // Fly to the selected location with smooth animation
    map.current.flyTo({
      center: item.coordinates,
      zoom: zoomLevel,
      pitch: 45,
      bearing: 0,
      duration: 2000, // 2 second animation
      essential: true, // This animation is considered essential with respect to prefers-reduced-motion
    });

    // If it's an artifact, also trigger the artifact click after animation
    if (item.type === 'artifact' && item.artifact) {
      setTimeout(() => {
        onArtifactClick(item.artifact!);
      }, 2100); // Slightly after the animation completes
    }
  }, [onArtifactClick]);

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
    const isMobile = window.innerWidth < 768;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: isDarkMode ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11",
      center: [8.0, 9.0],
      zoom: isMobile ? 4.5 : 5.5,
      pitch: isMobile ? 0 : 45,
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

      // Add artifacts as modern glassmorphism card markers
      const isMobileView = window.innerWidth < 768;

      artifacts.forEach((artifact) => {
        // Create wrapper element
        const wrapperEl = document.createElement("div");
        wrapperEl.className = "marker-wrapper";
        wrapperEl.style.cursor = "pointer";

        // Create the modern pin marker
        const markerEl = document.createElement("div");
        markerEl.className = "modern-artifact-marker";

        // Create pin container
        const pinEl = document.createElement("div");
        pinEl.className = "artifact-pin";

        // Create location icon (SVG)
        const iconEl = document.createElement("div");
        iconEl.className = "artifact-pin-icon";
        iconEl.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  fill="currentColor"/>
          </svg>
        `;

        // Create info card (appears on hover)
        const infoCard = document.createElement("div");
        infoCard.className = "artifact-info-card";

        // Create title
        const titleEl = document.createElement("div");
        titleEl.className = "artifact-title";
        titleEl.textContent = artifact.name;

        // Create location subtitle
        const locationEl = document.createElement("div");
        locationEl.className = "artifact-location";
        locationEl.textContent = artifact.location;

        // Assemble the marker
        infoCard.appendChild(titleEl);
        infoCard.appendChild(locationEl);
        pinEl.appendChild(iconEl);
        pinEl.appendChild(infoCard);
        markerEl.appendChild(pinEl);
        wrapperEl.appendChild(markerEl);

        // Add hover effects (desktop)
        wrapperEl.addEventListener("mouseenter", () => {
          pinEl.style.transform = "scale(1.15) translateY(-3px)";
          infoCard.style.opacity = "1";
          infoCard.style.transform = "translateY(0)";
        });

        wrapperEl.addEventListener("mouseleave", () => {
          pinEl.style.transform = "scale(1) translateY(0)";
          infoCard.style.opacity = "0";
          infoCard.style.transform = "translateY(-5px)";
        });

        // Add touch effects (mobile)
        wrapperEl.addEventListener("touchstart", () => {
          pinEl.style.transform = "scale(1.12) translateY(-2px)";
          infoCard.style.opacity = "1";
          infoCard.style.transform = "translateY(0)";
        });

        wrapperEl.addEventListener("touchend", () => {
          setTimeout(() => {
            pinEl.style.transform = "scale(1) translateY(0)";
            infoCard.style.opacity = "0";
            infoCard.style.transform = "translateY(-5px)";
          }, 2000);
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
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Search Bar - Positioned at top left */}
      <div className="absolute top-16 sm:top-20 left-3 sm:left-4 z-10 w-[calc(100%-1.5rem)] sm:w-[400px] animate-slide-up">
        <MapSearch onResultSelect={handleSearchResultSelect} />
      </div>

      {/* Floating Stats Card - Moved to left side, below search */}
      <div className="absolute top-[140px] sm:top-[150px] left-3 sm:left-4 bg-card/80 backdrop-blur-md px-3 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg border border-border/50 hover:shadow-xl transition-shadow duration-300 animate-slide-up animation-delay-100">
        <div className="grid grid-cols-3 gap-2 sm:gap-6">
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold text-accent">{artifacts.length}</p>
            <p className="text-xs text-muted-foreground">Artifacts</p>
          </div>
          <div className="text-center border-l border-r border-border/30">
            <p className="text-lg sm:text-2xl font-bold text-secondary">{uniqueCultures.size}</p>
            <p className="text-xs text-muted-foreground">Cultures</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold text-primary">∞</p>
            <p className="text-xs text-muted-foreground">Stories</p>
          </div>
        </div>
      </div>

      {/* Legend - Moved higher to avoid zoom controls */}
      <div className="absolute bottom-20 sm:bottom-24 left-3 sm:left-4 bg-card/80 backdrop-blur-md px-3 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg border border-border/50 hover:shadow-xl transition-shadow duration-300 animate-slide-up animation-delay-200 hidden sm:block">
        <div className="space-y-2 sm:space-y-3">
          <h3 className="font-semibold text-foreground text-xs sm:text-sm">Explore</h3>
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-base sm:text-lg">🏛️</span>
              <span className="text-xs sm:text-sm text-muted-foreground">Click artifacts</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-base sm:text-lg">💬</span>
              <span className="text-xs sm:text-sm text-muted-foreground">Chat with AI</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-base sm:text-lg">🌍</span>
              <span className="text-xs sm:text-sm text-muted-foreground">Discover stories</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
