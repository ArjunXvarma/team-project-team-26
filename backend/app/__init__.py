from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy import func
from datetime import timedelta
from flask_jwt_extended import ( 
    JWTManager, jwt_required, get_jwt_identity, verify_jwt_in_request,
    create_access_token, get_jwt, unset_jwt_cookies
)

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

def current_user_is_admin(user_id):
    user = models.User.query.get(user_id)
    return user and any(role.name == 'admin' for role in user.roles)

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        if not current_user_is_admin(current_user_id):
            return jsonify({"error": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

# Importing all the modules
from app import resources, models