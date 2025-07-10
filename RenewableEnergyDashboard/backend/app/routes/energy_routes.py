from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any

# Assuming models are in ..models.energy_models
from ..models.energy_models import LaptopUsage, LightingZone, HvacZone # Add more as needed
from ..services import data_generation_service

router = APIRouter()

def get_data_service():
    return data_generation_service

@router.get("/laptop-usage/", response_model=List[LaptopUsage], summary="Get laptop usage data")
async def get_laptop_usage_data(service = Depends(get_data_service)):
    """
    Retrieve mock data for laptop usage across employees.
    Includes hours on and light/dark mode.
    """
    if service.USE_DATABASE_SWITCH:
        raise HTTPException(status_code=501, detail="Database connection not implemented yet.")
    else:
        # The service returns dicts, Pydantic will validate them against LaptopUsage model
        raw_data = service.get_mock_laptop_usage()
        return [LaptopUsage(**item) for item in raw_data]


@router.get("/lighting/", response_model=List[LightingZone], summary="Get lighting status for zones")
async def get_lighting_status_data(service = Depends(get_data_service)):
    """
    Retrieve mock data for lighting status in different office zones.
    """
    if service.USE_DATABASE_SWITCH:
        raise HTTPException(status_code=501, detail="Database connection not implemented yet.")
    else:
        raw_data = service.get_mock_lighting_status()
        # Manually create LightingZone objects if the service returns dicts
        # that don't perfectly match due to potential future fields in the model
        return [LightingZone(**item) for item in raw_data]


@router.get("/hvac/", response_model=List[HvacZone], summary="Get HVAC status for zones")
async def get_hvac_status_data(service = Depends(get_data_service)):
    """
    Retrieve mock data for HVAC (Air Conditioning/Heating) status in different office zones.
    """
    if service.USE_DATABASE_SWITCH:
        raise HTTPException(status_code=501, detail="Database connection not implemented yet.")
    else:
        raw_data = service.get_mock_hvac_status()
        # Manually create HvacZone objects
        return [HvacZone(**item) for item in raw_data]

# Example of a combined energy overview (conceptual)
# from ..models.energy_models import OverallEnergySummary, EnergyComponentData
# @router.get("/summary/", response_model=OverallEnergySummary, summary="Get overall energy summary")
# async def get_energy_summary(service = Depends(get_data_service)):
#     if service.USE_DATABASE_SWITCH:
#         raise HTTPException(status_code=501, detail="Not implemented")
#     else:
#         # This would require more sophisticated data aggregation in the service
        # main_contributors = [
        #     EnergyComponentData(component_name="Total Laptop Usage", usage_metric="Hours", current_value=sum(u['hours_on'] for u in service.get_mock_laptop_usage())),
        #     EnergyComponentData(component_name="Lights On (Zones)", usage_metric="Count", current_value=sum(1 for l in service.get_mock_lighting_status() if l['status'] == "ON")),
        # ]
        # return OverallEnergySummary(
        #     total_consumption_kwh_today=round(random.uniform(50, 200),2),
        #     comparison_yesterday_percentage=round(random.uniform(-10, 10),1),
        #     main_contributors=main_contributors
        # )
#     pass
```
