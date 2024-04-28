from app.endpoints.imports import imports
# Initialize bcrypt
bcrypt = imports.Bcrypt(imports.app)

class users:
    """Class that initializes users for test cases"""

    def user1(self, client, clean_db):
        """function creates 2 users that have journeys and are friends"""
        # create first user
        user = imports.models.User(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            date_of_birth=imports.datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add(user)
        clean_db.session.commit()

        # Login as the user
        login_response = client.post("/login", json={
            "email": "john.doe@example.com",
            "password": "password"
        })
        # Get token
        token = login_response.json['session_token']

        id = user.id

        # Create a Journey to test with
        journey_data = {
            "name": "Morning Run",
            "type": "Run",
            "totalDistance": 5.0,
            "elevation": {
                "avg": 120,
                "min": 100,
                "max": 140
            },
            "points": [
                {"lat": 38.5, "lon": -120.2, "ele": 100},
                {"lat": 38.6, "lon": -120.3, "ele": 110}
            ],
            "startTime": "07:30:00",
            "endTime": "08:15:00",
            "dateCreated": "2024-03-12"
        }

        journey_data_2 = {
            "name": "Evening Walk",
            "type": "Walk",
            "totalDistance": 3.5,
            "elevation": {
                "avg": 90,
                "min": 80,
                "max": 100
            },
            "points": [
                {"lat": 38.7, "lon": -120.1, "ele": 95},
                {"lat": 38.8, "lon": -120.4, "ele": 85}
            ],
            "startTime": "18:00:00",
            "endTime": "18:45:00",
            "dateCreated": "2024-03-12"
        }

        journey_data_3 = {
            "name": "Afternoon Cycling",
            "type": "Cycle",
            "totalDistance": 8.0,
            "elevation": {
                "avg": 110,
                "min": 100,
                "max": 120
            },
            "points": [
                {"lat": 38.6, "lon": -120.0, "ele": 105},
                {"lat": 38.7, "lon": -120.5, "ele": 115}
            ],
            "startTime": "14:00:00",
            "endTime": "15:30:00",
            "dateCreated": "2024-03-13"
        }

        # Create journeys using the provided journey data
        r1 = client.post("/create_journey", json=journey_data, headers={"Authorization": f"Bearer {token}"})
        r2 = client.post("/create_journey", json=journey_data_2, headers={"Authorization": f"Bearer {token}"})
        r3 = client.post("/create_journey", json=journey_data_3, headers={"Authorization": f"Bearer {token}"})

        # create second user
        user2 = imports.models.User(
            first_name="Bob",
            last_name="Johnson",
            email="bob@example.com",
            date_of_birth=imports.datetime(1991, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add_all([user, user2])
        clean_db.session.commit()

        # Login as the user
        login_response = client.post("/login", json={
            "email": "bob@example.com",
            "password": "password"
        })
        # Get token
        token2 = login_response.json['session_token']

        id2 = user2.id

        # Create journeys using the provided journey data
        r4 = client.post("/create_journey", json=journey_data, headers={"Authorization": f"Bearer {token2}"})
        r5 = client.post("/create_journey", json=journey_data_2, headers={"Authorization": f"Bearer {token2}"})
        r6 = client.post("/create_journey", json=journey_data_3, headers={"Authorization": f"Bearer {token2}"})

        # Create a friendship between user1 and user2
        friendship = imports.models.Friendship(requester_id=user.id, addressee_id=user2.id, status="accepted")
        clean_db.session.add(friendship)
        clean_db.session.commit()

        # return their tokens and ids so their accounts can be tested with
        return token, id, token2, id2

    def user2(self, client, clean_db):
        """ function creates user Alice for testing"""

        #create user
        user = imports.models.User(
            first_name="Alice",
            last_name="Smith",
            email="alice@example.com",
            date_of_birth=imports.datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )

        clean_db.session.add(user)
        clean_db.session.commit()

        # Login as the user
        login_response = client.post("/login", json={
            "email": "alice@example.com",
            "password": "password"
        })
        # Get token and id
        token = login_response.json['session_token']
        id = user.id

        return token, id
