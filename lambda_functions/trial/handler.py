import json
from services.trials import TrialService
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
    Lambda handler for trial endpoints
    Routes GET and POST requests
    """
    try:
        http_method = event.get('httpMethod')
        path_params = event.get('pathParameters') or {}

        service = TrialService()

        # GET endpoint - retrieve trial(s)
        if http_method == 'GET':
            # If id is provided in path params, get single trial
            if 'id' in path_params and path_params['id']:
                trial_id = path_params['id']
                trial = service.get_trial_by_id(trial_id)

                if not trial:
                    return create_response(404, {
                        'error': 'Trial not found',
                        'message': f'No trial found with ID: {trial_id}'
                    })

                return create_response(200, {
                    'message': 'Trial retrieved successfully',
                    'data': trial
                })

            # Otherwise, get all trials
            else:
                result = service.get_all_trials()
                return create_response(200, {
                    'message': 'Trials retrieved successfully',
                    'data': result['trials'],
                    'count': result['count']
                })

        # POST endpoint - create new trial
        elif http_method == 'POST':
            try:
                body = json.loads(event.get('body', '{}'))
            except json.JSONDecodeError:
                return create_response(400, {
                    'error': 'Invalid JSON',
                    'message': 'Request body must be valid JSON'
                })

            # Validate required fields
            if 'trial_name' not in body or 'status' not in body or 'trial_date' not in body:
                return create_response(400, {
                    'error': 'Missing required fields',
                    'message': 'trial_name, status and trial_date are required'
                })

            trial_name = body['trial_name']
            status = body['status']
            trial_date = body['trial_date']

            # Create the trial
            trial = service.create_trial(
                trial_name=trial_name,
                status=status,
                trial_date=trial_date
            )

            return create_response(201, {
                'message': 'Trial created successfully',
                'data': trial
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