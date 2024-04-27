from app import (app, db, models, get_jwt_identity, jwt_required)
from flask import Flask, request, jsonify, Response, make_response
from flask_bcrypt import Bcrypt
from typing import Tuple
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from constants import MembershipPriceMonthly, MembershipPriceAnnually
from app.endpoints.Admin.revenuePrediction import generateFutureRevenueData

bcrypt = Bcrypt(app)
def add_cors_headers(response=None):
    if response is None:
        response = make_response()
    origin = request.headers.get('Origin')
    if origin:
        response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


@app.before_request
def before_request():
    if request.method == 'OPTIONS':
        return add_cors_headers()

@app.after_request
def after_request(response):
    return add_cors_headers(response)


class AdminRoutes:
    """
    Class for handling all the admin related routes.

    Methods
    -------
    createAdminRole() -> (Role | Any):
        Assigns an admin role to an ordinary user.
    createAdminUser() -> Tuple[Response, int]:
        Allows the creation of an admin user.
    isUserAdmin() -> Tuple[Response, int]:
        Checks if a user has admin privileges.
    getAllUsers() -> Tuple[Response, int]:
        Returns all the users that are on the app.
    deleteUser(userId) -> Tuple[Response, int]:
        Deletes a user with the given user ID.
    displayRevenues() -> Tuple[Response, int]:
        Returns all the weekly revenues.
    """

    def createAdminRole():
        """
        Creates an 'admin' role in the database if it doesn't already exist.
        Returns:
            Role: The 'admin' role object.
        """

        admin_role = models.Role.query.filter_by(name='admin').first()
        if not admin_role:
            admin_role = models.Role(name='admin')
            db.session.add(admin_role)
            db.session.commit()
        return admin_role

    def getMembershipPrice(membershipType, duration):
        """
        Retrieves the price of a membership based on its type and duration.

        Args:
            membershipType (str): The type of membership.
            duration (str): The duration of the membership.

        Returns:
            float: The price of the specified membership type and duration.
        """

        membershipType = membershipType.upper()

        prices = {
            'BASIC': {
                'Monthly': MembershipPriceMonthly.BASIC_MONTHLY_PRICE.value,
                'Annually': MembershipPriceAnnually.BASIC_ANNUAL_PRICE.value,
            },
            'STANDARD': {
                'Monthly': MembershipPriceMonthly.STANDARD_MONTHLY_PRICE.value,
                'Annually': MembershipPriceAnnually.STANDARD_ANNUAL_PRICE.value,
            },
            'PREMIUM': {
                'Monthly': MembershipPriceMonthly.PREMIUM_MONTHLY_PRICE.value,
                'Annually': MembershipPriceAnnually.PREMIUM_ANNUAL_PRICE.value,
            },
        }

        return prices.get(membershipType, {}).get(duration, 0)

    @app.route('/admin/create_admin_user', methods=['POST'])
    @jwt_required()
    def createAdminUser() -> Tuple[Response, int]:
        """
        Creates an admin user with the provided details from the request.

        Returns:
            Tuple[Response, int]: JSON response indicating success or error, HTTP status code.
        """
        current_user_email = get_jwt_identity()
        current_user = models.User.query.filter_by(email=current_user_email).first()

        # Check if the current user exists and is an admin
        if not current_user or not any(role.name == 'admin' for role in current_user.roles):
            return jsonify({"status": 401, "error": "Unauthorized. Admin privileges required."}), 401

        data = request.json
        if not data:
            return jsonify({"status": 400, "error": "No JSON Data found"}), 400

        first_name = data.get("first_name")
        last_name = data.get("last_name")
        email = data.get("email")
        password = data.get("password")
        date_of_birth_str = data.get("date_of_birth")

        if not all([password, email, first_name, date_of_birth_str]):
            return jsonify({"status": 400, "error": "Missing Required Fields"}), 400

        if models.User.query.filter_by(email=email).first():
            return jsonify({"status": 409, "error": "User Already Exists"}), 409

        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
        date_of_birth = datetime.strptime(date_of_birth_str, "%Y-%m-%d")

        user = models.User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            date_of_birth=date_of_birth,
            hashed_password=hashed_password
        )

        # Ensure the 'admin' role exists and assign it to the new user
        admin_role = models.Role.query.filter_by(name='admin').first()
        if not admin_role:
            admin_role = models.Role(name='admin')
            db.session.add(admin_role)
            db.session.commit()

        user.roles.append(admin_role)
        db.session.add(user)
        try:
            db.session.commit()
            return jsonify({"status": 200, "message": "Admin user created successfully"}), 200
        except IntegrityError:
            db.session.rollback()
            return jsonify({"status": 500, "error": "Failed to create admin user due to an internal error"}), 500

    @app.route('/admin/check_if_admin', methods=['GET'])
    @jwt_required()
    def isUserAdmin() -> Tuple[Response, int]:
        """
        Checks if the currently authenticated user has admin privileges.

        Returns:
            Tuple[Response, int]: JSON response indicating whether the user is an admin, HTTP status code.
        """

        current_user_email = get_jwt_identity()
        user = models.User.query.filter_by(email=current_user_email).first()
        if not user:
            return jsonify({'status': 404, 'message': 'User not found'}), 404
        isAdmin = any(role.name == 'admin' for role in user.roles)
        return jsonify({"status": 200, "isAdmin": isAdmin}), 200

    @app.route('/admin/get_all_users', methods=['GET'])
    @jwt_required()
    def getAllUsers() -> Tuple[Response, int]:
        """
        Retrieves a paginated list of all users except admin users.

        Returns:
            Tuple[Response, int]: JSON response containing a list of users, HTTP status code.
        """

        current_user_email = get_jwt_identity()
        current_user = models.User.query.filter_by(email=current_user_email).first()

        if not current_user:
            return jsonify({'status': 404, 'message': 'User not found'}), 404

        if not any(role.name == 'admin' for role in current_user.roles):
            return jsonify({'status': 401, 'message': 'Error: Unauthorized access'}), 401

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        offset = (page - 1) * per_page

        non_admin_users_query = models.User.query.filter(~models.User.roles.any(models.Role.name == 'admin'))
        non_admin_users = non_admin_users_query.offset(offset).limit(per_page).all()

        users_data = []
        for user in non_admin_users:
            membership_type = 'No membership'
            payment_method  = 'No payment method'
            if user.membership:
                membership_type = user.membership.membership_type
                payment_method = user.membership.mode_of_payment

            user_info = {
                "id" : user.id,
                "name": f"{user.first_name} {user.last_name}",
                "email": user.email,
                "id" : user.id,
                "dob": user.date_of_birth.strftime('%d-%m-%Y'),
                "account_created": user.account_created.strftime('%d-%m-%Y'),
                "membership_type": membership_type,
                "payment_method": payment_method
            }
            users_data.append(user_info)

        total = non_admin_users_query.count()

        return jsonify({
            "status": 200,
            "users": users_data,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page
        }), 200

    @app.route('/admin/delete_user/<int:userId>', methods=['DELETE'])
    @jwt_required()
    def deleteUser(userId) -> Tuple[Response, int]:
        """
        Deletes a user based on the provided userID.

        Args:
            userId (int): The ID of the user to delete.

        Returns:
            Tuple[Response, int]: JSON response indicating the outcome of the deletion, HTTP status code.
        """

        current_user_email = get_jwt_identity()
        current_user = models.User.query.filter_by(email=current_user_email).first()

        if not current_user:
            return jsonify({'status': 404, 'message': 'User not found'}), 404

        if not any(role.name == 'admin' for role in current_user.roles):
            return jsonify({'status': 401, 'message': 'Error: Unauthorized access'}), 401

        user_to_delete = models.User.query.get(userId)
        if not user_to_delete:
            return jsonify({'status': 404, 'message': 'User not found'}), 404

        db.session.delete(user_to_delete)
        db.session.commit()
        return jsonify({'status': 200, 'message': 'User successfully deleted'}), 200

    @app.route('/admin/get_revenues', methods=['GET'])
    @jwt_required()
    def displayRevenues() -> Tuple[Response, int]:
        """
        Retrieves revenue data based on the specified period (weekly/monthly) and limit.

        Query Parameters:
            period (str): The period to aggregate revenue data by ('week' or 'month').
            limit (int): The number of recent periods to return data for.

        Returns:
            Tuple[Response, int]: JSON response containing revenue data, HTTP status code.
        """

        current_user_email = get_jwt_identity()
        current_user = models.User.query.filter_by(email=current_user_email).first()

        if not current_user:
            return jsonify({'status': 404, 'message': 'User not found'}), 404

        if not any(role.name == 'admin' for role in current_user.roles):
            return jsonify({'status': 401, 'message': 'Unauthorized access'}), 401

        # New check: Ensure there are memberships to work with
        if models.Membership.query.count() == 0:
            return jsonify({'status': 404, 'message': 'No memberships found'}), 404

        period = request.args.get('period', default='week', type=str)
        limit = request.args.get('limit', default=10, type=int)

        if period not in ['week', 'month']:
            return jsonify({'status': 400, 'message': 'Invalid period parameter. Use "week" or "month".'}), 400

        revenues = {}
        for membership in models.Membership.query.all():
            # Adjust the format based on the period
            if period == 'week':
                period_key = membership.date_created.strftime('%Y-%W')
            elif period == 'month':
                period_key = membership.date_created.strftime('%Y-%m')

            price = AdminRoutes.getMembershipPrice(membership.membership_type, membership.duration)

            if period_key not in revenues:
                revenues[period_key] = {'total_revenue': 0, 'total_sold': 0, 'by_type': {}}

            revenues[period_key]['total_revenue'] += price
            revenues[period_key]['total_sold'] += 1

            if membership.membership_type not in revenues[period_key]['by_type']:
                revenues[period_key]['by_type'][membership.membership_type] = {'total_revenue': 0, 'total_sold': 0}

            revenues[period_key]['by_type'][membership.membership_type]['total_revenue'] += price
            revenues[period_key]['by_type'][membership.membership_type]['total_sold'] += 1

        # Sorting and limiting the revenues based on most recent periods
        sorted_revenues = sorted(revenues.items(), key=lambda x: x[0], reverse=True)[:limit]
        result = [dict(period=period, **data) for period, data in sorted_revenues]

        return jsonify(result), 200

    @app.route('/admin/get_future_revenue', methods=['GET'])
    @jwt_required()
    def getFutureRevenue() -> Tuple[Response, int]:
        """
        Predicts future revenue based on the specified period (weekly/monthly) and limit.

        Query Parameters:
            period (str): Specifies the frequency ('weekly' or 'monthly') for predicting future revenue.
            limit (int): Specifies how many periods into the future to predict revenues for.

        Returns:
            Tuple[Response, int]: JSON response containing predicted future revenues, HTTP status code.
        """

        current_user_email = get_jwt_identity()
        current_user = models.User.query.filter_by(email=current_user_email).first()

        if not current_user:
            return jsonify({'status': 404, 'message': 'User not found'}), 404

        if not any(role.name == 'admin' for role in current_user.roles):
            return jsonify({'status': 401, 'message': 'Unauthorized access'}), 401

        # New check: Ensure there are memberships to work with
        if models.Membership.query.count() == 0:
            return jsonify({'status': 404, 'message': 'No memberships found'}), 404

        memberships = models.Membership.query.order_by(models.Membership.date_created.desc()).all()
        revenue_data = {}

        period = request.args.get('period', 'week')
        limit = int(request.args.get('limit', 1))

        date_format = None
        if period == 'week':
            date_format = '%Y-%W'

        elif period == 'month':
            date_format = '%Y-%m'

        else:
            return jsonify({'status': 400, 'message': 'Incorrect period provided'}), 400

        for membership in memberships:
            period_key = membership.date_created.strftime(date_format)
            price = AdminRoutes.getMembershipPrice(membership.membership_type, membership.duration)

            if period_key not in revenue_data:
                revenue_data[period_key] = {'total_revenue': 0, 'total_sold': 0, 'by_type': {}}

            revenue_data[period_key]['total_revenue'] += price
            revenue_data[period_key]['total_sold'] += 1

            if membership.membership_type not in revenue_data[period_key]['by_type']:
                revenue_data[period_key]['by_type'][membership.membership_type] = {'total_revenue': 0, 'total_sold': 0}

            revenue_data[period_key]['by_type'][membership.membership_type]['total_revenue'] += price
            revenue_data[period_key]['by_type'][membership.membership_type]['total_sold'] += 1

        # Extracting and sorting the periods in descending order
        sorted_periods = sorted(revenue_data.keys(), reverse=True)

        revenues = generateFutureRevenueData([dict(period=period, **revenue_data[period]) for period in sorted_periods], period)
        if (len(revenues) == 0):
            return jsonify({"status": 400, "message": "Error returning predicted revenues"}), 400

        result = {
            'status': 200,
            'data': {
                'future_revenues': revenues['future_revenues'][:limit],
                'period': revenues['frequency']
            }
        }

        return jsonify(result), 200