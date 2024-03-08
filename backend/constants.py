"""
Constants File Description:

This file contains lists of valid payment methods, membership types, and durations for the application. These constants are utilized throughout the application to ensure consistency and accuracy in handling payments and membership-related operations.

1. VALID_PAYMENT_METHODS:
    - This list includes various payment methods accepted by the application, such as PayPal, Google Pay, Apple Pay, AliPay, and Credit Card.

2. VALID_MEMBERSHIP_TYPES:
    - This list enumerates the valid membership tiers available in the application, including Basic, Bronze, and Silver. 

3. VALID_DURATIONS:
    - This list specifies the valid durations for membership subscriptions, offering options such as Monthly and Annually.

By maintaining these constants in a centralized file, we can easily reference and update the available options for payment methods, membership types, and durations, ensuring coherence and reliability across the application.
"""

# A list of valid payment methods for the application
VALID_PAYMENT_METHODS = ["PayPal", "Google Pay", "Apple Pay", "AliPay", "Credit Card"]

# A list of valid membership types
VALID_MEMBERSHIP_TYPES = ["Basic", "Bronze", "Silver"]


# A list of valid durations
VALID_MEMBERSHIP_DURATIONS = ["Monthly", "Annually"]