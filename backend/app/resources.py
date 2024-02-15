from app import app, db, models
from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import (
    create_access_token, get_jwt, get_jwt_identity,
    unset_jwt_cookies, jwt_required
)
import json

bcrypt = Bcrypt(app)

class AuthenticationRoutes:
    """
    Class for handling authentication routes.
    """

    @app.route("/signup", methods=["POST"])
    def signup() -> json:
        """
        Registers a new user.
        """
        data = request.json
        if not data:
            return jsonify({"error": "No JSON Data found"}), 409

        password = data.get("password")
        email = data.get("email")
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        date_of_birth_str = data.get("date_of_birth")

        # Check if any required fields are missing
        if not all([password, email, first_name, last_name, date_of_birth_str]):
            return jsonify({"error": "Missing Required Fields"}), 400

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
    def login() -> json:
        """
        Logs in the user.
        """
        data = request.json
        if not data:
            return jsonify({"error": "No JSON Data found"}), 400

        password = data.get("password")
        email = data.get("email")

        # Check if any required fields are missing
        if not all([password, email]):
            return jsonify({"error": "Missing Required Fields"}), 400

        user = models.User.query.filter_by(email=email).first()
        if user is None:
            return jsonify({"return_code":0, "error": "User Not found with the given Email"}), 404
        
        if not bcrypt.check_password_hash(user.hashed_password, password):
            return jsonify({"return_code":1, "error": "Incorrect password, please try again"}), 401
       
        access_token = create_access_token(identity=email)
        return jsonify({
            "return_code": 2,
            "id": user.id,
            "name": (user.first_name+user.last_name),
            "session_token": access_token,
        }), 200

    @app.after_request
    def refresh_expiring_jwts(response):
        """
        Refreshes expiring JWTs.
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
    def logout() -> json:
        """
        Logs out the user.
        """
        response = jsonify({"msg": "logout successful"})
        unset_jwt_cookies(response)
        return response

