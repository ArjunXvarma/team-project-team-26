from app import db, app
from app.models import User, Role
from flask_bcrypt import Bcrypt
import datetime

bcrypt = Bcrypt(app)

# Admin user details
admin_email = "admin@gmail.com"
admin_password = "admin"
hashed_password = bcrypt.generate_password_hash(admin_password).decode('utf-8')
first_name = "Super"
last_name = "Admin"

def create_admin_role():
    admin_role = Role.query.filter_by(name='admin').first()
    if not admin_role:
        admin_role = Role(name='admin')
        db.session.add(admin_role)
        db.session.commit()
    return admin_role

def create_admin_user(admin_role):
    admin_user = User.query.filter_by(email=admin_email).first()
    if not admin_user:
        admin_user = User(
            email=admin_email,
            hashed_password=hashed_password,
            first_name=first_name,
            last_name=last_name,
            date_of_birth=datetime.datetime(1990, 1, 1)
        )
        admin_user.roles.append(admin_role)
        db.session.add(admin_user)
        db.session.commit()

with app.app_context():
    db.create_all()
    admin_role = create_admin_role()
    create_admin_user(admin_role)
