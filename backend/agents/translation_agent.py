"""
Translation Agent
Specialized agent for multilingual support and language translation
"""

from uagents import Context
from typing import Dict, Any, List
import logging
from .base_agent import BaseKulturaAgent, AgentMessage, AgentResponse
from llm_engine import ASICloudLLM

logger = logging.getLogger(__name__)


class TranslationAgent(BaseKulturaAgent):
    """
    Translation Agent - Multilingual specialist
    Translates queries and responses to/from multiple African languages
    """
    
    # Supported languages
    SUPPORTED_LANGUAGES = {
        'en': 'English',
        'fr': 'French',
        'sw': 'Swahili',
        'ha': 'Hausa',
        'yo': 'Yoruba',
        'ig': 'Igbo',
        'zu': 'Zulu',
        'am': 'Amharic'
    }
    
    def __init__(self):
        super().__init__(
            name="translation-agent",
            port=8004,
            seed="kulturamind-translation-agent-seed"
        )
        
        # Initialize LLM for translation
        logger.info("Initializing LLM for Translation Agent...")
        try:
            self.llm = ASICloudLLM()
            logger.info(f"✓ Translation Agent ready ({len(self.SUPPORTED_LANGUAGES)} languages)")
        except Exception as e:
            logger.warning(f"LLM initialization failed: {e}")
            self.llm = None
    
    def _register_handlers(self):
        """Register message handlers"""
        
        @self.agent.on_message(model=AgentMessage)
        async def handle_message(ctx: Context, sender: str, msg: AgentMessage):
            """Handle incoming translation requests"""
            ctx.logger.info(f"Translation Agent received: {msg.message}")
            
            response = await self.process_message(ctx, sender, msg)
            await ctx.send(sender, response)
        
        @self.agent.on_interval(period=60.0)
        async def heartbeat(ctx: Context):
            """Periodic heartbeat"""
            ctx.logger.info("Translation Agent is active...")
    
    async def process_message(self, ctx: Context, sender: str, msg: AgentMessage) -> AgentResponse:
        """
        Process translation request
        
        Args:
            ctx: Agent context
            sender: Sender address
            msg: Translation request message
            
        Returns:
            Translated text
        """
        try:
            text = msg.message
            context = msg.context or {}
            
            # Get source and target languages
            source_lang = context.get('source_lang', 'en')
            target_lang = context.get('target_lang', 'en')
            
            # Validate languages
            if source_lang not in self.SUPPORTED_LANGUAGES:
                return AgentResponse(
                    response=f"Unsupported source language: {source_lang}",
                    agent_name=self.name,
                    confidence=0.0,
                    sources=[],
                    metadata={'error': 'unsupported_language'}
                )
            
            if target_lang not in self.SUPPORTED_LANGUAGES:
                return AgentResponse(
                    response=f"Unsupported target language: {target_lang}",
                    agent_name=self.name,
                    confidence=0.0,
                    sources=[],
                    metadata={'error': 'unsupported_language'}
                )
            
            # Skip translation if same language
            if source_lang == target_lang:
                return AgentResponse(
                    response=text,
                    agent_name=self.name,
                    confidence=1.0,
                    sources=[],
                    metadata={'skipped': True, 'reason': 'same_language'}
                )
            
            # Perform translation
            if self.llm:
                translated = await self._translate_with_llm(
                    text=text,
                    source_lang=source_lang,
                    target_lang=target_lang
                )
                confidence = 0.85
            else:
                translated = f"[Translation unavailable: {text}]"
                confidence = 0.3
            
            return AgentResponse(
                response=translated,
                agent_name=self.name,
                confidence=confidence,
                sources=[{
                    'source': 'ASI Cloud LLM',
                    'from': self.SUPPORTED_LANGUAGES[source_lang],
                    'to': self.SUPPORTED_LANGUAGES[target_lang]
                }],
                metadata={
                    'source_lang': source_lang,
                    'target_lang': target_lang,
                    'original_text': text
                }
            )
            
        except Exception as e:
            logger.error(f"Translation Agent error: {e}")
            return AgentResponse(
                response=f"Translation error: {str(e)}",
                agent_name=self.name,
                confidence=0.0,
                sources=[],
                metadata={'error': str(e)}
            )
    
    async def _translate_with_llm(
        self,
        text: str,
        source_lang: str,
        target_lang: str
    ) -> str:
        """
        Translate text using LLM
        
        Args:
            text: Text to translate
            source_lang: Source language code
            target_lang: Target language code
            
        Returns:
            Translated text
        """
        source_name = self.SUPPORTED_LANGUAGES[source_lang]
        target_name = self.SUPPORTED_LANGUAGES[target_lang]
        
        # Create translation prompt
        prompt = f"""Translate the following text from {source_name} to {target_name}.
Preserve cultural context and meaning. Provide only the translation without explanations.

Text to translate:
{text}

Translation:"""
        
        try:
            # Use LLM for translation
            context = [{
                'type': 'translation',
                'text': f"Translating from {source_name} to {target_name}",
                'metadata': {}
            }]
            
            translated = self.llm.generate_response(
                query=prompt,
                context=context,
                temperature=0.3,
                max_tokens=500
            )
            
            return translated.strip()
            
        except Exception as e:
            logger.error(f"LLM translation failed: {e}")
            return f"[Translation error: {text}]"
    
    def detect_language(self, text: str) -> str:
        """
        Detect language of text (simple heuristic)
        
        Args:
            text: Text to analyze
            
        Returns:
            Language code
        """
        # Simple keyword-based detection
        text_lower = text.lower()
        
        # French indicators
        if any(word in text_lower for word in ['le', 'la', 'les', 'de', 'du', 'des', 'et']):
            return 'fr'
        
        # Swahili indicators
        if any(word in text_lower for word in ['habari', 'jambo', 'asante', 'karibu']):
            return 'sw'
        
        # Hausa indicators
        if any(word in text_lower for word in ['sannu', 'yaya', 'nagode']):
            return 'ha'
        
        # Yoruba indicators
        if any(word in text_lower for word in ['bawo', 'ese', 'ojo']):
            return 'yo'
        
        # Igbo indicators
        if any(word in text_lower for word in ['kedu', 'daalụ', 'nnọọ']):
            return 'ig'
        
        # Default to English
        return 'en'
    
    def get_supported_languages(self) -> List[Dict[str, str]]:
        """Get list of supported languages"""
        return [
            {'code': code, 'name': name}
            for code, name in self.SUPPORTED_LANGUAGES.items()
        ]


if __name__ == "__main__":
    # Test Translation agent
    logging.basicConfig(level=logging.INFO)
    agent = TranslationAgent()
    agent.run()

