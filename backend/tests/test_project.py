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
from tests.Signup_tests import TestSignup
from tests.Login_tests import TestLogin
from tests.GPS_tests import TestGPSRoutes
from tests.Friendship_tests import TestFriendshipRoutes
from tests.Membership_tests import TestMembershipRoutes
from tests.FutureRevenue_tests import TestGenerateFutureRevenueData
from tests.Stats_tests import TestGetStats
# Initialize bcrypt
bcrypt = Bcrypt(app)

class TestAllBackend:
    def test_all_backend(self, client, clean_db):
        # Call functions from TestSignup class to test signup API's
        test_signup = TestSignup()

        # call functions from TestLogin class to test login API's
        test_login = TestLogin()

        # call functions from TestGPSRoutes class to test GPS routes API's
        test_GPS = TestGPSRoutes()

        # call functions from TestFriendshipRoutes class to test Friendship routes API's
        test_friends = TestFriendshipRoutes()

        # call functions from TestMembershipRoutes class to test membership API's
        test_membership = TestMembershipRoutes()

        # call functions from TestGenerateFutureRevenue class to test future revenue API's for admin user
        test_future_revenue = TestGenerateFutureRevenueData()

        # call functions from TestGetStats class to test user and journey statistics API's
        test_stats = TestGetStats()