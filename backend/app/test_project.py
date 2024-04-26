from app.imports import imports
from app.auth.tests.Signup_tests import TestSignup
from app.auth.tests.Login_tests import TestLogin
from app.gps.tests.GPS_tests import TestGPSRoutes
from app.friends.tests.Friendship_tests import TestFriendshipRoutes
from app.membership.tests.Membership_tests import TestMembershipRoutes
from app.Admin.tests.FutureRevenue_tests import TestGenerateFutureRevenueData
from app.stats.tests.Stats_tests import TestGetStats
# Initialize bcrypt
bcrypt = imports.Bcrypt(imports.app)

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