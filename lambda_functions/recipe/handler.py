import json
from services.recipes import RecipeService
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
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
        'body': json.dumps(body, default=decimal_default)
    }


def handler(event, context):
    """
    Lambda handler for recipe endpoints
    Routes GET and POST requests
    """
    try:
        http_method = event.get('httpMethod')
        query_params = event.get('queryStringParameters') or {}
        path_params = event.get('pathParameters') or {}

        service = RecipeService()

        # GET endpoint - retrieve recipe by ID or query by trial_id
        if http_method == 'GET':
            # Get by recipe_id (with trial_id in query params) - CHECK THIS FIRST
            if 'id' in path_params and 'trial_id' in query_params:
                recipe_id = path_params['id']
                trial_id = query_params['trial_id']
                recipe = service.get_recipe_by_id(recipe_id, trial_id)

                if not recipe:
                    return create_response(404, {
                        'error': 'Recipe not found',
                        'message': f'No recipe found with recipe_id: {recipe_id} and trial_id: {trial_id}'
                    })

                return create_response(200, {
                    'message': 'Recipe retrieved successfully',
                    'data': recipe
                })

            # Query by trial_id (without path param)
            elif 'trial_id' in query_params and 'id' not in path_params:
                trial_id = query_params['trial_id']
                recipes = service.query_recipes_by_trial(trial_id)

                return create_response(200, {
                    'message': 'Recipes retrieved successfully',
                    'data': recipes,
                    'count': len(recipes)
                })

            else:
                return create_response(400, {
                    'error': 'Bad Request',
                    'message': 'Must provide either trial_id in query parameters for listing, or path parameter (id) with trial_id query parameter for single recipe'
                })

        # POST endpoint - create new recipe
        elif http_method == 'POST':
            try:
                body = json.loads(event.get('body', '{}'))
            except json.JSONDecodeError:
                return create_response(400, {
                    'error': 'Invalid JSON',
                    'message': 'Request body must be valid JSON'
                })

            # Validate required fields
            required_fields = [
                'trial_id', 'recipe_name', 'sugar', 'stevia_extract',
                'allulose', 'citric_acid', 'target_sugar_reduction_percent',
                'target_cost_per_unit'
            ]
            missing_fields = [field for field in required_fields if field not in body]

            if missing_fields:
                return create_response(400, {
                    'error': 'Missing required fields',
                    'message': f'Required fields: {", ".join(missing_fields)}'
                })

            # Validate numeric fields
            numeric_fields = [
                'sugar', 'stevia_extract', 'allulose', 'citric_acid',
                'target_sugar_reduction_percent', 'target_cost_per_unit'
            ]
            for field in numeric_fields:
                try:
                    float(body[field])
                except (ValueError, TypeError):
                    return create_response(400, {
                        'error': 'Invalid field type',
                        'message': f'{field} must be a number'
                    })

            # Create the recipe
            recipe = service.create_recipe(
                trial_id=body['trial_id'],
                recipe_name=body['recipe_name'],
                sugar=float(body['sugar']),
                stevia_extract=float(body['stevia_extract']),
                allulose=float(body['allulose']),
                citric_acid=float(body['citric_acid']),
                target_sugar_reduction_percent=float(body['target_sugar_reduction_percent']),
                target_cost_per_unit=float(body['target_cost_per_unit']),
                prediction=body.get('prediction', '')
            )

            return create_response(201, {
                'message': 'Recipe created successfully',
                'data': recipe
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
