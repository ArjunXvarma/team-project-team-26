from config import SQLALCHEMY_DATABASE_URI
from app import db, app

# Creation of initial database
with app.app_context():
    db.create_all()