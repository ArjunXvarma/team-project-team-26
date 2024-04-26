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
from app.TestUsers import users

# Initialize bcrypt
bcrypt = Bcrypt(app)

class TestLogin:
    """Class for testing user login functionality."""

    def test_correct_credentials(self, client, clean_db):
        """Test login with correct credentials."""
        token = users.user2(self, client, clean_db)[0]

        response = client.post("/login", json={
            "email": "alice@example.com",
            "password": "password"
        })

        assert response.status_code == 200
        assert response.json['name'] == "Alice Smith"
        assert response.json['return_code'] == 2

    def test_incorrect_password(self, client, clean_db):
        """Test login with incorrect password."""
        token = users.user2(self, client, clean_db)[0]

        response = client.post("/login", json={
            "email": "alice@example.com",
            "password": "pass word"
        })

        assert response.status_code == 401
        assert response.json['error'] == "Incorrect password, please try again"
        assert response.json['return_code'] == 1

    def test_incorrect_email(self, client, clean_db):
        """Test login with incorrect email."""
        token = users.user2(self, client, clean_db)[0]


        response = client.post("/login", json={
            "email": "peter.parker.wrong.mail@gmail.com",
            "password": "password"
        })

        assert response.status_code == 404
        assert response.json['error'] == "User Not found with the given Email"
        assert response.json['return_code'] == 0
