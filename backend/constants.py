from enum import Enum
from app import app, db, models
from flask import jsonify
"""
Constants File Description:

This file contains enumerations of valid payment methods, membership types, and durations for the application. These enums are utilized throughout the application to ensure consistency and accuracy in handling payments and membership-related operations.

PaymentMethod Enum:
This enum includes various payment methods accepted by the application, such as PayPal, Google Pay, Apple Pay, AliPay, and Credit Card.

MembershipType Enum:
This enum enumerates the valid membership tiers available in the application, including Basic, Standard, and Premium.

MembershipDuration Enum:
This enum specifies the valid durations for membership subscriptions, offering options such as Monthly and Annually.

MembershipPrice Enum:
This enum provides the prices for each membership type and duration combination, allowing easy access to pricing information for Basic, Standard, and Premium memberships, both on a monthly and annual basis.


By maintaining these enums in a centralized file, we can easily reference and update the available options for payment methods, membership types, and durations, ensuring coherence and reliability across the application.
"""

class PaymentMethod(Enum):
    PAYPAL = "PayPal"
    GOOGLE_PAY = "Google Pay"
    APPLE_PAY = "Apple Pay"
    ALIPAY = "AliPay"
    CREDIT_CARD = "Credit Card"

class MembershipType(Enum):
    BASIC = "Basic"
    STANDARD = "Standard"
    PREMIUM = "Premium"

class MembershipDuration(Enum):
    MONTHLY = "Monthly"
    ANNUALLY = "Annually"

# Prices for memberships
class MembershipPriceMonthly(Enum):
    BASIC_MONTHLY_PRICE = 8.00
    STANDARD_MONTHLY_PRICE = 15.00
    PREMIUM_MONTHLY_PRICE = 22.00
   
class MembershipPriceAnnually(Enum):
    BASIC_ANNUAL_PRICE = 80.00
    STANDARD_ANNUAL_PRICE = 120.00
    PREMIUM_ANNUAL_PRICE = 180.00
 


# Validation functions for the ENUMs

# Check if mode of payment is valid
def is_valid_payment_method(mode_of_payment):
        for paymentMode in PaymentMethod:
            if paymentMode.value == mode_of_payment:
                return True
        return False
    

# Check if membership duration is valid
def is_valid_duration(duration):
    for durations in MembershipDuration:
        if durations.value == duration:
            return True
    return False

# Check if membership type is valid
def is_valid_membership_type(membership_type):
        for membershipType in MembershipType:
            if membershipType.value == membership_type:
                return True
        return False


@app.route('/api/enums')
def get_enums():
    enums = {
        "PaymentMethod": [payment_method.value for payment_method in PaymentMethod],
        "MembershipType": [membership_type.value for membership_type in MembershipType],
        "MembershipDuration": [membership_duration.value for membership_duration in MembershipDuration],
        "MembershipPriceMonthly": [membership_price_monthly.value for membership_price_monthly in MembershipPriceMonthly],
        "MembershipPriceAnnually": [membership_price_annually.value for membership_price_annually in MembershipPriceAnnually],
        "PaymentMethod" : [payment_mode.value for payment_mode in PaymentMethod]
    }
    return jsonify(enums)