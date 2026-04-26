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
    # Arrange: (nothing to set up for this test)

    # Act
    response = client.get("/activities")

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data
    assert "participants" in data["Chess Club"]

def test_signup_success():
    # Arrange
    email = "test1@mergington.edu"
    activity = "Chess Club"

    # Act
    signup_response = client.post(f"/activities/{activity.replace(' ', '%20')}/signup?email={email}")

    # Assert
    assert signup_response.status_code == 200
    assert f"Signed up {email} for {activity}" in signup_response.json()["message"]

    # Act (fetch activities)
    activities_response = client.get("/activities")

    # Assert
    assert email in activities_response.json()[activity]["participants"]

def test_signup_duplicate():
    # Arrange
    email = "test2@mergington.edu"
    activity = "Chess Club"
    client.post(f"/activities/{activity.replace(' ', '%20')}/signup?email={email}")  # First signup

    # Act
    response = client.post(f"/activities/{activity.replace(' ', '%20')}/signup?email={email}")  # Duplicate signup

    # Assert
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]

def test_signup_nonexistent_activity():
    # Arrange
    email = "test3@mergington.edu"
    activity = "Nonexistent"

    # Act
    response = client.post(f"/activities/{activity}/signup?email={email}")

    # Assert
    assert response.status_code == 404
    assert "Activity not found" in response.json()["detail"]
