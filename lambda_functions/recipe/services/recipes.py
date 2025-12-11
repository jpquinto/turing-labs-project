import os
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal
import uuid
from typing import Optional, Dict, Any, List


class RecipeService:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb')
        self.table_name = os.environ.get('RECIPES_TABLE_NAME')
        if not self.table_name:
            raise ValueError("RECIPES_TABLE_NAME environment variable is not set")
        self.table = self.dynamodb.Table(self.table_name)

    def get_recipe_by_id(self, recipe_id: str, trial_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a recipe by its recipe_id and trial_id (composite key)
        """
        try:
            response = self.table.get_item(
                Key={
                    'recipe_id': recipe_id,
                    'trial_id': trial_id
                }
            )
            return response.get('Item')
        except Exception as e:
            raise Exception(f"Error retrieving recipe by ID: {str(e)}")

    def query_recipes_by_trial(self, trial_id: str) -> List[Dict[str, Any]]:
        """
        Query recipes by trial_id using GSI
        """
        try:
            response = self.table.query(
                IndexName='trial_id_index',
                KeyConditionExpression=Key('trial_id').eq(trial_id)
            )
            return response.get('Items', [])
        except Exception as e:
            raise Exception(f"Error querying recipes by trial_id: {str(e)}")

    def create_recipe(
        self,
        trial_id: str,
        recipe_name: str,
        sugar: float,
        stevia_extract: float,
        allulose: float,
        citric_acid: float,
        target_sugar_reduction_percent: float,
        target_cost_per_unit: float,
        prediction: str = ""
    ) -> Dict[str, Any]:
        """
        Create a new recipe
        """
        try:
            recipe_id = str(uuid.uuid4())

            item = {
                'recipe_id': recipe_id,
                'trial_id': trial_id,
                'recipe_name': recipe_name,
                'sugar': Decimal(str(sugar)),
                'stevia_extract': Decimal(str(stevia_extract)),
                'allulose': Decimal(str(allulose)),
                'citric_acid': Decimal(str(citric_acid)),
                'target_sugar_reduction_percent': Decimal(str(target_sugar_reduction_percent)),
                'target_cost_per_unit': Decimal(str(target_cost_per_unit)),
                'prediction': prediction
            }

            self.table.put_item(Item=item)
            return item
        except Exception as e:
            raise Exception(f"Error creating recipe: {str(e)}")

    @staticmethod
    def decimal_to_float(obj):
        """
        Convert Decimal objects to float for JSON serialization
        """
        if isinstance(obj, Decimal):
            return float(obj)
        raise TypeError

