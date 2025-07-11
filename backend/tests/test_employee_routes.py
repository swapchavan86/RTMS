from fastapi.testclient import TestClient
from unittest.mock import MagicMock  # Fixtures 'client' and 'mock_data_service' are from conftest.py


# ---------- Employee List ----------

def test_read_employees_success(client: TestClient, mock_data_service: MagicMock):
    response = client.get("/api/employees/")
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, list)
    assert len(json_response) == 2
    assert json_response[0]["id"] == "emp001"
    assert json_response[0]["name"] == "Test User One"
    mock_data_service.get_mock_employees.assert_called_once()


def test_read_employees_empty_if_no_data(client: TestClient, mock_data_service: MagicMock):
    mock_data_service.get_mock_employees.return_value = []
    response = client.get("/api/employees/")
    assert response.status_code == 200
    assert response.json() == []
    mock_data_service.get_mock_employees.assert_called_once()


def test_read_employees_pagination(client: TestClient, mock_data_service: MagicMock):
    mock_employees_list = [
        {"id": f"emp{i:03}", "name": f"User {i}", "department": "PagDept", "awe_points": i * 10, "current_seat_id": f"S{i}"}
        for i in range(1, 6)
    ]
    mock_data_service.get_mock_employees.return_value = mock_employees_list

    response_limit = client.get("/api/employees/?limit=2")
    assert response_limit.status_code == 200
    assert len(response_limit.json()) == 2

    response_skip_limit = client.get("/api/employees/?skip=2&limit=2")
    assert response_skip_limit.status_code == 200
    assert response_skip_limit.json()[0]["id"] == "emp003"

    response_skip_over = client.get("/api/employees/?skip=10")
    assert response_skip_over.status_code == 200
    assert response_skip_over.json() == []


def test_read_employees_db_switch_scenario(client: TestClient, mock_data_service: MagicMock):
    mock_data_service.USE_DATABASE_SWITCH = True
    response = client.get("/api/employees/")
    assert response.status_code == 501
    assert response.json() == {"detail": "Database connection not implemented yet."}
    mock_data_service.USE_DATABASE_SWITCH = False


# ---------- Employee Details ----------

def test_read_employee_by_id_success(client: TestClient, mock_data_service: MagicMock):
    response = client.get("/api/employees/emp001")
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["id"] == "emp001"
    assert json_response["name"] == "Test User One"
    mock_data_service.get_mock_employees.assert_called()


def test_read_employee_by_id_not_found(client: TestClient, mock_data_service: MagicMock):
    response = client.get("/api/employees/emp999")
    assert response.status_code == 404
    assert response.json() == {"detail": "Employee not found"}
    mock_data_service.get_mock_employees.assert_called()


def test_read_employee_by_id_internal_error_if_service_fails(client: TestClient, mock_data_service: MagicMock):
    mock_data_service.get_mock_employees.side_effect = Exception("Unexpected service error")
    response = client.get("/api/employees/emp001")
    assert response.status_code == 500
    mock_data_service.get_mock_employees.assert_called_once()


def test_get_employee_profile_check_data_structure(client: TestClient, mock_data_service: MagicMock):
    response = client.get("/api/employees/emp001")
    assert response.status_code == 200
    json_response = response.json()

    expected_keys = ["id", "name", "department", "awe_points", "current_seat_id"]
    for key in expected_keys:
        assert key in json_response

    assert isinstance(json_response["id"], str)
    assert isinstance(json_response["name"], str)
    assert isinstance(json_response["department"], str)
    assert isinstance(json_response["awe_points"], int)
    assert isinstance(json_response["current_seat_id"], (str, type(None)))


# ---------- Leaderboard ----------

def test_get_leaderboard_success(client: TestClient, mock_data_service: MagicMock):
    response = client.get("/api/employees/leaderboard/")
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, list)
    assert len(json_response) == 2
    assert json_response[0]["rank"] == 1
    assert json_response[0]["employee_id"] == "emp002"
    mock_data_service.get_mock_leaderboard.assert_called_once()


def test_get_leaderboard_limit_param(client: TestClient, mock_data_service: MagicMock):
    mock_data_service.get_mock_leaderboard.return_value = [
        {"rank": 1, "employee_id": "emp003", "name": "User Three", "awe_points": 300, "department": "Lead"},
        {"rank": 2, "employee_id": "emp002", "name": "User Two", "awe_points": 200, "department": "Lead"},
        {"rank": 3, "employee_id": "emp001", "name": "User One", "awe_points": 100, "department": "Lead"},
    ]
    response = client.get("/api/employees/leaderboard/?limit=1")
    assert response.status_code == 200
    assert response.json()[0]["employee_id"] == "emp003"
    mock_data_service.get_mock_leaderboard.assert_called_once()


def test_get_leaderboard_empty_if_no_employees(client: TestClient, mock_data_service: MagicMock):
    mock_data_service.get_mock_leaderboard.return_value = []
    response = client.get("/api/employees/leaderboard/")
    assert response.status_code == 200
    assert response.json() == []
    mock_data_service.get_mock_leaderboard.assert_called_once()


def test_get_leaderboard_check_data_structure(client: TestClient, mock_data_service: MagicMock):
    response = client.get("/api/employees/leaderboard/")
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, list)

    if json_response:
        entry = json_response[0]
        expected_keys = ["rank", "employee_id", "name", "awe_points", "department"]
        for key in expected_keys:
            assert key in entry
        assert isinstance(entry["rank"], int)
        assert isinstance(entry["employee_id"], str)
        assert isinstance(entry["name"], str)
        assert isinstance(entry["awe_points"], int)
        assert isinstance(entry["department"], str)
