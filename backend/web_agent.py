"""
Web Fetching Agent for KulturaMind
Fetches additional cultural data from Wikipedia and web sources
"""

import logging
import asyncio
from typing import Dict, List, Any, Optional
import aiohttp
import json
from urllib.parse import quote

logger = logging.getLogger(__name__)


class WebFetchingAgent:
    """
    Agentic system for fetching cultural data from web and Wikipedia
    """

    def __init__(self):
        """Initialize web fetching agent"""
        self.wikipedia_base_url = "https://en.wikipedia.org/w/api.php"
        self.session: Optional[aiohttp.ClientSession] = None
        logger.info("✓ Web Fetching Agent initialized")

    async def initialize(self):
        """Initialize async session"""
        if not self.session:
            self.session = aiohttp.ClientSession()

    async def close(self):
        """Close async session"""
        if self.session:
            await self.session.close()

    async def fetch_wikipedia_summary(self, query: str) -> Optional[Dict[str, Any]]:
        """
        Fetch Wikipedia summary for a cultural topic
        
        Args:
            query: Search query (e.g., "Yoruba culture", "Benin bronzes")
            
        Returns:
            Dictionary with title, summary, and url
        """
        try:
            await self.initialize()
            
            params = {
                "action": "query",
                "format": "json",
                "titles": query,
                "prop": "extracts|info",
                "exintro": True,
                "explaintext": True,
                "inprop": "url"
            }
            
            async with self.session.get(self.wikipedia_base_url, params=params, timeout=10) as resp:
                if resp.status != 200:
                    logger.warning(f"Wikipedia fetch failed: {resp.status}")
                    return None
                    
                data = await resp.json()
                pages = data.get("query", {}).get("pages", {})
                
                if not pages:
                    return None
                
                page = next(iter(pages.values()))
                
                if "missing" in page:
                    return None
                
                return {
                    "title": page.get("title", ""),
                    "summary": page.get("extract", "")[:500],  # First 500 chars
                    "url": page.get("fullurl", ""),
                    "source": "Wikipedia"
                }
        except Exception as e:
            logger.error(f"Wikipedia fetch error: {e}")
            return None

    async def fetch_cultural_context(self, artifact_name: str, culture: str) -> Dict[str, Any]:
        """
        Fetch enriched cultural context for an artifact
        
        Args:
            artifact_name: Name of the artifact
            culture: Cultural group
            
        Returns:
            Dictionary with enriched context
        """
        try:
            await self.initialize()
            
            # Try fetching Wikipedia data for the artifact
            artifact_data = await self.fetch_wikipedia_summary(artifact_name)
            
            # Try fetching Wikipedia data for the culture
            culture_data = await self.fetch_wikipedia_summary(f"{culture} culture")
            
            result = {
                "artifact": artifact_data or {},
                "culture": culture_data or {},
                "enriched": True
            }
            
            logger.info(f"Fetched cultural context for {artifact_name}")
            return result
            
        except Exception as e:
            logger.error(f"Cultural context fetch error: {e}")
            return {"enriched": False, "error": str(e)}

    async def search_related_artifacts(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Search for related artifacts and cultural items
        
        Args:
            query: Search query
            limit: Maximum results
            
        Returns:
            List of related items
        """
        try:
            await self.initialize()
            
            params = {
                "action": "query",
                "format": "json",
                "list": "search",
                "srsearch": query,
                "srlimit": limit,
                "srnamespace": 0
            }
            
            async with self.session.get(self.wikipedia_base_url, params=params, timeout=10) as resp:
                if resp.status != 200:
                    return []
                    
                data = await resp.json()
                search_results = data.get("query", {}).get("search", [])
                
                results = []
                for item in search_results[:limit]:
                    results.append({
                        "title": item.get("title", ""),
                        "snippet": item.get("snippet", ""),
                        "source": "Wikipedia"
                    })
                
                logger.info(f"Found {len(results)} related artifacts for '{query}'")
                return results
                
        except Exception as e:
            logger.error(f"Search error: {e}")
            return []

    async def enrich_artifact_data(self, artifact: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enrich artifact data with web information
        
        Args:
            artifact: Original artifact data
            
        Returns:
            Enriched artifact data
        """
        try:
            # Fetch additional context
            context = await self.fetch_cultural_context(
                artifact.get("name", ""),
                artifact.get("culture", "")
            )
            
            # Search for related items
            related = await self.search_related_artifacts(
                f"{artifact.get('name', '')} {artifact.get('culture', '')}",
                limit=3
            )
            
            # Merge data
            enriched = artifact.copy()
            enriched["web_context"] = context
            enriched["related_items"] = related
            enriched["enriched_at"] = True
            
            return enriched
            
        except Exception as e:
            logger.error(f"Enrichment error: {e}")
            return artifact


# Global agent instance
_web_agent: Optional[WebFetchingAgent] = None


def get_web_agent() -> WebFetchingAgent:
    """Get or create web fetching agent"""
    global _web_agent
    if _web_agent is None:
        _web_agent = WebFetchingAgent()
    return _web_agent


async def cleanup_web_agent():
    """Cleanup web agent resources"""
    global _web_agent
    if _web_agent:
        await _web_agent.close()
        _web_agent = None

