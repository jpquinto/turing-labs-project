import json
from services.participants import ParticipantService
from decimal import Decimal


def decimal_default(obj):
    """Helper function to convert Decimal to int for JSON serialization"""
    if isinstance(obj, Decimal):
        return int(obj)
    raise TypeError


def create_response(status_code: int, body: dict):
    """Create a standardized API Gateway response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
        'body': json.dumps(body, default=decimal_default)
    }


def handler(event, context):
    """
    Lambda handler for participant endpoints
    Routes GET and POST requests
    """
    try:
        http_method = event.get('httpMethod')
        query_params = event.get('queryStringParameters') or {}
        path_params = event.get('pathParameters') or {}

        service = ParticipantService()

        # GET endpoint - retrieve participant by ID or by code
        if http_method == 'GET':
            # Check if querying by code (using query parameter)
            if 'code' in query_params:
                code = query_params['code']
                participant = service.get_participant_by_code(code)

                if not participant:
                    return create_response(404, {
                        'error': 'Participant not found',
                        'message': f'No participant found with code: {code}'
                    })

                return create_response(200, {
                    'message': 'Participant retrieved successfully',
                    'data': participant
                })

            # Query by participant_id (path parameter)
            elif 'participant_id' in path_params:
                participant_id = path_params['participant_id']
                participant = service.get_participant_by_id(participant_id)

                if not participant:
                    return create_response(404, {
                        'error': 'Participant not found',
                        'message': f'No participant found with ID: {participant_id}'
                    })

                return create_response(200, {
                    'message': 'Participant retrieved successfully',
                    'data': participant
                })

            else:
                return create_response(400, {
                    'error': 'Bad Request',
                    'message': 'Must provide either participant_id in path or code in query parameters'
                })

        # POST endpoint - create new participant
        elif http_method == 'POST':
            try:
                body = json.loads(event.get('body', '{}'))
            except json.JSONDecodeError:
                return create_response(400, {
                    'error': 'Invalid JSON',
                    'message': 'Request body must be valid JSON'
                })

            # Validate required fields
            if 'trial_id' not in body or 'code' not in body:
                return create_response(400, {
                    'error': 'Missing required fields',
                    'message': 'trial_id and code are required'
                })

            trial_id = body['trial_id']
            code = body['code']
            tasks_assigned = body.get('tasks_assigned', 0)
            tasks_completed = body.get('tasks_completed', 0)

            # Create the participant
            participant = service.create_participant(
                trial_id=trial_id,
                code=code,
                tasks_assigned=tasks_assigned,
                tasks_completed=tasks_completed
            )

            return create_response(201, {
                'message': 'Participant created successfully',
                'data': participant
            })

        elif http_method == 'OPTIONS':
            return create_response(200, {'message': 'OK'})

        else:
            return create_response(405, {
                'error': 'Method Not Allowed',
                'message': f'HTTP method {http_method} is not supported'
            })

    except Exception as e:
        print(f"Error in handler: {str(e)}")
        return create_response(500, {
            'error': 'Internal Server Error',
            'message': str(e)
        })
