from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional, Tuple

class SeatStatus(str, Enum):
    OCCUPIED = "occupied"
    UNOCCUPIED = "unoccupied"
    RESERVED = "reserved" # Could be for new employees, temporary assignments
    DISABLED = "disabled" # Not usable

class Seat(BaseModel):
    seat_id: str = Field(..., example="A101") # e.g., "A1-R1-S1" (Area1-Row1-Seat1) or "Desk101"
    status: SeatStatus = Field(SeatStatus.UNOCCUPIED)
    employee_id: Optional[str] = Field(None, example="emp001") # If occupied
    # position: Tuple[int, int] # (row, col) for grid layout visualization

class SeatingZone(BaseModel):
    zone_id: str = Field(..., example="Floor1-NorthWing")
    description: Optional[str] = None
    # Example: define grid dimensions for visualization
    grid_rows: int = Field(..., example=10) # Number of rows in this zone
    grid_cols: int = Field(..., example=10) # Number of columns in this zone
    seats: List[Seat] # A flat list of seats; their seat_id or an additional position field can map to grid

class SeatingArrangement(BaseModel):
    zones: List[SeatingZone]
    total_seats: int
    occupied_seats: int
    unoccupied_seats: int

class SeatingSuggestion(BaseModel):
    message: str
    suggested_moves: List[Tuple[str, str]] = Field(default_factory=list) # List of (employee_id, new_seat_id)
    estimated_energy_saving_kwh: Optional[float] = None
    vacated_zones_lights_off: List[str] = Field(default_factory=list) # Zones where lights can be turned off
    vacated_zones_ac_off: List[str] = Field(default_factory=list) # Zones where AC can be turned off