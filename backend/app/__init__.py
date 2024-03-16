from flask import Flask, jsonify
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

from functools import wraps

from functools import wraps

# Initializing the flask app
app = Flask(__name__)
app.config.from_object('config')
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Initializing the JWT Tokens for Authentication
app.config["JWT_SECRET_KEY"] = "VERY-SECRET-JWT-KEY"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)

# Importing all the modules
from app import resources, models