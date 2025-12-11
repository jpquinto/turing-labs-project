import os
import boto3
from decimal import Decimal
import uuid
from typing import Optional, Dict, Any


class TrialService:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb')
        self.table_name = os.environ.get('TRIALS_TABLE_NAME')
        if not self.table_name:
            raise ValueError("TRIALS_TABLE_NAME environment variable is not set")
        self.table = self.dynamodb.Table(self.table_name)
    
    def get_trial_by_id(self, trial_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a trial by its trial_id (primary key)
        """
        try:
            response = self.table.get_item(Key={'trial_id': trial_id})
            return response.get('Item')
        except Exception as e:
            raise Exception(f"Error retrieving trial by ID: {str(e)}")
    
    def get_all_trials(self) -> Dict[str, Any]:
        """
        Get all trials from the table
        """
        try:
            response = self.table.scan()
            items = response.get('Items', [])

            # Handle pagination if there are more items
            while 'LastEvaluatedKey' in response:
                response = self.table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
                items.extend(response.get('Items', []))

            return {
                'trials': items,
                'count': len(items)
            }
        except Exception as e:
            raise Exception(f"Error retrieving trials: {str(e)}")


    def create_trial(self, trial_name: str, status: str, trial_date: str) -> Dict[str, Any]:
        """
        Create a new trial
        """
        try:
            trial_id = str(uuid.uuid4())

            item = {
                'trial_id': trial_id,
                'trial_name': trial_name,
                'status': status,
                'trial_date': trial_date
            }

            self.table.put_item(Item=item)
            return item
        except Exception as e:
            raise Exception(f"Error creating trial: {str(e)}")
    
    @staticmethod
    def decimal_to_int(obj):
        """
        Convert Decimal objects to int for JSON serialization
        """
        if isinstance(obj, Decimal):
            return int(obj)
        raise TypeError