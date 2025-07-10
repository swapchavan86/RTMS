import random
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from ..models.employee_models import Employee
from ..models.energy_models import LightState, HvacStatus, ProjectorUsage, LaptopMode
from ..models.seating_models import SeatStatus, Seat, SeatingZone # Added SeatingZone for simplified model

# Configuration for mock data generation (original values, not used in simplified functions)
NUM_EMPLOYEES = 50
NUM_ZONES = 5
SEATS_PER_ZONE_ROWS = 8
SEATS_PER_ZONE_COLS = 12
NUM_MEETING_ROOMS = 3

USE_DATABASE_SWITCH = False

# --- Helper Functions (can be kept as they are not computationally intensive) ---
def _random_name() -> str:
    first_names = ["Alice", "Bob", "Charlie"]
    last_names = ["Smith", "Jones", "Williams"]
    return f"{random.choice(first_names)} {random.choice(last_names)}"

def _random_department() -> str:
    departments = ["Engineering", "Marketing", "Sales"]
    return random.choice(departments)

def _get_employee_by_id(emp_id: str) -> Optional[Employee]:
    # Simplified: in a real scenario with simplified get_mock_employees, this might need adjustment
    # For now, assume get_mock_employees will provide the emp if needed by other simplified functions.
    # This is not strictly needed if other functions don't rely on it during simplification.
    global _generated_employees
    for emp in _generated_employees: # _generated_employees will be small or empty in simplified version
        if emp.id == emp_id:
            return emp
    return None

# --- Global variables for storing generated data (can be kept) ---
_generated_employees: List[Employee] = []
_employee_seat_map: Dict[str, str] = {}
_generated_zones_seats: Dict[str, List[Seat]] = {}

# --- Simplified Data Generation Functions ---

def get_mock_employees(refresh: bool = False) -> List[Employee]:
    global _generated_employees # Still need global if we intend to modify the module-level list
    if USE_DATABASE_SWITCH: return []
    # Return a very small, hardcoded list
    _generated_employees = [
        Employee(id="emp001", name="Simplified User 1", department="Core", awe_points=50, current_seat_id="Z1-R1C1"),
        Employee(id="emp002", name="Simplified User 2", department="Support", awe_points=75, current_seat_id=None)
    ]
    return _generated_employees

def get_mock_seating_arrangement_and_assign_employees(refresh: bool = False) -> Dict[str, Any]:
    global _generated_zones_seats, _employee_seat_map
    if USE_DATABASE_SWITCH: return {"zones": [], "total_seats": 0, "occupied_seats": 0, "unoccupied_seats": 0}

    _employee_seat_map = {"emp001": "Z1-R1C1"}
    seat1 = Seat(seat_id="Z1-R1C1", status=SeatStatus.OCCUPIED, employee_id="emp001")
    seat2 = Seat(seat_id="Z1-R1C2", status=SeatStatus.UNOCCUPIED, employee_id=None)
    # Need to ensure SeatingZone is properly imported if used like this. (It is from ..models.seating_models)
    zone1 = SeatingZone(zone_id="Z1", description="Simplified Zone", grid_rows=1, grid_cols=2, seats=[seat1, seat2])
    _generated_zones_seats = {"Z1": [seat1, seat2]}

    return {
        "zones": [zone1.model_dump()], # Use model_dump for Pydantic v2 if models require it for dict conversion
        "total_seats": 2,
        "occupied_seats": 1,
        "unoccupied_seats": 1,
    }

def get_mock_laptop_usage() -> List[Dict[str, Any]]:
    if USE_DATABASE_SWITCH: return []
    return [
        {"employee_id": "emp001", "hours_on": 1.0, "mode": LaptopMode.LIGHT.value}
    ]

def get_mock_lighting_status() -> List[Dict[str, Any]]:
    if USE_DATABASE_SWITCH: return []
    # Crucially, ensure zone_id matches what get_mock_seating_arrangement might produce if there's coupling
    return [
        {"zone_id": "Z1", "status": LightState.ON.value}
    ]

def get_mock_hvac_status() -> List[Dict[str, Any]]:
    if USE_DATABASE_SWITCH: return []
    return [
        {"zone_id": "Z1", "status": HvacStatus.ECO.value, "current_temp_celsius": 23.0, "set_point_celsius": 24.0}
    ]

def get_mock_projector_usage() -> List[ProjectorUsage]:
    if USE_DATABASE_SWITCH: return []
    return [
        ProjectorUsage(room_id="MR1", hours_on=0.5, status=LightState.ON)
    ]

def get_mock_leaderboard() -> List[Dict[str, Any]]:
    if USE_DATABASE_SWITCH: return []
    # Depends on get_mock_employees if it sorts dynamically. For simplification, hardcode.
    return [
        {"rank": 1, "employee_id": "emp002", "name": "Simplified User 2", "awe_points": 75, "department": "Support"},
        {"rank": 2, "employee_id": "emp001", "name": "Simplified User 1", "awe_points": 50, "department": "Core"}
    ]

def get_mock_seating_suggestions() -> Dict[str, Any]:
    if USE_DATABASE_SWITCH: return {"message": "DB suggestions not ready.", "suggested_moves": []}
    return {
        "message": "Simplified suggestion: All optimal for now.",
        "suggested_moves": [],
        "estimated_energy_saving_kwh": 0.0, # Ensure float
        "vacated_zones_lights_off": [],
        "vacated_zones_ac_off": [],
    }

# --- Comment out initial data population calls at module level ---
# _initial_refresh = True
# if not USE_DATABASE_SWITCH:
#     print("DEBUG: data_generation_service: Module level populating simplified employees...")
#     get_mock_employees(refresh=_initial_refresh)
#     print("DEBUG: data_generation_service: Module level populating simplified seating...")
#     get_mock_seating_arrangement_and_assign_employees(refresh=_initial_refresh)
#     print("DEBUG: data_generation_service: Simplified population complete.")
# else:
#     print("DEBUG: data_generation_service: USE_DATABASE_SWITCH is True, skipping module level population.")

print("DEBUG: data_generation_service.py (simplified version) loaded.")
```
