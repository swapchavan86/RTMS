from fastapi.testclient import TestClient
from unittest.mock import MagicMock # For per-test customization if needed

# Fixtures 'client' and 'mock_data_service' are from conftest.py

def test_read_employees_success(client: TestClient, mock_data_service: MagicMock):
    """Test successful retrieval of employees list."""
    response = client.get("/api/employees/")
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, list)
    assert len(json_response) == 2 # Based on default mock in conftest
    assert json_response[0]["id"] == "emp001"
    assert json_response[0]["name"] == "Test User One"
    mock_data_service.get_mock_employees.assert_called_once()

def test_read_employees_pagination(client: TestClient, mock_data_service: MagicMock):
    """Test pagination for employees list."""
    # Modify mock to return more items to test pagination
    mock_employees_list = [
        {"id": f"emp{i:03}", "name": f"User {i}", "department": "PagDept", "awe_points": i*10, "current_seat_id": f"S{i}"}
        for i in range(1, 6) # 5 employees
    ]
    mock_data_service.get_mock_employees.return_value = mock_employees_list

    # Test limit
    response_limit = client.get("/api/employees/?limit=2")
    assert response_limit.status_code == 200
    assert len(response_limit.json()) == 2

    # Test skip and limit
    response_skip_limit = client.get("/api/employees/?skip=2&limit=2")
    assert response_skip_limit.status_code == 200
    json_data_skip = response_skip_limit.json()
    assert len(json_data_skip) == 2
    assert json_data_skip[0]["id"] == "emp003" # emp1, emp2 skipped

    # Test skip beyond available items
    response_skip_over = client.get("/api/employees/?skip=10")
    assert response_skip_over.status_code == 200
    assert len(response_skip_over.json()) == 0


def test_read_employee_by_id_success(client: TestClient, mock_data_service: MagicMock):
    """Test successful retrieval of a single employee by ID."""
    response = client.get("/api/employees/emp001")
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["id"] == "emp001"
    assert json_response["name"] == "Test User One"
    # Ensure the mock was called (it will be, due to the list comprehension in the route)
    mock_data_service.get_mock_employees.assert_called()


def test_read_employee_by_id_not_found(client: TestClient, mock_data_service: MagicMock):
    """Test retrieval of a non-existent employee ID."""
    response = client.get("/api/employees/emp999")
    assert response.status_code == 404
    assert response.json() == {"detail": "Employee not found"}
    mock_data_service.get_mock_employees.assert_called()

def test_get_leaderboard_success(client: TestClient, mock_data_service: MagicMock):
    """Test successful retrieval of the leaderboard."""
    response = client.get("/api/employees/leaderboard/")
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, list)
    assert len(json_response) == 2 # Based on default mock
    assert json_response[0]["rank"] == 1
    assert json_response[0]["employee_id"] == "emp002"
    mock_data_service.get_mock_leaderboard.assert_called_once()

def test_get_leaderboard_limit_param(client: TestClient, mock_data_service: MagicMock):
    """Test leaderboard retrieval with a limit parameter."""
    # Modify mock to have more entries than default limit
    mock_leaderboard_data = [
        {"rank": 1, "employee_id": "emp003", "name": "User Three", "awe_points": 300, "department":"Lead"},
        {"rank": 2, "employee_id": "emp002", "name": "User Two", "awe_points": 200, "department":"Lead"},
        {"rank": 3, "employee_id": "emp001", "name": "User One", "awe_points": 100, "department":"Lead"},
    ]
    mock_data_service.get_mock_leaderboard.return_value = mock_leaderboard_data

    response = client.get("/api/employees/leaderboard/?limit=1")
    assert response.status_code == 200
    json_response = response.json()
    assert len(json_response) == 1
    assert json_response[0]["employee_id"] == "emp003"
    mock_data_service.get_mock_leaderboard.assert_called_once()

def test_read_employees_db_switch_scenario(client: TestClient, mock_data_service: MagicMock):
    """Test the employee route when USE_DATABASE_SWITCH is True (expect 501)."""
    mock_data_service.USE_DATABASE_SWITCH = True # Simulate DB mode

    response = client.get("/api/employees/")
    assert response.status_code == 501
    assert response.json() == {"detail": "Database connection not implemented yet."}

    # Reset for other tests if the mock_data_service is function-scoped and reused
    mock_data_service.USE_DATABASE_SWITCH = False

def test_get_leaderboard_empty_if_no_employees(client: TestClient, mock_data_service: MagicMock):
    """Test leaderboard returns empty list when no employees are available."""
    mock_data_service.get_mock_leaderboard.return_value = []
    response = client.get("/api/employees/leaderboard/")
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, list)
    assert len(json_response) == 0
    mock_data_service.get_mock_leaderboard.assert_called_once()

def test_get_employee_profile_check_data_structure(client: TestClient, mock_data_service: MagicMock):
    """Test the data structure of a successfully retrieved employee profile."""
    # Using default mock data from conftest for emp001
    response = client.get("/api/employees/emp001")
    assert response.status_code == 200
    json_response = response.json()

    expected_keys = ["id", "name", "department", "awe_points", "current_seat_id"]
    for key in expected_keys:
        assert key in json_response

    assert json_response["id"] == "emp001"
    assert isinstance(json_response["name"], str)
    assert isinstance(json_response["department"], str)
    assert isinstance(json_response["awe_points"], int)
    # current_seat_id can be str or None
    assert isinstance(json_response["current_seat_id"], (str, type(None)))


def test_get_leaderboard_check_data_structure(client: TestClient, mock_data_service: MagicMock):
    """Test the data structure of a successfully retrieved leaderboard."""
    # Using default mock data from conftest
    response = client.get("/api/employees/leaderboard/")
    assert response.status_code == 200
    json_response = response.json()

    assert isinstance(json_response, list)
    if len(json_response) > 0:
        entry = json_response[0]
        expected_keys = ["rank", "employee_id", "name", "awe_points", "department"]
        for key in expected_keys:
            assert key in entry

        assert isinstance(entry["rank"], int)
        assert isinstance(entry["employee_id"], str)
        assert isinstance(entry["name"], str)
        assert isinstance(entry["awe_points"], int)
        assert isinstance(entry["department"], str)

def test_read_employees_empty_if_no_data(client: TestClient, mock_data_service: MagicMock):
    """Test /api/employees/ returns empty list when no employee data is available."""
    mock_data_service.get_mock_employees.return_value = []
    response = client.get("/api/employees/")
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, list)
    assert len(json_response) == 0
    mock_data_service.get_mock_employees.assert_called_once()

def test_read_employee_by_id_internal_error_if_service_fails(client: TestClient, mock_data_service: MagicMock):
    """Test 500 error if the data service fails unexpectedly during single employee fetch."""
    mock_data_service.get_mock_employees.side_effect = Exception("Unexpected service error")
    response = client.get("/api/employees/emp001")
    # Note: FastAPI's default behavior for unhandled exceptions is a 500 error.
    # If specific exception handling is added to the route, this test would need adjustment.
    assert response.status_code == 500
    # The actual error message might vary based on FastAPI/Starlette version and debug settings.
    # For now, checking the status code is sufficient.
    # assert "Internal Server Error" in response.text # This can be too specific
    mock_data_service.get_mock_employees.assert_called_once()
```
