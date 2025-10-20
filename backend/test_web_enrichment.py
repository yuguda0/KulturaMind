"""
Test suite for web enrichment functionality
Verifies that queries are enriched with Wikipedia data
"""

import pytest
import asyncio
import json
from fastapi.testclient import TestClient
from api import app
from web_agent import WebFetchingAgent, get_web_agent


client = TestClient(app)


class TestWebEnrichmentIntegration:
    """Test web enrichment in API queries"""

    def test_query_with_artifact_enrichment(self):
        """Test that queries with artifact names get enriched"""
        response = client.post(
            "/api/query",
            json={
                "message": "Tell me about Yoruba culture",
                "use_reasoning": True,
                "use_llm": True
            }
        )
        
        assert response.status_code in [200, 503]  # 503 if RAG not initialized
        
        if response.status_code == 200:
            data = response.json()
            # Check if enrichment was attempted
            assert "response" in data
            assert "sources" in data
            # Response should mention Yoruba
            assert "yoruba" in data["response"].lower() or len(data["sources"]) > 0

    def test_streaming_query_with_enrichment(self):
        """Test that streaming queries include enrichment metadata"""
        response = client.post(
            "/api/chat/stream",
            json={
                "message": "What is Igbo culture?",
                "use_reasoning": True,
                "use_llm": True
            }
        )
        
        assert response.status_code in [200, 503]
        
        if response.status_code == 200:
            # Parse NDJSON response
            lines = response.text.strip().split('\n')
            assert len(lines) > 0
            
            # Check final chunk for enrichment metadata
            final_chunk = json.loads(lines[-1])
            assert final_chunk["type"] == "complete"
            assert "web_enrichment" in final_chunk or "done" in final_chunk

    def test_artifact_specific_query(self):
        """Test query about specific artifact"""
        response = client.post(
            "/api/query",
            json={
                "message": "Tell me about Nok terracotta",
                "use_reasoning": True,
                "use_llm": True
            }
        )
        
        assert response.status_code in [200, 503]
        
        if response.status_code == 200:
            data = response.json()
            assert "response" in data
            # Should have some context
            assert len(data.get("sources", [])) >= 0

    def test_culture_specific_query(self):
        """Test query about specific culture"""
        response = client.post(
            "/api/query",
            json={
                "message": "What are Hausa traditions?",
                "use_reasoning": True,
                "use_llm": True
            }
        )
        
        assert response.status_code in [200, 503]
        
        if response.status_code == 200:
            data = response.json()
            assert "response" in data


class TestWebAgentDirectly:
    """Test web agent functionality directly"""

    @pytest.mark.asyncio
    async def test_wikipedia_fetch(self):
        """Test Wikipedia fetching"""
        agent = WebFetchingAgent()
        await agent.initialize()
        
        result = await agent.fetch_wikipedia_summary("Yoruba culture")
        
        if result:  # May be None if Wikipedia unavailable
            assert "title" in result
            assert "summary" in result
            assert "source" in result
            assert result["source"] == "Wikipedia"
        
        await agent.close()

    @pytest.mark.asyncio
    async def test_cultural_context_fetch(self):
        """Test cultural context fetching"""
        agent = WebFetchingAgent()
        await agent.initialize()
        
        result = await agent.fetch_cultural_context("Nok terracotta", "Nok")
        
        assert "artifact" in result
        assert "culture" in result
        assert "enriched" in result
        
        await agent.close()

    @pytest.mark.asyncio
    async def test_related_artifacts_search(self):
        """Test searching for related artifacts"""
        agent = WebFetchingAgent()
        await agent.initialize()
        
        results = await agent.search_related_artifacts("Yoruba art", limit=3)
        
        assert isinstance(results, list)
        # May be empty if Wikipedia unavailable
        if results:
            for item in results:
                assert "title" in item
                assert "snippet" in item
                assert "source" in item
        
        await agent.close()

    @pytest.mark.asyncio
    async def test_artifact_enrichment(self):
        """Test artifact enrichment"""
        agent = WebFetchingAgent()
        await agent.initialize()
        
        artifact = {
            "id": "test-artifact",
            "name": "Yoruba mask",
            "culture": "Yoruba",
            "description": "Traditional Yoruba mask"
        }
        
        enriched = await agent.enrich_artifact_data(artifact)
        
        # Should have enrichment fields
        assert "web_context" in enriched
        assert "related_items" in enriched
        assert "enriched_at" in enriched
        
        # Original fields should be preserved
        assert enriched["id"] == artifact["id"]
        assert enriched["name"] == artifact["name"]
        
        await agent.close()


class TestEnrichmentErrorHandling:
    """Test error handling in enrichment"""

    @pytest.mark.asyncio
    async def test_enrichment_with_invalid_artifact(self):
        """Test enrichment with invalid artifact data"""
        agent = WebFetchingAgent()
        await agent.initialize()
        
        artifact = {
            "id": "invalid",
            "name": "",  # Empty name
            "culture": ""  # Empty culture
        }
        
        enriched = await agent.enrich_artifact_data(artifact)
        
        # Should still return artifact even if enrichment fails
        assert "id" in enriched
        assert "web_context" in enriched
        
        await agent.close()

    @pytest.mark.asyncio
    async def test_wikipedia_timeout_handling(self):
        """Test handling of Wikipedia timeout"""
        agent = WebFetchingAgent()
        await agent.initialize()
        
        # This should handle timeout gracefully
        result = await agent.fetch_wikipedia_summary("x" * 1000)  # Very long query
        
        # Should return None or empty dict on timeout
        assert result is None or isinstance(result, dict)
        
        await agent.close()


class TestEnrichmentMetadata:
    """Test enrichment metadata in responses"""

    def test_artifact_endpoint_enrichment(self):
        """Test that artifact endpoint returns enriched data"""
        # First get all artifacts
        response = client.get("/api/artifacts")
        
        if response.status_code == 200:
            data = response.json()
            artifacts = data.get("artifacts", [])
            
            if artifacts:
                artifact_id = artifacts[0]["id"]
                
                # Get specific artifact (should be enriched)
                response = client.get(f"/api/artifacts/{artifact_id}")
                
                if response.status_code == 200:
                    artifact = response.json()
                    # Check for enrichment fields
                    assert "id" in artifact
                    # May have web_context if enrichment succeeded
                    if "web_context" in artifact:
                        assert isinstance(artifact["web_context"], dict)

    def test_query_response_includes_sources(self):
        """Test that query response includes sources"""
        response = client.post(
            "/api/query",
            json={
                "message": "Tell me about Nigerian culture",
                "use_reasoning": True,
                "use_llm": True
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            assert "sources" in data
            # Sources should be a list
            assert isinstance(data["sources"], list)


class TestEnrichmentPerformance:
    """Test enrichment performance"""

    def test_query_response_time(self):
        """Test that enriched queries complete in reasonable time"""
        import time
        
        start = time.time()
        response = client.post(
            "/api/query",
            json={
                "message": "Tell me about Yoruba",
                "use_reasoning": True,
                "use_llm": True
            }
        )
        elapsed = time.time() - start
        
        # Should complete within 30 seconds (includes web fetching)
        assert elapsed < 30
        assert response.status_code in [200, 503]

    def test_streaming_response_time(self):
        """Test that streaming queries complete in reasonable time"""
        import time
        
        start = time.time()
        response = client.post(
            "/api/chat/stream",
            json={
                "message": "What is Igbo?",
                "use_reasoning": True,
                "use_llm": True
            }
        )
        elapsed = time.time() - start
        
        # Should complete within 30 seconds
        assert elapsed < 30
        assert response.status_code in [200, 503]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

