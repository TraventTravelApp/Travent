#!/usr/bin/env python3
"""
Test script to verify prompt building without calling AWS
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from services.prompt_builder import PromptBuilder

def test_location_trip():
    print("=" * 60)
    print("TESTING LOCATION TRIP PROMPT")
    print("=" * 60)
    
    builder = PromptBuilder()
    
    trip_data = {
        'destination': 'Miami, FL',
        'duration': 3,
        'budget': 'moderate',
        'intensity': 7,
        'group_type': 'friends',
        'interests': ['beach', 'nightlife', 'food'],
        'activity_preferences': ['water sports', 'clubs', 'seafood']
    }
    
    system_prompt = builder.build_system_prompt()
    user_prompt = builder.build_location_trip_prompt(trip_data)
    
    print("\n📋 SYSTEM PROMPT:")
    print("-" * 60)
    print(system_prompt[:500] + "...\n")
    
    print("\n👤 USER PROMPT:")
    print("-" * 60)
    print(user_prompt)
    print("\n")

def test_roadtrip():
    print("=" * 60)
    print("TESTING ROAD TRIP PROMPT")
    print("=" * 60)
    
    builder = PromptBuilder()
    
    trip_data = {
        'start_location': 'Atlanta, GA',
        'end_location': 'Miami, FL',
        'duration': 5,
        'budget': 'moderate',
        'intensity': 6,
        'scenic_route': True,
        'include_gas': True,
        'interests': ['nature', 'photography', 'local food']
    }
    
    system_prompt = builder.build_system_prompt()
    user_prompt = builder.build_roadtrip_prompt(trip_data)
    
    print("\n📋 SYSTEM PROMPT:")
    print("-" * 60)
    print(system_prompt[:500] + "...\n")
    
    print("\n👤 USER PROMPT:")
    print("-" * 60)
    print(user_prompt)
    print("\n")

if __name__ == "__main__":
    print("\n🧪 Testing Prompt Builder\n")
    
    try:
        test_location_trip()
        print("\n" + "=" * 60 + "\n")
        test_roadtrip()
        
        print("\n✅ All prompts generated successfully!")
        print("\nNext step: Deploy with 'serverless deploy' to test with real AWS Bedrock\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
