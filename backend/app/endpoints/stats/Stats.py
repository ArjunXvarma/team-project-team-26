from app import (app, models, get_jwt_identity, jwt_required)
from flask import request, jsonify
from typing import Tuple

class StatisticsRoutes():
    """
    Class for retrieving journey statistics data for a user.

    Methods
    -------
    getStats() -> Tuple[dict, int]:
        returns the statistics of all the journeys for a certain user.

    """

    @app.route("/getStats", methods=["GET"])
    @jwt_required()
    def getStats() -> Tuple[dict, int]:

        """
        Get all the statistical data for a user and their journeys in a 'data' dictionary

        Parameters
        ----------
        None.

        Returns
        -------
        Json
            A JSON object that contains statistical information about a user and their journeys.
            This includes:

                data:
                Dictionary containing all user data

                    journeyData:
                    list containing statistical information about each journey of a user(each stored as dictionaries)

                    byModes:
                    contains totalled data for each mode of transport

                    Also contains a users stats summing all their journeys

            this is the exact structure, where totalTimeWorkingOut is broken down into totalTimeWorkingOutHours,
            totalTimeWorkingOutMinutes and totalTimeWorkingOutSeconds:




        Notes
        -----
        The time taken variables return the hours in a journey,
        the remaining minutes of the journey excluding the hours,
        the remaining seconds excluding both.
        These 3 essentially give the exact amount of time a journey took
        HH:MM:SS


        Exceptions
        ----------
        None.

        """

        # Get the current user's email from JWT token
        current_user_email = get_jwt_identity()

        # get user
        user = models.User.query.filter_by(email=current_user_email).first()

        # Check if user exists
        if not user:
            return jsonify({'status': 404, 'message': 'User not found'}), 404

        # Retrieve all journeys associated with the user
        journeys = models.Journey.query.filter_by(userId=user.id).all()

        # Initialize variables to store journey data and totals for each mode

        # List to store individual journey data
        journeysData = []
        total_distance_cycling = 0
        total_calories_burned_cycling = 0
        total_time_taken_hours_cycling = 0
        total_time_taken_minutes_cycling = 0
        total_time_taken_seconds_cycling = 0
        total_time_in_seconds_cycling = 0

        total_distance_walking = 0
        total_calories_burned_walking = 0
        total_time_taken_hours_walking = 0
        total_time_taken_minutes_walking = 0
        total_time_taken_seconds_walking = 0
        total_time_in_seconds_walking = 0

        total_distance_running = 0
        total_calories_burned_running = 0
        total_time_taken_hours_running = 0
        total_time_taken_minutes_running = 0
        total_time_taken_seconds_running = 0
        total_time_in_seconds_running = 0


        # Iterate over each journey
        for journey in journeys:

            # Temporary dictionary to store data for each journey
            temp_dictionary = {}

            # Check if journey exists
            if not journey:
                return jsonify({'status': 404, 'message': 'Journey not found'}), 404


            # Calculate time taken for the journey

            # Extract start time and end time from the journey object
            date = journey.dateCreated
            start_time = journey.startTime
            end_time = journey.endTime

            # Check if start time or end time is missing
            if not start_time or not end_time:
                return jsonify({'status': 400, 'message': 'Start time or end time missing for this journey'}), 400

            # Calculate the time difference in seconds between start time and end time
            start_seconds = start_time.hour * 3600 + start_time.minute * 60 + start_time.second
            end_seconds = end_time.hour * 3600 + end_time.minute * 60 + end_time.second
            time_diff_seconds = end_seconds - start_seconds

            # breakdown time difference to hours, minutes, and seconds
            hours = time_diff_seconds // 3600
            minutes = (time_diff_seconds % 3600) // 60
            seconds = (time_diff_seconds % 3600) % 60

            # Add time data to the temporary dictionary
            temp_dictionary["date"] = date
            temp_dictionary["hours_taken"] = hours
            temp_dictionary["minutes_taken"] = minutes
            temp_dictionary["seconds_taken"] = seconds


            # Calculate calories burned for the journey

            # MET(metabolic equivalent of task) x Body Weight(kg) x Duration(hours)
            exact_hours = time_diff_seconds / 3600
            average_weight = 62

            if journey.type == "Walk":
                MET = 3.6
            elif journey.type == "Run":
                MET = 9
            else:
                MET = 7

            calories_burned = MET * average_weight * exact_hours

            # Add calories burned data to the temporary dictionary
            temp_dictionary["caloriesBurned"] = calories_burned


            # Add distance data to the temporary dictionary
            distance = journey.totalDistance
            temp_dictionary["totalDistance"]  = distance


            # Calculate average speed for the journey
            mph = (distance // (time_diff_seconds / 3600))
            temp_dictionary["averageSpeed"] = mph

            # Add mode of transport of journey to the temporary dictionary
            mode = journey.type
            temp_dictionary["mode"] = mode

            # Add journey ID data to the temporary dictionary
            journeyID = journey.id
            temp_dictionary["journeyId"] = journeyID

            # Append the journeys data to the journeysData list
            journeysData.append(temp_dictionary)


            # Update totals for each mode
            if journey.type == "Walk":
                total_distance_walking += distance
                total_calories_burned_walking += calories_burned
                total_time_in_seconds_walking += time_diff_seconds

            elif journey.type == "Run":
                total_distance_running += distance
                total_calories_burned_running += calories_burned
                total_time_in_seconds_running += time_diff_seconds

            else:
                total_distance_cycling += distance
                total_calories_burned_cycling += calories_burned
                total_time_in_seconds_cycling += time_diff_seconds


        # Calculate total time for each mode
        total_time_taken_hours_walking = total_time_in_seconds_walking // 3600
        total_time_taken_minutes_walking = (total_time_in_seconds_walking % 3600) // 60
        total_time_taken_seconds_walking = (total_time_in_seconds_walking % 3600) % 60


        total_time_taken_hours_running = total_time_in_seconds_running // 3600
        total_time_taken_minutes_running = (total_time_in_seconds_running % 3600) // 60
        total_time_taken_seconds_running = (total_time_in_seconds_running % 3600) % 60


        total_time_taken_hours_cycling = total_time_in_seconds_walking // 3600
        total_time_taken_minutes_cycling = (total_time_in_seconds_walking % 3600) // 60
        total_time_taken_seconds_cycling = (total_time_in_seconds_walking % 3600) % 60

        # Initialize dictionaries to store data for each mode
        byModes = {}
        cycle = {}
        walking = {}
        running = {}

        cycle["totalDistance"] = total_distance_cycling
        cycle["totalCaloriesBurned"] = total_calories_burned_cycling
        cycle["totalTimeWorkingOutHours"] = total_time_taken_hours_cycling
        cycle["totalTimeWorkingOutMinutes"] = total_time_taken_minutes_cycling
        cycle["totalTimeWorkingOutSeconds"] = total_time_taken_seconds_cycling

        walking["totalDistance"] = total_distance_walking
        walking["totalCaloriesBurned"] = total_calories_burned_walking
        walking["totalTimeWorkingOutHours"] = total_time_taken_hours_walking
        walking["totalTimeWorkingOutMinutes"] = total_time_taken_minutes_walking
        walking["totalTimeWorkingOutSeconds"] = total_time_taken_seconds_walking

        running["totalDistance"] = total_distance_running
        running["totalCaloriesBurned"] = total_calories_burned_running
        running["totalTimeWorkingOutHours"] = total_time_taken_hours_running
        running["totalTimeWorkingOutMinutes"] = total_time_taken_minutes_running
        running["totalTimeWorkingOutSeconds"] = total_time_taken_seconds_running

        # Add each mode of transports dictionary to byModes
        byModes["cycle"] = cycle
        byModes["walking"] = walking
        byModes["running"] = running

        # Calculate totals for all journeys

        total_distance_all_journeys = total_distance_cycling + total_distance_walking + total_distance_running
        total_calories_burned_all_journeys = total_calories_burned_cycling + total_calories_burned_walking + total_calories_burned_running

        total_time_app_used = total_time_in_seconds_walking + total_time_in_seconds_running + total_time_in_seconds_cycling
        total_time_taken_hours_total = total_time_app_used // 3600
        total_time_taken_minutes_total = (total_time_app_used % 3600) // 60
        total_time_taken_seconds_total = (total_time_app_used % 3600) % 60

        # Create final data dictionary, this will contain all the other data for a user and their journeys
        data = {}

        # fill data dictionary with the relevant data
        data["journeysData"] = journeysData
        data["byModes"] = byModes
        data["totalDistanceCombined"] = total_distance_all_journeys
        data["totalCaloriesBurned"] = total_calories_burned_all_journeys
        data["totalTimeWorkingOutHours"] = total_time_taken_hours_total
        data["totalTimeWorkingOutMinutes"] = total_time_taken_minutes_total
        data["totalTimeWorkingOutSeconds"] = total_time_taken_seconds_total

        # Return status, indicating successful completion of Api, and the data dictionary
        return jsonify({'status': 200, 'data': data}), 200


    @app.route("/get_friends_stats", methods=["GET"])
    @jwt_required()
    def getFriendsStats() -> Tuple[dict, int]:

        """
        Get all the statistical data for a users friend and their journeys in a 'data' dictionary

        Parameters
        ----------
        None.

        Returns
        -------
        Json
            A JSON object that contains statistical information about a users friend and their journeys.
            This includes:

                data:
                Dictionary containing all user data

                    journeyData:
                    list containing statistical information about each journey of a user(each stored as dictionaries)

                    byModes:
                    contains totalled data for each mode of transport

                    Also contains a users stats summing all their journeys

            this is the exact structure, where totalTimeWorkingOut is broken down into totalTimeWorkingOutHours,
            totalTimeWorkingOutMinutes and totalTimeWorkingOutSeconds:




        Notes
        -----
        The time taken variables return the hours in a journey,
        the remaining minutes of the journey excluding the hours,
        the remaining seconds excluding both.
        These 3 essentially give the exact amount of time a journey took
        HH:MM:SS


        Exceptions
        ----------
        None.

        """
        # get current user
        current_user_email = get_jwt_identity()
        current_user = models.User.query.filter_by(email=current_user_email).first()

        # Check if user exists
        if not current_user:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404

        # check if email parameter inputted
        friend_email = request.args.get('friend')
        if not friend_email:
            return jsonify({'status': 'error', 'message': 'Friend email is required'}), 400

        # check if friend exists
        friend_user = models.User.query.filter_by(email=friend_email).first()
        if not friend_user:
            return jsonify({'status': 'error', 'message': 'Friend not found'}), 404

        # check if current user and friend are actually friends
        if not (models.Friendship.query.filter_by(requester_id=current_user.id, addressee_id=friend_user.id, status='accepted').first() or
                models.Friendship.query.filter_by(requester_id=friend_user.id, addressee_id=current_user.id, status='accepted').first()):
            return jsonify({'status': 'error', 'message': 'Not friends'}), 403

        # if account is set to private we cant access it and dispaly its information
        if friend_user.isPrivate:
            return jsonify({'status': 'error', 'message': 'Friend\'s account is private'}), 403


        # get friend
        user = models.User.query.filter_by(email=friend_email).first()

        # Check if user exists
        if not user:
            return jsonify({'status': 404, 'message': 'User not found'}), 404

        # Retrieve all journeys associated with the user
        journeys = models.Journey.query.filter_by(userId=user.id).all()

        # Initialize variables to store journey data and totals for each mode

        # List to store individual journey data
        journeysData = []
        total_distance_cycling = 0
        total_calories_burned_cycling = 0
        total_time_taken_hours_cycling = 0
        total_time_taken_minutes_cycling = 0
        total_time_taken_seconds_cycling = 0
        total_time_in_seconds_cycling = 0

        total_distance_walking = 0
        total_calories_burned_walking = 0
        total_time_taken_hours_walking = 0
        total_time_taken_minutes_walking = 0
        total_time_taken_seconds_walking = 0
        total_time_in_seconds_walking = 0

        total_distance_running = 0
        total_calories_burned_running = 0
        total_time_taken_hours_running = 0
        total_time_taken_minutes_running = 0
        total_time_taken_seconds_running = 0
        total_time_in_seconds_running = 0


        # Iterate over each journey
        for journey in journeys:

            # Temporary dictionary to store data for each journey
            temp_dictionary = {}

            # Check if journey exists
            if not journey:
                return jsonify({'status': 404, 'message': 'Journey not found'}), 404


            # Calculate time taken for the journey

            # Extract start time and end time from the journey object
            date = journey.dateCreated
            start_time = journey.startTime
            end_time = journey.endTime

            # Check if start time or end time is missing
            if not start_time or not end_time:
                return jsonify({'status': 400, 'message': 'Start time or end time missing for this journey'}), 400

            # Calculate the time difference in seconds between start time and end time
            start_seconds = start_time.hour * 3600 + start_time.minute * 60 + start_time.second
            end_seconds = end_time.hour * 3600 + end_time.minute * 60 + end_time.second
            time_diff_seconds = end_seconds - start_seconds

            # breakdown time difference to hours, minutes, and seconds
            hours = time_diff_seconds // 3600
            minutes = (time_diff_seconds % 3600) // 60
            seconds = (time_diff_seconds % 3600) % 60

            # Add time data to the temporary dictionary
            temp_dictionary["date"] = date
            temp_dictionary["hours_taken"] = hours
            temp_dictionary["minutes_taken"] = minutes
            temp_dictionary["seconds_taken"] = seconds


            # Calculate calories burned for the journey

            # MET(metabolic equivalent of task) x Body Weight(kg) x Duration(hours)
            exact_hours = time_diff_seconds / 3600
            average_weight = 62

            if journey.type == "Walk":
                MET = 3.6
            elif journey.type == "Run":
                MET = 9
            else:
                MET = 7

            calories_burned = MET * average_weight * exact_hours

            # Add calories burned data to the temporary dictionary
            temp_dictionary["caloriesBurned"] = calories_burned


            # Add distance data to the temporary dictionary
            distance = journey.totalDistance
            temp_dictionary["totalDistance"]  = distance


            # Calculate average speed for the journey
            mph = (distance // (time_diff_seconds / 3600))
            temp_dictionary["averageSpeed"] = mph

            # Add mode of transport of journey to the temporary dictionary
            mode = journey.type
            temp_dictionary["mode"] = mode

            # Add journey ID data to the temporary dictionary
            journeyID = journey.id
            temp_dictionary["journeyId"] = journeyID

            # Append the journeys data to the journeysData list
            journeysData.append(temp_dictionary)


            # Update totals for each mode
            if journey.type == "Walk":
                total_distance_walking += distance
                total_calories_burned_walking += calories_burned
                total_time_in_seconds_walking += time_diff_seconds

            elif journey.type == "Run":
                total_distance_running += distance
                total_calories_burned_running += calories_burned
                total_time_in_seconds_running += time_diff_seconds

            else:
                total_distance_cycling += distance
                total_calories_burned_cycling += calories_burned
                total_time_in_seconds_cycling += time_diff_seconds


        # Calculate total time for each mode
        total_time_taken_hours_walking = total_time_in_seconds_walking // 3600
        total_time_taken_minutes_walking = (total_time_in_seconds_walking % 3600) // 60
        total_time_taken_seconds_walking = (total_time_in_seconds_walking % 3600) % 60


        total_time_taken_hours_running = total_time_in_seconds_running // 3600
        total_time_taken_minutes_running = (total_time_in_seconds_running % 3600) // 60
        total_time_taken_seconds_running = (total_time_in_seconds_running % 3600) % 60


        total_time_taken_hours_cycling = total_time_in_seconds_walking // 3600
        total_time_taken_minutes_cycling = (total_time_in_seconds_walking % 3600) // 60
        total_time_taken_seconds_cycling = (total_time_in_seconds_walking % 3600) % 60

        # Initialize dictionaries to store data for each mode
        byModes = {}
        cycle = {}
        walking = {}
        running = {}

        cycle["totalDistance"] = total_distance_cycling
        cycle["totalCaloriesBurned"] = total_calories_burned_cycling
        cycle["totalTimeWorkingOutHours"] = total_time_taken_hours_cycling
        cycle["totalTimeWorkingOutMinutes"] = total_time_taken_minutes_cycling
        cycle["totalTimeWorkingOutSeconds"] = total_time_taken_seconds_cycling

        walking["totalDistance"] = total_distance_walking
        walking["totalCaloriesBurned"] = total_calories_burned_walking
        walking["totalTimeWorkingOutHours"] = total_time_taken_hours_walking
        walking["totalTimeWorkingOutMinutes"] = total_time_taken_minutes_walking
        walking["totalTimeWorkingOutSeconds"] = total_time_taken_seconds_walking

        running["totalDistance"] = total_distance_running
        running["totalCaloriesBurned"] = total_calories_burned_running
        running["totalTimeWorkingOutHours"] = total_time_taken_hours_running
        running["totalTimeWorkingOutMinutes"] = total_time_taken_minutes_running
        running["totalTimeWorkingOutSeconds"] = total_time_taken_seconds_running

        # Add each mode of transports dictionary to byModes
        byModes["cycle"] = cycle
        byModes["walking"] = walking
        byModes["running"] = running

        # Calculate totals for all journeys

        total_distance_all_journeys = total_distance_cycling + total_distance_walking + total_distance_running
        total_calories_burned_all_journeys = total_calories_burned_cycling + total_calories_burned_walking + total_calories_burned_running

        total_time_app_used = total_time_in_seconds_walking + total_time_in_seconds_running + total_time_in_seconds_cycling
        total_time_taken_hours_total = total_time_app_used // 3600
        total_time_taken_minutes_total = (total_time_app_used % 3600) // 60
        total_time_taken_seconds_total = (total_time_app_used % 3600) % 60

        # Create final data dictionary, this will contain all the other data for a user and their journeys
        data = {}

        # fill data dictionary with the relevant data
        data["journeysData"] = journeysData
        data["byModes"] = byModes
        data["totalDistanceCombined"] = total_distance_all_journeys
        data["totalCaloriesBurned"] = total_calories_burned_all_journeys
        data["totalTimeWorkingOutHours"] = total_time_taken_hours_total
        data["totalTimeWorkingOutMinutes"] = total_time_taken_minutes_total
        data["totalTimeWorkingOutSeconds"] = total_time_taken_seconds_total

        # Return status, indicating successful completion of Api, and the data dictionary
        return jsonify({'status': 200, 'data': data}), 200