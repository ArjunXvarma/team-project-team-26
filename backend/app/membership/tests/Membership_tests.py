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

class TestMembershipRoutes:
    """Class for testing membership routes functionality."""
    # Tests for buying the membership

    def test_buy_membership_success(self, client, clean_db):
        """Test buying a membership successfully."""

        token, id, *_ = users.user1(self, client, clean_db)
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
        purchased_membership = models.Membership.query.filter_by(user_id=id).first()

        # Assert that the membership and auto-renewal are actually set to True
        assert purchased_membership.is_active == True
        assert purchased_membership.auto_renew == True

    def test_buy_membership_missing_fields(self, client, clean_db):
        """Test buying a membership with missing fields."""

        token, id, *_ = users.user1(self, client, clean_db)
        # Attempt to buy a membership with missing fields
        response = client.post("/buy_membership", json={
            "membership_type": constants.MembershipType.BASIC.value,
            # Missing 'duration' and 'mode_of_payment'
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 400
        assert response.json['return_code'] == 0
        assert response.json['error'] == "Missing Required Fields"

        # Fetch the membership details.
        membership_details = models.Membership.query.filter_by(user_id=id).first()

        # Assert that the membership is None and does not exist.
        assert membership_details == None

    def test_buy_membership_invalid_duration(self, client, clean_db):
        """Test buying a membership with an invalid duration."""

        token, id, *_ = users.user1(self, client, clean_db)
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
        membership_details = models.Membership.query.filter_by(user_id=id).first()

        # Assert that the membership is None and does not exist.
        assert membership_details == None

    def test_buy_membership_invalid_mode_of_payment(self, client, clean_db):
        """Test buying a membership with an invalid mode of payment."""

        token, id, *_ = users.user1(self, client, clean_db)
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
        membership_details = models.Membership.query.filter_by(user_id=id).first()

        # Assert that the membership is None and does not exist.
        assert membership_details == None

    def test_buy_membership_invalid_membership_type(self, client, clean_db):
        """Test buying a membership with an invalid membership type."""

        token, id, *_ = users.user1(self, client, clean_db)
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
        membership_details = models.Membership.query.filter_by(user_id=id).first()

        # Assert that the membership is None and does not exist.
        assert membership_details == None

    # Tests for cancelling the membership
    def test_cancel_membership_before_end_date(self, client, clean_db):
        """Test canceling a membership before end date."""
        # First, create a user and a membership
        token, id, *_ = users.user1(self, client, clean_db)
        # Create a membership for the user
        membership = models.Membership(
            user_id=id,
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

        # Attempt to cancel the membership
        response = client.delete("/cancel_membership", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        assert response.json['return_code'] == 1
        assert "Auto-renew disabled successfully." in response.json['message']

        # Fetch the membership after cancellation
        cancelled_membership = models.Membership.query.filter_by(user_id=id).first()

        # Assert that the auto-renewal is set to false
        assert cancelled_membership.auto_renew == False

        # Assert that the membership is still activated.
        assert cancelled_membership.is_active == True

    def test_cancel_membership_on_end_date(self, client, clean_db):
        """Test canceling a membership on the end date."""
        # First, create a user and a membership
        token, id, *_ = users.user1(self, client, clean_db)
        # Create a membership for the user
        membership = models.Membership(
            user_id=id,
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

        # Attempt to cancel the membership
        response = client.delete("/cancel_membership", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        assert response.json['return_code'] == 1
        assert "Membership cancelled and auto-renew disabled successfully." in response.json['message']

        # Fetch the membership after cancellation
        cancelled_membership = models.Membership.query.filter_by(user_id=id).first()

        # Assert that the membership and auto-renewal are actually set to false
        assert cancelled_membership.is_active == False
        assert cancelled_membership.auto_renew == False

    def test_cancel_membership_no_active_membership(self, client, clean_db):
        """Test cancelling membership when no active membership exists."""
        # First, create a user
        token, id, *_ = users.user1(self, client, clean_db)
        # Attempt to cancel the membership
        response = client.delete("/cancel_membership", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 404
        assert response.json['return_code'] == 0
        assert "User does not have an active membership" in response.json['error']
