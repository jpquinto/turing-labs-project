import json
from services.submissions import SubmissionService
from decimal import Decimal


def decimal_default(obj):
    """Helper function to convert Decimal to float for JSON serialization"""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError


def create_response(status_code: int, body: dict):
    """Create a standardized API Gateway response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS'
        },
        'body': json.dumps(body, default=decimal_default)
    }


def handler(event, context):
    """
    Lambda handler for submission endpoints
    Routes GET, POST, and PATCH requests
    """
    try:
        http_method = event.get('httpMethod')
        query_params = event.get('queryStringParameters') or {}
        path_params = event.get('pathParameters') or {}

        service = SubmissionService()

        # GET endpoint - retrieve submission by ID or query by recipe/trial/participant
        if http_method == 'GET':
            # Get by submission_id (with recipe_id in query params)
            if 'id' in path_params and 'recipe_id' in query_params:
                submission_id = path_params['id'].replace("%20", " ")
                recipe_id = query_params['recipe_id'].replace("%20", " ")
                submission = service.get_submission_by_id(submission_id, recipe_id)

                if not submission:
                    return create_response(404, {
                        'error': 'Submission not found',
                        'message': f'No submission found with submission_id: {submission_id} and recipe_id: {recipe_id}'
                    })

                return create_response(200, {
                    'message': 'Submission retrieved successfully',
                    'data': submission
                })

            # Query by recipe_id (without path param)
            elif 'recipe_id' in query_params and 'id' not in path_params:
                recipe_id = query_params['recipe_id']
                submissions = service.query_submissions_by_recipe(recipe_id)

                return create_response(200, {
                    'message': 'Submissions retrieved successfully',
                    'data': submissions,
                    'count': len(submissions)
                })

            # Query by trial_id
            elif 'trial_id' in query_params:
                trial_id = query_params['trial_id']
                submissions = service.query_submissions_by_trial(trial_id)

                return create_response(200, {
                    'message': 'Submissions retrieved successfully',
                    'data': submissions,
                    'count': len(submissions)
                })

            # Query by participant_id
            elif 'participant_id' in query_params:
                participant_id = query_params['participant_id']
                submissions = service.query_submissions_by_participant(participant_id)

                return create_response(200, {
                    'message': 'Submissions retrieved successfully',
                    'data': submissions,
                    'count': len(submissions)
                })

            else:
                return create_response(400, {
                    'error': 'Bad Request',
                    'message': 'Must provide either query parameters (recipe_id, trial_id, or participant_id) for listing, or path parameter (id) with recipe_id query parameter for single submission'
                })

        # POST endpoint - create new submission
        elif http_method == 'POST':
            try:
                body = json.loads(event.get('body', '{}'))
            except json.JSONDecodeError:
                return create_response(400, {
                    'error': 'Invalid JSON',
                    'message': 'Request body must be valid JSON'
                })

            # Validate required fields
            required_fields = ['recipe_id', 'trial_id', 'participant_id', 'score']
            missing_fields = [field for field in required_fields if field not in body]

            if missing_fields:
                return create_response(400, {
                    'error': 'Missing required fields',
                    'message': f'Required fields: {", ".join(missing_fields)}'
                })

            # Validate score is numeric
            try:
                float(body['score'])
            except (ValueError, TypeError):
                return create_response(400, {
                    'error': 'Invalid field type',
                    'message': 'score must be a number'
                })

            # Validate status if provided
            status = body.get('status', 'draft')
            if status not in ['draft', 'saved']:
                return create_response(400, {
                    'error': 'Invalid status',
                    'message': 'status must be either "draft" or "saved"'
                })

            # Create the submission
            try:
                submission = service.create_submission(
                    recipe_id=body['recipe_id'],
                    trial_id=body['trial_id'],
                    participant_id=body['participant_id'],
                    score=float(body['score']),
                    status=status,
                    notes=body.get('notes'),
                    voice_memo_key=body.get('voice_memo_key'),
                    submission_id=body.get('submission_id')
                )

                return create_response(201, {
                    'message': 'Submission created successfully',
                    'data': submission
                })
            except ValueError as ve:
                return create_response(400, {
                    'error': 'Validation error',
                    'message': str(ve)
                })

        # PATCH endpoint - update existing submission
        elif http_method == 'PATCH':
            # Get IDs from path and query params
            if 'id' not in path_params or 'recipe_id' not in query_params:
                return create_response(400, {
                    'error': 'Bad Request',
                    'message': 'Must provide id in path and recipe_id in query parameters'
                })

            submission_id = path_params['id']
            recipe_id = query_params['recipe_id']

            try:
                body = json.loads(event.get('body', '{}'))
            except json.JSONDecodeError:
                return create_response(400, {
                    'error': 'Invalid JSON',
                    'message': 'Request body must be valid JSON'
                })

            if not body:
                return create_response(400, {
                    'error': 'Empty update',
                    'message': 'Request body must contain fields to update'
                })

            # Validate status if being updated
            if 'status' in body and body['status'] not in ['draft', 'saved']:
                return create_response(400, {
                    'error': 'Invalid status',
                    'message': 'status must be either "draft" or "saved"'
                })

            # Validate score if being updated
            if 'score' in body:
                try:
                    float(body['score'])
                except (ValueError, TypeError):
                    return create_response(400, {
                        'error': 'Invalid field type',
                        'message': 'score must be a number'
                    })

            # Update the submission
            try:
                updated_submission = service.update_submission(
                    submission_id=submission_id,
                    recipe_id=recipe_id,
                    updates=body
                )

                if not updated_submission:
                    return create_response(404, {
                        'error': 'Submission not found',
                        'message': f'No submission found with submission_id: {submission_id} and recipe_id: {recipe_id}'
                    })

                return create_response(200, {
                    'message': 'Submission updated successfully',
                    'data': updated_submission
                })
            except ValueError as ve:
                return create_response(400, {
                    'error': 'Validation error',
                    'message': str(ve)
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