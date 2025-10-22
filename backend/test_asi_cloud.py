#!/usr/bin/env python3
"""
Test ASI Cloud Compute Integration
Verifies that we can successfully call ASI Cloud API
"""

import os
import sys
import logging
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def test_asi_cloud_direct():
    """Test ASI Cloud API directly with openai library"""
    try:
        import openai
        
        api_key = os.getenv('ASI_CLOUD_API_KEY')
        base_url = os.getenv('ASI_CLOUD_BASE_URL', 'https://inference.asicloud.cudos.org/v1')
        model = os.getenv('ASI_CLOUD_MODEL', 'qwen/qwen3-32b')
        
        if not api_key:
            logger.error("❌ ASI_CLOUD_API_KEY not found in environment")
            return False
        
        logger.info(f"Testing ASI Cloud API...")
        logger.info(f"  Base URL: {base_url}")
        logger.info(f"  Model: {model}")
        
        client = openai.OpenAI(
            api_key=api_key,
            base_url=base_url
        )
        
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": "What is the capital of Japan?"}
            ],
            max_tokens=50
        )
        
        answer = response.choices[0].message.content
        logger.info(f"✅ ASI Cloud API working!")
        logger.info(f"  Response: {answer}")
        
        return True
        
    except ImportError:
        logger.error("❌ openai library not installed. Run: pip install openai")
        return False
    except Exception as e:
        logger.error(f"❌ Error calling ASI Cloud API: {e}")
        return False


def test_llm_engine():
    """Test our LLM engine wrapper"""
    try:
        from llm_engine import ASICloudLLM
        
        logger.info("\nTesting LLM Engine wrapper...")
        
        llm = ASICloudLLM()
        
        context = [
            {
                'type': 'festival',
                'text': 'Sango Festival is an annual Yoruba celebration honoring Sango, the god of thunder and lightning. Features drumming, dancing, and spiritual rituals.',
                'metadata': {
                    'name': 'Sango Festival',
                    'culture': 'Yoruba',
                    'description': 'Honors Sango, god of thunder and lightning'
                }
            }
        ]
        
        response = llm.generate_response(
            "Tell me about Sango Festival",
            context
        )
        
        logger.info(f"✅ LLM Engine working!")
        logger.info(f"  Response: {response[:200]}...")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Error testing LLM engine: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_rag_pipeline():
    """Test full RAG pipeline with ASI Cloud"""
    try:
        from rag_pipeline import RAGPipeline
        
        logger.info("\nTesting RAG Pipeline...")
        
        pipeline = RAGPipeline()
        
        result = pipeline.query(
            "What is the Sango Festival?",
            top_k=5,
            use_reasoning=True,
            use_llm=True
        )
        
        logger.info(f"✅ RAG Pipeline working!")
        logger.info(f"  Retrieved: {len(result['retrieved_documents'])} documents")
        logger.info(f"  Reasoning: {len(result['reasoning_results'])} inferences")
        logger.info(f"  Used LLM: {result['used_llm']}")
        logger.info(f"  Response: {result['response'][:200]}...")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Error testing RAG pipeline: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("="*70)
    print("ASI CLOUD COMPUTE INTEGRATION TEST")
    print("="*70)
    
    # Test 1: Direct API call
    test1 = test_asi_cloud_direct()
    
    # Test 2: LLM Engine wrapper
    test2 = test_llm_engine()
    
    # Test 3: Full RAG pipeline
    test3 = test_rag_pipeline()
    
    print("\n" + "="*70)
    print("TEST RESULTS")
    print("="*70)
    print(f"Direct API Call:  {'✅ PASS' if test1 else '❌ FAIL'}")
    print(f"LLM Engine:       {'✅ PASS' if test2 else '❌ FAIL'}")
    print(f"RAG Pipeline:     {'✅ PASS' if test3 else '❌ FAIL'}")
    print("="*70)
    
    if test1 and test2 and test3:
        print("\n🎉 ALL TESTS PASSED! ASI Cloud integration is working!")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Check errors above.")
        sys.exit(1)

