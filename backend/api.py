#!/usr/bin/env python3
"""
FastAPI Backend for KulturaMind - Decentralized AGI Stack
Provides REST API for cultural heritage knowledge base using:
- ASI Cloud Compute for LLM generation
- Multi-agent system for decentralized AGI
- MeTTa knowledge graph for reasoning
- Web enrichment for comprehensive responses
- Streaming responses for real-time chat
- Metrics tracking for impact measurement
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, AsyncGenerator
import logging
from dotenv import load_dotenv
import json
import asyncio
import os

from rag_pipeline import RAGPipeline
from web_agent import get_web_agent, cleanup_web_agent
from multi_agent_system import get_multi_agent_system
from metrics_tracker import get_metrics_tracker
from community_system import CommunityContributionSystem, ContributionType, ContributionStatus

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="KulturaMind API",
    description="Decentralized AGI for African Cultural Heritage Preservation",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Multi-Agent System
logger.info("Initializing Multi-Agent System...")
try:
    multi_agent_system = get_multi_agent_system()
    logger.info("✓ Multi-Agent System initialized successfully")
except Exception as e:
    logger.error(f"Error initializing Multi-Agent System: {e}")
    multi_agent_system = None

# Initialize Metrics Tracker
logger.info("Initializing Metrics Tracker...")
try:
    metrics_tracker = get_metrics_tracker()
    logger.info("✓ Metrics Tracker initialized successfully")
except Exception as e:
    logger.error(f"Error initializing Metrics Tracker: {e}")
    metrics_tracker = None

# Initialize RAG Pipeline (fallback)
logger.info("Initializing RAG Pipeline (fallback)...")
try:
    rag_pipeline = RAGPipeline()
    logger.info("✓ RAG Pipeline initialized successfully")
except Exception as e:
    logger.error(f"Error initializing RAG Pipeline: {e}")
    rag_pipeline = None

# Load artifacts data
artifacts_data = {}
try:
    artifacts_path = os.path.join(os.path.dirname(__file__), "artifacts_data.json")
    if os.path.exists(artifacts_path):
        with open(artifacts_path, 'r') as f:
            artifacts_data = json.load(f)
        logger.info(f"✓ Loaded {len(artifacts_data.get('artifacts', []))} artifacts")
    else:
        logger.warning("artifacts_data.json not found")
except Exception as e:
    logger.error(f"Error loading artifacts: {e}")
    artifacts_data = {"artifacts": []}

# ============================================================================
# Pydantic Models
# ============================================================================

class SearchRequest(BaseModel):
    """Semantic search request"""
    query: str
    top_k: int = 5

class SearchResult(BaseModel):
    """Search result item"""
    id: str
    text: str
    type: str
    metadata: Dict[str, Any] = {}
    score: float

class SearchResponse(BaseModel):
    """Search response"""
    query: str
    results: List[SearchResult] = []
    count: int = 0

class QueryRequest(BaseModel):
    """Intelligent query request"""
    message: str
    use_reasoning: bool = True
    use_llm: bool = True
    language: str = 'en'
    use_multi_agent: bool = True

class QueryResponse(BaseModel):
    """Intelligent query response"""
    response: str
    sources: List[Dict[str, Any]] = []
    reasoning: List[Dict[str, Any]] = []
    agents_used: List[str] = []
    confidence: float = 0.0

class Artifact(BaseModel):
    """Artifact data model"""
    id: str
    name: str
    location: str
    coordinates: List[float]
    era: str
    year: str
    description: str
    significance: str
    culturalContext: str
    culture: str
    web_context: Optional[Dict[str, Any]] = None
    related_items: Optional[List[Dict[str, Any]]] = None

class ChatStreamRequest(BaseModel):
    """Streaming chat request"""
    message: str
    use_reasoning: bool = True
    use_llm: bool = True
    stream: bool = True
    language: str = 'en'
    use_multi_agent: bool = True

# ============================================================================
# Health & Info Endpoints
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "KulturaMind API",
        "version": "2.0.0",
        "status": "running",
        "description": "Decentralized AGI for African Cultural Heritage Preservation",
        "features": [
            "Multi-Agent System",
            "ASI Cloud Compute",
            "MeTTa Knowledge Graph",
            "Multilingual Support",
            "Impact Metrics"
        ]
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "multi_agent_system_ready": multi_agent_system is not None,
        "rag_pipeline_ready": rag_pipeline is not None,
        "metrics_tracker_ready": metrics_tracker is not None
    }

@app.get("/api/info")
async def get_info():
    """Get system information"""
    if not rag_pipeline:
        raise HTTPException(status_code=503, detail="RAG Pipeline not initialized")

    try:
        num_docs = len(rag_pipeline.vector_db.embeddings_store)

        # Get unique cultures from artifacts
        artifacts = artifacts_data.get("artifacts", [])
        unique_cultures = set(a.get("culture", "") for a in artifacts if a.get("culture"))

        return {
            "system": "KulturaMind Real AGI Stack",
            "version": "1.0.0",
            "components": {
                "semantic_search": "ASI:One Embeddings",
                "knowledge_graph": "MeTTa Reasoning",
                "generation": "ASI:One LLM"
            },
            "data": {
                "total_items": num_docs,
                "artifact_count": len(artifacts),
                "culture_count": len(unique_cultures),
                "cultures": sorted(list(unique_cultures)),
                "categories": ["Festivals", "Art Forms", "Traditions", "Languages", "Proverbs"]
            }
        }
    except Exception as e:
        logger.error(f"Info error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Semantic Search Endpoint (Real AI - not keyword matching)
# ============================================================================

@app.post("/api/search")
async def semantic_search(request: SearchRequest):
    """Semantic search using ASI:One embeddings"""
    if not rag_pipeline:
        raise HTTPException(status_code=503, detail="RAG Pipeline not initialized")
    
    try:
        results = rag_pipeline.vector_db.search(
            request.query,
            top_k=request.top_k,
            score_threshold=0.3
        )
        
        logger.info(f"Semantic search for '{request.query}': {len(results)} results")
        
        search_results = [
            SearchResult(
                id=r.get('id', ''),
                text=r.get('text', ''),
                type=r.get('type', ''),
                metadata=r.get('metadata', {}),
                score=r.get('score', 0.0)
            )
            for r in results
        ]
        
        return SearchResponse(
            query=request.query,
            results=search_results,
            count=len(search_results)
        )
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Artifact Endpoints
# ============================================================================

@app.get("/api/artifacts")
async def get_artifacts():
    """Get all artifacts"""
    try:
        artifacts = artifacts_data.get("artifacts", [])
        return {
            "artifacts": artifacts,
            "count": len(artifacts)
        }
    except Exception as e:
        logger.error(f"Error fetching artifacts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/artifacts/{artifact_id}")
async def get_artifact(artifact_id: str):
    """Get specific artifact by ID"""
    try:
        artifacts = artifacts_data.get("artifacts", [])
        artifact = next((a for a in artifacts if a["id"] == artifact_id), None)

        if not artifact:
            raise HTTPException(status_code=404, detail="Artifact not found")

        # Optionally enrich with web data
        web_agent = get_web_agent()
        enriched = await web_agent.enrich_artifact_data(artifact)

        return enriched
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching artifact: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/artifacts/culture/{culture}")
async def get_artifacts_by_culture(culture: str):
    """Get artifacts by culture"""
    try:
        artifacts = artifacts_data.get("artifacts", [])
        filtered = [a for a in artifacts if a.get("culture", "").lower() == culture.lower()]

        return {
            "culture": culture,
            "artifacts": filtered,
            "count": len(filtered)
        }
    except Exception as e:
        logger.error(f"Error filtering artifacts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Intelligent Query Endpoint (Real AI - semantic + reasoning + generation)
# ============================================================================

@app.post("/api/query")
async def intelligent_query(request: QueryRequest):
    """Intelligent query using complete RAG pipeline with web enrichment"""
    if not rag_pipeline:
        raise HTTPException(status_code=503, detail="RAG Pipeline not initialized")

    try:
        # Get web agent for enrichment
        web_agent = get_web_agent()
        await web_agent.initialize()

        # Extract potential artifact/culture names from query
        query_lower = request.message.lower()
        artifacts = artifacts_data.get("artifacts", [])

        # Find relevant artifacts mentioned in the query
        relevant_artifacts = []
        for artifact in artifacts:
            artifact_name = artifact.get("name", "").lower()
            culture = artifact.get("culture", "").lower()
            if artifact_name in query_lower or culture in query_lower:
                relevant_artifacts.append(artifact)

        # Enrich relevant artifacts with web data
        enriched_context = []
        for artifact in relevant_artifacts[:3]:  # Limit to top 3
            try:
                enriched = await web_agent.enrich_artifact_data(artifact)
                enriched_context.append(enriched)
            except Exception as e:
                logger.warning(f"Failed to enrich artifact {artifact.get('name')}: {e}")
                enriched_context.append(artifact)

        # Also fetch general web context for the query topic
        web_context = await web_agent.fetch_wikipedia_summary(request.message)

        # Prepare enhanced context for RAG pipeline
        enhanced_context = {
            "query": request.message,
            "enriched_artifacts": enriched_context,
            "web_context": web_context or {},
            "artifact_count": len(enriched_context)
        }

        # Query RAG pipeline with enhanced context (increased top_k for comprehensive results)
        result = rag_pipeline.query(
            request.message,
            top_k=10,
            use_reasoning=request.use_reasoning,
            use_llm=request.use_llm,
            additional_context=enhanced_context,
            enforce_web_enrichment=True
        )

        logger.info(f"Query processed with {len(enriched_context)} enriched artifacts: {request.message}")

        return QueryResponse(
            response=result.get("response", ""),
            sources=result.get("context", []),
            reasoning=result.get("reasoning", [])
        )
    except Exception as e:
        logger.error(f"Query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Streaming Chat Endpoint (Real-time response streaming)
# ============================================================================

async def generate_streaming_response(message: str, use_reasoning: bool, use_llm: bool) -> AsyncGenerator[str, None]:
    """
    Generate streaming response using RAG pipeline with web enrichment
    Yields JSON chunks for real-time display
    """
    try:
        if not rag_pipeline:
            yield json.dumps({"error": "RAG Pipeline not initialized"}) + "\n"
            return

        # Get web agent for enrichment
        web_agent = get_web_agent()
        await web_agent.initialize()

        # Extract potential artifact/culture names from query
        query_lower = message.lower()
        artifacts = artifacts_data.get("artifacts", [])

        # Find relevant artifacts mentioned in the query
        relevant_artifacts = []
        for artifact in artifacts:
            artifact_name = artifact.get("name", "").lower()
            culture = artifact.get("culture", "").lower()
            if artifact_name in query_lower or culture in query_lower:
                relevant_artifacts.append(artifact)

        # Enrich relevant artifacts with web data
        enriched_context = []
        for artifact in relevant_artifacts[:3]:  # Limit to top 3
            try:
                enriched = await web_agent.enrich_artifact_data(artifact)
                enriched_context.append(enriched)
            except Exception as e:
                logger.warning(f"Failed to enrich artifact {artifact.get('name')}: {e}")
                enriched_context.append(artifact)

        # Also fetch general web context for the query topic
        web_context = await web_agent.fetch_wikipedia_summary(message)

        # Prepare enhanced context for RAG pipeline
        enhanced_context = {
            "query": message,
            "enriched_artifacts": enriched_context,
            "web_context": web_context or {},
            "artifact_count": len(enriched_context)
        }

        # Get the full response with enhanced context (increased top_k for comprehensive results)
        result = rag_pipeline.query(
            message,
            top_k=10,
            use_reasoning=use_reasoning,
            use_llm=use_llm,
            additional_context=enhanced_context,
            enforce_web_enrichment=True
        )

        response_text = result.get("response", "")

        # Stream response word by word for real-time effect
        words = response_text.split()
        accumulated = ""

        for word in words:
            accumulated += word + " "
            chunk = {
                "type": "content",
                "data": accumulated.strip(),
                "done": False
            }
            yield json.dumps(chunk) + "\n"
            await asyncio.sleep(0.05)  # Small delay for streaming effect

        # Send final chunk with sources, reasoning, and web context
        final_chunk = {
            "type": "complete",
            "data": accumulated.strip(),
            "sources": result.get("context", []),
            "reasoning": result.get("reasoning", []),
            "web_enrichment": {
                "artifacts_enriched": len(enriched_context),
                "web_context_available": web_context is not None
            },
            "done": True
        }
        yield json.dumps(final_chunk) + "\n"

    except Exception as e:
        logger.error(f"Streaming error: {e}")
        error_chunk = {
            "type": "error",
            "error": str(e),
            "done": True
        }
        yield json.dumps(error_chunk) + "\n"

@app.post("/api/chat/stream")
async def chat_stream(request: ChatStreamRequest):
    """Streaming chat endpoint using Server-Sent Events"""
    if not rag_pipeline:
        raise HTTPException(status_code=503, detail="RAG Pipeline not initialized")

    logger.info(f"Streaming chat: {request.message}")

    return StreamingResponse(
        generate_streaming_response(
            request.message,
            request.use_reasoning,
            request.use_llm
        ),
        media_type="application/x-ndjson"
    )

# ============================================================================
# Multi-Agent System Endpoints
# ============================================================================

@app.get("/api/agents")
async def get_agents():
    """Get information about available agents"""
    if not multi_agent_system:
        raise HTTPException(status_code=503, detail="Multi-Agent System not initialized")

    return multi_agent_system.get_system_info()

@app.get("/api/languages")
async def get_languages():
    """Get supported languages"""
    if not multi_agent_system:
        raise HTTPException(status_code=503, detail="Multi-Agent System not initialized")

    return {
        "languages": multi_agent_system.get_supported_languages(),
        "count": len(multi_agent_system.get_supported_languages())
    }

@app.post("/api/chat/multi-agent")
async def chat_multi_agent(request: QueryRequest):
    """Process query through multi-agent system"""
    if not multi_agent_system:
        raise HTTPException(status_code=503, detail="Multi-Agent System not initialized")

    try:
        # Process through multi-agent system
        result = await multi_agent_system.process_query(
            query=request.message,
            language=request.language,
            use_research=True,
            use_verification=request.use_reasoning
        )

        # Track metrics
        if metrics_tracker:
            metrics_tracker.track_query(
                language=request.language,
                agents_used=result.get('agents_used', [])
            )

        return {
            "response": result['response'],
            "confidence": result['confidence'],
            "sources": result['sources'],
            "agents_used": result['agents_used'],
            "agent_count": result['agent_count'],
            "metadata": result['metadata']
        }

    except Exception as e:
        logger.error(f"Multi-agent chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Metrics Endpoints
# ============================================================================

@app.get("/api/metrics")
async def get_metrics():
    """Get usage metrics"""
    if not metrics_tracker:
        raise HTTPException(status_code=503, detail="Metrics Tracker not initialized")

    return metrics_tracker.get_metrics()

# ============================================================================
# Lifecycle Events
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize resources on startup"""
    logger.info("KulturaMind API starting up...")
    logger.info("  - Multi-Agent System: " + ("✓" if multi_agent_system else "✗"))
    logger.info("  - Metrics Tracker: " + ("✓" if metrics_tracker else "✗"))
    logger.info("  - RAG Pipeline: " + ("✓" if rag_pipeline else "✗"))

# ============================================================================
# Community Contribution Endpoints
# ============================================================================

# Initialize community system
community_system = None

def get_community_system():
    """Get or create community system instance"""
    global community_system
    if community_system is None:
        community_system = CommunityContributionSystem()
    return community_system


class ContributionRequest(BaseModel):
    """Community contribution request"""
    contributor_address: str
    contribution_type: str  # "new_artifact", "artifact_update", "cultural_context", "translation", "verification"
    data: Dict[str, Any]
    culture: str


class ExpertRegistration(BaseModel):
    """Expert registration request"""
    expert_address: str
    culture: str
    credentials: Dict[str, Any]


class ReviewSubmission(BaseModel):
    """Expert review submission"""
    contribution_id: str
    expert_address: str
    approved: bool
    feedback: str
    suggested_changes: Optional[Dict[str, Any]] = None


@app.post("/api/community/contribute")
async def submit_contribution(request: ContributionRequest):
    """Submit a community contribution"""
    try:
        system = get_community_system()
        contribution_type = ContributionType(request.contribution_type)

        result = system.submit_contribution(
            contributor_address=request.contributor_address,
            contribution_type=contribution_type,
            data=request.data,
            culture=request.culture
        )

        return result
    except Exception as e:
        logger.error(f"Error submitting contribution: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/community/register-expert")
async def register_expert(request: ExpertRegistration):
    """Register as a cultural expert"""
    try:
        system = get_community_system()

        result = system.register_expert(
            expert_address=request.expert_address,
            culture=request.culture,
            credentials=request.credentials
        )

        return result
    except Exception as e:
        logger.error(f"Error registering expert: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/community/review")
async def submit_review(request: ReviewSubmission):
    """Submit expert review for a contribution"""
    try:
        system = get_community_system()

        result = system.submit_review(
            contribution_id=request.contribution_id,
            expert_address=request.expert_address,
            approved=request.approved,
            feedback=request.feedback,
            suggested_changes=request.suggested_changes
        )

        return result
    except Exception as e:
        logger.error(f"Error submitting review: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/community/pending")
async def get_pending_contributions(culture: Optional[str] = None):
    """Get pending contributions for review"""
    try:
        system = get_community_system()
        pending = system.get_pending_contributions(culture=culture)
        return {"pending_contributions": pending}
    except Exception as e:
        logger.error(f"Error getting pending contributions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/community/stats")
async def get_community_stats():
    """Get community contribution statistics"""
    try:
        system = get_community_system()
        stats = system.get_contribution_stats()
        return stats
    except Exception as e:
        logger.error(f"Error getting community stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/metrics/impact")
async def get_impact_metrics():
    """Get enhanced impact summary with community engagement"""
    try:
        tracker = get_metrics_tracker()
        system = get_community_system()

        # Get community stats
        community_stats = system.get_contribution_stats()

        # Count actual artifacts
        artifacts = artifacts_data.get("artifacts", [])
        total_items = len(artifacts)

        # Get impact summary with community data
        impact = tracker.get_impact_summary(
            total_cultures=16,
            total_items=total_items,
            community_stats=community_stats
        )

        return impact
    except Exception as e:
        logger.error(f"Error getting impact metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Lifecycle Events
# ============================================================================

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down...")
    await cleanup_web_agent()

# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
