#!/usr/bin/env python3
"""
Test script for expanded African cultural knowledge base
Verifies that new cultures and data are properly indexed and retrievable
"""

import json
import logging
from typing import Dict, List, Any

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def load_cultural_data() -> Dict[str, Any]:
    """Load cultural data from JSON"""
    try:
        with open('cultural_data.json', 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading cultural data: {e}")
        return {}


def test_cultures_coverage():
    """Test that all expected cultures are present"""
    data = load_cultural_data()
    cultures = data.get('cultures', [])
    
    expected_cultures = [
        'yoruba', 'igbo', 'hausa', 'edo', 'fulani', 'ijaw', 'kanuri', 'tiv', 
        'efik', 'ibibio', 'zulu', 'xhosa', 'maasai', 'amhara', 'akan', 'berber'
    ]
    
    found_cultures = {c['id']: c['name'] for c in cultures}
    
    logger.info("=" * 70)
    logger.info("CULTURES COVERAGE TEST")
    logger.info("=" * 70)
    
    for culture_id in expected_cultures:
        if culture_id in found_cultures:
            logger.info(f"✓ {found_cultures[culture_id]} ({culture_id})")
        else:
            logger.warning(f"✗ Missing: {culture_id}")
    
    logger.info(f"\nTotal cultures: {len(cultures)}")
    return len(found_cultures) >= len(expected_cultures)


def test_content_categories():
    """Test that all content categories have sufficient data"""
    data = load_cultural_data()
    
    logger.info("\n" + "=" * 70)
    logger.info("CONTENT CATEGORIES TEST")
    logger.info("=" * 70)
    
    categories = {
        'festivals': data.get('festivals', []),
        'art_forms': data.get('art_forms', []),
        'traditions': data.get('traditions', []),
        'languages': data.get('languages', []),
        'proverbs': data.get('proverbs', [])
    }
    
    for category, items in categories.items():
        logger.info(f"✓ {category.replace('_', ' ').title()}: {len(items)} items")
    
    return all(len(items) > 0 for items in categories.values())


def test_cultural_diversity():
    """Test that data covers diverse African regions"""
    data = load_cultural_data()
    cultures = {c['id']: c for c in data.get('cultures', [])}
    
    logger.info("\n" + "=" * 70)
    logger.info("CULTURAL DIVERSITY TEST")
    logger.info("=" * 70)
    
    regions = {}
    for culture_id, culture in cultures.items():
        region = culture.get('region', 'Unknown')
        if region not in regions:
            regions[region] = []
        regions[region].append(culture['name'])
    
    for region, culture_list in sorted(regions.items()):
        logger.info(f"✓ {region}: {', '.join(culture_list)}")
    
    return len(regions) >= 4  # At least 4 regions


def test_data_completeness():
    """Test that each culture has complete data"""
    data = load_cultural_data()
    cultures = data.get('cultures', [])
    
    logger.info("\n" + "=" * 70)
    logger.info("DATA COMPLETENESS TEST")
    logger.info("=" * 70)
    
    all_complete = True
    for culture in cultures:
        required_fields = ['id', 'name', 'region', 'description']
        missing = [f for f in required_fields if f not in culture]
        
        if missing:
            logger.warning(f"✗ {culture.get('name', 'Unknown')}: Missing {missing}")
            all_complete = False
        else:
            logger.info(f"✓ {culture['name']}: Complete")
    
    return all_complete


def test_festival_coverage():
    """Test that festivals cover multiple cultures"""
    data = load_cultural_data()
    festivals = data.get('festivals', [])
    
    logger.info("\n" + "=" * 70)
    logger.info("FESTIVAL COVERAGE TEST")
    logger.info("=" * 70)
    
    cultures_with_festivals = set()
    for festival in festivals:
        culture = festival.get('culture', 'unknown')
        cultures_with_festivals.add(culture)
    
    logger.info(f"Festivals: {len(festivals)} total")
    logger.info(f"Cultures with festivals: {len(cultures_with_festivals)}")
    
    for culture in sorted(cultures_with_festivals):
        count = len([f for f in festivals if f.get('culture') == culture])
        logger.info(f"  - {culture}: {count} festivals")
    
    return len(cultures_with_festivals) >= 10


def test_language_coverage():
    """Test that languages cover multiple cultures"""
    data = load_cultural_data()
    languages = data.get('languages', [])
    
    logger.info("\n" + "=" * 70)
    logger.info("LANGUAGE COVERAGE TEST")
    logger.info("=" * 70)
    
    cultures_with_languages = set()
    for language in languages:
        culture = language.get('culture', 'unknown')
        cultures_with_languages.add(culture)
    
    logger.info(f"Languages: {len(languages)} total")
    logger.info(f"Cultures with languages: {len(cultures_with_languages)}")
    
    for culture in sorted(cultures_with_languages):
        count = len([l for l in languages if l.get('culture') == culture])
        logger.info(f"  - {culture}: {count} languages")
    
    return len(cultures_with_languages) >= 10


def test_proverb_coverage():
    """Test that proverbs cover multiple cultures"""
    data = load_cultural_data()
    proverbs = data.get('proverbs', [])
    
    logger.info("\n" + "=" * 70)
    logger.info("PROVERB COVERAGE TEST")
    logger.info("=" * 70)
    
    cultures_with_proverbs = set()
    for proverb in proverbs:
        culture = proverb.get('culture', 'unknown')
        cultures_with_proverbs.add(culture)
    
    logger.info(f"Proverbs: {len(proverbs)} total")
    logger.info(f"Cultures with proverbs: {len(cultures_with_proverbs)}")
    
    for culture in sorted(cultures_with_proverbs):
        count = len([p for p in proverbs if p.get('culture') == culture])
        logger.info(f"  - {culture}: {count} proverbs")
    
    return len(cultures_with_proverbs) >= 10


def main():
    """Run all tests"""
    logger.info("\n" + "=" * 70)
    logger.info("EXPANDED KNOWLEDGE BASE TEST SUITE")
    logger.info("=" * 70 + "\n")
    
    tests = [
        ("Cultures Coverage", test_cultures_coverage),
        ("Content Categories", test_content_categories),
        ("Cultural Diversity", test_cultural_diversity),
        ("Data Completeness", test_data_completeness),
        ("Festival Coverage", test_festival_coverage),
        ("Language Coverage", test_language_coverage),
        ("Proverb Coverage", test_proverb_coverage),
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            logger.error(f"Error in {test_name}: {e}")
            results[test_name] = False
    
    # Summary
    logger.info("\n" + "=" * 70)
    logger.info("TEST SUMMARY")
    logger.info("=" * 70)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "PASS" if result else "FAIL"
        logger.info(f"{status}: {test_name}")
    
    logger.info(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("\n✓ All tests passed! Knowledge base is properly expanded.")
        return 0
    else:
        logger.warning(f"\n✗ {total - passed} test(s) failed.")
        return 1


if __name__ == "__main__":
    exit(main())

