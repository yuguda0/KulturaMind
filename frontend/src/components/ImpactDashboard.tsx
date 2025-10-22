/**
 * Impact Dashboard Component
 * Displays real-time metrics showing KulturaMind's impact
 */

import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Globe, BookOpen, Award, Zap } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { apiClient } from '../services/api';

interface ImpactMetrics {
  cultural_preservation: {
    total_cultures_preserved: number;
    total_cultural_items: number;
    cultures_accessed: number;
    access_coverage: string;
    knowledge_graph_nodes: number;
    knowledge_graph_growth: string;
  };
  community_impact: {
    total_queries_answered: number;
    unique_countries_reached: number;
    languages_supported: number;
    global_south_reach: {
      countries: number;
      percentage: string;
    };
  };
  community_engagement: {
    total_contributions: number;
    approved_contributions: number;
    active_contributors: number;
    cultural_experts: number;
    tokens_distributed: number;
  };
  accessibility: {
    mobile_optimized: boolean;
    voice_interface: boolean;
    low_literacy_support: boolean;
  };
  agi_capabilities: {
    agents_available: number;
    total_agent_invocations: number;
  };
}

export const ImpactDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const data = await apiClient.get('/api/metrics/impact');
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse bg-card">
            <div className="h-4 bg-muted rounded w-1/2 mb-4" />
            <div className="h-8 bg-muted rounded w-3/4" />
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card className="p-6 text-center bg-card border-border">
        <p className="text-muted-foreground">Failed to load impact metrics. Please try again later.</p>
      </Card>
    );
  }

  const MetricCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: string;
    color: string;
  }> = ({ icon, title, value, subtitle, trend, color }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow bg-card border-border">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        {trend && (
          <Badge variant="secondary" className="text-xs">
            {trend}
          </Badge>
        )}
      </div>
      <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
      <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/logo.png" alt="KulturaMind" className="w-12 h-12 object-contain" />
          <h2 className="text-3xl font-bold text-foreground">Real-Time Impact Metrics</h2>
        </div>
        <p className="text-muted-foreground">
          Measuring our contribution to preserving African cultural heritage
        </p>
      </div>

      {/* Cultural Preservation Metrics */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          Cultural Preservation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            icon={<Globe className="w-6 h-6 text-white" />}
            title="Cultures Preserved"
            value={metrics.cultural_preservation.total_cultures_preserved}
            subtitle="Across Africa"
            color="bg-purple-600"
          />
          <MetricCard
            icon={<BookOpen className="w-6 h-6 text-white" />}
            title="Knowledge Items"
            value={metrics.cultural_preservation.knowledge_graph_nodes}
            subtitle={metrics.cultural_preservation.knowledge_graph_growth}
            trend="Growing"
            color="bg-blue-600"
          />
          <MetricCard
            icon={<Zap className="w-6 h-6 text-white" />}
            title="Total Queries"
            value={metrics.community_impact.total_queries_answered.toLocaleString()}
            subtitle="Questions answered"
            color="bg-green-600"
          />
        </div>
      </div>

      {/* Community Engagement */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          Community Engagement
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<Users className="w-6 h-6 text-white" />}
            title="Contributors"
            value={metrics.community_engagement.active_contributors}
            subtitle="Active community members"
            color="bg-green-600"
          />
          <MetricCard
            icon={<Award className="w-6 h-6 text-white" />}
            title="Contributions"
            value={metrics.community_engagement.total_contributions}
            subtitle={`${metrics.community_engagement.approved_contributions} approved`}
            color="bg-yellow-600"
          />
          <MetricCard
            icon={<Users className="w-6 h-6 text-white" />}
            title="Cultural Experts"
            value={metrics.community_engagement.cultural_experts}
            subtitle="Validating knowledge"
            color="bg-indigo-600"
          />
          <MetricCard
            icon={<Award className="w-6 h-6 text-white" />}
            title="FET Distributed"
            value={metrics.community_engagement.tokens_distributed}
            subtitle="Token rewards"
            color="bg-orange-600"
          />
        </div>
      </div>

      {/* Global South Reach */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
          <Globe className="w-5 h-5 text-blue-600" />
          Global South Reach
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Countries Reached</span>
              <span className="text-2xl font-bold text-blue-600">
                {metrics.community_impact.global_south_reach.countries}
              </span>
            </div>
            <Progress
              value={(metrics.community_impact.global_south_reach.countries / 18) * 100}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Out of 18 target countries in Africa, India, and Turkey
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Global South Users</span>
              <span className="text-2xl font-bold text-green-600">
                {metrics.community_impact.global_south_reach.percentage}
              </span>
            </div>
            <Progress
              value={parseFloat(metrics.community_impact.global_south_reach.percentage)}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Percentage of users from global south regions
            </p>
          </div>
        </div>
      </Card>

      {/* AGI Capabilities */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          Decentralized AGI
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            icon={<Zap className="w-6 h-6 text-white" />}
            title="AI Agents"
            value={metrics.agi_capabilities.agents_available}
            subtitle="Specialized agents working together"
            color="bg-yellow-600"
          />
          <MetricCard
            icon={<Globe className="w-6 h-6 text-white" />}
            title="Languages"
            value={metrics.community_impact.languages_supported}
            subtitle="African languages supported"
            color="bg-pink-600"
          />
          <MetricCard
            icon={<Users className="w-6 h-6 text-white" />}
            title="Unique Countries"
            value={metrics.community_impact.unique_countries_reached.toLocaleString()}
            subtitle="Countries reached"
            color="bg-teal-600"
          />
        </div>
      </div>

      {/* Accessibility Features */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Accessibility Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${metrics.accessibility.mobile_optimized ? 'bg-green-500' : 'bg-muted'}`} />
            <span className="text-sm font-medium text-foreground">Mobile-First Design</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${metrics.accessibility.voice_interface ? 'bg-green-500' : 'bg-muted'}`} />
            <span className="text-sm font-medium text-foreground">Voice Interface</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${metrics.accessibility.low_literacy_support ? 'bg-green-500' : 'bg-muted'}`} />
            <span className="text-sm font-medium text-foreground">Low-Literacy Support</span>
          </div>
        </div>
      </Card>

      {/* Footer Note */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Metrics updated in real-time • Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

