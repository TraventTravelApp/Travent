"""
Integration tests for TripCraft backend API
Tests critical flows end-to-end with real AWS services
"""
import json
import os
import sys
import requests
from datetime import datetime

# Configuration
API_URL = os.getenv('API_URL', 'https://YOUR_API_GATEWAY_URL.amazonaws.com/dev')
TEST_EMAIL = os.getenv('TEST_EMAIL', 'test@tripcraft.com')
TEST_PASSWORD = os.getenv('TEST_PASSWORD', 'TestPassword123!')

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'


class IntegrationTests:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.auth_token = None
        self.user_id = None
        self.trip_id = None

    def log(self, message, color=RESET):
        print(f"{color}{message}{RESET}")

    def assert_equal(self, actual, expected, message):
        """Assert two values are equal"""
        if actual == expected:
            self.passed += 1
            self.log(f"  ✓ {message}", GREEN)
            return True
        else:
            self.failed += 1
            self.log(f"  ✗ {message}", RED)
            self.log(f"    Expected: {expected}", RED)
            self.log(f"    Got: {actual}", RED)
            return False

    def assert_status(self, response, expected_status, message):
        """Assert HTTP status code"""
        return self.assert_equal(response.status_code, expected_status, message)

    def test_auth_flow(self):
        """Test authentication flow: signup, login, confirm"""
        self.log("\n=== Testing Authentication Flow ===", BLUE)

        # Test login (assuming user already exists)
        self.log("\n1. Testing login...")
        login_response = requests.post(
            f"{API_URL}/auth/login",
            json={'email': TEST_EMAIL, 'password': TEST_PASSWORD}
        )

        if self.assert_status(login_response, 200, "Login successful"):
            data = login_response.json()
            body = json.loads(data.get('body', '{}'))
            self.auth_token = body.get('id_token')
            self.user_id = body.get('user_id')
            self.log(f"  User ID: {self.user_id}", YELLOW)

        # Test invalid credentials
        self.log("\n2. Testing invalid credentials...")
        invalid_login = requests.post(
            f"{API_URL}/auth/login",
            json={'email': TEST_EMAIL, 'password': 'WrongPassword'}
        )
        self.assert_status(invalid_login, 401, "Invalid credentials rejected")

        # Test missing Authorization header
        self.log("\n3. Testing protected endpoint without auth...")
        no_auth = requests.get(f"{API_URL}/profile")
        self.assert_status(no_auth, 401, "Missing auth header rejected")

    def test_trip_creation(self):
        """Test trip creation with validation"""
        self.log("\n=== Testing Trip Creation ===", BLUE)

        headers = {'Authorization': f'Bearer {self.auth_token}'}

        # Test valid trip creation
        self.log("\n1. Creating valid trip...")
        valid_trip = {
            'type': 'location',
            'destination': 'New York',
            'questionnaire': {
                'duration_days': 5,
                'budget': 1500,
                'how_busy': 3,
                'traveling_with': 'solo',
                'activity_categories': ['museums', 'food']
            },
            'preferences': {}
        }

        create_response = requests.post(
            f"{API_URL}/trips",
            headers=headers,
            json=valid_trip
        )

        if self.assert_status(create_response, 200, "Valid trip created"):
            data = create_response.json()
            body = json.loads(data.get('body', '{}'))
            self.trip_id = body.get('trip_id')
            self.log(f"  Trip ID: {self.trip_id}", YELLOW)

        # Test invalid trip (negative budget)
        self.log("\n2. Testing invalid trip (negative budget)...")
        invalid_trip = {
            'type': 'location',
            'destination': 'Paris',
            'questionnaire': {
                'duration_days': 3,
                'budget': -500,  # Invalid
                'how_busy': 3,
                'traveling_with': 'solo'
            }
        }

        invalid_response = requests.post(
            f"{API_URL}/trips",
            headers=headers,
            json=invalid_trip
        )
        self.assert_status(invalid_response, 400, "Negative budget rejected")

        # Test invalid trip (0 days)
        self.log("\n3. Testing invalid trip (0 days)...")
        zero_days = valid_trip.copy()
        zero_days['questionnaire']['duration_days'] = 0

        zero_response = requests.post(
            f"{API_URL}/trips",
            headers=headers,
            json=zero_days
        )
        self.assert_status(zero_response, 400, "Zero-day trip rejected")

        # Test invalid trip (excessive duration)
        self.log("\n4. Testing invalid trip (31 days)...")
        excessive = valid_trip.copy()
        excessive['questionnaire']['duration_days'] = 31

        excessive_response = requests.post(
            f"{API_URL}/trips",
            headers=headers,
            json=excessive
        )
        self.assert_status(excessive_response, 400, "Excessive duration rejected")

    def test_trip_operations(self):
        """Test trip CRUD operations"""
        self.log("\n=== Testing Trip Operations ===", BLUE)

        headers = {'Authorization': f'Bearer {self.auth_token}'}

        # Test get trip
        self.log("\n1. Getting trip...")
        get_response = requests.get(
            f"{API_URL}/trips/{self.trip_id}",
            headers=headers
        )
        self.assert_status(get_response, 200, "Get trip successful")

        # Test list trips
        self.log("\n2. Listing trips...")
        list_response = requests.get(
            f"{API_URL}/trips",
            headers=headers
        )
        if self.assert_status(list_response, 200, "List trips successful"):
            data = list_response.json()
            body = json.loads(data.get('body', '{}'))
            trip_count = len(body)
            self.log(f"  Found {trip_count} trips", YELLOW)

        # Test update trip
        self.log("\n3. Updating trip...")
        update_response = requests.put(
            f"{API_URL}/trips/{self.trip_id}",
            headers=headers,
            json={'status': 'active'}
        )
        self.assert_status(update_response, 200, "Update trip successful")

        # Test invalid status
        self.log("\n4. Testing invalid status update...")
        invalid_status = requests.put(
            f"{API_URL}/trips/{self.trip_id}",
            headers=headers,
            json={'status': 'invalid_status'}
        )
        self.assert_status(invalid_status, 400, "Invalid status rejected")

        # Test get non-existent trip
        self.log("\n5. Testing non-existent trip...")
        not_found = requests.get(
            f"{API_URL}/trips/non-existent-id",
            headers=headers
        )
        self.assert_status(not_found, 404, "Non-existent trip returns 404")

    def test_file_validation(self):
        """Test file upload validation"""
        self.log("\n=== Testing File Upload Validation ===", BLUE)

        headers = {'Authorization': f'Bearer {self.auth_token}'}

        # Test missing file data
        self.log("\n1. Testing missing file data...")
        no_file = requests.post(
            f"{API_URL}/uploads/profile-photo",
            headers=headers,
            json={'file_name': 'test.jpg'}
        )
        self.assert_status(no_file, 400, "Missing file data rejected")

        # Test invalid content type
        self.log("\n2. Testing invalid content type...")
        invalid_type = requests.post(
            f"{API_URL}/uploads/profile-photo",
            headers=headers,
            json={
                'file_name': 'test.exe',
                'file_data': 'dGVzdA==',  # "test" in base64
                'content_type': 'application/x-executable'
            }
        )
        self.assert_status(invalid_type, 400, "Invalid content type rejected")

        # Note: Testing large files would require encoding large base64 strings
        # This is better done in load testing

    def test_ai_validation(self):
        """Test AI itinerary generation with validation"""
        self.log("\n=== Testing AI Generation Validation ===", BLUE)

        headers = {'Authorization': f'Bearer {self.auth_token}'}

        # Test valid AI request
        self.log("\n1. Testing valid AI generation request...")
        valid_request = {
            'trip_type': 'location',
            'destination': 'Boston',
            'duration': 3,
            'budget': 800,
            'intensity': 3,
            'group_type': 'solo',
            'interests': ['history', 'food']
        }

        # Note: This will take time and consume Bedrock credits
        # Consider mocking or using a small duration
        self.log("  (This may take 10-25 seconds...)", YELLOW)

        ai_response = requests.post(
            f"{API_URL}/ai/itinerary/generate",
            headers=headers,
            json=valid_request,
            timeout=30
        )

        if self.assert_status(ai_response, 200, "AI generation successful"):
            data = ai_response.json()
            body = json.loads(data.get('body', '{}'))
            trip_data = body.get('trip', {})
            itinerary = trip_data.get('itinerary', {})
            days = itinerary.get('days', [])
            self.log(f"  Generated {len(days)} days", YELLOW)

        # Test invalid trip type
        self.log("\n2. Testing invalid trip type...")
        invalid_type = valid_request.copy()
        invalid_type['trip_type'] = 'invalid'

        invalid_response = requests.post(
            f"{API_URL}/ai/itinerary/generate",
            headers=headers,
            json=invalid_type
        )
        self.assert_status(invalid_response, 400, "Invalid trip type rejected")

        # Test missing destination for location trip
        self.log("\n3. Testing missing destination...")
        no_dest = valid_request.copy()
        del no_dest['destination']

        no_dest_response = requests.post(
            f"{API_URL}/ai/itinerary/generate",
            headers=headers,
            json=no_dest
        )
        self.assert_status(no_dest_response, 400, "Missing destination rejected")

    def test_error_handling(self):
        """Test error handling and edge cases"""
        self.log("\n=== Testing Error Handling ===", BLUE)

        headers = {'Authorization': f'Bearer {self.auth_token}'}

        # Test malformed JSON
        self.log("\n1. Testing malformed JSON...")
        malformed = requests.post(
            f"{API_URL}/trips",
            headers=headers,
            data='{ invalid json'
        )
        # Should handle gracefully
        self.log(f"  Status: {malformed.status_code}", YELLOW)

        # Test SQL injection attempt in trip ID
        self.log("\n2. Testing SQL injection attempt...")
        injection = requests.get(
            f"{API_URL}/trips/'; DROP TABLE trips; --",
            headers=headers
        )
        # Should be safe (DynamoDB doesn't use SQL)
        self.assert_status(injection, 404, "Injection attempt handled safely")

    def cleanup(self):
        """Clean up test data"""
        self.log("\n=== Cleanup ===", BLUE)

        if self.trip_id:
            headers = {'Authorization': f'Bearer {self.auth_token}'}
            self.log(f"\n1. Deleting test trip {self.trip_id}...")
            delete_response = requests.delete(
                f"{API_URL}/trips/{self.trip_id}",
                headers=headers
            )
            self.assert_status(delete_response, 200, "Test trip deleted")

    def run_all(self):
        """Run all integration tests"""
        self.log("\n" + "="*60, BLUE)
        self.log("TripCraft Integration Tests", BLUE)
        self.log(f"API URL: {API_URL}", YELLOW)
        self.log(f"Test User: {TEST_EMAIL}", YELLOW)
        self.log(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", YELLOW)
        self.log("="*60, BLUE)

        try:
            self.test_auth_flow()

            if self.auth_token:
                self.test_trip_creation()
                self.test_trip_operations()
                self.test_file_validation()
                # self.test_ai_validation()  # Uncomment to test AI (costs money)
                self.test_error_handling()
                self.cleanup()
            else:
                self.log("\nSkipping remaining tests (auth failed)", RED)

        except KeyboardInterrupt:
            self.log("\n\nTests interrupted by user", YELLOW)
        except Exception as e:
            self.log(f"\n\nUnexpected error: {str(e)}", RED)
            import traceback
            traceback.print_exc()

        # Print summary
        total = self.passed + self.failed
        pass_rate = (self.passed / total * 100) if total > 0 else 0

        self.log("\n" + "="*60, BLUE)
        self.log("Test Summary", BLUE)
        self.log("="*60, BLUE)
        self.log(f"Total Tests: {total}", YELLOW)
        self.log(f"Passed: {self.passed}", GREEN)
        self.log(f"Failed: {self.failed}", RED)
        self.log(f"Pass Rate: {pass_rate:.1f}%", GREEN if pass_rate >= 95 else RED)
        self.log("="*60 + "\n", BLUE)

        return self.failed == 0


if __name__ == '__main__':
    # Check environment
    if 'YOUR_API_GATEWAY_URL' in API_URL:
        print(f"{RED}Error: Please set API_URL environment variable{RESET}")
        print(f"{YELLOW}Example: export API_URL=https://abc123.execute-api.us-east-1.amazonaws.com/dev{RESET}")
        sys.exit(1)

    tests = IntegrationTests()
    success = tests.run_all()
    sys.exit(0 if success else 1)
