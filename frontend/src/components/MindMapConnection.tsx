import { useEffect, useRef, useState } from 'react';

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
  info?: string;
  fullInfo?: string;
}

interface Connection {
  from: string;
  to: string;
  strength: number;
}

interface Artifact {
  id: string;
  name: string;
  location: string;
  era: string;
  year: string;
  description: string;
  significance: string;
  culturalContext: string;
  culture: string;
}

interface MindMapConnectionProps {
  nodes?: Node[];
  connections?: Connection[];
  onNodeClick?: (nodeId: string, info?: string, fullInfo?: string) => void;
  isActive?: boolean;
  selectedNode?: string | null;
  isDarkMode?: boolean;
  artifact?: Artifact;
  aiResponse?: string;
}

// Theme-aware colors that adapt to dark/light mode
const getThemeColors = (isDarkMode: boolean) => ({
  center: isDarkMode ? '#A78BFA' : '#8B5CF6',      // Purple - softer in dark, richer in light
  origin: isDarkMode ? '#FB923C' : '#EA580C',      // Orange - softer in dark, richer in light
  culture: isDarkMode ? '#86EFAC' : '#22C55E',     // Green - softer in dark, richer in light
  era: isDarkMode ? '#67E8F9' : '#0891B2',         // Cyan - softer in dark, richer in light
  significance: isDarkMode ? '#FBBF24' : '#D97706', // Amber - softer in dark, richer in light
});

// Generate detailed node information based on artifact data
const generateNodeInfo = (nodeId: string, artifact?: Artifact, aiResponse?: string) => {
  if (!artifact) {
    return {
      info: 'Loading...',
      fullInfo: 'Detailed information will appear here.'
    };
  }

  const extractAIInfo = (keywords: string[]) => {
    if (!aiResponse) return '';
    const sentences = aiResponse.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const relevant = sentences.filter(s =>
      keywords.some(kw => s.toLowerCase().includes(kw.toLowerCase()))
    );
    return relevant.slice(0, 5).join('. ') + (relevant.length > 0 ? '.' : '');
  };

  switch (nodeId) {
    case 'center':
      return {
        info: `${artifact.name} - ${artifact.culture} Heritage`,
        fullInfo: `# ${artifact.name}\n\n**Culture:** ${artifact.culture}\n**Location:** ${artifact.location}\n**Era:** ${artifact.era} (${artifact.year})\n\n## Description\n${artifact.description}\n\n## Cultural Context\n${artifact.culturalContext}\n\n## Significance\n${artifact.significance}\n\n${extractAIInfo(['artifact', 'heritage', 'important', 'represents'])}`
      };

    case 'origin':
      const originAI = extractAIInfo(['origin', 'location', 'place', 'region', 'geography', 'where', 'from', 'situated', 'found']);
      return {
        info: `Geographic and Historical Origin`,
        fullInfo: `# Origin: ${artifact.location}\n\n## Geographic Location\nThe ${artifact.name} originates from **${artifact.location}**, a significant region in ${artifact.culture} territory. This location played a crucial role in the artifact's creation and cultural development.\n\n## Historical Context\n**Time Period:** ${artifact.era}\n**Specific Dating:** ${artifact.year}\n\nThe geographic origin of this artifact is deeply intertwined with the ${artifact.culture} civilization's expansion and cultural development during the ${artifact.era}. The location provided unique resources, environmental conditions, and cultural influences that shaped the artifact's characteristics.\n\n## Regional Significance\n${artifact.location} was a center of ${artifact.culture} cultural activity, trade, and artistic production. The region's:\n- **Natural Resources:** Influenced materials and techniques used\n- **Trade Routes:** Connected to broader cultural networks\n- **Political Importance:** Reflected in the artifact's creation and use\n- **Cultural Heritage:** Preserved through generations\n\n## AI Analysis\n${originAI || 'The origin of this artifact reflects the sophisticated understanding of geography and resources by the ' + artifact.culture + ' people.'}`
      };

    case 'culture':
      const cultureAI = extractAIInfo(['culture', 'cultural', 'tradition', 'society', 'people', 'beliefs', 'values', 'customs', 'practices']);
      return {
        info: `${artifact.culture} Cultural Heritage`,
        fullInfo: `# Cultural Context: ${artifact.culture} Civilization\n\n## Cultural Identity\nThe ${artifact.name} is a profound expression of **${artifact.culture} cultural identity**, embodying the values, beliefs, and artistic traditions that define this civilization.\n\n## Cultural Significance\n${artifact.culturalContext}\n\n## Traditional Practices\nThis artifact was created and used within the context of ${artifact.culture} traditional practices, which included:\n- **Artistic Traditions:** Unique styles and techniques passed down through generations\n- **Social Structures:** Reflecting hierarchies, roles, and relationships\n- **Spiritual Beliefs:** Connected to ${artifact.culture} cosmology and religious practices\n- **Daily Life:** Integrated into ceremonies, rituals, or everyday activities\n\n## Cultural Values\nThe ${artifact.culture} people valued:\n- **Craftsmanship:** Excellence in artistic and technical execution\n- **Heritage Preservation:** Maintaining connections to ancestors and traditions\n- **Community Identity:** Strengthening collective cultural bonds\n- **Symbolic Expression:** Communicating complex ideas through material culture\n\n## Living Heritage\nThe cultural traditions represented by the ${artifact.name} continue to influence modern ${artifact.culture} communities, serving as:\n- A source of cultural pride and identity\n- Educational material for younger generations\n- Inspiration for contemporary artists and craftspeople\n- A bridge connecting past and present\n\n## AI Analysis\n${cultureAI || 'The ' + artifact.culture + ' culture is renowned for its rich artistic traditions and deep spiritual connections, all reflected in this remarkable artifact.'}`
      };

    case 'era':
      const eraAI = extractAIInfo(['era', 'period', 'time', 'century', 'age', 'ancient', 'historical', 'when', 'dated', 'chronology']);
      return {
        info: `Historical Period: ${artifact.era}`,
        fullInfo: `# Historical Era: ${artifact.era}\n\n## Time Period\n**Era:** ${artifact.era}\n**Specific Dating:** ${artifact.year}\n\n## Historical Context\nThe ${artifact.era} was a pivotal period in ${artifact.culture} history, characterized by:\n\n### Political Landscape\n- **Governance:** The ${artifact.culture} civilization during this period had established political structures\n- **Territory:** Controlled significant regions including ${artifact.location}\n- **Leadership:** Rulers and leaders who patronized arts and culture\n- **Conflicts & Alliances:** Interactions with neighboring civilizations\n\n### Technological Advancement\nDuring the ${artifact.era}, the ${artifact.culture} people achieved:\n- **Material Innovation:** Advanced techniques in working with available materials\n- **Tool Development:** Sophisticated tools enabling precise craftsmanship\n- **Knowledge Systems:** Mathematical, astronomical, and engineering knowledge\n- **Artistic Techniques:** Unique methods of artistic expression and production\n\n### Social Development\n- **Urban Centers:** Growth of cities and cultural hubs like ${artifact.location}\n- **Trade Networks:** Extensive commerce connecting distant regions\n- **Social Stratification:** Complex hierarchies reflected in material culture\n- **Cultural Exchange:** Interaction with other civilizations and cultures\n\n### Artistic Flourishing\nThe ${artifact.era} witnessed:\n- **Stylistic Innovation:** Development of distinctive ${artifact.culture} artistic styles\n- **Patronage Systems:** Support for artists and craftspeople\n- **Cultural Production:** Creation of artifacts like the ${artifact.name}\n- **Aesthetic Principles:** Refined understanding of beauty and symbolism\n\n## Legacy\nThe ${artifact.era} left an enduring legacy that includes:\n- Artifacts and monuments that survive to this day\n- Cultural practices that influenced subsequent generations\n- Technological innovations that advanced human civilization\n- Artistic achievements that continue to inspire\n\n## AI Analysis\n${eraAI || 'The ' + artifact.era + ' represents a golden age of ' + artifact.culture + ' civilization, marked by remarkable achievements in art, culture, and society.'}`
      };

    case 'significance':
      const sigAI = extractAIInfo(['significance', 'important', 'meaning', 'value', 'represents', 'symbolizes', 'matters', 'legacy', 'impact']);
      return {
        info: `Cultural & Historical Significance`,
        fullInfo: `# Significance of ${artifact.name}\n\n## Overall Importance\n${artifact.significance}\n\n## Cultural Significance\nThe ${artifact.name} holds profound meaning for the ${artifact.culture} people:\n\n### Identity & Heritage\n- **Cultural Symbol:** Represents core ${artifact.culture} values and beliefs\n- **Ancestral Connection:** Links contemporary communities to their ancestors\n- **Pride & Recognition:** Source of cultural pride and international recognition\n- **Educational Value:** Teaches about ${artifact.culture} history and traditions\n\n### Spiritual & Symbolic Meaning\n- **Religious Significance:** May have been used in spiritual practices or ceremonies\n- **Symbolic Representation:** Embodies important cultural concepts and ideas\n- **Ritual Function:** Potentially played a role in significant cultural rituals\n- **Cosmological Connection:** Reflects ${artifact.culture} understanding of the universe\n\n## Historical Significance\n\n### Archaeological Importance\n- **Material Evidence:** Provides tangible proof of ${artifact.culture} civilization\n- **Dating & Chronology:** Helps establish timelines for the ${artifact.era}\n- **Technological Insight:** Reveals advanced techniques and knowledge\n- **Cultural Practices:** Illuminates daily life, ceremonies, and social structures\n\n### Academic Value\n- **Research Subject:** Studied by archaeologists, historians, and anthropologists\n- **Comparative Analysis:** Enables comparison with other civilizations\n- **Knowledge Preservation:** Contributes to understanding human history\n- **Interdisciplinary Study:** Connects art history, archaeology, and cultural studies\n\n## Contemporary Relevance\n\n### Modern Impact\n- **Cultural Continuity:** Maintains living connections to ${artifact.culture} heritage\n- **Tourism & Economy:** Attracts visitors and supports local communities\n- **Artistic Inspiration:** Influences contemporary ${artifact.culture} artists\n- **Global Recognition:** Represents ${artifact.culture} culture on the world stage\n\n### Preservation Importance\n- **Heritage Conservation:** Requires careful preservation for future generations\n- **Cultural Rights:** Represents indigenous cultural property and rights\n- **Repatriation Issues:** May be subject to discussions about cultural repatriation\n- **Digital Documentation:** Being recorded and shared through modern technology\n\n## Universal Significance\nBeyond its specific cultural context, the ${artifact.name} represents:\n- **Human Creativity:** Testament to universal human artistic expression\n- **Cultural Diversity:** Celebrates the richness of human cultural variation\n- **Historical Continuity:** Connects past, present, and future generations\n- **Shared Heritage:** Part of humanity's collective cultural inheritance\n\n## AI Analysis\n${sigAI || 'The ' + artifact.name + ' stands as a powerful testament to ' + artifact.culture + ' civilization, embodying centuries of cultural wisdom, artistic excellence, and historical significance.'}`
      };

    default:
      return {
        info: 'Unknown node',
        fullInfo: 'No information available'
      };
  }
};

const MindMapConnection = ({
  nodes = [],
  connections = [
    { from: 'center', to: 'origin', strength: 0.8 },
    { from: 'center', to: 'culture', strength: 0.9 },
    { from: 'center', to: 'era', strength: 0.7 },
    { from: 'center', to: 'significance', strength: 0.85 },
    { from: 'origin', to: 'culture', strength: 0.6 },
    { from: 'era', to: 'significance', strength: 0.5 },
  ],
  onNodeClick,
  isActive = true,
  selectedNode = null,
  isDarkMode = false,
  artifact,
  aiResponse,
}: MindMapConnectionProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0.5, y: 0.5 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const animationRef = useRef<number>();

  // Get theme-aware colors
  const themeColors = getThemeColors(isDarkMode);

  // Initialize nodes with detailed information
  const initializedNodes = nodes.length > 0 ? nodes : [
    {
      id: 'center',
      label: 'Artifact',
      x: 0,
      y: 0,
      z: 0,
      color: themeColors.center,
      size: 50,
      ...generateNodeInfo('center', artifact, aiResponse)
    },
    {
      id: 'origin',
      label: 'Origin',
      x: 150,
      y: -100,
      z: 50,
      color: themeColors.origin,
      size: 35,
      ...generateNodeInfo('origin', artifact, aiResponse)
    },
    {
      id: 'culture',
      label: 'Culture',
      x: -150,
      y: -100,
      z: 50,
      color: themeColors.culture,
      size: 35,
      ...generateNodeInfo('culture', artifact, aiResponse)
    },
    {
      id: 'era',
      label: 'Era',
      x: 100,
      y: 150,
      z: -50,
      color: themeColors.era,
      size: 35,
      ...generateNodeInfo('era', artifact, aiResponse)
    },
    {
      id: 'significance',
      label: 'Significance',
      x: -100,
      y: 150,
      z: -50,
      color: themeColors.significance,
      size: 35,
      ...generateNodeInfo('significance', artifact, aiResponse)
    },
  ];

  // 3D to 2D projection
  const project3D = (x: number, y: number, z: number, scale: number = 1) => {
    const perspective = 500;
    const scale3d = perspective / (perspective + z);
    return {
      x: x * scale3d * scale,
      y: y * scale3d * scale,
      z: z,
      scale: scale3d,
    };
  };

  // Rotate point in 3D space
  const rotatePoint = (
    x: number,
    y: number,
    z: number,
    rotX: number,
    rotY: number
  ) => {
    // Rotate around X axis
    let y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
    let z1 = y * Math.sin(rotX) + z * Math.cos(rotX);

    // Rotate around Y axis
    let x2 = x * Math.cos(rotY) + z1 * Math.sin(rotY);
    let z2 = -x * Math.sin(rotY) + z1 * Math.cos(rotY);

    return { x: x2, y: y1, z: z2 };
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.fillStyle = 'transparent';
    ctx.clearRect(0, 0, width, height);

    // Transform and project nodes
    const projectedNodes = initializedNodes.map((node) => {
      const rotated = rotatePoint(node.x, node.y, node.z, rotation.x, rotation.y);
      const projected = project3D(rotated.x, rotated.y, rotated.z, 1.5);
      return {
        ...node,
        screenX: centerX + projected.x,
        screenY: centerY + projected.y,
        scale: projected.scale,
      };
    });

    // Sort by z-depth (draw far nodes first)
    projectedNodes.sort((a, b) => a.z - b.z);

    // Draw connections
    connections.forEach((conn) => {
      const fromNode = projectedNodes.find((n) => n.id === conn.from);
      const toNode = projectedNodes.find((n) => n.id === conn.to);

      if (fromNode && toNode) {
        const gradient = ctx.createLinearGradient(
          fromNode.screenX,
          fromNode.screenY,
          toNode.screenX,
          toNode.screenY
        );
        gradient.addColorStop(0, fromNode.color + '40');
        gradient.addColorStop(1, toNode.color + '40');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = conn.strength * 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(fromNode.screenX, fromNode.screenY);
        ctx.lineTo(toNode.screenX, toNode.screenY);
        ctx.stroke();

        // Draw glow effect
        ctx.strokeStyle = fromNode.color + '20';
        ctx.lineWidth = conn.strength * 8;
        ctx.beginPath();
        ctx.moveTo(fromNode.screenX, fromNode.screenY);
        ctx.lineTo(toNode.screenX, toNode.screenY);
        ctx.stroke();
      }
    });

    // Draw nodes with improved design
    projectedNodes.forEach((node) => {
      const isHovered = hoveredNode === node.id;
      const isSelected = selectedNode === node.id;
      const size = node.size * node.scale * (isHovered || isSelected ? 1.5 : 1);

      // Outer glow (stronger if hovered/selected)
      const outerGlowGradient = ctx.createRadialGradient(
        node.screenX,
        node.screenY,
        0,
        node.screenX,
        node.screenY,
        size * 2.5
      );
      outerGlowGradient.addColorStop(0, node.color + (isHovered || isSelected ? '60' : '30'));
      outerGlowGradient.addColorStop(0.5, node.color + (isHovered || isSelected ? '30' : '15'));
      outerGlowGradient.addColorStop(1, node.color + '00');
      ctx.fillStyle = outerGlowGradient;
      ctx.beginPath();
      ctx.arc(node.screenX, node.screenY, size * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Inner shadow for depth
      const shadowGradient = ctx.createRadialGradient(
        node.screenX,
        node.screenY - size * 0.3,
        0,
        node.screenX,
        node.screenY,
        size
      );
      shadowGradient.addColorStop(0, node.color);
      shadowGradient.addColorStop(1, node.color + 'CC');
      ctx.fillStyle = shadowGradient;
      ctx.beginPath();
      ctx.arc(node.screenX, node.screenY, size, 0, Math.PI * 2);
      ctx.fill();

      // Glossy highlight
      const highlightGradient = ctx.createRadialGradient(
        node.screenX - size * 0.3,
        node.screenY - size * 0.3,
        0,
        node.screenX,
        node.screenY,
        size
      );
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlightGradient;
      ctx.beginPath();
      ctx.arc(node.screenX, node.screenY, size, 0, Math.PI * 2);
      ctx.fill();

      // Outer border ring (animated on hover)
      if (isHovered || isSelected) {
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, size + 5, 0, Math.PI * 2);
        ctx.stroke();

        // Second ring for extra emphasis
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, size + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Inner border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(node.screenX, node.screenY, size, 0, Math.PI * 2);
      ctx.stroke();

      // Node label with better contrast
      const labelColor = isDarkMode ? '#ffffff' : '#000000';
      const labelShadowColor = isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';

      // Label shadow for readability
      ctx.shadowColor = labelShadowColor;
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.fillStyle = labelColor;
      ctx.font = `bold ${Math.max(10, 12 * node.scale)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.screenX, node.screenY);

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    });
  };

  // Animation loop
  useEffect(() => {
    if (!isActive) return;

    const animate = () => {
      setRotation((prev) => ({
        x: prev.x + 0.003,
        y: prev.y + 0.005,
      }));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  // Draw on rotation change
  useEffect(() => {
    draw();
  }, [rotation, hoveredNode]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation(); // Prevent event from bubbling to parent elements
    e.preventDefault(); // Prevent default behavior

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Stop propagation to prevent closing the expanded map
    e.stopPropagation();

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is on a node - increased clickable area
    // Find the closest node and only trigger click for that one
    let closestNode: { id: string; info: string; fullInfo: string; distance: number } | null = null;

    initializedNodes.forEach((node) => {
      const rotated = rotatePoint(node.x, node.y, node.z, rotation.x, rotation.y);
      const projected = project3D(rotated.x, rotated.y, rotated.z, 1.5);
      const screenX = canvas.width / 2 + projected.x;
      const screenY = canvas.height / 2 + projected.y;
      const size = node.size * projected.scale;

      const distance = Math.sqrt((x - screenX) ** 2 + (y - screenY) ** 2);
      // Increased clickable area from 1.5x to 3x for better interaction
      if (distance < size * 3) {
        if (!closestNode || distance < closestNode.distance) {
          closestNode = {
            id: node.id,
            info: node.info,
            fullInfo: node.fullInfo,
            distance: distance
          };
        }
      }
    });

    // Only trigger click for the closest node
    if (closestNode) {
      onNodeClick?.(closestNode.id, closestNode.info, closestNode.fullInfo);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let foundNode: string | null = null;

    initializedNodes.forEach((node) => {
      const rotated = rotatePoint(node.x, node.y, node.z, rotation.x, rotation.y);
      const projected = project3D(rotated.x, rotated.y, rotated.z, 1.5);
      const screenX = canvas.width / 2 + projected.x;
      const screenY = canvas.height / 2 + projected.y;
      const size = node.size * projected.scale;

      const distance = Math.sqrt((x - screenX) ** 2 + (y - screenY) ** 2);
      // Increased hover area to 3x for better interaction
      if (distance < size * 3) {
        foundNode = node.id;
      }
    });

    setHoveredNode(foundNode);
    canvas.style.cursor = foundNode ? 'pointer' : 'default';
  };

  // Update canvas size on mount and window resize
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const parent = canvasRef.current.parentElement;
        const width = parent.clientWidth;
        const height = parent.clientHeight;

        if (canvasRef.current.width !== width || canvasRef.current.height !== height) {
          canvasRef.current.width = width;
          canvasRef.current.height = height;
          draw();
        }
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-background to-card/50 rounded-lg overflow-hidden relative">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
        className={`w-full h-full ${hoveredNode ? 'cursor-pointer' : 'cursor-grab'} active:cursor-grabbing`}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Hover tooltip showing node info */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-card/95 backdrop-blur-md border border-border/50 rounded-lg px-4 py-2 shadow-xl max-w-xs pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="text-sm font-semibold text-foreground">
            {initializedNodes.find(n => n.id === hoveredNode)?.label}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {initializedNodes.find(n => n.id === hoveredNode)?.info}
          </p>
          <p className="text-xs text-primary mt-1">Click to view details</p>
        </div>
      )}

      <div className="absolute bottom-2 left-2 text-xs text-muted-foreground flex items-center gap-2">
        <span>💡 Click nodes to explore</span>
        {artifact && (
          <span className="text-primary">• {initializedNodes.length} nodes</span>
        )}
      </div>
    </div>
  );
};

export default MindMapConnection;

