from app import models, app, db
from datetime import datetime
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
import pytest

# Initialize bcrypt
bcrypt = Bcrypt(app)



class TestSignup:
    """Class for testing user signup functionality."""

    def test_user_does_not_exist(self, client, app):
        """Test signup for a user who does not already exist."""
        response = client.post("/signup", json={
            "first_name": "Peter",
            "last_name": "Parker",
            "email": "peter.parker@gmail.com",
            "date_of_birth": "2002-02-19",
            "password": "peter"
        })
        assert response.status_code == 200
        assert response.json['id'] == 1
        assert response.json['name'] == "Peter Parker"
        assert response.json['return_code'] == 1
        with app.app_context():
            assert models.User.query.count() == 1
            assert models.User.query.first().first_name == "Peter"
            assert models.User.query.first().last_name == "Parker"
            assert models.User.query.first().email == "peter.parker@gmail.com"
            assert models.User.query.first().date_of_birth == datetime(2002, 2, 19, 0, 0)

    def test_existing_user(self, client, clean_db):
        """Test signup for a user who already exists."""
        existing_user = models.User(
            first_name="Peter",
            last_name="Parker",
            email="peter.parker@gmail.com",
            date_of_birth=datetime(2002, 2, 19),
            hashed_password=bcrypt.generate_password_hash("random_pass").decode("utf-8")
        )
        clean_db.session.add(existing_user)
        clean_db.session.commit()

        response = client.post("/signup", json={
            "first_name": "Peter",
            "last_name": "Parker",
            "email": "peter.parker@gmail.com",
            "date_of_birth": "2002-02-19",
            "password": "peter"
        })

        assert response.status_code == 409
        assert response.json['error'] == 'User Already Exists'
        assert response.json['return_code'] == 0

    def test_user_invalid_parameters(self, client, clean_db):
        """Test signup with invalid parameters."""
        response = client.post("/signup", json={
            "first_name": "Peter",
            "last_name": "Parker",
            "date_of_birth": "2002-02-19",
            "password": "peter"
        })

        assert response.status_code == 400
        assert response.json['error'] == "Missing Required Fields"
        assert response.json['return_code'] == 0
        assert clean_db.session.query(models.User).count() == 0


class TestLogin:
    """Class for testing user login functionality."""

    def test_correct_credentials(self, client):
        """Test login with correct credentials."""
        client.post("/signup", json={
            "first_name": "Peter",
            "last_name": "Parker",
            "email": "peter.parker@gmail.com",
            "date_of_birth": "2002-02-19",
            "password": "peter"
        })

        response = client.post("/login", json={
            "email": "peter.parker@gmail.com",
            "password": "peter"
        })

        assert response.status_code == 200
        assert response.json['name'] == "Peter Parker"
        assert response.json['return_code'] == 2

    def test_incorrect_password(self, client):
        """Test login with incorrect password."""
        client.post("/signup", json={
            "first_name": "Peter",
            "last_name": "Parker",
            "email": "peter.parker@gmail.com",
            "date_of_birth": "2002-02-19",
            "password": "peter"
        })

        response = client.post("/login", json={
            "email": "peter.parker@gmail.com",
            "password": "peterparker"
        })

        assert response.status_code == 401
        assert response.json['error'] == "Incorrect password, please try again"
        assert response.json['return_code'] == 1

    def test_incorrect_email(self, client):
        """Test login with incorrect email."""
        client.post("/signup", json={
            "first_name": "Peter",
            "last_name": "Parker",
            "email": "peter.parker@gmail.com",
            "date_of_birth": "2002-02-19",
            "password": "peter"
        })

        response = client.post("/login", json={
            "email": "peter.parker.wrong.mail@gmail.com",
            "password": "peterparker"
        })

        assert response.status_code == 404
        assert response.json['error'] == "User Not found with the given Email"
        assert response.json['return_code'] == 0


class TestGPSRoutes:
    """Class for testing GPS routes functionality."""

    def test_get_journies_without_jwt(self, client):
        """Test getting user journies without a JWT."""
        response = client.get("/get_journies_of_user")
        assert response.status_code == 401  # Expecting Unauthorized access

    
    def test_create_journey_without_jwt(self, client):
        """Test creating a journey without a JWT."""
        journey_data = {
            "id": 1,
            "userId": 1,
            "gpxData": "{ \"coordinates\": [[1, 70], [20, 80], [3, 20]] }",
            "startTime": "21:00:00",
            "endTime": "23:00:00",
            "dateCreated": "15-09-2025"
        }
        response = client.post("/create_journey", json=journey_data)
        assert response.status_code == 401

    
    def test_delete_journey_without_jwt(self, client):
        """Test deleting a journey without a JWT."""
        response = client.delete("/delete_journey/1")
        assert response.status_code == 401

    
    def test_update_journey_without_jwt(self, client):
        """Test updating a journey without a JWT."""
        journey_update_data = {
            "gpxData": "{ \"coordinates\": [[10, 7], [2, 8], [30, 2]] }",
            "startTime": "10:00:00",
            "endTime": "11:00:00",
            "dateCreated": "2023-02-01"
        }
        response = client.put("/update_journey/1", json=journey_update_data)
        assert response.status_code == 401