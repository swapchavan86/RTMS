import pytest
from fastapi.testclient import TestClient
from typing import Generator, Any
from unittest.mock import patch, MagicMock

# Import the main FastAPI app
from ..app.main import app
# Import the service that will be mocked
from ..app.services import data_generation_service as actual_data_service
from ..app.models.employee_models import Employee, LeaderboardEntry, LaptopMode
from ..app.models.energy_models import LightingZone, LightState, HvacZone, HvacStatus, LaptopUsage
from ..app.models.seating_models import SeatingArrangement, SeatingSuggestion, SeatingZone, Seat, SeatStatus


@pytest.fixture(scope="module")
def client() -> Generator[TestClient, Any, None]:
    """
    Yield a TestClient instance that points to the FastAPI app.
    """
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="function") # Use "function" scope if mock needs to be reset per test
def mock_data_service():
    """
    Provides a fixture that patches the data_generation_service globally for all tests
    that use this fixture.
    Returns the MagicMock object for further per-test configuration if needed.
    """
    mock_service = MagicMock(spec=actual_data_service)

    # Default mock return values (can be overridden in individual tests)
    mock_service.USE_DATABASE_SWITCH = False # Ensure tests run against mock logic paths

    mock_service.get_mock_employees.return_value = [
        Employee(id="emp001", name="Test User One", department="Testing", awe_points=100, current_seat_id="A1-R1C1"),
        Employee(id="emp002", name="Test User Two", department="Testing", awe_points=200, current_seat_id="A1-R1C2"),
    ]
    mock_service.get_mock_leaderboard.return_value = [
        {"rank": 1, "employee_id": "emp002", "name": "Test User Two", "awe_points": 200, "department": "Testing"},
        {"rank": 2, "employee_id": "emp001", "name": "Test User One", "awe_points": 100, "department": "Testing"},
    ]
    mock_service.get_mock_laptop_usage.return_value = [
        {"employee_id": "emp001", "hours_on": 5.0, "mode": LaptopMode.LIGHT.value},
        {"employee_id": "emp002", "hours_on": 8.0, "mode": LaptopMode.DARK.value},
    ]
    mock_service.get_mock_lighting_status.return_value = [
        {"zone_id": "ZoneA", "status": LightState.ON.value},
        {"zone_id": "ZoneB", "status": LightState.OFF.value},
    ]
    mock_service.get_mock_hvac_status.return_value = [
        {"zone_id": "ZoneA", "status": HvacStatus.ON.value, "current_temp_celsius": 22.0, "set_point_celsius": 23.0},
        {"zone_id": "ZoneB", "status": HvacStatus.OFF.value, "current_temp_celsius": 25.0, "set_point_celsius": None},
    ]

    sample_seat1 = Seat(seat_id="ZoneA-R1C1", status=SeatStatus.OCCUPIED, employee_id="emp001")
    sample_seat2 = Seat(seat_id="ZoneA-R1C2", status=SeatStatus.UNOCCUPIED, employee_id=None)
    sample_zone = SeatingZone(zone_id="ZoneA", grid_rows=1, grid_cols=2, seats=[sample_seat1, sample_seat2])

    mock_service.get_mock_seating_arrangement_and_assign_employees.return_value = {
        "zones": [sample_zone.model_dump()], # Use model_dump for Pydantic v2 compatibility if needed
        "total_seats": 2,
        "occupied_seats": 1,
        "unoccupied_seats": 1,
    }
    mock_service.get_mock_seating_suggestions.return_value = {
        "message": "Consider moving Test User One from A1-R1C1 to A1-R1C2.",
        "suggested_moves": [("emp001", "A1-R1C2")],
        "estimated_energy_saving_kwh": 1.5,
        "vacated_zones_lights_off": ["ZoneA"],
        "vacated_zones_ac_off": ["ZoneA"],
    }
    mock_service.get_mock_projector_usage.return_value = [ # Added for completeness
        {"room_id": "MeetingRoom101", "hours_on": 2.0, "status": LightState.ON.value},
    ]


    # Patch the actual service module where it's imported in your route files.
    # This requires knowing how the service is imported in those route modules.
    # If routes import 'from ..services import data_generation_service', this should work.
    # If they import 'from ..services.data_generation_service import get_mock_employees',
    # then individual functions might need patching.
    # Assuming 'from ..services import data_generation_service as service' or similar in routes.

    # The patch target string should be the path to where the object is *looked up*,
    # not where it's defined. So, if your routes do `from ..services import data_generation_service`,
    # then you patch `your_app.routes.some_route_module.data_generation_service`.

    patches = [
        patch('RenewableEnergyDashboard.backend.app.routes.employees_routes.data_generation_service', mock_service),
        patch('RenewableEnergyDashboard.backend.app.routes.energy_routes.data_generation_service', mock_service),
        patch('RenewableEnergyDashboard.backend.app.routes.seating_routes.data_generation_service', mock_service)
    ]

    for p in patches:
        p.start()

    yield mock_service # The test function will receive this mock_service

    for p in patches:
        p.stop()

```
