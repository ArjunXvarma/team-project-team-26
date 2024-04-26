from app import models, app, db
from datetime import datetime, timedelta
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
import pytest
import constants
from app.gps.GPS import GPSRoutes
from app.auth.Auth import AuthenticationRoutes
from app.friends.Friends import FriendshipRoutes
from app.membership.Membership import MembershipRoutes
from app.stats.Stats import StatisticsRoutes
from app.Admin.revenuePrediction import generateFutureRevenueData

# Initialize bcrypt
bcrypt = Bcrypt(app)

class TestSignup:
    """Class for testing user signup functionality."""

    def test_user_does_not_exist(self, client, app):
        """Class for testing user signup functionality."""
        response = client.post("/signup", json={
            "first_name": "Peter",
            "last_name": "Parker",
            "email": "peter.parker@gmail.com",
            "date_of_birth": "2002-02-19",
            "password": "peter"
        })

        # if admin account doesn't already exist
        if (models.User.query.count() == 1):
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

        # if admin does already exist
        if (models.User.query.count() == 2):
            assert response.status_code == 200
            assert response.json['id'] == 2
            assert response.json['name'] == "Peter Parker"
            assert response.json['return_code'] == 1
            with app.app_context():
                assert models.User.query.count() == 2
                assert models.User.query.offset(1).first().first_name == "Peter"
                assert models.User.query.offset(1).first().last_name == "Parker"
                assert models.User.query.offset(1).first().email == "peter.parker@gmail.com"
                assert models.User.query.offset(1).first().date_of_birth == datetime(2002, 2, 19, 0, 0)

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
