import pytest
from app import app, db, models

@pytest.fixture(scope='session')
def app():
    from app import app
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture()
def client(app):
    return app.test_client()

@pytest.fixture()
def clean_db(app):
    with app.app_context():
        db.drop_all()
        db.create_all()
        yield db
        db.session.rollback()
