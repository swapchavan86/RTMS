from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
import datetime

class LaptopMode(str, Enum):
    LIGHT = "Light Mode"
    DARK = "Dark Mode"

class LaptopUsage(BaseModel):
    employee_id: str = Field(..., example="emp001")
    hours_on: float = Field(..., gt=0, example=8.5)
    mode: LaptopMode = Field(LaptopMode.LIGHT)
    # Potential future fields:
    # average_cpu_usage: Optional[float] = Field(None, ge=0, le=100)
    # energy_consumed_wh: Optional[float] = Field(None, gt=0)

class LightState(str, Enum):
    ON = "ON"
    OFF = "OFF"

class LightingZone(BaseModel):
    zone_id: str = Field(..., example="ZoneA-North")
    status: LightState = Field(LightState.OFF)
    # Potential future fields:
    # brightness_level: Optional[int] = Field(None, ge=0, le=100) # Percentage
    # last_changed: Optional[datetime.datetime] = None

class HvacStatus(str, Enum):
    ON = "ON"
    OFF = "OFF"
    ECO = "ECO" # Eco mode

class HvacZone(BaseModel):
    zone_id: str = Field(..., example="Floor1-West")
    status: HvacStatus = Field(HvacStatus.OFF)
    current_temp_celsius: Optional[float] = Field(None, example=22.5)
    set_point_celsius: Optional[float] = Field(None, example=24.0)
    # Potential future fields:
    # fan_speed: Optional[str] = Field(None, example="Auto") # Low, Medium, High, Auto

class ProjectorUsage(BaseModel):
    room_id: str = Field(..., example="MeetingRoom101")
    hours_on: float = Field(..., ge=0, example=2.0)
    status: LightState = Field(LightState.OFF) # ON or OFF

class EnergyComponentData(BaseModel):
    component_name: str # e.g., "Laptop Usage", "Lighting - Zone A"
    usage_metric: str # e.g., "Hours", "kWh"
    current_value: float
    trend: Optional[str] = None # e.g., "up", "down", "stable"
    recommendation: Optional[str] = None

class OverallEnergySummary(BaseModel):
    total_consumption_kwh_today: float
    comparison_yesterday_percentage: float # e.g., -5.2 means 5.2% less than yesterday
    main_contributors: List[EnergyComponentData]
```
