import random
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any

from ..models.employee_models import Employee, LaptopMode
from ..models.energy_models import LightState, HvacStatus
from ..models.seating_models import SeatStatus, Seat

# Configuration for mock data generation
NUM_EMPLOYEES = 50
NUM_ZONES = 5 # For lighting and HVAC
SEATS_PER_ZONE_ROWS = 8
SEATS_PER_ZONE_COLS = 12
USE_DATABASE_SWITCH = False # <<<< IMPORTANT: Switch for DB integration

# --- Helper Functions ---
def _random_name() -> str:
    first_names = ["Alice", "Bob", "Charlie", "Diana", "Edward", "Fiona", "George", "Hannah", "Ian", "Julia", "Kevin", "Laura", "Michael", "Nora", "Oscar"]
    last_names = ["Smith", "Jones", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris"]
    return f"{random.choice(first_names)} {random.choice(last_names)}"

def _random_department() -> str:
    departments = ["Engineering", "Marketing", "Sales", "Human Resources", "Product", "Support", "Finance"]
    return random.choice(departments)

# --- Employee Data Generation ---
_generated_employees: List[Employee] = []
_employee_seat_map: Dict[str, str] = {} # employee_id -> seat_id

def get_mock_employees() -> List[Employee]:
    global _generated_employees
    if not _generated_employees or not USE_DATABASE_SWITCH:
        _generated_employees = []
        for i in range(NUM_EMPLOYEES):
            emp_id = f"emp{str(i+1).zfill(3)}"
            employee = Employee(
                id=emp_id,
                name=_random_name(),
                department=_random_department(),
                awe_points=random.randint(0, 500),
                current_seat_id=None # Will be assigned by seating service
            )
            _generated_employees.append(employee)
    return _generated_employees

# --- Seating Data Generation ---
_generated_zones_seats: Dict[str, List[Seat]] = {} # zone_id -> List[Seat]

def get_mock_seating_arrangement_and_assign_employees() -> Dict[str, Any]:
    if USE_DATABASE_SWITCH and _generated_zones_seats: # Basic cache for mock mode
        # In a real DB scenario, this would fetch fresh data
        # For mock, just ensure employees are assigned if lists are already populated
        pass

    global _generated_zones_seats, _employee_seat_map
    _employee_seat_map = {} # Reset map
    all_seats_flat: List[Seat] = []
    zones_detail = []

    employees_to_seat = list(get_mock_employees()) # Get a mutable copy
    random.shuffle(employees_to_seat)

    total_seats = 0
    occupied_seats_count = 0

    for i in range(NUM_ZONES):
        zone_id = f"Zone{chr(65+i)}" # ZoneA, ZoneB, ...
        current_zone_seats = []
        _generated_zones_seats[zone_id] = current_zone_seats

        for r in range(SEATS_PER_ZONE_ROWS):
            for c in range(SEATS_PER_ZONE_COLS):
                seat_id = f"{zone_id}-R{r+1}C{c+1}"
                status = SeatStatus.UNOCCUPIED
                emp_id_on_seat = None

                # Assign ~70% of seats to employees
                if employees_to_seat and random.random() < 0.7:
                    try:
                        emp = employees_to_seat.pop()
                        status = SeatStatus.OCCUPIED
                        emp_id_on_seat = emp.id
                        emp.current_seat_id = seat_id # Update employee's current seat
                        _employee_seat_map[emp.id] = seat_id
                        occupied_seats_count += 1
                    except IndexError: # No more employees to seat
                        pass

                current_zone_seats.append(Seat(seat_id=seat_id, status=status, employee_id=emp_id_on_seat))
                all_seats_flat.append(current_zone_seats[-1])

        zones_detail.append({
            "zone_id": zone_id,
            "grid_rows": SEATS_PER_ZONE_ROWS,
            "grid_cols": SEATS_PER_ZONE_COLS,
            "seats": current_zone_seats
        })
        total_seats += SEATS_PER_ZONE_ROWS * SEATS_PER_ZONE_COLS

    # Update employees in _generated_employees list with their assigned seats
    # This is a bit redundant if get_mock_employees() always regenerates,
    # but good if it were to cache employees.
    emp_dict = {emp.id: emp for emp in _generated_employees}
    for emp_id, seat_id in _employee_seat_map.items():
        if emp_id in emp_dict:
            emp_dict[emp_id].current_seat_id = seat_id

    return {
        "zones": zones_detail,
        "total_seats": total_seats,
        "occupied_seats": occupied_seats_count,
        "unoccupied_seats": total_seats - occupied_seats_count,
    }


# --- Energy Data Generation ---
def get_mock_laptop_usage() -> List[Dict[str, Any]]:
    if USE_DATABASE_SWITCH:
        # Replace with actual database query
        return []

    employees = get_mock_employees()
    laptop_usage_data = []
    for emp in employees:
        # Simulate only for employees who are likely "in-office" / have a seat
        if emp.current_seat_id or random.random() < 0.8: # 80% chance if no seat (e.g. remote but tracked)
            laptop_usage_data.append({
                "employee_id": emp.id,
                "hours_on": round(random.uniform(2, 9), 1),
                "mode": random.choice(list(LaptopMode)).value,
            })
    return laptop_usage_data

def get_mock_lighting_status() -> List[Dict[str, Any]]:
    if USE_DATABASE_SWITCH:
        return [] # DB query

    lighting_data = []
    # Tie light status to occupied zones for some realism
    occupied_zones = set()
    if not _generated_zones_seats: # Ensure seating is generated first
        get_mock_seating_arrangement_and_assign_employees()

    for zone_id, seats_in_zone in _generated_zones_seats.items():
        is_zone_occupied = any(seat.status == SeatStatus.OCCUPIED for seat in seats_in_zone)
        if is_zone_occupied:
            occupied_zones.add(zone_id)

    for i in range(NUM_ZONES):
        zone_id = f"Zone{chr(65+i)}"
        status = LightState.OFF
        if zone_id in occupied_zones and random.random() < 0.9: # 90% chance lights are on if zone is occupied
            status = LightState.ON
        elif random.random() < 0.1: # 10% chance lights are on even if zone is not marked occupied (e.g. common area)
             status = LightState.ON

        lighting_data.append({
            "zone_id": zone_id,
            "status": status.value,
        })
    return lighting_data

def get_mock_hvac_status() -> List[Dict[str, Any]]:
    if USE_DATABASE_SWITCH:
        return [] # DB query

    hvac_data = []
    occupied_zones = set() # Similar logic to lighting
    if not _generated_zones_seats:
        get_mock_seating_arrangement_and_assign_employees()

    for zone_id, seats_in_zone in _generated_zones_seats.items():
        is_zone_occupied = any(seat.status == SeatStatus.OCCUPIED for seat in seats_in_zone)
        if is_zone_occupied:
            occupied_zones.add(zone_id)

    for i in range(NUM_ZONES):
        zone_id = f"Zone{chr(65+i)}" # Should match lighting zones for simplicity
        status = HvacStatus.OFF
        current_temp = None
        set_point = None

        if zone_id in occupied_zones and random.random() < 0.8: # 80% chance AC is on if zone is occupied
            status = random.choice([HvacStatus.ON, HvacStatus.ECO])
            current_temp = round(random.uniform(20.0, 25.0), 1)
            set_point = round(random.uniform(22.0, 24.0), 1)
        elif random.random() < 0.05: # Small chance AC is on for an unoccupied zone
            status = HvacStatus.ON
            current_temp = round(random.uniform(20.0, 25.0), 1)
            set_point = round(random.uniform(22.0, 24.0), 1)
        else: # Off
            current_temp = round(random.uniform(24.0, 28.0),1) # Warmer if AC is off
            set_point = None


        hvac_data.append({
            "zone_id": zone_id,
            "status": status.value,
            "current_temp_celsius": current_temp,
            "set_point_celsius": set_point,
        })
    return hvac_data

# --- Leaderboard ---
def get_mock_leaderboard() -> List[Dict[str, Any]]:
    if USE_DATABASE_SWITCH:
        return [] # DB query

    employees = get_mock_employees()
    # Sort employees by Awe Points in descending order
    sorted_employees = sorted(employees, key=lambda emp: emp.awe_points, reverse=True)

    leaderboard_entries = []
    for i, emp in enumerate(sorted_employees):
        leaderboard_entries.append({
            "rank": i + 1,
            "employee_id": emp.id,
            "name": emp.name,
            "awe_points": emp.awe_points,
            "department": emp.department
        })
    return leaderboard_entries

# --- Seating Suggestions (Basic Example) ---
def get_mock_seating_suggestions() -> Dict[str, Any]:
    if USE_DATABASE_SWITCH:
        # Implement more complex logic or DB query
        return {"message": "Seating optimization suggestions are not available in DB mode yet."}

    if not _generated_zones_seats:
        get_mock_seating_arrangement_and_assign_employees()

    # Simple suggestion: find the most sparsely populated zone and suggest consolidating.
    # This is a very naive implementation. A real one would be much more complex.

    # Find an occupied seat in a less populated part of a zone
    # And an empty seat in a more populated part of another (or same) zone.
    # This is complex to do meaningfully with random data without a proper algorithm.
    # For now, a placeholder message:

    # Placeholder: find one employee to move to an empty seat if possible
    # This is not a true "consolidation" suggestion yet.
    target_employee_id = None
    current_seat_id = None
    new_seat_id_suggestion = None

    # Find an employee who could potentially move
    # For simplicity, pick a random employee from those seated
    seated_employees = [emp for emp in _generated_employees if emp.current_seat_id]
    if not seated_employees:
        return {"message": "No employees are currently seated to make suggestions."}

    employee_to_move = random.choice(seated_employees)
    target_employee_id = employee_to_move.id
    current_seat_id = employee_to_move.current_seat_id

    # Find a random empty seat
    empty_seats = []
    for zone_id, seats in _generated_zones_seats.items():
        for seat in seats:
            if seat.status == SeatStatus.UNOCCUPIED:
                empty_seats.append(seat.seat_id)

    if empty_seats:
        new_seat_id_suggestion = random.choice(empty_seats)

    if target_employee_id and new_seat_id_suggestion and current_seat_id != new_seat_id_suggestion:
        return {
            "message": f"Consider moving {employee_to_move.name} from {current_seat_id} to {new_seat_id_suggestion} to potentially consolidate space. This is a demo suggestion.",
            "suggested_moves": [(target_employee_id, new_seat_id_suggestion)],
            "estimated_energy_saving_kwh": round(random.uniform(0.5, 2.0), 2), # Mock savings
            "vacated_zones_lights_off": [current_seat_id.split('-')[0]] if current_seat_id else [], # Mock vacated zone
            "vacated_zones_ac_off": [current_seat_id.split('-')[0]] if current_seat_id else [] # Mock vacated zone
        }
    else:
        return {
            "message": "No simple seating suggestions available at the moment. Office layout is optimal or no moves identified.",
             "suggested_moves": [],
        }

# Call initial data generation to populate on module load for mock mode
if not USE_DATABASE_SWITCH:
    get_mock_employees()
    get_mock_seating_arrangement_and_assign_employees()
```
