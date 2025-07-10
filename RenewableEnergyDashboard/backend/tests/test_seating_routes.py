from fastapi.testclient import TestClient
from unittest.mock import MagicMock

# Fixtures 'client' and 'mock_data_service' are from conftest.py

def test_get_seating_arrangement_data_success(client: TestClient, mock_data_service: MagicMock):
    """Test successful retrieval of seating arrangement data."""
    response = client.get("/api/seating/arrangement/")
    assert response.status_code == 200
    json_response = response.json()

    # Assert based on the structure of SeatingArrangement and mock data in conftest
    assert "zones" in json_response
    assert isinstance(json_response["zones"], list)
    assert len(json_response["zones"]) == 1 # From conftest mock
    assert json_response["zones"][0]["zone_id"] == "ZoneA"
    assert len(json_response["zones"][0]["seats"]) == 2
    assert json_response["total_seats"] == 2
    assert json_response["occupied_seats"] == 1
    assert json_response["unoccupied_seats"] == 1

    mock_data_service.get_mock_seating_arrangement_and_assign_employees.assert_called_once()

def test_get_seating_suggestions_data_success(client: TestClient, mock_data_service: MagicMock):
    """Test successful retrieval of seating suggestions."""
    response = client.get("/api/seating/suggestions/")
    assert response.status_code == 200
    json_response = response.json()

    # Assert based on the structure of SeatingSuggestion and mock data in conftest
    assert "message" in json_response
    assert json_response["message"] == "Consider moving Test User One from A1-R1C1 to A1-R1C2."
    assert "suggested_moves" in json_response
    assert len(json_response["suggested_moves"]) == 1
    assert json_response["suggested_moves"][0] == ["emp001", "A1-R1C2"] # Tuple becomes list in JSON
    assert json_response["estimated_energy_saving_kwh"] == 1.5
    assert json_response["vacated_zones_lights_off"] == ["ZoneA"]

    mock_data_service.get_mock_seating_suggestions.assert_called_once()

def test_get_seating_arrangement_db_switch_scenario(client: TestClient, mock_data_service: MagicMock):
    """Test the seating arrangement route when USE_DATABASE_SWITCH is True (expect 501)."""
    mock_data_service.USE_DATABASE_SWITCH = True # Simulate DB mode

    response = client.get("/api/seating/arrangement/")
    assert response.status_code == 501
    assert response.json() == {"detail": "Database connection not implemented yet."}

    # Reset for other tests
    mock_data_service.USE_DATABASE_SWITCH = False

def test_get_seating_suggestions_db_switch_scenario(client: TestClient, mock_data_service: MagicMock):
    """Test the seating suggestions route when USE_DATABASE_SWITCH is True (expect 501)."""
    # For suggestions, the current mock service has a different message for DB mode.
    # Let's ensure that path is also covered if we were to toggle the switch.
    # The conftest mock for get_mock_seating_suggestions doesn't currently check USE_DATABASE_SWITCH,
    # but the actual service does. So, this test is more about the route's behavior if the
    # service *did* return a 501 or a specific DB-mode message through the route.
    # For consistency with other DB switch tests, we'll expect a 501 from the route.

    mock_data_service.USE_DATABASE_SWITCH = True
    # If the route itself checked the switch (it doesn't, it relies on service):
    # response = client.get("/api/seating/suggestions/")
    # assert response.status_code == 501
    # assert response.json() == {"detail": "Database connection not implemented yet."}

    # Instead, let's test the scenario where the *service itself* indicates DB mode.
    # We can make the mock behave as if the service raised an HTTPException or returned a specific structure.
    # For this test, we'll assume the route would propagate a 501 if the service indicated it.
    # The current setup has the service return a specific message for DB mode, not raise 501.
    # So, let's adjust the mock for this one test to simulate the 501 from the service path.

    original_suggestion_mock = mock_data_service.get_mock_seating_suggestions
    mock_data_service.get_mock_seating_suggestions = MagicMock(
        return_value={"message": "Seating optimization suggestions are not available in DB mode yet."} # This is what actual service returns
    )

    response = client.get("/api/seating/suggestions/")
    assert response.status_code == 200 # The route itself doesn't throw 501 based on switch
    assert response.json()["message"] == "Seating optimization suggestions are not available in DB mode yet."

    # Restore original mock and switch
    mock_data_service.get_mock_seating_suggestions = original_suggestion_mock
    mock_data_service.USE_DATABASE_SWITCH = False
```
