import json
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.dynamodb import get_dynamodb_table
from utils.decorators import require_auth
from utils.response import success_response, error_response

users_table = get_dynamodb_table('users')

@require_auth
def submit_quiz(event, context):
    """Save user quiz results"""
    try:
        user_id = event['authenticated_user_id']

        body = json.loads(event['body'])
        quiz_results = body.get('quiz_results')

        if not quiz_results:
            return error_response(400, "Quiz results required")

        # Validate quiz results is a dict
        if not isinstance(quiz_results, dict):
            return error_response(400, "Quiz results must be an object")

        # Update user with quiz results (using user_id as key)
        users_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression='SET #quiz_results = :qr',
            ExpressionAttributeNames={'#quiz_results': 'quiz_results'},
            ExpressionAttributeValues={':qr': quiz_results}
        )

        return success_response({
            'message': 'Quiz results saved',
            'quiz_results': quiz_results
        })

    except Exception as e:
        return error_response(500, str(e))

@require_auth
def get_quiz(event, context):
    """Get user quiz results"""
    try:
        user_id = event['authenticated_user_id']

        # Get user
        response = users_table.get_item(Key={'user_id': user_id})
        if 'Item' not in response:
            return error_response(404, "User not found")

        user = response['Item']

        return success_response({
            'quiz_results': user.get('quiz_results', {})
        })

    except Exception as e:
        return error_response(500, str(e))
