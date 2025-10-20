"""
Test suite for new KulturaMind features:
- Artifact endpoints
- Web fetching agent
- Streaming chat responses
"""

import pytest
import asyncio
import json
from fastapi.testclient import TestClient
from api import app
from web_agent import WebFetchingAgent, get_web_agent


# Test client
client = TestClient(app)


class TestArtifactEndpoints:
    """Test artifact-related endpoints"""

    def test_get_all_artifacts(self):
        """Test fetching all artifacts"""
        response = client.get("/api/artifacts")
        assert response.status_code == 200
        data = response.json()
        assert "artifacts" in data
        assert "count" in data
        assert isinstance(data["artifacts"], list)
        assert data["count"] >= 0

    def test_get_artifact_by_id(self):
        """Test fetching specific artifact"""
        # First get all artifacts
        response = client.get("/api/artifacts")
        artifacts = response.json()["artifacts"]
        
        if artifacts:
            artifact_id = artifacts[0]["id"]
            response = client.get(f"/api/artifacts/{artifact_id}")
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == artifact_id
            assert "name" in data
            assert "location" in data
            assert "coordinates" in data

    def test_get_artifact_not_found(self):
        """Test fetching non-existent artifact"""
        response = client.get("/api/artifacts/nonexistent-id")
        assert response.status_code == 404

    def test_get_artifacts_by_culture(self):
        """Test fetching artifacts by culture"""
        response = client.get("/api/artifacts/culture/Yoruba")
        assert response.status_code == 200
        data = response.json()
        assert "culture" in data
        assert "artifacts" in data
        assert "count" in data

    def test_artifact_has_required_fields(self):
        """Test that artifacts have all required fields"""
        response = client.get("/api/artifacts")
        artifacts = response.json()["artifacts"]
        
        required_fields = [
            "id", "name", "location", "coordinates", 
            "era", "year", "description", "significance", 
            "culturalContext", "culture"
        ]
        
        for artifact in artifacts:
            for field in required_fields:
                assert field in artifact, f"Missing field: {field}"


class TestWebAgent:
    """Test web fetching agent"""

    @pytest.mark.asyncio
    async def test_web_agent_initialization(self):
        """Test web agent initialization"""
        agent = WebFetchingAgent()
        await agent.initialize()
        assert agent.session is not None
        await agent.close()

    @pytest.mark.asyncio
    async def test_fetch_wikipedia_summary(self):
        """Test Wikipedia summary fetching"""
        agent = WebFetchingAgent()
        await agent.initialize()
        
        result = await agent.fetch_wikipedia_summary("Yoruba culture")
        
        if result:  # May be None if Wikipedia is unavailable
            assert "title" in result
            assert "summary" in result
            assert "source" in result
        
        await agent.close()

    @pytest.mark.asyncio
    async def test_search_related_artifacts(self):
        """Test searching for related artifacts"""
        agent = WebFetchingAgent()
        await agent.initialize()
        
        results = await agent.search_related_artifacts("Benin bronzes", limit=3)
        
        # Results may be empty if Wikipedia is unavailable
        assert isinstance(results, list)
        
        await agent.close()

    @pytest.mark.asyncio
    async def test_enrich_artifact_data(self):
        """Test artifact enrichment"""
        agent = WebFetchingAgent()
        await agent.initialize()
        
        artifact = {
            "id": "test",
            "name": "Test Artifact",
            "culture": "Yoruba"
        }
        
        enriched = await agent.enrich_artifact_data(artifact)
        
        assert "id" in enriched
        assert "web_context" in enriched
        assert "related_items" in enriched
        
        await agent.close()


class TestStreamingChat:
    """Test streaming chat endpoint"""

    def test_chat_stream_endpoint_exists(self):
        """Test that streaming endpoint exists"""
        response = client.post(
            "/api/chat/stream",
            json={
                "message": "Tell me about Yoruba culture",
                "use_reasoning": True,
                "use_llm": True,
                "stream": True
            }
        )
        # Should return 200 or 503 (if RAG pipeline not initialized)
        assert response.status_code in [200, 503]

    def test_chat_stream_response_format(self):
        """Test streaming response format"""
        response = client.post(
            "/api/chat/stream",
            json={
                "message": "What is Nok terracotta?",
                "use_reasoning": True,
                "use_llm": True,
                "stream": True
            }
        )
        
        if response.status_code == 200:
            # Parse NDJSON response
            lines = response.text.strip().split('\n')
            assert len(lines) > 0
            
            for line in lines:
                if line:
                    chunk = json.loads(line)
                    assert "type" in chunk
                    assert "done" in chunk
                    assert chunk["type"] in ["content", "complete", "error"]


class TestHealthAndInfo:
    """Test health and info endpoints"""

    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "rag_pipeline_ready" in data

    def test_system_info(self):
        """Test system info endpoint"""
        response = client.get("/api/info")
        if response.status_code == 200:
            data = response.json()
            assert "system" in data
            assert "version" in data
            assert "components" in data
            assert "data" in data


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])

