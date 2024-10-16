import json
import boto3  # type: ignore
import os

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['DYNAMODB_TABLE_NAME']
table = dynamodb.Table(table_name)

def handler(event, context):
    # Check if the HTTP method is DELETE
    if event['httpMethod'] == 'DELETE':
        try:
            # Parse the body of the incoming request to get the item ID
            body = json.loads(event['body'])
            item_id = body.get('id')

            if not item_id:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'message': 'ID is required'})
                }

            # Delete the item from the DynamoDB table
            response = table.delete_item(
                Key={
                    'id': item_id
                },
            ReturnValues='ALL_OLD'  
            )

            # Check if the item was actually deleted
            if 'Attributes' in response:
                return {
                    'statusCode': 200,
                    'body': json.dumps({'message': 'Data deleted successfully!', 'id': item_id})
                }
            else:
                return {
                    'statusCode': 404,
                    'body': json.dumps({'message': 'Item not found', 'id': item_id})
                }
        except Exception as e:
            return {
                'statusCode': 500,
                'body': json.dumps({'message': 'Error deleting data', 'error': str(e)})
            }
    else:
        return {
            'statusCode': 401,
            'body': 'Invalid Request'
        }
