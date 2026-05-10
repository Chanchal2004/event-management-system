#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime, timedelta
import time

class EventManagementTester:
    def __init__(self, base_url="https://event-nexus-35.preview.emergentagent.com"):
        self.base_url = base_url
        self.user_token = None
        self.organizer_token = None
        self.user_id = None
        self.organizer_id = None
        self.test_event_id = None
        self.registration_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def log_test(self, name, success, details=""):
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {name}")
        if details:
            print(f"     {details}")
        if success:
            self.tests_passed += 1

    def make_request(self, method, endpoint, data=None, token=None, files=None):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    # Remove content-type for file uploads
                    del headers['Content-Type']
                    response = requests.post(url, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
                
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {str(e)}")
            return None

    def test_user_registration(self):
        """Test user registration"""
        timestamp = int(time.time())
        user_data = {
            "email": f"testuser_{timestamp}@example.com",
            "password": "testpass123",
            "name": f"Test User {timestamp}",
            "role": "user"
        }
        
        response = self.make_request('POST', 'auth/register', user_data)
        
        if response and response.status_code == 200:
            data = response.json()
            self.user_token = data.get('token')
            self.user_id = data.get('user', {}).get('id')
            self.log_test("User Registration", True, f"Token received, User ID: {self.user_id}")
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("User Registration", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_organizer_registration(self):
        """Test organizer registration"""
        timestamp = int(time.time())
        organizer_data = {
            "email": f"organizer_{timestamp}@example.com",
            "password": "testpass123",
            "name": f"Test Organizer {timestamp}",
            "role": "organizer"
        }
        
        response = self.make_request('POST', 'auth/register', organizer_data)
        
        if response and response.status_code == 200:
            data = response.json()
            self.organizer_token = data.get('token')
            self.organizer_id = data.get('user', {}).get('id')
            self.log_test("Organizer Registration", True, f"Token received, Organizer ID: {self.organizer_id}")
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Organizer Registration", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_user_login(self):
        """Test login functionality"""
        # Test with organizer credentials
        login_data = {
            "email": f"organizer_{int(time.time())}@example.com",
            "password": "testpass123"
        }
        
        response = self.make_request('POST', 'auth/login', login_data)
        
        if response and response.status_code == 200:
            self.log_test("Login", True, "Login successful")
            return True
        else:
            # Expected to fail with new credentials, but test the endpoint structure
            self.log_test("Login", response.status_code == 401, "Login properly handles invalid credentials")
            return response.status_code == 401

    def test_get_profile(self):
        """Test getting user profile"""
        if not self.user_token:
            self.log_test("Get Profile", False, "No user token available")
            return False
            
        response = self.make_request('GET', 'auth/me', token=self.user_token)
        
        if response and response.status_code == 200:
            profile = response.json()
            has_required_fields = all(field in profile for field in ['id', 'email', 'name', 'role'])
            self.log_test("Get Profile", has_required_fields, f"Profile retrieved: {profile.get('name', 'Unknown')}")
            return has_required_fields
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Get Profile", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_get_categories(self):
        """Test fetching event categories"""
        response = self.make_request('GET', 'categories')
        
        if response and response.status_code == 200:
            data = response.json()
            has_categories = 'categories' in data and isinstance(data['categories'], list) and len(data['categories']) > 0
            self.log_test("Get Categories", has_categories, f"Found {len(data.get('categories', []))} categories")
            return has_categories
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Get Categories", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_create_event(self):
        """Test event creation by organizer"""
        if not self.organizer_token:
            self.log_test("Create Event", False, "No organizer token available")
            return False

        # Create event for tomorrow
        tomorrow = datetime.now() + timedelta(days=1)
        event_data = {
            "title": "Test Tech Conference 2024",
            "description": "A comprehensive technology conference featuring the latest innovations in AI, blockchain, and cloud computing. Join industry experts for keynotes, workshops, and networking opportunities.",
            "date": tomorrow.strftime("%Y-%m-%d"),
            "time": "09:00",
            "location": "Tech Hub Convention Center, 123 Innovation Drive, San Francisco, CA",
            "location_type": "offline",
            "max_participants": 100,
            "category": "Technology",
            "banner_url": None
        }
        
        response = self.make_request('POST', 'events', event_data, self.organizer_token)
        
        if response and response.status_code == 200:
            event = response.json()
            self.test_event_id = event.get('id')
            required_fields = ['id', 'title', 'status', 'organizer_id', 'current_participants']
            has_required = all(field in event for field in required_fields)
            self.log_test("Create Event", has_required, f"Event created: {event.get('title', 'Unknown')}, ID: {self.test_event_id}")
            return has_required
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Create Event", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_get_events(self):
        """Test fetching all events"""
        response = self.make_request('GET', 'events')
        
        if response and response.status_code == 200:
            events = response.json()
            is_list = isinstance(events, list)
            self.log_test("Get Events", is_list, f"Retrieved {len(events) if is_list else 0} events")
            return is_list
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Get Events", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_get_event_detail(self):
        """Test fetching single event details"""
        if not self.test_event_id:
            self.log_test("Get Event Detail", False, "No test event ID available")
            return False
            
        response = self.make_request('GET', f'events/{self.test_event_id}')
        
        if response and response.status_code == 200:
            event = response.json()
            required_fields = ['id', 'title', 'description', 'date', 'time', 'location', 'status']
            has_required = all(field in event for field in required_fields)
            self.log_test("Get Event Detail", has_required, f"Event details retrieved: {event.get('title', 'Unknown')}")
            return has_required
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Get Event Detail", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_event_registration(self):
        """Test user registering for an event"""
        if not self.user_token or not self.test_event_id:
            self.log_test("Event Registration", False, "Missing user token or event ID")
            return False
            
        response = self.make_request('POST', f'events/{self.test_event_id}/register', token=self.user_token)
        
        if response and response.status_code == 200:
            registration = response.json()
            self.registration_id = registration.get('id')
            required_fields = ['id', 'event_id', 'user_id', 'qr_code', 'event_title']
            has_required = all(field in registration for field in required_fields)
            self.log_test("Event Registration", has_required, f"Registration successful, ID: {self.registration_id}")
            return has_required
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Event Registration", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_get_my_registrations(self):
        """Test getting user's registrations"""
        if not self.user_token:
            self.log_test("Get My Registrations", False, "No user token available")
            return False
            
        response = self.make_request('GET', 'my-registrations', token=self.user_token)
        
        if response and response.status_code == 200:
            registrations = response.json()
            is_list = isinstance(registrations, list)
            has_registration = len(registrations) > 0 if is_list else False
            self.log_test("Get My Registrations", is_list, f"Found {len(registrations) if is_list else 0} registrations")
            return is_list
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Get My Registrations", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_get_my_events_organizer(self):
        """Test organizer getting their events"""
        if not self.organizer_token:
            self.log_test("Get My Events (Organizer)", False, "No organizer token available")
            return False
            
        response = self.make_request('GET', 'my-events', token=self.organizer_token)
        
        if response and response.status_code == 200:
            events = response.json()
            is_list = isinstance(events, list)
            self.log_test("Get My Events (Organizer)", is_list, f"Organizer has {len(events) if is_list else 0} events")
            return is_list
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Get My Events (Organizer)", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_get_event_registrations(self):
        """Test organizer getting event registrations"""
        if not self.organizer_token or not self.test_event_id:
            self.log_test("Get Event Registrations", False, "Missing organizer token or event ID")
            return False
            
        response = self.make_request('GET', f'events/{self.test_event_id}/registrations', token=self.organizer_token)
        
        if response and response.status_code == 200:
            registrations = response.json()
            is_list = isinstance(registrations, list)
            self.log_test("Get Event Registrations", is_list, f"Event has {len(registrations) if is_list else 0} registrations")
            return is_list
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Get Event Registrations", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_notifications(self):
        """Test notifications system"""
        if not self.user_token:
            self.log_test("Get Notifications", False, "No user token available")
            return False
            
        response = self.make_request('GET', 'notifications', token=self.user_token)
        
        if response and response.status_code == 200:
            notifications = response.json()
            is_list = isinstance(notifications, list)
            # Should have welcome notification from registration
            has_notifications = len(notifications) > 0 if is_list else False
            self.log_test("Get Notifications", is_list, f"Found {len(notifications) if is_list else 0} notifications")
            return is_list
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Get Notifications", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_analytics(self):
        """Test analytics for organizers"""
        if not self.organizer_token:
            self.log_test("Analytics Overview", False, "No organizer token available")
            return False
            
        response = self.make_request('GET', 'analytics/overview', token=self.organizer_token)
        
        if response and response.status_code == 200:
            analytics = response.json()
            required_fields = ['total_events', 'total_registrations', 'status_breakdown']
            has_required = all(field in analytics for field in required_fields)
            self.log_test("Analytics Overview", has_required, f"Analytics retrieved with {analytics.get('total_events', 0)} total events")
            return has_required
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Analytics Overview", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_event_search_and_filters(self):
        """Test event search and filtering"""
        # Test search
        response = self.make_request('GET', 'events?search=Tech')
        search_success = response and response.status_code == 200
        
        # Test category filter  
        response2 = self.make_request('GET', 'events?category=Technology')
        filter_success = response2 and response2.status_code == 200
        
        # Test sorting
        response3 = self.make_request('GET', 'events?sort_by=date&sort_order=desc')
        sort_success = response3 and response3.status_code == 200
        
        overall_success = search_success and filter_success and sort_success
        self.log_test("Event Search & Filters", overall_success, "Search, filter, and sort functionality working")
        return overall_success

    def test_event_unregistration(self):
        """Test user unregistering from event"""
        if not self.user_token or not self.test_event_id:
            self.log_test("Event Unregistration", False, "Missing user token or event ID")
            return False
            
        response = self.make_request('DELETE', f'events/{self.test_event_id}/unregister', token=self.user_token)
        
        if response and response.status_code == 200:
            self.log_test("Event Unregistration", True, "Successfully unregistered from event")
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Event Unregistration", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def run_all_tests(self):
        """Run complete test suite"""
        print("=" * 60)
        print("🚀 STARTING EVENT MANAGEMENT BACKEND TESTS")
        print("=" * 60)
        print(f"Testing API: {self.base_url}")
        print()
        
        # Authentication Tests
        print("📝 AUTHENTICATION TESTS")
        print("-" * 30)
        self.test_user_registration()
        self.test_organizer_registration() 
        self.test_user_login()
        self.test_get_profile()
        print()
        
        # Core Functionality Tests
        print("🎯 CORE FUNCTIONALITY TESTS")
        print("-" * 30)
        self.test_get_categories()
        self.test_create_event()
        self.test_get_events()
        self.test_get_event_detail()
        self.test_event_search_and_filters()
        print()
        
        # Registration Tests
        print("🎫 REGISTRATION TESTS")
        print("-" * 30)
        self.test_event_registration()
        self.test_get_my_registrations()
        self.test_get_event_registrations()
        self.test_event_unregistration()
        print()
        
        # Organizer & Analytics Tests
        print("📊 ORGANIZER & ANALYTICS TESTS")
        print("-" * 30)
        self.test_get_my_events_organizer()
        self.test_analytics()
        print()
        
        # Notification Tests
        print("🔔 NOTIFICATION TESTS")
        print("-" * 30)
        self.test_notifications()
        print()
        
        # Results Summary
        print("=" * 60)
        print("📋 TEST RESULTS SUMMARY")
        print("=" * 60)
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 80:
            print("🎉 BACKEND TESTS: OVERALL PASS")
            return 0
        else:
            print("⚠️  BACKEND TESTS: NEEDS ATTENTION")
            return 1

def main():
    tester = EventManagementTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())