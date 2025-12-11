import os
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal
import uuid
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
    
    def create_participant(self, trial_id: str, code: str, 
                          tasks_assigned: int = 0, tasks_completed: int = 0) -> Dict[str, Any]:
        """
        Create a new participant
        """
        try:
            participant_id = str(uuid.uuid4())
            
            item = {
                'participant_id': participant_id,
                'trial_id': trial_id,
                'code': code,
                'tasks_assigned': tasks_assigned,
                'tasks_completed': tasks_completed
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

