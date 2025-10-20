#!/usr/bin/env python3
"""
FastAPI Backend for KulturaMind - Real AI Stack
Provides REST API for cultural heritage knowledge base using:
- ASI:One embeddings for semantic search
- MeTTa knowledge graph for reasoning
- ASI:One LLM for intelligent generation
- Web fetching agent for enriched cultural data
- Streaming responses for real-time chat
"""

from fastapi import FastAPI, HTTPException
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

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="KulturaMind API",
    description="AI Cultural Heritage Agent - Real AGI Stack",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG Pipeline (ASI:One + MeTTa + Semantic Search)
logger.info("Initializing RAG Pipeline...")
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

class QueryResponse(BaseModel):
    """Intelligent query response"""
    response: str
    sources: List[Dict[str, Any]] = []
    reasoning: List[Dict[str, Any]] = []

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

# ============================================================================
# Health & Info Endpoints
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "KulturaMind API",
        "version": "1.0.0",
        "status": "running",
        "description": "Real AGI Cultural Heritage Agent"
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "rag_pipeline_ready": rag_pipeline is not None
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
