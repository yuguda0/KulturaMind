"""
Verification Agent
Specialized agent for fact-checking and source validation
"""

from uagents import Context
from typing import Dict, Any, List
import logging
from .base_agent import BaseKulturaAgent, AgentMessage, AgentResponse
from llm_engine import ASICloudLLM

logger = logging.getLogger(__name__)


class VerificationAgent(BaseKulturaAgent):
    """
    Verification Agent - Fact-checking specialist
    Validates cultural information against multiple sources
    """
    
    def __init__(self):
        super().__init__(
            name="verification-agent",
            port=8003,
            seed="kulturamind-verification-agent-seed"
        )
        
        # Initialize LLM for verification
        logger.info("Initializing LLM for Verification Agent...")
        try:
            self.llm = ASICloudLLM()
            logger.info("✓ Verification Agent ready with LLM")
        except Exception as e:
            logger.warning(f"LLM initialization failed: {e}")
            self.llm = None
    
    def _register_handlers(self):
        """Register message handlers"""
        
        @self.agent.on_message(model=AgentMessage)
        async def handle_message(ctx: Context, sender: str, msg: AgentMessage):
            """Handle incoming verification requests"""
            ctx.logger.info(f"Verification Agent received: {msg.message}")
            
            response = await self.process_message(ctx, sender, msg)
            await ctx.send(sender, response)
        
        @self.agent.on_interval(period=60.0)
        async def heartbeat(ctx: Context):
            """Periodic heartbeat"""
            ctx.logger.info("Verification Agent is active...")
    
    async def process_message(self, ctx: Context, sender: str, msg: AgentMessage) -> AgentResponse:
        """
        Process verification request
        
        Args:
            ctx: Agent context
            sender: Sender address
            msg: Verification request message
            
        Returns:
            Verification results
        """
        try:
            statement = msg.message
            context = msg.context or {}
            
            # Get sources to verify against
            sources = context.get('sources', [])
            heritage_response = context.get('heritage_response', '')
            research_data = context.get('research_data', '')
            
            # Perform verification
            verification_result = await self._verify_statement(
                statement=statement,
                heritage_response=heritage_response,
                research_data=research_data,
                sources=sources
            )
            
            return AgentResponse(
                response=verification_result['summary'],
                agent_name=self.name,
                confidence=verification_result['confidence'],
                sources=verification_result['verified_sources'],
                metadata={
                    'verification_score': verification_result['score'],
                    'consistency_check': verification_result['consistency'],
                    'source_count': len(sources)
                }
            )
            
        except Exception as e:
            logger.error(f"Verification Agent error: {e}")
            return AgentResponse(
                response=f"Verification error: {str(e)}",
                agent_name=self.name,
                confidence=0.0,
                sources=[],
                metadata={'error': str(e)}
            )
    
    async def _verify_statement(
        self,
        statement: str,
        heritage_response: str,
        research_data: str,
        sources: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Verify a statement against multiple sources
        
        Args:
            statement: Statement to verify
            heritage_response: Response from Heritage Keeper
            research_data: Data from Research Agent
            sources: List of sources
            
        Returns:
            Verification result
        """
        # Check consistency between sources
        consistency = self._check_consistency(heritage_response, research_data)
        
        # Count verified sources
        verified_sources = []
        for source in sources:
            if source.get('source') in ['Wikipedia', 'UNESCO', 'Academic']:
                verified_sources.append(source)
        
        # Calculate verification score
        score = self._calculate_verification_score(
            consistency=consistency,
            source_count=len(verified_sources),
            has_heritage=bool(heritage_response),
            has_research=bool(research_data)
        )
        
        # Generate verification summary
        if self.llm:
            summary = await self._generate_verification_summary(
                statement=statement,
                heritage_response=heritage_response,
                research_data=research_data,
                score=score
            )
        else:
            summary = self._generate_simple_summary(score, len(verified_sources))
        
        # Calculate confidence
        confidence = min(score / 100.0, 1.0)
        
        return {
            'summary': summary,
            'score': score,
            'confidence': confidence,
            'consistency': consistency,
            'verified_sources': verified_sources
        }
    
    def _check_consistency(self, heritage_response: str, research_data: str) -> str:
        """Check consistency between heritage and research data"""
        if not heritage_response or not research_data:
            return "partial"
        
        # Simple keyword overlap check
        heritage_words = set(heritage_response.lower().split())
        research_words = set(research_data.lower().split())
        
        overlap = len(heritage_words & research_words)
        total = len(heritage_words | research_words)
        
        if total == 0:
            return "unknown"
        
        overlap_ratio = overlap / total
        
        if overlap_ratio > 0.5:
            return "high"
        elif overlap_ratio > 0.3:
            return "medium"
        else:
            return "low"
    
    def _calculate_verification_score(
        self,
        consistency: str,
        source_count: int,
        has_heritage: bool,
        has_research: bool
    ) -> float:
        """Calculate verification score (0-100)"""
        score = 0.0
        
        # Base score for having data
        if has_heritage:
            score += 30
        if has_research:
            score += 20
        
        # Consistency bonus
        consistency_scores = {
            'high': 30,
            'medium': 20,
            'low': 10,
            'partial': 5,
            'unknown': 0
        }
        score += consistency_scores.get(consistency, 0)
        
        # Source count bonus (up to 20 points)
        score += min(source_count * 5, 20)
        
        return min(score, 100.0)
    
    async def _generate_verification_summary(
        self,
        statement: str,
        heritage_response: str,
        research_data: str,
        score: float
    ) -> str:
        """Generate verification summary using LLM"""
        try:
            context = [
                {
                    'type': 'verification',
                    'text': f"Heritage Response: {heritage_response}\n\nResearch Data: {research_data}",
                    'metadata': {'score': score}
                }
            ]
            
            prompt = f"""Verify this cultural statement and provide a brief assessment:

Statement: {statement}

Verification Score: {score}/100

Provide a 2-3 sentence verification summary without preambles."""
            
            summary = self.llm.generate_response(
                query=prompt,
                context=context,
                temperature=0.3,
                max_tokens=150
            )
            
            return summary
            
        except Exception as e:
            logger.error(f"LLM verification summary failed: {e}")
            return self._generate_simple_summary(score, 0)
    
    def _generate_simple_summary(self, score: float, source_count: int) -> str:
        """Generate simple verification summary"""
        if score >= 80:
            level = "High confidence"
        elif score >= 60:
            level = "Medium confidence"
        elif score >= 40:
            level = "Low confidence"
        else:
            level = "Insufficient data"
        
        return f"{level} verification. Score: {score:.0f}/100. Verified against {source_count} authoritative sources."


if __name__ == "__main__":
    # Test Verification agent
    logging.basicConfig(level=logging.INFO)
    agent = VerificationAgent()
    agent.run()

