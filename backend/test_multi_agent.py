#!/usr/bin/env python3
"""
Test Multi-Agent System
Quick test to verify all agents are working
"""

import asyncio
import logging
from multi_agent_system import MultiAgentSystem

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def test_multi_agent_system():
    """Test multi-agent system initialization and basic functionality"""
    
    print("\n" + "="*70)
    print("MULTI-AGENT SYSTEM TEST")
    print("="*70)
    
    # Initialize system
    print("\n1. Initializing Multi-Agent System...")
    system = MultiAgentSystem()
    print("   ✓ System initialized")
    
    # Get system info
    print("\n2. System Information:")
    info = system.get_system_info()
    print(f"   - System: {info['system']}")
    print(f"   - Total Agents: {info['total_agents']}")
    print(f"   - Architecture: {info['architecture']}")
    
    print("\n3. Available Agents:")
    for agent_id, agent_info in info['agents'].items():
        print(f"   - {agent_info['name']} (Port {agent_info['port']})")
        print(f"     Role: {agent_info['role']}")
    
    # Get supported languages
    print("\n4. Supported Languages:")
    languages = system.get_supported_languages()
    print(f"   - Total: {len(languages)} languages")
    for lang in languages:
        print(f"     • {lang['name']} ({lang['code']})")
    
    # Test query
    print("\n5. Testing Query Processing...")
    try:
        result = await system.process_query(
            query="Tell me about Yoruba culture",
            language='en',
            use_research=False,
            use_verification=False
        )
        
        print(f"   ✓ Query processed successfully")
        print(f"   - Response length: {len(result['response'])} characters")
        print(f"   - Confidence: {result['confidence']:.2f}")
        print(f"   - Agents used: {', '.join(result['agents_used'])}")
        print(f"   - Sources: {len(result['sources'])}")
        
    except Exception as e:
        print(f"   ✗ Query processing failed: {e}")
    
    print("\n" + "="*70)
    print("TEST COMPLETE")
    print("="*70 + "\n")


if __name__ == "__main__":
    asyncio.run(test_multi_agent_system())

