import json
import uuid
from datetime import datetime, timezone
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.dynamodb import get_dynamodb_table
from utils.decorators import require_auth
from utils.response import success_response, error_response
from utils.error_handler import handle_errors, NotFoundError
from boto3.dynamodb.conditions import Key

friendships_table = get_dynamodb_table('friendships')
trip_shares_table = get_dynamodb_table('trip_shares')
users_table = get_dynamodb_table('users')
trips_table = get_dynamodb_table('trips')


def _get_user_by_id(user_id):
    """Look up a user record by user_id."""
    response = users_table.get_item(Key={'user_id': user_id})
    return response.get('Item')


def _get_user_by_email(email):
    """Look up a user record by email using the email-index GSI."""
    response = users_table.query(
        IndexName='email-index',
        KeyConditionExpression=Key('email').eq(email)
    )
    items = response.get('Items', [])
    return items[0] if items else None


@require_auth
@handle_errors
def get_friends(event, context):
    """GET /friends — returns list of accepted friends for the authenticated user."""
    user_id = event['authenticated_user_id']

    # Query friendships where the user is the requester
    requester_resp = friendships_table.query(
        IndexName='requester-index',
        KeyConditionExpression=Key('requester_id').eq(user_id)
    )

    # Query friendships where the user is the recipient
    recipient_resp = friendships_table.query(
        IndexName='recipient-index',
        KeyConditionExpression=Key('recipient_id').eq(user_id)
    )

    friends = []

    for item in requester_resp.get('Items', []):
        if item.get('status') == 'accepted':
            friend_user = _get_user_by_id(item['recipient_id'])
            friends.append({
                'friendship_id': item['friendship_id'],
                'friend_id': item['recipient_id'],
                'name': friend_user.get('name', 'Unknown') if friend_user else 'Unknown',
                'email': friend_user.get('email', '') if friend_user else '',
                'created_at': item.get('created_at', ''),
            })

    for item in recipient_resp.get('Items', []):
        if item.get('status') == 'accepted':
            friend_user = _get_user_by_id(item['requester_id'])
            friends.append({
                'friendship_id': item['friendship_id'],
                'friend_id': item['requester_id'],
                'name': friend_user.get('name', 'Unknown') if friend_user else 'Unknown',
                'email': friend_user.get('email', '') if friend_user else '',
                'created_at': item.get('created_at', ''),
            })

    return success_response(friends)


@require_auth
@handle_errors
def send_friend_request(event, context):
    """POST /friends/request — sends a friend request by email."""
    user_id = event['authenticated_user_id']
    body = json.loads(event.get('body') or '{}')

    email = body.get('email', '').strip()
    if not email:
        return error_response(400, 'Email is required')

    # Look up the target user by email
    target_user = _get_user_by_email(email)
    if not target_user:
        return error_response(404, 'No user found with that email address')

    recipient_id = target_user['user_id']

    if recipient_id == user_id:
        return error_response(400, 'You cannot send a friend request to yourself')

    # Check if a friendship already exists in either direction
    for index_name, key_field, value, other_field, other_value in [
        ('requester-index', 'requester_id', user_id, 'recipient_id', recipient_id),
        ('recipient-index', 'recipient_id', user_id, 'requester_id', recipient_id),
    ]:
        existing = friendships_table.query(
            IndexName=index_name,
            KeyConditionExpression=Key(key_field).eq(value)
        )
        for item in existing.get('Items', []):
            other = item.get(other_field, '')
            if other == other_value and item.get('status') in ('pending', 'accepted'):
                return error_response(400, 'A friend request or friendship already exists with this user')

    friendship_id = str(uuid.uuid4())
    friendship = {
        'friendship_id': friendship_id,
        'requester_id': user_id,
        'recipient_id': recipient_id,
        'status': 'pending',
        'created_at': datetime.now(timezone.utc).isoformat(),
    }

    friendships_table.put_item(Item=friendship)

    return success_response({
        'friendship_id': friendship_id,
        'message': 'Friend request sent successfully',
    })


@require_auth
@handle_errors
def respond_to_request(event, context):
    """PUT /friends/request/{request_id} — accept or decline a friend request."""
    user_id = event['authenticated_user_id']
    request_id = event['pathParameters']['request_id']

    body = json.loads(event.get('body') or '{}')
    action = body.get('action', '').lower()

    if action not in ('accept', 'decline'):
        return error_response(400, "Action must be 'accept' or 'decline'")

    # Fetch the friendship record
    response = friendships_table.get_item(Key={'friendship_id': request_id})
    if 'Item' not in response:
        raise NotFoundError('Friend request not found')

    friendship = response['Item']

    # Only the recipient can respond
    if friendship['recipient_id'] != user_id:
        return error_response(403, 'You are not the recipient of this friend request')

    if friendship['status'] != 'pending':
        return error_response(400, f"This request has already been {friendship['status']}")

    new_status = 'accepted' if action == 'accept' else 'declined'

    friendships_table.update_item(
        Key={'friendship_id': request_id},
        UpdateExpression='SET #status = :s',
        ExpressionAttributeNames={'#status': 'status'},
        ExpressionAttributeValues={':s': new_status},
    )

    return success_response({'message': f'Friend request {new_status}'})


@require_auth
@handle_errors
def get_pending_requests(event, context):
    """GET /friends/requests/pending — returns incoming pending requests."""
    user_id = event['authenticated_user_id']

    response = friendships_table.query(
        IndexName='recipient-index',
        KeyConditionExpression=Key('recipient_id').eq(user_id)
    )

    pending = []
    for item in response.get('Items', []):
        if item.get('status') == 'pending':
            requester = _get_user_by_id(item['requester_id'])
            pending.append({
                'friendship_id': item['friendship_id'],
                'requester_id': item['requester_id'],
                'name': requester.get('name', 'Unknown') if requester else 'Unknown',
                'email': requester.get('email', '') if requester else '',
                'created_at': item.get('created_at', ''),
            })

    return success_response(pending)


@require_auth
@handle_errors
def remove_friend(event, context):
    """DELETE /friends/{friend_id} — removes a friendship."""
    user_id = event['authenticated_user_id']
    friend_id = event['pathParameters']['friend_id']

    # Find the friendship record between these two users
    friendship_item = None

    requester_resp = friendships_table.query(
        IndexName='requester-index',
        KeyConditionExpression=Key('requester_id').eq(user_id)
    )
    for item in requester_resp.get('Items', []):
        if item.get('recipient_id') == friend_id and item.get('status') == 'accepted':
            friendship_item = item
            break

    if not friendship_item:
        recipient_resp = friendships_table.query(
            IndexName='recipient-index',
            KeyConditionExpression=Key('recipient_id').eq(user_id)
        )
        for item in recipient_resp.get('Items', []):
            if item.get('requester_id') == friend_id and item.get('status') == 'accepted':
                friendship_item = item
                break

    if not friendship_item:
        raise NotFoundError('Friendship not found')

    friendships_table.delete_item(Key={'friendship_id': friendship_item['friendship_id']})

    return success_response({'message': 'Friend removed successfully'})


@require_auth
@handle_errors
def share_trip(event, context):
    """POST /trips/{trip_id}/share — shares a trip with a friend."""
    user_id = event['authenticated_user_id']
    trip_id = event['pathParameters']['trip_id']

    body = json.loads(event.get('body') or '{}')
    friend_id = body.get('friend_id', '').strip()

    if not friend_id:
        return error_response(400, 'friend_id is required')

    # Verify the trip exists and belongs to the user
    trip_response = trips_table.get_item(Key={'trip_id': trip_id})
    if 'Item' not in trip_response:
        raise NotFoundError('Trip not found')

    trip = trip_response['Item']
    if trip['user_id'] != user_id:
        return error_response(403, 'You do not own this trip')

    # Verify the friend relationship exists
    is_friend = False
    requester_resp = friendships_table.query(
        IndexName='requester-index',
        KeyConditionExpression=Key('requester_id').eq(user_id)
    )
    for item in requester_resp.get('Items', []):
        if item.get('recipient_id') == friend_id and item.get('status') == 'accepted':
            is_friend = True
            break

    if not is_friend:
        recipient_resp = friendships_table.query(
            IndexName='recipient-index',
            KeyConditionExpression=Key('recipient_id').eq(user_id)
        )
        for item in recipient_resp.get('Items', []):
            if item.get('requester_id') == friend_id and item.get('status') == 'accepted':
                is_friend = True
                break

    if not is_friend:
        return error_response(403, 'You can only share trips with friends')

    share_id = str(uuid.uuid4())
    share_record = {
        'share_id': share_id,
        'trip_id': trip_id,
        'shared_by': user_id,
        'shared_with': friend_id,
        'created_at': datetime.now(timezone.utc).isoformat(),
    }

    trip_shares_table.put_item(Item=share_record)

    return success_response({
        'share_id': share_id,
        'message': 'Trip shared successfully',
    })


@require_auth
@handle_errors
def get_shared_trips(event, context):
    """GET /friends/{friend_id}/trips — get trips shared with a specific friend."""
    user_id = event['authenticated_user_id']
    friend_id = event['pathParameters']['friend_id']

    # Query trip_shares for records where shared_by=user_id and shared_with=friend_id
    response = trip_shares_table.scan(
        FilterExpression=(
            Key('shared_by').eq(user_id)
        )
    )

    shared_trip_ids = [
        item['trip_id']
        for item in response.get('Items', [])
        if item.get('shared_with') == friend_id
    ]

    # Fetch the full trip objects
    shared_trips = []
    for tid in shared_trip_ids:
        trip_resp = trips_table.get_item(Key={'trip_id': tid})
        if 'Item' in trip_resp:
            shared_trips.append(trip_resp['Item'])

    return success_response(shared_trips)
