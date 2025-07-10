from fastapi import APIRouter, HTTPException, Depends
from typing import List

from ..models.employee_models import Employee, LeaderboardEntry
from ..services import data_generation_service # Using the new service

print("DEBUG: Loading employees_routes.py")
router = APIRouter()

# Dependency to get the data generation service (though it's globally managed for now)
# This structure is useful if the service had state or needed setup per request.
# For now, it's more of a pattern for future DB integration.
def get_data_service():
    return data_generation_service

@router.get("/", response_model=List[Employee], summary="Get all employees")
async def read_employees(skip: int = 0, limit: int = 100, service = Depends(get_data_service)):
    """
    Retrieve a list of all employees.
    Supports pagination via `skip` and `limit` query parameters.
    """
    print(f"DEBUG: employees_routes.py - / route called (skip={skip}, limit={limit})")
    if service.USE_DATABASE_SWITCH:
        # Replace with actual database query and logic
        raise HTTPException(status_code=501, detail="Database connection not implemented yet.")
    else:
        employees = service.get_mock_employees()
        return employees[skip : skip + limit]

@router.get("/{employee_id}", response_model=Employee, summary="Get a specific employee by ID")
async def read_employee(employee_id: str, service = Depends(get_data_service)):
    """
    Retrieve detailed information for a specific employee by their ID.
    """
    if service.USE_DATABASE_SWITCH:
        raise HTTPException(status_code=501, detail="Database connection not implemented yet.")
    else:
        employees = service.get_mock_employees()
        for emp in employees:
            if emp.id == employee_id:
                return emp
        raise HTTPException(status_code=404, detail="Employee not found")

@router.get("/leaderboard/", response_model=List[LeaderboardEntry], summary="Get employee leaderboard")
async def get_leaderboard(limit: int = 10, service = Depends(get_data_service)):
    """
    Retrieve the employee leaderboard, ranked by Awe Points.
    Shows top N employees, default is 10.
    """
    if service.USE_DATABASE_SWITCH:
        raise HTTPException(status_code=501, detail="Database connection not implemented yet.")
    else:
        leaderboard_data = service.get_mock_leaderboard()
        return leaderboard_data[:limit]

# Placeholder for future POST/PUT/DELETE operations if employee management is added
# @router.post("/", response_model=Employee, status_code=201)
# async def create_employee(employee_data: EmployeeCreate, service = Depends(get_data_service)):
#     if service.USE_DATABASE_SWITCH:
#         raise HTTPException(status_code=501, detail="Not implemented")
#     else:
#         # Basic mock creation:
#         new_id = f"emp{len(service.get_mock_employees()) + 1000}" # ensure unique enough for mock
#         new_employee = Employee(**employee_data.model_dump(), id=new_id, awe_points=0)
#         service._generated_employees.append(new_employee) # Accessing "private" for mock simplicity
#         return new_employee
