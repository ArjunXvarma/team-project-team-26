# Importing all dependencies
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import ( 
    create_access_token,get_jwt,
    get_jwt_identity,
    unset_jwt_cookies, 
    jwt_required, 
    JWTManager,
)

# Initialising the flask app
app = Flask(__name__)
app.config.from_object('config')
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Initialising the JWT Tokens for Authentication
app.config["JWT_SECRET_KEY"] = "VERY-SECRET-JWT-KEY"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)

# Importing all the modules
from app import resources, models