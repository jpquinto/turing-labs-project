import json
import os
import boto3
import time
import uuid
from botocore.exceptions import ClientError


def handler(event, context):
    """
    Lambda handler for transcribing voice memos
    Invoked asynchronously with submission_id and voice_memo_key
    """
    try:
        print(f"Received event: {json.dumps(event)}")
        
        # Extract parameters from event
        submission_id = event.get('submission_id')
        voice_memo_key = event.get('voice_memo_key')
        recipe_id = event.get('recipe_id')
        
        if not submission_id or not voice_memo_key or not recipe_id:
            raise ValueError("submission_id, voice_memo_key, and recipe_id are required")
        
        # Get environment variables
        voice_memo_bucket = os.environ.get('VOICE_MEMO_BUCKET')
        submissions_table = os.environ.get('SUBMISSIONS_TABLE_NAME')
        
        if not voice_memo_bucket or not submissions_table:
            raise ValueError("Required environment variables not set")
        
        # Initialize AWS clients
        transcribe_client = boto3.client('transcribe')
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(submissions_table)
        
        # Start transcription job
        job_name = f"transcribe-{submission_id}-{uuid.uuid4().hex[:8]}"
        media_uri = f"s3://{voice_memo_bucket}/{voice_memo_key}"
        
        print(f"Starting transcription job: {job_name}")
        print(f"Media URI: {media_uri}")
        
        transcribe_client.start_transcription_job(
            TranscriptionJobName=job_name,
            Media={'MediaFileUri': media_uri},
            MediaFormat='webm',
            LanguageCode='en-US'
        )
        
        # Poll for transcription completion
        max_wait_time = 300  # 5 minutes
        poll_interval = 5  # 5 seconds
        elapsed_time = 0
        
        while elapsed_time < max_wait_time:
            response = transcribe_client.get_transcription_job(
                TranscriptionJobName=job_name
            )
            
            status = response['TranscriptionJob']['TranscriptionJobStatus']
            print(f"Transcription status: {status} (elapsed: {elapsed_time}s)")
            
            if status == 'COMPLETED':
                # Get the transcript
                transcript_uri = response['TranscriptionJob']['Transcript']['TranscriptFileUri']
                
                # Download transcript
                import urllib.request
                with urllib.request.urlopen(transcript_uri) as url:
                    transcript_data = json.loads(url.read().decode())
                
                # Extract the full transcript text
                transcript_text = transcript_data['results']['transcripts'][0]['transcript']
                
                print(f"Transcription completed: {transcript_text[:100]}...")
                
                # Update submission in DynamoDB
                table.update_item(
                    Key={
                        'submission_id': submission_id,
                        'recipe_id': recipe_id
                    },
                    UpdateExpression='SET transcription = :transcription',
                    ExpressionAttributeValues={
                        ':transcription': transcript_text
                    }
                )
                
                print(f"Updated submission {submission_id} with transcription")
                
                # Clean up transcription job
                transcribe_client.delete_transcription_job(
                    TranscriptionJobName=job_name
                )
                
                return {
                    'statusCode': 200,
                    'body': json.dumps({
                        'message': 'Transcription completed successfully',
                        'submission_id': submission_id,
                        'transcription': transcript_text
                    })
                }
            
            elif status == 'FAILED':
                failure_reason = response['TranscriptionJob'].get('FailureReason', 'Unknown')
                print(f"Transcription failed: {failure_reason}")
                
                # Clean up failed job
                transcribe_client.delete_transcription_job(
                    TranscriptionJobName=job_name
                )
                
                raise Exception(f"Transcription job failed: {failure_reason}")
            
            # Still in progress, wait and poll again
            time.sleep(poll_interval)
            elapsed_time += poll_interval
        
        # Timeout
        print(f"Transcription timed out after {max_wait_time}s")
        raise Exception(f"Transcription job timed out after {max_wait_time} seconds")
    
    except Exception as e:
        print(f"Error in transcription handler: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': 'Transcription failed',
                'message': str(e)
            })
        }

