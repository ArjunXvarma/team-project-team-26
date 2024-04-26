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

class TestFriendshipRoutes:
    """Class for testing friendship routes functionality."""

    def test_send_friend_request_success(self, client, clean_db):
        """Test sending a friend request successfully."""

        # create 2 users
        token, id, *_ = users.user1(self, client, clean_db)
        token2, id2 = users.user2(self, client, clean_db)

        # Attempt to send a friend request from user1 to user2
        response = client.post("/send_friend_request", json={"email": "alice@example.com"}, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        assert response.json['message'] == "Friend request sent successfully"

        # Check if the friend request is created in the database
        friend_request = models.Friendship.query.filter_by(requester_id=id, addressee_id=id2).first()
        assert friend_request is not None
        assert friend_request.status == "pending"

    def test_send_friend_request_to_nonexistent_user(self, client, clean_db):
        """Test sending a friend request to a non-existent user."""

        # create a user
        token, id, *_ = users.user1(self, client, clean_db)

        # Attempt to send a friend request to a non-existent user
        response = client.post("/send_friend_request", json={"email": "nonexistent@example.com"}, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 404
        assert response.json['error'] == "Addressee not found"

    def test_send_friend_request_to_self(self, client, clean_db):
        """Test sending a friend request to oneself."""
        # create a user
        token, id, *_ = users.user1(self, client, clean_db)

        # Attempt to send a friend request to oneself
        response = client.post("/send_friend_request", json={"email": "john.doe@example.com"}, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 400
        assert response.json['error'] == "Cannot send friend request to yourself"

    def test_accept_friend_request_success(self, client, clean_db):
        """Test accepting a friend request successfully."""
        token, id, *_ = users.user1(self, client, clean_db)
        token2, id2 = users.user2(self, client, clean_db)

        # Create a friend request from user1 to user2
        friendship_request = models.Friendship(requester_id=id, addressee_id=id2)
        clean_db.session.add(friendship_request)
        clean_db.session.commit()

        # Attempt to accept the friend request
        response = client.post("/accept_friend_request", json={"email": "john.doe@example.com"}, headers={"Authorization": f"Bearer {token2}"})

        assert response.status_code == 200
        assert response.json['message'] == "Friend request accepted"

        # Check if the friend request is updated in the database
        updated_friend_request = models.Friendship.query.filter_by(requester_id=id, addressee_id=id2).first()
        assert updated_friend_request.status == "accepted"

    # Test rejecting friend request
    def test_reject_friend_request_success(self, client, clean_db):
        """Test rejecting a friend request successfully."""
        # Setup: Create two users
        token, id, *_ = users.user1(self, client, clean_db)
        token2, id2 = users.user2(self, client, clean_db)


        # Create a friend request from user1 to user2
        friendship_request = models.Friendship(requester_id=id, addressee_id=id2)
        clean_db.session.add(friendship_request)
        clean_db.session.commit()

        # Attempt to reject the friend request
        response = client.post("/reject_friend_request", json={"email": "john.doe@example.com"}, headers={"Authorization": f"Bearer {token2}"})

        # Assertion: Request rejected
        assert response.status_code == 200
        assert response.json['message'] == "Friend request rejected"

        # Check if the friend request is updated in the database
        updated_friend_request = models.Friendship.query.filter_by(requester_id=id, addressee_id=id2).first()
        assert updated_friend_request.status == "rejected"

    def test_list_pending_friend_requests(self, client, clean_db):
        """Test listing all pending friend requests for the current user."""
        token, id, *_ = users.user1(self, client, clean_db)
        token2, id2 = users.user2(self, client, clean_db)


        # Create a pending friend request from user1 to user2
        friendship_request = models.Friendship(requester_id=id, addressee_id=id2, status="pending")
        clean_db.session.add(friendship_request)
        clean_db.session.commit()

        # Attempt to list pending friend requests
        response = client.get("/list_friend_requests", headers={"Authorization": f"Bearer {token2}"})

        # Assertion: Pending friend request listed successfully
        assert response.status_code == 200
        assert len(response.json['pending_requests']) == 1
        assert response.json['pending_requests'][0]['email'] == "john.doe@example.com"
        assert response.json['pending_requests'][0]['name'] == "John Doe"

    def test_list_friends(self, client, clean_db):
        """Test listing all friends of the current user."""
        token, id, token2, id2 = users.user1(self, client, clean_db)

        # Attempt to list friends
        response = client.get("/list_friends", headers={"Authorization": f"Bearer {token}"})

        # Assertion: Friends listed successfully
        assert response.status_code == 200
        assert len(response.json['friends']) == 1
        assert response.json['friends'][0]['email'] == "bob@example.com"
        assert response.json['friends'][0]['name'] == "Bob Johnson"
