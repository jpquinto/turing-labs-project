import os
import json
import boto3
from datetime import datetime, timezone

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["USERS_TABLE_NAME"])


def handler(event, context):
    body = json.loads(event["body"])
    user = body["user"]

    table.put_item(
        Item={
            "user_id": user["user_id"],
            "email": user.get("email"),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    )

    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "User created successfully",
        }),
    }