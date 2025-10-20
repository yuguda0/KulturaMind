#!/usr/bin/env python3
"""
Fetch.ai uAgent for KulturaMind - Real AI Stack
Implements the cultural heritage chatbot with:
- Qdrant vector database for semantic search
- ASI:One LLM for intelligent generation
- MeTTa knowledge graph for reasoning
- Complete RAG pipeline
"""

from uagents import Agent, Context, Model
from typing import Optional
import os
from dotenv import load_dotenv
import logging

from rag_pipeline import RAGPipeline

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize RAG Pipeline (Qdrant + ASI:One + MeTTa)
logger.info("Initializing RAG Pipeline...")
try:
    rag_pipeline = RAGPipeline()
    logger.info("✓ RAG Pipeline initialized successfully")
except Exception as e:
    logger.error(f"Error initializing RAG Pipeline: {e}")
    rag_pipeline = None

# Create agent
agent = Agent(
    name="KulturaMind-Agent",
    port=8001,
    seed="kulturamind-seed-phrase",
    endpoint=["http://127.0.0.1:8001/submit"],
)

# Define message models
class ChatMessage(Model):
    """Chat message model"""
    message: str
    culture: Optional[str] = None

class ChatResponse(Model):
    """Chat response model"""
    response: str
    sources: list = []

# Event handlers

@agent.on_message(model=ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    """Handle incoming chat messages"""
    ctx.logger.info(f"Received message from {sender}: {msg.message}")
    
    # Process message
    response_text = process_query(msg.message, msg.culture)
    
    # Send response
    await ctx.send(sender, ChatResponse(response=response_text))

@agent.on_interval(period=60.0)
async def say_hello(ctx: Context):
    """Periodic health check"""
    ctx.logger.info("KulturaMind Agent is running...")

# Helper functions

def process_query(query: str, culture: Optional[str] = None) -> str:
    """
    Process user query using RAG Pipeline:
    1. Vector search (Qdrant + semantic embeddings)
    2. Knowledge graph reasoning (MeTTa)
    3. LLM generation (ASI:One)
    """
    if not rag_pipeline:
        return "RAG Pipeline not initialized. Please check configuration."

    try:
        logger.info(f"Processing query: {query}")

        # Execute RAG pipeline
        result = rag_pipeline.query(
            query=query,
            top_k=5,
            use_reasoning=True,
            use_llm=True
        )

        response = result['response']
        logger.info(f"Generated response using RAG pipeline")
        logger.info(f"  - Retrieved: {len(result['retrieved_documents'])} documents")
        logger.info(f"  - Reasoning: {len(result['reasoning_results'])} inferences")
        logger.info(f"  - LLM: {result['used_llm']}")

        return response

    except Exception as e:
        logger.error(f"Error processing query: {e}")
        return f"I encountered an error processing your query: {str(e)}"

def build_response_from_reasoning(query: str, reasoning_results: list, culture: Optional[str] = None) -> str:
    """
    Build response using MeTTa reasoning results
    Prioritizes the most relevant result based on type and confidence
    """
    if not reasoning_results:
        return "No reasoning results available."

    # Sort by confidence and type relevance
    sorted_results = sorted(reasoning_results, key=lambda x: x.get('confidence', 0), reverse=True)
    primary_result = sorted_results[0]

    result_type = primary_result.get('type', 'unknown')
    data = primary_result.get('data', {})
    confidence = primary_result.get('confidence', 0)

    # Build response based on type
    if result_type == 'festival':
        response = (
            f"🎉 {data.get('name', 'Festival')}\n\n"
            f"Culture: {data.get('culture', 'Unknown').title()}\n"
            f"Season: {data.get('season', 'Unknown')}\n"
            f"Location: {data.get('location', 'Unknown')}\n\n"
            f"Description: {data.get('description', 'No description available')}\n\n"
            f"Significance: {data.get('significance', 'Important cultural event')}"
        )

    elif result_type == 'art_form':
        response = (
            f"🎨 {data.get('name', 'Art Form')}\n\n"
            f"Culture: {data.get('culture', 'Unknown').title()}\n"
            f"Medium: {data.get('medium', 'Unknown')}\n\n"
            f"Description: {data.get('description', 'No description available')}\n\n"
            f"Techniques: {', '.join(data.get('techniques', []))}\n"
            f"Materials: {', '.join(data.get('materials', []))}"
        )

    elif result_type == 'tradition':
        response = (
            f"🎭 {data.get('name', 'Tradition')}\n\n"
            f"Culture: {data.get('culture', 'Unknown').title()}\n"
            f"Category: {data.get('category', 'Unknown')}\n\n"
            f"Description: {data.get('description', 'No description available')}\n\n"
            f"Significance: {data.get('significance', 'Important cultural practice')}\n\n"
            f"Practices: {', '.join(data.get('practices', []))}"
        )

    elif result_type == 'language':
        response = (
            f"🗣️ {data.get('name', 'Language')}\n\n"
            f"Culture: {data.get('culture', 'Unknown').title()}\n"
            f"Speakers: {data.get('speakers', 'Unknown')}\n\n"
            f"Description: {data.get('description', 'No description available')}\n\n"
            f"Characteristics: {', '.join(data.get('characteristics', []))}"
        )

    elif result_type == 'proverb':
        response = (
            f"💭 Proverb from {data.get('culture', 'Unknown').title()}\n\n"
            f"'{data.get('text', 'No text')}'\n\n"
            f"Meaning: {data.get('meaning', 'No meaning provided')}"
        )

    else:
        response = f"Found: {data}"

    # Add reasoning metadata
    response += f"\n\n🧠 MeTTa Reasoning: {len(reasoning_results)} related items inferred"
    response += f"\n📊 Confidence: {confidence:.1%}"

    return response


def handle_festival_query_v2(query: str, culture: Optional[str], semantic_results: list, rag_results: list) -> str:
    """Handle festival-related queries using Phase 2 data"""
    # Use semantic search results first
    if semantic_results:
        result = semantic_results[0]
        doc = result['document']
        if doc['type'] == 'festival':
            data = doc['data']
            return (
                f"🎉 {data.get('name', 'Festival')}\n\n"
                f"Culture: {data.get('culture', 'Unknown').title()}\n"
                f"Season: {data.get('season', 'Unknown')}\n"
                f"Location: {data.get('location', 'Unknown')}\n\n"
                f"Description: {data.get('description', 'No description available')}\n\n"
                f"Significance: {data.get('significance', 'Important cultural event')}\n\n"
                f"📊 Confidence: {result['similarity']:.1%}"
            )

    # Fallback to KB
    if culture:
        festivals = kb.get_festivals(culture)
    else:
        festivals = kb.get_festivals()

    if festivals:
        festival = festivals[0]
        return (
            f"🎉 {festival.get('name', 'Festival')}\n\n"
            f"Culture: {festival.get('culture', 'Unknown').title()}\n"
            f"Season: {festival.get('season', 'Unknown')}\n"
            f"Location: {festival.get('location', 'Unknown')}\n\n"
            f"Description: {festival.get('description', 'No description available')}\n\n"
            f"Significance: {festival.get('significance', 'Important cultural event')}"
        )
    else:
        return "I don't have information about that festival. Try asking about Sango, Osun-Osogbo, Iri-Ji, or Durbar festivals!"

def handle_art_query_v2(query: str, culture: Optional[str], semantic_results: list, rag_results: list) -> str:
    """Handle art form queries using Phase 2 data"""
    if semantic_results:
        result = semantic_results[0]
        doc = result['document']
        if doc['type'] == 'art_form':
            data = doc['data']
            return (
                f"🎨 {data.get('name', 'Art Form')}\n\n"
                f"Culture: {data.get('culture', 'Unknown').title()}\n"
                f"Medium: {data.get('medium', 'Unknown')}\n\n"
                f"Description: {data.get('description', 'No description available')}\n\n"
                f"Techniques: {', '.join(data.get('techniques', []))}\n"
                f"Materials: {', '.join(data.get('materials', []))}\n\n"
                f"📊 Confidence: {result['similarity']:.1%}"
            )

    if culture:
        art_forms = kb.get_art_forms(culture)
    else:
        art_forms = kb.get_art_forms()

    if art_forms:
        art = art_forms[0]
        return (
            f"🎨 {art.get('name', 'Art Form')}\n\n"
            f"Culture: {art.get('culture', 'Unknown').title()}\n"
            f"Medium: {art.get('medium', 'Unknown')}\n\n"
            f"Description: {art.get('description', 'No description available')}\n\n"
            f"Techniques: {', '.join(art.get('techniques', []))}\n"
            f"Materials: {', '.join(art.get('materials', []))}"
        )
    else:
        return "I don't have information about that art form. Try asking about Adire, Beadwork, Mbari, Uli, or Hausa Textiles!"

def handle_tradition_query_v2(query: str, culture: Optional[str], semantic_results: list, rag_results: list) -> str:
    """Handle tradition queries using Phase 2 data"""
    if semantic_results:
        result = semantic_results[0]
        doc = result['document']
        if doc['type'] == 'tradition':
            data = doc['data']
            return (
                f"🎭 {data.get('name', 'Tradition')}\n\n"
                f"Culture: {data.get('culture', 'Unknown').title()}\n"
                f"Category: {data.get('category', 'Unknown')}\n\n"
                f"Description: {data.get('description', 'No description available')}\n\n"
                f"Significance: {data.get('significance', 'Important cultural practice')}\n\n"
                f"Practices: {', '.join(data.get('practices', []))}\n\n"
                f"📊 Confidence: {result['similarity']:.1%}"
            )

    if culture:
        traditions = kb.get_traditions(culture)
    else:
        traditions = kb.get_traditions()

    if traditions:
        tradition = traditions[0]
        return (
            f"🎭 {tradition.get('name', 'Tradition')}\n\n"
            f"Culture: {tradition.get('culture', 'Unknown').title()}\n"
            f"Category: {tradition.get('category', 'Unknown')}\n\n"
            f"Description: {tradition.get('description', 'No description available')}\n\n"
            f"Significance: {tradition.get('significance', 'Important cultural practice')}\n\n"
            f"Practices: {', '.join(tradition.get('practices', []))}"
        )
    else:
        return "I don't have information about that tradition. Try asking about Masquerades, Naming Ceremonies, or Bride Price!"

def handle_language_query_v2(query: str, culture: Optional[str], semantic_results: list, rag_results: list) -> str:
    """Handle language and proverb queries using Phase 2 data"""
    if "proverb" in query or "saying" in query or "wisdom" in query:
        if semantic_results:
            result = semantic_results[0]
            doc = result['document']
            if doc['type'] == 'proverb':
                data = doc['data']
                return (
                    f"💭 Proverb from {data.get('culture', 'Unknown').title()}\n\n"
                    f"'{data.get('text', 'No text')}'\n\n"
                    f"Meaning: {data.get('meaning', 'No meaning provided')}\n\n"
                    f"📊 Confidence: {result['similarity']:.1%}"
                )

        if culture:
            proverbs = kb.get_proverbs(culture)
        else:
            proverbs = kb.get_proverbs()

        if proverbs:
            proverb = proverbs[0]
            return (
                f"💭 Proverb from {proverb.get('culture', 'Unknown').title()}\n\n"
                f"'{proverb.get('text', 'No text')}'\n\n"
                f"Meaning: {proverb.get('meaning', 'No meaning provided')}"
            )

    else:
        if semantic_results:
            result = semantic_results[0]
            doc = result['document']
            if doc['type'] == 'language':
                data = doc['data']
                return (
                    f"🗣️ {data.get('name', 'Language')}\n\n"
                    f"Culture: {data.get('culture', 'Unknown').title()}\n"
                    f"Speakers: {data.get('speakers', 'Unknown')}\n\n"
                    f"Description: {data.get('description', 'No description available')}\n\n"
                    f"Characteristics: {', '.join(data.get('characteristics', []))}\n\n"
                    f"📊 Confidence: {result['similarity']:.1%}"
                )

        if culture:
            languages = kb.get_languages(culture)
        else:
            languages = kb.get_languages()

        if languages:
            lang = languages[0]
            return (
                f"🗣️ {lang.get('name', 'Language')}\n\n"
                f"Culture: {lang.get('culture', 'Unknown').title()}\n"
                f"Speakers: {lang.get('speakers', 'Unknown')}\n\n"
                f"Description: {lang.get('description', 'No description available')}\n\n"
                f"Characteristics: {', '.join(lang.get('characteristics', []))}"
            )

    return "I can share proverbs and language information. Try asking about Yoruba, Igbo, or Hausa languages!"

def handle_culture_query_v2(query: str, culture: Optional[str], semantic_results: list) -> str:
    """Handle general culture queries using Phase 2 data"""
    cultures = kb.get_all_cultures()

    if cultures:
        culture_data = cultures[0]
        info = kb.get_culture_info(culture_data['id'])

        return (
            f"🌍 {culture_data.get('name', 'Culture')}\n\n"
            f"Region: {culture_data.get('region', 'Unknown')}\n"
            f"Country: {culture_data.get('country', 'Unknown')}\n\n"
            f"Description: {culture_data.get('description', 'No description available')}\n\n"
            f"Cultural Items:\n"
            f"- Festivals: {len(info.get('festivals', []))}\n"
            f"- Art Forms: {len(info.get('art_forms', []))}\n"
            f"- Traditions: {len(info.get('traditions', []))}\n"
            f"- Languages: {len(info.get('languages', []))}\n"
            f"- Proverbs: {len(info.get('proverbs', []))}\n\n"
            f"📊 Semantic search found {len(semantic_results)} related items"
        )

    return "I specialize in Yoruba, Igbo, and Hausa cultures. What would you like to know?"

def handle_general_query_v2(query: str, semantic_results: list, rag_results: list) -> str:
    """Handle general queries using Phase 2 data"""
    if semantic_results or rag_results:
        response = "I found relevant cultural information! 🎉\n\n"

        if semantic_results:
            response += f"📚 Semantic Search Results: {len(semantic_results)} items found\n"
            for i, result in enumerate(semantic_results[:2], 1):
                doc = result['document']
                response += f"  {i}. {doc['type'].replace('_', ' ').title()}\n"

        if rag_results:
            response += f"\n📖 RAG Retrieved: {len(rag_results)} documents\n"

        response += (
            "\n\nI can help you learn about:\n"
            "- Festivals and celebrations\n"
            "- Traditional art forms\n"
            "- Cultural practices and traditions\n"
            "- Languages and proverbs\n"
            "- Yoruba, Igbo, and Hausa cultures\n\n"
            "What would you like to know more about?"
        )
        return response
    else:
        return (
            "Welcome to KulturaMind! 👋\n\n"
            "I'm here to share knowledge about African cultural heritage, "
            "particularly Yoruba, Igbo, and Hausa cultures.\n\n"
            "You can ask me about:\n"
            "- Festivals (Sango, Osun-Osogbo, Iri-Ji, Durbar)\n"
            "- Art forms (Adire, Beadwork, Mbari, Uli)\n"
            "- Traditions and ceremonies\n"
            "- Languages and proverbs\n\n"
            "What interests you?"
        )

if __name__ == "__main__":
    agent.run()

