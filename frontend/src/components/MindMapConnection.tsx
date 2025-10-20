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

interface MindMapConnectionProps {
  nodes?: Node[];
  connections?: Connection[];
  onNodeClick?: (nodeId: string, info?: string, fullInfo?: string) => void;
  isActive?: boolean;
  selectedNode?: string | null;
  isDarkMode?: boolean;
}

// Theme-aware colors that adapt to dark/light mode
const getThemeColors = (isDarkMode: boolean) => ({
  center: isDarkMode ? '#A78BFA' : '#8B5CF6',      // Purple - softer in dark, richer in light
  origin: isDarkMode ? '#FB923C' : '#EA580C',      // Orange - softer in dark, richer in light
  culture: isDarkMode ? '#86EFAC' : '#22C55E',     // Green - softer in dark, richer in light
  era: isDarkMode ? '#67E8F9' : '#0891B2',         // Cyan - softer in dark, richer in light
  significance: isDarkMode ? '#FBBF24' : '#D97706', // Amber - softer in dark, richer in light
});

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
}: MindMapConnectionProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0.5, y: 0.5 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const animationRef = useRef<number>();

  // Get theme-aware colors
  const themeColors = getThemeColors(isDarkMode);

  // Initialize nodes with theme-aware colors if not provided
  const initializedNodes = nodes.length > 0 ? nodes : [
    { id: 'center', label: 'Artifact', x: 0, y: 0, z: 0, color: themeColors.center, size: 50, info: 'Central artifact', fullInfo: 'This is the main artifact being explored' },
    { id: 'origin', label: 'Origin', x: 150, y: -100, z: 50, color: themeColors.origin, size: 35, info: 'Where it comes from', fullInfo: 'Information about the origin and location' },
    { id: 'culture', label: 'Culture', x: -150, y: -100, z: 50, color: themeColors.culture, size: 35, info: 'Cultural context', fullInfo: 'Cultural significance and context' },
    { id: 'era', label: 'Era', x: 100, y: 150, z: -50, color: themeColors.era, size: 35, info: 'Time period', fullInfo: 'Historical time period and era' },
    { id: 'significance', label: 'Significance', x: -100, y: 150, z: -50, color: themeColors.significance, size: 35, info: 'Why it matters', fullInfo: 'Cultural and historical significance' },
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

    // Draw nodes
    projectedNodes.forEach((node) => {
      const isHovered = hoveredNode === node.id;
      const isSelected = selectedNode === node.id;
      const size = node.size * node.scale * (isHovered || isSelected ? 1.4 : 1);

      // Node glow (stronger if selected)
      const glowGradient = ctx.createRadialGradient(
        node.screenX,
        node.screenY,
        0,
        node.screenX,
        node.screenY,
        size * (isSelected ? 2 : 1.5)
      );
      glowGradient.addColorStop(0, node.color + (isSelected ? '80' : '40'));
      glowGradient.addColorStop(1, node.color + '00');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(node.screenX, node.screenY, size * (isSelected ? 2 : 1.5), 0, Math.PI * 2);
      ctx.fill();

      // Node circle
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.screenX, node.screenY, size, 0, Math.PI * 2);
      ctx.fill();

      // Node border (thicker if selected)
      ctx.strokeStyle = isSelected ? '#ffff00' : isHovered ? '#ffffff' : node.color + '80';
      ctx.lineWidth = isSelected ? 4 : isHovered ? 3 : 2;
      ctx.beginPath();
      ctx.arc(node.screenX, node.screenY, size, 0, Math.PI * 2);
      ctx.stroke();

      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${12 * node.scale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.screenX, node.screenY);
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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is on a node - increased clickable area
    initializedNodes.forEach((node) => {
      const rotated = rotatePoint(node.x, node.y, node.z, rotation.x, rotation.y);
      const projected = project3D(rotated.x, rotated.y, rotated.z, 1.5);
      const screenX = canvas.width / 2 + projected.x;
      const screenY = canvas.height / 2 + projected.y;
      const size = node.size * projected.scale;

      const distance = Math.sqrt((x - screenX) ** 2 + (y - screenY) ** 2);
      // Increased clickable area from 1.5x to 3x for better interaction
      if (distance < size * 3) {
        onNodeClick?.(node.id, node.info, node.fullInfo);
      }
    });
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
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
      <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
        💡 Click nodes to explore
      </div>
    </div>
  );
};

export default MindMapConnection;

