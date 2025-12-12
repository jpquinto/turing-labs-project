import pytest
import os
from decimal import Decimal
from unittest.mock import patch, MagicMock
from moto import mock_aws
import boto3
from trial_service import TrialService


@pytest.fixture
def mock_env():
    """Mock environment variables"""
    with patch.dict(os.environ, {'TRIALS_TABLE_NAME': 'test-trials-table'}):
        yield


@pytest.fixture
def dynamodb_table():
    """Create a mock DynamoDB table"""
    with mock_aws():
        dynamodb = boto3.resource('dynamodb', region_name='us-west-2')
        
        # Create table
        table = dynamodb.create_table(
            TableName='test-trials-table',
            KeySchema=[
                {'AttributeName': 'trial_id', 'KeyType': 'HASH'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'trial_id', 'AttributeType': 'S'}
            ],
            BillingMode='PAY_PER_REQUEST'
        )
        
        yield table


@pytest.fixture
def trial_service(mock_env, dynamodb_table):
    """Create TrialService instance with mocked dependencies"""
    return TrialService()


class TestTrialService:
    
    def test_init_without_table_name(self):
        """Test that TrialService raises error when TRIALS_TABLE_NAME is not set"""
        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(ValueError, match="TRIALS_TABLE_NAME environment variable is not set"):
                TrialService()
    
    def test_create_trial(self, trial_service):
        """Test creating a new trial"""
        trial = trial_service.create_trial(
            trial_name="Test Trial",
            status="active",
            trial_date="2024-12-11"
        )
        
        assert trial['trial_name'] == "Test Trial"
        assert trial['status'] == "active"
        assert trial['trial_date'] == "2024-12-11"
        assert 'trial_id' in trial
        assert isinstance(trial['trial_id'], str)
    
    def test_get_trial_by_id(self, trial_service):
        """Test retrieving a trial by ID"""
        # First create a trial
        created_trial = trial_service.create_trial(
            trial_name="Test Trial",
            status="active",
            trial_date="2024-12-11"
        )
        
        # Then retrieve it
        retrieved_trial = trial_service.get_trial_by_id(created_trial['trial_id'])
        
        assert retrieved_trial is not None
        assert retrieved_trial['trial_id'] == created_trial['trial_id']
        assert retrieved_trial['trial_name'] == "Test Trial"
        assert retrieved_trial['status'] == "active"
    
    def test_get_trial_by_id_not_found(self, trial_service):
        """Test retrieving a non-existent trial"""
        result = trial_service.get_trial_by_id("non-existent-id")
        assert result is None
    
    def test_get_all_trials_empty(self, trial_service):
        """Test getting all trials when table is empty"""
        result = trial_service.get_all_trials()
        
        assert result['count'] == 0
        assert result['trials'] == []
    
    def test_get_all_trials_with_data(self, trial_service):
        """Test getting all trials with multiple items"""
        # Create multiple trials
        trial_service.create_trial("Trial 1", "active", "2024-12-11")
        trial_service.create_trial("Trial 2", "pending", "2024-12-12")
        trial_service.create_trial("Trial 3", "completed", "2024-12-13")
        
        result = trial_service.get_all_trials()
        
        assert result['count'] == 3
        assert len(result['trials']) == 3
        
        trial_names = [trial['trial_name'] for trial in result['trials']]
        assert "Trial 1" in trial_names
        assert "Trial 2" in trial_names
        assert "Trial 3" in trial_names
    
    def test_decimal_to_int(self):
        """Test decimal_to_int static method"""
        assert TrialService.decimal_to_int(Decimal('42')) == 42
        assert TrialService.decimal_to_int(Decimal('100.0')) == 100
        
        with pytest.raises(TypeError):
            TrialService.decimal_to_int("not a decimal")