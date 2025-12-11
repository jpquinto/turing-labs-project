import os
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List


class SubmissionService:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb')
        self.table_name = os.environ.get('SUBMISSIONS_TABLE_NAME')
        if not self.table_name:
            raise ValueError("SUBMISSIONS_TABLE_NAME environment variable is not set")
        self.table = self.dynamodb.Table(self.table_name)

    def get_submission_by_id(self, submission_id: str, recipe_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a submission by its submission_id and recipe_id (composite key)
        """
        try:
            response = self.table.get_item(
                Key={
                    'submission_id': submission_id,
                    'recipe_id': recipe_id
                }
            )
            return response.get('Item')
        except Exception as e:
            raise Exception(f"Error retrieving submission by ID: {str(e)}")

    def query_submissions_by_recipe(self, recipe_id: str) -> List[Dict[str, Any]]:
        """
        Query submissions by recipe_id using GSI
        """
        try:
            response = self.table.query(
                IndexName='recipe_id_index',
                KeyConditionExpression=Key('recipe_id').eq(recipe_id)
            )
            return response.get('Items', [])
        except Exception as e:
            raise Exception(f"Error querying submissions by recipe_id: {str(e)}")

    def query_submissions_by_trial(self, trial_id: str) -> List[Dict[str, Any]]:
        """
        Query submissions by trial_id using GSI
        """
        try:
            response = self.table.query(
                IndexName='trial_id_index',
                KeyConditionExpression=Key('trial_id').eq(trial_id)
            )
            return response.get('Items', [])
        except Exception as e:
            raise Exception(f"Error querying submissions by trial_id: {str(e)}")

    def query_submissions_by_participant(self, participant_id: str) -> List[Dict[str, Any]]:
        """
        Query submissions by participant_id using GSI
        """
        try:
            response = self.table.query(
                IndexName='participant_id_index',
                KeyConditionExpression=Key('participant_id').eq(participant_id)
            )
            return response.get('Items', [])
        except Exception as e:
            raise Exception(f"Error querying submissions by participant_id: {str(e)}")

    def create_submission(
        self,
        recipe_id: str,
        trial_id: str,
        participant_id: str,
        score: float,
        status: str = "draft",
        notes: Optional[str] = None,
        voice_memo_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new submission
        """
        try:
            # Validate status
            if status not in ["draft", "saved"]:
                raise ValueError("Status must be 'draft' or 'saved'")

            submission_id = str(uuid.uuid4())
            current_time = datetime.utcnow().isoformat()

            item = {
                'submission_id': submission_id,
                'recipe_id': recipe_id,
                'trial_id': trial_id,
                'participant_id': participant_id,
                'score': Decimal(str(score)),
                'status': status,
                'last_updated': current_time
            }

            # Add optional fields if provided
            if notes is not None:
                item['notes'] = notes
            if voice_memo_key is not None:
                item['voice_memo_key'] = voice_memo_key

            self.table.put_item(Item=item)
            return item
        except ValueError as ve:
            raise ve
        except Exception as e:
            raise Exception(f"Error creating submission: {str(e)}")

    def update_submission(
        self,
        submission_id: str,
        recipe_id: str,
        updates: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update an existing submission
        """
        try:
            # Build update expression dynamically
            update_expression_parts = []
            expression_attribute_names = {}
            expression_attribute_values = {}

            # Allowed fields for update
            allowed_fields = ['notes', 'voice_memo_key', 'score', 'status']

            for field, value in updates.items():
                if field not in allowed_fields:
                    continue

                # Validate status if being updated
                if field == 'status' and value not in ["draft", "saved"]:
                    raise ValueError("Status must be 'draft' or 'saved'")

                update_expression_parts.append(f"#{field} = :{field}")
                expression_attribute_names[f"#{field}"] = field

                # Convert score to Decimal if needed
                if field == 'score':
                    expression_attribute_values[f":{field}"] = Decimal(str(value))
                else:
                    expression_attribute_values[f":{field}"] = value

            # Always update last_updated
            update_expression_parts.append("#last_updated = :last_updated")
            expression_attribute_names["#last_updated"] = "last_updated"
            expression_attribute_values[":last_updated"] = datetime.utcnow().isoformat()

            if not update_expression_parts:
                raise ValueError("No valid fields to update")

            update_expression = "SET " + ", ".join(update_expression_parts)

            response = self.table.update_item(
                Key={
                    'submission_id': submission_id,
                    'recipe_id': recipe_id
                },
                UpdateExpression=update_expression,
                ExpressionAttributeNames=expression_attribute_names,
                ExpressionAttributeValues=expression_attribute_values,
                ReturnValues="ALL_NEW"
            )

            return response.get('Attributes')
        except ValueError as ve:
            raise ve
        except Exception as e:
            raise Exception(f"Error updating submission: {str(e)}")

    @staticmethod
    def decimal_to_float(obj):
        """
        Convert Decimal objects to float for JSON serialization
        """
        if isinstance(obj, Decimal):
            return float(obj)
        raise TypeError