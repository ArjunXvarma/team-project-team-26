from app import models, app, db
from datetime import datetime, timedelta
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
import pytest
import constants
from app.resources import GPSRoutes
from revenuePrediction import generateFutureRevenueData

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

    def test_validate_points(self):
        points_valid = [
            {'lat': 10, 'lon': 20, 'ele': 5},
            {'lat': 15, 'lon': 25, 'ele': 10}
        ]
        assert GPSRoutes.validate_points(points_valid)[0] == True

    def validate_points_missing_keys(self):
        points_missing_key = [
            {'lat': 10, 'lon': 20, 'ele': 5},
            {'lat': 15, 'lon': 25}
        ]
        assert GPSRoutes.validate_points(points_missing_key)[0] == False

    def validate_points_extra_keys(self):
        points_extra_key = [
            {'lat': 10, 'lon': 20, 'ele': 5},
            {'lat': 15, 'lon': 25, 'ele': 10, 'temp': 50}
        ]
        assert GPSRoutes.validate_points(points_extra_key)[0] == False

    def validate_points_missing_and_extra_keys(self):
        points_missing_and_extra_keys = [
            {'lat': 10, 'lon': 20, 'ele': 5},
            {'lat': 15, 'temp': 50}
        ]
        assert GPSRoutes.validate_points(points_missing_and_extra_keys)[0] == False

    def validate_points_empty(self):
        points_empty = []
        assert GPSRoutes.validate_points(points_empty)[0] == False

    def validate_points_different_order(self):
        points_different_order = [
            {'ele': 5, 'lon': 20, 'lat': 10}
        ]
        assert GPSRoutes.validate_points(points_different_order)[0] == True


    def test_validate_points(self):
        points_valid = [
            {'lat': 10, 'lon': 20, 'ele': 5},
            {'lat': 15, 'lon': 25, 'ele': 10}
        ]
        assert GPSRoutes.validate_points(points_valid)[0] == True

    def validate_points_missing_keys(self):
        points_missing_key = [
            {'lat': 10, 'lon': 20, 'ele': 5},
            {'lat': 15, 'lon': 25}
        ]
        assert GPSRoutes.validate_points(points_missing_key)[0] == False

    def validate_points_extra_keys(self):
        points_extra_key = [
            {'lat': 10, 'lon': 20, 'ele': 5},
            {'lat': 15, 'lon': 25, 'ele': 10, 'temp': 50}
        ]
        assert GPSRoutes.validate_points(points_extra_key)[0] == False

    def validate_points_missing_and_extra_keys(self):
        points_missing_and_extra_keys = [
            {'lat': 10, 'lon': 20, 'ele': 5},
            {'lat': 15, 'temp': 50}
        ]
        assert GPSRoutes.validate_points(points_missing_and_extra_keys)[0] == False

    def validate_points_empty(self):
        points_empty = []
        assert GPSRoutes.validate_points(points_empty)[0] == False

    def validate_points_different_order(self):
        points_different_order = [
            {'ele': 5, 'lon': 20, 'lat': 10}
        ]
        assert GPSRoutes.validate_points(points_different_order)[0] == True


    def test_get_journies_without_jwt(self, client):
        """Test getting user journies without a JWT."""
        response = client.get("/get_journeys_of_user")
        assert response.status_code == 401


    def test_get_journeys_with_jwt_success(self, client, clean_db):
        """Test successfully getting user journeys."""

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
        # Get token
        token = login_response.json['session_token']

        # Create a Journey to test with
        journey_data = {
            "name": "Morning Run",
            "type": "Running",
            "totalDistance": 5.0,
            "elevation": {
                "avg": 120,
                "min": 100,
                "max": 140
            },
            "points": [
                {"lat": 38.5, "lon": -120.2, "ele": 100},
                {"lat": 38.6, "lon": -120.3, "ele": 110}
            ],
            "startTime": "07:30:00",
            "endTime": "08:15:00",
            "dateCreated": "2024-03-12"
        }
        r1 = client.post("/create_journey", json=journey_data, headers={"Authorization": f"Bearer {token}"})

        # Test if journey is returned successfuly
        response = client.get("/get_journeys_of_user", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200



    def test_get_journeys_with_no_journeys(self, client, clean_db):
        """ Test Error handling when getting a journey from an empty list"""

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

        # Get token
        token = login_response.json['session_token']

        # Test getting a journey when none exist
        response = client.get("/get_journeys_of_user", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 404



    def test_create_journey_without_jwt(self, client):
        """Test creating a journey without a JWT."""

        # journey to be added
        journey_data = {
            "id": 1,
            "userId": 1,
            "gpxData": "{ \"coordinates\": [[1, 70], [20, 80], [3, 20]] }",
            "startTime": "21:00:00",
            "endTime": "23:00:00",
            "dateCreated": "15-09-2025"
        }

        # if there is a missing token, dont make journey
        response = client.post("/create_journey", json=journey_data)
        assert response.status_code == 401


    def test_delete_journey_without_jwt(self, client):
        """Test deleting a journey without a JWT."""

        response = client.delete("/delete_journey/1")
        assert response.status_code == 401


    def test_delete_journey_with_jwt(self, client, clean_db):
        """Test deleting a journey with a JWT."""

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

        # Get token
        token = login_response.json['session_token']

        # Add a journey before deleting one
        journey_data = {
            "name": "Morning Run",
            "type": "Running",
            "totalDistance": 5.0,
            "elevation": {
                "avg": 120,
                "min": 100,
                "max": 140
            },
            "points": [
                {"lat": 38.5, "lon": -120.2, "ele": 100},
                {"lat": 38.6, "lon": -120.3, "ele": 110}
            ],
            "startTime": "07:30:00",
            "endTime": "08:15:00",
            "dateCreated": "2024-03-12"
        }

        r1 = client.post("/create_journey", json=journey_data, headers={"Authorization": f"Bearer {token}"})

        # Test if journey is sucessfully deleted
        response = client.delete("/delete_journey/1", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200


    def test_delete_journey_non_existing_journey(self, client, clean_db):
        """Test deleting a journey that doesn't exist."""

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

        # Get token
        token = login_response.json['session_token']

        # Test if the program handles deleting a non existing journey successfully
        response = client.delete("/delete_journey/1", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 404


    def test_update_journey_without_jwt(self, client):
        """Test updating a journey without a JWT."""

        # fields to be updated
        journey_update_data = {
            "startTime": "10:00:00",
            "endTime": "11:00:00",
            "dateCreated": "2023-02-01"
        }

        # Test if attempting to update a journey without a token is handled correctly
        response = client.put("/update_journey/1", json=journey_update_data)
        assert response.status_code == 401

    def test_validate_points(self):
        points_valid = [
            {'lat': 10, 'lon': 20, 'ele': 5},
            {'lat': 15, 'lon': 25, 'ele': 10}
        ]
        assert GPSRoutes.validate_points(points_valid)[0] == True

    def validate_points_missing_keys(self):
        points_missing_key = [
            {'lat': 10, 'lon': 20, 'ele': 5},
            {'lat': 15, 'lon': 25}
        ]
        assert GPSRoutes.validate_points(points_missing_key)[0] == False

    def validate_points_extra_keys(self):
        points_extra_key = [
            {'lat': 10, 'lon': 20, 'ele': 5},
            {'lat': 15, 'lon': 25, 'ele': 10, 'temp': 50}
        ]
        assert GPSRoutes.validate_points(points_extra_key)[0] == False

    def validate_points_missing_and_extra_keys(self):
        points_missing_and_extra_keys = [
            {'lat': 10, 'lon': 20, 'ele': 5},
            {'lat': 15, 'temp': 50}
        ]
        assert GPSRoutes.validate_points(points_missing_and_extra_keys)[0] == False

    def validate_points_empty(self):
        points_empty = []
        assert GPSRoutes.validate_points(points_empty)[0] == False

    def validate_points_different_order(self):
        points_different_order = [
            {'ele': 5, 'lon': 20, 'lat': 10}
        ]
        assert GPSRoutes.validate_points(points_different_order)[0] == True

class TestMembershipRoutes:
    """Class for testing membership routes functionality."""
    # Tests for buying the membership

    def test_buy_membership_success(self, client, clean_db):
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
            "membership_type": constants.MembershipType.BASIC.value,
            "duration": constants.MembershipDuration.MONTHLY.value,
            "mode_of_payment": constants.PaymentMethod.APPLE_PAY.value
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        assert response.json['return_code'] == 1
        assert response.json['message'] == "Membership purchased successfully"

        # Fetch the membership after purchasing it.
        purchased_membership = models.Membership.query.filter_by(user_id=user.id).first()

        # Assert that the membership and auto-renewal are actually set to True
        assert purchased_membership.is_active == True
        assert purchased_membership.auto_renew == True

    def test_buy_membership_missing_fields(self, client, clean_db):
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
            "membership_type": constants.MembershipType.BASIC.value,
            # Missing 'duration' and 'mode_of_payment'
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 400
        assert response.json['return_code'] == 0
        assert response.json['error'] == "Missing Required Fields"

        # Fetch the membership details.
        membership_details = models.Membership.query.filter_by(user_id=user.id).first()

        # Assert that the membership is None and does not exist.
        assert membership_details == None

    def test_buy_membership_invalid_duration(self, client, clean_db):
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
            "membership_type": constants.MembershipType.BASIC.value,
            "duration": "InvalidDuration",
            "mode_of_payment": constants.PaymentMethod.APPLE_PAY.value
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 400
        assert response.json['return_code'] == 0
        assert response.json['error'] == "Invalid duration"

        # Fetch the membership details.
        membership_details = models.Membership.query.filter_by(user_id=user.id).first()

        # Assert that the membership is None and does not exist.
        assert membership_details == None

    def test_buy_membership_invalid_mode_of_payment(self, client, clean_db):
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
            "membership_type": constants.MembershipType.BASIC.value,
            "duration": constants.MembershipDuration.MONTHLY.value,
            "mode_of_payment": "InvalidModeOfTransaction"  # Invalid mode of payment
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 400
        assert response.json['return_code'] == 0
        assert response.json['error'] == "Invalid mode of payment"

        # Fetch the membership details.
        membership_details = models.Membership.query.filter_by(user_id=user.id).first()

        # Assert that the membership is None and does not exist.
        assert membership_details == None

    def test_buy_membership_invalid_membership_type(self, client, clean_db):
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
            "duration": constants.MembershipDuration.MONTHLY.value,
            "mode_of_payment": constants.PaymentMethod.APPLE_PAY.value
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 400
        assert response.json['return_code'] == 0
        assert response.json['error'] == "Invalid membership type"

        # Fetch the membership details.
        membership_details = models.Membership.query.filter_by(user_id=user.id).first()

        # Assert that the membership is None and does not exist.
        assert membership_details == None

    # Tests for cancelling the membership
    def test_cancel_membership_before_end_date(self, client, clean_db):
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
            membership_type=constants.MembershipType.PREMIUM.value,
            duration=constants.MembershipDuration.MONTHLY.value,
            start_date=datetime.utcnow() - timedelta(days=30),
            end_date=datetime.utcnow() + timedelta(days=30),
            mode_of_payment=constants.PaymentMethod.APPLE_PAY.value,
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

    def test_cancel_membership_on_end_date(self, client, clean_db):
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
            membership_type=constants.MembershipType.STANDARD.value,
            duration=constants.MembershipDuration.MONTHLY.value,
            start_date=datetime.utcnow() - timedelta(days=30),
            end_date=datetime.utcnow(), # Current date
            mode_of_payment=constants.PaymentMethod.APPLE_PAY.value,
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

class TestFriendshipRoutes:
    """Class for testing friendship routes functionality."""

    def test_send_friend_request_success(self, client, clean_db):
        """Test sending a friend request successfully."""
        # Create two users
        user1 = models.User(
            first_name="Alice",
            last_name="Smith",
            email="alice@example.com",
            date_of_birth=datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        user2 = models.User(
            first_name="Bob",
            last_name="Johnson",
            email="bob@example.com",
            date_of_birth=datetime(1991, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add_all([user1, user2])
        clean_db.session.commit()

        # Login as user1
        login_response = client.post("/login", json={
            "email": "alice@example.com",
            "password": "password"
        })
        token = login_response.json['session_token']

        # Attempt to send a friend request from user1 to user2
        response = client.post("/send_friend_request", json={"email": "bob@example.com"}, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        assert response.json['message'] == "Friend request sent successfully"

        # Check if the friend request is created in the database
        friend_request = models.Friendship.query.filter_by(requester_id=user1.id, addressee_id=user2.id).first()
        assert friend_request is not None
        assert friend_request.status == "pending"

    def test_send_friend_request_to_nonexistent_user(self, client, clean_db):
        """Test sending a friend request to a non-existent user."""
        # Create a user
        user = models.User(
            first_name="Alice",
            last_name="Smith",
            email="alice@example.com",
            date_of_birth=datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add(user)
        clean_db.session.commit()

        # Login as user
        login_response = client.post("/login", json={
            "email": "alice@example.com",
            "password": "password"
        })
        token = login_response.json['session_token']

        # Attempt to send a friend request to a non-existent user
        response = client.post("/send_friend_request", json={"email": "nonexistent@example.com"}, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 404
        assert response.json['error'] == "Addressee not found"

    def test_send_friend_request_to_self(self, client, clean_db):
        """Test sending a friend request to oneself."""
        # Create a user
        user = models.User(
            first_name="Alice",
            last_name="Smith",
            email="alice@example.com",
            date_of_birth=datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add(user)
        clean_db.session.commit()

        # Login as user
        login_response = client.post("/login", json={
            "email": "alice@example.com",
            "password": "password"
        })
        token = login_response.json['session_token']

        # Attempt to send a friend request to oneself
        response = client.post("/send_friend_request", json={"email": "alice@example.com"}, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 400
        assert response.json['error'] == "Cannot send friend request to yourself"

    def test_accept_friend_request_success(self, client, clean_db):
        """Test accepting a friend request successfully."""
        # Create two users
        user1 = models.User(
            first_name="Alice",
            last_name="Smith",
            email="alice@example.com",
            date_of_birth=datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        user2 = models.User(
            first_name="Bob",
            last_name="Johnson",
            email="bob@example.com",
            date_of_birth=datetime(1991, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add_all([user1, user2])
        clean_db.session.commit()

        # Create a friend request from user1 to user2
        friendship_request = models.Friendship(requester_id=user1.id, addressee_id=user2.id)
        clean_db.session.add(friendship_request)
        clean_db.session.commit()

        # Login as user2
        login_response = client.post("/login", json={
            "email": "bob@example.com",
            "password": "password"
        })
        token = login_response.json['session_token']

        # Attempt to accept the friend request
        response = client.post("/accept_friend_request", json={"email": "alice@example.com"}, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        assert response.json['message'] == "Friend request accepted"

        # Check if the friend request is updated in the database
        updated_friend_request = models.Friendship.query.filter_by(requester_id=user1.id, addressee_id=user2.id).first()
        assert updated_friend_request.status == "accepted"
    # Test rejecting friend request

    def test_reject_friend_request_success(self, client, clean_db):
        """Test rejecting a friend request successfully."""
        # Setup: Create two users
        user1 = models.User(
            first_name="Alice",
            last_name="Smith",
            email="alice@example.com",
            date_of_birth=datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        user2 = models.User(
            first_name="Bob",
            last_name="Johnson",
            email="bob@example.com",
            date_of_birth=datetime(1991, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add_all([user1, user2])
        clean_db.session.commit()

        # Create a friend request from user1 to user2
        friendship_request = models.Friendship(requester_id=user1.id, addressee_id=user2.id)
        clean_db.session.add(friendship_request)
        clean_db.session.commit()

        # Login as user2
        login_response = client.post("/login", json={
            "email": "bob@example.com",
            "password": "password"
        })
        token = login_response.json['session_token']

        # Attempt to reject the friend request
        response = client.post("/reject_friend_request", json={"email": "alice@example.com"}, headers={"Authorization": f"Bearer {token}"})

        # Assertion: Request rejected
        assert response.status_code == 200
        assert response.json['message'] == "Friend request rejected"

        # Check if the friend request is updated in the database
        updated_friend_request = models.Friendship.query.filter_by(requester_id=user1.id, addressee_id=user2.id).first()
        assert updated_friend_request.status == "rejected"

    def test_list_pending_friend_requests(self, client, clean_db):
        """Test listing all pending friend requests for the current user."""
        # Setup: Create two users
        user1 = models.User(
            first_name="Alice",
            last_name="Smith",
            email="alice@example.com",
            date_of_birth=datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        user2 = models.User(
            first_name="Bob",
            last_name="Johnson",
            email="bob@example.com",
            date_of_birth=datetime(1991, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add_all([user1, user2])
        clean_db.session.commit()

        # Create a pending friend request from user1 to user2
        friendship_request = models.Friendship(requester_id=user1.id, addressee_id=user2.id, status="pending")
        clean_db.session.add(friendship_request)
        clean_db.session.commit()

        # Login as user2
        login_response = client.post("/login", json={
            "email": "bob@example.com",
            "password": "password"
        })
        token = login_response.json['session_token']

        # Attempt to list pending friend requests
        response = client.get("/list_friend_requests", headers={"Authorization": f"Bearer {token}"})

        # Assertion: Pending friend request listed successfully
        assert response.status_code == 200
        assert len(response.json['pending_requests']) == 1
        assert response.json['pending_requests'][0]['email'] == "alice@example.com"
        assert response.json['pending_requests'][0]['name'] == "Alice Smith"

    def test_list_friends(self, client, clean_db):
        """Test listing all friends of the current user."""
        # Setup: Create two users
        user1 = models.User(
            first_name="Alice",
            last_name="Smith",
            email="alice@example.com",
            date_of_birth=datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        user2 = models.User(
            first_name="Bob",
            last_name="Johnson",
            email="bob@example.com",
            date_of_birth=datetime(1991, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add_all([user1, user2])
        clean_db.session.commit()

        # Create a friendship between user1 and user2
        friendship = models.Friendship(requester_id=user1.id, addressee_id=user2.id, status="accepted")
        clean_db.session.add(friendship)
        clean_db.session.commit()

        # Login as user1
        login_response = client.post("/login", json={
            "email": "alice@example.com",
            "password": "password"
        })
        token = login_response.json['session_token']

        # Attempt to list friends
        response = client.get("/list_friends", headers={"Authorization": f"Bearer {token}"})

        # Assertion: Friends listed successfully
        assert response.status_code == 200
        assert len(response.json['friends']) == 1
        assert response.json['friends'][0]['email'] == "bob@example.com"
        assert response.json['friends'][0]['name'] == "Bob Johnson"

class TestGenerateFutureRevenueData:
    """ Class for testing generateFutureRevenue function """

    # Ensure these are defined within the setUp method
    requestDataMonthly = [
        {'period': '2023-01', 'total_revenue': 1000, 'total_sold': 10},
        {'period': '2023-02', 'total_revenue': 1500, 'total_sold': 15},
    ]
    requestDataWeekly = [
        {'period': '2023-01', 'total_revenue': 500, 'total_sold': 5},
        {'period': '2023-02', 'total_revenue': 700, 'total_sold': 7},
    ]

    def test_generate_future_revenue_monthly(self):
        result = generateFutureRevenueData(self.requestDataMonthly, 'monthly')
        assert len(result['future_revenues']) == 12
        assert result['frequency'] == 'monthly'

    def test_generate_future_revenue_weekly(self):
        result = generateFutureRevenueData(self.requestDataWeekly, 'weekly')
        assert len(result['future_revenues']) == 52
        assert result['frequency'] == 'weekly'

    def test_generate_future_revenue_empty_data_monthly(self):
        result = generateFutureRevenueData([], 'monthly')
        assert len(result) == 0

    def test_generate_future_revenue_empty_data_weekly(self):
        result = generateFutureRevenueData([], 'weekly')
        assert len(result) == 0

    def test_generate_future_revenue_invalid_frequency(self):
        result = generateFutureRevenueData(self.requestDataMonthly, 'daily')
        assert result == []