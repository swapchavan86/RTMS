from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from ..app.models.energy_models import LaptopMode, LightState, HvacStatus # For asserting values

# Fixtures 'client' and 'mock_data_service' are from conftest.py

def test_get_laptop_usage_data_success(client: TestClient, mock_data_service: MagicMock):
    """Test successful retrieval of laptop usage data."""
    response = client.get("/api/energy/laptop-usage/")
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, list)
    assert len(json_response) == 2 # Based on default mock in conftest
    assert json_response[0]["employee_id"] == "emp001"
    assert json_response[0]["mode"] == LaptopMode.LIGHT.value
    mock_data_service.get_mock_laptop_usage.assert_called_once()

def test_get_lighting_status_data_success(client: TestClient, mock_data_service: MagicMock):
    """Test successful retrieval of lighting status data."""
    response = client.get("/api/energy/lighting/")
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, list)
    assert len(json_response) == 2 # Based on default mock
    assert json_response[0]["zone_id"] == "ZoneA"
    assert json_response[0]["status"] == LightState.ON.value
    mock_data_service.get_mock_lighting_status.assert_called_once()

def test_get_hvac_status_data_success(client: TestClient, mock_data_service: MagicMock):
    """Test successful retrieval of HVAC status data."""
    response = client.get("/api/energy/hvac/")
    assert response.status_code == 200
    json_response = response.json()
    assert isinstance(json_response, list)
    assert len(json_response) == 2 # Based on default mock
    assert json_response[0]["zone_id"] == "ZoneA"
    assert json_response[0]["status"] == HvacStatus.ON.value
    assert json_response[0]["current_temp_celsius"] == 22.0
    mock_data_service.get_mock_hvac_status.assert_called_once()

# Example of testing with DB switch for one of the energy routes
def test_get_laptop_usage_db_switch_scenario(client: TestClient, mock_data_service: MagicMock):
    """Test the laptop usage route when USE_DATABASE_SWITCH is True (expect 501)."""
    mock_data_service.USE_DATABASE_SWITCH = True # Simulate DB mode

    response = client.get("/api/energy/laptop-usage/")
    assert response.status_code == 501
    assert response.json() == {"detail": "Database connection not implemented yet."}

    # Reset for other tests if the mock_data_service is function-scoped and reused
    mock_data_service.USE_DATABASE_SWITCH = False

# Placeholder for projector usage tests if that endpoint was added to energy_routes
# def test_get_projector_usage_data_success(client: TestClient, mock_data_service: MagicMock):
#     """Test successful retrieval of projector usage data."""
#     # Assuming get_mock_projector_usage is configured in conftest and endpoint exists
#     mock_data_service.get_mock_projector_usage.return_value = [
#         {"room_id": "MeetingRoom101", "hours_on": 2.0, "status": "ON"},
#     ]
#     response = client.get("/api/energy/projectors/") # Example endpoint
#     assert response.status_code == 200
#     json_response = response.json()
#     assert len(json_response) == 1
#     assert json_response[0]["room_id"] == "MeetingRoom101"
#     mock_data_service.get_mock_projector_usage.assert_called_once()