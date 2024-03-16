from app import db, models, app
from datetime import datetime, timedelta
import random

def create_users():
    for i in range(1, 150):  # Creating 10 users
        user = models.User(
            first_name=f"User{i}",
            last_name=f"Test{i}",
            email=f"user{i}@example.com",
            date_of_birth=datetime(1990, 1, i % 30 + 1),
            account_created=datetime.now() - timedelta(days=i*10),
            hashed_password='hashed_password'  # Ideally, hash a password
        )
        db.session.add(user)
    db.session.commit()

def create_memberships():
    user_ids = [user.id for user in models.User.query.all()]
    membership_types = ['Basic', 'Standard', 'Premium']
    durations = ['Monthly', 'Annually']

    for user_id in user_ids:
        start_date = datetime.now() - timedelta(days=random.randint(1, 365))
        end_date = start_date + timedelta(days=30)  # Assuming monthly for simplicity
        membership = models.Membership(
            user_id=user_id,
            membership_type=random.choice(membership_types),
            duration=random.choice(durations),
            start_date=start_date,
            end_date=end_date,
            mode_of_payment=random.choice(['PayPal', 'Google Pay', 'Credit Card']),
            is_active=random.choice([True, False]),
            auto_renew=random.choice([True, False]),
            date_created=start_date
        )
        db.session.add(membership)
    db.session.commit()

def main():
    print("Creating dummy users...")
    create_users()
    print("Creating dummy memberships...")
    create_memberships()
    print("Dummy data creation completed!")

if __name__ == '__main__':
    with app.app_context():
        main()