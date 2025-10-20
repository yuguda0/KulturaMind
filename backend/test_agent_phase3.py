#!/usr/bin/env python3
"""
Phase 3 Agent Testing
Tests the Fetch.ai uAgent with Phase 2 integration
"""

import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from agent import process_query

def test_agent_queries():
    """Test agent query processing with Phase 2 components"""
    print("\n" + "="*70)
    print("PHASE 3: FETCH.AI AGENT TESTING")
    print("="*70)
    
    test_queries = [
        ("What is Sango Festival?", None),
        ("Tell me about Yoruba art", None),
        ("What are Igbo masquerades?", "igbo"),
        ("Share a Hausa proverb", "hausa"),
        ("Tell me about Yoruba culture", None),
        ("What is Adire textile?", None),
        ("Explain Osun-Osogbo festival", None),
    ]
    
    results = []
    
    for query, culture in test_queries:
        print(f"\n{'─'*70}")
        print(f"Query: {query}")
        if culture:
            print(f"Culture Filter: {culture}")
        print(f"{'─'*70}")
        
        try:
            response = process_query(query, culture)
            print(f"Response:\n{response}")
            results.append(True)
        except Exception as e:
            print(f"❌ Error: {e}")
            results.append(False)
    
    # Summary
    print(f"\n{'='*70}")
    print("TEST SUMMARY")
    print(f"{'='*70}")
    passed = sum(results)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("\n✅ All agent queries processed successfully!")
        return True
    else:
        print(f"\n⚠️  {total - passed} query(ies) failed")
        return False


if __name__ == "__main__":
    success = test_agent_queries()
    sys.exit(0 if success else 1)

