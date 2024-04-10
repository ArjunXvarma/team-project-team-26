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

class TestGenerateFutureRevenueData:
    """ Class for testing generateFutureRevenue function """

    # Ensure these are defined within the setUp method
    requestDataMonthly = [
        {'period': '2023-01', 'total_revenue': 1000, 'total_sold': 10},
        {'period': '2023-02', 'total_revenue': 1500, 'total_sold': 15},
    ]
    requestDataWeekly = [
        {'period': '2023-01', 'total_revenue': 500, 'total_sold': 5},
        {'period': '2023-02', 'total_revenue': 700, 'total_sold': 7},
    ]

    def test_generate_future_revenue_monthly(self):
        result = generateFutureRevenueData(self.requestDataMonthly, 'month')
        assert len(result['future_revenues']) == 12
        assert result['frequency'] == 'month'

    def test_generate_future_revenue_weekly(self):
        result = generateFutureRevenueData(self.requestDataWeekly, 'week')
        assert len(result['future_revenues']) == 52
        assert result['frequency'] == 'week'

    def test_generate_future_revenue_empty_data_monthly(self):
        result = generateFutureRevenueData([], 'month')
        assert len(result) == 0

    def test_generate_future_revenue_empty_data_weekly(self):
        result = generateFutureRevenueData([], 'week')
        assert len(result) == 0

    def test_generate_future_revenue_invalid_frequency(self):
        result = generateFutureRevenueData(self.requestDataMonthly, 'daily')
        assert result == []
