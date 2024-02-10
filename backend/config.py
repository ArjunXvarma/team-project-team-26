# Configuration for the database
import os
basedir = os.path.abspath(os.path.dirname(__file__))
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db')
SECRET_KEY = "MY_SECRET_KEY"
SQLALCHEMY_TRACK_MODIFICATIONS = True
