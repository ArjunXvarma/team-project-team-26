from app import app, db, models
from flask import Flask, request, jsonify, Response
from flask_bcrypt import Bcrypt
from typing import Tuple
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import (
    create_access_token, get_jwt, get_jwt_identity,
    unset_jwt_cookies, jwt_required
)
import json
import constants

from apscheduler.schedulers.background import BackgroundScheduler

from functools import wraps

bcrypt = Bcrypt(app)

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

        access_token = create_access_token(identity=email, expires_delta=timedelta(days=1))
        full_user_name = (new_user.first_name+" "+new_user.last_name)
        response = jsonify({
            "return_code": 1,
            "id": new_user.id,
            "name": full_user_name,
        })
        response.set_cookie('access_token', value=access_token, httponly=True, expires=datetime.now() + timedelta(days=1))
        return response, 200

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
            return jsonify({"return_code": 0, "error": "No JSON Data found"}), 400

        password = data.get("password")
        email = data.get("email")

        # Check if any required fields are missing
        if not all([password, email]):
            return jsonify({"return_code": 0, "error": "Missing Required Fields"}), 400

        user = models.User.query.filter_by(email=email).first()
        if user is None:
            return jsonify({"return_code": 0, "error": "User Not found with the given Email"}), 404
            
        if not bcrypt.check_password_hash(user.hashed_password, password):
            return jsonify({"return_code": 1, "error": "Incorrect password, please try again"}), 401

        access_token = create_access_token(identity=email, expires_delta=timedelta(days=1))
        full_user_name = (user.first_name+" "+user.last_name)
        response = jsonify({
            "return_code": 2,
            "id": user.id,
            "name": full_user_name,
        })
        response.set_cookie('access_token', value=access_token, httponly=True, expires=datetime.now() + timedelta(days=1))
        return response, 200

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
        return response, 200
    
class GPSRoutes:
    """
    Class for querying the journey data.

    Attributes
    ----------
    None

    Methods
    -------
    getJournies(userId) -> json:
        returns the journies of a user.
    createJourny() -> json:
        creates a journey for a user.
    deleteJourney(journeyId) -> json:
        deletes a particular journey.
    updateJourney(journeyId) -> json:
        updates the data of a particular journey.
    """

    @app.route("/get_journies_of_user", methods=["GET"])
    @jwt_required()
    def getJournies() -> Tuple[dict, int]:
        """
        Returns all the journies of a user.

        Parameters
        ----------
        userId : int
            The user for which you want to query the journies.

        Returns
        -------
        Json
            A JSON object that contains the userId and an array of all 
            the journies that belong to the user.

        Notes
        -----
        If there are no journies that belong to the user a 404 error will be sent as there was no
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
            journey_data.append({
                'id': journey.id,
                'gpxData': json.loads(journey.gpxData) if journey.gpxData else None,
                'startTime': journey.startTime.strftime('%H:%M:%S') if journey.startTime else None,
                'endTime': journey.endTime.strftime('%H:%M:%S') if journey.endTime else None,
                'dateCreated': journey.dateCreated.strftime('%d-%m-%Y') if journey.dateCreated else None,
            })

        if journey_data:
            return jsonify({'status': 200, 'data': {
                'userId': user.id,
                'journies': journey_data
            }}), 200
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

        try:
            if 'startTime' in data:
                data['startTime'] = datetime.strptime(data['startTime'], '%H:%M:%S').time()
            if 'endTime' in data:
                data['endTime'] = datetime.strptime(data['endTime'], '%H:%M:%S').time()
            if 'dateCreated' in data:
                data['dateCreated'] = datetime.strptime(data['dateCreated'], '%d-%m-%Y').date()
        except ValueError as e:
            return jsonify({'status': 400, 'message': 'Invalid date/time format'}), 400

        journey = models.Journey(
            userId=user.id,  
            gpxData=data.get('gpxData'),  
            startTime=data.get('startTime'),  
            endTime=data.get('endTime'),  
            dateCreated=data.get('dateCreated')  
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
        
        journies = models.Journey.query.filter_by(userId=user.id).all()

        for journey in journies:
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

        try:
            if 'startTime' in data:
                data['startTime'] = datetime.strptime(data['startTime'], '%H:%M:%S').time()
            if 'endTime' in data:
                data['endTime'] = datetime.strptime(data['endTime'], '%H:%M:%S').time()
            if 'dateCreated' in data:
                data['dateCreated'] = datetime.strptime(data['dateCreated'], '%d-%m-%Y').date()

        except ValueError as e:
            return jsonify({'status': 400, 'message': 'Invalid date/time format'}), 400

        # Update the journey object with new data if available
        if 'gpxData' in data:
            journey.gpxData = data['gpxData']
        if 'startTime' in data:
            journey.startTime = data['startTime']
        if 'endTime' in data:
            journey.endTime = data['endTime']
        if 'dateCreated' in data:
            journey.dateCreated = data['dateCreated']

        db.session.commit()

        return jsonify({'status': 200, 'message': 'Journey updated successfully'}), 200
class SubscriptionRoutes:
    """
    Class for handling subscription routes.

    Attributes
    ----------
    None

    Methods
    -------
    buy_subscription() -> json:
        Allows a user to purchase a subscription.
    remove_subscription() -> json:
        Removes the active subscription of a user.
    modify_subscription() -> json:
        Modifies the active subscription of a user.
    """

    @app.route("/buy_subscription", methods=["POST"])
    @jwt_required()
    def buy_subscription() -> Tuple[Response, int]:
        """
        Allows a user to purchase a subscription.

        Parameters
        ----------
        subscription_type : str
            Type of subscription to purchase.
        duration : str
            Duration of the subscription ('Monthly' or 'Annually').
        mode_of_payment : str
            Mode of payment for the subscription.

        Returns
        -------
        json
            A JSON response indicating success or failure of the subscription purchase.
        """
        user_id = get_jwt_identity()
        data = request.json
        if not data:
            return jsonify({"return_code": 0, "error": "No JSON Data found"}), 400

        subscription_type = data.get("subscription_type")
        duration = data.get("duration")
        mode_of_payment = data.get("mode_of_payment")
        
        # Check if any required fields are missing
        if not all([subscription_type, duration, mode_of_payment]):
            return jsonify({"return_code": 0, "error": "Missing Required Fields"}), 400

        # Check if user already has an active subscription
        user_subscription = models.Subscription.query.filter_by(user_id=user_id, is_active=True).first()
        if user_subscription:
            return jsonify({"return_code": 0, "error": "User already has an active subscription"}), 400

        # Calculate start and end dates based on duration
        start_date = datetime.now()
        if duration.lower() == 'monthly':
            end_date = start_date + timedelta(days=30)
        elif duration.lower() == 'annually':
            end_date = start_date + timedelta(days=365)
        else:
            return jsonify({"return_code": 0, "error": "Invalid duration"}), 400
        
        if mode_of_payment not in constants.VALID_PAYMENT_METHODS:
            return jsonify({"return_code": 0, "error": "Invalid mode of payment"}), 400

        # Create new subscription with auto_renew set to True by default
        new_subscription = models.Subscription(
            user_id=user_id,
            subscription_type=subscription_type,
            duration=duration,
            start_date=start_date,
            end_date=end_date,
            mode_of_payment=mode_of_payment,
            is_active=True,
            auto_renew=True 
        )
        db.session.add(new_subscription)
        db.session.commit()

        return jsonify({"return_code": 1, "message": "Subscription purchased successfully"}), 200
    
    @app.route("/cancel_subscription", methods=["DELETE"])
    @jwt_required()
    def cancel_subscription() -> Tuple[Response, int]:
        """
        Adjusts the active subscription of a user based on the current date.
        If the current date is before the end date, auto renew is turned off.
        If the current date is on or after the end date, the subscription is cancelled.

        Returns
        -------
        json
            A JSON response indicating the success or failure of the operation.
        """
        user_id = get_jwt_identity()

        subscription = models.Subscription.query.filter_by(user_id=user_id, is_active=True).first()
        if not subscription:
            return jsonify({"return_code": 0, "error": "User does not have an active subscription"}), 400

        current_date = datetime.utcnow()
        if current_date < subscription.end_date:
            # Only turn off auto-renew if the current date is before the end date
            subscription.auto_renew = False
            message = "Auto-renew disabled successfully."
        else:
            # Deactivate the subscription if the current date is on or after the end date
            subscription.is_active = False
            subscription.auto_renew = False
            message = "Subscription cancelled and auto-renew disabled successfully."

        db.session.commit()

        return jsonify({"return_code": 1, "message": message}), 200
    
    @jwt_required()
    @app.route("/modify_subscription", methods=["PUT"])
    def modify_subscription() -> Tuple[Response, int]:
        """
        Modifies the active subscription of a user.

        Parameters
        ----------
        subscription_type : str
            Type of subscription to modify.
        duration : str
            Duration of the modified subscription ('Monthly' or 'Annually').
        mode_of_payment : str
            Mode of payment for the modified subscription.

        Returns
        -------
        json
            A JSON response indicating success or failure of the subscription modification.
        """
        user_id = get_jwt_identity()
        data = request.json
        if not data:
            return jsonify({"return_code": 0, "error": "No JSON Data found"}), 400

        subscription_type = data.get("subscription_type")
        duration = data.get("duration")
        mode_of_payment = data.get("mode_of_payment")

        # Check if any required fields are missing
        if not all([subscription_type, duration, mode_of_payment]):
            return jsonify({"return_code": 0, "error": "Missing Required Fields"}), 400

        # Find the user and their active subscription
        user = models.User.query.get(user_id)
        if not user.subscription or not user.subscription.is_active:
            return jsonify({"return_code": 0, "error": "User does not have an active subscription"}), 400

        # Calculate start and end dates based on duration
        start_date = datetime.now()
        if duration.lower() == 'monthly':
            end_date = start_date + timedelta(days=30)
        elif duration.lower() == 'annually':
            end_date = start_date + timedelta(days=365)
        else:
            return jsonify({"return_code": 0, "error": "Invalid duration"}), 400

        # Update subscription details
        user.subscription.subscription_type = subscription_type
        user.subscription.duration = duration
        user.subscription.start_date = start_date
        user.subscription.end_date = end_date
        user.subscription.mode_of_payment = mode_of_payment
        db.session.commit()

        return jsonify({"return_code": 1, "message": "Subscription modified successfully"}), 200

    def auto_renew_subscriptions():
        """
        Function to auto-renew subscriptions if today is the end date and auto renew is True.
        """
        current_date = datetime.utcnow()

        # Find subscriptions ending today and with auto renew enabled
        subscriptions_to_renew = models.Subscription.query.filter(models.Subscription.end_date == current_date, models.Subscription.auto_renew == True).all()

        for subscription in subscriptions_to_renew:
            # Update end date based on duration
            if subscription.duration.lower() == 'monthly':
                subscription.end_date += timedelta(days=30)
            elif subscription.duration.lower() == 'annually':
                subscription.end_date += timedelta(days=365)

        # Commit changes to the database
        db.session.commit()

    def deactivate_expired_subscriptions():
        """
        Function to deactivate subscriptions if today is the end date and auto renew is False.
        """
        current_date = datetime.utcnow()

        # Find subscriptions ending today and with auto renew disabled
        subscriptions_to_deactivate = models.Subscription.query.filter(models.Subscription.end_date == current_date, models.Subscription.auto_renew == False).all()

        for subscription in subscriptions_to_deactivate:
            # Deactivate the subscription
            subscription.is_active = False

        # Commit changes to the database
        db.session.commit()


# Running the auto renew and deactivation functions every day using scheduler.
scheduler = BackgroundScheduler()
scheduler.add_job(SubscriptionRoutes.auto_renew_subscriptions, 'cron', hour=16, minute=0)
scheduler.add_job(SubscriptionRoutes.deactivate_expired_subscriptions, 'cron', hour=16, minute=0)
scheduler.start()