#!/usr/bin/env python3
"""
Test ASI:One Stack for KulturaMind
Tests RAG pipeline with ASI:One LLM (no embeddings needed)
"""

import logging
import sys
import os
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))


def test_vector_database():
    """Test vector database"""
    logger.info("\n" + "="*70)
    logger.info("TEST 1: Vector Database")
    logger.info("="*70)
    
    try:
        from vector_db import load_cultural_data_to_vectors
        
        logger.info("Loading cultural data into vector database...")
        vdb = load_cultural_data_to_vectors()
        
        logger.info("✓ Cultural data loaded")
        logger.info(f"  - Documents: {len(vdb.embeddings_store)}")
        
        logger.info("\n✅ Vector Database Test PASSED")
        return True
    except Exception as e:
        logger.error(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_llm_engine():
    """Test ASI:One LLM"""
    logger.info("\n" + "="*70)
    logger.info("TEST 2: ASI:One LLM Engine")
    logger.info("="*70)
    
    try:
        from llm_engine import ASIOneLLM
        
        logger.info("Initializing ASI:One LLM...")
        llm = ASIOneLLM()
        
        logger.info("✓ LLM initialized")
        logger.info(f"  - Model: asi1-mini")
        logger.info(f"  - API: https://api.asi1.ai/v1")
        
        logger.info("\nTesting LLM generation...")
        response = llm.generate_response(
            "What is Sango Festival?",
            [{'text': 'Sango Festival is a celebration of the Yoruba god of thunder'}]
        )
        logger.info(f"✓ Generated response: {response[:100]}...")
        
        logger.info("\n✅ LLM Engine Test PASSED")
        return True
    except Exception as e:
        logger.error(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_metta_reasoning():
    """Test MeTTa reasoning engine"""
    logger.info("\n" + "="*70)
    logger.info("TEST 3: MeTTa Reasoning Engine")
    logger.info("="*70)
    
    try:
        from metta_reasoning import MeTTaReasoningEngine
        
        logger.info("Initializing MeTTa reasoning engine...")
        engine = MeTTaReasoningEngine()
        
        logger.info("✓ MeTTa engine initialized")
        
        logger.info("\nTesting reasoning...")
        results = engine.query("What is Sango Festival?")
        logger.info(f"✓ Found {len(results)} inferences")
        
        logger.info("\n✅ MeTTa Reasoning Test PASSED")
        return True
    except Exception as e:
        logger.error(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_rag_pipeline():
    """Test RAG pipeline"""
    logger.info("\n" + "="*70)
    logger.info("TEST 4: RAG Pipeline Integration")
    logger.info("="*70)
    
    try:
        from rag_pipeline import RAGPipeline
        
        logger.info("Initializing RAG pipeline...")
        pipeline = RAGPipeline()
        logger.info("✓ RAG pipeline initialized")
        
        logger.info("\nProcessing query: 'Tell me about Yoruba culture'")
        result = pipeline.query("Tell me about Yoruba culture", use_llm=True, use_reasoning=True)
        
        logger.info("✓ Query processed")
        logger.info(f"  - Retrieved documents: {len(result['retrieved_documents'])}")
        logger.info(f"  - Reasoning results: {len(result['reasoning_results'])}")
        logger.info(f"  - Response: {result['response'][:100]}...")
        
        logger.info("\n✅ RAG Pipeline Test PASSED")
        return True
    except Exception as e:
        logger.error(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_agent_integration():
    """Test agent integration"""
    logger.info("\n" + "="*70)
    logger.info("TEST 5: Agent Integration")
    logger.info("="*70)
    
    try:
        from agent import process_query
        
        logger.info("Testing agent query processing...")
        response = process_query("What is Sango Festival?")
        
        logger.info("✓ Agent processed query")
        logger.info(f"  - Response: {response[:100]}...")
        
        logger.info("\n✅ Agent Integration Test PASSED")
        return True
    except Exception as e:
        logger.error(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    logger.info("\n" + "="*70)
    logger.info("KULTURAMIND - REAL AI STACK TEST SUITE")
    logger.info("="*70)
    
    tests = [
        ("Vector Database", test_vector_database),
        ("LLM Engine", test_llm_engine),
        ("MeTTa Reasoning", test_metta_reasoning),
        ("RAG Pipeline", test_rag_pipeline),
        ("Agent Integration", test_agent_integration),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            passed = test_func()
            results.append((name, passed))
        except Exception as e:
            logger.error(f"Test {name} crashed: {e}")
            results.append((name, False))
    
    # Summary
    logger.info("\n" + "="*70)
    logger.info("TEST SUMMARY")
    logger.info("="*70)
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    
    for name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        logger.info(f"{name}: {status}")
    
    logger.info(f"\nTotal: {passed_count}/{total_count} tests passed")
    
    if passed_count == total_count:
        logger.info("\n🎉 ALL TESTS PASSED!")
        sys.exit(0)
    else:
        logger.error(f"\n❌ {total_count - passed_count} test(s) failed")
        sys.exit(1)
