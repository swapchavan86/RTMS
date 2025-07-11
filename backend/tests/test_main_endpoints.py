from fastapi.testclient import TestClient

# client fixture is defined in conftest.py and automatically available
# mock_data_service fixture is also available if needed, but not for these basic tests

def test_read_root(client: TestClient):
    """
    Test the root endpoint of the API.
    """
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Renewable Energy Dashboard API"}

def test_openapi_docs_accessible(client: TestClient):
    """
    Test that the OpenAPI documentation (Swagger UI) is accessible.
    """
    response = client.get("/docs")
    assert response.status_code == 200
    # Check for a common string in the Swagger UI HTML title
    assert "<title>Renewable Energy Dashboard API - Swagger UI</title>" in response.text

def test_redoc_accessible(client: TestClient):
    """
    Test that the ReDoc documentation is accessible.
    """
    response = client.get("/redoc")
    assert response.status_code == 200
    # Check for a common string in the ReDoc HTML title
    assert "ReDoc" in response.text