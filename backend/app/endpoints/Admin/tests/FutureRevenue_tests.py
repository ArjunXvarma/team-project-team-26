from app.endpoints.imports import imports

# Initialize bcrypt
bcrypt = imports.Bcrypt(imports.app)

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
        result = imports.generateFutureRevenueData(self.requestDataMonthly, 'month')
        assert len(result['future_revenues']) == 12
        assert result['frequency'] == 'month'

    def test_generate_future_revenue_weekly(self):
        result = imports.generateFutureRevenueData(self.requestDataWeekly, 'week')
        assert len(result['future_revenues']) == 52
        assert result['frequency'] == 'week'

    def test_generate_future_revenue_empty_data_monthly(self):
        result = imports.generateFutureRevenueData([], 'month')
        assert len(result) == 0

    def test_generate_future_revenue_empty_data_weekly(self):
        result = imports.generateFutureRevenueData([], 'week')
        assert len(result) == 0

    def test_generate_future_revenue_invalid_frequency(self):
        result = imports.generateFutureRevenueData(self.requestDataMonthly, 'daily')
        assert result == []
