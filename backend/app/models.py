from datetime import datetime
from app import db

# Association table for many-to-many relationship between users and roles
user_roles = db.Table('user_roles',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('role_id', db.Integer, db.ForeignKey('role.id'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80))
    email = db.Column(db.String(80), nullable=False, unique=True)
    date_of_birth = db.Column(db.DateTime, nullable=False)

    hashed_password = db.Column(db.String(300), nullable=False)
    # Establish relationship with roles
    roles = db.relationship('Role', secondary=user_roles, 
                            backref=db.backref('users', lazy='dynamic'))
    journeys = db.relationship('Journey', backref='user', lazy=True)

class Role(db.Model):
    __tablename__ = 'role'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

class Journey(db.Model):
    __tablename__ = 'journey'
    
    id = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    gpxData = db.Column(db.String, nullable=False)
    startTime = db.Column(db.Time, nullable=False)
    endTime = db.Column(db.Time, nullable=False)
    dateCreated = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
class Admin(db.Model):
    __tablename__ = 'admin'
    
    id = db.Column(db.Integer, primary_key=True)
    isAdmin = db.Column(db.Boolean, nullable=False, default=False)
