import random
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from ..models.employee_models import Employee
from ..models.energy_models import LightState, HvacStatus, ProjectorUsage, LaptopMode
from ..models.seating_models import SeatStatus, Seat, SeatingZone

# Configuration for mock data generation
NUM_EMPLOYEES = 25  # Target around 10-25 for varied data, can show fewer in UI
NUM_ZONES = 5       # For lighting and HVAC
# Aim for ~100 seats: 5 zones * (5 rows * 4 cols) = 100 seats
SEATS_PER_ZONE_ROWS = 5
SEATS_PER_ZONE_COLS = 4
NUM_MEETING_ROOMS = 3

USE_DATABASE_SWITCH = False

# --- Helper Functions (Restoring original variety) ---
def _random_name() -> str:
    first_names = ["Alice", "Bob", "Charlie", "Diana", "Edward", "Fiona", "George", "Hannah", "Ian", "Julia", "Kevin", "Laura", "Michael", "Nora", "Oscar", "Pam", "Quincy", "Rita", "Samuel", "Tina", "Uma", "Victor", "Wendy", "Xavier", "Yvonne", "Zach"]
    last_names = ["Smith", "Jones", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee", "Walker", "Hall", "Allen"]
    return f"{random.choice(first_names)} {random.choice(last_names)}"

def _random_department() -> str:
    departments = ["Engineering", "Marketing", "Sales", "Human Resources", "Product Management", "Support", "Finance & Accounting", "Operations", "Research & Development", "Legal", "Design"]
    return random.choice(departments)

# --- Global variables for storing generated data ---
_generated_employees: List[Employee] = []
_employee_seat_map: Dict[str, str] = {}
_generated_zones_seats: Dict[str, List[Seat]] = {}

def _get_employee_by_id(emp_id: str) -> Optional[Employee]:
    # This helper will search the current _generated_employees list
    for emp in _generated_employees:
        if emp.id == emp_id:
            return emp
    return None

# --- Enhanced Data Generation Functions ---

def get_mock_employees(refresh: bool = False) -> List[Employee]:
    global _generated_employees
    # Only generate if refresh is true or if it's empty (and not in DB mode)
    # This prevents re-generating if already populated by module-level call
    if refresh or (not _generated_employees and not USE_DATABASE_SWITCH):
        print(f"DEBUG: data_generation_service: Generating {NUM_EMPLOYEES} mock employees...")
        _generated_employees = [] # Clear before regenerating
        for i in range(NUM_EMPLOYEES):
            emp_id = f"emp{str(i+1).zfill(3)}"
            awe_points = random.randint(50, 450) # More varied points
            laptop_mode_for_points = random.choice(list(LaptopMode))
            if laptop_mode_for_points == LaptopMode.DARK:
                awe_points += random.randint(10, 50)

            employee = Employee(
                id=emp_id,
                name=_random_name(),
                department=_random_department(),
                awe_points=min(awe_points, 500), # Cap points
                current_seat_id=None
            )
            _generated_employees.append(employee)
    return _generated_employees

def get_mock_seating_arrangement_and_assign_employees(refresh: bool = False) -> Dict[str, Any]:
    global _generated_zones_seats, _employee_seat_map

    # Ensure employees are generated first if list is empty
    # Use the current _generated_employees list if populated by module call or previous direct call
    current_employees = get_mock_employees(refresh=refresh if not _generated_employees else False)

    # Regenerate seating if refresh is true or if it's empty
    if refresh or (not _generated_zones_seats and not USE_DATABASE_SWITCH):
        print(f"DEBUG: data_generation_service: Generating seating arrangement (approx {NUM_ZONES*SEATS_PER_ZONE_ROWS*SEATS_PER_ZONE_COLS} seats)...")
        _employee_seat_map = {}
        _generated_zones_seats = {}

        all_seats_flat: List[Seat] = []
        zones_detail = []

        # Take a copy to pop from, so we don't modify the global _generated_employees list directly here
        employees_to_seat = list(current_employees)
        random.shuffle(employees_to_seat)

        total_seats = 0
        occupied_seats_count = 0

        for i in range(NUM_ZONES):
            zone_id = f"Zone{chr(65+i)}"
            current_zone_seats = []
            _generated_zones_seats[zone_id] = current_zone_seats

            for r in range(SEATS_PER_ZONE_ROWS):
                for c in range(SEATS_PER_ZONE_COLS):
                    seat_id = f"{zone_id}-R{r+1}C{c+1}"
                    status = SeatStatus.UNOCCUPIED
                    emp_id_on_seat = None

                    if employees_to_seat and random.random() < 0.7: # ~70% occupancy target
                        try:
                            emp_to_assign = employees_to_seat.pop()
                            status = SeatStatus.OCCUPIED
                            emp_id_on_seat = emp_to_assign.id

                            # Update the authoritative _generated_employees list
                            # This is important if get_mock_employees isn't called with refresh=True later
                            # but other functions rely on current_seat_id being up-to-date
                            for emp_obj in _generated_employees:
                                if emp_obj.id == emp_id_on_seat:
                                    emp_obj.current_seat_id = seat_id
                                    break
                            _employee_seat_map[emp_id_on_seat] = seat_id
                            occupied_seats_count += 1
                        except IndexError:
                            pass # No more employees to seat
                    elif random.random() < 0.05:
                        status = random.choice([SeatStatus.RESERVED, SeatStatus.DISABLED])

                    current_zone_seats.append(Seat(seat_id=seat_id, status=status, employee_id=emp_id_on_seat))
                    all_seats_flat.append(current_zone_seats[-1])

            zones_detail.append(SeatingZone(
                zone_id=zone_id,
                description=f"Area {chr(65+i)} - {_random_department()} Department Focus",
                grid_rows=SEATS_PER_ZONE_ROWS,
                grid_cols=SEATS_PER_ZONE_COLS,
                seats=current_zone_seats
            ).model_dump()) # Use model_dump for Pydantic v2 if models require it
            total_seats += SEATS_PER_ZONE_ROWS * SEATS_PER_ZONE_COLS

        # This return structure is important for the SeatingArrangement model
        return {
            "zones": zones_detail,
            "total_seats": total_seats,
            "occupied_seats": occupied_seats_count,
            "unoccupied_seats": total_seats - occupied_seats_count,
        }
    else: # Return existing generated data if not refreshing
        # Reconstruct zones_detail from _generated_zones_seats for consistency
        zones_detail_reconstructed = []
        total_s = 0
        occupied_s = 0
        for zone_id, seats_list in _generated_zones_seats.items():
            # Find original grid dimensions if stored, or infer, or use constants
            # For simplicity, assume constants are reliable here if not storing full SeatingZone objects globally
            zones_detail_reconstructed.append(SeatingZone(
                zone_id=zone_id,
                description=f"Area {zone_id[-1]} - Previously Generated", # Placeholder description
                grid_rows=SEATS_PER_ZONE_ROWS, # Assuming constant for this zone
                grid_cols=SEATS_PER_ZONE_COLS, # Assuming constant for this zone
                seats=seats_list
            ).model_dump())
            total_s += len(seats_list)
            occupied_s += sum(1 for s in seats_list if s.status == SeatStatus.OCCUPIED)

        return {
            "zones": zones_detail_reconstructed,
            "total_seats": total_s,
            "occupied_seats": occupied_s,
            "unoccupied_seats": total_s - occupied_s,
        }


def get_mock_laptop_usage() -> List[Dict[str, Any]]:
    if USE_DATABASE_SWITCH: return []

    employees_for_laptop_usage = get_mock_employees() # Get current employee list
    laptop_usage_data = []
    for emp in employees_for_laptop_usage:
        if emp.current_seat_id or random.random() < 0.6: # Higher chance if seated
            mode = random.choice(list(LaptopMode))
            hours = round(random.uniform(1.5, 8.5), 1)

            # Simulate Awe points update based on laptop mode (more consistently)
            # This change should be reflected if get_mock_employees() is called afterwards by leaderboard
            original_points = emp.awe_points
            if mode == LaptopMode.DARK:
                emp.awe_points = min(emp.awe_points + random.randint(2,5), 500)

            laptop_usage_data.append({
                "employee_id": emp.id,
                "hours_on": hours,
                "mode": mode.value,
            })
    return laptop_usage_data

def get_mock_lighting_status() -> List[Dict[str, Any]]:
    if USE_DATABASE_SWITCH: return []

    lighting_data = []
    # Crucially, this needs _generated_zones_seats to be populated.
    # Call get_mock_seating_arrangement if it's not populated.
    if not _generated_zones_seats:
        get_mock_seating_arrangement_and_assign_employees() # This will use/generate employees too

    for zone_id_key, seats_in_zone_list in _generated_zones_seats.items():
        is_zone_occupied = any(seat.status == SeatStatus.OCCUPIED for seat in seats_in_zone_list)
        status = LightState.OFF
        if is_zone_occupied and random.random() < 0.9:
            status = LightState.ON
        elif not is_zone_occupied and random.random() < 0.1:
             status = LightState.ON

        lighting_data.append({
            "zone_id": zone_id_key,
            "status": status.value,
        })
    return lighting_data

def get_mock_hvac_status() -> List[Dict[str, Any]]:
    if USE_DATABASE_SWITCH: return []

    hvac_data = []
    if not _generated_zones_seats:
        get_mock_seating_arrangement_and_assign_employees()

    for zone_id_key, seats_in_zone_list in _generated_zones_seats.items():
        is_zone_occupied = any(seat.status == SeatStatus.OCCUPIED for seat in seats_in_zone_list)
        status = HvacStatus.OFF
        current_temp = round(random.uniform(24.0, 28.0),1)
        set_point = None

        if is_zone_occupied and random.random() < 0.8:
            status = random.choice([HvacStatus.ON, HvacStatus.ECO])
            current_temp = round(random.uniform(20.5, 23.0), 1)
            set_point = round(random.uniform(21.5, 23.5), 1)
            if status == HvacStatus.ECO:
                 set_point = round(random.uniform(22.5, 24.0), 1)
                 current_temp = round(random.uniform(21.5, 23.5), 1)
        elif not is_zone_occupied and random.random() < 0.05:
            status = HvacStatus.ON # e.g. server room in this zone
            current_temp = round(random.uniform(18.0, 22.0), 1)
            set_point = round(random.uniform(20.0, 22.0), 1)

        hvac_data.append({
            "zone_id": zone_id_key,
            "status": status.value,
            "current_temp_celsius": current_temp,
            "set_point_celsius": set_point,
        })
    return hvac_data

def get_mock_projector_usage() -> List[ProjectorUsage]:
    if USE_DATABASE_SWITCH: return []
    projector_data = []
    for i in range(NUM_MEETING_ROOMS):
        room_id = f"MeetingRoom{101+i}"
        status = random.choice([LightState.ON, LightState.OFF, LightState.OFF, LightState.OFF])
        hours_on = 0.0
        if status == LightState.ON:
            hours_on = round(random.uniform(0.25, 5.0), 1)

        projector_data.append(ProjectorUsage(
            room_id=room_id,
            hours_on=hours_on, # Corrected syntax from previous error
            status=status
        ))
    return projector_data

def get_mock_leaderboard() -> List[Dict[str, Any]]:
    if USE_DATABASE_SWITCH: return []

    # Use the current state of _generated_employees which might have updated points
    # from other calls like get_mock_laptop_usage
    employees_for_leaderboard = get_mock_employees() # This will return existing if not refresh

    sorted_employees = sorted(employees_for_leaderboard, key=lambda emp: emp.awe_points, reverse=True)

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

def get_mock_seating_suggestions() -> Dict[str, Any]:
    # This function uses _get_employee_by_id and _generated_zones_seats,
    # so ensure they are populated by calling respective getters if empty.
    if USE_DATABASE_SWITCH: return {"message": "DB suggestions not ready.", "suggested_moves": []}

    if not _generated_employees: get_mock_employees(refresh=True)
    if not _generated_zones_seats: get_mock_seating_arrangement_and_assign_employees(refresh=True) # This will also call get_mock_employees

    zone_occupancy = {}
    for zone_id, seats_list in _generated_zones_seats.items():
        occupied_count = sum(1 for seat in seats_list if seat.status == SeatStatus.OCCUPIED)
        total_zone_seats = len(seats_list)
        if total_zone_seats > 0:
            zone_occupancy[zone_id] = {
                "occupied": occupied_count, "total": total_zone_seats,
                "density": occupied_count / total_zone_seats, "seats": seats_list
            }

    if not zone_occupancy: return {"message": "No zones for suggestions.", "suggested_moves": []}
    sorted_zones = sorted(zone_occupancy.items(), key=lambda item: item[1]["density"])
    source_candidates = [z for z in sorted_zones if z[1]["occupied"] > 0 and z[1]["density"] < 0.6]
    target_candidates = [z for z in sorted_zones if z[1]["density"] < 0.9 and (z[1]["total"] - z[1]["occupied"]) > 0]

    if not source_candidates or not target_candidates:
        return {"message": "No suitable consolidation moves found.", "suggested_moves": []}

    source_zone_id, source_data = source_candidates[0]
    employee_to_move: Optional[Employee] = None
    current_seat_obj: Optional[Seat] = None
    for seat in source_data["seats"]:
        if seat.employee_id:
            emp = _get_employee_by_id(seat.employee_id)
            if emp: employee_to_move, current_seat_obj = emp, seat; break

    if not employee_to_move or not current_seat_obj:
        return {"message": "Could not identify employee to move.", "suggested_moves": []}

    new_seat_id_suggestion: Optional[str] = None
    target_zone_id_for_move: Optional[str] = None
    for tz_id, tz_data in reversed(target_candidates): # Prefer denser target zones
        if tz_id == source_zone_id: continue
        for seat in tz_data["seats"]:
            if seat.status == SeatStatus.UNOCCUPIED:
                new_seat_id_suggestion, target_zone_id_for_move = seat.seat_id, tz_id; break
        if new_seat_id_suggestion: break

    if employee_to_move and new_seat_id_suggestion and current_seat_obj.seat_id != new_seat_id_suggestion:
        vacated_ac, vacated_lights = [], []
        if source_data["occupied"] == 1: # Last person in zone
            vacated_ac.append(source_zone_id); vacated_lights.append(source_zone_id)
        return {
            "message": f"Consider moving {employee_to_move.name} from {current_seat_obj.seat_id} (in {source_zone_id}) to {new_seat_id_suggestion} (in {target_zone_id_for_move}) for energy efficiency.",
            "suggested_moves": [(employee_to_move.id, new_seat_id_suggestion)],
            "estimated_energy_saving_kwh": round(random.uniform(0.7, 2.8), 2),
            "vacated_zones_lights_off": vacated_lights, "vacated_zones_ac_off": vacated_ac
        }
    return {"message": "Office layout reasonably optimized.", "suggested_moves": []}

# --- Re-enable initial data population calls at module level, with prints ---
_initial_refresh = True
if not USE_DATABASE_SWITCH:
    print("DEBUG: data_generation_service: Module level populating employees (enhanced)...")
    get_mock_employees(refresh=_initial_refresh)
    print("DEBUG: data_generation_service: Module level populating seating (enhanced)...")
    get_mock_seating_arrangement_and_assign_employees(refresh=_initial_refresh)
    print("DEBUG: data_generation_service: Enhanced mock data population complete.")
else:
    print("DEBUG: data_generation_service: USE_DATABASE_SWITCH is True, skipping module level population.")

print("DEBUG: data_generation_service.py (enhanced version) loaded.")

```
