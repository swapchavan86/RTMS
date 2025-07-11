from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

print("DEBUG: main.py - Top of file")

app = FastAPI(title="Renewable Energy Dashboard API")
print("DEBUG: main.py - FastAPI app created")

# Allow CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Adjust if your frontend runs on a different port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    print("DEBUG: main.py - Root route / called")
    return {"message": "Welcome to the Renewable Energy Dashboard API"}

# Import routers
print("DEBUG: main.py - Importing routers...")
from .routes import energy_routes, employees_routes, seating_routes

app.include_router(employees_routes.router, prefix="/api/employees", tags=["Employees & Leaderboard"])
app.include_router(energy_routes.router, prefix="/api/energy", tags=["Energy Consumption"])
app.include_router(seating_routes.router, prefix="/api/seating", tags=["Seating Arrangement"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
