from app import (app, db, models, get_jwt_identity, jwt_required)
from flask import request, jsonify, make_response
from typing import Tuple
from datetime import datetime
import json
import xml.etree.ElementTree as ET

class GPSRoutes:
    """
    Class for querying the journey data.

    Attributes
    ----------
    None

    Methods
    -------
    validate_points(points) -> json:
        Returns if the points are valid or not.
    getJourneys(userId) -> json:
        returns the journeys of a user.
    createJourney() -> json:
        creates a journey for a user.
    deleteJourney(journeyId) -> json:
        deletes a particular journey.
    updateJourney(journeyId) -> json:
        updates the data of a particular journey.
    """

    def validate_points(points):
        """
        Validates that each item in the points list contains exactly 'lat', 'lon', and 'ele' keys.

        Parameters:
        - points (list): The list of point dictionaries to validate.

        Returns:
        - (bool, str): Tuple containing a boolean indicating if the validation passed,
                    and a string with an error message if it failed.
        """
        if points != []:
            required_keys = {'lat', 'lon', 'ele'}
            for point in points:
                point_keys = set(point.keys())
                if point_keys != required_keys:
                    missing_keys = required_keys - point_keys
                    extra_keys = point_keys - required_keys
                    error_message = []
                    if missing_keys:
                        error_message.append(f"Missing keys: {', '.join(missing_keys)}")
                    if extra_keys:
                        error_message.append(f"Extra keys: {', '.join(extra_keys)}")
                    return False, '; '.join(error_message)

                # Check that all values are numerical
                for key in required_keys:
                    value = point[key]
                    if not isinstance(value, (int, float)):
                        return False, f"Invalid value for {key}: {value}. Must be a numerical value."

            return True, ""
        return False, "No data provided"

    @app.route("/get_journeys_of_user", methods=["GET"])
    @jwt_required()
    def getJourneys() -> Tuple[dict, int]:
        """
        Returns all the journeys of a user.

        Parameters
        ----------
        userId : int
            The user for which you want to query the journeys.

        Returns
        -------
        Json
            A JSON object that contains the userId and an array of all
            the journeys that belong to the user.

        Notes
        -----
        If there are no journeys that belong to the user a 404 error will be sent as there was no
        journey data found. If the journey data exists, it is returned with a response of 200.

        Exceptions
        ----------
        None.

        """

        current_user_email = get_jwt_identity()
        user = models.User.query.filter_by(email=current_user_email).first()
        if not user:
            return jsonify({'status': 404, 'message': 'User not found'}), 404

        journeys = models.Journey.query.filter_by(userId=user.id).all()
        journey_data = []
        for journey in journeys:
            points = json.loads(journey.points) if journey.points else []

            journey_data.append({
                'id': journey.id,
                'name': journey.name,
                'type': journey.type,
                'totalDistance': journey.totalDistance,
                'elevation': {
                    'avg': journey.avgEle,
                    'min': journey.minEle,
                    'max': journey.maxEle,
                },
                'points': points,
                'startTime': journey.startTime.strftime('%H:%M:%S') if journey.startTime else None,
                'endTime': journey.endTime.strftime('%H:%M:%S') if journey.endTime else None,
                'dateCreated': journey.dateCreated.strftime('%d-%m-%Y') if journey.dateCreated else None,
            })

        if journey_data:
            return jsonify({'status': 200, 'data': journey_data}), 200
        else:
            return jsonify({'status': 404, 'message': 'No journeys found for given userId'}), 404

    @app.route("/create_journey", methods=["POST"])
    @jwt_required()
    def createJourney() -> Tuple[dict, int]:
        """
        Creates a journey for a user.

        Parameters
        ----------
        None.

        Returns
        -------
        Json
            A JSON object that contains a message related to the creation of the data.

        Notes
        -----
        The format of the date/time variables must be handled with caution as the table only
        accepts a particular data/time format. A response of 201 is returned if the data is
        created successfully, else a code of 400 is returned (Incorrect data).

        Exceptions
        ----------
        ValueError
            Raised when the startTime, endTime or dateCreated variables are not in the correct
            format.

        """
        current_user_email = get_jwt_identity()
        user = models.User.query.filter_by(email=current_user_email).first()
        if not user:
            return jsonify({'status': 404, 'message': 'User not found'}), 404

        data = request.get_json()

        points = data.get('points')
        if points is None:
            return jsonify({'status': 400, 'message': 'Missing field: points'}), 400

        valid, error_message = GPSRoutes.validate_points(points)
        if not valid:
            return jsonify({'status': 400, 'message': f'Invalid points data: {error_message}'}), 400

        try:
            name = data['name']
            journey_type = data['type']
            if journey_type not in ['Run', 'Walk', 'Cycle']:
                return jsonify({'status': 400, 'message': 'Invalid journey type. Must be Run, Walk, or Cycle'}), 400
            totalDistance = data['totalDistance']
            elevation = data['elevation']
            avgEle = elevation['avg']
            minEle = elevation['min']
            maxEle = elevation['max']
            points = json.dumps(data['points'])

        except KeyError as e:
            return jsonify({'status': 400, 'message': f'Missing field: {str(e)}'}), 400

        try:
            startTime = datetime.strptime(data['startTime'], '%H:%M:%S').time()
            endTime = datetime.strptime(data['endTime'], '%H:%M:%S').time()
            dateCreated = datetime.strptime(data['dateCreated'], '%Y-%m-%d').date()
        except ValueError as e:
            return jsonify({'status': 400, 'message': 'Invalid date/time format'}), 400

        journey = models.Journey(
            userId=user.id,
            name=name,
            type=journey_type,
            totalDistance=totalDistance,
            avgEle=avgEle,
            minEle=minEle,
            maxEle=maxEle,
            points=points,
            startTime=startTime,
            endTime=endTime,
            dateCreated=dateCreated
        )

        db.session.add(journey)
        db.session.commit()


        return jsonify({'status': 201, 'message': 'Journey created successfully'}), 201

    @app.route("/delete_journey/<int:journeyId>", methods=["DELETE"])
    @jwt_required()
    def deleteJourney(journeyId) -> Tuple[dict, int]:
        """
        Deletes a journey of a user.

        Parameters
        ----------
        journeyId : int
            The journey that you want to delete.

        Returns
        -------
        Json
            A JSON object that contains information about the deletion of the journey.

        Notes
        -----
        None.

        Exceptions
        ----------
        None.

        """
        current_user_email = get_jwt_identity()
        user = models.User.query.filter_by(email=current_user_email).first()
        if not user:
            return jsonify({'status': 404, 'message': 'User not found'}), 404
        journeys = models.Journey.query.filter_by(userId=user.id).all()

        for journey in journeys:
            if journeyId == journey.id:
                db.session.delete(journey)
                db.session.commit()
                return {'status': 200, 'message': 'Journey deleted successfully'}, 200
        return {'status': 404, 'message': 'Journey not found'}, 404

    @app.route("/update_journey/<int:journeyId>", methods=["PUT"])
    @jwt_required()
    def updateJourney(journeyId) -> Tuple[dict, int]:
        """
        Updates a journey of a user.

        Parameters
        ----------
        journeyId : int
            The journey that you want to update.

        Returns
        -------
        Json
            A JSON object that contains information about the changes made to journey.

        Notes
        -----
        None.

        Exceptions
        ----------
        None.

        """

        current_user_email = get_jwt_identity()
        current_user = models.User.query.filter_by(email=current_user_email).first()

        if not current_user:
            return jsonify({'status': 404, 'message': 'User not found'}), 404

        journey = models.Journey.query.get(journeyId)

        if not journey:
            return jsonify({'status': 404, 'message': 'Journey not found'}), 404

        if journey.userId != current_user.id:
            return jsonify({'status': 403, 'message': 'Forbidden: You do not have permission to update this journey'}), 403

        data = request.get_json()

        # Update the journey object with new data if available
        if 'name' in data:
            journey.name = data['name']
        if 'type' in data:
            journey.type = data['type']
        if 'totalDistance' in data:
            journey.totalDistance = data['totalDistance']
        if 'elevation' in data:
            elevation = data['elevation']
            if 'avg' in elevation:
                journey.avgEle = elevation['avg']
            if 'min' in elevation:
                journey.minEle = elevation['min']
            if 'max' in elevation:
                journey.maxEle = elevation['max']

        # Validate points directly from the request JSON
        if 'points' in data:
            points = data['points']
            valid, error_message = GPSRoutes.validate_points(points)
            if not valid:
                return jsonify({'status': 400, 'message': f'Invalid points data: {error_message}'}), 400
            journey.points = json.dumps(points)

        try:
            if 'startTime' in data:
                data['startTime'] = datetime.strptime(data['startTime'], '%H:%M:%S').time()
            if 'endTime' in data:
                data['endTime'] = datetime.strptime(data['endTime'], '%H:%M:%S').time()
            if 'dateCreated' in data:
                data['dateCreated'] = datetime.strptime(data['dateCreated'], '%d-%m-%Y').date()
        except ValueError as e:
            return jsonify({'status': 400, 'message': 'Invalid date/time format'}), 400

        db.session.commit()

        return jsonify({'status': 200, 'message': 'Journey updated successfully'}), 200
    
    @app.route("/convert_journey_to_gpx/<int:journeyId>", methods=["GET"])
    @jwt_required()
    def convert_journey_to_gpx(journeyId) -> Tuple[dict, int]:
        """
        Converts a journey from the database to GPX format based on journey ID.

        Parameters
        ----------
        journeyId : int
            The ID of the journey to convert.

        Returns
        -------
        Response
            GPX data.
        """

        current_user_email = get_jwt_identity()
        current_user = models.User.query.filter_by(email=current_user_email).first()

        if not current_user:
            return jsonify({'status': 404, 'message': 'User not found'}), 404

        journey = models.Journey.query.get(journeyId)
        if not journey:
            return jsonify({'status': 404, 'message': 'Journey not found'}), 404
        
        if journey.userId != current_user.id:
            return jsonify({'status': 403, 'message': 'Forbidden: You do not have permission to access this journey'}), 403

        gpx = ET.Element('gpx', version='1.1', creator=current_user.first_name)

        metadata = ET.SubElement(gpx, 'metadata')
        ET.SubElement(metadata, 'name').text = journey.name
        ET.SubElement(metadata, 'time').text = journey.dateCreated.isoformat()

        trk = ET.SubElement(gpx, 'trk')
        ET.SubElement(trk, 'name').text = journey.name
        ET.SubElement(trk, 'type').text = journey.type

        trkseg = ET.SubElement(trk, 'trkseg')

        points = json.loads(journey.points)
        for point in points:
            trkpt = ET.SubElement(trkseg, 'trkpt', lat=str(point['lat']), lon=str(point['lon']))
            ET.SubElement(trkpt, 'ele').text = str(point['ele'])

        gpx_data = ET.tostring(gpx, encoding='utf-8', method='xml').decode('utf-8')

        response = make_response(gpx_data)
        response.headers["Content-Type"] = "application/gpx+xml"

        return response, 200