import pytest
from fastapi.testclient import TestClient
from src.app import app, activities

@pytest.fixture(autouse=True)
def reset_activities():
    # Reset the in-memory DB before each test
    for activity in activities.values():
        if isinstance(activity.get("participants"), list):
            activity["participants"] = []
        else:
            activity["participants"] = []

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data
    assert "participants" in data["Chess Club"]

def test_signup_success():
    response = client.post("/activities/Chess%20Club/signup?email=test1@mergington.edu")
    assert response.status_code == 200
    assert "Signed up test1@mergington.edu for Chess Club" in response.json()["message"]
    # Check participant added
    response = client.get("/activities")
    assert "test1@mergington.edu" in response.json()["Chess Club"]["participants"]

def test_signup_duplicate():
    # First signup
    client.post("/activities/Chess%20Club/signup?email=test2@mergington.edu")
    # Duplicate signup
    response = client.post("/activities/Chess%20Club/signup?email=test2@mergington.edu")
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]

def test_signup_nonexistent_activity():
    response = client.post("/activities/Nonexistent/signup?email=test3@mergington.edu")
    assert response.status_code == 404
    assert "Activity not found" in response.json()["detail"]
