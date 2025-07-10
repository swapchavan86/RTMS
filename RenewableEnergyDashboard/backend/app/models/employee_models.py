from pydantic import BaseModel, Field
from typing import Optional

class EmployeeBase(BaseModel):
    id: str = Field(..., example="emp001")
    name: str = Field(..., example="John Doe")
    department: Optional[str] = Field(None, example="Engineering")
    current_seat_id: Optional[str] = Field(None, example="A101")

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    awe_points: int = Field(0, example=120)

    class Config:
        orm_mode = True # For potential future SQLAlchemy integration
        # In Pydantic v2, orm_mode is replaced by from_attributes = True
        # from_attributes = True # Uncomment for Pydantic v2 if using ORM features

class LeaderboardEntry(BaseModel):
    rank: int
    employee_id: str
    name: str
    awe_points: int
    department: Optional[str] = None