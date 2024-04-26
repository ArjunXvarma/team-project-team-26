from flask import Flask, jsonify, make_response, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy import func
from datetime import timedelta
from flask_jwt_extended import (
    JWTManager, jwt_required, get_jwt_identity, verify_jwt_in_request,
    create_access_token, get_jwt, unset_jwt_cookies
)
from sqlalchemy import func, extract
from functools import wraps
from flask_bcrypt import Bcrypt

# Initializing the flask app
app = Flask(__name__)
app.config.from_object('config')
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Initializing the JWT Tokens for Authentication
app.config["JWT_SECRET_KEY"] = "VERY-SECRET-JWT-KEY"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)
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


# Importing all the modules
from app import models
from app.endpoints.Admin import Admin
from app.endpoints.auth import Auth
from app.endpoints.friends import Friends
from app.endpoints.stats import Stats
from app.endpoints.gps import GPS
from app.endpoints.membership import Membership