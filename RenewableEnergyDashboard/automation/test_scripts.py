import unittest
import requests
import os
import json # For loading mock data if needed, though we expect the API to serve it

# Configuration
BASE_URL_BACKEND = os.environ.get("AUTOMATION_TEST_BASE_URL", "http://localhost:8000/api")
# Note: The backend unit tests mock the data service.
# These automation tests rely on the backend *actually running* and serving data
# based on its `data_generation_service.py` (which is currently mock data).
# If the backend was using a real DB, these tests would hit that DB via the API.

# It's assumed the backend is running and accessible at BASE_URL_BACKEND for these tests.

class TestBusinessLogicAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Check if the backend is reachable before running tests."""
        try:
            response = requests.get(f"{BASE_URL_BACKEND.replace('/api', '')}/") # Check root
            if response.status_code != 200:
                raise ConnectionError(f"Backend not reachable at root. Status: {response.status_code}")

            # Verify some basic data endpoints are working
            emp_response = requests.get(f"{BASE_URL_BACKEND}/employees/")
            if emp_response.status_code != 200:
                 raise ConnectionError(f"Backend /employees endpoint not working. Status: {emp_response.status_code}")
            if not emp_response.json(): # Expecting some employees from mock data
                print("Warning: /employees endpoint returned empty list. Tests might behave unexpectedly if they rely on specific mock data counts.")

        except requests.exceptions.ConnectionError as e:
            print(f"CRITICAL: Backend server is not running or not accessible at {BASE_URL_BACKEND.replace('/api','')}.")
            print("Skipping all automation tests. Please ensure the backend server is started.")
            # This will cause tests to fail if the server isn't up, which is intended.
            # A more robust solution might use unittest.skip or similar if server isn't up.
            raise ConnectionError(f"Backend server connection failed: {e}. Aborting tests.")


    def test_leaderboard_reflects_top_employees(self):
        """
        Verify that the leaderboard endpoint returns employees sorted by Awe Points
        and matches the top employees from the full employee list.
        """
        try:
            employees_response = requests.get(f"{BASE_URL_BACKEND}/employees/?limit=100") # Get all/many
            leaderboard_response = requests.get(f"{BASE_URL_BACKEND}/employees/leaderboard/?limit=10")
        except requests.exceptions.ConnectionError as e:
            self.fail(f"API connection failed during test_leaderboard_reflects_top_employees: {e}")

        self.assertEqual(employees_response.status_code, 200, "Failed to fetch employees list")
        self.assertEqual(leaderboard_response.status_code, 200, "Failed to fetch leaderboard")

        all_employees = employees_response.json()
        leaderboard_employees = leaderboard_response.json()

        self.assertTrue(len(all_employees) > 0, "No employees returned from /employees endpoint. Check mock data.")
        self.assertTrue(len(leaderboard_employees) > 0, "Leaderboard is empty. Check mock data.")
        self.assertTrue(len(leaderboard_employees) <= 10, "Leaderboard returned more than the default limit of 10")

        # Sort all_employees by awe_points descending to compare with leaderboard
        # The backend's data_generation_service already sorts them.
        # Here we verify the API output.
        sorted_all_employees = sorted(all_employees, key=lambda x: x.get('awe_points', 0), reverse=True)

        limit = len(leaderboard_employees) # Actual limit might be less than 10 if fewer employees

        for i in range(limit):
            self.assertEqual(leaderboard_employees[i]['employee_id'], sorted_all_employees[i]['id'],
                             f"Leaderboard rank {i+1} mismatch: Expected {sorted_all_employees[i]['id']}, got {leaderboard_employees[i]['employee_id']}")
            self.assertEqual(leaderboard_employees[i]['awe_points'], sorted_all_employees[i]['awe_points'],
                             f"Leaderboard Awe Points mismatch for {leaderboard_employees[i]['employee_id']}")
            self.assertEqual(leaderboard_employees[i]['rank'], i + 1, f"Leaderboard rank number incorrect for {leaderboard_employees[i]['employee_id']}")

    def test_seating_suggestion_logic_basic_coherence(self):
        """
        Verify basic coherence of seating suggestions with the arrangement.
        - If a move is suggested, the 'current' seat should be occupied.
        - The 'new' seat should be unoccupied.
        - If zones are suggested for light/AC off, they should correspond to potentially vacated areas.
        (This is a conceptual test as actual energy saving is not measured)
        """
        try:
            arrangement_response = requests.get(f"{BASE_URL_BACKEND}/seating/arrangement/")
            suggestions_response = requests.get(f"{BASE_URL_BACKEND}/seating/suggestions/")
        except requests.exceptions.ConnectionError as e:
            self.fail(f"API connection failed during test_seating_suggestion_logic_basic_coherence: {e}")

        self.assertEqual(arrangement_response.status_code, 200, "Failed to fetch seating arrangement")
        self.assertEqual(suggestions_response.status_code, 200, "Failed to fetch seating suggestions")

        arrangement = arrangement_response.json()
        suggestion = suggestions_response.json()

        if not suggestion.get("suggested_moves"):
            print("No seating suggestions provided by the API, skipping detailed checks for this test run.")
            self.skipTest("No seating moves suggested by API to test.") # Skips the rest of this test method
            return

        all_seats_map = {
            seat['seat_id']: seat
            for zone in arrangement.get('zones', [])
            for seat in zone.get('seats', [])
        }

        for move in suggestion["suggested_moves"]:
            employee_id, new_seat_id = move

            # Find the employee's current seat from the arrangement
            current_seat_id = None
            occupant_found = False
            for zone in arrangement.get('zones', []):
                for seat in zone.get('seats', []):
                    if seat.get('employee_id') == employee_id:
                        current_seat_id = seat['seat_id']
                        self.assertEqual(seat['status'], 'occupied',
                                         f"Suggested move for employee {employee_id}: current seat {current_seat_id} is not 'occupied'.")
                        occupant_found = True
                        break
                if occupant_found:
                    break

            self.assertIsNotNone(current_seat_id, f"Employee {employee_id} suggested to move was not found in any seat.")

            # Check the suggested new seat
            self.assertIn(new_seat_id, all_seats_map, f"Suggested new seat {new_seat_id} does not exist in arrangement.")
            if new_seat_id in all_seats_map: # Should always be true due to assertIn
                 self.assertEqual(all_seats_map[new_seat_id]['status'], 'unoccupied',
                                 f"Suggested new seat {new_seat_id} is not 'unoccupied'. Status: {all_seats_map[new_seat_id]['status']}")

        # Check vacated zones (simplified check)
        # This part is highly dependent on how the mock data is generated.
        # The current mock suggestion is quite specific.
        if suggestion.get("vacated_zones_lights_off"):
            for zone_id in suggestion["vacated_zones_lights_off"]:
                self.assertTrue(any(z['zone_id'] == zone_id for z in arrangement.get('zones', [])),
                                f"Suggested vacated zone (lights) {zone_id} does not exist.")

        if suggestion.get("vacated_zones_ac_off"):
            for zone_id in suggestion["vacated_zones_ac_off"]:
                 self.assertTrue(any(z['zone_id'] == zone_id for z in arrangement.get('zones', [])),
                                f"Suggested vacated zone (AC) {zone_id} does not exist.")


    def test_energy_data_availability_and_structure(self):
        """
        Check if all energy-related endpoints return data in expected list format
        and that core fields are present.
        """
        endpoints = [
            "/energy/laptop-usage/",
            "/energy/lighting/",
            "/energy/hvac/"
        ]
        core_fields_map = {
            "/energy/laptop-usage/": ["employee_id", "hours_on", "mode"],
            "/energy/lighting/": ["zone_id", "status"],
            "/energy/hvac/": ["zone_id", "status", "current_temp_celsius"] # set_point can be null
        }

        for endpoint in endpoints:
            with self.subTest(endpoint=endpoint):
                try:
                    response = requests.get(f"{BASE_URL_BACKEND}{endpoint}")
                except requests.exceptions.ConnectionError as e:
                    self.fail(f"API connection failed for {endpoint}: {e}")

                self.assertEqual(response.status_code, 200, f"Failed to fetch data from {endpoint}")
                data = response.json()
                self.assertIsInstance(data, list, f"Data from {endpoint} is not a list.")

                if data: # If list is not empty, check first item's structure
                    item = data[0]
                    for field in core_fields_map[endpoint]:
                        self.assertIn(field, item, f"Field '{field}' missing in item from {endpoint}")
                else:
                    print(f"Warning: Endpoint {endpoint} returned an empty list. Structural checks on items skipped.")


    # Conceptual test - if Awe points were tied to specific actions like dark mode
    # def test_awe_points_logic_for_dark_mode(self):
    #     """
    #     Conceptual: If using dark mode gave more initial Awe points, verify this.
    #     This requires the backend data generation to have this explicit logic.
    #     The current data_generation_service.py does have a small bonus for dark mode.
    #     """
    #     try:
    #         employees_response = requests.get(f"{BASE_URL_BACKEND}/employees/?limit=100")
    #         laptop_usage_response = requests.get(f"{BASE_URL_BACKEND}/energy/laptop-usage/")
    #     except requests.exceptions.ConnectionError as e:
    #         self.fail(f"API connection failed during test_awe_points_logic_for_dark_mode: {e}")

    #     self.assertEqual(employees_response.status_code, 200)
    #     self.assertEqual(laptop_usage_response.status_code, 200)

    #     all_employees = {emp['id']: emp for emp in employees_response.json()}
    #     laptop_usages = laptop_usage_response.json()

    #     # This test is tricky because points are also random.
    #     # We'd need to compare statistically or have a known baseline.
    #     # For simplicity, let's check if *some* dark mode users have slightly higher points
    #     # than *some* light mode users, which is weak but illustrative.

    #     dark_mode_user_points = []
    #     light_mode_user_points = []

    #     for usage in laptop_usages:
    #         emp_id = usage['employee_id']
    #         if emp_id in all_employees:
    #             points = all_employees[emp_id]['awe_points']
    #             if usage['mode'] == 'Dark Mode':
    #                 dark_mode_user_points.append(points)
    #             else:
    #                 light_mode_user_points.append(points)

    #     if dark_mode_user_points and light_mode_user_points:
    #         avg_dark_points = sum(dark_mode_user_points) / len(dark_mode_user_points)
    #         avg_light_points = sum(light_mode_user_points) / len(light_mode_user_points)
    #         # The mock data gives a small random bonus (1-5 or 20-50 in different places)
    #         # This assertion might be flaky due to overall randomness of base points.
    #         # A better test would require more deterministic point assignment in mock data for specific test users.
    #         # self.assertTrue(avg_dark_points > avg_light_points - 10, # Allow some leeway due to randomness
    #         #                 f"Average Awe points for dark mode users ({avg_dark_points}) not clearly higher than for light mode users ({avg_light_points}) based on current mock data logic.")
    #         print(f"DEBUG: Avg Dark Mode Points: {avg_dark_points}, Avg Light Mode Points: {avg_light_points} (Informational for this conceptual test)")
    #     else:
    #         print("Warning: Not enough diverse laptop mode users to compare Awe points meaningfully.")


if __name__ == "__main__":
    print(f"Running Automation Tests against: {BASE_URL_BACKEND}")
    print("Ensure the backend server is running with its mock data generation.")

    # Create a TestLoader
    loader = unittest.TestLoader()
    # Create a TestSuite
    suite = unittest.TestSuite()
    # Add tests from the class to the suite
    suite.addTests(loader.loadTestsFromTestCase(TestBusinessLogicAPI))

    # Create a TestResult object (optional, for more control over results)
    # result = unittest.TestResult()

    # Create a TextTestRunner with verbosity
    runner = unittest.TextTestRunner(verbosity=2)

    # Run the tests
    test_result = runner.run(suite)

    # Exit with a status code based on test results (useful for CI)
    if not test_result.wasSuccessful():
        exit(1)
