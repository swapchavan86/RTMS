from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any # Changed from List to Dict for top-level structure

from ..models.seating_models import SeatingArrangement, SeatingSuggestion #, SeatingZone, Seat
from ..services import data_generation_service

router = APIRouter()

def get_data_service():
    return data_generation_service

@router.get("/arrangement/", response_model=SeatingArrangement, summary="Get current seating arrangement")
async def get_seating_arrangement_data(service = Depends(get_data_service)):
    """
    Retrieve the current mock seating arrangement for the office,
    including zone details, seat statuses, and occupancy counts.
    """
    if service.USE_DATABASE_SWITCH:
        raise HTTPException(status_code=501, detail="Database connection not implemented yet.")
    else:
        # The service now returns a dict that should match SeatingArrangement
        raw_arrangement_data = service.get_mock_seating_arrangement_and_assign_employees()
        # Pydantic will validate this structure against the SeatingArrangement model
        return SeatingArrangement(**raw_arrangement_data)


@router.get("/suggestions/", response_model=SeatingSuggestion, summary="Get seating optimization suggestions")
async def get_seating_suggestions_data(service = Depends(get_data_service)):
    """
    Retrieve mock suggestions for optimizing seating arrangements to save energy.
    This is a simplified mock endpoint.
    """
    if service.USE_DATABASE_SWITCH:
        raise HTTPException(status_code=501, detail="Database connection not implemented yet.")
    else:
        suggestion_data = service.get_mock_seating_suggestions()
        return SeatingSuggestion(**suggestion_data)

# Potential future endpoint to update a seat status (e.g., when an employee moves)
# @router.post("/update-seat/{seat_id}", summary="Update status of a seat")
# async def update_seat_status(seat_id: str, new_status: str, employee_id: str = None, service = Depends(get_data_service)):
#     if service.USE_DATABASE_SWITCH:
#         raise HTTPException(status_code=501, detail="Not implemented")
#     else:
#         # Logic to find and update the seat in mock data
#         # This would be more complex, involving finding the seat in the nested structure
#         # and potentially updating employee records.
#         # For now, just a placeholder.
#         updated = service.update_mock_seat_status(seat_id, new_status, employee_id)
#         if updated:
#             return {"message": f"Seat {seat_id} updated to {new_status}"}
#         else:
#             raise HTTPException(status_code=404, detail=f"Seat {seat_id} not found or update failed.")
#     pass
```
