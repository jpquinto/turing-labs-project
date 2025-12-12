import os
import hmac
import hashlib
import json


def handler(event, context):
    expected_secret = os.environ.get("AUTH0_WEBHOOK_SECRET")
    
    provided_secret = event.get("authorizationToken")
    
    if not expected_secret:
        print("ERROR: AUTH0_WEBHOOK_SECRET environment variable not set")
        return generate_policy("Deny", event["methodArn"])
    
    if not provided_secret:
        print("ERROR: No authorization token found in request")
        return generate_policy("Deny", event["methodArn"])
    
    if hmac.compare_digest(provided_secret, expected_secret):
        print("Authorization successful - secrets match")
        return generate_policy("Allow", event["methodArn"])
    
    print("Authorization failed - secrets do not match")
    return generate_policy("Deny", event["methodArn"])


def generate_policy(effect, resource):
    return {
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