import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ConnectionNode {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  color: string;
}

interface ConnectionMatrixProps {
  nodes: ConnectionNode[];
  onNodeClick?: (nodeId: string) => void;
  isActive?: boolean;
}

const ConnectionMatrix = ({ nodes, onNodeClick, isActive = true }: ConnectionMatrixProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const animationRef = useRef<number>();
  const rotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    let animationFrame = 0;

    const project3D = (x: number, y: number, z: number, scale: number) => {
      const rotX = rotationRef.current.x;
      const rotY = rotationRef.current.y;

      // Apply rotations
      let y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
      let z1 = y * Math.sin(rotX) + z * Math.cos(rotX);

      let x1 = x * Math.cos(rotY) + z1 * Math.sin(rotY);
      let z2 = -x * Math.sin(rotY) + z1 * Math.cos(rotY);

      // Perspective projection
      const perspective = 500;
      const scale2d = perspective / (perspective + z2);

      return {
        x: width / 2 + x1 * scale2d * scale,
        y: height / 2 + y1 * scale2d * scale,
        scale: scale2d,
      };
    };

    const animate = () => {
      animationFrame++;
      rotationRef.current.y += 0.003;
      rotationRef.current.x += 0.001;

      // Clear canvas with dark background
      ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Draw connections
      const projectedNodes = nodes.map(node => ({
        ...node,
        projected: project3D(node.x, node.y, node.z, 80),
      }));

      // Draw lines between nodes
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.2)';
      ctx.lineWidth = 1;

      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const p1 = projectedNodes[i].projected;
          const p2 = projectedNodes[j].projected;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // Draw nodes
      projectedNodes.forEach(node => {
        const p = node.projected;
        const isHovered = hoveredNode === node.id;
        const radius = isHovered ? 8 : 6;

        // Glow effect
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 2);
        gradient.addColorStop(0, `${node.color}40`);
        gradient.addColorStop(1, `${node.color}00`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Node circle
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight for hovered
        if (isHovered) {
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius + 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let closest: string | null = null;
      let closestDist = 15;

      nodes.forEach(node => {
        const p = project3D(node.x, node.y, node.z, 80);
        const dist = Math.sqrt((p.x - mouseX) ** 2 + (p.y - mouseY) ** 2);
        if (dist < closestDist) {
          closest = node.id;
          closestDist = dist;
        }
      });

      setHoveredNode(closest);
      canvas.style.cursor = closest ? 'pointer' : 'default';
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      nodes.forEach(node => {
        const p = project3D(node.x, node.y, node.z, 80);
        const dist = Math.sqrt((p.x - mouseX) ** 2 + (p.y - mouseY) ** 2);
        if (dist < 15) {
          onNodeClick?.(node.id);
        }
      });
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes, hoveredNode, onNodeClick]);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-background via-background to-accent/5 rounded-lg overflow-hidden border border-border/50">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full"
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3 text-accent" />
          <span>Click nodes to explore connections</span>
        </div>
      </div>
    </div>
  );
};

export default ConnectionMatrix;

