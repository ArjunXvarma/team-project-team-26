## API Reference

### Getting Started

## Error Handling

Errors are returned as JSON objects in the following format, with an example below for code error `400`:

```python
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "return_code":0,
            'error': <error description>,
        }), 400
```

The API will return the following error types when requests fail:

```python
400: Bad Request
401: Unauthorized
404: Resource Not Found
405: Method Not Allowed
500: Internal Server Error
```

## Endpoints (AUTHENTICATION)

###### NOTE:

All endpoints at this point require a **valid JWT** token generated by Authorization.

#### POST `/signup`

- General:
  - Used to signup a new user on the web app.
- Sample:

```json
{
  "first_name": "Peter",
  "last_name": "Parker",
  "email": "peter.parker@gmail.com",
  "date_of_birth": "2002-02-19",
  "password": "peter"
}
```

- Returns:
  If user already exists in the database:

```json

{
    "return_code":0,
    "error": "User Already Exists"
}, 409 CONFLICT
```

If user does not exist in the database:

```json

{
    "return_code": 1,
    "access_token": "<JWT_TOKEN>",
    "id": 3,
    "name": "<FULL NAME OF USER>",
} 200 OK
```

If required parameters are missing:

```json

{
    "return_code":0,
    "error": "User Already Exists"
}, 409 CONFLICT
```

#### POST `/login`

- General:
  - Used to log in the user with the given credentials.
- Sample:

```json

{
{
    "email": "peter.parker@gmail.com",
    "password": "peter"
}
}
```

- Returns:
  If user credentials are correct:

```json

{
    "name": "Peter Parker",
    "id": 3,
    "return_code": 2,
    "session_token": "<JWT_TOKEN>"
}, 200 OK
```

If user credentials are NOT correct(EMAIL Incorrect):

```json

{
    "return_code":0,
    "error": "User Not found with the given Email"
}, 404 NOT FOUND
```

If user credentials are NOT correct(PASSWORD Incorrect):

```json

{
    "return_code":1,
    "error": "Incorrect password, please try again"
}, 401 Unauthorized
```

#### GET `/logout`

- General:
  - Logouts authenticated user and unsets the JWT token.
- Authentication:
  - requires JWT token to be set.
- Returns:
  If user is logged in.

```json
{
    "msg": "logout successful"
}, 200 OK
```

## Endpoints (MEMBERSHIP APIs)

### Constants Library

The following constants are used throughout the Membership APIs:

- **PaymentMethod Enum:** Specifies the accepted payment methods, including PayPal, Google Pay, Apple Pay, AliPay, and Credit Card.
- **MembershipType Enum:** Defines the available membership tiers: Basic, Standard, and Premium.
- **MembershipDuration Enum:** Lists the valid durations for membership subscriptions, such as Monthly and Annually.
- **MembershipPriceMonthly Enum:** Provides the prices for each membership type of monthly duration.
- **MembershipPriceAnnually Enum:** Provides the prices for each membership type of annual duration.

```python
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

class MembershipPriceMonthly(Enum):
    BASIC_MONTHLY_PRICE = 8.00
    STANDARD_MONTHLY_PRICE = 15.00
    PREMIUM_MONTHLY_PRICE = 22.00

class MembershipPriceAnnually(Enum):
    BASIC_ANNUAL_PRICE = 80.00
    STANDARD_ANNUAL_PRICE = 120.00
    PREMIUM_ANNUAL_PRICE = 180.00


```

> [!IMPORTANT]
> All endpoints at this point requires a valid JWT token generated by Authentication for the processing.

#### POST `/buy_membership`

- **General:**

  - Allows a user to purchase a membership.

- **Authentication:**

  - This endpoint require a valid JWT for the route.

- **Request Body:**

  - `membership_type`: Type of membership to purchase -> Defined in [constants.py](constants.py).
  - `duration`: Duration of the membership -> Defined in [constants.py](constants.py).
  - `mode_of_payment`: Mode of payment for the membership -> Defined in [constants.py](constants.py).

> [!NOTE]
> All the parameters required for the request body can be found in the constants library:
>
> - [Membership Type](https://github.com/uol-feps-soc-comp2913-2324s2-classroom/team-project-team-26/blob/03fe2471c2a5ddbb5f53afa8b8d10f37561f1dca/backend/constants.py#L30-L33)
> - [Membership Duration](https://github.com/uol-feps-soc-comp2913-2324s2-classroom/team-project-team-26/blob/03fe2471c2a5ddbb5f53afa8b8d10f37561f1dca/backend/constants.py#L35-L37)
> - [Membership Price](https://github.com/uol-feps-soc-comp2913-2324s2-classroom/team-project-team-26/blob/03fe2471c2a5ddbb5f53afa8b8d10f37561f1dca/backend/constants.py#L40-L46)

**Sample Success Body:**

> [!TIP]
> Take a look at -> [Buy membership success test](https://github.com/uol-feps-soc-comp2913-2324s2-classroom/team-project-team-26/blob/03fe2471c2a5ddbb5f53afa8b8d10f37561f1dca/backend/tests/test_project.py#L200C1-L204C57) for a detailed json post request.

```json
{
  "membership_type": "Membership Type",
  "duration": "Membership Duration",
  "mode_of_payment": "Membership Price"
}
```

**Returns:**

If the membership is purchased successfully:

```json
{
    "return_code": 1,
    "message": "Membership purchased successfully"
}, 200 OK
```

If required parameters are missing:

```json
{
    "return_code": 0,
    "error": "Missing Required Fields"
}, 400 BAD REQUEST
```

If there's an invalid duration:

```json
{
    "return_code": 0,
    "error": "Invalid duration"
}, 400 BAD REQUEST
```

If there's an invalid mode of payment:

```json
{
    "return_code": 0,
    "error": "Invalid mode of payment"
}, 400 BAD REQUEST
```

If there's an invalid membership type:

```json
{
    "return_code": 0,
    "error": "Invalid membership type"
}, 400 BAD REQUEST
```

If the access token is missing or invalid:

```json
{
    "return_code": 0,
    "message": "Missing or invalid access token."
}, 401 Unauthorized
```

#### DELETE `/cancel_membership`

- **General:**

  - Cancels the auto-renewal of a user's membership.

- **Authentication:**
  - This endpoint require a valid JWT for the route.

**Returns:**

If the membership is cancelled before the end date:

```json
{
    "return_code": 1,
    "message": "Auto-renew disabled successfully."
}, 200 OK
```

If membership is cancelled on the end date:

```json
{
    "return_code": 1,
    "message": "Membership cancelled and auto-renew disabled successfully."
}, 200 OK
```

If user does not have an active membership:

```json
{
    "return_code": 0,
    "error": "User does not have an active membership."
}, 404 NOT FOUND
```

If the access token is missing or invalid:

```json
{
    "return_code": 0,
    "message": "Missing or invalid access token."
}, 401 Unauthorized
```

#### POST ``/update_membership``
- **General:**
   - Allows a user to upgrade or downgrade their membership.

- **Authentication:**

  - This endpoint require a valid JWT for the route.

- **Request Body:**
 - `membership_type`: Type of membership to purchase -> Defined in [constants.py](constants.py).
  - `duration`: Duration of the membership -> Defined in [constants.py](constants.py).

**Sample Request Body:**

```json
{
 
  "membership_type": "Membership Type",
  "duration": "Membership Duration",
}
```
**Returns:**

If the membership update is scheduled successfully:

```json
{
   "return_code": 1,
    "message": "Membership update scheduled successfully and auto renew is turned on"
}, 200 OK
```

> [!NOTE]
> Auto renew is always turned on if the update membership request is sent by the user.


If the required parameters are missing:

```json
{
    "return_code": 0,
    "error": "Missing Required Fields"
}, 400 BAD REQUEST
```

If the membership type is invalid:

```json
{
    "return_code": 0,
    "error": "Invalid membership type"
}, 400 BAD REQUEST
```
If the access token is missing or invalid:

```json
{
    "return_code": 0,
    "message": "Missing or invalid access token."
}, 401 Unauthorized
```
**Cases:**
   - The user does not have an active membership.
```json
{
  "return_code": 0,
  "error": "No active membership found"
}, 400 BAD REQUEST
``` 
   - The user has an active membership with auto-renewal turned on.
```json
{
  "return_code": 1,
  "message": "Membership update scheduled successfully and auto renew is turned on"
}, 200 OK
``` 
 
#### GET ``/get_billing_cycle_date``
- **General:**

   - Retrieves the next billing cycle date for the user's active membership.

- **Authentication:**

  - This endpoint requires a valid JWT for the route.

**Returns:**

If the user has an active membership:

```json
{
    "next_billing_cycle_date": "MM-DD-YYYY"
}, 200 OK
```
If the user does not have an active membership:

```json
{
    "next_billing_cycle_date": null
}, 200 OK
```
If the access token is missing or invalid:

```json
{
    "return_code": 0,
    "message": "Missing or invalid access token."
}, 401 Unauthorized
```
#### GET ``/get_current_membership``
- **General:**
   - Retrieves details regarding the user's active membership.

- **Authentication:**

  - This endpoint requires a valid JWT for the route.

- **Returns:**
If the user has an active membership:

```json
{
    "auto_renew": true,
    "end_date": "MM-DD-YYYY",
  "membership_type": "Membership Type",
  "duration": "Membership Duration",
  "mode_of_payment": "Membership Price",
    "start_date": "MM-DD-YYYY"
}, 200 OK
```
If the user does not have an active membership:

```json
{
    "message": "User does not have an active membership."
}, 404 NOT FOUND
```
If the access token is missing or invalid:

```json
{
    "return_code": 0,
    "message": "Missing or invalid access token."
}, 401 Unauthorized
```


## Endpoints (FRIENDSHIP APIs)

#### POST ``/send_friend_request``
- **General:**
   - Allows a user to send a friend request to another user.

- **Authentication:**

  - This endpoint require a valid JWT for the route.

- **Request Body:**
- `email`: The email address of the user to whom the friend request is being sent.

- **Sample Success Body:**

```json
{
  "email": "bob@example.com"
}
```

- **Returns:**
- If the friend request is sent successfully:

```json
{
    "message": "Friend request sent successfully"
}, 200 OK
```

- If the friend request is sent successfully:

```json
{
    "error": "User is already a friend"
}, 400 BAD REQUEST
```

- If a friend request to the user is already pending:

```json
{
    "error": "Friend request already pending"
}, 400 BAD REQUEST
```

- If the specified user to send the request to does not exist:

```json
{
    "error": "Addressee not found"
}, 404 NOT FOUND
```

- If attempting to send a request to oneself:

```json
{
    "error": "Cannot send friend request to yourself"
}, 400 BAD REQUEST
```

- If the access token is missing or invalid:

```json
{
    "error": "Missing or invalid access token."
}, 401 UNAUTHORIZED
```

#### POST `/accept_friend_request`

- **General:**

  - Allows a user to accept a friend request from another user.

- **Authentication:**

  - This endpoint require a valid JWT for the route.

- **Request Body:**
- `email`: The email address of the user to whom the friend request is being sent.

- **Returns:**
- If the friend request is accepted successfully:

```json
{
    "message": "Friend request accepted"
}, 200 OK
```

- If the friend request to be accepted was not found:

```json
{
    "error": "Friend request not found"
}, 404 NOT FOUND
```

- If the access token is missing or invalid:

```json
{
    "error": "Missing or invalid access token."
}, 401 UNAUTHORIZED
```

#### POST `/reject_friend_request`

- **General:**

  - Allows a user to reject a friend request from another user.

- **Authentication:**

  - This endpoint require a valid JWT for the route.

- **Request Body:**
- `email`: The email address of the user to whom the friend request is being sent.

- **Returns:**
- If the friend request is rejected successfully:

```json
{
    "message": "Friend request rejected"
}, 200 OK
```

- If the friend request to be rejected was not found:

```json
{
    "error": "Friend request not found"
}, 404 NOT FOUND
```

- If the access token is missing or invalid:

```json
{
    "error": "Missing or invalid access token."
}, 401 UNAUTHORIZED
```

#### POST `/list_friend_requests`

- **General:**

  - Lists all pending friend requests for the current user.

- **Authentication:**

  - This endpoint require a valid JWT for the route.

- **Returns:**
- A JSON response containing a list of pending friend requests, each entry including the email and name of the user who sent the request.

```json
{
  "pending_requests": [
    {
      "email": "sender@example.com",
      "name": "Sender Name"
    },
    {
      "email": "another_sender@example.com",
      "name": "Another Sender Name"
    }
  ]
}
```

- If the access token is missing or invalid:

```json
{
    "error": "Missing or invalid access token."
}, 401 UNAUTHORIZED
```

#### POST `/list_friends`

- **General:**

  - Lists all friends of the current user.

- **Authentication:**

  - This endpoint require a valid JWT for the route.

- **Returns:**
- A JSON response containing a list of friends, each entry including the email and name of the friend.

```json
{
    "friends": [
        {
            "email": "friend1@example.com",
            "name": "Friend One"
        },
        {
            "email": "friend2@example.com",
            "name": "Friend Two"
        }
    ]
}
```

- If the access token is missing or invalid:

```json
{
    "error": "Missing or invalid access token."
}, 401 UNAUTHORIZED
```

#### GET `/privacy_status`

- **General:**

  - Returns the privacy status of the user.

- **Authentication:**

  - This endpoint require a valid JWT for the route.

- **Returns:**

  - A JSON response containing information about the privacy status of the user.

- **Example out:**

  ````
  - If the access token valid:

  ```json
  {
      "account_type": true,
      "status": 200
  } 200 OK
  ````

#### GET `/update_privacy`

- **General:**

  - Changes the privacy status of the user.

- **Authentication:**

  - This endpoint require a valid JWT for the route.

- **Returns:**

  - A JSON response containing information about the updated privacy status of the user.

- **Example input:**

  ```json
  {
    "isPrivate": true
  }
  ```

- **Example output:**

  ```
  - If the access token valid:
  ```

  ```json
  {
      "message": "Privacy setting updated successfully",
      "status": "success"
  } 200 OK
  ```

#### GET `/get_friends_journey`

- **General:**

  - Returns the journey of a friend.

- **Authentication:**

  - This endpoint require a valid JWT for the route.
  - This endpoint requires the user to be a friend of the requested user.

- **Returns:**

  - A JSON response containing information about all the journeys of the other user (friend).

- **Query Parameters**

  - friend: email of the friend.

- **Example output:**

  - If the access token valid and the user is a friend of the requested friend email:

  ```json
  {
    "data": [
      {
        "dateCreated": "27-02-2024",
        "elevation": {
          "avg": 1567.6721718522679,
          "max": 1647.2115187233178,
          "min": 1494.4905648110625
        },
        "endTime": "15:26:53",
        "id": 159,
        "name": "Journey239",
        "points": [
          {
            "ele": 8639.205352797595,
            "lat": 28.459182851808478,
            "lon": -46.34055054482471
          },
          {
            "ele": 1781.2366676967224,
            "lat": -29.143239213537413,
            "lon": -167.76607487307092
          },
          {
            "ele": 3200.255835588675,
            "lat": -49.95520525586731,
            "lon": 135.53541533782993
          }
        ],
        "startTime": "12:26:53",
        "totalDistance": 8.302507154867854,
        "type": "Biking"
      },
      {
        "dateCreated": "23-05-2023",
        "elevation": {
          "avg": 137.2111460925541,
          "max": 186.14564344179627,
          "min": 83.81544133506767
        },
        "endTime": "15:26:53",
        "id": 160,
        "name": "Journey988",
        "points": [
          {
            "ele": 6899.845120834002,
            "lat": -10.906079752047745,
            "lon": 135.77298772404652
          },
          {
            "ele": 946.9393910239107,
            "lat": 2.6179363004749945,
            "lon": -85.67853433576789
          },
          {
            "ele": 1623.5260077798307,
            "lat": 30.785656720780096,
            "lon": 72.94477782612628
          }
        ],
        "startTime": "12:26:53",
        "totalDistance": 21.430481956422028,
        "type": "Running"
      }
    ],
    "status": 200
  }
  ```

# Endpoints (GPS APIs)

### Get Journeys of User

- **Endpoint**: `GET /get_journeys_of_user`
- **Description**: Retrieves all journeys associated with the authenticated user.
- **Success Response**: `200 OK`
  ```
  {
      "status": 200,
      "data": [{...}]
  }
  ```
- **Error Responses**:
  - `404 Not Found`: If the user is not found or there are no journeys.

### Create Journey

- **Endpoint**: `POST /create_journey`
- **Description**: Creates a new journey for the authenticated user.
- **Input**:
  ```
  {
      "name": "Morning Run",
      "type": "Running",
      "totalDistance": 5,
      ...
  }
  ```
- **Success Response**: `201 Created`
- **Error Responses**:
  - `400 Bad Request`: If required fields are missing or invalid.

### Delete Journey

- **Endpoint**: `DELETE /delete_journey/<journeyId>`
- **Description**: Deletes a specific journey.
- **Success Response**: `200 OK`
- **Error Responses**:
  - `404 Not Found`: If the journey is not found.

### Update Journey

- **Endpoint**: `PUT /update_journey/<journeyId>`
- **Description**: Updates a specific journey.
- **Input**:
  ```
  {
      "name": "Updated Morning Run",
      ...
  }
  ```
- **Success Response**: `200 OK`
- **Error Responses**:
  - `400 Bad Request`: If the input format is incorrect.
  - `404 Not Found`: If the journey is not found.

## Error Messages and Reasons

- **User Not Found**: The specified user does not exist in the system.
- **No Journeys Found**: The user has not created any journeys.
- **Missing Field**: A required field in the request body is missing.
- **Invalid Points Data**: The points data does not match the required structure.
- **Journey Not Found**: The specified journey does not exist or does not belong to the user.
- **Invalid Date/Time Format**: The date/time format does not match the expected format (e.g., `HH:MM:SS` for time).

Please ensure to authenticate using a valid JWT token obtained through the login endpoint to access these APIs.

# Endpoints (Admin APIs)

### Create Admin User

- **Endpoint**: `POST /admin/create_admin_user`
- **Description**: Allows the creation of an admin user with the provided details.
- **Request Body**:
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "password": "securepassword",
    "date_of_birth": "1990-01-01"
  }
  ```
- **Response**:
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "message": "Admin user created successfully"
  }
  ```
- **Errors**:
- Missing required fields: `400 Bad Request`
- User already exists: `409 Conflict`
- No JSON data found: `400 Bad Request`
- Current user is not an admin: `400 Bad Request`

### Check If User Is Admin

- **Endpoint**: `GET /admin/check_if_admin`
- **Description**: Checks if the currently authenticated user has admin privileges.
- **Response**:
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "isAdmin": true
  }
  ```
- **Errors**:
- User not found: `404 Not Found`
- Unauthorized access: `401 Unauthorized`

### Get All Users

- **Endpoint**: `GET /admin/get_all_users`
- **Description**: Retrieves a list of all users except admin users.
- **Query parameters**
  - per_page: The amount of records needed per page.
  - page: The current page number.
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "dob": "01-01-1990",
        "account_created": "01-01-2020",
        "membership_type": "Basic",
        "payment_method": "Credit Card"
      }
    ],
    "total": 1,
    "page": 1,
    "per_page": 10,
    "total_pages": 1
  }
  ```
- **Errors**:
- User not found: `404 Not Found`
- Unauthorized access: `401 Unauthorized`

### Delete User

- **Endpoint**: `DELETE /admin/delete_user/<userId>`
- **Description**: Deletes a user with the given user ID.
- **Response**:
- **Status Code**: `200 OK`
- **Body**:
  ```json
  {
    "message": "User successfully deleted"
  }
  ```
- **Errors**:
- User not found: `404 Not Found`
- Unauthorized access: `401 Unauthorized`

### Display Revenues

- **Endpoint**: `GET /admin/get_revenues`
- **Description**: Returns all the weekly revenues.
- **Query parameters**
  - limit: The number of the most recent revenue records.
  - period: Revenue data by month or by week.
- **Status Code**: `200 OK`
- **Sample output**:
  ```json
  [
    {
      "by_type": {
        "Basic": {
          "total_revenue": 176.0,
          "total_sold": 4
        },
        "Standard": {
          "total_revenue": 15.0,
          "total_sold": 1
        }
      },
      "period": "2024-03",
      "total_revenue": 191.0,
      "total_sold": 5
    },
    {
      "by_type": {
        "Basic": {
          "total_revenue": 88.0,
          "total_sold": 2
        },
        "Premium": {
          "total_revenue": 180.0,
          "total_sold": 1
        },
        "Standard": {
          "total_revenue": 120.0,
          "total_sold": 1
        }
      },
      "period": "2024-02",
      "total_revenue": 388.0,
      "total_sold": 4
    }
  ]
  ```

### Display predicted revenues

- **Endpoint**: `GET /admin/get_future_revenue`
- **Description**: Returns all the predicted revenues.
- **Query parameters**
  - limit: The number of the most recent predicted revenue records.
  - period: Revenue data by month or by week.
- **Status Code**: `200 OK`
- **Sample output**:

  ```json
  {
    "data": {
      "future_revenues": [
        233.27, 275.84, 373.72, 416.76, 198.68, 178.01, 183.91, 192.66, 218.18,
        235.92, 287.08, 173.52
      ],
      "period": "month"
    },
    "status": 200
  }
  ```

- **Errors**:
- No memberships found: `404 Not Found`
- Unauthorized access: `401 Unauthorized`
- Incorrect period provided: `400 Bad Request`

## Endpoint (Statistics APIs)

#### GET `/getStats`

- **General:**

  - Get a dictionary of all the journey data of the current user

- **Authentication:**

  - This endpoint require a valid JWT for the route.

- **parameters:**

  - None, it accesses journeys of the currently logged in user

- **Returns:**
- A JSON response containing the status (if it executed correctly) and a dictionary called data containing all journey data of the user.

- journeysData - a list of dictionaries with data on each individual journey

- byModes - A dictionary containing 3 dictionaries: cycling, running and walking. Each contains totals from journeys using that particular mode of transport.

```json
{
  "data": {
    "byModes": {
      "cycle": {
        "totalCaloriesBurned": 397.8333333333333,
        "totalDistance": 15.0,
        "totalTimeWorkingOutHours": 0,
        "totalTimeWorkingOutMinutes": 55,
        "totalTimeWorkingOutSeconds": 0
      },
      "running": {
        "totalCaloriesBurned": 418.5,
        "totalDistance": 5.0,
        "totalTimeWorkingOutHours": 0,
        "totalTimeWorkingOutMinutes": 45,
        "totalTimeWorkingOutSeconds": 0
      },
      "walking": {
        "totalCaloriesBurned": 204.6,
        "totalDistance": 10.0,
        "totalTimeWorkingOutHours": 0,
        "totalTimeWorkingOutMinutes": 55,
        "totalTimeWorkingOutSeconds": 0
      }
    },
    "journeysData": [
      {
        "averageSpeed": 6.0,
        "caloriesBurned": 418.5,
        "hours_taken": 0,
        "journeyId": 1,
        "minutes_taken": 45,
        "mode": "Running",
        "seconds_taken": 0,
        "totalDistance": 5.0
      },
      {
        "averageSpeed": 10.0,
        "caloriesBurned": 204.6,
        "hours_taken": 0,
        "journeyId": 2,
        "minutes_taken": 55,
        "mode": "Walking",
        "seconds_taken": 0,
        "totalDistance": 10.0
      },
      {
        "averageSpeed": 16.0,
        "caloriesBurned": 397.8333333333333,
        "hours_taken": 0,
        "journeyId": 3,
        "minutes_taken": 55,
        "mode": "Cycling",
        "seconds_taken": 0,
        "totalDistance": 15.0
      }
    ],
    "totalCaloriesBurned": 1020.9333333333333,
    "totalDistanceCombined": 30.0,
    "totalTimeWorkingOutHours": 2,
    "totalTimeWorkingOutMinutes": 35,
    "totalTimeWorkingOutSeconds": 0
  },
  "status": 200
}
```

- If the access token is missing or invalid:

```json
{
    "error": "Missing or invalid access token."
}, 401 UNAUTHORIZED
```

- If user is not found:

```json
{
    "error": "User not found."
}, 404 NOT FOUND
```

- If a journey trying to be accessed is not found:

```json
{
    "error": "Journey not found"
}, 404 NOT FOUND
```


#### GET ``/get_friends_Stats``

- **General:**
   - Get a dictionary of all the journey data of one of the current users friends

- **Authentication:**

  - This endpoint require a valid JWT for the route. It also requires the email of the specified friend.

- **parameters:**
   - This is an example of how to use the API and how to pass in a token as well as the friends email
   - "bob@example.com"

```python
url = 'http://127.0.0.1:5000/get_friends_stats?friend=bob@example.com'
response = client.get(url, headers={'Authorization': f'Bearer {token}'})
```


- **Returns:**
- A JSON response containing the status (if it executed correctly) and a dictionary called data containing all journey data of the users friend.

- journeysData - a list of dictionaries with data on each individual journey

- byModes - A dictionary containing 3 dictionaries: cycling, running and walking. Each contains totals from journeys using that particular mode of transport.

```json
{
    "data": {
        "byModes": {
            "cycle": {
                "totalCaloriesBurned": 397.8333333333333,
                "totalDistance": 15.0,
                "totalTimeWorkingOutHours": 0,
                "totalTimeWorkingOutMinutes": 55,
                "totalTimeWorkingOutSeconds": 0
            },
            "running": {
                "totalCaloriesBurned": 418.5,
                "totalDistance": 5.0,
                "totalTimeWorkingOutHours": 0,
                "totalTimeWorkingOutMinutes": 45,
                "totalTimeWorkingOutSeconds": 0
            },
            "walking": {
                "totalCaloriesBurned": 204.6,
                "totalDistance": 10.0,
                "totalTimeWorkingOutHours": 0,
                "totalTimeWorkingOutMinutes": 55,
                "totalTimeWorkingOutSeconds": 0
            }
        },
        "journeysData": [
            {
                "averageSpeed": 6.0,
                "caloriesBurned": 418.5,
                "hours_taken": 0,
                "journeyId": 1,
                "minutes_taken": 45,
                "mode": "Running",
                "seconds_taken": 0,
                "totalDistance": 5.0
            },
            {
                "averageSpeed": 10.0,
                "caloriesBurned": 204.6,
                "hours_taken": 0,
                "journeyId": 2,
                "minutes_taken": 55,
                "mode": "Walking",
                "seconds_taken": 0,
                "totalDistance": 10.0
            },
            {
                "averageSpeed": 16.0,
                "caloriesBurned": 397.8333333333333,
                "hours_taken": 0,
                "journeyId": 3,
                "minutes_taken": 55,
                "mode": "Cycling",
                "seconds_taken": 0,
                "totalDistance": 15.0
            }
        ],
        "totalCaloriesBurned": 1020.9333333333333,
        "totalDistanceCombined": 30.0,
        "totalTimeWorkingOutHours": 2,
        "totalTimeWorkingOutMinutes": 35,
        "totalTimeWorkingOutSeconds": 0
    },
    "status": 200
}
```
- If the access token is missing or invalid:

```json
{
    "error": "Missing or invalid access token."
}, 401 UNAUTHORIZED
```
- If user is not found:

```json
{
    "error": "User not found."
}, 404 NOT FOUND
```
- If friend is not found:

```json
{
    "error": "Friend not found."
}, 404 NOT FOUND
```
- If a journey trying to be accessed is not found:

```json
{
    "error": "Journey not found"
}, 404 NOT FOUND
```
- Friends email is required:

```json
{
    "error": "Friend email is required"
}, 400 BAD REQUEST
```
- If user and friend are not friends:

```json
{
    "error": "Not friends."
}, 403
```
- If friends account is set to private:

```json
{
    "error": "Friend's account is private."
}, 403
```




