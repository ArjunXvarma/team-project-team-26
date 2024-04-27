from app import (app, db, models, get_jwt_identity, jwt_required)
from flask import request, jsonify, Response
from typing import Tuple
import json

class FriendshipRoutes:
    """
    Class for handling friendship-related routes.

    Methods
    -------
    send_friend_request() -> Tuple[Response, int]:
        Sends a friend request from the current user to another user.
    accept_friend_request() -> Tuple[Response, int]:
        Accepts a friend request.
    reject_friend_request() -> Tuple[Response, int]:
        Rejects a friend request.
    list_friend_requests() -> Tuple[Response, int]:
        Lists all pending friend requests for the current user.
    list_friends() -> Tuple[Response, int]:
        Lists all friends of the current user.
    """

    @app.route("/send_friend_request", methods=["POST"])
    @jwt_required()
    def send_friend_request() -> Tuple[Response, int]:
        """
        Sends a friend request from the current user to another user.

        This method allows the current authenticated user to send a friend request to another user identified by their email.

        Parameters
        ----------
        email : str
            The email address of the user to whom the friend request is being sent.

        Returns
        -------
        json
            A JSON response indicating the success or failure of the friend request operation.
            If successful, returns:
                - "message": "Friend request sent successfully"
            If unsuccessful, returns:
                - "error": Description of the error (e.g., "Email is required", "Addressee not found")

        HTTP Status Codes
        -----------------
        200 : OK
            Friend request sent successfully.
        400 : Bad Request
            Missing email or attempting to send a request to oneself.
        404 : Not Found
            The specified user to send a request to does not exist.
        409 : Conflict
            A friend request already exists or the users are already friends.
        """
        current_user_email = get_jwt_identity()
        data = request.json

        addressee_email = data.get("email")

        if not addressee_email:
            return jsonify({"error": "Email is required"}), 400

        current_user = models.User.query.filter_by(email=current_user_email).first()
        addressee = models.User.query.filter_by(email=addressee_email).first()

        if not addressee:
            return jsonify({"error": "Addressee not found"}), 404

        # Prevent sending a request to oneself
        if current_user.id == addressee.id:
            return jsonify({"error": "Cannot send friend request to yourself"}), 400

        # Check if the request already exists
        existing_request = models.Friendship.query.filter(
            ((models.Friendship.requester_id == current_user.id) & (models.Friendship.addressee_id == addressee.id)) |
            ((models.Friendship.requester_id == addressee.id) & (models.Friendship.addressee_id == current_user.id))
        ).first()

        if existing_request:
            return jsonify({"error": "Friend request already exists or already friends"}), 409

        new_request = models.Friendship(requester_id=current_user.id, addressee_id=addressee.id)
        db.session.add(new_request)
        db.session.commit()

        return jsonify({"message": "Friend request sent successfully"}), 200

    @app.route("/accept_friend_request", methods=["POST"])
    @jwt_required()
    def accept_friend_request() -> Tuple[Response, int]:
        """
        Accepts a friend request.

        Allows the current authenticated user to accept a friend request from another user.

        Parameters
        ----------
        email : str
            The email address of the user whose friend request is being accepted.

        Returns
        -------
        json
            A JSON response indicating the success or failure of the accept operation.
            If successful, returns:
                - "message": "Friend request accepted"
            If unsuccessful, returns:
                - "error": Description of the error (e.g., "Email is required", "Requester not found")

        HTTP Status Codes
        -----------------
        200 : OK
            Friend request accepted successfully.
        400 : Bad Request
            Missing email.
        404 : Not Found
            The friend request to be accepted was not found.
        """
        current_user_email = get_jwt_identity()
        data = request.json

        requester_email = data.get("email")

        if not requester_email:
            return jsonify({"error": "Email is required"}), 400

        current_user = models.User.query.filter_by(email=current_user_email).first()
        requester = models.User.query.filter_by(email=requester_email).first()

        if not requester:
            return jsonify({"error": "Requester not found"}), 404

        friend_request = models.Friendship.query.filter_by(requester_id=requester.id, addressee_id=current_user.id, status='pending').first()

        if not friend_request:
            return jsonify({"error": "Friend request not found"}), 404

        friend_request.status = 'accepted'
        db.session.commit()

        return jsonify({"message": "Friend request accepted"}), 200
    @app.route("/reject_friend_request", methods=["POST"])
    @jwt_required()
    def reject_friend_request() -> Tuple[Response, int]:
        """
        Rejects a friend request.

        Allows the current authenticated user to reject a friend request from another user.

        Parameters
        ----------
        email : str
            The email address of the user whose friend request is being rejected.

        Returns
        -------
        json
            A JSON response indicating the success or failure of the reject operation.
            If successful, returns:
                - "message": "Friend request rejected"
            If unsuccessful, returns:
                - "error": Description of the error (e.g., "Email is required", "Requester not found")

        HTTP Status Codes
        -----------------
        200 : OK
            Friend request rejected successfully.
        400 : Bad Request
            Missing email.
        404 : Not Found
            The friend request to be rejected was not found.
        """
        current_user_email = get_jwt_identity()
        data = request.json

        requester_email = data.get("email")

        if not requester_email:
            return jsonify({"error": "Email is required"}), 400

        current_user = models.User.query.filter_by(email=current_user_email).first()
        requester = models.User.query.filter_by(email=requester_email).first()

        if not requester:
            return jsonify({"error": "Requester not found"}), 404

        friend_request = models.Friendship.query.filter_by(
            requester_id=requester.id, addressee_id=current_user.id, status='pending').first()

        if not friend_request:
            return jsonify({"error": "Friend request not found"}), 404

        friend_request.status = 'rejected'
        db.session.commit()

        return jsonify({"message": "Friend request rejected"}), 200

    @app.route("/list_friend_requests", methods=["GET"])
    @jwt_required()
    def list_friend_requests() -> Tuple[Response, int]:
        """
        Lists all pending friend requests for the current user.

        This method retrieves all pending friend requests sent to the current authenticated user.

        Returns
        -------
        json
            A JSON response containing a list of pending friend requests.
            Each entry in the list includes the email and name of the user who sent the request.

        HTTP Status Codes
        -----------------
        200 : OK
            Successfully retrieved the list of pending friend requests.
        """
        current_user_email = get_jwt_identity()
        current_user = models.User.query.filter_by(email=current_user_email).first()

        pending_requests = models.Friendship.query.filter_by(
            addressee_id=current_user.id, status='pending').all()
        requests = []
        for req in pending_requests:
            user_info = models.User.query.get(req.requester_id)
            requests.append({"email": user_info.email, "name": user_info.first_name + " " + user_info.last_name})

        return jsonify({"pending_requests": requests}), 200

    @app.route("/list_friends", methods=["GET"])
    @jwt_required()
    def list_friends() -> Tuple[Response, int]:
        """
        Lists all friends of the current user.

        This method retrieves all friends of the current authenticated user.

        Returns
        -------
        json
            A JSON response containing a list of friends.
            Each entry in the list includes the email and name of the friend.

        HTTP Status Codes
        -----------------
        200 : OK
            Successfully retrieved the list of friends.
        """
        current_user_email = get_jwt_identity()
        current_user = models.User.query.filter_by(email=current_user_email).first()

        # Assuming friendships are symmetrical and both users can initiate a friendship
        friends = models.Friendship.query.filter(
            ((models.Friendship.requester_id == current_user.id) |
            (models.Friendship.addressee_id == current_user.id)) &
            (models.Friendship.status == 'accepted')
        ).all()

        friends_list = []
        for friend in friends:
            friend_id = friend.addressee_id if friend.requester_id == current_user.id else friend.requester_id
            friend_info = models.User.query.get(friend_id)
            friends_list.append({"email": friend_info.email, "name": friend_info.first_name + " " + friend_info.last_name, "account_type": friend_info.isPrivate, "account_type": friend_info.isPrivate})

        return jsonify({"friends": friends_list}), 200

    @app.route('/get_friends_journey', methods=['GET'])
    @jwt_required()
    def getFriendsJourney():
        current_user_email = get_jwt_identity()
        current_user = models.User.query.filter_by(email=current_user_email).first()

        if not current_user:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404

        friend_email = request.args.get('friend')
        if not friend_email:
            return jsonify({'status': 'error', 'message': 'Friend email is required'}), 400

        friend_user = models.User.query.filter_by(email=friend_email).first()
        if not friend_user:
            return jsonify({'status': 'error', 'message': 'Friend not found'}), 404

        if not (models.Friendship.query.filter_by(requester_id=current_user.id, addressee_id=friend_user.id, status='accepted').first() or
                models.Friendship.query.filter_by(requester_id=friend_user.id, addressee_id=current_user.id, status='accepted').first()):
            return jsonify({'status': 'error', 'message': 'Not friends'}), 403

        if friend_user.isPrivate:
            return jsonify({'status': 'error', 'message': 'Friend\'s account is private'}), 403

        journeys = models.Journey.query.filter_by(userId=friend_user.id).all()
        journeys_data = [{
            'id': journey.id,
            'name': journey.name,
            'type': journey.type,
            'totalDistance': journey.totalDistance,
            'elevation': {
                'avg': journey.avgEle,
                'min': journey.minEle,
                'max': journey.maxEle,
            },
            'points': json.loads(journey.points) if journey.points else [],
            'startTime': journey.startTime.strftime('%H:%M:%S') if journey.startTime else None,
            'endTime': journey.endTime.strftime('%H:%M:%S') if journey.endTime else None,
            'dateCreated': journey.dateCreated.strftime('%d-%m-%Y') if journey.dateCreated else None,
        } for journey in journeys]

        return jsonify({
            "status": 200,
            "data": journeys_data
        }), 200


    @app.route('/privacy_status', methods=['GET'])
    @jwt_required()
    def getPrivacyStatus():
        """
        Returns the privacy status of the user (false - public, true - private)

        Returns
        -------
        json
            A JSON response containing the privacy value.
            A status code.

        HTTP Status Codes
        -----------------
        200 : OK
            Successfully returned the valid JSON output.
        """

        current_user_email = get_jwt_identity()
        user = models.User.query.filter_by(email=current_user_email).first()

        if not user:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404

        return jsonify({
            'status': 200,
            'account_type': user.isPrivate
        })

    @app.route('/update_privacy', methods=['POST'])
    @jwt_required()
    def update_privacy():
        """
        Updates the privacy status of the user. (false - public, true - private)

        Returns
        -------
        json
            A JSON response containing output message.
            A status code.

        HTTP Status Codes
        -----------------
        200 : OK
            Successfully returned the valid JSON output.
        """

        current_user_email = get_jwt_identity()
        user = models.User.query.filter_by(email=current_user_email).first()

        if not user:
            return jsonify({'status': 400, 'message': 'User not found'}), 404

        data = request.get_json()
        is_private = data.get('isPrivate')

        if is_private is None:
            return jsonify({'status': 400, 'message': 'isPrivate value is missing'}), 400

        user.isPrivate = is_private
        db.session.commit()

        return jsonify({'status': 200, 'message': 'Privacy setting updated successfully'}), 200
