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
        max_tokens: int = 800
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
        return """You are an expert in African cultural heritage with comprehensive knowledge of cultures across Africa including West Africa (Yoruba, Igbo, Hausa, Edo, Fulani, Ijaw, Kanuri, Tiv, Efik, Ibibio, Akan), East Africa (Maasai, Amhara), Southern Africa (Zulu, Xhosa), and North Africa (Berber).

RESPONSE STYLE - CRITICAL:
- Start responses immediately with the actual information requested
- Use a direct, encyclopedic tone similar to Wikipedia or academic sources
- Do NOT use preambles, filler phrases, or meta-commentary about your knowledge
- Do NOT apologize for knowledge limitations or explain what you don't know
- Do NOT use phrases like: "Of course!", "While my knowledge base...", "As you've seen...", "I don't have specific additional information beyond...", "However, I can synthesize...", "Let me provide you with..."
- If information is limited, simply provide what is available without explaining the limitation

CONTENT REQUIREMENTS:
1. Ground responses in the provided context documents and knowledge base
2. Explain cultural significance, historical context, and contemporary relevance
3. Preserve and celebrate African cultural knowledge with respect and accuracy
4. Be educational and culturally sensitive
5. Cite specific cultural items from the context when answering questions
6. If direct information is not available, provide related cultural context and explain connections

EXAMPLE - CORRECT STYLE:
"The Xhosa Beaded Necklace is a traditional adornment from the Xhosa people of South Africa's Eastern Cape region. These necklaces feature intricate beadwork patterns that reflect cultural identity and social status..."

EXAMPLE - INCORRECT STYLE (DO NOT USE):
"Of course! While my knowledge base contains many details about African cultures, I don't have specific additional information about the Xhosa Beaded Necklace beyond what was provided. However, I can synthesize and expand upon the details..."

Always be maximally helpful while maintaining accuracy and cultural respect."""

    def _fallback_response(self, query: str, context: List[Dict[str, Any]]) -> str:
        """Fallback response when API fails - always provides informative content"""
        if not context:
            # Provide direct informative response about African cultural heritage
            return (
                "African cultural heritage encompasses diverse traditions across the continent. "
                "West African cultures include Yoruba, Igbo, Hausa, Edo, Fulani, Ijaw, Kanuri, Tiv, Efik, Ibibio, and Akan. "
                "East African cultures include Maasai and Amhara. Southern African cultures include Zulu and Xhosa. "
                "North African cultures include Berber. Each culture maintains rich traditions including festivals, art forms, languages, and proverbs. "
                "Refine your query to explore specific cultural aspects for detailed information."
            )

        # Build comprehensive response from context - direct style
        primary = context[0]
        metadata = primary.get('metadata', {})

        response = f"**{metadata.get('name', 'Cultural Item')}**\n"
        response += f"Culture: {metadata.get('culture', 'Unknown')}\n"
        response += f"Type: {primary.get('type', 'Unknown').replace('_', ' ').title()}\n\n"
        response += f"{primary.get('text', 'Information available in knowledge base.')}\n"

        # Add related items if available
        if len(context) > 1:
            related_names = [c['metadata'].get('name', 'Unknown') for c in context[1:4]]
            response += f"\nRelated cultural items: {', '.join(related_names)}"

        return response

    def summarize_cultural_item(self, item: Dict[str, Any]) -> str:
        """
        Generate a summary of a cultural item

        Args:
            item: Cultural item metadata

        Returns:
            Generated summary
        """
        prompt = f"""Provide a concise, direct summary of this cultural item without preambles or filler:

Name: {item.get('name')}
Culture: {item.get('culture')}
Type: {item.get('type', 'unknown')}
Description: {item.get('description')}

Requirements:
- Start immediately with the information
- Keep to 2-3 sentences
- Use encyclopedic tone (like Wikipedia)
- Do NOT use phrases like "Of course!", "While my knowledge base...", "I don't have...", "However..."
- Be educational and respectful"""

        messages = [
            {
                "role": "system",
                "content": "You are an expert in African cultural heritage. Provide direct, concise summaries without preambles or meta-commentary. Start immediately with the information."
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

