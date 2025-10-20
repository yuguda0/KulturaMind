import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface GraphEdge {
  source: string;
  target: string;
  strength: number;
}

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (nodeId: string) => void;
}

const KnowledgeGraph = ({ nodes, edges, onNodeClick }: KnowledgeGraphProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const positionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Initialize positions if not already done
    if (positionsRef.current.size === 0) {
      nodes.forEach((node, index) => {
        const angle = (index / nodes.length) * Math.PI * 2;
        const radius = Math.min(width, height) / 3;
        positionsRef.current.set(node.id, {
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius,
        });
      });
    }

    let animationFrame = 0;
    let time = 0;

    const animate = () => {
      time += 0.01;

      // Clear canvas
      ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
      ctx.fillRect(0, 0, width, height);

      // Draw edges
      edges.forEach(edge => {
        const source = positionsRef.current.get(edge.source);
        const target = positionsRef.current.get(edge.target);

        if (source && target) {
          ctx.strokeStyle = `rgba(147, 51, 234, ${0.1 * edge.strength})`;
          ctx.lineWidth = 1 + edge.strength;
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        }
      });

      // Draw nodes
      nodes.forEach(node => {
        const pos = positionsRef.current.get(node.id);
        if (!pos) return;

        const isHovered = hoveredNode === node.id;
        const radius = isHovered ? 12 : 8;

        // Glow
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius * 2);
        gradient.addColorStop(0, `${node.color}40`);
        gradient.addColorStop(1, `${node.color}00`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Node
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        if (isHovered) {
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius + 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let closest: string | null = null;
      let closestDist = 20;

      nodes.forEach(node => {
        const pos = positionsRef.current.get(node.id);
        if (!pos) return;

        const dist = Math.sqrt((pos.x - mouseX) ** 2 + (pos.y - mouseY) ** 2);
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
        const pos = positionsRef.current.get(node.id);
        if (!pos) return;

        const dist = Math.sqrt((pos.x - mouseX) ** 2 + (pos.y - mouseY) ** 2);
        if (dist < 20) {
          onNodeClick?.(node.id);
        }
      });
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrame);
    };
  }, [nodes, edges, hoveredNode, onNodeClick]);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-background via-background to-accent/5 rounded-lg overflow-hidden border border-border/50">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full"
      />
      
      <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3 text-accent" />
          <span>Interactive knowledge graph</span>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;

