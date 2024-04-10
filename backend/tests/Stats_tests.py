from app import models, app, db
from datetime import datetime, timedelta
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
import pytest
import constants
from app.Client.GPS import GPSRoutes
from app.Client.Auth import AuthenticationRoutes
from app.Client.Friends import FriendshipRoutes
from app.Client.Membership import MembershipRoutes
from app.Client.Stats import StatisticsRoutes
from revenuePrediction import generateFutureRevenueData
from tests.TestUsers import users

# Initialize bcrypt
bcrypt = Bcrypt(app)

class TestGetStats:
    '''Class for testing getStats api functionality'''

    def test_stats_with_JWT(self, client, clean_db):
        # get stats user token
        token = users.user1(self, client, clean_db)[0]

        # Test if getStats runs successfully success, return status code 200
        response = client.get("/getStats", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200

    def test_stats_without_JWT(self, client, clean_db):

        response = client.get("/getStats")
        assert response.status_code == 401

    def test_stats_byModes_cycle(self, client, clean_db):

         # get stats user token
        token = users.user1(self, client, clean_db)[0]

        # Test if the getStats api returns correct data for byModes: cycling
        response = client.get("/getStats", headers={"Authorization": f"Bearer {token}"})
        assert response.json["data"]["byModes"]["cycle"]["totalDistance"] == 8
        assert response.json["data"]["byModes"]["cycle"]["totalCaloriesBurned"] == 651
        assert response.json["data"]["byModes"]["cycle"]["totalTimeWorkingOutHours"] == 0
        assert response.json["data"]["byModes"]["cycle"]["totalTimeWorkingOutMinutes"] == 45
        assert response.json["data"]["byModes"]["cycle"]["totalTimeWorkingOutSeconds"] == 0

    def test_stats_byModes_running(self, client, clean_db):

         # get stats user token
        token = users.user1(self, client, clean_db)[0]

        # Test if the getStats api returns correct data for byModes: running
        response = client.get("/getStats", headers={"Authorization": f"Bearer {token}"})
        assert response.json["data"]["byModes"]["running"]["totalDistance"] == 5
        assert response.json["data"]["byModes"]["running"]["totalCaloriesBurned"] == 418.5
        assert response.json["data"]["byModes"]["running"]["totalTimeWorkingOutHours"] == 0
        assert response.json["data"]["byModes"]["running"]["totalTimeWorkingOutMinutes"] == 45
        assert response.json["data"]["byModes"]["running"]["totalTimeWorkingOutSeconds"] == 0

    def test_stats_byModes_walking(self, client, clean_db):

         # get stats user token
        token = users.user1(self, client, clean_db)[0]

        # Test if the getStats api returns correct data for byModes: walking
        response = client.get("/getStats", headers={"Authorization": f"Bearer {token}"})
        assert response.json["data"]["byModes"]["walking"]["totalDistance"] == 3.5
        assert response.json["data"]["byModes"]["walking"]["totalCaloriesBurned"] == 167.4
        assert response.json["data"]["byModes"]["walking"]["totalTimeWorkingOutHours"] == 0
        assert response.json["data"]["byModes"]["walking"]["totalTimeWorkingOutMinutes"] == 45
        assert response.json["data"]["byModes"]["walking"]["totalTimeWorkingOutSeconds"] == 0

    def test_stats_journeyData(self, client, clean_db):

         # get stats user token
        token = users.user1(self, client, clean_db)[0]

        # Test if the getStats api returns correct data for journeysData[0]
        response = client.get("/getStats", headers={"Authorization": f"Bearer {token}"})

        assert response.json["data"]["journeysData"][0]["averageSpeed"] == 6
        assert response.json["data"]["journeysData"][0]["caloriesBurned"] == 418.5
        assert response.json["data"]["journeysData"][0]["hours_taken"] == 0
        assert response.json["data"]["journeysData"][0]["journeyId"] == 1
        assert response.json["data"]["journeysData"][0]["mode"] == "Running"
        assert response.json["data"]["journeysData"][0]["totalDistance"] == 5

    def test_stats_totals_for_user(self, client, clean_db):

         # get stats user token
        token = users.user1(self, client, clean_db)[0]

        # Test if the getStats api returns correct values for the users total Stats, all journeys combined
        response = client.get("/getStats", headers={"Authorization": f"Bearer {token}"})

        assert response.json["data"]["totalCaloriesBurned"] == 1236.9
        assert response.json["data"]["totalDistanceCombined"] == 16.5
        assert response.json["data"]["totalTimeWorkingOutHours"] == 3
        assert response.json["data"]["totalTimeWorkingOutMinutes"] == 0
        assert response.json["data"]["totalTimeWorkingOutSeconds"] == 0



    def test_stats_friend_with_JWT(self, client, clean_db):
        # get stats user token
        token = users.user1(self, client, clean_db)[0]

        # Test if getStats runs successfully success, return status code 200
        url = 'http://127.0.0.1:5000/get_friends_stats?friend=bob@example.com'
        response = client.get(url, headers={'Authorization': f'Bearer {token}'})
        assert response.status_code == 200

    def test_stats_friend_without_JWT(self, client, clean_db):

        url = 'http://127.0.0.1:5000/get_friends_stats?friend=bob@example.com'
        response = client.get(url)
        assert response.status_code == 401

    def test_stats_friend_byModes_cycle(self, client, clean_db):

         # get stats user token
        token = users.user1(self, client, clean_db)[0]

        # Test if the getStats api returns correct data for byModes: cycling
        url = 'http://127.0.0.1:5000/get_friends_stats?friend=bob@example.com'
        response = client.get(url, headers={'Authorization': f'Bearer {token}'})
        assert response.json["data"]["byModes"]["cycle"]["totalDistance"] == 8
        assert response.json["data"]["byModes"]["cycle"]["totalCaloriesBurned"] == 651
        assert response.json["data"]["byModes"]["cycle"]["totalTimeWorkingOutHours"] == 0
        assert response.json["data"]["byModes"]["cycle"]["totalTimeWorkingOutMinutes"] == 45
        assert response.json["data"]["byModes"]["cycle"]["totalTimeWorkingOutSeconds"] == 0

    def test_stats_friend_byModes_running(self, client, clean_db):

         # get stats user token
        token = users.user1(self, client, clean_db)[0]

        # Test if the getStats api returns correct data for byModes: running
        url = 'http://127.0.0.1:5000/get_friends_stats?friend=bob@example.com'
        response = client.get(url, headers={'Authorization': f'Bearer {token}'})
        assert response.json["data"]["byModes"]["running"]["totalDistance"] == 5
        assert response.json["data"]["byModes"]["running"]["totalCaloriesBurned"] == 418.5
        assert response.json["data"]["byModes"]["running"]["totalTimeWorkingOutHours"] == 0
        assert response.json["data"]["byModes"]["running"]["totalTimeWorkingOutMinutes"] == 45
        assert response.json["data"]["byModes"]["running"]["totalTimeWorkingOutSeconds"] == 0

    def test_stats_friend_byModes_walking(self, client, clean_db):

         # get stats user token
        token = users.user1(self, client, clean_db)[0]

        # Test if the getStats api returns correct data for byModes: walking
        url = 'http://127.0.0.1:5000/get_friends_stats?friend=bob@example.com'
        response = client.get(url, headers={'Authorization': f'Bearer {token}'})
        assert response.json["data"]["byModes"]["walking"]["totalDistance"] == 3.5
        assert response.json["data"]["byModes"]["walking"]["totalCaloriesBurned"] == 167.4
        assert response.json["data"]["byModes"]["walking"]["totalTimeWorkingOutHours"] == 0
        assert response.json["data"]["byModes"]["walking"]["totalTimeWorkingOutMinutes"] == 45
        assert response.json["data"]["byModes"]["walking"]["totalTimeWorkingOutSeconds"] == 0

    def test_stats_friend_journeyData(self, client, clean_db):

         # get stats user token
        token = users.user1(self, client, clean_db)[0]

        # Test if the getStats api returns correct data for journeysData[0]
        url = 'http://127.0.0.1:5000/get_friends_stats?friend=bob@example.com'
        response = client.get(url, headers={'Authorization': f'Bearer {token}'})

        assert response.json["data"]["journeysData"][0]["averageSpeed"] == 6
        assert response.json["data"]["journeysData"][0]["caloriesBurned"] == 418.5
        assert response.json["data"]["journeysData"][0]["hours_taken"] == 0
        assert response.json["data"]["journeysData"][0]["journeyId"] == 4
        assert response.json["data"]["journeysData"][0]["mode"] == "Running"
        assert response.json["data"]["journeysData"][0]["totalDistance"] == 5

    def test_stats_friend_totals_for_user(self, client, clean_db):

         # get stats user token
        token = users.user1(self, client, clean_db)[0]

        # Test if the getStats api returns correct values for the users total Stats, all journeys combined
        url = 'http://127.0.0.1:5000/get_friends_stats?friend=bob@example.com'
        response = client.get(url, headers={'Authorization': f'Bearer {token}'})

        assert response.json["data"]["totalCaloriesBurned"] == 1236.9
        assert response.json["data"]["totalDistanceCombined"] == 16.5
        assert response.json["data"]["totalTimeWorkingOutHours"] == 3
        assert response.json["data"]["totalTimeWorkingOutMinutes"] == 0
        assert response.json["data"]["totalTimeWorkingOutSeconds"] == 0