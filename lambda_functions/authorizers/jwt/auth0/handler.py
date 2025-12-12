import os
import json
import jwt
from jwt import PyJWKClient
from typing import Dict, Any


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda authorizer handler that verifies Auth0 JWT tokens.
    
    Args:
        event: API Gateway authorizer event with authorization token
        context: Lambda context object
        
    Returns:
        IAM policy document allowing or denying access
    """
    
    # Get environment variables
    auth0_domain = os.environ.get('AUTH0_DOMAIN')
    auth0_audience = os.environ.get('AUTH0_AUDIENCE')
    
    if not auth0_domain or not auth0_audience:
        print("ERROR: AUTH0_DOMAIN and AUTH0_AUDIENCE environment variables must be set")
        raise Exception("Unauthorized")
    
    # Extract token from Authorization header
    token = event.get('authorizationToken', '')
    
    # Remove 'Bearer ' prefix if present
    if token.startswith('Bearer '):
        token = token[7:]
    
    if not token:
        print("ERROR: No authorization token provided")
        raise Exception("Unauthorized")
    
    try:
        # Get the JWKS URL from Auth0 domain
        jwks_url = f'https://{auth0_domain}/.well-known/jwks.json'
        
        # Create JWKS client to fetch public keys
        jwks_client = PyJWKClient(jwks_url)
        
        # Get the signing key from the token
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        # Decode and verify the token
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=auth0_audience,
            issuer=f'https://{auth0_domain}/'
        )
        
        # Extract user ID (sub claim)
        user_id = payload.get('sub', 'user')
        
        print(f"Successfully authenticated user: {user_id}")
        
        # Generate IAM policy allowing access
        policy = generate_policy(user_id, 'Allow', event['methodArn'], payload)
        
        return policy
        
    except jwt.ExpiredSignatureError:
        print("ERROR: Token has expired")
        raise Exception("Unauthorized")
    except jwt.InvalidAudienceError:
        print("ERROR: Invalid token audience")
        raise Exception("Unauthorized")
    except jwt.InvalidIssuerError:
        print("ERROR: Invalid token issuer")
        raise Exception("Unauthorized")
    except jwt.InvalidTokenError as e:
        print(f"ERROR: Invalid token: {str(e)}")
        raise Exception("Unauthorized")
    except Exception as e:
        print(f"ERROR: Unexpected error during token validation: {str(e)}")
        raise Exception("Unauthorized")


def generate_policy(principal_id: str, effect: str, resource: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate an IAM policy document for API Gateway.
    
    Args:
        principal_id: User identifier from the token
        effect: 'Allow' or 'Deny'
        resource: ARN of the API Gateway method
        payload: Decoded JWT payload
        
    Returns:
        IAM policy document
    """
    
    # Build the policy document
    policy_document = {
        'principalId': principal_id,
        'policyDocument': {
            'Version': '2012-10-17',
            'Statement': [
                {
                    'Action': 'execute-api:Invoke',
                    'Effect': effect,
                    'Resource': resource
                }
            ]
        },
        'context': {
            'userId': payload.get('sub', ''),
            'email': payload.get('email', ''),
            'scope': payload.get('scope', ''),
        }
    }
    
    return policy_document

