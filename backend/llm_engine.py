"""
LLM Engine using ASI:One API
Provides real AI-powered responses grounded in cultural knowledge
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional
import requests
from dotenv import load_dotenv

logger = logging.getLogger(__name__)
load_dotenv()


class ASIOneLLM:
    """
    ASI:One LLM integration for intelligent cultural heritage responses
    Uses real foundation models for reasoning and generation
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize ASI:One LLM
        
        Args:
            api_key: ASI:One API key (defaults to ASI_API_KEY env var)
        """
        self.api_key = api_key or os.getenv('ASI_API_KEY')
        if not self.api_key:
            raise ValueError("ASI_API_KEY not found in environment variables")

        self.base_url = "https://api.asi1.ai/v1"
        self.model = "asi1-mini"  # Correct model name from ASI:One API

        logger.info("✓ ASI:One LLM initialized")

    def generate_response(
        self,
        query: str,
        context: List[Dict[str, Any]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> str:
        """
        Generate response using ASI:One with RAG context
        
        Args:
            query: User query
            context: Retrieved context documents
            system_prompt: Custom system prompt
            temperature: Response creativity (0-1)
            max_tokens: Maximum response length
            
        Returns:
            Generated response
        """
        # Build context string
        context_str = self._format_context(context)
        
        # Build system prompt
        if not system_prompt:
            system_prompt = self._get_default_system_prompt()
        
        # Build messages
        messages = [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": f"Context:\n{context_str}\n\nQuestion: {query}"
            }
        ]
        
        try:
            # Call ASI:One API
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content']
            else:
                logger.error(f"ASI:One API error: {response.status_code} - {response.text}")
                return self._fallback_response(query, context)
        
        except Exception as e:
            logger.error(f"Error calling ASI:One API: {e}")
            return self._fallback_response(query, context)

    def _format_context(self, context: List[Dict[str, Any]]) -> str:
        """Format retrieved context for LLM"""
        if not context:
            return "No context available."

        formatted = []
        for i, doc in enumerate(context, 1):
            metadata = doc.get('metadata', {})
            doc_type = doc.get('type', 'unknown')
            text = doc.get('text', '')

            # Ensure doc_type is not None before calling .upper()
            if doc_type is None:
                doc_type = 'unknown'

            formatted.append(
                f"{i}. [{doc_type.upper()}] {metadata.get('name', 'Unknown')}\n"
                f"   {text}\n"
                f"   Culture: {metadata.get('culture', 'Unknown')}"
            )

        return "\n".join(formatted)

    def _get_default_system_prompt(self) -> str:
        """Get default system prompt for cultural heritage"""
        return """You are an expert in African cultural heritage, specifically knowledgeable about 
Yoruba, Igbo, and Hausa cultures. Your role is to:

1. Provide accurate, respectful information about cultural practices, festivals, art forms, and traditions
2. Ground your responses in the provided context documents
3. Explain cultural significance and historical context
4. Preserve and celebrate cultural knowledge
5. Be educational and engaging

Always cite the specific cultural items from the context when answering questions.
If information is not in the context, say so clearly rather than making assumptions."""

    def _fallback_response(self, query: str, context: List[Dict[str, Any]]) -> str:
        """Fallback response when API fails"""
        if not context:
            return "I don't have enough information to answer that question about cultural heritage."
        
        # Build simple response from context
        primary = context[0]
        metadata = primary.get('metadata', {})
        
        return (
            f"Based on available cultural knowledge:\n\n"
            f"**{metadata.get('name', 'Cultural Item')}**\n"
            f"Culture: {metadata.get('culture', 'Unknown')}\n\n"
            f"{primary.get('text', 'Information available in knowledge base.')}"
        )

    def summarize_cultural_item(self, item: Dict[str, Any]) -> str:
        """
        Generate a summary of a cultural item
        
        Args:
            item: Cultural item metadata
            
        Returns:
            Generated summary
        """
        prompt = f"""Provide a concise, engaging summary of this cultural item:
        
Name: {item.get('name')}
Culture: {item.get('culture')}
Type: {item.get('type', 'unknown')}
Description: {item.get('description')}

Keep it to 2-3 sentences and make it educational and respectful."""
        
        messages = [
            {
                "role": "system",
                "content": "You are an expert in African cultural heritage. Provide concise, accurate summaries."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
        
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model,
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 200
                },
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()['choices'][0]['message']['content']
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
        
        return item.get('description', 'No summary available.')


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    # Test LLM
    llm = ASIOneLLM()
    
    # Test context
    context = [
        {
            'type': 'festival',
            'text': 'Sango Festival - Annual celebration featuring drumming, dancing, and spiritual rituals',
            'metadata': {
                'name': 'Sango Festival',
                'culture': 'Yoruba',
                'description': 'Honors Sango, god of thunder and lightning'
            }
        }
    ]
    
    # Generate response
    response = llm.generate_response(
        "Tell me about Sango Festival",
        context
    )
    print(f"Response:\n{response}")

