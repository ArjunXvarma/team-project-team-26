from app import (app, db, models, create_access_token,
    get_jwt, get_jwt_identity, unset_jwt_cookies, jwt_required
    )
from flask import Flask, request, jsonify, Response, make_response
from flask_bcrypt import Bcrypt
from typing import Tuple
from datetime import datetime, timedelta, timezone
import json
import constants
from apscheduler.schedulers.background import BackgroundScheduler
from functools import wraps
from constants import PaymentMethod, MembershipType, MembershipDuration, MembershipPriceMonthly, MembershipPriceAnnually
from revenuePrediction import generateFutureRevenueData

bcrypt = Bcrypt(app)

#Enabling CORS for all the routes
def add_cors_headers(response=None):
    if response is None:
        response = make_response()
    origin = request.headers.get('Origin')
    if origin:
        response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


@app.before_request
def before_request():
    if request.method == 'OPTIONS':
        return add_cors_headers()

@app.after_request
def after_request(response):
    return add_cors_headers(response)

class AuthenticationRoutes:
    """
    Class for handling authentication routes.

    Attributes
    ----------
    None

    Methods
    -------
    signup() -> json:
        Registers a new user.
    login() -> json:
        Logs in the user with the supplied credentials.
    refresh_expiring_jwts(response) -> Response:
        Refreshes expiring JWTs.
    logout() -> json:
        Logs out the user.
    """

    @app.route("/signup", methods=["POST"])
    def signup() -> Tuple[Response, int]:
        """
        Registers a new user.

        Parameters
        ----------
        first_name : str
            First name of the user.
        last_name : str
            Last name of the user (Optional parameter).
        email : str
            Email address of the user.
        password : str
            User supplied password for the account.
        email : str
            Email address of the user.

        Returns
        -------
        json
            A JSON response indicating success or failure of the registration process.
            If successful, returns:
                - "return_code": 1
                - "id": The ID of the newly registered user.
                - "name": The full name of the user.
                - "access_token": The access token(JWT) for the user's session.
            If unsuccessful, returns:
                - "return_code": 0
                - "error": Details about the error encountered during registration.
        HTTP Status Codes
        -----------------
        200 : OK
            Registration successful.
        400 : Bad Request
            Missing required fields or incorrect data format.
        409 : Conflict
            User with the provided email already exists.
        """
        data = request.json
        if not data:
            return jsonify({"return_code": 0,"error": "No JSON Data found"}), 400

        first_name = data.get("first_name")
        last_name = data.get("last_name")
        email = data.get("email")
        password = data.get("password")
        date_of_birth_str = data.get("date_of_birth")

        # Check if any required fields are missing
        if not all([password, email, first_name, last_name, date_of_birth_str]):
            return jsonify({"return_code": 0, "error": "Missing Required Fields"}), 400

        user_exists = models.User.query.filter_by(email=email).first()
        if user_exists:
            return jsonify({"return_code": 0 , "error": "User Already Exists"}), 409

        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

        # Convert date_of_birth string to datetime object for storing in database
        date_of_birth = datetime.strptime(date_of_birth_str, "%Y-%m-%d")

        new_user = models.User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            date_of_birth=date_of_birth,
            hashed_password=hashed_password
        )
        db.session.add(new_user)
        db.session.commit()

        access_token = create_access_token(identity=email)
        full_user_name = (new_user.first_name+" "+new_user.last_name)
        return jsonify({
            "return_code": 1,
            "id": new_user.id,
            "name": full_user_name,
            "access_token": access_token,
        }), 200

    @app.route("/login", methods=["POST"])
    def login() -> Tuple[Response, int]:
        """
        Logs in the user.

        Parameters
        ----------
        email : str
            Email address of the user.
        password : str
            User-supplied password for the account.

        Returns
        -------
        json
            A JSON response indicating success or failure of the login process.
            If successful, returns:
                - "return_code": 2
                - "id": The ID of the logged-in user.
                - "name": The full name of the user.
                - "session_token": The session token(JWT) for the user's session.
            If unsuccessful, returns:
                - "return_code": 0 or 1
                - "error": Details about the error encountered during login.

        HTTP Status Codes
        -----------------
        200 : OK
            Login successful.
        400 : Bad Request
            Missing required fields or incorrect data format.
        401 : Unauthorized
            Incorrect password.
        404 : Not Found
            User with the provided email not found.
        """
        data = request.json
        if not data:
            return jsonify({"return_code": 0,"error": "No JSON Data found"}), 400

        password = data.get("password")
        email = data.get("email")

        # Check if any required fields are missing
        if not all([password, email]):
            return jsonify({"return_code": 0,"error": "Missing Required Fields"}), 400

        user = models.User.query.filter_by(email=email).first()
        if user is None:
            return jsonify({"return_code":0, "error": "User Not found with the given Email"}), 404
        if not bcrypt.check_password_hash(user.hashed_password, password):
            return jsonify({"return_code":1, "error": "Incorrect password, please try again"}), 401
        access_token = create_access_token(identity=email)
        full_user_name = (user.first_name+" "+user.last_name)
        return jsonify({
            "return_code": 2,
            "id": user.id,
            "name": full_user_name,
            "session_token": access_token,
        }), 200

    @app.after_request
    def refresh_expiring_jwts(response):
        """
        Refreshes expiring JWTs.

        Parameters
        ----------
        response : Response
            The response object to be modified.

        Returns
        -------
        Response
            The modified response object with the updated access token.

        Notes
        -----
        This function checks if the JWT (JSON Web Token) in the response is expiring soon.
        If so, it generates a new access token and updates the response with the new token.
        This helps to keep the user's session active.

        Exceptions
        ----------
        RuntimeError
            Raised when an unexpected error occurs during JWT refreshment.
        KeyError
            Raised when the 'exp' key is not found in the JWT payload.

        """
        try:
            exp_timestamp = get_jwt()["exp"]
            now = datetime.now(timezone.utc)
            target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
            if target_timestamp > exp_timestamp:
                access_token = create_access_token(identity=get_jwt_identity())
                data = response.get_json()
                if isinstance(data, dict):
                    data["access_token"] = access_token
                    response.data = json.dumps(data)
            return response
        except (RuntimeError, KeyError):
            return response

    @jwt_required()
    @app.route("/logout", methods=["POST"])
    def logout() -> Tuple[Response, int]:
        """
        Logs out the user.

        Returns
        -------
        json
            A JSON response indicating success of the logout process.

        Notes
        -----
        This function logs out the user by clearing the JWT (JSON Web Token) cookies.
        After successful logout, the user will no longer be authenticated for protected routes.
        """
        response = jsonify({"msg": "logout successful"})
        unset_jwt_cookies(response)
        return response

class GPSRoutes:
    """
    Class for querying the journey data.

    Attributes
    ----------
    None

    Methods
    -------
    validate_points(points) -> json:
        Returns if the points are valid or not.
    getJourneys(userId) -> json:
        returns the journeys of a user.
    createJourney() -> json:
        creates a journey for a user.
    deleteJourney(journeyId) -> json:
        deletes a particular journey.
    updateJourney(journeyId) -> json:
        updates the data of a particular journey.
    """

    def validate_points(points):
        """
        Validates that each item in the points list contains exactly 'lat', 'lon', and 'ele' keys.

        Parameters:
        - points (list): The list of point dictionaries to validate.

        Returns:
        - (bool, str): Tuple containing a boolean indicating if the validation passed,
                    and a string with an error message if it failed.
        """
        if points != []:
            required_keys = {'lat', 'lon', 'ele'}
            for point in points:
                point_keys = set(point.keys())
                if point_keys != required_keys:
                    missing_keys = required_keys - point_keys
                    extra_keys = point_keys - required_keys
                    error_message = []
                    if missing_keys:
                        error_message.append(f"Missing keys: {', '.join(missing_keys)}")
                    if extra_keys:
                        error_message.append(f"Extra keys: {', '.join(extra_keys)}")
                    return False, '; '.join(error_message)
            return True, ""
        return False, "No data provided"

    @app.route("/get_journeys_of_user", methods=["GET"])
    @jwt_required()
    def getJourneys() -> Tuple[dict, int]:
        """
        Returns all the journeys of a user.

        Parameters
        ----------
        userId : int
            The user for which you want to query the journeys.

        Returns
        -------
        Json
            A JSON object that contains the userId and an array of all
            the journeys that belong to the user.

        Notes
        -----
        If there are no journeys that belong to the user a 404 error will be sent as there was no
        journey data found. If the journey data exists, it is returned with a response of 200.

        Exceptions
        ----------
        None.

        """

        current_user_email = get_jwt_identity()
        user = models.User.query.filter_by(email=current_user_email).first()
        if not user:
            return jsonify({'status': 404, 'message': 'User not found'}), 404

        journeys = models.Journey.query.filter_by(userId=user.id).all()
        journey_data = []
        for journey in journeys:
            points = json.loads(journey.points) if journey.points else []

            journey_data.append({
                'id': journey.id,
                'name': journey.name,
                'type': journey.type,
                'totalDistance': journey.totalDistance,
                'elevation': {
                    'avg': journey.avgEle,
                    'min': journey.minEle,
                    'max': journey.maxEle,
                },
                'points': points,
                'startTime': journey.startTime.strftime('%H:%M:%S') if journey.startTime else None,
                'endTime': journey.endTime.strftime('%H:%M:%S') if journey.endTime else None,
                'dateCreated': journey.dateCreated.strftime('%d-%m-%Y') if journey.dateCreated else None,
            })

        if journey_data:
            return jsonify({'status': 200, 'data': journey_data}), 200
        else:
            return jsonify({'status': 404, 'message': 'No journeys found for given userId'}), 404

    @app.route("/create_journey", methods=["POST"])
    @jwt_required()
    def createJourney() -> Tuple[dict, int]:
        """
        Creates a journey for a user.

        Parameters
        ----------
        None.

        Returns
        -------
        Json
            A JSON object that contains a message related to the creation of the data.

        Notes
        -----
        The format of the date/time variables must be handled with caution as the table only
        accepts a particular data/time format. A response of 201 is returned if the data is
        created successfully, else a code of 400 is returned (Incorrect data).

        Exceptions
        ----------
        ValueError
            Raised when the startTime, endTime or dateCreated variables are not in the correct
            format.

        """
        current_user_email = get_jwt_identity()
        user = models.User.query.filter_by(email=current_user_email).first()
        if not user:
            return jsonify({'status': 404, 'message': 'User not found'}), 404

        data = request.get_json()

        # Validate points before processing further
        points = data.get('points')
        if points is None:
            return jsonify({'status': 400, 'message': 'Missing field: points'}), 400

        valid, error_message = GPSRoutes.validate_points(points)
        if not valid:
            return jsonify({'status': 400, 'message': f'Invalid points data: {error_message}'}), 400

        try:
            name = data['name']
            journey_type = data['type']
            totalDistance = data['totalDistance']
            elevation = data['elevation']
            avgEle = elevation['avg']
            minEle = elevation['min']
            maxEle = elevation['max']
            points = json.dumps(data['points'])

        except KeyError as e:
            return jsonify({'status': 400, 'message': f'Missing field: {str(e)}'}), 400

        try:
            startTime = datetime.strptime(data['startTime'], '%H:%M:%S').time()
            endTime = datetime.strptime(data['endTime'], '%H:%M:%S').time()
            dateCreated = datetime.strptime(data['dateCreated'], '%Y-%m-%d').date()
        except ValueError as e:
            return jsonify({'status': 400, 'message': 'Invalid date/time format'}), 400

        journey = models.Journey(
            userId=user.id,
            name=name,
            type=journey_type,
            totalDistance=totalDistance,
            avgEle=avgEle,
            minEle=minEle,
            maxEle=maxEle,
            points=points,
            startTime=startTime,
            endTime=endTime,
            dateCreated=dateCreated
        )

        db.session.add(journey)
        db.session.commit()

        return jsonify({'status': 201, 'message': 'Journey created successfully'}), 201

    @app.route("/delete_journey/<int:journeyId>", methods=["DELETE"])
    @jwt_required()
    def deleteJourney(journeyId) -> Tuple[dict, int]:
        """
        Deletes a journey of a user.

        Parameters
        ----------
        journeyId : int
            The journey that you want to delete.

        Returns
        -------
        Json
            A JSON object that contains information about the deletion of the journey.

        Notes
        -----
        None.

        Exceptions
        ----------
        None.

        """
        current_user_email = get_jwt_identity()
        user = models.User.query.filter_by(email=current_user_email).first()
        if not user:
            return jsonify({'status': 404, 'message': 'User not found'}), 404
        journeys = models.Journey.query.filter_by(userId=user.id).all()

        for journey in journeys:
            if journeyId == journey.id:
                db.session.delete(journey)
                db.session.commit()
                return {'status': 200, 'message': 'Journey deleted successfully'}, 200
        return {'status': 404, 'message': 'Journey not found'}, 404

    @app.route("/update_journey/<int:journeyId>", methods=["PUT"])
    @jwt_required()
    def updateJourney(journeyId) -> Tuple[dict, int]:
        """
        Updates a journey of a user.

        Parameters
        ----------
        journeyId : int
            The journey that you want to update.

        Returns
        -------
        Json
            A JSON object that contains information about the changes made to journey.

        Notes
        -----
        None.

        Exceptions
        ----------
        None.

        """

        journey = models.Journey.query.get(journeyId)
        if not journey:
            return jsonify({'status': 404, 'message': 'Journey not found'}), 404

        data = request.get_json()

        # Update the journey object with new data if available
        if 'name' in data:
            journey.name = data['name']
        if 'type' in data:
            journey.type = data['type']
        if 'totalDistance' in data:
            journey.totalDistance = data['totalDistance']
        if 'elevation' in data:
            elevation = data['elevation']
            if 'avg' in elevation:
                journey.avgEle = elevation['avg']
            if 'min' in elevation:
                journey.minEle = elevation['min']
            if 'max' in elevation:
                journey.maxEle = elevation['max']

        # Validate points directly from the request JSON
        if 'points' in data:
            points = data['points']
            valid, error_message = GPSRoutes.validate_points(points)
            if not valid:
                return jsonify({'status': 400, 'message': f'Invalid points data: {error_message}'}), 400
            journey.points = json.dumps(points)

        try:
            if 'startTime' in data:
                data['startTime'] = datetime.strptime(data['startTime'], '%H:%M:%S').time()
            if 'endTime' in data:
                data['endTime'] = datetime.strptime(data['endTime'], '%H:%M:%S').time()
            if 'dateCreated' in data:
                data['dateCreated'] = datetime.strptime(data['dateCreated'], '%d-%m-%Y').date()
        except ValueError as e:
            return jsonify({'status': 400, 'message': 'Invalid date/time format'}), 400

        db.session.commit()

        return jsonify({'status': 200, 'message': 'Journey updated successfully'}), 200

class MembershipRoutes:
    """
    Class for handling membership routes.

    Attributes
    ----------
    None

    Methods
    -------
    buy_membership() -> json:
        Allows a user to purchase a membership.
    cancel_membership() -> json:
        Cancels the auto renewal of membership of a user.
    has_active_membership() -> bool:
        Returns if an user have an active membership or not.
    """

    @app.route("/buy_membership", methods=["POST"])
    @jwt_required()
    def buy_membership() -> Tuple[Response, int]:
        """
        Allows a user to purchase a membership.

        Parameters
        ----------
        membership_type : str
            Type of membership to purchase (All types defined in constants.py).
        duration : str
            Duration of the membership (All valid durations defined in constants.py)..
        mode_of_payment : str
            Mode of payment for the membership (All modes defined in constants.py).

        Returns
        -------
        json
            A JSON response indicating success or failure of the membership purchase.
            If successful, returns:
                - "return_code": 1
                - "message": "Membership purchased successfully"
            If unsuccessful, returns:
                - "return_code": 0
                - "error": Details about the error encountered during membership purchase.

        HTTP Status Codes
        -----------------
        200 : OK
            Membership purchased successfully.
        400 : Bad Request
            - Missing required fields.
            - Invalid duration.
            - Invalid mode of payment.
            - User already has an active membership.
        401 : Unauthorized
            Missing or invalid access token.
        """
        current_user_email = get_jwt_identity()
        user = models.User.query.filter_by(email=current_user_email).first()
        data = request.json
        if not data:
            return jsonify({"return_code": 0, "error": "No JSON Data found"}), 400

        membership_type = data.get("membership_type")
        duration = data.get("duration")
        mode_of_payment = data.get("mode_of_payment")
        if not all([membership_type, duration, mode_of_payment]):
            return jsonify({"return_code": 0, "error": "Missing Required Fields"}), 400

        # Check if user already has an active membership
        user_membership = models.Membership.query.filter_by(user_id=user.id, is_active=True).first()
        if user_membership:
            return jsonify({"return_code": 0, "error": "User already has an active membership"}), 400

        # Calculate start and end dates based on duration
        if not constants.is_valid_duration(duration):
            return jsonify({"return_code": 0, "error": "Invalid duration"}), 400
        start_date = datetime.now()
        if duration.lower() == 'monthly':
            end_date = start_date + timedelta(days=30)
        elif duration.lower() == 'annually':
            end_date = start_date + timedelta(days=365)
        if not constants.is_valid_membership_type(membership_type):
            return jsonify({"return_code": 0, "error": "Invalid membership type"}), 400
        if not constants.is_valid_payment_method(mode_of_payment):
            return jsonify({"return_code": 0, "error": "Invalid mode of payment"}), 400
        new_membership = models.Membership(
            user_id=user.id,
            membership_type=membership_type,
            duration=duration,
            start_date=start_date,
            end_date=end_date,
            mode_of_payment=mode_of_payment,
            is_active=True,
            auto_renew=True
        )
        db.session.add(new_membership)
        db.session.commit()

        return jsonify({"return_code": 1, "message": "Membership purchased successfully"}), 200

    @app.route("/cancel_membership", methods=["DELETE"])
    @jwt_required()
    def cancel_membership() -> Tuple[Response, int]:
        """
        Adjusts the active membership of a user based on the current date.
        If the current date is before the end date, auto renew is turned off.
        If the current date is on or after the end date, the membership is cancelled.

        Returns
        -------
        json
            A JSON response indicating the success or failure of the operation.
            If successful, returns:
                - "return_code": 1
                - "message": Details about the operation performed.
            If unsuccessful, returns:
                - "return_code": 0
                - "error": Details about the error encountered during the operation.

        HTTP Status Codes
        -----------------
        200 : OK
            Operation performed successfully.
        404 : Not Found
            User does not have an active membership.
        401 : Unauthorized
            Missing or invalid access token.
        """
        current_user_email = get_jwt_identity()
        user = models.User.query.filter_by(email=current_user_email).first()

        membership = models.Membership.query.filter_by(user_id=user.id, is_active=True).first()
        if not membership:
            return jsonify({"return_code": 0, "error": "User does not have an active membership"}), 404

        current_date = datetime.utcnow()
        if current_date < membership.end_date:
            membership.auto_renew = False
            message = "Auto-renew disabled successfully."
        else:
            membership.is_active = False
            membership.auto_renew = False
            message = "Membership cancelled and auto-renew disabled successfully."

        db.session.commit()

        return jsonify({"return_code": 1, "message": message}), 200

    @app.route("/has_active_membership", methods=["GET"])
    @jwt_required()
    def has_active_membership() -> Tuple[Response, int]:
        """
        Checks if the user has an active membership.

        Returns
        -------
        json
            A JSON response indicating whether the user has an active membership.
            If user has an active membership, returns:
                - "has_active_membership": true
            If user does not have an active membership, returns:
                - "has_active_membership": false

        HTTP Status Codes
        -----------------
        200 : OK
            Membership status checked successfully.
        401 : Unauthorized
            Missing or invalid access token.
        """
        current_user_email = get_jwt_identity()
        user = models.User.query.filter_by(email=current_user_email).first()

        # Check if user has an active membership
        user_has_active_membership = models.Membership.query.filter_by(user_id=user.id, is_active=True).first()

        if user_has_active_membership:
            return jsonify({"has_active_membership": True}), 200
        else:
            return jsonify({"has_active_membership": False}), 200

    def auto_renew_memberships():
        """
        Function to auto-renew memberships if today is the end date and auto renew is True.
        """
        current_date = datetime.utcnow()

        memberships_to_renew = models.Membership.query.filter(models.Membership.end_date == current_date, models.Membership.auto_renew == True).all()

        for membership in memberships_to_renew:
            if membership.duration.lower() == 'monthly':
                membership.end_date += timedelta(days=30)
            elif membership.duration.lower() == 'annually':
                membership.end_date += timedelta(days=365)
        db.session.commit()

    def deactivate_expired_memberships():
        """
        Function to deactivate memberships if today is the end date and auto renew is False.
        """
        current_date = datetime.utcnow()

        memberships_to_deactivate = models.Membership.query.filter(models.Membership.end_date == current_date, models.Membership.auto_renew == False).all()

        for membership in memberships_to_deactivate:
            membership.is_active = False

        db.session.commit()


# Running the auto renew and deactivation functions every day using scheduler.
scheduler = BackgroundScheduler()
scheduler.add_job(MembershipRoutes.auto_renew_memberships, 'cron', hour=16, minute=0)
scheduler.add_job(MembershipRoutes.deactivate_expired_memberships, 'cron', hour=16, minute=0)
scheduler.start()

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


class StatisticsRoutes():
    """
    Class for retrieving journey statistics data for a user.

    Methods
    -------
    getStats() -> Tuple[dict, int]:
        returns the statistics of all the journeys for a certain user.

    """

    @app.route("/getStats", methods=["GET"])
    @jwt_required()
    def getStats() -> Tuple[dict, int]:

        """
        Get all the statistical data for a user and their journeys in a 'data' dictionary

        Parameters
        ----------
        None.

        Returns
        -------
        Json
            A JSON object that contains statistical information about a user and their journeys.
            This includes:

                data:
                Dictionary containing all user data

                    journeyData:
                    list containing statistical information about each journey of a user(each stored as dictionaries)

                    byModes:
                    contains totalled data for each mode of transport

                    Also contains a users stats summing all their journeys

            this is the exact structure, where totalTimeWorkingOut is broken down into totalTimeWorkingOutHours,
            totalTimeWorkingOutMinutes and totalTimeWorkingOutSeconds:




        Notes
        -----
        The time taken variables return the hours in a journey,
        the remaining minutes of the journey excluding the hours,
        the remaining seconds excluding both.
        These 3 essentially give the exact amount of time a journey took
        HH:MM:SS


        Exceptions
        ----------
        None.

        """

        # Get the current user's email from JWT token
        current_user_email = get_jwt_identity()

        # get user
        user = models.User.query.filter_by(email=current_user_email).first()

        # Check if user exists
        if not user:
            return jsonify({'status': 404, 'message': 'User not found'}), 404

        # Retrieve all journeys associated with the user
        journeys = models.Journey.query.filter_by(userId=user.id).all()

        # Initialize variables to store journey data and totals for each mode

        # List to store individual journey data
        journeysData = []
        total_distance_cycling = 0
        total_calories_burned_cycling = 0
        total_time_taken_hours_cycling = 0
        total_time_taken_minutes_cycling = 0
        total_time_taken_seconds_cycling = 0
        total_time_in_seconds_cycling = 0

        total_distance_walking = 0
        total_calories_burned_walking = 0
        total_time_taken_hours_walking = 0
        total_time_taken_minutes_walking = 0
        total_time_taken_seconds_walking = 0
        total_time_in_seconds_walking = 0

        total_distance_running = 0
        total_calories_burned_running = 0
        total_time_taken_hours_running = 0
        total_time_taken_minutes_running = 0
        total_time_taken_seconds_running = 0
        total_time_in_seconds_running = 0


        # Iterate over each journey
        for journey in journeys:

            # Temporary dictionary to store data for each journey
            temp_dictionary = {}

            # Check if journey exists
            if not journey:
                return jsonify({'status': 404, 'message': 'Journey not found'}), 404


            # Calculate time taken for the journey

            # Extract start time and end time from the journey object
            date =  journey.dateCreated
            start_time = journey.startTime
            end_time = journey.endTime

            # Check if start time or end time is missing
            if not start_time or not end_time:
                return jsonify({'status': 400, 'message': 'Start time or end time missing for this journey'}), 400

            # Calculate the time difference in seconds between start time and end time
            start_seconds = start_time.hour * 3600 + start_time.minute * 60 + start_time.second
            end_seconds = end_time.hour * 3600 + end_time.minute * 60 + end_time.second
            time_diff_seconds = end_seconds - start_seconds

            # breakdown time difference to hours, minutes, and seconds
            hours = time_diff_seconds // 3600
            minutes = (time_diff_seconds % 3600) // 60
            seconds = (time_diff_seconds % 3600) % 60

            # Add time data to the temporary dictionary
            temp_dictionary["date"] = date
            temp_dictionary["hours_taken"] = hours
            temp_dictionary["minutes_taken"] = minutes
            temp_dictionary["seconds_taken"] = seconds


            # Calculate calories burned for the journey

            # MET(metabolic equivalent of task) x Body Weight(kg) x Duration(hours)
            exact_hours = time_diff_seconds / 3600
            average_weight = 62

            if journey.type == "Walk":
                MET = 3.6
            elif journey.type == "Run":
                MET = 9
            else:
                MET = 7

            calories_burned = MET * average_weight * exact_hours

            # Add calories burned data to the temporary dictionary
            temp_dictionary["caloriesBurned"] = calories_burned


            # Add distance data to the temporary dictionary
            distance = journey.totalDistance
            temp_dictionary["totalDistance"]  = distance


            # Calculate average speed for the journey
            mph = (distance // (time_diff_seconds / 3600))
            temp_dictionary["averageSpeed"] = mph

            # Add mode of transport of journey to the temporary dictionary
            mode = journey.type
            temp_dictionary["mode"] = mode

            # Add journey ID data to the temporary dictionary
            journeyID = journey.id
            temp_dictionary["journeyId"] = journeyID

            # Append the journeys data to the journeysData list
            journeysData.append(temp_dictionary)


            # Update totals for each mode
            if journey.type == "Walk":
                total_distance_walking += distance
                total_calories_burned_walking += calories_burned
                total_time_in_seconds_walking += time_diff_seconds

            elif journey.type == "Run":
                total_distance_running += distance
                total_calories_burned_running += calories_burned
                total_time_in_seconds_running += time_diff_seconds

            else:
                total_distance_cycling += distance
                total_calories_burned_cycling += calories_burned
                total_time_in_seconds_cycling += time_diff_seconds


        # Calculate total time for each mode
        total_time_taken_hours_walking = total_time_in_seconds_walking // 3600
        total_time_taken_minutes_walking = (total_time_in_seconds_walking % 3600) // 60
        total_time_taken_seconds_walking = (total_time_in_seconds_walking % 3600) % 60


        total_time_taken_hours_running = total_time_in_seconds_running // 3600
        total_time_taken_minutes_running = (total_time_in_seconds_running % 3600) // 60
        total_time_taken_seconds_running = (total_time_in_seconds_running % 3600) % 60


        total_time_taken_hours_cycling = total_time_in_seconds_walking // 3600
        total_time_taken_minutes_cycling = (total_time_in_seconds_walking % 3600) // 60
        total_time_taken_seconds_cycling = (total_time_in_seconds_walking % 3600) % 60

        # Initialize dictionaries to store data for each mode
        byModes = {}
        cycle = {}
        walking = {}
        running = {}

        cycle["totalDistance"] = total_distance_cycling
        cycle["totalCaloriesBurned"] = total_calories_burned_cycling
        cycle["totalTimeWorkingOutHours"] = total_time_taken_hours_cycling
        cycle["totalTimeWorkingOutMinutes"] = total_time_taken_minutes_cycling
        cycle["totalTimeWorkingOutSeconds"] = total_time_taken_seconds_cycling

        walking["totalDistance"] = total_distance_walking
        walking["totalCaloriesBurned"] = total_calories_burned_walking
        walking["totalTimeWorkingOutHours"] = total_time_taken_hours_walking
        walking["totalTimeWorkingOutMinutes"] = total_time_taken_minutes_walking
        walking["totalTimeWorkingOutSeconds"] = total_time_taken_seconds_walking

        running["totalDistance"] = total_distance_running
        running["totalCaloriesBurned"] = total_calories_burned_running
        running["totalTimeWorkingOutHours"] = total_time_taken_hours_running
        running["totalTimeWorkingOutMinutes"] = total_time_taken_minutes_running
        running["totalTimeWorkingOutSeconds"] = total_time_taken_seconds_running

        # Add each mode of transports dictionary to byModes
        byModes["Cycle"] = cycle
        byModes["Walk"] = walking
        byModes["Run"] = running

        # Calculate totals for all journeys

        total_distance_all_journeys = total_distance_cycling + total_distance_walking + total_distance_running
        total_calories_burned_all_journeys = total_calories_burned_cycling + total_calories_burned_walking + total_calories_burned_running

        total_time_app_used = total_time_in_seconds_walking + total_time_in_seconds_running + total_time_in_seconds_cycling
        total_time_taken_hours_total = total_time_app_used // 3600
        total_time_taken_minutes_total = (total_time_app_used % 3600) // 60
        total_time_taken_seconds_total = (total_time_app_used % 3600) % 60

        # Create final data dictionary, this will contain all the other data for a user and their journeys
        data = {}

        # fill data dictionary with the relevant data
        data["journeysData"] = journeysData
        data["byModes"] = byModes
        data["totalDistanceCombined"] = total_distance_all_journeys
        data["totalCaloriesBurned"] = total_calories_burned_all_journeys
        data["totalTimeWorkingOutHours"] = total_time_taken_hours_total
        data["totalTimeWorkingOutMinutes"] = total_time_taken_minutes_total
        data["totalTimeWorkingOutSeconds"] = total_time_taken_seconds_total

        # Return status, indicating successful completion of Api, and the data dictionary
        return jsonify({'status': 200, 'data': data}), 200


    @app.route("/get_friends_stats", methods=["GET"])
    @jwt_required()
    def getFriendsStats() -> Tuple[dict, int]:

        """
        Get all the statistical data for a users friend and their journeys in a 'data' dictionary

        Parameters
        ----------
        None.

        Returns
        -------
        Json
            A JSON object that contains statistical information about a users friend and their journeys.
            This includes:

                data:
                Dictionary containing all user data

                    journeyData:
                    list containing statistical information about each journey of a user(each stored as dictionaries)

                    byModes:
                    contains totalled data for each mode of transport

                    Also contains a users stats summing all their journeys

            this is the exact structure, where totalTimeWorkingOut is broken down into totalTimeWorkingOutHours,
            totalTimeWorkingOutMinutes and totalTimeWorkingOutSeconds:




        Notes
        -----
        The time taken variables return the hours in a journey,
        the remaining minutes of the journey excluding the hours,
        the remaining seconds excluding both.
        These 3 essentially give the exact amount of time a journey took
        HH:MM:SS


        Exceptions
        ----------
        None.

        """
        # get current user
        current_user_email = get_jwt_identity()
        current_user = models.User.query.filter_by(email=current_user_email).first()

        # Check if user exists
        if not current_user:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404

        # check if email parameter inputted
        friend_email = request.args.get('friend')
        if not friend_email:
            return jsonify({'status': 'error', 'message': 'Friend email is required'}), 400

        # check if friend exists
        friend_user = models.User.query.filter_by(email=friend_email).first()
        if not friend_user:
            return jsonify({'status': 'error', 'message': 'Friend not found'}), 404

        # check if current user and friend are actually friends
        if not (models.Friendship.query.filter_by(requester_id=current_user.id, addressee_id=friend_user.id, status='accepted').first() or
                models.Friendship.query.filter_by(requester_id=friend_user.id, addressee_id=current_user.id, status='accepted').first()):
            return jsonify({'status': 'error', 'message': 'Not friends'}), 403

        # if account is set to private we cant access it and dispaly its information
        if friend_user.isPrivate:
            return jsonify({'status': 'error', 'message': 'Friend\'s account is private'}), 403


        # get friend
        user = models.User.query.filter_by(email=friend_email).first()

        # Check if user exists
        if not user:
            return jsonify({'status': 404, 'message': 'User not found'}), 404

        # Retrieve all journeys associated with the user
        journeys = models.Journey.query.filter_by(userId=user.id).all()

        # Initialize variables to store journey data and totals for each mode

        # List to store individual journey data
        journeysData = []
        total_distance_cycling = 0
        total_calories_burned_cycling = 0
        total_time_taken_hours_cycling = 0
        total_time_taken_minutes_cycling = 0
        total_time_taken_seconds_cycling = 0
        total_time_in_seconds_cycling = 0

        total_distance_walking = 0
        total_calories_burned_walking = 0
        total_time_taken_hours_walking = 0
        total_time_taken_minutes_walking = 0
        total_time_taken_seconds_walking = 0
        total_time_in_seconds_walking = 0

        total_distance_running = 0
        total_calories_burned_running = 0
        total_time_taken_hours_running = 0
        total_time_taken_minutes_running = 0
        total_time_taken_seconds_running = 0
        total_time_in_seconds_running = 0


        # Iterate over each journey
        for journey in journeys:

            # Temporary dictionary to store data for each journey
            temp_dictionary = {}

            # Check if journey exists
            if not journey:
                return jsonify({'status': 404, 'message': 'Journey not found'}), 404


            # Calculate time taken for the journey

            # Extract start time and end time from the journey object
            date =  journey.dateCreated
            start_time = journey.startTime
            end_time = journey.endTime

            # Check if start time or end time is missing
            if not start_time or not end_time:
                return jsonify({'status': 400, 'message': 'Start time or end time missing for this journey'}), 400

            # Calculate the time difference in seconds between start time and end time
            start_seconds = start_time.hour * 3600 + start_time.minute * 60 + start_time.second
            end_seconds = end_time.hour * 3600 + end_time.minute * 60 + end_time.second
            time_diff_seconds = end_seconds - start_seconds

            # breakdown time difference to hours, minutes, and seconds
            hours = time_diff_seconds // 3600
            minutes = (time_diff_seconds % 3600) // 60
            seconds = (time_diff_seconds % 3600) % 60

            # Add time data to the temporary dictionary
            temp_dictionary["date"] = date
            temp_dictionary["hours_taken"] = hours
            temp_dictionary["minutes_taken"] = minutes
            temp_dictionary["seconds_taken"] = seconds


            # Calculate calories burned for the journey

            # MET(metabolic equivalent of task) x Body Weight(kg) x Duration(hours)
            exact_hours = time_diff_seconds / 3600
            average_weight = 62

            if journey.type == "Walk":
                MET = 3.6
            elif journey.type == "Run":
                MET = 9
            else:
                MET = 7

            calories_burned = MET * average_weight * exact_hours

            # Add calories burned data to the temporary dictionary
            temp_dictionary["caloriesBurned"] = calories_burned


            # Add distance data to the temporary dictionary
            distance = journey.totalDistance
            temp_dictionary["totalDistance"]  = distance


            # Calculate average speed for the journey
            mph = (distance // (time_diff_seconds / 3600))
            temp_dictionary["averageSpeed"] = mph

            # Add mode of transport of journey to the temporary dictionary
            mode = journey.type
            temp_dictionary["mode"] = mode

            # Add journey ID data to the temporary dictionary
            journeyID = journey.id
            temp_dictionary["journeyId"] = journeyID

            # Append the journeys data to the journeysData list
            journeysData.append(temp_dictionary)


            # Update totals for each mode
            if journey.type == "Walk":
                total_distance_walking += distance
                total_calories_burned_walking += calories_burned
                total_time_in_seconds_walking += time_diff_seconds

            elif journey.type == "Run":
                total_distance_running += distance
                total_calories_burned_running += calories_burned
                total_time_in_seconds_running += time_diff_seconds

            else:
                total_distance_cycling += distance
                total_calories_burned_cycling += calories_burned
                total_time_in_seconds_cycling += time_diff_seconds


        # Calculate total time for each mode
        total_time_taken_hours_walking = total_time_in_seconds_walking // 3600
        total_time_taken_minutes_walking = (total_time_in_seconds_walking % 3600) // 60
        total_time_taken_seconds_walking = (total_time_in_seconds_walking % 3600) % 60


        total_time_taken_hours_running = total_time_in_seconds_running // 3600
        total_time_taken_minutes_running = (total_time_in_seconds_running % 3600) // 60
        total_time_taken_seconds_running = (total_time_in_seconds_running % 3600) % 60


        total_time_taken_hours_cycling = total_time_in_seconds_walking // 3600
        total_time_taken_minutes_cycling = (total_time_in_seconds_walking % 3600) // 60
        total_time_taken_seconds_cycling = (total_time_in_seconds_walking % 3600) % 60

        # Initialize dictionaries to store data for each mode
        byModes = {}
        cycle = {}
        walking = {}
        running = {}

        cycle["totalDistance"] = total_distance_cycling
        cycle["totalCaloriesBurned"] = total_calories_burned_cycling
        cycle["totalTimeWorkingOutHours"] = total_time_taken_hours_cycling
        cycle["totalTimeWorkingOutMinutes"] = total_time_taken_minutes_cycling
        cycle["totalTimeWorkingOutSeconds"] = total_time_taken_seconds_cycling

        walking["totalDistance"] = total_distance_walking
        walking["totalCaloriesBurned"] = total_calories_burned_walking
        walking["totalTimeWorkingOutHours"] = total_time_taken_hours_walking
        walking["totalTimeWorkingOutMinutes"] = total_time_taken_minutes_walking
        walking["totalTimeWorkingOutSeconds"] = total_time_taken_seconds_walking

        running["totalDistance"] = total_distance_running
        running["totalCaloriesBurned"] = total_calories_burned_running
        running["totalTimeWorkingOutHours"] = total_time_taken_hours_running
        running["totalTimeWorkingOutMinutes"] = total_time_taken_minutes_running
        running["totalTimeWorkingOutSeconds"] = total_time_taken_seconds_running

        # Add each mode of transports dictionary to byModes
        byModes["Cycle"] = cycle
        byModes["Walk"] = walking
        byModes["Run"] = running

        # Calculate totals for all journeys

        total_distance_all_journeys = total_distance_cycling + total_distance_walking + total_distance_running
        total_calories_burned_all_journeys = total_calories_burned_cycling + total_calories_burned_walking + total_calories_burned_running

        total_time_app_used = total_time_in_seconds_walking + total_time_in_seconds_running + total_time_in_seconds_cycling
        total_time_taken_hours_total = total_time_app_used // 3600
        total_time_taken_minutes_total = (total_time_app_used % 3600) // 60
        total_time_taken_seconds_total = (total_time_app_used % 3600) % 60

        # Create final data dictionary, this will contain all the other data for a user and their journeys
        data = {}

        # fill data dictionary with the relevant data
        data["journeysData"] = journeysData
        data["byModes"] = byModes
        data["totalDistanceCombined"] = total_distance_all_journeys
        data["totalCaloriesBurned"] = total_calories_burned_all_journeys
        data["totalTimeWorkingOutHours"] = total_time_taken_hours_total
        data["totalTimeWorkingOutMinutes"] = total_time_taken_minutes_total
        data["totalTimeWorkingOutSeconds"] = total_time_taken_seconds_total

        # Return status, indicating successful completion of Api, and the data dictionary
        return jsonify({'status': 200, 'data': data}), 200













