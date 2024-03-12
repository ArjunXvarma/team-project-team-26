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
    membership = db.relationship('Membership', backref='user', uselist=False)

class Membership(db.Model):
    __tablename__ = 'membership'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    membership_type = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.String(20), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    mode_of_payment = db.Column(db.String(50), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    auto_renew = db.Column(db.Boolean, default=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

class Role(db.Model):
    __tablename__ = 'role'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

# {
#     name: String
#     type: String
#     totalDistance: Number
#     elevation: {
#         avg: Number
#         min: Number
#         max: Number
#     }
#     points: [
#           lat: Number
#           lon: Number
#           ele: Number
#       ]
# }

class Journey(db.Model):
    __tablename__ = 'journey'
    
    id = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String, nullable=False)
    type = db.Column(db.String, nullable=False)
    totalDistance = db.Column(db.Float, nullable=False)
    
    avgEle = db.Column(db.Float, nullable=False)
    minEle = db.Column(db.Float, nullable=False)
    maxEle = db.Column(db.Float, nullable=False)
    
    points = db.Column(db.String, nullable=False)  
    
    startTime = db.Column(db.Time, nullable=False)
    endTime = db.Column(db.Time, nullable=False)
    dateCreated = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
class Admin(db.Model):
    __tablename__ = 'admin'
    
    id = db.Column(db.Integer, primary_key=True)
    isAdmin = db.Column(db.Boolean, nullable=False, default=False)

class Friendship(db.Model):
    __tablename__ = 'friendship'
    requester_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    addressee_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    status = db.Column(db.String(20), nullable=False, default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    requester = db.relationship('User', foreign_keys=[requester_id], backref=db.backref('sent_requests', lazy='dynamic'))
    addressee = db.relationship('User', foreign_keys=[addressee_id], backref=db.backref('received_requests', lazy='dynamic'))

# Create journey
# {
#     "name": "Morning Hike",
#     "type": "Hiking",
#     "totalDistance": 5.2,
#     "elevation": {
#         "avg": 150.5,
#         "min": 100,
#         "max": 200
#     },
#     "points": [
#         {"lat": 38.5, "lon": -120.2, "ele": 100},
#         {"lat": 40.7, "lon": -120.95, "ele": 150},
#         {"lat": 43.252, "lon": -126.453, "ele": 200}
#     ],
#     "startTime": "07:30:00",
#     "endTime": "09:30:00",
#     "dateCreated": "2024-03-14"
# }

# Update journey
# {
#   "name": "Evening Walk",
#   "type": "Walking",
#   "totalDistance": 3.5,
#   "elevation": {
#     "avg": 120.0,
#     "min": 100.0,
#     "max": 150.0
#   },
#   "points": [
#     {
#       "lat": 38.897957,
#       "lon": -77.036560,
#       "ele": 100.0
#     },
#     {
#       "lat": 38.898956,
#       "lon": -77.037560,
#       "ele": 110.0
#     },
#     {
#       "lat": 38.899955,
#       "lon": -77.038560,
#       "ele": 120.0
#     }
#   ],
#   "startTime": "18:00:00",
#   "endTime": "19:30:00",
#   "dateCreated": "15-03-2024"
# }

# Output
# {
#     "dateCreated": "2024-03-15",
#     "elevation": {
#         "avg": 150.5,
#         "max": 200.0,
#         "min": 100.0
#     },
#     "endTime": "19:30:00",
#     "id": 1,
#     "name": "Morning Hike",
#     "points": [
#         {
#             "ele": 100,
#             "lat": 38.5,
#             "lon": -120.2
#         },
#         {
#             "ele": 150,
#             "lat": 40.7,
#             "lon": -120.95
#         },
#         {
#             "ele": 200,
#             "lat": 43.252,
#             "lon": -126.453
#         }
#     ],
#     "startTime": "18:00:00",
#     "totalDistance": 5.2,
#     "type": "Hiking"
# }