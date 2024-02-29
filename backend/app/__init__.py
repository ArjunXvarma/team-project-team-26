from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS, cross_origin
from sqlalchemy import func
from datetime import timedelta
from flask_jwt_extended import ( 
    JWTManager,
)

# Initialising the flask app
app = Flask(__name__)
app.config.from_object('config')
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Enabling CORS
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# Initialising the JWT Tokens for Authentication
app.config["JWT_SECRET_KEY"] = "VERY-SECRET-JWT-KEY"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)

# Importing all the modules
from app import resources, models