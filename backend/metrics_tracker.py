"""
Metrics Tracker for KulturaMind
Tracks usage metrics to demonstrate beneficial AGI impact
"""

import json
import os
from datetime import datetime
from typing import Dict, Any, List
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)


class MetricsTracker:
    """
    Tracks and stores metrics for KulturaMind
    Demonstrates measurable impact of beneficial AGI
    """
    
    def __init__(self, metrics_file: str = "metrics.json"):
        """
        Initialize metrics tracker
        
        Args:
            metrics_file: Path to metrics storage file
        """
        self.metrics_file = metrics_file
        self.metrics = self._load_metrics()
        
        # Initialize counters if not present
        if 'queries_answered' not in self.metrics:
            self.metrics['queries_answered'] = 0
        if 'cultures_accessed' not in self.metrics:
            self.metrics['cultures_accessed'] = defaultdict(int)
        if 'languages_used' not in self.metrics:
            self.metrics['languages_used'] = defaultdict(int)
        if 'agents_invoked' not in self.metrics:
            self.metrics['agents_invoked'] = defaultdict(int)
        if 'daily_queries' not in self.metrics:
            self.metrics['daily_queries'] = defaultdict(int)
        if 'user_countries' not in self.metrics:
            self.metrics['user_countries'] = defaultdict(int)
        
        logger.info("✓ Metrics tracker initialized")
    
    def _load_metrics(self) -> Dict[str, Any]:
        """Load metrics from file"""
        if os.path.exists(self.metrics_file):
            try:
                with open(self.metrics_file, 'r') as f:
                    data = json.load(f)
                    # Convert defaultdicts
                    if 'cultures_accessed' in data:
                        data['cultures_accessed'] = defaultdict(int, data['cultures_accessed'])
                    if 'languages_used' in data:
                        data['languages_used'] = defaultdict(int, data['languages_used'])
                    if 'agents_invoked' in data:
                        data['agents_invoked'] = defaultdict(int, data['agents_invoked'])
                    if 'daily_queries' in data:
                        data['daily_queries'] = defaultdict(int, data['daily_queries'])
                    if 'user_countries' in data:
                        data['user_countries'] = defaultdict(int, data['user_countries'])
                    return data
            except Exception as e:
                logger.error(f"Error loading metrics: {e}")
        
        return {}
    
    def _save_metrics(self):
        """Save metrics to file"""
        try:
            # Convert defaultdicts to regular dicts for JSON serialization
            data = dict(self.metrics)
            if 'cultures_accessed' in data:
                data['cultures_accessed'] = dict(data['cultures_accessed'])
            if 'languages_used' in data:
                data['languages_used'] = dict(data['languages_used'])
            if 'agents_invoked' in data:
                data['agents_invoked'] = dict(data['agents_invoked'])
            if 'daily_queries' in data:
                data['daily_queries'] = dict(data['daily_queries'])
            if 'user_countries' in data:
                data['user_countries'] = dict(data['user_countries'])
            
            with open(self.metrics_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving metrics: {e}")
    
    def track_query(
        self,
        culture: str = None,
        language: str = 'en',
        agents_used: List[str] = None,
        country: str = None
    ):
        """
        Track a query
        
        Args:
            culture: Culture accessed
            language: Language used
            agents_used: List of agents invoked
            country: User country (from IP geolocation)
        """
        # Increment total queries
        self.metrics['queries_answered'] += 1
        
        # Track culture access
        if culture:
            self.metrics['cultures_accessed'][culture] += 1
        
        # Track language usage
        self.metrics['languages_used'][language] += 1
        
        # Track agent invocations
        if agents_used:
            for agent in agents_used:
                self.metrics['agents_invoked'][agent] += 1
        
        # Track daily queries
        today = datetime.now().strftime('%Y-%m-%d')
        self.metrics['daily_queries'][today] += 1
        
        # Track user countries
        if country:
            self.metrics['user_countries'][country] += 1
        
        # Save metrics
        self._save_metrics()
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get current metrics"""
        return {
            'total_queries': self.metrics.get('queries_answered', 0),
            'cultures_accessed': dict(self.metrics.get('cultures_accessed', {})),
            'languages_used': dict(self.metrics.get('languages_used', {})),
            'agents_invoked': dict(self.metrics.get('agents_invoked', {})),
            'daily_queries': dict(self.metrics.get('daily_queries', {})),
            'user_countries': dict(self.metrics.get('user_countries', {})),
            'unique_cultures': len(self.metrics.get('cultures_accessed', {})),
            'unique_languages': len(self.metrics.get('languages_used', {})),
            'unique_countries': len(self.metrics.get('user_countries', {}))
        }
    
    def get_impact_summary(
        self,
        total_cultures: int = 16,
        total_items: int = 160,
        community_stats: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Get comprehensive impact summary for dashboard

        Args:
            total_cultures: Total cultures in knowledge base
            total_items: Total cultural items in knowledge base
            community_stats: Community contribution statistics

        Returns:
            Enhanced impact summary with community engagement and global south reach
        """
        metrics = self.get_metrics()

        # Community engagement metrics
        community_engagement = {
            'total_contributions': 0,
            'approved_contributions': 0,
            'active_contributors': 0,
            'cultural_experts': 0,
            'tokens_distributed': 0
        }

        if community_stats:
            community_engagement = {
                'total_contributions': community_stats.get('total_contributions', 0),
                'approved_contributions': community_stats.get('by_status', {}).get('approved', 0),
                'active_contributors': community_stats.get('total_contributions', 0),
                'cultural_experts': community_stats.get('total_experts', 0),
                'tokens_distributed': community_stats.get('total_rewards_distributed', 0)
            }

        # Calculate global south reach
        global_south_countries = {
            'Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Ethiopia', 'Tanzania',
            'Uganda', 'Senegal', 'Cameroon', 'India', 'Bangladesh', 'Pakistan',
            'Indonesia', 'Philippines', 'Vietnam', 'Brazil', 'Mexico', 'Turkey'
        }

        global_south_count = sum(
            1 for country in metrics['user_countries'].keys()
            if country in global_south_countries
        )

        total_countries = metrics['unique_countries']
        global_south_percentage = (global_south_count / total_countries * 100) if total_countries > 0 else 0

        return {
            'cultural_preservation': {
                'total_cultures_preserved': total_cultures,
                'total_cultural_items': total_items,
                'cultures_accessed': metrics['unique_cultures'],
                'access_coverage': f"{(metrics['unique_cultures'] / total_cultures * 100):.1f}%" if total_cultures > 0 else "0%",
                'knowledge_graph_nodes': total_items + community_engagement['approved_contributions'],
                'knowledge_graph_growth': f"+{community_engagement['approved_contributions']} from community"
            },
            'community_impact': {
                'total_queries_answered': metrics['total_queries'],
                'unique_countries_reached': metrics['unique_countries'],
                'languages_supported': metrics['unique_languages'],
                'user_countries': metrics['user_countries'],
                'global_south_reach': {
                    'countries': global_south_count,
                    'percentage': f"{global_south_percentage:.1f}%"
                }
            },
            'community_engagement': community_engagement,
            'agi_capabilities': {
                'multi_agent_system': True,
                'agents_available': 5,
                'total_agent_invocations': sum(metrics['agents_invoked'].values()),
                'agent_usage': metrics['agents_invoked'],
                'decentralized': True,
                'agentverse_enabled': False  # TODO: Enable after Agentverse integration
            },
            'accessibility': {
                'languages_used': metrics['languages_used'],
                'multilingual_support': metrics['unique_languages'] > 1,
                'global_reach': metrics['unique_countries'] > 1,
                'mobile_optimized': True,
                'voice_interface': True,
                'low_literacy_support': True
            },
            'growth': {
                'daily_queries': metrics['daily_queries'],
                'trending': self._calculate_trend(metrics['daily_queries']),
                'average_daily_queries': metrics['total_queries'] / max(len(metrics['daily_queries']), 1)
            }
        }
    
    def _calculate_trend(self, daily_queries: Dict[str, int]) -> str:
        """Calculate query trend"""
        if not daily_queries or len(daily_queries) < 2:
            return "stable"
        
        dates = sorted(daily_queries.keys())
        recent = sum(daily_queries[d] for d in dates[-3:]) if len(dates) >= 3 else daily_queries[dates[-1]]
        older = sum(daily_queries[d] for d in dates[-6:-3]) if len(dates) >= 6 else daily_queries[dates[0]] if dates else 0
        
        if older == 0:
            return "growing"
        
        change = (recent - older) / older
        
        if change > 0.2:
            return "growing"
        elif change < -0.2:
            return "declining"
        else:
            return "stable"


# Global instance
_metrics_tracker = None


def get_metrics_tracker() -> MetricsTracker:
    """Get or create metrics tracker instance"""
    global _metrics_tracker
    
    if _metrics_tracker is None:
        _metrics_tracker = MetricsTracker()
    
    return _metrics_tracker


if __name__ == "__main__":
    # Test metrics tracker
    logging.basicConfig(level=logging.INFO)
    
    tracker = MetricsTracker()
    
    # Simulate some queries
    tracker.track_query(culture='Yoruba', language='en', agents_used=['heritage-keeper', 'research-agent'], country='Nigeria')
    tracker.track_query(culture='Igbo', language='en', agents_used=['heritage-keeper'], country='Nigeria')
    tracker.track_query(culture='Hausa', language='fr', agents_used=['heritage-keeper', 'translation-agent'], country='Niger')
    tracker.track_query(culture='Zulu', language='en', agents_used=['heritage-keeper', 'verification-agent'], country='South Africa')
    
    # Get metrics
    metrics = tracker.get_metrics()
    print("\n" + "="*70)
    print("METRICS TRACKER TEST")
    print("="*70)
    print(f"Total Queries: {metrics['total_queries']}")
    print(f"Unique Cultures: {metrics['unique_cultures']}")
    print(f"Unique Languages: {metrics['unique_languages']}")
    print(f"Unique Countries: {metrics['unique_countries']}")
    print("\nCultures Accessed:")
    for culture, count in metrics['cultures_accessed'].items():
        print(f"  - {culture}: {count}")
    print("="*70)
    
    # Get impact summary
    impact = tracker.get_impact_summary()
    print("\nIMPACT SUMMARY:")
    print(json.dumps(impact, indent=2))

