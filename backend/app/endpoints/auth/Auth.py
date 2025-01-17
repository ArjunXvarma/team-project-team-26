from app import (app, db, models, create_access_token,
    get_jwt, get_jwt_identity, unset_jwt_cookies, jwt_required, bcrypt
    )
from flask import request, jsonify, Response
from typing import Tuple
from datetime import datetime, timedelta, timezone
import json

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