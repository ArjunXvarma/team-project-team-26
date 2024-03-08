from app import models, app, db
from datetime import datetime, timedelta
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


class TestMembershipRoutes:
    """Class for testing membership routes functionality.""" 
    # Tests for buying the membership

    def test_buy_membership_success(self, client, app, clean_db):
        """Test buying a membership successfully."""
        # Creation of an user
        user = models.User(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            date_of_birth=datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add(user)
        clean_db.session.commit()

        # Login as the user
        login_response = client.post("/login", json={
            "email": "john.doe@example.com",
            "password": "password"
        })
        token = login_response.json['session_token']

        # Attempt to buy a membership
        response = client.post("/buy_membership", json={
            "membership_type": "Basic",
            "duration": "Monthly",
            "mode_of_payment": "Credit Card"
        }, headers={"Authorization": f"Bearer {token}"})
        
        assert response.status_code == 200
        assert response.json['return_code'] == 1
        assert response.json['message'] == "Membership purchased successfully"

    def test_buy_membership_missing_fields(self, client, app, clean_db):
        """Test buying a membership with missing fields."""
        # First, create a user
        user = models.User(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            date_of_birth=datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add(user)
        clean_db.session.commit()

        # Login as the user
        login_response = client.post("/login", json={
            "email": "john.doe@example.com",
            "password": "password"
        })
        token = login_response.json['session_token']

        # Attempt to buy a membership with missing fields
        response = client.post("/buy_membership", json={
            "membership_type": "Basic",
            # Missing 'duration' and 'mode_of_payment'
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 400
        assert response.json['return_code'] == 0
        assert response.json['error'] == "Missing Required Fields"

    def test_buy_membership_invalid_duration(self, client, app, clean_db):
        """Test buying a membership with an invalid duration."""
        # First, create a user
        user = models.User(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            date_of_birth=datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add(user)
        clean_db.session.commit()

        # Login as the user
        login_response = client.post("/login", json={
            "email": "john.doe@example.com",
            "password": "password"
        })
        token = login_response.json['session_token']

        # Attempt to buy a membership with an invalid duration
        response = client.post("/buy_membership", json={
            "membership_type": "Basic",
            "duration": "InvalidDuration",
            "mode_of_payment": "Credit Card"
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 400
        assert response.json['return_code'] == 0
        assert response.json['error'] == "Invalid duration"

    def test_buy_membership_invalid_mode_of_payment(self, client, app, clean_db):
        """Test buying a membership with an invalid mode of payment."""
        # First, create a user
        user = models.User(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            date_of_birth=datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add(user)
        clean_db.session.commit()

        # Login as the user
        login_response = client.post("/login", json={
            "email": "john.doe@example.com",
            "password": "password"
        })
        token = login_response.json['session_token']

        # Attempt to buy a membership with an invalid mode of payment
        response = client.post("/buy_membership", json={
            "membership_type": "Basic",
            "duration": "Monthly",
            "mode_of_payment": "InvalidModeOfTransaction"  # Invalid mode of payment
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 400
        assert response.json['return_code'] == 0
        assert response.json['error'] == "Invalid mode of payment"

    def test_buy_membership_invalid_membership_type(self, client, app, clean_db):
        """Test buying a membership with an invalid membership type."""
        # First, create a user
        user = models.User(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            date_of_birth=datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add(user)
        clean_db.session.commit()

        # Login as the user
        login_response = client.post("/login", json={
            "email": "john.doe@example.com",
            "password": "password"
        })
        token = login_response.json['session_token']

        # Attempt to buy a membership with an invalid membership type
        response = client.post("/buy_membership", json={
            "membership_type": "InvalidType",
            "duration": "Monthly",
            "mode_of_payment": "Credit Card"
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 400
        assert response.json['return_code'] == 0
        assert response.json['error'] == "Invalid membership type"

    # Tests for cancelling the membership
    def test_cancel_membership_before_end_date(self, client, app, clean_db):
        """Test canceling a membership before end date."""
        # First, create a user and a membership
        user = models.User(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            date_of_birth=datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add(user)
        clean_db.session.commit()

        # Create a membership for the user
        membership = models.Membership(
            user_id=user.id,
            membership_type="Basic",
            duration="Monthly",
            start_date=datetime.utcnow() - timedelta(days=30),
            end_date=datetime.utcnow() + timedelta(days=30),
            mode_of_payment="Credit Card",
            is_active=True,
            auto_renew=True,
        )
        clean_db.session.add(membership)
        clean_db.session.commit()
        
        # Login as the user
        login_response = client.post("/login", json={
            "email": "john.doe@example.com",
            "password": "password"
        })
        token = login_response.json['session_token']
        # Attempt to cancel the membership
        response = client.delete("/cancel_membership", headers={"Authorization": f"Bearer {token}"})
        
        assert response.status_code == 200
        assert response.json['return_code'] == 1
        assert "Auto-renew disabled successfully." in response.json['message']
        
        
            # Fetch the membership after cancellation
        cancelled_membership = models.Membership.query.filter_by(user_id=user.id).first()
    
        # Assert that the auto-renewal is set to false
        assert cancelled_membership.auto_renew == False
        
        # Assert that the membership is still activated.
        assert cancelled_membership.is_active == True
    
    
    def test_cancel_membership_on_end_date(self, client, app, clean_db):
        """Test canceling a membership on the end date."""
        # First, create a user and a membership
        user = models.User(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            date_of_birth=datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add(user)
        clean_db.session.commit()

        # Create a membership for the user
        membership = models.Membership(
            user_id=user.id,
            membership_type="Basic",
            duration="Monthly",
            start_date=datetime.utcnow() - timedelta(days=30),
            end_date=datetime.utcnow(), # Current date
            mode_of_payment="Credit Card",
            is_active=True,
            auto_renew=True,
        )
        clean_db.session.add(membership)
        clean_db.session.commit()
        
        # Login as the user
        login_response = client.post("/login", json={
            "email": "john.doe@example.com",
            "password": "password"
        })
        token = login_response.json['session_token']
        # Attempt to cancel the membership
        response = client.delete("/cancel_membership", headers={"Authorization": f"Bearer {token}"})
        
        assert response.status_code == 200
        assert response.json['return_code'] == 1
        assert "Membership cancelled and auto-renew disabled successfully." in response.json['message']

        # Fetch the membership after cancellation
        cancelled_membership = models.Membership.query.filter_by(user_id=user.id).first()
    
        # Assert that the membership and auto-renewal are actually set to false
        assert cancelled_membership.is_active == False
        assert cancelled_membership.auto_renew == False
    
    def test_cancel_membership_no_active_membership(self, client, clean_db):
        """Test cancelling membership when no active membership exists."""
        # First, create a user
        user = models.User(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            date_of_birth=datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add(user)
        clean_db.session.commit()

        # Login as the user
        login_response = client.post("/login", json={
            "email": "john.doe@example.com",
            "password": "password"
        })
        token = login_response.json['session_token']

        # Attempt to cancel the membership
        response = client.delete("/cancel_membership", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 404
        assert response.json['return_code'] == 0
        assert "User does not have an active membership" in response.json['error']
    