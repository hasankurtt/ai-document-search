"""
Tests for room endpoints.
"""
import pytest


@pytest.fixture
def auth_headers(client):
    """Register a user and return auth headers."""
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "roomuser@example.com",
            "name": "Room User",
            "password": "password123",
        },
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "roomuser@example.com", "password": "password123"},
    )
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_room(client, auth_headers):
    """Authenticated user should be able to create a room."""
    response = client.post(
        "/api/v1/rooms",
        json={"name": "Test Room", "description": "A test room", "emoji": "📚"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Room"
    assert data["emoji"] == "📚"


def test_list_rooms_empty(client, auth_headers):
    """New user should have no rooms."""
    response = client.get("/api/v1/rooms", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


def test_list_rooms(client, auth_headers):
    """Should return created rooms."""
    client.post(
        "/api/v1/rooms",
        json={"name": "Room 1", "description": "First", "emoji": "📚"},
        headers=auth_headers,
    )
    response = client.get("/api/v1/rooms", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_get_room(client, auth_headers):
    """Should return a specific room by ID."""
    create = client.post(
        "/api/v1/rooms",
        json={"name": "My Room", "description": "desc", "emoji": "🚀"},
        headers=auth_headers,
    )
    room_id = create.json()["id"]
    response = client.get(f"/api/v1/rooms/{room_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == room_id


def test_get_room_not_found(client, auth_headers):
    """Non-existent room should return 404."""
    response = client.get("/api/v1/rooms/99999", headers=auth_headers)
    assert response.status_code == 404


def test_delete_room(client, auth_headers):
    """Should delete a room successfully."""
    create = client.post(
        "/api/v1/rooms",
        json={"name": "Delete Me", "description": "bye", "emoji": "🗑️"},
        headers=auth_headers,
    )
    room_id = create.json()["id"]
    response = client.delete(f"/api/v1/rooms/{room_id}", headers=auth_headers)
    assert response.status_code == 200

    get = client.get(f"/api/v1/rooms/{room_id}", headers=auth_headers)
    assert get.status_code == 404


def test_max_rooms_limit(client, auth_headers):
    """Should not allow more than MAX_ROOMS rooms per user."""
    for i in range(2):
        client.post(
            "/api/v1/rooms",
            json={"name": f"Room {i}", "description": "desc", "emoji": "📚"},
            headers=auth_headers,
        )
    response = client.post(
        "/api/v1/rooms",
        json={"name": "One Too Many", "description": "desc", "emoji": "📚"},
        headers=auth_headers,
    )
    assert response.status_code == 400


def test_rooms_unauthenticated(client):
    """Unauthenticated request should return 401."""
    response = client.get("/api/v1/rooms")
    assert response.status_code == 401