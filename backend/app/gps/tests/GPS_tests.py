from app.imports import imports

# Initialize bcrypt
bcrypt = imports.Bcrypt(imports.app)

class TestGPSRoutes:
    """Class for testing GPS routes functionality."""

    def test_validate_points(self):
        points_valid = [
            {'lat': 10, 'lon': 20, 'ele': 5},
            {'lat': 15, 'lon': 25, 'ele': 10}
        ]
        assert imports.GPSRoutes.validate_points(points_valid)[0] == True

    def validate_points_missing_keys(self):
        points_missing_key = [
            {'lat': 10, 'lon': 20, 'ele': 5},
            {'lat': 15, 'lon': 25}
        ]
        assert imports.GPSRoutes.validate_points(points_missing_key)[0] == False

    def validate_points_extra_keys(self):
        points_extra_key = [
            {'lat': 10, 'lon': 20, 'ele': 5},
            {'lat': 15, 'lon': 25, 'ele': 10, 'temp': 50}
        ]
        assert imports.GPSRoutes.validate_points(points_extra_key)[0] == False

    def validate_points_missing_and_extra_keys(self):
        points_missing_and_extra_keys = [
            {'lat': 10, 'lon': 20, 'ele': 5},
            {'lat': 15, 'temp': 50}
        ]
        assert imports.GPSRoutes.validate_points(points_missing_and_extra_keys)[0] == False

    def validate_points_empty(self):
        points_empty = []
        assert imports.GPSRoutes.validate_points(points_empty)[0] == False

    def validate_points_different_order(self):
        points_different_order = [
            {'ele': 5, 'lon': 20, 'lat': 10}
        ]
        assert imports.GPSRoutes.validate_points(points_different_order)[0] == True


    def test_get_journeys_without_jwt(self, client):
        """Test getting user journeys without a JWT."""
        response = client.get("/get_journeys_of_user")
        assert response.status_code == 401


    def test_get_journeys_with_jwt_success(self, client, clean_db):
        """Test successfully getting user journeys."""

        token = imports.users.user1(self, client, clean_db)[0]

        # Test if journey is returned successfuly
        response = client.get("/get_journeys_of_user", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200



    def test_get_journeys_with_no_journeys(self, client, clean_db):
        """ Test Error handling when getting a journey from an empty list"""

        # Creation of a user
        token = imports.users.user2(self, client, clean_db)[0]

        # Test getting a journey when none exist
        response = client.get("/get_journeys_of_user", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 404

    def test_create_journey_without_jwt(self, client):
        """Test creating a journey without a JWT."""

        # journey to be added
        journey_data = {
            "id": 1,
            "userId": 1,
            "gpxData": "{ \"coordinates\": [[1, 70], [20, 80], [3, 20]] }",
            "startTime": "21:00:00",
            "endTime": "23:00:00",
            "dateCreated": "15-09-2025"
        }

        # if there is a missing token, dont make journey
        response = client.post("/create_journey", json=journey_data)
        assert response.status_code == 401


    def test_create_journey_with_jwt(self, client, clean_db):
        """Test creating a journey with JWT."""

        token = imports.users.user1(self, client, clean_db)[0]

        # Journey to be added
        journey_data = {
            "name": "Morning Run",
            "type": "Running",
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

        # Test if journey is created successfully
        response = client.post("/create_journey", json=journey_data, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 201


    def test_create_journey_invalid_points_array(self, client, clean_db):
        """Test creating a journey with JWT and invalid data."""

        token = imports.users.user1(self, client, clean_db)[0]

        # Make a request with JWT, invalid Points array format
        journey_data = {
            "name": "Morning Run",
            "type": "Running",
            "totalDistance": 5.0,
            "elevation": {
                "avg": 120,
                "min": 100,
                "max": 140
            },
            "points": [
                {"lat": 38.5, "ele": 10000000},
                {"lon": -120.3, "ele": 110}
            ],
            "startTime": "07:30:00",
            "endTime": "08:15:00",
            "dateCreated": "2024-03-12"
        }

        # Test the output of creating a journey with invalid points data
        response = client.post("/create_journey", json=journey_data, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 400


    def test_create_journey_invalid_date_time(self, client, clean_db):
        """Test creating a journey with JWT and invalid data."""

        token = imports.users.user1(self, client, clean_db)[0]

        # Make a request with JWT, invalid Time and date data
        journey_data = {
            "name": "Morning Run",
            "type": "Running",
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
            "startTime": "30:00",
            "endTime": "080400",
            "dateCreated": "2024-0"
        }

        # Test output when creating a journey with invalid date and time formats
        response = client.post("/create_journey", json=journey_data, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 400


    def test_delete_journey_without_jwt(self, client):
        """Test deleting a journey without a JWT."""

        response = client.delete("/delete_journey/1")
        assert response.status_code == 401


    def test_delete_journey_with_jwt(self, client, clean_db):
        """Test deleting a journey with a JWT."""

        token = imports.users.user1(self, client, clean_db)[0]

        # Add a journey before deleting one
        journey_data = {
            "name": "Morning Run",
            "type": "Running",
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

        r1 = client.post("/create_journey", json=journey_data, headers={"Authorization": f"Bearer {token}"})

        # Test if journey is sucessfully deleted
        response = client.delete("/delete_journey/3", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200


    def test_delete_journey_non_existing_journey(self, client, clean_db):
        """Test deleting a journey that doesn't exist."""

        token = imports.users.user1(self, client, clean_db)[0]

        # Test if the program handles deleting a non existing journey successfully
        response = client.delete("/delete_journey/10", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 404


    def test_update_journey_without_jwt(self, client):
        """Test updating a journey without a JWT."""

        # fields to be updated
        journey_update_data = {
            "startTime": "10:00:00",
            "endTime": "11:00:00",
            "dateCreated": "2023-02-01"
        }

        # Test if attempting to update a journey without a token is handled correctly
        response = client.put("/update_journey/1", json=journey_update_data)
        assert response.status_code == 401


    def test_update_journey_with_jwt(self, client, clean_db):
        """Test updating a journey with a JWT."""

        token = imports.users.user1(self, client, clean_db)[0]

        # Fields to be updated
        journey_update_data = {
            "type": "Walking",
            "totalDistance": 2.0,
            "elevation": {
                "avg": 110,
                "min": 101,
                "max": 145
            },
            "points": [
                {"lat": 21.5, "lon": -110.2, "ele": 210},
                {"lat": 48.6, "lon": -123.3, "ele": 120}
            ]
        }

        # Test if journey is updated successfully
        response = client.put("/update_journey/1", json=journey_update_data, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200


    def test_update_journey_non_existing_journey(self, client, clean_db):
        """Test updating a journey that doesn't exist."""

        token = imports.users.user1(self, client, clean_db)[0]

        # Field to be updated, no journey exists
        journey_update_data = {
            "type": "Walking",
            "totalDistance": 2.0,
            "elevation": {
                "avg": 110,
                "min": 101,
                "max": 145
            },
            "points": [
                {"lat": 21.5, "lon": -110.2, "ele": 210},
                {"lat": 48.6, "lon": -123.3, "ele": 120}
            ]
        }

        # Test if updating a non existing journey is handled correctly
        response = client.put("/update_journey/10", json=journey_update_data, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 404



    def test_update_journey_invalid_date_time(self, client, clean_db):
        """Test updating a journey using invalid date and time formatted data."""

        token = imports.users.user1(self, client, clean_db)[0]

        # Fields to be updated, invalid date and time data
        journey_update_data = {
            "type": "Walking",
            "startTime": "07:3",
            "endTime": "08:1:00",
            "dateCreated": "20240312"
        }

        # Test if updating a journey with invalid data is handled correctly
        response = client.put("/update_journey/1", json=journey_update_data, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 400

