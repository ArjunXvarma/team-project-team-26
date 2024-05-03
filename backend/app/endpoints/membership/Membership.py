import logging
from app import (app, db, models, get_jwt_identity, jwt_required)
from flask import request, jsonify, Response
from typing import Tuple
from datetime import datetime, timedelta
import constants
from apscheduler.schedulers.background import BackgroundScheduler

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

    update_membership() -> json:
        Updates the user's membership with specified details.

    cancel_membership() -> json:
        Cancels the auto renewal of membership of a user.

    has_active_membership() -> bool:
        Returns if a user has an active membership or not.

    next_billing_cycle_date() -> json:
        Retrieves the next billing cycle date for the user's active membership.
    
    get_current_membership() -> json:
        Returns the details about the active user membership
        
    get_pending_membership -> json:
        Returns the details about the next user membership if it exists.
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
            Duration of the membership (All valid durations defined in constants.py).
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

        current_date = datetime.now()
        if current_date < membership.end_date:
            membership.auto_renew = False
            message = "Auto-renew disabled successfully."
        else:
            membership.is_active = False
            membership.auto_renew = False
            message = "Membership cancelled and auto-renew disabled successfully."

        db.session.commit()

        return jsonify({"return_code": 1, "message": message}), 200

    @app.route("/update_membership", methods=["POST"])
    @jwt_required()
    def update_membership():
        """
        Update the user's membership with specified details.

        Parameters
        ----------
        membership_type : str
            Type of membership to update to (All types defined in constants.py).
        duration : str
            New duration of the membership (All valid durations defined in constants.py).
        auto_renew : bool, optional
            Flag indicating whether the membership should auto-renew (default is False).

        Returns
        -------
        json
            A JSON response indicating the success or failure of the membership update.
            If successful, returns:
                - "return_code": 1
                - "message": "Membership update scheduled successfully"
            If unsuccessful, returns:
                - "return_code": 0
                - "error": Details about the encountered error during membership update.

        HTTP Status Codes
        -----------------
        200 : OK
            Membership update scheduled successfully.
        400 : Bad Request
            - Missing required fields.
            - Invalid membership type or duration.
            - No active membership found for the user.
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
        if not all([membership_type, duration]):
            return jsonify({"return_code": 0, "error": "Missing Required Fields"}), 400

        # Check for active membership
        current_membership = models.Membership.query.filter_by(user_id=user.id, is_active=True).first()
        if not current_membership:
            return jsonify({"return_code": 0, "error": "No active membership found"}), 400

        # Validate membership type and duration
        if not constants.is_valid_membership_type(membership_type):
            return jsonify({"return_code": 0, "error": "Invalid membership type"}), 400
        if not constants.is_valid_duration(duration):
            return jsonify({"return_code": 0, "error": "Invalid duration"}), 400

        # Check for existing pending update
        existing_pending_update = models.PendingMembershipUpdate.query.filter_by(user_id=user.id).first()

        # If there's an existing pending update, overwrite it
        if existing_pending_update:
            existing_pending_update.membership_type = membership_type
            existing_pending_update.duration = duration
            existing_pending_update.auto_renew = data.get("auto_renew", True)
            current_membership.auto_renew = True
        else:
            # Create new pending update
            pending_update = models.PendingMembershipUpdate(
                user_id=user.id,
                membership_type=membership_type,
                duration=duration,
                auto_renew=data.get("auto_renew", True)
            )
            current_membership.auto_renew = True
            db.session.add(pending_update)

        # Commit changes to the database
        db.session.commit()

        return jsonify({"return_code": 1, "message": "Membership update scheduled successfully and auto renew is turned on"}), 200

    @app.route("/get_current_membership", methods=["GET"])
    @jwt_required()
    def get_current_membership() -> Tuple[Response, int]:
        """
        Retrieves the details of the user's current active membership.

        Returns
        -------
        json
            A JSON response containing the details of the current membership.
            If user has an active membership, returns:
                - "membership_type": Type of the membership (All types defined in constants.py).
                - "start_date": Start date of the membership in ISO format (e.g., "2024-04-26").
                - "end_date": End date of the membership in ISO format (e.g., "2025-04-26").
            If user does not have an active membership, returns:
                - "message": "User does not have an active membership."

        HTTP Status Codes
        -----------------
        200 : OK
            Membership details retrieved successfully.
        401 : Unauthorized
            Missing or invalid access token.
        """
        current_user_email = get_jwt_identity()
        if not current_user_email:
            return jsonify({"message": "Unauthorized"}), 401

        user = models.User.query.filter_by(email=current_user_email).first()
        if not user:
            return jsonify({"message": "User not found"}), 404

        # Check if user has an active membership
        active_membership = models.Membership.query.filter_by(user_id=user.id, is_active=True).first()

        if active_membership:
            membership_type = active_membership.membership_type
            start_date = active_membership.start_date.isoformat()
            end_date = active_membership.end_date.isoformat()
            membership_duration = active_membership.duration
            auto_renew = active_membership.auto_renew
            mode_of_payment = active_membership.mode_of_payment
            return jsonify({
                "membership_type": membership_type,
                "membership_duration":membership_duration,
                "mode_of_payment":mode_of_payment,
                "start_date": start_date,
                "end_date": end_date,
                "auto_renew": auto_renew,
            }), 200
        else:
            return jsonify({"message": "User does not have an active membership."}), 404

    @app.route("/get_billing_cycle_date", methods=["GET"])
    @jwt_required()
    def get_billing_cycle_date() -> Tuple[Response, int]:
        """
        Retrieves the next billing cycle date for the user's active membership.

        Returns
        -------
        json
            A JSON response containing the next billing cycle date.
            If user has an active membership, returns:
                - "next_billing_cycle_date": Date of the next billing cycle in ISO format (e.g., "2024-05-26").
            If user does not have an active membership, returns:
                - "next_billing_cycle_date": null

        HTTP Status Codes
        -----------------
        200 : OK
            Next billing cycle date retrieved successfully.
        401 : Unauthorized
            Missing or invalid access token.
        """
        current_user_email = get_jwt_identity()
        user = models.User.query.filter_by(email=current_user_email).first()

        # Check if user has an active membership
        active_membership = models.Membership.query.filter_by(user_id=user.id, is_active=True).first()

        if active_membership:
            next_billing_cycle_date = active_membership.end_date
            return jsonify({"next_billing_cycle_date": next_billing_cycle_date.isoformat()}), 200
        else:
            return jsonify({"next_billing_cycle_date": None}), 200


    @app.route("/get_pending_membership", methods=["GET"])
    @jwt_required()
    def get_pending_membership() -> Tuple[Response, int]:
        """
        Checks if the user has a pending membership update and returns the membership type if available.

        Returns
        -------
        json
            A JSON response indicating the pending membership type, if available.
            If there's a pending membership update, returns:
                - "pending_membership_type": Type of the pending membership.
            If no pending membership update is found, returns:
                - "pending_membership_type": null

        HTTP Status Codes
        -----------------
        200 : OK
            Pending membership checked successfully.
        401 : Unauthorized
            Missing or invalid access token.
        """
        current_user_email = get_jwt_identity()
        user = models.User.query.filter_by(email=current_user_email).first()

        if not user:
            return jsonify({"message": "User not found"}), 404

        # Check for a pending membership update
        pending_update = models.PendingMembershipUpdate.query.filter_by(user_id=user.id).first()

        if pending_update:
            pending_membership_type = pending_update.membership_type
            pending_membership_duration = pending_update.duration
            return jsonify({"pending_membership_type": pending_membership_type, "pending_membership_duration": pending_membership_duration}), 200
        else:
            return jsonify({"pending_membership_type": None}), 200

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
        with app.app_context():
            print(f"Auto-renew memberships job started at {datetime.now()}")
            current_date = datetime.now()
            memberships_to_renew = models.Membership.query.filter(models.Membership.end_date == current_date,  models.Membership.auto_renew == True).all()
            for membership in memberships_to_renew:
                # Check for pending updates
                print(f"Processing membership: {membership.id}")
                pending_update =  models.PendingMembershipUpdate.query.filter_by(user_id=membership.user_id).first()
                if pending_update:
                    membership.membership_type = pending_update.membership_type
                    membership.duration = pending_update.duration
                    membership.auto_renew = pending_update.auto_renew 
                    # Calculate new end_date based on duration... 
                    if pending_update.duration.lower() == 'monthly':
                        membership.end_date += timedelta(days=30)
                    elif pending_update.duration.lower() == 'annually':
                        membership.end_date += timedelta(days=365)
                    db.session.delete(pending_update) 

                else: # No pending update - proceed with normal renewal 
                    if membership.duration.lower() == 'monthly':
                        membership.end_date += timedelta(days=30)
                    elif membership.duration.lower() == 'annually':
                        membership.end_date += timedelta(days=365)
            db.session.commit()
            print("Auto-renew memberships job completed")
    
    def deactivate_expired_memberships():
        """
        Function to deactivate memberships if today is the end date and auto renew is False.
        """
        with app.app_context():
            print(f"Deactivate expired memberships job started at {datetime.now()}")
            current_date = datetime.now()

            memberships_to_deactivate =  models.Membership.query.filter( models.Membership.end_date == current_date,  models.Membership.auto_renew == False).all()
            for membership in memberships_to_deactivate:
                print(f"Deactivating membership: {membership.id}")
                membership.is_active = False
            db.session.commit()
            print("Deactivate expired memberships job completed")

# Running the auto renew and deactivation functions every day using scheduler.
scheduler = BackgroundScheduler()
scheduler.add_job(MembershipRoutes.auto_renew_memberships, 'cron', hour=00, minute=00)
scheduler.add_job(MembershipRoutes.deactivate_expired_memberships, 'cron', hour=00, minute=00)
scheduler.start()