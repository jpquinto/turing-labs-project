import os
import hmac
import hashlib
import json


def handler(event, context):
    # Add comprehensive logging
    print("=== Authorizer Event ===")
    print(json.dumps(event, indent=2))
    
    expected_secret = os.environ.get("AUTH0_WEBHOOK_SECRET")
    print(f"Expected secret exists: {bool(expected_secret)}")
    print(f"Expected secret length: {len(expected_secret) if expected_secret else 0}")
    
    # API Gateway can lowercase headers - check both cases
    headers = event.get("headers", {})
    print(f"All headers: {json.dumps(headers, indent=2)}")
    
    # Try multiple header key variations
    provided_secret = (
        headers.get("x-webhook-secret") or 
        headers.get("X-Webhook-Secret") or
        headers.get("X-WEBHOOK-SECRET")
    )
    
    print(f"Provided secret exists: {bool(provided_secret)}")
    print(f"Provided secret length: {len(provided_secret) if provided_secret else 0}")
    
    if not expected_secret:
        print("ERROR: AUTH0_WEBHOOK_SECRET environment variable not set")
        return generate_policy("Deny", event["methodArn"])
    
    if not provided_secret:
        print("ERROR: No x-webhook-secret header found in request")
        return generate_policy("Deny", event["methodArn"])
    
    # Use constant-time comparison
    if hmac.compare_digest(provided_secret, expected_secret):
        print("Authorization successful - secrets match")
        return generate_policy("Allow", event["methodArn"])
    
    print("Authorization failed - secrets do not match")
    return generate_policy("Deny", event["methodArn"])


def generate_policy(effect, resource):
    policy = {
        "principalId": "webhook",
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": "execute-api:Invoke",
                    "Effect": effect,
                    "Resource": resource,
                }
            ],
        },
    }
    print(f"Generated policy: {json.dumps(policy, indent=2)}")
    return policy