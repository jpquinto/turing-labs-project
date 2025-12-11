import os
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal
import uuid
import random
from typing import Optional, Dict, Any


class ParticipantService:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb')
        self.table_name = os.environ.get('PARTICIPANTS_TABLE_NAME')
        if not self.table_name:
            raise ValueError("PARTICIPANTS_TABLE_NAME environment variable is not set")
        self.table = self.dynamodb.Table(self.table_name)
    
    def get_participant_by_id(self, participant_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a participant by their participant_id (primary key)
        """
        try:
            response = self.table.get_item(Key={'participant_id': participant_id})
            return response.get('Item')
        except Exception as e:
            raise Exception(f"Error retrieving participant by ID: {str(e)}")
    
    def get_participant_by_code(self, code: str) -> Optional[Dict[str, Any]]:
        """
        Get a participant by their code using GSI
        """
        try:
            response = self.table.query(
                IndexName='code_index',
                KeyConditionExpression=Key('code').eq(code)
            )
            items = response.get('Items', [])
            return items[0] if items else None
        except Exception as e:
            raise Exception(f"Error retrieving participant by code: {str(e)}")

    def query_participants_by_trial(self, trial_id: str):
        """
        Query participants by trial_id using GSI
        """
        try:
            response = self.table.query(
                IndexName='trial_id_index',
                KeyConditionExpression=Key('trial_id').eq(trial_id)
            )
            return response.get('Items', [])
        except Exception as e:
            raise Exception(f"Error querying participants by trial_id: {str(e)}")
    
    def generate_unique_code(self, trial_id: str) -> str:
        """
        Generate a unique 6-digit code for a participant
        """
        max_attempts = 10
        for _ in range(max_attempts):
            code = str(random.randint(100000, 999999))
            # Check if code already exists
            existing = self.get_participant_by_code(code)
            if not existing:
                return code
        raise Exception("Failed to generate unique code after maximum attempts")

    def create_participant(self, trial_id: str, name: str) -> Dict[str, Any]:
        """
        Create a new participant with auto-generated 6-digit code
        """
        try:
            participant_id = str(uuid.uuid4())
            code = self.generate_unique_code(trial_id)
            
            item = {
                'participant_id': participant_id,
                'trial_id': trial_id,
                'code': code,
                'name': name,
                'tasks_completed': 0
            }
            
            self.table.put_item(Item=item)
            return item
        except Exception as e:
            raise Exception(f"Error creating participant: {str(e)}")
    
    @staticmethod
    def decimal_to_int(obj):
        """
        Convert Decimal objects to int for JSON serialization
        """
        if isinstance(obj, Decimal):
            return int(obj)
        raise TypeError

