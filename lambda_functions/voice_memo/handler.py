import json
import os
import boto3
from botocore.exceptions import ClientError
import uuid


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
        'body': json.dumps(body)
    }


def handler(event, context):
    """
    Lambda handler for voice memo upload presigned URL generation
    """
    try:
        http_method = event.get('httpMethod')
        
        # OPTIONS request for CORS
        if http_method == 'OPTIONS':
            return create_response(200, {'message': 'OK'})
        
        # POST request to generate presigned URL
        if http_method == 'POST':
            try:
                body = json.loads(event.get('body', '{}'))
            except json.JSONDecodeError:
                return create_response(400, {
                    'error': 'Invalid JSON',
                    'message': 'Request body must be valid JSON'
                })
            
            # Validate required fields
            if 'file_name' not in body or 'content_type' not in body:
                return create_response(400, {
                    'error': 'Missing required fields',
                    'message': 'file_name and content_type are required'
                })
            
            file_name = body['file_name']
            content_type = body['content_type']
            
            # Generate unique key for the file
            unique_id = str(uuid.uuid4())
            file_extension = file_name.split('.')[-1] if '.' in file_name else 'webm'
            s3_key = f"voice-memos/{unique_id}.{file_extension}"
            
            # Get S3 bucket name from environment
            bucket_name = os.environ.get('VOICE_MEMO_BUCKET')
            if not bucket_name:
                return create_response(500, {
                    'error': 'Configuration error',
                    'message': 'Voice memo bucket not configured'
                })
            
            # Generate presigned URL for upload
            # Use signature version 4 for better CORS support
            region = os.environ.get('AWS_REGION', 'us-west-2')
            s3_client = boto3.client(
                's3',
                region_name=region,
                config=boto3.session.Config(
                    signature_version='s3v4',
                    s3={'addressing_style': 'virtual'}
                )
            )
            try:
                presigned_url = s3_client.generate_presigned_url(
                    'put_object',
                    Params={
                        'Bucket': bucket_name,
                        'Key': s3_key,
                        'ContentType': 'audio/webm'
                    },
                    ExpiresIn=3600  # URL expires in 1 hour
                )
                
                return create_response(200, {
                    'message': 'Presigned URL generated successfully',
                    'data': {
                        'upload_url': presigned_url,
                        's3_key': s3_key,
                        'bucket': bucket_name,
                        'expires_in': 3600
                    }
                })
            except ClientError as e:
                print(f"Error generating presigned URL: {str(e)}")
                return create_response(500, {
                    'error': 'S3 error',
                    'message': 'Failed to generate upload URL'
                })
        
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

