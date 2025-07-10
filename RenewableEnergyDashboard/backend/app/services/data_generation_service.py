import random
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from ..models.employee_models import Employee
from ..models.energy_models import LightState, HvacStatus, ProjectorUsage, LaptopMode # LaptopMode moved here
from ..models.seating_models import SeatStatus, Seat

# Configuration for mock data generation
NUM_EMPLOYEES = 50
NUM_ZONES = 5  # For lighting and HVAC. E.g. ZoneA, ZoneB...
SEATS_PER_ZONE_ROWS = 8
SEATS_PER_ZONE_COLS = 12
NUM_MEETING_ROOMS = 3 # For projectors

USE_DATABASE_SWITCH = False  # <<<< IMPORTANT: Switch for DB integration

# --- Helper Functions ---
def _random_name() -> str:
    first_names = ["Alice", "Bob", "Charlie", "Diana", "Edward", "Fiona", "George", "Hannah", "Ian", "Julia", "Kevin", "Laura", "Michael", "Nora", "Oscar", "Pam", "Quincy", "Rita", "Samuel", "Tina"]
    last_names = ["Smith", "Jones", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Garcia", "Martinez", "Robinson", "Clark"]
    return f"{random.choice(first_names)} {random.choice(last_names)}"

def _random_department() -> str:
    departments = ["Engineering", "Marketing", "Sales", "Human Resources", "Product Management", "Support", "Finance & Accounting", "Operations", "Research & Development"]
    return random.choice(departments)

def _get_employee_by_id(emp_id: str) -> Optional[Employee]:
    for emp in _generated_employees:
        if emp.id == emp_id:
            return emp
    return None

# --- Employee Data Generation ---
_generated_employees: List[Employee] = []
_employee_seat_map: Dict[str, str] = {}  # employee_id -> seat_id

def get_mock_employees(refresh: bool = False) -> List[Employee]:
    global _generated_employees
    if refresh or not _generated_employees or not USE_DATABASE_SWITCH:
        _generated_employees = []
        for i in range(NUM_EMPLOYEES):
            emp_id = f"emp{str(i+1).zfill(3)}"
            # Simulate some employees having higher AwePoints due to specific actions (e.g., dark mode)
            awe_points = random.randint(0, 300)
            laptop_mode_for_points = random.choice(list(LaptopMode))
            if laptop_mode_for_points == LaptopMode.DARK:
                awe_points += random.randint(20, 50) # Bonus for dark mode

            employee = Employee(
                id=emp_id,
                name=_random_name(),
                department=_random_department(),
                awe_points=awe_points,
                current_seat_id=None  # Will be assigned by seating service
            )
            _generated_employees.append(employee)
    return _generated_employees

# --- Seating Data Generation ---
_generated_zones_seats: Dict[str, List[Seat]] = {}  # zone_id -> List[Seat]

def get_mock_seating_arrangement_and_assign_employees(refresh: bool = False) -> Dict[str, Any]:
    global _generated_zones_seats, _employee_seat_map # Moved to the top

    if USE_DATABASE_SWITCH and _generated_zones_seats and not refresh:
        # In a real DB scenario, this would fetch fresh data
        pass # For mock, allow regeneration if refresh is true

    # Refresh employees to ensure they are available for seating assignment
    employees_list = get_mock_employees(refresh=refresh)

    # Resetting state for regeneration
    _employee_seat_map = {}
    _generated_zones_seats = {}

    all_seats_flat: List[Seat] = []
    zones_detail = []

    employees_to_seat = list(employees_list) # Use the potentially refreshed list
    random.shuffle(employees_to_seat)

    total_seats = 0
    occupied_seats_count = 0

    for i in range(NUM_ZONES):
        zone_id = f"Zone{chr(65+i)}"  # ZoneA, ZoneB, ...
        current_zone_seats = []
        _generated_zones_seats[zone_id] = current_zone_seats # Store early for reference

        for r in range(SEATS_PER_ZONE_ROWS):
            for c in range(SEATS_PER_ZONE_COLS):
                seat_id = f"{zone_id}-R{r+1}C{c+1}"
                status = SeatStatus.UNOCCUPIED
                emp_id_on_seat = None

                # Assign ~60-70% of seats to employees to ensure some vacancies
                if employees_to_seat and random.random() < random.uniform(0.6, 0.7):
                    try:
                        emp = employees_to_seat.pop()
                        status = SeatStatus.OCCUPIED
                        emp_id_on_seat = emp.id
                        # Crucially update the employee object in the shared list
                        emp_obj_in_list = _get_employee_by_id(emp.id)
                        if emp_obj_in_list:
                             emp_obj_in_list.current_seat_id = seat_id
                        _employee_seat_map[emp.id] = seat_id
                        occupied_seats_count += 1
                    except IndexError:  # No more employees to seat
                        pass
                elif random.random() < 0.05: # Small chance a seat is reserved or disabled
                    status = random.choice([SeatStatus.RESERVED, SeatStatus.DISABLED])

                current_zone_seats.append(Seat(seat_id=seat_id, status=status, employee_id=emp_id_on_seat))
                all_seats_flat.append(current_zone_seats[-1])

        zones_detail.append({
            "zone_id": zone_id,
            "description": f"The {zone_id.lower().replace('zone','Area ')} of the office, primarily for {_random_department()}",
            "grid_rows": SEATS_PER_ZONE_ROWS,
            "grid_cols": SEATS_PER_ZONE_COLS,
            "seats": current_zone_seats
        })
        total_seats += SEATS_PER_ZONE_ROWS * SEATS_PER_ZONE_COLS

    return {
        "zones": zones_detail,
        "total_seats": total_seats,
        "occupied_seats": occupied_seats_count,
        "unoccupied_seats": total_seats - occupied_seats_count,
    }


# --- Energy Data Generation ---
def get_mock_laptop_usage() -> List[Dict[str, Any]]:
    if USE_DATABASE_SWITCH:
        return [] # DB query

    employees = get_mock_employees() # Ensure employees are loaded
    laptop_usage_data = []
    for emp in employees:
        # Simulate only for employees who are likely "in-office" / have a seat or are active
        if emp.current_seat_id or random.random() < 0.75: # 75% chance if no seat (e.g. remote but tracked)
            mode = random.choice(list(LaptopMode))
            hours = round(random.uniform(1, 9), 1)
            # Small AwePoints update based on laptop mode (example of internal logic)
            if mode == LaptopMode.DARK and emp.awe_points < 450: # Cap max points from this
                emp.awe_points += random.randint(1, 5)

            laptop_usage_data.append({
                "employee_id": emp.id,
                "hours_on": hours,
                "mode": mode.value,
            })
    return laptop_usage_data

def get_mock_lighting_status() -> List[Dict[str, Any]]:
    if USE_DATABASE_SWITCH:
        return [] # DB query

    lighting_data = []
    # Ensure seating is generated so _generated_zones_seats is populated
    if not _generated_zones_seats:
        get_mock_seating_arrangement_and_assign_employees(refresh=True)

    for zone_id_key in _generated_zones_seats.keys(): # Iterate over actual generated zone IDs
        seats_in_zone = _generated_zones_seats[zone_id_key]
        is_zone_occupied = any(seat.status == SeatStatus.OCCUPIED for seat in seats_in_zone)

        status = LightState.OFF
        # Higher chance lights are on if zone is occupied
        if is_zone_occupied and random.random() < 0.85:
            status = LightState.ON
        # Small chance lights are on even if zone is not marked occupied (e.g. cleaning, common area part)
        elif not is_zone_occupied and random.random() < 0.15:
             status = LightState.ON

        lighting_data.append({
            "zone_id": zone_id_key, # Use the actual zone_id from the seating map
            "status": status.value,
            # "brightness_level": random.randint(60,100) if status == LightState.ON else 0,
            # "last_changed": datetime.now() - timedelta(minutes=random.randint(5,120))
        })
    return lighting_data

def get_mock_hvac_status() -> List[Dict[str, Any]]:
    if USE_DATABASE_SWITCH:
        return [] # DB query

    hvac_data = []
    if not _generated_zones_seats:
        get_mock_seating_arrangement_and_assign_employees(refresh=True)

    for zone_id_key in _generated_zones_seats.keys():
        seats_in_zone = _generated_zones_seats[zone_id_key]
        is_zone_occupied = any(seat.status == SeatStatus.OCCUPIED for seat in seats_in_zone)

        status = HvacStatus.OFF
        current_temp = round(random.uniform(23.0, 27.0),1) # Warmer if AC is off
        set_point = None

        if is_zone_occupied and random.random() < 0.75: # 75% chance AC is on/eco if zone is occupied
            status = random.choice([HvacStatus.ON, HvacStatus.ECO, HvacStatus.ON]) # Skew towards ON
            current_temp = round(random.uniform(20.0, 23.5), 1)
            set_point = round(random.uniform(21.0, 23.0), 1)
            if status == HvacStatus.ECO:
                 set_point = round(random.uniform(23.0, 24.5), 1) # Eco usually has a slightly higher set point
                 current_temp = round(random.uniform(22.0, 24.0), 1)

        elif not is_zone_occupied and random.random() < 0.1: # Small chance AC is on for an unoccupied zone
            status = HvacStatus.ON
            current_temp = round(random.uniform(21.0, 24.0), 1)
            set_point = round(random.uniform(22.0, 23.0), 1)

        hvac_data.append({
            "zone_id": zone_id_key,
            "status": status.value,
            "current_temp_celsius": current_temp,
            "set_point_celsius": set_point,
        })
    return hvac_data

def get_mock_projector_usage() -> List[ProjectorUsage]:
    if USE_DATABASE_SWITCH:
        return [] # DB Query

    projector_data = []
    for i in range(NUM_MEETING_ROOMS):
        room_id = f"MeetingRoom{101+i}"
        status = random.choice([LightState.ON, LightState.OFF, LightState.OFF]) # Skew towards OFF
        hours_on = 0.0
        if status == LightState.ON:
            hours_on = round(random.uniform(0.5, 4.0), 1)

        projector_data.append(ProjectorUsage(
            room_id=room_id,
            hours_on=hours_on,
            status=status
        ))
    return projector_data


# --- Leaderboard ---
def get_mock_leaderboard() -> List[Dict[str, Any]]:
    if USE_DATABASE_SWITCH:
        return [] # DB query

    employees = get_mock_employees() # Ensure employees and their potentially updated points are used
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