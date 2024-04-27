from app.endpoints.imports import imports


# Initialize bcrypt
bcrypt = imports.Bcrypt(imports.app)

class TestMembershipRoutes:
    """Class for testing membership routes functionality."""
    # Tests for buying the membership

    def test_buy_membership_success(self, client, clean_db):
        """Test buying a membership successfully."""

        token, id, *_ = imports.users.user1(self, client, clean_db)
        # Attempt to buy a membership
        response = client.post("/buy_membership", json={
            "membership_type": imports.constants.MembershipType.BASIC.value,
            "duration": imports.constants.MembershipDuration.MONTHLY.value,
            "mode_of_payment": imports.constants.PaymentMethod.APPLE_PAY.value
        }, headers={"Authorization": f"Bearer {token}"})


        assert response.status_code == 200
        assert response.json['return_code'] == 1
        assert response.json['message'] == "Membership purchased successfully"

        # Fetch the membership after purchasing it.
        purchased_membership = imports.models.Membership.query.filter_by(user_id=id).first()

        # Assert that the membership and auto-renewal are actually set to True
        assert purchased_membership.is_active == True
        assert purchased_membership.auto_renew == True

    def test_buy_membership_missing_fields(self, client, clean_db):
        """Test buying a membership with missing fields."""

        token, id, *_ = imports.users.user1(self, client, clean_db)
        # Attempt to buy a membership with missing fields
        response = client.post("/buy_membership", json={
            "membership_type": imports.constants.MembershipType.BASIC.value,
            # Missing 'duration' and 'mode_of_payment'
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 400
        assert response.json['return_code'] == 0
        assert response.json['error'] == "Missing Required Fields"

        # Fetch the membership details.
        membership_details = imports.models.Membership.query.filter_by(user_id=id).first()

        # Assert that the membership is None and does not exist.
        assert membership_details == None

    def test_buy_membership_invalid_duration(self, client, clean_db):
        """Test buying a membership with an invalid duration."""

        token, id, *_ = imports.users.user1(self, client, clean_db)
        # Attempt to buy a membership with an invalid duration
        response = client.post("/buy_membership", json={
            "membership_type": imports.constants.MembershipType.BASIC.value,
            "duration": "InvalidDuration",
            "mode_of_payment": imports.constants.PaymentMethod.APPLE_PAY.value
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 400
        assert response.json['return_code'] == 0
        assert response.json['error'] == "Invalid duration"

        # Fetch the membership details.
        membership_details = imports.models.Membership.query.filter_by(user_id=id).first()

        # Assert that the membership is None and does not exist.
        assert membership_details == None

    def test_buy_membership_invalid_mode_of_payment(self, client, clean_db):
        """Test buying a membership with an invalid mode of payment."""

        token, id, *_ = imports.users.user1(self, client, clean_db)
        # Attempt to buy a membership with an invalid mode of payment
        response = client.post("/buy_membership", json={
            "membership_type": imports.constants.MembershipType.BASIC.value,
            "duration": imports.constants.MembershipDuration.MONTHLY.value,
            "mode_of_payment": "InvalidModeOfTransaction"  # Invalid mode of payment
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 400
        assert response.json['return_code'] == 0
        assert response.json['error'] == "Invalid mode of payment"

        # Fetch the membership details.
        membership_details = imports.models.Membership.query.filter_by(user_id=id).first()

        # Assert that the membership is None and does not exist.
        assert membership_details == None

    def test_buy_membership_invalid_membership_type(self, client, clean_db):
        """Test buying a membership with an invalid membership type."""

        token, id, *_ = imports.users.user1(self, client, clean_db)
        # Attempt to buy a membership with an invalid membership type
        response = client.post("/buy_membership", json={
            "membership_type": "InvalidType",
            "duration": imports.constants.MembershipDuration.MONTHLY.value,
            "mode_of_payment": imports.constants.PaymentMethod.APPLE_PAY.value
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 400
        assert response.json['return_code'] == 0
        assert response.json['error'] == "Invalid membership type"

        # Fetch the membership details.
        membership_details = imports.models.Membership.query.filter_by(user_id=id).first()

        # Assert that the membership is None and does not exist.
        assert membership_details == None

    # Tests for cancelling the membership
    def test_cancel_membership_before_end_date(self, client, clean_db):
        """Test canceling a membership before end date."""
        # First, create a user and a membership
        token, id, *_ = imports.users.user1(self, client, clean_db)
        # Create a membership for the user
        membership = imports.models.Membership(
            user_id=id,
            membership_type=imports.constants.MembershipType.PREMIUM.value,
            duration=imports.constants.MembershipDuration.MONTHLY.value,
            start_date=imports.datetime.now() - imports.timedelta(days=30),
            end_date=imports.datetime.now() + imports.timedelta(days=30),
            mode_of_payment=imports.constants.PaymentMethod.APPLE_PAY.value,
            is_active=True,
            auto_renew=True,
        )
        clean_db.session.add(membership)
        clean_db.session.commit()

        # Attempt to cancel the membership
        response = client.delete("/cancel_membership", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        assert response.json['return_code'] == 1
        assert "Auto-renew disabled successfully." in response.json['message']

        # Fetch the membership after cancellation
        cancelled_membership = imports.models.Membership.query.filter_by(user_id=id).first()

        # Assert that the auto-renewal is set to false
        assert cancelled_membership.auto_renew == False

        # Assert that the membership is still activated.
        assert cancelled_membership.is_active == True

    def test_cancel_membership_on_end_date(self, client, clean_db):
        """Test canceling a membership on the end date."""
        # First, create a user and a membership
        token, id, *_ = imports.users.user1(self, client, clean_db)
        # Create a membership for the user
        membership = imports.models.Membership(
            user_id=id,
            membership_type=imports.constants.MembershipType.STANDARD.value,
            duration=imports.constants.MembershipDuration.MONTHLY.value,
            start_date=imports.datetime.now() - imports.timedelta(days=30),
            end_date=imports.datetime.now(), # Current date
            mode_of_payment=imports.constants.PaymentMethod.APPLE_PAY.value,
            is_active=True,
            auto_renew=True,
        )
        clean_db.session.add(membership)
        clean_db.session.commit()

        # Attempt to cancel the membership
        response = client.delete("/cancel_membership", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        assert response.json['return_code'] == 1
        assert "Membership cancelled and auto-renew disabled successfully." in response.json['message']

        # Fetch the membership after cancellation
        cancelled_membership = imports.models.Membership.query.filter_by(user_id=id).first()

        # Assert that the membership and auto-renewal are actually set to false
        assert cancelled_membership.is_active == False
        assert cancelled_membership.auto_renew == False

    def test_cancel_membership_no_active_membership(self, client, clean_db):
        """Test cancelling membership when no active membership exists."""
        # First, create a user
        token, id, *_ = imports.users.user1(self, client, clean_db)
        # Attempt to cancel the membership
        response = client.delete("/cancel_membership", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 404
        assert response.json['return_code'] == 0
        assert "User does not have an active membership" in response.json['error']


    # Tests for updating the membership
    def test_update_membership_success(self, client, clean_db):
        """Test upgrading a membership successfully (scheduled update)."""
        # Create user and log in
        user = imports.models.User(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            date_of_birth=imports.datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add(user)
        clean_db.session.commit()

        login_response = client.post("/login", json={
            "email": "john.doe@example.com",
            "password": "password"
        })
        token = login_response.json['session_token']

        # Purchase basic monthly membership
        response = client.post("/buy_membership", json={
            "membership_type": imports.constants.MembershipType.BASIC.value,
            "duration": imports.constants.MembershipDuration.MONTHLY.value,
            "mode_of_payment": imports.constants.PaymentMethod.APPLE_PAY.value  # Replace with your payment method constant
        }, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200

        # Update to premium annual
        update_response = client.post("/update_membership", json={
            "membership_type": imports.constants.MembershipType.PREMIUM.value,
            "duration": imports.constants.MembershipDuration.ANNUALLY.value
        }, headers={"Authorization": f"Bearer {token}"})
        
        assert update_response.status_code == 200
        assert update_response.json['return_code'] == 1
        assert update_response.json['message'] == "Membership update scheduled successfully and auto renew is turned on"

        # Verify pending update
        pending_update = imports.models.PendingMembershipUpdate.query.filter_by(user_id=user.id).first()
        assert pending_update is not None
        assert pending_update.membership_type == imports.constants.MembershipType.PREMIUM.value
        assert pending_update.duration == imports.constants.MembershipDuration.ANNUALLY.value

    def test_update_membership_missing_data(self, client, clean_db):
        """Test update with missing data (membership type, duration)."""
        # Create user and log in
        user = imports.models.User(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            date_of_birth=imports.datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add(user)
        clean_db.session.commit()

        login_response = client.post("/login", json={
            "email": "john.doe@example.com",
            "password": "password"
        })
        token = login_response.json['session_token']

        # Purchase basic monthly membership
        response = client.post("/buy_membership", json={
            "membership_type": imports.constants.MembershipType.BASIC.value,
            "duration": imports.constants.MembershipDuration.MONTHLY.value,
            "mode_of_payment": imports.constants.PaymentMethod.APPLE_PAY.value  # Replace with your payment method constant 
        }, headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200

        # Test with missing membership type
        response1 = client.post("/update_membership", json={
            "duration": imports.constants.MembershipDuration.ANNUALLY.value
        }, headers={"Authorization": f"Bearer {token}"})
        assert response1.status_code == 400
        assert response1.json['error'] == "Missing Required Fields"

        # Test with missing duration
        response2 = client.post("/update_membership", json={
            "membership_type": imports.constants.MembershipType.PREMIUM.value
        }, headers={"Authorization": f"Bearer {token}"})
        assert response2.status_code == 400
        assert response2.json['error'] == "Missing Required Fields" 

        # Test with missing both
        response3 = client.post("/update_membership", json={}, headers={"Authorization": f"Bearer {token}"}) 
        assert response3.status_code == 400
        assert response3.json['error'] == "No JSON Data found"

    def test_update_membership_invalid_type(self, client, clean_db): 
        """Test update with invalid membership type.""" 
        # Create user and log in
        user = imports.models.User(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            date_of_birth=imports.datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add(user)
        clean_db.session.commit()

        login_response = client.post("/login", json={
            "email": "john.doe@example.com",
            "password": "password"
        })
        token = login_response.json['session_token']

        # Purchase basic monthly membership 
        response = client.post("/buy_membership", json={ 
            "membership_type": imports.constants.MembershipType.BASIC.value, 
            "duration": imports.constants.MembershipDuration.MONTHLY.value,
            "mode_of_payment": imports.constants.PaymentMethod.APPLE_PAY.value  # Replace with your payment method constant 
        }, headers={"Authorization": f"Bearer {token}"}) 
        assert response.status_code == 200

        update_response = client.post("/update_membership", json={
            "membership_type": "INVALID_TYPE",   
            "duration": imports.constants.MembershipDuration.ANNUALLY.value
        }, headers={"Authorization": f"Bearer {token}"})

        assert update_response.status_code == 400
        assert update_response.json['error'] == "Invalid membership type"

    # Tests for next billing cycle
    def test_next_billing_cycle_date_with_active_membership(self, client, clean_db):
        """Test retrieving next billing cycle date with an active membership."""
        # Create a user and an active membership
        user = imports.models.User(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            date_of_birth=imports.datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add(user)
        clean_db.session.commit()

        # Create an active membership
        active_membership = imports.models.Membership(
            user_id=user.id,
            membership_type=imports.constants.MembershipType.PREMIUM.value,
            duration=imports.constants.MembershipDuration.ANNUALLY.value,
            start_date=imports.datetime.now() - imports.timedelta(days=30),
            end_date=imports.datetime.now() + imports.timedelta(days=335),  # Example future end date
            mode_of_payment=imports.constants.PaymentMethod.CREDIT_CARD.value,
            is_active=True,
            auto_renew=True
        )
        clean_db.session.add(active_membership)
        clean_db.session.commit()

        # Login as the user
        login_response = client.post("/login", json={
            "email": "john.doe@example.com",
            "password": "password"
        })
        token = login_response.json['session_token']

        # Request next billing cycle date
        response = client.get("/get_billing_cycle_date", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        assert "next_billing_cycle_date" in response.json
        assert response.json['next_billing_cycle_date'] == (active_membership.end_date).isoformat()

    def test_next_billing_cycle_date_without_active_membership(self, client, clean_db):
        """Test retrieving next billing cycle date without an active membership."""
        # Create a user without an active membership
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
        token = login_response.json['session_token']

        # Request next billing cycle date
        response = client.get("/get_billing_cycle_date", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        assert "next_billing_cycle_date" in response.json
        assert response.json['next_billing_cycle_date'] is None
        
    # Tests for get active membership
    def test_get_active_membership(self, client, clean_db):
        """Test retrieving details regarding the user active membership."""
        # Create a user and an active membership
        user = imports.models.User(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            date_of_birth=imports.datetime(1990, 1, 1),
            hashed_password=bcrypt.generate_password_hash("password").decode("utf-8")
        )
        clean_db.session.add(user)
        clean_db.session.commit()

        # Create an active membership
        start_date = imports.datetime.now() - imports.timedelta(days=30)
        end_date = imports.datetime.now() + imports.timedelta(days=335)
        active_membership = imports.models.Membership(
            user_id=user.id,
            membership_type=imports.constants.MembershipType.PREMIUM.value,
            duration=imports.constants.MembershipDuration.ANNUALLY.value,
            start_date=start_date,
            end_date=end_date,  # Example future end date
            mode_of_payment=imports.constants.PaymentMethod.CREDIT_CARD.value,
            is_active=True,
            auto_renew=True
        )
        clean_db.session.add(active_membership)
        clean_db.session.commit()

        # Login as the user
        login_response = client.post("/login", json={
            "email": "john.doe@example.com",
            "password": "password"
        })
        token = login_response.json['session_token']

        # Request next billing cycle date
        response = client.get("/get_current_membership", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        assert response.json['auto_renew'] == True
        assert response.json['end_date'] == end_date.isoformat() 
        assert response.json['membership_duration'] == imports.constants.MembershipDuration.ANNUALLY.value
        assert response.json['membership_type'] == imports.constants.MembershipType.PREMIUM.value
        assert response.json['mode_of_payment'] == imports.constants.PaymentMethod.CREDIT_CARD.value
        assert response.json['start_date'] == start_date.isoformat() 
        

    def test_get_active_membership_without_membership(self, client, clean_db):
        """Test retrieving details regarding the user active membership."""
        # Create a user and an active membership
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
        token = login_response.json['session_token']

        # Request next billing cycle date
        response = client.get("/get_current_membership", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 404
        assert response.json['message']  == "User does not have an active membership."

        