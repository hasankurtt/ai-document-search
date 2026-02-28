"""
Tests for health check and authentication endpoints.
"""


def test_health_check(client):
    """Health endpoint should return 200 and healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_register_success(client):
    """Valid registration should return 201 and user data."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "name": "Test User",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"
    assert "password" not in data
    assert "password_hash" not in data


def test_register_duplicate_email(client):
    """Registering with an existing email should return 400."""
    payload = {
        "email": "duplicate@example.com",
        "name": "User One",
        "password": "password123",
    }
    client.post("/api/v1/auth/register", json=payload)
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400


def test_register_invalid_email(client):
    """Invalid email format should return 422."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "not-an-email",
            "name": "Bad User",
            "password": "password123",
        },
    )
    assert response.status_code == 422


def test_login_success(client):
    """Valid credentials should return access and refresh tokens."""
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@example.com",
            "name": "Login User",
            "password": "mypassword123",
        },
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "mypassword123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_login_wrong_password(client):
    """Wrong password should return 401."""
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "wrongpass@example.com",
            "name": "Wrong Pass",
            "password": "correctpassword",
        },
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "wrongpass@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    """Login with non-existent email should return 401."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "ghost@example.com", "password": "password123"},
    )
    assert response.status_code == 401


def test_me_authenticated(client):
    """Authenticated user should get their profile."""
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "me@example.com",
            "name": "Me User",
            "password": "password123",
        },
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "me@example.com", "password": "password123"},
    )
    token = login.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["email"] == "me@example.com"


def test_me_unauthenticated(client):
    """Unauthenticated request to /me should return 401."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401