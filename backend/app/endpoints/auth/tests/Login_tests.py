from app.endpoints.imports import imports

# Initialize bcrypt
bcrypt = imports.Bcrypt(imports.app)

class TestLogin:
    """Class for testing user login functionality."""

    def test_correct_credentials(self, client, clean_db):
        """Test login with correct credentials."""
        token = imports.users.user2(self, client, clean_db)[0]

        response = client.post("/login", json={
            "email": "alice@example.com",
            "password": "password"
        })

        assert response.status_code == 200
        assert response.json['name'] == "Alice Smith"
        assert response.json['return_code'] == 2

    def test_incorrect_password(self, client, clean_db):
        """Test login with incorrect password."""
        token = imports.users.user2(self, client, clean_db)[0]

        response = client.post("/login", json={
            "email": "alice@example.com",
            "password": "pass word"
        })

        assert response.status_code == 401
        assert response.json['error'] == "Incorrect password, please try again"
        assert response.json['return_code'] == 1

    def test_incorrect_email(self, client, clean_db):
        """Test login with incorrect email."""
        token = imports.users.user2(self, client, clean_db)[0]


        response = client.post("/login", json={
            "email": "peter.parker.wrong.mail@gmail.com",
            "password": "password"
        })

        assert response.status_code == 404
        assert response.json['error'] == "User Not found with the given Email"
        assert response.json['return_code'] == 0
